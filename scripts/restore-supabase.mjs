import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const BACKUP_FILE = args.find((arg) => !arg.startsWith("--"));

const RESTORE_ORDER = [
  "media",
  "site_settings",
  "pages",
  "page_sections",
  "content_modules",
  "page_template_fields",
  "article_categories",
  "articles",
  "courses",
  "downloadable_files",
  "care_stories",
  "expert_talks",
  "recruiting_pages",
  "recruiting_departments",
  "recruiting_openings",
  "milestones",
  "investor_notices",
  "investor_financial_items",
  "investor_chart_datasets",
  "content_templates",
  "analytics_report_schedules"
];

if (!SUPABASE_URL || !SERVICE_KEY || !BACKUP_FILE) {
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/restore-supabase.mjs [--dry-run] backups/file.json");
  process.exit(1);
}

const OPTIONAL_TABLES = new Set(["site_settings", "content_modules", "page_template_fields", "downloadable_files", "content_templates", "milestones", "analytics_report_schedules"]);

function checksumPayloadForBackup(backup) {
  const clone = { ...backup };
  delete clone.checksum;
  return JSON.stringify(clone);
}

function validateBackup(backup) {
  if (!backup || backup.app !== "suiyuecare-cms") throw new Error("This is not a Suiyuecare CMS backup.");
  if (backup.format_version !== 1) throw new Error(`Unsupported backup format version: ${backup.format_version}`);
  if (!backup.tables || typeof backup.tables !== "object") throw new Error("Backup is missing tables.");
  if (backup.checksum) {
    const checksum = createHash("sha256").update(checksumPayloadForBackup(backup)).digest("hex");
    if (checksum !== backup.checksum) throw new Error("Backup checksum mismatch.");
  }
  const missingTables = RESTORE_ORDER.filter((table) => !Array.isArray(backup.tables[table]));
  const missingRequired = missingTables.filter((table) => !OPTIONAL_TABLES.has(table));
  if (missingRequired.length) throw new Error(`Backup is missing required tables: ${missingRequired.join(", ")}`);
  return missingTables;
}

async function upsertRows(table, rows) {
  if (!rows?.length) return { table, count: 0 };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify(rows)
  });
  if (!response.ok) throw new Error(`${table}: ${await response.text()}`);
  return { table, count: rows.length };
}

const backup = JSON.parse(await readFile(BACKUP_FILE, "utf8"));
const missingTables = validateBackup(backup);
const planned = RESTORE_ORDER.map((table) => ({ table, count: Array.isArray(backup.tables?.[table]) ? backup.tables[table].length : 0 }));

if (DRY_RUN) {
  console.log(JSON.stringify({ ok: true, dryRun: true, file: BACKUP_FILE, planned, missingTables }, null, 2));
  process.exit(0);
}

const results = [];
for (const table of RESTORE_ORDER) {
  results.push(await upsertRows(table, backup.tables?.[table] || []));
}

console.log(JSON.stringify({ ok: true, restored: results, missingTables }, null, 2));
