import fs from "node:fs";
import path from "node:path";
import { ARTICLE_SOURCE_SLUGS } from "../article-url-map.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const configPath = path.join(rootDir, "vercel.json");
const checkOnly = process.argv.includes("--check");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const isManagedArticleRedirect = (item = {}) =>
  /^\/article\/[a-z0-9-]+$/.test(item.source || "") &&
  /^\/article\/article\d+$/.test(item.destination || "");

const redirects = [
  ...(config.redirects || []).filter((item) => !isManagedArticleRedirect(item)),
  ...ARTICLE_SOURCE_SLUGS.map((sourceSlug, index) => ({
    source: `/article/${sourceSlug}`,
    destination: `/article/article${index + 1}`,
    permanent: true
  }))
];

const output = `${JSON.stringify({ ...config, redirects }, null, 2)}\n`;
const current = fs.readFileSync(configPath, "utf8");

if (checkOnly) {
  if (current !== output) {
    console.error("vercel.json article redirects are stale. Run pnpm articles:redirects:sync.");
    process.exit(1);
  }
  console.log(`ok - ${ARTICLE_SOURCE_SLUGS.length} legacy article redirects are synchronized`);
} else {
  fs.writeFileSync(configPath, output);
  console.log(`ok - synchronized ${ARTICLE_SOURCE_SLUGS.length} legacy article redirects`);
}
