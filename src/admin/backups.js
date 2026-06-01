import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#backupStatus");
const notesInput = document.querySelector("#backupNotes");
const createBackupButton = document.querySelector("#createBackupButton");
const createPreDeployBackupButton = document.querySelector("#createPreDeployBackupButton");
const refreshBackupsButton = document.querySelector("#refreshBackupsButton");
const refreshLaunchCheckButton = document.querySelector("#refreshLaunchCheckButton");
const backupTableSummary = document.querySelector("#backupTableSummary");
const historyBody = document.querySelector("#backupHistoryBody");
const restoreFileInput = document.querySelector("#restoreFileInput");
const restorePreview = document.querySelector("#restorePreview");
const restoreConfirmCheck = document.querySelector("#restoreConfirmCheck");
const restoreSafetyBackupCheck = document.querySelector("#restoreSafetyBackupCheck");
const restoreBackupButton = document.querySelector("#restoreBackupButton");
const launchReadinessSummary = document.querySelector("#launchReadinessSummary");
const launchChecklist = document.querySelector("#launchChecklist");

const backupTableGroups = [
  {
    title: "全站與頁面",
    tables: [
      ["media", "圖片資料"],
      ["site_settings", "全站設定"],
      ["pages", "頁面"],
      ["page_sections", "頁面區塊"],
      ["content_modules", "首頁/固定模組"],
      ["page_template_fields", "模板欄位"]
    ]
  },
  {
    title: "文章與課程",
    tables: [
      ["article_categories", "文章分類"],
      ["articles", "文章"],
      ["courses", "課程"],
      ["downloadable_files", "下載檔案"],
      ["care_stories", "真實照顧情境"],
      ["expert_talks", "名人講堂"]
    ]
  },
  {
    title: "招募與投資人",
    tables: [
      ["recruiting_pages", "招募頁"],
      ["recruiting_departments", "招募部門"],
      ["recruiting_openings", "招募職缺/合作卡"],
      ["investor_notices", "投資人公告"],
      ["investor_financial_items", "投資人財務資料"],
      ["investor_chart_datasets", "投資人圖表資料"]
    ]
  },
  {
    title: "後台輔助設定",
    tables: [
      ["content_templates", "內容模板"],
      ["analytics_report_schedules", "報表寄送設定"]
    ]
  }
];

const backupTables = backupTableGroups.flatMap((group) => group.tables);
const sortableTables = new Set([
  "site_settings",
  "pages",
  "page_sections",
  "article_categories",
  "articles",
  "courses",
  "downloadable_files",
  "care_stories",
  "expert_talks",
  "content_modules",
  "page_template_fields",
  "recruiting_pages",
  "recruiting_departments",
  "recruiting_openings",
  "investor_notices",
  "investor_financial_items",
  "investor_chart_datasets",
  "content_templates"
]);
const optionalBackupTables = new Set(["site_settings", "content_modules", "page_template_fields", "downloadable_files", "content_templates", "analytics_report_schedules"]);
const excludedBackupTables = ["form_submissions", "analytics_page_views", "analytics_events", "analytics_alerts", "analytics_health_checks", "profiles", "admins", "backup_manifests"];

let selectedBackup = null;
let history = [];
let latestAudit = null;

const launchChecklistItems = [
  ["backup", "已建立上線前備份", "完成備份 JSON 下載，並放進公司雲端硬碟。"],
  ["content-health", "內容健康檢查 Critical 為 0", "缺圖、缺連結、未發布、缺必要頁面都要先處理。"],
  ["home", "首頁桌機/平板/手機人工走查", "Hero、服務項目、單位分佈、真實照顧情境、聯絡區不能跑版。"],
  ["forms", "表單送出與寄信測試完成", "聯絡我們、課程報名、招募/合作表單至少各測一次。"],
  ["seo", "SEO 與社群分享檢查完成", "Title、Description、canonical、OG 圖、sitemap、404 頁確認。"],
  ["investor", "投資人專區資料與下載檔確認", "公告、財報、圖表、股東專區下載檔都可開啟。"],
  ["restore-drill", "備份檔可預覽且 checksum 正常", "至少選取最新備份檔預覽一次，不一定要真正還原。"]
];

function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function getBackupFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `suiyuecare-cms-backup-${timestamp}.json`;
}

function downloadJSON(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function backupPayloadForChecksum(backup) {
  const clone = { ...backup };
  delete clone.checksum;
  return JSON.stringify(clone);
}

async function verifyBackupChecksum(backup) {
  if (!backup.checksum) return { ok: false, message: "備份檔沒有 checksum，建議重新建立新版備份。" };
  const checksum = await sha256(backupPayloadForChecksum(backup));
  return {
    ok: checksum === backup.checksum,
    message: checksum === backup.checksum ? "checksum 驗證通過。" : "checksum 不一致，備份檔可能被改過或不完整。"
  };
}

function renderTableSummary(counts = {}) {
  backupTableSummary.innerHTML = backupTableGroups.flatMap((group) => group.tables.map(([table, label]) => `
    <article>
      <span>${escapeHTML(label)}</span>
      <strong>${Number.isFinite(counts[table]) ? counts[table] : "--"}</strong>
      <small>${escapeHTML(group.title)} · ${escapeHTML(table)}</small>
    </article>
  `)).join("");
}

async function fetchTableRows(table) {
  let query = supabase.from(table).select("*");
  if (sortableTables.has(table)) {
    query = query.order("sort_order", { ascending: true });
  }
  const { data, error } = await query;
  if (error) throw new Error(`${table}: ${error.message}`);
  return data || [];
}

async function createBackup(backupType = "manual") {
  createBackupButton?.setAttribute("disabled", "true");
  createPreDeployBackupButton?.setAttribute("disabled", "true");
  setStatus("正在讀取 Supabase CMS 資料並建立備份...", "info");
  try {
    const tables = {};
    const rowCounts = {};
    for (const [table] of backupTables) {
      const rows = await fetchTableRows(table);
      tables[table] = rows;
      rowCounts[table] = rows.length;
      renderTableSummary(rowCounts);
    }

    const backup = {
      app: "suiyuecare-cms",
      format_version: 1,
      created_at: new Date().toISOString(),
      backup_type: backupType,
      notes: notesInput?.value.trim() || (backupType === "pre_deploy" ? "正式上線前備份" : null),
      excluded_tables: excludedBackupTables,
      table_groups: backupTableGroups.map((group) => ({
        title: group.title,
        tables: group.tables.map(([table]) => table)
      })),
      tables
    };
    const json = backupPayloadForChecksum(backup);
    const checksum = await sha256(json);
    backup.checksum = checksum;
    const fileName = getBackupFileName();

    const { error } = await supabase.from("backup_manifests").insert({
      backup_type: backupType,
      tables: backupTables.map(([table]) => table),
      status: "created",
      checksum,
      notes: backup.notes,
      metadata: {
        file_name: fileName,
        row_counts: rowCounts,
        format_version: backup.format_version,
        excluded_tables: excludedBackupTables
      }
    });
    if (error) throw error;

    downloadJSON(fileName, backup);
    setStatus(backupType === "pre_deploy" ? "上線前備份已建立並下載。請放進公司雲端硬碟正式備份資料夾。" : "備份已建立並下載。建議把 JSON 放在公司雲端硬碟的正式備份資料夾。", "success");
    await loadHistory();
    await loadLaunchReadiness();
  } catch (error) {
    console.error("Failed to create backup", error);
    setStatus(`建立備份失敗：${error.message}`, "error");
  } finally {
    createBackupButton?.removeAttribute("disabled");
    createPreDeployBackupButton?.removeAttribute("disabled");
  }
}

function summarizeBackup(backup) {
  const tables = backup?.tables && typeof backup.tables === "object" ? backup.tables : {};
  return backupTables.reduce((summary, [table]) => {
    summary[table] = Array.isArray(tables[table]) ? tables[table].length : 0;
    return summary;
  }, {});
}

async function renderRestorePreview(backup, missingTables = []) {
  const counts = summarizeBackup(backup);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const checksum = await verifyBackupChecksum(backup);
  restorePreview.innerHTML = `
    <strong>${escapeHTML(backup.app || "未知備份")} · ${escapeHTML(backup.created_at || "沒有時間")}</strong>
    <span>共 ${total} 筆 CMS 資料。Checksum：${escapeHTML(backup.checksum || "未提供")}</span>
    <span data-status="${checksum.ok ? "success" : "error"}">${escapeHTML(checksum.message)}</span>
    ${missingTables.length ? `<span data-status="warning">此備份檔缺少新版資料表：${missingTables.map((table) => escapeHTML(table)).join("、")}。還原時會以空表略過，不會刪除現有資料。</span>` : ""}
    <div class="backup-restore-counts">
      ${backupTables.map(([table, label]) => `<em>${escapeHTML(label)} <b>${counts[table]}</b></em>`).join("")}
    </div>
  `;
  if (!checksum.ok) throw new Error(checksum.message);
}

function normalizeBackupTables(backup) {
  if (!backup || backup.app !== "suiyuecare-cms") throw new Error("這不是歲悅 CMS 備份檔。");
  if (backup.format_version !== 1) throw new Error("備份檔版本不支援，請使用新版後台重新建立備份。");
  if (!backup.tables || typeof backup.tables !== "object") throw new Error("備份檔缺少 tables 區塊。");
  const missingTables = [];
  backupTables.forEach(([table]) => {
    if (Array.isArray(backup.tables[table])) return;
    if (!optionalBackupTables.has(table)) throw new Error(`備份檔缺少必要資料表：${table}。`);
    missingTables.push(table);
  });
  return missingTables;
}

async function handleRestoreFile() {
  selectedBackup = null;
  restoreBackupButton.disabled = true;
  restoreConfirmCheck.checked = false;
  if (restoreSafetyBackupCheck) restoreSafetyBackupCheck.checked = false;
  const file = restoreFileInput.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const missingTables = normalizeBackupTables(parsed);
    Object.defineProperty(parsed, "__missingTables", { value: missingTables, enumerable: false });
    await renderRestorePreview(parsed, missingTables);
    selectedBackup = parsed;
    updateRestoreButtonState();
    setStatus("備份檔已讀取，請確認預覽後勾選安全還原確認。", "info");
  } catch (error) {
    console.error("Failed to read backup file", error);
    restorePreview.innerHTML = `<strong>備份檔無法使用</strong><span>${escapeHTML(error.message)}</span>`;
    setStatus(`讀取備份檔失敗：${error.message}`, "error");
  }
}

function chunkRows(rows, size = 100) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) chunks.push(rows.slice(index, index + size));
  return chunks;
}

async function restoreBackup() {
  if (!selectedBackup) {
    setStatus("請先選擇備份檔。", "error");
    return;
  }
  if (!restoreConfirmCheck.checked) {
    setStatus("請先勾選安全還原確認。", "error");
    return;
  }
  if (!restoreSafetyBackupCheck?.checked) {
    setStatus("請先確認已建立目前狀態備份，避免還原後無法回到現在版本。", "error");
    return;
  }
  if (!window.confirm("確定要執行安全還原嗎？相同 ID 的 CMS 資料會被備份檔覆寫，但不會刪除現有資料。")) return;

  restoreBackupButton.disabled = true;
  setStatus("正在安全還原 CMS 內容...", "info");
  const restoredCounts = {};
  try {
    const checksumResult = await verifyBackupChecksum(selectedBackup);
    if (!checksumResult.ok) throw new Error(checksumResult.message);
    for (const [table] of backupTables) {
      const rows = selectedBackup.tables[table] || [];
      restoredCounts[table] = rows.length;
      for (const chunk of chunkRows(rows)) {
        if (!chunk.length) continue;
        const { error } = await supabase.from(table).upsert(chunk, { onConflict: "id" });
        if (error) throw new Error(`${table}: ${error.message}`);
      }
      renderTableSummary(restoredCounts);
    }
    const checksum = selectedBackup.checksum || await sha256(JSON.stringify(selectedBackup));
    const { error } = await supabase.from("backup_manifests").insert({
      backup_type: "manual",
      tables: backupTables.map(([table]) => table),
      status: "restored",
      checksum,
      notes: `安全還原：${selectedBackup.notes || "未填備註"}`,
      metadata: {
        restored_at: new Date().toISOString(),
        source_created_at: selectedBackup.created_at,
        row_counts: restoredCounts,
        restore_mode: "safe_merge",
        missing_tables: selectedBackup.__missingTables || []
      }
    });
    if (error) throw error;
    setStatus("安全還原完成。請到前台與內容健康檢查確認顯示狀態。", "success");
    await loadHistory();
    await loadLaunchReadiness();
  } catch (error) {
    console.error("Failed to restore backup", error);
    setStatus(`還原失敗：${error.message}`, "error");
  } finally {
    restoreBackupButton.disabled = false;
  }
}

function getChecklistState() {
  try {
    return JSON.parse(localStorage.getItem("suiyuecare-launch-checklist") || "{}");
  } catch {
    return {};
  }
}

function saveChecklistState(state) {
  localStorage.setItem("suiyuecare-launch-checklist", JSON.stringify(state));
}

function getLastPreDeployBackup() {
  return history.find((item) => item.backup_type === "pre_deploy" && ["created", "uploaded"].includes(item.status));
}

function getRecentBackup() {
  return history.find((item) => ["created", "uploaded"].includes(item.status));
}

function isRecent(isoString, hours = 24) {
  if (!isoString) return false;
  const time = new Date(isoString).getTime();
  if (!Number.isFinite(time)) return false;
  return Date.now() - time <= hours * 60 * 60 * 1000;
}

function renderLaunchReadiness() {
  if (!launchReadinessSummary || !launchChecklist) return;
  const checklistState = getChecklistState();
  const lastPreDeployBackup = getLastPreDeployBackup();
  const recentBackup = getRecentBackup();
  const auditSummary = latestAudit?.summary || {};
  const critical = Number(auditSummary.critical || 0);
  const warning = Number(auditSummary.warning || 0);
  const auditFresh = isRecent(latestAudit?.created_at, 24);
  const backupFresh = isRecent(lastPreDeployBackup?.created_at || recentBackup?.created_at, 24);
  const readyChecks = [
    Boolean(lastPreDeployBackup || recentBackup),
    backupFresh,
    Boolean(latestAudit),
    auditFresh,
    critical === 0
  ];
  const score = Math.round((readyChecks.filter(Boolean).length / readyChecks.length) * 100);
  const state = critical > 0 || !recentBackup ? "danger" : score >= 80 ? "ready" : "warning";

  launchReadinessSummary.dataset.state = state;
  launchReadinessSummary.innerHTML = `
    <article>
      <span>上線準備分數</span>
      <strong>${score}</strong>
      <small>${state === "ready" ? "可進入最後人工走查" : "請先補齊紅黃燈項目"}</small>
    </article>
    <article>
      <span>最近備份</span>
      <strong>${recentBackup ? "有" : "無"}</strong>
      <small>${recentBackup ? formatUpdatedAt(recentBackup.created_at) : "請先建立備份"}</small>
    </article>
    <article>
      <span>內容 Critical</span>
      <strong>${critical}</strong>
      <small>${latestAudit ? `Warning ${warning}｜${formatUpdatedAt(latestAudit.created_at)}` : "尚未執行健康檢查"}</small>
    </article>
  `;

  launchChecklist.innerHTML = launchChecklistItems.map(([key, title, detail]) => {
    const checked = Boolean(checklistState[key]);
    return `
      <label class="backup-launch-checkitem">
        <input type="checkbox" data-launch-check="${escapeHTML(key)}" ${checked ? "checked" : ""} />
        <span>
          <strong>${escapeHTML(title)}</strong>
          <small>${escapeHTML(detail)}</small>
        </span>
      </label>
    `;
  }).join("");
}

async function loadLatestAudit() {
  const { data, error } = await supabase
    .from("content_audit_runs")
    .select("id,created_at,status,summary")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  latestAudit = data || null;
}

function renderHistory() {
  if (!historyBody) return;
  if (!history.length) {
    historyBody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state">目前沒有備份紀錄。</div></td></tr>`;
    return;
  }
  historyBody.innerHTML = history.map((item) => `
    <tr>
      <td><time>${formatUpdatedAt(item.created_at)}</time></td>
      <td>${escapeHTML(item.backup_type || "manual")}</td>
      <td>${escapeHTML(item.status || "created")}</td>
      <td>${Array.isArray(item.tables) ? item.tables.length : 0} 張表</td>
      <td><code>${escapeHTML((item.checksum || "").slice(0, 14))}</code></td>
      <td>${escapeHTML(item.notes || item.metadata?.file_name || "未填備註")}</td>
    </tr>
  `).join("");
}

async function loadHistory() {
  try {
    const { data, error } = await supabase
      .from("backup_manifests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw error;
    history = data || [];
    renderHistory();
  } catch (error) {
    console.error("Failed to load backup history", error);
    setStatus(`讀取備份紀錄失敗：${error.message}`, "error");
  }
}

async function loadLaunchReadiness() {
  try {
    await Promise.all([loadHistory(), loadLatestAudit()]);
    renderLaunchReadiness();
  } catch (error) {
    console.error("Failed to load launch readiness", error);
    setStatus(`讀取上線檢查失敗：${error.message}`, "error");
  }
}

function updateRestoreButtonState() {
  restoreBackupButton.disabled = !selectedBackup || !restoreConfirmCheck?.checked || !restoreSafetyBackupCheck?.checked;
}

restoreConfirmCheck?.addEventListener("change", updateRestoreButtonState);
restoreSafetyBackupCheck?.addEventListener("change", updateRestoreButtonState);
restoreFileInput?.addEventListener("change", handleRestoreFile);
restoreBackupButton?.addEventListener("click", restoreBackup);
createBackupButton?.addEventListener("click", () => createBackup("manual"));
createPreDeployBackupButton?.addEventListener("click", () => createBackup("pre_deploy"));
refreshBackupsButton?.addEventListener("click", loadHistory);
refreshLaunchCheckButton?.addEventListener("click", loadLaunchReadiness);
launchChecklist?.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-launch-check]");
  if (!checkbox) return;
  const state = getChecklistState();
  state[checkbox.dataset.launchCheck] = checkbox.checked;
  saveChecklistState(state);
  renderLaunchReadiness();
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: async () => {
    renderTableSummary();
    await loadLaunchReadiness();
    setStatus("", "success");
  }
}).catch((error) => reportAdminBootError(loading, error));
