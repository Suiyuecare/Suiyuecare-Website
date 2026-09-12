import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import {
  DAY_CARE_GUIDE_ROUTE,
  renderDayCareGuidePage,
  renderServiceTopicReading,
  hydrateServiceTopicReading,
  selectTopicRelatedArticles
} from "../public-topic-guides.mjs";
import { loadPublicContent } from "./load-public-content.mjs";

function documentFrom(html) {
  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document;
}

function articleLinks(html) {
  return [...documentFrom(html).querySelectorAll('a[href^="/article/"]')].map((a) => a.getAttribute("href"));
}

const fixtures = [
  { slug: "daycare-first-week", publicSlug: "article7", href: "/article/article7", title: "適應文章", relatedService: "日間照顧", tags: ["日照", "家屬支持"], date: "2026.05.24" },
  { slug: "longterm-care-apply-checklist-2026", href: "/article/article12", title: "申請準備", category: "懶人包" },
  { slug: "day-care-respite", href: "/article/article29", title: "參觀準備", category: "活動專區", tags: ["日照"] },
  { slug: "day-care-shuttle-handover", href: "/article/article134", title: "接送交接", relatedService: "日間照顧", publishedAt: "2026-09-01" },
  { slug: "day-care-activity-refusal-choice", href: "/article/article138", title: "活動參與", relatedService: "日間照顧", publishedAt: "2026-09-01" },
  { slug: "home-care-time-priority-map", href: "/article/article133", title: "居服時段", relatedService: "居家照顧", tags: ["家屬支持"] },
  { slug: "home-care-staff-change-continuity", href: "/article/article137", title: "人員交接", relatedService: "居家照顧" },
  { slug: "unrelated-latest", href: "/article/article159", title: "最新軟體文章", relatedService: "軟體系統", publishedAt: new Date(Date.now() - 60_000).toISOString() }
];

assert.equal(DAY_CARE_GUIDE_ROUTE.canonical, `https://www.suiyuecare.com${DAY_CARE_GUIDE_ROUTE.path}`);
assert.equal(DAY_CARE_GUIDE_ROUTE.slug, "guides-day-care");
assert.ok(DAY_CARE_GUIDE_ROUTE.title && DAY_CARE_GUIDE_ROUTE.description && DAY_CARE_GUIDE_ROUTE.image);
const guide = documentFrom(renderDayCareGuidePage(fixtures));
assert.equal(guide.querySelectorAll("h1").length, 1);
assert.equal(guide.querySelector("h1").textContent, DAY_CARE_GUIDE_ROUTE.h1);
assert.deepEqual(articleLinks(guide.body.innerHTML), ["/article/article12", "/article/article29", "/article/article7", "/article/article138", "/article/article134"]);
const guideIds = [...guide.querySelectorAll("[id]")].map((node) => node.id);
assert.equal(new Set(guideIds).size, guideIds.length);
for (const anchor of guide.querySelectorAll('a[href^="#"]')) {
  const target = anchor.getAttribute("href").slice(1);
  assert.ok(guide.getElementById(target), `guide fragment must exist: ${target}`);
  assert.doesNotMatch(target, /^(article|care-story|master-talk)-/, "section hashes must not trigger the app's content routes");
}
assert.deepEqual(articleLinks(renderDayCareGuidePage()), [], "empty public inventory must not create article URLs");
assert.deepEqual(articleLinks(renderServiceTopicReading("day-care", [])), []);
assert.equal(renderServiceTopicReading("community", fixtures), "");
assert.equal(renderServiceTopicReading("__proto__", fixtures), "");
assert.deepEqual(articleLinks(renderServiceTopicReading("day-care", fixtures)), ["/article/article29", "/article/article7", "/article/article134"]);
assert.deepEqual(articleLinks(renderServiceTopicReading("home-care", fixtures)), ["/article/article12", "/article/article133", "/article/article137"]);

const badRows = [
  { ...fixtures[0], status: "draft" },
  { ...fixtures[1], is_enabled: false },
  { ...fixtures[2], isEnabled: false },
  { ...fixtures[3], contentKind: "care-story" },
  { ...fixtures[4], href: "javascript:alert(1)" }
];
assert.deepEqual(articleLinks(renderDayCareGuidePage(badRows)), [], "unpublished and unsafe rows must not be linked");
const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
for (const publicationField of ["publishedAt", "published_at"]) {
  const scheduled = { ...fixtures[0], status: "published", [publicationField]: future };
  assert.deepEqual(articleLinks(renderDayCareGuidePage([scheduled])), [], `${publicationField}: do not link a scheduled article before its publication time`);
  assert.equal(renderServiceTopicReading("day-care", [scheduled]), "");
  assert.deepEqual(selectTopicRelatedArticles({ ...fixtures[3], relatedSlugs: ["article7"] }, [scheduled]), []);
}
assert.deepEqual(articleLinks(renderDayCareGuidePage([fixtures[1]])), ["/article/article12"], "legacy articles without publication metadata remain available");
for (const href of ["https://evil.example/article/article7", "//www.suiyuecare.com/article/article7", "/\\evil.example/article/article7", "https://u:p@www.suiyuecare.com/article/article7", "/article/article7/extra", "/article/article7?\nx=1"]) {
  assert.deepEqual(articleLinks(renderDayCareGuidePage([{ ...fixtures[0], href }])), [], href);
}
const escaped = documentFrom(renderDayCareGuidePage([{ ...fixtures[0], title: '<img src=x onerror="alert(1)"> & 作者' }]));
assert.equal(escaped.querySelectorAll("img, script, [onerror]").length, 0);
assert.ok(escaped.querySelector('a[href="/article/article7"]').textContent.includes("<img src=x"));

const current = { ...fixtures[0], relatedSlugs: ["article7", "day-care-activity-refusal-choice", "article138", "missing", "article43"] };
assert.deepEqual(selectTopicRelatedArticles(current, fixtures).map((item) => item.href), ["/article/article138", "/article/article29", "/article/article134"]);
assert.deepEqual(selectTopicRelatedArticles(current, [...fixtures].reverse()).map((item) => item.href), ["/article/article138", "/article/article29", "/article/article134"], "reordering inventory must not change the stable recommendation order");
assert.equal(selectTopicRelatedArticles({ ...fixtures[3], relatedSlugs: ["day-care-transition"] }, fixtures, { limit: 1 })[0]?.href, "/article/article7", "curated references to the consolidated article must reach the retained article");
assert.deepEqual(selectTopicRelatedArticles({ ...fixtures[0], relatedSlugs: ["article159"] }, fixtures, { limit: 1 }).map((item) => item.href), ["/article/article159"], "explicit editorial choices must remain first even across topics");
assert.deepEqual(selectTopicRelatedArticles(current, fixtures, { limit: 0 }), []);
assert.deepEqual(selectTopicRelatedArticles({ slug: "daycare-first-week", relatedSlugs: ["article7"] }, fixtures), [], "exclude self even when only the current identity is available");
assert.deepEqual(selectTopicRelatedArticles({ ...fixtures[1], relatedSlugs: [] }, fixtures), [], "format categories alone must not recommend unrelated articles");
const duplicateInventory = [...fixtures, { ...fixtures[3], href: "https://www.suiyuecare.com/article/article134?from=duplicate#section" }, ...badRows];
assert.equal(selectTopicRelatedArticles(current, duplicateInventory).filter((item) => item.href === "/article/article134").length, 1);
assert.deepEqual(selectTopicRelatedArticles({ ...fixtures[0], href: "javascript:alert(1)" }, fixtures), []);

const dom = documentFrom('<main><div class="one-minute-service-page day-care-page"><section class="intro">原有介紹</section><section class="service-contact-section"><form><input name="姓名" value="尚未送出的資料"><textarea>保留需求</textarea></form></section></div></main>');
const root = dom.querySelector("main");
const form = root.querySelector("form");
const input = form.querySelector("input");
assert.equal(hydrateServiceTopicReading(root, "home-care", fixtures), false, "do not add another service's block");
assert.equal(hydrateServiceTopicReading(root, "day-care", fixtures), true);
assert.equal(hydrateServiceTopicReading(root, "day-care", fixtures), false, "identical hydration must be a no-op");
assert.equal(root.querySelectorAll("[data-service-topic-reading]").length, 1);
assert.equal(root.querySelector(".service-contact-section").previousElementSibling.dataset.serviceTopicReading, "day-care");
assert.equal(root.querySelector("form"), form, "form DOM must survive insertion");
assert.equal(root.querySelector("input"), input, "input node and value must survive insertion");
assert.equal(input.value, "尚未送出的資料");
assert.equal(hydrateServiceTopicReading(root, "day-care", fixtures.filter((item) => item.href !== "/article/article7")), true);
assert.equal(root.querySelector('[data-service-topic-reading] a[href="/article/article7"]'), null, "removed public articles disappear on refresh");
assert.equal(root.querySelector("form"), form);
assert.equal(hydrateServiceTopicReading(root, "day-care", []), true, "remove stale blocks when the published list becomes empty");
assert.equal(root.querySelector("[data-service-topic-reading]"), null);
assert.equal(hydrateServiceTopicReading(root, "day-care", []), false);
assert.equal(root.querySelector("form"), form);
assert.equal(hydrateServiceTopicReading(documentFrom('<main class="article-page"></main>'), "day-care", fixtures), false);

const liveFixture = await loadPublicContent();
const publishedHrefs = new Set(liveFixture.articles.map((item) => item.href));
const rendered = [renderDayCareGuidePage(liveFixture.articles), renderServiceTopicReading("day-care", liveFixture.articles), renderServiceTopicReading("home-care", liveFixture.articles)];
for (const html of rendered) {
  for (const href of articleLinks(html)) assert.ok(publishedHrefs.has(href), `every guide/service article must be in the actual public inventory: ${href}`);
  assert.ok(!articleLinks(html).includes("/article/article43"), "the guide and service selections use article7 as the adaptation page");
}
const firstWeek = liveFixture.articles.find((item) => item.href === "/article/article7");
assert.ok(firstWeek);
const recommended = selectTopicRelatedArticles(firstWeek, liveFixture.articles);
assert.ok(recommended.some((item) => item.href === "/article/article134"), "the actual adaptation article should lead to the shuttle topic");
assert.ok(!recommended.some((item) => item.href === "/article/article159"), "the actual adaptation article must not fall back to software news");
console.log(`Topic guide verification passed: public inventory, escaping, ${liveFixture.articles.length} actual articles, related ranking, fragment targets, and form-preserving idempotent hydration.`);
