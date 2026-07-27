import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { canEditScope, canViewScope } from "./content-scope.js";
import { escapeHTML } from "./utils.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import {
  getVisualEditorPage,
  servicePreviewFields,
  structuredFieldSchemas,
  visualEditorPageList
} from "./visual-editor-manifest.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#visualEditorStatus");
const titleNode = document.querySelector("#visualEditorTitle");
const subtitleNode = document.querySelector("#visualEditorSubtitle");
const pagePicker = document.querySelector("#visualEditorPagePicker");
const openPageLink = document.querySelector("#visualEditorOpenPage");
const sectionList = document.querySelector("#visualEditorSectionList");
const sectionTitle = document.querySelector("#visualEditorSectionTitle");
const sectionDescription = document.querySelector("#visualEditorSectionDescription");
const inspectorBody = document.querySelector("#visualEditorInspectorBody");
const previewShell = document.querySelector(".visual-editor-preview-shell");
const previewFrame = document.querySelector("#visualEditorPreview");
const previewLoading = document.querySelector("#visualEditorPreviewLoading");
const editorState = document.querySelector("#visualEditorState");
const saveButton = document.querySelector("#visualEditorSave");
const submitButton = document.querySelector("#visualEditorSubmit");
const approveButton = document.querySelector("#visualEditorApprove");
const actionTitle = document.querySelector("#visualEditorActionTitle");
const actionHint = document.querySelector("#visualEditorActionHint");

let adminPermissions = {};
let currentProfileId = "";
let pageConfig = null;
let activeSectionId = "";
let records = [];
let loadedChangeSet = null;
let isDirty = false;
let isBusy = false;
let previewReady = false;

const editableColumnLabels = {
  eyebrow: "小標",
  title: "標題",
  subtitle: "副標題",
  body: "內文",
  description: "說明",
  summary: "摘要",
  link_text: "按鈕文字",
  link_url: "按鈕連結",
  date_label: "日期標示",
  badge_label: "標籤",
  hero_badge: "首圖標籤",
  hero_card_title: "首圖短標",
  primary_cta_text: "主要按鈕文字",
  primary_cta_url: "主要按鈕連結",
  secondary_cta_text: "次要按鈕文字",
  secondary_cta_url: "次要按鈕連結",
  employment_type: "職務類型",
  location: "工作地點",
  salary_text: "薪資",
  capacity_label: "招募名額",
  apply_button_text: "應徵按鈕文字"
};

const multilineColumns = new Set(["body", "description", "summary", "subtitle"]);
const homeModuleColumns = [
  "eyebrow", "title", "subtitle", "body", "badge_label", "date_label", "link_text", "link_url"
];
const recruitingPageColumns = [
  "eyebrow", "title", "subtitle", "body", "hero_badge", "hero_card_title",
  "primary_cta_text", "primary_cta_url", "secondary_cta_text", "secondary_cta_url"
];
const recruitingOpeningColumns = [
  "title", "subtitle", "summary", "employment_type", "location", "salary_text", "capacity_label", "apply_button_text"
];

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function cleanSnapshot(row = {}) {
  const snapshot = clone(row) || {};
  delete snapshot.image;
  delete snapshot.hero_image;
  delete snapshot._editor;
  return snapshot;
}

function comparableSnapshot(row = {}) {
  const snapshot = cleanSnapshot(row);
  ["created_at", "created_by", "updated_at", "updated_by", "published_at"].forEach((key) => delete snapshot[key]);
  return JSON.stringify(snapshot);
}

function makeRecord(table, row, relation = null) {
  const snapshot = cleanSnapshot(row);
  return {
    table,
    id: row.id,
    base: clone(snapshot),
    current: clone(snapshot),
    relation: relation || row.image || row.hero_image || null
  };
}

function recordFor(table, id) {
  return records.find((record) => record.table === table && record.id === id) || null;
}

function markDirty() {
  isDirty = true;
  editorState.textContent = "有尚未儲存的修改";
  editorState.dataset.state = "dirty";
  refreshActionState();
}

function markSaved(message = "草稿已儲存") {
  isDirty = false;
  editorState.textContent = message;
  editorState.dataset.state = "saved";
  refreshActionState();
}

function setBusy(value) {
  isBusy = value;
  [saveButton, submitButton, approveButton].forEach((button) => {
    if (button) button.disabled = value || button.dataset.locked === "true";
  });
}

function pageCanEdit() {
  return Boolean(pageConfig && !pageConfig.readOnly && canEditScope(adminPermissions, pageConfig.scopeKey));
}

function controlsEditable() {
  return pageCanEdit() && loadedChangeSet?.status !== "pending";
}

function pageCanView(config) {
  return Boolean(config && canViewScope(adminPermissions, config.scopeKey));
}

function isOwner() {
  return adminPermissions?.role === "owner";
}

function refreshActionState() {
  const editable = pageCanEdit();
  const pending = loadedChangeSet?.status === "pending";
  saveButton.hidden = !editable || pending;
  submitButton.hidden = !editable || pending;
  approveButton.hidden = !isOwner() || (!pending && !isDirty && loadedChangeSet?.status !== "draft");
  saveButton.dataset.locked = editable && !pending ? "false" : "true";
  submitButton.dataset.locked = editable && !pending ? "false" : "true";
  approveButton.dataset.locked = isOwner() ? "false" : "true";

  if (pending) {
    actionTitle.textContent = "這一頁正在等待執行長確認";
    actionHint.textContent = isOwner()
      ? "核准會一次套用整頁修改；任何一筆失敗都不會局部上線。"
      : "核准前官網維持原版本，你仍可查看送審內容。";
    approveButton.textContent = "審核並發布";
  } else if (pageConfig?.readOnly) {
    actionTitle.textContent = "這一頁由專用內容工具管理";
    actionHint.textContent = "中央仍顯示真實前台；點選左側區塊後，可從右側直接前往正確的管理位置。";
  } else if (!editable) {
    actionTitle.textContent = "你目前只有檢視權限";
    actionHint.textContent = "如需修改，請由 Owner 在人員權限中指派此頁的編輯權限。";
  } else {
    actionTitle.textContent = "這份修改只會先存成草稿";
    actionHint.textContent = "送出後由執行長一次確認整頁內容，核准前官網維持原版本。";
    approveButton.textContent = "儲存、審核並發布";
  }
  setBusy(isBusy);
}

function publicPreviewUrl(config) {
  const url = new URL(config.previewPath, window.location.origin);
  url.searchParams.set("cms-preview", "1");
  return url.toString();
}

async function fetchCurrentProfile(session) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  currentProfileId = data?.id || "";
}

async function loadTemplateFieldRecords(slug) {
  const { data, error } = await supabase
    .from("page_template_fields")
    .select("*, image:media!page_template_fields_image_id_fkey(id, public_url, alt_text, file_name, image_usage, focal_point)")
    .eq("page_slug", slug)
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => makeRecord("page_template_fields", row, row.image));
}

async function loadHomeModuleRecords() {
  const { data, error } = await supabase
    .from("content_modules")
    .select("*, image:media!content_modules_image_id_fkey(id, public_url, alt_text, file_name, image_usage, focal_point)")
    .eq("target_slug", "home")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => makeRecord("content_modules", row, row.image));
}

async function loadRecruitingRecords(pageSlug = "talent") {
  const [pageResult, departmentResult, openingResult] = await Promise.all([
    supabase
      .from("recruiting_pages")
      .select("*, hero_image:media!recruiting_pages_hero_image_id_fkey(id, public_url, alt_text, file_name, image_usage, focal_point)")
      .eq("page_slug", pageSlug)
      .maybeSingle(),
    supabase
      .from("recruiting_departments")
      .select("*, image:media!recruiting_departments_image_id_fkey(id, public_url, alt_text, file_name, image_usage, focal_point)")
      .eq("page_slug", pageSlug)
      .order("sort_order", { ascending: true }),
    supabase
      .from("recruiting_openings")
      .select("*, image:media!recruiting_openings_image_id_fkey(id, public_url, alt_text, file_name, image_usage, focal_point)")
      .eq("page_slug", pageSlug)
      .order("sort_order", { ascending: true })
  ]);
  if (pageResult.error) throw pageResult.error;
  if (departmentResult.error) throw departmentResult.error;
  if (openingResult.error) throw openingResult.error;
  return [
    ...(pageResult.data ? [makeRecord("recruiting_pages", pageResult.data, pageResult.data.hero_image)] : []),
    ...(departmentResult.data || []).map((row) => makeRecord("recruiting_departments", row, row.image)),
    ...(openingResult.data || []).map((row) => makeRecord("recruiting_openings", row, row.image))
  ];
}

async function loadSourceRecords(config) {
  if (config.sourceType === "template-fields") return loadTemplateFieldRecords(config.slug);
  if (config.sourceType === "content-modules") return loadHomeModuleRecords();
  if (config.sourceType === "recruiting") return loadRecruitingRecords(config.slug);
  return [];
}

async function loadExistingChangeSet(config) {
  if (!currentProfileId || config.readOnly) return null;
  const { data, error } = await supabase
    .from("cms_change_sets")
    .select("*")
    .eq("page_slug", config.slug)
    .eq("requested_by", currentProfileId)
    .in("status", ["draft", "pending", "rejected"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && !/cms_change_sets/i.test(error.message || "")) throw error;
  return data || null;
}

function applyChangeSet(changeSet) {
  const changes = changeSet?.draft_payload?.changes;
  if (!Array.isArray(changes)) return;
  changes.forEach((change) => {
    const record = recordFor(change.entity_table, change.entity_id);
    if (!record || change.change_action === "delete") return;
    if (change.base_snapshot) record.base = clone(change.base_snapshot);
    if (change.proposed_snapshot) record.current = clone(change.proposed_snapshot);
  });
}

function buildChanges() {
  return records
    .filter((record) => comparableSnapshot(record.base) !== comparableSnapshot(record.current))
    .map((record) => ({
      entity_table: record.table,
      entity_id: record.id,
      entity_title: record.current.field_label || record.current.title || record.current.item_key || `${pageConfig.title}內容`,
      change_action: "upsert",
      target_status: record.current.status || "published",
      base_snapshot: cleanSnapshot(record.base),
      proposed_snapshot: cleanSnapshot(record.current)
    }));
}

function buildPayload() {
  return { version: 1, changes: buildChanges() };
}

function sectionRecords(section) {
  if (!section || section.locked) return [];
  if (pageConfig.sourceType === "template-fields") {
    const keys = new Set(section.fieldKeys || []);
    return records.filter((record) => keys.has(record.current.field_key));
  }
  if (pageConfig.sourceType === "content-modules") {
    const keys = new Set(section.moduleKeys || []);
    return records.filter((record) => {
      if (!keys.has(record.current.module_key)) return false;
      if (record.current.module_key !== "section_setting") return true;
      return record.current.item_key === section.id;
    });
  }
  if (pageConfig.sourceType === "recruiting") {
    const types = new Set(section.recordTypes || []);
    const openingSlugs = section.openingSlugs ? new Set(section.openingSlugs) : null;
    return records.filter((record) => (
      (types.has("page") && record.table === "recruiting_pages")
      || (types.has("departments") && record.table === "recruiting_departments")
      || (
        types.has("openings")
        && record.table === "recruiting_openings"
        && (!openingSlugs || openingSlugs.has(record.current.opening_slug))
      )
    ));
  }
  return [];
}

function renderPagePicker() {
  const options = visualEditorPageList().filter(pageCanView);
  const grouped = options.reduce((map, page) => {
    const group = page.group || "其他頁面";
    if (!map.has(group)) map.set(group, []);
    map.get(group).push(page);
    return map;
  }, new Map());
  pagePicker.innerHTML = [...grouped.entries()].map(([group, pages]) => `
    <optgroup label="${escapeHTML(group)}">
      ${pages.map((page) => (
        `<option value="${escapeHTML(page.slug)}" ${page.slug === pageConfig.slug ? "selected" : ""}>${escapeHTML(page.title)}${page.readOnly ? " · 專用管理" : ""}</option>`
      )).join("")}
    </optgroup>
  `).join("");
}

function renderSections() {
  sectionList.innerHTML = pageConfig.sections.map((section, index) => {
    const count = sectionRecords(section).length;
    const selected = section.id === activeSectionId;
    return `
      <button type="button" class="${selected ? "is-active" : ""}" data-section-id="${escapeHTML(section.id)}" aria-current="${selected ? "true" : "false"}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHTML(section.label)}</strong>
        <small>${section.locked ? (section.managerHref ? "由專用工具管理" : "系統固定內容") : `${count} 項可編輯內容`}</small>
      </button>
    `;
  }).join("");
}

function inputMarkup({ record, column, value, label, type = "text", multiline = false, disabled = false }) {
  const key = `${record.table}:${record.id}:${column}`;
  const safeValue = value == null ? "" : String(value);
  return `
    <label class="visual-editor-field ${multiline ? "is-wide" : ""}">
      <span>${escapeHTML(label)}</span>
      ${multiline
        ? `<textarea rows="4" data-record-input="${escapeHTML(key)}" ${disabled ? "disabled" : ""}>${escapeHTML(safeValue)}</textarea>`
        : `<input type="${type}" value="${escapeHTML(safeValue)}" data-record-input="${escapeHTML(key)}" ${disabled ? "disabled" : ""} />`}
    </label>
  `;
}

function imageEditorMarkup(record, fieldKey = "image_id") {
  const url = record.relation?.public_url
    || record.current.hero_image_url
    || record.current.image_url
    || record.current.text_value
    || "";
  return `
    <div class="visual-editor-image-field" data-image-record="${escapeHTML(`${record.table}:${record.id}:${fieldKey}`)}">
      <span>圖片</span>
      ${url
        ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(record.relation?.alt_text || record.current.title || record.current.field_label || "圖片預覽")}" />`
        : '<div class="admin-empty-state compact">目前沒有圖片</div>'}
      <label class="visual-editor-file-button">
        <span>上傳並更換</span>
        <input type="file" accept="image/*" data-image-upload ${controlsEditable() ? "" : "disabled"} />
      </label>
      <small>上傳時可調整裁切；圖片會和這一頁的修改一起送審。</small>
    </div>
  `;
}

function structuredItems(value) {
  if (Array.isArray(value)) return clone(value);
  if (Array.isArray(value?.items)) return clone(value.items);
  return [];
}

function renderStructuredEditor(record, schema) {
  const items = structuredItems(record.current.json_value);
  return `
    <div class="visual-editor-structured" data-structured-record="${escapeHTML(`${record.table}:${record.id}`)}">
      <div class="visual-editor-structured-head">
        <strong>${escapeHTML(record.current.field_label || schema.singular)}</strong>
        <button type="button" data-structured-add ${controlsEditable() ? "" : "disabled"}>新增${escapeHTML(schema.singular)}</button>
      </div>
      <div class="visual-editor-structured-list">
        ${items.length ? items.map((item, index) => renderStructuredItem(record, schema, item, index)).join("") : '<div class="admin-empty-state compact">目前沒有內容，可按「新增」建立第一項。</div>'}
      </div>
    </div>
  `;
}

function renderStructuredItem(record, schema, item, index) {
  return `
    <article class="visual-editor-structured-item" data-structured-index="${index}">
      <header>
        <strong>${escapeHTML(schema.singular)} ${index + 1}</strong>
        <div>
          <button type="button" data-structured-move="up" aria-label="上移" ${controlsEditable() ? "" : "disabled"}>↑</button>
          <button type="button" data-structured-move="down" aria-label="下移" ${controlsEditable() ? "" : "disabled"}>↓</button>
          <button type="button" data-structured-delete ${controlsEditable() ? "" : "disabled"}>刪除</button>
        </div>
      </header>
      ${schema.fields.map((field) => `
        <label class="visual-editor-field ${field.multiline ? "is-wide" : ""}">
          <span>${escapeHTML(field.label)}</span>
          ${field.multiline
            ? `<textarea rows="3" data-structured-key="${escapeHTML(field.key)}" ${controlsEditable() ? "" : "disabled"}>${escapeHTML(item?.[field.key] || "")}</textarea>`
            : `<input type="text" value="${escapeHTML(item?.[field.key] || "")}" data-structured-key="${escapeHTML(field.key)}" ${controlsEditable() ? "" : "disabled"} />`}
        </label>
      `).join("")}
    </article>
  `;
}

function renderTemplateInspector(section, items) {
  const byKey = new Map(items.map((record) => [record.current.field_key, record]));
  return (section.fieldKeys || []).map((key) => {
    const record = byKey.get(key);
    if (!record) return `
      <div class="visual-editor-mapping-note">
        <strong>${escapeHTML(key)}</strong>
        <span>這個版位尚未建立 CMS 欄位，已保持前台固定內容。</span>
      </div>
    `;
    if (record.current.field_type === "json") {
      const schema = structuredFieldSchemas[key];
      return schema
        ? renderStructuredEditor(record, schema)
        : `<div class="visual-editor-mapping-note"><strong>${escapeHTML(record.current.field_label)}</strong><span>這是舊版未映射的結構資料，Owner 可由進階工具管理。</span></div>`;
    }
    if (record.current.field_type === "image") return imageEditorMarkup(record, "image_id");
    const valueKey = record.current.field_type === "number"
      ? "number_value"
      : record.current.field_type === "boolean"
        ? "boolean_value"
        : "text_value";
    if (record.current.field_type === "boolean") {
      return `
        <label class="visual-editor-toggle">
          <input type="checkbox" data-record-input="${escapeHTML(`${record.table}:${record.id}:${valueKey}`)}" ${record.current[valueKey] ? "checked" : ""} ${controlsEditable() ? "" : "disabled"} />
          <span>${escapeHTML(record.current.field_label)}</span>
        </label>
      `;
    }
    return inputMarkup({
      record,
      column: valueKey,
      value: record.current[valueKey],
      label: record.current.field_label,
      type: record.current.field_type === "url" ? "url" : record.current.field_type === "number" ? "number" : "text",
      multiline: record.current.field_type === "textarea",
      disabled: !controlsEditable()
    });
  }).join("");
}

function renderHomeInspector(items) {
  if (!items.length) return '<div class="admin-empty-state">這個前台區塊目前沒有可編輯資料。</div>';
  return items.map((record, index) => `
    <details class="visual-editor-record" ${items.length === 1 || index === 0 ? "open" : ""}>
      <summary>
        <strong>${escapeHTML(record.current.title || record.current.item_key || `內容 ${index + 1}`)}</strong>
        <span>${escapeHTML(record.current.module_key === "section_setting" ? "區塊標題" : "內容項目")}</span>
      </summary>
      <div class="visual-editor-record-fields">
        ${homeModuleColumns.map((column) => inputMarkup({
          record,
          column,
          value: record.current[column],
          label: editableColumnLabels[column],
          type: column.endsWith("_url") ? "url" : "text",
          multiline: multilineColumns.has(column),
          disabled: !controlsEditable()
        })).join("")}
        ${record.current.module_key !== "section_setting" ? imageEditorMarkup(record, "image_id") : ""}
      </div>
    </details>
  `).join("");
}

function renderSimpleListEditor(record, column, label) {
  const items = Array.isArray(record.current[column]) ? record.current[column] : [];
  return `
    <div class="visual-editor-simple-list" data-list-record="${escapeHTML(`${record.table}:${record.id}:${column}`)}">
      <div><strong>${escapeHTML(label)}</strong><button type="button" data-list-add ${controlsEditable() ? "" : "disabled"}>新增</button></div>
      <ol>
        ${items.map((item, index) => `
          <li data-list-index="${index}">
            <textarea rows="2" data-list-value ${controlsEditable() ? "" : "disabled"}>${escapeHTML(typeof item === "string" ? item : item?.title || "")}</textarea>
            <button type="button" data-list-move="up" aria-label="上移" ${controlsEditable() ? "" : "disabled"}>↑</button>
            <button type="button" data-list-move="down" aria-label="下移" ${controlsEditable() ? "" : "disabled"}>↓</button>
            <button type="button" data-list-delete aria-label="刪除" ${controlsEditable() ? "" : "disabled"}>×</button>
          </li>
        `).join("")}
      </ol>
    </div>
  `;
}

function renderRecruitingInspector(items) {
  if (!items.length) return '<div class="admin-empty-state">這個前台區塊目前沒有可編輯資料。</div>';
  return items.map((record, index) => {
    let columns = recruitingOpeningColumns;
    let listColumns = [];
    let imageKey = "image_id";
    if (record.table === "recruiting_pages") {
      columns = recruitingPageColumns;
      imageKey = "hero_image_id";
    } else if (record.table === "recruiting_departments") {
      columns = ["eyebrow", "title", "description"];
      listColumns = [["highlights", "部門重點"]];
    } else {
      listColumns = [["duties", "工作內容"], ["requirements", "應徵條件"], ["benefits", "福利支持"]];
    }
    return `
      <details class="visual-editor-record" ${items.length === 1 || index === 0 ? "open" : ""}>
        <summary>
          <strong>${escapeHTML(record.current.title || `內容 ${index + 1}`)}</strong>
          <span>${record.table === "recruiting_openings" ? "職缺" : record.table === "recruiting_departments" ? "部門" : "頁首"}</span>
        </summary>
        <div class="visual-editor-record-fields">
          ${columns.map((column) => inputMarkup({
            record,
            column,
            value: record.current[column],
            label: editableColumnLabels[column] || column,
            type: column.endsWith("_url") ? "url" : "text",
            multiline: multilineColumns.has(column),
            disabled: !controlsEditable()
          })).join("")}
          ${listColumns.map(([column, label]) => renderSimpleListEditor(record, column, label)).join("")}
          ${imageEditorMarkup(record, imageKey)}
        </div>
      </details>
    `;
  }).join("");
}

function renderInspector() {
  const section = pageConfig.sections.find((item) => item.id === activeSectionId) || pageConfig.sections[0];
  if (!section) return;
  activeSectionId = section.id;
  sectionTitle.textContent = section.label;
  sectionDescription.textContent = section.description || "修改後可先看中央預覽，再整頁送審。";

  if (section.locked) {
    const managerHref = section.managerHref || pageConfig.managerHref || "";
    const managerLabel = section.managerLabel || pageConfig.managerLabel || "前往內容管理";
    inspectorBody.innerHTML = `
      <div class="visual-editor-locked-content">
        <span>${managerHref ? "專用管理工具" : "系統固定內容"}</span>
        <strong>${managerHref ? "這個區塊已有專屬管理位置" : "這個區塊目前不在一般編輯範圍"}</strong>
        <p>${escapeHTML(section.lockedReason || "此區塊由共用系統資料產生，避免誤改所以先鎖定。")}</p>
        ${managerHref ? `<a class="visual-editor-manager-link" href="${escapeHTML(managerHref)}">${escapeHTML(managerLabel)}</a>` : ""}
      </div>
    `;
    return;
  }

  const items = sectionRecords(section);
  if (pageConfig.sourceType === "template-fields") inspectorBody.innerHTML = renderTemplateInspector(section, items);
  if (pageConfig.sourceType === "content-modules") inspectorBody.innerHTML = renderHomeInspector(items);
  if (pageConfig.sourceType === "recruiting") inspectorBody.innerHTML = renderRecruitingInspector(items);
}

function selectSection(sectionId, { scrollPreview = true } = {}) {
  if (!pageConfig.sections.some((section) => section.id === sectionId)) return;
  activeSectionId = sectionId;
  renderSections();
  renderInspector();
  if (scrollPreview && previewReady) {
    previewFrame.contentWindow?.postMessage({ type: "cms-editor:select-section", sectionId }, window.location.origin);
  }
}

function parseRecordKey(value = "") {
  const [table, id, ...columnParts] = value.split(":");
  return { table, id, column: columnParts.join(":") };
}

function updateRecordValue(key, input) {
  const { table, id, column } = parseRecordKey(key);
  const record = recordFor(table, id);
  if (!record || !column) return;
  record.current[column] = input.type === "checkbox" ? input.checked : input.type === "number" ? Number(input.value || 0) : input.value;
  markDirty();
  sendLivePatch(record, column);
}

function sendLivePatch(record, column) {
  if (!previewReady) return;
  const patches = [];
  if (pageConfig.sourceType === "template-fields") {
    const field = servicePreviewFields[record.current.field_key];
    if (field) patches.push({ ...field, value: record.current[column] || "" });
  } else if (pageConfig.sourceType === "content-modules" && record.current.module_key === "section_setting") {
    const fieldName = column === "description" ? "body" : column;
    patches.push({ selector: `${pageConfig.sections.find((section) => section.id === activeSectionId)?.selector} [data-cms-field="${fieldName}"]`, property: "text", value: record.current[column] || "" });
  } else if (pageConfig.sourceType === "content-modules" && record.current.module_key === "hero") {
    if (["eyebrow", "title", "subtitle", "body"].includes(column)) {
      patches.push({ selector: `#home [data-cms-section="hero"] [data-cms-field="${column}"]`, property: "text", value: record.current[column] || "" });
    }
  } else if (record.table === "recruiting_pages") {
    const map = {
      eyebrow: ".recruiting-cms-hero .eyebrow",
      title: ".recruiting-cms-hero h1",
      body: ".recruiting-cms-hero .service-detail-copy > p:not(.eyebrow):not(.hero-slogan)",
      primary_cta_text: ".recruiting-cms-hero .primary-button",
      secondary_cta_text: ".recruiting-cms-hero .secondary-button"
    };
    if (map[column]) patches.push({ selector: map[column], property: "text", value: record.current[column] || "" });
  }
  if (patches.length) {
    previewFrame.contentWindow?.postMessage({ type: "cms-editor:patch", patches }, window.location.origin);
  }
}

function readStructuredEditor(editor) {
  return Array.from(editor.querySelectorAll("[data-structured-index]")).map((item) => {
    const value = {};
    item.querySelectorAll("[data-structured-key]").forEach((input) => {
      if (input.value.trim()) value[input.dataset.structuredKey] = input.value.trim();
    });
    return value;
  });
}

function syncStructuredRecord(editor) {
  const { table, id } = parseRecordKey(editor.dataset.structuredRecord);
  const record = recordFor(table, id);
  if (!record) return;
  record.current.json_value = readStructuredEditor(editor);
  markDirty();
}

function rerenderStructuredEditor(editor, items) {
  const { table, id } = parseRecordKey(editor.dataset.structuredRecord);
  const record = recordFor(table, id);
  const schema = structuredFieldSchemas[record?.current?.field_key];
  if (!record || !schema) return;
  record.current.json_value = items;
  editor.outerHTML = renderStructuredEditor(record, schema);
  markDirty();
}

function syncListRecord(container) {
  const { table, id, column } = parseRecordKey(container.dataset.listRecord);
  const record = recordFor(table, id);
  if (!record) return;
  record.current[column] = Array.from(container.querySelectorAll("[data-list-value]"))
    .map((input) => input.value.trim())
    .filter(Boolean);
  markDirty();
}

function renderListItems(container, values) {
  const disabled = controlsEditable() ? "" : "disabled";
  container.querySelector("ol").innerHTML = values.map((value, index) => `
    <li data-list-index="${index}">
      <textarea rows="2" data-list-value ${disabled}>${escapeHTML(value)}</textarea>
      <button type="button" data-list-move="up" aria-label="上移" ${disabled}>↑</button>
      <button type="button" data-list-move="down" aria-label="下移" ${disabled}>↓</button>
      <button type="button" data-list-delete aria-label="刪除" ${disabled}>×</button>
    </li>
  `).join("");
  syncListRecord(container);
}

async function handleImageUpload(input) {
  if (!controlsEditable()) {
    setStatus("這份內容目前是唯讀狀態，不能更換圖片。", "error");
    return;
  }
  const wrapper = input.closest("[data-image-record]");
  const { table, id, column } = parseRecordKey(wrapper.dataset.imageRecord);
  const record = recordFor(table, id);
  const file = input.files?.[0];
  if (!record || !file) return;
  input.disabled = true;
  setStatus("正在處理並上傳圖片...", "info");
  try {
    const usage = column === "hero_image_id" || record.current.field_key === "hero_image" ? "service_hero" : "card";
    const prepared = await prepareImageForUpload(file, usage);
    const media = await uploadImageToMedia({
      file: prepared,
      altText: record.current.title || record.current.field_label || pageConfig.title,
      imageUsage: usage,
      scopeKey: pageConfig.scopeKey
    });
    record.relation = media;
    record.current[column] = media.id;
    if (record.table === "recruiting_pages") record.current.hero_image_url = media.public_url;
    if (["content_modules", "recruiting_departments", "recruiting_openings"].includes(record.table)) record.current.image_url = media.public_url;
    if (record.table === "page_template_fields") record.current.text_value = media.public_url;
    markDirty();
    renderInspector();
    if (record.table === "page_template_fields" && record.current.field_key === "hero_image") {
      const field = servicePreviewFields.hero_image;
      previewFrame.contentWindow?.postMessage({ type: "cms-editor:patch", patches: [{ ...field, value: media.public_url }] }, window.location.origin);
    }
    setStatus("圖片已上傳並放入這份頁面草稿。", "success");
  } catch (error) {
    setStatus(`圖片上傳失敗：${error.message}`, "error");
  } finally {
    input.disabled = false;
  }
}

async function saveDraft({ quiet = false } = {}) {
  if (!pageCanEdit()) throw new Error("你沒有這一頁的編輯權限。");
  const payload = buildPayload();
  if (!payload.changes.length) throw new Error("目前沒有需要儲存的修改。");
  setBusy(true);
  if (!quiet) setStatus("正在儲存整頁草稿...", "info");
  try {
    const { data, error } = await supabase.rpc("save_cms_change_set", {
      target_page_slug: pageConfig.slug,
      draft_payload: payload,
      draft_title: `${pageConfig.title}頁面修改`
    });
    if (error) throw error;
    loadedChangeSet = data;
    markSaved("草稿已儲存");
    if (!quiet) setStatus("整頁草稿已儲存，前台正式內容尚未改變。", "success");
    return data;
  } finally {
    setBusy(false);
  }
}

async function submitDraft() {
  setBusy(true);
  setStatus("正在整理整頁內容並送交執行長...", "info");
  try {
    const saved = isDirty || !loadedChangeSet || loadedChangeSet.status !== "draft"
      ? await saveDraft({ quiet: true })
      : loadedChangeSet;
    const { data, error } = await supabase.rpc("submit_cms_change_set", { change_set_id: saved.id });
    if (error) throw error;
    loadedChangeSet = data;
    markSaved("等待執行長確認");
    setStatus("已整頁送交執行長；核准前官網維持原版本。", "success");
    refreshActionState();
    renderInspector();
  } catch (error) {
    if (/updated by someone else|Refresh/i.test(error.message || "")) {
      throw new Error("其他人已先更新這一頁，請重新整理後再確認修改，系統沒有覆蓋新資料。");
    }
    throw error;
  } finally {
    setBusy(false);
  }
}

async function approveDraft() {
  if (!isOwner()) return;
  if (!window.confirm("確定要一次核准並發布這一頁的全部修改嗎？")) return;
  setBusy(true);
  setStatus("正在檢查並發布整頁內容...", "info");
  try {
    let target = loadedChangeSet;
    if (!target || target.status !== "pending") {
      target = isDirty || !target || target.status !== "draft" ? await saveDraft({ quiet: true }) : target;
      const submitResult = await supabase.rpc("submit_cms_change_set", { change_set_id: target.id });
      if (submitResult.error) throw submitResult.error;
      target = submitResult.data;
    }
    const { data, error } = await supabase.rpc("review_cms_change_set", {
      change_set_id: target.id,
      next_status: "approved",
      reviewer_note: "執行長於視覺編輯器確認並發布"
    });
    if (error) throw error;
    loadedChangeSet = data;
    setStatus("整頁修改已核准發布，正在重新載入正式內容。", "success");
    await loadPage(pageConfig.slug, { preserveStatus: true });
  } finally {
    setBusy(false);
  }
}

function initPreview() {
  previewReady = false;
  previewLoading.hidden = false;
  previewFrame.src = publicPreviewUrl(pageConfig);
  openPageLink.href = pageConfig.previewPath;
}

function sendPreviewManifest() {
  if (!previewFrame.contentWindow || !pageConfig) return;
  previewFrame.contentWindow.postMessage({
    type: "cms-editor:init",
    pageSlug: pageConfig.slug,
    sections: pageConfig.sections.map(({ id, label, selector }) => ({ id, label, selector }))
  }, window.location.origin);
}

async function loadPage(slug, { preserveStatus = false } = {}) {
  const config = getVisualEditorPage(slug);
  if (!config || !pageCanView(config)) {
    setStatus("你沒有檢視這一頁的權限。", "error");
    return;
  }
  pageConfig = config;
  activeSectionId = config.sections[0]?.id || "";
  loadedChangeSet = null;
  isDirty = false;
  if (!preserveStatus) setStatus("正在讀取頁面內容...", "info");
  titleNode.textContent = `編輯「${config.title}」`;
  subtitleNode.textContent = config.readOnly
    ? "中央是目前前台；點選區塊後，右側會帶你到正確的專用管理工具。"
    : "點選左側區塊或中央前台畫面，右側會顯示可修改內容。";
  renderPagePicker();
  initPreview();

  try {
    const [sourceRecords, changeSet] = await Promise.all([
      loadSourceRecords(config),
      loadExistingChangeSet(config)
    ]);
    if (pageConfig.slug !== slug) return;
    records = sourceRecords;
    loadedChangeSet = changeSet;
    applyChangeSet(changeSet);
    isDirty = Boolean(changeSet?.status === "rejected");
    renderSections();
    renderInspector();
    if (changeSet?.status === "pending") {
      markSaved("等待執行長確認");
      setStatus("這一頁已有整頁送審內容，核准前官網維持原版本。", "info");
    } else if (changeSet?.status === "draft") {
      markSaved("已載入上次草稿");
      setStatus("已載入你上次儲存的整頁草稿。", "success");
    } else if (changeSet?.status === "rejected") {
      editorState.textContent = "已退回，請修改後重新送審";
      editorState.dataset.state = "rejected";
      setStatus(`執行長退回原因：${changeSet.reviewer_note || "請調整內容後重新送審。"}`, "error");
    } else {
      markSaved("尚未修改");
      setStatus("", "success");
    }
    refreshActionState();
  } catch (error) {
    console.error("Visual editor load failed", error);
    setStatus(`頁面內容讀取失敗：${error.message}`, "error");
    records = [];
    renderSections();
    renderInspector();
  }
}

sectionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-section-id]");
  if (button) selectSection(button.dataset.sectionId);
});

inspectorBody.addEventListener("input", (event) => {
  const recordInput = event.target.closest("[data-record-input]");
  if (recordInput) updateRecordValue(recordInput.dataset.recordInput, recordInput);
  const structured = event.target.closest("[data-structured-record]");
  if (structured && event.target.matches("[data-structured-key]")) syncStructuredRecord(structured);
  const list = event.target.closest("[data-list-record]");
  if (list && event.target.matches("[data-list-value]")) syncListRecord(list);
});

inspectorBody.addEventListener("change", (event) => {
  if (event.target.matches("[data-image-upload]")) handleImageUpload(event.target);
  const recordInput = event.target.closest("[data-record-input]");
  if (recordInput?.type === "checkbox") updateRecordValue(recordInput.dataset.recordInput, recordInput);
});

inspectorBody.addEventListener("click", (event) => {
  const addStructured = event.target.closest("[data-structured-add]");
  if (addStructured) {
    const editor = addStructured.closest("[data-structured-record]");
    const { table, id } = parseRecordKey(editor.dataset.structuredRecord);
    const record = recordFor(table, id);
    const schema = structuredFieldSchemas[record.current.field_key];
    const items = readStructuredEditor(editor);
    items.push(Object.fromEntries(schema.fields.map((field) => [field.key, ""])));
    rerenderStructuredEditor(editor, items);
    return;
  }
  const structuredAction = event.target.closest("[data-structured-delete], [data-structured-move]");
  if (structuredAction) {
    const editor = structuredAction.closest("[data-structured-record]");
    const item = structuredAction.closest("[data-structured-index]");
    const items = readStructuredEditor(editor);
    const index = Number(item.dataset.structuredIndex);
    if (structuredAction.matches("[data-structured-delete]")) items.splice(index, 1);
    if (structuredAction.dataset.structuredMove === "up" && index > 0) [items[index - 1], items[index]] = [items[index], items[index - 1]];
    if (structuredAction.dataset.structuredMove === "down" && index < items.length - 1) [items[index + 1], items[index]] = [items[index], items[index + 1]];
    rerenderStructuredEditor(editor, items);
    return;
  }
  const listAction = event.target.closest("[data-list-add], [data-list-delete], [data-list-move]");
  if (listAction) {
    const container = listAction.closest("[data-list-record]");
    const values = Array.from(container.querySelectorAll("[data-list-value]")).map((input) => input.value);
    if (listAction.matches("[data-list-add]")) values.push("");
    const item = listAction.closest("[data-list-index]");
    const index = Number(item?.dataset.listIndex);
    if (listAction.matches("[data-list-delete]")) values.splice(index, 1);
    if (listAction.dataset.listMove === "up" && index > 0) [values[index - 1], values[index]] = [values[index], values[index - 1]];
    if (listAction.dataset.listMove === "down" && index < values.length - 1) [values[index + 1], values[index]] = [values[index], values[index + 1]];
    renderListItems(container, values);
  }
});

document.querySelector(".visual-editor-devices").addEventListener("click", (event) => {
  const button = event.target.closest("[data-preview-device]");
  if (!button) return;
  document.querySelectorAll("[data-preview-device]").forEach((item) => {
    const active = item === button;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  previewShell.dataset.previewDevice = button.dataset.previewDevice;
});

previewFrame.addEventListener("load", () => {
  previewLoading.hidden = true;
  window.setTimeout(sendPreviewManifest, 150);
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.source !== previewFrame.contentWindow) return;
  if (event.data?.type === "cms-editor:ready") {
    previewReady = true;
    sendPreviewManifest();
  }
  if (["cms-editor:section-selected", "cms-editor:section-active"].includes(event.data?.type)) {
    selectSection(event.data.sectionId, { scrollPreview: false });
  }
});

pagePicker.addEventListener("change", () => {
  const url = new URL(window.location.href);
  url.searchParams.set("page", pagePicker.value);
  window.history.replaceState({}, "", url);
  loadPage(pagePicker.value);
});

saveButton.addEventListener("click", () => saveDraft().catch((error) => setStatus(`草稿儲存失敗：${error.message}`, "error")));
submitButton.addEventListener("click", () => submitDraft().catch((error) => setStatus(`送審失敗：${error.message}`, "error")));
approveButton.addEventListener("click", () => approveDraft().catch((error) => setStatus(`發布失敗：${error.message}`, "error")));

window.addEventListener("beforeunload", (event) => {
  if (!isDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: async (session, permissions) => {
    adminPermissions = permissions || {};
    await fetchCurrentProfile(session);
    const requested = new URLSearchParams(window.location.search).get("page") || "home";
    const fallback = visualEditorPageList().find(pageCanView)?.slug;
    await loadPage(pageCanView(getVisualEditorPage(requested)) ? requested : fallback);
  }
}).catch((error) => reportAdminBootError(loading, error));
