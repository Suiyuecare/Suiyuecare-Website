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

const permissionModules = [
  {
    id: "pages",
    title: "官網頁面",
    hint: "首頁、服務項目、招募合作與固定頁面文字圖片。",
    viewFields: ["can_view_pages"],
    editFields: ["can_edit_pages"],
    deleteFields: ["can_delete_pages"]
  },
  {
    id: "media",
    title: "圖片庫",
    hint: "上傳圖片、裁切圖片、查看圖片被哪些地方使用。",
    viewFields: ["can_view_media"],
    editFields: ["can_manage_media"],
    deleteFields: ["can_delete_media"]
  },
  {
    id: "articles",
    title: "文章內容",
    hint: "Health 3.0、最新消息、得標紀錄、真實照顧情境、名人講堂。",
    viewFields: ["can_view_articles"],
    editFields: ["can_edit_articles"],
    deleteFields: ["can_delete_articles"]
  },
  {
    id: "courses",
    title: "課程報名",
    hint: "課程卡片、日期、價格、報名資料。",
    viewFields: ["can_view_courses"],
    editFields: ["can_edit_courses"],
    deleteFields: ["can_delete_courses"]
  },
  {
    id: "recruiting",
    title: "招募管理",
    hint: "人才招募、職缺卡片、部門介紹。",
    viewFields: ["can_view_recruiting"],
    editFields: ["can_edit_recruiting"],
    deleteFields: ["can_delete_recruiting"]
  },
  {
    id: "investor",
    title: "投資人資料",
    hint: "投資人公告、財報下載、圖表資料。",
    viewFields: ["can_view_investor"],
    editFields: ["can_edit_investor"],
    deleteFields: ["can_delete_investor"]
  },
  {
    id: "analytics",
    title: "網站流量",
    hint: "流量中心與報表匯出，建議只給主管或行銷管理者。",
    viewFields: ["can_view_analytics"],
    editFields: ["can_export_analytics"],
    deleteFields: []
  },
  {
    id: "quality",
    title: "內容健康檢查",
    hint: "上線前檢查缺圖、缺 SEO、未發布內容。",
    viewFields: ["can_view_content_health"],
    editFields: [],
    deleteFields: []
  },
  {
    id: "users",
    title: "人員權限",
    hint: "新增/停用後台使用者與調整權限，只建議給主管。",
    viewFields: ["can_manage_users"],
    editFields: ["can_manage_users"],
    deleteFields: []
  },
  {
    id: "backup",
    title: "備份還原",
    hint: "正式上線前備份與還原，建議只給最高權限或資訊窗口。",
    viewFields: ["can_manage_backups"],
    editFields: ["can_manage_backups"],
    deleteFields: []
  }
];

const hiddenPermissionFields = [
  "can_publish",
  "can_review_publish",
  "can_edit_site_settings",
  "can_view_files",
  "can_manage_files",
  "can_delete_files",
  "can_view_forms",
  "can_edit_forms",
  "can_export_forms"
];

const permissionFields = [
  ...new Set([
    ...permissionModules.flatMap((module) => [
      ...module.viewFields,
      ...module.editFields,
      ...module.deleteFields
    ]),
    ...hiddenPermissionFields
  ])
].map((field) => [field, field]);

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

const roleLabels = {
  owner: "Owner｜最高權限（僅 entrepreneur）",
  admin: "Admin｜主管管理者（不能直接發布）",
  editor: "Editor｜內容編輯者（需送審）",
  viewer: "Viewer｜只讀檢視"
};

const roleDescriptions = {
  owner: "只有 entrepreneur@suiyuecare.com 使用。可管理所有權限、直接發布、核准送審。",
  admin: "適合主管或後台管理者。可管理使用者與多數資料，但發布仍需送審給 Owner。",
  editor: "適合企劃、行政、課程或招募同仁。可新增與編輯內容，但不能正式發布。",
  viewer: "適合只需要查看資料的人員。不能新增、編輯、刪除或發布。"
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

function renderRoleOptions(selectedRole = "viewer", email = "") {
  const normalizedEmail = String(email || "").toLowerCase();
  return ["owner", "admin", "editor", "viewer"].map((role) => {
    const ownerLocked = role === "owner" && normalizedEmail !== "entrepreneur@suiyuecare.com";
    return `<option value="${role}" ${selectedRole === role ? "selected" : ""} ${ownerLocked ? "disabled" : ""}>${escapeHTML(roleLabels[role])}</option>`;
  }).join("");
}

function permissionLevel(admin, module) {
  if (module.editFields.some((field) => admin[field])) return "edit";
  if (module.viewFields.some((field) => admin[field])) return "view";
  return "none";
}

function renderPermissionMatrix(admin) {
  const columns = [
    ["none", "無", "看不到這個模組"],
    ["view", "可看", "可以進入查看，但不能改"],
    ["edit", "可編輯", "可以新增、編輯與送審"]
  ];

  return `
    <div class="permission-matrix-help">
      <strong>權限怎麼看？</strong>
      <p>每個部門只需要選「無、可看、可編輯」。正式發布仍遵守規則：除了執行長最高權限以外，其他人都只能送審，不能直接上線。</p>
    </div>
    <div class="permission-matrix" role="table" aria-label="後台權限矩陣">
      <div class="permission-matrix-row permission-matrix-head" role="row">
        <span>模組</span>
        ${columns.map(([, label]) => `<span>${label}</span>`).join("")}
      </div>
      ${permissionModules.map((module) => {
        const selectedLevel = permissionLevel(admin, module);
        return `
          <div class="permission-matrix-row" role="row">
            <div class="permission-matrix-module">
              <strong>${escapeHTML(module.title)}</strong>
              <small>${escapeHTML(module.hint)}</small>
            </div>
            ${columns.map(([value, label, title]) => `
              <label title="${escapeHTML(title)}">
                <input
                  type="radio"
                  name="permission_level_${escapeHTML(module.id)}"
                  value="${value}"
                  ${selectedLevel === value ? "checked" : ""}
                />
                <span>${escapeHTML(label)}</span>
              </label>
            `).join("")}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderUsers() {
  if (!profiles.length) {
    usersList.innerHTML = `<div class="admin-empty-state">目前沒有後台使用者。請重新整理本頁；若你已登入，系統會自動建立第一位 owner 管理者。</div>`;
    return;
  }

  usersList.innerHTML = profiles.map((profile) => {
    const admin = mergedAdmin(profile);
    const role = profile.role || "viewer";
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
        <div class="admin-help-card user-role-summary">
          <strong>目前角色：${escapeHTML(roleLabels[role] || role)}</strong>
          <p>${escapeHTML(roleDescriptions[role] || "請依照職務需求勾選細項權限。")}</p>
          <small>發布規則：除了 entrepreneur Owner 以外，所有帳號都需要送審，不能直接讓前台上線。</small>
        </div>
        <form class="admin-form-grid compact user-permission-form">
          <label><span>角色</span><select name="role" data-role-select>
            ${renderRoleOptions(role, profile.email)}
          </select></label>
          <label><span>顯示名稱</span><input name="display_name" type="text" value="${escapeHTML(profile.display_name || "")}" /></label>
          <label><span>Email</span><input name="email" type="email" value="${escapeHTML(profile.email || "")}" /></label>
          <div class="admin-field-wide">
            ${renderPermissionMatrix(admin)}
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
  permissionModules.forEach((module) => {
    const input = form.elements[`permission_level_${module.id}`];
    if (!input) return;
    const nextLevel = permissionLevel(defaults, module);
    Array.from(input).forEach((radio) => {
      radio.checked = radio.value === nextLevel;
    });
  });
}

function applyModuleLevel(payload, module, level, role) {
  module.viewFields.forEach((field) => {
    payload[field] = level === "view" || level === "edit";
  });
  module.editFields.forEach((field) => {
    payload[field] = level === "edit";
  });
  module.deleteFields.forEach((field) => {
    payload[field] = level === "edit" && ["owner", "admin"].includes(role);
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
    adminPayload[field] = false;
  });

  permissionModules.forEach((module) => {
    const level = form.elements[`permission_level_${module.id}`]?.value || "none";
    applyModuleLevel(adminPayload, module, level, role);
  });

  if (String(profilePayload.email || "").toLowerCase() === "entrepreneur@suiyuecare.com" && role === "owner") {
    Object.assign(adminPayload, roleDefaults.owner);
  }

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
