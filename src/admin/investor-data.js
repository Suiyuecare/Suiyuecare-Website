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
const investorPageSettingsForm = document.querySelector("#investorPageSettingsForm");
const investorPageSettingsSelect = document.querySelector("#investorPageSettingsSelect");
const investorKpiEditor = document.querySelector("#investorKpiEditor");
const investorFaqEditor = document.querySelector("#investorFaqEditor");
const list = document.querySelector("#investorDataList");
const refreshButton = document.querySelector("#refreshInvestorDataButton");
const newNoticeButton = document.querySelector("#newNoticeButton");
const newFinancialButton = document.querySelector("#newFinancialButton");
const newChartButton = document.querySelector("#newChartButton");
const noticeFormTitle = document.querySelector("#noticeFormTitle");
const financialFormTitle = document.querySelector("#financialFormTitle");
const chartFormTitle = document.querySelector("#chartFormTitle");
const chartPointEditor = document.querySelector("#chartPointEditor");
const investorCountTargets = {
  notices: document.querySelector('[data-investor-count="notices"]'),
  financials: document.querySelector('[data-investor-count="financials"]'),
  charts: document.querySelector('[data-investor-count="charts"]'),
  files: document.querySelector('[data-investor-count="files"]')
};

let notices = [];
let financials = [];
let charts = [];
let downloadableFiles = [];
let investorPagesConfig = {};
let selectedInvestorPageSlug = "investors";

const investorPageDefaults = {
  investors: {
    eyebrow: "INVESTOR RELATIONS",
    title: "投資人專區",
    body: "歲悅長照以北北桃服務網絡為基礎，逐步建立居家照顧、日間照顧、護理復能、移工培訓與教育品管的長照整合平台。",
    primary_cta_text: "查看財務資訊",
    primary_cta_url: "#ir-finance",
    secondary_cta_text: "股東專區",
    secondary_cta_url: "#ir-shareholders",
    kpis: [
      { label: "服務區域", value: "11", note: "北北桃重點行政區" },
      { label: "設立進度", value: "8", note: "居家與日照籌設案" },
      { label: "治理項目", value: "12", note: "內控與風險管理節點" }
    ],
    snapshot: { label: "營運快照", title: "北北桃服務網絡", value: "11", unit: "區域", note: "服務據點、設立進度與合作資源依公告更新。" },
    faqs: []
  },
  "ir-finance": {
    eyebrow: "FINANCIAL INFORMATION",
    title: "財務資訊",
    body: "彙整每月營收、財務分析、季度財報與股東會年報，提供投資人快速掌握營運表現與成長趨勢。",
    primary_cta_text: "下載最新財報",
    primary_cta_url: "#ir-downloads",
    secondary_cta_text: "查看公告",
    secondary_cta_url: "#investors",
    kpis: [
      { label: "月營收趨勢", value: "+12.4%", note: "示範資料，可由後台更新。" },
      { label: "服務收入占比", value: "68%", note: "居家與日照服務。" },
      { label: "資料更新", value: "每月", note: "依公司公告為準。" }
    ],
    snapshot: { label: "財務快照", title: "穩健成長", value: "2026", unit: "年度", note: "財務數字將以正式公告資料為準。" },
    faqs: []
  },
  "ir-governance": {
    eyebrow: "CORPORATE GOVERNANCE",
    title: "公司治理",
    body: "以透明、誠信、風險控管與內部稽核為治理核心，建立可被檢視、可持續改善的長照營運制度。",
    primary_cta_text: "治理文件下載",
    primary_cta_url: "#ir-downloads",
    secondary_cta_text: "股東常見問答",
    secondary_cta_url: "#ir-shareholders",
    kpis: [
      { label: "治理主題", value: "8", note: "涵蓋內稽、風險、誠信經營。" },
      { label: "風險監控", value: "24/7", note: "以營運指標定期追蹤。" },
      { label: "申訴通道", value: "1", note: "吹哨者專區集中管理。" }
    ],
    snapshot: { label: "治理快照", title: "制度先行", value: "8", unit: "面向", note: "治理運作依董事會與內控制度持續調整。" },
    faqs: []
  },
  "ir-shareholders": {
    eyebrow: "SHAREHOLDER SERVICES",
    title: "股東專區",
    body: "提供股務資訊、股東會、法說會與常見問答，讓股東能快速找到需要的文件與聯絡窗口。",
    primary_cta_text: "查看股務資訊",
    primary_cta_url: "#ir-shareholders",
    secondary_cta_text: "下載文件",
    secondary_cta_url: "#ir-downloads",
    kpis: [
      { label: "股務項目", value: "4", note: "股務、股東會、法說會、FAQ。" },
      { label: "文件下載", value: "即時", note: "後台上傳後前台同步。" },
      { label: "聯絡窗口", value: "1", note: "統一對外服務信箱。" }
    ],
    snapshot: { label: "股東快照", title: "資訊清楚", value: "4", unit: "分類", note: "股東服務資料依正式公告與法規更新。" },
    faqs: [
      { question: "股東會資料會在哪裡公告？", answer: "股東會通知、議事手冊與年報可由股東專區下載。" },
      { question: "如何詢問股務問題？", answer: "可透過聯絡信箱或股務窗口提出，後續由專人回覆。" }
    ]
  }
};

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function cloneDefaultInvestorPages() {
  return JSON.parse(JSON.stringify(investorPageDefaults));
}

function normalizeInvestorPagesConfig(value) {
  const defaults = cloneDefaultInvestorPages();
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  Object.keys(defaults).forEach((slug) => {
    const page = source[slug] && typeof source[slug] === "object" ? source[slug] : {};
    defaults[slug] = {
      ...defaults[slug],
      ...page,
      kpis: Array.isArray(page.kpis) ? page.kpis : defaults[slug].kpis,
      snapshot: {
        ...defaults[slug].snapshot,
        ...(page.snapshot && typeof page.snapshot === "object" ? page.snapshot : {})
      },
      faqs: Array.isArray(page.faqs) ? page.faqs : defaults[slug].faqs
    };
  });
  return defaults;
}

function emptyRepeaterItem(type) {
  if (type === "faq") return { question: "", answer: "" };
  return { label: "", value: "", note: "" };
}

function renderRepeater(editor, type, rows = []) {
  if (!editor) return;
  const label = type === "faq" ? "FAQ" : "KPI";
  const dataRows = rows.length ? rows : [];
  editor.innerHTML = `
    <div class="admin-repeat-card-head">
      <strong>${label} 卡片</strong>
      <button type="button" data-add-investor-row="${type}">新增${label}</button>
    </div>
    <div class="admin-repeat-card-list">
      ${dataRows.map((row, index) => renderRepeaterRow(type, row, index)).join("")}
    </div>
    ${dataRows.length ? "" : `<div class="admin-empty-state">目前沒有${label}，前台會自動隱藏這一組內容。</div>`}
  `;
}

function renderRepeaterRow(type, row, index) {
  if (type === "faq") {
    return `
      <article class="admin-repeat-card-item" data-investor-row-type="faq" data-investor-row-index="${index}">
        <header><span>FAQ ${index + 1}</span><div><button type="button" data-move-investor-row="-1">上移</button><button type="button" data-move-investor-row="1">下移</button><button type="button" data-remove-investor-row>刪除</button></div></header>
        <div class="admin-form-grid compact">
          <label class="admin-field-wide"><span>問題</span><input data-investor-field="question" type="text" value="${escapeHTML(row.question || "")}" /></label>
          <label class="admin-field-wide"><span>回答</span><textarea data-investor-field="answer" rows="3">${escapeHTML(row.answer || "")}</textarea></label>
        </div>
      </article>
    `;
  }
  return `
    <article class="admin-repeat-card-item" data-investor-row-type="kpi" data-investor-row-index="${index}">
      <header><span>KPI ${index + 1}</span><div><button type="button" data-move-investor-row="-1">上移</button><button type="button" data-move-investor-row="1">下移</button><button type="button" data-remove-investor-row>刪除</button></div></header>
      <div class="admin-form-grid compact">
        <label><span>指標名稱</span><input data-investor-field="label" type="text" value="${escapeHTML(row.label || "")}" /></label>
        <label><span>指標數字</span><input data-investor-field="value" type="text" value="${escapeHTML(row.value || "")}" /></label>
        <label class="admin-field-wide"><span>補充說明</span><input data-investor-field="note" type="text" value="${escapeHTML(row.note || "")}" /></label>
      </div>
    </article>
  `;
}

function readRepeater(editor, type) {
  return [...editor.querySelectorAll(`[data-investor-row-type="${type}"]`)].map((row) => {
    const valueFor = (field) => row.querySelector(`[data-investor-field="${field}"]`)?.value.trim() || "";
    if (type === "faq") return { question: valueFor("question"), answer: valueFor("answer") };
    return { label: valueFor("label"), value: valueFor("value"), note: valueFor("note") };
  }).filter((row) => type === "faq" ? row.question || row.answer : row.label || row.value || row.note);
}

function getCurrentInvestorPageFromForm() {
  return {
    eyebrow: investorPageSettingsForm.elements.eyebrow.value.trim(),
    title: investorPageSettingsForm.elements.title.value.trim(),
    body: investorPageSettingsForm.elements.body.value.trim(),
    primary_cta_text: investorPageSettingsForm.elements.primary_cta_text.value.trim(),
    primary_cta_url: investorPageSettingsForm.elements.primary_cta_url.value.trim(),
    secondary_cta_text: investorPageSettingsForm.elements.secondary_cta_text.value.trim(),
    secondary_cta_url: investorPageSettingsForm.elements.secondary_cta_url.value.trim(),
    snapshot: {
      label: investorPageSettingsForm.elements.snapshot_label.value.trim(),
      title: investorPageSettingsForm.elements.snapshot_title.value.trim(),
      value: investorPageSettingsForm.elements.snapshot_value.value.trim(),
      unit: investorPageSettingsForm.elements.snapshot_unit.value.trim(),
      note: investorPageSettingsForm.elements.snapshot_note.value.trim()
    },
    kpis: readRepeater(investorKpiEditor, "kpi"),
    faqs: readRepeater(investorFaqEditor, "faq")
  };
}

function updateCurrentInvestorPageDraft() {
  if (!investorPageSettingsForm || !investorPageSettingsSelect) return;
  investorPagesConfig[selectedInvestorPageSlug] = getCurrentInvestorPageFromForm();
}

function fillInvestorPageSettings(slug = "investors") {
  if (!investorPageSettingsForm) return;
  selectedInvestorPageSlug = slug;
  investorPageSettingsSelect.value = slug;
  const page = investorPagesConfig[slug] || investorPageDefaults[slug];
  investorPageSettingsForm.elements.eyebrow.value = page.eyebrow || "";
  investorPageSettingsForm.elements.title.value = page.title || "";
  investorPageSettingsForm.elements.body.value = page.body || "";
  investorPageSettingsForm.elements.primary_cta_text.value = page.primary_cta_text || "";
  investorPageSettingsForm.elements.primary_cta_url.value = page.primary_cta_url || "";
  investorPageSettingsForm.elements.secondary_cta_text.value = page.secondary_cta_text || "";
  investorPageSettingsForm.elements.secondary_cta_url.value = page.secondary_cta_url || "";
  investorPageSettingsForm.elements.snapshot_label.value = page.snapshot?.label || "";
  investorPageSettingsForm.elements.snapshot_title.value = page.snapshot?.title || "";
  investorPageSettingsForm.elements.snapshot_value.value = page.snapshot?.value || "";
  investorPageSettingsForm.elements.snapshot_unit.value = page.snapshot?.unit || "";
  investorPageSettingsForm.elements.snapshot_note.value = page.snapshot?.note || "";
  renderRepeater(investorKpiEditor, "kpi", page.kpis || []);
  renderRepeater(investorFaqEditor, "faq", page.faqs || []);
}

async function loadInvestorPageSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value_json")
    .eq("setting_key", "investor_pages")
    .maybeSingle();
  if (error) throw error;
  investorPagesConfig = normalizeInvestorPagesConfig(data?.value_json);
  fillInvestorPageSettings(investorPageSettingsSelect?.value || "investors");
}

async function saveInvestorPageSettings(event) {
  event.preventDefault();
  updateCurrentInvestorPageDraft();
  setStatus("正在儲存投資人頁面設定...", "info");
  const payload = {
    setting_group: "investor",
    setting_key: "investor_pages",
    setting_label: "投資人專區文案/KPI/FAQ",
    value_text: null,
    value_json: investorPagesConfig,
    help_text: "由投資人資料管理頁的表單維護，控制投資人首頁、財務資訊、公司治理與股東專區的 Hero、KPI、FAQ 與 CTA。",
    sort_order: 130,
    is_enabled: true
  };
  const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "setting_key" });
  if (error) {
    setStatus(`儲存投資人頁面設定失敗：${error.message}`, "error");
    return;
  }
  setStatus("投資人頁面設定已儲存，重新整理前台即可看到更新。", "success");
  await loadInvestorPageSettings();
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

function publishedAt(status) {
  return status === "published" ? new Date().toISOString() : null;
}

function fileOptionLabel(file) {
  return [file.title, file.file_type, file.category].filter(Boolean).join("｜");
}

function renderFileSelectOptions(selectedId = "") {
  const rows = downloadableFiles.map((file) => {
    const suffix = file.status === "published" && file.is_enabled ? "" : "（未發布/停用）";
    return `<option value="${escapeHTML(file.id)}" ${file.id === selectedId ? "selected" : ""}>${escapeHTML(fileOptionLabel(file) + suffix)}</option>`;
  });
  return [`<option value="">不綁定檔案</option>`].concat(rows).join("");
}

function refreshFileSelects(selected = {}) {
  if (noticeForm?.elements.file_id) noticeForm.elements.file_id.innerHTML = renderFileSelectOptions(selected.notice || noticeForm.elements.file_id.value || "");
  if (financialForm?.elements.file_id) financialForm.elements.file_id.innerHTML = renderFileSelectOptions(selected.financial || financialForm.elements.file_id.value || "");
}

function linkedFileLabel(fileId) {
  if (!fileId) return "";
  const file = downloadableFiles.find((item) => item.id === fileId);
  return file ? `綁定檔案：${file.title}` : "綁定檔案：已選擇";
}

function resetNoticeForm() {
  noticeForm.reset();
  noticeForm.elements.id.value = "";
  noticeForm.elements.file_id.innerHTML = renderFileSelectOptions();
  noticeForm.elements.status.value = "draft";
  noticeForm.elements.is_enabled.checked = true;
  noticeForm.elements.sort_order.value = notices.length * 10;
  noticeFormTitle.textContent = "新增公告";
}

function resetFinancialForm() {
  financialForm.reset();
  financialForm.elements.id.value = "";
  financialForm.elements.file_id.innerHTML = renderFileSelectOptions();
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
  chartForm.elements.metadata_source.value = "";
  chartForm.elements.metadata_note.value = "";
  renderChartPointEditor(chartForm.elements.chart_type.value, [defaultPoint(chartForm.elements.chart_type.value)]);
  chartFormTitle.textContent = "新增圖表資料";
}

function renderList() {
  if (investorCountTargets.notices) investorCountTargets.notices.textContent = notices.length;
  if (investorCountTargets.financials) investorCountTargets.financials.textContent = financials.length;
  if (investorCountTargets.charts) investorCountTargets.charts.textContent = charts.length;
  if (investorCountTargets.files) investorCountTargets.files.textContent = downloadableFiles.length;
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
                <td><strong>${escapeHTML(item.title || item.chart_title)}</strong><small>${escapeHTML([item.summary || item.note || item.chart_key || "", linkedFileLabel(item.file_id)].filter(Boolean).join("｜"))}</small></td>
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
    const [{ data: noticeData, error: noticeError }, { data: financialData, error: financialError }, { data: chartData, error: chartError }, { data: fileData, error: fileError }] = await Promise.all([
      supabase.from("investor_notices").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
      supabase.from("investor_financial_items").select("*").order("sort_order", { ascending: true }).order("updated_at", { ascending: false }),
      supabase.from("investor_chart_datasets").select("*").order("page_slug", { ascending: true }).order("sort_order", { ascending: true }),
      supabase.from("downloadable_files").select("id,title,file_type,category,status,is_enabled,updated_at").order("category", { ascending: true }).order("updated_at", { ascending: false })
    ]);
    if (noticeError) throw noticeError;
    if (financialError) throw financialError;
    if (chartError) throw chartError;
    if (fileError) throw fileError;
    notices = noticeData || [];
    financials = financialData || [];
    charts = chartData || [];
    downloadableFiles = fileData || [];
    await loadInvestorPageSettings();
    refreshFileSelects();
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
    downloadableFiles = [];
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
  noticeForm.elements.body.value = item.body || "";
  noticeForm.elements.link_url.value = item.link_url || "";
  noticeForm.elements.file_id.innerHTML = renderFileSelectOptions(item.file_id || "");
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
  financialForm.elements.file_id.innerHTML = renderFileSelectOptions(item.file_id || "");
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
  chartForm.elements.metadata_source.value = item.metadata?.source || "";
  chartForm.elements.metadata_note.value = item.metadata?.note || "";
  renderChartPointEditor(chartForm.elements.chart_type.value, item.data_points || []);
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
    body: noticeForm.elements.body.value.trim() || null,
    link_url: noticeForm.elements.link_url.value.trim() || null,
    file_id: noticeForm.elements.file_id.value || null,
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
    file_id: financialForm.elements.file_id.value || null,
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
    metadata: {
      source: chartForm.elements.metadata_source.value.trim(),
      note: chartForm.elements.metadata_note.value.trim()
    },
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

function handleInvestorRepeaterClick(event) {
  const addButton = event.target.closest("[data-add-investor-row]");
  const removeButton = event.target.closest("[data-remove-investor-row]");
  const moveButton = event.target.closest("[data-move-investor-row]");
  if (!addButton && !removeButton && !moveButton) return;

  const type = addButton?.dataset.addInvestorRow || event.target.closest("[data-investor-row-type]")?.dataset.investorRowType;
  const editor = type === "faq" ? investorFaqEditor : investorKpiEditor;
  const rows = readRepeater(editor, type);

  if (addButton) rows.push(emptyRepeaterItem(type));
  if (removeButton) {
    const row = removeButton.closest("[data-investor-row-index]");
    rows.splice(Number(row.dataset.investorRowIndex), 1);
  }
  if (moveButton) {
    const row = moveButton.closest("[data-investor-row-index]");
    const from = Number(row.dataset.investorRowIndex);
    const to = from + Number(moveButton.dataset.moveInvestorRow);
    if (to >= 0 && to < rows.length) {
      const [item] = rows.splice(from, 1);
      rows.splice(to, 0, item);
    }
  }

  renderRepeater(editor, type, rows);
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
investorPageSettingsForm?.addEventListener("submit", saveInvestorPageSettings);
investorPageSettingsSelect?.addEventListener("change", () => {
  updateCurrentInvestorPageDraft();
  fillInvestorPageSettings(investorPageSettingsSelect.value);
});
investorKpiEditor?.addEventListener("click", handleInvestorRepeaterClick);
investorFaqEditor?.addEventListener("click", handleInvestorRepeaterClick);
chartForm?.elements.chart_type?.addEventListener("change", () => {
  const nextType = chartForm.elements.chart_type.value;
  renderChartPointEditor(nextType, readChartPoints().length ? readChartPoints() : [defaultPoint(nextType)]);
});
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
