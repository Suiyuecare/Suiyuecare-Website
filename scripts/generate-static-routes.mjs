import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { renderArticleSlideDeck } from "../article-slide-deck.js";
import { renderContactPage } from "../contact-page.mjs";
import {
  normalizePublicAssetUrl,
  renderPublicArticleLayout,
  renderPublicHealthIndex
} from "../public-content-renderer.mjs";
import {
  articlePublicHref,
  articlePublicSlug
} from "../article-url-map.mjs";
import { publicStructuredDataJson } from "../public-route-structured-data.mjs";
import { loadPublicContent } from "./load-public-content.mjs";
import { prerenderPublicPages } from "./prerender-public-pages.mjs";
import { normalizePublicHtmlAssets } from "./public-html-assets.mjs";
import { getPublicServiceLocations, serviceLocationRoutes } from "../public-service-locations.mjs";
import { EDITORIAL_POLICY_ROUTE, getPublicEditorialInfo, renderEditorialPolicyPage } from "../public-editorial.mjs";

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

const staticRoutes = [
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
    image: "/assets/about/about-team-group-hero-v2.jpg",
    imageAlt: "歲悅長照跨專業團隊大合照",
    preloadImage: "/assets/about/about-team-group-hero-v2.jpg",
    priority: "0.92"
  },
  {
    slug: "milestones",
    path: "/milestones",
    title: "大事記｜歲悅長照集團",
    description: "查看歲悅長照集團的重要里程碑、服務擴張、據點成立與合作紀錄。",
    image: "/assets/milestones/milestones-team-care-planning-hero-v2.jpg",
    imageAlt: "歲悅居家長照機構成立里程碑",
    preloadImage: "/assets/milestones/milestones-team-care-planning-hero-v2.jpg",
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
    image: "/assets/brand-scenes/rehab-v2.jpg",
    imageAlt: "歲悅護理復能陪伴長輩步行訓練",
    preloadImage: "/assets/brand-scenes/rehab-v2.jpg",
    priority: "0.86"
  },
  {
    slug: "migrant-training",
    path: "/migrant-training",
    title: "移工培訓｜歲悅長照集團",
    description: "歲悅移工培訓提供照顧技能、家庭溝通、衛教與安全實作訓練，提升家庭照顧品質。",
    image: "/assets/brand-scenes/migrant-v2.jpg",
    imageAlt: "歲悅移工照顧技能培訓課堂",
    preloadImage: "/assets/brand-scenes/migrant-v2.jpg",
    priority: "0.84"
  },
  {
    slug: "quality",
    path: "/quality",
    title: "教育品管｜歲悅長照集團",
    description: "歲悅教育品管以標準化教材、督導制度、服務稽核與持續改善守住照顧品質。",
    image: "/assets/brand-scenes/quality-v2.jpg",
    imageAlt: "歲悅教育品管會議與改善討論",
    preloadImage: "/assets/brand-scenes/quality-v2.jpg",
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
    stylesheets: [{ id: "coursePageStyles", href: "/course-page.css" }],
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
    image: "/assets/brand-scenes/phone-v2.jpg",
    imageAlt: "歲悅客服窗口電話諮詢",
    priority: "0.72"
  }
];

function sitemapDate(value = "") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayInTaipei();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function contentRoute(item) {
  const slideDeckHtml = item.slides?.length
    ? renderArticleSlideDeck(item, normalizePublicAssetUrl)
    : "";
  return {
    slug: `${item.contentKind}-${item.publicSlug || item.slug}`,
    path: item.href,
    title: item.seoTitle || `${item.title}｜健康3.0`,
    description: item.seoDescription || item.excerpt || item.subtitle,
    image: item.ogImage || item.image,
    imageAlt: item.ogImageAlt || item.imageAlt || item.title,
    preloadImage: item.image,
    priority: item.isFeatured ? "0.82" : "0.72",
    type: "article",
    lastmod: sitemapDate(getPublicEditorialInfo(item).contentUpdatedAt || item.lastmod || item.updatedAt || item.publishedAt),
    article: item,
    breadcrumbParent: {
      name: item.contentKind === "care-story" ? "照顧故事" : item.contentKind === "master-talk" ? "名人講堂" : "健康3.0",
      path: "/health"
    },
    prerenderedHtml: renderPublicArticleLayout(item, {
      related: item.related,
      slideDeckHtml
    })
  };
}

const publicContent = await loadPublicContent();
const prerenderedPages = await prerenderPublicPages(publicContent.snapshot);
const supplementalRoutes = [
  ...serviceLocationRoutes(publicContent.snapshot),
  { ...EDITORIAL_POLICY_ROUTE, slug: "editorial-policy", priority: "0.6", prerenderedHtml: renderEditorialPolicyPage() }
];
for (const route of supplementalRoutes) publicRoutePaths.set(route.slug, route.path);
const routes = [
  ...staticRoutes.map((route) => route.slug === "health"
    ? {
        ...route,
        prerenderedHtml: renderPublicHealthIndex(publicContent.articles, publicContent.categories)
      }
    : route.slug === "contact"
      ? { ...route, prerenderedHtml: renderContactPage() }
      : prerenderedPages.has(route.slug)
        ? {
            ...route,
            title: prerenderedPages.get(route.slug).title || route.title,
            description: prerenderedPages.get(route.slug).description || route.description,
            prerenderedHtml: prerenderedPages.get(route.slug).html,
            inlineStyles: prerenderedPages.get(route.slug).inlineStyles
          }
        : route),
  ...supplementalRoutes,
  ...publicContent.items.map(contentRoute)
];

const routePaths = new Set();
for (const route of routes) {
  if (routePaths.has(route.path)) throw new Error(`Duplicate public route generated: ${route.path}`);
  routePaths.add(route.path);
}

function absoluteUrl(value) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteOrigin}${value.startsWith("/") ? value : `/${value}`}`;
}

function replaceAttr(html, selector, value) {
  const escaped = String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return html.replace(selector, (_, before, _oldValue, after) => `${before}${escaped}${after}`);
}


function replaceStructuredData(html, route) {
  const json = publicStructuredDataJson(route, siteOrigin)
    .replace(/</g, "\\u003c")
    .replace(/<\/script/gi, "<\\/script");
  return html.replace(
    /<script id="structuredData" type="application\/ld\+json">[\s\S]*?<\/script>/,
    () => `<script id="structuredData" type="application/ld+json">\n${json}\n    </script>`
  );
}

function routeHashLinksToPaths(html) {
  let output = html;
  for (const [slug, routePath] of publicRoutePaths) {
    output = output.replaceAll(`href="#${slug}"`, `href="${routePath}"`);
  }
  output = output.replace(/\bhref="#article-([^"?]+)(\?[^"]*)?"/g, (_match, slug, query = "") => `href="${articlePublicHref(slug)}${query}"`);
  output = output.replace(/\bhref="\/article\/([^"?/]+)(\?[^"]*)?"/g, (match, slug, query = "") => {
    const publicSlug = articlePublicSlug(slug);
    return publicSlug ? `href="/article/${publicSlug}${query}"` : match;
  });
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

function injectPrerenderedContent(html, route) {
  if (!route.prerenderedHtml) return html;
  const pageView = '<section class="page detail-page" id="pageView" aria-live="polite"></section>';
  if (!html.includes(pageView)) {
    throw new Error(`Unable to inject pre-rendered content for ${route.path}`);
  }
  return html.replace(
    pageView,
    `<section class="page detail-page active" id="pageView" aria-live="polite" data-prerendered-route="${route.slug}">${route.prerenderedHtml}</section>`
  );
}

function insertArticleMeta(html, route) {
  if (!route.article) return html;
  const articleMeta = [
    `<meta property="article:published_time" content="${route.article.publishedAt}" />`,
    `<meta property="article:modified_time" content="${getPublicEditorialInfo(route.article).contentUpdatedAt || route.article.updatedAt || route.article.publishedAt}" />`,
    `<meta property="article:section" content="${route.article.category || "照顧知識"}" />`,
    ...(route.article.tags || []).slice(0, 12)
      .map((tag) => `<meta property="article:tag" content="${String(tag).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" />`)
  ].join("\n    ");
  return html.replace("</head>", `    ${articleMeta}\n  </head>`);
}

function routeHtml(baseHtml, route) {
  const canonical = absoluteUrl(route.path);
  const image = absoluteUrl(route.image);
  const imageAlt = route.imageAlt || `${route.title.replace(/｜.*$/, "")}形象圖`;
  const preloadImage = route.preloadImage || route.image;
  let html = baseHtml;
  html = html.replace(/<html lang="zh-Hant">/, `<html lang="zh-Hant" data-initial-route="${route.slug}">`);
  html = html.replace(/<title>.*?<\/title>/, () => `<title>${String(route.title).replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character])}</title>`);
  html = replaceAttr(html, /(<meta name="description" content=")(.*?)(" \/>)/, route.description);
  html = replaceAttr(html, /(<link rel="canonical" href=")(.*?)(" \/>)/, canonical);
  html = replaceAttr(html, /(<meta property="og:type" content=")(.*?)(" \/>)/, route.article ? "article" : "website");
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
  html = replaceAttr(
    html,
    /(<meta name="robots" content=")(.*?)(" \/>)/,
    route.robots || (route.article ? "index, follow, max-image-preview:large" : "index, follow")
  );
  html = html.replace(/(<meta name="deployment-version" content=")(.*?)(" \/>)/, `$1health-editorial-20260909-1$3`);
  html = insertArticleMeta(html, route);
  html = replaceStructuredData(html, route);
  if (route.path !== "/") {
    html = stripHomeShell(html, route);
  }
  html = injectPrerenderedContent(html, route);
  html = routeHashLinksToPaths(html);
  html = normalizePublicHtmlAssets(html);
  html = markCurrentRouteLinks(html, route);
  html = optimizeStaticImageTags(html);
  for (const stylesheet of route.stylesheets || []) {
    html = html.replace("</head>", () => `<link id="${stylesheet.id}" rel="stylesheet" href="${stylesheet.href}" />\n  </head>`);
  }
  if (route.inlineStyles) {
    html = html.replace("</head>", () => `<style id="publicPrerenderHeroStyles">${route.inlineStyles.replace(/</g, "\\3C ")}</style>\n  </head>`);
  }
  if (route.slug === "editorial-policy") html = html.replace(/<link\b(?=[^>]*\bid="heroPreload")[^>]*>\s*/g, "");
  const locationManifest = JSON.stringify(getPublicServiceLocations(publicContent.snapshot)).replace(/</g, "\\u003c");
  html = html.replace("</body>", () => `<script id="publicServiceLocationManifest" type="application/json">${locationManifest}</script>\n  </body>`);
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${route.lastmod || todayInTaipei()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
  </url>`).filter((_, index) => routes[index].sitemap !== false).join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);

const manifestRoutes = routes
  .filter((route) => route.sitemap !== false)
  .map((route) => {
    const routeContent = route.prerenderedHtml || `${route.title}\n${route.description}`;
    return {
      path: route.path,
      url: absoluteUrl(route.path),
      type: route.article?.contentKind || "page",
      lastmod: route.lastmod || todayInTaipei(),
      contentHash: crypto.createHash("sha256").update(routeContent).digest("hex")
    };
  });
const manifestHash = crypto
  .createHash("sha256")
  .update(JSON.stringify(manifestRoutes))
  .digest("hex");
const seoManifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  contentHash: manifestHash,
  cmsSnapshot: {
    generatedAt: publicContent.snapshot?.generatedAt || null,
    contentHash: publicContent.snapshot?.contentHash || null
  },
  counts: {
    pages: manifestRoutes.filter((route) => route.type === "page").length,
    articles: publicContent.articles.length,
    careStories: publicContent.stories.length,
    masterTalks: publicContent.talks.length,
    publicUrls: manifestRoutes.length
  },
  routes: manifestRoutes
};
fs.writeFileSync(
  path.join(distDir, "seo-manifest.json"),
  `${JSON.stringify(seoManifest, null, 2)}\n`
);
