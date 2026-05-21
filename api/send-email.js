const DEFAULT_SUPABASE_URL = "https://ussnmxdpxeoshlrdchov.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_2Qzte6W7e6iAssOyTVRuZA__MNdKR1x";

const FORM_RECIPIENTS = {
  contact: process.env.CONTACT_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  course_signup: process.env.COURSE_NOTIFY_EMAIL || "edu.control@suiyuecare.com",
  investor: process.env.INVESTOR_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  land: process.env.LAND_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  recruiting: process.env.RECRUITING_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com"
};

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function sanitize(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

function buildSubmissionPayload(body) {
  const formType = sanitize(body.form_type || "contact", 80);
  return {
    form_type: formType,
    name: sanitize(body.name || body["姓名"] || body["您的大名"], 160),
    phone: sanitize(body.phone || body["電話"] || body["您的電話"], 80),
    email: sanitize(body.email || body["信箱"] || body.Email, 180),
    subject: sanitize(body.subject || body["需求"] || body["課程"] || body["您本次報名的課程"] || body.course || "官網表單", 220),
    message: sanitize(body.message || body["說明"] || body["內容"], 2000),
    source_path: sanitize(body.source_path || body.page_path || "/", 500),
    recipient_email: FORM_RECIPIENTS[formType] || FORM_RECIPIENTS.contact,
    email_sent: false,
    metadata: {
      course_title: sanitize(body.course_title || body["課程"] || body["您本次報名的課程"], 220),
      course_id: sanitize(body.course_id, 120),
      recruiting_page: sanitize(body.recruiting_page, 120),
      department_id: sanitize(body.department_id, 120),
      department_title: sanitize(body.department_title, 180),
      opening_id: sanitize(body.opening_id, 120),
      opening_title: sanitize(body.opening_title, 220),
      opening_slug: sanitize(body.opening_slug, 160),
      user_agent: sanitize(body.user_agent, 500),
      page_title: sanitize(body.page_title, 240),
      submitted_at: new Date().toISOString()
    }
  };
}

async function saveToSupabase(payload) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_form_submission`, {
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
    throw new Error(`Supabase form backup failed: ${message}`);
  }

  return response.json();
}

async function updateSubmissionEmailStatus(submissionId, emailSent) {
  if (!submissionId) return;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  await fetch(`${supabaseUrl}/rest/v1/form_submissions?id=eq.${encodeURIComponent(String(submissionId).replace(/^"|"$/g, ""))}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ email_sent: Boolean(emailSent) })
  });
}

function renderEmailHtml(payload) {
  const rows = [
    ["表單類型", payload.form_type],
    ["姓名", payload.name],
    ["電話", payload.phone],
    ["Email", payload.email],
    ["主旨/需求", payload.subject],
    ["內容", payload.message],
    ["部門/分類", payload.metadata.department_title],
    ["職缺/項目", payload.metadata.opening_title],
    ["來源頁面", payload.source_path],
    ["送出時間", payload.metadata.submitted_at]
  ];

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC','Segoe UI',sans-serif;line-height:1.8;color:#3f2414">
      <h2 style="margin:0 0 16px;color:#f08a24">歲悅長照官網表單通知</h2>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        ${rows.map(([label, value]) => `
          <tr>
            <th style="width:140px;text-align:left;vertical-align:top;padding:10px;border:1px solid #f2dfc5;background:#fff7ed">${label}</th>
            <td style="padding:10px;border:1px solid #f2dfc5;white-space:pre-line">${String(value || "-").replace(/[<>]/g, "")}</td>
          </tr>
        `).join("")}
      </table>
    </div>
  `;
}

async function sendEmail(payload) {
  if (!process.env.RESEND_API_KEY) {
    return { skipped: true, reason: "Missing RESEND_API_KEY" };
  }

  const recipient = payload.recipient_email || FORM_RECIPIENTS[payload.form_type] || FORM_RECIPIENTS.contact;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Suiyuecare Website <noreply@suiyuecare.com>",
      to: [recipient],
      reply_to: payload.email || undefined,
      subject: `歲悅官網表單｜${payload.subject || payload.form_type}`,
      html: renderEmailHtml(payload)
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Email provider rejected the request.");
  }
  return result;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    const payload = buildSubmissionPayload(request.body || {});
    if (!payload.name || !payload.phone) {
      return json(response, 400, { ok: false, message: "請填寫姓名與電話。" });
    }

    const submissionId = await saveToSupabase(payload);
    let email = null;
    try {
      email = await sendEmail(payload);
    } catch (emailError) {
      console.error(emailError);
      return json(response, 202, {
        ok: true,
        submissionId,
        emailSent: false,
        message: "資料已留存後台，但寄信服務尚未完成或暫時失敗。"
      });
    }

    await updateSubmissionEmailStatus(submissionId, !email?.skipped);
    return json(response, 200, { ok: true, submissionId, emailSent: !email?.skipped, email });
  } catch (error) {
    console.error(error);
    return json(response, 500, { ok: false, message: error.message || "表單送出失敗。" });
  }
};
