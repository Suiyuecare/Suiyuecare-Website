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

const permissionFields = [
  ["can_manage_users", "管理使用者"],
  ["can_publish", "發布內容"],
  ["can_review_publish", "審核發布"],
  ["can_manage_media", "圖片管理"],
  ["can_edit_pages", "頁面/首頁/招募/投資人"],
  ["can_edit_articles", "文章/分類/故事講堂"],
  ["can_edit_courses", "課程管理"],
  ["can_manage_files", "檔案下載"],
  ["can_view_forms", "表單資料"],
  ["can_view_analytics", "網站流量"]
];

const roleDefaults = {
  owner: {
    can_manage_users: true,
    can_publish: true,
    can_review_publish: true,
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
    can_publish: true,
    can_review_publish: true,
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

function mergedAdmin(profile) {
  const admin = admins.find((item) => item.profile_id === profile.id) || {};
  return { ...roleDefaults[profile.role || "viewer"], ...admin };
}

function renderUsers() {
  if (!profiles.length) {
    usersList.innerHTML = `<div class="admin-empty-state">目前沒有 profiles。請先在 Supabase Auth 建立使用者並建立 profile。</div>`;
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
          <div class="admin-field-wide permission-check-grid">
            ${permissionFields.map(([field, label]) => `
              <label class="admin-toggle-field"><input name="${field}" type="checkbox" ${admin[field] ? "checked" : ""} /><span>${escapeHTML(label)}</span></label>
            `).join("")}
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
    const [profileResult, adminResult] = await Promise.all([
      supabase.from("profiles").select("id,user_id,email,display_name,role,is_active,updated_at").order("updated_at", { ascending: false }),
      supabase.from("admins").select("*")
    ]);
    if (profileResult.error) throw profileResult.error;
    if (adminResult.error) throw adminResult.error;
    profiles = profileResult.data || [];
    admins = adminResult.data || [];
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

  setStatus("正在儲存使用者權限...", "info");
  const profileResult = await supabase.from("profiles").update(profilePayload).eq("id", profileId);
  if (profileResult.error) {
    setStatus(`儲存 profile 失敗：${profileResult.error.message}`, "error");
    return;
  }
  const adminResult = await supabase.from("admins").upsert(adminPayload, { onConflict: "profile_id" });
  if (adminResult.error) {
    setStatus(`儲存 admin 權限失敗：${adminResult.error.message}`, "error");
    return;
  }
  setStatus("使用者權限已儲存。", "success");
  await loadUsers();
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
