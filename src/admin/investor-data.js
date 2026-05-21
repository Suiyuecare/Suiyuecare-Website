import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#investorDataStatus");
const noticeForm = document.querySelector("#noticeForm");
const financialForm = document.querySelector("#financialForm");
const chartForm = document.querySelector("#chartForm");
const list = document.querySelector("#investorDataList");
const refreshButton = document.querySelector("#refreshInvestorDataButton");
const newNoticeButton = document.querySelector("#newNoticeButton");
const newFinancialButton = document.querySelector("#newFinancialButton");
const newChartButton = document.querySelector("#newChartButton");
const noticeFormTitle = document.querySelector("#noticeFormTitle");
const financialFormTitle = document.querySelector("#financialFormTitle");
const chartFormTitle = document.querySelector("#chartFormTitle");
const chartPointEditor = document.querySelector("#chartPointEditor");

let notices = [];
let financials = [];
let charts = [];

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function parseJsonArray(value, label) {
  try {
    const parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) throw new Error("必須是陣列");
    return parsed;
  } catch (error) {
    throw new Error(`${label} JSON 格式錯誤：${error.message}`);
  }
}

function parseJsonObject(value, label) {
  try {
    const parsed = JSON.parse(value || "{}");
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("必須是物件");
    return parsed;
  } catch (error) {
    throw new Error(`${label} JSON 格式錯誤：${error.message}`);
  }
}

function defaultPoint(type = "bar") {
  if (type === "progress") {
    return {
      area: "臺北市",
      type: "居家長照機構",
      percent: 65,
      status: "籌設中",
      steps: [["場地評估", 100], ["文件送審", 70], ["人員招募", 45]]
    };
  }
  if (type === "score") return { label: "治理分數", value: 88, unit: "分" };
  return { label: "項目", value: 50, unit: "" };
}

function normalizeSteps(value) {
  if (Array.isArray(value)) {
    return value
      .map((step) => Array.isArray(step) ? [String(step[0] || ""), Number(step[1] || 0)] : [String(step.label || ""), Number(step.value || 0)])
      .filter(([label]) => label);
  }
  return [];
}

function formatSteps(steps = []) {
  return normalizeSteps(steps).map(([label, value]) => `${label}:${value}`).join("\n");
}

function parseSteps(value = "") {
  return value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [label, valueText = "0"] = row.split(":");
      return [label.trim(), Number(valueText.trim() || 0)];
    })
    .filter(([label]) => label);
}

function renderChartPointEditor(type = "bar", points = []) {
  if (!chartPointEditor) return;
  const rows = points.length ? points : [defaultPoint(type)];
  chartPointEditor.dataset.chartType = type;
  chartPointEditor.innerHTML = `
    <div class="admin-chart-point-head">
      <strong>${type === "progress" ? "進度卡資料" : "圖表數據列"}</strong>
      <button type="button" data-add-chart-point>新增資料列</button>
    </div>
    <div class="admin-chart-point-list">
      ${rows.map((point, index) => renderChartPointRow(type, point, index)).join("")}
    </div>
  `;
}

function renderChartPointRow(type, point, index) {
  if (type === "progress") {
    return `
      <article class="admin-chart-point-row" data-chart-point-index="${index}">
        <header><span>進度 ${index + 1}</span><div><button type="button" data-move-chart-point="-1">上移</button><button type="button" data-move-chart-point="1">下移</button><button type="button" data-remove-chart-point>刪除</button></div></header>
        <div class="admin-form-grid compact">
          <label><span>區域/項目</span><input data-point-field="area" type="text" value="${escapeHTML(point.area || point.label || "")}" /></label>
          <label><span>類型</span><input data-point-field="type" type="text" value="${escapeHTML(point.type || "")}" /></label>
          <label><span>完成度 %</span><input data-point-field="percent" type="number" min="0" max="100" value="${Number(point.percent ?? point.value ?? 0)}" /></label>
          <label><span>目前狀態</span><input data-point-field="status" type="text" value="${escapeHTML(point.status || "")}" /></label>
          <label class="admin-field-wide"><span>階段進度（每行：階段名稱:百分比）</span><textarea data-point-field="steps" rows="4">${escapeHTML(formatSteps(point.steps))}</textarea></label>
        </div>
      </article>
    `;
  }
  return `
    <article class="admin-chart-point-row" data-chart-point-index="${index}">
      <header><span>資料 ${index + 1}</span><div><button type="button" data-move-chart-point="-1">上移</button><button type="button" data-move-chart-point="1">下移</button><button type="button" data-remove-chart-point>刪除</button></div></header>
      <div class="admin-form-grid compact">
        <label><span>標籤</span><input data-point-field="label" type="text" value="${escapeHTML(point.label || point.area || "")}" /></label>
        <label><span>數值</span><input data-point-field="value" type="number" step="0.01" value="${Number(point.value ?? point.percent ?? 0)}" /></label>
        <label><span>單位</span><input data-point-field="unit" type="text" value="${escapeHTML(point.unit || "")}" /></label>
        <label><span>備註</span><input data-point-field="note" type="text" value="${escapeHTML(point.note || "")}" /></label>
      </div>
    </article>
  `;
}

function readChartPoints() {
  const type = chartForm.elements.chart_type.value;
  return [...chartPointEditor.querySelectorAll(".admin-chart-point-row")].map((row) => {
    const valueFor = (field) => row.querySelector(`[data-point-field="${field}"]`)?.value.trim() || "";
    if (type === "progress") {
      return {
        area: valueFor("area"),
        type: valueFor("type"),
        percent: Number(valueFor("percent") || 0),
        status: valueFor("status"),
        steps: parseSteps(valueFor("steps"))
      };
    }
    return {
      label: valueFor("label"),
      value: Number(valueFor("value") || 0),
      unit: valueFor("unit"),
      note: valueFor("note")
    };
  }).filter((point) => type === "progress" ? point.area : point.label);
}

function syncHiddenChartData() {
  chartForm.elements.data_points.value = JSON.stringify(readChartPoints(), null, 2);
}

function publishedAt(status) {
  return status === "published" ? new Date().toISOString() : null;
}

function resetNoticeForm() {
  noticeForm.reset();
  noticeForm.elements.id.value = "";
  noticeForm.elements.status.value = "draft";
  noticeForm.elements.is_enabled.checked = true;
  noticeForm.elements.sort_order.value = notices.length * 10;
  noticeFormTitle.textContent = "新增公告";
}

function resetFinancialForm() {
  financialForm.reset();
  financialForm.elements.id.value = "";
  financialForm.elements.status.value = "draft";
  financialForm.elements.is_enabled.checked = true;
  financialForm.elements.sort_order.value = financials.length * 10;
  financialFormTitle.textContent = "新增財務資料";
}

function resetChartForm() {
  chartForm.reset();
  chartForm.elements.id.value = "";
  chartForm.elements.status.value = "draft";
  chartForm.elements.is_enabled.checked = true;
  chartForm.elements.sort_order.value = charts.length * 10;
  chartForm.elements.unit_label.value = "";
  chartForm.elements.metadata.value = "{}";
  renderChartPointEditor(chartForm.elements.chart_type.value, [defaultPoint(chartForm.elements.chart_type.value)]);
  syncHiddenChartData();
  chartFormTitle.textContent = "新增圖表資料";
}

function renderList() {
  list.innerHTML = `
    ${renderTable("公告", notices, "notice", (item) => `${item.notice_type} · ${item.date_label || ""}`)}
    ${renderTable("財務資料", financials, "financial", (item) => `${item.item_type} · ${item.period_label}`)}
    ${renderTable("圖表資料", charts, "chart", (item) => `${item.page_slug} · ${item.chart_type}`)}
  `;
}

function renderTable(title, rows, type, meta) {
  return `
    <article class="admin-section-card">
      <header><div><span>${escapeHTML(type)}</span><strong>${escapeHTML(title)}</strong></div></header>
      <div class="admin-table-wrap">
        <table class="admin-data-table">
          <thead><tr><th>標題</th><th>類型</th><th>狀態</th><th>更新</th><th>操作</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map((item) => `
              <tr>
                <td><strong>${escapeHTML(item.title || item.chart_title)}</strong><small>${escapeHTML(item.summary || item.note || item.chart_key || "")}</small></td>
                <td>${escapeHTML(meta(item))}</td>
                <td>${escapeHTML(item.status)}${item.is_enabled ? "" : " / 停用"}</td>
                <td>${formatUpdatedAt(item.updated_at)}</td>
                <td><div class="admin-table-actions"><button type="button" data-edit-${type}="${escapeHTML(item.id)}">編輯</button><button type="button" data-delete-${type}="${escapeHTML(item.id)}">刪除</button></div></td>
              </tr>
            `).join("") : `<tr><td colspan="5"><div class="admin-empty-state">尚無資料</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

async function loadInvestorData() {
  setStatus("正在讀取投資人資料...", "info");
  try {
    const [{ data: noticeData, error: noticeError }, { data: financialData, error: financialError }, { data: chartData, error: chartError }] = await Promise.all([
      supabase.from("investor_notices").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
      supabase.from("investor_financial_items").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
      supabase.from("investor_chart_datasets").select("*").order("page_slug", { ascending: true }).order("sort_order", { ascending: true })
    ]);
    if (noticeError) throw noticeError;
    if (financialError) throw financialError;
    if (chartError) throw chartError;
    notices = noticeData || [];
    financials = financialData || [];
    charts = chartData || [];
    renderList();
    resetNoticeForm();
    resetFinancialForm();
    resetChartForm();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load investor data", error);
    notices = [];
    financials = [];
    charts = [];
    renderList();
    setStatus(`讀取失敗：${error.message}`, "error");
  }
}

function fillNotice(item) {
  noticeForm.elements.id.value = item.id;
  noticeForm.elements.notice_type.value = item.notice_type || "news";
  noticeForm.elements.date_label.value = item.date_label || "";
  noticeForm.elements.title.value = item.title || "";
  noticeForm.elements.summary.value = item.summary || "";
  noticeForm.elements.link_url.value = item.link_url || "";
  noticeForm.elements.sort_order.value = item.sort_order || 0;
  noticeForm.elements.status.value = item.status || "draft";
  noticeForm.elements.is_enabled.checked = Boolean(item.is_enabled);
  noticeFormTitle.textContent = `編輯：${item.title}`;
}

function fillFinancial(item) {
  financialForm.elements.id.value = item.id;
  financialForm.elements.item_type.value = item.item_type || "monthly_revenue";
  financialForm.elements.period_label.value = item.period_label || "";
  financialForm.elements.title.value = item.title || "";
  financialForm.elements.amount.value = item.amount ?? "";
  financialForm.elements.amount_label.value = item.amount_label || "";
  financialForm.elements.growth_label.value = item.growth_label || "";
  financialForm.elements.note.value = item.note || "";
  financialForm.elements.sort_order.value = item.sort_order || 0;
  financialForm.elements.status.value = item.status || "draft";
  financialForm.elements.is_enabled.checked = Boolean(item.is_enabled);
  financialFormTitle.textContent = `編輯：${item.title}`;
}

function fillChart(item) {
  chartForm.elements.id.value = item.id;
  chartForm.elements.page_slug.value = item.page_slug || "investors";
  chartForm.elements.chart_key.value = item.chart_key || "";
  chartForm.elements.chart_title.value = item.chart_title || "";
  chartForm.elements.chart_type.value = item.chart_type || "bar";
  chartForm.elements.unit_label.value = item.unit_label || "";
  chartForm.elements.metadata.value = JSON.stringify(item.metadata || {}, null, 2);
  renderChartPointEditor(chartForm.elements.chart_type.value, item.data_points || []);
  syncHiddenChartData();
  chartForm.elements.sort_order.value = item.sort_order || 0;
  chartForm.elements.status.value = item.status || "draft";
  chartForm.elements.is_enabled.checked = Boolean(item.is_enabled);
  chartFormTitle.textContent = `編輯：${item.chart_title}`;
}

async function saveNotice(event) {
  event.preventDefault();
  const status = noticeForm.elements.status.value;
  const payload = {
    notice_type: noticeForm.elements.notice_type.value,
    date_label: noticeForm.elements.date_label.value.trim() || null,
    title: noticeForm.elements.title.value.trim(),
    summary: noticeForm.elements.summary.value.trim() || null,
    link_url: noticeForm.elements.link_url.value.trim() || null,
    sort_order: Number(noticeForm.elements.sort_order.value || 0),
    status,
    published_at: publishedAt(status),
    is_enabled: noticeForm.elements.is_enabled.checked
  };
  await upsertRow("investor_notices", noticeForm.elements.id.value, payload, "公告");
}

async function saveFinancial(event) {
  event.preventDefault();
  const status = financialForm.elements.status.value;
  const payload = {
    item_type: financialForm.elements.item_type.value,
    period_label: financialForm.elements.period_label.value.trim(),
    title: financialForm.elements.title.value.trim(),
    amount: financialForm.elements.amount.value ? Number(financialForm.elements.amount.value) : null,
    amount_label: financialForm.elements.amount_label.value.trim() || null,
    growth_label: financialForm.elements.growth_label.value.trim() || null,
    note: financialForm.elements.note.value.trim() || null,
    sort_order: Number(financialForm.elements.sort_order.value || 0),
    status,
    published_at: publishedAt(status),
    is_enabled: financialForm.elements.is_enabled.checked
  };
  await upsertRow("investor_financial_items", financialForm.elements.id.value, payload, "財務資料");
}

async function saveChart(event) {
  event.preventDefault();
  const status = chartForm.elements.status.value;
  const payload = {
    page_slug: chartForm.elements.page_slug.value,
    chart_key: chartForm.elements.chart_key.value.trim(),
    chart_title: chartForm.elements.chart_title.value.trim(),
    chart_type: chartForm.elements.chart_type.value,
    unit_label: chartForm.elements.unit_label.value.trim() || null,
    data_points: readChartPoints(),
    metadata: parseJsonObject(chartForm.elements.metadata.value, "補充設定"),
    sort_order: Number(chartForm.elements.sort_order.value || 0),
    status,
    published_at: publishedAt(status),
    is_enabled: chartForm.elements.is_enabled.checked
  };
  await upsertRow("investor_chart_datasets", chartForm.elements.id.value, payload, "圖表資料");
}

async function upsertRow(table, id, payload, label) {
  setStatus(`正在儲存${label}...`, "info");
  const query = id ? supabase.from(table).update(payload).eq("id", id) : supabase.from(table).insert(payload);
  const { error } = await query;
  if (error) {
    setStatus(`儲存失敗：${error.message}`, "error");
    return;
  }
  setStatus(`${label}已儲存。`, "success");
  await loadInvestorData();
}

async function deleteRow(table, id, label) {
  if (!window.confirm(`確定刪除這筆${label}嗎？`)) return;
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) setStatus(`刪除失敗：${error.message}`, "error");
  else await loadInvestorData();
}

noticeForm?.addEventListener("submit", saveNotice);
financialForm?.addEventListener("submit", saveFinancial);
chartForm?.addEventListener("submit", saveChart);
chartForm?.elements.chart_type?.addEventListener("change", () => {
  const nextType = chartForm.elements.chart_type.value;
  renderChartPointEditor(nextType, readChartPoints().length ? readChartPoints() : [defaultPoint(nextType)]);
  syncHiddenChartData();
});
chartPointEditor?.addEventListener("input", syncHiddenChartData);
chartPointEditor?.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-chart-point]");
  const removeButton = event.target.closest("[data-remove-chart-point]");
  const moveButton = event.target.closest("[data-move-chart-point]");
  const type = chartForm.elements.chart_type.value;
  const points = readChartPoints();
  if (addButton) points.push(defaultPoint(type));
  if (removeButton) {
    const row = removeButton.closest("[data-chart-point-index]");
    points.splice(Number(row.dataset.chartPointIndex), 1);
  }
  if (moveButton) {
    const row = moveButton.closest("[data-chart-point-index]");
    const from = Number(row.dataset.chartPointIndex);
    const to = from + Number(moveButton.dataset.moveChartPoint);
    if (to >= 0 && to < points.length) {
      const [item] = points.splice(from, 1);
      points.splice(to, 0, item);
    }
  }
  if (addButton || removeButton || moveButton) {
    renderChartPointEditor(type, points.length ? points : [defaultPoint(type)]);
    syncHiddenChartData();
  }
});
newNoticeButton?.addEventListener("click", resetNoticeForm);
newFinancialButton?.addEventListener("click", resetFinancialForm);
newChartButton?.addEventListener("click", resetChartForm);
refreshButton?.addEventListener("click", loadInvestorData);
list?.addEventListener("click", (event) => {
  const editNotice = event.target.closest("[data-edit-notice]");
  const editFinancial = event.target.closest("[data-edit-financial]");
  const editChart = event.target.closest("[data-edit-chart]");
  const deleteNotice = event.target.closest("[data-delete-notice]");
  const deleteFinancial = event.target.closest("[data-delete-financial]");
  const deleteChart = event.target.closest("[data-delete-chart]");
  if (editNotice) fillNotice(notices.find((item) => item.id === editNotice.dataset.editNotice));
  if (editFinancial) fillFinancial(financials.find((item) => item.id === editFinancial.dataset.editFinancial));
  if (editChart) fillChart(charts.find((item) => item.id === editChart.dataset.editChart));
  if (deleteNotice) deleteRow("investor_notices", deleteNotice.dataset.deleteNotice, "公告");
  if (deleteFinancial) deleteRow("investor_financial_items", deleteFinancial.dataset.deleteFinancial, "財務資料");
  if (deleteChart) deleteRow("investor_chart_datasets", deleteChart.dataset.deleteChart, "圖表資料");
});

bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadInvestorData
}).catch((error) => reportAdminBootError(loading, error));
