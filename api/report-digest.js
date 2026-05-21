const DEFAULT_SUPABASE_URL = "https://ussnmxdpxeoshlrdchov.supabase.co";

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

async function supabaseSelect(path) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

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
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

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

  const cronSecret = process.env.REPORT_CRON_SECRET || process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.authorization || "";
    const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const token = request.headers["x-cron-secret"] || request.query?.token || bearer;
    if (token !== cronSecret) {
      return json(response, 401, { ok: false, message: "Unauthorized" });
    }
  }

  try {
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
    console.error(error);
    return json(response, 500, { ok: false, message: error.message || "Report failed." });
  }
};
