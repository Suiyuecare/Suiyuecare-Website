import { canonicalizeArticleLink } from "./article-consolidation.mjs";
import {
  articlePublicHref,
  articlePublicSlug
} from "./article-url-map.mjs";
import {
  articleMatchesHealthTopic,
  getUniqueHealthTopics,
  renderHealthTopicNavigation,
  resolveHealthTopic
} from "./health-topic-navigation.mjs";
import {
  publicContentKey,
  publicContentPublishedTime,
  publicContentRevisionTime
} from "./public-content-freshness.mjs";
import { getPublicEditorialInfo } from "./public-editorial.mjs";

const SITE_ORIGIN = "https://www.suiyuecare.com";
const HEALTH_CATEGORY_PREVIEW_LIMIT = 9;
const HEALTH_HOME_LATEST_LIMIT = 8;
const HEALTH_HOME_RAIL_LIMIT = 3;
const PUBLIC_HEALTH_LAYOUT = "health-unified-v1";
const HEALTH_FALLBACK_IMAGE = "/assets/fallbacks/health-article-fallback.jpg";

export function escapePublicHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function stripPublicHtml(value = "") {
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

export function normalizePublicAssetUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return HEALTH_FALLBACK_IMAGE;
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\.?\//, "")}`;
}

export function absolutePublicUrl(value = "") {
  const normalized = String(value || "").trim();
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${SITE_ORIGIN}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}

export function publicDateLabel(value = "") {
  const raw = String(value || "").trim();
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const taipeiDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  return `${taipeiDate.getUTCFullYear()}.${String(taipeiDate.getUTCMonth() + 1).padStart(2, "0")}.${String(taipeiDate.getUTCDate()).padStart(2, "0")}`;
}

function safePublicHref(value = "", fallback = "/contact") {
  const raw = canonicalizeArticleLink(String(value || "").trim());
  if (!raw) return fallback;
  if (/^\s*(javascript|data:text)/i.test(raw)) return fallback;
  if (raw === "#contact") return "/contact";
  if (raw.startsWith("#article-")) return articlePublicHref(raw.slice("#article-".length));
  const articlePathMatch = raw.match(/^\/article\/([^?/#]+)(\?.*)?$/i);
  if (articlePathMatch) {
    const publicSlug = articlePublicSlug(articlePathMatch[1]);
    return publicSlug ? `/article/${publicSlug}${articlePathMatch[2] || ""}` : raw;
  }
  if (raw.startsWith("#care-story-")) return `/care-story/${raw.slice("#care-story-".length)}`;
  if (raw.startsWith("#master-talk-")) return `/master-talk/${raw.slice("#master-talk-".length)}`;
  if (raw === "#health") return "/health";
  if (raw === "#courses") return "/courses";
  return raw;
}

function sanitizeApprovedArticleHtml(value = "") {
  let html = String(value || "");
  html = html
    .replace(/<(script|style|noscript|object|embed|form|input|button|meta|link)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|noscript|object|embed|form|input|button|meta|link)\b[^>]*\/?>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*(?:javascript|data:text)[\s\S]*?\2/gi, "");
  html = html.replace(/\bhref=(["'])([^"'<>]+)\1/g, (_match, quote, href) => `href=${quote}${canonicalizeArticleLink(href)}${quote}`);
  return html.trim();
}

function renderMarkdownLikeContent(content = "") {
  const raw = String(content || "").trim();
  if (!raw) return "<p>文章內容準備中。</p>";
  if (/<\/?(p|h2|h3|figure|img|ul|ol|li|strong|b|em|i|span|a|br|iframe|video)[\s>]/i.test(raw)) {
    return sanitizeApprovedArticleHtml(raw);
  }

  const blocks = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${escapePublicHtml(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${escapePublicHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(`<h3>${escapePublicHtml(trimmed.slice(4))}</h3>`);
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(`<h2>${escapePublicHtml(trimmed.slice(3))}</h2>`);
      return;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }
    flushList();
    paragraph.push(trimmed);
  });
  flushParagraph();
  flushList();
  return blocks.join("") || "<p>文章內容準備中。</p>";
}

function renderInlineImage(image = {}) {
  if (!image?.src) return "";
  const isChart = /-chart\.svg(?:[?#].*)?$/i.test(String(image.src));
  return `
    <figure class="article-inline-image">
      ${isChart ? `<span class="article-chart-swipe-hint" aria-hidden="true">左右滑動查看完整圖表 →</span>` : ""}
      <img src="${escapePublicHtml(normalizePublicAssetUrl(image.src))}" alt="${escapePublicHtml(image.alt || image.caption || "健康3.0文章補充圖片")}" loading="lazy" decoding="async" />
      ${image.caption ? `<figcaption>${escapePublicHtml(image.caption)}</figcaption>` : ""}
    </figure>
  `;
}

function renderContentSection(section, index, inlineImages = []) {
  const [heading, rawBody] = Array.isArray(section) ? section : [section?.heading, section?.body];
  const bodies = Array.isArray(rawBody) ? rawBody : [rawBody].filter(Boolean);
  const images = inlineImages.filter((image) => Number(image.afterSection) === index);
  return `
    <section>
      <h2>${escapePublicHtml(heading || "")}</h2>
      ${bodies.map((body) => `<p>${escapePublicHtml(body || "")}</p>`).join("")}
      ${images.map(renderInlineImage).join("")}
    </section>
  `;
}

function renderCallout(callout = {}) {
  if (!callout?.items?.length && !callout?.body) return "";
  return `
    <aside class="article-callout">
      <strong>${escapePublicHtml(callout.title || "照顧提醒")}</strong>
      ${callout.body ? `<p>${escapePublicHtml(callout.body)}</p>` : ""}
      ${callout.items?.length ? `<ul>${callout.items.map((item) => `<li>${escapePublicHtml(item)}</li>`).join("")}</ul>` : ""}
    </aside>
  `;
}

function renderChecklist(checklist = {}) {
  if (!checklist?.items?.length) return "";
  return `
    <section class="article-checklist">
      <h2>${escapePublicHtml(checklist.title || "家屬可以這樣檢查")}</h2>
      <ul>${checklist.items.map((item) => `<li>${escapePublicHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function renderTable(table = {}) {
  if (!table?.rows?.length) return "";
  const headers = table.headers?.length ? table.headers : ["狀況", "可能原因", "下一步"];
  return `
    <section class="article-table-section">
      <h2>${escapePublicHtml(table.title || "快速對照表")}</h2>
      <div class="article-table-wrap">
        <table>
          <thead><tr>${headers.map((header) => `<th>${escapePublicHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapePublicHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderReferences(article = {}) {
  const references = Array.isArray(article.references) ? article.references : [];
  const legacySource = references.length === 0 && (article.sourceName || article.sourceUrl)
    ? [{ name: article.sourceName || article.sourceUrl, url: article.sourceUrl || "" }]
    : [];
  const seen = new Set();
  const rows = [...references, ...legacySource]
    .filter((item) => item?.citation || item?.name || item?.url)
    .sort((a, b) => Number(a.evidenceRank || 99) - Number(b.evidenceRank || 99))
    .filter((item) => {
      const key = String(item.pmid || item.doi || item.url || item.citation || item.name || "")
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\/(www\.)?/, "")
        .replace(/\/$/, "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  if (!rows.length) return "";
  return `
    <section class="article-references" id="editorial-references">
      <h2>參考資料</h2>
      <ol>${rows.map((item) => {
        const label = escapePublicHtml(item.citation || item.name || item.url);
        return `<li>${item.url ? `<a href="${escapePublicHtml(safePublicHref(item.url, ""))}" target="_blank" rel="noopener">${label}</a>` : label}</li>`;
      }).join("")}</ol>
    </section>
  `;
}

function renderEditorialIdentity(identity, isAuthor = false) {
  const name = escapePublicHtml(identity.name);
  return identity.url ? `<a href="${escapePublicHtml(identity.url)}"${isAuthor ? ' rel="author"' : ""}>${name}</a>` : name;
}

function renderEditorialNote(article, editorial) {
  const authorDetails = [editorial.author.role, editorial.author.credentials].filter(Boolean).join("・");
  const hasReferences = article.references?.length || article.sourceName || article.sourceUrl;
  return `
    <aside class="article-editorial-note" aria-label="文章署名與資料說明">
      ${authorDetails || editorial.author.description ? `<p>${escapePublicHtml(editorial.author.name)}${authorDetails ? `｜${escapePublicHtml(authorDetails)}` : ""}${editorial.author.description ? `<br>${escapePublicHtml(editorial.author.description)}` : ""}</p>` : ""}
      ${editorial.reviewer ? `<p>內容審閱｜${renderEditorialIdentity(editorial.reviewer)}${editorial.reviewer.role || editorial.reviewer.credentials ? `（${escapePublicHtml([editorial.reviewer.role, editorial.reviewer.credentials].filter(Boolean).join("・"))}）` : ""} · <time datetime="${escapePublicHtml(editorial.reviewedAt)}">${publicDateLabel(editorial.reviewedAt)}</time></p>` : ""}
      ${editorial.contentUpdatedAt ? `<p>內容更新｜<time datetime="${escapePublicHtml(editorial.contentUpdatedAt)}">${publicDateLabel(editorial.contentUpdatedAt)}</time></p>` : ""}
      ${editorial.sourceCheckedAt ? `<p>資料查核｜<time datetime="${escapePublicHtml(editorial.sourceCheckedAt)}">${publicDateLabel(editorial.sourceCheckedAt)}</time></p>` : ""}
      <p>${hasReferences ? `<a href="#editorial-references">查看參考資料</a> · ` : ""}<a href="${escapePublicHtml(editorial.policyUrl)}">編輯團隊與資料說明</a></p>
    </aside>`;
}

function renderTagLinks(tags = []) {
  return (Array.isArray(tags) ? tags : [])
    .filter(Boolean)
    .map((tag) => `<a class="meta-tag" href="/search?q=${encodeURIComponent(String(tag).replace(/^#\s*/, "").trim())}" aria-label="搜尋 ${escapePublicHtml(tag)} 相關文章"># ${escapePublicHtml(tag)}</a>`)
    .join("");
}

function renderVideo(article = {}) {
  if (!article.videoEmbedUrl) return "";
  const embedUrl = safePublicHref(article.videoEmbedUrl, "");
  const media = article.videoProvider === "youtube" || article.videoProvider === "vimeo"
    ? `<iframe src="${escapePublicHtml(embedUrl)}" title="${escapePublicHtml(article.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
    : `<video src="${escapePublicHtml(embedUrl)}" controls preload="metadata" poster="${escapePublicHtml(normalizePublicAssetUrl(article.image))}"></video>`;
  return `
    <section class="article-video-block">
      ${media}
      <div><span>${escapePublicHtml(article.videoLabel || article.category)}${article.videoDuration ? ` · ${escapePublicHtml(article.videoDuration)}` : ""}</span><p>${escapePublicHtml(article.videoCaption || article.subtitle || "")}</p></div>
    </section>
  `;
}

function healthArticleHeading(title = "未命名文章") {
  const split = String(title).indexOf("？");
  if (split < 6 || split >= title.length - 4) return escapePublicHtml(title);
  return `${escapePublicHtml(title.slice(0, split + 1))}<br />${escapePublicHtml(title.slice(split + 1))}`;
}

export function renderPublicArticleLayout(article = {}, options = {}) {
  const editorial = getPublicEditorialInfo(article);
  const related = Array.isArray(options.related) ? options.related : [];
  const hasSlideDeck = Boolean(options.slideDeckHtml);
  const isPptIconPack = article.visualFormat === "ppt-icon-pack";
  const image = normalizePublicAssetUrl(article.image);
  const imageAlt = article.imageAlt || article.title || "健康3.0文章主圖";
  const objectPosition = String(article.focalPoint || "center").replace(/[^a-z0-9% .-]/gi, "");
  // Lift the default crop slightly so square portraits keep faces in the reading hero.
  const healthObjectPosition = objectPosition === "center" ? "center 25%" : objectPosition;
  const contentHtml = Array.isArray(article.content)
    ? article.content.map((section, index) => renderContentSection(section, index, article.inlineImages || [])).join("")
    : renderMarkdownLikeContent(article.content);
  const serviceNeeds = { "居家照顧": "居家照顧諮詢", "日間照顧": "日間照顧諮詢", "社區據點": "社區據點諮詢", "護理復能": "護理復能諮詢", "移工培訓": "移工培訓諮詢", "教育品管": "教育品管諮詢", "軟體系統": "軟體系統諮詢" };
  const contactNeed = serviceNeeds[article.relatedService || article.category] || "長照服務諮詢";
  const contactContext = `data-contact-need="${escapePublicHtml(contactNeed)}" data-contact-message="${escapePublicHtml(`我想了解${contactNeed}，剛閱讀了〈${article.title || "照顧知識"}〉。`)}"`;

  const contentKind = article.contentKind || "article";
  const contentKey = publicContentKey({ ...article, contentKind }) || `content:${contentKind}:${article.publicSlug || article.slug || ""}`;
  const contentRevisionTime = publicContentRevisionTime(article);
  const contentUpdatedAt = contentRevisionTime === null ? "" : new Date(contentRevisionTime).toISOString();
  const tagLinks = renderTagLinks(article.tags);

  const articleMetaMarkup = `<div class="article-meta">
            <span class="meta-editor">編輯人｜${renderEditorialIdentity(editorial.author, true)}</span>
            <time class="meta-date" datetime="${escapePublicHtml(article.publishedAt || "")}">發布｜${escapePublicHtml(article.date || publicDateLabel(article.publishedAt))}</time>
            ${article.readingMinutes ? `<span class="meta-editor">閱讀時間｜${Number(article.readingMinutes)} 分鐘</span>` : ""}
            ${article.targetAudience ? `<span class="meta-editor">適合｜${escapePublicHtml(article.targetAudience)}</span>` : ""}
            ${contentKind === "article" && tagLinks ? `<div class="article-meta-tags">${tagLinks}</div>` : tagLinks}
          </div>`;

  const html = `
    <article class="article-page ${contentKind === "article" ? "article-page--health-story " : ""}${isPptIconPack ? "article-page--ppt-icon-pack" : ""}" data-public-layout="article-unified-v1" data-public-content-type="${escapePublicHtml(contentKind)}" data-public-content-key="${escapePublicHtml(contentKey)}" data-public-content-updated-at="${escapePublicHtml(contentUpdatedAt)}">
      ${contentKind === "article" ? renderHealthPublicationHeader() : ""}
      <div class="article-topbar">
        <a class="article-back" href="/health">返回健康3.0</a>
        <span class="article-category">${escapePublicHtml(article.category || "照顧知識")}</span>
      </div>

      ${contentKind === "article" ? `<header class="article-hero">
        <div class="article-heading">
          <p class="article-section-label">健康3.0 · ${escapePublicHtml(article.category || "照顧知識")}</p>
          <h1>${healthArticleHeading(article.title || "未命名文章")}</h1>
          <p class="article-dek">${escapePublicHtml(article.subtitle || article.excerpt || "")}</p>
        </div>
        ${articleMetaMarkup}
        <figure>
          <img src="${escapePublicHtml(image)}" alt="${escapePublicHtml(imageAlt)}" data-fallback-src="${HEALTH_FALLBACK_IMAGE}" style="object-position:${escapePublicHtml(healthObjectPosition)}" loading="eager" fetchpriority="high" decoding="async" />
          ${article.imageCaption ? `<figcaption>${escapePublicHtml(article.imageCaption)}</figcaption>` : ""}
        </figure>
      </header>` : `      <header class="article-hero">
        <figure>
          <img src="${escapePublicHtml(image)}" alt="${escapePublicHtml(imageAlt)}" data-fallback-src="${HEALTH_FALLBACK_IMAGE}" style="object-position:${escapePublicHtml(objectPosition)}" loading="eager" fetchpriority="high" decoding="async" />
          <figcaption class="${isPptIconPack ? "article-hero-caption--sr-only" : ""}">
            <h1>${escapePublicHtml(article.title || "未命名文章")}</h1>
            <p>${escapePublicHtml(article.subtitle || article.excerpt || "")}</p>
            ${article.imageCaption ? `<small class="article-hero-photo-caption">${escapePublicHtml(article.imageCaption)}</small>` : ""}
          </figcaption>
        </figure>
      </header>`}

      <section class="article-layout">
        <div class="article-main">
          ${contentKind === "article" ? "" : articleMetaMarkup}

          ${renderVideo(article)}
          ${hasSlideDeck ? options.slideDeckHtml : (article.summary?.length ? `
            <div class="article-summary">
              <strong>本文重點</strong>
              <ul>${article.summary.map((item) => `<li>${escapePublicHtml(item)}</li>`).join("")}</ul>
            </div>
          ` : "")}

          <div class="article-body ${hasSlideDeck ? "article-body-compact" : ""}">
            ${hasSlideDeck ? "" : renderCallout(article.warning)}
            ${hasSlideDeck ? "" : contentHtml}
            ${hasSlideDeck ? "" : (Array.isArray(article.checklists) ? article.checklists.map(renderChecklist).join("") : "")}
            ${hasSlideDeck ? "" : (Array.isArray(article.tables) ? article.tables.map(renderTable).join("") : "")}
            ${hasSlideDeck ? "" : (Array.isArray(article.faq) && article.faq.length ? `
              <section class="article-faq">
                <h2>常見問題</h2>
                ${article.faq.map((item) => `<details><summary>${escapePublicHtml(item.question || "")}</summary><p>${escapePublicHtml(item.answer || "")}</p></details>`).join("")}
              </section>
            ` : "")}
            <div class="article-cta">
              <p>${escapePublicHtml(article.cta || "不確定下一步怎麼安排？留下需求，讓歲悅協助判斷。")}</p>
              <a ${contentKind === "article" ? 'class="primary-button" ' : ""}href="${escapePublicHtml(safePublicHref(article.ctaUrl, "/contact"))}" ${contactContext}>${escapePublicHtml(article.ctaText || "預約照顧諮詢")}</a>
            </div>
            ${editorial.service ? `<p class="article-service-link">相關照顧服務：<a href="${escapePublicHtml(editorial.service.href)}">了解歲悅${escapePublicHtml(editorial.service.name)}</a></p>` : ""}
            ${renderReferences(article)}
            ${renderEditorialNote(article, editorial)}
          </div>
        </div>

        <aside class="article-ads" aria-label="側邊推薦">
          <a class="article-ad featured" href="/contact" ${contactContext}><span>${contentKind === "article" ? "歲悅陪你照顧" : "Suiyuecare Corps."}</span><strong>第一次照顧諮詢</strong><p>不知道該選居家、日照還是復能？讓專人協助判斷。</p><em>預約諮詢</em></a>
          <a class="article-ad" href="/courses"><span>${contentKind === "article" ? "照顧學習" : "Care Course"}</span><strong>家屬照顧課</strong><p>把移位、用餐、跌倒預防變成看得懂的日常技巧。</p></a>
          <a class="article-ad" href="/talent"><span>${contentKind === "article" ? "歲悅團隊" : "We want you"}</span><strong>加入歲悅團隊</strong><p>居服員、督導、日照照服員招募中。</p></a>
        </aside>

        ${related.length ? `
          <section class="article-related">
            <div class="article-related-head"><span>Related Articles</span><strong>延伸閱讀</strong></div>
            <div class="article-related-grid">
              ${related.slice(0, 7).map((item) => `
                <a href="${escapePublicHtml(safePublicHref(item.href, "/health"))}">
                  <img src="${escapePublicHtml(normalizePublicAssetUrl(item.image))}" alt="${escapePublicHtml(item.title || "延伸閱讀")}" data-fallback-src="${HEALTH_FALLBACK_IMAGE}" loading="lazy" decoding="async" />
                  <span>${escapePublicHtml(item.category || "照顧知識")}</span>
                  <b>${escapePublicHtml(item.title || "")}</b>
                </a>
              `).join("")}
            </div>
          </section>
        ` : ""}
      </section>
    </article>
  `;
  const renderRevision = publicContentBatchRevision(`${html}\n${JSON.stringify({
    seoTitle: article.seoTitle || "",
    seoDescription: article.seoDescription || "",
    ogImage: normalizePublicAssetUrl(article.ogImage || article.image),
    ogImageAlt: article.ogImageAlt || article.imageAlt || article.title || ""
  })}`);
  return html.replace(
    "data-public-content-updated-at=",
    `data-public-content-revision="${escapePublicHtml(renderRevision)}" data-public-content-updated-at=`
  );
}

function publicContentBatchRevision(input = "") {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `v1-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function healthCategorySlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const healthSectionCategorySlugs = {
  guides: ["lazy-pack", "lazy_pack", "guide", "懶人包"],
  events: ["activity", "event", "活動專區"],
  videos: ["video", "影音", "影片", "short-video", "short_video", "shorts", "短影片"]
};

function healthImageAttrs(article = {}, { priority = false } = {}) {
  const focalPoint = String(article.focalPoint || "center").replace(/[^a-z0-9% .-]/gi, "");
  return [
    `src="${escapePublicHtml(normalizePublicAssetUrl(article.image))}"`,
    `alt="${escapePublicHtml(article.imageAlt || article.title || "健康3.0文章圖片")}"`,
    `data-fallback-src="${HEALTH_FALLBACK_IMAGE}"`,
    `style="object-position:${escapePublicHtml(focalPoint)}"`,
    `loading="${priority ? "eager" : "lazy"}"`,
    `decoding="async"`,
    priority ? `fetchpriority="high" data-health-priority="true"` : ""
  ].filter(Boolean).join(" ");
}

function healthMeta(item) {
  return `<span class="health-label">${escapePublicHtml(item.category || "照顧知識")}</span>${item.date ? `<time class="health-date">${escapePublicHtml(item.date)}</time>` : ""}`;
}

function renderHealthListCard(item, { priority = false, format = false } = {}) {
  return `<article class="health-list-card${format ? " health-visual-card" : ""}"><a href="${escapePublicHtml(safePublicHref(item.href, "/health"))}">
    <img ${healthImageAttrs(item, { priority })} width="800" height="500" />
    <div><div class="health-card-meta">${format ? '<span class="health-label">圖解懶人包</span>' : healthMeta(item)}</div>
    <h3>${escapePublicHtml(item.title)}</h3>
    ${format ? `<p>${escapePublicHtml(item.readingMinutes ? `${item.readingMinutes} 分鐘閱讀` : "分頁圖解，逐步閱讀")} <span aria-hidden="true">↗</span></p>` : ""}</div>
  </a></article>`;
}

function healthSectionHeading(id, label, title, href = "/search", linkLabel = "全部文章") {
  return `<div class="health-section-head section-head"><div><p class="eyebrow">${label}</p><h2 id="${id}">${title}</h2></div><a href="${href}">${linkLabel} <span aria-hidden="true">↗</span></a></div>`;
}

// Editorial reading paths use published identities; missing items are omitted.
const HEALTH_READING_PATHS = [
  { id: "dementia", title: "失智照顧", intro: "從理解變化，到每天的陪伴", steps: ["看懂生活變化", "安排確診後的生活", "練習陪伴的方法", "準備就醫資訊"], articles: [91,106,107,157], query: "失智" },
  { id: "daycare", title: "第一次安排日照", intro: "從諮詢、參觀，到安心適應", steps: ["準備申請與諮詢", "了解日照服務", "陪伴第一週適應", "安排接送與交接"], articles: [12,29,7,134], href: "/guides/day-care" },
  { id: "strength", title: "肌力與日常活動", intro: "把營養與活動，放進日常生活", steps: ["先認識肌少症", "從每天三餐開始", "安排合適的活動", "持續觀察生活功能"], articles: [119,123,122,162], query: "肌少症" }
];

function renderHealthReadingPaths(articles) {
  const byHref = new Map(articles.map((item) => [safePublicHref(item.href), item]));
  const paths = HEALTH_READING_PATHS.map((path) => {
    const entries = path.articles.map((number, index) => ({ item: byHref.get(`/article/article${number}`), step: path.steps[index] })).filter(({ item }) => item);
    if (!entries.length) return "";
    const [{ item, step }, ...rest] = entries;
    const href = path.href || `/search?q=${encodeURIComponent(path.query)}`;
    return `<section class="health-reading-path" aria-labelledby="health-path-${path.id}">
      <header><h3 id="health-path-${path.id}">${path.title}</h3><p>${path.intro}</p></header>
      <a class="health-path-feature" href="${escapePublicHtml(safePublicHref(item.href))}"><img ${healthImageAttrs(item)} width="800" height="500" /><span class="health-label">${step}</span><h4>${escapePublicHtml(item.title)}</h4></a>
      <ol>${rest.map(({ item, step }) => `<li><a href="${escapePublicHtml(safePublicHref(item.href))}"><span>${step}</span><strong>${escapePublicHtml(item.title)}</strong></a></li>`).join("")}</ol>
      <a class="health-text-link" href="${href}">${path.href ? "日照完整指南" : "更多相關文章"} <span aria-hidden="true">↗</span></a>
    </section>`;
  }).filter(Boolean);
  return paths.length ? `<section class="health-paths" aria-labelledby="health-paths-title">${healthSectionHeading("health-paths-title", "依照你的需要，循序閱讀", "照顧，有一條路可循", "/guides/day-care", "日照入門指南")}<div class="health-path-grid">${paths.join("")}</div></section>` : "";
}

function partitionLatestArticlesByTitle(items = []) {
  const current = [];
  const superseded = [];
  const titleKeys = new Set();
  items.forEach((article) => {
    const titleKey = String(article?.title || "").normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("zh-Hant-TW");
    if (!titleKey || !titleKeys.has(titleKey)) {
      if (titleKey) titleKeys.add(titleKey);
      current.push(article);
      return;
    }
    superseded.push(article);
  });
  return { current, superseded };
}

export function renderHealthPublicationHeader({ home = false } = {}) {
  return `<header class="health-publication-header">
    <div class="health-publication-brand"><p class="eyebrow">歲悅長照・照顧知識</p>
      ${home ? '<h1>健康<span>3.0</span></h1>' : '<a href="/health" aria-label="健康3.0首頁">健康<span>3.0</span></a>'}
      ${home ? '<p class="health-publication-promise">陪你照顧家人，也照顧自己。</p>' : ""}</div>
    <div class="health-search-area"><form class="health-search" action="/search" role="search">
      <input name="q" type="search" aria-label="搜尋健康3.0文章" placeholder="今天想了解什麼照顧知識？" />
      <button type="submit" aria-label="搜尋"><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></button>
    </form>${home ? '<nav class="health-search-suggestions" aria-label="搜尋建議"><span>從這裡找：</span><a href="/search?q=失智">失智</a><a href="/search?q=血壓">血壓</a><a href="/guides/day-care">日照入門</a></nav>' : ""}</div>
  </header>`;
}

export function renderPublicHealthIndex(items = [], categories = [], options = {}) {
  const selectedCategorySlug = typeof options === "string" ? options : options.selectedCategorySlug || "";
  const sortedArticles = (Array.isArray(items) ? items.filter(Boolean) : [])
    .map((article, index) => ({ article, index }))
    .sort((left, right) => {
      const leftTime = publicContentPublishedTime(left.article) || 0;
      const rightTime = publicContentPublishedTime(right.article) || 0;
      return rightTime - leftTime || left.index - right.index;
    })
    .map(({ article }) => article);
  const topics = getUniqueHealthTopics(categories, sortedArticles);
  const selectedTopic = resolveHealthTopic(topics, selectedCategorySlug);
  const uniqueInventory = partitionLatestArticlesByTitle(sortedArticles);
  const selectedInventory = partitionLatestArticlesByTitle(selectedCategorySlug
    ? sortedArticles.filter((article) => articleMatchesHealthTopic(article, selectedTopic))
    : sortedArticles);
  const articles = selectedInventory.current;
  const supersededArticles = selectedCategorySlug ? [] : uniqueInventory.superseded;
  const feature = articles[0];
  const seenCategories = new Set([feature?.category]);
  const railArticles = selectedCategorySlug ? [] : articles.slice(1).filter((item) => {
    if (seenCategories.has(item.category)) return false;
    seenCategories.add(item.category);
    return true;
  }).slice(0, HEALTH_HOME_RAIL_LIMIT);
  const latestLimit = selectedCategorySlug ? HEALTH_CATEGORY_PREVIEW_LIMIT : HEALTH_HOME_LATEST_LIMIT;
  const latestArticles = articles.slice(0, latestLimit);
  const archivedArticles = articles.slice(latestLimit);
  const readingPaths = selectedCategorySlug ? "" : renderHealthReadingPaths(articles);
  const visualArticles = [89,92,95].map((number) => articles.find((item) => safePublicHref(item.href) === `/article/article${number}` && item.visualFormat && item.slides?.length)).filter(Boolean);
  const latestRevisionTime = sortedArticles.reduce((latest, article) => Math.max(latest, publicContentRevisionTime(article) || 0), 0);
  const latestRevision = latestRevisionTime ? new Date(latestRevisionTime).toISOString() : "";
  const contentMarkup = `
    ${renderHealthPublicationHeader({ home: true })}
    <section class="health-discovery" aria-label="照顧主題導覽">${renderHealthTopicNavigation(topics, sortedArticles, selectedCategorySlug)}</section>
    ${feature ? `
      ${selectedCategorySlug ? "" : `<section class="health-board" id="health-reading" aria-label="焦點與延伸閱讀"><div class="health-board-grid">
        <article class="health-feature"><a href="${escapePublicHtml(safePublicHref(feature.href))}">
          <img ${healthImageAttrs(feature, { priority: true })} width="1200" height="675" />
          <div class="health-feature-copy"><div class="health-card-meta"><span class="health-label">焦點文章</span>${feature.date ? `<time class="health-date">${escapePublicHtml(feature.date)}</time>` : ""}</div><h2>${escapePublicHtml(feature.title)}</h2><p>${escapePublicHtml(feature.excerpt || feature.subtitle || "")}</p><span class="health-text-link">閱讀全文 <span aria-hidden="true">↗</span></span></div>
        </a></article>
        <aside class="ranking-panel" aria-labelledby="health-next-title"><div class="ranking-title"><p class="eyebrow">換個主題，接著讀</p><h2 id="health-next-title">也許你正在找</h2></div><ol>${railArticles.map((item) => `<li><a href="${escapePublicHtml(safePublicHref(item.href))}"><img ${healthImageAttrs(item)} width="240" height="180" /><div><span class="health-label">${escapePublicHtml(item.category || "照顧知識")}</span><h3>${escapePublicHtml(item.title)}</h3></div></a></li>`).join("")}</ol><a class="health-text-link" href="${readingPaths ? "#health-paths-title" : "/guides/day-care"}">依需求找照顧專題 <span aria-hidden="true">↓</span></a></aside>
      </div></section>`}
      <section class="health-latest${selectedCategorySlug ? " health-category-results" : ""}"${selectedCategorySlug ? ' id="health-reading"' : ""} aria-labelledby="health-latest-title">
        ${healthSectionHeading("health-latest-title", selectedCategorySlug ? "依照主題，找到你要的知識" : "持續更新的照顧知識", escapePublicHtml(selectedCategorySlug ? `${selectedTopic?.name || "這個主題"}的文章` : "最新文章"))}
        <div class="health-latest-grid">${latestArticles.map((item, index) => renderHealthListCard(item, { priority: Boolean(selectedCategorySlug) && index === 0 })).join("")}</div>
      </section>
      ${readingPaths}
      ${!selectedCategorySlug && visualArticles.length ? `<section class="health-format-hub" aria-labelledby="health-format-title">${healthSectionHeading("health-format-title", "幾分鐘，讀懂一個照顧主題", "圖解，讓理解更容易", "/search?q=懶人包", "更多懶人包")}<div class="health-format-grid">${visualArticles.map((item) => renderHealthListCard(item, { format: true })).join("")}</div></section>` : ""}
      <section class="health-library" aria-label="完整文章與閱讀資源">
        <div class="health-library-heading"><div><h2>繼續探索照顧知識</h2><p>${articles.length} 篇文章，依照你的步調慢慢讀。</p></div><a class="health-text-link" href="/search">搜尋全部文章 <span aria-hidden="true">↗</span></a></div>
        ${archivedArticles.length ? `<details class="health-archive-index"><summary>完整文章索引<span>另有 ${archivedArticles.length} 篇</span></summary><ul>${archivedArticles.map((item) => `<li><a href="${escapePublicHtml(safePublicHref(item.href))}">${escapePublicHtml(item.title)}</a></li>`).join("")}</ul></details>` : ""}
        ${supersededArticles.length ? `<details class="health-archive-index health-superseded-index"><summary>歷史版本<span>${supersededArticles.length} 篇，主畫面已保留新版</span></summary><ul>${supersededArticles.map((item) => `<li><a href="${escapePublicHtml(safePublicHref(item.href))}">${escapePublicHtml(item.title)}${item.date ? `（${escapePublicHtml(item.date)} 舊版）` : "（舊版）"}</a></li>`).join("")}</ul></details>` : ""}
        <a class="health-editorial-link" href="/editorial-policy"><span>關於健康3.0</span><strong>我們如何整理照顧知識 <span aria-hidden="true">↗</span></strong></a>
      </section>
    ` : `<section class="health-empty-state" id="health-reading"><h2>${escapePublicHtml(selectedTopic?.name || "照顧文章")}</h2><p>這個主題目前還沒有文章，先從其他照顧知識開始閱讀。</p><a href="/health">回到健康3.0 <span aria-hidden="true">→</span></a></section>`}
  `;
  const renderRevision = publicContentBatchRevision(contentMarkup);
  return `
    <div class="health-page health-page--editorial" data-public-content-index="health" data-public-layout="${PUBLIC_HEALTH_LAYOUT}" data-health-design="editorial-home-type-20260914" data-health-content-revision="${escapePublicHtml(renderRevision)}" data-public-content-updated-at="${escapePublicHtml(latestRevision)}" data-health-article-count="${sortedArticles.length}" data-health-category="${escapePublicHtml(selectedCategorySlug)}">
      ${contentMarkup}
    </div>
  `;
}
