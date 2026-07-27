import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const distDir = path.resolve(root, "dist");
const kib = 1024;

const routeBudgets = [
  { route: "/", file: "index.html", maxKb: 90 },
  { route: "/about", file: "about/index.html", maxKb: 45 },
  { route: "/milestones", file: "milestones/index.html", maxKb: 45 },
  { route: "/home-care", file: "home-care/index.html", maxKb: 45 },
  { route: "/day-care", file: "day-care/index.html", maxKb: 45 },
  { route: "/community", file: "community/index.html", maxKb: 45 },
  { route: "/nursing", file: "nursing/index.html", maxKb: 45 },
  { route: "/migrant-training", file: "migrant-training/index.html", maxKb: 45 },
  { route: "/quality", file: "quality/index.html", maxKb: 45 },
  { route: "/software", file: "software/index.html", maxKb: 45 },
  { route: "/courses", file: "courses/index.html", maxKb: 45 },
  { route: "/talent", file: "talent/index.html", maxKb: 45 },
  { route: "/land", file: "land/index.html", maxKb: 45 },
  { route: "/investor-recruiting", file: "investor-recruiting/index.html", maxKb: 45 },
  { route: "/health", file: "health/index.html", maxKb: 100 },
  { route: "/search", file: "search/index.html", maxKb: 45 },
  { route: "/investors", file: "investors/index.html", maxKb: 45 },
  { route: "/ir-finance", file: "ir-finance/index.html", maxKb: 45 },
  { route: "/ir-governance", file: "ir-governance/index.html", maxKb: 45 },
  { route: "/ir-shareholders", file: "ir-shareholders/index.html", maxKb: 45 },
  { route: "/contact", file: "contact/index.html", maxKb: 45 }
];

const entryBudgets = [
  { label: "front app bundle", prefix: "app-", ext: ".js", maxKb: 431, gzipMaxKb: 133 },
  { label: "front style bundle", prefix: "styles-", ext: ".css", maxKb: 251, gzipMaxKb: 46 },
  { label: "Supabase browser client chunk", prefix: "supabaseClient-", ext: ".js", maxKb: 260, gzipMaxKb: 75 }
];

const criticalImageBudgets = [
  { file: "assets/hero-care-hero-fast.jpg", maxKb: 900 },
  { file: "assets/hero-care-hero-fast-mobile.jpg", maxKb: 420 },
  { file: "assets/about/about-team-group-hero-v2.jpg", maxKb: 900 },
  { file: "assets/about/about-team-group-hero-v2-mobile.jpg", maxKb: 420 },
  { file: "assets/homepage-batch/16-taipei-service-office-fast.jpg", maxKb: 900 },
  { file: "assets/homepage-batch/16-taipei-service-office-fast-mobile.jpg", maxKb: 420 },
  { file: "assets/homecare-detail-01-greeting-hero-fast.jpg", maxKb: 900 },
  { file: "assets/homecare-detail-01-greeting-hero-fast-mobile.jpg", maxKb: 420 },
  { file: "assets/daycare-detail-01-exercise-hero-fast.jpg", maxKb: 900 },
  { file: "assets/daycare-detail-01-exercise-hero-fast-mobile.jpg", maxKb: 420 },
  { file: "assets/community-detail-01-exercise-hero-hires.jpg", maxKb: 950 },
  { file: "assets/community-detail-01-exercise-hero-hires-mobile.jpg", maxKb: 420 },
  { file: "assets/brand-scenes/rehab-v2.jpg", maxKb: 1000 },
  { file: "assets/brand-scenes/rehab-v2-mobile.jpg", maxKb: 420 },
  { file: "assets/brand-scenes/migrant-v2.jpg", maxKb: 1000 },
  { file: "assets/brand-scenes/migrant-v2-mobile.jpg", maxKb: 420 },
  { file: "assets/brand-scenes/quality-v2.jpg", maxKb: 900 },
  { file: "assets/brand-scenes/quality-v2-mobile.jpg", maxKb: 420 },
  { file: "assets/brand-scenes/care-team-v2.jpg", maxKb: 950 },
  { file: "assets/brand-scenes/care-team-v2-mobile.jpg", maxKb: 420 },
  { file: "assets/brand-scenes/phone-v2.jpg", maxKb: 900 },
  { file: "assets/brand-scenes/phone-v2-mobile.jpg", maxKb: 420 },
  { file: "assets/admin-recruit-02-operations-hero-hires.jpg", maxKb: 950 },
  { file: "assets/admin-recruit-02-operations-hero-hires-mobile.jpg", maxKb: 420 },
  { file: "assets/career-team-hero-hd.jpg", maxKb: 900 },
  { file: "assets/career-team-hero-hd-mobile.jpg", maxKb: 420 },
  { file: "assets/land-recruit-hero-hd.jpg", maxKb: 900 },
  { file: "assets/land-recruit-hero-hd-mobile.jpg", maxKb: 420 },
  { file: "assets/investor-recruit-hero-hd.jpg", maxKb: 900 },
  { file: "assets/investor-recruit-hero-hd-mobile.jpg", maxKb: 420 }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fileSize(filePath) {
  return fs.statSync(filePath).size;
}

function formatKb(bytes) {
  return `${(bytes / kib).toFixed(1)}KB`;
}

function assertBudget(filePath, maxKb, label) {
  assert(fs.existsSync(filePath), `${label} is missing: ${path.relative(root, filePath)}`);
  const size = fileSize(filePath);
  const max = maxKb * kib;
  assert(size <= max, `${label} is ${formatKb(size)}, over budget ${maxKb}KB.`);
  return size;
}

function findHashedAsset(prefix, ext) {
  const assetsDir = path.join(distDir, "assets");
  assert(fs.existsSync(assetsDir), "dist/assets is missing. Run pnpm build first.");
  const matches = fs.readdirSync(assetsDir)
    .filter((file) => file.startsWith(prefix) && file.endsWith(ext))
    .sort();
  assert(matches.length === 1, `Expected one ${prefix}*${ext} asset, found ${matches.length}: ${matches.join(", ") || "(none)"}`);
  return path.join(assetsDir, matches[0]);
}

function gzipSize(filePath) {
  return zlib.gzipSync(fs.readFileSync(filePath), { level: 9 }).length;
}

function verifyRouteHtmlBudgets() {
  let totalBytes = 0;
  for (const route of routeBudgets) {
    totalBytes += assertBudget(path.join(distDir, route.file), route.maxKb, `${route.route} HTML`);
  }
  console.log(`ok - public route HTML stays within budget (${formatKb(totalBytes)} total)`);
}

function verifyEntryAssetBudgets() {
  for (const budget of entryBudgets) {
    const filePath = findHashedAsset(budget.prefix, budget.ext);
    const raw = assertBudget(filePath, budget.maxKb, budget.label);
    const gzipped = gzipSize(filePath);
    assert(
      gzipped <= budget.gzipMaxKb * kib,
      `${budget.label} gzip size is ${formatKb(gzipped)}, over budget ${budget.gzipMaxKb}KB.`
    );
    console.log(`ok - ${budget.label} stays within budget (${formatKb(raw)} raw, ${formatKb(gzipped)} gzip)`);
  }
}

function verifyCriticalImageBudgets() {
  let largest = { file: "", size: 0 };
  for (const budget of criticalImageBudgets) {
    const filePath = path.join(distDir, budget.file);
    const size = assertBudget(filePath, budget.maxKb, budget.file);
    if (size > largest.size) largest = { file: budget.file, size };
  }
  console.log(`ok - critical hero images stay within budget (largest ${largest.file}, ${formatKb(largest.size)})`);
}

function verifyPerformanceBudgets() {
  assert(fs.existsSync(distDir), "dist directory not found. Run pnpm build first.");
  verifyRouteHtmlBudgets();
  verifyEntryAssetBudgets();
  verifyCriticalImageBudgets();
}

verifyPerformanceBudgets();
