function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function sanitize(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildAnalyticsPayload(body = {}) {
  const eventType = sanitize(body.event_type, 80);
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
      rpc: "track_page_view",
      payload: {
        ...basePayload,
        page_path: sanitize(body.page_path || "#unknown", 500),
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
    rpc: "track_analytics_event",
    payload: {
      ...basePayload,
      event_type: eventType || "unknown",
      event_label: sanitize(body.event_label, 240),
      page_path: sanitize(body.page_path, 500),
      target_url: sanitize(body.target_url, 800),
      value: normalizeNumber(body.value)
    }
  };
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

async function callSupabaseRpc(rpc, payload) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Server is missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpc}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ payload })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase analytics write failed: ${message}`);
  }

  return response.json();
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    const body = parseBody(request.body);
    const { rpc, payload } = buildAnalyticsPayload(body);
    if (!payload.session_id || !payload.visitor_id) {
      return json(response, 400, { ok: false, message: "Missing analytics session." });
    }
    if (rpc === "track_page_view" && !payload.page_path) {
      return json(response, 400, { ok: false, message: "Missing page path." });
    }
    if (rpc === "track_analytics_event" && !payload.event_type) {
      return json(response, 400, { ok: false, message: "Missing event type." });
    }

    const id = await callSupabaseRpc(rpc, payload);
    return json(response, 200, { ok: true, id });
  } catch (error) {
    console.error(error);
    return json(response, 500, { ok: false, message: error.message || "Analytics write failed." });
  }
};
