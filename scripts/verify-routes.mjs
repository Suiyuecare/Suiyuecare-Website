import fs from "node:fs";
import path from "node:path";
import { renderPublicArticleLayout } from "../public-content-renderer.mjs";

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
const sitemapRoutes = ["", ...routes.filter((route) => route !== "search")];
const distDir = path.resolve("dist");
const appFile = path.resolve("app.js");
const styleFile = path.resolve("styles.css");
const siteOrigin = "https://www.suiyuecare.com";
const knownRouteHashes = [
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
const asyncRecruitingRoutes = new Set(["talent", "land", "investor-recruiting"]);
const staleRecruitingShellMarkers = [
  'class="hero talent-recruit-hero',
  'class="hero service-detail-hero one-minute-service-hero land-recruit-hero',
  'class="hero service-detail-hero one-minute-service-hero investor-recruit-hero',
  "recruiting-cms-hero",
  "career-page recruiting-cms-page",
  "land-recruit-page",
  "investor-recruit-page"
];
const criticalMobileHeroAssets = {
  home: "/assets/hero-care-hero-fast-mobile.jpg",
  about: "/assets/about/about-team-group-hero-v2-mobile.jpg",
  milestones: "/assets/milestones/milestones-team-care-planning-hero-v2.jpg",
  "home-care": "/assets/homecare-detail-01-greeting-hero-fast-mobile.jpg",
  "day-care": "/assets/daycare-detail-01-exercise-hero-fast-mobile.jpg",
  community: "/assets/community-dementia-hero-v3.jpg",
  nursing: "/assets/brand-scenes/rehab-v2-mobile.jpg",
  "migrant-training": "/assets/brand-scenes/migrant-v2-mobile.jpg",
  quality: "/assets/brand-scenes/quality-v2-mobile.jpg",
  software: "/assets/admin-recruit-02-operations-hero-hires-mobile.jpg",
  talent: "/assets/career-team-hero-hd-mobile.jpg",
  land: "/assets/land-recruit-hero-hd-mobile.jpg",
  "investor-recruiting": "/assets/investor-recruit-hero-hd-mobile.jpg"
};

const checks = [
  {
    name: "route marker",
    test: (html, route) => new RegExp(`<html[^>]*data-initial-route="${route}"`).test(html),
    detail: (route) => `dist/${route}/index.html must set data-initial-route="${route}"`
  },
  {
    name: "path priority initial route",
    test: (html) =>
      html.includes('const initialRoute = initialPath || initialHash || "home"') &&
      html.includes("document.documentElement.dataset.initialRoute = initialRoute") &&
      html.includes('routePath && routePath !== "/" ? routePath : routeHash || routePath'),
    detail: () => "initial route and hero preload must prefer non-home paths over section hashes"
  },
  {
    name: "no initial loading chrome",
    test: (html) => !html.includes("initial-page-loader") && !html.includes("正在讀取頁面"),
    detail: () => "route shell must not show a first-paint loading card"
  },
  {
    name: "hide stale home shell",
    test: (html) =>
      html.includes('html[data-initial-route]:not([data-initial-route="home"]):not([data-app-ready="true"]) #home') &&
      html.includes("display: none !important"),
    detail: () => "non-home routes must hide the static home shell before app hydration"
  },
  {
    name: "dynamic page target",
    test: (html) => html.includes('id="pageView"'),
    detail: () => "route shell must include #pageView"
  },
  {
    name: "minimal home shell",
    test: (html) =>
      html.includes('id="home" data-static-shell="minimal"') &&
      !html.includes("AI Empowered Suiyuecare System") &&
      !html.includes("先選你現在最需要的下一步。"),
    detail: () => "non-home routes must not ship the full static home page shell"
  },
  {
    name: "async recruiting first paint",
    test: (html, route) =>
      !asyncRecruitingRoutes.has(route) ||
      (!html.includes("initial-page-loader") &&
        !html.includes("route-page-loader") &&
        staleRecruitingShellMarkers.every((marker) => !html.includes(marker))),
    detail: (route) => `dist/${route}/index.html must avoid loading chrome and stale recruiting content before app hydration`
  },
  {
    name: "brand home link",
    test: (html) => !html.includes('href="#home"'),
    detail: () => 'non-home route shells should link back to "/" instead of an empty #home shell'
  },
  {
    name: "canonical route links",
    test: (html) => knownRouteHashes.every((slug) => !html.includes(`href="#${slug}"`)),
    detail: () => "non-home route shells should link known pages with canonical paths instead of hash-only URLs"
  },
  {
    name: "static current nav semantics",
    test: (html, route) => {
      const routeHref = `/${route}`;
      if (!html.includes(`href="${routeHref}"`)) return true;
      return new RegExp(`<a\\b(?=[^>]*\\bhref="${routeHref.replaceAll("-", "\\-")}")[^>]*\\baria-current="page"`).test(html);
    },
    detail: (route) => `dist/${route}/index.html should mark the current route link with aria-current="page"`
  }
];

const failures = [];

function readTag(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function todayInTaipei() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function verifySeoTags(html, route) {
  const routePath = `/${route}`;
  const canonical = `${siteOrigin}${routePath}`;
  const title = readTag(html, /<title>(.*?)<\/title>/);
  const description = readTag(html, /<meta name="description" content="(.*?)" \/>/);
  const canonicalHref = readTag(html, /<link rel="canonical" href="(.*?)" \/>/);
  const ogUrl = readTag(html, /<meta property="og:url" content="(.*?)" \/>/);
  const ogTitle = readTag(html, /<meta property="og:title" content="(.*?)" \/>/);
  const ogDescription = readTag(html, /<meta property="og:description" content="(.*?)" \/>/);
  const ogImage = readTag(html, /<meta property="og:image" content="(.*?)" \/>/);
  const twitterTitle = readTag(html, /<meta name="twitter:title" content="(.*?)" \/>/);
  const twitterDescription = readTag(html, /<meta name="twitter:description" content="(.*?)" \/>/);
  const twitterImage = readTag(html, /<meta name="twitter:image" content="(.*?)" \/>/);
  const robots = readTag(html, /<meta name="robots" content="(.*?)" \/>/);
  const preloadTag = html.match(/<link id="heroPreload"[^>]*>/)?.[0] || "";
  const preloadHref = readTag(preloadTag, /href="(.*?)"/);

  if (!title || title === "歲悅長照集團｜Suiyuecare Corps.") {
    failures.push(`${route}: seo title should be route-specific`);
  }
  if (!description || description.length < 24) {
    failures.push(`${route}: seo description is missing or too short`);
  }
  if (canonicalHref !== canonical) {
    failures.push(`${route}: canonical should be ${canonical}, received ${canonicalHref || "(missing)"}`);
  }
  if (ogUrl !== canonical) {
    failures.push(`${route}: og:url should match canonical`);
  }
  if (ogTitle !== title || twitterTitle !== title) {
    failures.push(`${route}: social titles should match route title`);
  }
  if (ogDescription !== description || twitterDescription !== description) {
    failures.push(`${route}: social descriptions should match route description`);
  }
  if (!ogImage.startsWith(`${siteOrigin}/assets/`) || !twitterImage.startsWith(`${siteOrigin}/assets/`)) {
    failures.push(`${route}: social images should use absolute public asset URLs`);
  }
  if (route === "search" && robots !== "noindex, follow") {
    failures.push("search: robots meta should be noindex, follow");
  }
  if (route !== "search" && robots !== "index, follow") {
    failures.push(`${route}: robots meta should be index, follow`);
  }
  if (!preloadHref) {
    failures.push(`${route}: hero image preload is missing`);
  } else {
    const expectedPreloadHref = ogImage.replace(siteOrigin, "");
    if (preloadHref !== expectedPreloadHref) {
      failures.push(`${route}: hero preload should match route image ${expectedPreloadHref}, received ${preloadHref}`);
    }
    if (!preloadTag.includes('fetchpriority="high"')) {
      failures.push(`${route}: hero preload should use fetchpriority="high"`);
    }
    if (!preloadTag.includes('as="image"')) {
      failures.push(`${route}: hero preload should declare as="image"`);
    }
    const assetPath = path.join(distDir, preloadHref.replace(/^\//, ""));
    if (!fs.existsSync(assetPath)) {
      failures.push(`${route}: hero preload asset is missing from dist: ${preloadHref}`);
    }
  }
}

function verifyCleanUrlPolicy(html, context) {
  for (const route of routes) {
    const trailingPath = `/${route}/`;
    const escapedPath = escapeRegExp(trailingPath);
    const escapedAbsolute = escapeRegExp(`${siteOrigin}${trailingPath}`);
    const patterns = [
      new RegExp(`\\bhref=["']${escapedPath}["']`),
      new RegExp(`\\bhref=["']${escapedAbsolute}["']`),
      new RegExp(`\\bcontent=["']${escapedAbsolute}["']`),
      new RegExp(`<loc>${escapedAbsolute}</loc>`)
    ];
    if (patterns.some((pattern) => pattern.test(html))) {
      failures.push(`${context}: public route ${trailingPath} should use clean URL /${route}`);
    }
  }
}

function verifyNoContentHashLinks(html, context) {
  if (/\bhref=["']#(?:article|care-story|master-talk)-/i.test(html)) {
    failures.push(`${context}: content detail links should use clean /article, /care-story, or /master-talk URLs instead of hash routes`);
  }
}

function extractFunctionBlock(source, name) {
  const marker = `function ${name}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return "";
  const bodyStart = source.indexOf("{", markerIndex);
  if (bodyStart < 0) return "";
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(markerIndex, index + 1);
    }
  }
  return "";
}

function verifyAsyncRendererAvoidsStaleFallback(source, name) {
  const block = extractFunctionBlock(source, name);
  if (!block) {
    failures.push(`app.js: missing ${name} renderer`);
    return;
  }

  const loadingIndex = block.indexOf("renderPageLoadingState(");
  const awaitIndex = block.indexOf("await ");
  const fallbackIndex = block.indexOf("fallbackRenderer()");
  const fallbackHtmlIndex = block.indexOf("fallbackHtml");
  const busyStartIndex = block.indexOf("setPageViewBusy(true)");
  const innerFallbackIndex = block.search(/pageView\.innerHTML\s*=\s*(fallbackRenderer\(\)|fallbackHtml)/);

  if (loadingIndex >= 0) {
    failures.push(`app.js: ${name} must not render route loading chrome before CMS data resolves`);
  }
  if (awaitIndex < 0) {
    failures.push(`app.js: ${name} must still await CMS data for quiet updates`);
  }
  if (name === "renderRecruitingPageOnce") {
    if (innerFallbackIndex >= 0 && innerFallbackIndex < awaitIndex) {
      failures.push(`app.js: ${name} must not paint fallback content before CMS data resolves`);
    }
    const benefitPositionCount = (block.match(/updateTalentBenefitNavPosition/g) || []).length;
    if (benefitPositionCount !== 1) {
      failures.push(`app.js: ${name} must position the benefit navigation once after the final page is rendered`);
    }
  } else if (innerFallbackIndex >= 0 && innerFallbackIndex < awaitIndex) {
    failures.push(`app.js: ${name} must not paint fallback content before CMS data resolves`);
  }
  if (name === "renderCmsEnhancedServicePageOnce") {
    const homeCareHydrationCount = (block.match(/hydrateHomeCareLocationContent\(pageView\)/g) || []).length;
    if (homeCareHydrationCount !== 1) {
      failures.push(`app.js: ${name} must hydrate the home-care map once after the final page is rendered`);
    }
  }
  if (
    fallbackIndex >= 0 &&
    fallbackIndex < awaitIndex &&
    !["renderCmsEnhancedServicePageOnce", "renderRecruitingPageOnce"].includes(name)
  ) {
    failures.push(`app.js: ${name} may only call fallbackRenderer after CMS loading fails or returns no data`);
  }
  if (name === "renderCmsEnhancedServicePageOnce" && fallbackHtmlIndex < 0) {
    failures.push(`app.js: ${name} should keep fallback HTML offscreen for CMS field merging`);
  }
  if (busyStartIndex < 0 || busyStartIndex > awaitIndex) {
    failures.push(`app.js: ${name} should mark #pageView busy before waiting for CMS data`);
  }
}

function verifyRecruitingRoutesUseSingleRenderer(source) {
  const block = extractFunctionBlock(source, "renderPage");
  if (!block) {
    failures.push("app.js: missing renderPage router");
    return;
  }

  const cmsRenderers = [
    ["land", "renderRecruitingPageOnce(normalized, renderLandRecruitingPage);"],
    ["investor-recruiting", "renderRecruitingPageOnce(normalized, renderInvestorRecruitingPage);"],
    ["talent", "renderRecruitingPageOnce(normalized, renderTalentPage);"]
  ];

  for (const [route, renderer] of cmsRenderers) {
    if (!block.includes(`normalized === "${route}"`) || !block.includes(renderer)) {
      failures.push(`app.js: /${route} should render published recruiting CMS data inside its fixed layout`);
    }
  }

  if (source.includes("warmRecruitingCmsData")) {
    failures.push("app.js: recruiting routes must render CMS data, not only warm the Supabase cache");
  }
}

function verifyInvestorRoutesUseSingleRenderer(source) {
  const block = extractFunctionBlock(source, "renderPage");
  if (!block) {
    failures.push("app.js: missing renderPage router");
    return;
  }

  const directRenderers = [
    ["investors", "pageView.innerHTML = renderInvestorsPage();"],
    ["ir-finance", "pageView.innerHTML = renderFinancePage();"],
    ["ir-governance", "pageView.innerHTML = renderGovernancePage();"],
    ["ir-shareholders", "pageView.innerHTML = renderShareholdersPage();"]
  ];

  for (const [route, renderer] of directRenderers) {
    if (!block.includes(`normalized === "${route}"`) || !block.includes(renderer)) {
      failures.push(`app.js: /${route} should render its fixed investor page directly, matching about and milestones`);
    }
  }

  if (block.includes("renderInvestorPageOnce(normalized")) {
    failures.push("app.js: public investor routes must not async-swap Supabase investor pages after first render");
  }
  if (source.includes("function renderInvestorPageOnce") || source.includes("async function renderInvestorPageOnce")) {
    failures.push("app.js: remove renderInvestorPageOnce so investor routes cannot revive the old two-stage page swap");
  }
  if (source.includes("function loadSupabaseInvestorPage") || source.includes("async function loadSupabaseInvestorPage")) {
    failures.push("app.js: remove loadSupabaseInvestorPage from the public bundle; investor pages should match about/milestones direct rendering");
  }
}

function verifyNavigationCurrentState(source) {
  const block = extractFunctionBlock(source, "setActiveNavLink");
  if (!block) {
    failures.push("app.js: missing setActiveNavLink helper");
    return;
  }
  if (!block.includes('setAttribute("aria-current", "page")')) {
    failures.push('app.js: active navigation links must set aria-current="page"');
  }
  if (!block.includes('removeAttribute("aria-current")')) {
    failures.push("app.js: inactive navigation links must remove aria-current");
  }
}

function verifyDedicatedAboutMilestoneHeroes(source) {
  if (!source.includes("about-full-hero")) {
    failures.push("app.js: about page should use a dedicated about-full-hero class");
  }
  if (!source.includes("milestones-full-hero")) {
    failures.push("app.js: milestones page should use a dedicated milestones-full-hero class");
  }
  if (source.includes("about-minute-hero")) {
    failures.push("app.js: about page must not use the legacy about-minute-hero class");
  }
  if (source.includes("one-minute-service-hero milestone-hero")) {
    failures.push("app.js: milestones page must not use the legacy milestone-hero class on the new full hero");
  }
}

function verifySupabaseHeroScopedToHome(source) {
  const block = extractFunctionBlock(source, "renderSupabaseHero");
  if (!block) {
    failures.push("app.js: missing renderSupabaseHero renderer");
    return;
  }
  if (source.includes("renderSupabaseHero(groups.hero)")) {
    failures.push("app.js: home hero must remain static and must not be overwritten by Supabase home modules");
  }
  if (!source.includes('!(page.slug === "home" && section.section_key === "hero")')) {
    failures.push("app.js: home page_sections hero must be skipped so the homepage has a single stable header");
  }
  if (block.includes('document.querySelector(".hero")') || block.includes("document.querySelector('.hero')")) {
    failures.push("app.js: renderSupabaseHero must not query the first global .hero because it can overwrite non-home route heroes");
  }
  if (!block.includes('home?.querySelector(".hero")')) {
    failures.push("app.js: renderSupabaseHero should be scoped to the home shell hero");
  }
}

function verifyMobileHeroPreloads(appSource, indexSource) {
  if (!appSource.includes("const routeHeroMobilePreloads")) {
    failures.push("app.js: missing routeHeroMobilePreloads for mobile hero images");
  }
  if (!appSource.includes("heroImageForViewport(") || !appSource.includes("shouldUseMobileHero()")) {
    failures.push("app.js: mobile hero images must be selected before rendering hero backgrounds");
  }
  if (!indexSource.includes("const heroMobilePreloads")) {
    failures.push("index.html: missing early mobile hero preload map");
  }

  for (const [route, asset] of Object.entries(criticalMobileHeroAssets)) {
    const appAsset = asset.replace(/^\//, "");
    const routeKey = route.includes("-") ? `"${route}"` : route;
    const appRoutePattern = new RegExp(`${routeKey}:\\s*"${appAsset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`);
    const appUsesHomeConstant = route === "home" && /home:\s*HOME_HERO_MOBILE_IMAGE/.test(appSource) && appSource.includes(`HOME_HERO_MOBILE_IMAGE = "${appAsset}"`);
    if (!appRoutePattern.test(appSource) && !appUsesHomeConstant) {
      failures.push(`app.js: missing mobile hero asset for ${route}: ${appAsset}`);
    }
    const hashKey = route === "home" ? "#home" : `#${route}`;
    if (!indexSource.includes(`"${hashKey}": "${asset}"`)) {
      failures.push(`index.html: missing hash mobile preload for ${route}: ${asset}`);
    }
    if (route !== "home" && !indexSource.includes(`"/${route}": "${asset}"`)) {
      failures.push(`index.html: missing path mobile preload for ${route}: ${asset}`);
    }
    const distAssetPath = path.join(distDir, asset.replace(/^\//, ""));
    if (!fs.existsSync(distAssetPath)) {
      failures.push(`dist: missing mobile hero asset for ${route}: ${asset}`);
    }
  }
}

function verifyHomeUsesCleanRouteLinks(indexSource, appSource) {
  if (!appSource.includes('"#home": "/"')) {
    failures.push("app.js: normalizePublicHref should convert #home to /");
  }
  if (appSource.includes('history.replaceState(null, "", "#home")')) {
    failures.push("app.js: home load should not rewrite / to #home");
  }
  if (appSource.includes('renderPage("home");') && appSource.includes('window.scrollTo({ top: 0, behavior: "smooth" });')) {
    failures.push("app.js: home load should not re-render and force-scroll after the user may have started scrolling");
  }
  for (const route of routes.filter((route) => route !== "contact")) {
    const hashHrefPattern = new RegExp(`href=["']#${escapeRegExp(route)}(?:[?"'])`);
    if (hashHrefPattern.test(indexSource)) {
      failures.push(`index.html: public route ${route} should link to /${route} instead of #${route}`);
    }
    if (!appSource.includes(`"#${route}": "/${route}"`)) {
      failures.push(`app.js: normalizePublicHref should convert #${route} to /${route}`);
    }
  }
  verifyNoContentHashLinks(indexSource, "index.html");
  if (!appSource.includes("hashRouteMatch") || !appSource.includes("${hashRouteMatch[2]}")) {
    failures.push("app.js: normalizePublicHref should preserve query strings when converting hash routes to clean URLs");
  }
  for (const expected of [
    "articleMatch",
    "/article/${articleMatch[1]}",
    "careStoryMatch",
    "/care-story/${careStoryMatch[1]}",
    "masterTalkMatch",
    "/master-talk/${masterTalkMatch[1]}"
  ]) {
    if (!appSource.includes(expected)) {
      failures.push("app.js: normalizePublicHref should convert content hash routes to clean content URLs");
      break;
    }
  }
  const routeBlock = extractFunctionBlock(appSource, "routeSlugFromLocation");
  const preservesRouteQuery =
    routeBlock.includes('window.location.search ? `${pathBase}${window.location.search}` : pathBase') ||
    (
      routeBlock.includes("new URLSearchParams(window.location.search)") &&
      routeBlock.includes('routeParams.delete("cms-preview")') &&
      routeBlock.includes('routeSearch ? `${pathBase}?${routeSearch}` : pathBase')
    );
  if (!preservesRouteQuery) {
    failures.push("app.js: routeSlugFromLocation should preserve clean URL query strings for route rendering");
  }
}

function verifyIntroLoaderExit(appSource, styleSource) {
  if (!styleSource.includes(".intro-loader") || !styleSource.includes("pointer-events: none")) {
    failures.push("styles.css: intro loader should not intercept pointer or touch interactions");
  }
  if (!appSource.includes('event.animationName === "intro-out"')) {
    failures.push("app.js: intro loader should be removed when its exit animation completes");
  }
  if (appSource.includes("6200") || appSource.includes("4850")) {
    failures.push("app.js: intro loader should not linger after the 3.5 second exit animation");
  }
}

function verifyContactAnchorBehavior(appSource) {
  if (!appSource.includes("function handleContactAnchorClick")) {
    failures.push("app.js: contact anchors should use a dedicated navigation helper");
  }
  if (!appSource.includes('activePage?.querySelector("#service-contact")')) {
    failures.push("app.js: #contact links on service pages should scroll to #service-contact when available");
  }
  if (!appSource.includes('window.location.href = "/#contact"')) {
    failures.push("app.js: #contact links outside the home page should route to the home contact section");
  }
  if (!appSource.includes("pendingContactPresetKey") || !appSource.includes("applyPendingContactPreset")) {
    failures.push("app.js: contact intent should persist when navigating to the home contact form");
  }
  if (!appSource.includes("function focusContactForm") || !appSource.includes("preventScroll: true")) {
    failures.push("app.js: contact navigation should focus the contact form without causing an extra scroll jump");
  }
  if (!appSource.includes('target.querySelector?.(".contact-form")')) {
    failures.push("app.js: service in-page contact scroll should apply presets and focus the service contact form");
  }
}

function verifyCourseImageFallbacks(appSource) {
  if (!appSource.includes("function courseImageAttrs")) {
    failures.push("app.js: course cards should render image attributes through courseImageAttrs");
  }
  if (!appSource.includes('data-fallback-src="${fallback}"')) {
    failures.push("app.js: course images should include data-fallback-src for broken CMS image URLs");
  }
  if (!appSource.includes('image instanceof HTMLImageElement') || !appSource.includes("fallbackApplied")) {
    failures.push("app.js: image error handling should replace broken course images with fallback assets");
  }
}

function verifyHealthImageFallbacks(appSource) {
  if (!appSource.includes("function getHealthArticleThemeImage")) {
    failures.push("app.js: Health 3.0 articles should resolve themed local images before CMS images");
  }
  if (!appSource.includes("function healthArticleImageAttrs")) {
    failures.push("app.js: Health 3.0 cards should render image attributes through healthArticleImageAttrs");
  }
  if (!appSource.includes("assets/health3/generated/hydration-meal-observation-hero.jpg") || !appSource.includes("assets/health3/generated/fall-prevention-night-route-hero.jpg")) {
    failures.push("app.js: Health 3.0 image fallback rules should include nutrition and fall-prevention generated photo assets");
  }
  if (!appSource.includes('data-fallback-src="${fallback}"')) {
    failures.push("app.js: Health 3.0 images should include data-fallback-src for broken CMS image URLs");
  }
  if (!appSource.includes('return normalized.replace(/^assets\\//, "/assets/")')) {
    failures.push("app.js: nested article routes should normalize local assets to root-relative /assets URLs");
  }
  if (!appSource.includes('<img ${healthArticleImageAttrs(article') || !appSource.includes('poster="${escapeHTML(getHealthArticleImage(article))}"')) {
    failures.push("app.js: article detail hero and video poster should use normalized Health 3.0 image attributes");
  }
  const tagMarkup = renderPublicArticleLayout({
    title: "標籤連結驗證",
    category: "健康3.0",
    tags: ["失智照顧"]
  });
  if (!tagMarkup.includes(`href="/search?q=${encodeURIComponent("失智照顧")}"`)) {
    failures.push("public content renderer: article hashtag pills should link to search results for the tag");
  }
}

function verifyDynamicImagesUseRootRelativeAssets(appSource) {
  if (appSource.includes('<img src="assets/')) {
    failures.push('app.js: dynamic route images must use root-relative /assets paths so clean URLs do not request /route/assets/*');
  }
  if (!appSource.includes('return String(normalized).replace(/^assets\\//, "/assets/")')) {
    failures.push("app.js: recruiting CMS images should normalize local assets to root-relative /assets URLs");
  }
}

function verifyTalentImagesUseNormalizedAssets(appSource) {
  const block = extractFunctionBlock(appSource, "renderTalentPage");
  if (!block) {
    failures.push("app.js: missing renderTalentPage");
    return;
  }
  if (!block.includes("const talentAsset = (url) => escapeHTML(normalizeLocalAssetUrl(url))")) {
    failures.push("app.js: talent page images should share a root-relative asset helper");
  }
  for (const directPattern of ['src="${image}"', 'src="${role.image}"', 'src="${item.image}"']) {
    if (block.includes(directPattern)) {
      failures.push(`app.js: talent page image markup must normalize ${directPattern} before rendering`);
    }
  }
}

function verifyFooterLayout(styleSource) {
  if (!/body\s*\{[\s\S]*display:\s*flex;[\s\S]*flex-direction:\s*column;[\s\S]*min-height:\s*100svh;/.test(styleSource)) {
    failures.push("styles.css: body should use a column flex layout so short route states keep the footer as the page ending");
  }
  if (!/body\s*>\s*main\s*\{[\s\S]*flex:\s*1 0 auto;[\s\S]*\}/.test(styleSource)) {
    failures.push("styles.css: body > main should flex to fill available height before the footer");
  }
  if (!/\.site-footer\s*\{[\s\S]*flex-shrink:\s*0;/.test(styleSource)) {
    failures.push("styles.css: .site-footer should not shrink inside the page layout");
  }
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function verifyHealthRouteStableFirstPaint(appSource) {
  const block = extractFunctionBlock(appSource, "renderPage");
  if (!block) {
    failures.push("app.js: missing renderPage router for Health 3.0 first-paint verification");
    return;
  }
  const healthBranch = block.match(/normalized === "health"[\s\S]*?\} else if \(normalized === "courses"\)/)?.[0] || "";
  if (!healthBranch) {
    failures.push("app.js: missing Health 3.0 and search route branches");
    return;
  }
  if (!healthBranch.includes('renderHealthRouteOnce(normalized, searchParams.get("category")') ||
      !healthBranch.includes('renderHealthRouteOnce(normalized, searchParams.get("q")')) {
    failures.push("app.js: /health and /search must share the single-pass Health renderer");
  }

  const renderer = extractFunctionBlock(appSource, "renderHealthRouteOnce");
  const awaitIndex = renderer.indexOf("await ");
  const renderIndex = renderer.indexOf("pageView.innerHTML = route ===");
  if (!renderer || awaitIndex < 0 || renderIndex < awaitIndex) {
    failures.push("app.js: renderHealthRouteOnce must wait for published data before its only visible render");
  }
  if (healthBranch.includes("rerender: true") || countMatches(renderer, /pageView\.innerHTML\s*=/g) !== 2) {
    failures.push("app.js: Health routes must clear once and render final content once without a second CMS repaint");
  }
}

function verifyCoursesRouteStableFirstPaint(appSource) {
  const renderer = extractFunctionBlock(appSource, "renderCoursesPageFromCms");
  if (!renderer) {
    failures.push("app.js: missing renderCoursesPageFromCms");
    return;
  }
  const awaitIndex = renderer.indexOf("await ");
  const finalRenderIndex = renderer.indexOf("pageView.innerHTML = renderCoursesPage()");
  if (awaitIndex < 0 || finalRenderIndex < awaitIndex) {
    failures.push("app.js: courses must wait for published CMS data before rendering the visible page");
  }
  if (countMatches(renderer, /pageView\.innerHTML\s*=/g) !== 2) {
    failures.push("app.js: courses must clear once and render final content once");
  }
}

function verifyPublishedFallbackIntegration(appSource) {
  for (const method of [
    "getServiceFields",
    "getRecruitingPage",
    "getCourses",
    "getMilestones",
    "getHealthSource",
    "getArticleSource",
    "getHomePageContent",
    "getHomeModules",
    "getStoryDatabases",
    "getSiteSettings"
  ]) {
    if (!appSource.includes(`loadCmsFallback("${method}"`)) {
      failures.push(`app.js: published CMS fallback is not wired for ${method}`);
    }
  }
  const startup = appSource.slice(appSource.indexOf("async function initializePublishedHomeContent"));
  if (
    !startup.includes('const pagePromise = loadSupabasePageContent("home")') ||
    !startup.includes("const modulesPromise = loadSupabaseHomeModules()") ||
    !startup.includes('loadCmsFallback("getStoryDatabases")') ||
    !startup.includes('dataset.homeContentReady = "snapshot"') ||
    !startup.includes("await Promise.all([pagePromise, modulesPromise")
  ) {
    failures.push("app.js: home page must apply the published snapshot before awaiting live CMS refreshes");
  }
  if (startup.includes("loadWordPressContent()")) {
    failures.push("app.js: home initialization must not introduce WordPress as a third published-copy source");
  }
}

function verifyServiceStoryCoverage(appSource, indexSource) {
  const serviceSlugs = ["home-care", "day-care", "community", "nursing", "migrant-training", "quality", "software"];
  for (let index = 0; index < serviceSlugs.length; index += 1) {
    const slug = serviceSlugs[index];
    const nextSlug = serviceSlugs[index + 1];
    const key = slug.includes("-") ? `"${slug}"` : slug;
    const nextKey = nextSlug ? (nextSlug.includes("-") ? `"${nextSlug}"` : nextSlug) : "";
    const start = appSource.indexOf(`${key}: [`);
    const end = nextKey ? appSource.indexOf(`\n  ${nextKey}: [`, start + 1) : appSource.indexOf("\n};", start + 1);
    const block = start >= 0 && end > start ? appSource.slice(start, end) : "";
    if (countMatches(block, /\bname:\s*"/g) < 6) {
      failures.push(`app.js: ${slug} service page should include at least 6 care story testimonials`);
    }
  }

  const homepageServices = ["居家照顧", "日間照顧", "社區據點", "護理復能", "移工培訓", "教育品管", "軟體系統"];
  const storySection = indexSource.match(/<section class="story-section[\s\S]*?<\/section>/)?.[0] || "";
  for (const service of homepageServices) {
    const count = countMatches(storySection, new RegExp(`<em>${escapeRegExp(service)}<\\/em>`, "g"));
    if (count < 2) {
      failures.push(`index.html: homepage care stories should include at least 2 testimonials for ${service}`);
    }
  }
  if (!appSource.includes("ensureHomepageStoryCoverage")) {
    failures.push("app.js: dynamic homepage care stories should keep at least two testimonials for each service area");
  }
}

function verifyHomeHealthLatestArticles(appSource, indexSource) {
  if (!appSource.includes("function renderHomeHealthArticles") || !appSource.includes("sortHealthArticlesLatest(uniqueHealthArticles(articles))")) {
    failures.push("app.js: homepage Health 3.0 block should render the latest local article list for family-friendly care knowledge");
  }
  for (const slug of [
    "fall-prevention-home-checklist",
    "hydration-low-appetite-elderly",
    "dementia-evening-agitation",
    "post-discharge-first-week",
    "safe-bathing-care"
  ]) {
    if (!indexSource.includes(`/article/${slug}`)) {
      failures.push(`index.html: homepage Health 3.0 block should link the latest article ${slug}`);
    }
  }
}

function verifyMasterTalkHomepageColumns(appSource, indexSource) {
  const expectedSlugs = [
    "master-talk-care-psychology",
    "master-talk-senior-nutrition",
    "master-talk-rehab-goals",
    "master-talk-home-safety",
    "master-talk-care-management",
    "master-talk-dementia-care",
    "master-talk-nursing-observation",
    "master-talk-family-communication"
  ];
  const slider = indexSource.match(/<div class="celebrity-slider"[\s\S]*?<\/div>\s*<p class="celebrity-hint"/)?.[0] || "";
  if (countMatches(slider, /<article>/g) !== 8) {
    failures.push("index.html: homepage Master Talk should render exactly 8 visible article cards");
  }
  if (!appSource.includes("const HOMEPAGE_MASTER_TALK_LIMIT = 8")) {
    failures.push("app.js: dynamic homepage Master Talk rendering should limit the homepage to 8 article cards");
  }
  if (
    !appSource.includes("items.length < HOMEPAGE_MASTER_TALK_LIMIT") ||
    !appSource.includes("talks.length < HOMEPAGE_MASTER_TALK_LIMIT")
  ) {
    failures.push("app.js: dynamic Master Talk sources should not replace the homepage grid unless 8 cards are available");
  }
  for (const slug of expectedSlugs) {
    if (!appSource.includes(`"${slug}"`) || !indexSource.includes(`/article/${slug}`)) {
      failures.push(`Master Talk card is missing from app.js or homepage grid: ${slug}`);
    }
  }
  if (!indexSource.includes('aria-label="名人講堂文章列表"')) {
    failures.push("index.html: homepage Master Talk should expose an accessible article-list label");
  }
}

function verifySitemap() {
  const file = path.join(distDir, "sitemap.xml");
  if (!fs.existsSync(file)) {
    failures.push("dist/sitemap.xml is missing");
    return;
  }

  const sitemap = fs.readFileSync(file, "utf8");
  verifyCleanUrlPolicy(sitemap, "sitemap.xml");
  for (const route of sitemapRoutes) {
    const routePath = route ? `/${route}` : "/";
    const loc = `${siteOrigin}${routePath}`;
    if (!sitemap.includes(`<loc>${loc}</loc>`)) {
      failures.push(`sitemap.xml is missing ${loc}`);
    }
  }
  if (sitemap.includes(`${siteOrigin}/search`)) {
    failures.push("sitemap.xml should not include noindex search route");
  }

  const lastmods = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((match) => match[1]);
  if (!lastmods.length) {
    failures.push("sitemap.xml is missing lastmod entries");
  }
  lastmods.forEach((lastmod) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod) || Number.isNaN(Date.parse(`${lastmod}T00:00:00Z`))) {
      failures.push(`sitemap.xml lastmod should be a valid YYYY-MM-DD date, received ${lastmod}`);
    }
  });

  for (const privatePath of ["/admin", "/api", "/portal", "/assets/backups"]) {
    if (sitemap.includes(`${siteOrigin}${privatePath}`)) {
      failures.push(`sitemap.xml should not include private path ${privatePath}`);
    }
  }
}

if (!fs.existsSync(distDir)) {
  failures.push("dist/ does not exist. Run pnpm build before pnpm verify:routes.");
} else {
  const homeFile = path.join(distDir, "index.html");
  if (fs.existsSync(homeFile)) {
    const homeHtml = fs.readFileSync(homeFile, "utf8");
    verifyNoContentHashLinks(homeHtml, "dist/index.html");
  } else {
    failures.push("missing dist/index.html");
  }
  for (const route of routes) {
    const file = path.join(distDir, route, "index.html");
    if (!fs.existsSync(file)) {
      failures.push(`missing dist/${route}/index.html`);
      continue;
    }

    const html = fs.readFileSync(file, "utf8");
    verifyCleanUrlPolicy(html, route);
    verifyNoContentHashLinks(html, route);
    verifySeoTags(html, route);
    for (const check of checks) {
      if (!check.test(html, route)) {
        failures.push(`${route}: ${check.name} failed - ${check.detail(route)}`);
      }
    }
  }
  verifySitemap();
}

if (!fs.existsSync(appFile)) {
  failures.push("app.js does not exist.");
} else {
  const appSource = fs.readFileSync(appFile, "utf8");
  const styleSource = fs.existsSync(styleFile) ? fs.readFileSync(styleFile, "utf8") : "";
  const indexSource = fs.existsSync("index.html") ? fs.readFileSync("index.html", "utf8") : "";
  [
    "renderCmsEnhancedServicePageOnce",
    "renderServiceTemplatePageOnce",
    "renderRecruitingPageOnce"
  ].forEach((name) => verifyAsyncRendererAvoidsStaleFallback(appSource, name));
  verifyNavigationCurrentState(appSource);
  verifyDedicatedAboutMilestoneHeroes(appSource);
  verifySupabaseHeroScopedToHome(appSource);
  verifyMobileHeroPreloads(appSource, indexSource);
  verifyHomeUsesCleanRouteLinks(indexSource, appSource);
  verifyIntroLoaderExit(appSource, styleSource);
  verifyContactAnchorBehavior(appSource);
  verifyRecruitingRoutesUseSingleRenderer(appSource);
  verifyInvestorRoutesUseSingleRenderer(appSource);
  verifyCourseImageFallbacks(appSource);
  verifyCoursesRouteStableFirstPaint(appSource);
  verifyHealthImageFallbacks(appSource);
  verifyHealthRouteStableFirstPaint(appSource);
  verifyPublishedFallbackIntegration(appSource);
  verifyServiceStoryCoverage(appSource, indexSource);
  verifyHomeHealthLatestArticles(appSource, indexSource);
  verifyMasterTalkHomepageColumns(appSource, indexSource);
  verifyDynamicImagesUseRootRelativeAssets(appSource);
  verifyTalentImagesUseNormalizedAssets(appSource);
  verifyFooterLayout(styleSource);
}

if (failures.length) {
  console.error("Route shell verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`ok - verified ${routes.length} public route shells avoid stale first-paint content`);
