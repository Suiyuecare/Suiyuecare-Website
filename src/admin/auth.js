import { hasSupabaseConfig, supabase } from "../lib/supabaseClient.js";
import { allContentScopeKeys, canPublishScope, scopeForPageSlug } from "./content-scope.js";

export const ADMIN_LOGIN_PATH = "/admin/login/";
export const ADMIN_HOME_PATH = "/admin/";

export const permissionRules = {
  "/admin": null,
  "/admin/": null,
  "/admin/pages": "can_view_pages",
  "/admin/pages/": "can_view_pages",
  "/admin/home-modules": "can_view_home_content",
  "/admin/template-fields": "can_view_service_content",
  "/admin/milestones": "can_view_brand_content",
  "/admin/media": "can_view_media",
  "/admin/courses": "can_view_courses",
  "/admin/recruiting": "can_view_recruiting",
  "/admin/investor-data": "can_view_investor",
  "/admin/files": "can_view_files",
  "/admin/forms": "can_view_forms",
  "/admin/site-settings": "can_view_site_settings",
  "/admin/stories": "can_view_articles",
  "/admin/articles": "can_view_articles",
  "/admin/articles/": "can_view_articles",
  "/admin/categories": "can_view_articles",
  "/admin/governance": null,
  "/admin/users": "can_manage_users",
  "/admin/traffic": "can_view_analytics",
  "/admin/content-health": "can_view_content_health",
  "/admin/backups": "can_manage_backups"
};

export const permissionLabels = {
  can_manage_users: "管理使用者",
  can_publish: "發布內容",
  can_review_publish: "審核發布",
  can_view_site_settings: "檢視全站設定",
  can_edit_site_settings: "管理全站設定",
  can_view_pages: "檢視頁面內容",
  can_edit_pages: "編輯頁面/首頁內容",
  can_delete_pages: "刪除頁面卡片",
  can_edit_service_content: "管理服務固定版位",
  can_view_home_content: "檢視首頁內容",
  can_edit_home_content: "編輯首頁內容",
  can_view_service_content: "檢視服務固定版位",
  can_view_articles: "檢視文章/故事/講堂",
  can_edit_articles: "編輯文章/故事/講堂",
  can_delete_articles: "刪除文章/故事/講堂",
  can_view_media: "檢視圖片素材",
  can_manage_media: "上傳/編輯圖片",
  can_delete_media: "刪除圖片素材",
  can_view_courses: "檢視課程",
  can_edit_courses: "新增/編輯課程",
  can_delete_courses: "刪除課程",
  can_view_files: "檢視下載檔",
  can_manage_files: "新增/編輯下載檔",
  can_delete_files: "刪除下載檔",
  can_view_forms: "檢視表單資料",
  can_edit_forms: "處理表單資料",
  can_export_forms: "匯出表單資料",
  can_view_recruiting: "檢視招募資料",
  can_edit_recruiting: "編輯招募資料",
  can_delete_recruiting: "刪除招募資料",
  can_edit_talent_recruiting: "管理人才招募",
  can_edit_partnership_recruiting: "管理土地與投資人招募",
  can_view_investor: "檢視投資人資料",
  can_edit_investor: "編輯投資人資料",
  can_delete_investor: "刪除投資人資料",
  can_edit_brand_content: "管理品牌大事記",
  can_view_brand_content: "檢視品牌大事記",
  can_view_analytics: "檢視網站流量中心",
  can_export_analytics: "匯出流量報表",
  can_view_content_health: "檢視內容健康檢查",
  can_manage_backups: "管理備份與還原"
};

const defaultPermissionState = {
  departments: [],
  content_scopes: [],
  edit_scopes: [],
  publish_scopes: [],
  can_manage_users: false,
  can_publish: false,
  can_review_publish: false,
  can_view_site_settings: false,
  can_edit_site_settings: false,
  can_view_pages: true,
  can_edit_pages: false,
  can_delete_pages: false,
  can_view_home_content: false,
  can_edit_home_content: false,
  can_view_service_content: false,
  can_edit_service_content: false,
  can_view_articles: true,
  can_edit_articles: false,
  can_delete_articles: false,
  can_view_media: true,
  can_manage_media: false,
  can_delete_media: false,
  can_view_courses: true,
  can_edit_courses: false,
  can_delete_courses: false,
  can_view_files: true,
  can_manage_files: false,
  can_delete_files: false,
  can_view_forms: true,
  can_edit_forms: false,
  can_export_forms: false,
  can_view_recruiting: true,
  can_edit_recruiting: false,
  can_delete_recruiting: false,
  can_edit_talent_recruiting: false,
  can_edit_partnership_recruiting: false,
  can_view_investor: true,
  can_edit_investor: false,
  can_delete_investor: false,
  can_view_brand_content: false,
  can_edit_brand_content: false,
  can_view_analytics: false,
  can_export_analytics: false,
  can_view_content_health: true,
  can_manage_backups: false
};

const portalAdminHandoffKey = "suiyuecare.admin.portalHandoff";
const portalAdminAllowedEmails = new Set(["entrepreneur@suiyuecare.com"]);

function decodePortalPayload(encodedPayload) {
  if (!encodedPayload) return null;
  try {
    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = decodeURIComponent(escape(window.atob(padded)));
    return JSON.parse(json);
  } catch (error) {
    console.warn("Invalid portal admin payload", error);
    return null;
  }
}

function getPortalAdminPayloadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("portal") !== "1") return null;
  return decodePortalPayload(params.get("payload"));
}

function readStoredPortalAdminPayload() {
  try {
    const raw = window.sessionStorage.getItem(portalAdminHandoffKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storePortalAdminPayload(payload) {
  try {
    window.sessionStorage.setItem(portalAdminHandoffKey, JSON.stringify(payload));
  } catch {
    // Session storage can be unavailable in some restricted browser modes.
  }
}

function portalAdminPayloadIsFresh(payload) {
  const launchedAt = Date.parse(payload?.launchedAt || "");
  if (!Number.isFinite(launchedAt)) return false;
  return Date.now() - launchedAt < 8 * 60 * 60 * 1000;
}

function getPortalAdminPayload(session) {
  const urlPayload = getPortalAdminPayloadFromUrl();
  if (urlPayload) storePortalAdminPayload(urlPayload);
  const payload = urlPayload || readStoredPortalAdminPayload();
  const sessionEmail = session?.user?.email?.toLowerCase();
  const payloadEmail = payload?.email?.toLowerCase();
  if (!sessionEmail || sessionEmail !== payloadEmail) return null;
  if (payload?.moduleId !== "website-backoffice") return null;
  if (!portalAdminPayloadIsFresh(payload)) return null;
  if (!portalAdminAllowedEmails.has(sessionEmail)) return null;
  if (!["ceo", "owner"].includes(payload.sourceRoleKey) && !["ceo", "owner"].includes(payload.roleKey)) return null;
  return payload;
}

function buildPortalOwnerPermissions(session, payload) {
  return {
    ...defaultPermissionState,
    departments: [],
    content_scopes: [...allContentScopeKeys],
    edit_scopes: [...allContentScopeKeys],
    publish_scopes: [...allContentScopeKeys],
    profile_id: `portal-${session.user.id}`,
    role: "owner",
    display_name: payload.displayName || payload.name || "執行長",
    email: session.user.email,
    source: "logging-portal",
    can_manage_users: true,
    can_publish: true,
    can_review_publish: true,
    can_view_site_settings: true,
    can_edit_site_settings: true,
    can_view_pages: true,
    can_edit_pages: true,
    can_delete_pages: true,
    can_view_home_content: true,
    can_edit_home_content: true,
    can_view_service_content: true,
    can_edit_service_content: true,
    can_view_articles: true,
    can_edit_articles: true,
    can_delete_articles: true,
    can_view_media: true,
    can_manage_media: true,
    can_delete_media: true,
    can_view_courses: true,
    can_edit_courses: true,
    can_delete_courses: true,
    can_view_files: true,
    can_manage_files: true,
    can_delete_files: true,
    can_view_forms: true,
    can_edit_forms: true,
    can_export_forms: true,
    can_view_recruiting: true,
    can_edit_recruiting: true,
    can_delete_recruiting: true,
    can_edit_talent_recruiting: true,
    can_edit_partnership_recruiting: true,
    can_view_investor: true,
    can_edit_investor: true,
    can_delete_investor: true,
    can_view_brand_content: true,
    can_edit_brand_content: true,
    can_view_analytics: true,
    can_export_analytics: true,
    can_view_content_health: true,
    can_manage_backups: true
  };
}

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
  return `此帳號沒有「${permissionLabels[permission] || permission}」權限，請洽執行長調整。`;
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
  const session = await getCurrentSession();
  const portalPayload = getPortalAdminPayload(session);
  if (portalPayload) return buildPortalOwnerPermissions(session, portalPayload);

  const { data, error } = await supabase.rpc("get_current_admin_permissions");
  if (!error && data && Object.keys(data).length) return { ...defaultPermissionState, ...data };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, email, is_active")
    .eq("user_id", session?.user?.id)
    .maybeSingle();

  if (profileError) throw error || profileError;
  if (!profile?.is_active) return {};

  // A missing department-aware permissions RPC must not revive the former
  // broad Admin/Editor write access. Only Owner can edit in fallback mode.
  const isOwner = profile.role === "owner";

  return {
    ...defaultPermissionState,
    departments: [],
    content_scopes: isOwner ? [...allContentScopeKeys] : [],
    edit_scopes: isOwner ? [...allContentScopeKeys] : [],
    publish_scopes: isOwner ? [...allContentScopeKeys] : [],
    profile_id: profile.id,
    role: profile.role,
    display_name: profile.display_name,
    email: profile.email,
    can_manage_users: isOwner,
    can_publish: isOwner,
    can_review_publish: isOwner,
    can_view_site_settings: isOwner,
    can_edit_site_settings: isOwner,
    can_view_pages: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_manage_media: isOwner,
    can_edit_pages: isOwner,
    can_delete_pages: isOwner,
    can_view_home_content: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_edit_home_content: isOwner,
    can_view_service_content: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_edit_service_content: isOwner,
    can_view_articles: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_edit_articles: isOwner,
    can_delete_articles: isOwner,
    can_view_courses: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_edit_courses: isOwner,
    can_delete_courses: isOwner,
    can_view_media: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_delete_media: isOwner,
    can_view_files: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_manage_files: isOwner,
    can_delete_files: isOwner,
    can_view_forms: ["owner", "admin", "editor"].includes(profile.role),
    can_edit_forms: isOwner,
    can_export_forms: isOwner,
    can_view_recruiting: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_edit_recruiting: isOwner,
    can_delete_recruiting: isOwner,
    can_edit_talent_recruiting: isOwner,
    can_edit_partnership_recruiting: isOwner,
    can_view_investor: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_edit_investor: isOwner,
    can_delete_investor: isOwner,
    can_view_brand_content: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_edit_brand_content: isOwner,
    can_view_analytics: ["owner", "admin"].includes(profile.role),
    can_export_analytics: ["owner", "admin"].includes(profile.role),
    can_view_content_health: ["owner", "admin", "editor", "viewer"].includes(profile.role),
    can_manage_backups: ["owner", "admin"].includes(profile.role)
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

  applyPublishStatusUi(permissions);
}

function ensurePublishHint(statusSelect, message) {
  let hint = statusSelect.closest("label")?.querySelector(".admin-publish-permission-hint");
  if (!hint) {
    hint = document.createElement("small");
    hint.className = "admin-publish-permission-hint";
    statusSelect.closest("label")?.appendChild(hint);
  }
  hint.textContent = message;
}

function inferredContentScope() {
  const path = normalizePath();
  if (path.startsWith("/admin/home-modules")) return "page:home";
  if (path.startsWith("/admin/milestones")) return "brand";
  if (path.startsWith("/admin/articles") || path.startsWith("/admin/categories") || path.startsWith("/admin/stories")) return "health";
  if (path.startsWith("/admin/courses")) return "courses";
  if (path.startsWith("/admin/investor-data")) return "investor";
  if (path.startsWith("/admin/recruiting")) {
    return scopeForPageSlug(new URLSearchParams(window.location.search).get("page") || "talent");
  }
  return "";
}

export function applyPublishStatusUi(permissions = {}) {
  const fallbackScope = inferredContentScope();
  document.querySelectorAll('select[name="status"]').forEach((statusSelect) => {
    const publishOption = [...statusSelect.options].find((option) => option.value === "published");
    if (!publishOption) return;

    const scopeKey = statusSelect.dataset.contentScope || statusSelect.closest("[data-content-scope]")?.dataset.contentScope || fallbackScope;
    const canPublish = hasAdminPermission(permissions, "can_publish") || canPublishScope(permissions, scopeKey);

    if (canPublish) {
      publishOption.disabled = false;
      statusSelect.dataset.publishLocked = "false";
      ensurePublishHint(statusSelect, "你是執行長 Owner，可以核准並套用內容。");
      return;
    }

    if (statusSelect.value !== "published") {
      publishOption.disabled = true;
    }
    statusSelect.dataset.publishLocked = "true";
    ensurePublishHint(statusSelect, "部門同仁不能直接選「已發布」。請先儲存草稿，再送交執行長核准。");
  });
}

export function redirectWhenSignedOut() {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      window.sessionStorage.removeItem(portalAdminHandoffKey);
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
