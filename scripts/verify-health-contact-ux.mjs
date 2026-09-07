import assert from "node:assert/strict";
import fs from "node:fs";
import { COMMON_HEALTH_NEEDS, getUniqueHealthTopics, resolveHealthTopic, articleMatchesHealthTopic, normalizeHealthTopic, renderHealthTopicNavigation } from "../health-topic-navigation.mjs";
import { CONTACT_NEED_GROUPS, renderContactPage, renderContactNeedOptions, contactSubmissionErrorMessage } from "../contact-page.mjs";

const articles = [
  { category: "失智照顧", categorySlug: "失智照顧" },
  { category: "失智 照顧", categorySlug: "dementia" },
  { category: "居家照顧", categorySlug: "home-care" }
];
const topics = getUniqueHealthTopics([{ name: "失智照顧", slug: "dementia" }, { name: "失智　照顧", slug: "dementia-care" }], articles);
assert.equal(topics.length, 2);
assert.equal(getUniqueHealthTopics([{ name: "CMS 隱藏空分類", show_in_nav: false }]).length, 0);
assert.equal(getUniqueHealthTopics([{ name: "仍有文章的主題", show_in_nav: false }], [{ category: "仍有文章的主題" }]).length, 1);
for (const alias of ["dementia", "dementia-care", "失智照顧"]) {
  const topic = resolveHealthTopic(topics, alias);
  assert.equal(topic.name, "失智照顧");
  assert.equal(articles.filter((article) => articleMatchesHealthTopic(article, topic)).length, 2);
}
assert.equal(normalizeHealthTopic(" ＡＢＣ-照顧 "), normalizeHealthTopic("abc照顧"));
assert.equal(COMMON_HEALTH_NEEDS.length, 7);
const nav = renderHealthTopicNavigation(topics, articles, "dementia-care");
assert.equal((nav.match(/aria-current="page"/g) || []).length, 1);
assert.doesNotMatch(nav, /<details class="health-all-topics" open>/);
assert.match(nav, /目前：失智照顧/);
assert.match(nav, /href="\/search"/);
assert.equal((nav.match(/>失智照顧<\/a>/g) || []).length, 1);
assert.doesNotMatch(renderHealthTopicNavigation([{ name: '<script>alert("x")</script>', slug: '" onclick="evil' }]), /<script>| onclick="evil/);
const form = renderContactPage();
assert.equal((form.match(/<form /g) || []).length, 1);
for (const field of ["form_type", "_subject", "_template", "_captcha", "_honey", "姓名", "電話", "需求", "Email", "說明"]) assert.ok(form.includes(`name="${field}"`), `Missing form field ${field}`);
assert.match(form, /action="\/api\/send-email" method="POST"/);
assert.match(form, /role="status" aria-live="polite" hidden/);
assert.match(form, /href="tel:0266045432"/);
assert.equal((form.match(/ required/g) || []).length, 3);
assert.match(form, /<textarea[^>]*><\/textarea>/);
assert.match(renderContactNeedOptions("日間照顧諮詢"), /<option selected>日間照顧諮詢<\/option>/);
assert.equal(CONTACT_NEED_GROUPS.flatMap(([, options]) => options).length, 15);
assert.match(contactSubmissionErrorMessage(new TypeError("Failed to fetch")), /填寫內容已保留/);
assert.equal(contactSubmissionErrorMessage(new Error("請填寫有效電話")), "請填寫有效電話");

if (fs.existsSync("dist/contact/index.html")) {
  assert.match(fs.readFileSync("dist/contact/index.html", "utf8"), /data-public-contact-page/);
  assert.match(fs.readFileSync("dist/health/index.html", "utf8"), /health-topic-navigation/);
}
console.log("Health topic normalization, aliases, complete navigation, and contact form contract verified.");
