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
