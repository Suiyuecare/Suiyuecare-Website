import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { COMMON_HEALTH_NEEDS, getUniqueHealthTopics, resolveHealthTopic, articleMatchesHealthTopic, normalizeHealthTopic, renderHealthTopicNavigation } from "../health-topic-navigation.mjs";
import { CONTACT_NEED_GROUPS, renderContactPage, renderContactNeedOptions, contactSubmissionErrorMessage } from "../contact-page.mjs";
import { normalizePublicAssetUrl, renderPublicArticleLayout, renderPublicHealthIndex } from "../public-content-renderer.mjs";
import { renderArticleSlideDeck } from "../article-slide-deck.js";
import {
  addSameKindRelated,
  authoritativePublicItem,
  authoritativePublicRows,
  normalizeCmsPublicArticle,
  normalizePublicCareStory,
  normalizePublicExpertTalk,
  normalizeStaticPublicArticle
} from "../public-content-adapters.mjs";
import { ARTICLE_SOURCE_SLUGS, articlePublicHref, articlePublicNumber, articlePublicSlug, resolveArticlePublicIdentity } from "../article-url-map.mjs";
import articleRewritePack, { elderDiseaseLazyPackArticles, health30ArticleEnhancements } from "../article-rewrites.js";
import { dementiaSeriesArticles } from "../dementia-series-articles.mjs";
import { strokeSeriesArticles } from "../stroke-series-articles.mjs";
import { sarcopeniaSeriesArticles } from "../sarcopenia-series-articles.mjs";
import { dailyArticles } from "../daily-articles/index.mjs";
import { mergeLatestPublicContent, publicContentKey, publicContentPublishedTime, publicContentRevisionTime } from "../public-content-freshness.mjs";
import { publicStructuredDataJson } from "../public-route-structured-data.mjs";
import { loadPublicContent } from "./load-public-content.mjs";

const countMatches = (value, pattern) => (String(value).match(pattern) || []).length;

function firstHeadingAfter(html, marker, tagName) {
  const start = html.indexOf(marker);
  assert.notEqual(start, -1, `Missing ${marker}`);
  const match = html.slice(start).match(new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`));
  assert.ok(match, `Missing first ${tagName} after ${marker}`);
  return match[1];
}

function assertUnifiedHealthRoot(html, expectedCategory = "") {
  assert.equal(countMatches(html, /data-public-layout="health-unified-v1"/g), 1);
  assert.equal(countMatches(html, /data-public-content-index="health"/g), 1);
  assert.equal(countMatches(html, /data-health-design="editorial-20260909"/g), 1);
  assert.match(html, new RegExp(`data-health-category="${expectedCategory}"`));
  assert.doesNotMatch(html, /health-board--prerendered|health-quick-grid/);
}

function healthContentRevision(html) {
  const revision = String(html).match(/data-health-content-revision="([^"]+)"/)?.[1] || "";
  assert.ok(revision, "Health index must expose a non-empty content revision");
  return revision;
}

function sourceSection(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `Unable to locate app source section: ${startMarker}`);
  return source.slice(start, end);
}

function sourceFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Unable to locate app function ${name}`);
  const parametersStart = source.indexOf("(", start);
  let parameterDepth = 0;
  let parametersEnd = -1;
  for (let index = parametersStart; index < source.length; index += 1) {
    if (source[index] === "(") parameterDepth += 1;
    if (source[index] === ")") {
      parameterDepth -= 1;
      if (parameterDepth === 0) {
        parametersEnd = index;
        break;
      }
    }
  }
  assert.notEqual(parametersEnd, -1, `Unable to find parameters for app function ${name}`);
  const bodyStart = source.indexOf("{", parametersEnd);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unable to find closing brace for app function ${name}`);
}

function loadRuntimeStaticState(appSource) {
  const sections = [
    sourceSection(appSource, "const articlePages = {", "let staticArticleRewritePackPromise = null;"),
    sourceSection(appSource, "const healthArticles = [", "const additionalHealthArticles = ["),
    sourceSection(appSource, "const additionalHealthArticles = [", "const careworkerHardshipArticles = ["),
    sourceSection(appSource, "const careworkerHardshipArticles = [", "const health30ArticlePack = ["),
    sourceSection(appSource, "const health30ArticlePack = [", "let supabaseHealthArticles = [];")
  ];
  const sandbox = { articlePublicHref };
  vm.createContext(sandbox);
  new vm.Script(`
    const articleHref = (slug, publicNumber = null) => articlePublicHref(slug, publicNumber);
    ${sections.join("\n")}
    globalThis.__runtimeStaticState = { articlePages, healthArticles, health30ArticlePack };
  `, { filename: "app.runtime-static-inventory.js" }).runInContext(sandbox, { timeout: 5_000 });
  return sandbox.__runtimeStaticState;
}

function installRuntimeStaticPacks(state) {
  const articleRewriteFields = {};
  const existingSlugs = new Set(state.healthArticles.map((article) => article.slug).filter(Boolean));
  const lazyPackArticles = structuredClone(elderDiseaseLazyPackArticles)
    .filter((article) => article?.slug && !existingSlugs.has(article.slug))
    .map((article) => ({
      ...article,
      href: article.href || articlePublicHref(article.slug),
      keywords: article.keywords || article.category || ""
    }));
  state.healthArticles.push(...lazyPackArticles);
  Object.assign(state.articlePages, Object.fromEntries(lazyPackArticles.map((article) => [
    article.slug,
    {
      category: article.category,
      title: article.title,
      dek: article.excerpt,
      image: article.image,
      author: article.author,
      date: article.date,
      tags: String(article.keywords || "").split(" ").filter(Boolean),
      summary: [article.excerpt],
      content: [["文章內容更新中", article.excerpt]]
    }
  ])));

  const installSeries = (source, subtitle) => {
    const articles = structuredClone(source);
    articles.forEach((article) => { state.articlePages[article.slug] = article; });
    state.healthArticles.unshift(...articles.map((article) => ({
      ...article,
      href: articlePublicHref(article.slug),
      subtitle: subtitle(article)
    })));
  };
  installSeries(dementiaSeriesArticles, (article) => article.dek);
  installSeries(strokeSeriesArticles, (article) => article.tags.slice(0, 2).join("・"));
  installSeries(sarcopeniaSeriesArticles, (article) => article.tags.slice(0, 2).join("・"));
  installSeries(dailyArticles, (article) => article.tags.slice(0, 2).join("・"));

  Object.entries(structuredClone(articleRewritePack)).forEach(([slug, rewrite]) => {
    articleRewriteFields[slug] = { ...rewrite, contentRevision: "2026-07-10-full-rewrite" };
    if (state.articlePages[slug]) Object.assign(state.articlePages[slug], rewrite, { contentRevision: "2026-07-10-full-rewrite" });
  });
  state.health30ArticlePack.forEach((article) => {
    Object.assign(article, structuredClone(health30ArticleEnhancements[article.slug] || {}));
    article.contentRevision = article.contentRevision || "2026-07-10-full-rewrite";
    if (state.articlePages[article.slug]) Object.assign(state.articlePages[article.slug], article);
  });
  return articleRewriteFields;
}

function loadRuntimeArticleNormalizers(appSource, state, articleRewriteFields) {
  const sandbox = {
    articlePages: state.articlePages,
    articleRewriteFields,
    resolveArticlePublicIdentity,
    normalizeCmsPublicArticle,
    normalizeStaticPublicArticle
  };
  vm.createContext(sandbox);
  const functionNames = [
    "categorySlug",
    "getArticleRewriteFields",
    "normalizeSupabaseArticle",
    "normalizeStaticArticle",
    "normalizeFallbackHealthArticles"
  ];
  new vm.Script(`
    ${functionNames.map((name) => sourceFunction(appSource, name)).join("\n")}
    globalThis.__runtimeArticleNormalizers = {
      categorySlug,
      normalizeStaticArticle,
      normalizeFallbackHealthArticles
    };
  `, { filename: "app.runtime-health-normalizers.js" }).runInContext(sandbox, { timeout: 5_000 });
  return sandbox.__runtimeArticleNormalizers;
}

function runtimeFallbackCategories(snapshot, categorySlug) {
  return (snapshot.articleCategories || [])
    .filter((category) => category.is_enabled !== false && category.show_in_nav !== false)
    .map((category) => ({
      id: category.id,
      name: category.display_label || category.name,
      slug: category.slug || categorySlug(category.name),
      type: category.type || "article",
      sectionKey: category.section_key || "health"
    }));
}

function assertUnifiedArticleRoot(item, expectedKind) {
  assert.ok(item, `Missing ${expectedKind} fixture from public content`);
  const html = renderPublicArticleLayout(item, { related: item.related || [] });
  assert.equal(countMatches(html, /data-public-layout="article-unified-v1"/g), 1);
  const root = html.match(/<article\b[^>]*data-public-layout="article-unified-v1"[^>]*>/)?.[0] || "";
  assert.match(root, new RegExp(`data-public-content-type="${expectedKind}"`));
  assert.match(root, /data-public-content-key="[^"]+"/);
  assert.match(root, /data-public-content-revision="v1-[a-f0-9]+"/);
  assert.match(root, /data-public-content-updated-at="[^"]+"/);
}

function publicContentRoute(item) {
  const title = item.seoTitle || `${item.title}｜健康3.0`;
  const description = item.seoDescription || item.excerpt || item.subtitle || "";
  return {
    path: item.href,
    title,
    description,
    image: item.ogImage || item.image,
    imageAlt: item.ogImageAlt || item.imageAlt || item.title,
    canonical: new URL(item.href, "https://www.suiyuecare.com").href,
    type: "article",
    robots: "index, follow, max-image-preview:large",
    article: item,
    breadcrumbParent: {
      name: item.contentKind === "care-story" ? "照顧故事" : item.contentKind === "master-talk" ? "名人講堂" : "健康3.0",
      path: "/health"
    }
  };
}

function renderCompletePublicArticle(item) {
  const slideDeckHtml = item.slides?.length
    ? renderArticleSlideDeck(item, normalizePublicAssetUrl)
    : "";
  return renderPublicArticleLayout(item, {
    related: item.related || [],
    slideDeckHtml
  });
}

function stableJson(value) {
  const normalize = (input) => {
    if (Array.isArray(input)) return input.map(normalize);
    if (!input || typeof input !== "object") return input;
    return Object.fromEntries(Object.keys(input).sort().map((key) => [key, normalize(input[key])]));
  };
  return JSON.stringify(normalize(value));
}

function assertExactText(actual, expected, message) {
  if (actual === expected) return;
  const limit = Math.min(actual.length, expected.length);
  let offset = 0;
  while (offset < limit && actual[offset] === expected[offset]) offset += 1;
  assert.fail(`${message}; first difference at character ${offset}`);
}

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

const latestTitle = "最新發布的測試文章";
const fixtureArticles = [
  {
    contentKind: "article",
    slug: "article901",
    href: "/article/article901",
    category: "測試分類",
    categorySlug: "test",
    title: "較舊但被標示精選的文章",
    subtitle: "舊文章不能因為精選標記排到最新文章前面。",
    image: "/assets/fallbacks/health-article-fallback.jpg",
    author: "歲悅照顧編輯部",
    publishedAt: "2026-08-01T00:00:00+08:00",
    updatedAt: "2026-08-01T00:00:00+08:00",
    date: "2026.08.01",
    isFeatured: true
  },
  {
    contentKind: "article",
    slug: "article902",
    href: "/article/article902",
    category: "測試分類",
    categorySlug: "test",
    title: latestTitle,
    subtitle: "這篇才是最新發布內容。",
    image: "/assets/fallbacks/health-article-fallback.jpg",
    author: "歲悅照顧編輯部",
    publishedAt: "2026-09-08T09:00:00+08:00",
    updatedAt: "2026-09-08T09:00:00+08:00",
    date: "2026.09.08"
  },
  {
    contentKind: "article",
    slug: "article903",
    href: "/article/article903",
    category: "懶人包",
    categorySlug: "lazy-pack",
    title: "測試懶人包",
    image: "/assets/fallbacks/health-article-fallback.jpg",
    publishedAt: "2026-07-03T00:00:00+08:00",
    updatedAt: "2026-07-03T00:00:00+08:00",
    date: "2026.07.03"
  },
  {
    contentKind: "article",
    slug: "article904",
    href: "/article/article904",
    category: "活動專區",
    categorySlug: "activity",
    title: "測試活動",
    image: "/assets/fallbacks/health-article-fallback.jpg",
    publishedAt: "2026-07-02T00:00:00+08:00",
    updatedAt: "2026-07-02T00:00:00+08:00",
    date: "2026.07.02"
  },
  {
    contentKind: "article",
    slug: "article905",
    href: "/article/article905",
    category: "影片",
    categorySlug: "video",
    title: "測試影片",
    image: "/assets/fallbacks/health-article-fallback.jpg",
    publishedAt: "2026-07-01T00:00:00+08:00",
    updatedAt: "2026-07-01T00:00:00+08:00",
    date: "2026.07.01"
  },
  {
    contentKind: "article",
    slug: "article906",
    href: "/article/article906",
    category: "測試分類",
    categorySlug: "test",
    title: latestTitle,
    image: "/assets/fallbacks/health-article-fallback.jpg",
    publishedAt: "2026-01-01T00:00:00+08:00",
    updatedAt: "2026-09-09T00:00:00+08:00",
    date: "2026.01.01"
  }
];
const rawFixtureCategories = [
  { name: "test-internal", display_label: "測試分類", slug: "test" },
  { name: "guide-internal", display_label: "懶人包", slug: "lazy-pack" },
  { name: "event-internal", display_label: "活動專區", slug: "activity" },
  { name: "video-internal", display_label: "影片", slug: "video" }
];
const fixtureTopics = getUniqueHealthTopics(rawFixtureCategories, fixtureArticles);
const baseHealth = renderPublicHealthIndex(fixtureArticles, fixtureTopics);
assertUnifiedHealthRoot(baseHealth);
assert.equal(firstHeadingAfter(baseHealth, '<article class="health-feature">', "h2"), latestTitle);
assert.equal(firstHeadingAfter(baseHealth, '<div class="health-latest-grid">', "h3"), "測試影片");
assert.match(baseHealth, /<section class="health-board"/);
assert.match(baseHealth, /<section class="health-latest "/);
assert.ok(baseHealth.indexOf('class="health-board"') < baseHealth.indexOf('class="health-latest '));
assert.match(baseHealth, /<section class="health-format-hub"/);
assert.equal(countMatches(baseHealth, /class="health-format-grid"/g), 1);
for (const sectionClass of ["health-pack-section", "health-event-section", "health-media-hub"]) assert.doesNotMatch(baseHealth, new RegExp(`<section class="${sectionClass}">`));
assert.match(baseHealth, /共 5 篇/);
for (const item of fixtureArticles) assert.equal(countMatches(baseHealth, new RegExp(`href="${item.href}"`, "g")), 1, `${item.href} must remain crawlable exactly once`);
assert.match(baseHealth, /class="health-archive-index health-superseded-index"[\s\S]*href="\/article\/article906"/, "An older duplicate title must move to the historical index");

const categoryHealth = renderPublicHealthIndex(fixtureArticles, fixtureTopics, { selectedCategorySlug: "test" });
assertUnifiedHealthRoot(categoryHealth, "test");
assert.doesNotMatch(categoryHealth, /class="health-board"/);
assert.match(categoryHealth, /class="health-latest health-category-results"/);
assert.match(categoryHealth, /共 2 篇/);
assert.match(categoryHealth, /href="\/article\/article901"/);
assert.match(categoryHealth, /href="\/article\/article902"/);
assert.doesNotMatch(categoryHealth, /href="\/article\/article90[345]"/);

const rawCategoryHealth = renderPublicHealthIndex(fixtureArticles, rawFixtureCategories);
assert.equal(
  healthContentRevision(rawCategoryHealth),
  healthContentRevision(baseHealth),
  "Raw CMS categories and normalized health topics must produce the same batch revision"
);

const equivalentDateAndImageArticle = {
  contentKind: "article",
  slug: "article906",
  href: "/article/article906",
  category: "測試分類",
  categorySlug: "test",
  title: "日期與圖片路徑正規化測試",
  subtitle: "資料相同時，格式差異不能觸發第二次渲染。",
  image: "assets/foo.jpg",
  author: "歲悅照顧編輯部",
  publishedAt: "2026.09.08",
  updatedAt: "2026.09.08",
  date: "2026.09.08"
};
const dottedRevisionHealth = renderPublicHealthIndex([equivalentDateAndImageArticle], fixtureTopics);
const isoRevisionHealth = renderPublicHealthIndex([{
  ...equivalentDateAndImageArticle,
  image: "/assets/foo.jpg",
  publishedAt: "2026-09-08T00:00:00+08:00",
  updatedAt: "2026-09-08T00:00:00+08:00"
}], fixtureTopics);
assert.equal(
  healthContentRevision(dottedRevisionHealth),
  healthContentRevision(isoRevisionHealth),
  "Equivalent dotted dates, +08 ISO dates, and normalized asset paths must produce the same batch revision"
);

const publicContent = await loadPublicContent();
assert.ok(publicContent.articles.length > 0, "Published article inventory must not be empty");
const fullHealth = renderPublicHealthIndex(publicContent.articles, getUniqueHealthTopics(publicContent.categories, publicContent.articles));
assertUnifiedHealthRoot(fullHealth);
const publicTitleKeys = new Set();
const publicHealthArticles = publicContent.articles
  .map((article, index) => ({ article, index }))
  .sort((left, right) => (publicContentPublishedTime(right.article) || 0) - (publicContentPublishedTime(left.article) || 0) || left.index - right.index)
  .map(({ article }) => article)
  .filter((article) => {
    const key = String(article.title || "").normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("zh-Hant-TW");
    if (!key || !publicTitleKeys.has(key)) {
      if (key) publicTitleKeys.add(key);
      return true;
    }
    return false;
  });
assert.match(fullHealth, new RegExp(`共 ${publicHealthArticles.length} 篇`));
for (const item of publicHealthArticles) {
  assert.ok(fullHealth.includes(`href="${item.href}"`), `Health index dropped ${item.href}`);
}
for (const item of publicContent.articles.filter((article) => !publicHealthArticles.includes(article))) {
  assert.match(fullHealth, new RegExp(`class="health-archive-index health-superseded-index"[\\s\\S]*href="${item.href}"`), `Health index must preserve the historical URL ${item.href}`);
}
assertUnifiedArticleRoot(publicContent.articles[0], "article");
assertUnifiedArticleRoot(publicContent.stories[0], "care-story");
assertUnifiedArticleRoot(publicContent.talks[0], "master-talk");

const runtimeDementiaArticle = dementiaSeriesArticles[0];
const builtDementiaArticle = publicContent.articles.find((item) => item.sourceSlug === runtimeDementiaArticle.slug);
assert.ok(builtDementiaArticle, "Missing a built dementia-series article parity fixture");
const runtimeDementiaRoot = renderPublicArticleLayout({
  ...runtimeDementiaArticle,
  contentKind: "article",
  href: builtDementiaArticle.href,
  publishedAt: runtimeDementiaArticle.date,
  updatedAt: runtimeDementiaArticle.updatedAt
    || runtimeDementiaArticle.lastmod
    || runtimeDementiaArticle.contentRevision
    || runtimeDementiaArticle.date
}).match(/<article\b[^>]*data-public-layout="article-unified-v1"[^>]*>/)?.[0] || "";
const builtDementiaRoot = renderPublicArticleLayout(builtDementiaArticle)
  .match(/<article\b[^>]*data-public-layout="article-unified-v1"[^>]*>/)?.[0] || "";
assert.equal(
  runtimeDementiaRoot.match(/data-public-content-updated-at="([^"]+)"/)?.[1],
  builtDementiaRoot.match(/data-public-content-updated-at="([^"]+)"/)?.[1],
  "A static series article must expose the same revision before and after hydration"
);

const appSource = fs.readFileSync("app.js", "utf8");
const cmsFallbackSource = fs.readFileSync("cms-fallbacks.js", "utf8");
const getArticleSourceBody = sourceFunction(cmsFallbackSource, "getArticleSource");
assert.match(getArticleSourceBody, /article\.status !== "published"[\s\S]*article\.is_enabled === false/, "Fallback detail must reject unpublished or disabled articles");
assert.match(getArticleSourceBody, /published_at[\s\S]*Date\.now\(\)/, "Fallback detail must reject future articles");
assert.match(getArticleSourceBody, /article\.category_id[\s\S]*category\.is_enabled === false/, "Fallback detail must reject missing or disabled categories");
const healthReplacementSandbox = {};
vm.createContext(healthReplacementSandbox);
new vm.Script(`
  ${sourceFunction(appSource, "shouldReplaceHealthView")}
  globalThis.shouldReplaceHealthView = shouldReplaceHealthView;
`).runInContext(healthReplacementSandbox);
const healthView = (category, revision) => ({ dataset: { healthCategory: category, healthContentRevision: revision } });
assert.equal(healthReplacementSandbox.shouldReplaceHealthView(healthView("", "new"), healthView("", "old"), false), false, "Incomplete runtime data must preserve the complete prerender");
assert.equal(healthReplacementSandbox.shouldReplaceHealthView(healthView("", "old"), healthView("", "new"), true), true, "Complete authoritative data may replace a changed base index");
assert.equal(healthReplacementSandbox.shouldReplaceHealthView(healthView("", "same"), healthView("", "same"), true), false, "Equal complete health revisions must not repaint");
assert.equal(healthReplacementSandbox.shouldReplaceHealthView(healthView("", "base"), healthView("dementia", "category"), false), true, "A requested category must replace the base view");

const replacementPageView = {
  innerHTML: "newer prerender",
  current: {
    dataset: {
      publicContentKey: "href:/article/article149",
      publicContentUpdatedAt: "2026-09-10T00:00:00.000Z",
      publicContentRevision: "v1-newer"
    }
  },
  querySelector() { return this.current; }
};
const detailReplacementSandbox = {
  pageView: replacementPageView,
  publicContentKey,
  publicContentRevisionTime
};
vm.createContext(detailReplacementSandbox);
new vm.Script(`
  ${sourceFunction(appSource, "renderPublicContentIfNewer")}
  globalThis.renderPublicContentIfNewer = renderPublicContentIfNewer;
`).runInContext(detailReplacementSandbox);
assert.equal(detailReplacementSandbox.renderPublicContentIfNewer(
  '<article data-public-content-revision="v1-older"></article>',
  { href: "/article/article149", updatedAt: "2026-09-09T00:00:00.000Z" }
), false, "An older async response must preserve newer prerendered DOM and head");
assert.equal(replacementPageView.innerHTML, "newer prerender");
replacementPageView.current.dataset.publicContentUpdatedAt = "2026-09-10T00:00:00.000Z";
assert.equal(detailReplacementSandbox.renderPublicContentIfNewer(
  '<article data-public-content-revision="v1-media-change"></article>',
  { href: "/article/article149", updatedAt: "2026-09-10T00:00:00.000Z" }
), true, "A cover, related, or SEO change at the same row timestamp must be adopted");

for (const name of ["loadArticlePage", "loadCareStoryPage", "loadExpertTalkPage"]) {
  const loaderSource = sourceFunction(appSource, name);
  assert.match(loaderSource, /requestId\s*=\s*publicContentRouteRequestId/, `${name} must accept a navigation token`);
  assert.ok(countMatches(loaderSource, /isActivePublicContentRequest\(/g) >= 3, `${name} must recheck its token after awaits and before writes`);
  assert.match(loaderSource, /const adopted = renderPublicContentIfNewer[\s\S]*if \(adopted\) setRouteSeo/, `${name} must not downgrade head metadata when DOM adoption is rejected`);
}
const renderPageSource = sourceFunction(appSource, "renderPage");
assert.match(renderPageSource, /loadArticlePage\(articleSlug, publicRouteRequestId\)/);
assert.match(renderPageSource, /loadCareStoryPage\(careStorySlug, publicRouteRequestId\)/);
assert.match(renderPageSource, /loadExpertTalkPage\(masterTalkSlug, publicRouteRequestId\)/);

for (const [fetchName, cacheName, fallbackName] of [
  ["fetchCareStoryPage", "careStoryPageCache", "getCareStory"],
  ["fetchExpertTalkPage", "expertTalkPageCache", "getExpertTalk"]
]) {
  const fetchSource = sourceFunction(appSource, fetchName);
  assert.ok(fetchSource.indexOf("liveAuthoritative && !data") < fetchSource.indexOf(`loadCmsFallback("${fallbackName}"`), `${fetchName} must treat live null as authoritative before snapshot fallback`);
  assert.match(fetchSource, new RegExp(`${cacheName}\\.delete\\(slug\\)`));
  assert.match(fetchSource, /transientFailure[\s\S]*throw new Error/, `${fetchName} must distinguish transient failure from authoritative null`);
}
assert.match(sourceFunction(appSource, "loadCareStoryPage"), /await ensurePublishedStoryDatabases\(\)[\s\S]*await fetchCareStoryPage/, "Care-story detail must seed the full same-kind inventory before rendering related cards");
assert.match(sourceFunction(appSource, "loadExpertTalkPage"), /await ensurePublishedStoryDatabases\(\)[\s\S]*await fetchExpertTalkPage/, "Expert-talk detail must seed the full same-kind inventory before rendering related cards");
assert.match(sourceFunction(appSource, "fetchSupabaseArticlePage"), /article\.category_id && !categoryResult\.data[\s\S]*return null/, "A disabled category must hide its CMS detail route");
assert.match(sourceFunction(appSource, "renderHealthRouteOnce"), /staticArticleRewritePackComplete[\s\S]*supabaseHealthArticlesComplete[\s\S]*supabaseArticleCategoriesComplete/, "Health replacement must require complete provenance");
assert.match(sourceFunction(appSource, "setRouteSeo"), /updatePublicStructuredData[\s\S]*article: seo\.article/, "SPA SEO updates must refresh structured data with the canonical item");

const runtimeStaticState = loadRuntimeStaticState(appSource);
const runtimeRewriteFields = installRuntimeStaticPacks(runtimeStaticState);
const runtimeNormalizers = loadRuntimeArticleNormalizers(
  appSource,
  runtimeStaticState,
  runtimeRewriteFields
);
const runtimeStaticArticles = runtimeStaticState.healthArticles.map(runtimeNormalizers.normalizeStaticArticle);
const runtimeSnapshotSource = {
  articles: publicContent.snapshot.articles || [],
  categories: publicContent.snapshot.articleCategories || [],
  media: publicContent.snapshot.media || []
};
const runtimeCmsArticles = runtimeNormalizers.normalizeFallbackHealthArticles(runtimeSnapshotSource);
const runtimeArticles = mergeLatestPublicContent(runtimeStaticArticles, runtimeCmsArticles);
const runtimeCategories = runtimeFallbackCategories(publicContent.snapshot, runtimeNormalizers.categorySlug);
const runtimeHealth = renderPublicHealthIndex(runtimeArticles, runtimeCategories);
assert.equal(runtimeArticles.length, ARTICLE_SOURCE_SLUGS.length, "Merged runtime inventory must cover every public article number");
assert.equal(runtimeCmsArticles.length, publicContent.snapshot.articles.length, "Runtime must normalize every published CMS snapshot article");
assert.equal(runtimeArticles.length, publicContent.articles.length, "Runtime and build health inventories must have the same article count");
assert.deepEqual(
  runtimeArticles.map((item) => item.href),
  publicContent.articles.map((item) => item.href),
  "Runtime and build health inventories must have identical article order"
);
assert.equal(
  healthContentRevision(runtimeHealth),
  healthContentRevision(fullHealth),
  "Runtime and build health inventories must render the same full-inventory revision"
);

const publishedSnapshotRows = (rows = []) => rows.filter((row) =>
  row.status === "published" && row.is_enabled !== false
);
const runtimeStoryItems = publishedSnapshotRows(publicContent.snapshot.careStories || [])
  .map((row) => normalizePublicCareStory(row, { media: publicContent.snapshot.media }));
const runtimeTalkItems = publishedSnapshotRows(publicContent.snapshot.expertTalks || [])
  .map((row) => normalizePublicExpertTalk(row, { media: publicContent.snapshot.media }));
const runtimeItems = addSameKindRelated([...runtimeArticles, ...runtimeStoryItems, ...runtimeTalkItems]);
const runtimeItemsByHref = new Map(runtimeItems.map((item) => [item.href, item]));

assert.equal(publicContent.articles.length, 149, "Every numbered public article must be generated");
assert.equal(publicContent.stories.length, 4, "Every published care story must be generated");
assert.equal(publicContent.talks.length, 3, "Every published expert talk must be generated");
assert.equal(runtimeItems.length, publicContent.items.length, "Runtime and build must expose the same complete detail inventory");

let slideParityCount = 0;
for (const builtItem of publicContent.items) {
  const runtimeItem = runtimeItemsByHref.get(builtItem.href);
  assert.ok(runtimeItem, `Runtime inventory dropped ${builtItem.href}`);
  assert.equal(
    stableJson(runtimeItem),
    stableJson(builtItem),
    `Runtime and build canonical fields diverged for ${builtItem.href}`
  );

  const runtimeHtml = renderCompletePublicArticle(runtimeItem);
  const builtHtml = renderCompletePublicArticle(builtItem);
  assertExactText(runtimeHtml, builtHtml, `Runtime and direct-render HTML diverged for ${builtItem.href}`);

  if (builtItem.slides?.length) {
    slideParityCount += 1;
    assertExactText(
      renderArticleSlideDeck(runtimeItem, normalizePublicAssetUrl),
      renderArticleSlideDeck(builtItem, normalizePublicAssetUrl),
      `Runtime and build slide deck diverged for ${builtItem.href}`
    );
  }

  const runtimeRoute = publicContentRoute(runtimeItem);
  const builtRoute = publicContentRoute(builtItem);
  const runtimeHead = { ...runtimeRoute, article: undefined };
  const builtHead = { ...builtRoute, article: undefined };
  assert.equal(stableJson(runtimeHead), stableJson(builtHead), `Head metadata diverged for ${builtItem.href}`);
  const runtimeJsonLd = publicStructuredDataJson(runtimeRoute);
  const builtJsonLd = publicStructuredDataJson(builtRoute);
  assertExactText(runtimeJsonLd, builtJsonLd, `JSON-LD diverged for ${builtItem.href}`);

  const graph = JSON.parse(builtJsonLd)["@graph"];
  const webpage = graph.find((entry) => entry["@type"] === "WebPage");
  const article = graph.find((entry) => String(entry["@id"] || "").endsWith("#article"));
  assert.equal(webpage.url, builtRoute.canonical, `Canonical URL mismatch for ${builtItem.href}`);
  assert.equal(webpage.name, builtRoute.title, `WebPage title mismatch for ${builtItem.href}`);
  assert.equal(webpage.description, builtRoute.description, `WebPage description mismatch for ${builtItem.href}`);
  assert.equal(article.headline, builtItem.title, `Article headline mismatch for ${builtItem.href}`);
  assert.equal(article.description, builtRoute.description, `Article description mismatch for ${builtItem.href}`);
  assert.equal(article.image[0], new URL(builtRoute.image, "https://www.suiyuecare.com").href, `Article OG image mismatch for ${builtItem.href}`);
  assert.equal(article.dateModified, builtItem.updatedAt || builtItem.publishedAt, `Article modified time mismatch for ${builtItem.href}`);
}
assert.ok(slideParityCount > 0, "Full detail parity must exercise articles with slide decks");

const coverOgFixture = normalizeCmsPublicArticle({
  slug: "article149",
  public_number: 149,
  category_id: "future-category",
  title: "封面與 OG 圖分工測試",
  subtitle: "可見主圖與社群圖不可混用",
  excerpt: "測試封面、SEO 與 CTA 的 canonical 欄位。",
  content: "測試文章內容",
  content_json: { cta_text: "JSON 按鈕" },
  cover_image_id: "cover",
  og_image_id: "og",
  cta_text: "CMS 按鈕",
  published_at: "2026-09-09T08:00:00+08:00",
  updated_at: "2026-09-09T09:00:00+08:00",
  status: "published",
  is_enabled: true
}, {
  categories: [{ id: "future-category", name: "測試分類", display_label: "測試分類", slug: "fixture" }],
  media: [
    { id: "cover", public_url: "assets/fixture-cover.jpg", alt_text: "可見封面替代文字", focal_point: "40% 50%" },
    { id: "og", public_url: "/assets/fixture-og.jpg", alt_text: "社群圖片替代文字" }
  ],
  rewrites: {
    article149: {
      cta: "這是 CTA 說明文字",
      ctaText: "rewrite 按鈕文字"
    }
  }
});
assert.equal(coverOgFixture.image, "/assets/fixture-cover.jpg");
assert.equal(coverOgFixture.imageAlt, "可見封面替代文字");
assert.equal(coverOgFixture.ogImage, "/assets/fixture-og.jpg");
assert.equal(coverOgFixture.ogImageAlt, "社群圖片替代文字");
assert.equal(coverOgFixture.cta, "這是 CTA 說明文字");
assert.equal(coverOgFixture.ctaText, "CMS 按鈕");
const coverOgHtml = renderCompletePublicArticle({ ...coverOgFixture, related: [] });
assert.match(coverOgHtml, /src="\/assets\/fixture-cover\.jpg"/);
assert.doesNotMatch(coverOgHtml, /fixture-og\.jpg/);
assert.match(coverOgHtml, /這是 CTA 說明文字/);
assert.match(coverOgHtml, />CMS 按鈕<\/a>/);
assert.equal(publicContentRoute(coverOgFixture).image, "/assets/fixture-og.jpg");

const fallbackAuthorityRows = [{ slug: "snapshot-item" }];
assert.deepEqual(
  authoritativePublicRows({ liveConfigured: true, liveSucceeded: true, liveRows: [], fallbackRows: fallbackAuthorityRows }),
  [],
  "An authoritative empty live list must not resurrect snapshot rows"
);
assert.deepEqual(
  authoritativePublicRows({ liveConfigured: true, liveSucceeded: false, liveRows: [], fallbackRows: fallbackAuthorityRows }),
  fallbackAuthorityRows,
  "A failed live list may use the complete snapshot"
);
assert.equal(
  authoritativePublicItem({ liveConfigured: true, liveSucceeded: true, liveItem: null, fallbackItem: fallbackAuthorityRows[0] }),
  null,
  "An authoritative live null must not resurrect a cached detail"
);
assert.deepEqual(
  authoritativePublicItem({ liveConfigured: true, liveSucceeded: false, liveItem: null, fallbackItem: fallbackAuthorityRows[0] }),
  fallbackAuthorityRows[0],
  "A failed live detail may use the complete snapshot"
);

assert.equal(countMatches(appSource, /function renderHealthPage\(/g), 1);
const renderHealthPageBody = appSource.match(/function renderHealthPage\([^)]*\)\s*\{([\s\S]*?)\n\}/)?.[1] || "";
assert.match(renderHealthPageBody, /renderPublicHealthIndex\s*\(/);
assert.doesNotMatch(renderHealthPageBody, /return\s*`|health-page|health-board|health-quick-grid/);
if (/function renderLegacyHealthPage\(/.test(appSource)) {
  console.warn("Legacy health renderer is still present in app.js; it is not route-owned and should be removed before release.");
}

if (fs.existsSync("dist/contact/index.html")) {
  assert.match(fs.readFileSync("dist/contact/index.html", "utf8"), /data-public-contact-page/);
}
if (fs.existsSync("dist/health/index.html")) {
  const generatedHealth = fs.readFileSync("dist/health/index.html", "utf8");
  assert.match(generatedHealth, /health-topic-navigation/);
  assert.equal(countMatches(generatedHealth, /data-public-layout="health-unified-v1"/g), 1);
  assert.doesNotMatch(generatedHealth, /health-board--prerendered|health-quick-grid/);
}
console.log("Unified health/article rendering, latest-content order, complete links, and contact form contract verified.");
