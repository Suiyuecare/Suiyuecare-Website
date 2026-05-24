import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#governanceStatus");
const refreshButton = document.querySelector("#refreshGovernanceButton");
const permissionGrid = document.querySelector("#permissionGrid");
const publishRequestsList = document.querySelector("#publishRequestsList");
const contentVersionsList = document.querySelector("#contentVersionsList");
const activityLogList = document.querySelector("#activityLogList");
const pendingPublishCount = document.querySelector("#pendingPublishCount");
const reviewPermissionHint = document.querySelector("#reviewPermissionHint");

let permissions = {};

const tableLabels = {
  pages: "頁面",
  page_sections: "頁面區塊",
  articles: "文章",
  courses: "課程",
  downloadable_files: "檔案",
  content_modules: "首頁模組"
};

const requestStatusLabels = {
  pending: "待審",
  approved: "已核准",
  rejected: "已退回",
  cancelled: "已取消"
};

const requestStatusNotes = {
  pending: "下一步：請具審核權限者檢查內容後核准或退回。",
  approved: "已完成：內容已切換為已發布，前台可讀取。",
  rejected: "需修改：請回到編輯頁修正後重新送審。",
  cancelled: "已取消：此送審單不會影響前台。"
};

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function boolLabel(value) {
  return value ? "可使用" : "未開放";
}

function renderPermissions() {
  const items = [
    ["角色", permissions.role || "viewer", true],
    ["管理使用者", boolLabel(permissions.can_manage_users), permissions.can_manage_users],
    ["發布內容", boolLabel(permissions.can_publish), permissions.can_publish],
    ["審核發布", boolLabel(permissions.can_review_publish), permissions.can_review_publish],
    ["圖片管理", boolLabel(permissions.can_manage_media), permissions.can_manage_media],
    ["頁面內容", boolLabel(permissions.can_edit_pages), permissions.can_edit_pages],
    ["文章內容", boolLabel(permissions.can_edit_articles), permissions.can_edit_articles],
    ["課程資料", boolLabel(permissions.can_edit_courses), permissions.can_edit_courses],
    ["檔案下載", boolLabel(permissions.can_manage_files), permissions.can_manage_files],
    ["表單資料", boolLabel(permissions.can_view_forms), permissions.can_view_forms],
    ["網站流量", boolLabel(permissions.can_view_analytics), permissions.can_view_analytics]
  ];

  permissionGrid.innerHTML = items.map(([label, value, enabled]) => `
    <article data-state="${enabled ? "enabled" : "disabled"}">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(String(value))}</strong>
      <p>${enabled ? "目前帳號具備此權限" : "目前帳號不具備此權限"}</p>
    </article>
  `).join("");
  if (reviewPermissionHint) {
    reviewPermissionHint.textContent = permissions.can_review_publish
      ? "你可以審核發布"
      : "你可以送審，但不能核准";
    reviewPermissionHint.dataset.state = permissions.can_review_publish ? "enabled" : "disabled";
  }
}

function renderPublishRequests(items = []) {
  if (!items.length) {
    publishRequestsList.innerHTML = '<div class="admin-empty-state">目前沒有發布送審紀錄。內容編輯完成後，可從文章或頁面編輯器按「送審發布」。</div>';
    if (pendingPublishCount) pendingPublishCount.textContent = "待審 0 筆";
    return;
  }

  const pendingCount = items.filter((item) => item.status === "pending").length;
  if (pendingPublishCount) pendingPublishCount.textContent = `待審 ${pendingCount} 筆`;

  publishRequestsList.innerHTML = items.map((item) => `
    <article data-request-id="${escapeHTML(item.id)}" data-status="${escapeHTML(item.status)}">
      <div>
        <span>${escapeHTML(tableLabels[item.entity_table] || item.entity_table)} · ${escapeHTML(requestStatusLabels[item.status] || item.status)}</span>
        <strong>${escapeHTML(item.entity_title || item.entity_id)}</strong>
        <p>${escapeHTML(item.request_note || "沒有送審備註。")}</p>
        <p class="governance-next-step">${escapeHTML(requestStatusNotes[item.status] || "請依狀態處理。")}</p>
        <small>送審時間：${formatUpdatedAt(item.requested_at)}</small>
        ${item.review_note ? `<small>審核備註：${escapeHTML(item.review_note)}</small>` : ""}
      </div>
      <div class="admin-table-actions">
        ${item.status === "pending" && permissions.can_review_publish ? `<button type="button" data-review-status="approved">核准發布</button><button type="button" data-review-status="rejected">退回修改</button>` : ""}
        ${item.status === "pending" && !permissions.can_review_publish ? `<em>等待具審核權限者處理</em>` : ""}
        ${item.status !== "pending" ? `<em>${escapeHTML(requestStatusLabels[item.status] || item.status)}</em>` : ""}
      </div>
    </article>
  `).join("");
}

function renderVersions(items = []) {
  if (!items.length) {
    contentVersionsList.innerHTML = '<div class="admin-empty-state">目前沒有版本紀錄。</div>';
    return;
  }

  contentVersionsList.innerHTML = items.map((item) => {
    const title = item.row_snapshot?.title || item.row_snapshot?.file_name || item.row_snapshot?.section_key || item.entity_id;
    return `
      <article>
        <span>v${Number(item.version_number || 0)} · ${escapeHTML(item.action)}</span>
        <div>
          <strong>${escapeHTML(title)}</strong>
          <p>${escapeHTML(tableLabels[item.entity_table] || item.entity_table)}｜${escapeHTML(item.change_summary || "Saved content")}</p>
        </div>
        <time>${formatUpdatedAt(item.created_at)}</time>
      </article>
    `;
  }).join("");
}

function renderActivity(items = []) {
  if (!items.length) {
    activityLogList.innerHTML = '<div class="admin-empty-state">目前沒有後台操作紀錄。</div>';
    return;
  }

  activityLogList.innerHTML = items.map((item) => `
    <article>
      <span>${escapeHTML(item.action)}</span>
      <div>
        <strong>${escapeHTML(item.message || item.entity_table || "後台操作")}</strong>
        <p>${escapeHTML(item.entity_table || "System")} ${item.entity_id ? `｜${escapeHTML(item.entity_id)}` : ""}</p>
      </div>
      <time>${formatUpdatedAt(item.created_at)}</time>
    </article>
  `).join("");
}

async function loadPermissions() {
  const { data, error } = await supabase.rpc("get_current_admin_permissions");
  if (error) throw error;
  permissions = data || {};
  renderPermissions();
}

async function loadGovernanceData() {
  setStatus("正在讀取發布流程資料...", "info");
  refreshButton?.setAttribute("disabled", "true");
  try {
    await loadPermissions();
    const [requestsResult, versionsResult, logsResult] = await Promise.all([
      supabase
        .from("publish_requests")
        .select("id, entity_table, entity_id, entity_title, status, request_note, review_note, requested_at, reviewed_at")
        .order("status", { ascending: false })
        .order("requested_at", { ascending: false })
        .limit(50),
      supabase
        .from("content_versions")
        .select("id, entity_table, entity_id, action, version_number, row_snapshot, change_summary, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("admin_activity_logs")
        .select("id, action, entity_table, entity_id, message, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

    if (requestsResult.error) throw requestsResult.error;
    if (versionsResult.error) throw versionsResult.error;
    if (logsResult.error) throw logsResult.error;

    renderPublishRequests(requestsResult.data || []);
    renderVersions(versionsResult.data || []);
    renderActivity(logsResult.data || []);
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load governance data", error);
    setStatus(`讀取發布與權限資料失敗：${error.message}`, "error");
    renderPublishRequests([]);
    renderVersions([]);
    renderActivity([]);
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

async function reviewRequest(id, nextStatus) {
  const note = nextStatus === "approved"
    ? window.prompt("核准備註（可留空）：", "內容已檢查，核准發布。")
    : window.prompt("退回原因：", "請補齊圖片、SEO 或內容後再送審。");

  if (note === null) return;
  setStatus("正在更新審核結果...", "info");
  const { error } = await supabase.rpc("review_publish_request", {
    request_id: id,
    next_status: nextStatus,
    reviewer_note: note
  });

  if (error) {
    setStatus(`審核失敗：${error.message}`, "error");
    return;
  }

  setStatus(nextStatus === "approved" ? "已核准發布。" : "已退回送審。", "success");
  await loadGovernanceData();
}

publishRequestsList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-status]");
  const card = event.target.closest("[data-request-id]");
  if (!button || !card) return;
  reviewRequest(card.dataset.requestId, button.dataset.reviewStatus);
});

refreshButton?.addEventListener("click", loadGovernanceData);
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadGovernanceData
}).catch((error) => reportAdminBootError(loading, error));
