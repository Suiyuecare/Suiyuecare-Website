import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { normalizeCmsPublicArticle, normalizeStaticPublicArticle } from "../public-content-adapters.mjs";
import { renderPublicArticleLayout } from "../public-content-renderer.mjs";
import { publicStructuredDataObject, publicStructuredDataJson } from "../public-route-structured-data.mjs";
import { EDITORIAL_POLICY_ROUTE, getPublicEditorialInfo, normalizePublicEditorialMetadata, renderEditorialPolicyPage, safeEditorialHref } from "../public-editorial.mjs";
import { loadPublicContent } from "./load-public-content.mjs";
import { getServiceLocationByRoute } from "../public-service-locations.mjs";

const existing = {
  slug: "day-care-transition", author: "歲悅日照團隊", title: "日照文章", category: "日間照顧",
  publishedAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-10T00:00:00.000Z",
  content: [["原有正文", ["保留文章原有段落。"]]], references: [{ name: "來源", url: "https://example.org/source" }]
};
const existingHtml = renderPublicArticleLayout(existing);
assert.match(existingHtml, /href="\/editorial-policy#editorial-day-care" rel="author">歲悅日照團隊/);
assert.match(existingHtml, /href="\/day-care"/);
assert.match(existingHtml, /<p>保留文章原有段落。<\/p>/);
assert.doesNotMatch(existingHtml, /內容審閱｜|內容更新｜|資料查核｜/);
const existingGraph = publicStructuredDataObject({ path: "/article/article43", article: existing })["@graph"];
assert.equal(existingGraph.find((item) => item["@type"] === "Article").author["@type"], "Organization");
assert.equal(existingGraph.find((item) => item["@type"] === "WebPage").reviewedBy, undefined);

const supplied = {
  author: { type: "Person", name: "測試作者 <script>", role: "測試職稱", url: "/about#test-author", credentials: "測試資格" },
  reviewer: { type: "Person", name: "測試審閱者", profileUrl: "https://example.org/reviewer" },
  reviewedAt: "2026-09-05", contentUpdatedAt: "2026-09-04", sourceCheckedAt: "2026-09-03"
};
const cms = normalizeCmsPublicArticle({ slug: "day-care-transition", title: "日照文章", author_name: "原有署名", published_at: existing.publishedAt, content_json: { editorial: supplied } });
const staticArticle = normalizeStaticPublicArticle({ slug: "day-care-transition", ...existing }, { editorial: supplied });
assert.deepEqual(cms.editorial, staticArticle.editorial);
const html = renderPublicArticleLayout(cms);
assert.match(html, /測試作者 &lt;script&gt;/);
assert.match(html, /內容審閱｜/);
assert.match(html, /內容更新｜/);
assert.match(html, /資料查核｜/);
assert.doesNotMatch(html, /<script>/);
const graph = publicStructuredDataObject({ path: "/article/article43", article: cms })["@graph"];
assert.equal(graph.find((item) => item["@type"] === "BlogPosting").author.url, "https://www.suiyuecare.com/about#test-author");
assert.equal(graph.find((item) => item["@type"] === "BlogPosting").dateModified, cms.editorial.contentUpdatedAt);
assert.equal(graph.find((item) => item["@type"] === "WebPage").reviewedBy.name, "測試審閱者");
assert.equal(graph.find((item) => item["@type"] === "WebPage").lastReviewed, cms.editorial.reviewedAt);
const dangerousRoute = { path: "/article/article43", article: { ...existing, editorial: { author: { type: "Person", name: "</script><script>alert(1)</script>" } } } };
assert.doesNotMatch(publicStructuredDataJson(dangerousRoute), /<\/script/i);
assert.deepEqual(JSON.parse(publicStructuredDataJson(dangerousRoute)), publicStructuredDataObject(dangerousRoute));

for (const url of ["javascript:alert(1)", "data:text/html,test", "//example.org/", "/\\example.org/", "https://u:p@example.org/", "https:\n//example.org/", "http://example.org/", "about/test"]) {
  assert.equal(safeEditorialHref(url), "", `unsafe editorial URL: ${url}`);
}
assert.equal(safeEditorialHref("/about#team"), "/about#team");
const invalid = normalizePublicEditorialMetadata({ reviewer: supplied.reviewer, reviewedAt: "2026-02-30", sourceCheckedAt: "today" });
assert.equal(invalid.reviewedAt, "");
assert.equal(invalid.sourceCheckedAt, "");
assert.equal(getPublicEditorialInfo({ ...existing, editorial: invalid }).reviewer, null);
assert.equal(getPublicEditorialInfo({ ...existing, editorial: { reviewer: supplied.reviewer } }).reviewer, null);
assert.equal(normalizePublicEditorialMetadata(supplied, { reviewer: null }).reviewer, null);

const policy = renderEditorialPolicyPage();
assert.equal((policy.match(/<h1\b/g) || []).length, 1);
const ids = [...policy.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "policy anchor IDs must be unique");
// Exercise the application's real route predicate, including content prefixes.
const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const routeMap = appSource.match(/const routeSeoMap = \{[\s\S]*?\n\};/)?.[0];
const routePredicate = appSource.match(/function isKnownRouteSlug\(slug = ""\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(routeMap && routePredicate, "application route predicate must be available");
const routeContext = { DEFAULT_SEO: {}, getServiceLocationByRoute };
vm.createContext(routeContext);
vm.runInContext(`${routeMap}\n${routePredicate}\nglobalThis.knownRoute = isKnownRouteSlug;`, routeContext);
assert.equal(routeContext.knownRoute("article-references"), true, "regression trigger: article-* hashes navigate");
const referenceAnchor = existingHtml.match(/href="#([^"]+)">查看參考資料/)?.[1];
assert.ok(referenceAnchor && existingHtml.includes(`id="${referenceAnchor}"`), "reference link must reach its section");
for (const anchor of [...ids, referenceAnchor]) {
  assert.equal(routeContext.knownRoute(anchor), false, `${anchor}: content anchors must not navigate to another route`);
}
const content = await loadPublicContent();
for (const article of content.items) {
  const info = getPublicEditorialInfo(article);
  if (info.author.url.startsWith(`${EDITORIAL_POLICY_ROUTE.path}#`)) {
    assert.ok(ids.includes(info.author.url.split("#")[1]), `${article.href}: author anchor must exist`);
  }
  if (!article.editorial?.reviewer || !article.editorial?.reviewedAt) assert.equal(info.reviewer, null, `${article.href}: must not invent reviewer`);
}
console.log(`Public editorial verification passed: optional metadata, safe display, schema parity, dates, and ${content.items.length} existing bylines.`);
