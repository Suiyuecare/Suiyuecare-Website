const { createClient } = require("@supabase/supabase-js");

const financeRosterSources = ["pptx_org_chart_20260728", "personnel_management"];
const financeProjectRef = "udtlppnrugmtzhigdsxo";
const financeSupabaseHost = `${financeProjectRef}.supabase.co`;
const financeRequestTimeoutMs = 10_000;

class SafeHttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Vary", "Authorization");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(payload));
}

function bearerToken(request) {
  const header = request.headers?.authorization || request.headers?.Authorization || "";
  return String(header).match(/^Bearer\s+([^\s]+)$/i)?.[1] || "";
}

function portalSupabaseClient(environment = process.env) {
  const url = environment.SUPABASE_URL || environment.VITE_SUPABASE_URL;
  const key = environment.VITE_SUPABASE_ANON_KEY || environment.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new SafeHttpError(503, "Portal profile service is not configured.");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function requirePortalUser(request, createPortalClient, environment) {
  const token = bearerToken(request);
  if (!token) {
    throw new SafeHttpError(401, "Portal session is required.");
  }

  const portalClient = createPortalClient(environment);
  const { data, error } = await portalClient.auth.getUser(token);
  const email = normalizeEmail(data?.user?.email);
  if (error || !data?.user || !email) {
    throw new SafeHttpError(401, "Portal session is invalid or expired.");
  }
  if (!isConfirmedGoogleUser(data.user, email)) {
    throw new SafeHttpError(403, "A confirmed Google identity is required.");
  }
  return { id: data.user.id, email };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isConfirmedGoogleUser(user, expectedEmail = normalizeEmail(user?.email)) {
  if (!user?.id || !expectedEmail || !user.email_confirmed_at) return false;
  const providerValues = new Set([
    user.app_metadata?.provider,
    ...(Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : []),
    ...(Array.isArray(user.identities) ? user.identities.map((identity) => identity?.provider) : [])
  ].filter(Boolean));
  if (!providerValues.has("google")) return false;

  if (!Array.isArray(user.identities) || user.identities.length === 0) return true;
  return user.identities.some((identity) =>
    identity?.provider === "google"
    && normalizeEmail(identity?.identity_data?.email) === expectedEmail
  );
}

function decodeJwtPayload(token) {
  const segments = String(token || "").split(".");
  if (segments.length !== 3) return null;
  try {
    const normalized = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function financeConfiguration(environment = process.env) {
  const rawUrl = environment.FINANCE_SOURCE_SUPABASE_URL;
  const key = environment.FINANCE_SOURCE_SECRET_KEY;
  if (!rawUrl || !key || Buffer.byteLength(key, "utf8") < 32) {
    throw new SafeHttpError(503, "Finance profile service is not configured.");
  }

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SafeHttpError(503, "Finance profile service is not configured.");
  }
  const localDevelopment = environment.NODE_ENV !== "production"
    && ["localhost", "127.0.0.1"].includes(url.hostname);
  const expectedProductionHost = url.protocol === "https:"
    && url.hostname === financeSupabaseHost
    && !url.port;
  if (
    url.username
    || url.password
    || (!expectedProductionHost && !(localDevelopment && url.protocol === "http:"))
  ) {
    throw new SafeHttpError(503, "Finance profile service is not configured.");
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";

  if (key.startsWith("sb_publishable_")) {
    throw new SafeHttpError(503, "Finance profile service is not configured.");
  }
  const isOpaqueSecret = key.startsWith("sb_secret_");
  const legacyClaims = isOpaqueSecret ? null : decodeJwtPayload(key);
  if (!isOpaqueSecret && legacyClaims?.role !== "service_role") {
    throw new SafeHttpError(503, "Finance profile service is not configured.");
  }
  const projectRef = localDevelopment
    ? ""
    : url.hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i)?.[1] || "";
  if (!localDevelopment && projectRef !== financeProjectRef) {
    throw new SafeHttpError(503, "Finance profile service is not configured.");
  }
  if (!isOpaqueSecret && legacyClaims?.ref && legacyClaims.ref !== projectRef) {
    throw new SafeHttpError(503, "Finance profile service is not configured.");
  }
  return { url, key, isOpaqueSecret };
}

function financeRequestHeaders(configuration) {
  return {
    Accept: "application/json",
    apikey: configuration.key,
    ...(configuration.isOpaqueSecret ? {} : { Authorization: `Bearer ${configuration.key}` })
  };
}

function financeProfileUrl(configuration, email) {
  const url = new URL("rest/v1/finance_users", configuration.url);
  url.searchParams.set(
    "select",
    "id,name,email,job_title,department_code,active,org_status,org_source"
  );
  url.searchParams.set("email", `eq.${email}`);
  url.searchParams.set("active", "eq.true");
  url.searchParams.set("org_status", "eq.active");
  url.searchParams.set("org_source", `in.(${financeRosterSources.join(",")})`);
  url.searchParams.set("limit", "2");
  return url;
}

function safeText(value, maximumLength) {
  const text = String(value || "").trim();
  return text && text.length <= maximumLength ? text : "";
}

function projectSafeProfile(rows, expectedEmail) {
  if (!Array.isArray(rows)) {
    throw new SafeHttpError(502, "Finance profile source returned an invalid response.");
  }
  if (rows.length === 0) {
    throw new SafeHttpError(403, "This account is not an active Finance employee profile.");
  }
  if (rows.length !== 1) {
    throw new SafeHttpError(502, "Finance profile source returned an ambiguous response.");
  }

  const row = rows[0];
  const email = normalizeEmail(row?.email);
  const displayName = safeText(row?.name, 160);
  const jobTitle = safeText(row?.job_title, 160);
  const departmentCode = safeText(row?.department_code, 64);
  const valid = safeText(row?.id, 80)
    && email === expectedEmail
    && displayName
    && jobTitle
    && /^[A-Za-z0-9_-]+$/.test(departmentCode)
    && row?.active === true
    && row?.org_status === "active"
    && financeRosterSources.includes(row?.org_source);
  if (!valid) {
    throw new SafeHttpError(502, "Finance profile source returned an invalid employee profile.");
  }

  // Deliberately omit Finance role, approval, supervisor and Auth identifiers.
  // The public profile response only proves that the signed-in person may reach APM.
  return {
    source: "finance-apm-self",
    email,
    displayName,
    jobTitle,
    departmentCode,
    allowedModules: ["apm"]
  };
}

async function lookupFinanceProfile(email, environment, fetchImplementation) {
  const configuration = financeConfiguration(environment);
  let upstream;
  try {
    upstream = await fetchImplementation(financeProfileUrl(configuration, email), {
      method: "GET",
      headers: financeRequestHeaders(configuration),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(financeRequestTimeoutMs)
    });
  } catch {
    throw new SafeHttpError(503, "Finance profile service is temporarily unavailable.");
  }
  if (!upstream.ok) {
    throw new SafeHttpError(
      upstream.status === 429 ? 429 : 503,
      upstream.status === 429
        ? "Finance profile service is busy."
        : "Finance profile service is temporarily unavailable."
    );
  }

  let rows;
  try {
    rows = await upstream.json();
  } catch {
    throw new SafeHttpError(502, "Finance profile source returned an invalid response.");
  }
  return projectSafeProfile(rows, email);
}

function createPortalFinanceProfileHandler(dependencies = {}) {
  const environment = dependencies.environment || process.env;
  const createPortalClient = dependencies.createPortalClient || portalSupabaseClient;
  const fetchImplementation = dependencies.fetchImplementation || fetch;

  return async function handler(request, response) {
    if (request.method !== "GET") {
      response.setHeader("Allow", "GET");
      return json(response, 405, { ok: false, message: "Method not allowed" });
    }

    try {
      const user = await requirePortalUser(request, createPortalClient, environment);
      const profile = await lookupFinanceProfile(user.email, environment, fetchImplementation);
      return json(response, 200, { ok: true, profile });
    } catch (error) {
      const safeError = error instanceof SafeHttpError
        ? error
        : new SafeHttpError(500, "Unable to load the Portal employee profile.");
      return json(response, safeError.statusCode, {
        ok: false,
        message: safeError.message
      });
    }
  };
}

const handler = createPortalFinanceProfileHandler();

module.exports = handler;
module.exports.createPortalFinanceProfileHandler = createPortalFinanceProfileHandler;
module.exports.financeConfiguration = financeConfiguration;
module.exports.financeRequestHeaders = financeRequestHeaders;
module.exports.isConfirmedGoogleUser = isConfirmedGoogleUser;
module.exports.lookupFinanceProfile = lookupFinanceProfile;
module.exports.projectSafeProfile = projectSafeProfile;
