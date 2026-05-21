import { hasSupabaseConfig, supabase } from "../lib/supabaseClient.js";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";

export const permissionRules = {
  "/admin": null,
  "/admin/": null,
  "/admin/site-settings": "can_edit_pages",
  "/admin/pages": "can_edit_pages",
  "/admin/pages/": "can_edit_pages",
  "/admin/home-modules": "can_edit_pages",
  "/admin/template-fields": "can_edit_pages",
  "/admin/media": "can_manage_media",
  "/admin/courses": "can_edit_courses",
  "/admin/files": "can_manage_files",
  "/admin/forms": "can_view_forms",
  "/admin/recruiting": "can_edit_pages",
  "/admin/investor-data": "can_edit_pages",
  "/admin/stories": "can_edit_articles",
  "/admin/articles": "can_edit_articles",
  "/admin/articles/": "can_edit_articles",
  "/admin/categories": "can_edit_articles",
  "/admin/governance": "can_review_publish",
  "/admin/users": "can_manage_users",
  "/admin/traffic": "can_view_analytics",
  "/admin/content-health": "can_edit_pages"
};

export const permissionLabels = {
  can_manage_users: "管理使用者",
  can_publish: "發布內容",
  can_review_publish: "審核發布",
  can_manage_media: "管理圖片",
  can_edit_pages: "管理頁面/首頁/招募/投資人內容",
  can_edit_articles: "管理文章/分類/故事講堂",
  can_edit_courses: "管理課程",
  can_manage_files: "管理下載檔",
  can_view_forms: "檢視表單資料",
  can_view_analytics: "檢視網站流量中心"
};

function normalizePath(path = window.location.pathname) {
  return path.replace(/\/index\.html$/, "").replace(/\/$/, "") || "/admin";
}

export function requiredPermissionForPath(path = window.location.pathname) {
  const normalized = normalizePath(path);
  if (normalized.startsWith("/admin/pages/")) return permissionRules["/admin/pages/"];
  if (normalized.startsWith("/admin/articles/")) return permissionRules["/admin/articles/"];
  return Object.prototype.hasOwnProperty.call(permissionRules, normalized) ? permissionRules[normalized] : null;
}

export function hasAdminPermission(permissions = {}, permission) {
  if (!permission) return Boolean(permissions?.role);
  if (permissions.role === "owner") return true;
  return Boolean(permissions?.[permission]);
}

export function permissionDeniedMessage(permission) {
  return `此帳號沒有「${permissionLabels[permission] || permission}」權限，請洽 owner/admin 調整。`;
}

export function setStatus(element, message, type = "info") {
  if (!element) return;
  element.textContent = message;
  element.dataset.status = type;
}

export function ensureSupabaseConfigured(statusElement) {
  if (hasSupabaseConfig && supabase) return true;
  setStatus(
    statusElement,
    "尚未設定 Supabase 環境變數。請設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY。",
    "error"
  );
  return false;
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function requireAdminSession() {
  const session = await getCurrentSession();
  if (!session) {
    window.location.replace(ADMIN_LOGIN_PATH);
    return null;
  }
  return session;
}

export async function getAdminPermissions() {
  if (!supabase) return {};

  const { data, error } = await supabase.rpc("get_current_admin_permissions");
  if (!error && data && Object.keys(data).length) return data;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, email, is_active")
    .eq("user_id", (await getCurrentSession())?.user?.id)
    .maybeSingle();

  if (profileError) throw error || profileError;
  if (!profile?.is_active) return {};

  return {
    profile_id: profile.id,
    role: profile.role,
    display_name: profile.display_name,
    email: profile.email,
    can_manage_users: ["owner", "admin"].includes(profile.role),
    can_publish: ["owner", "admin"].includes(profile.role),
    can_review_publish: ["owner", "admin"].includes(profile.role),
    can_manage_media: ["owner", "admin", "editor"].includes(profile.role),
    can_edit_pages: ["owner", "admin", "editor"].includes(profile.role),
    can_edit_articles: ["owner", "admin", "editor"].includes(profile.role),
    can_edit_courses: ["owner", "admin", "editor"].includes(profile.role),
    can_manage_files: ["owner", "admin", "editor"].includes(profile.role),
    can_view_forms: ["owner", "admin", "editor"].includes(profile.role),
    can_view_analytics: ["owner", "admin"].includes(profile.role)
  };
}

export function applyAdminPermissionUi(permissions = {}) {
  document.querySelectorAll('a[href^="/admin"]').forEach((link) => {
    const href = link.getAttribute("href") || "";
    const path = href.split("?")[0].split("#")[0];
    const required = requiredPermissionForPath(path);
    if (required && !hasAdminPermission(permissions, required)) {
      link.hidden = true;
      link.setAttribute("aria-hidden", "true");
      link.tabIndex = -1;
    }
  });

  document.querySelectorAll("[data-requires-permission]").forEach((element) => {
    const required = element.dataset.requiresPermission;
    if (required && !hasAdminPermission(permissions, required)) {
      element.hidden = true;
      element.setAttribute("aria-hidden", "true");
    }
  });
}

export function redirectWhenSignedOut() {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      window.location.replace(ADMIN_LOGIN_PATH);
    }
  });
}

export function redirectWhenSignedIn() {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((event, session) => {
    if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
      window.location.replace(ADMIN_HOME_PATH);
    }
  });
}
