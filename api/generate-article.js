function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function sanitize(value, maxLength = 4000) {
  return String(value || "").trim().slice(0, maxLength);
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

export default async function handler(request, response) {
  if (request.method !== "POST") {
    json(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    json(response, 500, { error: "尚未設定 OPENAI_API_KEY，請先到 Vercel Environment Variables 設定。" });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
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
}

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
      content: sanitize(article.content, 12000)
    });
  } catch (error) {
    console.error("AI article generation failed", error);
    json(response, 500, { error: error.message || "AI 產生文章失敗。" });
  }
}
