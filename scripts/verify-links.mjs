import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const htmlFiles = [];
const failures = [];
const attrPattern = /\b(?:href|src|poster|action)=["']([^"']+)["']/gi;
const targetBlankPattern = /<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi;
const dynamicContentRoutePattern = /^\/(?:article|care-story|master-talk)\/[^/]+$/;

function readDynamicRewriteSources() {
  try {
    const config = JSON.parse(fs.readFileSync(path.resolve("vercel.json"), "utf8"));
    return new Set((config.rewrites || []).map((rewrite) => rewrite.source));
  } catch {
    return new Set();
  }
}

const dynamicRewriteSources = readDynamicRewriteSources();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}

function stripUrl(value = "") {
  return value.split("#")[0].split("?")[0];
}

function isSkippable(value = "") {
  return (
    !value ||
    value === "#" ||
    value.startsWith("#") ||
    value.startsWith("/api/") ||
    /^(https?:|mailto:|tel:|sms:|line:|javascript:|data:|blob:)/i.test(value)
  );
}

function targetExists(targetPath) {
  if (fs.existsSync(targetPath)) return true;
  if (fs.existsSync(path.join(targetPath, "index.html"))) return true;
  if (!path.extname(targetPath) && fs.existsSync(`${targetPath}.html`)) return true;
  return false;
}

function isDynamicContentRoute(value = "") {
  const clean = stripUrl(value);
  if (!dynamicContentRoutePattern.test(clean)) return false;
  const source = `/${clean.split("/")[1]}/:slug`;
  return dynamicRewriteSources.has(source);
}

function resolveInternalTarget(value, htmlFile) {
  const clean = stripUrl(value);
  if (!clean || clean === "/") return path.join(distDir, "index.html");
  if (clean.startsWith("/")) return path.join(distDir, clean.replace(/^\/+/, ""));
  return path.resolve(path.dirname(htmlFile), clean);
}

if (!fs.existsSync(distDir)) {
  console.error("dist/ does not exist. Run pnpm build before pnpm verify:links.");
  process.exit(1);
}

walk(distDir);

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, "utf8");
  for (const match of html.matchAll(targetBlankPattern)) {
    const tag = match[0];
    if (!/\brel=["'][^"']*\bnoopener\b[^"']*["']/.test(tag)) {
      failures.push(`${path.relative(process.cwd(), htmlFile)} -> target="_blank" link missing rel="noopener"`);
    }
  }
  for (const match of html.matchAll(attrPattern)) {
    const value = match[1].trim();
    if (isSkippable(value)) continue;
    if (isDynamicContentRoute(value)) continue;
    const target = resolveInternalTarget(value, htmlFile);
    if (!targetExists(target)) {
      failures.push(`${path.relative(process.cwd(), htmlFile)} -> ${value}`);
    }
  }
}

if (failures.length) {
  console.error("Built link verification failed:");
  failures.slice(0, 120).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 120) console.error(`...and ${failures.length - 120} more`);
  process.exit(1);
}

console.log(`ok - verified ${htmlFiles.length} built HTML files have valid internal links/assets`);
