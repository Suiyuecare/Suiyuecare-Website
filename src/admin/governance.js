import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";
import { canPublishScope, contentScopeLabel } from "./content-scope.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#governanceStatus");
const refreshButton = document.querySelector("#refreshGovernanceButton");
const permissionGrid = document.querySelector("#permissionGrid");
const publishRequestsList = document.querySelector("#publishRequestsList");
const changeSetsList = document.querySelector("#changeSetsList");
const contentVersionsList = document.querySelector("#contentVersionsList");
const activityLogList = document.querySelector("#activityLogList");
const pendingPublishCount = document.querySelector("#pendingPublishCount");
const reviewPermissionHint = document.querySelector("#reviewPermissionHint");

let permissions = {};
let currentPublishRequests = [];
let currentChangeSets = [];
let pendingRebuildPayload = null;

const publicContentTables = new Set(["articles", "care_stories", "expert_talks"]);

const tableLabels = {
  pages: "頁面",
  page_sections: "頁面區塊",
  content_modules: "首頁模組",
  page_template_fields: "服務固定欄位",
  site_settings: "網站設定",
  articles: "文章",
  article_categories: "文章分類",
  care_stories: "照顧故事",
  expert_talks: "名人講堂",
  courses: "課程",
  downloadable_files: "下載檔",
  recruiting_pages: "招募頁面",
  recruiting_departments: "招募部門",
  recruiting_openings: "招募職缺",
  milestones: "大事記",
  investor_notices: "投資人公告",
  investor_financial_items: "投資人財務資料",
  investor_chart_datasets: "投資人圖表資料"
};

const requestStatusLabels = {
  pending: "待審",
  approved: "已核准",
  rejected: "已退回",
  cancelled: "已取消"
};

const requestStatusNotes = {
  pending: "下一步：執行長檢查修改前後內容，再核准上線或退回修改。現在官網仍維持原版本。",
  approved: "已完成：內容已核准發布，官網會讀取這個版本。",
  rejected: "需修改：請回到編輯頁修正內容，再重新送審。",
  cancelled: "已取消：這張送審單不會影響官網。"
};

const draftFieldLabels = {
  title: "標題",
  subtitle: "副標題",
  body: "內文",
  summary: "摘要",
  excerpt: "摘要",
  seo_title: "SEO 標題",
  seo_description: "SEO 說明",
  text_value: "文字內容",
  value_text: "文字設定",
  value_json: "結構化設定",
  json_value: "卡片內容",
  content_json: "區塊內容",
  image_id: "圖片",
  image_url: "圖片網址",
  hero_image_id: "主視覺圖片",
  hero_image_url: "主視覺網址",
  is_enabled: "是否啟用",
  sort_order: "排序",
  status: "發布狀態"
};

const ignoredDraftFields = new Set([
  "id", "created_at", "updated_at", "created_by", "updated_by", "published_at"
]);

function comparableValue(value) {
  return JSON.stringify(value ?? null);
}

function formatDraftValue(value) {
  if (value === null || value === undefined || value === "") return "空白";
  if (typeof value === "boolean") return value ? "是" : "否";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return text.length > 140 ? `${text.slice(0, 140)}...` : text;
}

function renderDraftChanges(item) {
  if (item.change_action === "delete") {
    const base = item.base_snapshot && typeof item.base_snapshot === "object" ? item.base_snapshot : {};
    const visibleKeys = Object.keys(base)
      .filter((key) => !ignoredDraftFields.has(key))
      .filter((key) => base[key] !== null && base[key] !== "")
      .slice(0, 8);
    return `
      <details class="governance-change-summary" ${item.status === "pending" ? "open" : ""}>
        <summary>查看即將刪除的內容</summary>
        <dl>
          ${visibleKeys.map((key) => `
            <div>
              <dt>${escapeHTML(draftFieldLabels[key] || key)}</dt>
              <dd><del>${escapeHTML(formatDraftValue(base[key]))}</del></dd>
            </div>
          `).join("")}
        </dl>
      </details>
    `;
  }
  const proposed = item.proposed_snapshot;
  if (!proposed || typeof proposed !== "object") return "";
  const base = item.base_snapshot && typeof item.base_snapshot === "object" ? item.base_snapshot : {};
  const changedKeys = Object.keys(proposed)
    .filter((key) => !ignoredDraftFields.has(key))
    .filter((key) => comparableValue(base[key]) !== comparableValue(proposed[key]))
    .slice(0, 8);

  if (!changedKeys.length) return '<div class="governance-change-summary"><strong>沒有可見欄位差異</strong></div>';
  return `
    <details class="governance-change-summary" ${item.status === "pending" ? "open" : ""}>
      <summary>${item.base_snapshot ? `查看 ${changedKeys.length} 個修改欄位` : "查看新增內容"}</summary>
      <dl>
        ${changedKeys.map((key) => `
          <div>
            <dt>${escapeHTML(draftFieldLabels[key] || key)}</dt>
            <dd><del>${escapeHTML(formatDraftValue(base[key]))}</del><ins>${escapeHTML(formatDraftValue(proposed[key]))}</ins></dd>
          </div>
        `).join("")}
      </dl>
    </details>
  `;
}

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function appendRebuildRetryButton() {
  if (!statusBox || !pendingRebuildPayload) return;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.retryPublicContentRebuild = "true";
  button.textContent = "重新建置 Google 可讀版本";
  statusBox.append(" ", button);
}

async function requestPublicContentRebuild(payload) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) {
    throw new Error(error?.message || "登入狀態已失效，請重新登入後再試。");
  }
  const response = await fetch("/api/rebuild-public-content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `網站重建啟動失敗（${response.status}）。`);
  }
  return result;
}

async function finalizePublicContentApproval(payload, approvedMessage) {
  const entityTables = [
    payload.entity_table,
    ...(Array.isArray(payload.entity_tables) ? payload.entity_tables : [])
  ].filter((table) => publicContentTables.has(table));
  if (!entityTables.length) {
    pendingRebuildPayload = null;
    setStatus(approvedMessage, "success");
    return;
  }

  const rebuildPayload = {
    ...payload,
    entity_table: entityTables[0],
    entity_tables: [...new Set(entityTables)]
  };
  setStatus("內容已核准，正在安排更新 Google 可讀版本...", "info");
  try {
    await requestPublicContentRebuild(rebuildPayload);
    pendingRebuildPayload = null;
    setStatus("已核准發布，Google 可讀版本正在更新，約 1–2 分鐘完成。", "success");
  } catch (error) {
    pendingRebuildPayload = rebuildPayload;
    setStatus(`內容已核准，但網站重建未啟動：${error.message}`, "error");
    appendRebuildRetryButton();
  }
}

function boolLabel(value) {
  return value ? "可使用" : "未開放";
}

function renderPermissions() {
  const items = [
    ["角色", permissions.role || "viewer", true],
    ["管理使用者", boolLabel(permissions.can_manage_users), permissions.can_manage_users],
    ["可檢視範圍", `${permissions.content_scopes?.length || 0} 個`, Boolean(permissions.content_scopes?.length)],
    ["可編輯範圍", `${permissions.edit_scopes?.length || 0} 個`, Boolean(permissions.edit_scopes?.length)],
    ["可發布範圍", `${permissions.publish_scopes?.length || 0} 個`, Boolean(permissions.publish_scopes?.length)],
    ["所屬部門", (permissions.departments || []).map((item) => `${item.name}（${item.role}）`).join("、") || "未指派", Boolean(permissions.departments?.length)],
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
      ? "你是 Owner，可以代表執行長核准或退回送審內容"
      : "你可以送審，但不能核准；請等執行長處理";
    reviewPermissionHint.dataset.state = permissions.can_review_publish ? "enabled" : "disabled";
  }
}

function renderPublishRequests(items = []) {
  currentPublishRequests = items;
  if (!items.length) {
    publishRequestsList.innerHTML = '<div class="admin-empty-state">目前沒有待審內容。部門編輯者儲存內容後，系統會自動建立執行長審核案件。</div>';
    if (pendingPublishCount) pendingPublishCount.textContent = "待審 0 筆";
    return;
  }

  const pendingCount = items.filter((item) => item.status === "pending").length;
  if (pendingPublishCount) pendingPublishCount.textContent = `待審 ${pendingCount} 筆`;

  publishRequestsList.innerHTML = items.map((item) => {
    const canReview = canPublishScope(permissions, item.scope_key);
    const isDelete = item.change_action === "delete";
    const actionLabel = isDelete ? "刪除申請" : item.base_snapshot ? "內容修改" : "新增內容";
    const nextStep = item.status === "pending" && isDelete
      ? "下一步：執行長確認是否刪除。核准前，官網仍保留這筆內容。"
      : requestStatusNotes[item.status] || "請依狀態處理。";
    return `
    <article data-request-id="${escapeHTML(item.id)}" data-status="${escapeHTML(item.status)}">
      <div>
        <span>${escapeHTML(contentScopeLabel(item.scope_key))} · ${escapeHTML(tableLabels[item.entity_table] || item.entity_table)} · ${escapeHTML(actionLabel)} · ${escapeHTML(requestStatusLabels[item.status] || item.status)}</span>
        <strong>${escapeHTML(item.entity_title || item.entity_id)}</strong>
        <p>${escapeHTML(item.request_note || "沒有送審備註。")}</p>
        ${renderDraftChanges(item)}
        <p class="governance-next-step">${escapeHTML(nextStep)}</p>
        <small>送審時間：${formatUpdatedAt(item.requested_at)}</small>
        ${item.review_note ? `<small>審核備註：${escapeHTML(item.review_note)}</small>` : ""}
      </div>
      <div class="admin-table-actions">
        ${item.status === "pending" && canReview ? `<button type="button" data-review-status="approved">${isDelete ? "核准刪除" : "核准發布"}</button><button type="button" data-review-status="rejected">退回修改</button>` : ""}
        ${item.status === "pending" && !canReview ? `<em>等待執行長確認</em>` : ""}
        ${item.status !== "pending" ? `<em>${escapeHTML(requestStatusLabels[item.status] || item.status)}</em>` : ""}
      </div>
    </article>
  `;
  }).join("");
}

async function fetchPublishRequests() {
  const baseFields = "id, entity_table, entity_id, entity_title, scope_key, department_id, status, request_note, review_note, requested_at, reviewed_at";
  const requestQuery = (fields, grouped = true) => {
    let query = supabase
      .from("publish_requests")
      .select(fields);
    if (grouped) query = query.is("change_set_id", null);
    return query
    .order("status", { ascending: false })
    .order("requested_at", { ascending: false })
    .limit(50);
  };

  const result = await requestQuery(`${baseFields}, base_snapshot, proposed_snapshot, change_action, change_set_id`);
  if (!result.error) return result;
  if (!/base_snapshot|proposed_snapshot|change_action|change_set_id/i.test(result.error.message || "")) return result;
  return requestQuery(baseFields, false);
}

function changeSetStatusLabel(status) {
  return {
    draft: "草稿",
    pending: "等待執行長",
    approved: "已發布",
    rejected: "已退回",
    cancelled: "已取消"
  }[status] || status;
}

function renderChangeSets(items = []) {
  currentChangeSets = items;
  if (!items.length) {
    changeSetsList.innerHTML = '<div class="admin-empty-state">目前沒有符合條件的整頁修改。</div>';
    return;
  }
  changeSetsList.innerHTML = items.map((item) => {
    const changes = Array.isArray(item.draft_payload?.changes) ? item.draft_payload.changes : [];
    const canReview = item.status === "pending" && permissions.role === "owner";
    const canContinue = ["draft", "rejected"].includes(item.status);
    return `
      <article data-change-set-id="${escapeHTML(item.id)}" data-status="${escapeHTML(item.status)}">
        <header>
          <div>
            <span>${escapeHTML(contentScopeLabel(item.scope_key))} · ${escapeHTML(changeSetStatusLabel(item.status))}</span>
            <h3>${escapeHTML(item.title || `${item.page_slug} 頁面修改`)}</h3>
            <p>${changes.length} 項內容會一起處理，正式官網目前仍維持原版本。</p>
          </div>
          <time>${formatUpdatedAt(item.submitted_at || item.updated_at)}</time>
        </header>
        <details class="governance-change-set-details" ${item.status === "pending" ? "open" : ""}>
          <summary>比較修改前後（${changes.length} 項）</summary>
          <div>
            ${changes.map((change) => renderDraftChanges({ ...change, status: item.status })).join("")}
          </div>
        </details>
        ${item.reviewer_note ? `<p class="governance-next-step"><strong>執行長意見：</strong>${escapeHTML(item.reviewer_note)}</p>` : ""}
        <div class="admin-table-actions">
          ${canContinue ? `<a href="/admin/visual-editor?page=${encodeURIComponent(item.page_slug)}">${item.status === "rejected" ? "依意見修改" : "繼續編輯"}</a>` : ""}
          ${canReview ? '<button type="button" data-change-set-review="approved">核准整頁發布</button><button type="button" data-change-set-review="rejected">退回整頁修改</button>' : ""}
          ${item.status === "pending" && !canReview ? "<em>等待執行長確認</em>" : ""}
        </div>
      </article>
    `;
  }).join("");
}

async function fetchChangeSets() {
  const requestedView = new URLSearchParams(window.location.search).get("view") || "";
  const view = requestedView === "drafts" ? "draft" : requestedView;
  let query = supabase
    .from("cms_change_sets")
    .select("id,page_slug,scope_key,title,status,draft_payload,requested_by,submitted_at,reviewed_at,reviewer_note,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (["draft", "pending", "rejected", "approved"].includes(view)) query = query.eq("status", view);
  return query;
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
          <p>${escapeHTML(contentScopeLabel(item.scope_key))}｜${escapeHTML(tableLabels[item.entity_table] || item.entity_table)}｜${escapeHTML(item.change_summary || "Saved content")}</p>
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
        <p>${escapeHTML(contentScopeLabel(item.scope_key))}｜${escapeHTML(item.entity_table || "System")} ${item.entity_id ? `｜${escapeHTML(item.entity_id)}` : ""}</p>
      </div>
      <time>${formatUpdatedAt(item.created_at)}</time>
    </article>
  `).join("");
}

async function loadPermissions(fallbackPermissions = {}) {
  permissions = fallbackPermissions || {};
  try {
    const { data, error } = await supabase.rpc("get_current_admin_permissions");
    if (error) throw error;
    permissions = data && Object.keys(data).length ? data : permissions;
  } catch (error) {
    console.warn("Using fallback governance permissions", error);
  }
  renderPermissions();
}

async function loadGovernanceData(fallbackPermissions = {}) {
  setStatus("正在讀取發布流程資料...", "info");
  refreshButton?.setAttribute("disabled", "true");
  try {
    await loadPermissions(fallbackPermissions);
    const [changeSetsResult, requestsResult, versionsResult, logsResult] = await Promise.allSettled([
      fetchChangeSets(),
      fetchPublishRequests(),
      supabase
        .from("content_versions")
        .select("id, entity_table, entity_id, scope_key, department_id, action, version_number, row_snapshot, change_summary, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("admin_activity_logs")
        .select("id, action, entity_table, entity_id, scope_key, department_id, message, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

    const changeSets = changeSetsResult.status === "fulfilled" && !changeSetsResult.value.error
      ? changeSetsResult.value.data || []
      : [];
    const publishRequests = requestsResult.status === "fulfilled" && !requestsResult.value.error
      ? requestsResult.value.data || []
      : [];
    const contentVersions = versionsResult.status === "fulfilled" && !versionsResult.value.error
      ? versionsResult.value.data || []
      : [];
    const activityLogs = logsResult.status === "fulfilled" && !logsResult.value.error
      ? logsResult.value.data || []
      : [];

    renderChangeSets(changeSets);
    renderPublishRequests(publishRequests);
    if (pendingPublishCount) {
      const groupedPending = changeSets.filter((item) => item.status === "pending").length;
      const legacyPending = publishRequests.filter((item) => item.status === "pending").length;
      pendingPublishCount.textContent = `待審 ${groupedPending + legacyPending} 份`;
    }
    renderVersions(contentVersions);
    renderActivity(activityLogs);
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load governance data", error);
    setStatus(`讀取發布與權限資料失敗：${error.message}`, "error");
    renderPublishRequests([]);
    renderChangeSets([]);
    renderVersions([]);
    renderActivity([]);
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

async function reviewChangeSet(id, nextStatus) {
  const changeSet = currentChangeSets.find((item) => item.id === id);
  if (!changeSet || permissions.role !== "owner") {
    setStatus("只有執行長 Owner 可以審核整頁修改。", "error");
    return;
  }
  const note = nextStatus === "approved"
    ? window.prompt("核准備註（可留空）：", "已檢查整頁文字、圖片與卡片，核准發布。")
    : window.prompt("請填寫退回原因（必填）：", "請調整標題或圖片後重新送審。");
  if (note === null) return;
  if (nextStatus === "rejected" && !note.trim()) {
    setStatus("退回時必須填寫原因，讓編輯者知道要改哪裡。", "error");
    return;
  }
  setStatus("正在一次處理整頁修改...", "info");
  const { error } = await supabase.rpc("review_cms_change_set", {
    change_set_id: id,
    next_status: nextStatus,
    reviewer_note: note
  });
  if (error) {
    setStatus(`整頁審核失敗：${error.message}`, "error");
    return;
  }
  await loadGovernanceData(permissions);
  if (nextStatus === "approved") {
    const entityTables = (changeSet.draft_payload?.changes || [])
      .map((change) => change.entity_table)
      .filter(Boolean);
    await finalizePublicContentApproval(
      {
        change_set_id: id,
        action: "approved",
        entity_tables: entityTables
      },
      "整頁內容已核准發布。"
    );
  } else {
    setStatus("已退回整頁修改。", "success");
  }
}

async function reviewRequest(id, nextStatus) {
  const request = currentPublishRequests.find((item) => item.id === id);
  if (!request || !canPublishScope(permissions, request.scope_key)) {
    setStatus("只有 Owner／執行長可以審核發布。", "error");
    return;
  }
  const note = nextStatus === "approved"
    ? window.prompt(
      "核准備註（可留空）：",
      request.change_action === "delete" ? "已確認，核准刪除。" : "內容已檢查，核准發布。"
    )
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

  await loadGovernanceData();
  if (nextStatus === "approved") {
    const approvedMessage = request.change_action === "delete" ? "已核准刪除。" : "已核准發布。";
    await finalizePublicContentApproval(
      {
        request_id: id,
        action: request.change_action === "delete" ? "deleted" : "approved",
        entity_table: request.entity_table
      },
      approvedMessage
    );
  } else {
    setStatus("已退回送審。", "success");
  }
}

publishRequestsList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-review-status]");
  const card = event.target.closest("[data-request-id]");
  if (!button || !card) return;
  reviewRequest(card.dataset.requestId, button.dataset.reviewStatus);
});

changeSetsList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-change-set-review]");
  const card = event.target.closest("[data-change-set-id]");
  if (!button || !card) return;
  reviewChangeSet(card.dataset.changeSetId, button.dataset.changeSetReview);
});

statusBox?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-retry-public-content-rebuild]");
  if (!button || !pendingRebuildPayload) return;
  button.disabled = true;
  setStatus("正在重新安排網站建置...", "info");
  try {
    await requestPublicContentRebuild(pendingRebuildPayload);
    pendingRebuildPayload = null;
    setStatus("Google 可讀版本正在更新，約 1–2 分鐘完成。", "success");
  } catch (error) {
    setStatus(`網站重建仍未啟動：${error.message}`, "error");
    appendRebuildRetryButton();
  }
});

refreshButton?.addEventListener("click", () => loadGovernanceData(permissions));
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: (_session, readyPermissions) => loadGovernanceData(readyPermissions)
}).catch((error) => reportAdminBootError(loading, error));
