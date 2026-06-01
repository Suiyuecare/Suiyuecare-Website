function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function maskedEmail(value = "") {
  const text = String(value || "");
  if (!text.includes("@")) return text ? "configured" : "";
  const [name, domain] = text.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
}

function decodeJwtPayload(token = "") {
  const parts = String(token || "").split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function projectRefFromSupabaseUrl(url = "") {
  const match = String(url || "").match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match?.[1] || "";
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  const recipients = {
    contact: process.env.CONTACT_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
    course_signup: process.env.COURSE_NOTIFY_EMAIL || "edu.control@suiyuecare.com",
    investor: process.env.INVESTOR_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
    land: process.env.LAND_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
    recruiting: process.env.RECRUITING_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com"
  };

  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const hasMailFrom = Boolean(process.env.MAIL_FROM);
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceRolePayload = decodeJwtPayload(serviceRoleKey);
  const hasSupabaseUrl = Boolean(supabaseUrl);
  const hasServiceRoleKey = Boolean(serviceRoleKey);
  const serviceRoleLooksValid = serviceRolePayload?.role === "service_role";
  const supabaseProjectRef = projectRefFromSupabaseUrl(supabaseUrl);
  const serviceRoleProjectMatches = Boolean(serviceRoleLooksValid && serviceRolePayload?.ref === supabaseProjectRef);
  const hasPublicKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
  const canStoreForms = serviceRoleProjectMatches || hasPublicKey;
  const ready = hasResendKey && hasMailFrom && hasSupabaseUrl && canStoreForms;

  return json(response, ready ? 200 : 503, {
    ok: ready,
    provider: "resend",
    checks: {
      SUPABASE_URL: hasSupabaseUrl,
      VITE_SUPABASE_URL: Boolean(process.env.VITE_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: hasServiceRoleKey,
      SUPABASE_SERVICE_ROLE_KEY_ROLE: serviceRoleLooksValid ? "service_role" : serviceRolePayload?.role || "missing_or_invalid",
      SUPABASE_SERVICE_ROLE_KEY_PROJECT_MATCH: serviceRoleProjectMatches,
      FORM_PUBLIC_INTAKE_FALLBACK: hasPublicKey,
      RESEND_API_KEY: hasResendKey,
      MAIL_FROM: hasMailFrom,
      CONTACT_NOTIFY_EMAIL: Boolean(recipients.contact),
      COURSE_NOTIFY_EMAIL: Boolean(recipients.course_signup),
      INVESTOR_NOTIFY_EMAIL: Boolean(recipients.investor),
      LAND_NOTIFY_EMAIL: Boolean(recipients.land),
      RECRUITING_NOTIFY_EMAIL: Boolean(recipients.recruiting)
    },
    recipients: Object.fromEntries(Object.entries(recipients).map(([key, value]) => [key, maskedEmail(value)])),
    message: ready
      ? serviceRoleProjectMatches
        ? "Email provider and Supabase server credentials are configured."
        : "Email provider is configured. Supabase service role key project does not match the URL, so forms use the insert-only public intake fallback."
      : "Production API is not ready. Set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY, RESEND_API_KEY and MAIL_FROM in Vercel environment variables, then redeploy."
  });
};
