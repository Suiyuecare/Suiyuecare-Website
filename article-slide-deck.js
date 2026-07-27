import { renderPptIconPackSlide } from "./ppt-icon-pack.js";

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeClassToken(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 48);
}

function renderSlideVisual(slide = {}, article = {}, imageUrl) {
  const image = slide.image || article.image;
  if (!image) return "";
  return `<figure class="article-slide-visual"><img src="${escapeHTML(imageUrl(image))}" alt="${escapeHTML(slide.alt || slide.title || article.title || "懶人包視覺頁")}" loading="lazy" decoding="async" />${slide.visualLabel ? `<figcaption>${escapeHTML(slide.visualLabel)}</figcaption>` : ""}</figure>`;
}

export function renderArticleSlideDeck(article = {}, imageUrl = (image) => String(image || "")) {
  const slides = Array.isArray(article.slides) ? article.slides.filter(Boolean).slice(0, 10) : [];
  if (slides.length < 1) return "";
  const isIconPack = article.visualFormat === "ppt-icon-pack";
  const deckHint = isIconPack ? "每一頁只回答一個問題：要不要就醫、怎麼量、記什麼、怎麼做。" : "大圖、短句、清單，快速抓重點。";
  const content = isIconPack
    ? slides.map((slide, index) => renderPptIconPackSlide(slide, index, slides.length, article)).join("")
    : slides.map((slide, index) => {
      const classes = ["article-slide", slide.tone ? `tone-${safeClassToken(slide.tone)}` : ""].filter(Boolean).join(" ");
      return `<section class="${classes}" id="slide-${escapeHTML(article.slug)}-${index + 1}">${renderSlideVisual(slide, article, imageUrl)}<div class="article-slide-copy"><div class="article-slide-kicker"><span>${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}</span>${slide.eyebrow ? `<em>${escapeHTML(slide.eyebrow)}</em>` : ""}</div><h2>${escapeHTML(slide.title || "")}</h2>${slide.lede ? `<p class="article-slide-lede">${escapeHTML(slide.lede)}</p>` : ""}${slide.stat || slide.statLabel ? `<div class="article-slide-stat">${slide.stat ? `<b>${escapeHTML(slide.stat)}</b>` : ""}${slide.statLabel ? `<span>${escapeHTML(slide.statLabel)}</span>` : ""}</div>` : ""}${Array.isArray(slide.points) && slide.points.length ? `<ul>${slide.points.slice(0, 4).map((point) => `<li>${escapeHTML(point)}</li>`).join("")}</ul>` : ""}</div></section>`;
    }).join("");
  return `<section class="article-slide-deck ${isIconPack ? "article-slide-deck--ppt-icon-pack" : ""}" aria-label="${escapeHTML(article.title)} PPT式懶人包"><div class="article-slide-deck-head"><span>${isIconPack ? "健康 3.0 · 3 分鐘圖解" : "PPT式懶人包"}</span><strong>${isIconPack ? `${slides.length} 件家屬現在要知道的事` : `${slides.length} 頁速讀`}</strong><p>${deckHint}</p></div><nav class="article-slide-jump" aria-label="懶人包頁面索引">${slides.map((slide, index) => `<a href="#slide-${escapeHTML(article.slug)}-${index + 1}">${String(index + 1).padStart(2, "0")}</a>`).join("")}</nav><div class="article-slides">${content}</div></section>`;
}
