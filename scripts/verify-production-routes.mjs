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

const recruitingRoutes = new Set(["talent", "land", "investor-recruiting"]);
const staleRecruitingShellMarkers = [
  'class="hero talent-recruit-hero',
  'class="hero service-detail-hero one-minute-service-hero land-recruit-hero',
  'class="hero service-detail-hero one-minute-service-hero investor-recruit-hero',
  "career-page recruiting-cms-page",
  "land-recruit-page",
  "investor-recruit-page"
];

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

async function verifyRoute(slug) {
  const failures = [];
  const { response, html } = await fetchRoute(slug);
  const url = absoluteRoute(slug);

  check(response.status === 200, failures, `${slug}: expected 200 from ${url}, received ${response.status}`);
  check(hasNoCacheHeader(response), failures, `${slug}: production HTML should send Cache-Control with no-cache and no-store`);
  check(new RegExp(`<html[^>]*data-initial-route="${slug}"`).test(html), failures, `${slug}: missing route-specific data-initial-route`);
  check(html.includes('id="home" data-static-shell="minimal"'), failures, `${slug}: production HTML should ship the minimal non-home shell`);
  check(!html.includes("initial-page-loader"), failures, `${slug}: production HTML should not include first-paint loading chrome`);
  check(html.includes('id="pageView"'), failures, `${slug}: production HTML should include #pageView`);
  check(!staleContentHashLinkPattern.test(html), failures, `${slug}: production HTML should not include stale content hash links`);

  for (const marker of staleHomeMarkers) {
    check(!html.includes(marker), failures, `${slug}: still contains stale home marker "${marker}"`);
  }

  if (recruitingRoutes.has(slug)) {
    for (const marker of staleRecruitingShellMarkers) {
      check(!html.includes(marker), failures, `${slug}: still contains stale recruiting marker "${marker}"`);
    }
  }

  return failures;
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

const allFailures = [];
for (const route of routes) {
  try {
    const failures = await verifyRoute(route);
    allFailures.push(...failures);
  } catch (error) {
    allFailures.push(`${route}: production route check failed - ${error.message}`);
  }
}

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
  console.log(`ok - production routes avoid stale first-paint shells at ${siteOrigin}`);
}
