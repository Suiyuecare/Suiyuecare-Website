import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML } from "./utils.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#templateFieldsStatus");
const pageFilter = document.querySelector("#templatePageFilter");
const refreshButton = document.querySelector("#refreshTemplateFieldsButton");
const list = document.querySelector("#templateFieldsList");

let fields = [];

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function fieldValue(field) {
  if (field.field_type === "boolean") return Boolean(field.boolean_value);
  if (field.field_type === "number") return field.number_value ?? "";
  if (field.field_type === "json") return JSON.stringify(field.json_value || {}, null, 2);
  return field.text_value || "";
}

function getJsonCardConfig(field) {
  const configs = {
    feature_cards: {
      label: "特色卡",
      fields: [
        { key: "label", label: "小標 / 編號", placeholder: "01" },
        { key: "title", label: "標題", placeholder: "到宅生活支持" },
        { key: "body", label: "內容", textarea: true, placeholder: "說明這張卡片的重點。" }
      ],
      empty: { label: "", title: "", body: "" }
    },
    flow_cards: {
      label: "流程卡",
      fields: [
        { key: "step", label: "步驟", placeholder: "01" },
        { key: "title", label: "標題", placeholder: "需求諮詢" },
        { key: "body", label: "內容", textarea: true, placeholder: "說明這個流程步驟。" }
      ],
      empty: { step: "", title: "", body: "" }
    },
    faq_items: {
      label: "FAQ",
      fields: [
        { key: "question", label: "問題", placeholder: "可以先預約諮詢嗎？" },
        { key: "answer", label: "回答", textarea: true, placeholder: "請輸入回答內容。" }
      ],
      empty: { question: "", answer: "" }
    }
  };
  return configs[field.field_key] || null;
}

function getJsonArrayValue(field) {
  const value = field.json_value;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function renderJsonCardEditor(field) {
  const config = getJsonCardConfig(field);
  if (!config) return "";
  const items = getJsonArrayValue(field);
  const rows = items.length ? items : [config.empty];
  return `
    <div class="admin-json-card-editor" data-json-card-editor data-card-type="${escapeHTML(field.field_key)}">
      <div class="admin-json-card-head">
        <strong>${escapeHTML(config.label)}列表</strong>
        <button type="button" data-add-json-card>新增${escapeHTML(config.label)}</button>
      </div>
      <div class="admin-json-card-list" data-json-card-list>
        ${rows.map((item, index) => renderJsonCardItem(config, item, index)).join("")}
      </div>
      <small>這裡新增或刪除後，前台服務頁會自動依照卡片數量呈現。</small>
    </div>
  `;
}

function renderJsonCardItem(config, item = {}, index = 0) {
  return `
    <article class="admin-json-card-item" data-json-card-item>
      <header>
        <span>${escapeHTML(config.label)} ${index + 1}</span>
        <div>
          <button type="button" data-move-json-card="up">上移</button>
          <button type="button" data-move-json-card="down">下移</button>
          <button type="button" data-delete-json-card>刪除</button>
        </div>
      </header>
      <div class="admin-form-grid compact">
        ${config.fields.map((field) => `
          <label class="${field.textarea ? "admin-field-wide" : ""}">
            <span>${escapeHTML(field.label)}</span>
            ${field.textarea
              ? `<textarea data-json-key="${escapeHTML(field.key)}" rows="3" placeholder="${escapeHTML(field.placeholder || "")}">${escapeHTML(item[field.key] || "")}</textarea>`
              : `<input data-json-key="${escapeHTML(field.key)}" type="text" value="${escapeHTML(item[field.key] || "")}" placeholder="${escapeHTML(field.placeholder || "")}" />`}
          </label>
        `).join("")}
      </div>
    </article>
  `;
}

function renderInput(field) {
  const value = fieldValue(field);
  if (field.field_type === "image") {
    const imageUrl = field.image?.public_url || field.text_value || "";
    return `
      <div class="admin-linked-image">
        ${imageUrl ? `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(field.field_label)}" />` : `<div class="admin-empty-state compact">尚未選擇圖片</div>`}
        <div>
          <input data-image-upload type="file" accept="image/*" />
          <small>上傳時會依服務/招募 Hero 版型開啟裁切預覽，避免前台跑版。</small>
        </div>
      </div>
    `;
  }
  if (field.field_type === "textarea" || field.field_type === "json") {
    if (field.field_type === "json" && getJsonCardConfig(field)) return renderJsonCardEditor(field);
    return `<textarea data-field-value rows="${field.field_type === "json" ? 8 : 4}">${escapeHTML(value)}</textarea>`;
  }
  if (field.field_type === "boolean") {
    return `<label class="admin-toggle-field compact"><input data-field-value type="checkbox" ${value ? "checked" : ""} /><span>啟用</span></label>`;
  }
  if (field.field_type === "number") {
    return `<input data-field-value type="number" value="${escapeHTML(value)}" />`;
  }
  return `<input data-field-value type="${field.field_type === "url" ? "url" : "text"}" value="${escapeHTML(value)}" />`;
}

function refreshJsonCardLabels(editor) {
  const config = getJsonCardConfig({ field_key: editor.dataset.cardType });
  editor.querySelectorAll("[data-json-card-item]").forEach((item, index) => {
    const label = item.querySelector("header span");
    if (label) label.textContent = `${config?.label || "卡片"} ${index + 1}`;
  });
}

function readJsonCardEditor(editor) {
  return Array.from(editor.querySelectorAll("[data-json-card-item]"))
    .map((item) => {
      const row = {};
      item.querySelectorAll("[data-json-key]").forEach((input) => {
        const value = input.value.trim();
        if (value) row[input.dataset.jsonKey] = value;
      });
      return row;
    })
    .filter((item) => Object.keys(item).length);
}

function renderFields() {
  if (!fields.length) {
    list.innerHTML = `<div class="admin-empty-state">目前沒有模板欄位。</div>`;
    return;
  }
  list.innerHTML = fields.map((field) => `
    <article class="admin-section-card" data-field-id="${escapeHTML(field.id)}">
      <header><div><span>${escapeHTML(field.page_slug)} / ${escapeHTML(field.template_key)}</span><strong>${escapeHTML(field.field_label)}</strong></div><label class="admin-toggle-field compact"><input data-enabled type="checkbox" ${field.is_enabled ? "checked" : ""} /><span>顯示</span></label></header>
      <div class="admin-form-grid">
        <label class="admin-field-wide"><span>${escapeHTML(field.help_text || field.field_key)}</span>${renderInput(field)}</label>
        <button type="button" data-save-field>儲存欄位</button>
      </div>
    </article>
  `).join("");
}

async function loadFields() {
  setStatus("正在讀取模板欄位...", "info");
  let query = supabase
    .from("page_template_fields")
    .select("*, image:media!page_template_fields_image_id_fkey(id, public_url, alt_text, file_name)")
    .order("page_slug")
    .order("template_key")
    .order("sort_order");
  if (pageFilter.value) query = query.eq("page_slug", pageFilter.value);
  try {
    const { data, error } = await query;
    if (error) throw error;
    fields = data || [];
    renderFields();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load template fields", error);
    fields = [];
    renderFields();
    setStatus(`讀取模板欄位失敗：${error.message}`, "error");
  }
}

async function saveField(card) {
  const field = fields.find((item) => item.id === card.dataset.fieldId);
  if (!field) return;
  const input = card.querySelector("[data-field-value]");
  const imageInput = card.querySelector("[data-image-upload]");
  const enabled = card.querySelector("[data-enabled]");
  const payload = { is_enabled: Boolean(enabled?.checked) };
  if (field.field_type === "image") {
    const file = imageInput?.files?.[0];
    if (file) {
      try {
        const preparedFile = await prepareImageForUpload(file, field.template_key?.includes("hero") ? "service_hero" : "card");
        const media = await uploadImageToMedia({
          file: preparedFile,
          altText: field.field_label,
          caption: `${field.page_slug} ${field.field_label}`,
          imageUsage: field.template_key?.includes("hero") ? "service_hero" : "card"
        });
        payload.image_id = media.id;
        payload.text_value = media.public_url;
      } catch (error) {
        setStatus(`圖片上傳失敗：${error.message}`, "error");
        return;
      }
    }
  } else if (field.field_type === "boolean") payload.boolean_value = Boolean(input.checked);
  else if (field.field_type === "number") payload.number_value = input.value ? Number(input.value) : null;
  else if (field.field_type === "json") {
    const editor = card.querySelector("[data-json-card-editor]");
    if (editor) {
      payload.json_value = readJsonCardEditor(editor);
    } else {
      try {
        payload.json_value = JSON.parse(input.value || "{}");
      } catch {
        setStatus("JSON 格式錯誤，請檢查括號與逗號。", "error");
        return;
      }
    }
  } else {
    payload.text_value = input.value.trim() || null;
  }
  setStatus("正在儲存模板欄位...", "info");
  const { error } = await supabase.from("page_template_fields").update(payload).eq("id", field.id);
  if (error) {
    setStatus(`儲存失敗：${error.message}`, "error");
    return;
  }
  setStatus("模板欄位已儲存。", "success");
  await loadFields();
}

refreshButton?.addEventListener("click", loadFields);
pageFilter?.addEventListener("change", loadFields);
list?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-save-field]");
  if (button) saveField(button.closest("[data-field-id]"));
  const addButton = event.target.closest("[data-add-json-card]");
  if (addButton) {
    const editor = addButton.closest("[data-json-card-editor]");
    const config = getJsonCardConfig({ field_key: editor.dataset.cardType });
    editor.querySelector("[data-json-card-list]").insertAdjacentHTML("beforeend", renderJsonCardItem(config, config.empty, editor.querySelectorAll("[data-json-card-item]").length));
    refreshJsonCardLabels(editor);
  }
  const deleteButton = event.target.closest("[data-delete-json-card]");
  if (deleteButton) {
    const editor = deleteButton.closest("[data-json-card-editor]");
    const items = editor.querySelectorAll("[data-json-card-item]");
    if (items.length <= 1) {
      deleteButton.closest("[data-json-card-item]").querySelectorAll("input, textarea").forEach((input) => { input.value = ""; });
    } else {
      deleteButton.closest("[data-json-card-item]").remove();
      refreshJsonCardLabels(editor);
    }
  }
  const moveButton = event.target.closest("[data-move-json-card]");
  if (moveButton) {
    const item = moveButton.closest("[data-json-card-item]");
    const editor = moveButton.closest("[data-json-card-editor]");
    if (moveButton.dataset.moveJsonCard === "up" && item.previousElementSibling) item.parentElement.insertBefore(item, item.previousElementSibling);
    if (moveButton.dataset.moveJsonCard === "down" && item.nextElementSibling) item.parentElement.insertBefore(item.nextElementSibling, item);
    refreshJsonCardLabels(editor);
  }
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadFields
}).catch((error) => reportAdminBootError(loading, error));
