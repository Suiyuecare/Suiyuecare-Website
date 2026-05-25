import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const refreshButton = document.querySelector("#refreshUsersButton");
const statusBox = document.querySelector("#usersStatus");
const usersList = document.querySelector("#usersList");

const permissionGroups = [
  {
    title: "系統與發布",
    hint: "只有執行長/最高權限帳號可以正式發布與核准，其餘帳號請送審。",
    fields: [
      ["can_manage_users", "管理使用者"],
      ["can_publish", "正式發布"],
      ["can_review_publish", "審核發布"]
    ]
  },
  {
    title: "頁面內容",
    hint: "控制頁面文案、圖片與固定卡片內容。",
    fields: [
      ["can_view_pages", "檢視頁面"],
      ["can_edit_pages", "新增/編輯頁面"],
      ["can_delete_pages", "刪除頁面卡片"]
    ]
  },
  {
    title: "文章、故事與講堂",
    hint: "控制 Health 3.0、真實照顧情境與名人講堂。",
    fields: [
      ["can_view_articles", "檢視內容"],
      ["can_edit_articles", "新增/編輯內容"],
      ["can_delete_articles", "刪除內容"]
    ]
  },
  {
    title: "圖片素材",
    hint: "控制媒體庫、圖片上傳與圖片刪除。",
    fields: [
      ["can_view_media", "檢視圖片"],
      ["can_manage_media", "上傳/編輯圖片"],
      ["can_delete_media", "刪除圖片"]
    ]
  },
  {
    title: "課程管理",
    hint: "控制課程報名資料。",
    fields: [
      ["can_view_courses", "檢視課程"],
      ["can_edit_courses", "新增/編輯課程"],
      ["can_delete_courses", "刪除課程"]
    ]
  },
  {
    title: "招募與投資人",
    hint: "控制招募頁、職缺、投資人公告與圖表資料。",
    fields: [
      ["can_view_recruiting", "檢視招募"],
      ["can_edit_recruiting", "編輯招募"],
      ["can_delete_recruiting", "刪除招募"],
      ["can_view_investor", "檢視投資人資料"],
      ["can_edit_investor", "編輯投資人資料"],
      ["can_delete_investor", "刪除投資人資料"]
    ]
  },
  {
    title: "數據與品質",
    hint: "控制網站流量、報表匯出與內容健康檢查。",
    fields: [
      ["can_view_analytics", "檢視流量"],
      ["can_export_analytics", "匯出流量報表"],
      ["can_view_content_health", "內容健康檢查"],
      ["can_manage_backups", "備份與還原"]
    ]
  }
];

const permissionFields = permissionGroups.flatMap((group) => group.fields);

const roleDefaults = {
  owner: {
    can_manage_users: true,
    can_publish: true,
    can_review_publish: true,
    can_edit_site_settings: true,
    can_view_pages: true,
    can_delete_pages: true,
    can_view_articles: true,
    can_delete_articles: true,
    can_view_media: true,
    can_delete_media: true,
    can_view_courses: true,
    can_delete_courses: true,
    can_view_files: true,
    can_delete_files: true,
    can_edit_forms: true,
    can_export_forms: true,
    can_view_recruiting: true,
    can_edit_recruiting: true,
    can_delete_recruiting: true,
    can_view_investor: true,
    can_edit_investor: true,
    can_delete_investor: true,
    can_export_analytics: true,
    can_view_content_health: true,
    can_manage_backups: true,
    can_manage_media: true,
    can_edit_pages: true,
    can_edit_articles: true,
    can_edit_courses: true,
    can_manage_files: true,
    can_view_forms: true,
    can_view_analytics: true
  },
  admin: {
    can_manage_users: true,
    can_publish: false,
    can_review_publish: false,
    can_edit_site_settings: true,
    can_view_pages: true,
    can_delete_pages: true,
    can_view_articles: true,
    can_delete_articles: true,
    can_view_media: true,
    can_delete_media: true,
    can_view_courses: true,
    can_delete_courses: true,
    can_view_files: true,
    can_delete_files: true,
    can_edit_forms: true,
    can_export_forms: true,
    can_view_recruiting: true,
    can_edit_recruiting: true,
    can_delete_recruiting: true,
    can_view_investor: true,
    can_edit_investor: true,
    can_delete_investor: true,
    can_export_analytics: true,
    can_view_content_health: true,
    can_manage_backups: true,
    can_manage_media: true,
    can_edit_pages: true,
    can_edit_articles: true,
    can_edit_courses: true,
    can_manage_files: true,
    can_view_forms: true,
    can_view_analytics: true
  },
  editor: {
    can_manage_users: false,
    can_publish: false,
    can_review_publish: false,
    can_edit_site_settings: false,
    can_view_pages: true,
    can_delete_pages: false,
    can_view_articles: true,
    can_delete_articles: false,
    can_view_media: true,
    can_delete_media: false,
    can_view_courses: true,
    can_delete_courses: false,
    can_view_files: true,
    can_delete_files: false,
    can_edit_forms: true,
    can_export_forms: false,
    can_view_recruiting: true,
    can_edit_recruiting: true,
    can_delete_recruiting: false,
    can_view_investor: true,
    can_edit_investor: true,
    can_delete_investor: false,
    can_export_analytics: false,
    can_view_content_health: true,
    can_manage_backups: false,
    can_manage_media: true,
    can_edit_pages: true,
    can_edit_articles: true,
    can_edit_courses: true,
    can_manage_files: true,
    can_view_forms: true,
    can_view_analytics: false
  },
  viewer: {
    can_manage_users: false,
    can_publish: false,
    can_review_publish: false,
    can_edit_site_settings: false,
    can_view_pages: true,
    can_delete_pages: false,
    can_view_articles: true,
    can_delete_articles: false,
    can_view_media: true,
    can_delete_media: false,
    can_view_courses: true,
    can_delete_courses: false,
    can_view_files: true,
    can_delete_files: false,
    can_edit_forms: false,
    can_export_forms: false,
    can_view_recruiting: true,
    can_edit_recruiting: false,
    can_delete_recruiting: false,
    can_view_investor: true,
    can_edit_investor: false,
    can_delete_investor: false,
    can_export_analytics: false,
    can_view_content_health: true,
    can_manage_backups: false,
    can_manage_media: false,
    can_edit_pages: false,
    can_edit_articles: false,
    can_edit_courses: false,
    can_manage_files: false,
    can_view_forms: false,
    can_view_analytics: false
  }
};

let profiles = [];
let admins = [];

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data?.session?.access_token;
  if (!token) throw new Error("登入狀態已失效，請重新登入後再試一次。");
  return token;
}

async function adminUsersRequest({ method = "GET", body } = {}) {
  const token = await getAccessToken();
  const response = await fetch("/api/admin-users", {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || "使用者權限 API 失敗。");
  }
  return payload;
}

function mergedAdmin(profile) {
  const admin = admins.find((item) => item.profile_id === profile.id) || {};
  return { ...roleDefaults[profile.role || "viewer"], ...admin };
}

function renderPermissionGroups(admin) {
  return permissionGroups.map((group) => `
    <section class="permission-group-card">
      <header>
        <strong>${escapeHTML(group.title)}</strong>
        <span>${escapeHTML(group.hint)}</span>
      </header>
      <div class="permission-check-grid">
        ${group.fields.map(([field, label]) => `
          <label class="admin-toggle-field compact"><input name="${field}" type="checkbox" ${admin[field] ? "checked" : ""} /><span>${escapeHTML(label)}</span></label>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function renderUsers() {
  if (!profiles.length) {
    usersList.innerHTML = `<div class="admin-empty-state">目前沒有後台使用者。請重新整理本頁；若你已登入，系統會自動建立第一位 owner 管理者。</div>`;
    return;
  }

  usersList.innerHTML = profiles.map((profile) => {
    const admin = mergedAdmin(profile);
    return `
      <article class="admin-section-card user-permission-card" data-profile-id="${escapeHTML(profile.id)}">
        <header>
          <div>
            <span>${escapeHTML(profile.email || "No email")}</span>
            <strong>${escapeHTML(profile.display_name || profile.email || profile.id)}</strong>
            <small>更新：${formatUpdatedAt(profile.updated_at)}</small>
          </div>
          <label class="admin-toggle-field"><input data-profile-enabled type="checkbox" ${profile.is_active ? "checked" : ""} /><span>啟用帳號</span></label>
        </header>
        <form class="admin-form-grid compact user-permission-form">
          <label><span>角色</span><select name="role" data-role-select>
            ${["owner", "admin", "editor", "viewer"].map((role) => `<option value="${role}" ${profile.role === role ? "selected" : ""}>${role}</option>`).join("")}
          </select></label>
          <label><span>顯示名稱</span><input name="display_name" type="text" value="${escapeHTML(profile.display_name || "")}" /></label>
          <label><span>Email</span><input name="email" type="email" value="${escapeHTML(profile.email || "")}" /></label>
          <div class="admin-field-wide permission-group-grid">
            ${renderPermissionGroups(admin)}
          </div>
          <button type="submit">儲存權限</button>
        </form>
      </article>
    `;
  }).join("");
}

async function loadUsers() {
  setStatus("正在讀取使用者資料...", "info");
  refreshButton?.setAttribute("disabled", "true");
  try {
    const payload = await adminUsersRequest();
    profiles = payload.profiles || [];
    admins = payload.admins || [];
    renderUsers();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load users", error);
    setStatus(`讀取使用者失敗：${error.message}`, "error");
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

function applyRoleDefaults(form, role) {
  const defaults = roleDefaults[role] || roleDefaults.viewer;
  permissionFields.forEach(([field]) => {
    const input = form.elements[field];
    if (input) input.checked = Boolean(defaults[field]);
  });
}

async function saveUser(card, form) {
  const profileId = card.dataset.profileId;
  const role = form.elements.role.value;
  const profilePayload = {
    role,
    display_name: form.elements.display_name.value.trim() || null,
    email: form.elements.email.value.trim() || null,
    is_active: card.querySelector("[data-profile-enabled]")?.checked ?? true
  };
  const adminPayload = {
    profile_id: profileId,
    role,
    is_active: profilePayload.is_active
  };
  permissionFields.forEach(([field]) => {
    adminPayload[field] = Boolean(form.elements[field]?.checked);
  });
  adminPayload.can_edit_pages = adminPayload.can_edit_pages || adminPayload.can_edit_recruiting || adminPayload.can_edit_investor;
  adminPayload.can_edit_articles = Boolean(adminPayload.can_edit_articles);
  adminPayload.can_manage_media = adminPayload.can_manage_media || adminPayload.can_delete_media;
  adminPayload.can_edit_courses = Boolean(adminPayload.can_edit_courses);
  adminPayload.can_manage_files = adminPayload.can_manage_files || adminPayload.can_delete_files;
  adminPayload.can_view_forms = adminPayload.can_view_forms || adminPayload.can_edit_forms || adminPayload.can_export_forms;
  adminPayload.can_view_analytics = adminPayload.can_view_analytics || adminPayload.can_export_analytics;

  setStatus("正在儲存使用者權限...", "info");
  try {
    await adminUsersRequest({
      method: "POST",
      body: {
        profile_id: profileId,
        ...profilePayload,
        ...adminPayload
      }
    });
    setStatus("使用者權限已儲存。", "success");
    await loadUsers();
  } catch (error) {
    console.error("Failed to save user permissions", error);
    setStatus(`儲存使用者權限失敗：${error.message}`, "error");
  }
}

usersList?.addEventListener("change", (event) => {
  const select = event.target.closest("[data-role-select]");
  if (!select) return;
  applyRoleDefaults(select.closest("form"), select.value);
});

usersList?.addEventListener("submit", (event) => {
  const form = event.target.closest(".user-permission-form");
  const card = event.target.closest("[data-profile-id]");
  if (!form || !card) return;
  event.preventDefault();
  saveUser(card, form);
});

refreshButton?.addEventListener("click", loadUsers);
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadUsers
}).catch((error) => reportAdminBootError(loading, error));
