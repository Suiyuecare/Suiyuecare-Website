import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const siteOrigin = "https://www.suiyuecare.com";
const privateDistPaths = [
  "assets/backups"
];

const routes = [
  {
    slug: "home",
    path: "/",
    title: "歲悅長照集團｜Suiyuecare Corps.",
    description: "歲悅長照集團整合居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管，讓照顧變成家人看得懂、也放得下心的日常系統。",
    image: "/assets/hero-care-hero-fast.jpg",
    priority: "1.0"
  },
  {
    slug: "home-care",
    path: "/home-care/",
    title: "居家照顧｜歲悅長照集團",
    description: "歲悅居家照顧提供到宅照顧、生活協助、家屬溝通與服務紀錄，支持長輩在家安心生活。",
    image: "/assets/homecare-detail-01-greeting-hero-fast.jpg",
    priority: "0.9"
  },
  {
    slug: "day-care",
    path: "/day-care/",
    title: "日間照顧｜歲悅長照集團",
    description: "歲悅日間照顧以活動設計、餐食、復能與社交支持，降低家庭照顧壓力。",
    image: "/assets/daycare-detail-01-exercise-hero-fast.jpg",
    priority: "0.9"
  },
  {
    slug: "community",
    path: "/community/",
    title: "社區據點｜歲悅長照集團",
    description: "歲悅社區據點提供健康促進、共餐活動、預防延緩失能與在地照顧支持。",
    image: "/assets/community-detail-01-exercise-hero-fast.jpg",
    priority: "0.88"
  },
  {
    slug: "nursing",
    path: "/nursing/",
    title: "護理復能｜歲悅長照集團",
    description: "結合護理評估、復能目標與健康監測，協助長輩恢復生活能力並降低照顧風險。",
    image: "/assets/nursing-detail-02-walking-hero-fast.jpg",
    priority: "0.86"
  },
  {
    slug: "migrant-training",
    path: "/migrant-training/",
    title: "移工培訓｜歲悅長照集團",
    description: "歲悅移工培訓提供照顧技能、家庭溝通、衛教與安全實作訓練，提升家庭照顧品質。",
    image: "/assets/migrant-detail-01-classroom-hero-fast.jpg",
    priority: "0.84"
  },
  {
    slug: "quality",
    path: "/quality/",
    title: "教育品管｜歲悅長照集團",
    description: "歲悅教育品管以標準化教材、督導制度、服務稽核與持續改善守住照顧品質。",
    image: "/assets/quality-detail-04-improvement-hero-fast.jpg",
    priority: "0.82"
  },
  {
    slug: "software",
    path: "/software/",
    title: "軟體系統｜歲悅長照集團",
    description: "歲悅提供可客製化軟體系統，包含會計、人資、電子公文交換、專案管理、PDF 工具，以及居家與日照業務系統。",
    image: "/assets/admin-recruit-02-operations-hero-fast.jpg",
    priority: "0.8"
  },
  {
    slug: "courses",
    path: "/courses/",
    title: "課程報名｜歲悅長照集團",
    description: "查看歲悅照顧課程、移工培訓、家屬課程與專業研習，線上送出報名資訊。",
    image: "/assets/migrant-detail-01-classroom-hero-fast.jpg",
    priority: "0.76"
  },
  {
    slug: "health",
    path: "/health/",
    title: "健康3.0｜歲悅長照照顧知識",
    description: "健康3.0整理長照申請、居家照顧、日照、復能、營養、失智與家屬支持文章。",
    image: "/assets/homepage-batch/18-health-fall-prevention-cover.png",
    priority: "0.78"
  },
  {
    slug: "investors",
    path: "/investors/",
    title: "投資人專區｜歲悅長照集團",
    description: "歲悅投資人專區提供最新動態、營運進度、財務資訊、公司治理與股東專區資料。",
    image: "/assets/admin-recruit-02-operations-hero-fast.jpg",
    priority: "0.75"
  },
  {
    slug: "ir-finance",
    path: "/ir-finance/",
    title: "財務資訊｜歲悅長照投資人專區",
    description: "查看歲悅長照每月營收、財務分析、季度財報、年報與可下載文件。",
    image: "/assets/admin-recruit-02-operations-hero-fast.jpg",
    priority: "0.72"
  },
  {
    slug: "ir-governance",
    path: "/ir-governance/",
    title: "公司治理｜歲悅長照投資人專區",
    description: "查看歲悅長照重要訊息、治理運作、管理階層、稽核、風險管理與誠信經營。",
    image: "/assets/admin-recruit-02-operations-hero-fast.jpg",
    priority: "0.7"
  },
  {
    slug: "ir-shareholders",
    path: "/ir-shareholders/",
    title: "股東專區｜歲悅長照投資人專區",
    description: "查看歲悅長照股務資訊、股東會、法說會、常見問答與股東文件下載。",
    image: "/assets/admin-recruit-02-operations-hero-fast.jpg",
    priority: "0.7"
  },
  {
    slug: "contact",
    path: "/contact/",
    title: "聯絡我們｜歲悅長照集團",
    description: "聯絡歲悅長照集團，預約服務諮詢、課程合作、招募合作、投資洽談或一般客服。",
    image: "/assets/homepage-batch/15-phone-consultation.png",
    priority: "0.72"
  }
];

function absoluteUrl(value) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteOrigin}${value.startsWith("/") ? value : `/${value}`}`;
}

function replaceAttr(html, selector, value) {
  const escaped = String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return html.replace(selector, (_, before, _oldValue, after) => `${before}${escaped}${after}`);
}

function routeHtml(baseHtml, route) {
  const canonical = absoluteUrl(route.path);
  const image = absoluteUrl(route.image);
  let html = baseHtml;
  html = html.replace(/<html lang="zh-Hant">/, `<html lang="zh-Hant" data-initial-route="${route.slug}">`);
  html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);
  html = replaceAttr(html, /(<meta name="description" content=")(.*?)(" \/>)/, route.description);
  html = replaceAttr(html, /(<link rel="canonical" href=")(.*?)(" \/>)/, canonical);
  html = replaceAttr(html, /(<meta property="og:url" content=")(.*?)(" \/>)/, canonical);
  html = replaceAttr(html, /(<meta property="og:title" content=")(.*?)(" \/>)/, route.title);
  html = replaceAttr(html, /(<meta property="og:description" content=")(.*?)(" \/>)/, route.description);
  html = replaceAttr(html, /(<meta property="og:image" content=")(.*?)(" \/>)/, image);
  html = replaceAttr(html, /(<meta name="twitter:title" content=")(.*?)(" \/>)/, route.title);
  html = replaceAttr(html, /(<meta name="twitter:description" content=")(.*?)(" \/>)/, route.description);
  html = replaceAttr(html, /(<meta name="twitter:image" content=")(.*?)(" \/>)/, image);
  html = html.replace(/(<meta name="deployment-version" content=")(.*?)(" \/>)/, `$1seo-routes-20260616$3`);
  return html;
}

if (!fs.existsSync(indexPath)) {
  throw new Error("dist/index.html not found. Run vite build first.");
}

for (const privatePath of privateDistPaths) {
  fs.rmSync(path.join(distDir, privatePath), { recursive: true, force: true });
}

const baseHtml = fs.readFileSync(indexPath, "utf8");
for (const route of routes) {
  if (route.path === "/") {
    fs.writeFileSync(indexPath, routeHtml(baseHtml, route));
    continue;
  }
  const routeDir = path.join(distDir, route.path);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, "index.html"), routeHtml(baseHtml, route));
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
