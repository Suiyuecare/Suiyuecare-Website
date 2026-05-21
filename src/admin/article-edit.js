import { supabase } from "../lib/supabaseClient.js";
import { fetchMediaImages, getFocalPointOption, getImageUsageOption, prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#articleEditorStatus");
const editorTitle = document.querySelector("#articleEditorTitle");
const editorMeta = document.querySelector("#articleEditorMeta");
const form = document.querySelector("#articleEditorForm");
const coverPreview = document.querySelector("#articleCoverPreview");
const openCoverPickerButton = document.querySelector("#openArticleCoverPicker");
const clearCoverButton = document.querySelector("#clearArticleCover");
const requestPublishButton = document.querySelector("#requestArticlePublishButton");
const coverPicker = document.querySelector("#articleCoverPicker");
const coverPickerGrid = document.querySelector("#articleCoverPickerGrid");
const coverPickerStatus = document.querySelector("#articleCoverPickerStatus");
const coverUploadForm = document.querySelector("#articleCoverUploadForm");

let articleId = null;
let isNewArticle = true;
let categories = [];
let selectedCoverMedia = null;

function getArticleIdFromLocation() {
  const queryId = new URLSearchParams(window.location.search).get("id");
  if (queryId) return queryId;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts.at(-1);
  if (!last || last === "articles" || last === "[id]" || last === "new") return null;
  return decodeURIComponent(last);
}

function setEditorStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTags(value = "") {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toLocalDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function fromLocalDateTimeInput(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function renderCategoryOptions(selectedId = "") {
  const options = [
    '<option value="">未分類</option>',
    ...categories.map((category) => {
      const selected = category.id === selectedId ? "selected" : "";
      return `<option value="${escapeHTML(category.id)}" ${selected}>${escapeHTML(category.name)}</option>`;
    })
  ];
  form.elements.category_id.innerHTML = options.join("");
}

function renderCoverImage() {
  if (!coverPreview) return;

  if (!selectedCoverMedia?.public_url) {
    coverPreview.classList.add("empty");
    coverPreview.innerHTML = "<span>尚未選擇封面圖</span>";
    return;
  }

  coverPreview.classList.remove("empty");
  coverPreview.innerHTML = `
    <img src="${escapeHTML(selectedCoverMedia.public_url)}" alt="${escapeHTML(selectedCoverMedia.alt_text || selectedCoverMedia.file_name || "文章封面")}" data-image-usage="${escapeHTML(selectedCoverMedia.image_usage || "article_cover")}" data-focal-point="${escapeHTML(selectedCoverMedia.focal_point || "center")}" />
  `;
}

function fillForm(article) {
  form.elements.title.value = article.title || "";
  form.elements.slug.value = article.slug || "";
  form.elements.category_id.value = article.category_id || "";
  form.elements.status.value = article.status || "draft";
  form.elements.published_at.value = toLocalDateTimeInput(article.published_at);
  form.elements.sort_order.value = Number(article.sort_order || 0);
  form.elements.is_featured.checked = Boolean(article.is_featured);
  form.elements.is_enabled.checked = article.is_enabled !== false;
  form.elements.subtitle.value = article.subtitle || "";
  form.elements.excerpt.value = article.excerpt || "";
  form.elements.author_name.value = article.author_name || "";
  form.elements.author_title.value = article.author_title || "";
  form.elements.tags.value = Array.isArray(article.tags) ? article.tags.join(", ") : "";
  form.elements.content.value = article.content || "";
  form.elements.seo_title.value = article.seo_title || "";
  form.elements.seo_description.value = article.seo_description || "";
}

function buildPayload() {
  let publishedAt = fromLocalDateTimeInput(form.elements.published_at.value);
  const status = form.elements.status.value;
  if (status === "published" && !publishedAt) publishedAt = new Date().toISOString();

  return {
    title: form.elements.title.value.trim(),
    slug: slugify(form.elements.slug.value),
    category_id: form.elements.category_id.value || null,
    status,
    published_at: publishedAt,
    sort_order: Number(form.elements.sort_order.value || 0),
    is_featured: form.elements.is_featured.checked,
    is_enabled: form.elements.is_enabled.checked,
    subtitle: form.elements.subtitle.value.trim() || null,
    excerpt: form.elements.excerpt.value.trim() || null,
    cover_image_id: selectedCoverMedia?.id || null,
    author_name: form.elements.author_name.value.trim() || null,
    author_title: form.elements.author_title.value.trim() || null,
    tags: toTags(form.elements.tags.value),
    content: form.elements.content.value.trim() || null,
    seo_title: form.elements.seo_title.value.trim() || null,
    seo_description: form.elements.seo_description.value.trim() || null
  };
}

async function loadCategories() {
  const { data, error } = await supabase
    .from("article_categories")
    .select("id, name, slug, sort_order, is_enabled")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  categories = data || [];
  renderCategoryOptions();
}

async function loadCoverMedia(coverImageId) {
  selectedCoverMedia = null;
  if (!coverImageId) {
    renderCoverImage();
    return;
  }

  const { data, error } = await supabase
    .from("media")
    .select("id, public_url, file_name, alt_text, caption, image_usage, focal_point")
    .eq("id", coverImageId)
    .maybeSingle();

  if (error) throw error;
  selectedCoverMedia = data || null;
  renderCoverImage();
}

async function loadArticleEditor() {
  articleId = getArticleIdFromLocation();
  isNewArticle = !articleId;

  setEditorStatus("正在讀取文章資料...", "info");
  await loadCategories();

  if (isNewArticle) {
    editorTitle.textContent = "新增文章";
    editorMeta.textContent = "建立新的文章草稿，儲存後可在列表中管理。";
    form.elements.status.value = "draft";
    form.elements.is_enabled.checked = true;
    selectedCoverMedia = null;
    renderCoverImage();
    setEditorStatus("", "success");
    return;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      category_id,
      slug,
      title,
      subtitle,
      excerpt,
      content,
      cover_image_id,
      author_name,
      author_title,
      tags,
      sort_order,
      is_featured,
      is_enabled,
      status,
      published_at,
      seo_title,
      seo_description,
      updated_at
    `)
    .eq("id", articleId)
    .single();

  if (error) throw error;

  renderCategoryOptions(data.category_id || "");
  fillForm(data);
  await loadCoverMedia(data.cover_image_id);
  editorTitle.textContent = data.title || "編輯文章";
  editorMeta.textContent = `最後更新：${formatUpdatedAt(data.updated_at)}`;
  setEditorStatus("", "success");
}

function setCoverPickerStatus(message, type = "info") {
  if (!coverPickerStatus) return;
  coverPickerStatus.hidden = !message;
  coverPickerStatus.textContent = message;
  coverPickerStatus.dataset.status = type;
}

function renderCoverPickerGrid(items) {
  if (!coverPickerGrid) return;
  if (!items.length) {
    coverPickerGrid.innerHTML = '<div class="admin-empty-state">媒體庫目前沒有圖片，可以先在上方直接上傳。</div>';
    return;
  }

  coverPickerGrid.innerHTML = items.map((item) => `
    <button type="button" class="admin-picker-card" data-media-id="${escapeHTML(item.id)}">
      <img src="${escapeHTML(item.public_url || "")}" alt="${escapeHTML(item.alt_text || item.file_name || "媒體圖片")}" data-image-usage="${escapeHTML(item.image_usage || "card")}" data-focal-point="${escapeHTML(item.focal_point || "center")}" />
      <span>${escapeHTML(item.file_name || "未命名圖片")}</span>
      <small>${escapeHTML(getImageUsageOption(item.image_usage)?.label || "卡片縮圖")} · ${escapeHTML(getFocalPointOption(item.focal_point)?.label || "置中")}</small>
    </button>
  `).join("");
}

async function loadCoverPickerMedia() {
  setCoverPickerStatus("正在讀取媒體庫...", "info");
  try {
    const items = await fetchMediaImages();
    renderCoverPickerGrid(items);
    setCoverPickerStatus("", "success");
  } catch (error) {
    console.error("Failed to load article cover media", error);
    setCoverPickerStatus(`無法讀取媒體庫：${error.message}`, "error");
    renderCoverPickerGrid([]);
  }
}

function openCoverPicker() {
  coverPicker.hidden = false;
  document.body.classList.add("modal-open");
  loadCoverPickerMedia();
}

function closeCoverPicker() {
  coverPicker.hidden = true;
  coverUploadForm?.reset();
  document.body.classList.remove("modal-open");
}

function applyCoverMedia(media) {
  selectedCoverMedia = media;
  renderCoverImage();
  closeCoverPicker();
  setEditorStatus("封面圖已選定，請記得儲存文章。", "success");
}

async function uploadAndSelectCover(event) {
  event.preventDefault();
  const file = coverUploadForm.elements.file.files?.[0];
  if (!file) {
    setCoverPickerStatus("請先選擇圖片檔案。", "error");
    return;
  }

  const submitButton = coverUploadForm.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  setCoverPickerStatus("正在檢查圖片比例...", "info");

  try {
    const preparedFile = await prepareImageForUpload(file, coverUploadForm.elements.image_usage.value || "article_cover");
    if (!preparedFile) {
      setCoverPickerStatus("已取消上傳。", "info");
      return;
    }
    setCoverPickerStatus("正在上傳封面並寫入 media 資料表...", "info");
    const media = await uploadImageToMedia({
      file: preparedFile,
      altText: coverUploadForm.elements.alt_text.value,
      caption: coverUploadForm.elements.caption.value,
      imageUsage: coverUploadForm.elements.image_usage.value || "article_cover",
      focalPoint: coverUploadForm.elements.focal_point.value || "center"
    });
    applyCoverMedia(media);
  } catch (error) {
    console.error("Failed to upload article cover", error);
    setCoverPickerStatus(`上傳失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function saveArticle(event) {
  event.preventDefault();
  const submitButton = document.querySelector('button[form="articleEditorForm"]');
  submitButton?.setAttribute("disabled", "true");
  setEditorStatus("正在儲存文章...", "info");

  const payload = buildPayload();
  if (!payload.title || !payload.slug) {
    setEditorStatus("請填寫文章標題與 slug。", "error");
    submitButton?.removeAttribute("disabled");
    return;
  }

  try {
    if (isNewArticle) {
      const { data, error } = await supabase
        .from("articles")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;
      articleId = data.id;
      isNewArticle = false;
      window.history.replaceState(null, "", `/admin/articles/${encodeURIComponent(articleId)}`);
    } else {
      const { error } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", articleId);

      if (error) throw error;
    }

    setEditorStatus("文章已儲存。", "success");
    await loadArticleEditor();
  } catch (error) {
    console.error("Failed to save article", error);
    setEditorStatus(`儲存失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function requestArticlePublish() {
  if (isNewArticle || !articleId) {
    setEditorStatus("請先儲存文章草稿，再送審發布。", "error");
    return;
  }

  const note = window.prompt("送審備註（可留空）：", "請協助審核文章內容、封面圖與 SEO 後發布。");
  if (note === null) return;

  requestPublishButton?.setAttribute("disabled", "true");
  setEditorStatus("正在建立送審發布申請...", "info");
  try {
    const { error } = await supabase.from("publish_requests").insert({
      entity_table: "articles",
      entity_id: articleId,
      entity_title: form.elements.title.value.trim() || editorTitle.textContent,
      target_status: "published",
      request_note: note || null,
      status: "pending"
    });
    if (error) throw error;

    await supabase.from("admin_activity_logs").insert({
      action: "publish_request_created",
      entity_table: "articles",
      entity_id: articleId,
      message: form.elements.title.value.trim() || "文章送審發布"
    });

    setEditorStatus("已送出發布審核，請到「發布與權限」查看進度。", "success");
  } catch (error) {
    console.error("Failed to request article publish", error);
    setEditorStatus(`送審失敗：${error.message}`, "error");
  } finally {
    requestPublishButton?.removeAttribute("disabled");
  }
}

form?.addEventListener("submit", saveArticle);
form?.elements.title.addEventListener("input", () => {
  if (isNewArticle && !form.elements.slug.value) {
    form.elements.slug.value = slugify(form.elements.title.value);
  }
});
form?.elements.slug.addEventListener("blur", () => {
  form.elements.slug.value = slugify(form.elements.slug.value);
});
openCoverPickerButton?.addEventListener("click", openCoverPicker);
clearCoverButton?.addEventListener("click", () => {
  selectedCoverMedia = null;
  renderCoverImage();
  setEditorStatus("封面圖已清除，請記得儲存文章。", "success");
});
coverPickerGrid?.addEventListener("click", async (event) => {
  const card = event.target.closest("[data-media-id]");
  if (!card) return;

  const { data, error } = await supabase
    .from("media")
    .select("id, public_url, file_name, alt_text, caption, image_usage, focal_point")
    .eq("id", card.dataset.mediaId)
    .single();

  if (error) {
    setCoverPickerStatus(`選擇封面失敗：${error.message}`, "error");
    return;
  }
  applyCoverMedia(data);
});
coverPicker?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-cover-picker]") || event.target === coverPicker) {
    closeCoverPicker();
  }
});
coverUploadForm?.addEventListener("submit", uploadAndSelectCover);
requestPublishButton?.addEventListener("click", requestArticlePublish);
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadArticleEditor
}).catch((error) => reportAdminBootError(loading, error));
