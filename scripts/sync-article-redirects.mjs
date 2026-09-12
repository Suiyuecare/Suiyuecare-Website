import { ARTICLE_CONSOLIDATIONS, canonicalArticleHref } from "../article-consolidation.mjs";
import { articlePublicHref } from "../article-url-map.mjs";
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

const articleRedirects = [
  ...ARTICLE_SOURCE_SLUGS.map((sourceSlug) => ({
    source: `/article/${sourceSlug}`, destination: canonicalArticleHref(sourceSlug), permanent: true
  })),
  ...ARTICLE_CONSOLIDATIONS.map(({ source, target }) => ({
    source: articlePublicHref(source), destination: articlePublicHref(target), permanent: true
  }))
];
const redirects = [
  ...(config.redirects || []).filter((item) => !isManagedArticleRedirect(item)),
  ...articleRedirects
];

const output = `${JSON.stringify({ ...config, redirects }, null, 2)}\n`;

if (checkOnly) {
  const managedRedirects = (config.redirects || []).filter(isManagedArticleRedirect);
  const expectedRedirects = new Map(articleRedirects.map((item) => [item.source, item.destination]));
  const redirectsAreCurrent =
    managedRedirects.length === expectedRedirects.size &&
    managedRedirects.every((item) =>
      expectedRedirects.get(item.source) === item.destination &&
      item.permanent === true
    );

  if (!redirectsAreCurrent) {
    console.error("vercel.json article redirects are stale. Run pnpm articles:redirects:sync.");
    process.exit(1);
  }
  console.log(`ok - ${ARTICLE_SOURCE_SLUGS.length} legacy article redirects are synchronized`);
} else {
  fs.writeFileSync(configPath, output);
  console.log(`ok - synchronized ${ARTICLE_SOURCE_SLUGS.length} legacy article redirects`);
}
