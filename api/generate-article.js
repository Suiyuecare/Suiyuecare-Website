function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

const ownerEmail = "entrepreneur@suiyuecare.com";

function sanitize(value, maxLength = 4000) {
  return String(value || "").trim().slice(0, maxLength);
}

function sanitizeArticleHtml(value) {
  const allowedTags = new Set(["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "br"]);
  return sanitize(value, 12000)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|textarea|select|option)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|input|button|textarea|select|option)\b[^>]*\/?\s*>/gi, "")
    .replace(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi, (tag, tagName) => {
      const normalizedTag = String(tagName || "").toLowerCase();
      if (!allowedTags.has(normalizedTag)) return "";
      if (tag.startsWith("</")) return `</${normalizedTag}>`;
      return normalizedTag === "br" ? "<br>" : `<${normalizedTag}>`;
    });
}

function requestBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body !== "string") return {};
  if (request.body.length > 30_000) {
    const error = new Error("文章資料過長，請精簡後再產生。");
    error.statusCode = 413;
    throw error;
  }
  try {
    return JSON.parse(request.body || "{}");
  } catch {
    const error = new Error("文章資料格式無法解析。");
    error.statusCode = 400;
    throw error;
  }
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((item) => sanitize(item, 120)).filter(Boolean);
  return sanitize(value, 1000)
    .split(/[,\n，、]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractJson(text = "") {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI 回傳格式無法解析。");
    return JSON.parse(match[0]);
  }
}

function bearerToken(request) {
  const header = request.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function supabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publicKey) {
    const error = new Error("尚未設定 Supabase public configuration，AI 文章產生已暫停。");
    error.statusCode = 503;
    throw error;
  }
  return { supabaseUrl, publicKey };
}

async function supabaseRequest(path, token, options = {}) {
  const { supabaseUrl, publicKey } = supabaseConfig();
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: publicKey,
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = new Error(await response.text() || `Supabase request failed: ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

async function verifyArticleEditor(request) {
  const token = bearerToken(request);
  if (!token) {
    const error = new Error("請先登入後台後再使用 AI 產文。");
    error.statusCode = 401;
    throw error;
  }

  const user = await supabaseRequest("/auth/v1/user", token);
  const permissions = await supabaseRequest("/rest/v1/rpc/get_current_admin_permissions", token, {
    method: "POST",
    body: JSON.stringify({})
  }).catch(async () => {
    const profiles = await supabaseRequest(`/rest/v1/profiles?user_id=eq.${encodeURIComponent(user.id)}&select=id,role,email,is_active&limit=1`, token);
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    if (!profile?.is_active) return {};
    return {
      role: profile.role,
      email: profile.email,
      can_edit_articles: ["owner", "admin", "editor"].includes(profile.role)
    };
  });

  const email = String(permissions?.email || user.email || "").toLowerCase();
  const canEditArticles = permissions?.role === "owner" || permissions?.can_edit_articles === true || email === ownerEmail;
  if (!canEditArticles) {
    const error = new Error("此帳號沒有 AI 文章產生權限。");
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
    await verifyArticleEditor(request);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      json(response, 503, { error: "尚未設定 OPENAI_API_KEY，AI 文章產生已暫停。" });
      return;
    }

    const body = requestBody(request);
    const title = sanitize(body.title, 180);
    if (!title) {
      json(response, 400, { error: "請提供文章大標題。" });
      return;
    }

    const brief = {
      title,
      subtitle: sanitize(body.subtitle, 260),
      summary_points: normalizeList(body.summary_points),
      source_name: sanitize(body.source_name, 180),
      source_url: sanitize(body.source_url, 500),
      tags: normalizeList(body.tags),
      content_type: sanitize(body.content_type, 80)
    };

    const prompt = `
你是長照產業網站的資深採訪編輯，請用繁體中文替「歲悅長照集團」撰寫官網文章草稿。
語氣：專業、溫暖、有第三方記者觀察感，但不要誇大醫療療效，不要捏造不存在的統計。
請輸出 JSON，不要加 Markdown code fence。

欄位：
{
  "subtitle": "80字內副標",
  "summary_points": ["3到5個本文重點"],
  "tags": ["5到8個SEO標籤"],
  "seo_title": "60字內SEO標題",
  "seo_description": "120字內SEO描述",
  "content": "可直接放入網站的HTML內文，使用h2、h3、p、ul、li、strong標籤，不要包含script或style"
};

文章資料：
${JSON.stringify(brief, null, 2)}
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ARTICLE_MODEL || "gpt-4.1-mini",
        input: prompt,
        temperature: 0.7,
        max_output_tokens: 2200
      })
    });

    const result = await openaiResponse.json();
    if (!openaiResponse.ok) {
      json(response, openaiResponse.status, { error: result.error?.message || "OpenAI API request failed." });
      return;
    }

    const text = result.output_text || result.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("") || "";
    const article = extractJson(text);
    json(response, 200, {
      subtitle: sanitize(article.subtitle, 260),
      summary_points: normalizeList(article.summary_points).slice(0, 5),
      tags: normalizeList(article.tags).slice(0, 10),
      seo_title: sanitize(article.seo_title, 120),
      seo_description: sanitize(article.seo_description, 220),
      content: sanitizeArticleHtml(article.content)
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error("AI article generation failed", error);
    else console.warn("AI article generation rejected", error.message);
    json(response, statusCode, { error: error.message || "AI 產生文章失敗。" });
  }
}
