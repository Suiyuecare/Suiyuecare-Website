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
  browser("open", `${origin}${route}`);
  browser("wait", "--fn", "document.documentElement.dataset.appReady === 'true' && document.querySelector('#pageView')?.getAttribute('aria-busy') !== 'true'");
}
const screenshot = (name) => browser("screenshot", path.join(output, name));
const overflow = () => evaluate("document.documentElement.scrollWidth > innerWidth");

// The route remains intercepted for the whole run; no email or CMS mutation is made.
browser("open", origin);
browser("network", "route", "**/api/send-email", "--abort");
for (const width of [1440, 390]) {
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
  const category = evaluate(`({title: document.querySelector('#health-category-title').textContent, count: document.querySelector('.health-category-results .health-section-head p').textContent, links: Array.from(document.querySelectorAll('.health-category-results .health-list-card'), a=>a.href), active: document.querySelectorAll('.health-topic-list [aria-current="page"]').length, boards: document.querySelectorAll('.health-board').length})`);
  assert.equal(category.links.length, Number(category.count.match(/\d+/)[0]));
  assert.equal(category.links.length, new Set(category.links).size);
  assert.ok(category.links.length > 6, "Category view must include more than just the old featured cards.");
  assert.equal(category.active, 1);
  assert.equal(category.boards, 0);
  assert.equal(overflow(), false);
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
  results.push({ width, common: summary.common, topics: summary.topics.length, categoryArticles: category.links.length, noOverflow: true, contactInputSize: true, helperDoesNotCoverForm: true });
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
