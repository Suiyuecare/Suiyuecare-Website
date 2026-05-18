import { supabase } from "../lib/supabaseClient.js";
import {
  ADMIN_HOME_PATH,
  ensureSupabaseConfigured,
  getCurrentSession,
  redirectWhenSignedIn,
  setStatus
} from "./auth.js";

const form = document.querySelector("#adminLoginForm");
const status = document.querySelector("#loginStatus");
const quickLoginButton = document.querySelector("#adminQuickLoginButton");

async function bootLoginPage() {
  if (!ensureSupabaseConfigured(status)) {
    form?.querySelector("button")?.setAttribute("disabled", "true");
    return;
  }

  const session = await getCurrentSession();
  if (session) {
    window.location.replace(ADMIN_HOME_PATH);
    return;
  }

  redirectWhenSignedIn();
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!ensureSupabaseConfigured(status)) return;

  const submitButton = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  submitButton.disabled = true;
  setStatus(status, "正在登入...", "info");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    submitButton.disabled = false;
    setStatus(status, `登入失敗：${error.message}`, "error");
    return;
  }

  setStatus(status, "登入成功，正在前往後台...", "success");
  window.location.replace(ADMIN_HOME_PATH);
});

quickLoginButton?.addEventListener("click", async () => {
  if (!form || !ensureSupabaseConfigured(status)) return;

  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    setStatus(status, "請先輸入 Email，再寄送快速登入連結。", "error");
    form.querySelector('input[name="email"]')?.focus();
    return;
  }

  quickLoginButton.disabled = true;
  setStatus(status, "正在寄送快速登入連結...", "info");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}${ADMIN_HOME_PATH}`
    }
  });

  quickLoginButton.disabled = false;

  if (error) {
    setStatus(status, `快速登入寄送失敗：${error.message}`, "error");
    return;
  }

  setStatus(status, "快速登入連結已寄出，請到信箱點擊連結進入後台。", "success");
});

bootLoginPage().catch((error) => {
  setStatus(status, `登入狀態檢查失敗：${error.message}`, "error");
});
