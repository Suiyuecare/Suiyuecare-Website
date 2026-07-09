import fs from "node:fs";
import path from "node:path";

const files = ["app.js", "index.html"].filter((file) => fs.existsSync(file));
const migrationDir = "supabase/migrations";
const forbiddenPatterns = [
  { pattern: /請到後台/, reason: "前台空狀態不應要求使用者到後台操作" },
  { pattern: /請在後台/, reason: "前台空狀態不應要求使用者到後台操作" },
  { pattern: /來自 Supabase/, reason: "前台文案不應暴露資料來源實作" },
  { pattern: /從 Supabase 取得/, reason: "前台載入文案不應暴露資料來源實作" },
  { pattern: /Supabase 投資人/, reason: "前台文案不應暴露資料來源實作" },
  { pattern: /資料表管理/, reason: "前台文案不應描述資料表" },
  { pattern: /串接 WordPress/, reason: "前台文案不應暴露未來技術串接" },
  { pattern: /正式上線時可串接/, reason: "前台文案不應保留開發備註" },
  { pattern: /目前先以模板/, reason: "前台文案不應保留模板備註" },
  { pattern: /等待後台/, reason: "前台空狀態應用使用者語氣" },
  { pattern: /寄信尚未/, reason: "表單備援訊息不應暴露寄信設定" },
  { pattern: /已留存後台|留存在後台/, reason: "前台表單訊息應使用「系統」等使用者語氣" }
];

const failures = [];
const homeVideoEmbed = "https://www.youtube.com/embed/8KfH7t4gk28";
const homeVideoWatch = "https://www.youtube.com/watch?v=8KfH7t4gk28";
const legacyVideoId = "dQw4w9WgXcQ";
const youtubeIframeAllow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
const allowedCmsAnchors = new Set([
  "contact",
  "care-system",
  "investor-downloads"
]);

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    for (const check of forbiddenPatterns) {
      if (check.pattern.test(line)) {
        failures.push(`${file}:${index + 1} - ${check.reason} - ${line.trim()}`);
      }
    }
  });
}

const appSource = fs.existsSync("app.js") ? fs.readFileSync("app.js", "utf8") : "";
const indexSource = fs.existsSync("index.html") ? fs.readFileSync("index.html", "utf8") : "";
const homeSeedFile = "supabase/migrations/20260521000200_add_home_modules_and_page_templates.sql";
const homeSeedSource = fs.existsSync(homeSeedFile) ? fs.readFileSync(homeSeedFile, "utf8") : "";
const homeCmsRouteSeedFiles = new Set([
  "supabase/migrations/20260521000200_add_home_modules_and_page_templates.sql",
  "supabase/migrations/20260521000400_seed_home_remaining_modules.sql",
  "supabase/migrations/20260521000900_add_site_settings.sql",
  "supabase/migrations/20260522000100_seed_frontend_page_sections.sql",
  "supabase/migrations/20260523000300_add_software_service_page.sql",
  "supabase/migrations/20260703000100_normalize_home_content_links.sql"
]);

function migrationFiles() {
  if (!fs.existsSync(migrationDir)) return [];
  return fs.readdirSync(migrationDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => path.join(migrationDir, file));
}

if (!appSource.includes(`HOME_UNIT_VIDEO_URL = "${homeVideoEmbed}"`)) {
  failures.push(`app.js - 首頁影片 fallback 必須使用 ${homeVideoEmbed}`);
}
if (!indexSource.includes(`iframe src="${homeVideoEmbed}"`)) {
  failures.push(`index.html - 首頁靜態影片 iframe 必須使用 ${homeVideoEmbed}`);
}
if (!indexSource.includes(`loading="lazy" allow="${youtubeIframeAllow}" referrerpolicy="strict-origin-when-cross-origin"`)) {
  failures.push("index.html - 首頁影片 iframe 必須 lazy load，並包含 allow 與 referrerpolicy 效能/安全屬性");
}
if (!appSource.includes(`YOUTUBE_IFRAME_ALLOW = "${youtubeIframeAllow}"`)) {
  failures.push("app.js - CMS 更新首頁影片時必須保留 YouTube iframe allow 屬性");
}
if (!appSource.includes('frame.loading = "lazy"') || !appSource.includes('frame.referrerPolicy = "strict-origin-when-cross-origin"')) {
  failures.push("app.js - CMS 更新首頁影片時必須保留 lazy loading 與 referrerPolicy");
}
if (!homeSeedSource.includes(homeVideoEmbed) || !homeSeedSource.includes(homeVideoWatch)) {
  failures.push(`${homeSeedFile} - 首頁影片 seed 必須同步 embed 與 watch URL`);
}
if (indexSource.includes(legacyVideoId) || homeSeedSource.includes(legacyVideoId)) {
  failures.push(`首頁影片不可回到舊影片 ID ${legacyVideoId}`);
}
if (!appSource.includes(`LEGACY_HOME_UNIT_VIDEO_ID = "${legacyVideoId}"`)) {
  failures.push("app.js - 必須保留舊影片 ID 替換保護，避免 CMS 舊資料覆蓋首頁影片");
}

for (const file of migrationFiles()) {
  const content = fs.readFileSync(file, "utf8");
  if (/\B#(?:article|care-story|master-talk)-/i.test(content)) {
    failures.push(`${file} - CMS seed/migration 不可保留舊內容 hash，請改用 /article、/care-story 或 /master-talk 乾淨網址`);
  }
  if (!homeCmsRouteSeedFiles.has(file)) continue;
  for (const match of content.matchAll(/['"]#([a-z0-9-]+)['"]/gi)) {
    const anchor = match[1];
    if (!allowedCmsAnchors.has(anchor)) {
      failures.push(`${file} - CMS seed/migration 不可保留頁面路由 hash "#${anchor}"，請改用乾淨網址`);
    }
  }
}

if (failures.length) {
  console.error("Front copy verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`ok - verified front copy in ${files.map((file) => path.basename(file)).join(", ")}`);
