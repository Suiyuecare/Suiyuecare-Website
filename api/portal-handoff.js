const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const allowedModules = new Set(["accounting", "edoc", "website-backoffice"]);

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    if (body.length > 10_000) {
      const error = new Error("Payload is too large.");
      error.statusCode = 413;
      throw error;
    }
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing Supabase public configuration.");
  }

  return createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function bearerToken(request) {
  const header = request.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

async function requireUser(request) {
  const token = bearerToken(request);
  if (!token) {
    const error = new Error("Missing bearer token.");
    error.statusCode = 401;
    throw error;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    const authError = new Error(error?.message || "Invalid Portal session.");
    authError.statusCode = 401;
    throw authError;
  }
  return data.user;
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signPayload(payload) {
  const secret = process.env.PORTAL_HANDOFF_SIGNING_SECRET || process.env.EDOC_PORTAL_HANDOFF_SECRET;
  if (!secret) {
    const error = new Error("Missing PORTAL_HANDOFF_SIGNING_SECRET.");
    error.statusCode = 503;
    throw error;
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

function normalizePayload(rawPayload, user) {
  const payload = rawPayload && typeof rawPayload === "object" ? rawPayload : {};
  const email = String(payload.email || "").trim().toLowerCase();
  const userEmail = String(user.email || "").trim().toLowerCase();
  if (!email || email !== userEmail) {
    const error = new Error("Payload email does not match Portal session.");
    error.statusCode = 403;
    throw error;
  }

  const moduleId = String(payload.moduleId || "").trim();
  if (!allowedModules.has(moduleId)) {
    const error = new Error("Module is not allowed for Portal handoff.");
    error.statusCode = 400;
    throw error;
  }

  const now = Math.floor(Date.now() / 1000);
  return {
    ...payload,
    source: "logging-portal",
    email,
    authUserId: user.id,
    iat: now,
    exp: now + 10 * 60
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    const user = await requireUser(request);
    const body = parseBody(request.body);
    const payload = normalizePayload(body.payload, user);
    return json(response, 200, {
      ok: true,
      ...signPayload(payload)
    });
  } catch (error) {
    return json(response, error.statusCode || 500, {
      ok: false,
      message: error.message || "Unable to create Portal handoff."
    });
  }
};
