import assert from "node:assert/strict";
import { renderPublicArticleLayout } from "../public-content-renderer.mjs";

const html = renderPublicArticleLayout({
  title: "手機文章上一版版型",
  subtitle: "標題與摘要覆蓋在主圖上",
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

assert.match(html, /<article class="article-page "/);
assert.doesNotMatch(html, /article-page--reading|article-reading-heading|article-toc|data-article-anchor/);
assert.match(html, /<header class="article-hero">[\s\S]*?<figure>[\s\S]*?<img[\s\S]*?<figcaption[\s\S]*?<h1>手機文章上一版版型<\/h1>/);

const hero = html.slice(html.indexOf('<header class="article-hero">'), html.indexOf("</header>") + 9);
assert.doesNotMatch(hero, /article-meta/);
assert.ok(html.indexOf('<div class="article-meta">') > html.indexOf('<div class="article-main">'));
assert.match(html, /適合｜家庭照顧者/);
assert.match(html, /保留本文重點/);
assert.match(html, /保留提醒內容/);
assert.match(html, /保留文章正文/);
assert.match(html, /保留常見問題/);
assert.match(html, /測試參考資料/);
assert.match(html, /data-contact-need="護理復能諮詢"/);
assert.match(html, /data-contact-message="我想了解護理復能諮詢，剛閱讀了〈手機文章上一版版型〉。"/);

console.log("ok - classic article layout restored while content and contact context remain intact");
