import { canonicalArticleHref } from "../article-consolidation.mjs";
import { DAY_CARE_GUIDE_ROUTE } from "../public-topic-guides.mjs";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { parse } from "acorn";
import { parseHTML } from "linkedom";
import { renderContactNeedOptions } from "../contact-page.mjs";
import { updatePublicStructuredData } from "../public-route-structured-data.mjs";
import { renderMilestonesPage } from "../milestones-page.js";
import { hydrateServiceTopicReading } from "../public-topic-guides.mjs";
import { getServiceLocationByRoute, hydrateServiceLocationLinks } from "../public-service-locations.mjs";
import { EDITORIAL_POLICY_ROUTE } from "../public-editorial.mjs";
import { preparePrerenderedService } from "../public-service-prerender.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
export const SERVICE_PRERENDER_SLUGS = ["home-care", "day-care", "community", "nursing", "migrant-training", "quality", "software"];
const rendererNames = Object.freeze({
  about: "renderAboutPageThreeMinute",
  "home-care": "renderHomeCarePage", "day-care": "renderDayCarePage", community: "renderCommunityPage",
  nursing: "renderNursingPage", "migrant-training": "renderMigrantTrainingPage", quality: "renderQualityPage", software: "renderSoftwarePage",
  land: "renderLandRecruitingPage", "investor-recruiting": "renderInvestorRecruitingPage", talent: "renderTalentPage",
  courses: "renderCoursesPage", investors: "renderInvestorsPage", "ir-finance": "renderFinancePage",
  "ir-governance": "renderGovernancePage", "ir-shareholders": "renderShareholdersPage"
});
export const PUBLIC_PRERENDER_SLUGS = [...Object.keys(rendererNames), "milestones"];

function walk(node, visitor, parent = null, key = "") {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") visitor(node, parent, key);
  for (const [childKey, value] of Object.entries(node)) {
    if (Array.isArray(value)) value.forEach((child) => walk(child, visitor, node, childKey));
    else if (value && typeof value === "object") walk(value, visitor, node, childKey);
  }
}

// Read the actual browser renderer declarations, never execute app startup or CMS/network code.
// AST boundaries keep comments, nested templates and neighboring declarations out of the extraction.
function rendererSource(source, entrypoints) {
  const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  const declarations = new Map();
  for (const statement of ast.body) {
    if (statement.type === "FunctionDeclaration" && statement.id) {
      declarations.set(statement.id.name, { node: statement, code: source.slice(statement.start, statement.end) });
    } else if (statement.type === "VariableDeclaration") {
      for (const node of statement.declarations) {
        if (node.id.type === "Identifier") declarations.set(node.id.name, { node, code: `${statement.kind} ${source.slice(node.start, node.end)};` });
      }
    }
  }
  const selected = new Set();
  function select(name) {
    if (selected.has(name)) return;
    const declaration = declarations.get(name);
    if (!declaration) throw new Error(`Public prerender entrypoint is missing: ${name}`);
    selected.add(name);
    walk(declaration.node, (node, parent, key) => {
      if (node.type === "ImportExpression") throw new Error(`Public renderer cannot start asynchronous imports: ${name}`);
      if (node.type === "Identifier" && ["supabase", "fetch", "XMLHttpRequest", "localStorage", "sessionStorage"].includes(node.name)) {
        throw new Error(`Public renderer cannot access runtime/private state: ${name} -> ${node.name}`);
      }
      if (node.type !== "Identifier" || !declarations.has(node.name)) return;
      if ((parent?.type === "MemberExpression" || parent?.type === "Property") && key === "property" && !parent.computed) return;
      if (parent?.type === "Property" && key === "key" && !parent.computed && !parent.shorthand) return;
      if (key === "id" || key === "params") return;
      select(node.name);
    });
  }
  entrypoints.forEach(select);
  const entries = [...selected].map((name) => declarations.get(name)).sort((a, b) => a.node.start - b.node.start);
  return `${entries.map(({ code }) => code).join("\n")}\nglobalThis.publicRenderers = { ${entrypoints.join(", ")} };\n`
    + `globalThis.setPublicCourseState = (courses, media) => { supabaseCourses = courses; courseCoverById = new Map(media.map((row) => [row.id, row])); coursesLoadedFromSupabase = true; };`;
}

const moduleUrls = new Map();
const publicPresentationModules = new Set([
  "day-care-location.js", "home-care-location.js", "community-page.js", "service-fees.js",
  "day-care-checklist-icons.js", "service-location-data.mjs"
].map((file) => path.join(rootDir, file)));
function publicModuleUrl(filePath) {
  if (!publicPresentationModules.has(filePath)) throw new Error(`Unapproved public prerender module: ${path.relative(rootDir, filePath)}`);
  if (moduleUrls.has(filePath)) return moduleUrls.get(filePath);
  const source = fs.readFileSync(filePath, "utf8");
  const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  walk(ast, (node) => {
    if (node.type === "ImportExpression" || (node.type === "Identifier" && ["supabase", "fetch", "XMLHttpRequest"].includes(node.name))) {
      throw new Error(`Public presentation modules must be synchronous and offline: ${path.basename(filePath)}`);
    }
  });
  const edits = [];
  const require = createRequire(filePath);
  for (const node of ast.body) {
    if ((node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") && node.source) {
      throw new Error(`Public presentation modules cannot re-export dependencies: ${path.basename(filePath)}`);
    }
    if (node.type !== "ImportDeclaration") continue;
    const specifier = node.source.value;
    if (specifier.endsWith(".css")) {
      if (node.specifiers.length) throw new Error(`CSS cannot provide prerender data: ${specifier}`);
      edits.push([node.start, node.end, ""]);
    } else {
      if (!specifier.startsWith(".") && !specifier.startsWith("lucide/")) throw new Error(`Unapproved presentation dependency: ${specifier}`);
      const resolved = require.resolve(specifier);
      const url = specifier.startsWith(".") ? publicModuleUrl(resolved) : pathToFileURL(resolved).href;
      edits.push([node.source.start, node.source.end, JSON.stringify(url)]);
    }
  }
  let transformed = source;
  for (const [start, end, text] of edits.sort((a, b) => b[0] - a[0])) transformed = transformed.slice(0, start) + text + transformed.slice(end);
  const url = `data:text/javascript;base64,${Buffer.from(transformed).toString("base64")}`;
  moduleUrls.set(filePath, url);
  return url;
}

async function loadHydrationModules() {
  // These public presentation modules use DOM APIs but never fetch private records.
  const names = ["day-care-location.js", "home-care-location.js", "community-page.js", "service-fees.js"];
  return Promise.all(names.map((name) => import(publicModuleUrl(path.join(rootDir, name)))));
}

function snapshotServiceFields(snapshot, slug) {
  const media = new Map((snapshot.media || []).map((item) => [item.id, item]));
  return (snapshot.serviceFields || [])
    .filter((field) => field.page_slug === slug && field.is_enabled !== false)
    .map((field) => ({ ...field, image: media.get(field.image_id) || null }));
}

function publishedRows(snapshot, key) {
  return (snapshot[key] || []).filter((row) => row.is_enabled !== false && row.status === "published"
    && (!row.published_at || new Date(row.published_at).getTime() <= Date.now()));
}

function snapshotRecruitingPage(snapshot, slug) {
  const media = new Map((snapshot.media || []).map((item) => [item.id, item]));
  const attach = (item) => ({ ...item, image: media.get(item.image_id) || null, hero_image: media.get(item.hero_image_id) || null });
  const page = publishedRows(snapshot, "recruitingPages").find((row) => row.page_slug === slug);
  if (!page) return null;
  return {
    page: attach(page),
    departments: publishedRows(snapshot, "recruitingDepartments").filter((row) => row.page_slug === slug).map(attach),
    openings: publishedRows(snapshot, "recruitingOpenings").filter((row) => row.page_slug === slug && (slug !== "land" || row.opening_slug === "daycare-site")).map(attach)
  };
}

function prerenderWindow(slug) {
  return {
    innerWidth: 1280,
    location: { origin: "https://www.suiyuecare.com", hostname: "www.suiyuecare.com", pathname: `/${slug}`, search: "", hash: "", href: `https://www.suiyuecare.com/${slug}` },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    requestAnimationFrame: () => 0, cancelAnimationFrame() {}, addEventListener() {}, removeEventListener() {}
  };
}

function createPrerenderDocument() {
  const dom = parseHTML('<!doctype html><html><head></head><body><main id="prerender-root"></main></body></html>');
  const createElement = dom.document.createElement.bind(dom.document);
  dom.document.createElement = (name, ...options) => {
    const element = createElement(name, ...options);
    if (String(name).toLowerCase() !== "template") return element;
    // LinkeDOM clones template.content and does not serialize mutations back to innerHTML.
    // Browser templates own one live fragment. Match that contract for the unchanged CMS renderer.
    const content = element.content;
    Object.defineProperty(element, "innerHTML", {
      get: () => [...content.childNodes].map((node) => node.toString()).join(""),
      set: (value) => {
        const parser = createElement("div");
        parser.innerHTML = value;
        content.replaceChildren(...parser.childNodes);
      }
    });
    return element;
  };
  return dom;
}

function responsiveHeroStyles(root, slug, renderers, window) {
  const originalMatchMedia = window.matchMedia;
  const rules = [];
  try {
    // Use the browser's exact asset mapping after CMS fields have chosen the actual hero.
    window.matchMedia = () => ({ matches: true });
    for (const [index, hero] of [...root.querySelectorAll(".hero-bg[style]")].entries()) {
      const desktopBackground = hero.style.backgroundImage || "";
      let hasMobileVariant = false;
      const mobileBackground = desktopBackground.replace(/url\(\s*(["']?)(.*?)\1\s*\)/g, (original, _quote, source) => {
        const mobileSource = renderers.heroImageForViewport(source);
        if (mobileSource !== source) hasMobileVariant = true;
        return `url(${JSON.stringify(mobileSource.replace(/^(?:\.\/)?assets\//, "/assets/"))})`;
      });
      if (!hasMobileVariant) continue;
      const marker = `${slug}-${index}`;
      hero.setAttribute("data-public-mobile-hero", marker);
      // A CMS refresh creates new unmarked nodes, so its new image cannot inherit this rule.
      rules.push(`#pageView [data-public-mobile-hero="${marker}"] { background-image: ${mobileBackground} !important; }`);
    }
  } finally {
    window.matchMedia = originalMatchMedia;
  }
  return rules.length ? `@media (max-width: 640px) { ${rules.join("\n")} }` : "";
}

// Build execution is sequential: native icon modules access document while creating SVG nodes.
// Restore every temporary DOM global even when rendering fails, and let failures stop the build.
export async function prerenderPublicPages(snapshot, { verifyHydration = false, articles = [] } = {}) {
  const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
  const entrypoints = [...Object.values(rendererNames), "applyCmsEnhancedServicePage", "hydrateServiceLocalLinks", "renderRecruitingTalentPage", "renderFixedRecruitingOpportunityPage", "escapeHTML", "heroImageForViewport", "contentImageUrl"];
  const code = rendererSource(source, entrypoints);
  const [dayCare, homeCare, community, fees] = await loadHydrationModules();
  const results = new Map();
  for (const slug of PUBLIC_PRERENDER_SLUGS) {
    const rendererName = rendererNames[slug];
    const { document, HTMLElement } = createPrerenderDocument();
    const window = prerenderWindow(slug);
    const previous = new Map(["document", "window", "HTMLElement"].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
    try {
      Object.assign(globalThis, { document, window, HTMLElement });
      const sandbox = { document, window, location: window.location, URL, console, renderContactNeedOptions, updatePublicStructuredData, getServiceLocationByRoute: (route) => getServiceLocationByRoute(route, snapshot), EDITORIAL_POLICY_ROUTE, DAY_CARE_GUIDE_ROUTE, canonicalArticleHref };
      vm.createContext(sandbox);
      new vm.Script(code, { filename: "app.public-renderers.js" }).runInContext(sandbox, { timeout: 5_000 });
      const renderers = sandbox.publicRenderers;
      const fields = snapshotServiceFields(snapshot, slug);
      const root = document.querySelector("#prerender-root");
      sandbox.setPublicCourseState(publishedRows(snapshot, "courses"), snapshot.media || []);
      const recruiting = ["talent", "land", "investor-recruiting"].includes(slug) ? snapshotRecruitingPage(snapshot, slug) : null;
      let html;
      if (recruiting) {
        html = slug === "talent"
          ? renderers.renderRecruitingTalentPage(recruiting.page, recruiting.departments, recruiting.openings)
          : renderers.renderFixedRecruitingOpportunityPage(slug, recruiting.page, recruiting.departments, recruiting.openings);
      } else if (slug === "milestones") {
        const media = new Map((snapshot.media || []).map((row) => [row.id, row]));
        const milestones = publishedRows(snapshot, "milestones").map((row) => ({
          id: row.id, year: String(row.year), month: String(row.month).padStart(2, "0"), title: row.title || "未命名大事記",
          tag: row.tag || "里程碑", copy: row.summary || "", image: row.image_url || media.get(row.image_id)?.public_url || "",
          status: row.status_label || "已完成", sortOrder: Number(row.sort_order || 0)
        }));
        html = renderMilestonesPage(milestones, { ...renderers, fallbackImage: "assets/hero-care-hero-fast.jpg" });
      } else html = renderers[rendererName]();
      root.innerHTML = fields.length ? renderers.applyCmsEnhancedServicePage(html, slug, fields) : html;
      renderers.hydrateServiceLocalLinks(root);
      for (const target of root.querySelectorAll("[data-fee-groups]")) {
        target.innerHTML = `${fees.renderFeeAllowanceCard(slug)}${fees.renderFeeCodeGroups(fees.serviceFeeGroups(slug), true, false)}`;
      }
      if (slug === "day-care") dayCare.hydrateDayCareLocation(root);
      if (slug === "home-care") homeCare.hydrateHomeCareLocation(root);
      if (slug === "community") community.hydrateCommunityPage(root);
      hydrateServiceLocationLinks(root, snapshot);
      hydrateServiceTopicReading(root, slug, articles);
      for (const node of root.querySelectorAll(".service-motion, .reveal")) node.classList.add("in-view");
      if (SERVICE_PRERENDER_SLUGS.includes(slug)) root.firstElementChild.setAttribute("data-public-service-prerendered", "true");
      if (verifyHydration && SERVICE_PRERENDER_SLUGS.includes(slug)) {
        const textBefore = root.textContent.replace(/\s+/g, " ").trim();
        const controlsBefore = root.querySelectorAll(".day-care-assistance-controls").length;
        preparePrerenderedService(root);
        if (slug === "day-care") dayCare.hydrateDayCareLocation(root);
        if (slug === "home-care") homeCare.hydrateHomeCareLocation(root);
        if (slug === "community") community.hydrateCommunityPage(root);
        if (root.textContent.replace(/\s+/g, " ").trim() !== textBefore || root.querySelectorAll(".day-care-assistance-controls").length !== controlsBefore) {
          throw new Error(`Client hydration changed public content or duplicated controls: ${slug}`);
        }
        for (const node of root.querySelectorAll(".service-motion, .reveal")) node.classList.add("in-view");
        root.firstElementChild.setAttribute("data-public-service-prerendered", "true");
      }
      const headings = root.querySelectorAll("h1");
      if (headings.length !== 1 || root.textContent.trim().length < 300) throw new Error(`Incomplete public prerender: ${slug}`);
      const inlineStyles = responsiveHeroStyles(root, slug, renderers, window);
      results.set(slug, { html: root.innerHTML, inlineStyles, title: document.title, description: document.querySelector('meta[name="description"]')?.content || "" });
    } finally {
      for (const [name, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    }
  }
  return results;
}
