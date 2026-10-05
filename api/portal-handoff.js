const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const {
  isSignedModule,
  normalizeEmail,
  staticPortalGrantAllows
} = require("../server/portal-module-policy.js");
const {
  createPortalFinanceProfileHandler,
  isConfirmedGoogleUser,
  lookupFinanceProfile,
  preferredGoogleIdentityEmail
} = require("../server/portal-finance-profile.js");

const apmOrigin = "https://apm.suiyuecare.com";
const daycareOrigin = "https://daycare.suiyuecare.com";
const apmWorkspacePaths = [
  "/approvals",
  "/calendar",
  "/dashboard",
  "/department",
  "/journal",
  "/kpi",
  "/notifications",
  "/projects",
  "/settings",
  "/surveys",
  "/tasks"
];

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

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    if (body.length > 10_000) {
      throw new SafeHttpError(413, "Payload is too large.");
    }
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      throw new SafeHttpError(400, "Payload is not valid JSON.");
    }
  }
  return typeof body === "object" && !Array.isArray(body) ? body : {};
}

function getSupabaseClient(environment = process.env, token = '') {
  const supabaseUrl = environment.SUPABASE_URL || environment.VITE_SUPABASE_URL;
  const publishableKey = environment.VITE_SUPABASE_ANON_KEY || environment.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new SafeHttpError(503, "Portal authentication is not configured.");
  }

  return createClient(supabaseUrl, publishableKey, {
    global: {headers: token ? {Authorization:`Bearer ${token}`} : {}},
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

function bearerToken(request) {
  const header = request.headers?.authorization || request.headers?.Authorization || "";
  return String(header).match(/^Bearer\s+([^\s]+)$/i)?.[1] || "";
}

async function requireUser(request, createPortalClient, environment) {
  const token = bearerToken(request);
  if (!token) {
    throw new SafeHttpError(401, "Portal session is required.");
  }

  const supabase = createPortalClient(environment, token);
  const { data, error } = await supabase.auth.getUser(token);
  const email = preferredGoogleIdentityEmail(data?.user);
  if (error || !data?.user || !email) {
    throw new SafeHttpError(401, "Portal session is invalid or expired.");
  }
  if (!isConfirmedGoogleUser(data.user, email)) {
    throw new SafeHttpError(403, "A confirmed Google identity is required.");
  }
  const active = await supabase.rpc('portal_session_status');
  if(active.error || active.data?.active!==true || active.data?.userId!==data.user.id) throw new SafeHttpError(401,'Portal session is no longer active.');
  return { ...data.user, email };
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signPayload(payload, moduleId, environment = process.env) {
  const secret = moduleId === "hr" ? environment.HR_PORTAL_SIGNING_SECRET
    : moduleId === "apm" ? environment.APM_PORTAL_SIGNING_SECRET
    : moduleId === "day-care" ? environment.PORTAL_DAYCARE_HANDOFF_SECRET
    : environment.PORTAL_HANDOFF_SIGNING_SECRET || environment.EDOC_PORTAL_HANDOFF_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new SafeHttpError(503, "Module handoff is not securely configured.");
  }

  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return {
    payload: encodedPayload,
    signature,
    token: `${encodedPayload}.${signature}`
  };
}

function normalizeApmReturnTo(rawReturnTo) {
  const candidate = String(rawReturnTo || "/tasks").trim();
  if (
    !candidate.startsWith("/")
    || candidate.startsWith("//")
    || candidate.includes("\\")
    || candidate.length > 512
    || /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    throw new SafeHttpError(400, "敏捷專案管理系統返回路徑無效。");
  }
  const url = new URL(candidate, apmOrigin);
  const allowed = url.origin === apmOrigin
    && !url.hash
    && apmWorkspacePaths.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));
  if (!allowed) {
    throw new SafeHttpError(400, "敏捷專案管理系統返回路徑不在允許清單內。");
  }
  return `${url.pathname}${url.search}`;
}

function normalizeDaycareReturnTo(rawReturnTo) {
  if (rawReturnTo != null && typeof rawReturnTo !== "string") {
    throw new SafeHttpError(400, "日間照顧系統返回路徑格式無效。");
  }
  const candidate = String(rawReturnTo || "/app").trim();
  if (
    !candidate.startsWith("/")
    || candidate.startsWith("//")
    || candidate.includes("\\")
    || candidate.length > 512
    || /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    throw new SafeHttpError(400, "日間照顧系統返回路徑無效。");
  }
  const url = new URL(candidate, daycareOrigin);
  if (
    url.origin !== daycareOrigin
    || url.hash
    || /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(url.pathname)
    || (url.pathname !== "/app" && !url.pathname.startsWith("/app/"))
  ) {
    throw new SafeHttpError(400, "日間照顧系統返回路徑不在允許清單內。");
  }
  return `${url.pathname}${url.search}`;
}

function confirmedGoogleSubject(user) {
  const matches = Array.isArray(user?.identities)
    ? user.identities.filter((identity) =>
      identity?.provider === "google"
      && identity.identity_data?.email_verified === true
      && normalizeEmail(identity.identity_data?.email) === user.email
    )
    : [];
  if (matches.length !== 1) {
    throw new SafeHttpError(403, "A unique confirmed Google identity is required.");
  }
  const identity = matches[0];
  const subject = identity.identity_data?.sub;
  const providerSubject = identity.provider_id || identity.id;
  if (
    typeof subject !== "string"
    || !/^[A-Za-z0-9_-]{8,255}$/.test(subject)
    || (providerSubject !== undefined && providerSubject !== subject)
  ) {
    throw new SafeHttpError(403, "A consistent Google identity is required.");
  }
  return subject;
}

async function authorizeModule(moduleId, email, dependencies) {
  if (!isSignedModule(moduleId)) {
    throw new SafeHttpError(400, "Module is not allowed for Portal handoff.");
  }
  // HR independently requires an existing exact Google identity and fresh
  // server-owned employer membership before it can create a session.
  if(moduleId==='hr')return 'hr-current-membership';
  // Daycare is limited to its explicitly launched staff. Finance membership
  // alone must never grant access to sensitive care records.
  if (moduleId === "day-care" && !staticPortalGrantAllows(email, moduleId)) {
    throw new SafeHttpError(403, "This account is not authorized for Daycare.");
  }
  if (staticPortalGrantAllows(email, moduleId)) {
    return "portal-static-roster";
  }
  // Revalidate the active Finance employee for every signed handoff. Portal
  // profiles and browser permission overrides never authorize the destination.
  const profile = await dependencies.financeLookup(email, dependencies.environment, dependencies.fetchImplementation);
  if (profile?.source !== "finance-portal-self"
    || normalizeEmail(profile.email) !== email
    || !Array.isArray(profile.allowedModules)
    || !profile.allowedModules.includes(moduleId)) {
    throw new SafeHttpError(403, "This account is not authorized for this module.");
  }
  return "finance-portal-self";
}

function normalizePayload(rawPayload, user, moduleId, issuedAt, randomUUID) {
  const payload = rawPayload && typeof rawPayload === "object" ? rawPayload : {};
  const claimedEmail = normalizeEmail(payload.email);
  if (claimedEmail && claimedEmail !== user.email) {
    throw new SafeHttpError(403, "Payload email does not match Portal session.");
  }

  const commonIdentity = {
    email: user.email,
    iat: issuedAt,
    exp: issuedAt + 10 * 60,
    jti: randomUUID()
  };
  if(moduleId==='hr'){
    const google=(user.identities||[]).filter(identity=>identity.provider==='google'&&identity.identity_data?.email_verified===true&&normalizeEmail(identity.identity_data?.email)===user.email&&typeof identity.identity_data?.sub==='string');
    if(google.length!==1 || !google[0].identity_data.sub || google[0].identity_data.sub.length>256)throw new SafeHttpError(403,'A unique confirmed Google identity is required.');
    return {...commonIdentity,exp:issuedAt+60,aud:'hr',source:'logging-portal',googleSubject:google[0].identity_data.sub};
  }
  if (moduleId === "apm") {
    return {
      ...commonIdentity,
      aud: "apm",
      returnTo: normalizeApmReturnTo(payload.returnTo)
    };
  }
  if (moduleId === "day-care") {
    return {
      ...commonIdentity,
      aud: "daycare",
      googleSub: confirmedGoogleSubject(user),
      returnTo: normalizeDaycareReturnTo(payload.returnTo)
    };
  }

  // EDOC receives only server-verified identity. It resolves role, department,
  // approval scope and permissions from its Finance snapshot; no browser field
  // is copied into the signed assertion.
  return {
    ...commonIdentity,
    source: "logging-portal",
    aud: "edoc",
    moduleId: "edoc",
    authUserId: user.id
  };
}

function createPortalHandoffHandler(dependencies = {}) {
  const environment = dependencies.environment || process.env;
  const createPortalClient = dependencies.createPortalClient || getSupabaseClient;
  const fetchImplementation = dependencies.fetchImplementation || fetch;
  const financeLookup = dependencies.financeLookup || lookupFinanceProfile;
  const now = dependencies.now || (() => Date.now());
  const randomUUID = dependencies.randomUUID || crypto.randomUUID;

  return async function handler(request, response) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return json(response, 405, { ok: false, message: "Method not allowed" });
    }

    try {
      const user = await requireUser(request, createPortalClient, environment);
      const body = parseBody(request.body);
      const rawPayload = body?.payload;
      const moduleId = String(rawPayload?.moduleId || "").trim();
      await authorizeModule(moduleId, user.email, {
        environment,
        fetchImplementation,
        financeLookup
      });
      const payload = normalizePayload(
        rawPayload,
        user,
        moduleId,
        Math.floor(now() / 1000),
        randomUUID
      );
      return json(response, 200, {
        ok: true,
        ...signPayload(payload, moduleId, environment)
      });
    } catch (error) {
      const safeError = error?.statusCode
        ? error
        : new SafeHttpError(500, "Unable to create Portal handoff.");
      return json(response, safeError.statusCode, {
        ok: false,
        message: safeError.message
      });
    }
  };
}

function createPortalApiHandler(dependencies = {}) {
  const financeProfileHandler = createPortalFinanceProfileHandler(dependencies);
  const handoffHandler = createPortalHandoffHandler(dependencies);
  const logoutHandler = require('../server/portal-logout.js').createPortalLogoutHandler(dependencies);

  return async function handler(request, response) {
    if (request.query?.action === 'logout' || new URL(request.url || '/', 'https://login.suiyuecare.com').searchParams.get('action') === 'logout') {
      return logoutHandler(request, response);
    }
    if (request.method === "GET") {
      return financeProfileHandler(request, response);
    }
    if (request.method === "POST") {
      return handoffHandler(request, response);
    }

    response.setHeader("Allow", "GET, POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  };
}

const handler = createPortalApiHandler();

module.exports = handler;
module.exports.authorizeModule = authorizeModule;
module.exports.createPortalApiHandler = createPortalApiHandler;
module.exports.createPortalHandoffHandler = createPortalHandoffHandler;
module.exports.normalizeApmReturnTo = normalizeApmReturnTo;
module.exports.normalizeDaycareReturnTo = normalizeDaycareReturnTo;
module.exports.normalizePayload = normalizePayload;
