import { supabase } from "../lib/supabaseClient.js";
import { fetchMediaImages, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const uploadForm = document.querySelector("#adminMediaUploadForm");
const mediaStatus = document.querySelector("#adminMediaStatus");
const mediaGrid = document.querySelector("#adminMediaGrid");
const refreshMediaButton = document.querySelector("#adminRefreshMedia");

function setMediaStatus(message, type = "info") {
  if (!mediaStatus) return;
  mediaStatus.hidden = !message;
  mediaStatus.textContent = message;
  mediaStatus.dataset.status = type;
}

function renderMedia(items) {
  if (!mediaGrid) return;

  if (!items.length) {
    mediaGrid.innerHTML = '<div class="admin-empty-state">目前沒有圖片。請先上傳第一張圖片。</div>';
    return;
  }

  mediaGrid.innerHTML = items.map((item) => `
    <article class="admin-media-card" data-media-id="${escapeHTML(item.id)}" data-bucket="${escapeHTML(item.bucket)}" data-path="${escapeHTML(item.storage_path)}">
      <figure>
        <img src="${escapeHTML(item.public_url || "")}" alt="${escapeHTML(item.alt_text || item.file_name || "媒體圖片")}" loading="lazy" />
      </figure>
      <div>
        <strong>${escapeHTML(item.file_name || "未命名圖片")}</strong>
        <span>${escapeHTML(item.alt_text || "尚未填寫 alt text")}</span>
        <code>${escapeHTML(item.public_url || "")}</code>
        <time>上傳時間：${formatUpdatedAt(item.created_at)}</time>
        <button type="button" data-delete-media>刪除圖片</button>
      </div>
    </article>
  `).join("");
}

async function loadMedia() {
  if (!supabase) return;
  refreshMediaButton?.setAttribute("disabled", "true");
  setMediaStatus("正在讀取圖片列表...", "info");

  try {
    const data = await fetchMediaImages();
    renderMedia(data);
    setMediaStatus("", "success");
  } catch (error) {
    console.error("Failed to load media", error);
    setMediaStatus(`無法讀取圖片列表：${error.message}`, "error");
    renderMedia([]);
  } finally {
    refreshMediaButton?.removeAttribute("disabled");
  }
}

async function uploadMedia(event) {
  event.preventDefault();
  if (!supabase || !uploadForm) return;

  const fileInput = uploadForm.elements.file;
  const file = fileInput.files?.[0];
  if (!file) {
    setMediaStatus("請先選擇圖片檔案。", "error");
    return;
  }
  if (!file.type.startsWith("image/")) {
    setMediaStatus("只支援圖片檔案。", "error");
    return;
  }

  const submitButton = document.querySelector('button[form="adminMediaUploadForm"]');
  submitButton?.setAttribute("disabled", "true");
  setMediaStatus("正在上傳圖片到 Supabase Storage...", "info");

  try {
    await uploadImageToMedia({
      file,
      altText: uploadForm.elements.alt_text.value,
      caption: uploadForm.elements.caption.value
    });

    uploadForm.reset();
    setMediaStatus("圖片已上傳並寫入 media 資料表。", "success");
    await loadMedia();
  } catch (error) {
    console.error("Failed to upload media", error);
    setMediaStatus(`上傳失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function deleteMedia(card) {
  const mediaId = card.dataset.mediaId;
  const bucket = card.dataset.bucket;
  const storagePath = card.dataset.path;
  if (!mediaId || !bucket || !storagePath) return;
  if (!window.confirm("確定要刪除這張圖片嗎？此動作會刪除 Storage 檔案與 media 資料。")) return;

  setMediaStatus("正在刪除圖片...", "info");

  try {
    const { error: storageError } = await supabase.storage.from(bucket).remove([storagePath]);
    if (storageError) throw storageError;

    const { error: deleteError } = await supabase.from("media").delete().eq("id", mediaId);
    if (deleteError) throw deleteError;

    setMediaStatus("圖片已刪除。", "success");
    await loadMedia();
  } catch (error) {
    console.error("Failed to delete media", error);
    setMediaStatus(`刪除失敗：${error.message}`, "error");
  }
}

uploadForm?.addEventListener("submit", uploadMedia);
refreshMediaButton?.addEventListener("click", loadMedia);
mediaGrid?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-media]");
  if (!deleteButton) return;
  const card = deleteButton.closest(".admin-media-card");
  if (card) deleteMedia(card);
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadMedia
}).catch((error) => reportAdminBootError(loading, error));
