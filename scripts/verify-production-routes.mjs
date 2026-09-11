const siteOrigin = process.env.PRODUCTION_ORIGIN || "https://www.suiyuecare.com";
const warnOnly = process.argv.includes("--warn-only");

const routes = [
  "about",
  "milestones",
  "home-care",
  "day-care",
  "community",
  "nursing",
  "migrant-training",
  "quality",
  "software",
  "courses",
  "talent",
  "land",
  "investor-recruiting",
  "health",
  "search",
  "investors",
  "ir-finance",
  "ir-governance",
  "ir-shareholders",
  "contact"
];

const staleHomeMarkers = [
  'class="home-page page active"',
  "先選你現在最需要的下一步。",
  "AI Empowered Suiyuecare System"
];
const staleContentHashLinkPattern = /\bhref=["']#(?:article|care-story|master-talk)-/i;

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

function absoluteRoute(slug) {
  return `${siteOrigin.replace(/\/$/, "")}/${slug}`;
}

function check(condition, failures, message) {
  if (!condition) failures.push(message);
}

function hasNoCacheHeader(response) {
  const cacheControl = response.headers.get("cache-control") || "";
  return cacheControl.includes("no-cache") && cacheControl.includes("no-store");
}

async function fetchRoute(slug) {
  const response = await fetch(absoluteRoute(slug), {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache"
    },
    signal: AbortSignal.timeout(12000)
  });
  const html = await response.text();
  return { response, html };
}

export function verifyRouteDocument(slug, { response, html }, { expectedHtml, pathname = `/${slug}`, requireNoCache = true, requirePrerender = PUBLIC_PRERENDER_SLUGS.includes(slug), expectedSchemaType } = {}) {
  const failures = [];
  const url = `${siteOrigin.replace(/\/$/, "")}${pathname}`;
  const document = parseHTML(html).document;

  check(response.status === 200, failures, `${slug}: expected 200 from ${url}, received ${response.status}`);
  if (requireNoCache) check(hasNoCacheHeader(response), failures, `${slug}: production HTML should send Cache-Control with no-cache and no-store`);
  check(new RegExp(`<html[^>]*data-initial-route="${slug}"`).test(html), failures, `${slug}: missing route-specific data-initial-route`);
  check(html.includes('id="home" data-static-shell="minimal"'), failures, `${slug}: production HTML should ship the minimal non-home shell`);
  check(!html.includes("initial-page-loader"), failures, `${slug}: production HTML should not include first-paint loading chrome`);
  check(html.includes('id="pageView"'), failures, `${slug}: production HTML should include #pageView`);
  check(!staleContentHashLinkPattern.test(html), failures, `${slug}: production HTML should not include stale content hash links`);

  for (const marker of staleHomeMarkers) {
    check(!html.includes(marker), failures, `${slug}: still contains stale home marker "${marker}"`);
  }

  if (requirePrerender) {
    const pageView = document.querySelector("#pageView");
    check(pageView?.dataset.prerenderedRoute === slug, failures, `${slug}: prerender marker must match the requested route`);
    check(pageView?.classList.contains("active"), failures, `${slug}: published first-paint content must be visible before JavaScript`);
    check(pageView?.querySelectorAll("h1").length === 1, failures, `${slug}: published body must contain exactly one H1`);
    check((pageView?.querySelectorAll("h2, h3").length || 0) >= 2, failures, `${slug}: published body must include complete page sections`);
    check(normalizeText(pageView?.textContent).length >= 300, failures, `${slug}: published body must contain substantive text`);
    check(!pageView?.querySelector(".service-motion:not(.in-view)"), failures, `${slug}: prerendered service content must be visible without JavaScript`);
    check(Boolean(expectedHtml), failures, `${slug}: expected published snapshot body is unavailable`);
    if (expectedHtml) {
      const expected = parseHTML(`<!doctype html><html><body><main>${expectedHtml}</main></body></html>`).document.querySelector("main");
      check(normalizeText(pageView?.querySelector("h1")?.textContent) === normalizeText(expected.querySelector("h1")?.textContent), failures, `${slug}: first-paint H1 must match the deployed published snapshot`);
      check(normalizeText(pageView?.textContent) === normalizeText(expected.textContent), failures, `${slug}: complete first-paint body must match the deployed published snapshot`);
    }
    check(document.querySelector('link[rel="canonical"]')?.getAttribute("href") === url, failures, `${slug}: production canonical should point to the route itself`);
    check(!html.includes("route-page-loader"), failures, `${slug}: published content should not be replaced by loading chrome`);
  }
  if (expectedSchemaType) check(new RegExp(`"@type"\\s*:\\s*"${expectedSchemaType}"`).test(html), failures, `${slug}: production HTML should contain ${expectedSchemaType} schema`);

  return failures;
}

async function verifyRoute(slug, options = {}) {
  const result = await fetchRoute((options.pathname || `/${slug}`).replace(/^\//, ""));
  return verifyRouteDocument(slug, result, options);
}

async function verifyPublicContentRoute(pathname) {
  const failures = [];
  const url = `${siteOrigin.replace(/\/$/, "")}${pathname}`;
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache"
    },
    signal: AbortSignal.timeout(12000)
  });
  const html = await response.text();
  check(response.status === 200, failures, `${pathname}: expected 200 from ${url}, received ${response.status}`);
  check(html.includes('id="pageView"'), failures, `${pathname}: production HTML should include #pageView`);
  check(html.includes("data-prerendered-route="), failures, `${pathname}: production HTML should include pre-rendered content`);
  check(
    html.includes(`<link rel="canonical" href="${url}" />`),
    failures,
    `${pathname}: production canonical should point to the content URL itself`
  );
  check((html.match(/<h1\b/g) || []).length === 1, failures, `${pathname}: production HTML should contain one H1`);
  check(
    /"@type"\s*:\s*"(?:Article|BlogPosting)"/.test(html),
    failures,
    `${pathname}: production HTML should contain Article or BlogPosting schema`
  );
  check(!html.includes("<title>歲悅長照集團｜Suiyuecare Corps.</title>"), failures, `${pathname}: should not use the homepage title`);
  check(!staleContentHashLinkPattern.test(html), failures, `${pathname}: production HTML should not include stale content hash links`);
  return failures;
}

async function publicContentManifest() {
  const url = `${siteOrigin.replace(/\/$/, "")}/seo-manifest.json`;
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache"
    },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    throw new Error(`expected 200 from ${url}, received ${response.status}`);
  }
  return response.json();
}

async function deployedPublishedSnapshot(manifest) {
  const url = `${siteOrigin.replace(/\/$/, "")}/cms-fallbacks.json`;
  const response = await fetch(url, {
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
    signal: AbortSignal.timeout(12000)
  });
  assert.equal(response.status, 200, `expected 200 from ${url}`);
  const snapshot = await response.json();
  const { generatedAt, contentHash, ...payload } = snapshot;
  assert.equal(contentHash, crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex"), "deployed CMS snapshot must have a valid content hash");
  assert.equal(contentHash, manifest?.cmsSnapshot?.contentHash, "deployed CMS snapshot must match the SEO manifest used by this build");
  assert.equal(generatedAt, manifest?.cmsSnapshot?.generatedAt, "deployed CMS snapshot timestamp must match this build");
  return snapshot;
}

async function verifyMissingPublicContent(pathname) {
  const response = await fetch(`${siteOrigin.replace(/\/$/, "")}${pathname}`, {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache"
    },
    redirect: "manual",
    signal: AbortSignal.timeout(12000)
  });
  return response.status === 404
    ? []
    : [`${pathname}: unknown public content should return 404, received ${response.status}`];
}

export async function runProductionRouteVerification() {
const allFailures = [];
let manifest = null;
try {
  manifest = await publicContentManifest();
  check(
    Array.isArray(manifest.routes) && manifest.routes.length === manifest.counts?.publicUrls,
    allFailures,
    "seo-manifest.json should list every public URL"
  );
} catch (error) {
  allFailures.push(`seo-manifest.json: production manifest check failed - ${error.message}`);
}

let expectedPages = new Map();
let supplementalRoutes = [];
try {
  const snapshot = await deployedPublishedSnapshot(manifest);
  expectedPages = await prerenderPublicPages(snapshot);
  const locationRoutes = serviceLocationRoutes(snapshot);
  check(locationRoutes.length === 6, allFailures, "published snapshot should provide the six released service location pages");
  supplementalRoutes = [
    ...locationRoutes.map((route) => ({ ...route, expectedSchemaType: route.location.isPhysicalLocation ? "LocalBusiness" : "Service" })),
    { ...EDITORIAL_POLICY_ROUTE, slug: "editorial-policy", prerenderedHtml: renderEditorialPolicyPage(), expectedSchemaType: "WebPage" }
  ];
} catch (error) {
  allFailures.push(`cms-fallbacks.json: deployed published content check failed - ${error.message}`);
}

for (const route of routes) {
  try {
    allFailures.push(...await verifyRoute(route, { expectedHtml: expectedPages.get(route)?.html }));
  } catch (error) {
    allFailures.push(`${route}: production route check failed - ${error.message}`);
  }
}

for (const route of supplementalRoutes) {
  check(manifest?.routes?.some((entry) => entry.path === route.path), allFailures, `${route.path}: SEO manifest must include the released route`);
  try {
    allFailures.push(...await verifyRoute(route.slug, {
      pathname: route.path, expectedHtml: route.prerenderedHtml, expectedSchemaType: route.expectedSchemaType,
      requirePrerender: true, requireNoCache: false
    }));
  } catch (error) {
    allFailures.push(`${route.path}: production route check failed - ${error.message}`);
  }
}

const representativePaths = ["article", "care-story", "master-talk"]
  .map((type) => manifest?.routes?.find((route) => route.type === type)?.path)
  .filter(Boolean);
check(representativePaths.length === 3, allFailures, "seo-manifest.json should expose all three public content types");

for (const pathname of representativePaths) {
  try {
    const failures = await verifyPublicContentRoute(pathname);
    allFailures.push(...failures);
  } catch (error) {
    allFailures.push(`${pathname}: production public content route check failed - ${error.message}`);
  }
}

for (const pathname of [
  "/article/not-a-real-publication",
  "/care-story/not-a-real-publication",
  "/master-talk/not-a-real-publication"
]) {
  try {
    const failures = await verifyMissingPublicContent(pathname);
    allFailures.push(...failures);
  } catch (error) {
    allFailures.push(`${pathname}: production 404 check failed - ${error.message}`);
  }
}

if (allFailures.length) {
  console.error(`Production route verification found ${allFailures.length} issue(s) for ${siteOrigin}:`);
  allFailures.forEach((failure) => console.error(`- ${failure}`));
  if (!warnOnly) process.exit(1);
  console.log("warn-only mode: not failing the command.");
} else {
  console.log(`ok - production routes match their published snapshot, including 17 complete pages, six service locations and editorial policy at ${siteOrigin}`);
}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await runProductionRouteVerification();
import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";
import { prerenderPublicPages, PUBLIC_PRERENDER_SLUGS } from "./prerender-public-pages.mjs";
import { serviceLocationRoutes } from "../public-service-locations.mjs";
import { EDITORIAL_POLICY_ROUTE, renderEditorialPolicyPage } from "../public-editorial.mjs";
