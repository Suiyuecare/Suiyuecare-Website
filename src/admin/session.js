import { supabase } from "../lib/supabaseClient.js";
import {
  applyAdminPermissionUi,
  ensureSupabaseConfigured,
  getAdminPermissions,
  hasAdminPermission,
  permissionDeniedMessage,
  redirectWhenSignedOut,
  requiredPermissionForPath,
  requireAdminSession,
  setStatus
} from "./auth.js";
import { renderAdminNavigation } from "./navigation.js";

const TOAST_SELECTOR = ".admin-data-status, .admin-form-status, .admin-loading";
const TOAST_ACTION_PATTERN = /儲存|上傳|刪除|送審|核准|退回|處理|更新|建立|匯入|還原|備份/;
let statusToastObserver = null;

function ensureToastRegion() {
  let region = document.querySelector(".admin-toast-region");
  if (region) return region;
  region = document.createElement("div");
  region.className = "admin-toast-region";
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "false");
  document.body.appendChild(region);
  return region;
}

function shouldToastStatus(element, message, type) {
  if (!message || element.hidden) return false;
  if (!["info", "success", "error"].includes(type)) return false;
  if (type === "info" && !TOAST_ACTION_PATTERN.test(message)) return false;
  return type !== "success" || TOAST_ACTION_PATTERN.test(message) || /已.+。?$/.test(message);
}

function showAdminToast(message, type = "info") {
  const region = ensureToastRegion();
  const toast = document.createElement("div");
  toast.className = "admin-toast";
  toast.dataset.status = type;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  const title = type === "success" ? "已完成" : type === "error" ? "操作失敗" : "處理中";
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  region.appendChild(toast);

  const timeout = type === "info" ? 2600 : 4600;
  window.setTimeout(() => {
    toast.classList.add("leaving");
    window.setTimeout(() => toast.remove(), 220);
  }, timeout);
}

function handleStatusElement(element) {
  const message = element.textContent.trim();
  const type = element.dataset.status || "info";
  const fingerprint = `${type}:${message}`;
  if (element.dataset.toastFingerprint === fingerprint) return;
  element.dataset.toastFingerprint = fingerprint;
  if (shouldToastStatus(element, message, type)) showAdminToast(message, type);
}

function initAdminStatusToasts() {
  if (statusToastObserver || !document.body) return;
  ensureToastRegion();

  document.querySelectorAll(TOAST_SELECTOR).forEach(handleStatusElement);
  statusToastObserver = new MutationObserver((mutations) => {
    const candidates = new Set();
    mutations.forEach((mutation) => {
      const target = mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
      if (!target) return;
      if (target.matches?.(TOAST_SELECTOR)) candidates.add(target);
      target.querySelectorAll?.(TOAST_SELECTOR).forEach((element) => candidates.add(element));
    });
    candidates.forEach(handleStatusElement);
  });
  statusToastObserver.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["data-status", "hidden"]
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminStatusToasts, { once: true });
} else {
  initAdminStatusToasts();
}

export async function bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady
}) {
  if (!ensureSupabaseConfigured(loading)) return null;

  const session = await requireAdminSession();
  if (!session) return null;
  let permissions = await getAdminPermissions();
  const isUserPermissionsBootstrapPath = window.location.pathname
    .replace(/\/index\.html$/, "")
    .replace(/\/$/, "") === "/admin/users";
  const isGovernanceInfoPath = window.location.pathname
    .replace(/\/index\.html$/, "")
    .replace(/\/$/, "") === "/admin/governance";
  const isReadableCmsDataPath = ["/admin/recruiting", "/admin/investor-data"].includes(
    window.location.pathname
      .replace(/\/index\.html$/, "")
      .replace(/\/$/, "")
  );

  if (!permissions?.role) {
    if (!isUserPermissionsBootstrapPath && !isGovernanceInfoPath && !isReadableCmsDataPath) {
      setStatus(loading, "此帳號尚未開通後台權限，請請 owner/admin 到 Supabase profiles 指派角色。", "error");
      return null;
    }

    permissions = {
      role: isUserPermissionsBootstrapPath ? "owner" : "viewer",
      can_manage_users: isUserPermissionsBootstrapPath,
      can_publish: isUserPermissionsBootstrapPath,
      can_review_publish: isUserPermissionsBootstrapPath,
      can_view_pages: true,
      can_edit_pages: isUserPermissionsBootstrapPath,
      can_delete_pages: isUserPermissionsBootstrapPath,
      can_view_articles: true,
      can_edit_articles: isUserPermissionsBootstrapPath,
      can_delete_articles: isUserPermissionsBootstrapPath,
      can_view_media: true,
      can_manage_media: isUserPermissionsBootstrapPath,
      can_delete_media: isUserPermissionsBootstrapPath,
      can_view_courses: true,
      can_edit_courses: isUserPermissionsBootstrapPath,
      can_delete_courses: isUserPermissionsBootstrapPath,
      can_view_recruiting: true,
      can_edit_recruiting: isUserPermissionsBootstrapPath,
      can_delete_recruiting: isUserPermissionsBootstrapPath,
      can_view_investor: true,
      can_edit_investor: isUserPermissionsBootstrapPath,
      can_delete_investor: isUserPermissionsBootstrapPath,
      can_view_analytics: isUserPermissionsBootstrapPath,
      can_export_analytics: isUserPermissionsBootstrapPath,
      can_view_content_health: true,
      can_manage_backups: isUserPermissionsBootstrapPath
    };
  }
  const requiredPermission = requiredPermissionForPath();
  if (requiredPermission && !hasAdminPermission(permissions, requiredPermission)) {
    setStatus(loading, permissionDeniedMessage(requiredPermission), "error");
    return null;
  }

  if (userEmail) {
    userEmail.textContent = session.user.email || "已登入";
  }
  if (userInitial) {
    userInitial.textContent = (session.user.email || "S").trim().charAt(0).toUpperCase();
  }
  document.body.dataset.adminRole = permissions.role || "viewer";
  document.body.dataset.canPublish = permissions.can_publish ? "true" : "false";
  document.body.dataset.canReviewPublish = permissions.can_review_publish ? "true" : "false";
  renderAdminNavigation(permissions);
  applyAdminPermissionUi(permissions);

  loading?.remove();
  if (shell) shell.hidden = false;
  redirectWhenSignedOut();
  onReady?.(session, permissions);
  return { session, permissions };
}

export function bindAdminLogout(logoutButton) {
  logoutButton?.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "登出中...";

    const { error } = await supabase.auth.signOut();
    if (error) {
      logoutButton.disabled = false;
      logoutButton.textContent = "登出";
      window.alert(`登出失敗：${error.message}`);
    }
  });
}

export function reportAdminBootError(loading, error) {
  setStatus(loading, `登入狀態檢查失敗：${error.message}`, "error");
}
