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
  const permissions = await getAdminPermissions();
  if (!permissions?.role) {
    setStatus(loading, "此帳號尚未開通後台權限，請請 owner/admin 到 Supabase profiles 指派角色。", "error");
    return null;
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
