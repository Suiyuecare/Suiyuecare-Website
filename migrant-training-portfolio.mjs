const text = (value) => typeof value === "string" ? value : "";

function escapeHtml(value) {
  return text(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
}

function safeUrl(value, image = false) {
  const url = text(value).trim();
  if (!url || /[\u0000-\u0020\u007f\\]/.test(url)) return "";
  if (/^\/(?!\/)/.test(url)) return url;
  if (!image && /^#[A-Za-z][\w:.-]*$/.test(url)) return url;
  if (image && /^assets\/[\w./%-]+$/.test(url) && !url.includes("..")) return `/${url}`;
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

function renderLinks(links, context = "") {
  if (!Array.isArray(links)) return "";
  const items = links.flatMap((link) => {
    if (!link || !text(link.label).trim()) return [];
    const url = safeUrl(link.url);
    if (!url) return [];
    const external = /^https?:\/\//.test(url);
    const anchor = url.startsWith("#") ? ' data-service-decision-link="portfolio"' : "";
    const accessibleLabel = context ? ` aria-label="${escapeHtml(`${context} ${link.label}${external ? '（另開視窗）' : ''}`)}"` : "";
    return [`<li><a href="${escapeHtml(url)}"${accessibleLabel}${anchor}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(link.label)}${external ? '<span class="migrant-portfolio-new-window">（另開視窗）</span>' : ""}</a>${text(link.note) ? `<p class="migrant-portfolio-link-note">${escapeHtml(link.note)}</p>` : ""}</li>`];
  });
  return items.length ? `<ul class="migrant-portfolio-links">${items.join("")}</ul>` : "";
}

function renderImages(images) {
  if (!Array.isArray(images)) return "";
  const figures = images.flatMap((item) => {
    if (!item || !text(item.alt).trim() || !text(item.caption).trim()) return [];
    const src = safeUrl(item.src, true);
    if (!src) return [];
    const dimensions = Number.isSafeInteger(item.width) && item.width > 0 && Number.isSafeInteger(item.height) && item.height > 0 ? ` width="${item.width}" height="${item.height}"` : "";
    const portrait = dimensions && item.height > item.width ? " migrant-portfolio-photo-portrait" : "";
    return [`<figure><a class="migrant-portfolio-photo${portrait}" href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`查看照片：${item.alt}（另開視窗）`)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(item.alt)}"${dimensions} loading="lazy" decoding="async"></a><figcaption>${escapeHtml(item.caption)}</figcaption></figure>`];
  });
  return figures.length ? `<div class="migrant-portfolio-gallery${figures.length === 1 ? " migrant-portfolio-gallery-single" : ""}">${figures.join("")}</div>` : "";
}

function renderMeta(program) {
  const values = [
    text(program.period) ? `<span class="migrant-portfolio-period">${escapeHtml(program.period)}</span>` : "",
    text(program.status) ? `<span class="migrant-portfolio-status">${escapeHtml(program.status)}</span>` : ""
  ].filter(Boolean);
  return values.length ? `<p class="migrant-portfolio-meta">${values.join("")}</p>` : "";
}

function renderLinkGroups(groups) {
  if (!Array.isArray(groups)) return "";
  const items = groups.flatMap((group) => {
    if (!group || !text(group.label).trim()) return [];
    const links = renderLinks(group.links, group.label);
    return links ? [`<div class="migrant-portfolio-link-group"><h5>${escapeHtml(group.label)}</h5>${links}</div>`] : [];
  });
  return items.length ? `<div class="migrant-portfolio-link-groups">${items.join("")}</div>` : "";
}

function renderChild(child, id) {
  return `<article class="migrant-portfolio-child" aria-labelledby="${id}"><header>${renderMeta(child)}<h4 id="${id}">${escapeHtml(child.title)}</h4></header>${text(child.summary) ? `<p class="migrant-portfolio-summary">${escapeHtml(child.summary)}</p>` : ""}${renderImages(child.images)}${renderLinks(child.links)}${renderLinkGroups(child.linkGroups)}</article>`;
}

/** Read-only portfolio: source data owns all dates, statuses, captions and claims. */
export function renderMigrantTrainingPortfolio(programs) {
  if (!Array.isArray(programs)) return "";
  const usedIds = new Set();
  const entries = programs.filter((program) => program && text(program.title).trim()).map((program, index) => {
    const slug = text(program.id).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || String(index + 1);
    const base = `migrant-project-${slug}`;
    const childCount = Array.isArray(program.children) ? program.children.filter((child) => child && text(child.title).trim()).length : 0;
    const ownedIds = (value) => [value, `${value}-heading`, ...Array.from({ length: childCount }, (_, childIndex) => `${value}-child-${childIndex + 1}`)];
    let id = base;
    let suffix = 2;
    while (ownedIds(id).some((value) => usedIds.has(value))) id = `${base}-${suffix++}`;
    ownedIds(id).forEach((value) => usedIds.add(value));
    return { program, id };
  });
  if (!entries.length) return "";
  const navigation = entries.map(({ program, id }) => `<li><a href="#${id}" data-service-decision-link="portfolio">${escapeHtml(program.title)}</a></li>`).join("");
  const cards = entries.map(({ program, id }) => {
    const children = Array.isArray(program.children) ? program.children.filter((child) => child && text(child.title).trim()) : [];
    const layoutClass = children.length ? " migrant-portfolio-card-group" : program.layout === "wide" ? " migrant-portfolio-card-wide" : "";
    return `<article id="${id}" class="migrant-portfolio-card${layoutClass}" aria-labelledby="${id}-heading" tabindex="-1"><header>${renderMeta(program)}<h3 id="${id}-heading">${escapeHtml(program.title)}</h3></header>${text(program.summary) ? `<p class="migrant-portfolio-summary">${escapeHtml(program.summary)}</p>` : ""}${renderImages(program.images)}${renderLinks(program.links)}${children.length ? `<div class="migrant-portfolio-children">${children.map((child, index) => renderChild(child, `${id}-child-${index + 1}`)).join("")}</div>` : ""}</article>`;
  }).join("");
  return `<section id="migrant-training-projects" class="migrant-training-portfolio" aria-labelledby="migrant-training-projects-heading"><div class="migrant-portfolio-heading"><p class="migrant-portfolio-eyebrow">移工培訓</p><h2 id="migrant-training-projects-heading">訓練實績與執行計畫</h2><p>從地方訓練到數位學習，查看各項計畫的活動紀錄、執行期間與公開資訊。</p></div><nav class="migrant-portfolio-nav" aria-label="培訓計畫頁內導覽"><ul>${navigation}</ul></nav><div class="migrant-portfolio-grid">${cards}</div><p class="migrant-portfolio-disclaimer">照片年份與計畫期間分別標示；活動場次、參加資格、名額及報名狀態，以各活動或報名頁的最新公告為準。</p></section>`;
}
