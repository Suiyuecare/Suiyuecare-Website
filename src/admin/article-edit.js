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
let currentContentJson = {};

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

function toLines(value = "") {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function toFaqItems(value = "") {
  return toLines(value)
    .map((line) => {
      const [question, ...answerParts] = line.split(/[|｜]/);
      return {
        question: (question || "").trim(),
        answer: answerParts.join("｜").trim()
      };
    })
    .filter((item) => item.question && item.answer);
}

function fromFaqItems(value = []) {
  return Array.isArray(value)
    ? value.map((item) => `${item.question || ""}｜${item.answer || ""}`.trim()).filter((line) => line !== "｜").join("\n")
    : "";
}

function getVideoContent(contentJson = {}) {
  const source = contentJson && typeof contentJson === "object" ? contentJson : {};
  const nested = source.video && typeof source.video === "object" ? source.video : {};
  return {
    video_type: source.video_type || nested.type || "",
    video_provider: source.video_provider || nested.provider || "youtube",
    video_url: source.video_url || nested.url || "",
    video_duration: source.video_duration || nested.duration || "",
    video_label: source.video_label || nested.label || "",
    video_caption: source.video_caption || nested.caption || ""
  };
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
      const section = category.section_key ? ` / ${category.section_key}` : "";
      return `<option value="${escapeHTML(category.id)}" ${selected}>${escapeHTML(category.name)}${escapeHTML(section)}</option>`;
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
  currentContentJson = article.content_json && typeof article.content_json === "object" ? article.content_json : {};
  form.elements.title.value = article.title || "";
  form.elements.slug.value = article.slug || "";
  form.elements.category_id.value = article.category_id || "";
  form.elements.content_type.value = article.content_type || currentContentJson.content_type || "article";
  form.elements.status.value = article.status || "draft";
  form.elements.published_at.value = toLocalDateTimeInput(article.published_at);
  form.elements.sort_order.value = Number(article.sort_order || 0);
  form.elements.reading_minutes.value = article.reading_minutes || "";
  form.elements.difficulty.value = article.difficulty || "";
  form.elements.target_audience.value = article.target_audience || "";
  form.elements.related_service.value = article.related_service || "";
  form.elements.is_featured.checked = Boolean(article.is_featured);
  form.elements.is_enabled.checked = article.is_enabled !== false;
  form.elements.subtitle.value = article.subtitle || "";
  form.elements.excerpt.value = article.excerpt || "";
  form.elements.author_name.value = article.author_name || "";
  form.elements.author_title.value = article.author_title || "";
  form.elements.tags.value = Array.isArray(article.tags) ? article.tags.join(", ") : "";
  form.elements.recommended_slots.value = Array.isArray(article.recommended_slots) ? article.recommended_slots.join(", ") : "";
  form.elements.summary_points.value = Array.isArray(article.summary_points) ? article.summary_points.join("\n") : "";
  form.elements.cta_text.value = article.cta_text || currentContentJson.cta_text || "";
  form.elements.cta_url.value = article.cta_url || currentContentJson.cta_url || "";
  form.elements.source_name.value = article.source_name || currentContentJson.source_name || "";
  form.elements.source_url.value = article.source_url || currentContentJson.source_url || "";
  form.elements.related_slugs.value = Array.isArray(currentContentJson.related_slugs) ? currentContentJson.related_slugs.join(", ") : "";
  form.elements.content.value = article.content || "";
  const video = getVideoContent(currentContentJson);
  form.elements.video_type.value = video.video_type;
  form.elements.video_provider.value = video.video_provider;
  form.elements.video_url.value = video.video_url;
  form.elements.video_duration.value = video.video_duration;
  form.elements.video_label.value = video.video_label;
  form.elements.video_caption.value = video.video_caption;
  form.elements.seo_title.value = article.seo_title || "";
  form.elements.seo_description.value = article.seo_description || "";
  form.elements.seo_keywords.value = Array.isArray(article.seo_keywords) ? article.seo_keywords.join(", ") : "";
  form.elements.canonical_url.value = article.canonical_url || currentContentJson.canonical_url || "";
  form.elements.faq_text.value = fromFaqItems(article.faq_json || currentContentJson.faq || []);
}

function buildPayload() {
  let publishedAt = fromLocalDateTimeInput(form.elements.published_at.value);
  const status = form.elements.status.value;
  if (status === "published" && !publishedAt) publishedAt = new Date().toISOString();
  const videoUrl = form.elements.video_url.value.trim();
  const videoType = form.elements.video_type.value;
  const videoProvider = form.elements.video_provider.value || "youtube";
  const videoDuration = form.elements.video_duration.value.trim();
  const videoLabel = form.elements.video_label.value.trim();
  const videoCaption = form.elements.video_caption.value.trim();
  const contentJson = { ...currentContentJson };
  const relatedSlugs = toTags(form.elements.related_slugs.value);
  if (relatedSlugs.length) {
    contentJson.related_slugs = relatedSlugs;
  } else {
    delete contentJson.related_slugs;
  }
  contentJson.content_type = form.elements.content_type.value || "article";
  if (form.elements.cta_text.value.trim() || form.elements.cta_url.value.trim()) {
    contentJson.cta_text = form.elements.cta_text.value.trim();
    contentJson.cta_url = form.elements.cta_url.value.trim();
  } else {
    delete contentJson.cta_text;
    delete contentJson.cta_url;
  }
  if (form.elements.source_name.value.trim() || form.elements.source_url.value.trim()) {
    contentJson.source_name = form.elements.source_name.value.trim();
    contentJson.source_url = form.elements.source_url.value.trim();
  } else {
    delete contentJson.source_name;
    delete contentJson.source_url;
  }
  if (form.elements.canonical_url.value.trim()) {
    contentJson.canonical_url = form.elements.canonical_url.value.trim();
  } else {
    delete contentJson.canonical_url;
  }
  if (videoUrl) {
    Object.assign(contentJson, {
        video_type: videoType || "video",
        video_provider: videoProvider,
        video_url: videoUrl,
        video_duration: videoDuration,
        video_label: videoLabel,
        video_caption: videoCaption,
        video: {
          type: videoType || "video",
          provider: videoProvider,
          url: videoUrl,
          duration: videoDuration,
          label: videoLabel,
          caption: videoCaption
        }
      });
  } else {
    delete contentJson.video_type;
    delete contentJson.video_provider;
    delete contentJson.video_url;
    delete contentJson.video_duration;
    delete contentJson.video_label;
    delete contentJson.video_caption;
    delete contentJson.video;
  }

  return {
    title: form.elements.title.value.trim(),
    slug: slugify(form.elements.slug.value),
    category_id: form.elements.category_id.value || null,
    content_type: form.elements.content_type.value || "article",
    status,
    published_at: publishedAt,
    sort_order: Number(form.elements.sort_order.value || 0),
    reading_minutes: form.elements.reading_minutes.value ? Number(form.elements.reading_minutes.value) : null,
    difficulty: form.elements.difficulty.value || null,
    target_audience: form.elements.target_audience.value.trim() || null,
    related_service: form.elements.related_service.value || null,
    is_featured: form.elements.is_featured.checked,
    is_enabled: form.elements.is_enabled.checked,
    subtitle: form.elements.subtitle.value.trim() || null,
    excerpt: form.elements.excerpt.value.trim() || null,
    cover_image_id: selectedCoverMedia?.id || null,
    author_name: form.elements.author_name.value.trim() || null,
    author_title: form.elements.author_title.value.trim() || null,
    tags: toTags(form.elements.tags.value),
    recommended_slots: toTags(form.elements.recommended_slots.value),
    summary_points: toLines(form.elements.summary_points.value),
    cta_text: form.elements.cta_text.value.trim() || null,
    cta_url: form.elements.cta_url.value.trim() || null,
    source_name: form.elements.source_name.value.trim() || null,
    source_url: form.elements.source_url.value.trim() || null,
    canonical_url: form.elements.canonical_url.value.trim() || null,
    faq_json: toFaqItems(form.elements.faq_text.value),
    content: form.elements.content.value.trim() || null,
    content_json: contentJson,
    seo_title: form.elements.seo_title.value.trim() || null,
    seo_description: form.elements.seo_description.value.trim() || null,
    seo_keywords: toTags(form.elements.seo_keywords.value)
  };
}

async function loadCategories() {
  const { data, error } = await supabase
    .from("article_categories")
    .select("id, name, slug, section_key, sort_order, is_enabled")
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
    currentContentJson = {};
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
      content_type,
      slug,
      title,
      subtitle,
      excerpt,
      content,
      content_json,
      cover_image_id,
      author_name,
      author_title,
      tags,
      recommended_slots,
      summary_points,
      reading_minutes,
      difficulty,
      target_audience,
      related_service,
      source_name,
      source_url,
      canonical_url,
      faq_json,
      cta_text,
      cta_url,
      sort_order,
      is_featured,
      is_enabled,
      status,
      published_at,
      seo_title,
      seo_description,
      seo_keywords,
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
