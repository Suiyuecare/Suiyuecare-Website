import { supabase } from "../lib/supabaseClient.js";
import { fetchMediaImages, getFocalPointOption, getImageUsageOption, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#pageEditorStatus");
const editorTitle = document.querySelector("#pageEditorTitle");
const editorSlug = document.querySelector("#pageEditorSlug");
const form = document.querySelector("#pageEditorForm");
const sectionsEditor = document.querySelector("#pageSectionsEditor");
const addSectionButton = document.querySelector("#addSectionButton");
const imagePicker = document.querySelector("#sectionImagePicker");
const imagePickerGrid = document.querySelector("#sectionImagePickerGrid");
const imagePickerStatus = document.querySelector("#sectionImagePickerStatus");
const imageUploadForm = document.querySelector("#sectionImageUploadForm");

let currentPage = null;
let currentSections = [];
let activeImageSectionId = null;

function getPageIdFromLocation() {
  const queryId = new URLSearchParams(window.location.search).get("id");
  if (queryId) return queryId;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts.at(-1);
  if (last && last !== "pages" && last !== "[id]") return decodeURIComponent(last);
  return null;
}

function setEditorStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function getSectionContent(section) {
  return section.content_json && typeof section.content_json === "object" ? section.content_json : {};
}

function getSectionImageSettings(content = {}) {
  return {
    image_usage: content.image_usage || "card",
    image_fit: content.image_fit || (["logo", "map"].includes(content.image_usage) ? "contain" : "cover"),
    focal_point: content.focal_point || "center"
  };
}

function createEmptySection() {
  return {
    id: `new-${crypto.randomUUID()}`,
    isNew: true,
    section_key: `section_${Date.now()}`,
    title: "",
    body: "",
    sort_order: currentSections.length + 1,
    is_enabled: true,
    image_id: null,
    content_json: {
      button_text: "",
      button_href: "",
      image_url: "",
      image_usage: "card",
      image_fit: "cover",
      focal_point: "center"
    }
  };
}

function renderSections() {
  if (!sectionsEditor) return;

  if (!currentSections.length) {
    sectionsEditor.innerHTML = '<div class="admin-empty-state">目前沒有 section，請新增第一個內容區塊。</div>';
    return;
  }

  sectionsEditor.innerHTML = currentSections.map((section, index) => {
    const content = getSectionContent(section);
    const imageUrl = content.image_url || "";
    const imageSettings = getSectionImageSettings(content);
    return `
      <article class="admin-section-card" data-section-id="${escapeHTML(section.id)}">
        <header>
          <div>
            <span>Section ${index + 1}</span>
            <strong>${escapeHTML(section.section_key || "未命名區塊")}</strong>
          </div>
          <label class="admin-toggle-field compact">
            <input type="checkbox" data-field="is_enabled" ${section.is_enabled ? "checked" : ""} />
            <span>顯示</span>
          </label>
        </header>
        <div class="admin-form-grid">
          <label>
            <span>Section 標題</span>
            <input type="text" data-field="title" value="${escapeHTML(section.title || "")}" />
          </label>
          <label>
            <span>排序</span>
            <input type="number" data-field="sort_order" min="0" value="${Number(section.sort_order || 0)}" />
          </label>
          <label class="admin-field-wide">
            <span>文字內容</span>
            <textarea data-field="body" rows="5">${escapeHTML(section.body || "")}</textarea>
          </label>
          <label>
            <span>按鈕文字</span>
            <input type="text" data-content-field="button_text" value="${escapeHTML(content.button_text || "")}" />
          </label>
          <label>
            <span>按鈕連結</span>
            <input type="text" data-content-field="button_href" value="${escapeHTML(content.button_href || "")}" />
          </label>
          <label class="admin-field-wide">
            <span>圖片 URL</span>
            <input type="text" data-content-field="image_url" value="${escapeHTML(imageUrl)}" placeholder="https://... 或 Supabase Storage public URL" />
          </label>
          <label>
            <span>圖片用途</span>
            <select data-content-field="image_usage">
              ${["hero","service_hero","article_cover","card","square","avatar","logo","map","freeform"].map((value) => `<option value="${value}" ${imageSettings.image_usage === value ? "selected" : ""}>${escapeHTML(getImageUsageOption(value)?.label || value)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>圖片顯示方式</span>
            <select data-content-field="image_fit">
              <option value="cover" ${imageSettings.image_fit === "cover" ? "selected" : ""}>裁切填滿 cover</option>
              <option value="contain" ${imageSettings.image_fit === "contain" ? "selected" : ""}>完整顯示 contain</option>
            </select>
          </label>
          <label>
            <span>裁切焦點</span>
            <select data-content-field="focal_point">
              ${["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"].map((value) => `<option value="${value}" ${imageSettings.focal_point === value ? "selected" : ""}>${escapeHTML(getFocalPointOption(value)?.label || value)}</option>`).join("")}
            </select>
          </label>
          <div class="admin-section-image-tools admin-field-wide">
            <figure class="${imageUrl ? "" : "empty"}" data-image-usage="${escapeHTML(imageSettings.image_usage)}" data-focal-point="${escapeHTML(imageSettings.focal_point)}" data-image-fit="${escapeHTML(imageSettings.image_fit)}">
              ${imageUrl ? `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(section.title || "Section image")}" />` : "<span>尚未選擇圖片</span>"}
            </figure>
            <div>
              <strong>Section 圖片</strong>
              <p>選定後會儲存圖片、用途、顯示方式與裁切焦點。前台會固定容器比例，避免因為圖片尺寸不同而跑版。</p>
              <button type="button" data-open-image-picker>選擇或上傳圖片</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function syncSectionFromCard(card) {
  const sectionId = card.dataset.sectionId;
  const section = currentSections.find((item) => item.id === sectionId);
  if (!section) return;

  card.querySelectorAll("[data-field]").forEach((field) => {
    const key = field.dataset.field;
    if (field.type === "checkbox") {
      section[key] = field.checked;
    } else if (field.type === "number") {
      section[key] = Number(field.value || 0);
    } else {
      section[key] = field.value;
    }
  });

  const content = getSectionContent(section);
  card.querySelectorAll("[data-content-field]").forEach((field) => {
    content[field.dataset.contentField] = field.value;
  });
  section.content_json = content;
}

function syncAllSectionsFromDOM() {
  document.querySelectorAll(".admin-section-card").forEach(syncSectionFromCard);
}

async function loadPageEditor() {
  const pageId = getPageIdFromLocation();
  if (!pageId) {
    setEditorStatus("找不到頁面 ID。請從頁面管理列表進入編輯頁。", "error");
    return;
  }

  setEditorStatus("正在讀取頁面與 sections...", "info");

  const [pageResult, sectionsResult] = await Promise.all([
    supabase
      .from("pages")
      .select("id, slug, title, seo_title, seo_description, is_enabled, updated_at")
      .eq("id", pageId)
      .single(),
    supabase
      .from("page_sections")
      .select("id, section_key, title, body, image_id, content_json, sort_order, is_enabled")
      .eq("page_id", pageId)
      .order("sort_order", { ascending: true })
  ]);

  if (pageResult.error) throw pageResult.error;
  if (sectionsResult.error) throw sectionsResult.error;

  currentPage = pageResult.data;
  currentSections = sectionsResult.data || [];

  editorTitle.textContent = currentPage.title || "編輯頁面";
  editorSlug.textContent = `/${currentPage.slug}`;
  form.elements.title.value = currentPage.title || "";
  form.elements.seo_title.value = currentPage.seo_title || "";
  form.elements.seo_description.value = currentPage.seo_description || "";
  form.elements.is_enabled.checked = Boolean(currentPage.is_enabled);

  renderSections();
  setEditorStatus("", "success");
}

async function savePage() {
  if (!currentPage) return;

  syncAllSectionsFromDOM();
  setEditorStatus("正在儲存頁面內容...", "info");
  form.querySelector("button[type='submit']")?.setAttribute("disabled", "true");

  try {
    const { error: pageError } = await supabase
      .from("pages")
      .update({
        title: form.elements.title.value.trim(),
        seo_title: form.elements.seo_title.value.trim() || null,
        seo_description: form.elements.seo_description.value.trim() || null,
        is_enabled: form.elements.is_enabled.checked
      })
      .eq("id", currentPage.id);

    if (pageError) throw pageError;

    const sectionPayloads = currentSections.map((section) => ({
      id: section.isNew ? undefined : section.id,
      page_id: currentPage.id,
      section_key: section.section_key,
      title: section.title,
      body: section.body,
      image_id: section.image_id || null,
      content_json: section.content_json || {},
      sort_order: Number(section.sort_order || 0),
      is_enabled: Boolean(section.is_enabled)
    }));

    const existingSections = sectionPayloads.filter((section) => section.id);
    const newSections = sectionPayloads.filter((section) => !section.id);

    if (existingSections.length) {
      const { error } = await supabase
        .from("page_sections")
        .upsert(existingSections, { onConflict: "id" });
      if (error) throw error;
    }

    if (newSections.length) {
      const { error } = await supabase
        .from("page_sections")
        .insert(newSections);
      if (error) throw error;
    }

    setEditorStatus("已儲存頁面內容。", "success");
    await loadPageEditor();
  } catch (error) {
    console.error("Failed to save page", error);
    setEditorStatus(`儲存失敗：${error.message}`, "error");
  } finally {
    form.querySelector("button[type='submit']")?.removeAttribute("disabled");
  }
}

function setImagePickerStatus(message, type = "info") {
  if (!imagePickerStatus) return;
  imagePickerStatus.hidden = !message;
  imagePickerStatus.textContent = message;
  imagePickerStatus.dataset.status = type;
}

function getActiveImageSection() {
  return currentSections.find((section) => section.id === activeImageSectionId) || null;
}

function applyMediaToActiveSection(media) {
  const section = getActiveImageSection();
  if (!section) return;

  const content = getSectionContent(section);
  section.image_id = media.id;
  content.image_url = media.public_url || "";
  content.image_alt = media.alt_text || media.file_name || "";
  content.image_usage = media.image_usage || content.image_usage || "card";
  content.focal_point = media.focal_point || content.focal_point || "center";
  content.image_fit = ["logo", "map"].includes(content.image_usage) ? "contain" : (content.image_fit || "cover");
  section.content_json = content;
  closeImagePicker();
  renderSections();
}

function renderImagePickerGrid(items) {
  if (!imagePickerGrid) return;
  if (!items.length) {
    imagePickerGrid.innerHTML = '<div class="admin-empty-state">媒體庫目前沒有圖片，可以先在上方直接上傳。</div>';
    return;
  }

  imagePickerGrid.innerHTML = items.map((item) => `
    <button type="button" class="admin-picker-card" data-media-id="${escapeHTML(item.id)}">
      <img src="${escapeHTML(item.public_url || "")}" alt="${escapeHTML(item.alt_text || item.file_name || "媒體圖片")}" data-image-usage="${escapeHTML(item.image_usage || "card")}" data-focal-point="${escapeHTML(item.focal_point || "center")}" />
      <span>${escapeHTML(item.file_name || "未命名圖片")}</span>
      <small>${escapeHTML(getImageUsageOption(item.image_usage)?.label || "卡片縮圖")} · ${escapeHTML(getFocalPointOption(item.focal_point)?.label || "置中")}</small>
    </button>
  `).join("");
}

async function loadImagePickerMedia() {
  setImagePickerStatus("正在讀取媒體庫...", "info");
  try {
    const items = await fetchMediaImages();
    renderImagePickerGrid(items);
    setImagePickerStatus("", "success");
  } catch (error) {
    console.error("Failed to load image picker media", error);
    setImagePickerStatus(`無法讀取媒體庫：${error.message}`, "error");
    renderImagePickerGrid([]);
  }
}

function openImagePicker(sectionId) {
  syncAllSectionsFromDOM();
  activeImageSectionId = sectionId;
  imagePicker.hidden = false;
  document.body.classList.add("modal-open");
  loadImagePickerMedia();
}

function closeImagePicker() {
  imagePicker.hidden = true;
  activeImageSectionId = null;
  imageUploadForm?.reset();
  document.body.classList.remove("modal-open");
}

async function uploadAndSelectImage(event) {
  event.preventDefault();
  const file = imageUploadForm.elements.file.files?.[0];
  if (!file) {
    setImagePickerStatus("請先選擇圖片檔案。", "error");
    return;
  }

  const submitButton = imageUploadForm.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  setImagePickerStatus("正在上傳圖片並寫入 media 資料表...", "info");

  try {
    const media = await uploadImageToMedia({
      file,
      altText: imageUploadForm.elements.alt_text.value,
      caption: imageUploadForm.elements.caption.value,
      imageUsage: imageUploadForm.elements.image_usage.value,
      focalPoint: imageUploadForm.elements.focal_point.value
    });
    applyMediaToActiveSection(media);
    setEditorStatus("圖片已選定，請記得儲存頁面。", "success");
  } catch (error) {
    console.error("Failed to upload section image", error);
    setImagePickerStatus(`上傳失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

addSectionButton?.addEventListener("click", () => {
  currentSections.push(createEmptySection());
  renderSections();
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  savePage();
});

sectionsEditor?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-image-picker]");
  if (!button) return;
  const card = button.closest(".admin-section-card");
  if (card) openImagePicker(card.dataset.sectionId);
});

imagePickerGrid?.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-media-id]");
  if (!card) return;
  const mediaId = card.dataset.mediaId;
  const { data, error } = await supabase
    .from("media")
    .select("id, public_url, file_name, alt_text, image_usage, focal_point")
    .eq("id", mediaId)
    .single();
  if (error) {
    setImagePickerStatus(`選擇圖片失敗：${error.message}`, "error");
    return;
  }
  applyMediaToActiveSection(data);
  setEditorStatus("圖片已選定，請記得儲存頁面。", "success");
});

imagePicker?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-image-picker]") || event.target === imagePicker) {
    closeImagePicker();
  }
});

imageUploadForm?.addEventListener("submit", uploadAndSelectImage);

bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadPageEditor
}).catch((error) => reportAdminBootError(loading, error));
