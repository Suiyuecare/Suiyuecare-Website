import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const siteOrigin = "https://www.suiyuecare.com";
const privateDistPaths = [
  "assets/backups"
];

const publicRoutePaths = new Map([
  ["home", "/"],
  ["about", "/about"],
  ["milestones", "/milestones"],
  ["home-care", "/home-care"],
  ["day-care", "/day-care"],
  ["community", "/community"],
  ["nursing", "/nursing"],
  ["migrant-training", "/migrant-training"],
  ["quality", "/quality"],
  ["software", "/software"],
  ["courses", "/courses"],
  ["talent", "/talent"],
  ["land", "/land"],
  ["investor-recruiting", "/investor-recruiting"],
  ["health", "/health"],
  ["search", "/search"],
  ["investors", "/investors"],
  ["ir-finance", "/ir-finance"],
  ["ir-governance", "/ir-governance"],
  ["ir-shareholders", "/ir-shareholders"],
  ["contact", "/contact"]
]);

const routes = [
  {
    slug: "home",
    path: "/",
    title: "歲悅長照集團｜Suiyuecare Corps.",
    description: "歲悅長照集團整合居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管，讓照顧變成家人看得懂、也放得下心的日常系統。",
    image: "/assets/hero-care-hero-fast.jpg",
    preloadImage: "/assets/hero-care-hero-fast.jpg",
    priority: "1.0"
  },
  {
    slug: "about",
    path: "/about",
    title: "關於歲悅｜歲悅長照集團",
    description: "3 分鐘認識歲悅長照集團的組織願景、使命、團隊文化、服務系統與團隊成員。",
    image: "/assets/homepage-batch/04-admin-team-office-fast.jpg",
    imageAlt: "歲悅團隊整理照顧服務系統",
    preloadImage: "/assets/homepage-batch/04-admin-team-office-fast.jpg",
    priority: "0.92"
  },
  {
    slug: "milestones",
    path: "/milestones",
    title: "大事記｜歲悅長照集團",
    description: "查看歲悅長照集團的重要里程碑、服務擴張、據點成立與合作紀錄。",
    image: "/assets/milestones/homecare-agency-launch.jpg",
    imageAlt: "歲悅居家長照機構成立里程碑",
    preloadImage: "/assets/milestones/homecare-agency-launch.jpg",
    priority: "0.9"
  },
  {
    slug: "home-care",
    path: "/home-care",
    title: "居家照顧｜歲悅長照集團",
    description: "歲悅居家照顧提供到宅照顧、生活協助、家屬溝通與服務紀錄，支持長輩在家安心生活。",
    image: "/assets/homecare-detail-01-greeting-hero-fast.jpg",
    imageAlt: "歲悅居家照顧服務員陪伴長輩",
    preloadImage: "/assets/homecare-detail-01-greeting-hero-fast.jpg",
    priority: "0.9"
  },
  {
    slug: "day-care",
    path: "/day-care",
    title: "日間照顧｜歲悅長照集團",
    description: "歲悅日間照顧以活動設計、餐食、復能與社交支持，降低家庭照顧壓力。",
    image: "/assets/daycare-detail-01-exercise-hero-fast.jpg",
    imageAlt: "歲悅日間照顧團體活動現場",
    preloadImage: "/assets/daycare-detail-01-exercise-hero-fast.jpg",
    priority: "0.9"
  },
  {
    slug: "community",
    path: "/community",
    title: "社區據點｜歲悅長照集團",
    description: "歲悅社區據點提供健康促進、共餐活動、預防延緩失能與在地照顧支持。",
    image: "/assets/community-detail-01-exercise-hero-hires.jpg",
    imageAlt: "歲悅社區據點健康促進活動",
    preloadImage: "/assets/community-detail-01-exercise-hero-hires.jpg",
    priority: "0.88"
  },
  {
    slug: "nursing",
    path: "/nursing",
    title: "護理復能｜歲悅長照集團",
    description: "結合護理評估、復能目標與健康監測，協助長輩恢復生活能力並降低照顧風險。",
    image: "/assets/nursing-detail-02-walking-hero-fast.jpg",
    imageAlt: "歲悅護理復能陪伴長輩步行訓練",
    preloadImage: "/assets/nursing-detail-02-walking-hero-fast.jpg",
    priority: "0.86"
  },
  {
    slug: "migrant-training",
    path: "/migrant-training",
    title: "移工培訓｜歲悅長照集團",
    description: "歲悅移工培訓提供照顧技能、家庭溝通、衛教與安全實作訓練，提升家庭照顧品質。",
    image: "/assets/migrant-detail-01-classroom-hero-fast.jpg",
    imageAlt: "歲悅移工照顧技能培訓課堂",
    preloadImage: "/assets/migrant-detail-01-classroom-hero-fast.jpg",
    priority: "0.84"
  },
  {
    slug: "quality",
    path: "/quality",
    title: "教育品管｜歲悅長照集團",
    description: "歲悅教育品管以標準化教材、督導制度、服務稽核與持續改善守住照顧品質。",
    image: "/assets/quality-detail-04-improvement-hero-fast.jpg",
    imageAlt: "歲悅教育品管會議與改善討論",
    preloadImage: "/assets/quality-detail-04-improvement-hero-fast.jpg",
    priority: "0.82"
  },
  {
    slug: "software",
    path: "/software",
    title: "軟體系統｜歲悅長照集團",
    description: "歲悅提供可客製化軟體系統，包含會計、人資、電子公文交換、專案管理、PDF 工具，以及居家與日照業務系統。",
    image: "/assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅後台系統與營運管理情境",
    preloadImage: "/assets/admin-recruit-02-operations-hero-hires.jpg",
    priority: "0.8"
  },
  {
    slug: "courses",
    path: "/courses",
    title: "課程報名｜歲悅長照集團",
    description: "查看歲悅照顧課程、移工培訓、家屬課程與專業研習，線上送出報名資訊。",
    image: "/assets/migrant-detail-01-classroom-hero-fast.jpg",
    imageAlt: "歲悅照顧課程與專業培訓",
    priority: "0.76"
  },
  {
    slug: "talent",
    path: "/talent",
    title: "人才招募｜歲悅長照集團",
    description: "加入歲悅長照團隊，探索照顧服務員、督導、日照、教學品管與行政職涯機會。",
    image: "/assets/career-team-hero-hd.jpg",
    imageAlt: "歲悅照顧服務督導招募形象",
    preloadImage: "/assets/career-team-hero-hd.jpg",
    priority: "0.76"
  },
  {
    slug: "land",
    path: "/land",
    title: "土地招募｜歲悅長照集團",
    description: "歲悅尋找適合日照、社區據點與複合式長照服務的土地或空間合作機會。",
    image: "/assets/land-recruit-hero-hd.jpg",
    imageAlt: "歲悅團隊與合作夥伴評估長照基地空間",
    preloadImage: "/assets/land-recruit-hero-hd.jpg",
    priority: "0.72"
  },
  {
    slug: "investor-recruiting",
    path: "/investor-recruiting",
    title: "投資人招募｜歲悅長照集團",
    description: "了解歲悅長照集團的展店模型、產業策略與投資合作機會。",
    image: "/assets/investor-recruit-hero-hd.jpg",
    imageAlt: "歲悅投資合作會議與營運簡報情境",
    preloadImage: "/assets/investor-recruit-hero-hd.jpg",
    priority: "0.72"
  },
  {
    slug: "health",
    path: "/health",
    title: "健康3.0｜歲悅長照照顧知識",
    description: "健康3.0整理長照申請、居家照顧、日照、復能、營養、失智與家屬支持文章。",
    image: "/assets/homepage-batch/18-health-fall-prevention-cover-fast.jpg",
    imageAlt: "健康3.0照顧知識文章封面",
    priority: "0.78"
  },
  {
    slug: "search",
    path: "/search",
    title: "搜尋照顧知識｜健康3.0",
    description: "搜尋歲悅健康3.0照顧知識文章、影音與照顧指南。",
    image: "/assets/homepage-batch/18-health-fall-prevention-cover-fast.jpg",
    imageAlt: "健康3.0照顧知識搜尋",
    preloadImage: "/assets/homepage-batch/18-health-fall-prevention-cover-fast.jpg",
    priority: "0.4",
    robots: "noindex, follow",
    sitemap: false
  },
  {
    slug: "investors",
    path: "/investors",
    title: "投資人專區｜歲悅長照集團",
    description: "歲悅投資人專區提供最新動態、營運進度、財務資訊、公司治理與股東專區資料。",
    image: "/assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅投資人專區營運資料",
    priority: "0.75"
  },
  {
    slug: "ir-finance",
    path: "/ir-finance",
    title: "財務資訊｜歲悅長照投資人專區",
    description: "查看歲悅長照每月營收、財務分析、季度財報、年報與可下載文件。",
    image: "/assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅財務資訊與營運報表",
    priority: "0.72"
  },
  {
    slug: "ir-governance",
    path: "/ir-governance",
    title: "公司治理｜歲悅長照投資人專區",
    description: "查看歲悅長照重要訊息、治理運作、管理階層、稽核、風險管理與誠信經營。",
    image: "/assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅公司治理與管理團隊",
    priority: "0.7"
  },
  {
    slug: "ir-shareholders",
    path: "/ir-shareholders",
    title: "股東專區｜歲悅長照投資人專區",
    description: "查看歲悅長照股務資訊、股東會、法說會、常見問答與股東文件下載。",
    image: "/assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅股東專區與投資人溝通",
    priority: "0.7"
  },
  {
    slug: "contact",
    path: "/contact",
    title: "聯絡我們｜歲悅長照集團",
    description: "聯絡歲悅長照集團，預約服務諮詢、課程合作、招募合作、投資洽談或一般客服。",
    image: "/assets/homepage-batch/15-phone-consultation-fast.jpg",
    imageAlt: "歲悅客服窗口電話諮詢",
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

const siteNavigation = [
  ["關於歲悅", "/about"],
  ["居家照顧", "/home-care"],
  ["日間照顧", "/day-care"],
  ["社區據點", "/community"],
  ["健康3.0", "/health"],
  ["課程報名", "/courses"],
  ["人才招募", "/talent"],
  ["聯絡我們", "/contact"]
];

function structuredDataForRoute(route) {
  const canonical = absoluteUrl(route.path);
  const isHome = route.path === "/";
  const graph = [
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": `${siteOrigin}/#organization`,
      name: "歲悅長照集團",
      alternateName: "Suiyuecare Corps.",
      url: `${siteOrigin}/`,
      logo: `${siteOrigin}/assets/company-logo.png`,
      image: absoluteUrl("/assets/hero-care-hero-fast.jpg"),
      telephone: "+886-2-6604-5432",
      email: "generalaffairs@suiyuecare.com",
      slogan: "照顧就像去超商，買牛奶一樣簡單。",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "臺北市",
        addressRegion: "臺北市",
        addressCountry: "TW"
      },
      areaServed: ["臺北市", "新北市", "桃園市"],
      knowsAbout: ["居家照顧", "日間照顧", "社區據點", "護理復能", "移工培訓", "教育品管", "長照申請"],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+886-2-6604-5432",
          contactType: "customer service",
          areaServed: "TW",
          availableLanguage: ["zh-Hant", "zh-TW"]
        }
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00"
        }
      ],
      sameAs: ["https://lin.ee/oaPkGiq"]
    },
    {
      "@type": "WebSite",
      "@id": `${siteOrigin}/#website`,
      name: "歲悅長照集團",
      alternateName: "Suiyuecare Corps.",
      url: `${siteOrigin}/`,
      publisher: {
        "@id": `${siteOrigin}/#organization`
      },
      inLanguage: "zh-Hant-TW"
    },
    {
      "@type": "WebPage",
      "@id": isHome ? `${siteOrigin}/#webpage` : `${canonical}#webpage`,
      url: canonical,
      name: route.title,
      description: route.description,
      isPartOf: {
        "@id": `${siteOrigin}/#website`
      },
      about: {
        "@id": `${siteOrigin}/#organization`
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: absoluteUrl(route.image)
      },
      inLanguage: "zh-Hant-TW"
    },
    {
      "@type": "ItemList",
      "@id": `${siteOrigin}/#site-navigation`,
      name: "歲悅長照集團主要子目錄",
      itemListElement: siteNavigation.map(([name, routePath], index) => ({
        "@type": "SiteNavigationElement",
        position: index + 1,
        name,
        url: absoluteUrl(routePath)
      }))
    }
  ];

  if (!isHome) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "首頁",
          item: `${siteOrigin}/`
        },
        {
          "@type": "ListItem",
          position: 2,
          name: route.title.replace(/｜.*$/, ""),
          item: canonical
        }
      ]
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

function replaceStructuredData(html, route) {
  const json = structuredDataForRoute(route)
    .replace(/</g, "\\u003c")
    .replace(/<\/script/gi, "<\\/script");
  return html.replace(
    /<script id="structuredData" type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="structuredData" type="application/ld+json">\n${json}\n    </script>`
  );
}

function routeHashLinksToPaths(html) {
  let output = html;
  for (const [slug, routePath] of publicRoutePaths) {
    output = output.replaceAll(`href="#${slug}"`, `href="${routePath}"`);
  }
  output = output.replace(/\bhref="#article-([^"?]+)(\?[^"]*)?"/g, (_match, slug, query = "") => `href="/article/${slug}${query}"`);
  output = output.replace(/\bhref="#care-story-([^"?]+)(\?[^"]*)?"/g, (_match, slug, query = "") => `href="/care-story/${slug}${query}"`);
  output = output.replace(/\bhref="#master-talk-([^"?]+)(\?[^"]*)?"/g, (_match, slug, query = "") => `href="/master-talk/${slug}${query}"`);
  return output;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function markCurrentRouteLinks(html, route) {
  const href = route.path === "/" ? "/" : route.path;
  const hrefPattern = escapeRegExp(href);
  return html.replace(
    new RegExp(`<a\\b((?=[^>]*\\bhref="${hrefPattern}")(?![^>]*\\baria-current=)[^>]*)>`, "g"),
    '<a$1 aria-current="page">'
  );
}

function tagAttr(tag = "", name = "") {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] || "";
}

function hasTagAttr(tag = "", name = "") {
  return new RegExp(`\\b${name}(?:=["'][^"']*["'])?`, "i").test(tag);
}

function insertAttrs(tag = "", attrs = "") {
  return tag.replace(/\s*\/?>$/, (ending) => `${attrs}${ending}`);
}

function optimizeStaticImageTags(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tagAttr(tag, "src");
    const isBrandMark = /company-logo/i.test(src) || /\bbrand-mark\b/i.test(tag);
    let output = tag;
    if (!hasTagAttr(output, "loading")) {
      output = insertAttrs(output, ` loading="${isBrandMark ? "eager" : "lazy"}"`);
    }
    if (!hasTagAttr(output, "decoding")) {
      output = insertAttrs(output, ' decoding="async"');
    }
    if (!hasTagAttr(output, "fetchpriority") && isBrandMark) {
      output = insertAttrs(output, ' fetchpriority="high"');
    }
    return output;
  });
}

function todayInTaipei() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function stripHomeShell(html, route) {
  const homeStart = html.indexOf('<div class="home-page page active" id="home">');
  const pageViewStart = html.indexOf('<section class="page detail-page" id="pageView"');
  if (homeStart === -1 || pageViewStart === -1 || pageViewStart <= homeStart) {
    throw new Error(`Unable to strip static home shell for ${route.path}`);
  }

  const minimalHome = '<div class="home-page page" id="home" data-static-shell="minimal" aria-hidden="true"></div>\n\n      ';
  return `${html.slice(0, homeStart)}${minimalHome}${html.slice(pageViewStart)}`
    .replaceAll('href="#home"', 'href="/"');
}

function routeHtml(baseHtml, route) {
  const canonical = absoluteUrl(route.path);
  const image = absoluteUrl(route.image);
  const imageAlt = route.imageAlt || `${route.title.replace(/｜.*$/, "")}形象圖`;
  const preloadImage = route.preloadImage || route.image;
  let html = baseHtml;
  html = html.replace(/<html lang="zh-Hant">/, `<html lang="zh-Hant" data-initial-route="${route.slug}">`);
  html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);
  html = replaceAttr(html, /(<meta name="description" content=")(.*?)(" \/>)/, route.description);
  html = replaceAttr(html, /(<link rel="canonical" href=")(.*?)(" \/>)/, canonical);
  html = replaceAttr(html, /(<meta property="og:url" content=")(.*?)(" \/>)/, canonical);
  html = replaceAttr(html, /(<meta property="og:title" content=")(.*?)(" \/>)/, route.title);
  html = replaceAttr(html, /(<meta property="og:description" content=")(.*?)(" \/>)/, route.description);
  html = replaceAttr(html, /(<meta property="og:image" content=")(.*?)(" \/>)/, image);
  html = replaceAttr(html, /(<meta property="og:image:alt" content=")(.*?)(" \/>)/, imageAlt);
  html = replaceAttr(html, /(<meta name="twitter:title" content=")(.*?)(" \/>)/, route.title);
  html = replaceAttr(html, /(<meta name="twitter:description" content=")(.*?)(" \/>)/, route.description);
  html = replaceAttr(html, /(<meta name="twitter:image" content=")(.*?)(" \/>)/, image);
  html = replaceAttr(html, /(<meta name="twitter:image:alt" content=")(.*?)(" \/>)/, imageAlt);
  html = replaceAttr(html, /(<link id="heroPreload" rel="preload" as="image" href=")(.*?)(" fetchpriority="high"(?: media="[^"]*")? \/>)/, preloadImage);
  html = replaceAttr(html, /(<meta name="robots" content=")(.*?)(" \/>)/, route.robots || "index, follow");
  html = html.replace(/(<meta name="deployment-version" content=")(.*?)(" \/>)/, `$1ux-seo-form-20260702$3`);
  html = replaceStructuredData(html, route);
  html = routeHashLinksToPaths(html);
  if (route.path !== "/") {
    html = stripHomeShell(html, route);
  }
  html = markCurrentRouteLinks(html, route);
  html = optimizeStaticImageTags(html);
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

const today = todayInTaipei();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
  </url>`).filter((_, index) => routes[index].sitemap !== false).join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
