import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_DIR = process.env.BACKUP_DIR || "backups";

const TABLES = [
  "pages",
  "page_sections",
  "media",
  "article_categories",
  "articles",
  "form_submissions",
  "content_templates",
  "analytics_report_schedules"
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
  exported_at: new Date().toISOString(),
  project_url: SUPABASE_URL,
  tables: {}
};

for (const table of TABLES) {
  payload.tables[table] = await fetchTable(table);
}

const body = JSON.stringify(payload, null, 2);
const checksum = createHash("sha256").update(body).digest("hex");
const filePath = join(BACKUP_DIR, `suiyuecare-cms-backup-${timestamp}.json`);
await writeFile(filePath, body);

console.log(JSON.stringify({ ok: true, filePath, checksum, tables: TABLES }, null, 2));
