function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function startDateFor(type) {
  const date = new Date();
  if (type === "monthly") date.setDate(date.getDate() - 30);
  else if (type === "weekly") date.setDate(date.getDate() - 7);
  else date.setDate(date.getDate() - 1);
  return date.toISOString();
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

function setupError(message) {
  const error = new Error(message);
  error.statusCode = 503;
  error.setupRequired = true;
  return error;
}

function requireCronAuthorization(request) {
  const cronSecret = process.env.CRON_SECRET || process.env.REPORT_CRON_SECRET;
  if (!cronSecret) throw setupError("Missing CRON_SECRET for scheduled report endpoint.");

  const authorization = request.headers.authorization || "";
  if (authorization !== `Bearer ${cronSecret}`) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
}

function supabaseServiceConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) {
    throw setupError("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const payload = decodeJwtPayload(key);
  if (payload?.role !== "service_role" || payload?.ref !== projectRefFromSupabaseUrl(supabaseUrl)) {
    throw setupError("SUPABASE_SERVICE_ROLE_KEY does not match SUPABASE_URL project.");
  }

  return { supabaseUrl, key };
}

async function supabaseSelect(path) {
  const { supabaseUrl, key } = supabaseServiceConfig();

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function supabasePatch(path, payload) {
  const { supabaseUrl, key } = supabaseServiceConfig();

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
}

async function sendDigest({ to, reportType, pageViews, events, alerts }) {
  if (!process.env.RESEND_API_KEY) {
    return { skipped: true, reason: "Missing RESEND_API_KEY" };
  }

  const uniqueVisitors = new Set(pageViews.map((row) => row.visitor_id)).size;
  const formSubmits = events.filter((row) => row.event_type === "form_submit").length;
  const lineClicks = events.filter((row) => row.event_type === "line_click" || row.event_type === "join_line_click").length;
  const topPages = Object.entries(pageViews.reduce((acc, row) => {
    acc[row.page_path] = (acc[row.page_path] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC','Segoe UI',sans-serif;line-height:1.8;color:#3f2414">
      <h2 style="color:#f08a24;margin:0 0 12px">歲悅長照網站${reportType === "monthly" ? "月報" : reportType === "weekly" ? "週報" : "日報"}</h2>
      <p>PV：<b>${pageViews.length}</b>｜UV：<b>${uniqueVisitors}</b>｜表單：<b>${formSubmits}</b>｜LINE 點擊：<b>${lineClicks}</b>｜未解警示：<b>${alerts.length}</b></p>
      <h3>熱門頁面</h3>
      <ol>${topPages.map(([page, count]) => `<li>${page}：${count}</li>`).join("") || "<li>尚無資料</li>"}</ol>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Suiyuecare Website <noreply@suiyuecare.com>",
      to: [to],
      subject: `歲悅長照網站${reportType === "monthly" ? "月報" : reportType === "weekly" ? "週報" : "日報"}`,
      html
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Report email failed.");
  return result;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    requireCronAuthorization(request);

    const requestUrl = new URL(request.url || "/api/report-digest", `https://${request.headers.host || "localhost"}`);
    const pathReportType = requestUrl.pathname.includes("monthly")
      ? "monthly"
      : requestUrl.pathname.includes("weekly")
        ? "weekly"
        : "daily";
    const reportType = request.query?.type || requestUrl.searchParams.get("type") || request.body?.type || pathReportType;
    const since = startDateFor(reportType);
    const [schedules, pageViews, events, alerts] = await Promise.all([
      supabaseSelect(`analytics_report_schedules?is_enabled=eq.true&report_type=eq.${encodeURIComponent(reportType)}&select=id,recipient_email,report_type`),
      supabaseSelect(`analytics_page_views?created_at=gte.${encodeURIComponent(since)}&select=page_path,visitor_id,created_at`),
      supabaseSelect(`analytics_events?created_at=gte.${encodeURIComponent(since)}&select=event_type,page_path,created_at`),
      supabaseSelect("analytics_alerts?status=neq.resolved&select=id,severity,title,status")
    ]);

    const recipients = schedules.length ? schedules.map((row) => row.recipient_email) : [process.env.REPORT_FALLBACK_EMAIL || "generalaffairs@suiyuecare.com"];
    const results = [];
    for (const recipient of recipients) {
      results.push(await sendDigest({ to: recipient, reportType, pageViews, events, alerts }));
    }
    await Promise.all((schedules || []).map((schedule) => supabasePatch(`analytics_report_schedules?id=eq.${encodeURIComponent(schedule.id)}`, { last_sent_at: new Date().toISOString() })));

    return json(response, 200, { ok: true, reportType, recipients, results });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error(error);
    else console.warn("Report digest rejected", error.message);
    return json(response, statusCode, {
      ok: false,
      message: statusCode >= 500 ? "Report failed." : error.message || "Report failed.",
      setupRequired: Boolean(error.setupRequired)
    });
  }
};
