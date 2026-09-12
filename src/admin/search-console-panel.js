import { escapeHTML } from "./utils.js";
import { MAX_GSC_FILE_BYTES, parseSearchConsoleCsv, summarizeSearchConsoleRows, analyzeSearchConsoleRows, opportunityLabels, safeSearchConsolePageUrl, searchConsoleCsv } from "./search-console-data.mjs";

const labels = { query: "查詢", page: "網頁" };
const count = (value) => value === null ? "—" : value.toLocaleString("zh-TW");
const decimal = (value) => value === null ? "—" : value.toLocaleString("zh-TW", { maximumFractionDigits: 2 });
const percent = (value) => value === null ? "—" : `${(value * 100).toFixed(2)}%`;
const pageSize = 25;

// Called only by the protected admin page's onReady callback. Imported content never
// enters the analytics state, storage, fetch, or Supabase. Each dimension is independent.
export function initSearchConsolePanel(root, { canExport = false } = {}) {
  if (!root) return;
  const find = (id) => root.querySelector(`#${id}`);
  const datasets = new Map();
  const listeners = [];
  let dimension = "query", pageIndex = 0, importEpoch = 0;
  const on = (id, event, handler) => {
    const element = find(id);
    element.addEventListener(event, handler);
    listeners.push(() => element.removeEventListener(event, handler));
  };
  const status = (message = "", type = "info") => {
    const element = find("gscStatus");
    element.textContent = message;
    element.hidden = !message;
    element.dataset.status = type;
    element.setAttribute("role", type === "error" ? "alert" : "status");
  };
  function selectedRows() {
    const minInput = find("gscMinImpressions"), ctrInput = find("gscMaxCtr");
    if (!minInput.value.trim() || !ctrInput.value.trim() || !minInput.validity.valid || !ctrInput.validity.valid) throw new Error("請填入有效的最低曝光與 CTR 門檻。");
    return analyzeSearchConsoleRows(datasets.get(dimension)?.rows || [], {
      minImpressions: Number(minInput.value), maxCtr: Number(ctrInput.value) / 100,
      filter: find("gscOpportunity").value, sort: find("gscSort").value, search: find("gscSearch").value
    });
  }
  function render() {
    const dataset = datasets.get(dimension);
    find("gscResults").hidden = !dataset;
    find("gscEmpty").hidden = Boolean(dataset);
    for (const option of find("gscDimension").options) {
      option.disabled = !datasets.has(option.value);
      option.textContent = `${labels[option.value]}${datasets.has(option.value) ? `（${datasets.get(option.value).rows.length.toLocaleString("zh-TW")} 列）` : "（尚未匯入）"}`;
    }
    find("gscDimension").value = dimension;
    find("gscExport").disabled = true;
    find("gscExport").title = canExport ? "" : "此帳號未開放分析資料匯出權限。";
    if (!dataset) {
      for (const id of ["gscSource", "gscSummary", "gscTable", "gscResultCount", "gscPageInfo"]) find(id).textContent = "";
      return;
    }
    const period = dataset.periodStart && dataset.periodEnd ? `${dataset.periodStart} 至 ${dataset.periodEnd}（自行填寫）` : "期間未提供";
    find("gscSource").textContent = `來源：${dataset.filename}｜${labels[dimension]}資料｜${period}。${dataset.missingRows ? ` ${dataset.missingRows} 列有未知數值，無法完整計算的總計顯示「—」；資料不足的列不判斷機會。` : ""}`;
    const summary = summarizeSearchConsoleRows(dataset.rows);
    find("gscSummary").innerHTML = [
      ["匯入列點擊", count(summary.clicks)], ["匯入列曝光", count(summary.impressions)],
      ["匯入列 CTR", percent(summary.ctr)], ["曝光加權平均排名", decimal(summary.position)]
    ].map(([label, value]) => `<article><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></article>`).join("");
    let rows;
    try { rows = selectedRows(); }
    catch (error) {
      find("gscTable").innerHTML = "";
      find("gscResultCount").textContent = error.message;
      find("gscPrevious").disabled = true;
      find("gscNext").disabled = true;
      find("gscPageInfo").textContent = "";
      return;
    }
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    pageIndex = Math.min(pageIndex, pageCount - 1);
    find("gscResultCount").textContent = `${rows.length.toLocaleString("zh-TW")} 列符合目前篩選，共 ${dataset.rows.length.toLocaleString("zh-TW")} 列匯入資料。`;
    find("gscExport").disabled = !canExport || !rows.length;
    find("gscPrevious").disabled = pageIndex === 0;
    find("gscNext").disabled = pageIndex >= pageCount - 1;
    find("gscPageInfo").textContent = `${pageIndex + 1} / ${pageCount} 頁，每頁最多 ${pageSize} 列`;
    if (!rows.length) {
      find("gscTable").innerHTML = '<div class="admin-empty-state">沒有符合條件的資料，可調整門檻或切換「全部匯入列」。</div>';
      return;
    }
    const headings = [labels[dimension], "點擊", "曝光", "CTR", "平均排名", "檢查方向"];
    find("gscTable").innerHTML = `<div class="admin-table-wrap"><table class="admin-data-table"><caption class="gsc-sr-only">${labels[dimension]}搜尋成效與改善機會</caption><thead><tr>${headings.map((heading) => `<th scope="col">${heading}</th>`).join("")}</tr></thead><tbody>${rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((row) => {
      const href = dimension === "page" ? safeSearchConsolePageUrl(row.label) : "";
      const label = href ? `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(row.label)} ↗</a>` : escapeHTML(row.label);
      const reason = row.opportunities.length ? row.opportunities.map((key) => `<span class="gsc-opportunity">${opportunityLabels[key]}</span>`).join("") : row.incomplete ? "數據不足，暫不判斷" : "持續觀察";
      return `<tr>${[label, count(row.clicks), count(row.impressions), percent(row.ctr), decimal(row.position), reason].map((cell, index) => `<td data-label="${headings[index]}">${cell}</td>`).join("")}</tr>`;
    }).join("")}</tbody></table></div>`;
  }
  on("gscImportForm", "submit", async (event) => {
    event.preventDefault();
    const epoch = ++importEpoch;
    const file = find("gscFile").files?.[0];
    const periodStart = find("gscPeriodStart").value;
    const periodEnd = find("gscPeriodEnd").value;
    try {
      if (!file) throw new Error("請先選擇查詢或網頁 CSV。");
      if (!/\.csv$/i.test(file.name)) throw new Error("請先解壓 ZIP，再選擇副檔名為 .csv 的查詢或網頁資料表。");
      if (file.size > MAX_GSC_FILE_BYTES) throw new Error("CSV 不可超過 5 MB，請縮小匯出範圍。");
      if (Boolean(periodStart) !== Boolean(periodEnd)) throw new Error("期間請同時填寫開始和結束，或兩欄都留空。");
      if (periodStart && periodStart > periodEnd) throw new Error("匯出期間的開始不可晚於結束。");
      status("正在分析 CSV…");
      find("gscImportButton").disabled = true;
      const bytes = await file.arrayBuffer();
      if (epoch !== importEpoch) return;
      let text;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
      catch { throw new Error("無法讀取檔案編碼，請使用 Search Console 原始 UTF-8 CSV。"); }
      const parsed = parseSearchConsoleCsv(text);
      const replaces = datasets.has(parsed.dimension);
      datasets.set(parsed.dimension, { ...parsed, filename: file.name, periodStart, periodEnd });
      dimension = parsed.dimension;
      pageIndex = 0;
      render();
      status(`已${replaces ? "取代先前的" : "匯入"}${labels[dimension]}資料，共 ${parsed.rows.length.toLocaleString("zh-TW")} 列。${parsed.rows.length >= 1000 ? " 匯出可能已達 Google 表格列數上限，請留意資料範圍。" : ""}`, "success");
    } catch (error) {
      if (epoch !== importEpoch) return;
      const prior = datasets.get(dimension);
      status(`匯入失敗：${error.message}${prior ? ` 仍顯示上次成功匯入的「${prior.filename}」。` : ""}`, "error");
    } finally {
      if (epoch === importEpoch) find("gscImportButton").disabled = false;
    }
  });
  on("gscDimension", "change", () => { dimension = find("gscDimension").value; pageIndex = 0; render(); });
  for (const [id, event] of [["gscMinImpressions", "input"], ["gscMaxCtr", "input"], ["gscSearch", "input"], ["gscOpportunity", "change"], ["gscSort", "change"]]) on(id, event, () => { pageIndex = 0; render(); });
  on("gscPrevious", "click", () => { pageIndex = Math.max(0, pageIndex - 1); render(); });
  on("gscNext", "click", () => { pageIndex += 1; render(); });
  on("gscClear", "click", () => {
    importEpoch += 1;
    datasets.clear();
    find("gscImportForm").reset();
    find("gscSearch").value = "";
    find("gscImportButton").disabled = false;
    pageIndex = 0;
    render();
    status("匯入資料已清除。");
    find("gscFile").focus();
  });
  on("gscExport", "click", () => {
    if (!canExport || !datasets.has(dimension)) return;
    const rows = selectedRows();
    if (!rows.length) return;
    const csv = searchConsoleCsv(rows, datasets.get(dimension));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = root.ownerDocument.createElement("a");
    link.href = url;
    link.download = `suiyuecare-gsc-${dimension}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();
  return { destroy() { importEpoch += 1; datasets.clear(); listeners.forEach((remove) => remove()); render(); } };
}
