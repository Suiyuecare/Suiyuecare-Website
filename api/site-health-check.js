const tls = require("tls");

const DEFAULT_SITE_URL = "https://suiyuecare.com";

function json(response, statusCode, payload) {
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

function supabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const servicePayload = decodeJwtPayload(serviceKey);
  const projectRef = projectRefFromSupabaseUrl(supabaseUrl);
  const serviceRoleProjectMatches = Boolean(servicePayload?.role === "service_role" && servicePayload?.ref === projectRef);
  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL/VITE_SUPABASE_URL.");
  return { supabaseUrl, serviceKey, publicKey, serviceRoleProjectMatches };
}

function siteUrl() {
  const raw = process.env.SITE_URL || process.env.SUIYUECARE_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || DEFAULT_SITE_URL;
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw.replace(/\/$/, "")}`;
}

async function supabaseRequest(path, options = {}) {
  const { supabaseUrl, serviceKey, serviceRoleProjectMatches } = supabaseConfig();
  if (!serviceRoleProjectMatches) throw new Error("SUPABASE_SERVICE_ROLE_KEY does not match SUPABASE_URL project.");
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(await response.text());
  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
    return { ok: response.ok, status: response.status, responseTime: Date.now() - startedAt };
  } finally {
    clearTimeout(timeout);
  }
}

function getSslCertificate(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect(443, hostname, { servername: hostname, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      resolve(cert && cert.valid_to ? cert : null);
    });
    socket.setTimeout(7000, () => {
      socket.destroy();
      resolve(null);
    });
    socket.on("error", () => resolve(null));
  });
}

async function countRows(path) {
  const { supabaseUrl, serviceKey, publicKey, serviceRoleProjectMatches } = supabaseConfig();
  const key = serviceRoleProjectMatches ? serviceKey : publicKey;
  if (!key) throw new Error("Missing usable Supabase API key.");
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: "HEAD",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact"
    }
  });
  if (!response.ok) throw new Error(await response.text());
  return Number((response.headers.get("content-range") || "0-0/0").split("/").pop() || 0);
}

function checkRow(checkType, status, message, extra = {}) {
  return {
    check_type: checkType,
    status,
    response_time_ms: extra.responseTime || null,
    checked_url: extra.checkedUrl || null,
    message,
    metadata: extra.metadata || {}
  };
}

function summarizeHealth(checks = [], alerts = []) {
  const hasCritical = checks.some((check) => check.status === "critical")
    || alerts.some((alert) => alert.severity === "critical");
  const hasWarning = checks.some((check) => check.status === "warning")
    || alerts.some((alert) => alert.severity === "warning");
  return hasCritical ? "critical" : hasWarning ? "warning" : "ok";
}

function requireCronAuthorization(request) {
  const cronSecret = process.env.CRON_SECRET || process.env.REPORT_CRON_SECRET;
  if (!cronSecret) {
    const error = new Error("Missing CRON_SECRET for scheduled health check endpoint.");
    error.statusCode = 503;
    error.setupRequired = true;
    throw error;
  }

  const authorization = request.headers.authorization || "";
  if (authorization !== `Bearer ${cronSecret}`) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
}

async function insertHealthChecks(rows) {
  if (!rows.length) return;
  try {
    if (!supabaseConfig().serviceRoleProjectMatches) return;
  } catch {
    return;
  }
  await supabaseRequest("analytics_health_checks", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(rows)
  });
}

async function ensureAlert(alert) {
  try {
    if (!supabaseConfig().serviceRoleProjectMatches) return;
  } catch {
    return;
  }
  const existing = await supabaseRequest(`analytics_alerts?alert_type=eq.${encodeURIComponent(alert.alert_type)}&status=neq.resolved&select=id&limit=1`);
  if (existing?.length) return;
  await supabaseRequest("analytics_alerts", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(alert)
  });
}

async function buildChecksAndAlerts() {
  const baseUrl = siteUrl();
  const checks = [];
  const alerts = [];
  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since48h = new Date(now - 48 * 60 * 60 * 1000).toISOString();
  const until24h = since24h;
  let supabaseInfo = null;

  try {
    supabaseInfo = supabaseConfig();
    if (!supabaseInfo.serviceRoleProjectMatches) {
      checks.push(checkRow("config", "critical", "SUPABASE_SERVICE_ROLE_KEY 與 SUPABASE_URL 不屬於同一個 Supabase project，已跳過健康檢查寫入。"));
      alerts.push({ alert_type: "supabase_service_role_mismatch", severity: "critical", title: "Supabase service role key 專案不匹配", message: "請在 Vercel production env 更新 SUPABASE_SERVICE_ROLE_KEY，使其 ref 與 SUPABASE_URL 相同。", metric_key: "supabase_service_role_project_match", metric_value: 0 });
    }
  } catch (error) {
    checks.push(checkRow("config", "critical", `Supabase 設定缺漏：${error.message}`));
    alerts.push({ alert_type: "supabase_config_missing", severity: "critical", title: "Supabase 設定缺漏", message: error.message, metric_key: "supabase_config", metric_value: 0 });
  }

  try {
    const home = await fetchWithTimeout(baseUrl, {}, 10000);
    checks.push(checkRow("homepage", home.ok ? (home.responseTime > 5000 ? "warning" : "ok") : "critical", home.ok ? `首頁回應 ${home.responseTime}ms` : `首頁 HTTP ${home.status}`, { responseTime: home.responseTime, checkedUrl: baseUrl }));
    if (!home.ok) alerts.push({ alert_type: "site_offline", severity: "critical", title: "網站無法連線", message: `首頁健康檢查回傳 HTTP ${home.status}`, metric_key: "homepage_status", metric_value: home.status });
    if (home.responseTime > 5000) alerts.push({ alert_type: "homepage_slow", severity: "critical", title: "首頁載入超過 5 秒", message: `首頁回應時間 ${home.responseTime}ms`, metric_key: "homepage_response_time", metric_value: home.responseTime });
  } catch (error) {
    checks.push(checkRow("homepage", "critical", `首頁檢查失敗：${error.message}`, { checkedUrl: baseUrl }));
    alerts.push({ alert_type: "site_offline", severity: "critical", title: "網站無法連線", message: error.message, metric_key: "homepage_status", metric_value: 0 });
  }

  try {
    const { supabaseUrl, serviceKey, publicKey, serviceRoleProjectMatches } = supabaseConfig();
    const key = serviceRoleProjectMatches ? serviceKey : publicKey;
    if (!key) throw new Error("Missing usable Supabase API key.");
    const api = await fetchWithTimeout(`${supabaseUrl}/rest/v1/pages?select=id&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } }, 8000);
    checks.push(checkRow("api", api.ok ? "ok" : "critical", api.ok ? `Supabase API 正常 ${api.responseTime}ms` : `Supabase API HTTP ${api.status}`, { responseTime: api.responseTime, checkedUrl: `${supabaseUrl}/rest/v1/pages` }));
    if (!api.ok) alerts.push({ alert_type: "api_down", severity: "critical", title: "API 狀態異常", message: `Supabase REST API HTTP ${api.status}`, metric_key: "api_status", metric_value: api.status });
  } catch (error) {
    checks.push(checkRow("api", "critical", `API 檢查失敗：${error.message}`));
    alerts.push({ alert_type: "api_down", severity: "critical", title: "API 狀態異常", message: error.message, metric_key: "api_status", metric_value: 0 });
  }

  try {
    const form = await fetchWithTimeout(`${baseUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    }, 8000);
    const healthy = [400, 422].includes(form.status) || form.ok;
    checks.push(checkRow("form", healthy ? "ok" : "warning", healthy ? "表單端點可回應" : `表單端點 HTTP ${form.status}`, { responseTime: form.responseTime, checkedUrl: `${baseUrl}/api/send-email` }));
    if (!healthy) alerts.push({ alert_type: "form_endpoint_failed", severity: "warning", title: "表單端點可能異常", message: `表單端點 HTTP ${form.status}`, metric_key: "form_status", metric_value: form.status });
  } catch (error) {
    checks.push(checkRow("form", "warning", `表單端點檢查失敗：${error.message}`, { checkedUrl: `${baseUrl}/api/send-email` }));
    alerts.push({ alert_type: "form_endpoint_failed", severity: "warning", title: "表單端點可能異常", message: error.message, metric_key: "form_status", metric_value: 0 });
  }

  try {
    const hostname = new URL(baseUrl).hostname;
    const cert = await getSslCertificate(hostname);
    const validTo = cert?.valid_to ? new Date(cert.valid_to) : null;
    const daysLeft = validTo ? Math.ceil((validTo.getTime() - now) / 86400000) : 0;
    checks.push(checkRow("ssl", daysLeft > 14 ? "ok" : "warning", cert ? `SSL 憑證剩餘 ${daysLeft} 天` : "無法讀取 SSL 憑證", { checkedUrl: baseUrl, metadata: { valid_to: cert?.valid_to || null, days_left: daysLeft } }));
    if (daysLeft > 0 && daysLeft <= 14) alerts.push({ alert_type: "ssl_expiring", severity: "warning", title: "SSL 憑證即將到期", message: `SSL 憑證剩餘 ${daysLeft} 天`, metric_key: "ssl_days_left", metric_value: daysLeft });
  } catch (error) {
    checks.push(checkRow("ssl", "warning", `SSL 憑證檢查失敗：${error.message}`, { checkedUrl: baseUrl }));
  }

  try {
    if (!supabaseInfo?.serviceRoleProjectMatches) {
      checks.push(checkRow("traffic", "warning", "流量指標暫停：需要正確的 SUPABASE_SERVICE_ROLE_KEY 才能讀取 analytics，已避免產生 0 流量誤報。", {
        metadata: { skipped: true, reason: "supabase_service_role_project_mismatch" }
      }));
      return { checks, alerts };
    }

    const [views24h, viewsPrevious24h, forms24h, errors404, errors500] = await Promise.all([
      countRows(`analytics_page_views?created_at=gte.${encodeURIComponent(since24h)}&select=id`),
      countRows(`analytics_page_views?created_at=gte.${encodeURIComponent(since48h)}&created_at=lt.${encodeURIComponent(until24h)}&select=id`),
      countRows(`analytics_events?event_type=eq.form_submit&created_at=gte.${encodeURIComponent(since24h)}&select=id`),
      countRows(`analytics_events?event_type=eq.error_404&created_at=gte.${encodeURIComponent(since24h)}&select=id`),
      countRows(`analytics_events?event_type=eq.error_500&created_at=gte.${encodeURIComponent(since24h)}&select=id`)
    ]);
    checks.push(checkRow("traffic", "ok", `近 24 小時 PV ${views24h}，表單 ${forms24h}`, { metadata: { views_24h: views24h, views_previous_24h: viewsPrevious24h, forms_24h: forms24h, errors_404: errors404, errors_500: errors500 } }));
    if (viewsPrevious24h > 0 && views24h < viewsPrevious24h * 0.5) alerts.push({ alert_type: "traffic_drop", severity: "warning", title: "流量下降超過 50%", message: `近 24 小時 PV ${views24h}，前 24 小時 PV ${viewsPrevious24h}`, metric_key: "page_views_24h", metric_value: views24h });
    if (forms24h === 0) alerts.push({ alert_type: "form_zero", severity: "warning", title: "近 24 小時表單送出為 0", message: "請確認聯絡表單、課程報名與應徵表單。", metric_key: "forms_24h", metric_value: 0 });
    if (errors404 >= 20) alerts.push({ alert_type: "many_404", severity: "warning", title: "大量 404 錯誤", message: `近 24 小時 404 共 ${errors404} 筆`, metric_key: "errors_404", metric_value: errors404 });
    if (errors500 >= 1) alerts.push({ alert_type: "many_500", severity: "critical", title: "發生 500 錯誤", message: `近 24 小時 500 共 ${errors500} 筆`, metric_key: "errors_500", metric_value: errors500 });
  } catch (error) {
    checks.push(checkRow("traffic", "warning", `流量指標檢查失敗：${error.message}`));
  }

  return { checks, alerts };
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    requireCronAuthorization(request);

    const { checks, alerts } = await buildChecksAndAlerts();
    await insertHealthChecks(checks);
    for (const alert of alerts) await ensureAlert({ ...alert, status: "unread", metadata: { source: "site-health-check" } });
    const status = summarizeHealth(checks, alerts);
    return json(response, 200, { ok: status !== "critical", status, checks, alerts });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error(error);
    else console.warn("Site health check rejected", error.message);
    return json(response, statusCode, {
      ok: false,
      message: statusCode >= 500 ? "Site health check failed." : error.message || "Site health check failed.",
      setupRequired: Boolean(error.setupRequired)
    });
  }
};
