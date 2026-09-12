import { consolidatePublicArticles } from "../article-consolidation.mjs";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {
  addSameKindRelated,
  normalizeCmsPublicArticle,
  normalizePublicCareStory,
  normalizePublicExpertTalk,
  normalizeStaticPublicArticle
} from "../public-content-adapters.mjs";
import { dementiaSeriesArticles } from "../dementia-series-articles.mjs";
import { strokeSeriesArticles } from "../stroke-series-articles.mjs";
import { sarcopeniaSeriesArticles } from "../sarcopenia-series-articles.mjs";
import { dailyArticles } from "../daily-articles/index.mjs";
import { mergeLatestPublicContent } from "../public-content-freshness.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const appSourcePath = path.join(rootDir, "app.js");
const snapshotPath = path.join(rootDir, "public", "cms-fallbacks.json");

function sourceSection(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`Unable to locate static article source section: ${startMarker} -> ${endMarker}`);
  }
  return source.slice(start, end);
}

function slugFromHref(value = "") {
  return String(value || "").match(/\/article\/([^?#/]+)/)?.[1] || "";
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function loadStaticArticleState() {
  const source = fs.readFileSync(appSourcePath, "utf8");
  const sections = [
    sourceSection(source, "const articlePages = {", "let staticArticleRewritePackPromise = null;"),
    sourceSection(source, "const healthArticles = [", "const additionalHealthArticles = ["),
    sourceSection(source, "const additionalHealthArticles = [", "const careworkerHardshipArticles = ["),
    sourceSection(source, "const careworkerHardshipArticles = [", "const health30ArticlePack = ["),
    sourceSection(source, "const health30ArticlePack = [", "let supabaseHealthArticles = [];")
  ];
  const sandbox = {};
  vm.createContext(sandbox);
  const code = `
    const articleHref = (slug) => \`/article/\${slug}\`;
    ${sections.join("\n")}
    globalThis.__staticArticleState = { articlePages, healthArticles, health30ArticlePack };
  `;
  new vm.Script(code, { filename: "app.static-articles.js" }).runInContext(sandbox, { timeout: 5_000 });
  return sandbox.__staticArticleState;
}


export async function loadPublicContent() {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error("public/cms-fallbacks.json is missing. Run pnpm cms:fallbacks:sync before building.");
  }
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  const staticState = loadStaticArticleState();
  const rewriteModule = await import("../article-rewrites.js");
  const rewrites = Object.fromEntries(Object.entries(rewriteModule.default || {}).map(([slug, rewrite]) => [
    slug,
    { ...rewrite, contentRevision: "2026-07-10-full-rewrite" }
  ]));
  const staticDetails = { ...staticState.articlePages };
  dementiaSeriesArticles.forEach((article) => {
    staticDetails[article.slug] = { ...(staticDetails[article.slug] || {}), ...article };
  });
  strokeSeriesArticles.forEach((article) => {
    staticDetails[article.slug] = { ...(staticDetails[article.slug] || {}), ...article };
  });
  sarcopeniaSeriesArticles.forEach((article) => {
    staticDetails[article.slug] = { ...(staticDetails[article.slug] || {}), ...article };
  });
  dailyArticles.forEach((article) => {
    staticDetails[article.slug] = { ...(staticDetails[article.slug] || {}), ...article };
  });
  Object.entries(rewrites).forEach(([slug, rewrite]) => {
    staticDetails[slug] = { ...(staticDetails[slug] || {}), ...rewrite };
  });
  Object.entries(rewriteModule.health30ArticleEnhancements || {}).forEach(([slug, rewrite]) => {
    staticDetails[slug] = { ...(staticDetails[slug] || {}), ...rewrite };
  });

  const staticCards = [
    ...dailyArticles.map((article) => ({
      slug: article.slug,
      href: `/article/${article.slug}`,
      category: article.category,
      title: article.title,
      subtitle: article.tags.slice(0, 2).join("・"),
      excerpt: article.excerpt,
      image: article.image,
      imageAlt: article.imageAlt,
      imageCaption: article.imageCaption,
      author: article.author,
      date: article.date,
      readingMinutes: article.readingMinutes,
      tags: article.tags,
      keywords: article.keywords
    })),
    ...sarcopeniaSeriesArticles.map((article) => ({
      slug: article.slug,
      href: `/article/${article.slug}`,
      category: article.category,
      title: article.title,
      subtitle: article.tags.slice(0, 2).join("・"),
      excerpt: article.excerpt,
      image: article.image,
      imageAlt: article.imageAlt,
      author: article.author,
      date: article.date,
      readingMinutes: article.readingMinutes,
      tags: article.tags,
      keywords: article.keywords
    })),
    ...strokeSeriesArticles.map((article) => ({
      slug: article.slug,
      href: `/article/${article.slug}`,
      category: article.category,
      title: article.title,
      subtitle: article.tags.slice(0, 2).join("・"),
      excerpt: article.excerpt,
      image: article.image,
      imageAlt: article.imageAlt,
      author: article.author,
      date: article.date,
      readingMinutes: article.readingMinutes,
      tags: article.tags,
      keywords: article.keywords
    })),
    ...dementiaSeriesArticles.map((article) => ({
      slug: article.slug,
      href: `/article/${article.slug}`,
      category: article.category,
      title: article.title,
      subtitle: article.dek,
      excerpt: article.excerpt,
      image: article.image,
      imageAlt: article.imageAlt,
      author: article.author,
      date: article.date,
      readingMinutes: article.readingMinutes,
      tags: article.tags,
      keywords: article.keywords
    })),
    ...staticState.healthArticles
  ];
  list(rewriteModule.elderDiseaseLazyPackArticles).forEach((card) => {
    if (!staticCards.some((item) => (item.slug || slugFromHref(item.href)) === card.slug)) {
      staticCards.push({ ...card, href: `/article/${card.slug}` });
    }
    if (!staticDetails[card.slug]) {
      staticDetails[card.slug] = {
        category: card.category,
        title: card.title,
        dek: card.excerpt,
        image: card.image,
        author: card.author,
        date: card.date,
        tags: String(card.keywords || "").split(/\s+/).filter(Boolean),
        summary: [card.excerpt],
        content: [["本文重點", card.excerpt]]
      };
    }
  });

  const staticItems = staticCards
    .map((card) => {
      const slug = card.slug || slugFromHref(card.href);
      return slug ? normalizeStaticPublicArticle({ ...card, slug }, staticDetails[slug] || {}, rewrites[slug] || {}) : null;
    })
    .filter(Boolean);
  const enabledCategoryIds = new Set(list(snapshot.articleCategories)
    .filter((category) => category.is_enabled !== false)
    .map((category) => category.id));
  const publishedCmsArticles = list(snapshot.articles).filter((row) =>
    row.status === "published"
      && row.is_enabled !== false
      && (!row.category_id || enabledCategoryIds.has(row.category_id))
  );
  const cmsItems = publishedCmsArticles.map((row) => normalizeCmsPublicArticle(row, {
    media: snapshot.media,
    categories: snapshot.articleCategories,
    staticDetails,
    rewrites
  }));
  const articleItems = consolidatePublicArticles(mergeLatestPublicContent(staticItems, cmsItems));
  const invalidArticle = articleItems.find((item) => !item.publicNumber || !item.publicSlug);
  if (invalidArticle) {
    throw new Error(`Published article is missing a stable public number: ${invalidArticle.slug}`);
  }

  const storyItems = list(snapshot.careStories)
    .filter((row) => row.status === "published" && row.is_enabled !== false)
    .map((row) => normalizePublicCareStory(row, { media: snapshot.media }));
  const talkItems = list(snapshot.expertTalks)
    .filter((row) => row.status === "published" && row.is_enabled !== false)
    .map((row) => normalizePublicExpertTalk(row, { media: snapshot.media }));
  const allItems = addSameKindRelated([...articleItems, ...storyItems, ...talkItems]);
  const allByHref = new Map(allItems.map((item) => [item.href, item]));

  return {
    snapshot,
    articles: articleItems.map((item) => allByHref.get(item.href)),
    stories: storyItems.map((item) => allByHref.get(item.href)),
    talks: talkItems.map((item) => allByHref.get(item.href)),
    items: allItems,
    categories: list(snapshot.articleCategories).filter((item) => item.is_enabled !== false)
  };
}
