export const MAX_GSC_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_GSC_ROWS = 10000;

const aliases = {
  query: ["query", "queries", "topqueries", "熱門查詢", "熱門查詢字詞", "查詢", "查詢字詞", "搜尋字詞", "热门查询", "查询", "查询字词"],
  page: ["page", "pages", "toppages", "url", "熱門網頁", "熱門頁面", "網頁", "頁面", "热门网页", "热门页面", "网页", "页面"],
  clicks: ["clicks", "點擊", "點擊次數", "點閱次數", "點閱數", "点击", "点击次数"],
  impressions: ["impressions", "曝光", "曝光次數", "曝光數", "曝光数", "展示次数", "顯示次數"],
  ctr: ["ctr", "clickthroughrate", "點閱率", "點擊率", "点击率"],
  position: ["position", "averageposition", "avgposition", "排名", "平均排名", "排名平均值", "平均排序", "排序"]
};
const headerKey = (value) => value.trim().toLowerCase().replace(/[\s_\-()（）]/g, "");
const missing = (value) => /^(?:|[-—~]|n\/?a)$/i.test(value.trim());

function csvRows(text) {
  const rows = [];
  let row = [], cell = "", quoted = false, closed = false;
  const pushCell = () => {
    if (cell.length > 10000) throw new Error("單一 CSV 欄位過長，請使用原始 Search Console 匯出資料。");
    row.push(cell);
    if (row.length > 30) throw new Error("欄位過多。請選擇 Search Console 的查詢或網頁資料表，不要使用比較報表。");
    cell = "";
    closed = false;
  };
  const pushRow = () => {
    pushCell();
    if (row.some((value) => value.trim())) rows.push(row);
    if (rows.length > MAX_GSC_ROWS + 1) throw new Error(`最多可分析 ${MAX_GSC_ROWS.toLocaleString("en-US")} 列資料，請縮小匯出範圍。`);
    row = [];
  };
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') { quoted = false; closed = true; }
      else cell += char;
    } else if (char === ",") pushCell();
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      pushRow();
    } else if (char === '"') {
      if (cell || closed) throw new Error(`第 ${rows.length + 1} 列的 CSV 引號格式不完整。請使用原始匯出檔。`);
      quoted = true;
    } else if (closed) {
      if (!/[ \t]/.test(char)) throw new Error(`第 ${rows.length + 1} 列的 CSV 引號後有無法辨識的內容。`);
    } else cell += char;
  }
  if (quoted) throw new Error("CSV 有未結束的引號。請重新匯出完整檔案。");
  if (cell || row.length || closed) pushRow();
  return rows;
}

function numberCell(value, label, rowNumber, { integer = false } = {}) {
  const raw = value.trim();
  if (missing(raw)) return null;
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(raw)) throw new Error(`第 ${rowNumber} 列「${label}」不是有效數字。請使用原始英語或中文 CSV。`);
  const number = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(number) || number > Number.MAX_SAFE_INTEGER || (integer && !Number.isInteger(number))) throw new Error(`第 ${rowNumber} 列「${label}」超出有效範圍。`);
  return number;
}

export function parseSearchConsoleCsv(text) {
  if (typeof text !== "string") throw new Error("請選擇 UTF-8 編碼的 CSV 檔案。");
  if (new TextEncoder().encode(text).byteLength > MAX_GSC_FILE_BYTES) throw new Error("CSV 不可超過 5 MB，請縮小匯出範圍。");
  if (text.includes("\0") || text.includes("\uFFFD")) throw new Error("無法讀取檔案編碼，請改用 UTF-8 CSV。");
  const records = csvRows(text.replace(/^\uFEFF/, ""));
  if (records.length < 2) throw new Error("CSV 沒有可分析的資料列。");
  const headers = records[0].map(headerKey);
  const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => {
    const matches = headers.flatMap((header, index) => names.includes(header) ? [index] : []);
    if (matches.length > 1) throw new Error(`「${key}」有重複欄位，請使用未比較期間的原始資料表。`);
    return [key, matches[0] ?? -1];
  }));
  if ((columns.query >= 0) === (columns.page >= 0)) throw new Error("請選擇 Queries（查詢）或 Pages（網頁）CSV；不支援混合維度、圖表、篩選器或比較報表。");
  if (["clicks", "impressions", "ctr", "position"].some((key) => columns[key] < 0)) throw new Error("缺少點擊、曝光、CTR 或排名欄位。請在 Search Console 搜尋成效報表開啟四項指標後匯出。");
  const recognized = new Set(Object.values(columns).filter((index) => index >= 0));
  if (headers.some((header, index) => header && !recognized.has(index))) throw new Error("這份 CSV 有額外維度或比較期間欄位，請匯出單一期間的查詢或網頁資料表。");
  const dimension = columns.query >= 0 ? "query" : "page";
  const keys = new Set();
  const rows = records.slice(1).map((record, index) => {
    const rowNumber = index + 2;
    if (record.length !== headers.length) throw new Error(`第 ${rowNumber} 列的欄位數不同，請使用完整的原始 CSV。`);
    const label = record[columns[dimension]].trim();
    if (!label) throw new Error(`第 ${rowNumber} 列缺少${dimension === "query" ? "查詢字詞" : "網頁網址"}。`);
    if (keys.has(label)) throw new Error(`第 ${rowNumber} 列有重複資料，請勿將多個期間或重複匯出檔合併。`);
    keys.add(label);
    const clicks = numberCell(record[columns.clicks], "點擊", rowNumber, { integer: true });
    const impressions = numberCell(record[columns.impressions], "曝光", rowNumber, { integer: true });
    let position = numberCell(record[columns.position], "排名", rowNumber);
    if (position === 0) position = null; // GSC can encode unavailable values as zero; zero is not a rank.
    if (position !== null && position < 1) throw new Error(`第 ${rowNumber} 列的平均排名不可小於 1。`);
    if (clicks !== null && impressions !== null && clicks > impressions) throw new Error(`第 ${rowNumber} 列的點擊多於曝光，請確認匯出的欄位與期間。`);
    // Recompute CTR from counts, without guessing whether a CSV decimal represents a percentage.
    const ctr = clicks !== null && impressions > 0 ? clicks / impressions : null;
    const rawCtr = record[columns.ctr].trim();
    if (!missing(rawCtr) && !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?\s*%?$/.test(rawCtr)) throw new Error(`第 ${rowNumber} 列的 CTR 格式無法辨識。`);
    if (!missing(rawCtr) && Number(rawCtr.replace(/[,%\s]/g, "")) > 100) throw new Error(`第 ${rowNumber} 列的 CTR 超出有效範圍。`);
    return { label, clicks, impressions, ctr, position };
  });
  for (const key of ["clicks", "impressions"]) if (!Number.isSafeInteger(rows.reduce((sum, row) => sum + (row[key] ?? 0), 0))) throw new Error("點擊或曝光總和超出可安全計算的範圍。");
  return { dimension, rows, missingRows: rows.filter((row) => [row.clicks, row.impressions, row.position].includes(null)).length };
}

export function summarizeSearchConsoleRows(rows) {
  const total = (key) => rows.length && rows.every((row) => row[key] !== null) ? rows.reduce((sum, row) => sum + row[key], 0) : null;
  const clicks = total("clicks");
  const impressions = total("impressions");
  const positionKnown = impressions > 0 && rows.every((row) => row.impressions === 0 || row.position !== null);
  return {
    clicks, impressions, ctr: clicks !== null && impressions > 0 ? clicks / impressions : null,
    position: positionKnown ? rows.reduce((sum, row) => sum + (row.position || 0) * row.impressions, 0) / impressions : null
  };
}

export function analyzeSearchConsoleRows(rows, { minImpressions = 100, maxCtr = 0.02, filter = "all", sort = "opportunity", search = "" } = {}) {
  if (!Number.isFinite(minImpressions) || minImpressions < 0 || !Number.isFinite(maxCtr) || maxCtr < 0 || maxCtr > 1) throw new Error("請輸入有效的曝光與 CTR 篩選門檻。");
  const needle = search.trim().toLocaleLowerCase();
  const analyzed = rows.filter((row) => !needle || row.label.toLocaleLowerCase().includes(needle)).map((row) => {
    const complete = row.clicks !== null && row.impressions > 0 && row.ctr !== null && row.position !== null;
    const enough = complete && row.impressions >= minImpressions;
    const opportunities = [];
    if (enough && row.position <= 10 && row.ctr < maxCtr) opportunities.push("low-ctr");
    if (enough && row.position >= 4 && row.position <= 20) opportunities.push("ranking");
    return { ...row, opportunities, incomplete: !complete };
  }).filter((row) => filter === "all" || row.opportunities.includes(filter));
  const numberCompare = (a, b, key, ascending = false) => a[key] === null ? (b[key] === null ? 0 : 1) : b[key] === null ? -1 : (a[key] - b[key]) * (ascending ? 1 : -1);
  return analyzed.sort((a, b) => {
    if (sort === "opportunity") return Number(b.opportunities.length > 0) - Number(a.opportunities.length > 0) || numberCompare(a, b, "impressions") || numberCompare(a, b, "ctr", true) || a.label.localeCompare(b.label, "zh-Hant");
    return numberCompare(a, b, ["clicks", "position"].includes(sort) ? sort : "impressions", sort === "position") || a.label.localeCompare(b.label, "zh-Hant");
  });
}

export const opportunityLabels = { "low-ctr": "前 10 名低 CTR：檢查標題與摘要", ranking: "平均排名 4–20：檢查內容與內部連結" };

export function safeSearchConsolePageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["suiyuecare.com", "www.suiyuecare.com"].includes(url.hostname) && !url.username && !url.password && !url.port ? url.href : "";
  } catch { return ""; }
}

export function searchConsoleCsv(rows, { dimension, filename = "", periodStart = "", periodEnd = "" } = {}) {
  const cell = (value) => {
    let text = String(value ?? "");
    if (/^[\s\uFEFF]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return "\uFEFF" + [
    [dimension === "page" ? "網頁" : "查詢", "點擊", "曝光", "CTR（重算）", "平均排名", "檢查方向", "來源檔案", "期間開始（自行填寫）", "期間結束（自行填寫）"],
    ...rows.map((row) => [row.label, row.clicks, row.impressions, row.ctr === null ? "" : `${(row.ctr * 100).toFixed(2)}%`, row.position, row.opportunities.map((key) => opportunityLabels[key]).join("；"), filename, periodStart, periodEnd])
  ].map((row) => row.map(cell).join(",")).join("\r\n");
}
