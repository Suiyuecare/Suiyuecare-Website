import { supabase } from "../lib/supabaseClient.js";
import { ensureSupabaseConfigured, redirectWhenSignedOut, requireAdminSession, setStatus } from "./auth.js";

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

  if (userEmail) {
    userEmail.textContent = session.user.email || "已登入";
  }
  if (userInitial) {
    userInitial.textContent = (session.user.email || "S").trim().charAt(0).toUpperCase();
  }

  loading?.remove();
  if (shell) shell.hidden = false;
  redirectWhenSignedOut();
  onReady?.(session);
  return session;
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
