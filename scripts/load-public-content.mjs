import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {
  normalizePublicAssetUrl,
  publicDateLabel,
  stripPublicHtml
} from "../public-content-renderer.mjs";

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

function dateIso(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(raw)) return `${raw.replace(/\./g, "-")}T00:00:00+08:00`;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function contentJson(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function videoData(value = {}) {
  const source = contentJson(value);
  const nested = contentJson(source.video);
  const url = source.video_url || nested.url || "";
  const provider = source.video_provider || nested.provider || (String(url).includes("youtu") ? "youtube" : "direct");
  let embedUrl = url;
  if (provider === "youtube" && url) {
    try {
      const parsed = new URL(url);
      const id = parsed.hostname.includes("youtu.be")
        ? parsed.pathname.split("/").filter(Boolean)[0]
        : parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
      if (id) embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
    } catch {
      embedUrl = url;
    }
  }
  if (provider === "vimeo" && url) {
    try {
      const id = new URL(url).pathname.split("/").filter(Boolean).pop();
      if (id) embedUrl = `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
    } catch {
      embedUrl = url;
    }
  }
  return {
    url,
    embedUrl,
    provider,
    type: source.video_type || nested.type || "",
    duration: source.video_duration || nested.duration || "",
    label: source.video_label || nested.label || "",
    caption: source.video_caption || nested.caption || ""
  };
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

function mediaMaps(snapshot) {
  const byId = new Map(list(snapshot.media).map((item) => [item.id, item]));
  const categoriesById = new Map(list(snapshot.articleCategories).map((item) => [item.id, item]));
  return { byId, categoriesById };
}

function staticArticleItem(card, detail, rewrite = {}) {
  const slug = card.slug || slugFromHref(card.href);
  const merged = { ...detail, ...rewrite };
  const publishedAt = dateIso(card.publishedAt || card.date || merged.date);
  const excerpt = card.excerpt || card.subtitle || merged.dek || merged.excerpt || "";
  const tags = list(card.tags).length
    ? list(card.tags)
    : list(merged.tags).length
      ? list(merged.tags)
      : String(card.keywords || merged.keywords || "").split(/\s+/).filter(Boolean);
  return {
    contentKind: "article",
    schemaType: "BlogPosting",
    slug,
    href: `/article/${slug}`,
    category: card.category || merged.category || "照顧知識",
    title: card.title || merged.title || "未命名文章",
    subtitle: card.subtitle || merged.dek || excerpt,
    excerpt,
    image: normalizePublicAssetUrl(card.image || merged.image),
    imageAlt: card.title || merged.title || "健康3.0文章主圖",
    imageUsage: card.imageUsage || "article_cover",
    focalPoint: card.focalPoint || "center",
    author: card.author || merged.author || "歲悅照顧編輯部",
    authorTitle: merged.authorTitle || "",
    date: publicDateLabel(card.date || merged.date || publishedAt),
    publishedAt,
    updatedAt: publishedAt,
    lastmod: publishedAt,
    readingMinutes: card.readingMinutes || merged.readingMinutes || Number.parseInt(merged.readTime, 10) || null,
    difficulty: merged.difficulty || "",
    targetAudience: card.targetAudience || merged.targetAudience || "",
    relatedService: merged.relatedService || "",
    tags,
    summary: list(merged.summary).length ? list(merged.summary) : excerpt ? [excerpt] : [],
    content: merged.content || excerpt,
    inlineImages: list(merged.inlineImages),
    warning: merged.warning,
    checklists: list(merged.checklists),
    tables: list(merged.tables),
    slides: list(merged.slides),
    visualFormat: merged.visualFormat || "",
    faq: list(merged.faq),
    references: list(merged.references),
    cta: merged.cta || "",
    ctaText: merged.ctaText || "",
    ctaUrl: merged.ctaUrl || "",
    sourceName: merged.sourceName || "",
    sourceUrl: merged.sourceUrl || "",
    relatedSlugs: list(merged.relatedSlugs),
    seoTitle: merged.seoTitle || `${card.title || merged.title}｜健康3.0`,
    seoDescription: merged.seoDescription || excerpt,
    ogTitle: merged.ogTitle || card.title || merged.title,
    ogDescription: merged.ogDescription || excerpt,
    isFeatured: Boolean(card.isFeatured)
  };
}

function cmsArticleItem(row, snapshot, staticDetails, rewrites) {
  const { byId, categoriesById } = mediaMaps(snapshot);
  const category = categoriesById.get(row.category_id);
  const cover = byId.get(row.cover_image_id);
  const ogImage = byId.get(row.og_image_id);
  const staticDetail = staticDetails[row.slug] || {};
  const rewrite = rewrites[row.slug] || {};
  const enriched = { ...staticDetail, ...rewrite };
  const json = contentJson(row.content_json);
  const video = videoData(json);
  const publishedAt = row.published_at || row.updated_at || row.created_at;
  const updatedAt = row.updated_at || publishedAt;
  const excerpt = enriched.dek || row.excerpt || row.subtitle || stripPublicHtml(row.content).slice(0, 180);
  return {
    contentKind: "article",
    schemaType: "BlogPosting",
    slug: row.slug,
    href: `/article/${row.slug}`,
    category: category?.display_label || category?.name || enriched.category || "照顧知識",
    title: row.title || enriched.title || "未命名文章",
    subtitle: row.subtitle || enriched.dek || row.excerpt || "",
    excerpt,
    image: normalizePublicAssetUrl(
      ogImage?.public_url ||
      cover?.public_url ||
      enriched.image ||
      json.image_url ||
      json.image
    ),
    imageAlt: ogImage?.alt_text || cover?.alt_text || row.title || "健康3.0文章主圖",
    imageUsage: cover?.image_usage || "article_cover",
    focalPoint: cover?.focal_point || "center",
    author: row.author_name || enriched.author || "歲悅照顧編輯部",
    authorTitle: row.author_title || "",
    date: publicDateLabel(publishedAt),
    publishedAt,
    updatedAt,
    lastmod: updatedAt,
    readingMinutes: row.reading_minutes || enriched.readingMinutes || null,
    difficulty: row.difficulty || "",
    targetAudience: row.target_audience || enriched.targetAudience || "",
    relatedService: row.related_service || "",
    tags: list(row.tags),
    summary: list(enriched.summary).length ? list(enriched.summary) : list(row.summary_points),
    content: enriched.content || row.content || "",
    inlineImages: list(enriched.inlineImages),
    warning: enriched.warning,
    checklists: list(enriched.checklists),
    tables: list(enriched.tables),
    slides: list(enriched.slides).length ? list(enriched.slides) : list(json.slides),
    visualFormat: enriched.visualFormat || json.visual_format || "",
    faq: list(enriched.faq).length ? list(enriched.faq) : list(row.faq_json),
    references: list(enriched.references),
    cta: enriched.cta || "",
    ctaText: row.cta_text || json.cta_text || enriched.ctaText || "",
    ctaUrl: row.cta_url || json.cta_url || enriched.ctaUrl || "",
    sourceName: row.source_name || json.source_name || enriched.sourceName || "",
    sourceUrl: row.source_url || json.source_url || enriched.sourceUrl || "",
    relatedSlugs: list(json.related_slugs),
    videoUrl: video.url,
    videoEmbedUrl: video.embedUrl,
    videoProvider: video.provider,
    videoType: video.type,
    videoDuration: video.duration,
    videoLabel: video.label,
    videoCaption: video.caption,
    seoTitle: row.seo_title || `${row.title}｜健康3.0`,
    seoDescription: row.seo_description || excerpt,
    seoKeywords: list(row.seo_keywords),
    ogTitle: row.og_title || row.title,
    ogDescription: row.og_description || excerpt,
    isFeatured: Boolean(row.is_featured)
  };
}

function careStoryItem(row, snapshot) {
  const { byId } = mediaMaps(snapshot);
  const cover = byId.get(row.cover_image_id);
  const service = row.service_type || "照顧服務";
  const publishedAt = row.published_at || row.updated_at || row.created_at;
  const updatedAt = row.updated_at || publishedAt;
  const praise = row.praise || row.quote || "";
  return {
    contentKind: "care-story",
    schemaType: "Article",
    slug: row.slug,
    href: `/care-story/${row.slug}`,
    category: service,
    title: row.title,
    subtitle: `${row.person_name || "家屬"}｜${row.person_label || "服務回饋"}`,
    excerpt: praise,
    image: normalizePublicAssetUrl(cover?.public_url || row.cover_image_url),
    imageAlt: cover?.alt_text || `${service}家屬回饋`,
    focalPoint: cover?.focal_point || "center",
    author: "歲悅照顧編輯部",
    date: publicDateLabel(publishedAt),
    publishedAt,
    updatedAt,
    lastmod: updatedAt,
    tags: list(row.tags),
    summary: [praise, `${service}不只完成服務，也讓家庭知道每天該留意什麼。`].filter(Boolean),
    content: [
      ["照顧開始前，家庭最需要的是有人把狀況說清楚", `這個故事來自${row.person_name || "家屬"}對${service}的回饋。服務開始前，團隊會先整理家庭最在意的日常問題與交接方式。`],
      ["被稱讚的不是單一動作，而是照顧被接住的感覺", row.story_body || row.quote || praise],
      ["把經驗留下來，下一次照顧才會更穩", "歲悅把服務紀錄、家屬回報與督導追蹤放在同一個流程裡，讓家庭能依照紀錄與專業建議調整服務。"]
    ],
    seoTitle: row.seo_title || `${row.title}｜真實照顧情境`,
    seoDescription: row.seo_description || praise,
    ogTitle: row.title,
    ogDescription: praise,
    isFeatured: Boolean(row.is_featured)
  };
}

function expertTalkItem(row, snapshot) {
  const { byId } = mediaMaps(snapshot);
  const image = byId.get(row.image_id);
  const publishedAt = row.published_at || row.updated_at || row.created_at;
  const updatedAt = row.updated_at || publishedAt;
  const topic = row.topic || row.summary || row.quote || "";
  return {
    contentKind: "master-talk",
    schemaType: "Article",
    slug: row.slug,
    href: `/master-talk/${row.slug}`,
    category: "名人講堂",
    title: row.title,
    subtitle: `${row.speaker_title || "專家"} ${row.speaker_name || ""}${row.organization ? `｜${row.organization}` : ""}`.trim(),
    excerpt: row.summary || row.quote || topic,
    image: normalizePublicAssetUrl(image?.public_url || row.image_url),
    imageAlt: image?.alt_text || `${row.speaker_name || "專家"}名人講堂`,
    focalPoint: image?.focal_point || "center",
    author: row.speaker_name || "歲悅健康3.0",
    authorTitle: row.speaker_title || "",
    date: publicDateLabel(publishedAt),
    publishedAt,
    updatedAt,
    lastmod: updatedAt,
    tags: list(row.tags),
    summary: [topic, row.quote || row.summary, "把專業觀點轉成家庭能使用的照顧步驟。"].filter(Boolean),
    content: [
      ["講者從照顧現場看見的問題", row.quote || row.summary || topic],
      ["把觀點轉成家庭能使用的方法", row.body || row.summary || topic],
      ["歲悅如何把提醒放回服務流程", "名人講堂會把專業觀點整理成家庭可理解的提醒與服務流程，讓家屬清楚知道下一步可以怎麼做。"]
    ],
    seoTitle: row.seo_title || `${row.title}｜名人講堂`,
    seoDescription: row.seo_description || row.summary || row.quote || topic,
    ogTitle: row.title,
    ogDescription: row.summary || row.quote || topic,
    isFeatured: Boolean(row.is_featured)
  };
}

function addRelated(items) {
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  return items.map((item, index) => {
    const curated = list(item.relatedSlugs).map((slug) => bySlug.get(slug)).filter(Boolean);
    const fallback = items.filter((candidate, candidateIndex) => candidateIndex !== index && candidate.contentKind === item.contentKind);
    const related = (curated.length ? curated : fallback).slice(0, 7).map((candidate) => ({
      href: candidate.href,
      image: candidate.image,
      category: candidate.category,
      title: candidate.title
    }));
    return { ...item, related };
  });
}

export async function loadPublicContent() {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error("public/cms-fallbacks.json is missing. Run pnpm cms:fallbacks:sync before building.");
  }
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  const staticState = loadStaticArticleState();
  const rewriteModule = await import("../article-rewrites.js");
  const rewrites = { ...(rewriteModule.default || {}) };
  const staticDetails = { ...staticState.articlePages };
  Object.entries(rewrites).forEach(([slug, rewrite]) => {
    staticDetails[slug] = { ...(staticDetails[slug] || {}), ...rewrite };
  });
  Object.entries(rewriteModule.health30ArticleEnhancements || {}).forEach(([slug, rewrite]) => {
    staticDetails[slug] = { ...(staticDetails[slug] || {}), ...rewrite };
  });

  const staticCards = [...staticState.healthArticles];
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
      return slug ? staticArticleItem({ ...card, slug }, staticDetails[slug] || {}, rewrites[slug] || {}) : null;
    })
    .filter(Boolean);
  const staticBySlug = new Map(staticItems.map((item) => [item.slug, item]));
  const publishedCmsArticles = list(snapshot.articles).filter((row) => row.status === "published" && row.is_enabled !== false);
  const cmsItems = publishedCmsArticles.map((row) => cmsArticleItem(row, snapshot, staticDetails, rewrites));
  const cmsSlugs = new Set(cmsItems.map((item) => item.slug));
  const articleItems = [
    ...cmsItems,
    ...staticItems.filter((item) => !cmsSlugs.has(item.slug))
  ];

  const storyItems = list(snapshot.careStories)
    .filter((row) => row.status === "published" && row.is_enabled !== false)
    .map((row) => careStoryItem(row, snapshot));
  const talkItems = list(snapshot.expertTalks)
    .filter((row) => row.status === "published" && row.is_enabled !== false)
    .map((row) => expertTalkItem(row, snapshot));
  const allItems = addRelated([...articleItems, ...storyItems, ...talkItems]);
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
