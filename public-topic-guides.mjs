import { articlePublicSlug } from "./article-url-map.mjs";
import { canonicalArticleSourceSlug } from "./article-consolidation.mjs";

const SITE_ORIGIN = "https://www.suiyuecare.com";

export const DAY_CARE_GUIDE_ROUTE = Object.freeze({
  slug: "guides-day-care",
  path: "/guides/day-care",
  canonical: `${SITE_ORIGIN}/guides/day-care`,
  title: "日照入門指南：申請、費用、參觀與接送準備｜歲悅長照",
  description: "第一次安排日間照顧，從申請與費用說明、參觀準備，到前兩週適應與接送交接，依序找到歲悅現有照顧文章與服務資訊。",
  h1: "日照入門指南：從申請、參觀到接送準備",
  image: "/assets/hero-care-hero-fast.jpg",
  imageAlt: "歲悅長照照顧服務",
  breadcrumbParent: Object.freeze({ name: "健康3.0", path: "/health" })
});

const GUIDE_STEPS = Object.freeze([
  { id: "topic-apply", label: "申請與費用", title: "先整理需求，再了解申請與費用", body: "從目前的生活需求與家庭安排開始，整理第一次諮詢想問的問題。服務項目與費用請接著查看日間照顧服務說明，再向中心確認適合的安排。", articles: ["article12"] },
  { id: "topic-visit", label: "參觀準備", title: "參觀時，把在意的日常細節問清楚", body: "除了空間，也可以先了解動線、活動、用餐、休息與家屬回報方式。以下文章提供參觀前的閱讀準備；實際參觀時間請與中心預約。", articles: ["article29"] },
  { id: "topic-settle", label: "適應與參與", title: "開始日照後，陪長輩找到參與的節奏", body: "第一次進入新環境，家屬常想知道怎麼陪伴、如何理解不想參加的反應。先閱讀適應與活動參與的文章，再與中心討論本人在意的事情。", articles: ["article7", "article138"] },
  { id: "topic-shuttle", label: "接送交接", title: "出門前與回家後，都把資訊接起來", body: "接送安排與交接也是日照生活的一部分。先了解早晚可以準備哪些資訊，再向中心確認接送範圍、時段與聯絡方式。", articles: ["article134"] }
]);

const SERVICE_READING = Object.freeze({
  "day-care": { title: "第一次安排日照，可以先讀這幾篇", description: "依照參觀、開始適應與接送的需要，繼續了解日照生活。", articles: ["article29", "article7", "article134"] },
  "home-care": { title: "安排居家照顧，可以先讀這幾篇", description: "從第一次諮詢、服務時段到人員交接，把家庭想確認的事情整理清楚。", articles: ["article12", "article133", "article137"] }
});

function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function text(value, limit = 300) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function normalizedTopic(value) {
  return text(value, 120).normalize("NFKC").toLowerCase().replace(/^#\s*/, "").replace(/\s+/g, " ");
}

// Callers supply the public inventory, after canonical-URL consolidation. These
// checks also reject explicitly unpublished rows accidentally passed by a caller.
function publicArticle(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  if (item.contentKind && item.contentKind !== "article") return null;
  if (item.is_enabled === false || item.isEnabled === false || (item.status && item.status !== "published")) return null;
  const publication = Date.parse(text(item.publishedAt || item.published_at, 80));
  if (Number.isFinite(publication) && publication > Date.now()) return null;
  const title = text(item.title, 240);
  if (!title) return null;
  let href = text(item.href, 2000);
  if (href) {
    if (/[\u0000-\u0020\u007f\\]/.test(href) || href.startsWith("//")) return null;
    try {
      const url = new URL(href, SITE_ORIGIN);
      if (url.origin !== SITE_ORIGIN || url.username || url.password || !/^\/article\/article[1-9]\d*$/.test(url.pathname)) return null;
      href = url.pathname;
    } catch { return null; }
  } else {
    const slug = articlePublicSlug(item.publicSlug || item.slug || item.sourceSlug, item.publicNumber ?? item.public_number);
    if (!slug) return null;
    href = `/article/${slug}`;
  }
  return { ...item, title, href };
}

function publishedTime(item) {
  const raw = text(item?.publishedAt || item?.published_at || item?.date, 80);
  const value = Date.parse(raw.replace(/^(\d{4})[./](\d{2})[./](\d{2})$/, "$1-$2-$3"));
  return Number.isFinite(value) ? value : 0;
}

function publicInventory(articles) {
  const byHref = new Map();
  for (const input of Array.isArray(articles) ? articles : []) {
    const item = publicArticle(input);
    if (!item) continue;
    const previous = byHref.get(item.href);
    if (!previous || publishedTime(item) > publishedTime(previous)
      || (publishedTime(item) === publishedTime(previous) && item.title < previous.title)) byHref.set(item.href, item);
  }
  return [...byHref.values()];
}

function selectedArticles(articles, slugs) {
  const byHref = new Map(publicInventory(articles).map((item) => [item.href, item]));
  return slugs.map((slug) => byHref.get(`/article/${slug}`)).filter(Boolean);
}

function renderReadingLinks(articles) {
  if (!articles.length) return "";
  return `<ul class="topic-reading-list">${articles.map((article) => `<li><a href="${escapeHtml(article.href)}"><span>${escapeHtml(article.title)}</span><span class="topic-reading-arrow" aria-hidden="true">→</span></a></li>`).join("")}</ul>`;
}

/** Render a guide without creating links for absent or unpublished articles. */
export function renderDayCareGuidePage(articles = []) {
  return `
    <article class="topic-guide-page" data-public-topic-guide="day-care">
      <nav class="topic-guide-breadcrumb" aria-label="麵包屑"><a href="/">首頁</a><span aria-hidden="true">／</span><a href="/health">健康3.0</a><span aria-hidden="true">／</span><span aria-current="page">日照入門指南</span></nav>
      <header class="topic-guide-intro"><p class="topic-guide-eyebrow">健康3.0 · 日間照顧</p><h1>${escapeHtml(DAY_CARE_GUIDE_ROUTE.h1)}</h1><p>第一次安排日照，先從目前最想確認的事情開始。這份指南把服務資訊與照顧文章放在一起，方便你一步一步準備。</p></header>
      <nav class="topic-guide-steps" aria-label="指南閱讀順序">${GUIDE_STEPS.map((step, index) => `<a href="#${step.id}"><span aria-hidden="true">0${index + 1}</span>${step.label}</a>`).join("")}</nav>
      <div class="topic-guide-sections">${GUIDE_STEPS.map((step, index) => `
        <section class="topic-guide-section" id="${step.id}" aria-labelledby="${step.id}-title"><p class="topic-guide-number" aria-hidden="true">0${index + 1}</p><div><h2 id="${step.id}-title">${step.title}</h2><p>${step.body}</p>${renderReadingLinks(selectedArticles(articles, step.articles))}${index === 0 ? '<a class="topic-guide-service-link" href="/day-care">查看日間照顧服務與費用說明 →</a>' : ""}</div></section>`).join("")}</div>
      <section class="topic-guide-next" aria-labelledby="topic-next-title"><h2 id="topic-next-title">把閱讀中的問題，帶到下一次諮詢</h2><p>想了解歲悅日照的地點、參觀與服務安排，可以從服務頁查看據點，再留下你的需求。</p><div class="topic-guide-actions"><a href="/day-care#day-care-service-locations">查看日照服務據點</a><a href="/contact" data-contact-need="日間照顧諮詢" data-contact-message="我閱讀了日照入門指南，想了解日照的資格、費用與參觀安排。">留下日照諮詢需求</a></div></section>
    </article>`;
}

/** Small text links keep the service page fast and its main contact form intact. */
export function renderServiceTopicReading(serviceSlug, articles = []) {
  const config = Object.hasOwn(SERVICE_READING, serviceSlug) ? SERVICE_READING[serviceSlug] : null;
  if (!config) return "";
  const selected = selectedArticles(articles, config.articles);
  if (!selected.length) return "";
  return `<section class="service-topic-reading" data-service-topic-reading="${serviceSlug}" aria-labelledby="topic-reading-${serviceSlug}"><h2 id="topic-reading-${serviceSlug}">${config.title}</h2><p>${config.description}</p>${renderReadingLinks(selected)}${serviceSlug === "day-care" ? `<a class="topic-guide-service-link" href="${DAY_CARE_GUIDE_ROUTE.path}">依序閱讀日照入門指南 →</a>` : ""}</section>`;
}

/** Returns true only when a matching service page's reading block changed. */
export function hydrateServiceTopicReading(root, serviceSlug, articles = []) {
  if (!Object.hasOwn(SERVICE_READING, serviceSlug) || !root?.querySelector) return false;
  const selector = `.one-minute-service-page.${serviceSlug}-page, .service-template-page.${serviceSlug}-page`;
  const page = root.matches?.(selector) ? root : root.querySelector(selector);
  if (!page) return false;
  const html = renderServiceTopicReading(serviceSlug, articles);
  const existing = [...page.querySelectorAll(`[data-service-topic-reading="${serviceSlug}"]`)];
  const holder = page.ownerDocument.createElement("div");
  holder.innerHTML = html;
  const next = holder.firstElementChild;
  if (existing.length === 1 && next && existing[0].outerHTML === next.outerHTML) return false;
  existing.forEach((node) => node.remove());
  if (!next) return existing.length > 0;
  const contact = page.querySelector(".service-contact-section");
  if (contact) contact.parentNode.insertBefore(next, contact);
  else page.append(next);
  return true;
}

const SERVICE_TOPIC_ALIASES = new Map([
  ...["日間照顧", "日照", "day-care", "day-care-knowledge"].map((topic) => [topic, "日間照顧"]),
  ...["居家照顧", "居家服務", "居服", "home-care", "home-care-knowledge"].map((topic) => [topic, "居家照顧"]),
  ...["社區據點", "community"].map((topic) => [topic, "社區據點"]),
  ...["護理復能", "nursing"].map((topic) => [topic, "護理復能"]),
  ...["移工培訓", "migrant-training"].map((topic) => [topic, "移工培訓"]),
  ...["教育品管", "quality"].map((topic) => [topic, "教育品管"]),
  ...["軟體系統", "software"].map((topic) => [topic, "軟體系統"])
]);
const FORMAT_CATEGORIES = new Set(["懶人包", "活動專區", "影音", "影片", "專家專欄", "照顧故事", "全部"]);

function articleTopics(item) {
  const category = normalizedTopic(item?.category);
  const tags = new Set((Array.isArray(item?.tags) ? item.tags : []).map(normalizedTopic).filter(Boolean));
  const service = [item?.relatedService, item?.category, item?.categorySlug, ...tags]
    .map(normalizedTopic).map((topic) => SERVICE_TOPIC_ALIASES.get(topic)).find(Boolean) || "";
  return { category: FORMAT_CATEGORIES.has(category) ? "" : category, tags, service };
}

function relatedScore(current, candidate) {
  if (current.service && candidate.service && current.service !== candidate.service) return 0;
  const sharedTags = [...current.tags].filter((tag) => candidate.tags.has(tag)).length;
  return (current.service && current.service === candidate.service ? 100 : 0)
    + (current.category && current.category === candidate.category ? 30 : 0)
    + Math.min(sharedTags, 3) * 10;
}

/**
 * Return article objects with canonical internal hrefs. Preserve valid curated
 * order, then fill only with topic matches. No unrelated "latest" filler.
 * Inventory must already exclude retired URLs; this module does not republish
 * or infer availability from the source-slug map.
 */
export function selectTopicRelatedArticles(current, articles = [], { limit = 7 } = {}) {
  const maximum = Number.isFinite(Number(limit)) ? Math.max(0, Math.min(7, Math.floor(Number(limit)))) : 7;
  if (!maximum || !current || typeof current !== "object") return [];
  const currentArticle = publicArticle({ ...current, title: text(current.title) || "current article" });
  if (!currentArticle) return [];
  const candidates = publicInventory(articles).filter((item) => item.href !== currentArticle.href);
  const byKey = new Map();
  for (const item of candidates) {
    for (const key of [item.slug, item.sourceSlug, item.publicSlug, item.href, item.href.split("/").pop()]) {
      if (typeof key === "string" && key) byKey.set(key, item);
    }
  }
  const selected = [];
  const seen = new Set();
  const add = (item) => { if (item && !seen.has(item.href) && selected.length < maximum) { seen.add(item.href); selected.push(item); } };
  for (const key of Array.isArray(current.relatedSlugs) ? current.relatedSlugs : []) {
    if (typeof key !== "string") continue;
    const canonicalKey = canonicalArticleSourceSlug(key);
    add(byKey.get(canonicalKey) || byKey.get(`/article/${articlePublicSlug(canonicalKey)}`)
      || byKey.get(key) || byKey.get(`/article/${articlePublicSlug(key)}`));
  }
  const topics = articleTopics(current);
  const ranked = candidates.map((item) => ({ item, score: relatedScore(topics, articleTopics(item)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || publishedTime(b.item) - publishedTime(a.item)
      || a.item.href.localeCompare(b.item.href, "en", { numeric: true }));
  ranked.forEach(({ item }) => add(item));
  return selected;
}
