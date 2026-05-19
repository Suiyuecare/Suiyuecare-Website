import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatCount, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#trafficStatus");
const refreshButton = document.querySelector("#trafficRefresh");
const startInput = document.querySelector("#trafficStartDate");
const endInput = document.querySelector("#trafficEndDate");
const pageSearchInput = document.querySelector("#pageSearchInput");
const pageSortSelect = document.querySelector("#pageSortSelect");
const reportScheduleForm = document.querySelector("#reportScheduleForm");

const conversionEvents = [
  "form_submit",
  "line_click",
  "phone_click",
  "email_click",
  "google_maps_click",
  "pdf_download",
  "reservation_click",
  "join_line_click",
  "cta_click"
];

const sourceLabels = {
  "organic search": "Organic Search",
  direct: "Direct",
  social: "Social",
  paid: "Paid Ads",
  referral: "Referral",
  email: "Email",
  "qr code": "QR Code"
};

let state = {
  range: "today",
  pageViews: [],
  events: [],
  alerts: [],
  healthChecks: [],
  pages: [],
  schedules: [],
  siteHealth: null
};

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function todayString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(range = state.range) {
  const end = endInput?.value ? new Date(`${endInput.value}T23:59:59`) : new Date();
  let start = new Date(end);
  if (range === "today") {
    start = new Date();
    start.setHours(0, 0, 0, 0);
  } else if (range === "custom") {
    start = startInput?.value ? new Date(`${startInput.value}T00:00:00`) : new Date(Date.now() - 29 * 86400000);
  } else {
    start = new Date(end.getTime() - (Number(range) - 1) * 86400000);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

function formatSeconds(value) {
  const seconds = Math.round(Number(value) || 0);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function percent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

function uniqueCount(rows, key) {
  return new Set(rows.map((row) => row[key]).filter(Boolean)).size;
}

function groupBy(rows, getKey) {
  return rows.reduce((map, row) => {
    const key = getKey(row) || "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
    return map;
  }, new Map());
}

function conversionCount(events = state.events) {
  return events.filter((event) => conversionEvents.includes(event.event_type)).length;
}

function getPageTitle(path) {
  const page = state.pages.find((item) => `#${item.slug}` === path || item.slug === path?.replace(/^#/, ""));
  return page?.title || path || "未知頁面";
}

function renderMiniBars(target, points, options = {}) {
  const element = document.querySelector(target);
  if (!element) return;
  const max = Math.max(...points.map((point) => point.value), 1);
  element.innerHTML = `
    <div class="traffic-bar-chart">
      ${points.map((point) => `
        <div class="traffic-bar-item" title="${escapeHTML(point.label)}：${formatCount(point.value)}">
          <span style="height:${Math.max((point.value / max) * 100, point.value ? 6 : 1)}%"></span>
          <small>${escapeHTML(point.shortLabel || point.label)}</small>
        </div>
      `).join("")}
    </div>
    ${options.caption ? `<p class="traffic-muted">${escapeHTML(options.caption)}</p>` : ""}
  `;
}

function renderRankList(target, items, emptyText = "目前沒有資料。") {
  const element = document.querySelector(target);
  if (!element) return;
  if (!items.length) {
    element.innerHTML = `<div class="admin-empty-state">${escapeHTML(emptyText)}</div>`;
    return;
  }
  const max = Math.max(...items.map((item) => item.value), 1);
  element.innerHTML = `<div class="traffic-rank-list">${items.map((item, index) => `
    <article>
      <b>${index + 1}</b>
      <div><strong>${escapeHTML(item.label)}</strong><span>${escapeHTML(item.meta || "")}</span></div>
      <em>${formatCount(item.value)}</em>
      <i style="width:${Math.max((item.value / max) * 100, 4)}%"></i>
    </article>
  `).join("")}</div>`;
}

function renderTable(target, headers, rows, emptyText = "目前沒有資料。") {
  const element = document.querySelector(target);
  if (!element) return;
  if (!rows.length) {
    element.innerHTML = `<div class="admin-empty-state">${escapeHTML(emptyText)}</div>`;
    return;
  }
  element.innerHTML = `
    <div class="admin-table-wrap">
      <table class="admin-data-table">
        <thead><tr>${headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function getDailyPoints(days) {
  const points = [];
  const now = new Date();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now.getTime() - index * 86400000);
    const key = todayString(date);
    points.push({
      key,
      label: key.slice(5),
      value: state.pageViews.filter((view) => view.created_at?.slice(0, 10) === key).length
    });
  }
  return points;
}

function getHourlyPoints() {
  const points = Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    shortLabel: String(hour),
    value: 0
  }));
  state.pageViews.forEach((view) => {
    const hour = new Date(view.created_at).getHours();
    points[hour].value += 1;
  });
  return points;
}

function pageRows() {
  const eventsByPage = groupBy(state.events.filter((event) => conversionEvents.includes(event.event_type)), (event) => event.page_path);
  return [...groupBy(state.pageViews, (view) => view.page_path).entries()].map(([path, views]) => {
    const visitors = uniqueCount(views, "visitor_id");
    const sessions = uniqueCount(views, "session_id");
    const conversions = eventsByPage.get(path)?.length || 0;
    const engagement = state.events
      .filter((event) => event.event_type === "page_engagement" && event.event_label === path)
      .map((event) => Number(event.value || event.metadata?.duration_seconds || 0));
    const avgStay = engagement.length ? engagement.reduce((sum, value) => sum + value, 0) / engagement.length : 0;
    return {
      path,
      title: getPageTitle(path),
      views: views.length,
      visitors,
      sessions,
      conversions,
      avgStay,
      bounceRate: sessions ? Math.max(0, 1 - conversions / sessions) : 0,
      exitRate: views.length ? Math.min(1, 1 / views.length) : 0
    };
  });
}

function sourceRows() {
  const eventsBySource = groupBy(state.events.filter((event) => conversionEvents.includes(event.event_type)), (event) => `${event.source || "direct"}|${event.medium || "none"}|${event.campaign || ""}`);
  return [...groupBy(state.pageViews, (view) => `${view.source || "direct"}|${view.medium || "none"}|${view.campaign || ""}`).entries()].map(([key, views]) => {
    const [source, medium, campaign] = key.split("|");
    const conversions = eventsBySource.get(key)?.length || 0;
    const visitors = uniqueCount(views, "visitor_id");
    return {
      source,
      medium,
      campaign,
      visitors,
      views: views.length,
      conversions,
      rate: visitors ? conversions / visitors : 0
    };
  });
}

function renderOverview() {
  const today = todayString();
  const todayViews = state.pageViews.filter((view) => view.created_at?.slice(0, 10) === today);
  const recentOnline = state.pageViews.filter((view) => Date.now() - new Date(view.created_at).getTime() < 5 * 60 * 1000);
  const engagement = state.events.filter((event) => event.event_type === "page_engagement").map((event) => Number(event.value || 0)).filter(Boolean);
  const avgStay = engagement.length ? engagement.reduce((sum, value) => sum + value, 0) / engagement.length : 0;
  const conversions = state.events.filter((event) => conversionEvents.includes(event.event_type));
  const kpis = [
    ["今日訪客數", uniqueCount(todayViews, "visitor_id"), "Visitors"],
    ["今日瀏覽量", todayViews.length, "PV"],
    ["不重複訪客", uniqueCount(state.pageViews, "visitor_id"), "UV"],
    ["即時在線人數", uniqueCount(recentOnline, "visitor_id"), "Live"],
    ["平均停留時間", formatSeconds(avgStay), "Duration"],
    ["跳出率", percent(pageRows().reduce((sum, row) => sum + row.bounceRate, 0) / Math.max(pageRows().length, 1)), "Bounce"],
    ["表單送出數", state.events.filter((event) => event.event_type === "form_submit").length, "Forms"],
    ["LINE 點擊數", state.events.filter((event) => event.event_type === "line_click" || event.event_type === "join_line_click").length, "LINE"],
    ["電話點擊數", state.events.filter((event) => event.event_type === "phone_click").length, "Calls"]
  ];
  document.querySelector("#trafficKpis").innerHTML = kpis.map(([label, value, meta]) => `
    <article><span>${escapeHTML(meta)}</span><strong>${typeof value === "number" ? formatCount(value) : escapeHTML(value)}</strong><p>${escapeHTML(label)}</p></article>
  `).join("");

  renderMiniBars("#trafficTrend7", getDailyPoints(7));
  renderMiniBars("#trafficTrend30", getDailyPoints(30));
  renderRankList("#topPages", pageRows().sort((a, b) => b.views - a.views).slice(0, 8).map((row) => ({ label: row.title, meta: row.path, value: row.views })));
  renderRankList("#topSources", sourceRows().sort((a, b) => b.visitors - a.visitors).slice(0, 8).map((row) => ({ label: sourceLabels[row.source] || row.source, meta: row.medium, value: row.visitors })));
  renderRankList("#deviceShare", [...groupBy(state.pageViews, (view) => view.device_type || "unknown").entries()].map(([device, views]) => ({ label: device, meta: "裝置", value: views.length })));
}

function renderTrafficAnalysis() {
  renderMiniBars("#hourlyTraffic", getHourlyPoints());
  renderMiniBars("#dailyTraffic", getDailyPoints(Math.min(30, Math.max(7, Math.ceil((getDateRange().end - getDateRange().start) / 86400000) + 1))));
  const daily = getDailyPoints(30).filter((point) => point.value > 0);
  renderTable("#trafficSummaryTable", ["日期", "PV", "UV", "Sessions"], daily.map((point) => {
    const views = state.pageViews.filter((view) => view.created_at?.slice(0, 10) === point.key);
    return [escapeHTML(point.key), formatCount(point.value), formatCount(uniqueCount(views, "visitor_id")), formatCount(uniqueCount(views, "session_id"))];
  }));
}

function renderSources() {
  const rows = sourceRows().sort((a, b) => b.visitors - a.visitors);
  document.querySelector("#sourceSummary").innerHTML = rows.length ? rows.slice(0, 7).map((row) => `
    <article><span>${escapeHTML(row.medium)}</span><strong>${escapeHTML(sourceLabels[row.source] || row.source)}</strong><p>${formatCount(row.visitors)} 訪客 · ${percent(row.rate)} 轉換率</p></article>
  `).join("") : '<div class="admin-empty-state">目前沒有來源資料。</div>';
  renderTable("#utmTable", ["utm_source", "utm_medium", "utm_campaign", "訪客數", "瀏覽量", "轉換數", "轉換率"], rows.map((row) => [
    escapeHTML(row.source),
    escapeHTML(row.medium),
    escapeHTML(row.campaign || "-"),
    formatCount(row.visitors),
    formatCount(row.views),
    formatCount(row.conversions),
    percent(row.rate)
  ]));
}

function renderPages() {
  const keyword = (pageSearchInput?.value || "").toLowerCase();
  const sortKey = pageSortSelect?.value || "views";
  const rows = pageRows()
    .filter((row) => `${row.path} ${row.title}`.toLowerCase().includes(keyword))
    .sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
  renderTable("#pagePerformanceTable", ["頁面", "PV", "UV", "平均停留", "跳出率", "離開率", "轉換"], rows.map((row) => [
    `<button type="button" class="traffic-page-link" data-page-path="${escapeHTML(row.path)}"><strong>${escapeHTML(row.title)}</strong><small>${escapeHTML(row.path)}</small></button>`,
    formatCount(row.views),
    formatCount(row.visitors),
    formatSeconds(row.avgStay),
    percent(row.bounceRate),
    percent(row.exitRate),
    formatCount(row.conversions)
  ]));
  renderPageDetail(rows[0]);
}

function renderPageDetail(row) {
  const element = document.querySelector("#pageDetail");
  if (!element) return;
  if (!row) {
    element.innerHTML = '<div class="admin-empty-state">點選頁面可查看詳細數據。</div>';
    return;
  }
  element.innerHTML = `
    <article>
      <p class="admin-eyebrow">Page Detail</p>
      <h2>${escapeHTML(row.title)}</h2>
      <p>${escapeHTML(row.path)}</p>
      <div class="traffic-mini-kpis">
        <span>PV <b>${formatCount(row.views)}</b></span>
        <span>UV <b>${formatCount(row.visitors)}</b></span>
        <span>停留 <b>${formatSeconds(row.avgStay)}</b></span>
        <span>轉換 <b>${formatCount(row.conversions)}</b></span>
      </div>
    </article>
  `;
}

function renderConversions() {
  const eventCounts = conversionEvents.map((type) => ({
    type,
    count: state.events.filter((event) => event.event_type === type).length
  }));
  document.querySelector("#conversionKpis").innerHTML = eventCounts.map((item) => `
    <article><span>${escapeHTML(item.type)}</span><strong>${formatCount(item.count)}</strong><p>轉換事件</p></article>
  `).join("");
  const homeViews = state.pageViews.filter((view) => view.page_path === "#home").length;
  const serviceViews = state.pageViews.filter((view) => /home-care|day-care|community|nursing|migrant-training|quality/.test(view.page_path || "")).length;
  const ctaClicks = state.events.filter((event) => event.event_type === "cta_click" || event.event_type === "reservation_click").length;
  const formSubmits = state.events.filter((event) => event.event_type === "form_submit").length;
  const funnel = [["首頁", homeViews], ["服務頁", serviceViews], ["CTA 點擊", ctaClicks], ["表單送出", formSubmits]];
  const max = Math.max(...funnel.map((item) => item[1]), 1);
  document.querySelector("#conversionFunnel").innerHTML = funnel.map(([label, value]) => `
    <article><strong>${escapeHTML(label)}</strong><div><span style="width:${Math.max((value / max) * 100, value ? 8 : 2)}%"></span></div><b>${formatCount(value)}</b></article>
  `).join("");
  renderTable("#conversionTable", ["事件", "次數"], eventCounts.map((item) => [escapeHTML(item.type), formatCount(item.count)]));
}

function renderSeo() {
  const rows = state.pages.map((page) => {
    const issues = [];
    if (!page.seo_title) issues.push("缺少 meta title");
    if (!page.seo_description) issues.push("缺少 meta description");
    if (!page.title) issues.push("缺少 H1 對應標題");
    const score = Math.max(30, 100 - issues.length * 18);
    return { ...page, issues, score };
  });
  const avgScore = rows.length ? rows.reduce((sum, row) => sum + row.score, 0) / rows.length : 0;
  const missingDesc = rows.filter((row) => row.issues.includes("缺少 meta description")).length;
  const missingTitle = rows.filter((row) => row.issues.includes("缺少 meta title")).length;
  document.querySelector("#seoSummary").innerHTML = [
    ["SEO 平均分數", Math.round(avgScore), "Score"],
    ["缺少描述", missingDesc, "Descriptions"],
    ["缺少標題", missingTitle, "Titles"],
    ["404 頁面", state.events.filter((event) => event.event_type === "error_404").length, "404"]
  ].map(([label, value, meta]) => `<article><span>${escapeHTML(meta)}</span><strong>${formatCount(value)}</strong><p>${escapeHTML(label)}</p></article>`).join("");
  renderTable("#seoAuditTable", ["頁面", "Meta Title", "Meta Description", "H1", "Canonical/Index", "SEO 分數", "問題"], rows.map((row) => [
    `<strong>${escapeHTML(row.title || row.slug)}</strong><small>/${escapeHTML(row.slug)}</small>`,
    row.seo_title ? "OK" : "缺少",
    row.seo_description ? "OK" : "缺少",
    row.title ? "OK" : "缺少",
    "可索引",
    formatCount(row.score),
    escapeHTML(row.issues.join("、") || "良好")
  ]));
}

async function checkSiteHealth() {
  const started = performance.now();
  try {
    const response = await fetch("/", { cache: "no-store" });
    const responseTime = Math.round(performance.now() - started);
    return {
      online: response.ok,
      responseTime,
      apiOk: Boolean(supabase),
      ssl: location.protocol === "https:",
      formOk: true
    };
  } catch {
    return { online: false, responseTime: null, apiOk: Boolean(supabase), ssl: location.protocol === "https:", formOk: false };
  }
}

function renderHealth() {
  const errors404 = state.events.filter((event) => event.event_type === "error_404").length;
  const errors500 = state.events.filter((event) => event.event_type === "error_500").length;
  const checks = [
    ["網站是否在線", state.siteHealth?.online ? "ok" : "critical", state.siteHealth?.online ? "正常" : "無法連線"],
    ["首頁載入速度", (state.siteHealth?.responseTime || 0) > 5000 ? "critical" : "ok", state.siteHealth?.responseTime ? `${state.siteHealth.responseTime}ms` : "待檢查"],
    ["API 狀態", state.siteHealth?.apiOk ? "ok" : "critical", state.siteHealth?.apiOk ? "Supabase 已設定" : "Supabase 未設定"],
    ["404 錯誤", errors404 > 10 ? "warning" : "ok", `${errors404} 筆`],
    ["500 錯誤", errors500 > 0 ? "critical" : "ok", `${errors500} 筆`],
    ["SSL 憑證", state.siteHealth?.ssl ? "ok" : "warning", state.siteHealth?.ssl ? "HTTPS 正常" : "非 HTTPS"],
    ["表單送出", state.siteHealth?.formOk ? "ok" : "warning", "前端事件可追蹤"]
  ];
  document.querySelector("#siteHealthGrid").innerHTML = checks.map(([label, status, text]) => `
    <article data-health="${escapeHTML(status)}"><span>${escapeHTML(status)}</span><strong>${escapeHTML(label)}</strong><p>${escapeHTML(text)}</p></article>
  `).join("");
  renderTable("#errorTable", ["類型", "數量"], [["404", formatCount(errors404)], ["500", formatCount(errors500)]]);
}

function generatedAlerts() {
  const today = todayString();
  const todayViews = state.pageViews.filter((view) => view.created_at?.slice(0, 10) === today).length;
  const yesterday = todayString(new Date(Date.now() - 86400000));
  const yesterdayViews = state.pageViews.filter((view) => view.created_at?.slice(0, 10) === yesterday).length;
  const formsToday = state.events.filter((event) => event.event_type === "form_submit" && event.created_at?.slice(0, 10) === today).length;
  const alerts = [...state.alerts];
  if (yesterdayViews > 0 && todayViews < yesterdayViews * 0.5) alerts.push({ severity: "warning", status: "unread", title: "流量下降超過 50%", message: `今日 PV ${todayViews}，昨日 PV ${yesterdayViews}` });
  if (formsToday === 0) alerts.push({ severity: "warning", status: "unread", title: "今日表單送出為 0", message: "請確認聯絡表單與課程報名是否正常。" });
  if (!state.siteHealth?.online) alerts.push({ severity: "critical", status: "unread", title: "網站無法連線", message: "首頁健康檢查失敗。" });
  if ((state.siteHealth?.responseTime || 0) > 5000) alerts.push({ severity: "critical", status: "unread", title: "首頁載入超過 5 秒", message: `${state.siteHealth.responseTime}ms` });
  return alerts;
}

function renderAlerts() {
  const alerts = generatedAlerts();
  const element = document.querySelector("#alertList");
  if (!element) return;
  element.innerHTML = alerts.length ? alerts.map((alert) => `
    <article data-severity="${escapeHTML(alert.severity)}">
      <span>${escapeHTML(alert.severity)}</span>
      <div><strong>${escapeHTML(alert.title)}</strong><p>${escapeHTML(alert.message || "")}</p><small>狀態：${escapeHTML(alert.status || "unread")}</small></div>
      ${alert.id ? `<button type="button" data-alert-id="${escapeHTML(alert.id)}" data-alert-status="resolved">標記解決</button>` : "<em>自動偵測</em>"}
    </article>
  `).join("") : '<div class="admin-empty-state">目前沒有異常警示。</div>';
}

function renderReports() {
  const list = document.querySelector("#reportScheduleList");
  if (!list) return;
  list.innerHTML = state.schedules.length ? `<div class="traffic-schedule-list">${state.schedules.map((schedule) => `
    <article><strong>${escapeHTML(schedule.report_type)}</strong><span>${escapeHTML(schedule.recipient_email)}</span><em>${schedule.is_enabled ? "啟用" : "停用"}</em></article>
  `).join("")}</div>` : '<div class="admin-empty-state">尚未設定自動寄送。</div>';
}

function renderAll() {
  renderOverview();
  renderTrafficAnalysis();
  renderSources();
  renderPages();
  renderConversions();
  renderSeo();
  renderHealth();
  renderAlerts();
  renderReports();
}

async function fetchData() {
  if (!supabase) return;
  const { start, end } = getDateRange();
  setStatus("正在讀取網站流量資料...", "info");
  refreshButton?.setAttribute("disabled", "true");
  try {
    const [viewsResult, eventsResult, alertsResult, pagesResult, schedulesResult] = await Promise.all([
      supabase.from("analytics_page_views").select("*").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()).order("created_at", { ascending: false }).limit(10000),
      supabase.from("analytics_events").select("*").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()).order("created_at", { ascending: false }).limit(10000),
      supabase.from("analytics_alerts").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("pages").select("id, slug, title, seo_title, seo_description, is_enabled, status").order("sort_order", { ascending: true }),
      supabase.from("analytics_report_schedules").select("*").order("created_at", { ascending: false })
    ]);
    if (viewsResult.error) throw viewsResult.error;
    if (eventsResult.error) throw eventsResult.error;
    if (alertsResult.error) throw alertsResult.error;
    if (pagesResult.error) throw pagesResult.error;
    if (schedulesResult.error) throw schedulesResult.error;
    state.pageViews = viewsResult.data || [];
    state.events = eventsResult.data || [];
    state.alerts = alertsResult.data || [];
    state.pages = pagesResult.data || [];
    state.schedules = schedulesResult.data || [];
    state.siteHealth = await checkSiteHealth();
    renderAll();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load traffic center", error);
    setStatus(`無法讀取網站流量資料：${error.message}`, "error");
  } finally {
    refreshButton?.removeAttribute("disabled");
  }
}

function exportRows(format) {
  const rows = pageRows();
  const csv = [
    ["page", "views", "visitors", "avg_stay", "bounce_rate", "conversions"],
    ...rows.map((row) => [row.path, row.views, row.visitors, Math.round(row.avgStay), Math.round(row.bounceRate * 100), row.conversions])
  ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const extension = format === "excel" ? "xls" : format;
  const mime = format === "pdf" ? "text/plain" : "text/csv";
  const blob = new Blob([format === "pdf" ? `Suiyuecare Traffic Report\n\n${csv}` : csv], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `suiyuecare-traffic-report.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll("[data-range]").forEach((button) => {
  button.addEventListener("click", () => {
    state.range = button.dataset.range;
    document.querySelectorAll("[data-range]").forEach((item) => item.classList.toggle("active", item === button));
    fetchData();
  });
});

document.querySelectorAll("[data-traffic-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-traffic-tab]").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll("[data-traffic-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.trafficPanel === button.dataset.trafficTab));
  });
});

document.querySelectorAll("[data-export]").forEach((button) => button.addEventListener("click", () => exportRows(button.dataset.export)));
document.querySelectorAll("[data-report-type]").forEach((button) => button.addEventListener("click", () => exportRows(button.dataset.reportType === "monthly" ? "pdf" : "csv")));
refreshButton?.addEventListener("click", fetchData);
pageSearchInput?.addEventListener("input", renderPages);
pageSortSelect?.addEventListener("change", renderPages);

document.querySelector("#pagePerformanceTable")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page-path]");
  if (!button) return;
  renderPageDetail(pageRows().find((row) => row.path === button.dataset.pagePath));
});

document.querySelector("#alertList")?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-alert-id]");
  if (!button) return;
  const { error } = await supabase.from("analytics_alerts").update({ status: button.dataset.alertStatus, resolved_at: new Date().toISOString() }).eq("id", button.dataset.alertId);
  if (!error) fetchData();
});

reportScheduleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(reportScheduleForm));
  const { error } = await supabase.from("analytics_report_schedules").insert(payload);
  if (error) {
    setStatus(`儲存寄送設定失敗：${error.message}`, "error");
    return;
  }
  reportScheduleForm.reset();
  fetchData();
});

function bootTrafficCenter() {
  const end = new Date();
  const start = new Date(Date.now() - 6 * 86400000);
  if (startInput) startInput.value = todayString(start);
  if (endInput) endInput.value = todayString(end);
  fetchData();
}

bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: bootTrafficCenter
}).catch((error) => reportAdminBootError(loading, error));
