import { supabase, supabaseStorageBuckets } from "../lib/supabaseClient.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#adminCoursesStatus");
const form = document.querySelector("#courseEditorForm");
const tableBody = document.querySelector("#coursesTableBody");
const refreshButton = document.querySelector("#refreshCoursesButton");
const newButton = document.querySelector("#newCourseButton");
const formTitle = document.querySelector("#courseFormTitle");
const coverPreview = document.querySelector("#courseCoverPreview");

let courses = [];

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `course-${Date.now()}`;
}

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function toIsoOrNull(value) {
  return value ? new Date(value).toISOString() : null;
}

function renderStatusBadge(status) {
  const labels = { draft: "草稿", published: "已發布", scheduled: "排程", archived: "封存" };
  return `<span class="admin-publish-badge" data-status="${escapeHTML(status || "draft")}">${escapeHTML(labels[status] || status || "草稿")}</span>`;
}

function getCover(course) {
  return course.cover_image || course.media || null;
}

function renderCoverPreview(course = null) {
  const cover = course ? getCover(course) : null;
  const url = cover?.public_url || "";
  coverPreview.innerHTML = `
    <figure class="${url ? "" : "empty"}" data-image-usage="article_cover">
      ${url ? `<img src="${escapeHTML(url)}" alt="${escapeHTML(cover.alt_text || course?.title || "課程封面")}" />` : "<span>尚未選擇封面圖</span>"}
    </figure>
    <div>
      <strong>封面圖安全比例</strong>
      <p>課程卡片使用 16:9 與卡片裁切，圖片上傳時會跳出裁切器並顯示網頁、平板、手機預覽。</p>
    </div>
  `;
}

function renderCourses() {
  if (!tableBody) return;
  if (!courses.length) {
    tableBody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state">目前沒有課程。</div></td></tr>`;
    return;
  }

  tableBody.innerHTML = courses.map((course) => `
    <tr>
      <td><strong>${escapeHTML(course.title)}</strong><small>${escapeHTML(course.excerpt || course.slug)}</small></td>
      <td><time>${course.starts_at ? formatUpdatedAt(course.starts_at) : "未設定"}</time></td>
      <td>${escapeHTML(course.course_type || "-")}</td>
      <td>${renderStatusBadge(course.status)}</td>
      <td>${course.is_featured ? "重要課程" : "一般"}</td>
      <td>
        <div class="admin-table-actions">
          <button type="button" data-edit-course="${escapeHTML(course.id)}">編輯</button>
          <button type="button" data-delete-course="${escapeHTML(course.id)}">刪除</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  form.elements.cover_image_id.value = "";
  form.elements.is_enabled.checked = true;
  form.elements.status.value = "draft";
  formTitle.textContent = "新增課程";
  renderCoverPreview();
}

function fillForm(course) {
  form.elements.id.value = course.id;
  form.elements.cover_image_id.value = course.cover_image_id || "";
  form.elements.title.value = course.title || "";
  form.elements.slug.value = course.slug || "";
  form.elements.course_type.value = course.course_type || "實體課";
  form.elements.registration_status.value = course.registration_status || "open";
  form.elements.excerpt.value = course.excerpt || "";
  form.elements.description.value = course.description || "";
  form.elements.starts_at.value = toDatetimeLocal(course.starts_at);
  form.elements.ends_at.value = toDatetimeLocal(course.ends_at);
  form.elements.location.value = course.location || "";
  form.elements.location_detail.value = course.location_detail || "";
  form.elements.price_text.value = course.price_text || "";
  form.elements.capacity.value = course.capacity ?? "";
  form.elements.seats_label.value = course.seats_label || "";
  form.elements.sort_order.value = course.sort_order ?? 0;
  form.elements.registration_url.value = course.registration_url || "";
  form.elements.status.value = course.status || "draft";
  form.elements.is_featured.checked = Boolean(course.is_featured);
  form.elements.is_enabled.checked = Boolean(course.is_enabled);
  formTitle.textContent = `編輯：${course.title}`;
  renderCoverPreview(course);
}

async function loadCourses() {
  setStatus("正在讀取課程資料...", "info");
  refreshButton?.setAttribute("disabled", "true");
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*, cover_image:media!courses_cover_image_id_fkey(id, public_url, alt_text, file_name)")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("starts_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    courses = data || [];
    renderCourses();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load courses", error);
    setStatus(`讀取課程失敗：${error.message}`, "error");
    courses = [];
    renderCourses();
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

async function uploadCoverIfNeeded() {
  const file = form.elements.cover_file.files?.[0];
  if (!file) return form.elements.cover_image_id.value || null;

  setStatus("正在裁切並上傳課程封面...", "info");
  const preparedFile = await prepareImageForUpload(file, "article_cover");
  if (!preparedFile) throw new Error("已取消封面上傳。");
  const media = await uploadImageToMedia({
    file: preparedFile,
    altText: `${form.elements.title.value.trim()}課程封面`,
    caption: "課程報名封面圖",
    imageUsage: "article_cover",
    focalPoint: "center",
    bucket: supabaseStorageBuckets.courseImages
  });
  return media.id;
}

function buildPayload(coverImageId) {
  const status = form.elements.status.value || "draft";
  return {
    title: form.elements.title.value.trim(),
    slug: slugify(form.elements.slug.value || form.elements.title.value),
    excerpt: form.elements.excerpt.value.trim() || null,
    description: form.elements.description.value.trim() || null,
    course_type: form.elements.course_type.value,
    location: form.elements.location.value.trim() || null,
    location_detail: form.elements.location_detail.value.trim() || null,
    starts_at: toIsoOrNull(form.elements.starts_at.value),
    ends_at: toIsoOrNull(form.elements.ends_at.value),
    price_text: form.elements.price_text.value.trim() || "免費",
    capacity: form.elements.capacity.value ? Number(form.elements.capacity.value) : null,
    seats_label: form.elements.seats_label.value.trim() || null,
    registration_status: form.elements.registration_status.value,
    registration_url: form.elements.registration_url.value.trim() || null,
    cover_image_id: coverImageId,
    sort_order: Number(form.elements.sort_order.value || 0),
    is_featured: form.elements.is_featured.checked,
    is_enabled: form.elements.is_enabled.checked,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    seo_title: `${form.elements.title.value.trim()}｜歲悅課程報名`,
    seo_description: form.elements.excerpt.value.trim() || null
  };
}

async function saveCourse(event) {
  event.preventDefault();
  const submitButton = form.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  try {
    const coverImageId = await uploadCoverIfNeeded();
    const payload = buildPayload(coverImageId);
    const id = form.elements.id.value;
    const query = id ? supabase.from("courses").update(payload).eq("id", id) : supabase.from("courses").insert(payload);
    const { error } = await query;
    if (error) throw error;
    setStatus("課程已儲存，前台會依發布狀態自動更新。", "success");
    resetForm();
    await loadCourses();
  } catch (error) {
    console.error("Failed to save course", error);
    setStatus(`儲存課程失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function deleteCourse(id) {
  const course = courses.find((item) => item.id === id);
  if (!course || !window.confirm(`確定刪除「${course.title}」嗎？`)) return;
  setStatus("正在刪除課程...", "info");
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
    setStatus("課程已刪除。", "success");
    await loadCourses();
  } catch (error) {
    console.error("Failed to delete course", error);
    setStatus(`刪除課程失敗：${error.message}`, "error");
  }
}

form?.addEventListener("submit", saveCourse);
newButton?.addEventListener("click", resetForm);
refreshButton?.addEventListener("click", loadCourses);
form?.elements.title?.addEventListener("input", () => {
  if (!form.elements.id.value && !form.elements.slug.value) form.elements.slug.value = slugify(form.elements.title.value);
});
tableBody?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-course]");
  const deleteButton = event.target.closest("[data-delete-course]");
  if (editButton) fillForm(courses.find((course) => course.id === editButton.dataset.editCourse));
  if (deleteButton) deleteCourse(deleteButton.dataset.deleteCourse);
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
    await loadCourses();
  }
}).catch((error) => reportAdminBootError(loading, error));
