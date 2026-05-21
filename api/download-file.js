const DEFAULT_SUPABASE_URL = "https://ussnmxdpxeoshlrdchov.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_2Qzte6W7e6iAssOyTVRuZA__MNdKR1x";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

async function supabaseFetch(path, options = {}) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
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

  try {
    const fileResponse = await supabaseFetch(`/rest/v1/downloadable_files?id=eq.${encodeURIComponent(id)}&select=id,title,bucket,storage_path,file_name,is_enabled,is_public,status,published_at`);
    const files = await fileResponse.json();
    const file = files?.[0];
    const isPublished = file.status === "published" && (!file.published_at || new Date(file.published_at) <= new Date());
    if (!file || !file.is_enabled || !file.is_public || !isPublished || !file.storage_path || !file.bucket) {
      return sendJson(response, 404, { ok: false, message: "File not found." });
    }

    const signedResponse = await supabaseFetch(`/storage/v1/object/sign/${encodeURIComponent(file.bucket)}/${file.storage_path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: 120, download: file.file_name || true })
    });
    const signed = await signedResponse.json();
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const signedUrl = signed.signedURL?.startsWith("http") ? signed.signedURL : `${supabaseUrl}/storage/v1${signed.signedURL}`;
    response.statusCode = 302;
    response.setHeader("Location", signedUrl);
    response.setHeader("Cache-Control", "no-store");
    response.end();
  } catch (error) {
    console.error(error);
    return sendJson(response, 500, { ok: false, message: error.message || "Unable to create download link." });
  }
};
