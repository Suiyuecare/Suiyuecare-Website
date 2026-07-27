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

function icon(name = "pulse") {
  const icons = {
    pulse: `<svg viewBox="0 0 48 48" focusable="false"><path d="M5 25h8l5-12 8 24 6-16h11"/><path d="M36 8a12 12 0 0 1 0 24"/></svg>`,
    gauge: `<svg viewBox="0 0 48 48" focusable="false"><path d="M9 34a17 17 0 1 1 30 0"/><path d="M24 34l10-14"/><path d="M16 34h16"/></svg>`,
    calendar: `<svg viewBox="0 0 48 48" focusable="false"><rect x="9" y="11" width="30" height="28" rx="4"/><path d="M16 7v8M32 7v8M9 20h30M16 27h5M27 27h5M16 34h5M27 34h5"/></svg>`,
    clock: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="24" r="16"/><path d="M24 15v10l7 4"/></svg>`,
    sun: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="24" r="8"/><path d="M24 5v7M24 36v7M5 24h7M36 24h7M10.5 10.5l5 5M32.5 32.5l5 5M37.5 10.5l-5 5M15.5 32.5l-5 5"/></svg>`,
    moon: `<svg viewBox="0 0 48 48" focusable="false"><path d="M32 38A16 16 0 0 1 27 7a13 13 0 1 0 5 31Z"/></svg>`,
    warning: `<svg viewBox="0 0 48 48" focusable="false"><path d="M24 7 43 40H5L24 7Z"/><path d="M24 18v10M24 34h.1"/></svg>`,
    phone: `<svg viewBox="0 0 48 48" focusable="false"><path d="M16 8h7l3 8-4 3a23 23 0 0 0 8 8l3-4 8 3v7c0 4-3 7-7 7A27 27 0 0 1 9 15c0-4 3-7 7-7Z"/></svg>`,
    pill: `<svg viewBox="0 0 48 48" focusable="false"><path d="M18 35 35 18a9 9 0 0 0-13-13L5 22a9 9 0 0 0 13 13Z"/><path d="m14 26 8 8"/></svg>`,
    note: `<svg viewBox="0 0 48 48" focusable="false"><path d="M13 7h16l8 8v26H13Z"/><path d="M29 7v9h8M18 24h14M18 31h14M18 38h8"/></svg>`,
    person: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="13" r="6"/><path d="M14 41c1-9 5-14 10-14s9 5 10 14"/></svg>`,
    walk: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="25" cy="8" r="4"/><path d="M22 17 17 29l-4 10M25 18l6 8 8 2M22 28l8 4 2 9"/></svg>`,
    shield: `<svg viewBox="0 0 48 48" focusable="false"><path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11Z"/><path d="m16 24 5 5 11-12"/></svg>`,
    home: `<svg viewBox="0 0 48 48" focusable="false"><path d="M7 22 24 8l17 14"/><path d="M13 20v21h22V20"/><path d="M20 41V29h8v12"/></svg>`,
    heart: `<svg viewBox="0 0 48 48" focusable="false"><path d="M24 40S8 30 8 18A9 9 0 0 1 24 12a9 9 0 0 1 16 6c0 12-16 22-16 22Z"/><path d="M15 25h6l3-6 4 12 3-6h5"/></svg>`,
    brain: `<svg viewBox="0 0 48 48" focusable="false"><path d="M18 39a8 8 0 0 1-8-8 8 8 0 0 1 3-6 8 8 0 0 1 4-15 9 9 0 0 1 7-4 9 9 0 0 1 7 4 8 8 0 0 1 4 15 8 8 0 0 1-5 14"/><path d="M24 10v29M17 19h7M24 24h8M16 30h8"/></svg>`,
    team: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="18" cy="16" r="5"/><circle cx="31" cy="14" r="6"/><path d="M8 40c1-8 5-13 10-13s9 5 10 13"/><path d="M23 27c2-3 5-5 8-5 5 0 9 6 10 18"/></svg>`,
    checklist: `<svg viewBox="0 0 48 48" focusable="false"><rect x="10" y="6" width="28" height="36" rx="4"/><path d="m16 18 3 3 6-7M28 19h5M16 30l3 3 6-7M28 31h5"/></svg>`
  };
  return `<span class="slide-visual-icon" aria-hidden="true">${icons[name] || icons.pulse}</span>`;
}

function tiles(items = [], type = "card") {
  if (!Array.isArray(items) || items.length === 0) return "";
  const tileClass = type === "alert" ? "ppt-icon-alert" : "ppt-icon-tile";
  return `<div class="ppt-icon-tiles ppt-icon-tiles--${type}">${items.slice(0, 6).map((item) => {
    const tone = safeClassToken(item.tone);
    return `<div class="${tileClass} ${tone ? `tone-${tone}` : ""}">${icon(item.icon || (type === "alert" ? "warning" : "pulse"))}<div>${item.value ? `<b>${escapeHTML(item.value)}</b>` : ""}<span>${escapeHTML(item.label || item)}</span></div></div>`;
  }).join("")}</div>`;
}

function flow(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<div class="ppt-icon-flow">${items.slice(0, 4).map((step, index) => `<div class="ppt-icon-flow-step"><span>${String(index + 1).padStart(2, "0")}</span>${icon(step.icon || "note")}<b>${escapeHTML(step.label || "")}</b></div>`).join("")}</div>`;
}

function trend() {
  return `<div class="ppt-trend-board" aria-hidden="true"><svg viewBox="0 0 560 230" focusable="false"><path class="ppt-trend-grid" d="M0 36H560M0 115H560M0 194H560"/><path class="ppt-trend-line" d="M18 151C61 129 84 86 126 104S187 159 218 126S276 75 313 107S374 143 405 118S462 78 542 91"/><circle cx="18" cy="151" r="8"/><circle cx="126" cy="104" r="8"/><circle cx="218" cy="126" r="8"/><circle cx="313" cy="107" r="8"/><circle cx="405" cy="118" r="8"/><circle cx="542" cy="91" r="8"/></svg><span class="ppt-trend-caption">看連續變化，不挑單次數字</span></div>`;
}

function scene(visual = {}) {
  const layout = safeClassToken(visual.layout || "cards");
  const metric = visual.metric ? `<div class="ppt-icon-metric"><strong>${escapeHTML(visual.metric)}</strong><span>${escapeHTML(visual.metricLabel || "")}</span></div>` : "";
  return `<div class="ppt-icon-scene ppt-icon-scene--${layout}">${layout === "trend" ? trend() : ""}${metric}${tiles(visual.cards)}${tiles(visual.alerts, "alert")}${flow(visual.flow)}</div>`;
}

export function renderPptIconPackSlide(slide = {}, index = 0, total = 1, article = {}) {
  const visual = slide.visual || {};
  const layout = safeClassToken(visual.layout || "cards");
  const tone = safeClassToken(visual.tone || slide.tone);
  const takeaway = visual.takeaway || slide.points?.[0] || "把觀察做成固定流程。";
  return `<section class="article-slide article-slide--ppt ppt-layout-${layout} ${tone ? `tone-${tone}` : ""}" id="slide-${escapeHTML(article.slug)}-${index + 1}"><div class="ppt-slide-shell"><div class="ppt-slide-topline"><span>HEALTH 3.0 · 高血壓照顧</span><b>${String(index + 1).padStart(2, "0")} <i>/ ${String(total).padStart(2, "0")}</i></b></div><header class="ppt-slide-heading"><div class="ppt-slide-heading-icon">${icon(visual.icon || "pulse")}</div><div><span>${escapeHTML(slide.eyebrow || visual.eyebrow || "家庭照顧")}</span><h2>${escapeHTML(visual.title || slide.title || article.title || "")}</h2>${visual.subtitle ? `<p>${escapeHTML(visual.subtitle)}</p>` : ""}</div></header>${scene(visual)}<footer class="ppt-slide-footer"><div class="ppt-slide-action"><span>現在先做</span><strong>${escapeHTML(takeaway)}</strong></div>${visual.caption ? `<span>${escapeHTML(visual.caption)}</span>` : ""}</footer></div></section>`;
}
