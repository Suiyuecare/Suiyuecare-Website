function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

const ANALYTICS_RATE_LIMIT_WINDOW_MS = Number(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS || 5 * 60 * 1000);
const ANALYTICS_RATE_LIMIT_MAX_PER_IP = Number(process.env.ANALYTICS_RATE_LIMIT_MAX_PER_IP || 240);
const ANALYTICS_RATE_LIMIT_MAX_PER_SESSION = Number(process.env.ANALYTICS_RATE_LIMIT_MAX_PER_SESSION || 120);
const analyticsRateLimitStore = globalThis.__suiyuecareAnalyticsRateLimitStore || new Map();
globalThis.__suiyuecareAnalyticsRateLimitStore = analyticsRateLimitStore;

const allowedEventTypes = new Set([
  "page_engagement",
  "frontend_error",
  "error_404",
  "error_500",
  "phone_click",
  "email_click",
  "line_click",
  "join_line_click",
  "google_maps_click",
  "pdf_download",
  "cta_click",
  "reservation_click",
  "form_submit"
]);

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitize(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 20)
      .map(([key, item]) => {
        if (typeof item === "string") return [sanitize(key, 80), sanitize(item, 500)];
        if (typeof item === "number") return [sanitize(key, 80), normalizeNumber(item)];
        if (typeof item === "boolean") return [sanitize(key, 80), item];
        return [sanitize(key, 80), sanitize(JSON.stringify(item || null), 500)];
      })
      .filter(([key]) => key)
  );
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildAnalyticsPayload(body = {}) {
  const eventType = sanitize(body.event_type, 80);
  const pagePath = sanitize(body.page_path, 500);
  const basePayload = {
    session_id: sanitize(body.session_id, 160),
    visitor_id: sanitize(body.visitor_id, 160),
    source: sanitize(body.source || "direct", 120),
    medium: sanitize(body.medium || "none", 120),
    campaign: sanitize(body.campaign, 180),
    metadata: normalizeMetadata(body.metadata)
  };

  if (body.type === "page_view") {
    return {
      table: "analytics_page_views",
      payload: {
        ...basePayload,
        page_path: pagePath,
        page_title: sanitize(body.page_title, 300),
        referrer: sanitize(body.referrer, 800),
        device_type: sanitize(body.device_type, 40),
        browser_language: sanitize(body.browser_language, 80),
        user_agent: sanitize(body.user_agent || body.metadata?.user_agent, 500),
        duration_seconds: normalizeNumber(body.duration_seconds),
        is_bounce: Boolean(body.is_bounce)
      }
    };
  }

  return {
    table: "analytics_events",
    payload: {
      ...basePayload,
      event_type: eventType,
      event_label: sanitize(body.event_label, 240),
      page_path: pagePath,
      target_url: sanitize(body.target_url, 800),
      value: normalizeNumber(body.value)
    }
  };
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    if (body.length > 25_000) {
      throw createHttpError(413, "Analytics payload is too large.");
    }
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function headerValue(request, name) {
  const lowerName = name.toLowerCase();
  const value = request.headers?.[lowerName] || request.headers?.[name] || "";
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

function hostnameFromUrl(value = "") {
  if (!value) return "";
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function requestHost(request) {
  return (headerValue(request, "x-forwarded-host") || headerValue(request, "host")).split(":")[0].toLowerCase();
}

function allowedPublicApiHosts(request) {
  const envHosts = String(process.env.PUBLIC_API_ALLOWED_ORIGINS || process.env.ALLOWED_PUBLIC_API_ORIGINS || "")
    .split(",")
    .map((item) => hostnameFromUrl(item.trim()) || item.trim().toLowerCase())
    .filter(Boolean);
  return new Set([
    "suiyuecare.com",
    "www.suiyuecare.com",
    "login.suiyuecare.com",
    "localhost",
    "127.0.0.1",
    requestHost(request),
    ...envHosts
  ].filter(Boolean));
}

function enforceAllowedPublicOrigin(request) {
  const originHost = hostnameFromUrl(headerValue(request, "origin"));
  const refererHost = hostnameFromUrl(headerValue(request, "referer"));
  const sourceHost = originHost || refererHost;
  if (!sourceHost) {
    throw createHttpError(403, "Unsupported request source.");
  }
  if (!allowedPublicApiHosts(request).has(sourceHost)) {
    throw createHttpError(403, "Unsupported request source.");
  }
}

function clientIp(request) {
  const forwarded = headerValue(request, "x-forwarded-for").split(",")[0]?.trim();
  return forwarded || headerValue(request, "x-real-ip") || request.socket?.remoteAddress || "unknown";
}

function rateLimitExceeded(key, max, now = Date.now()) {
  if (!key || max <= 0) return false;
  if (analyticsRateLimitStore.size > 1200) {
    for (const [entryKey, entry] of analyticsRateLimitStore.entries()) {
      if (!entry || entry.resetAt <= now) analyticsRateLimitStore.delete(entryKey);
    }
  }

  const existing = analyticsRateLimitStore.get(key);
  if (!existing || existing.resetAt <= now) {
    analyticsRateLimitStore.set(key, { count: 1, resetAt: now + ANALYTICS_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > max;
}

function enforceRateLimit(request, payload) {
  const ip = clientIp(request);
  const checks = [
    [`ip:${ip}`, ANALYTICS_RATE_LIMIT_MAX_PER_IP],
    payload.session_id ? [`session:${payload.session_id}`, ANALYTICS_RATE_LIMIT_MAX_PER_SESSION] : null
  ].filter(Boolean);

  if (checks.some(([key, max]) => rateLimitExceeded(key, max))) {
    throw createHttpError(429, "Analytics rate limit exceeded.");
  }
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

function supabaseApiKey() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  const servicePayload = decodeJwtPayload(serviceKey);
  if (servicePayload?.role === "service_role" && servicePayload?.ref === projectRefFromSupabaseUrl(supabaseUrl)) {
    return serviceKey;
  }
  return publicKey;
}

async function insertAnalyticsRow(table, payload) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = supabaseApiKey();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Server is missing SUPABASE_URL/VITE_SUPABASE_URL or a usable Supabase API key.");
  }
  if (!["analytics_page_views", "analytics_events"].includes(table)) {
    throw createHttpError(400, "Unsupported analytics table.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase analytics write failed: ${message}`);
  }

  return null;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    enforceAllowedPublicOrigin(request);
    const body = parseBody(request.body);
    const { table, payload } = buildAnalyticsPayload(body);
    if (!payload.session_id || !payload.visitor_id) {
      return json(response, 400, { ok: false, message: "Missing analytics session." });
    }
    if (table === "analytics_page_views" && !payload.page_path) {
      return json(response, 400, { ok: false, message: "Missing page path." });
    }
    if (table === "analytics_events" && !payload.event_type) {
      return json(response, 400, { ok: false, message: "Missing event type." });
    }
    if (table === "analytics_events" && !allowedEventTypes.has(payload.event_type)) {
      return json(response, 400, { ok: false, message: "Unsupported analytics event type." });
    }
    enforceRateLimit(request, payload);

    await insertAnalyticsRow(table, payload);
    return json(response, 200, { ok: true });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error(error);
    } else {
      console.warn(`Analytics request rejected: ${error.message}`);
    }
    return json(response, statusCode, {
      ok: false,
      message: statusCode >= 500 ? "Analytics write failed." : error.message
    });
  }
};
