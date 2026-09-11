import { normalizePublicEditorialMetadata, safeEditorialHref } from "../../public-editorial.mjs";

export const EDITORIAL_IDENTITIES = [
  { key: "author", label: "作者", clearLabel: "清除作者補充資料" },
  { key: "reviewer", label: "審閱者", clearLabel: "清除審閱者資料" }
];
export const EDITORIAL_IDENTITY_FIELDS = [
  { key: "type", label: "類型", kind: "select" },
  { key: "name", label: "姓名或團隊名稱", max: 120 },
  { key: "role", label: "職稱", max: 120 },
  { key: "credentials", label: "資格", max: 200 },
  { key: "url", label: "介紹網址", max: 2000 },
  { key: "description", label: "簡介", max: 500, kind: "textarea" }
];
export const EDITORIAL_DATE_FIELDS = [
  { key: "reviewedAt", label: "內容審閱完成日期" },
  { key: "contentUpdatedAt", label: "實質內容更新日期" },
  { key: "sourceCheckedAt", label: "資料來源查核日期" }
];

const record = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const string = (value) => typeof value === "string" ? value : "";
export const editorialFieldName = (group, key) => `editorial_${group}${key ? `_${key}` : ""}`;

function dateInputValue(value) {
  const raw = string(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (!raw || Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed);
}

export function editorialFormValues(contentJson = {}, defaults = {}) {
  const editorial = record(record(contentJson).editorial);
  const values = {};
  for (const { key: group } of EDITORIAL_IDENTITIES) {
    const identity = record(editorial[group]);
    for (const { key } of EDITORIAL_IDENTITY_FIELDS) {
      let value = identity[key];
      if (key === "url") value = identity.url || identity.profileUrl;
      if (group === "author" && value === undefined) {
        if (key === "name") value = defaults.author_name;
        if (key === "role") value = defaults.author_title;
      }
      values[editorialFieldName(group, key)] = string(value);
    }
  }
  for (const { key } of EDITORIAL_DATE_FIELDS) values[editorialFieldName(key)] = dateInputValue(editorial[key]);
  return values;
}

/** Merge only edited controls; preserve unknown JSON and untouched date precision. */
export function mergeEditorialFormValues(contentJson = {}, initialValues = {}, values = {}, { clearedGroups = [] } = {}) {
  const original = record(contentJson);
  const editorial = { ...record(original.editorial) };
  let changed = false;
  for (const { key: group } of EDITORIAL_IDENTITIES) {
    const previousIdentity = record(editorial[group]);
    const identity = { ...previousIdentity };
    const changedFields = EDITORIAL_IDENTITY_FIELDS.filter(({ key }) => {
      const name = editorialFieldName(group, key);
      return Object.hasOwn(values, name) && (clearedGroups.includes(group) || string(values[name]) !== string(initialValues[name]));
    });
    if (!changedFields.length) continue;
    changed = true;
    // A newly supplied identity may reuse the visible, existing author byline.
    // The initial defaults alone never add editorial metadata on an ordinary save.
    if (group === "author" && changedFields.some(({ key }) => string(values[editorialFieldName(group, key)]).trim())) {
      for (const key of ["name", "role"]) {
        const value = string(values[editorialFieldName(group, key)]).trim();
        if (!Object.hasOwn(previousIdentity, key) && value) identity[key] = value;
      }
    }
    for (const { key } of changedFields) {
      const value = string(values[editorialFieldName(group, key)]).trim();
      if (value) identity[key] = value;
      else delete identity[key];
      if (key === "url") delete identity.profileUrl;
    }
    if (Object.keys(identity).length) editorial[group] = identity;
    else delete editorial[group];
  }
  for (const { key } of EDITORIAL_DATE_FIELDS) {
    const name = editorialFieldName(key);
    if (!Object.hasOwn(values, name) || (string(values[name]) === string(initialValues[name]) && !(key === "reviewedAt" && clearedGroups.includes("reviewer")))) continue;
    changed = true;
    const value = string(values[name]).trim();
    if (value) editorial[key] = value;
    else delete editorial[key];
  }
  if (!changed) return original;
  const result = { ...original };
  if (Object.keys(editorial).length) result.editorial = editorial;
  else delete result.editorial;
  return result;
}

export function validateEditorialFormValues(initialValues = {}, values = {}) {
  const errors = [];
  for (const { key: group, label } of EDITORIAL_IDENTITIES) {
    for (const field of EDITORIAL_IDENTITY_FIELDS) {
      const name = editorialFieldName(group, field.key);
      const value = string(values[name]).trim();
      if (!Object.hasOwn(values, name) || string(values[name]) === string(initialValues[name]) || !value) continue;
      if (field.key === "type" && !["Person", "Organization"].includes(value)) errors.push({ name, message: `請選擇${label}類型。` });
      if (field.key === "url" && !safeEditorialHref(value)) errors.push({ name, message: `${label}介紹網址請填 HTTPS 網址或以 / 開頭的站內路徑。` });
      if (field.max && value.length > field.max) errors.push({ name, message: `${label}${field.label}請保持在 ${field.max} 字以內。` });
    }
  }
  for (const { key, label } of EDITORIAL_DATE_FIELDS) {
    const name = editorialFieldName(key);
    const value = string(values[name]).trim();
    if (Object.hasOwn(values, name) && value && string(values[name]) !== string(initialValues[name]) && !normalizePublicEditorialMetadata({ [key]: value })[key]) {
      errors.push({ name, message: `${label}請填有效日期。` });
    }
  }
  return errors;
}

// Labels and field names are constants; saved content is applied using .value.
export function renderEditorialEditorFields() {
  return `<details class="admin-advanced-settings admin-field-wide" data-article-editorial-fields>
    <summary><span>署名與內容查核</span><small>選填作者介紹、審閱者與實際查核日期</small></summary>
    <p class="admin-simple-hint">作者姓名與職稱可沿用上方署名。只填已核實、適用於這篇文章的資料；未修改此區時，保留原有設定。</p>
    ${EDITORIAL_IDENTITIES.map(({ key: group, label, clearLabel }) => `<fieldset class="admin-nested-panel">
      <legend>${label}資訊</legend><div class="admin-form-grid compact">
      ${EDITORIAL_IDENTITY_FIELDS.map((field) => {
        const name = editorialFieldName(group, field.key);
        const labelText = `${label}${field.label}`;
        const attrs = `name="${name}" data-editorial-field data-editorial-group="${group}"`;
        const control = field.kind === "select"
          ? `<select ${attrs}><option value="">未指定</option><option value="Person">個人</option><option value="Organization">團隊／組織</option></select>`
          : field.kind === "textarea"
            ? `<textarea ${attrs} rows="3" maxlength="${field.max}"></textarea>`
            : `<input ${attrs} type="text" maxlength="${field.max}"${field.key === "url" ? ' placeholder="https://… 或 /about#team" inputmode="url"' : ""}>`;
        return `<label${field.kind === "textarea" || field.key === "url" ? ' class="admin-field-wide"' : ""}><span>${labelText}</span>${control}</label>`;
      }).join("")}
      <div class="admin-field-wide"><button type="button" class="admin-ghost-button" data-editorial-clear="${group}">${clearLabel}</button></div>
      </div></fieldset>`).join("")}
    <div class="admin-form-grid compact">${EDITORIAL_DATE_FIELDS.map(({ key, label }) => `<label><span>${label}</span><input type="date" name="${editorialFieldName(key)}" data-editorial-field data-editorial-group="dates"></label>`).join("")}</div>
    <p class="admin-simple-hint">公開署名介紹需有類型與姓名；公開審閱資訊另需審閱完成日期。更新與查核日期請依實際完成情況填寫。</p>
  </details>`;
}
