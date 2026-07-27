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
const contentAreaOwnershipForm = document.querySelector("#contentAreaOwnershipForm");
const contentAreaOwnershipGrid = document.querySelector("#contentAreaOwnershipGrid");

const permissionModules = [
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
    hint: "新增、停用後台使用者與調整權限，僅由 Owner 操作。",
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
  "can_view_pages",
  "can_edit_pages",
  "can_delete_pages",
  "can_view_articles",
  "can_edit_articles",
  "can_delete_articles",
  "can_view_media",
  "can_manage_media",
  "can_delete_media",
  "can_view_courses",
  "can_edit_courses",
  "can_delete_courses",
  "can_view_files",
  "can_manage_files",
  "can_delete_files",
  "can_view_forms",
  "can_edit_forms",
  "can_export_forms",
  "can_view_recruiting",
  "can_edit_recruiting",
  "can_delete_recruiting",
  "can_view_investor",
  "can_edit_investor",
  "can_delete_investor"
];

const departmentRoleOptions = [
  { value: "", label: "無權限", hint: "不顯示，也不能讀取未發布資料" },
  { value: "viewer", label: "可檢視", hint: "可查看所屬內容與案件，不能修改" },
  { value: "editor", label: "可編輯", hint: "可新增、修改並送出發布申請" },
  { value: "manager", label: "部門負責人", hint: "可編輯並送審，作為部門權責窗口；最後仍由執行長核准" }
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
    can_manage_users: false,
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
    can_view_pages: false,
    can_delete_pages: false,
    can_view_articles: false,
    can_delete_articles: false,
    can_view_media: false,
    can_delete_media: false,
    can_view_courses: false,
    can_delete_courses: false,
    can_view_files: false,
    can_delete_files: false,
    can_edit_forms: false,
    can_export_forms: false,
    can_view_recruiting: false,
    can_edit_recruiting: false,
    can_delete_recruiting: false,
    can_view_investor: false,
    can_edit_investor: false,
    can_delete_investor: false,
    can_export_analytics: false,
    can_view_content_health: false,
    can_manage_backups: false,
    can_manage_media: false,
    can_edit_pages: false,
    can_edit_articles: false,
    can_edit_courses: false,
    can_manage_files: false,
    can_view_forms: false,
    can_view_analytics: false
  },
  viewer: {
    can_manage_users: false,
    can_publish: false,
    can_review_publish: false,
    can_edit_site_settings: false,
    can_view_pages: false,
    can_delete_pages: false,
    can_view_articles: false,
    can_delete_articles: false,
    can_view_media: false,
    can_delete_media: false,
    can_view_courses: false,
    can_delete_courses: false,
    can_view_files: false,
    can_delete_files: false,
    can_edit_forms: false,
    can_export_forms: false,
    can_view_recruiting: false,
    can_edit_recruiting: false,
    can_delete_recruiting: false,
    can_view_investor: false,
    can_edit_investor: false,
    can_delete_investor: false,
    can_export_analytics: false,
    can_view_content_health: false,
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
  admin: "Admin｜系統工具管理者",
  editor: "Editor｜一般後台使用者",
  viewer: "Viewer｜只讀帳號"
};

const roleDescriptions = {
  owner: "只有 entrepreneur@suiyuecare.com 使用，可管理全站與所有部門。",
  admin: "可依矩陣使用系統工具；帳號與部門權限仍由 Owner 統一設定。",
  editor: "一般同仁帳號；能看、能改哪些內容完全依下方部門身分決定。",
  viewer: "只保留登入能力；仍須加入部門並指定可檢視，才會看到該部門資料。"
};

let profiles = [];
let admins = [];
let departments = [];
let departmentMemberships = [];
let contentAreas = [];

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

function membershipForProfile(profileId, departmentId) {
  return departmentMemberships.find((membership) => (
    membership.profile_id === profileId
    && membership.department_id === departmentId
    && membership.is_active !== false
  ));
}

function contentAreasForDepartment(departmentId) {
  return contentAreas
    .filter((area) => area.department_id === departmentId && area.is_active !== false)
    .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0));
}

function renderContentAreaOwnership() {
  if (!contentAreaOwnershipGrid) return;
  if (!contentAreas.length || !departments.length) {
    contentAreaOwnershipGrid.innerHTML = '<div class="admin-empty-state">目前沒有可設定的內容責任資料。</div>';
    return;
  }

  contentAreaOwnershipGrid.innerHTML = contentAreas
    .slice()
    .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0))
    .map((area) => `
      <article class="content-area-ownership-row">
        <div>
          <span>${escapeHTML(area.scope_key)}</span>
          <strong>${escapeHTML(area.name)}</strong>
          <small>${escapeHTML(area.description || "網站內容責任範圍")}</small>
        </div>
        <div class="content-area-paths">
          ${area.frontend_path ? `<a href="${escapeHTML(area.frontend_path)}" target="_blank" rel="noopener">前台 ${escapeHTML(area.frontend_path)}</a>` : ""}
          ${area.admin_path ? `<a href="${escapeHTML(area.admin_path)}">後台管理</a>` : ""}
        </div>
        <label>
          <span class="sr-only">${escapeHTML(area.name)}負責部門</span>
          <select data-content-area-scope="${escapeHTML(area.scope_key)}">
            ${departments.map((department) => `
              <option value="${escapeHTML(department.id)}" ${department.id === area.department_id ? "selected" : ""}>${escapeHTML(department.name)}</option>
            `).join("")}
          </select>
        </label>
      </article>
    `).join("");
}

function renderDepartmentMatrix(profile) {
  const isOwner = profile.role === "owner";
  return `
    <section class="department-access-matrix" aria-label="部門與內容責任">
      <div class="permission-matrix-help">
        <strong>部門與內容責任（真正限制資料庫）</strong>
        <p>同仁只會看到所屬部門的草稿、表單、圖片與發布紀錄，也只能修改該部門負責的前台內容。所有角色完成編輯後都必須送交執行長核准。</p>
        <small>公開官網內容仍可像一般訪客一樣查看，但不會因此取得其他部門的後台編輯權。</small>
      </div>
      <div class="department-access-grid">
        ${departments.map((department) => {
          const membership = membershipForProfile(profile.id, department.id);
          const selectedRole = isOwner ? "manager" : membership?.membership_role || "";
          const areas = contentAreasForDepartment(department.id);
          const selectedRoleHint = departmentRoleOptions.find((option) => option.value === selectedRole)?.hint || departmentRoleOptions[0].hint;
          return `
            <article class="department-access-card" data-access-level="${escapeHTML(selectedRole || "none")}">
              <div class="department-access-card-head">
                <div>
                  <span>${escapeHTML(department.slug || "department")}</span>
                  <strong>${escapeHTML(department.name || "未命名部門")}</strong>
                </div>
                <label>
                  <span class="sr-only">${escapeHTML(department.name)}權限</span>
                  <select name="department_role_${escapeHTML(department.id)}" data-department-id="${escapeHTML(department.id)}" ${isOwner ? "disabled" : ""}>
                    ${departmentRoleOptions.map((option) => `
                      <option value="${escapeHTML(option.value)}" ${selectedRole === option.value ? "selected" : ""}>${escapeHTML(option.label)}</option>
                    `).join("")}
                  </select>
                </label>
              </div>
              <p>${escapeHTML(department.description || "由此部門負責的官網內容與案件。")}</p>
              <div class="department-area-tags" aria-label="負責內容">
                ${areas.map((area) => `<span title="${escapeHTML(area.description || area.name)}">${escapeHTML(area.name)}</span>`).join("") || "<span>尚未指派內容</span>"}
              </div>
              <small>${escapeHTML(selectedRoleHint)}</small>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
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

function renderPermissionMatrix(admin, role) {
  const columns = [
    ["none", "無", "看不到這個模組"],
    ["view", "可看", "可以進入查看，但不能改"],
    ["edit", "可編輯", "可以新增、編輯與送審"]
  ];

  return `
    <div class="permission-matrix-help">
      <strong>通用系統模組權限</strong>
      <p>這一區只管理流量、內容檢查、帳號與備份等系統工具。官網內容、圖片、案件與發布能力全部以下方部門角色為準。</p>
    </div>
    <div class="permission-matrix" role="table" aria-label="後台權限矩陣">
      <div class="permission-matrix-row permission-matrix-head" role="row">
        <span>模組</span>
        ${columns.map(([, label]) => `<span>${label}</span>`).join("")}
      </div>
      ${permissionModules.map((module) => {
        const selectedLevel = permissionLevel(admin, module);
        const ownerOnly = module.id === "users" && role !== "owner";
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
                  ${ownerOnly ? "disabled" : ""}
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
          <small>發布規則：部門同仁與負責人都只能編輯、送審；只有 Owner／執行長可以核准並發布。</small>
        </div>
        <form class="admin-form-grid compact user-permission-form">
          <label><span>角色</span><select name="role" data-role-select>
            ${renderRoleOptions(role, profile.email)}
          </select></label>
          <label><span>顯示名稱</span><input name="display_name" type="text" value="${escapeHTML(profile.display_name || "")}" /></label>
          <label><span>Email</span><input name="email" type="email" value="${escapeHTML(profile.email || "")}" /></label>
          <div class="admin-field-wide">
            ${renderDepartmentMatrix(profile)}
          </div>
          <div class="admin-field-wide">
            ${renderPermissionMatrix(admin, role)}
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
    departments = payload.departments || [];
    departmentMemberships = payload.departmentMemberships || [];
    contentAreas = payload.contentAreas || [];
    renderContentAreaOwnership();
    renderUsers();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load users", error);
    setStatus(`讀取使用者失敗：${error.message}`, "error");
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

async function saveContentAreaOwnership(event) {
  event.preventDefault();
  const assignments = Array.from(contentAreaOwnershipGrid.querySelectorAll("select[data-content-area-scope]"))
    .map((select) => ({
      scope_key: select.dataset.contentAreaScope,
      department_id: select.value
    }));
  const submitButton = contentAreaOwnershipForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setStatus("正在儲存內容責任配置...", "info");
  try {
    await adminUsersRequest({
      method: "POST",
      body: {
        action: "update_content_areas",
        content_area_assignments: assignments
      }
    });
    setStatus("內容責任配置已儲存；部門權限已同步更新。", "success");
    await loadUsers();
  } catch (error) {
    console.error("Failed to save content ownership", error);
    setStatus(`儲存內容責任配置失敗：${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
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
  const selectedDepartmentMemberships = Array.from(form.querySelectorAll("select[data-department-id]"))
    .filter((select) => select.value)
    .map((select) => ({
      department_id: select.dataset.departmentId,
      membership_role: select.value
    }));
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
        department_memberships: selectedDepartmentMemberships,
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
  const departmentSelect = event.target.closest("select[data-department-id]");
  if (departmentSelect) {
    const card = departmentSelect.closest(".department-access-card");
    const selectedOption = departmentRoleOptions.find((option) => option.value === departmentSelect.value) || departmentRoleOptions[0];
    if (card) {
      card.dataset.accessLevel = departmentSelect.value || "none";
      const hint = card.querySelector(":scope > small");
      if (hint) hint.textContent = selectedOption.hint;
    }
    return;
  }

  const roleSelect = event.target.closest("[data-role-select]");
  if (!roleSelect) return;
  const form = roleSelect.closest("form");
  applyRoleDefaults(form, roleSelect.value);

  form.querySelectorAll("select[data-department-id]").forEach((select) => {
    const ownerSelected = roleSelect.value === "owner";
    select.disabled = ownerSelected;
    if (ownerSelected) select.value = "manager";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
});

usersList?.addEventListener("submit", (event) => {
  const form = event.target.closest(".user-permission-form");
  const card = event.target.closest("[data-profile-id]");
  if (!form || !card) return;
  event.preventDefault();
  saveUser(card, form);
});

refreshButton?.addEventListener("click", loadUsers);
contentAreaOwnershipForm?.addEventListener("submit", saveContentAreaOwnership);
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadUsers
}).catch((error) => reportAdminBootError(loading, error));
