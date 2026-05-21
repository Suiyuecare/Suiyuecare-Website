import { supabase } from "../lib/supabaseClient.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#homeModulesStatus");
const form = document.querySelector("#homeModuleForm");
const tableBody = document.querySelector("#homeModulesTableBody");
const refreshButton = document.querySelector("#refreshHomeModulesButton");
const newButton = document.querySelector("#newHomeModuleButton");
const formTitle = document.querySelector("#homeModuleFormTitle");
const imagePreview = document.querySelector("#homeModuleImagePreview");

let modules = [];

const moduleLabels = {
  section_setting: "首頁區塊設定",
  news: "最新消息",
  awards: "得標紀錄",
  recruit: "員工招募",
  video: "單位影片",
  care_story: "真實照顧情境",
  master_talk: "名人講堂",
  hero: "首頁 Hero",
  service_item: "營業項目",
  location: "服務據點",
  partner: "合作單位"
};

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function slugify(value = "") {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || `module-${Date.now()}`;
}

function getImage(item) {
  return item.image || item.media || null;
}

function renderImagePreview(item = null) {
  const image = item ? getImage(item) : null;
  const url = image?.public_url || "";
  imagePreview.innerHTML = `
    <figure class="${url ? "" : "empty"}" data-image-usage="card">
      ${url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(image.alt_text || item?.title || "首頁模組圖片")}" />` : "<span>尚未選擇圖片</span>"}
    </figure>
    <div><strong>圖片保護</strong><p>圖片上傳會先裁切並顯示網頁、平板、手機預覽，避免首頁卡片切到臉或文字。</p></div>
  `;
}

function renderModules() {
  if (!modules.length) {
    tableBody.innerHTML = `<tr><td colspan="5"><div class="admin-empty-state">目前沒有首頁模組。</div></td></tr>`;
    return;
  }
  tableBody.innerHTML = modules.map((item) => `
    <tr>
      <td><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.subtitle || item.body || item.item_key || "")}</small></td>
      <td>${escapeHTML(moduleLabels[item.module_key] || item.module_key)}</td>
      <td>${escapeHTML(item.status)}${item.is_enabled ? " · 顯示" : " · 隱藏"}</td>
      <td>${Number(item.sort_order || 0)}</td>
      <td><div class="admin-table-actions"><button type="button" data-edit-module="${escapeHTML(item.id)}">編輯</button><button type="button" data-delete-module="${escapeHTML(item.id)}">刪除</button></div></td>
    </tr>
  `).join("");
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  form.elements.image_id.value = "";
  form.elements.metadata.value = "";
  form.elements.status.value = "draft";
  form.elements.is_enabled.checked = true;
  formTitle.textContent = "新增模組";
  renderImagePreview();
}

function fillForm(item) {
  if (!item) return;
  form.elements.id.value = item.id;
  form.elements.image_id.value = item.image_id || "";
  form.elements.module_key.value = item.module_key || "news";
  form.elements.item_key.value = item.item_key || "";
  form.elements.title.value = item.title || "";
  form.elements.subtitle.value = item.subtitle || "";
  form.elements.date_label.value = item.date_label || "";
  form.elements.badge_label.value = item.badge_label || "";
  form.elements.body.value = item.body || "";
  form.elements.link_text.value = item.link_text || "";
  form.elements.link_url.value = item.link_url || "";
  form.elements.metadata.value = JSON.stringify(item.metadata || {}, null, 2);
  form.elements.sort_order.value = item.sort_order ?? 0;
  form.elements.status.value = item.status || "draft";
  form.elements.is_featured.checked = Boolean(item.is_featured);
  form.elements.is_enabled.checked = Boolean(item.is_enabled);
  formTitle.textContent = `編輯：${item.title}`;
  renderImagePreview(item);
}

async function loadModules() {
  setStatus("正在讀取首頁模組...", "info");
  try {
    const { data, error } = await supabase
      .from("content_modules")
      .select("*, image:media!content_modules_image_id_fkey(id, public_url, alt_text, file_name)")
      .eq("target_slug", "home")
      .order("module_key", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    modules = data || [];
    renderModules();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load home modules", error);
    modules = [];
    renderModules();
    setStatus(`讀取首頁模組失敗：${error.message}`, "error");
  }
}

async function uploadImageIfNeeded() {
  const file = form.elements.image_file.files?.[0];
  if (!file) return form.elements.image_id.value || null;
  const moduleKey = form.elements.module_key.value;
  const usage = moduleKey === "hero"
    ? "hero"
    : moduleKey === "partner"
      ? "logo"
      : ["care_story", "master_talk"].includes(moduleKey)
        ? "avatar"
        : "card";
  const preparedFile = await prepareImageForUpload(file, usage);
  if (!preparedFile) throw new Error("已取消圖片上傳。");
  const media = await uploadImageToMedia({
    file: preparedFile,
    altText: form.elements.title.value.trim(),
    caption: `${moduleLabels[form.elements.module_key.value] || "首頁模組"}圖片`,
    imageUsage: usage,
    focalPoint: "center"
  });
  return media.id;
}

function buildPayload(imageId) {
  const status = form.elements.status.value || "draft";
  let metadata = {};
  try {
    metadata = JSON.parse(form.elements.metadata.value || "{}");
  } catch {
    throw new Error("進階 JSON 格式錯誤，請檢查逗號、雙引號與括號。");
  }
  return {
    target_slug: "home",
    module_key: form.elements.module_key.value,
    item_key: slugify(form.elements.item_key.value || form.elements.title.value),
    title: form.elements.title.value.trim(),
    subtitle: form.elements.subtitle.value.trim() || null,
    body: form.elements.body.value.trim() || null,
    image_id: imageId,
    link_text: form.elements.link_text.value.trim() || null,
    link_url: form.elements.link_url.value.trim() || null,
    date_label: form.elements.date_label.value.trim() || null,
    badge_label: form.elements.badge_label.value.trim() || null,
    metadata,
    sort_order: Number(form.elements.sort_order.value || 0),
    is_featured: form.elements.is_featured.checked,
    is_enabled: form.elements.is_enabled.checked,
    status,
    published_at: status === "published" ? new Date().toISOString() : null
  };
}

async function saveModule(event) {
  event.preventDefault();
  const submitButton = form.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  setStatus("正在儲存首頁模組...", "info");
  try {
    const imageId = await uploadImageIfNeeded();
    const payload = buildPayload(imageId);
    const id = form.elements.id.value;
    const query = id ? supabase.from("content_modules").update(payload).eq("id", id) : supabase.from("content_modules").insert(payload);
    const { error } = await query;
    if (error) throw error;
    setStatus("首頁模組已儲存。", "success");
    resetForm();
    await loadModules();
  } catch (error) {
    console.error("Failed to save home module", error);
    setStatus(`儲存失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function deleteModule(id) {
  const item = modules.find((module) => module.id === id);
  if (!item || !window.confirm(`確定刪除「${item.title}」嗎？`)) return;
  const { error } = await supabase.from("content_modules").delete().eq("id", id);
  if (error) {
    setStatus(`刪除失敗：${error.message}`, "error");
    return;
  }
  setStatus("已刪除首頁模組。", "success");
  await loadModules();
}

form?.addEventListener("submit", saveModule);
newButton?.addEventListener("click", resetForm);
refreshButton?.addEventListener("click", loadModules);
tableBody?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-module]");
  const deleteButton = event.target.closest("[data-delete-module]");
  if (editButton) fillForm(modules.find((item) => item.id === editButton.dataset.editModule));
  if (deleteButton) deleteModule(deleteButton.dataset.deleteModule);
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: async () => {
    resetForm();
    await loadModules();
  }
}).catch((error) => reportAdminBootError(loading, error));
