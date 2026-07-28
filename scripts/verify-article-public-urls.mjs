import { ARTICLE_SOURCE_SLUGS, articlePublicHref } from "../article-url-map.mjs";
import { loadPublicContent } from "./load-public-content.mjs";

const failures = [];
const duplicateSources = ARTICLE_SOURCE_SLUGS.filter(
  (sourceSlug, index) => ARTICLE_SOURCE_SLUGS.indexOf(sourceSlug) !== index
);
if (duplicateSources.length) {
  failures.push(`duplicate source slugs: ${[...new Set(duplicateSources)].join(", ")}`);
}

ARTICLE_SOURCE_SLUGS.forEach((sourceSlug, index) => {
  const expected = `/article/article${index + 1}`;
  if (articlePublicHref(sourceSlug) !== expected) {
    failures.push(`${sourceSlug}: expected ${expected}`);
  }
});

const publicContent = await loadPublicContent();
publicContent.articles.forEach((article) => {
  if (!/^\/article\/article\d+$/.test(article.href)) {
    failures.push(`${article.slug}: public href is not numbered (${article.href})`);
  }
});

const publicHrefs = publicContent.articles.map((article) => article.href);
if (new Set(publicHrefs).size !== publicHrefs.length) {
  failures.push("public article hrefs are not unique");
}

const expectedInitialHrefs = ARTICLE_SOURCE_SLUGS.map((sourceSlug) => articlePublicHref(sourceSlug));
expectedInitialHrefs.forEach((href) => {
  if (!publicHrefs.includes(href)) failures.push(`current public content is missing ${href}`);
});

if (failures.length) {
  console.error(`Article public URL verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `ok - ${publicContent.articles.length} public articles use stable numbered URLs beginning at article1`
);
