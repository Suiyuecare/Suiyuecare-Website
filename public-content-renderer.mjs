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

const SITE_ORIGIN = "https://www.suiyuecare.com";
const HEALTH_ARTICLE_PREVIEW_LIMIT = 9;
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
  const raw = String(value || "").trim();
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
    <section class="article-references">
      <h2>參考資料</h2>
      <ol>${rows.map((item) => {
        const label = escapePublicHtml(item.citation || item.name || item.url);
        return `<li>${item.url ? `<a href="${escapePublicHtml(safePublicHref(item.url, ""))}" target="_blank" rel="noopener">${label}</a>` : label}</li>`;
      }).join("")}</ol>
    </section>
  `;
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

export function renderPublicArticleLayout(article = {}, options = {}) {
  const related = Array.isArray(options.related) ? options.related : [];
  const hasSlideDeck = Boolean(options.slideDeckHtml);
  const isPptIconPack = article.visualFormat === "ppt-icon-pack";
  const image = normalizePublicAssetUrl(article.image);
  const imageAlt = article.imageAlt || article.title || "健康3.0文章主圖";
  const objectPosition = String(article.focalPoint || "center").replace(/[^a-z0-9% .-]/gi, "");
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

  const html = `
    <article class="article-page ${isPptIconPack ? "article-page--ppt-icon-pack" : ""}" data-public-layout="article-unified-v1" data-public-content-type="${escapePublicHtml(contentKind)}" data-public-content-key="${escapePublicHtml(contentKey)}" data-public-content-updated-at="${escapePublicHtml(contentUpdatedAt)}">
      <div class="article-topbar">
        <a class="article-back" href="/health">返回健康3.0</a>
        <span class="article-category">${escapePublicHtml(article.category || "照顧知識")}</span>
      </div>

      <header class="article-hero">
        <figure>
          <img src="${escapePublicHtml(image)}" alt="${escapePublicHtml(imageAlt)}" data-fallback-src="${HEALTH_FALLBACK_IMAGE}" style="object-position:${escapePublicHtml(objectPosition)}" loading="eager" fetchpriority="high" decoding="async" />
          <figcaption class="${isPptIconPack ? "article-hero-caption--sr-only" : ""}">
            <h1>${escapePublicHtml(article.title || "未命名文章")}</h1>
            <p>${escapePublicHtml(article.subtitle || article.excerpt || "")}</p>
            ${article.imageCaption ? `<small class="article-hero-photo-caption">${escapePublicHtml(article.imageCaption)}</small>` : ""}
          </figcaption>
        </figure>
      </header>

      <section class="article-layout">
        <div class="article-main">
          <div class="article-meta">
            <span class="meta-editor">編輯人｜${escapePublicHtml(article.author || "歲悅照顧編輯部")}</span>
            <time class="meta-date" datetime="${escapePublicHtml(article.publishedAt || "")}">${escapePublicHtml(article.date || publicDateLabel(article.publishedAt))}</time>
            ${article.readingMinutes ? `<span class="meta-editor">閱讀時間｜${Number(article.readingMinutes)} 分鐘</span>` : ""}
            ${article.targetAudience ? `<span class="meta-editor">適合｜${escapePublicHtml(article.targetAudience)}</span>` : ""}
            ${renderTagLinks(article.tags)}
          </div>

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
              <a href="${escapePublicHtml(safePublicHref(article.ctaUrl, "/contact"))}" ${contactContext}>${escapePublicHtml(article.ctaText || "預約照顧諮詢")}</a>
            </div>
            ${renderReferences(article)}
          </div>
        </div>

        <aside class="article-ads" aria-label="側邊推薦">
          <a class="article-ad featured" href="/contact" ${contactContext}><span>Suiyuecare Corps.</span><strong>第一次照顧諮詢</strong><p>不知道該選居家、日照還是復能？讓專人協助判斷。</p><em>預約諮詢</em></a>
          <a class="article-ad" href="/courses"><span>Care Course</span><strong>家屬照顧課</strong><p>把移位、用餐、跌倒預防變成看得懂的日常技巧。</p></a>
          <a class="article-ad" href="/talent"><span>We want you</span><strong>加入歲悅團隊</strong><p>居服員、督導、日照照服員招募中。</p></a>
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

function articleMatchesHealthSection(article, aliases = []) {
  const normalizedAliases = aliases.map(healthCategorySlug);
  const values = [
    article.categorySlug,
    article.category,
    article.contentType,
    article.categoryType,
    article.categorySection,
    ...(Array.isArray(article.tags) ? article.tags : [])
  ].map(healthCategorySlug);
  return values.some((value) => normalizedAliases.some((alias) => value === alias || value.includes(alias)));
}

function healthImageAttrs(article = {}, { priority = false } = {}) {
  const focalPoint = String(article.focalPoint || "center").replace(/[^a-z0-9% .-]/gi, "");
  return [
    `src="${escapePublicHtml(normalizePublicAssetUrl(article.image))}"`,
    `alt="${escapePublicHtml(article.imageAlt || article.title || "健康3.0文章圖片")}"`,
    `data-fallback-src="${HEALTH_FALLBACK_IMAGE}"`,
    `style="object-position:${escapePublicHtml(focalPoint)}"`,
    `loading="${priority ? "eager" : "lazy"}"`,
    `decoding="async"`,
    priority ? `fetchpriority="high"` : ""
  ].filter(Boolean).join(" ");
}

function renderHealthListCard(item) {
  return `
    <article class="health-list-card">
      <a href="${escapePublicHtml(safePublicHref(item.href, "/health"))}">
        <img ${healthImageAttrs(item)} />
        <div>
          <span>${escapePublicHtml(item.category || "照顧知識")}</span>
          <h3>${escapePublicHtml(item.title)}</h3>
          <p>${escapePublicHtml(item.subtitle || item.excerpt || "")}</p>
          ${(item.author || item.date) ? `<small>${escapePublicHtml([item.author, item.date].filter(Boolean).join(" · "))}</small>` : ""}
        </div>
      </a>
    </article>
  `;
}

function renderHealthResourceCard(item, label) {
  return `
    <a class="health-pack-card" href="${escapePublicHtml(safePublicHref(item.href, "/health"))}">
      <img ${healthImageAttrs(item)} />
      <div><span>${escapePublicHtml(label)}</span><h3>${escapePublicHtml(item.title)}</h3><p>${escapePublicHtml(item.subtitle || item.excerpt || "")}</p></div>
    </a>
  `;
}

function renderHealthVideoCard(item) {
  const href = safePublicHref(item.href, "/health");
  const media = item.videoEmbedUrl
    ? item.videoProvider === "youtube" || item.videoProvider === "vimeo"
      ? `<iframe src="${escapePublicHtml(item.videoEmbedUrl)}" title="${escapePublicHtml(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
      : `<video src="${escapePublicHtml(item.videoEmbedUrl)}" controls preload="metadata" poster="${escapePublicHtml(normalizePublicAssetUrl(item.image))}"></video>`
    : `<img ${healthImageAttrs(item)} />`;
  return `
    <article class="health-video-card ${item.videoEmbedUrl ? "has-video" : ""}">
      ${media}
      <div><span>${escapePublicHtml(item.videoLabel || item.category || "影音")}${item.videoDuration ? ` · ${escapePublicHtml(item.videoDuration)}` : ""}</span><h3>${escapePublicHtml(item.title)}</h3><p>${escapePublicHtml(item.videoCaption || item.subtitle || item.excerpt || "")}</p><a href="${escapePublicHtml(href)}">閱讀更多 &gt;</a></div>
    </article>
  `;
}

function healthSectionUrl(categories, aliases, fallbackQuery) {
  const normalizedAliases = aliases.map(healthCategorySlug);
  const matched = (Array.isArray(categories) ? categories : []).find((category) => {
    const values = [category.slug, category.type, category.sectionKey, category.section_key, category.name, category.display_label].map(healthCategorySlug);
    return values.some((value) => normalizedAliases.includes(value));
  });
  const slug = matched?.slug || matched?.name || matched?.display_label;
  return slug ? `/health?category=${encodeURIComponent(slug)}` : `/search?q=${encodeURIComponent(fallbackQuery)}`;
}

export function renderPublicHealthIndex(items = [], categories = [], options = {}) {
  const selectedCategorySlug = typeof options === "string" ? options : options.selectedCategorySlug || "";
  const allArticles = (Array.isArray(items) ? items.filter(Boolean) : [])
    .map((article, index) => ({ article, index }))
    .sort((left, right) => {
      const leftTime = publicContentPublishedTime(left.article) || 0;
      const rightTime = publicContentPublishedTime(right.article) || 0;
      return rightTime - leftTime || left.index - right.index;
    })
    .map(({ article }) => article);
  const topics = getUniqueHealthTopics(categories, allArticles);
  const selectedTopic = resolveHealthTopic(topics, selectedCategorySlug);
  const articles = selectedCategorySlug
    ? allArticles.filter((article) => articleMatchesHealthTopic(article, selectedTopic))
    : allArticles;
  const latestArticles = articles.slice(0, HEALTH_ARTICLE_PREVIEW_LIMIT);
  const archivedArticles = articles.slice(HEALTH_ARTICLE_PREVIEW_LIMIT);
  const feature = articles[0];
  const guideArticles = allArticles.filter((article) => articleMatchesHealthSection(article, healthSectionCategorySlugs.guides)).slice(0, 6);
  const eventArticles = allArticles.filter((article) => articleMatchesHealthSection(article, healthSectionCategorySlugs.events)).slice(0, 3);
  const videoArticles = allArticles.filter((article) => articleMatchesHealthSection(article, healthSectionCategorySlugs.videos)).slice(0, 4);
  const latestRevisionTime = allArticles.reduce((latest, article) => Math.max(latest, publicContentRevisionTime(article) || 0), 0);
  const latestRevision = latestRevisionTime ? new Date(latestRevisionTime).toISOString() : "";
  const contentMarkup = `
      <section class="health-hero">
        <div class="health-topline">
          <div>
            <p class="eyebrow">Health 3.0</p>
            <h1>健康3.0</h1>
            <p>照顧知識專欄，整理疾病徵兆、飲食營養、復能運動、失智照顧與家屬實用技巧。</p>
          </div>
          <form class="health-search" action="/search">
            <input name="q" type="search" aria-label="搜尋健康3.0文章" placeholder="搜尋跌倒、失智、營養、復能" />
            <button type="submit">搜尋</button>
          </form>
        </div>
        ${renderHealthTopicNavigation(topics, allArticles, selectedCategorySlug)}
      </section>

      ${feature ? `
        ${selectedCategorySlug ? "" : `<section class="health-board">
          <article class="health-feature">
            <a href="${escapePublicHtml(safePublicHref(feature.href, "/health"))}">
              <img ${healthImageAttrs(feature, { priority: true })} />
              <div><span class="health-tag">最新發布</span><h2>${escapePublicHtml(feature.title)}</h2><p>${escapePublicHtml(feature.subtitle || feature.excerpt || "")}</p><span class="health-readmore">閱讀更多</span></div>
            </a>
          </article>
          <aside class="ranking-panel">
            <div class="ranking-title"><span>Latest</span><h2>最新文章</h2></div>
            <ol>${articles.slice(0, 8).map((item) => `<li><a href="${escapePublicHtml(safePublicHref(item.href, "/health"))}">${escapePublicHtml(item.title)}</a></li>`).join("")}</ol>
          </aside>
        </section>`}

        <section class="health-latest ${selectedCategorySlug ? "health-category-results" : ""}" aria-labelledby="health-latest-title">
          <div class="health-section-head"><div><p class="eyebrow">Articles</p><h2 id="health-latest-title">${escapePublicHtml(selectedCategorySlug ? `${selectedTopic?.name || "這個主題"}的全部文章` : "最新照顧文章")}</h2></div><span>共 ${articles.length} 篇</span></div>
          <div class="health-latest-grid">
            ${latestArticles.map(renderHealthListCard).join("")}
          </div>
          ${archivedArticles.length ? `
            <details class="health-archive-index">
              <summary>展開完整文章索引（另有 ${archivedArticles.length} 篇）</summary>
              <ul>${archivedArticles.map((item) => `<li><a href="${escapePublicHtml(safePublicHref(item.href, "/health"))}">${escapePublicHtml(item.title)}</a></li>`).join("")}</ul>
            </details>
          ` : ""}
        </section>

        ${!selectedCategorySlug && guideArticles.length ? `<section class="health-pack-section"><div class="health-section-head"><div><p class="eyebrow">Guides</p><h2>懶人包</h2></div><a href="${escapePublicHtml(healthSectionUrl(topics, healthSectionCategorySlugs.guides, "懶人包"))}">更多懶人包</a></div><div class="health-pack-grid">${guideArticles.map((item) => renderHealthResourceCard(item, "懶人包")).join("")}</div></section>` : ""}
        ${!selectedCategorySlug && eventArticles.length ? `<section class="health-event-section"><div class="health-section-head"><div><p class="eyebrow">Events</p><h2>活動專區</h2></div><a href="${escapePublicHtml(healthSectionUrl(topics, healthSectionCategorySlugs.events, "活動專區"))}">更多活動</a></div><div class="health-event-grid">${eventArticles.map((item) => renderHealthResourceCard(item, "活動" )).join("")}</div></section>` : ""}
        ${!selectedCategorySlug && videoArticles.length ? `<section class="health-media-hub"><div class="health-section-head"><div><p class="eyebrow">Video</p><h2>影音與短影片</h2></div><a href="${escapePublicHtml(healthSectionUrl(topics, healthSectionCategorySlugs.videos, "影片"))}">更多影音</a></div><div class="health-media-grid">${videoArticles.map(renderHealthVideoCard).join("")}</div></section>` : ""}
      ` : `<section class="health-empty-state"><h2>${selectedCategorySlug ? "這個分類目前還沒有已發布文章" : "文章整理中"}</h2><p>${selectedCategorySlug ? "可以先查看全部文章或搜尋其他照顧主題。" : "健康3.0內容會在審核發布後顯示於此。"}</p><a href="/health">查看全部文章</a></section>`}
  `;
  const batchRevision = publicContentBatchRevision(contentMarkup);
  return `
    <div class="health-page" data-public-content-index="health" data-public-layout="${PUBLIC_HEALTH_LAYOUT}" data-health-content-revision="${escapePublicHtml(batchRevision)}" data-public-content-updated-at="${escapePublicHtml(latestRevision)}" data-health-article-count="${allArticles.length}" data-health-category="${escapePublicHtml(selectedCategorySlug)}">
      ${contentMarkup}
    </div>
  `;
}
