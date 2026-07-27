import fs from "node:fs";
import path from "node:path";
import { loadPublicContent } from "./load-public-content.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const distDir = path.join(rootDir, "dist");
const siteOrigin = "https://www.suiyuecare.com";
const failures = [];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function count(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

function routeFile(routePath) {
  return path.join(distDir, routePath.replace(/^\//, ""), "index.html");
}

function canonicalFrom(html) {
  return html.match(/<link rel="canonical" href="([^"]+)" \/>/)?.[1] || "";
}

function structuredDataFrom(html, routePath) {
  const source = html.match(
    /<script id="structuredData" type="application\/ld\+json">([\s\S]*?)<\/script>/
  )?.[1];
  if (!source) {
    failures.push(`${routePath}: missing structured data`);
    return null;
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    failures.push(`${routePath}: invalid structured data (${error.message})`);
    return null;
  }
}

function dateInTaipei(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

if (!fs.existsSync(distDir)) {
  throw new Error("dist/ does not exist. Run pnpm build first.");
}

const publicContent = await loadPublicContent();
const manifestPath = path.join(distDir, "seo-manifest.json");
const sitemapPath = path.join(distDir, "sitemap.xml");
if (!fs.existsSync(manifestPath)) failures.push("dist/seo-manifest.json is missing");
if (!fs.existsSync(sitemapPath)) failures.push("dist/sitemap.xml is missing");

const manifest = fs.existsSync(manifestPath) ? JSON.parse(read(manifestPath)) : {};
const sitemap = fs.existsSync(sitemapPath) ? read(sitemapPath) : "";
const manifestByPath = new Map((manifest.routes || []).map((route) => [route.path, route]));

const expectedCounts = {
  articles: publicContent.articles.length,
  careStories: publicContent.stories.length,
  masterTalks: publicContent.talks.length
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  if (manifest.counts?.[key] !== expected) {
    failures.push(`seo-manifest ${key} count should be ${expected}, received ${manifest.counts?.[key]}`);
  }
}

for (const item of publicContent.items) {
  const file = routeFile(item.href);
  const canonical = `${siteOrigin}${item.href}`;
  if (!fs.existsSync(file)) {
    failures.push(`${item.href}: static HTML is missing`);
    continue;
  }
  const html = read(file);
  if (canonicalFrom(html) !== canonical) {
    failures.push(`${item.href}: canonical should point to itself`);
  }
  if (count(html, /<h1\b/gi) !== 1) {
    failures.push(`${item.href}: expected exactly one H1`);
  }
  if (!html.includes('data-prerendered-route="') || !html.includes("data-public-content-type=")) {
    failures.push(`${item.href}: complete article body is not pre-rendered`);
  }
  if (!html.includes('<meta property="og:type" content="article" />')) {
    failures.push(`${item.href}: og:type should be article`);
  }
  if (!html.includes("max-image-preview:large")) {
    failures.push(`${item.href}: robots metadata should allow large image previews`);
  }
  if (!html.includes('property="article:published_time"') || !html.includes('property="article:modified_time"')) {
    failures.push(`${item.href}: article publish/update metadata is missing`);
  }

  const structured = structuredDataFrom(html, item.href);
  const graph = structured?.["@graph"] || [];
  const articleSchema = graph.find((entry) => ["Article", "BlogPosting"].includes(entry?.["@type"]));
  if (!articleSchema) {
    failures.push(`${item.href}: Article or BlogPosting schema is missing`);
  } else {
    if (articleSchema.headline !== item.title) failures.push(`${item.href}: schema headline is stale`);
    if (articleSchema.datePublished !== item.publishedAt) failures.push(`${item.href}: schema published date is stale`);
    if (articleSchema.dateModified !== item.updatedAt) failures.push(`${item.href}: schema modified date is stale`);
  }
  const breadcrumb = graph.find((entry) => entry?.["@type"] === "BreadcrumbList");
  if (!breadcrumb || breadcrumb.itemListElement?.length !== 3) {
    failures.push(`${item.href}: three-level breadcrumb schema is missing`);
  }

  const manifestRoute = manifestByPath.get(item.href);
  if (!manifestRoute) {
    failures.push(`${item.href}: missing from seo-manifest.json`);
  } else if (manifestRoute.lastmod !== dateInTaipei(item.lastmod)) {
    failures.push(`${item.href}: seo-manifest lastmod does not match source content`);
  }
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
    failures.push(`${item.href}: missing from sitemap.xml`);
  }
}

const healthHtmlPath = path.join(distDir, "health", "index.html");
if (!fs.existsSync(healthHtmlPath)) {
  failures.push("/health: static HTML is missing");
} else {
  const healthHtml = read(healthHtmlPath);
  for (const article of publicContent.articles) {
    if (!healthHtml.includes(`href="${article.href}"`)) {
      failures.push(`/health: missing crawlable link to ${article.href}`);
    }
  }
}

const vercelConfig = JSON.parse(read(path.join(rootDir, "vercel.json")));
const forbiddenRewrites = new Set(["/article/:slug", "/care-story/:slug", "/master-talk/:slug"]);
for (const rewrite of vercelConfig.rewrites || []) {
  if (forbiddenRewrites.has(rewrite.source)) {
    failures.push(`vercel.json: ${rewrite.source} must not rewrite to the homepage`);
  }
}
if (!fs.existsSync(path.join(distDir, "404.html"))) {
  failures.push("dist/404.html is missing, so unknown content cannot return a proper not-found page");
}
for (const unknownPath of [
  "/article/this-content-does-not-exist",
  "/care-story/this-content-does-not-exist",
  "/master-talk/this-content-does-not-exist"
]) {
  if (fs.existsSync(routeFile(unknownPath))) {
    failures.push(`${unknownPath}: unknown content should not be generated`);
  }
}

if (failures.length) {
  console.error(`Public content SEO verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `ok - ${publicContent.items.length} public content pages expose static HTML, self canonicals, schema, sitemap URLs, and real 404 fallthrough`
);
