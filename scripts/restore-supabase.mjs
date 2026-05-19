import { readFile } from "node:fs/promises";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_FILE = process.argv[2];

const RESTORE_ORDER = [
  "media",
  "article_categories",
  "pages",
  "page_sections",
  "articles",
  "content_templates",
  "analytics_report_schedules"
];

if (!SUPABASE_URL || !SERVICE_KEY || !BACKUP_FILE) {
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/restore-supabase.mjs backups/file.json");
  process.exit(1);
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
const results = [];

for (const table of RESTORE_ORDER) {
  results.push(await upsertRows(table, backup.tables?.[table] || []));
}

console.log(JSON.stringify({ ok: true, restored: results }, null, 2));
