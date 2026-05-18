import { hasSupabaseConfig, supabase } from "../lib/supabaseClient.js";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";

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
