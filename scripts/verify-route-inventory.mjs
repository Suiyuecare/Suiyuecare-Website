import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.resolve(root, file), "utf8");
}

function readJson(file) {
  return JSON.parse(read(file));
}

async function importSourceModule(file) {
  const source = Buffer.from(read(file)).toString("base64");
  return import(`data:text/javascript;base64,${source}`);
}

function uniq(values) {
  return [...new Set(values)].sort();
}

function parseQuotedArray(source, variableName) {
  const match = source.match(new RegExp(`const\\s+${variableName}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!match) throw new Error(`Missing ${variableName} array.`);
  return uniq([...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]));
}

function parsePublicRoutePaths(source) {
  const match = source.match(/const\s+publicRoutePaths\s*=\s*new Map\(\[([\s\S]*?)\]\);/);
  if (!match) throw new Error("Missing publicRoutePaths map.");
  return uniq([...match[1].matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)].map((item) => item[1]));
}

function parseRouteBudgetPaths(source) {
  return uniq([...source.matchAll(/\{\s*route:\s*"([^"]+)"/g)].map((item) => item[1]));
}

function parseNoCacheSources(source) {
  const match = source.match(/const\s+publicHtmlNoCacheSources\s*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error("Missing publicHtmlNoCacheSources array.");
  return uniq([...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]));
}

function slugToPath(slug) {
  return slug === "home" ? "/" : `/${slug}`;
}

function pathToCleanSource(routePath) {
  return routePath === "/" ? "/" : routePath.replace(/\/$/, "");
}

function assertSame(label, actual, expected) {
  const missing = expected.filter((item) => !actual.includes(item));
  const extra = actual.filter((item) => !expected.includes(item));
  if (missing.length || extra.length) {
    throw new Error([
      `${label} is out of sync.`,
      missing.length ? `missing: ${missing.join(", ")}` : "",
      extra.length ? `extra: ${extra.join(", ")}` : ""
    ].filter(Boolean).join("\n"));
  }
}

const generator = read("scripts/generate-static-routes.mjs");
const verifyRoutes = read("scripts/verify-routes.mjs");
const verifyProductionRoutes = read("scripts/verify-production-routes.mjs");
const verifyPerformance = read("scripts/verify-performance.mjs");
const verifySecurity = read("scripts/verify-security.mjs");
const vercelConfig = readJson("vercel.json");
const { visualEditorPageList } = await importSourceModule("src/admin/visual-editor-manifest.js");

const canonicalSlugs = parsePublicRoutePaths(generator);
const canonicalPaths = canonicalSlugs.map(slugToPath).sort();
const nonHomeSlugs = canonicalSlugs.filter((slug) => slug !== "home");
const nonHomePaths = canonicalPaths.filter((routePath) => routePath !== "/");
const cleanNoCacheSources = uniq(["/", "/index.html", ...nonHomePaths.map(pathToCleanSource)]);
const forbiddenDynamicContentRewriteSources = [
  "/article/:slug",
  "/care-story/:slug",
  "/master-talk/:slug"
];

assertSame(
  "visual editor page manifest",
  uniq(visualEditorPageList().map((page) => page.slug)),
  canonicalSlugs
);
assertSame("scripts/verify-routes.mjs routes", parseQuotedArray(verifyRoutes, "routes"), nonHomeSlugs);
assertSame("scripts/verify-production-routes.mjs routes", parseQuotedArray(verifyProductionRoutes, "routes"), nonHomeSlugs);
assertSame("scripts/verify-performance.mjs routeBudgets", parseRouteBudgetPaths(verifyPerformance), canonicalPaths);
assertSame("scripts/verify-security.mjs publicHtmlNoCacheSources", parseNoCacheSources(verifySecurity), cleanNoCacheSources);
assertSame(
  "vercel.json public HTML header sources",
  uniq((vercelConfig.headers || [])
    .filter((entry) => entry.headers?.some((header) => header.key === "Cache-Control" && header.value.includes("no-cache")))
    .map((entry) => entry.source)),
  cleanNoCacheSources
);
assertSame(
  "vercel.json forbidden dynamic content rewrites",
  uniq((vercelConfig.rewrites || [])
    .map((entry) => entry.source)
    .filter((source) => forbiddenDynamicContentRewriteSources.includes(source))),
  []
);

console.log(`ok - public route inventory is consistent across ${canonicalSlugs.length} routes`);
