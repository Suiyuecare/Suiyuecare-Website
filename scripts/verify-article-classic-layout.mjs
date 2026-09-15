import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { renderPublicArticleLayout } from "../public-content-renderer.mjs";

const html = renderPublicArticleLayout({
  title: "經典照片標題閱讀版型",
  subtitle: "標題與摘要位於主圖上",
  author: "歲悅照顧編輯部",
  publishedAt: "2026-09-08",
  date: "2026.09.08",
  readingMinutes: 10,
  targetAudience: "家庭照顧者",
  tags: ["照顧技巧"],
  category: "護理復能",
  relatedService: "護理復能",
  image: "assets/health3/test-hero.jpg",
  imageAlt: "文章測試主圖",
  imageCaption: "測試圖說",
  summary: ["保留本文重點"],
  warning: { title: "重要提醒", body: "保留提醒內容" },
  content: "## 第一段\n\n保留文章正文。",
  faq: [{ question: "保留常見問題？", answer: "保留答案。" }],
  cta: "需要協助時可以聯絡歲悅。",
  ctaText: "預約照顧諮詢",
  ctaUrl: "/contact",
  references: [{ citation: "測試參考資料", url: "https://example.com/reference" }]
});

assert.match(html, /<article class="article-page article-page--classic-health /);
assert.doesNotMatch(html, /article-page--reading|article-reading-heading|article-toc|data-article-anchor/);
const document = parseHTML(html).document;
assert.equal(document.querySelectorAll("h1").length, 1);
assert.equal(document.querySelector(".article-hero figcaption h1").textContent, "經典照片標題閱讀版型");
assert.ok(document.querySelector("h1").closest("figure"), "Classic title must be inside the photograph caption");
assert.equal(document.querySelectorAll(".article-heading, .health-publication-header").length, 0, "The article must not retain the media masthead or detached title");
assert.equal(document.querySelector(".article-hero figure img").getAttribute("alt"), "文章測試主圖");
assert.equal(document.querySelector(".article-hero-photo-caption").textContent, "測試圖說");
for (const contentKind of ["care-story", "master-talk"]) {
  const originalKind = parseHTML(renderPublicArticleLayout({ contentKind, title: "保留其他內容版型", image: "assets/test.jpg" })).document;
  assert.equal(originalKind.querySelectorAll(".article-page--classic-health").length, 0);
  assert.equal(originalKind.querySelector(".article-hero figcaption h1").textContent, "保留其他內容版型");
}

const hero = document.querySelector(".article-hero").outerHTML;
assert.doesNotMatch(hero, /article-meta/);
assert.equal(document.querySelectorAll(".article-meta").length, 1);
assert.ok(document.querySelector(".article-meta").closest(".article-main"), "Byline and dates follow the hero inside the main column");
assert.ok(document.querySelector(".article-layout > .article-ads"), "Classic sidebar must remain beside the main column");
assert.equal(document.querySelectorAll(".health-publication-header h1").length, 0, "Publication branding must not add a second h1");
assert.match(html, /適合｜家庭照顧者/);
assert.match(html, /保留本文重點/);
assert.match(html, /保留提醒內容/);
assert.match(html, /保留文章正文/);
assert.match(html, /保留常見問題/);
assert.match(html, /測試參考資料/);
assert.match(html, /data-contact-need="護理復能諮詢"/);
assert.match(html, /data-contact-message="我想了解護理復能諮詢，剛閱讀了〈經典照片標題閱讀版型〉。"/);

console.log("ok - classic photo-caption article layout preserves content, editorial identity, contact context, and other content kinds");
