import { supabase, supabaseStorageBuckets } from "../lib/supabaseClient.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import {
  canEditScope,
  canPublishScope,
  contentDeleteMessage,
  contentSaveMessage,
  isEducationCourseManager
} from "./content-scope.js";
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
const signupStatusBox = document.querySelector("#courseSignupsStatus");
const signupRefreshButton = document.querySelector("#refreshCourseSignupsButton");
const signupStatusFilter = document.querySelector("#courseSignupStatusFilter");
const signupTableBody = document.querySelector("#courseSignupsTableBody");
const signupProcessForm = document.querySelector("#courseSignupProcessForm");
const signupDetailTitle = document.querySelector("#courseSignupDetailTitle");
const signupDetailBox = document.querySelector("#courseSignupDetailBox");
const signupTimeline = document.querySelector("#courseSignupTimeline");
const internalSignupsPanel = document.querySelector("[data-course-internal-signups]");
const courseCountTargets = {
  published: document.querySelector('[data-course-count="published"]'),
  pending: document.querySelector('[data-course-count="pending"]'),
  total: document.querySelector('[data-course-count="total"]')
};

let courses = [];
let courseSignups = [];
let selectedCourseSignup = null;
let adminPermissions = {};
let courseManagerMode = false;
const courseScope = "courses";
const courseFormsScope = "forms:courses";
let courseCoverById = new Map();

const signupStatusLabels = {
  new: "未處理",
  contacted: "已聯絡",
  closed: "已完成",
  spam: "取消/無效"
};

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function setSignupStatus(message, type = "info") {
  if (!signupStatusBox) return;
  signupStatusBox.hidden = !message;
  signupStatusBox.textContent = message;
  signupStatusBox.dataset.status = type;
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

function normalizeRegistrationUrl(value = "", { googleOnly = false } = {}) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("報名網址格式不正確，請貼上完整的 https:// 網址。");
  }
  if (url.protocol !== "https:") {
    throw new Error("報名網址必須使用 https:// 安全連線。");
  }
  const isGoogleForm = url.hostname === "forms.gle"
    || (url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/"));
  if (googleOnly && !isGoogleForm) {
    throw new Error("請貼上 Google 表單網址（forms.gle 或 docs.google.com/forms）。");
  }
  return url.href;
}

function validatedRegistrationUrl() {
  const value = form.elements.registration_url.value;
  const normalized = normalizeRegistrationUrl(value, { googleOnly: courseManagerMode });
  if (courseManagerMode && form.elements.registration_status.value === "open" && !normalized) {
    throw new Error("課程目前是「開放報名」，請先貼上 Google 報名表單網址。");
  }
  return normalized || null;
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

function fromLocalDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function renderStatusBadge(status, course = {}) {
  if (course._pending_delete) {
    return `<span class="admin-publish-badge" data-status="pending">等待審核下架</span>`;
  }
  if (course._pending_review) {
    return `<span class="admin-publish-badge" data-status="pending">等待執行長審核</span>`;
  }
  const labels = { draft: "草稿", published: "已發布", scheduled: "排程", archived: "封存" };
  return `<span class="admin-publish-badge" data-status="${escapeHTML(status || "draft")}">${escapeHTML(labels[status] || status || "草稿")}</span>`;
}

function renderSignupStatusBadge(status) {
  return `<span class="admin-publish-badge" data-status="${escapeHTML(status || "new")}">${escapeHTML(signupStatusLabels[status] || status || "未處理")}</span>`;
}

function getSignupMeta(item = {}) {
  const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
  return {
    course_title: metadata.course_title || item.subject || "",
    course_id: metadata.course_id || "",
    priority: metadata.priority || "normal",
    next_action: metadata.next_action || "",
    next_follow_up_at: metadata.next_follow_up_at || "",
    process_history: Array.isArray(metadata.process_history) ? metadata.process_history : []
  };
}

function getCover(course) {
  return courseCoverById.get(course.cover_image_id) || course.cover_image || course.media || null;
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
  const published = courses.filter((course) => course.status === "published" && course.is_enabled && !course._pending_delete).length;
  const pending = courses.filter((course) => course._pending_review).length;
  if (courseCountTargets.published) courseCountTargets.published.textContent = published;
  if (courseCountTargets.pending) courseCountTargets.pending.textContent = pending;
  if (courseCountTargets.total) courseCountTargets.total.textContent = courses.length;

  if (!courses.length) {
    tableBody.innerHTML = `<tr><td colspan="5"><div class="admin-empty-state">目前沒有課程。填寫左側資料並送出後，執行長核准就會出現在官網。</div></td></tr>`;
    return;
  }

  tableBody.innerHTML = courses.map((course) => {
    const cover = getCover(course);
    return `
    <tr>
      <td>
        <div class="admin-table-media-cell">
          ${cover?.public_url ? `<img src="${escapeHTML(cover.public_url)}" alt="${escapeHTML(cover.alt_text || course.title || "課程封面")}" />` : `<span aria-hidden="true">CS</span>`}
          <div><strong>${escapeHTML(course.title)}</strong><small>${escapeHTML(course._pending_review ? "這是目前送審中的版本" : course.excerpt || course.slug)}</small></div>
        </div>
      </td>
      <td><time>${course.starts_at ? formatUpdatedAt(course.starts_at) : "未設定"}</time></td>
      <td>${renderStatusBadge(course.status, course)}</td>
      <td>${course.registration_url ? "Google 表單" : course.registration_status === "open" ? "尚未設定" : "尚未開放"}</td>
      <td>
        <div class="admin-table-actions">
          <button type="button" data-edit-course="${escapeHTML(course.id)}">${canEditScope(adminPermissions, courseScope) ? "編輯" : "查看"}</button>
          ${canEditScope(adminPermissions, courseScope) ? `<button type="button" data-delete-course="${escapeHTML(course.id)}">刪除</button>` : ""}
        </div>
      </td>
    </tr>
  `;
  }).join("");
}

function renderSignupCounts() {
  const counts = { new: 0, contacted: 0, closed: 0, spam: 0 };
  courseSignups.forEach((item) => {
    const key = item.status || "new";
    if (counts[key] !== undefined) counts[key] += 1;
  });
  Object.entries(counts).forEach(([key, value]) => {
    const target = document.querySelector(`[data-course-signup-count="${key}"]`);
    if (target) target.textContent = `${value} 筆`;
  });
}

function renderSignupTimeline(item) {
  if (!signupTimeline) return;
  if (!item) {
    signupTimeline.innerHTML = "";
    return;
  }
  const history = getSignupMeta(item).process_history;
  signupTimeline.innerHTML = `
    <strong>處理紀錄</strong>
    ${history.length ? `
      <ol>
        ${history.slice().reverse().map((entry) => `
          <li>
            <span>${escapeHTML(entry.status_label || entry.status || "更新")}</span>
            <p>${escapeHTML(entry.note || "狀態已更新。")}</p>
            <small>${escapeHTML(entry.actor || "後台使用者")}｜${formatUpdatedAt(entry.at)}</small>
          </li>
        `).join("")}
      </ol>
    ` : `<p>尚無處理紀錄。儲存狀態後會自動留下紀錄。</p>`}
  `;
}

function renderCourseSignups() {
  if (!signupTableBody) return;
  if (!courseSignups.length) {
    signupTableBody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state">目前沒有課程報名資料。</div></td></tr>`;
    return;
  }

  signupTableBody.innerHTML = courseSignups.map((item) => {
    const meta = getSignupMeta(item);
    return `
      <tr>
        <td><strong>${escapeHTML(item.name || "未填姓名")}</strong><small>${escapeHTML(item.email || "-")}</small></td>
        <td><strong>${escapeHTML(meta.course_title || item.subject || "未指定課程")}</strong><small>${escapeHTML(meta.next_action || "尚未設定下一步")}</small></td>
        <td>${escapeHTML(item.phone || "-")}</td>
        <td>${renderSignupStatusBadge(item.status)}</td>
        <td><time>${formatUpdatedAt(item.created_at)}</time></td>
        <td><div class="admin-table-actions"><button type="button" data-view-course-signup="${escapeHTML(item.id)}">查看</button></div></td>
      </tr>
    `;
  }).join("");
}

function renderSignupDetail(item) {
  selectedCourseSignup = item || null;
  if (!signupProcessForm || !signupDetailBox || !signupDetailTitle) return;
  if (!item) {
    signupProcessForm.elements.id.value = "";
    signupDetailTitle.textContent = "報名詳細資料";
    signupDetailBox.className = "admin-empty-state admin-field-wide";
    signupDetailBox.textContent = "請從左側選擇一筆課程報名。";
    renderSignupTimeline(null);
    return;
  }

  const meta = getSignupMeta(item);
  signupProcessForm.elements.id.value = item.id;
  signupProcessForm.elements.status.value = item.status || "new";
  signupProcessForm.elements.priority.value = meta.priority;
  signupProcessForm.elements.next_action.value = meta.next_action;
  signupProcessForm.elements.next_follow_up_at.value = toDatetimeLocal(meta.next_follow_up_at);
  signupProcessForm.elements.internal_note.value = item.internal_note || "";
  signupProcessForm.querySelectorAll("input, textarea, select, button").forEach((control) => {
    control.disabled = !canEditScope(adminPermissions, courseFormsScope);
  });
  signupDetailTitle.textContent = `${meta.course_title || item.subject || "課程報名"}｜${item.name || "未填姓名"}`;
  signupDetailBox.className = "admin-form-readonly admin-field-wide";
  signupDetailBox.innerHTML = `
    <dl>
      <div><dt>姓名</dt><dd>${escapeHTML(item.name || "-")}</dd></div>
      <div><dt>電話</dt><dd>${escapeHTML(item.phone || "-")}</dd></div>
      <div><dt>Email</dt><dd>${escapeHTML(item.email || "-")}</dd></div>
      <div><dt>報名課程</dt><dd>${escapeHTML(meta.course_title || item.subject || "-")}</dd></div>
      <div><dt>課程 ID</dt><dd>${escapeHTML(meta.course_id || "-")}</dd></div>
      <div><dt>來源頁</dt><dd>${escapeHTML(item.source_path || "-")}</dd></div>
      <div><dt>收件信箱</dt><dd>${escapeHTML(item.recipient_email || "-")}</dd></div>
      <div><dt>寄信狀態</dt><dd>${item.email_sent ? "已寄出" : "未確認 / 未寄出"}</dd></div>
      <div><dt>送出時間</dt><dd>${formatUpdatedAt(item.created_at)}</dd></div>
      <div><dt>下一步</dt><dd>${escapeHTML(meta.next_action || "-")}</dd></div>
      <div><dt>下次追蹤</dt><dd>${meta.next_follow_up_at ? formatUpdatedAt(meta.next_follow_up_at) : "-"}</dd></div>
    </dl>
  `;
  renderSignupTimeline(item);
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  form.elements.cover_image_id.value = "";
  form.elements.is_enabled.checked = true;
  form.elements.status.value = "published";
  form.elements.sort_order.value = "0";
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
  form.elements.status.value = course.status || "published";
  form.elements.is_featured.checked = Boolean(course.is_featured);
  form.elements.is_enabled.checked = Boolean(course.is_enabled);
  formTitle.textContent = `編輯：${course.title}`;
  renderCoverPreview(course);
  syncRegistrationUrlRequirement();
}

async function loadCourses() {
  setStatus("正在讀取課程資料...", "info");
  refreshButton?.setAttribute("disabled", "true");
  try {
    const [courseResult, pendingResult] = await Promise.all([
      supabase
        .from("courses")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("starts_at", { ascending: true, nullsFirst: false }),
      supabase
        .from("publish_requests")
        .select("id,entity_id,change_action,proposed_snapshot,requested_at")
        .eq("entity_table", "courses")
        .eq("status", "pending")
        .order("requested_at", { ascending: false })
    ]);
    if (courseResult.error) throw courseResult.error;
    if (pendingResult.error) throw pendingResult.error;

    const courseMap = new Map((courseResult.data || []).map((course) => [course.id, course]));
    (pendingResult.data || []).forEach((request) => {
      const current = courseMap.get(request.entity_id) || {};
      const proposed = request.proposed_snapshot && typeof request.proposed_snapshot === "object"
        ? request.proposed_snapshot
        : {};
      courseMap.set(request.entity_id, {
        ...current,
        ...proposed,
        id: request.entity_id,
        _pending_review: true,
        _pending_delete: request.change_action === "delete",
        _publish_request_id: request.id
      });
    });
    courses = [...courseMap.values()].sort((a, b) => {
      if (Boolean(a.is_featured) !== Boolean(b.is_featured)) return a.is_featured ? -1 : 1;
      const sortDifference = Number(a.sort_order || 0) - Number(b.sort_order || 0);
      if (sortDifference) return sortDifference;
      return String(a.starts_at || "9999").localeCompare(String(b.starts_at || "9999"));
    });
    const coverIds = [...new Set(courses.map((course) => course.cover_image_id).filter(Boolean))];
    if (coverIds.length) {
      const { data: coverRows, error: coverError } = await supabase
        .from("media")
        .select("id, public_url, alt_text, file_name, image_usage, focal_point")
        .in("id", coverIds);
      if (coverError) throw coverError;
      courseCoverById = new Map((coverRows || []).map((cover) => [cover.id, cover]));
    } else {
      courseCoverById = new Map();
    }
    renderCourses();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load courses", error);
    setStatus(`讀取課程失敗：${error.message}`, "error");
    courses = [];
    courseCoverById = new Map();
    renderCourses();
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

async function loadCourseSignups() {
  if (!signupTableBody) return;
  setSignupStatus("正在讀取課程報名資料...", "info");
  signupRefreshButton?.setAttribute("disabled", "true");
  try {
    let query = supabase
      .from("form_submissions")
      .select("*")
      .eq("form_type", "course_signup")
      .order("created_at", { ascending: false })
      .limit(200);
    if (signupStatusFilter?.value) query = query.eq("status", signupStatusFilter.value);
    const { data, error } = await query;
    if (error) throw error;
    courseSignups = data || [];
    renderCourseSignups();
    renderSignupCounts();
    setSignupStatus("", "success");
    if (selectedCourseSignup) {
      renderSignupDetail(courseSignups.find((item) => item.id === selectedCourseSignup.id) || null);
    }
  } catch (error) {
    console.error("Failed to load course signups", error);
    setSignupStatus(`讀取課程報名失敗：${error.message}`, "error");
    courseSignups = [];
    renderCourseSignups();
    renderSignupCounts();
  } finally {
    signupRefreshButton?.removeAttribute("disabled");
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
    scopeKey: "courses",
    bucket: supabaseStorageBuckets.courseImages
  });
  return media.id;
}

function buildPayload(coverImageId) {
  const status = form.elements.is_enabled.checked ? "published" : "archived";
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
    registration_url: validatedRegistrationUrl(),
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
  if (!canEditScope(adminPermissions, courseScope)) {
    setStatus("你的帳號只有檢視課程內容的權限。", "error");
    return;
  }
  const submitButton = form.querySelector("button[type='submit']");
  submitButton?.setAttribute("disabled", "true");
  try {
    const coverImageId = await uploadCoverIfNeeded();
    const payload = buildPayload(coverImageId);
    const id = form.elements.id.value;
    const query = id ? supabase.from("courses").update(payload).eq("id", id) : supabase.from("courses").insert(payload);
    const { data, error } = await query.select("id").maybeSingle();
    if (error) throw error;
    if (data?.id) form.elements.id.value = data.id;
    const savedId = data?.id || form.elements.id.value;
    await loadCourses();
    if (canPublishScope(adminPermissions, courseScope)) {
      resetForm();
    } else {
      const pendingCourse = courses.find((course) => course.id === savedId);
      if (pendingCourse) fillForm(pendingCourse);
    }
    setStatus(contentSaveMessage(adminPermissions, courseScope, "課程"), "success");
  } catch (error) {
    console.error("Failed to save course", error);
    setStatus(`儲存課程失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function deleteCourse(id) {
  if (!canEditScope(adminPermissions, courseScope)) {
    setStatus("你的帳號只有檢視課程內容的權限。", "error");
    return;
  }
  const course = courses.find((item) => item.id === id);
  if (!course || !window.confirm(`確定刪除「${course.title}」嗎？`)) return;
  setStatus("正在刪除課程...", "info");
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    await loadCourses();
    setStatus(contentDeleteMessage(adminPermissions, courseScope, "課程"), "success");
  } catch (error) {
    console.error("Failed to delete course", error);
    setStatus(`刪除課程失敗：${error.message}`, "error");
  }
}

function signupStatusLabel(status) {
  return signupStatusLabels[status] || status || "未處理";
}

async function saveCourseSignupProcess(event) {
  event.preventDefault();
  if (!signupProcessForm) return;
  if (!canEditScope(adminPermissions, courseFormsScope)) {
    setSignupStatus("你的帳號只有檢視課程報名案件的權限。", "error");
    return;
  }
  const id = signupProcessForm.elements.id.value;
  if (!id) {
    setSignupStatus("請先選擇一筆課程報名。", "error");
    return;
  }

  const submitButton = signupProcessForm.querySelector('button[type="submit"]');
  submitButton?.setAttribute("disabled", "true");
  setSignupStatus("正在儲存課程報名處理紀錄...", "info");

  try {
    const current = courseSignups.find((item) => item.id === id) || selectedCourseSignup || {};
    const metadata = current.metadata && typeof current.metadata === "object" ? { ...current.metadata } : {};
    const nextStatus = signupProcessForm.elements.status.value;
    const nextFollowUp = fromLocalDateTimeInput(signupProcessForm.elements.next_follow_up_at.value);
    const nextAction = signupProcessForm.elements.next_action.value.trim();
    const note = signupProcessForm.elements.internal_note.value.trim();
    const history = Array.isArray(metadata.process_history) ? metadata.process_history : [];
    const statusChanged = current.status !== nextStatus;
    const processChanged = metadata.next_action !== nextAction
      || metadata.next_follow_up_at !== nextFollowUp
      || metadata.priority !== signupProcessForm.elements.priority.value;

    if (statusChanged || processChanged || note !== (current.internal_note || "")) {
      history.push({
        at: new Date().toISOString(),
        actor: userEmail?.textContent || "後台使用者",
        status: nextStatus,
        status_label: signupStatusLabel(nextStatus),
        note: note || nextAction || "課程報名處理流程已更新。"
      });
    }

    metadata.priority = signupProcessForm.elements.priority.value;
    metadata.next_action = nextAction;
    metadata.next_follow_up_at = nextFollowUp || null;
    metadata.process_history = history.slice(-30);

    const { error } = await supabase
      .from("form_submissions")
      .update({
        status: nextStatus,
        internal_note: note || null,
        metadata,
        handled_at: ["contacted", "closed"].includes(nextStatus) ? new Date().toISOString() : null
      })
      .eq("id", id);
    if (error) throw error;

    setSignupStatus("課程報名處理紀錄已儲存。", "success");
    await loadCourseSignups();
  } catch (error) {
    console.error("Failed to save course signup process", error);
    setSignupStatus(`儲存課程報名失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

function syncRegistrationUrlRequirement() {
  const input = form?.elements.registration_url;
  if (!input) return;
  input.required = courseManagerMode && form.elements.registration_status.value === "open";
}

form?.addEventListener("submit", saveCourse);
signupProcessForm?.addEventListener("submit", saveCourseSignupProcess);
newButton?.addEventListener("click", resetForm);
refreshButton?.addEventListener("click", loadCourses);
signupRefreshButton?.addEventListener("click", loadCourseSignups);
signupStatusFilter?.addEventListener("change", loadCourseSignups);
form?.elements.registration_status?.addEventListener("change", syncRegistrationUrlRequirement);
form?.elements.title?.addEventListener("input", () => {
  if (!form.elements.id.value && !form.elements.slug.value) form.elements.slug.value = slugify(form.elements.title.value);
});
tableBody?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-course]");
  const deleteButton = event.target.closest("[data-delete-course]");
  if (editButton) fillForm(courses.find((course) => course.id === editButton.dataset.editCourse));
  if (deleteButton) deleteCourse(deleteButton.dataset.deleteCourse);
});
signupProcessForm?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-course-quick-status]");
  if (!button || !signupProcessForm.elements.id.value) return;
  signupProcessForm.elements.status.value = button.dataset.courseQuickStatus;
  if (button.dataset.courseQuickStatus === "contacted" && !signupProcessForm.elements.next_action.value.trim()) {
    signupProcessForm.elements.next_action.value = "已完成第一次聯絡，等待學員回覆或確認上課資訊。";
  }
  if (button.dataset.courseQuickStatus === "closed" && !signupProcessForm.elements.next_action.value.trim()) {
    signupProcessForm.elements.next_action.value = "報名已完成確認，課前通知已安排。";
  }
  if (button.dataset.courseQuickStatus === "spam" && !signupProcessForm.elements.next_action.value.trim()) {
    signupProcessForm.elements.next_action.value = "此筆報名已取消或判定為無效資料。";
  }
});
signupTableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view-course-signup]");
  if (button) renderSignupDetail(courseSignups.find((item) => item.id === button.dataset.viewCourseSignup));
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
    courseManagerMode = isEducationCourseManager(adminPermissions);
    document.body.classList.toggle("course-manager-mode", courseManagerMode);
    if (internalSignupsPanel) internalSignupsPanel.hidden = courseManagerMode;
    form.dataset.contentScope = courseScope;
    if (signupProcessForm) signupProcessForm.dataset.contentScope = courseFormsScope;
    resetForm();
    syncRegistrationUrlRequirement();
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton && canPublishScope(adminPermissions, courseScope)) {
      submitButton.textContent = "儲存並發布課程";
    }
    if (courseManagerMode) {
      await loadCourses();
    } else {
      renderSignupDetail(null);
      await Promise.all([loadCourses(), loadCourseSignups()]);
    }
    if (!canEditScope(adminPermissions, courseScope)) {
      form.querySelectorAll("input, textarea, select, button").forEach((control) => {
        control.disabled = true;
      });
      newButton.hidden = true;
    }
  }
}).catch((error) => reportAdminBootError(loading, error));
