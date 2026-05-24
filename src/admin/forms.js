import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#adminFormsStatus");
const tableBody = document.querySelector("#formsTableBody");
const refreshButton = document.querySelector("#refreshFormsButton");
const typeFilter = document.querySelector("#formTypeFilter");
const statusFilter = document.querySelector("#formStatusFilter");
const editorForm = document.querySelector("#formSubmissionEditor");
const detailTitle = document.querySelector("#formDetailTitle");
const detailBox = document.querySelector("#formDetailBox");
const processTimeline = document.querySelector("#formProcessTimeline");

let submissions = [];
let selectedSubmission = null;

const typeLabels = {
  contact: "聯絡我們",
  course_signup: "課程報名",
  recruiting: "人才招募",
  land: "土地合作",
  investor: "投資洽談"
};

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function renderStatusBadge(status) {
  const labels = { new: "新案件", contacted: "已聯絡", closed: "已結案", spam: "垃圾" };
  return `<span class="admin-publish-badge" data-status="${escapeHTML(status || "new")}">${escapeHTML(labels[status] || status || "新案件")}</span>`;
}

function getProcessMeta(item = {}) {
  const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
  return {
    priority: metadata.priority || "normal",
    next_action: metadata.next_action || "",
    next_follow_up_at: metadata.next_follow_up_at || "",
    process_history: Array.isArray(metadata.process_history) ? metadata.process_history : []
  };
}

function toLocalDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

function fromLocalDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function renderWorkflowCounts() {
  const counts = { new: 0, contacted: 0, closed: 0, spam: 0 };
  submissions.forEach((item) => {
    const key = item.status || "new";
    if (counts[key] !== undefined) counts[key] += 1;
  });
  Object.entries(counts).forEach(([key, value]) => {
    const target = document.querySelector(`[data-count="${key}"]`);
    if (target) target.textContent = `${value} 筆`;
  });
}

function renderTimeline(item) {
  if (!processTimeline) return;
  if (!item) {
    processTimeline.innerHTML = "";
    return;
  }
  const meta = getProcessMeta(item);
  const history = meta.process_history;
  processTimeline.innerHTML = `
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

function renderSubmissions() {
  if (!tableBody) return;
  if (!submissions.length) {
    tableBody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state">目前沒有符合條件的表單。</div></td></tr>`;
    return;
  }
  tableBody.innerHTML = submissions.map((item) => `
    <tr>
      <td><strong>${escapeHTML(item.name || "未填姓名")}</strong><small>${escapeHTML(item.phone || item.email || "-")}</small></td>
      <td>${escapeHTML(typeLabels[item.form_type] || item.form_type)}</td>
      <td><strong>${escapeHTML(item.subject || "-")}</strong><small>${escapeHTML(getProcessMeta(item).next_action || "尚未設定下一步")}</small></td>
      <td>${renderStatusBadge(item.status)}</td>
      <td><time>${formatUpdatedAt(item.created_at)}</time></td>
      <td><div class="admin-table-actions"><button type="button" data-view-submission="${escapeHTML(item.id)}">查看</button></div></td>
    </tr>
  `).join("");
}

function renderDetail(item) {
  selectedSubmission = item || null;
  if (!item) {
    editorForm.elements.id.value = "";
    detailTitle.textContent = "表單詳細資料";
    detailBox.className = "admin-empty-state admin-field-wide";
    detailBox.textContent = "請從左側選擇一筆表單。";
    return;
  }
  editorForm.elements.id.value = item.id;
  editorForm.elements.status.value = item.status || "new";
  const meta = getProcessMeta(item);
  editorForm.elements.priority.value = meta.priority;
  editorForm.elements.next_action.value = meta.next_action;
  editorForm.elements.next_follow_up_at.value = toLocalDateTimeInput(meta.next_follow_up_at);
  editorForm.elements.internal_note.value = item.internal_note || "";
  renderTimeline(item);
  detailTitle.textContent = `${typeLabels[item.form_type] || item.form_type}｜${item.name || "未填姓名"}`;
  const metadataRows = item.metadata && typeof item.metadata === "object"
    ? Object.entries(item.metadata).filter(([, value]) => value)
    : [];
  detailBox.className = "admin-form-readonly admin-field-wide";
  detailBox.innerHTML = `
    <dl>
      <div><dt>姓名</dt><dd>${escapeHTML(item.name || "-")}</dd></div>
      <div><dt>電話</dt><dd>${escapeHTML(item.phone || "-")}</dd></div>
      <div><dt>Email</dt><dd>${escapeHTML(item.email || "-")}</dd></div>
      <div><dt>主旨</dt><dd>${escapeHTML(item.subject || "-")}</dd></div>
      <div><dt>內容</dt><dd>${escapeHTML(item.message || "-")}</dd></div>
      <div><dt>來源頁</dt><dd>${escapeHTML(item.source_path || "-")}</dd></div>
      <div><dt>收件信箱</dt><dd>${escapeHTML(item.recipient_email || "-")}</dd></div>
      <div><dt>寄信狀態</dt><dd>${item.email_sent ? "已寄出" : "未確認 / 未寄出"}</dd></div>
      <div><dt>優先度</dt><dd>${escapeHTML(meta.priority)}</dd></div>
      <div><dt>下一步</dt><dd>${escapeHTML(meta.next_action || "-")}</dd></div>
      <div><dt>下次追蹤</dt><dd>${meta.next_follow_up_at ? formatUpdatedAt(meta.next_follow_up_at) : "-"}</dd></div>
      ${metadataRows.map(([key, value]) => `<div><dt>${escapeHTML(key)}</dt><dd>${escapeHTML(String(value))}</dd></div>`).join("")}
    </dl>
  `;
}

async function loadSubmissions() {
  setStatus("正在讀取表單資料...", "info");
  let query = supabase
    .from("form_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(120);
  if (typeFilter.value) query = query.eq("form_type", typeFilter.value);
  if (statusFilter.value) query = query.eq("status", statusFilter.value);

  try {
    const { data, error } = await query;
    if (error) throw error;
    submissions = data || [];
    renderSubmissions();
    renderWorkflowCounts();
    setStatus("", "success");
    if (selectedSubmission) {
      renderDetail(submissions.find((item) => item.id === selectedSubmission.id) || null);
    }
  } catch (error) {
    console.error("Failed to load submissions", error);
    setStatus(`讀取表單失敗：${error.message}`, "error");
    submissions = [];
    renderSubmissions();
    renderWorkflowCounts();
  }
}

function statusLabel(status) {
  return { new: "新案件", contacted: "已聯絡", closed: "已結案", spam: "垃圾" }[status] || status;
}

async function saveSubmission(event) {
  event.preventDefault();
  const id = editorForm.elements.id.value;
  if (!id) {
    setStatus("請先選擇一筆表單。", "error");
    return;
  }
  setStatus("正在儲存表單狀態...", "info");
  const nextStatus = editorForm.elements.status.value;
  try {
    const current = submissions.find((item) => item.id === id) || selectedSubmission || {};
    const metadata = current.metadata && typeof current.metadata === "object" ? { ...current.metadata } : {};
    const nextFollowUp = fromLocalDateTimeInput(editorForm.elements.next_follow_up_at.value);
    const note = editorForm.elements.internal_note.value.trim();
    const history = Array.isArray(metadata.process_history) ? metadata.process_history : [];
    const statusChanged = current.status !== nextStatus;
    const processChanged = metadata.next_action !== editorForm.elements.next_action.value.trim()
      || metadata.next_follow_up_at !== nextFollowUp
      || metadata.priority !== editorForm.elements.priority.value;
    if (statusChanged || processChanged || note !== (current.internal_note || "")) {
      history.push({
        at: new Date().toISOString(),
        actor: userEmail?.textContent || "後台使用者",
        status: nextStatus,
        status_label: statusLabel(nextStatus),
        note: note || editorForm.elements.next_action.value.trim() || "表單處理流程已更新。"
      });
    }
    metadata.priority = editorForm.elements.priority.value;
    metadata.next_action = editorForm.elements.next_action.value.trim();
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
    setStatus("表單狀態已更新。", "success");
    await loadSubmissions();
  } catch (error) {
    console.error("Failed to save submission", error);
    setStatus(`儲存表單失敗：${error.message}`, "error");
  }
}

refreshButton?.addEventListener("click", loadSubmissions);
typeFilter?.addEventListener("change", loadSubmissions);
statusFilter?.addEventListener("change", loadSubmissions);
editorForm?.addEventListener("submit", saveSubmission);
editorForm?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quick-status]");
  if (!button || !editorForm.elements.id.value) return;
  editorForm.elements.status.value = button.dataset.quickStatus;
  if (button.dataset.quickStatus === "contacted" && !editorForm.elements.next_action.value.trim()) {
    editorForm.elements.next_action.value = "已完成第一次聯絡，等待對方回覆或安排後續。";
  }
  if (button.dataset.quickStatus === "closed" && !editorForm.elements.next_action.value.trim()) {
    editorForm.elements.next_action.value = "案件已完成，無需追蹤。";
  }
});
tableBody?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view-submission]");
  if (button) renderDetail(submissions.find((item) => item.id === button.dataset.viewSubmission));
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: async () => {
    renderDetail(null);
    await loadSubmissions();
  }
}).catch((error) => reportAdminBootError(loading, error));
