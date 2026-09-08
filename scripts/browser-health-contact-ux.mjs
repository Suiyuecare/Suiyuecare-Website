import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadPublicContent } from "./load-public-content.mjs";
import { getUniqueHealthTopics } from "../health-topic-navigation.mjs";

const origin = process.env.QA_ORIGIN || "http://localhost:4183";
assert.ok(/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin), "Fixture submissions are only allowed against a local preview.");
const output = path.resolve("output/ux-345");
fs.mkdirSync(output, { recursive: true });
const results = [];
const content = await loadPublicContent();
const expectedTopics = getUniqueHealthTopics(content.categories, content.articles).map((topic) => topic.name).sort();
function browser(...args) {
  const result = JSON.parse(execFileSync("agent-browser", ["--session", "ux-health-contact", "--json", ...args], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024, timeout: 45000 }));
  assert.ok(result.success, JSON.stringify(result.error));
  return result.data;
}
const evaluate = (script) => browser("eval", script).result;
function open(route) {
  const [pathname, query = ""] = route.split("?");
  const staticPath = /^\/(?:health|search|contact)$/.test(pathname) || /^\/(?:article|care-story|master-talk)\/[^/]+$/.test(pathname)
    ? `${pathname}/`
    : pathname;
  browser("open", `${origin}${staticPath}${query ? `?${query}` : ""}`);
  browser("wait", "--fn", "document.documentElement.dataset.appReady === 'true' && document.querySelector('#pageView')?.getAttribute('aria-busy') !== 'true'");
}
const screenshot = (name) => browser("screenshot", path.join(output, name));
const overflow = () => evaluate("document.documentElement.scrollWidth > innerWidth");
const hydrationState = () => evaluate(`({
  ...window.__publicContentHydration,
  final: (() => {
    const root = document.querySelector('#pageView > [data-public-layout]');
    return root ? {
      layout: root.dataset.publicLayout || '',
      revision: root.dataset.healthContentRevision || root.dataset.publicContentUpdatedAt || '',
      category: root.dataset.healthCategory || ''
    } : null;
  })()
})`);

// The route remains intercepted for the whole run; no email or CMS mutation is made.
browser("open", "--init-script", path.resolve("scripts/browser-public-content-init.js"));
browser("open", origin);
browser("network", "route", "**/api/send-email", "--abort");
browser("network", "route", "https://ussnmxdpxeoshlrdchov.supabase.co/**", "--abort");
for (const width of [1440, 1024, 390]) {
  browser("set", "viewport", String(width), "900");
  open("/health");
  browser("wait", ".health-common-needs");
  const summary = evaluate(`({ common: document.querySelectorAll('.health-common-needs a').length, topics: Array.from(document.querySelectorAll('.health-topic-list a'), a => ({ text: a.textContent, href: a.getAttribute('href') })), open: document.querySelector('.health-all-topics').open })`);
  assert.equal(summary.common, 7);
  assert.equal(summary.open, false);
  assert.equal(summary.topics.length, new Set(summary.topics.map((item) => item.text)).size);
  assert.deepEqual(summary.topics.map((topic) => topic.text).sort(), expectedTopics, "Static and hydrated topic navigation must agree.");
  assert.ok(summary.topics.length > 40);
  assert.equal(overflow(), false);
  const baseHydration = hydrationState();
  assert.equal(baseHydration.initial?.layout, "health-unified-v1");
  assert.equal(baseHydration.final?.layout, "health-unified-v1");
  assert.equal(baseHydration.initial?.revision, baseHydration.final?.revision);
  assert.equal(baseHydration.directChildMutations, 0, "Unchanged /health data must preserve the prerendered DOM.");
  const boardLayout = evaluate(`(() => {
    const feature = document.querySelector('.health-feature')?.getBoundingClientRect();
    const ranking = document.querySelector('.ranking-panel')?.getBoundingClientRect();
    return feature && ranking ? { featureTop: feature.top, featureRight: feature.right, featureBottom: feature.bottom, rankingTop: ranking.top, rankingLeft: ranking.left } : null;
  })()`);
  assert.ok(boardLayout);
  if (width > 900) {
    assert.ok(Math.abs(boardLayout.featureTop - boardLayout.rankingTop) < 2, `Health feature and latest panel must share a row at ${width}px.`);
    assert.ok(boardLayout.featureRight <= boardLayout.rankingLeft + 1);
  } else {
    assert.ok(boardLayout.rankingTop >= boardLayout.featureBottom - 1);
  }
  screenshot(`health-${width}.png`);
  browser("focus", ".health-all-topics summary");
  browser("press", "Enter");
  assert.equal(evaluate("document.querySelector('.health-all-topics').open"), true);
  assert.equal(overflow(), false);
  screenshot(`health-topics-${width}.png`);
  const careTopic = summary.topics.find((topic) => topic.text === "照顧技巧");
  assert.ok(careTopic);
  open(careTopic.href);
  browser("wait", ".health-category-results");
  const category = evaluate(`({title: document.querySelector('#health-latest-title').textContent, count: document.querySelector('.health-category-results .health-section-head > span').textContent, links: Array.from(document.querySelectorAll('.health-category-results a[href^="/article/"]'), a=>a.href), active: document.querySelectorAll('.health-topic-list [aria-current="page"]').length, boards: document.querySelectorAll('.health-board').length})`);
  assert.equal(category.links.length, Number(category.count.match(/\d+/)[0]));
  assert.equal(category.links.length, new Set(category.links).size);
  assert.ok(category.links.length > 6, "Category view must include more than just the old featured cards.");
  assert.equal(category.active, 1);
  assert.equal(category.boards, 0);
  assert.equal(overflow(), false);
  const categoryHydration = hydrationState();
  assert.equal(categoryHydration.initial?.layout, "health-unified-v1");
  assert.equal(categoryHydration.initial?.categoryPending, true);
  assert.equal(categoryHydration.final?.layout, "health-unified-v1");
  assert.equal(categoryHydration.final?.category, new URL(careTopic.href, origin).searchParams.get("category"));
  assert.ok(categoryHydration.directChildMutations <= 1, "A category route may replace the hidden base prerender at most once.");
  screenshot(`health-category-${width}.png`);
  open("/contact");
  browser("wait", "#contact-page-form");
  assert.equal(overflow(), false);
  const form = evaluate(`({ forms: document.querySelectorAll('.page.active .contact-form').length, phone: document.querySelector('.contact-phone-link').getAttribute('href'), fields: Array.from(document.querySelectorAll('#contact-page-form input:not([type="hidden"]):not([name="_honey"]), #contact-page-form select, #contact-page-form textarea'), input=>({name:input.name,font:parseFloat(getComputedStyle(input).fontSize),height:input.getBoundingClientRect().height})), helper: getComputedStyle(document.querySelector('.milk-helper')).position })`);
  assert.equal(form.forms, 1);
  assert.equal(form.phone, "tel:0266045432");
  assert.ok(form.fields.every((field) => field.font >= 16 && field.height >= 44));
  assert.equal(form.helper, "relative");
  screenshot(`contact-${width}.png`);
  results.push({ width, common: summary.common, topics: summary.topics.length, categoryArticles: category.links.length, baseDomReplacements: baseHydration.directChildMutations, categoryDomReplacements: categoryHydration.directChildMutations, noOverflow: true, contactInputSize: true, helperDoesNotCoverForm: true });
  console.log(`Desktop/mobile health and contact layout passed at ${width}px.`);
}

open("/search?q=%25");
browser("wait", ".search-page");
assert.equal(evaluate("document.querySelector('.search-page input[name=q]').value"), "%");

open("/article/article145");
browser("wait", ".article-cta [data-contact-need]");
const intent = evaluate("({need:document.querySelector('.article-cta [data-contact-need]').dataset.contactNeed,message:document.querySelector('.article-cta [data-contact-need]').dataset.contactMessage})");
browser("click", ".article-cta [data-contact-need]");
browser("wait", "--url", "**/contact");
browser("wait", "--fn", "document.documentElement.dataset.appReady === 'true'");
assert.equal(evaluate("document.querySelector('#contact-page-form select').value"), intent.need);
assert.equal(evaluate("document.querySelector('#contact-page-form textarea').value"), intent.message);
assert.equal(evaluate("sessionStorage.getItem('suiyuecare_pending_contact_preset')"), null);

open("/article/article99");
const staticArticleHydration = hydrationState();
assert.equal(staticArticleHydration.initial?.layout, "article-unified-v1");
assert.equal(staticArticleHydration.final?.layout, "article-unified-v1");
assert.equal(staticArticleHydration.initial?.revision, staticArticleHydration.final?.revision);
assert.equal(staticArticleHydration.directChildMutations, 0, "An unchanged static-only article must preserve its prerendered DOM.");

open("/article/article149");
assert.equal(hydrationState().final?.layout, "article-unified-v1");
const articleSchema = evaluate(`(() => {
  const graph = JSON.parse(document.querySelector('#structuredData').textContent)['@graph'];
  const article = graph.find((entry) => ['Article', 'BlogPosting'].includes(entry['@type']));
  return {
    headline: article?.headline,
    title: document.querySelector('.article-page h1')?.textContent,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    heroLoading: document.querySelector('.article-hero img')?.loading,
    articleSchemas: graph.filter((entry) => ['Article', 'BlogPosting'].includes(entry['@type'])).length,
    publishedMeta: document.querySelectorAll('meta[property="article:published_time"]').length,
    modifiedMeta: document.querySelectorAll('meta[property="article:modified_time"]').length,
    sectionMeta: document.querySelectorAll('meta[property="article:section"]').length,
    tagMeta: document.querySelectorAll('meta[property="article:tag"]').length,
    robots: document.querySelector('meta[name="robots"]')?.content
  };
})()`);
assert.equal(articleSchema.headline, articleSchema.title);
assert.equal(articleSchema.canonical, "https://www.suiyuecare.com/article/article149");
assert.equal(articleSchema.articleSchemas, 1);
assert.equal(articleSchema.heroLoading, "eager");
assert.equal(articleSchema.publishedMeta, 1);
assert.equal(articleSchema.modifiedMeta, 1);
assert.equal(articleSchema.sectionMeta, 1);
assert.ok(articleSchema.tagMeta > 0);
assert.equal(articleSchema.robots, "index, follow, max-image-preview:large");
assert.equal(overflow(), false);
screenshot("article149-390.png");

open("/contact");
browser("wait", "#contact-page-form");
assert.equal(evaluate(`JSON.parse(document.querySelector('#structuredData').textContent)['@graph'].filter((entry) => ['Article', 'BlogPosting'].includes(entry['@type'])).length`), 0);
  assert.equal(evaluate(`document.querySelectorAll('meta[property^="article:"]').length`), 0);
  browser("select", "#contact-page-form select", intent.need);
  browser("fill", '#contact-page-form input[name="姓名"]', "本機攔截測試");
browser("fill", '#contact-page-form input[name="電話"]', "0900000000");
browser("fill", "#contact-page-form textarea", "這是保留輸入測試，不應寄出。請勿覆蓋。");
browser("click", ".nav-cta");
assert.equal(evaluate("document.querySelector('#contact-page-form textarea').value"), "這是保留輸入測試，不應寄出。請勿覆蓋。");
evaluate(`window.__qaContactPayloads = []; const originalFetch = window.fetch.bind(window); window.fetch = (url, options) => { if (String(url).endsWith('/api/send-email')) window.__qaContactPayloads.push(JSON.parse(options.body)); return originalFetch(url, options); };`);
browser("network", "route", "**/api/send-email", "--abort");
browser("click", '#contact-page-form button[type="submit"]');
browser("wait", "--fn", "document.querySelector('#contact-page-form .contact-form-status').dataset.status === 'error'");
assert.match(evaluate("document.querySelector('#contact-page-form .contact-form-status').textContent"), /填寫內容已保留/);
assert.equal(evaluate("document.querySelector('#contact-page-form textarea').value"), "這是保留輸入測試，不應寄出。請勿覆蓋。");
assert.equal(evaluate("document.querySelector('#contact-page-form input[name=姓名]').value"), "本機攔截測試");
screenshot("contact-failure-preserves-input.png");
browser("network", "unroute", "**/api/send-email");
browser("network", "route", "**/api/send-email", "--body", JSON.stringify({ ok: true, emailSent: true }));
browser("click", '#contact-page-form button[type="submit"]');
browser("wait", "--fn", "document.querySelector('#contact-page-form .contact-form-status').dataset.status === 'success'");
const payloads = evaluate("window.__qaContactPayloads");
assert.deepEqual(browser("errors").errors, [], "No uncaught page errors should occur.");
assert.equal(payloads.length, 2, "Only one request per failed/successful attempt.");
assert.deepEqual(payloads[0], payloads[1]);
assert.equal(payloads[1].subject, intent.need);
assert.equal(payloads[1]._honey, "");
assert.equal(evaluate("document.querySelector('#contact-page-form textarea').value"), "");
screenshot("contact-success-fixture.png");
const report = { checkedAt: new Date().toISOString(), origin, viewports: results, literalPercentSearch: true, articleIntentPreserved: true, pendingPresetConsumedOnce: true, failedSubmitRetainsInput: true, successfulSubmitClearsInput: true, requestCount: payloads.length, transport: "Local browser route fixtures only; send-email aborted or mocked; no real message or CMS write." };
fs.writeFileSync(path.join(output, "health-contact-browser-results.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
browser("close");
