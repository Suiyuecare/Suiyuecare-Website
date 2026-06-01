import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_DIR = process.env.BACKUP_DIR || "backups";
const BACKUP_TYPE = process.env.BACKUP_TYPE || "manual";
const BACKUP_NOTES = process.env.BACKUP_NOTES || null;

const TABLES = [
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
  "investor_notices",
  "investor_financial_items",
  "investor_chart_datasets",
  "content_templates",
  "analytics_report_schedules"
];

const EXCLUDED_TABLES = [
  "form_submissions",
  "analytics_page_views",
  "analytics_events",
  "analytics_alerts",
  "analytics_health_checks",
  "profiles",
  "admins",
  "backup_manifests"
];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

async function fetchTable(table) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });
  if (!response.ok) throw new Error(`${table}: ${await response.text()}`);
  return response.json();
}

await mkdir(BACKUP_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const payload = {
  app: "suiyuecare-cms",
  format_version: 1,
  created_at: new Date().toISOString(),
  backup_type: BACKUP_TYPE,
  notes: BACKUP_NOTES,
  excluded_tables: EXCLUDED_TABLES,
  project_url: SUPABASE_URL.replace(/\/$/, ""),
  tables: {}
};

for (const table of TABLES) {
  payload.tables[table] = await fetchTable(table);
}

payload.checksum = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
const body = JSON.stringify(payload, null, 2);
const filePath = join(BACKUP_DIR, `suiyuecare-cms-backup-${timestamp}.json`);
await writeFile(filePath, body);

console.log(JSON.stringify({ ok: true, filePath, checksum: payload.checksum, tables: TABLES, excludedTables: EXCLUDED_TABLES }, null, 2));
