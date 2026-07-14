const crypto = require("node:crypto");

const FORM_RECIPIENTS = {
  contact: process.env.CONTACT_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  course_signup: process.env.COURSE_NOTIFY_EMAIL || "edu.control@suiyuecare.com",
  investor: process.env.INVESTOR_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  land: process.env.LAND_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  marketing: process.env.MARKETING_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  system: process.env.SYSTEM_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com",
  recruiting: process.env.RECRUITING_NOTIFY_EMAIL || "generalaffairs@suiyuecare.com"
};

const FORM_LABELS = {
  contact: "聯絡我們 / 服務諮詢",
  course_signup: "課程報名",
  investor: "投資人招募",
  land: "土地招募",
  marketing: "網站行銷合作",
  system: "系統後台諮詢",
  recruiting: "人才招募"
};

const FORM_RATE_LIMIT_WINDOW_MS = Number(process.env.FORM_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const FORM_RATE_LIMIT_MAX_PER_IP = Number(process.env.FORM_RATE_LIMIT_MAX_PER_IP || 8);
const FORM_RATE_LIMIT_MAX_PER_CONTACT = Number(process.env.FORM_RATE_LIMIT_MAX_PER_CONTACT || 3);
const RECRUITING_RESUME_BUCKET = "recruiting-resumes";
const RECRUITING_RESUME_MAX_BYTES = Number(process.env.RECRUITING_RESUME_MAX_BYTES || 3 * 1024 * 1024);
const RECRUITING_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const formRateLimitStore = globalThis.__suiyuecareFormRateLimitStore || new Map();
globalThis.__suiyuecareFormRateLimitStore = formRateLimitStore;

function json(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitize(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeRecruitingResume(value) {
  if (!value || typeof value !== "object") return null;
  const fileName = sanitize(value.file_name, 180).replace(/[\\/\u0000]/g, "_");
  const mimeType = sanitize(value.mime_type, 140).toLowerCase();
  const dataBase64 = String(value.data_base64 || "").replace(/\s/g, "");
  const maxBase64Length = Math.ceil(RECRUITING_RESUME_MAX_BYTES * 4 / 3) + 8;
  if (!fileName || !mimeType || !dataBase64) throw createHttpError(400, "履歷檔案格式不完整，請重新選擇檔案。");
  if (!RECRUITING_RESUME_MIME_TYPES.has(mimeType)) throw createHttpError(400, "履歷僅支援 PDF、DOC、DOCX 檔案。");
  if (dataBase64.length > maxBase64Length) throw createHttpError(413, "履歷檔案請控制在 3 MB 以內。");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(dataBase64)) throw createHttpError(400, "履歷檔案格式無法辨識，請重新選擇檔案。");

  const buffer = Buffer.from(dataBase64, "base64");
  const declaredSize = Number(value.size_bytes || 0);
  if (!buffer.length || buffer.length > RECRUITING_RESUME_MAX_BYTES || (declaredSize && declaredSize !== buffer.length)) {
    throw createHttpError(413, "履歷檔案請控制在 3 MB 以內。");
  }
  return { fileName, mimeType, sizeBytes: buffer.length, buffer };
}

function recruitingResumePath(fileName) {
  const extension = fileName.match(/\.(pdf|doc|docx)$/i)?.[0]?.toLowerCase() || ".file";
  return `applications/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${extension}`;
}

function requestBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body !== "string") return {};
  if (request.body.length > 25_000) {
    throw createHttpError(413, "表單內容過長，請精簡後再送出。");
  }
  try {
    return JSON.parse(request.body);
  } catch {
    return {};
  }
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

function phoneDigits(value) {
  return sanitize(value, 80).replace(/\D/g, "");
}

function isValidEmail(value) {
  const email = sanitize(value, 180);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(value) {
  const digits = phoneDigits(value);
  return digits.length >= 7 && digits.length <= 20;
}

function isSupabaseServiceSetupError(error) {
  const message = error?.message || "";
  return message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("SUPABASE_URL");
}

function logSupabaseSaveError(error) {
  if (isSupabaseServiceSetupError(error)) {
    console.warn(`Supabase service save skipped: ${error.message}`);
    return;
  }
  console.error(error);
}

function rateLimitExceeded(key, max, now = Date.now()) {
  if (!key || max <= 0) return false;
  if (formRateLimitStore.size > 800) {
    for (const [entryKey, entry] of formRateLimitStore.entries()) {
      if (!entry || entry.resetAt <= now) formRateLimitStore.delete(entryKey);
    }
  }

  const existing = formRateLimitStore.get(key);
  if (!existing || existing.resetAt <= now) {
    formRateLimitStore.set(key, { count: 1, resetAt: now + FORM_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > max;
}

function enforceRateLimit(request, payload) {
  const ip = clientIp(request);
  const email = sanitize(payload.email, 180).toLowerCase();
  const phone = phoneDigits(payload.phone);
  const formType = payload.form_type || "contact";
  const checks = [
    [`ip:${ip}:${formType}`, FORM_RATE_LIMIT_MAX_PER_IP],
    email ? [`email:${email}`, FORM_RATE_LIMIT_MAX_PER_CONTACT] : null,
    phone ? [`phone:${phone}`, FORM_RATE_LIMIT_MAX_PER_CONTACT] : null
  ].filter(Boolean);

  if (checks.some(([key, max]) => rateLimitExceeded(key, max))) {
    throw createHttpError(429, "送出太頻繁，請稍後再試。");
  }
}

function buildSubmissionPayload(body) {
  const requestedFormType = sanitize(body.form_type || "contact", 80);
  const formType = FORM_RECIPIENTS[requestedFormType] ? requestedFormType : "contact";
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
      privacy_consent: body.privacy_consent === true || body.privacy_consent === "on",
      course_title: sanitize(body.course_title || body["課程"] || body["您本次報名的課程"], 220),
      course_id: sanitize(body.course_id, 120),
      recruiting_page: sanitize(body.recruiting_page, 120),
      department_id: sanitize(body.department_id, 120),
      department_title: sanitize(body.department_title, 180),
      opening_id: sanitize(body.opening_id, 120),
      opening_title: sanitize(body.opening_title, 220),
      opening_slug: sanitize(body.opening_slug, 160),
      identity_category: sanitize(body.identity_category || body["身分類別"], 80),
      user_agent: sanitize(body.user_agent, 500),
      page_title: sanitize(body.page_title, 240),
      submitted_at: new Date().toISOString()
    }
  };
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

function serviceRoleProjectMatches() {
  const payload = decodeJwtPayload(supabaseServiceKey());
  return Boolean(payload?.role === "service_role" && payload?.ref === projectRefFromSupabaseUrl(supabaseUrl()));
}

async function uploadRecruitingResume(resume) {
  const url = supabaseUrl();
  const serviceKey = supabaseServiceKey();
  if (!url || !serviceKey || !serviceRoleProjectMatches()) {
    throw createHttpError(503, "履歷上傳暫時無法使用，請先不附檔送出資料或稍後再試。");
  }

  const storagePath = recruitingResumePath(resume.fileName);
  const encodedPath = storagePath.split("/").map((part) => encodeURIComponent(part)).join("/");
  const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(RECRUITING_RESUME_BUCKET)}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": resume.mimeType,
      "x-upsert": "false"
    },
    body: resume.buffer
  });
  if (!response.ok) {
    console.error("Recruiting resume upload failed", await response.text());
    throw createHttpError(503, "履歷上傳暫時無法使用，請先不附檔送出資料或稍後再試。");
  }
  return {
    bucket: RECRUITING_RESUME_BUCKET,
    storage_path: storagePath,
    file_name: resume.fileName,
    mime_type: resume.mimeType,
    size_bytes: resume.sizeBytes
  };
}

function normalizeSubmissionId(value) {
  if (Array.isArray(value)) return normalizeSubmissionId(value[0]?.id || value[0]);
  if (value && typeof value === "object") return String(value.id || value.submission_id || "").replace(/^"|"$/g, "");
  return String(value || "").replace(/^"|"$/g, "");
}

function buildSubmissionRecord(payload, emailSent = false, submitterEmailSent = null) {
  return {
    form_type: payload.form_type,
    name: payload.name || null,
    phone: payload.phone || null,
    email: payload.email || null,
    subject: payload.subject || null,
    message: payload.message || null,
    source_path: payload.source_path || null,
    status: "new",
    metadata: {
      ...payload.metadata,
      submitter_email_sent: submitterEmailSent
    },
    recipient_email: payload.recipient_email || null,
    email_sent: Boolean(emailSent)
  };
}

async function saveFallbackSubmission(payload, emailSent, submitterEmailSent) {
  try {
    await saveToSupabasePublicIntake(payload, emailSent, submitterEmailSent);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function saveToSupabase(payload) {
  const url = supabaseUrl();
  const supabaseKey = supabaseServiceKey();
  if (!url || !supabaseKey) {
    throw new Error("Server is missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (!serviceRoleProjectMatches()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY does not match SUPABASE_URL project.");
  }

  const response = await fetch(`${url}/rest/v1/rpc/submit_form_submission`, {
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

async function saveToSupabasePublicIntake(payload, emailSent, submitterEmailSent) {
  const url = supabaseUrl();
  const supabaseKey = supabasePublicKey();
  if (!url || !supabaseKey) {
    throw new Error("Server is missing SUPABASE_URL/VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  }

  const response = await fetch(`${url}/rest/v1/form_submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    },
    body: JSON.stringify(buildSubmissionRecord(payload, emailSent, submitterEmailSent))
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase public form backup failed: ${message}`);
  }

  return null;
}

async function updateSubmissionEmailStatus(submissionId, emailSent) {
  if (!submissionId) return;
  const url = supabaseUrl();
  const supabaseKey = supabaseServiceKey();
  if (!url || !supabaseKey) return;
  if (!serviceRoleProjectMatches()) return;

  await fetch(`${url}/rest/v1/rpc/update_form_submission_email_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      submission_id: String(submissionId).replace(/^"|"$/g, ""),
      email_sent_value: Boolean(emailSent),
      submitter_email_sent_value: null
    })
  });
}

async function updateSubmitterEmailStatus(submissionId, submitterEmailSent) {
  if (!submissionId) return;
  const url = supabaseUrl();
  const supabaseKey = supabaseServiceKey();
  if (!url || !supabaseKey) return;
  if (!serviceRoleProjectMatches()) return;

  await fetch(`${url}/rest/v1/rpc/update_form_submission_email_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      submission_id: String(submissionId).replace(/^"|"$/g, ""),
      email_sent_value: true,
      submitter_email_sent_value: Boolean(submitterEmailSent)
    })
  });
}

function renderEmailHtml(payload) {
  const rows = [
    ["表單類型", payload.form_type],
    ["姓名", payload.name],
    ["電話", payload.phone],
    ["Email", payload.email],
    ["主旨/需求", payload.subject],
    ["身分類別", payload.metadata.identity_category],
    ["報名課程", payload.metadata.course_title],
    ["內容", payload.message],
    ["部門/分類", payload.metadata.department_title],
    ["職缺/項目", payload.metadata.opening_title],
    ["履歷", payload.metadata.resume?.file_name],
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

function renderSubmitterReplyHtml(payload) {
  const formLabel = FORM_LABELS[payload.form_type] || payload.form_type || "官網表單";
  const subjectLabel = payload.metadata.course_title || payload.metadata.opening_title || payload.subject || formLabel;
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC','Segoe UI',sans-serif;line-height:1.9;color:#3f2414">
      <h2 style="margin:0 0 12px;color:#f08a24">我們已收到你的資料</h2>
      <p>${String(payload.name || "您好").replace(/[<>]/g, "")} 您好：</p>
      <p>感謝你填寫歲悅長照集團官網表單。我們已收到你剛剛送出的「${String(formLabel).replace(/[<>]/g, "")}」資料。</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px;margin:16px 0">
        <tr>
          <th style="width:140px;text-align:left;vertical-align:top;padding:10px;border:1px solid #f2dfc5;background:#fff7ed">表單項目</th>
          <td style="padding:10px;border:1px solid #f2dfc5">${String(formLabel).replace(/[<>]/g, "")}</td>
        </tr>
        <tr>
          <th style="width:140px;text-align:left;vertical-align:top;padding:10px;border:1px solid #f2dfc5;background:#fff7ed">內容摘要</th>
          <td style="padding:10px;border:1px solid #f2dfc5">${String(subjectLabel || "-").replace(/[<>]/g, "")}</td>
        </tr>
        <tr>
          <th style="width:140px;text-align:left;vertical-align:top;padding:10px;border:1px solid #f2dfc5;background:#fff7ed">送出時間</th>
          <td style="padding:10px;border:1px solid #f2dfc5">${String(payload.metadata.submitted_at || "-").replace(/[<>]/g, "")}</td>
        </tr>
      </table>
      <p>我們的人員會於近日內主動與你聯繫，協助確認下一步需求與安排。</p>
      <p style="margin-top:18px;color:#7b6658">歲悅長照集團<br />照顧就像去超商，買牛奶一樣簡單。</p>
    </div>
  `;
}

async function sendEmail(payload, options = {}) {
  if (!process.env.RESEND_API_KEY) {
    return { skipped: true, reason: "Missing RESEND_API_KEY", setupRequired: true };
  }

  const recipient = options.to || payload.recipient_email || FORM_RECIPIENTS[payload.form_type] || FORM_RECIPIENTS.contact;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Suiyuecare Website <noreply@suiyuecare.com>",
      to: [recipient],
      reply_to: options.replyTo || payload.email || undefined,
      subject: options.subject || `歲悅官網表單｜${payload.subject || payload.form_type}`,
      html: options.html || renderEmailHtml(payload)
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Email provider rejected the request.");
  }
  return result;
}

async function sendSubmitterReply(payload) {
  if (!payload.email) return { skipped: true, reason: "Missing submitter email" };
  const formLabel = FORM_LABELS[payload.form_type] || "官網表單";
  return sendEmail(payload, {
    to: payload.email,
    replyTo: payload.recipient_email || FORM_RECIPIENTS[payload.form_type] || FORM_RECIPIENTS.contact,
    subject: `歲悅長照集團已收到你的${formLabel}資料`,
    html: renderSubmitterReplyHtml(payload)
  });
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    enforceAllowedPublicOrigin(request);
    const body = requestBody(request);
    const payload = buildSubmissionPayload(body);
    const resume = normalizeRecruitingResume(body.resume);
    if (sanitize(body._honey, 120)) {
      return json(response, 200, { ok: true, message: "資料已送出。" });
    }
    if (resume && payload.form_type !== "recruiting") {
      return json(response, 400, { ok: false, message: "只有人才招募表單可上傳履歷。" });
    }
    if (!payload.name || !payload.phone || (payload.form_type !== "recruiting" && !payload.email)) {
      return json(response, 400, { ok: false, message: payload.form_type === "recruiting" ? "請填寫姓名與電話。" : "請填寫姓名、電話與 Email。" });
    }
    if (payload.form_type !== "recruiting" && !isValidEmail(payload.email)) {
      return json(response, 400, { ok: false, message: "請填寫有效的 Email。" });
    }
    if (!isValidPhone(payload.phone)) {
      return json(response, 400, { ok: false, message: "請填寫有效的聯絡電話。" });
    }
    if (payload.form_type !== "recruiting" && body.privacy_consent !== true && body.privacy_consent !== "on") {
      return json(response, 400, { ok: false, message: "請先同意個人資料使用告知。" });
    }
    enforceRateLimit(request, payload);
    if (resume) payload.metadata.resume = await uploadRecruitingResume(resume);

    let submissionId = null;
    try {
      submissionId = normalizeSubmissionId(await saveToSupabase(payload));
    } catch (error) {
      logSupabaseSaveError(error);
    }

    let email = null;
    try {
      email = await sendEmail(payload);
    } catch (emailError) {
      console.error(emailError);
      if (!submissionId) {
        const fallbackSaved = await saveFallbackSubmission(payload, false, false);
        if (!fallbackSaved) {
          return json(response, 503, {
            ok: false,
            message: "表單暫時無法送出，請稍後再試或改用電話、LINE 聯繫。"
          });
        }
      }
      return json(response, 202, {
        ok: true,
        emailSent: false,
        submitterEmailSent: false,
        message: "資料已收到，我們會盡快安排專人聯繫。"
      });
    }

    const emailSent = !email?.skipped;
    let submitterEmail = null;
    try {
      submitterEmail = await sendSubmitterReply(payload);
    } catch (submitterEmailError) {
      console.error(submitterEmailError);
      submitterEmail = { error: submitterEmailError.message || "Submitter confirmation failed." };
    }
    const submitterEmailSent = Boolean(submitterEmail && !submitterEmail.skipped && !submitterEmail.error);
    if (submissionId) {
      await updateSubmissionEmailStatus(submissionId, emailSent);
      await updateSubmitterEmailStatus(submissionId, submitterEmailSent);
    } else {
      const fallbackSaved = await saveFallbackSubmission(payload, emailSent, submitterEmailSent);
      if (!fallbackSaved && !emailSent) {
        return json(response, 503, {
          ok: false,
          message: "表單暫時無法送出，請稍後再試或改用電話、LINE 聯繫。"
        });
      }
    }
    return json(response, emailSent ? 200 : 202, {
      ok: true,
      emailSent,
      submitterEmailSent,
      message: emailSent
        ? "資料已留存後台，並已寄出通知信與填寫者確認信。"
        : "資料已收到，我們會盡快安排專人聯繫。"
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error(error);
    } else {
      console.warn(`Form submission rejected: ${error.message}`);
    }
    return json(response, statusCode, {
      ok: false,
      message: statusCode >= 500 ? "表單送出失敗，請稍後再試。" : error.message
    });
  }
};
