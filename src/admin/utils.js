export function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatUpdatedAt(value) {
  if (!value) return "尚無日期";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "尚無日期";
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatCount(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat("zh-Hant-TW").format(value) : "--";
}

export function renderEnabledBadge(isEnabled) {
  const label = isEnabled ? "啟用" : "停用";
  const status = isEnabled ? "enabled" : "disabled";
  return `<span class="admin-state-badge" data-state="${status}">${label}</span>`;
}
