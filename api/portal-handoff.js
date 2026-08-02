const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const {
  isSignedModule,
  normalizeEmail,
  staticPortalGrantAllows
} = require("../server/portal-module-policy.js");
const {
  isConfirmedGoogleUser,
  lookupFinanceProfile
} = require("./portal-finance-profile.js");

const apmOrigin = "https://apm.suiyuecare.com";
const apmWorkspacePaths = [
  "/approvals",
  "/calendar",
  "/dashboard",
  "/department",
  "/kpi",
  "/notifications",
  "/projects",
  "/settings",
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

function getSupabaseClient(environment = process.env) {
  const supabaseUrl = environment.SUPABASE_URL || environment.VITE_SUPABASE_URL;
  const publishableKey = environment.VITE_SUPABASE_ANON_KEY || environment.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new SafeHttpError(503, "Portal authentication is not configured.");
  }

  return createClient(supabaseUrl, publishableKey, {
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

  const supabase = createPortalClient(environment);
  const { data, error } = await supabase.auth.getUser(token);
  const email = normalizeEmail(data?.user?.email);
  if (error || !data?.user || !email) {
    throw new SafeHttpError(401, "Portal session is invalid or expired.");
  }
  if (!isConfirmedGoogleUser(data.user, email)) {
    throw new SafeHttpError(403, "A confirmed Google identity is required.");
  }
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
  const secret = moduleId === "apm"
    ? environment.APM_PORTAL_SIGNING_SECRET
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
  const candidate = String(rawReturnTo || "/dashboard").trim();
  if (
    !candidate.startsWith("/")
    || candidate.startsWith("//")
    || candidate.includes("\\")
    || candidate.length > 512
    || /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    throw new SafeHttpError(400, "APM return path is invalid.");
  }
  const url = new URL(candidate, apmOrigin);
  const allowed = url.origin === apmOrigin
    && !url.hash
    && apmWorkspacePaths.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));
  if (!allowed) {
    throw new SafeHttpError(400, "APM return path is not allowed.");
  }
  return `${url.pathname}${url.search}`;
}

async function authorizeModule(moduleId, email, dependencies) {
  if (!isSignedModule(moduleId)) {
    throw new SafeHttpError(400, "Module is not allowed for Portal handoff.");
  }
  if (staticPortalGrantAllows(email, moduleId)) {
    return "portal-static-roster";
  }
  if (moduleId !== "apm") {
    throw new SafeHttpError(403, "This account is not authorized for this module.");
  }

  // Finance fallback identities are deliberately APM-only. Re-run the exact,
  // server-side self lookup here so a caller cannot skip the Portal UI check.
  await dependencies.financeLookup(email, dependencies.environment, dependencies.fetchImplementation);
  return "finance-apm-self";
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
  if (moduleId === "apm") {
    return {
      ...commonIdentity,
      aud: "apm",
      returnTo: normalizeApmReturnTo(payload.returnTo)
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

const handler = createPortalHandoffHandler();

module.exports = handler;
module.exports.authorizeModule = authorizeModule;
module.exports.createPortalHandoffHandler = createPortalHandoffHandler;
module.exports.normalizeApmReturnTo = normalizeApmReturnTo;
module.exports.normalizePayload = normalizePayload;
