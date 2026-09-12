import vm from "node:vm";
import { mergeLatestPublicContent } from "../public-content-freshness.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseHTML } from "linkedom";
import { ARTICLE_SOURCE_SLUGS, articlePublicHref } from "../article-url-map.mjs";
import { ARTICLE_CONSOLIDATIONS, canonicalArticleHref, canonicalizeArticleLink, consolidatePublicArticles } from "../article-consolidation.mjs";
import { loadPublicContent } from "./load-public-content.mjs";

assert.equal(ARTICLE_SOURCE_SLUGS[42], "day-care-transition", "Retired public number stays reserved");
assert.equal(articlePublicHref("day-care-transition"), "/article/article43", "Raw identity remains stable for CMS records");
for (const value of ["day-care-transition", "article43"]) assert.equal(canonicalArticleHref(value), "/article/article7");
for (const href of ["/article/article43", "/article/day-care-transition", "#article-day-care-transition", "https://www.suiyuecare.com/article/article43"]) {
  assert.equal(canonicalizeArticleLink(href), "/article/article7");
}
assert.equal(canonicalizeArticleLink("/article/article43?utm_source=test#editorial-references"), "/article/article7?utm_source=test#editorial-references");
assert.equal(canonicalizeArticleLink("https://other.example/article/article43"), "https://other.example/article/article43");
assert.equal(canonicalizeArticleLink("#editorial-references"), "#editorial-references");
assert.equal(canonicalizeArticleLink("/article/unknown-slug"), "/article/unknown-slug");
const retained = { slug: "daycare-first-week", title: "Original", content: ["retained"] };
const duplicate = { slug: "day-care-transition", title: "Duplicate" };
assert.deepEqual(consolidatePublicArticles([duplicate, retained]), [retained]);
assert.deepEqual(consolidatePublicArticles([duplicate]), [duplicate], "Do not hide the only available article");
assert.equal(retained.title, "Original", "Do not invent a new byline, date or merge identity");

const { articles } = await loadPublicContent();
const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
const redirects = JSON.parse(fs.readFileSync("vercel.json", "utf8")).redirects;
for (const { source, target } of ARTICLE_CONSOLIDATIONS) {
  const destination = articlePublicHref(target);
  assert.ok(articles.some((article) => article.href === destination));
  assert.ok(!articles.some((article) => article.sourceSlug === source));
  assert.ok(!sitemap.includes(`<loc>https://www.suiyuecare.com${articlePublicHref(source)}</loc>`));
  assert.ok(sitemap.includes(`<loc>https://www.suiyuecare.com${destination}</loc>`));
  assert.ok(!fs.existsSync(`dist${articlePublicHref(source)}/index.html`), "Removed duplicate must not have a second indexable HTML page");
  for (const from of [`/article/${source}`, articlePublicHref(source)]) {
    const rule = redirects.filter((item) => item.source === from);
    assert.equal(rule.length, 1);
    assert.equal(rule[0].destination, destination);
    assert.equal(rule[0].permanent, true);
    assert.ok(!redirects.some((item) => item.source === destination), "Consolidation must not create a redirect chain");
  }
}
for (const route of ["health", "day-care", "home-care", "guides/day-care", "article/article7"]) {
  const document = parseHTML(fs.readFileSync(`dist/${route}/index.html`, "utf8")).document;
  assert.equal(document.querySelectorAll('a[href="/article/article43"]').length, 0, `${route}: no duplicate links`);
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute("href"), `https://www.suiyuecare.com/${route}`, `${route}: preserve the absolute canonical URL`);
  if (["day-care", "home-care"].includes(route)) {
    assert.ok(document.querySelector('[data-service-topic-reading] a[href^="/article/"]'), `${route}: related reading is present before JavaScript`);
    assert.equal(document.querySelectorAll(".service-contact-section form").length, 1, `${route}: inquiry form retained`);
  }
}
const homeDocument = parseHTML(fs.readFileSync("dist/index.html", "utf8")).document;
const manifestJson = homeDocument.querySelector("#publicTopicArticleManifest").textContent;
const publishedCards = JSON.parse(manifestJson);
assert.equal(publishedCards.length, 7, "Only the cards used by the guide and service reading are serialized");
assert.ok(publishedCards.every((item) => !Object.hasOwn(item, "content")), "The card manifest must not preload full article bodies");
const appSource = fs.readFileSync("app.js", "utf8");
const topicHelper = appSource.slice(appSource.indexOf("let publishedTopicArticleSeed = null;"), appSource.indexOf('function categorySlug(value = "")'));
let runtimeCards = [publishedCards.find((item) => item.publicNumber === 7)];
const context = vm.createContext({
  document: { querySelector: () => ({ textContent: manifestJson }) },
  mergeLatestPublicContent, consolidatePublicArticles, getHealthArticleList: () => runtimeCards
});
vm.runInContext(`${topicHelper}\nglobalThis.getTopicArticles = getTopicArticleList;`, context);
assert.equal(context.getTopicArticles().length, 7, "A partial runtime inventory must preserve the published reading cards");
runtimeCards = [{ ...runtimeCards[0], title: "Newer published card", updatedAt: "2099-01-01T00:00:00Z" }];
assert.equal(context.getTopicArticles().find((item) => item.publicNumber === 7).title, "Newer published card", "A newer runtime revision may update the published card");
let pendingFees = true, anchorScrolls = 0, anchorLayouts = 0;
const precedingSection = { style: {}, compareDocumentPosition: () => 4, contains: () => false };
const followingSection = { style: {}, compareDocumentPosition: () => 2, contains: () => false };
const anchorTarget = { style: {}, getBoundingClientRect: () => { anchorLayouts += 1; }, scrollIntoView: () => { anchorScrolls += 1; } };
const anchorContext = vm.createContext({
  window: { location: { pathname: "/day-care", hash: "#day-care-service-locations" }, getComputedStyle: () => ({ contentVisibility: "auto" }) },
  document: { getElementById: () => anchorTarget },
  pageView: { getAttribute: () => null, querySelector: () => pendingFees ? {} : null, querySelectorAll: () => [precedingSection, followingSection], contains: () => true },
  routeSlugFromPath: () => "day-care", isKnownRouteSlug: () => false
});
const anchorHelper = appSource.slice(appSource.indexOf('let lastPublicAnchorRoute = "";'), appSource.indexOf('function normalizePublicHref('));
vm.runInContext(`${anchorHelper}\nglobalThis.alignAnchor = scrollToCurrentPageAnchor;`, anchorContext);
assert.equal(anchorContext.alignAnchor(undefined, { once: true }), false, "Do not align the location before fee content stops changing its position");
assert.equal(anchorScrolls, 0);
pendingFees = false;
assert.equal(anchorContext.alignAnchor(undefined, { once: true }), true);
assert.equal(anchorScrolls, 1);
assert.equal(precedingSection.style.contentVisibility, "visible", "Resolve estimated heights before the target before scrolling");
assert.equal(followingSection.style.contentVisibility, undefined, "Retain rendering optimization after the anchor");
assert.equal(anchorLayouts, 1);
anchorContext.alignAnchor(undefined, { once: true });
assert.equal(anchorScrolls, 1, "Later hydration observations must not repeatedly pull the visitor back to the anchor");
const guide = parseHTML(fs.readFileSync("dist/guides/day-care/index.html", "utf8")).document;
assert.equal(guide.querySelectorAll("#pageView h1").length, 1);
assert.equal(guide.querySelector('link[rel="canonical"]').getAttribute("href"), "https://www.suiyuecare.com/guides/day-care");
assert.ok(!guide.querySelector('meta[name="robots"]').getAttribute("content").includes("noindex"));
assert.ok(sitemap.includes("<loc>https://www.suiyuecare.com/guides/day-care</loc>"));
for (const link of guide.querySelectorAll('#pageView a[href^="#"]')) assert.ok(guide.getElementById(link.getAttribute("href").slice(1)), "Guide section links must resolve");
console.log("PASS: stable article identities, one-hop consolidation, canonical sitemap, crawlable topic guide and service reading links");
