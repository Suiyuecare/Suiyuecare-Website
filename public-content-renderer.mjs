import {
  articlePublicHref,
  articlePublicSlug
} from "./article-url-map.mjs";

const SITE_ORIGIN = "https://www.suiyuecare.com";

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
  if (!raw) return "/assets/fallbacks/health-article-fallback.jpg";
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
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
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

  return `
    <article class="article-page ${isPptIconPack ? "article-page--ppt-icon-pack" : ""}" data-public-content-type="${escapePublicHtml(article.contentKind || "article")}">
      <div class="article-topbar">
        <a class="article-back" href="/health">返回健康3.0</a>
        <span class="article-category">${escapePublicHtml(article.category || "照顧知識")}</span>
      </div>

      <header class="article-hero">
        <figure>
          <img src="${escapePublicHtml(image)}" alt="${escapePublicHtml(imageAlt)}" style="object-position:${escapePublicHtml(objectPosition)}" fetchpriority="high" decoding="async" />
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
              <a href="${escapePublicHtml(safePublicHref(article.ctaUrl, "/contact"))}">${escapePublicHtml(article.ctaText || "預約照顧諮詢")}</a>
            </div>
            ${renderReferences(article)}
          </div>
        </div>

        <aside class="article-ads" aria-label="側邊推薦">
          <a class="article-ad featured" href="/contact"><span>Suiyuecare Corps.</span><strong>第一次照顧諮詢</strong><p>不知道該選居家、日照還是復能？讓專人協助判斷。</p><em>預約諮詢</em></a>
          <a class="article-ad" href="/courses"><span>Care Course</span><strong>家屬照顧課</strong><p>把移位、用餐、跌倒預防變成看得懂的日常技巧。</p></a>
          <a class="article-ad" href="/talent"><span>We want you</span><strong>加入歲悅團隊</strong><p>居服員、督導、日照照服員招募中。</p></a>
        </aside>

        ${related.length ? `
          <section class="article-related">
            <div class="article-related-head"><span>Related Articles</span><strong>延伸閱讀</strong></div>
            <div class="article-related-grid">
              ${related.slice(0, 7).map((item) => `
                <a href="${escapePublicHtml(safePublicHref(item.href, "/health"))}">
                  <img src="${escapePublicHtml(normalizePublicAssetUrl(item.image))}" alt="${escapePublicHtml(item.title || "延伸閱讀")}" loading="lazy" decoding="async" />
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
}

export function renderPublicHealthIndex(items = [], categories = []) {
  const articles = Array.isArray(items) ? items.filter(Boolean) : [];
  const feature = articles[0];
  const categoryNames = categories
    .map((category) => category?.display_label || category?.name)
    .filter(Boolean);
  return `
    <div class="health-page" data-public-content-index="health">
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
        <nav class="health-cats" aria-label="文章分類">
          <a aria-current="page" href="/health">全部文章</a>
          ${[...new Set(categoryNames)].map((name) => `<a href="/search?q=${encodeURIComponent(name)}">${escapePublicHtml(name)}</a>`).join("")}
        </nav>
      </section>

      ${feature ? `
        <section class="health-board health-board--prerendered">
          <article class="health-feature">
            <a href="${escapePublicHtml(feature.href)}">
              <img src="${escapePublicHtml(normalizePublicAssetUrl(feature.image))}" alt="${escapePublicHtml(feature.title)}" fetchpriority="high" decoding="async" />
              <div><span class="health-tag">本週精選</span><h2>${escapePublicHtml(feature.title)}</h2><p>${escapePublicHtml(feature.subtitle || feature.excerpt || "")}</p><span class="health-readmore">閱讀更多</span></div>
            </a>
          </article>
          <aside class="ranking-panel">
            <div class="ranking-title"><span>Ranking</span><h2>熱門文章</h2></div>
            <ol>${articles.slice(0, 8).map((item) => `<li><a href="${escapePublicHtml(item.href)}">${escapePublicHtml(item.title)}</a></li>`).join("")}</ol>
          </aside>
        </section>

        <section class="health-latest">
          <div class="health-section-head"><div><p class="eyebrow">Articles</p><h2>全部照顧文章</h2></div><span>${articles.length} 篇</span></div>
          <div class="health-latest-grid">
            ${articles.map((item) => `
              <article class="health-list-card">
                <a href="${escapePublicHtml(item.href)}">
                  <img src="${escapePublicHtml(normalizePublicAssetUrl(item.image))}" alt="${escapePublicHtml(item.title)}" loading="lazy" decoding="async" />
                  <div><span>${escapePublicHtml(item.category || "照顧知識")}</span><h3>${escapePublicHtml(item.title)}</h3><p>${escapePublicHtml(item.subtitle || item.excerpt || "")}</p></div>
                </a>
              </article>
            `).join("")}
          </div>
        </section>
      ` : `<section class="health-empty-state"><h2>文章整理中</h2><p>健康3.0內容會在審核發布後顯示於此。</p></section>`}
    </div>
  `;
}
