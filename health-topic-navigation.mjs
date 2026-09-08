const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

export const COMMON_HEALTH_NEEDS = [
  { label: "失智怎麼照顧", query: "失智" },
  { label: "預防跌倒", query: "跌倒" },
  { label: "飲食與營養", query: "營養" },
  { label: "在家照顧", query: "居家" },
  { label: "認識日照", query: "日照" },
  { label: "復能與活動", query: "復能" },
  { label: "家屬支持", query: "家屬" }
];

export function normalizeHealthTopic(value = "") {
  return String(value).normalize("NFKC").trim().toLocaleLowerCase("zh-TW").replace(/[\s\p{P}\p{S}]+/gu, "");
}

function topicSlug(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
}

// A CMS category and its static counterpart may have different slugs. Keep all
// aliases so older category URLs still include both sets of articles.
export function getUniqueHealthTopics(categories = [], articles = []) {
  const topics = new Map();
  const sources = [
    ...categories.filter((category) => category?.show_in_nav !== false && category?.is_enabled !== false),
    ...articles.map((article) => ({ name: article.category, slug: article.categorySlug }))
  ];
  for (const category of sources) {
    const name = String(category?.display_label || category?.name || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    const key = normalizeHealthTopic(name);
    if (!key) continue;
    const slug = category.slug || topicSlug(name);
    const aliases = [slug, ...(category.aliases || []), topicSlug(name)].filter(Boolean);
    const existing = topics.get(key);
    if (existing) {
      existing.aliases = [...new Set([...existing.aliases, ...aliases])];
    } else {
      topics.set(key, { ...category, name, slug, key, aliases: [...new Set(aliases)] });
    }
  }
  return [...topics.values()];
}

export function resolveHealthTopic(topics = [], slug = "") {
  return topics.find((topic) => topic.slug === slug || topic.aliases?.includes(slug) || topic.key === normalizeHealthTopic(slug));
}

export function articleMatchesHealthTopic(article, topic) {
  return Boolean(topic) && (
    topic.aliases.includes(article.categorySlug)
    || normalizeHealthTopic(article.category) === topic.key
  );
}

export function renderHealthTopicNavigation(categories = [], articles = [], activeCategorySlug = "") {
  const topics = getUniqueHealthTopics(categories, articles);
  const active = resolveHealthTopic(topics, activeCategorySlug);
  return `
    <div class="health-topic-navigation">
      <p class="health-topic-heading">從常見需求開始找</p>
      <nav class="health-common-needs" aria-label="常見照顧需求">
        ${COMMON_HEALTH_NEEDS.map(({ label, query }) => `<a href="/search?q=${encodeURIComponent(query)}">${escapeHtml(label)}</a>`).join("")}
      </nav>
      <div class="health-topic-tools">
        <a class="health-all-articles" href="/search">全部文章</a>
        <details class="health-all-topics">
          <summary>全部主題<span class="health-topic-count">（${topics.length}）</span>${active ? `<span class="health-current-topic">目前：${escapeHtml(active.name)}</span>` : ""}</summary>
          <nav class="health-topic-list" aria-label="全部文章主題">
            ${topics.map((topic) => `<a href="/health?category=${encodeURIComponent(topic.slug)}"${active?.key === topic.key ? ' aria-current="page"' : ""}>${escapeHtml(topic.name)}</a>`).join("")}
          </nav>
        </details>
      </div>
    </div>
  `;
}
