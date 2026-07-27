import { supabase } from "../lib/supabaseClient.js";
import { fetchMediaImages, getFocalPointOption, getImageUsageOption, prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { canEditScope, canPublishScope, canViewScope, contentSaveMessage, scopeForPageSlug } from "./content-scope.js";
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
const requestPublishButton = document.querySelector("#requestPagePublishButton");
const imagePicker = document.querySelector("#sectionImagePicker");
const imagePickerGrid = document.querySelector("#sectionImagePickerGrid");
const imagePickerStatus = document.querySelector("#sectionImagePickerStatus");
const imageUploadForm = document.querySelector("#sectionImageUploadForm");

let currentPage = null;
let currentPageScope = "";
let currentSections = [];
let activeImageSectionId = null;
let adminPermissions = {};

const specialPageManagers = {
  about: { label: "關於歲悅目前由前端固定版型管理，尚未開放後台改文案。", href: "" },
  milestones: { label: "請到大事記管理時間軸卡片。", href: "/admin/milestones" },
  "home-care": { label: "請到固定版位管理居家照顧內容。", href: "/admin/template-fields?page=home-care" },
  "day-care": { label: "請到固定版位管理日間照顧內容。", href: "/admin/template-fields?page=day-care" },
  community: { label: "請到固定版位管理社區據點內容。", href: "/admin/template-fields?page=community" },
  nursing: { label: "請到固定版位管理護理復能內容。", href: "/admin/template-fields?page=nursing" },
  "migrant-training": { label: "請到固定版位管理移工培訓內容。", href: "/admin/template-fields?page=migrant-training" },
  quality: { label: "請到固定版位管理教育品管內容。", href: "/admin/template-fields?page=quality" },
  software: { label: "請到固定版位管理軟體系統內容。", href: "/admin/template-fields?page=software" },
  talent: { label: "請到招募管理編輯 Hero、部門與職缺。", href: "/admin/recruiting" },
  land: { label: "請到招募管理編輯 Hero 與合作卡片。", href: "/admin/recruiting" },
  "investor-recruiting": { label: "請到招募管理編輯 Hero 與合作卡片。", href: "/admin/recruiting" },
  health: { label: "健康3.0 列表由文章與分類資料驅動，請到文章管理編輯。", href: "/admin/articles" },
  courses: { label: "課程報名頁由課程資料驅動，請到課程管理編輯。", href: "/admin/courses" },
  investors: { label: "請到投資人資料管理編輯前台內容。", href: "/admin/investor-data" },
  "ir-finance": { label: "請到投資人資料管理編輯前台內容。", href: "/admin/investor-data" },
  "ir-governance": { label: "請到投資人資料管理編輯前台內容。", href: "/admin/investor-data" },
  "ir-shareholders": { label: "請到投資人資料管理編輯前台內容。", href: "/admin/investor-data" },
  contact: { label: "聯絡表單是首頁固定區塊；請從首頁內容管理對應的 contact 版位調整。", href: "/admin/pages" }
};

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

function renderSections() {
  if (!sectionsEditor) return;

  if (!currentSections.length) {
    sectionsEditor.innerHTML = '<div class="admin-empty-state">此頁尚未建立固定版位。為避免前台出現無法對應的空白區塊，請先由開發者建立版位契約，再回到後台填入內容。</div>';
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
        <div class="admin-front-map">
          <strong>前台對應</strong>
          <span>頁面 <code>#${escapeHTML(currentPage?.slug || "")}</code> 的 <code>${escapeHTML(section.section_key || "section")}</code> 區塊。修改這張卡的標題、文字、按鈕或圖片，會影響官網同一個區塊。</span>
        </div>
        <div class="admin-form-grid">
          <label>
            <span>Section 標題</span>
            <input type="text" data-field="title" value="${escapeHTML(section.title || "")}" />
          </label>
          <label>
            <span>固定順序</span>
            <input type="number" value="${Number(section.sort_order || 0)}" readonly aria-readonly="true" />
            <small>版位順序由前台模板鎖定；可新增的卡片請使用對應集合管理頁。</small>
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
              ${["hero","service_hero","article_cover","card","milestone","square","avatar","logo","map","freeform"].map((value) => `<option value="${value}" ${imageSettings.image_usage === value ? "selected" : ""}>${escapeHTML(getImageUsageOption(value)?.label || value)}</option>`).join("")}
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
      .select("id, slug, title, seo_title, seo_description, is_enabled, status, published_at, updated_at")
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
  currentPageScope = scopeForPageSlug(currentPage.slug);
  currentSections = sectionsResult.data || [];

  if (!canViewScope(adminPermissions, currentPageScope)) {
    throw new Error("這個頁面不在你的內容責任範圍內。");
  }

  form.dataset.contentScope = currentPageScope;
  requestPublishButton.dataset.contentScope = currentPageScope;

  editorTitle.textContent = currentPage.title || "編輯頁面";
  editorSlug.textContent = `/${currentPage.slug}`;
  form.elements.title.value = currentPage.title || "";
  form.elements.seo_title.value = currentPage.seo_title || "";
  form.elements.seo_description.value = currentPage.seo_description || "";
  form.elements.is_enabled.checked = Boolean(currentPage.is_enabled);

  const specialManager = specialPageManagers[currentPage.slug];
  if (specialManager) {
    form.querySelectorAll("input, textarea, select, button").forEach((control) => { control.disabled = true; });
    requestPublishButton.hidden = true;
    sectionsEditor.innerHTML = `
      <div class="admin-empty-state">
        <strong>此頁不使用通用 page_sections</strong>
        <p>${escapeHTML(specialManager.label)}在這裡修改會造成後台顯示已儲存、前台卻不變，因此已改為唯讀。</p>
        ${specialManager.href ? `<a class="admin-row-action" href="${escapeHTML(specialManager.href)}">前往正確管理頁</a>` : ""}
      </div>
    `;
    setEditorStatus("此頁由專用固定版型管理；通用頁面編輯器已切換為唯讀。", "info");
    return;
  }

  renderSections();
  setEditorStatus("", "success");
}

async function savePage() {
  if (!currentPage) return;
  if (!canEditScope(adminPermissions, currentPageScope)) {
    setEditorStatus("你的帳號只有檢視權限，無法儲存頁面內容。", "error");
    return;
  }
  if (specialPageManagers[currentPage.slug]) {
    setEditorStatus("此頁由專用管理頁控制，通用 page_sections 不會寫入。", "error");
    return;
  }

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
      is_enabled: Boolean(section.is_enabled),
      status: currentPage.status || "draft",
      published_at: currentPage.status === "published"
        ? currentPage.published_at || new Date().toISOString()
        : null
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

    setEditorStatus(contentSaveMessage(adminPermissions, currentPageScope, "頁面內容"), "success");
    if (canPublishScope(adminPermissions, currentPageScope)) {
      await loadPageEditor();
    }
  } catch (error) {
    console.error("Failed to save page", error);
    setEditorStatus(`儲存失敗：${error.message}`, "error");
  } finally {
    form.querySelector("button[type='submit']")?.removeAttribute("disabled");
  }
}

async function requestPagePublish() {
  if (!canEditScope(adminPermissions, currentPageScope)) {
    setEditorStatus("你的帳號只有檢視權限，無法送出發布申請。", "error");
    return;
  }
  if (!currentPage?.id) {
    setEditorStatus("請先讀取頁面後再送審發布。", "error");
    return;
  }

  const note = window.prompt("送審備註（可留空）：", "請協助審核頁面文案、圖片與 SEO 後發布。");
  if (note === null) return;

  requestPublishButton?.setAttribute("disabled", "true");
  setEditorStatus("正在建立頁面送審發布申請...", "info");
  try {
    const { error } = await supabase.from("publish_requests").insert({
      entity_table: "pages",
      entity_id: currentPage.id,
      entity_title: form.elements.title.value.trim() || currentPage.title,
      target_status: "published",
      request_note: note || null,
      status: "pending"
    });
    if (error) throw error;

    await supabase.from("admin_activity_logs").insert({
      action: "publish_request_created",
      entity_table: "pages",
      entity_id: currentPage.id,
      message: form.elements.title.value.trim() || "頁面送審發布"
    });

    setEditorStatus("已送出發布審核，請到「發布與權限」查看進度。", "success");
  } catch (error) {
    console.error("Failed to request page publish", error);
    setEditorStatus(`送審失敗：${error.message}`, "error");
  } finally {
    requestPublishButton?.removeAttribute("disabled");
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
    const items = await fetchMediaImages({ scopeKey: currentPageScope });
    renderImagePickerGrid(items);
    setImagePickerStatus("", "success");
  } catch (error) {
    console.error("Failed to load image picker media", error);
    setImagePickerStatus(`無法讀取媒體庫：${error.message}`, "error");
    renderImagePickerGrid([]);
  }
}

function openImagePicker(sectionId) {
  if (!canEditScope(adminPermissions, currentPageScope)) {
    setEditorStatus("你的帳號只有檢視權限，無法更換圖片。", "error");
    return;
  }
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
  if (!canEditScope(adminPermissions, currentPageScope)) {
    setImagePickerStatus("你的帳號只有檢視權限，無法上傳圖片。", "error");
    return;
  }
  const file = imageUploadForm.elements.file.files?.[0];
  if (!file) {
    setImagePickerStatus("請先選擇圖片檔案。", "error");
    return;
  }

  const submitButton = imageUploadForm.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  setImagePickerStatus("正在檢查圖片比例...", "info");

  try {
    const preparedFile = await prepareImageForUpload(file, imageUploadForm.elements.image_usage.value);
    if (!preparedFile) {
      setImagePickerStatus("已取消上傳。", "info");
      return;
    }
    setImagePickerStatus("正在上傳圖片並寫入 media 資料表...", "info");
    const media = await uploadImageToMedia({
      file: preparedFile,
      altText: imageUploadForm.elements.alt_text.value,
      caption: imageUploadForm.elements.caption.value,
      imageUsage: imageUploadForm.elements.image_usage.value,
      focalPoint: imageUploadForm.elements.focal_point.value,
      scopeKey: currentPageScope
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
requestPublishButton?.addEventListener("click", requestPagePublish);

bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: async (_session, permissions) => {
    adminPermissions = permissions || {};
    await loadPageEditor();
    if (canPublishScope(adminPermissions, currentPageScope)) {
      requestPublishButton.hidden = true;
    }
    if (!canEditScope(adminPermissions, currentPageScope)) {
      form.querySelectorAll("input, textarea, select, button").forEach((control) => { control.disabled = true; });
      requestPublishButton.hidden = true;
      setEditorStatus("目前為唯讀模式；需要此頁所屬部門的編輯權限才能修改。", "info");
    }
  }
}).catch((error) => reportAdminBootError(loading, error));
