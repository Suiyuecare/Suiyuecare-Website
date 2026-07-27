const ownerEmail = "entrepreneur@suiyuecare.com";
const rebuildableTables = new Set(["articles", "care_stories", "expert_talks"]);

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function bearerToken(request) {
  const header = request.headers.authorization || "";
  return header.match(/^Bearer\s+(.+)$/i)?.[1] || "";
}

function requestBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body !== "string") return {};
  if (request.body.length > 10_000) {
    const error = new Error("Request body too large.");
    error.statusCode = 413;
    throw error;
  }
  try {
    return JSON.parse(request.body || "{}");
  } catch {
    const error = new Error("Invalid JSON body.");
    error.statusCode = 400;
    throw error;
  }
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    const error = new Error("Supabase server configuration is incomplete.");
    error.statusCode = 503;
    throw error;
  }
  return { url, key };
}

async function supabaseRequest(path, token, options = {}) {
  const { url, key } = supabaseConfig();
  const result = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  if (!result.ok) {
    const error = new Error(await result.text() || `Supabase request failed: ${result.status}`);
    error.statusCode = result.status === 401 ? 401 : 403;
    throw error;
  }
  return result.json();
}

async function verifyOwner(request) {
  const token = bearerToken(request);
  if (!token) {
    const error = new Error("請先登入後台。");
    error.statusCode = 401;
    throw error;
  }
  const user = await supabaseRequest("/auth/v1/user", token);
  const permissions = await supabaseRequest(
    "/rest/v1/rpc/get_current_admin_permissions",
    token,
    { method: "POST", body: "{}" }
  );
  const email = String(permissions?.email || user?.email || "").trim().toLowerCase();
  const canRebuild =
    permissions?.can_review_publish === true &&
    (permissions?.role === "owner" || email === ownerEmail);
  if (!canRebuild) {
    const error = new Error("只有執行長 Owner 可以重建公開內容。");
    error.statusCode = 403;
    throw error;
  }
  return { user, permissions };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const { user } = await verifyOwner(request);
    const body = requestBody(request);
    const entityTables = [
      body.entity_table,
      ...(Array.isArray(body.entity_tables) ? body.entity_tables : [])
    ].filter(Boolean);
    if (!entityTables.length || entityTables.some((table) => !rebuildableTables.has(table))) {
      json(response, 400, {
        error: "Only published articles, care stories, and master talks can trigger this rebuild."
      });
      return;
    }

    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!deployHookUrl) {
      json(response, 503, {
        error: "尚未設定 VERCEL_DEPLOY_HOOK_URL，內容已核准但無法自動重建。"
      });
      return;
    }

    const hookResponse = await fetch(deployHookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source: "cms-public-content",
        action: String(body.action || "approved").slice(0, 40),
        entity_tables: [...new Set(entityTables)],
        request_id: String(body.request_id || body.change_set_id || "").slice(0, 100),
        requested_by: user.id
      })
    });
    const raw = await hookResponse.text();
    let hookPayload = {};
    try {
      hookPayload = raw ? JSON.parse(raw) : {};
    } catch {
      hookPayload = { message: raw.slice(0, 500) };
    }
    if (!hookResponse.ok) {
      const error = new Error(
        hookPayload?.error?.message ||
        hookPayload?.message ||
        `Vercel Deploy Hook failed: ${hookResponse.status}`
      );
      error.statusCode = 502;
      throw error;
    }

    json(response, 202, {
      ok: true,
      status: "rebuild_queued",
      job: hookPayload?.job || hookPayload,
      entity_tables: [...new Set(entityTables)]
    });
  } catch (error) {
    console.error("Public content rebuild failed", error);
    json(response, error.statusCode || 500, {
      error: error.message || "公開內容重建失敗。"
    });
  }
};
