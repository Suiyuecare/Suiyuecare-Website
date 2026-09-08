import {
  articlePublicHref,
  articlePublicNumber,
  articlePublicSlug
} from "./article-url-map.mjs";
import { resolveHealthArticleImage } from "./health-article-images.mjs";

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function contentJson(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function slugFromHref(value = "") {
  return String(value || "").match(/\/article\/([^?#/]+)/)?.[1] || "";
}

function normalizeAssetUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "/assets/fallbacks/health-article-fallback.jpg";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\.?\//, "")}`;
}

function dateIso(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const normalized = /^\d{4}[./-]\d{2}[./-]\d{2}$/.test(raw)
    ? `${raw.replace(/[./]/g, "-")}T00:00:00+08:00`
    : raw;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function dateLabel(value = "") {
  const raw = String(value || "").trim();
  if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(raw)) return raw.replace(/-/g, ".").replace(/\//g, ".");
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date).replace(/-/g, ".");
}

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
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

function mapFrom(value, key = "id") {
  if (value instanceof Map || (value && typeof value.get === "function" && typeof value.entries === "function")) return value;
  return new Map(list(value).map((item) => [item?.[key], item]));
}

export function normalizeStaticPublicArticle(card = {}, detail = {}, rewrite = {}) {
  const slug = card.slug || slugFromHref(card.href) || detail.slug || "";
  const publicNumber = articlePublicNumber(slug, card.publicNumber || card.public_number);
  const publicSlug = articlePublicSlug(slug, publicNumber);
  const merged = { ...detail, ...rewrite };
  const publishedAt = dateIso(card.publishedAt || card.date || merged.publishedAt || merged.date);
  const updatedAt = dateIso(card.updatedAt || card.lastmod || merged.updatedAt || merged.lastmod) || publishedAt;
  const excerpt = card.excerpt || card.subtitle || merged.dek || merged.excerpt || "";
  const tags = list(card.tags).length
    ? list(card.tags)
    : list(merged.tags).length
      ? list(merged.tags)
      : String(card.keywords || merged.keywords || "").split(/\s+/).filter(Boolean);
  const category = card.category || merged.category || "照顧知識";
  const title = card.title || merged.title || "未命名文章";
  return {
    ...merged,
    ...card,
    contentKind: "article",
    schemaType: "BlogPosting",
    slug,
    sourceSlug: slug,
    publicNumber,
    publicSlug,
    href: articlePublicHref(slug, publicNumber),
    category,
    title,
    dek: merged.dek || card.dek || card.subtitle || excerpt,
    subtitle: card.subtitle || merged.dek || excerpt,
    excerpt,
    image: normalizeAssetUrl(resolveHealthArticleImage({
      slug,
      category,
      title,
      subtitle: card.subtitle || merged.dek,
      excerpt,
      tags
    }, card.image, merged.image)),
    imageAlt: card.imageAlt || merged.imageAlt || title || "健康3.0文章主圖",
    ogImage: normalizeAssetUrl(card.ogImage || merged.ogImage || card.image || merged.image),
    ogImageAlt: card.ogImageAlt || merged.ogImageAlt || card.imageAlt || merged.imageAlt || title,
    imageCaption: card.imageCaption || merged.imageCaption || "",
    imageUsage: card.imageUsage || merged.imageUsage || "article_cover",
    focalPoint: card.focalPoint || merged.focalPoint || "center",
    author: card.author || merged.author || "歲悅照顧編輯部",
    authorTitle: card.authorTitle || merged.authorTitle || "",
    date: dateLabel(card.date || merged.date || publishedAt),
    publishedAt,
    updatedAt,
    lastmod: updatedAt,
    readingMinutes: card.readingMinutes || merged.readingMinutes || Number.parseInt(merged.readTime, 10) || null,
    difficulty: card.difficulty || merged.difficulty || "",
    targetAudience: card.targetAudience || merged.targetAudience || "",
    relatedService: card.relatedService || merged.relatedService || "",
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
    seoTitle: merged.seoTitle || `${title}｜健康3.0`,
    seoDescription: merged.seoDescription || excerpt,
    ogTitle: merged.ogTitle || title,
    ogDescription: merged.ogDescription || excerpt,
    isFeatured: Boolean(card.isFeatured ?? merged.isFeatured)
  };
}

export function normalizeCmsPublicArticle(row = {}, options = {}) {
  const mediaById = mapFrom(options.mediaById || options.media);
  const categoriesById = mapFrom(options.categoriesById || options.categories);
  const staticDetails = options.staticDetails || {};
  const rewrites = options.rewrites || {};
  const category = categoriesById.get(row.category_id);
  const cover = row.cover_image || mediaById.get(row.cover_image_id);
  const ogImage = row.og_image || mediaById.get(row.og_image_id);
  const enriched = { ...(staticDetails[row.slug] || {}), ...(rewrites[row.slug] || {}) };
  const json = contentJson(row.content_json);
  const video = videoData(json);
  const publishedAt = row.published_at || row.updated_at || row.created_at || "";
  const updatedAt = row.updated_at || publishedAt;
  const excerpt = enriched.dek || row.excerpt || row.subtitle || stripHtml(row.content).slice(0, 180);
  const publicNumber = articlePublicNumber(row.slug, row.public_number);
  const publicSlug = articlePublicSlug(row.slug, publicNumber);
  const categoryLabel = category?.display_label || category?.name || enriched.category || "照顧知識";
  const categorySlug = category?.slug || categoryLabel;
  const title = row.title || enriched.title || "未命名文章";
  const subtitle = row.subtitle || enriched.dek || row.excerpt || "";
  const tags = list(row.tags);
  return {
    ...enriched,
    contentKind: "article",
    schemaType: "BlogPosting",
    slug: row.slug,
    sourceSlug: row.slug,
    publicNumber,
    publicSlug,
    href: articlePublicHref(row.slug, publicNumber),
    category: categoryLabel,
    categorySlug,
    categoryType: category?.type || "article",
    categorySection: category?.section_key || "health",
    contentType: row.content_type || json.content_type || category?.type || "article",
    title,
    dek: enriched.dek || row.subtitle || row.excerpt || excerpt,
    subtitle,
    excerpt,
    image: normalizeAssetUrl(resolveHealthArticleImage({
      ...row,
      slug: row.slug,
      category: categoryLabel,
      categorySlug,
      title,
      subtitle,
      excerpt,
      relatedService: row.related_service,
      tags
    }, cover?.public_url, enriched.image, json.image_url, json.image, row.image)),
    imageAlt: cover?.alt_text || enriched.imageAlt || title || "健康3.0文章主圖",
    ogImage: normalizeAssetUrl(ogImage?.public_url || cover?.public_url || enriched.ogImage || enriched.image || json.image_url || json.image || row.image),
    ogImageAlt: ogImage?.alt_text || cover?.alt_text || enriched.ogImageAlt || enriched.imageAlt || title,
    imageCaption: enriched.imageCaption || "",
    imageUsage: cover?.image_usage || enriched.imageUsage || "article_cover",
    focalPoint: cover?.focal_point || enriched.focalPoint || "center",
    author: row.author_name || enriched.author || "歲悅照顧編輯部",
    authorTitle: row.author_title || enriched.authorTitle || "",
    date: dateLabel(publishedAt),
    publishedAt,
    updatedAt,
    lastmod: updatedAt,
    readingMinutes: row.reading_minutes || enriched.readingMinutes || null,
    difficulty: row.difficulty || enriched.difficulty || "",
    targetAudience: row.target_audience || enriched.targetAudience || "",
    relatedService: row.related_service || enriched.relatedService || "",
    recommendedSlots: list(row.recommended_slots),
    tags,
    keywords: `${title} ${subtitle} ${excerpt} ${categoryLabel} ${tags.join(" ")} ${row.target_audience || ""} ${row.related_service || ""}`,
    summary: list(enriched.summary).length ? list(enriched.summary) : list(row.summary_points),
    summaryPoints: list(enriched.summary).length ? list(enriched.summary) : list(row.summary_points),
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
    relatedSlugs: list(json.related_slugs).length ? list(json.related_slugs) : list(enriched.relatedSlugs),
    videoUrl: video.url,
    videoEmbedUrl: video.embedUrl,
    videoProvider: video.provider,
    videoType: video.type,
    videoDuration: video.duration,
    videoLabel: video.label,
    videoCaption: video.caption,
    seoTitle: row.seo_title || enriched.seoTitle || `${title}｜健康3.0`,
    seoDescription: row.seo_description || enriched.seoDescription || excerpt,
    seoKeywords: list(row.seo_keywords),
    ogTitle: row.og_title || enriched.ogTitle || title,
    ogDescription: row.og_description || enriched.ogDescription || excerpt,
    isFeatured: Boolean(row.is_featured)
  };
}

export function normalizePublicCareStory(row = {}, options = {}) {
  const mediaById = mapFrom(options.mediaById || options.media);
  const cover = row.cover_image || mediaById.get(row.cover_image_id);
  const avatarImage = row.avatar_image || mediaById.get(row.avatar_image_id);
  const service = row.service_type || "照顧服務";
  const publishedAt = row.published_at || row.updated_at || row.created_at || "";
  const updatedAt = row.updated_at || publishedAt;
  const praise = row.praise || row.quote || row.summary || "";
  const name = row.person_name || "家屬";
  const label = row.person_label || "服務回饋";
  const title = row.title || "真實照顧故事";
  const image = normalizeAssetUrl(cover?.public_url || row.cover_image_url);
  return {
    contentKind: "care-story",
    schemaType: "Article",
    slug: row.slug,
    href: `/care-story/${row.slug}`,
    category: service,
    service,
    name,
    label,
    title,
    subtitle: `${name}｜${label}`,
    excerpt: praise,
    quote: row.quote || "",
    praise,
    body: row.story_body || "",
    image,
    imageAlt: cover?.alt_text || `${service}家屬回饋`,
    ogImage: normalizeAssetUrl(row.og_image_url || image),
    ogImageAlt: row.og_image_alt || cover?.alt_text || `${service}家屬回饋`,
    focalPoint: cover?.focal_point || "center",
    avatar: normalizeAssetUrl(avatarImage?.public_url || row.avatar_image_url || image),
    author: "歲悅照顧編輯部",
    date: dateLabel(publishedAt),
    publishedAt,
    updatedAt,
    lastmod: updatedAt,
    tags: list(row.tags),
    summary: [praise, `${service}不只完成服務，也讓家庭知道每天該留意什麼。`].filter(Boolean),
    content: [
      ["照顧開始前，家庭最需要的是有人把狀況說清楚", `這個故事來自${name}對${service}的回饋。服務開始前，團隊會先整理家庭最在意的日常問題與交接方式。`],
      ["被稱讚的不是單一動作，而是照顧被接住的感覺", row.story_body || row.quote || praise],
      ["把經驗留下來，下一次照顧才會更穩", "歲悅把服務紀錄、家屬回報與督導追蹤放在同一個流程裡，讓家庭能依照紀錄與專業建議調整服務。"]
    ],
    cta: row.cta || "",
    ctaText: row.cta_text || "",
    ctaUrl: row.cta_url || "",
    seoTitle: row.seo_title || `${title}｜真實照顧情境`,
    seoDescription: row.seo_description || praise,
    ogTitle: row.og_title || title,
    ogDescription: row.og_description || praise,
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order
  };
}

export function normalizePublicExpertTalk(row = {}, options = {}) {
  const mediaById = mapFrom(options.mediaById || options.media);
  const media = row.image || mediaById.get(row.image_id);
  const publishedAt = row.published_at || row.updated_at || row.created_at || "";
  const updatedAt = row.updated_at || publishedAt;
  const topic = row.topic || row.summary || row.quote || "";
  const title = row.title || "名人講堂";
  const speaker = row.speaker_name || "歲悅健康3.0";
  const titleLabel = row.speaker_title || "專家";
  const organization = row.organization || "";
  const image = normalizeAssetUrl(media?.public_url || row.image_url);
  return {
    contentKind: "master-talk",
    schemaType: "Article",
    slug: row.slug,
    href: `/master-talk/${row.slug}`,
    category: "名人講堂",
    title,
    speaker,
    titleLabel,
    organization,
    topic,
    quote: row.quote || "",
    body: row.body || "",
    subtitle: `${titleLabel} ${speaker}${organization ? `｜${organization}` : ""}`.trim(),
    excerpt: row.summary || row.quote || topic,
    image,
    portrait: image,
    imageAlt: media?.alt_text || `${speaker}名人講堂`,
    ogImage: normalizeAssetUrl(row.og_image_url || image),
    ogImageAlt: row.og_image_alt || media?.alt_text || `${speaker}名人講堂`,
    focalPoint: media?.focal_point || "center",
    author: speaker,
    authorTitle: row.speaker_title || "",
    date: dateLabel(publishedAt),
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
    cta: row.cta || "",
    ctaText: row.cta_text || "",
    ctaUrl: row.cta_url || "",
    seoTitle: row.seo_title || `${title}｜名人講堂`,
    seoDescription: row.seo_description || row.summary || row.quote || topic,
    ogTitle: row.og_title || title,
    ogDescription: row.og_description || row.summary || row.quote || topic,
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order
  };
}

export function addSameKindRelated(items = []) {
  const rows = list(items);
  const bySlug = new Map(rows.map((item) => [item.slug, item]));
  return rows.map((item, index) => {
    const curated = list(item.relatedSlugs)
      .map((slug) => bySlug.get(slug))
      .filter((candidate) => candidate?.contentKind === item.contentKind);
    const fallback = rows.filter((candidate, candidateIndex) => candidateIndex !== index && candidate.contentKind === item.contentKind);
    const related = (curated.length ? curated : fallback).slice(0, 7).map((candidate) => ({
      href: candidate.href,
      image: candidate.image,
      category: candidate.category,
      title: candidate.title,
      focalPoint: candidate.focalPoint
    }));
    return { ...item, related };
  });
}

export function authoritativePublicRows({ liveConfigured = false, liveSucceeded = false, liveRows = [], fallbackRows = [] } = {}) {
  return liveConfigured && liveSucceeded ? list(liveRows) : list(fallbackRows);
}

export function authoritativePublicItem({ liveConfigured = false, liveSucceeded = false, liveItem = null, fallbackItem = null } = {}) {
  return liveConfigured && liveSucceeded ? liveItem || null : fallbackItem || null;
}
