import assert from "node:assert/strict";
import fs from "node:fs";
import { parseHTML } from "linkedom";
import { parse } from "acorn";
import { MAX_GSC_FILE_BYTES, MAX_GSC_ROWS, parseSearchConsoleCsv, summarizeSearchConsoleRows, analyzeSearchConsoleRows, safeSearchConsolePageUrl, searchConsoleCsv } from "../src/admin/search-console-data.mjs";
import { initSearchConsolePanel } from "../src/admin/search-console-panel.js";

const header = "Top queries,Clicks,Impressions,CTR,Position\n";
const csv = (rows) => header + rows;
const english = parseSearchConsoleCsv('\uFEFFTop queries,Clicks,Impressions,CTR,Position\r\n"長照, ""台北""\n詢問",5,"1,000",0.5%,6\r\n');
assert.equal(english.rows[0].label, '長照, "台北"\n詢問');
assert.equal(english.rows[0].impressions, 1000);
assert.equal(english.rows[0].ctr, 0.005);
for (const rank of ["平均排名", "平均排序", "排序"]) {
  const zh = parseSearchConsoleCsv(`熱門查詢,點擊次數,曝光次數,點閱率,${rank}\n日照,2,100,2%,11\n`);
  assert.equal(zh.dimension, "query");
  assert.equal(zh.rows[0].position, 11);
}
const pageData = parseSearchConsoleCsv("熱門網頁,點擊次數,曝光次數,點閱率,平均排序\nhttps://www.suiyuecare.com/day-care,3,200,1.5%,7\n");
assert.equal(pageData.dimension, "page");
const unknown = parseSearchConsoleCsv(csv("unknown,,100,-,-\nzero,0,0,0%,0\n"));
assert.equal(unknown.rows[0].clicks, null);
assert.equal(unknown.rows[0].ctr, null);
assert.equal(unknown.rows[1].position, null);
assert.equal(unknown.rows[1].ctr, null, "zero exposures cannot produce a known zero CTR");
assert.equal(summarizeSearchConsoleRows(unknown.rows).clicks, null);
assert.equal(summarizeSearchConsoleRows(unknown.rows).position, null);
assert.ok(analyzeSearchConsoleRows(unknown.rows).every((row) => row.opportunities.length === 0));
const weighted = parseSearchConsoleCsv(csv("small,10,100,10%,2\nlarge,9,900,1%,20\n"));
assert.deepEqual(summarizeSearchConsoleRows(weighted.rows), { clicks: 19, impressions: 1000, ctr: 0.019, position: 18.2 });
const opportunities = analyzeSearchConsoleRows(weighted.rows);
assert.equal(opportunities[0].label, "large");
assert.deepEqual(opportunities[0].opportunities, ["ranking"]);
assert.equal(analyzeSearchConsoleRows(weighted.rows, { filter: "low-ctr" }).length, 0);
assert.equal(analyzeSearchConsoleRows(weighted.rows, { minImpressions: 1000 }).filter((row) => row.opportunities.length).length, 0);
assert.equal(analyzeSearchConsoleRows(weighted.rows, { search: "SMALL" })[0].label, "small");
assert.equal(analyzeSearchConsoleRows([...weighted.rows, ...unknown.rows], { sort: "position" }).at(-1).position, null);

for (const [input, message] of [
  [csv('"unterminated,1,10,10%,3'), /引號/],
  [csv("one,1,10,10%,3\none,2,20,10%,3"), /重複/],
  [csv("one,1,10,10%"), /欄位數/],
  [csv("one,-1,10,10%,3"), /有效數字/],
  [csv("one,1.5,10,10%,3"), /有效範圍/],
  [csv("one,11,10,110%,3"), /點擊多於曝光/],
  [csv("one,1,10,10%,0.5"), /不可小於/],
  [csv("one,1,1K,10%,3"), /有效數字/],
  [csv("one,1,10,error,3"), /CTR/],
  [csv("one,1,10,500%,3"), /CTR/],
  [csv(`one,1,${Number.MAX_SAFE_INTEGER},0%,3\ntwo,1,10,10%,3`), /總和/],
  ["Query,Clicks,Clicks,Impressions,CTR,Position\none,1,1,10,10%,3", /重複欄位/],
  ["Query,Page,Clicks,Impressions,CTR,Position\none,https://example.test,1,10,10%,3", /混合維度/],
  ["Date,Clicks,Impressions,CTR,Position\n2026-01-01,1,10,10%,3", /Queries/],
  ["Query,Clicks,Impressions,CTR\none,1,10,10%", /缺少/],
  ["Query,Clicks,Impressions,CTR,Position,Previous clicks\none,1,10,10%,3,2", /額外維度/],
  [header, /沒有可分析/], ["\0binary", /編碼/],
  ["x".repeat(MAX_GSC_FILE_BYTES + 1), /5 MB/],
  [csv(Array.from({ length: MAX_GSC_ROWS + 1 }, (_, index) => `query${index},1,10,10%,3`).join("\n")), /最多/]
]) assert.throws(() => parseSearchConsoleCsv(input), message);

assert.equal(safeSearchConsolePageUrl("https://www.suiyuecare.com/day-care"), "https://www.suiyuecare.com/day-care");
for (const url of ["javascript:alert(1)", "https://evil.test/", "https://suiyuecare.com.evil.test/", "https://user:pass@www.suiyuecare.com/", "http://www.suiyuecare.com/", "https://www.suiyuecare.com:9443/"]) assert.equal(safeSearchConsolePageUrl(url), "");
const exported = searchConsoleCsv(["=HYPERLINK(\"https://evil.test\")", " +1+1", "@SUM(1)", "\t=1+1"].map((label) => ({ label, clicks: null, impressions: 0, ctr: null, position: null, opportunities: [] })), { dimension: "query", filename: "=source.csv" });
assert.ok(exported.includes('"\'=HYPERLINK(""https://evil.test"")"'));
assert.ok(exported.includes('"\' +1+1"'));
assert.ok(exported.includes('"\'@SUM(1)"'));
assert.ok(exported.includes('"\'\t=1+1"'));
assert.ok(exported.includes('"\'=source.csv"'));

// Use actual admin HTML and the real panel, with only the browser primitives
// missing from LinkeDOM supplied here. This fixture does not bypass live admin login.
const html = fs.readFileSync(new URL("../admin/traffic/index.html", import.meta.url), "utf8");
const { document, Event } = parseHTML(html);
const root = document.querySelector("#searchConsolePanel");
for (const select of root.querySelectorAll("select")) Object.defineProperty(select, "value", { value: select.options[0].value, writable: true });
for (const input of root.querySelectorAll("input")) Object.defineProperty(input, "validity", { value: { valid: true } });
const fileInput = root.querySelector("#gscFile");
Object.defineProperty(fileInput, "files", { value: [], writable: true });
root.querySelector("#gscImportForm").reset = () => {
  for (const input of root.querySelectorAll("#gscImportForm input")) input.value = "";
  fileInput.files = [];
};
fileInput.focus = () => {};
const flush = () => new Promise((resolve) => setImmediate(resolve));
const event = (id, type) => root.querySelector(`#${id}`).dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
const fakeFile = (text, name = "Queries.csv") => ({ name, size: new TextEncoder().encode(text).byteLength, arrayBuffer: async () => new TextEncoder().encode(text).buffer });
async function importFile(file) { fileInput.files = [file]; event("gscImportForm", "submit"); await flush(); }

const originalFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error("CSV analysis must never use a network request"); };
let panel;
try {
  panel = initSearchConsolePanel(root, { canExport: false });
  assert.ok(root.querySelector("#gscResults").hidden);
  await importFile(fakeFile(csv('"<img src=x onerror=alert(1)>",2,1000,0.2%,6\n')));
  assert.equal(root.querySelectorAll("#gscTable img, #gscTable script").length, 0);
  assert.ok(root.querySelector("#gscTable").textContent.includes("<img src=x onerror=alert(1)>"));
  assert.ok(root.querySelector("#gscExport").disabled, "view permission alone does not grant export");
  assert.ok(root.querySelector("#gscSource").textContent.includes("期間未提供"));
  await importFile(fakeFile("Top pages,Clicks,Impressions,CTR,Position\nhttps://www.suiyuecare.com/day-care,3,200,1.5%,7\n", "Pages.csv"));
  assert.ok(root.querySelector("#gscSummary").textContent.includes("200"));
  assert.ok(!root.querySelector("#gscSummary").textContent.includes("1,200"), "query and page totals must stay separate");
  assert.equal(root.querySelector("#gscTable a").getAttribute("rel"), "noopener noreferrer");
  const hostileFilename = '<img src=x onerror=alert(1)>.csv';
  await importFile(fakeFile(csv("filename-test,1,1000,0.1%,6"), hostileFilename));
  await importFile(fakeFile("invalid CSV", "invalid.csv"));
  assert.ok(root.querySelector("#gscStatus").textContent.includes("仍顯示上次成功"));
  assert.ok(root.querySelector("#gscStatus").textContent.includes(hostileFilename));
  assert.equal(root.querySelectorAll("#gscStatus img, #gscSource img").length, 0, "failure messages must keep the previous untrusted filename as text");
  assert.ok(root.querySelector("#gscSource").textContent.includes(hostileFilename));
  let readAttempted = false;
  await importFile({ name: "large.csv", size: MAX_GSC_FILE_BYTES + 1, arrayBuffer() { readAttempted = true; } });
  assert.equal(readAttempted, false, "oversized files are rejected before reading");
  let resolveRead;
  const pending = new Promise((resolve) => { resolveRead = resolve; });
  fileInput.files = [{ name: "pending.csv", size: 100, arrayBuffer: () => pending }];
  event("gscImportForm", "submit");
  event("gscClear", "click");
  resolveRead(new TextEncoder().encode(csv("stale,1,10,10%,3")).buffer);
  await flush();
  assert.ok(root.querySelector("#gscResults").hidden);
  assert.equal(root.querySelector("#gscTable").textContent, "", "clear removes imported values from the DOM as well as memory");
  assert.ok(!root.textContent.includes("stale"), "a stale file read cannot restore cleared data");
  panel.destroy();
  panel = initSearchConsolePanel(root, { canExport: true });
  await importFile(fakeFile(csv("allowed,1,1000,0.1%,5")));
  assert.equal(root.querySelector("#gscExport").disabled, false);
  root.querySelector("#gscMinImpressions").value = "";
  event("gscMinImpressions", "input");
  assert.ok(root.querySelector("#gscExport").disabled, "invalid filters cannot export a stale list");
} finally {
  panel?.destroy();
  globalThis.fetch = originalFetch;
}

function visit(node) {
  if (!node || typeof node !== "object") return;
  if (node.type === "Identifier") assert.ok(!["fetch", "XMLHttpRequest", "WebSocket", "sendBeacon", "localStorage", "sessionStorage", "indexedDB", "supabase"].includes(node.name), `CSV module must not send or persist imported data: ${node.name}`);
  for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === "object") visit(value);
}
for (const file of ["search-console-data.mjs", "search-console-panel.js"]) visit(parse(fs.readFileSync(new URL(`../src/admin/${file}`, import.meta.url), "utf8"), { ecmaVersion: "latest", sourceType: "module" }));
const trafficSource = fs.readFileSync(new URL("../src/admin/traffic.js", import.meta.url), "utf8");
assert.match(trafficSource, /function bootTrafficCenter\(_session, permissions\)\s*\{\s*initSearchConsolePanel/);
assert.match(trafficSource, /canExport:\s*permissions\?\.can_export_analytics === true/);
assert.match(trafficSource, /onReady:\s*bootTrafficCenter/);
assert.ok(!trafficSource.includes("SEO 平均分數") && !trafficSource.includes('"可索引"'), "CMS fields cannot impersonate measured Google performance or indexability");
console.log("PASS: GSC CSV parsing, known/unknown metrics, opportunity ordering, isolated dimensions, XSS/formula safety, permissions, stale reads, and no-network/no-storage contracts.");
