import { supabase, supabaseStorageBuckets } from "../lib/supabaseClient.js";
import { applyPublishStatusUi } from "./auth.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";
import { canEditScope, canPublishScope, canViewScope, contentDeleteMessage, contentSaveMessage, contentScopeLabel, editableScopeOptions } from "./content-scope.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#adminFilesStatus");
const form = document.querySelector("#fileEditorForm");
const tableBody = document.querySelector("#filesTableBody");
const refreshButton = document.querySelector("#refreshFilesButton");
const newButton = document.querySelector("#newFileButton");
const formTitle = document.querySelector("#fileFormTitle");
const currentInfo = document.querySelector("#fileCurrentInfo");

let files = [];
let adminPermissions = {};
let editableFileScopes = [];

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function slugify(value = "") {
  return value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `file-${Date.now()}`;
}

function safeFileName(name = "document") {
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "file";
  const base = name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "document";
  return `${base}.${ext}`;
}

function renderFiles() {
  if (!tableBody) return;
  if (!files.length) {
    tableBody.innerHTML = `<tr><td colspan="5"><div class="admin-empty-state">目前沒有檔案。</div></td></tr>`;
    return;
  }

  tableBody.innerHTML = files.map((file) => `
    <tr>
      <td><strong>${escapeHTML(file.title)}</strong><small>${escapeHTML(file.file_name || file.slug)}</small></td>
      <td>${escapeHTML(file.category)} · ${escapeHTML(file.file_type)}<small>${escapeHTML(contentScopeLabel(file.scope_key))}</small></td>
      <td>${escapeHTML(file.status)}${file.is_public ? " · 前台可見" : " · 後台限定"}</td>
      <td><time>${formatUpdatedAt(file.updated_at)}</time></td>
      <td>
        <div class="admin-table-actions">
          <a href="/api/download-file?id=${encodeURIComponent(file.id)}" target="_blank" rel="noopener">下載</a>
          <button type="button" data-edit-file="${escapeHTML(file.id)}">${canEditScope(adminPermissions, file.scope_key) ? "編輯" : "查看"}</button>
          ${canEditScope(adminPermissions, file.scope_key) ? `<button type="button" data-delete-file="${escapeHTML(file.id)}">刪除</button>` : ""}
        </div>
      </td>
    </tr>
  `).join("");
}

function renderScopeOptions(selectedScope = "") {
  const options = editableFileScopes.map((option) => ({ ...option, temporary: false }));
  if (selectedScope && !options.some((option) => option.value === selectedScope)) {
    options.push({ value: selectedScope, label: contentScopeLabel(selectedScope), temporary: true });
  }
  form.elements.scope_key.innerHTML = options.length
    ? options.map((option) => `<option value="${escapeHTML(option.value)}"${option.temporary ? ' data-temporary-scope="true"' : ""}>${escapeHTML(option.label)}</option>`).join("")
    : '<option value="">目前沒有可編輯的內容範圍</option>';
  if (selectedScope) form.elements.scope_key.value = selectedScope;
}

function syncFileFormScope() {
  const scopeKey = form.elements.scope_key.value;
  form.dataset.contentScope = scopeKey;
  form.elements.status.dataset.contentScope = scopeKey;
  const editable = canEditScope(adminPermissions, scopeKey);
  form.querySelectorAll("input, textarea, select, button").forEach((control) => {
    control.disabled = !editable;
  });
  applyPublishStatusUi(adminPermissions);
}

function resetForm() {
  form.reset();
  ["id", "bucket", "storage_path", "file_name", "mime_type", "size_bytes"].forEach((name) => {
    form.elements[name].value = "";
  });
  form.elements.status.value = "draft";
  form.elements.is_enabled.checked = true;
  form.elements.is_public.checked = true;
  formTitle.textContent = "新增檔案";
  currentInfo.hidden = true;
  currentInfo.textContent = "";
  renderScopeOptions(editableFileScopes[0]?.value || "");
  syncFileFormScope();
}

function fillForm(file) {
  if (!file) return;
  renderScopeOptions(file.scope_key || "files");
  form.elements.id.value = file.id;
  form.elements.title.value = file.title || "";
  form.elements.slug.value = file.slug || "";
  form.elements.category.value = file.category || "general";
  form.elements.file_type.value = file.file_type || "PDF";
  form.elements.scope_key.value = file.scope_key || "files";
  form.elements.description.value = file.description || "";
  form.elements.sort_order.value = file.sort_order ?? 0;
  form.elements.status.value = file.status || "draft";
  form.elements.is_featured.checked = Boolean(file.is_featured);
  form.elements.is_enabled.checked = Boolean(file.is_enabled);
  form.elements.is_public.checked = Boolean(file.is_public);
  form.elements.bucket.value = file.bucket || "";
  form.elements.storage_path.value = file.storage_path || "";
  form.elements.file_name.value = file.file_name || "";
  form.elements.mime_type.value = file.mime_type || "";
  form.elements.size_bytes.value = file.size_bytes || "";
  formTitle.textContent = `編輯：${file.title}`;
  currentInfo.hidden = false;
  currentInfo.textContent = file.file_name ? `目前檔案：${file.file_name}` : "目前尚未上傳檔案";
  syncFileFormScope();
}

async function loadFiles() {
  setStatus("正在讀取檔案列表...", "info");
  try {
    const { data, error } = await supabase
      .from("downloadable_files")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    files = (data || []).filter((file) => canViewScope(adminPermissions, file.scope_key));
    renderFiles();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load files", error);
    setStatus(`讀取檔案失敗：${error.message}`, "error");
    files = [];
    renderFiles();
  }
}

async function uploadFileIfNeeded() {
  const file = form.elements.file.files?.[0];
  if (!file) {
    return {
      bucket: form.elements.bucket.value || null,
      storage_path: form.elements.storage_path.value || null,
      file_name: form.elements.file_name.value || null,
      mime_type: form.elements.mime_type.value || null,
      size_bytes: form.elements.size_bytes.value ? Number(form.elements.size_bytes.value) : null
    };
  }

  const bucket = supabaseStorageBuckets.investorFiles;
  const scopeKey = form.elements.scope_key.value;
  const storagePath = `cms/${scopeKey}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream"
  });
  if (error) throw error;
  return {
    bucket,
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    size_bytes: file.size
  };
}

function buildPayload(fileInfo) {
  const status = form.elements.status.value || "draft";
  return {
    title: form.elements.title.value.trim(),
    slug: slugify(form.elements.slug.value || form.elements.title.value),
    description: form.elements.description.value.trim() || null,
    category: form.elements.category.value,
    file_type: form.elements.file_type.value,
    scope_key: form.elements.scope_key.value,
    ...fileInfo,
    sort_order: Number(form.elements.sort_order.value || 0),
    is_featured: form.elements.is_featured.checked,
    is_enabled: form.elements.is_enabled.checked,
    is_public: form.elements.is_public.checked,
    status,
    published_at: status === "published" ? new Date().toISOString() : null
  };
}

async function saveFile(event) {
  event.preventDefault();
  if (!canEditScope(adminPermissions, form.elements.scope_key.value)) {
    setStatus("這個檔案責任範圍不在你的編輯權限內。", "error");
    return;
  }
  const submitButton = form.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  setStatus("正在儲存檔案...", "info");
  try {
    const fileInfo = await uploadFileIfNeeded();
    if (!fileInfo.storage_path) throw new Error("請上傳檔案。");
    const payload = buildPayload(fileInfo);
    const scopeKey = payload.scope_key;
    const id = form.elements.id.value;
    const query = id ? supabase.from("downloadable_files").update(payload).eq("id", id) : supabase.from("downloadable_files").insert(payload);
    const { data, error } = await query.select("id").maybeSingle();
    if (error) throw error;
    if (data?.id) form.elements.id.value = data.id;
    setStatus(contentSaveMessage(adminPermissions, scopeKey, "檔案"), "success");
    if (canPublishScope(adminPermissions, scopeKey)) {
      resetForm();
      await loadFiles();
    }
  } catch (error) {
    console.error("Failed to save file", error);
    setStatus(`儲存檔案失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function deleteFile(id) {
  const file = files.find((item) => item.id === id);
  if (!canEditScope(adminPermissions, file?.scope_key)) {
    setStatus("這個檔案不在你的內容責任範圍內。", "error");
    return;
  }
  if (!file || !window.confirm(`確定刪除「${file.title}」嗎？`)) return;
  setStatus("正在刪除檔案...", "info");
  try {
    const { error } = await supabase.from("downloadable_files").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (canPublishScope(adminPermissions, file.scope_key) && file.bucket && file.storage_path) {
      await supabase.storage.from(file.bucket).remove([file.storage_path]);
    }
    setStatus(contentDeleteMessage(adminPermissions, file.scope_key, "檔案"), "success");
    if (canPublishScope(adminPermissions, file.scope_key)) await loadFiles();
  } catch (error) {
    console.error("Failed to delete file", error);
    setStatus(`刪除檔案失敗：${error.message}`, "error");
  }
}

form?.addEventListener("submit", saveFile);
form?.elements.scope_key?.addEventListener("change", syncFileFormScope);
newButton?.addEventListener("click", resetForm);
refreshButton?.addEventListener("click", loadFiles);
form?.elements.title?.addEventListener("input", () => {
  if (!form.elements.id.value && !form.elements.slug.value) form.elements.slug.value = slugify(form.elements.title.value);
});
tableBody?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-file]");
  const deleteButton = event.target.closest("[data-delete-file]");
  if (editButton) fillForm(files.find((file) => file.id === editButton.dataset.editFile));
  if (deleteButton) deleteFile(deleteButton.dataset.deleteFile);
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: async (_session, permissions) => {
    adminPermissions = permissions || {};
    editableFileScopes = editableScopeOptions(adminPermissions);
    resetForm();
    await loadFiles();
    if (!editableFileScopes.length) {
      form.querySelectorAll("input, textarea, select, button").forEach((control) => {
        control.disabled = true;
      });
      newButton.hidden = true;
    }
  }
}).catch((error) => reportAdminBootError(loading, error));
