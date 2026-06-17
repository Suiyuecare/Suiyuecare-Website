function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
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

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

function supabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function supabasePublicKey() {
  return process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
}

function serviceRoleProjectMatches() {
  const payload = decodeJwtPayload(supabaseServiceKey());
  return Boolean(payload?.role === "service_role" && payload?.ref === projectRefFromSupabaseUrl(supabaseUrl()));
}

function readableSupabaseKey() {
  return supabasePublicKey() || (serviceRoleProjectMatches() ? supabaseServiceKey() : "");
}

function serviceSupabaseKey() {
  return serviceRoleProjectMatches() ? supabaseServiceKey() : "";
}

function encodeStoragePath(path = "") {
  return String(path)
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function originFromRequest(request) {
  const proto = request.headers["x-forwarded-proto"] || "https";
  const host = request.headers["x-forwarded-host"] || request.headers.host || "www.suiyuecare.com";
  return `${proto}://${host}`;
}

function absoluteUrl(url = "", request) {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${originFromRequest(request)}${url}`;
  return url;
}

function allowedRedirectHosts(request) {
  const hosts = new Set();
  try {
    hosts.add(new URL(originFromRequest(request)).host);
  } catch {}
  try {
    hosts.add(new URL(supabaseUrl()).host);
  } catch {}
  hosts.add("www.suiyuecare.com");
  hosts.add("suiyuecare.com");
  return hosts;
}

function safeRedirectUrl(url = "", request) {
  const resolved = absoluteUrl(url, request);
  let parsed;
  try {
    parsed = new URL(resolved);
  } catch {
    const error = new Error("Unsupported download URL.");
    error.statusCode = 400;
    throw error;
  }

  if (!["http:", "https:"].includes(parsed.protocol) || !allowedRedirectHosts(request).has(parsed.host)) {
    const error = new Error("Unsupported download URL.");
    error.statusCode = 400;
    throw error;
  }

  return parsed.toString();
}

const PUBLIC_STORAGE_BUCKETS = new Set(["public-images", "article-covers", "page-heroes", "course-images", "job-images"]);

async function supabaseFetch(path, { key, ...options } = {}) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = key;
  if (!supabaseUrl || !supabaseKey) {
    const error = new Error("Download service is not configured.");
    error.statusCode = 503;
    throw error;
  }
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }
  return response;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { ok: false, message: "Method not allowed" });
  }

  const id = String(request.query?.id || "").trim();
  if (!id) return sendJson(response, 400, { ok: false, message: "Missing file id." });
  if (!/^[a-z0-9_-]{6,120}$/i.test(id)) {
    return sendJson(response, 400, { ok: false, message: "Invalid file id." });
  }

  try {
    const readKey = readableSupabaseKey();
    const fileResponse = await supabaseFetch(`/rest/v1/downloadable_files?id=eq.${encodeURIComponent(id)}&select=id,title,bucket,storage_path,public_url,file_name,is_enabled,is_public,status,published_at`, {
      key: readKey
    });
    const files = await fileResponse.json();
    const file = files?.[0];
    const isPublished = file.status === "published" && (!file.published_at || new Date(file.published_at) <= new Date());
    if (!file || !file.is_enabled || !file.is_public || !isPublished) {
      return sendJson(response, 404, { ok: false, message: "File not found." });
    }

    if (file.public_url && file.public_url !== "#contact") {
      response.statusCode = 302;
      response.setHeader("Location", safeRedirectUrl(file.public_url, request));
      response.setHeader("Cache-Control", "no-store");
      response.setHeader("X-Robots-Tag", "noindex, nofollow");
      response.end();
      return;
    }

    if (!file.storage_path || !file.bucket) {
      return sendJson(response, 404, { ok: false, message: "File not found." });
    }

    const encodedPath = encodeStoragePath(file.storage_path);
    if (PUBLIC_STORAGE_BUCKETS.has(file.bucket)) {
      const publicUrl = `${supabaseUrl()}/storage/v1/object/public/${encodeURIComponent(file.bucket)}/${encodedPath}`;
      response.statusCode = 302;
      response.setHeader("Location", publicUrl);
      response.setHeader("Cache-Control", "no-store");
      response.setHeader("X-Robots-Tag", "noindex, nofollow");
      response.end();
      return;
    }

    const serviceKey = serviceSupabaseKey();
    if (!serviceKey) {
      const error = new Error("Private download signing is not configured.");
      error.statusCode = 503;
      throw error;
    }

    const signedResponse = await supabaseFetch(`/storage/v1/object/sign/${encodeURIComponent(file.bucket)}/${encodedPath}`, {
      key: serviceKey,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: 120, download: file.file_name || true })
    });
    const signed = await signedResponse.json();
    const signedUrl = signed.signedURL?.startsWith("http") ? signed.signedURL : `${supabaseUrl()}/storage/v1${signed.signedURL}`;
    response.statusCode = 302;
    response.setHeader("Location", signedUrl);
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Robots-Tag", "noindex, nofollow");
    response.end();
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error(error);
    else console.warn(`Download request rejected: ${error.message}`);
    return sendJson(response, statusCode, {
      ok: false,
      message: statusCode >= 500 ? "Unable to create download link." : error.message || "Unable to create download link.",
      setupRequired: statusCode === 503
    });
  }
};
