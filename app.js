import { supabase } from "./src/lib/supabaseClient.js";

const pages = {
  about: {
    eyebrow: "About",
    title: "關於歲悅",
    intro: "歲悅長照以家庭需求為中心，整合照顧人力、專業訓練、品質管理與社區服務，建立可長期運作的照顧系統。",
    focus: ["集團願景與服務理念", "長照服務網絡", "跨專業團隊協作"],
    features: ["照顧不只到點，更要到位", "以制度承接每個家庭的信任", "讓前線服務被看見、被支持、被改善"]
  },
  milestones: {
    eyebrow: "Milestones",
    title: "大事記",
    intro: "整理歲悅長照的發展節點、服務擴張、據點成立與重要合作，讓外部夥伴快速理解集團脈絡。",
    focus: ["年度里程碑", "據點與服務擴張", "重要合作紀錄"],
    features: ["用時間軸呈現成長", "保留品牌與營運記憶", "支援投資人與合作夥伴認識集團"]
  },
  "home-care": {
    eyebrow: "Home Care",
    title: "居家照顧",
    intro: "提供到宅照顧、生活協助、陪伴服務與家屬溝通，協助長輩在熟悉的家中維持安全與尊嚴。",
    focus: ["身體照顧與生活照顧", "家屬回報與服務紀錄", "照顧計畫媒合"],
    features: ["到宅照顧安排", "照顧員培訓與督導", "服務品質追蹤"]
  },
  "day-care": {
    eyebrow: "Day Care",
    title: "日間照顧",
    intro: "以白天托顧、活動設計、餐食、復能與社交支持，降低家庭照顧壓力，也讓長輩保有生活節奏。",
    focus: ["日照中心介紹", "活動與餐食規劃", "接送與照顧流程"],
    features: ["生活作息穩定", "團體活動參與", "家屬壓力緩衝"]
  },
  community: {
    eyebrow: "Community",
    title: "社區據點",
    intro: "把預防照顧、健康促進與鄰里連結放進社區，讓長輩在離家更近的地方得到支持。",
    focus: ["社區活動", "預防延緩失能", "在地資源串聯"],
    features: ["共餐與健康課程", "據點活動報名", "鄰里照顧網絡"]
  },
  nursing: {
    eyebrow: "Nursing Rehab",
    title: "護理復能",
    intro: "結合護理評估、復能目標與健康監測，協助個案恢復生活能力，並降低照顧風險。",
    focus: ["護理專業評估", "復能目標設定", "健康風險追蹤"],
    features: ["個案狀態紀錄", "跨專業合作", "復能進度回饋"]
  },
  "migrant-training": {
    eyebrow: "Training",
    title: "移工培訓",
    intro: "針對家庭照顧移工提供照顧技能、溝通情境、衛教與安全訓練，讓照顧品質更穩定。",
    focus: ["照顧技能訓練", "家庭溝通情境", "安全與衛教"],
    features: ["課程模組化", "實作演練", "家屬共同參與"]
  },
  quality: {
    eyebrow: "Quality",
    title: "教育品管",
    intro: "透過標準化教材、督導制度、服務稽核與持續改善，把前線經驗轉化為可複製的照顧品質。",
    focus: ["教育訓練", "服務稽核", "品質改善"],
    features: ["新人與在職訓練", "督導回饋機制", "照顧紀錄與改善追蹤"]
  },
  software: {
    eyebrow: "Software",
    title: "軟體系統",
    intro: "歲悅把長照營運、行政管理與數位工具整合成可客製化的系統服務，協助單位把會計、人資、公文、專案、PDF 文件與居家/日照業務流程串成同一套工作節奏。",
    focus: ["客製化系統開發", "長照營運流程數位化", "行政與文件工具整合"],
    features: ["會計與人資系統", "電子公文交換與專案管理", "居家/日照業務系統"]
  },
  talent: {
    eyebrow: "Recruiting",
    title: "人才招募",
    intro: "邀請照顧服務員、督導、護理與營運夥伴加入，成為能支持家庭、也能持續成長的長照專業者。",
    focus: ["照服員與專業人員", "督導與營運職缺", "訓練與升遷制度"],
    features: ["清楚的職涯路徑", "穩定訓練支持", "友善團隊文化"]
  },
  land: {
    eyebrow: "Partnership",
    title: "土地招募",
    intro: "尋找適合日照、社區據點與複合式長照服務的土地或空間，一起打造在地照顧基礎建設。",
    focus: ["基地條件", "合作模式", "區域需求評估"],
    features: ["空間可行性評估", "服務半徑分析", "長照場域規劃"]
  },
  "investor-recruiting": {
    eyebrow: "Investment",
    title: "投資人招募",
    intro: "面向看好長照產業與在地服務網絡的投資夥伴，說明集團策略、展店模型與合作機會。",
    focus: ["投資亮點", "展店模型", "合作洽談"],
    features: ["產業趨勢說明", "營運模式摘要", "合作流程安排"]
  },
  health: {
    eyebrow: "Health 3.0",
    title: "健康3.0",
    intro: "照顧知識專欄，整理疾病徵兆、飲食營養、復能運動、失智照顧與家屬實用技巧。",
    focus: ["照顧知識文章", "健康衛教內容", "家屬常見問題"],
    features: ["文章分類", "專題企劃", "可分享的照顧指南"]
  },
  courses: {
    eyebrow: "Courses",
    title: "課程報名",
    intro: "整合照服員訓練、移工培訓、家屬照顧課與專業研習，讓課程資訊與報名流程集中管理。",
    focus: ["課程列表", "線上報名", "開課通知"],
    features: ["課程卡片", "名額與日期", "報名表單入口"]
  },
  investors: {
    eyebrow: "Investor Relations",
    title: "投資人專區",
    intro: "提供投資人了解歲悅長照營運、展店、財務重點與產業策略的專屬入口。",
    focus: ["營運摘要", "展店計畫", "投資人文件"],
    features: ["資訊分級呈現", "簡報與資料下載", "聯繫窗口"]
  },
  contact: {
    eyebrow: "Contact Us",
    title: "聯絡我們",
    intro: "不論是長照服務、課程報名、人才加入、土地合作或投資洽談，我們會依照你的需求安排合適窗口主動聯繫。",
    focus: ["服務諮詢", "合作與招募", "客服與據點窗口"],
    features: ["表單入口", "電話與信箱", "據點位置資訊"]
  }
};

const nav = document.querySelector(".primary-nav");
const menuToggle = document.querySelector(".menu-toggle");
let navGroups = document.querySelectorAll(".nav-group");
const home = document.querySelector("#home");
const pageView = document.querySelector("#pageView");
const revealItems = document.querySelectorAll(".reveal");
const introLoader = document.querySelector(".intro-loader");
const INTRO_SEEN_SESSION_KEY = "suiyuecare_intro_seen";
const COURSE_NOTIFY_EMAIL = "edu.control@suiyuecare.com";
const COURSE_LINE_URL = "https://lin.ee/oaPkGiq";
let siteSettings = {};
let siteSettingsLoaded = false;
let siteSettingsPromise = null;

function setPageViewBusy(isBusy = false) {
  if (!pageView) return;
  if (isBusy) {
    pageView.setAttribute("aria-busy", "true");
  } else {
    pageView.removeAttribute("aria-busy");
  }
}

const SITE_ORIGIN = "https://www.suiyuecare.com";
const DEFAULT_SEO = {
  title: "歲悅長照集團｜Suiyuecare Corps.",
  description: "歲悅長照集團整合居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管，讓照顧變成家人看得懂、也放得下心的日常系統。",
  image: "assets/hero-care-hero-fast.jpg",
  imageAlt: "歲悅長照照顧服務形象照",
  type: "website"
};
const HOME_HERO_INSTANT_IMAGE = "assets/hero-care-hero-fast.jpg";
const HOME_HERO_MOBILE_IMAGE = "assets/hero-care-hero-fast-mobile.jpg";
const HOME_UNIT_VIDEO_URL = "https://www.youtube.com/embed/8KfH7t4gk28";
const LEGACY_HOME_UNIT_VIDEO_ID = "dQw4w9WgXcQ";
const YOUTUBE_IFRAME_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
const routeHeroPreloads = {
  home: HOME_HERO_INSTANT_IMAGE,
  about: "assets/homepage-batch/04-admin-team-office-fast.jpg",
  milestones: "assets/milestones/homecare-agency-launch.jpg",
  "home-care": "assets/homecare-detail-01-greeting-hero-fast.jpg",
  "day-care": "assets/daycare-detail-01-exercise-hero-fast.jpg",
  community: "assets/community-detail-01-exercise-hero-hires.jpg",
  nursing: "assets/nursing-detail-02-walking-hero-fast.jpg",
  "migrant-training": "assets/migrant-detail-01-classroom-hero-fast.jpg",
  quality: "assets/quality-detail-04-improvement-hero-fast.jpg",
  software: "assets/admin-recruit-02-operations-hero-hires.jpg",
  talent: "assets/career-team-hero-hd.jpg",
  land: "assets/land-recruit-hero-hd.jpg",
  "investor-recruiting": "assets/investor-recruit-hero-hd.jpg"
};
const routeHeroMobilePreloads = {
  home: HOME_HERO_MOBILE_IMAGE,
  about: "assets/homepage-batch/04-admin-team-office-fast-mobile.jpg",
  milestones: "assets/milestones/homecare-agency-launch.jpg",
  "home-care": "assets/homecare-detail-01-greeting-hero-fast-mobile.jpg",
  "day-care": "assets/daycare-detail-01-exercise-hero-fast-mobile.jpg",
  community: "assets/community-detail-01-exercise-hero-hires-mobile.jpg",
  nursing: "assets/nursing-detail-02-walking-hero-fast-mobile.jpg",
  "migrant-training": "assets/migrant-detail-01-classroom-hero-fast-mobile.jpg",
  quality: "assets/quality-detail-04-improvement-hero-fast-mobile.jpg",
  software: "assets/admin-recruit-02-operations-hero-hires-mobile.jpg",
  talent: "assets/career-team-hero-hd-mobile.jpg",
  land: "assets/land-recruit-hero-hd-mobile.jpg",
  "investor-recruiting": "assets/investor-recruit-hero-hd-mobile.jpg"
};
const heroMobileAssetPaths = new Map(Object.entries(routeHeroPreloads).map(([slug, image]) => [image, routeHeroMobilePreloads[slug]]).filter(([, image]) => image));

const routeSeoMap = {
  home: DEFAULT_SEO,
  about: {
    title: "關於歲悅｜歲悅長照集團",
    description: "3 分鐘認識歲悅長照集團的組織願景、使命、團隊文化、服務系統與團隊成員。",
    image: "assets/homepage-batch/04-admin-team-office-fast.jpg",
    imageAlt: "歲悅團隊整理照顧服務系統"
  },
  milestones: {
    title: "大事記｜歲悅長照集團",
    description: "查看歲悅長照集團的重要里程碑、服務擴張、據點成立與合作紀錄。",
    image: "assets/milestones/homecare-agency-launch.jpg",
    imageAlt: "歲悅居家長照機構成立里程碑"
  },
  "home-care": {
    title: "居家照顧｜歲悅長照集團",
    description: "歲悅居家照顧提供到宅照顧、生活協助、家屬溝通與服務紀錄，支持長輩在家安心生活。",
    image: "assets/homecare-detail-01-greeting-hero-fast.jpg",
    imageAlt: "歲悅居家照顧服務員陪伴長輩"
  },
  "day-care": {
    title: "日間照顧｜歲悅長照集團",
    description: "歲悅日間照顧以活動設計、餐食、復能與社交支持，降低家庭照顧壓力。",
    image: "assets/daycare-detail-01-exercise-hero-fast.jpg",
    imageAlt: "歲悅日間照顧團體活動現場"
  },
  community: {
    title: "社區據點｜歲悅長照集團",
    description: "歲悅社區據點提供健康促進、共餐活動、預防延緩失能與在地照顧支持。",
    image: "assets/community-detail-01-exercise-hero-hires.jpg",
    imageAlt: "歲悅社區據點健康促進活動"
  },
  nursing: {
    title: "護理復能｜歲悅長照集團",
    description: "結合護理評估、復能目標與健康監測，協助長輩恢復生活能力並降低照顧風險。",
    image: "assets/nursing-detail-02-walking-hero-fast.jpg",
    imageAlt: "歲悅護理復能陪伴長輩步行訓練"
  },
  "migrant-training": {
    title: "移工培訓｜歲悅長照集團",
    description: "歲悅移工培訓提供照顧技能、家庭溝通、衛教與安全實作訓練，提升家庭照顧品質。",
    image: "assets/migrant-detail-01-classroom-hero-fast.jpg",
    imageAlt: "歲悅移工照顧技能培訓課堂"
  },
  quality: {
    title: "教育品管｜歲悅長照集團",
    description: "歲悅教育品管以標準化教材、督導制度、服務稽核與持續改善守住照顧品質。",
    image: "assets/quality-detail-04-improvement-hero-fast.jpg",
    imageAlt: "歲悅教育品管會議與改善討論"
  },
  software: {
    title: "軟體系統｜歲悅長照集團",
    description: "歲悅提供可客製化軟體系統，包含會計、人資、電子公文交換、專案管理、PDF 工具，以及居家與日照業務系統。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅後台系統與營運管理情境"
  },
  talent: {
    title: "人才招募｜歲悅長照集團",
    description: "加入歲悅長照團隊，探索照顧服務員、督導、日照、教學品管與行政職涯機會。",
    image: "assets/career-team-hero-hd.jpg",
    imageAlt: "歲悅照顧服務督導招募形象"
  },
  land: {
    title: "土地招募｜歲悅長照集團",
    description: "歲悅尋找適合日照、社區據點與複合式長照服務的土地或空間合作機會。",
    image: "assets/land-recruit-hero-hd.jpg",
    imageAlt: "歲悅北部服務據點與土地合作區域"
  },
  "investor-recruiting": {
    title: "投資人招募｜歲悅長照集團",
    description: "了解歲悅長照集團的展店模型、產業策略與投資合作機會。",
    image: "assets/investor-recruit-hero-hd.jpg",
    imageAlt: "歲悅投資合作與營運管理情境"
  },
  health: {
    title: "健康3.0｜歲悅長照照顧知識",
    description: "健康3.0整理長照申請、居家照顧、日照、復能、營養、失智與家屬支持文章。",
    image: "assets/homepage-batch/18-health-fall-prevention-cover-fast.jpg",
    imageAlt: "健康3.0照顧知識文章封面"
  },
  search: {
    title: "搜尋照顧知識｜健康3.0",
    description: "搜尋歲悅健康3.0照顧知識文章、影音與照顧指南。",
    robots: "noindex, follow"
  },
  courses: {
    title: "課程報名｜歲悅長照集團",
    description: "查看歲悅照顧課程、移工培訓、家屬課程與專業研習，線上送出報名資訊。",
    image: "assets/migrant-detail-01-classroom-hero-fast.jpg",
    imageAlt: "歲悅照顧課程與專業培訓"
  },
  investors: {
    title: "投資人專區｜歲悅長照集團",
    description: "歲悅投資人專區提供最新動態、營運進度、財務資訊、公司治理與股東專區資料。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅投資人專區營運資料"
  },
  "ir-finance": {
    title: "財務資訊｜歲悅長照投資人專區",
    description: "查看歲悅長照每月營收、財務分析、季度財報、年報與可下載文件。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅財務資訊與營運報表"
  },
  "ir-governance": {
    title: "公司治理｜歲悅長照投資人專區",
    description: "查看歲悅長照重要訊息、治理運作、管理階層、稽核、風險管理與誠信經營。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅公司治理與管理團隊"
  },
  "ir-shareholders": {
    title: "股東專區｜歲悅長照投資人專區",
    description: "查看歲悅長照股務資訊、股東會、法說會、常見問答與股東文件下載。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "歲悅股東專區與投資人溝通"
  },
  contact: {
    title: "聯絡我們｜歲悅長照集團",
    description: "聯絡歲悅長照集團，預約服務諮詢、課程合作、招募合作、投資洽談或一般客服。",
    image: "assets/homepage-batch/15-phone-consultation-fast.jpg",
    imageAlt: "歲悅客服窗口電話諮詢"
  }
};

function absoluteSiteUrl(path = "") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path || "").startsWith("/") ? path : `/${path || ""}`;
  return `${SITE_ORIGIN}${normalized}`;
}

function routeCanonical(slug = "home") {
  if (!slug || slug === "home") return absoluteSiteUrl("/");
  const articleMatch = String(slug).match(/^article-(.+)$/);
  if (articleMatch) return absoluteSiteUrl(`/article/${articleMatch[1]}`);
  const storyMatch = String(slug).match(/^care-story-(.+)$/);
  if (storyMatch) return absoluteSiteUrl(`/care-story/${storyMatch[1]}`);
  const talkMatch = String(slug).match(/^master-talk-(.+)$/);
  if (talkMatch) return absoluteSiteUrl(`/master-talk/${talkMatch[1]}`);
  return absoluteSiteUrl(`/${slug}`);
}

function routeSlugFromPath(pathname = window.location.pathname) {
  const cleaned = String(pathname || "/").replace(/^\/+|\/+$/g, "");
  if (!cleaned) return "home";
  const segments = cleaned.split("/");
  if (segments[0] === "article" && segments[1]) return `article-${segments.slice(1).join("/")}`;
  if (segments[0] === "care-story" && segments[1]) return `care-story-${segments.slice(1).join("/")}`;
  if (segments[0] === "master-talk" && segments[1]) return `master-talk-${segments.slice(1).join("/")}`;
  return segments[0] || "home";
}

function isKnownRouteSlug(slug = "") {
  return Boolean(routeSeoMap[slug]) || /^(article|care-story|master-talk)-/.test(slug);
}

function routeSlugFromLocation() {
  const hashValue = window.location.hash.slice(1);
  const hashSlug = hashValue.split("?")[0];
  const pathBase = routeSlugFromPath();
  const pathSlug = pathBase !== "home" && window.location.search ? `${pathBase}${window.location.search}` : pathBase;
  if (hashSlug && pathBase !== "home" && !isKnownRouteSlug(hashSlug)) return pathSlug;
  return hashValue || pathSlug;
}

function scrollToCurrentPageAnchor(hashSlug = window.location.hash.slice(1).split("?")[0]) {
  if (!hashSlug || isKnownRouteSlug(hashSlug)) return false;
  const target = document.getElementById(hashSlug);
  if (!target || !pageView?.contains(target)) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function normalizePublicHref(href = "#home") {
  const raw = String(href || "#home").trim();
  const articleMatch = raw.match(/^#article-([^?]+)(\?.*)?$/i);
  if (articleMatch) return `/article/${articleMatch[1]}${articleMatch[2] || ""}`;
  const careStoryMatch = raw.match(/^#care-story-([^?]+)(\?.*)?$/i);
  if (careStoryMatch) return `/care-story/${careStoryMatch[1]}${careStoryMatch[2] || ""}`;
  const masterTalkMatch = raw.match(/^#master-talk-([^?]+)(\?.*)?$/i);
  if (masterTalkMatch) return `/master-talk/${masterTalkMatch[1]}${masterTalkMatch[2] || ""}`;
  const routeHashMap = {
    "#home": "/",
    "#about": "/about",
    "#milestones": "/milestones",
    "#home-care": "/home-care",
    "#day-care": "/day-care",
    "#community": "/community",
    "#nursing": "/nursing",
    "#migrant-training": "/migrant-training",
    "#quality": "/quality",
    "#software": "/software",
    "#courses": "/courses",
    "#talent": "/talent",
    "#land": "/land",
    "#investor-recruiting": "/investor-recruiting",
    "#health": "/health",
    "#search": "/search",
    "#investors": "/investors",
    "#ir-finance": "/ir-finance",
    "#ir-governance": "/ir-governance",
    "#ir-shareholders": "/ir-shareholders"
  };
  const hashRouteMatch = raw.match(/^#([a-z0-9-]+)(\?.*)$/i);
  if (hashRouteMatch && routeHashMap[`#${hashRouteMatch[1]}`]) {
    return `${routeHashMap[`#${hashRouteMatch[1]}`]}${hashRouteMatch[2]}`;
  }
  if (routeHashMap[raw]) return routeHashMap[raw];
  return raw || "#home";
}

function articleHref(slug = "") {
  return slug ? `/article/${slug}` : "/health";
}

function careStoryHref(slug = "") {
  return slug ? `/care-story/${slug}` : "/health";
}

function masterTalkHref(slug = "") {
  return slug ? `/master-talk/${slug}` : "/health";
}

function articleRouteMatches(item = {}, slug = "") {
  if (!slug) return false;
  return item.slug === slug || normalizePublicHref(item.href) === articleHref(slug);
}

function navigateToPublicHref(href = "#home") {
  const target = normalizePublicHref(href);
  if (!target) return;
  if (target.startsWith("#")) {
    location.hash = target.replace(/^#/, "");
    return;
  }
  window.location.href = target;
}

function pathForPreload(src = "") {
  const raw = String(src || "").trim();
  if (!raw || /^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function shouldUseMobileHero() {
  return window.matchMedia?.("(max-width: 640px)")?.matches || false;
}

function heroImageForViewport(src = HOME_HERO_INSTANT_IMAGE) {
  const normalized = String(src || HOME_HERO_INSTANT_IMAGE).replace(/^\/assets\//, "assets/");
  const mobile = shouldUseMobileHero() ? heroMobileAssetPaths.get(normalized) : null;
  if (!mobile) return src || HOME_HERO_INSTANT_IMAGE;
  return String(src).startsWith("/assets/") ? `/${mobile}` : mobile;
}

function routeHeroImageForViewport(slug = routeSlugFromLocation()) {
  const desktop = routeHeroPreloads[slug] || HOME_HERO_INSTANT_IMAGE;
  return shouldUseMobileHero() ? routeHeroMobilePreloads[slug] || heroImageForViewport(desktop) : desktop;
}

function preloadHeroImage(src = HOME_HERO_INSTANT_IMAGE) {
  const href = pathForPreload(src);
  if (!href || !document.head) return;
  const absoluteHref = new URL(href, window.location.href).href;
  const existing = [...document.head.querySelectorAll('link[rel="preload"][as="image"]')]
    .find((link) => link.href === absoluteHref || link.getAttribute("href") === href);
  const link = existing || document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  link.setAttribute("fetchpriority", "high");
  if (!link.parentNode) document.head.appendChild(link);
  warmHeroImage(absoluteHref);
}

const warmedHeroImages = new Set();

function warmHeroImage(src = "") {
  if (!src || warmedHeroImages.has(src)) return;
  warmedHeroImages.add(src);
  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = "high";
  image.src = src;
  image.decode?.().catch(() => {});
}

preloadHeroImage(routeHeroImageForViewport());

function absoluteImageUrl(image = DEFAULT_SEO.image) {
  try {
    return new URL(image || DEFAULT_SEO.image, SITE_ORIGIN).href;
  } catch {
    return absoluteSiteUrl(DEFAULT_SEO.image);
  }
}

function ensureMeta(selector, createConfig) {
  let element = document.head.querySelector(selector);
  if (element) return element;
  element = document.createElement("meta");
  Object.entries(createConfig).forEach(([key, value]) => element.setAttribute(key, value));
  document.head.appendChild(element);
  return element;
}

function setMetaName(name, content) {
  if (!content) return;
  ensureMeta(`meta[name="${name}"]`, { name }).setAttribute("content", content);
}

function setMetaProperty(property, content) {
  if (!content) return;
  ensureMeta(`meta[property="${property}"]`, { property }).setAttribute("content", content);
}

function setCanonicalUrl(url) {
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);
}

function setRouteSeo(slug = "home", overrides = {}) {
  const normalized = (slug || "home").split("?")[0] || "home";
  const base = routeSeoMap[normalized] || DEFAULT_SEO;
  const seo = { ...DEFAULT_SEO, ...base, ...overrides };
  const title = seo.title || DEFAULT_SEO.title;
  const description = seo.description || DEFAULT_SEO.description;
  const canonical = seo.canonical || routeCanonical(normalized);
  const image = absoluteImageUrl(seo.image);
  const robots = seo.robots || "index, follow";

  document.title = title;
  setMetaName("description", description);
  setMetaName("robots", robots);
  setCanonicalUrl(canonical);
  setMetaProperty("og:site_name", "歲悅長照集團");
  setMetaProperty("og:locale", "zh_TW");
  setMetaProperty("og:type", seo.type || "website");
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:url", canonical);
  setMetaProperty("og:image", image);
  setMetaProperty("og:image:alt", seo.imageAlt || DEFAULT_SEO.imageAlt);
  setMetaProperty("og:image:width", seo.imageWidth || "1200");
  setMetaProperty("og:image:height", seo.imageHeight || "630");
  setMetaName("twitter:card", "summary_large_image");
  setMetaName("twitter:title", title);
  setMetaName("twitter:description", description);
  setMetaName("twitter:image", image);
  setMetaName("twitter:image:alt", seo.imageAlt || DEFAULT_SEO.imageAlt);
}

const analyticsState = {
  currentPath: "",
  pageStartedAt: Date.now()
};

function getStoredAnalyticsId(key) {
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function getAnalyticsSessionId() {
  const key = "suiyuecare_analytics_session";
  const timestampKey = "suiyuecare_analytics_session_at";
  const now = Date.now();
  const lastActive = Number(sessionStorage.getItem(timestampKey) || 0);
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId || now - lastActive > 30 * 60 * 1000) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  sessionStorage.setItem(timestampKey, String(now));
  return sessionId;
}

function getAnalyticsVisitorId() {
  return getStoredAnalyticsId("suiyuecare_analytics_visitor");
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1180) return "tablet";
  return "desktop";
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  const referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  if (utmSource || utmMedium || utmCampaign) {
    const normalizedMedium = String(utmMedium || "").toLowerCase();
    const normalizedSource = String(utmSource || "").toLowerCase();
    const groupedMedium = /cpc|ppc|paid|ads|ad/.test(normalizedMedium)
      ? "paid ads"
      : /email|edm|newsletter/.test(normalizedMedium)
        ? "email"
        : /qr/.test(normalizedMedium) || /qr/.test(normalizedSource)
          ? "qr code"
          : normalizedMedium || "unknown";
    return {
      source: utmSource || "utm",
      medium: groupedMedium,
      campaign: utmCampaign || null
    };
  }
  if (!referrerHost || referrerHost === location.hostname.replace(/^www\./, "")) {
    return { source: "direct", medium: "none", campaign: null };
  }
  if (/google|bing|yahoo|duckduckgo/.test(referrerHost)) {
    return { source: "organic search", medium: "organic", campaign: null };
  }
  if (/facebook|instagram|line|threads|linkedin|youtube|tiktok/.test(referrerHost)) {
    return { source: referrerHost, medium: "social", campaign: null };
  }
  return { source: referrerHost, medium: "referral", campaign: null };
}

function analyticsBasePayload() {
  const attribution = getAttribution();
  return {
    session_id: getAnalyticsSessionId(),
    visitor_id: getAnalyticsVisitorId(),
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign
  };
}

function insertAnalyticsRow(table, payload) {
  if (location.protocol === "file:") return;
  const type = table === "analytics_page_views" ? "page_view" : "event";
  const body = JSON.stringify({ type, ...payload });
  const endpoint = "/api/analytics";

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(endpoint, blob)) return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch((error) => {
    console.warn(`Analytics insert failed for ${table}.`, error);
  });
}

function trackAnalyticsEvent(eventType, options = {}) {
  insertAnalyticsRow("analytics_events", {
    ...analyticsBasePayload(),
    event_type: eventType,
    event_label: options.label || null,
    page_path: location.hash || "#home",
    target_url: options.targetUrl || null,
    value: options.value || null,
    metadata: options.metadata || {}
  });
}

function formDataValue(formData, keys) {
  for (const key of keys) {
    const value = String(formData.get(key) || "").trim();
    if (value) return value;
  }
  return "";
}

function contactNeedToFormType(need = "") {
  if (/課程/.test(need)) return "course_signup";
  if (/人才|應徵|招募/.test(need)) return "recruiting";
  if (/土地|場地|空間/.test(need)) return "land";
  if (/系統|後台|軟體|公文|專案管理|表單留存|檔案下載|業務系統/.test(need)) return "system";
  if (/網站|行銷|品牌|社群|內容合作/.test(need)) return "marketing";
  if (/投資/.test(need)) return "investor";
  return "contact";
}

const contactNeedGroups = [
  ["照顧服務", ["長照服務諮詢", "居家照顧諮詢", "日間照顧諮詢", "社區據點諮詢", "護理復能諮詢"]],
  ["課程與招募", ["課程報名", "移工培訓諮詢", "教育品管諮詢", "人才招募"]],
  ["合作洽談", ["土地合作", "網站行銷合作", "軟體系統諮詢", "系統後台諮詢", "投資洽談", "合作洽談"]]
];

function renderContactNeedOptions(selectedNeed = "長照服務諮詢") {
  const selected = selectedNeed || "長照服務諮詢";
  const knownNeeds = new Set(contactNeedGroups.flatMap(([, options]) => options));
  const extraGroup = knownNeeds.has(selected) ? [] : [["其他", [selected]]];
  return [...contactNeedGroups, ...extraGroup].map(([label, options]) => `
    <optgroup label="${escapeHTML(label)}">
      ${options.map((option) => `<option${option === selected ? " selected" : ""}>${escapeHTML(option)}</option>`).join("")}
    </optgroup>
  `).join("");
}

function contactFormType(form) {
  const formData = new FormData(form);
  return contactNeedToFormType(formDataValue(formData, ["需求", "need", "subject"]));
}

function ensureContactFormStatus(form) {
  let status = form.querySelector(".contact-form-status");
  if (status) return status;
  status = document.createElement("p");
  status.className = "contact-form-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  form.querySelector("button[type='submit']")?.before(status);
  return status;
}

function setContactFormStatus(form, message = "", state = "") {
  const status = ensureContactFormStatus(form);
  status.textContent = message;
  status.dataset.status = state;
  status.hidden = !message;
}

async function recordFormSubmission(form, formType = "contact") {
  if (!supabase || !form) return null;
  const formData = new FormData(form);
  const payload = {
    form_type: formType,
    name: formDataValue(formData, ["姓名", "您的大名", "name"]),
    phone: formDataValue(formData, ["電話", "您的電話", "phone", "tel"]),
    email: formDataValue(formData, ["Email", "email", "信箱"]),
    subject: formDataValue(formData, ["需求", "課程", "您本次報名的課程", "course", "subject"]) || formType,
    message: formDataValue(formData, ["說明", "message", "內容"]),
    source_path: location.hash || "#home",
    metadata: {
      page_title: document.title,
      form_id: form.id || null,
      form_class: form.className || null,
      recruiting_page: formDataValue(formData, ["recruiting_page"]),
      department_id: formDataValue(formData, ["department_id"]),
      department_title: formDataValue(formData, ["department_title"]),
      opening_id: formDataValue(formData, ["opening_id"]),
      opening_title: formDataValue(formData, ["opening_title"]),
      opening_slug: formDataValue(formData, ["opening_slug"])
    }
  };
  const { data, error } = await supabase.rpc("submit_form_submission", { payload });
  if (error) {
    console.warn("Form submission backup failed.", error);
    return null;
  }
  return data;
}

async function sendBackendForm(form, formType = "contact") {
  const formData = new FormData(form);
  const resume = formType === "recruiting" ? await serializeRecruitingResume(formData.get("resume")) : null;
  const payload = {
    form_type: formType,
    name: formDataValue(formData, ["姓名", "您的大名", "name"]),
    phone: formDataValue(formData, ["電話", "您的電話", "phone", "tel"]),
    email: formDataValue(formData, ["Email", "email", "信箱"]),
    subject: formDataValue(formData, ["需求", "課程", "您本次報名的課程", "course", "subject"]) || formType,
    message: formDataValue(formData, ["說明", "message", "內容"]),
    course_title: formDataValue(formData, ["課程", "您本次報名的課程", "course_title"]),
    course_id: formDataValue(formData, ["course_id"]),
    recruiting_page: formDataValue(formData, ["recruiting_page"]),
    department_id: formDataValue(formData, ["department_id"]),
    department_title: formDataValue(formData, ["department_title"]),
    opening_id: formDataValue(formData, ["opening_id"]),
    opening_title: formDataValue(formData, ["opening_title"]),
    opening_slug: formDataValue(formData, ["opening_slug"]),
    privacy_consent: formData.get("privacy_consent") === "on",
    resume,
    _honey: formDataValue(formData, ["_honey"]),
    source_path: location.hash || "#home",
    page_title: document.title,
    user_agent: navigator.userAgent
  };

  if (location.protocol === "file:") {
    await recordFormSubmission(form, formType);
    return { ok: true, emailSent: false, localOnly: true };
  }

  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 202) {
    throw new Error(result.message || "表單送出失敗，請稍後再試。");
  }
  return result;
}

async function serializeRecruitingResume(file) {
  if (!file || typeof file !== "object" || !file.name || !file.size) return null;
  const dataBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  if (!dataBase64) throw new Error("履歷檔案讀取失敗，請重新選擇檔案。");
  return {
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    data_base64: dataBase64
  };
}

function flushPageEngagement() {
  if (!analyticsState.currentPath) return;
  const durationSeconds = Math.max(1, Math.round((Date.now() - analyticsState.pageStartedAt) / 1000));
  trackAnalyticsEvent("page_engagement", {
    label: analyticsState.currentPath,
    value: durationSeconds,
    metadata: { duration_seconds: durationSeconds }
  });
}

function trackPageView(path) {
  const normalizedPath = path || location.hash || "#home";
  if (analyticsState.currentPath === normalizedPath) return;
  flushPageEngagement();
  analyticsState.currentPath = normalizedPath;
  analyticsState.pageStartedAt = Date.now();

  insertAnalyticsRow("analytics_page_views", {
    ...analyticsBasePayload(),
    page_path: normalizedPath,
    page_title: document.title,
    referrer: document.referrer || null,
    device_type: getDeviceType(),
    browser_language: navigator.language,
    user_agent: navigator.userAgent,
    metadata: {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    }
  });
}

function trackFrontendError(errorType, detail = {}) {
  trackAnalyticsEvent("frontend_error", {
    label: errorType,
    targetUrl: location.href,
    metadata: {
      message: String(detail.message || "").slice(0, 500),
      filename: detail.filename || null,
      lineno: detail.lineno || null,
      colno: detail.colno || null,
      stack: String(detail.stack || "").slice(0, 1200)
    }
  });
}
const WP_API_BASE = "https://www.suiyuecare.com/wp-json/wp/v2";
const WP_CATEGORIES = {
  latestNews: "latest-news",
  awards: "awards",
  careStories: "care-stories",
  health30: "health-30",
  masterTalk: "master-talk"
};
const HOMEPAGE_MASTER_TALK_LIMIT = 8;

const articlePages = {
  "longterm-care-apply": {
    category: "Health 3.0",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    dek: "從需求盤點、照顧計畫、政府補助到服務媒合，用一篇文章把流程講清楚。",
    image: "assets/homepage-batch/family-consultation-clear.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.05.13",
    readTime: "6 min read",
    tags: ["長照申請", "家庭照顧", "服務媒合"],
    summary: ["先整理長輩目前生活需要協助的地方。", "把醫療、用藥、行動能力與家庭照顧時間寫下來。", "諮詢時直接描述一週中最困難的照顧時段。"],
    content: [
      ["先從一天的生活節奏開始", "很多家庭第一次接觸長照時，會先問可以申請什麼服務。但更有效的方式，是先把長輩一天的生活節奏整理出來：起床、用餐、洗澡、服藥、外出、睡眠與夜間照顧，哪些地方最容易卡住。這些細節會影響服務安排，也能幫助專業人員更快判斷適合的照顧方向。"],
      ["把照顧困難說具體", "與其說「需要有人照顧」，不如說「早上起床移位不穩」、「洗澡時家人很擔心跌倒」、「下午容易忘記吃藥」。具體描述能讓督導判斷需要居家照顧、日間照顧、護理復能或家屬支持課程，也能避免服務進場後才重新調整。"],
      ["保留家屬喘息的空間", "長照不是只照顧長輩，也是在支持整個家庭。當家屬已經長期睡不好、無法上班或情緒緊繃，就應該把喘息需求一起放進討論。好的照顧安排，會讓長輩安全，也讓家人能走得長久。"]
    ],
    cta: "不確定該從哪一項服務開始？留下需求，讓歲悅協助判斷。"
  },
  "family-care-story": {
    category: "Care Stories",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    dek: "家屬最需要的不是更多壓力，而是有人把照顧重點說清楚、每天回報、一起調整。",
    image: "assets/homepage-batch/care-home-greeting-clear.jpg",
    author: "林小姐｜居家照顧",
    date: "2026.05.13",
    readTime: "4 min read",
    tags: ["居家照顧", "家屬回饋", "出院返家"],
    summary: ["每日回報讓家人不用猜。", "照服員會提醒移位、用餐與精神狀況。", "督導會依照狀態調整照顧方式。"],
    content: [
      ["剛出院時，家人最怕做錯", "林小姐的爸爸出院返家後，家裡最焦慮的是每天都不知道哪些狀況正常、哪些需要留意。歲悅團隊進場後，先協助家屬整理照顧重點，把移位、用餐、服藥與精神狀況變成每天可以追蹤的項目。"],
      ["照顧紀錄是一封安心回信", "每次服務後，家屬都能知道今天長輩吃得如何、活動狀況如何、是否有特別需要注意的地方。這些紀錄看起來簡單，卻讓下班後的家人可以快速掌握狀況，不用靠猜測累積不安。"],
      ["照顧不是單點服務，而是一個團隊", "當現場出現新的狀況，照服員不需要一個人承擔。督導會一起討論、調整服務方式，必要時也會建議家屬串接復能或護理資源。這讓照顧更穩定，也讓家庭感覺背後真的有人一起走。"]
    ],
    cta: "如果家中也正面臨出院返家或照顧轉換期，可以先和歲悅聊聊。"
  },
  "master-talk-care-psychology": {
    category: "Master Talk",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    dek: "照顧心理講師周小姐談家庭照顧中的焦慮、溝通與支持系統。",
    image: "assets/master-talk/cover-care-psychology-chou.jpg",
    author: "照顧心理講師 周小姐",
    date: "2026.05.13",
    readTime: "5 min read",
    tags: ["名人講堂", "照顧心理", "家屬支持"],
    summary: ["照顧焦慮常來自資訊不清楚。", "家人需要可理解、可求助的系統。", "真正的支持是讓家庭恢復生活感。"],
    content: [
      ["照顧中的焦慮，常常不是不愛", "很多家屬在照顧中感到煩躁或疲憊，會因此責備自己。但周小姐提醒，這些情緒往往來自資訊不足與長期壓力。當照顧沒有明確分工，也沒有可以求助的窗口，家人很容易把所有責任都扛在自己身上。"],
      ["讓資訊變得可以使用", "照顧建議不是越多越好，而是要讓家庭知道今天先做哪一件事。像是跌倒風險、飲食狀況、服藥提醒與情緒變化，都可以轉化成簡單可追蹤的提醒，讓家屬有方向，而不是被資訊淹沒。"],
      ["保有生活感，是長期照顧的關鍵", "好的照顧不是把家庭變成病房，而是在安全之中保留原本的生活節奏。當長輩仍能做選擇，家屬也能保有休息與工作，照顧才有機會走得長久。"]
    ],
    cta: "想把家庭照顧壓力變得更可整理，歡迎預約歲悅照顧諮詢。"
  }
};

Object.assign(articlePages, {
  "safe-transfer-tips": {
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    dek: "從床邊高度、手部支撐到起身節奏，降低跌倒與拉傷風險。",
    image: "assets/homepage-batch/18-health-fall-prevention-cover-fast.jpg",
    author: "歲悅復能團隊",
    date: "2026.05.10",
    readTime: "4 min read",
    tags: ["移位安全", "跌倒預防", "復能照顧"],
    summary: ["先確認腳能踩穩、手能扶穩。", "起身前讓長輩坐在床緣停留幾秒。", "不要拉手臂硬起身，改用口令與重心引導。"],
    content: [
      ["先讓身體找到穩定點", "長輩起身前，先確認雙腳可以踩到地面，床邊或椅旁有穩定扶手。若剛睡醒或剛坐下，建議先停留幾秒，觀察是否頭暈、無力或站不穩。"],
      ["用口令協助，不用蠻力拉起", "照顧者可以用「腳往後收、身體向前、手扶穩、再站起來」的口令協助長輩自己參與動作。直接拉手臂容易造成肩膀受傷，也會讓長輩失去重心。"],
      ["把安全變成每天固定流程", "起身、移位與如廁是日常中最容易跌倒的時刻。把環境、口令與步驟固定下來，長輩會更有安全感，家屬也比較能掌握風險。"]
    ],
    cta: "需要到宅檢視移位與跌倒風險，歡迎預約歲悅照顧諮詢。"
  },
  "nutrition-warning": {
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    dek: "從體重、食慾、肌力與精神狀態，快速判斷是否需要營養或醫療協助。",
    image: "assets/homepage-batch/17-health-nutrition-cover-fast.jpg",
    author: "歲悅營養照顧小組",
    date: "2026.05.08",
    readTime: "5 min read",
    tags: ["飲食營養", "體重觀察", "家屬支持"],
    summary: ["觀察體重是否快速下降。", "留意吃飯時間變長或常常剩餐。", "若合併嗆咳、無力或精神變差，應及早諮詢。"],
    content: [
      ["先看變化，不只看份量", "長輩吃得少不一定只是胃口差，也可能和牙口、吞嚥、藥物、情緒或疾病變化有關。家人可以先記錄一週的飲食量、體重與精神狀態。"],
      ["肌力和精神也是營養訊號", "營養不足常會反映在走路變慢、起身變吃力、白天嗜睡或活動意願下降。若這些變化同時出現，就不建議只用正常老化解釋。"],
      ["把餐食調整變成照顧計畫", "照顧團隊可以協助觀察用餐節奏、食物質地與水分補充，再視情況串接醫療或營養專業，讓家屬不用單獨猜測。"]
    ],
    cta: "想評估長輩飲食與照顧風險，可以先留下需求。"
  },
  "dementia-response": {
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    dek: "理解長輩不安背後的需求，用更穩定的語句降低照顧衝突。",
    image: "assets/homepage-batch/19-health-dementia-cover-fast.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.05.06",
    readTime: "5 min read",
    tags: ["失智照顧", "溝通技巧", "情緒安撫"],
    summary: ["重複提問常常來自不安。", "先回應情緒，再補充事實。", "用固定提示物降低反覆確認。"],
    content: [
      ["先聽見不安", "長輩一直問同一件事，常常不是故意找麻煩，而是記憶與安全感正在鬆動。照顧者可以先用穩定語氣回應情緒，例如「你有點擔心，我在這裡」。"],
      ["答案越短越好", "長篇解釋容易讓長輩更混亂。建議用短句、固定說法與視覺提示，例如白板、日曆、照片或固定物品，讓長輩有可以反覆確認的依據。"],
      ["照顧者也需要喘息", "當重複提問頻率很高，照顧者會累是正常的。這時候需要的是服務分工與喘息安排，而不是要求家屬永遠保持耐心。"]
    ],
    cta: "失智照顧需要一起設計日常節奏，歡迎和歲悅討論。"
  },
  "caregiver-support": {
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    dek: "先盤點照顧時段、找到喘息入口，讓家庭照顧可以走得更久。",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover-fast.jpg",
    author: "歲悅家庭支持團隊",
    date: "2026.05.02",
    readTime: "4 min read",
    tags: ["喘息服務", "家屬支持", "照顧壓力"],
    summary: ["先寫下最累的三個時段。", "把可替手的服務列入安排。", "不要等到崩潰才求助。"],
    content: [
      ["找出最耗能的照顧時段", "很多家庭不是整天都撐不住，而是卡在洗澡、夜間、如廁、用餐或回診。先找出最困難的三個時段，才容易安排服務介入。"],
      ["不要把喘息視為偷懶", "喘息是長期照顧的一部分。當家屬有休息、工作與情緒恢復的空間，照顧關係反而比較能走得長久。"],
      ["讓照顧變成團隊工作", "居家照顧、日間照顧、課程與諮詢可以一起使用。重點不是把責任丟出去，而是讓家庭不再只有一個人硬撐。"]
    ],
    cta: "如果你已經快撐不住，先讓歲悅幫你整理可用資源。"
  },
  "family-care-course": {
    category: "課程活動",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    dek: "把移位、用餐、跌倒預防與照顧溝通整理成家人也能操作的課程。",
    image: "assets/homepage-batch/12-community-health-class-hires.jpg",
    author: "歲悅教育品管",
    date: "2026.04.28",
    readTime: "3 min read",
    tags: ["課程報名", "家屬照顧", "照顧技巧"],
    summary: ["課程以家中真實場景設計。", "重點放在可以每天使用的方法。", "適合初次照顧與照顧壓力升高的家庭。"],
    content: [
      ["把技巧變成家人聽得懂的語言", "課程會把專業照顧動作拆成家屬也能理解的步驟，包含移位、起身、用餐、安全觀察與溝通方式。"],
      ["從家中的問題開始練習", "每個家庭遇到的困難不一樣，因此課程會以常見情境作為練習入口，讓家屬能帶著問題找到可執行的方法。"],
      ["課後也能接續服務", "若家庭需要進一步協助，也可以串接居家照顧、日照、護理復能或督導諮詢，讓課程不是一次性的資訊。"]
    ],
    cta: "想參加家屬照顧課，歡迎查看課程報名。"
  },
  "day-care-respite": {
    category: "活動專區",
    title: "日照體驗參觀日：認識家庭喘息與白天照顧",
    dek: "帶家屬理解日間照顧的一天，包含活動、共餐、休息與回報流程。",
    image: "assets/homepage-batch/02-daycare-group-exercise-hires.jpg",
    author: "歲悅日照團隊",
    date: "2026.04.22",
    readTime: "3 min read",
    tags: ["日間照顧", "家庭喘息", "活動專區"],
    summary: ["認識日照中心的一日流程。", "理解哪些長輩適合日間照顧。", "現場可諮詢家庭照顧安排。"],
    content: [
      ["白天有人陪，晚上仍能回家", "日間照顧讓長輩白天有規律活動、餐食與陪伴，晚上仍回到熟悉的家中，也讓家屬有工作與休息的空間。"],
      ["活動不是消磨時間", "好的日照活動會考量認知、肢體、社交與情緒需求，讓長輩維持節奏，也保留被邀請、被看見的感覺。"],
      ["家屬也能看見照顧品質", "透過參觀與諮詢，家屬可以了解回報機制、照顧紀錄與服務調整方式，判斷是否適合自己的家庭。"]
    ],
    cta: "想了解日間照顧是否適合家中長輩，歡迎預約參觀。"
  },
  "reablement-workshop": {
    category: "活動專區",
    title: "復能照顧工作坊：陪長輩一步一步重新有把握",
    dek: "用小目標、日常動作與安全陪伴，支持長輩找回生活能力。",
    image: "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
    author: "歲悅護理復能團隊",
    date: "2026.04.18",
    readTime: "4 min read",
    tags: ["護理復能", "復能訓練", "活動專區"],
    summary: ["復能不是催促，而是陪伴練習。", "目標要能放回日常生活。", "家屬需要知道如何安全協助。"],
    content: [
      ["從生活目標開始", "復能不是只做訓練動作，而是回到長輩想完成的生活任務，例如走到餐桌、自己起身、安心如廁或短距離外出。"],
      ["把目標拆小才走得久", "太大的目標會讓長輩挫折。團隊會把練習拆成可完成的小步驟，讓每一次進步都能被看見。"],
      ["家屬知道方法，長輩更安全", "工作坊會協助家屬理解安全陪伴、口令、環境調整與觀察重點，讓練習不只發生在課堂。"]
    ],
    cta: "想為家中長輩安排復能目標，歡迎預約諮詢。"
  },
  "fall-observation": {
    category: "短影片",
    title: "跌倒後 24 小時觀察重點",
    dek: "跌倒後不只看有沒有外傷，也要留意疼痛、意識、走路與精神變化。",
    image: "assets/homepage-batch/health-video-fall-observation-clear.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.04.16",
    readTime: "3 min read",
    tags: ["跌倒觀察", "短影片", "居家安全"],
    summary: ["先確認意識與疼痛位置。", "觀察 24 小時內是否精神變差。", "若持續疼痛或走路異常，應盡快就醫。"],
    content: [
      ["跌倒後先不要急著扶起", "先確認長輩是否清醒、哪裡疼痛、是否有明顯變形或出血。若懷疑骨折或頭部撞擊，不建議硬拉起身。"],
      ["24 小時內持續觀察", "有些狀況不是當下立刻出現。家屬可以留意嗜睡、頭痛、嘔吐、走路不穩、情緒改變或食慾明顯下降。"],
      ["把跌倒原因找出來", "跌倒後除了處理傷勢，也要回頭檢查燈光、地墊、浴室、床邊高度、鞋子與用藥狀況，避免同樣事件再次發生。"]
    ],
    cta: "需要居家安全檢視，可以與歲悅照顧團隊討論。"
  },
  "bathroom-safety": {
    category: "短影片",
    title: "浴室安全的快速檢查",
    dek: "用五分鐘檢查止滑、扶手、動線與照明，降低家中高風險跌倒。",
    image: "assets/homepage-batch/health-video-bathroom-safety-clear.jpg",
    author: "歲悅居家安全團隊",
    date: "2026.04.12",
    readTime: "3 min read",
    tags: ["浴室安全", "跌倒預防", "居家照顧"],
    summary: ["地面止滑與排水是第一步。", "扶手位置要符合長輩動作。", "夜間照明與動線也要一起檢查。"],
    content: [
      ["先看地面和排水", "浴室濕滑是跌倒高風險來源。止滑墊、排水速度與門口高低差都需要檢查，避免長輩跨出浴室時踩到積水。"],
      ["扶手不是有裝就好", "扶手要裝在長輩真正會用力的位置，例如馬桶旁、淋浴區或進出浴室的轉身處。位置不對，反而可能讓動作更不穩。"],
      ["夜間動線也很重要", "很多跌倒發生在半夜如廁。床邊到浴室的燈光、走道雜物與鞋子止滑，都應納入照顧檢查。"]
    ],
    cta: "想做居家安全檢視，歡迎預約歲悅到宅評估。"
  }
});

Object.assign(articlePages, {
  "master-talk-senior-nutrition": {
    category: "Master Talk",
    title: "吃得下、吃得夠，是照顧品質的第一個訊號。",
    dek: "銀髮營養顧問李先生談食慾、體重、肌力與家庭日常觀察。",
    image: "assets/master-talk/cover-senior-nutrition-lee.jpg",
    author: "銀髮營養顧問 李先生",
    date: "2026.05.12",
    readTime: "5 min read",
    tags: ["名人講堂", "飲食營養", "肌力觀察"],
    summary: ["不要只問吃了多少，也要看體重、精神和肌力。", "用餐變慢、剩餐變多，常是照顧品質提醒。", "餐食調整要回到長輩每天吃得到的形式。"],
    content: [
      ["營養訊號不只在餐盤上", "李先生提醒，長輩吃得少不一定只是胃口差。牙口、吞嚥、藥物、睡眠、情緒與活動量都會影響用餐，家屬可以同時觀察體重、精神、肌力與是否容易疲累。"],
      ["把觀察變成簡單紀錄", "如果連續幾天吃飯時間變長、常常剩餐或下午精神明顯下降，就值得記錄。比起一次問很多問題，穩定追蹤一週更容易看出變化。"],
      ["餐食調整要能落地", "好的營養建議不是要求家庭大改菜單，而是從質地、份量、補水和用餐節奏開始，讓長輩真的吃得到，也讓家屬做得到。"]
    ],
    cta: "想了解長輩的飲食與體力變化，可以先留下需求，讓歲悅協助整理。"
  },
  "master-talk-rehab-goals": {
    category: "Master Talk",
    title: "復能不是訓練長輩聽話，而是找回生活能力。",
    dek: "復能治療師許小姐談目標設定、動作拆解與家屬陪伴。",
    image: "assets/master-talk/cover-rehab-therapist-hsu.jpg",
    author: "復能治療師 許小姐",
    date: "2026.05.11",
    readTime: "5 min read",
    tags: ["名人講堂", "護理復能", "生活能力"],
    summary: ["復能目標要回到真實生活。", "把動作拆小，長輩才容易建立信心。", "家屬的鼓勵比催促更有效。"],
    content: [
      ["先問想回到什麼生活", "許小姐分享，復能不是把每個動作做得標準，而是幫長輩回到重要的生活場景，例如自己走到浴室、穩定坐下吃飯或安全移位。"],
      ["小目標比大口號有效", "當長輩體力下降時，一次要求太多只會挫折。把站起、轉身、扶穩、走幾步拆成小目標，進步會更清楚，也更願意持續練習。"],
      ["家屬要學會陪，不是催", "家屬可以學口令、扶持位置與安全觀察，讓練習延伸到每天生活。陪伴的語氣越穩，長輩越能重新建立把握。"]
    ],
    cta: "如果家中長輩需要復能支持，歲悅可以協助評估下一步安排。"
  },
  "master-talk-home-safety": {
    category: "Master Talk",
    title: "家中最危險的地方，往往是每天經過的路線。",
    dek: "居家安全顧問張先生分享浴室、床邊與廚房動線的快速檢查方法。",
    image: "assets/master-talk/cover-home-safety-chang.jpg",
    author: "居家安全顧問 張先生",
    date: "2026.05.10",
    readTime: "4 min read",
    tags: ["名人講堂", "居家安全", "跌倒預防"],
    summary: ["高風險常藏在熟悉動線。", "先檢查床邊、浴室、廚房與夜間路線。", "安全調整要符合長輩真的會做的動作。"],
    content: [
      ["熟悉不代表安全", "張先生提醒，跌倒常發生在長輩每天走的路線。床邊起身、半夜如廁、浴室轉身與廚房拿水，都可能因燈光、地墊、門檻或扶手不足而增加風險。"],
      ["先從一條路線開始檢查", "家屬可以從床到浴室這條路開始，看是否有雜物、光線不足、地面濕滑或需要跨越的高度。一次改善一條路線，比全面大改更容易執行。"],
      ["輔具要配合習慣", "扶手、椅子、防滑墊和夜燈都要放在長輩真正使用的位置。安全不是買設備而已，而是讓長輩每一次動作都有可以依靠的支點。"]
    ],
    cta: "想做居家安全檢視，歡迎預約歲悅到宅評估。"
  },
  "master-talk-care-management": {
    category: "Master Talk",
    title: "照顧需要計畫，不需要家屬一個人硬撐。",
    dek: "照顧管理專家陳小姐說明如何用服務、喘息與回報制度降低家庭壓力。",
    image: "assets/master-talk/cover-care-management-chen.jpg",
    author: "照顧管理專家 陳小姐",
    date: "2026.05.09",
    readTime: "5 min read",
    tags: ["名人講堂", "照顧管理", "喘息服務"],
    summary: ["先把照顧需求整理成時段和任務。", "喘息不是放棄，而是讓照顧走得久。", "服務紀錄可以降低家屬之間的資訊落差。"],
    content: [
      ["先整理壓力從哪裡來", "陳小姐分享，家庭照顧最累的常不是單一動作，而是每件事都靠家人記住。把洗澡、用餐、服藥、夜間照顧和外出需求分成時段，才知道哪些可以交給服務支持。"],
      ["喘息是計畫的一部分", "家屬休息不是不負責，而是避免長期耗竭。當照顧安排能保留休息與工作空間，家庭才有能力持續陪伴。"],
      ["回報制度讓家人站在同一頁", "每次服務後留下紀錄，家屬就能知道今天發生什麼、下次要注意什麼，減少靠口頭轉述造成的誤會與焦慮。"]
    ],
    cta: "不確定家裡該怎麼分工？留下需求，讓歲悅協助判斷。"
  },
  "master-talk-dementia-care": {
    category: "Master Talk",
    title: "重複提問的背後，常常是長輩的不安。",
    dek: "失智照顧講師林先生分享回應方式與情緒安撫，讓互動少一點拉扯。",
    image: "assets/master-talk/cover-dementia-care-lin.jpg",
    author: "失智照顧講師 林先生",
    date: "2026.05.08",
    readTime: "5 min read",
    tags: ["名人講堂", "失智照顧", "家庭溝通"],
    summary: ["重複提問常是在確認安全感。", "先回應情緒，再回答問題。", "固定提示與環境線索能減少拉扯。"],
    content: [
      ["問題背後常是情緒", "林先生提醒，失智長輩反覆問同一件事時，背後可能是不安、害怕或不知道下一步。家屬如果只糾正答案，彼此容易越來越累。"],
      ["先安撫，再提醒", "可以先用短句確認情緒，例如「我知道你有點擔心」，再用固定提示告訴他現在要做什麼。穩定語氣比一次講很多道理更有效。"],
      ["讓環境幫忙說明", "日曆、照片、門口提示、固定作息和簡單標籤，都能讓長輩少靠記憶硬撐，也讓家屬少一點重複解釋的壓力。"]
    ],
    cta: "家中若有失智照顧困難，可以先和歲悅聊聊日常卡住的情境。"
  },
  "master-talk-nursing-observation": {
    category: "Master Talk",
    title: "觀察不是緊張，是提早看見變化。",
    dek: "護理照護顧問黃小姐以血壓、食慾、睡眠和傷口照護，談日常追蹤重點。",
    image: "assets/master-talk/cover-nursing-care-huang.jpg",
    author: "護理照護顧問 黃小姐",
    date: "2026.05.07",
    readTime: "5 min read",
    tags: ["名人講堂", "護理觀察", "健康追蹤"],
    summary: ["日常觀察是照顧風險管理。", "血壓、食慾、睡眠、排泄與皮膚都要看趨勢。", "有紀錄才知道變化是不是偶發。"],
    content: [
      ["照顧觀察不是找麻煩", "黃小姐分享，家屬不需要每天都緊張，但需要知道哪些變化值得留意。精神變差、食慾下降、睡眠改變或傷口紅腫，都可能是身體在提醒。"],
      ["看趨勢比看單點更有用", "一次血壓高或一天睡不好，不一定代表立即危險。但若連續幾天出現相同變化，就應該記錄並諮詢專業。"],
      ["讓紀錄幫家人做判斷", "簡單紀錄日期、狀況、處理方式與是否改善，可以讓不同家人、照服員和督導快速接上資訊，不必每次重新猜。"]
    ],
    cta: "需要護理觀察或復能支持，歲悅可以協助整理照顧重點。"
  },
  "master-talk-family-communication": {
    category: "Master Talk",
    title: "家屬會累，很多時候是因為沒有人說清楚。",
    dek: "家庭溝通講師吳先生分享照顧分工、期待管理與家庭會議的實用做法。",
    image: "assets/master-talk/cover-family-communication-wu.jpg",
    author: "家庭溝通講師 吳先生",
    date: "2026.05.06",
    readTime: "5 min read",
    tags: ["名人講堂", "家庭溝通", "照顧分工"],
    summary: ["分工不清會讓照顧壓力放大。", "家庭會議要談任務、時段與可承擔範圍。", "把期待說明白，比互相猜測更能減少衝突。"],
    content: [
      ["照顧衝突常來自模糊", "吳先生指出，家人之間最常出現的不是不願意幫忙，而是不知道誰負責、做到什麼程度才算完成。模糊會讓主要照顧者覺得自己永遠在補位。"],
      ["家庭會議要具體", "會議可以從一週照顧時段、就醫接送、費用、服務安排與緊急聯絡開始。只談感受不夠，還要把任務和可承擔範圍寫下來。"],
      ["把專業服務放進分工", "外部服務不是取代家人，而是把高壓任務分擔出去。當服務內容、回報方式和家屬分工清楚，家庭比較能一起合作。"]
    ],
    cta: "如果家中照顧分工卡住，歲悅可以協助先整理需求和服務選項。"
  },
  "master-talk-community-health": {
    category: "Master Talk",
    title: "長輩需要的不只是照顧，也需要被邀請出門。",
    dek: "社區健康推廣鄭小姐談共餐、活動與社區據點如何延緩孤立。",
    image: "assets/master-talk/cover-community-health-cheng.jpg",
    author: "社區健康推廣 鄭小姐",
    date: "2026.05.05",
    readTime: "4 min read",
    tags: ["名人講堂", "社區據點", "健康促進"],
    summary: ["規律出門能維持生活節奏。", "共餐與活動不只是熱鬧，也是在建立支持網。", "社區據點可以成為家庭照顧的外部支點。"],
    content: [
      ["被邀請出門很重要", "鄭小姐分享，許多長輩不是不想參與，而是缺少固定、安全、有人期待他的地方。規律活動能讓生活有節奏，也讓家屬看見長輩還有社交與參與的可能。"],
      ["共餐是最自然的入口", "吃飯、聊天、活動和健康促進可以放在同一個日常場域。長輩先願意來，後續的運動、認知活動與健康提醒才容易接上。"],
      ["社區據點也是家庭支持", "對家屬來說，社區據點不只是長輩去玩的地方，而是多一個觀察、陪伴和提醒的外部支點，降低家庭獨自承擔的壓力。"]
    ],
    cta: "想了解附近是否適合社區活動或據點服務，可以留下需求讓歲悅協助確認。"
  },
  "master-talk-longterm-policy": {
    category: "Master Talk",
    title: "好的長照服務，要讓家庭知道下一步在哪裡。",
    dek: "長照政策觀察王先生分享資源串接與服務入口，如何讓照顧更容易開始。",
    image: "assets/master-talk/cover-longterm-policy-wang.jpg",
    author: "長照政策觀察 王先生",
    date: "2026.05.04",
    readTime: "5 min read",
    tags: ["名人講堂", "長照政策", "資源串接"],
    summary: ["家庭最需要的是知道下一步。", "資源入口要被翻譯成可執行的選項。", "好的服務會把家庭情境和制度資源接起來。"],
    content: [
      ["政策要回到家庭聽得懂的語言", "王先生分享，長照資源很多，但家屬在焦慮時最需要的是有人告訴他：現在先做哪一步、要找誰、有哪些服務可以先試。"],
      ["入口越清楚，照顧越容易開始", "如果服務入口只是一串名詞，家庭很難判斷自己適合什麼。把居家、日照、社區、復能與補助整理成情境選項，才能真正降低門檻。"],
      ["串接比單點更重要", "好的長照服務不是只完成一次派案，而是依長輩狀態串接下一步。當家屬知道有人協助判斷和追蹤，照顧就不會像一個人摸黑前進。"]
    ],
    cta: "不確定該從哪個服務入口開始？留下需求，讓歲悅協助判斷。"
  }
});

Object.assign(articlePages, {
  "master-talk-medication-safety": {
    category: "Master Talk",
    title: "藥不是吃完就好，是要吃得安全、吃得清楚。",
    dek: "藥事照護顧問蔡藥師談用藥清單、交互作用與回診溝通，讓家庭少一點猜測。",
    image: "assets/nursing-detail-01-vitals-clear-display.jpg",
    author: "藥事照護顧問 蔡藥師",
    date: "2026.05.03",
    readTime: "5 min read",
    tags: ["名人講堂", "藥事安全", "用藥管理"],
    summary: ["把所有藥品整理成一張清單。", "留意重複用藥、保健品與交互作用。", "回診前先記錄症狀與用藥後變化。"],
    content: [
      ["一張清單，比記憶更可靠", "蔡藥師提醒，許多家庭同時有慢性病藥、診所藥、保健品與臨時止痛藥。靠記憶很容易漏掉，建議把藥名、劑量、時間與開藥來源整理成一張清單，回診或照顧交接時都能快速確認。"],
      ["吃藥後的變化也要記錄", "頭暈、嗜睡、食慾下降、便秘或精神變差，不一定都是老化。有些可能和新藥、劑量調整或藥物交互作用有關。家屬若能記錄時間點，醫師與藥師比較容易協助判斷。"],
      ["照顧團隊要知道用藥節奏", "居家照顧或日照服務進場後，用藥資訊不該只放在某一位家屬腦中。讓照服員、督導與家屬都知道提醒方式與注意事項，才能降低漏服、重複服用或錯誤理解的風險。"]
    ],
    cta: "想整理長輩用藥與照顧提醒，可以先讓歲悅協助盤點日常風險。"
  },
  "master-talk-frailty-prevention": {
    category: "Master Talk",
    title: "最好的照顧，是在退化前先把生活力留住。",
    dek: "失能預防教練郭教練分享衰弱觀察、肌力活動與日常練習如何提早開始。",
    image: "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
    author: "失能預防教練 郭教練",
    date: "2026.05.02",
    readTime: "5 min read",
    tags: ["名人講堂", "失能預防", "肌力活動"],
    summary: ["走路變慢、起身變難，是需要留意的訊號。", "練習要放回生活情境，不只是做運動。", "越早開始，越能保留長輩的選擇。"],
    content: [
      ["退化常常是慢慢發生的", "郭教練分享，家屬常在長輩跌倒或住院後才注意到體力下降。其實走路速度變慢、起身需要扶更多次、外出意願降低，都是可以提前看見的訊號。"],
      ["日常動作就是訓練入口", "失能預防不一定要很複雜。從安全起身、站立平衡、短距離步行、餐前伸展到固定出門，都可以變成保留生活能力的練習。重點是安全、規律、做得到。"],
      ["讓長輩保有選擇感", "好的練習不是催促長輩變強，而是讓他還能選擇要不要出門、自己走到餐桌、參與活動或和家人一起生活。照顧越早介入，越能保留這些日常自由。"]
    ],
    cta: "想了解長輩是否有衰弱或失能風險，可以預約歲悅照顧諮詢。"
  },
  "master-talk-swallowing-care": {
    category: "Master Talk",
    title: "一口飯吃得安心，比吃很多更重要。",
    dek: "吞嚥照護語言治療師何小姐從嗆咳、食物質地與用餐姿勢談家庭最容易忽略的風險。",
    image: "assets/daycare-detail-02-meal-fast.jpg",
    author: "吞嚥照護語言治療師 何小姐",
    date: "2026.05.01",
    readTime: "5 min read",
    tags: ["名人講堂", "吞嚥照護", "用餐安全"],
    summary: ["嗆咳、清喉嚨、吃飯變久都值得觀察。", "食物質地與坐姿會影響用餐安全。", "不要只追求吃多，先確保吃得安心。"],
    content: [
      ["嗆咳不一定只是喝太快", "何小姐提醒，長輩若常在喝水、吃湯或吃飯時咳嗽、清喉嚨，或用餐時間明顯變長，就值得留意吞嚥狀況。這些變化如果被忽略，可能增加營養不足或吸入性肺炎風險。"],
      ["姿勢和質地都會影響安全", "坐得穩、頭頸位置、餐具高度、食物大小與軟硬度，都會影響長輩吞嚥。家屬不需要自行猜測所有調整，但可以先記錄哪些食物最容易嗆、什麼時段吃得比較順。"],
      ["用餐也需要照顧節奏", "好的用餐照顧不是一直催長輩吃，而是給足時間、觀察疲累程度，並在必要時串接語言治療、營養或護理專業。先吃得安全，才有機會吃得夠。"]
    ],
    cta: "如果長輩用餐常嗆咳或吃很久，歡迎和歲悅討論照顧安排。"
  },
  "master-talk-sleep-rhythm": {
    category: "Master Talk",
    title: "夜裡安穩，白天的照顧才有力氣。",
    dek: "睡眠照顧諮詢師曾小姐分享夜間如廁、日夜顛倒與照顧者睡眠不足的調整方向。",
    image: "assets/homecare-detail-04-daily-support-fast.jpg",
    author: "睡眠照顧諮詢師 曾小姐",
    date: "2026.04.30",
    readTime: "5 min read",
    tags: ["名人講堂", "睡眠照顧", "夜間照顧"],
    summary: ["夜間照顧會直接影響全家白天狀態。", "先看日間活動、光線與午睡長度。", "照顧者睡眠也需要被納入計畫。"],
    content: [
      ["夜間問題不是只有晚上才處理", "曾小姐分享，長輩半夜頻繁起身、日夜顛倒或睡不安穩，常常和白天活動量、午睡時間、光照、用藥和晚間飲水有關。只盯著晚上，常常找不到真正入口。"],
      ["把夜間風險先降下來", "如果長輩半夜如廁，床邊燈光、止滑鞋、路線清空和扶手位置都很重要。夜裡不只是睡眠問題，也常常是跌倒風險最高的時段。"],
      ["照顧者也需要睡覺", "家屬長期睡不好，白天就更難溝通與判斷。照顧計畫應該把夜間分工、喘息服務或日照安排一起討論，讓家庭不是靠硬撐走下去。"]
    ],
    cta: "夜間照顧讓家人撐不住時，可以先讓歲悅協助整理服務選項。"
  },
  "master-talk-care-subsidy": {
    category: "Master Talk",
    title: "把補助和自費說清楚，家庭才敢開始安排。",
    dek: "長照補助顧問楊先生拆解額度、部分負擔與服務組合，讓家屬更好做決定。",
    image: "assets/homepage-batch/family-consultation-clear-display.jpg",
    author: "長照補助顧問 楊先生",
    date: "2026.04.29",
    readTime: "5 min read",
    tags: ["名人講堂", "長照補助", "服務費用"],
    summary: ["先理解可用額度，再討論服務組合。", "自費不是失敗，而是補足家庭真正需要。", "費用透明會降低家屬的決策焦慮。"],
    content: [
      ["家庭怕的常常不是花錢，而是不知道會花多少", "楊先生分享，許多家屬延遲安排服務，是因為不清楚補助額度、部分負擔、自費項目和實際使用頻率。把費用說清楚，家庭才有安全感做決定。"],
      ["補助要放回生活需求裡看", "長照額度不是單純拿滿才好，而是要回到家庭最困難的時段。洗澡、備餐、接送、日照、復能或喘息服務，應該依照壓力來源做組合。"],
      ["透明是信任的開始", "好的服務窗口會先說明可能費用、限制和替代方案，讓家屬知道每一筆安排背後的用途。當費用透明，照顧比較不會變成家庭爭執來源。"]
    ],
    cta: "不確定補助、自費與服務組合怎麼搭配，可以先留下需求。"
  },
  "master-talk-careworker-training": {
    category: "Master Talk",
    title: "照服員的專業，是把每一次靠近都做得穩。",
    dek: "照服員培訓講師蘇小姐談尊重、移位、溝通與紀錄，如何支撐家屬看得見的品質。",
    image: "assets/quality-recruit-02-training-clear-display.jpg",
    author: "照服員培訓講師 蘇小姐",
    date: "2026.04.28",
    readTime: "5 min read",
    tags: ["名人講堂", "照服員培訓", "服務品質"],
    summary: ["專業藏在進門、靠近、移位與告知裡。", "穩定紀錄讓督導和家屬能一起追蹤。", "訓練不是一次課程，而是持續回饋。"],
    content: [
      ["照顧品質從靠近開始", "蘇小姐分享，照服員的專業不只在技能，也在每一次進門、問候、告知與取得同意。長輩感覺被尊重，照顧動作才比較容易被接受。"],
      ["移位和沐浴最需要穩定標準", "高風險照顧情境需要清楚步驟，包含環境確認、口令、支撐位置、長輩反應與事後整理。標準不是為了僵化，而是讓每個人都能安全接手。"],
      ["紀錄讓品質被看見", "服務紀錄能讓家屬知道今天的狀況，也讓督導看見需要調整的地方。好的培訓會把現場回饋帶回訓練，而不是只在課堂結束。"]
    ],
    cta: "想了解歲悅如何訓練照服員與維持品質，歡迎與我們聯繫。"
  },
  "master-talk-care-technology": {
    category: "Master Talk",
    title: "系統不是取代人，而是讓照顧資訊不遺漏。",
    dek: "科技照顧產品經理賴先生分享服務紀錄、家屬回報與督導追蹤如何串成照顧日常。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    author: "科技照顧產品經理 賴先生",
    date: "2026.04.27",
    readTime: "5 min read",
    tags: ["名人講堂", "照顧系統", "家屬回報"],
    summary: ["系統的價值是把資訊接起來。", "家屬需要看得懂的回報，不是複雜後台。", "督導追蹤能讓服務品質更穩。"],
    content: [
      ["照顧資訊最怕斷在某個人身上", "賴先生分享，長照服務牽涉家屬、照服員、督導與行政窗口。若資訊只靠口頭轉述，很容易漏掉今天吃多少、精神如何、是否跌倒或下次要注意什麼。"],
      ["家屬要的是看得懂的安心", "科技不應該讓家庭更焦慮。好的系統會把服務紀錄、照片、提醒與異常狀況整理成家屬看得懂的格式，讓下班後也能快速掌握重點。"],
      ["督導追蹤讓服務可以持續改善", "當紀錄累積起來，督導可以看趨勢、發現重複問題，並回到訓練與服務調整。系統不是取代照顧者，而是讓每一次照顧更容易被接住。"]
    ],
    cta: "想了解歲悅照顧系統如何支援家屬與督導，歡迎預約諮詢。"
  },
  "master-talk-discharge-transition": {
    category: "Master Talk",
    title: "出院不是結束，是家庭照顧重新開始的第一週。",
    dek: "出院準備顧問謝護理師談返家第一週的用藥、回診、移位與照顧分工。",
    image: "assets/health3/generated/post-discharge-care-station-hero.jpg",
    author: "出院準備顧問 謝護理師",
    date: "2026.04.26",
    readTime: "5 min read",
    tags: ["名人講堂", "出院返家", "照顧銜接"],
    summary: ["出院後第一週最需要清楚分工。", "用藥、回診、傷口與移位都要先整理。", "照顧計畫要讓家屬知道遇到狀況找誰。"],
    content: [
      ["返家第一週最容易手忙腳亂", "謝護理師分享，出院當天家庭常以為終於告一段落，但真正的照顧挑戰才剛開始。藥袋、回診單、傷口照護、復健建議與生活限制若沒有整理清楚，家人很快就會陷入猜測。"],
      ["先把風險寫成清單", "返家前最好確認誰負責服藥提醒、誰陪同回診、誰觀察傷口或精神狀態，也要知道什麼情況需要立刻就醫。清單不是形式，而是讓家人能接手。"],
      ["銜接服務能降低家庭壓力", "若長輩短期內需要移位、沐浴、備餐或復能支持，可以提早安排居家照顧與專業評估。照顧銜接越早開始，家屬越不需要靠臨場反應硬撐。"]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/generated/post-discharge-care-station-inline.jpg", alt: "出院返家照顧資料與用藥整理", caption: "第一週先把用藥、回診和每日觀察整理到同一份紀錄。" }
    ],
    references: [
      { evidenceRank: 1, pmid: "34823079", citation: "Lee, J. Y., Yang, Y. S., & Cho, E. (2022). Transitional care from hospital to home for frail older adults: A systematic review and meta-analysis. Geriatric Nursing, 43, 64-76. https://doi.org/10.1016/j.gerinurse.2021.11.003", url: "https://pubmed.ncbi.nlm.nih.gov/34823079/" },
      { evidenceRank: 1, pmid: "33419903", citation: "Fønss Rasmussen, L., Grode, L. B., Lange, J., Barat, I., & Gregersen, M. (2021). Impact of transitional care interventions on hospital readmissions in older medical patients: A systematic review. BMJ Open, 11(1), e040057. https://doi.org/10.1136/bmjopen-2020-040057", url: "https://pubmed.ncbi.nlm.nih.gov/33419903/" }
    ],
    cta: "家人即將出院返家時，歡迎讓歲悅協助整理第一週照顧安排。"
  },
  "master-talk-pressure-injury-care": {
    category: "Master Talk",
    title: "翻身不是例行公事，是在保護皮膚和尊嚴。",
    dek: "傷口照護護理師洪護理師分享壓傷預防、皮膚觀察與床上照顧的細節。",
    image: "assets/health3/generated/pressure-injury-posture-care-hero.jpg",
    author: "傷口照護護理師 洪護理師",
    date: "2026.04.25",
    readTime: "5 min read",
    tags: ["名人講堂", "壓傷預防", "皮膚照護"],
    summary: ["久臥或久坐都需要留意壓力點。", "皮膚發紅、潮濕與摩擦是早期警訊。", "翻身、減壓與清潔要和長輩感受一起看。"],
    content: [
      ["壓傷常常不是突然發生", "洪護理師提醒，長輩活動量下降、長時間坐輪椅或臥床時，尾椎、腳跟、髖部和肩胛附近都容易承受壓力。若皮膚反覆發紅、破皮或潮濕，就要提早處理。"],
      ["翻身要有節奏，也要有溝通", "協助翻身時，家屬常擔心弄痛長輩。可以先說明動作、準備枕頭支撐，再觀察長輩表情與呼吸。好的翻身不是把人轉過去，而是讓身體得到真正減壓。"],
      ["床上照顧也需要專業眼睛", "尿布更換、擦澡、床單皺摺與衣物摩擦都會影響皮膚狀況。若已經有傷口，建議請護理專業協助評估，避免家屬用錯方式讓傷口更難恢復。"]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/generated/pressure-injury-posture-care-inline.jpg", alt: "壓傷預防用品與照顧紀錄", caption: "壓傷預防要把姿勢、減壓、清潔與紀錄放在同一個流程。" }
    ],
    references: [
      { evidenceRank: 1, pmid: "32924821", citation: "Avsar, P., Moore, Z., Patton, D., O'Connor, T., Budri, A. M., & Nugent, L. (2020). Repositioning for preventing pressure ulcers: A systematic review and meta-analysis. Journal of Wound Care, 29(9), 496-508. https://doi.org/10.12968/jowc.2020.29.9.496", url: "https://pubmed.ncbi.nlm.nih.gov/32924821/" },
      { evidenceRank: 1, pmid: "16926357", citation: "Reddy, M., Gill, S. S., & Rochon, P. A. (2006). Preventing pressure ulcers: A systematic review. JAMA, 296(8), 974-984. https://doi.org/10.1001/jama.296.8.974", url: "https://pubmed.ncbi.nlm.nih.gov/16926357/" }
    ],
    cta: "若長輩有臥床、久坐或皮膚破損狀況，可以先預約照護評估。"
  },
  "master-talk-daycare-transition": {
    category: "Master Talk",
    title: "第一次去日照，家屬要準備的是安心感。",
    dek: "日照適應顧問盧社工談長輩初次到日照中心時，家庭可以怎麼陪伴與銜接。",
    image: "assets/health3/generated/day-care-adaptation-welcome-hero.jpg",
    author: "日照適應顧問 盧社工",
    date: "2026.04.24",
    readTime: "5 min read",
    tags: ["名人講堂", "日照適應", "社區照顧"],
    summary: ["第一次日照需要循序建立安全感。", "家屬可以準備生活習慣和喜好資訊。", "適應期重點是穩定，不是立刻表現完美。"],
    content: [
      ["抗拒不代表不適合", "盧社工分享，許多長輩第一次聽到日照會先拒絕，原因可能是不熟悉環境、擔心被安排、害怕失去自主。家屬可以先用參觀、短時間體驗和熟悉工作人員的方式慢慢銜接。"],
      ["把生活習慣交給團隊", "長輩喜歡的稱呼、用餐偏好、如廁習慣、容易焦慮的情境，都能幫助日照團隊更快建立信任。這些小資訊，往往比長篇病史更能影響第一天的感受。"],
      ["適應期先看情緒，再看活動量", "剛開始不一定要期待長輩參加所有活動。只要願意坐下、願意吃飯、願意和人互動一點點，就是好的開始。日照的目標，是讓長輩慢慢找回規律與連結。"]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/generated/day-care-adaptation-welcome-inline.jpg", alt: "日照中心初次適應與熟悉環境", caption: "前期先建立熟悉感和安全感，不急著要求長輩立刻適應整天。" }
    ],
    references: [
      { evidenceRank: 1, pmid: "39443968", citation: "Nguyen, H., Rahman, A., Ubell, A., Goodarzi, Z., Maxwell, C. J., Allana, S., Tate, K., Symonds-Brown, H., Weeks, L., Caspar, S., Mann, J., & Hoben, M. (2024). Adult day programs and their effects on individuals with dementia and their caregivers (ADAPT-DemCare): A realist synthesis to develop program theories on the how and why. Systematic Reviews, 13(1), 265. https://doi.org/10.1186/s13643-024-02683-1", url: "https://pubmed.ncbi.nlm.nih.gov/39443968/" },
      { evidenceRank: 2, pmid: "9750575", citation: "Zarit, S. H., Stephens, M. A., Townsend, A., & Greene, R. (1998). Stress reduction for family caregivers: Effects of adult day care use. The Journals of Gerontology: Series B, 53B(5), S267-S277. https://doi.org/10.1093/geronb/53b.5.s267", url: "https://pubmed.ncbi.nlm.nih.gov/9750575/" }
    ],
    cta: "正在評估日照或社區服務時，歲悅可以協助整理適合的銜接方式。"
  },
  "master-talk-caregiver-burnout": {
    category: "Master Talk",
    title: "照顧者不是超人，先被接住才有力氣照顧。",
    dek: "照顧者支持心理師高心理師談疲憊、罪惡感與家庭支持如何被看見。",
    image: "assets/health3/generated/caregiver-respite-planning-hero.jpg",
    author: "照顧者支持心理師 高心理師",
    date: "2026.04.23",
    readTime: "5 min read",
    tags: ["名人講堂", "照顧者支持", "家庭壓力"],
    summary: ["疲憊不是不孝，而是壓力已經超載。", "照顧者需要被允許休息與求助。", "家庭分工要具體，不能只靠一句辛苦了。"],
    content: [
      ["很多照顧者累到不敢說累", "高心理師分享，長期照顧最難的地方，是身體疲累之外還有罪惡感。家屬常覺得只要自己停下來，就是對不起長輩，但照顧者若一直被消耗，照顧品質也會跟著下降。"],
      ["先辨認超載訊號", "睡不好、容易生氣、對長輩失去耐心、對其他家人疏離，都是需要被看見的訊號。這不是個性變差，而是壓力已經超過一個人能承受的範圍。"],
      ["支持要變成具體安排", "家人可以分擔接送、採買、陪診、夜間照顧或行政聯繫，也可以搭配喘息、日照與居家服務。真正的支持，是把一句辛苦了變成有人接手的時段。"]
    ],
    inlineImages: [
      { afterSection: 2, src: "assets/health3/generated/caregiver-respite-planning-inline.jpg", alt: "照顧者喘息與家庭分工規劃", caption: "支持照顧者，需要把一句辛苦了變成有人接手的時段。" }
    ],
    references: [
      { evidenceRank: 1, pmid: "30450915", citation: "Williams, F., Moghaddam, N., Ramsden, S., & De Boos, D. (2019). Interventions for reducing levels of burden amongst informal carers of persons with dementia in the community: A systematic review and meta-analysis of randomised controlled trials. Aging & Mental Health, 23(12), 1629-1642. https://doi.org/10.1080/13607863.2018.1515886", url: "https://pubmed.ncbi.nlm.nih.gov/30450915/" },
      { evidenceRank: 1, pmid: "33226434", citation: "Walter, E., & Pinquart, M. (2020). How effective are dementia caregiver interventions? An updated comprehensive meta-analysis. The Gerontologist, 60(8), e609-e619. https://doi.org/10.1093/geront/gnz118", url: "https://pubmed.ncbi.nlm.nih.gov/33226434/" }
    ],
    cta: "如果照顧已經讓家人撐不住，歡迎讓歲悅一起整理可用支持。"
  },
  "master-talk-medication-reminder": {
    category: "Master Talk",
    title: "提醒吃藥不是催促，是幫長輩保留安全節奏。",
    dek: "用藥安全顧問陳藥師分享多重用藥、提醒方式與家屬溝通的實用方法。",
    image: "assets/health3/generated/medication-reminder-family-system-hero.jpg",
    author: "用藥安全顧問 陳藥師",
    date: "2026.04.22",
    readTime: "5 min read",
    tags: ["名人講堂", "用藥提醒", "照顧系統"],
    summary: ["多重用藥需要清楚時間與用途。", "提醒方式要讓長輩感覺被尊重。", "異常狀況要能回報給家屬與專業人員。"],
    content: [
      ["藥袋越多，越需要整理成生活節奏", "陳藥師分享，長輩若同時看多科、服用多種藥物，最容易發生重複吃、漏吃或不知道某顆藥的用途。先把早中晚與睡前整理清楚，是安全的第一步。"],
      ["提醒要避免變成衝突", "家屬常因擔心而一直催促，長輩卻可能覺得被管束。可以改用固定時間、藥盒、照片紀錄或服務人員回報，讓提醒變成日常節奏，而不是每次都要爭執。"],
      ["把異常記錄下來", "服藥後嗜睡、頭暈、食慾改變或跌倒，都應該記錄並在回診時告知醫師或藥師。照顧系統若能保存紀錄，家屬就不必只靠記憶追問題。"]
    ],
    inlineImages: [
      { afterSection: 1, src: "assets/health3/generated/medication-reminder-family-system-inline.jpg", alt: "家庭用藥提醒與紀錄桌面", caption: "藥物清單、藥盒、提醒和紀錄要接在一起。" }
    ],
    references: [
      { evidenceRank: 1, pmid: "38822740", citation: "Carollo, M., Crisafulli, S., Vitturi, G., Besco, M., Hinek, D., Sartorio, A., Tanara, V., Spadacini, G., Selleri, M., Zanconato, V., Fava, C., Minuz, P., Zamboni, M., & Trifirò, G. (2024). Clinical impact of medication review and deprescribing in older inpatients: A systematic review and meta-analysis. Journal of the American Geriatrics Society, 72(10), 3219-3238. https://doi.org/10.1111/jgs.19035", url: "https://pubmed.ncbi.nlm.nih.gov/38822740/" },
      { evidenceRank: 1, pmid: "38692414", citation: "Roncal-Belzunce, V., Gutiérrez-Valencia, M., Leache, L., Saiz, L. C., Bell, J. S., Erviti, J., & Martínez-Velilla, N. (2024). Systematic review and meta-analysis on the effectiveness of multidisciplinary interventions to address polypharmacy in community-dwelling older adults. Ageing Research Reviews, 98, 102317. https://doi.org/10.1016/j.arr.2024.102317", url: "https://pubmed.ncbi.nlm.nih.gov/38692414/" }
    ],
    cta: "需要協助建立用藥提醒與照顧回報流程時，可以和歲悅討論。"
  }
});

let staticArticleRewritePackPromise = null;
let staticArticleRewritePackLoaded = false;
const articleRewriteFields = {};

function applyStaticArticleRewritePack(pack = {}) {
  Object.entries(pack).forEach(([slug, rewrite]) => {
    articleRewriteFields[slug] = { ...rewrite, contentRevision: "2026-07-10-full-rewrite" };
    if (articlePages[slug]) Object.assign(articlePages[slug], rewrite, { contentRevision: "2026-07-10-full-rewrite" });
  });
}

function applyHealthArticleCards(articles = []) {
  const existingSlugs = new Set(healthArticles.map((article) => article.slug).filter(Boolean));
  const nextArticles = articles
    .filter((article) => article?.slug && !existingSlugs.has(article.slug))
    .map((article) => ({
      ...article,
      href: article.href || articleHref(article.slug),
      keywords: article.keywords || article.category || ""
    }));
  healthArticles.push(...nextArticles);
  Object.assign(articlePages, Object.fromEntries(nextArticles.map((article) => [
    article.slug,
    {
      category: article.category,
      title: article.title,
      dek: article.excerpt,
      image: article.image,
      author: article.author,
      date: article.date,
      tags: String(article.keywords || "").split(" ").filter(Boolean),
      summary: [article.excerpt],
      content: [["文章內容更新中", article.excerpt]]
    }
  ])));
}

function applyHealth30ArticleEnhancements(enhancements = {}) {
  health30ArticlePack.forEach((article) => {
    Object.assign(article, enhancements[article.slug] || {});
    article.contentRevision = article.contentRevision || "2026-07-10-full-rewrite";
    if (articlePages[article.slug]) Object.assign(articlePages[article.slug], article);
  });
}

async function ensureStaticArticleRewrites() {
  if (staticArticleRewritePackLoaded) return;
  if (!staticArticleRewritePackPromise) {
    staticArticleRewritePackPromise = import("./article-rewrites.js")
      .then((module) => {
        applyHealthArticleCards(module.elderDiseaseLazyPackArticles || []);
        applyStaticArticleRewritePack(module.default || {});
        applyHealth30ArticleEnhancements(module.health30ArticleEnhancements || {});
        staticArticleRewritePackLoaded = true;
      })
      .catch((error) => {
        console.warn("Static article rewrite pack unavailable.", error);
        staticArticleRewritePackLoaded = true;
      });
  }
  await staticArticleRewritePackPromise;
}

const relatedArticleCards = [
  {
    href: articleHref("longterm-care-apply"),
    category: "Health 3.0",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    image: "assets/homepage-batch/family-consultation-clear.jpg"
  },
  {
    href: articleHref("family-care-story"),
    category: "Care Stories",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    image: "assets/homepage-batch/care-home-greeting-clear.jpg"
  },
  {
    href: articleHref("master-talk-care-psychology"),
    category: "Master Talk",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    image: "assets/master-talk/cover-care-psychology-chou.jpg"
  },
  {
    href: articleHref("safe-transfer-tips"),
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    image: "assets/homepage-batch/18-health-fall-prevention-cover-fast.jpg"
  },
  {
    href: articleHref("nutrition-warning"),
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    image: "assets/homepage-batch/17-health-nutrition-cover-fast.jpg"
  },
  {
    href: articleHref("dementia-response"),
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    image: "assets/homepage-batch/19-health-dementia-cover-fast.jpg"
  },
  {
    href: articleHref("caregiver-support"),
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover-fast.jpg"
  },
  {
    href: articleHref("family-care-course"),
    category: "課程報名",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    image: "assets/homepage-batch/12-community-health-class-hires.jpg"
  }
];

const healthArticles = [
  {
    href: articleHref("longterm-care-apply"),
    category: "長照申請",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    excerpt: "從需求盤點、照顧計畫、政府補助到服務媒合，用一篇文章把流程講清楚。",
    image: "assets/homepage-batch/family-consultation-clear.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.05.13",
    keywords: "長照申請 家庭照顧 服務媒合 居家照顧"
  },
  {
    href: articleHref("family-care-story"),
    category: "家屬故事",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    excerpt: "每日回報、照顧紀錄與督導追蹤，讓出院返家的照顧不再只能靠家人猜。",
    image: "assets/homepage-batch/care-home-greeting-clear.jpg",
    author: "林小姐｜居家照顧",
    date: "2026.05.13",
    keywords: "出院返家 居家照顧 家屬回饋 照顧紀錄"
  },
  {
    href: articleHref("master-talk-care-psychology"),
    category: "專家專欄",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    excerpt: "照顧心理講師談家庭照顧中的焦慮、溝通與支持系統。",
    image: "assets/master-talk/cover-care-psychology-chou.jpg",
    author: "照顧心理講師 周小姐",
    date: "2026.05.13",
    keywords: "名人講堂 照顧心理 家屬支持"
  },
  {
    href: articleHref("safe-transfer-tips"),
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    excerpt: "從床邊高度、手部支撐到起身節奏，降低跌倒與拉傷風險。",
    image: "assets/homepage-batch/18-health-fall-prevention-cover-fast.jpg",
    author: "歲悅復能團隊",
    date: "2026.05.10",
    keywords: "跌倒 起身 移位 復能"
  },
  {
    href: articleHref("nutrition-warning"),
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    excerpt: "從體重、食慾、肌力與精神狀態，快速判斷是否需要營養或醫療協助。",
    image: "assets/homepage-batch/17-health-nutrition-cover-fast.jpg",
    author: "歲悅營養照顧小組",
    date: "2026.05.08",
    keywords: "營養 飲食 肌力 食慾 體重"
  },
  {
    href: articleHref("dementia-response"),
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    excerpt: "理解長輩不安背後的需求，用更穩定的語句降低照顧衝突。",
    image: "assets/homepage-batch/19-health-dementia-cover-fast.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.05.06",
    keywords: "失智 重複提問 溝通 情緒"
  },
  {
    href: articleHref("caregiver-support"),
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    excerpt: "先盤點照顧時段、找到喘息入口，讓家庭照顧可以走得更久。",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover-fast.jpg",
    author: "歲悅家庭支持團隊",
    date: "2026.05.02",
    keywords: "照顧者 壓力 喘息 家屬支持"
  },
  {
    href: articleHref("family-care-course"),
    category: "課程",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    excerpt: "把移位、用餐、跌倒預防與照顧溝通整理成家人也能操作的課程。",
    image: "assets/homepage-batch/12-community-health-class-hires.jpg",
    author: "歲悅教育品管",
    date: "2026.04.28",
    keywords: "課程 家屬照顧 移位 跌倒預防"
  }
];

healthArticles.push(
  {
    href: articleHref("master-talk-senior-nutrition"),
    category: "專家專欄",
    title: "吃得下、吃得夠，是照顧品質的第一個訊號。",
    excerpt: "銀髮營養顧問談食慾、體重、肌力與家庭日常觀察。",
    image: "assets/master-talk/cover-senior-nutrition-lee.jpg",
    author: "銀髮營養顧問 李先生",
    date: "2026.05.12",
    keywords: "名人講堂 銀髮營養 食慾 體重 肌力"
  },
  {
    href: articleHref("master-talk-rehab-goals"),
    category: "專家專欄",
    title: "復能不是訓練長輩聽話，而是找回生活能力。",
    excerpt: "復能治療師談目標設定、動作拆解與家屬陪伴。",
    image: "assets/master-talk/cover-rehab-therapist-hsu.jpg",
    author: "復能治療師 許小姐",
    date: "2026.05.11",
    keywords: "名人講堂 復能治療 生活能力 家屬陪伴"
  },
  {
    href: articleHref("master-talk-home-safety"),
    category: "專家專欄",
    title: "家中最危險的地方，往往是每天經過的路線。",
    excerpt: "居家安全顧問分享浴室、床邊與廚房動線的快速檢查方法。",
    image: "assets/master-talk/cover-home-safety-chang.jpg",
    author: "居家安全顧問 張先生",
    date: "2026.05.10",
    keywords: "名人講堂 居家安全 跌倒預防 浴室 床邊"
  },
  {
    href: articleHref("master-talk-care-management"),
    category: "專家專欄",
    title: "照顧需要計畫，不需要家屬一個人硬撐。",
    excerpt: "照顧管理專家說明如何用服務、喘息與回報制度降低家庭壓力。",
    image: "assets/master-talk/cover-care-management-chen.jpg",
    author: "照顧管理專家 陳小姐",
    date: "2026.05.09",
    keywords: "名人講堂 照顧管理 喘息服務 家屬支持"
  },
  {
    href: articleHref("master-talk-dementia-care"),
    category: "專家專欄",
    title: "重複提問的背後，常常是長輩的不安。",
    excerpt: "失智照顧講師分享回應方式與情緒安撫，讓互動少一點拉扯。",
    image: "assets/master-talk/cover-dementia-care-lin.jpg",
    author: "失智照顧講師 林先生",
    date: "2026.05.08",
    keywords: "名人講堂 失智照顧 重複提問 情緒安撫"
  },
  {
    href: articleHref("master-talk-nursing-observation"),
    category: "專家專欄",
    title: "觀察不是緊張，是提早看見變化。",
    excerpt: "護理照護顧問以血壓、食慾、睡眠和傷口照護，談日常追蹤重點。",
    image: "assets/master-talk/cover-nursing-care-huang.jpg",
    author: "護理照護顧問 黃小姐",
    date: "2026.05.07",
    keywords: "名人講堂 護理觀察 血壓 食慾 睡眠 傷口"
  },
  {
    href: articleHref("master-talk-family-communication"),
    category: "專家專欄",
    title: "家屬會累，很多時候是因為沒有人說清楚。",
    excerpt: "家庭溝通講師分享照顧分工、期待管理與家庭會議的實用做法。",
    image: "assets/master-talk/cover-family-communication-wu.jpg",
    author: "家庭溝通講師 吳先生",
    date: "2026.05.06",
    keywords: "名人講堂 家庭溝通 照顧分工 家庭會議"
  },
  {
    href: articleHref("master-talk-community-health"),
    category: "專家專欄",
    title: "長輩需要的不只是照顧，也需要被邀請出門。",
    excerpt: "社區健康推廣談共餐、活動與社區據點如何延緩孤立。",
    image: "assets/master-talk/cover-community-health-cheng.jpg",
    author: "社區健康推廣 鄭小姐",
    date: "2026.05.05",
    keywords: "名人講堂 社區據點 共餐 健康促進 社交"
  },
  {
    href: articleHref("master-talk-longterm-policy"),
    category: "專家專欄",
    title: "好的長照服務，要讓家庭知道下一步在哪裡。",
    excerpt: "長照政策觀察分享資源串接與服務入口，如何讓照顧更容易開始。",
    image: "assets/master-talk/cover-longterm-policy-wang.jpg",
    author: "長照政策觀察 王先生",
    date: "2026.05.04",
    keywords: "名人講堂 長照政策 資源串接 服務入口"
  },
  {
    href: articleHref("master-talk-medication-safety"),
    category: "專家專欄",
    title: "藥不是吃完就好，是要吃得安全、吃得清楚。",
    excerpt: "藥事照護顧問談用藥清單、交互作用與回診溝通，讓家庭少一點猜測。",
    image: "assets/nursing-detail-01-vitals-clear-display.jpg",
    author: "藥事照護顧問 蔡藥師",
    date: "2026.05.03",
    keywords: "名人講堂 藥事安全 用藥管理 交互作用 回診"
  },
  {
    href: articleHref("master-talk-frailty-prevention"),
    category: "專家專欄",
    title: "最好的照顧，是在退化前先把生活力留住。",
    excerpt: "失能預防教練分享衰弱觀察、肌力活動與日常練習如何提早開始。",
    image: "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
    author: "失能預防教練 郭教練",
    date: "2026.05.02",
    keywords: "名人講堂 失能預防 衰弱 肌力 活動"
  },
  {
    href: articleHref("master-talk-swallowing-care"),
    category: "專家專欄",
    title: "一口飯吃得安心，比吃很多更重要。",
    excerpt: "吞嚥照護語言治療師從嗆咳、食物質地與用餐姿勢談家庭最容易忽略的風險。",
    image: "assets/daycare-detail-02-meal-fast.jpg",
    author: "吞嚥照護語言治療師 何小姐",
    date: "2026.05.01",
    keywords: "名人講堂 吞嚥照護 嗆咳 用餐安全 食物質地"
  },
  {
    href: articleHref("master-talk-sleep-rhythm"),
    category: "專家專欄",
    title: "夜裡安穩，白天的照顧才有力氣。",
    excerpt: "睡眠照顧諮詢師分享夜間如廁、日夜顛倒與照顧者睡眠不足的調整方向。",
    image: "assets/homecare-detail-04-daily-support-fast.jpg",
    author: "睡眠照顧諮詢師 曾小姐",
    date: "2026.04.30",
    keywords: "名人講堂 睡眠照顧 夜間照顧 日夜顛倒 照顧者"
  },
  {
    href: articleHref("master-talk-care-subsidy"),
    category: "專家專欄",
    title: "把補助和自費說清楚，家庭才敢開始安排。",
    excerpt: "長照補助顧問拆解額度、部分負擔與服務組合，讓家屬更好做決定。",
    image: "assets/homepage-batch/family-consultation-clear-display.jpg",
    author: "長照補助顧問 楊先生",
    date: "2026.04.29",
    keywords: "名人講堂 長照補助 自費 部分負擔 服務組合"
  },
  {
    href: articleHref("master-talk-careworker-training"),
    category: "專家專欄",
    title: "照服員的專業，是把每一次靠近都做得穩。",
    excerpt: "照服員培訓講師談尊重、移位、溝通與紀錄，如何支撐家屬看得見的品質。",
    image: "assets/quality-recruit-02-training-clear-display.jpg",
    author: "照服員培訓講師 蘇小姐",
    date: "2026.04.28",
    keywords: "名人講堂 照服員培訓 服務品質 移位 溝通"
  },
  {
    href: articleHref("master-talk-care-technology"),
    category: "專家專欄",
    title: "系統不是取代人，而是讓照顧資訊不遺漏。",
    excerpt: "科技照顧產品經理分享服務紀錄、家屬回報與督導追蹤如何串成照顧日常。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    author: "科技照顧產品經理 賴先生",
    date: "2026.04.27",
    keywords: "名人講堂 照顧系統 家屬回報 服務紀錄 督導追蹤"
  },
  {
    href: articleHref("master-talk-discharge-transition"),
    category: "專家專欄",
    title: "出院不是結束，是家庭照顧重新開始的第一週。",
    excerpt: "出院準備顧問談返家第一週的用藥、回診、移位與照顧分工。",
    image: "assets/health3/generated/post-discharge-care-station-hero.jpg",
    author: "出院準備顧問 謝護理師",
    date: "2026.04.26",
    keywords: "名人講堂 出院返家 照顧銜接 用藥 回診"
  },
  {
    href: articleHref("master-talk-pressure-injury-care"),
    category: "專家專欄",
    title: "翻身不是例行公事，是在保護皮膚和尊嚴。",
    excerpt: "傷口照護護理師分享壓傷預防、皮膚觀察與床上照顧的細節。",
    image: "assets/health3/generated/pressure-injury-posture-care-hero.jpg",
    author: "傷口照護護理師 洪護理師",
    date: "2026.04.25",
    keywords: "名人講堂 壓傷預防 皮膚照護 翻身 傷口"
  },
  {
    href: articleHref("master-talk-daycare-transition"),
    category: "專家專欄",
    title: "第一次去日照，家屬要準備的是安心感。",
    excerpt: "日照適應顧問談長輩初次到日照中心時，家庭可以怎麼陪伴與銜接。",
    image: "assets/health3/generated/day-care-adaptation-welcome-hero.jpg",
    author: "日照適應顧問 盧社工",
    date: "2026.04.24",
    keywords: "名人講堂 日照適應 社區照顧 日照中心 家屬"
  },
  {
    href: articleHref("master-talk-caregiver-burnout"),
    category: "專家專欄",
    title: "照顧者不是超人，先被接住才有力氣照顧。",
    excerpt: "照顧者支持心理師談疲憊、罪惡感與家庭支持如何被看見。",
    image: "assets/health3/generated/caregiver-respite-planning-hero.jpg",
    author: "照顧者支持心理師 高心理師",
    date: "2026.04.23",
    keywords: "名人講堂 照顧者支持 家庭壓力 喘息 罪惡感"
  },
  {
    href: articleHref("master-talk-medication-reminder"),
    category: "專家專欄",
    title: "提醒吃藥不是催促，是幫長輩保留安全節奏。",
    excerpt: "用藥安全顧問分享多重用藥、提醒方式與家屬溝通的實用方法。",
    image: "assets/health3/generated/medication-reminder-family-system-hero.jpg",
    author: "用藥安全顧問 陳藥師",
    date: "2026.04.22",
    keywords: "名人講堂 用藥提醒 照顧系統 多重用藥 藥盒"
  }
);

const additionalHealthArticles = [
  {
    slug: "chronic-disease-visit-prep",
    href: articleHref("chronic-disease-visit-prep"),
    category: "慢病照顧",
    title: "長輩慢病回診前，家屬最好先整理這張清單",
    excerpt: "把血壓血糖、用藥、跌倒、食慾與生活變化整理好，回診才不會只剩一句最近還好。",
    image: "assets/homepage-batch/09-nurse-blood-pressure-fast.jpg",
    author: "歲悅護理照顧小組",
    date: "2026.07.11",
    keywords: "慢病 回診 用藥 照顧紀錄 血壓 血糖"
  },
  {
    slug: "elder-constipation-care",
    href: articleHref("elder-constipation-care"),
    category: "飲食營養",
    title: "長輩便祕不是小事：家屬可以先觀察的 6 個線索",
    excerpt: "從水分、活動量、藥物、疼痛到排便習慣，先找原因，再決定怎麼協助。",
    image: "assets/health3/generated/hydration-meal-observation-hero.jpg",
    author: "歲悅營養照顧小組",
    date: "2026.07.11",
    keywords: "便祕 水分 活動量 飲食 照顧紀錄"
  },
  {
    slug: "pain-observation-elderly",
    href: articleHref("pain-observation-elderly"),
    category: "護理觀察",
    title: "長輩說不清楚哪裡痛，家人該怎麼觀察？",
    excerpt: "疼痛可能藏在表情、走路、睡眠、食慾與情緒裡，尤其失智長輩更需要系統化觀察。",
    image: "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
    author: "歲悅護理復能團隊",
    date: "2026.07.11",
    keywords: "疼痛觀察 失智照顧 行動能力 睡眠 護理"
  },
  {
    slug: "oral-care-aspiration-prevention",
    href: articleHref("oral-care-aspiration-prevention"),
    category: "照顧技巧",
    title: "口腔清潔不只是刷牙，也和吞嚥與肺炎風險有關",
    excerpt: "假牙、舌苔、口乾、嗆咳與飯後清潔，都會影響長輩每天吃飯和感染風險。",
    image: "assets/service-journey-06-oral-exercise.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.07.11",
    keywords: "口腔清潔 假牙 吞嚥 肺炎 飯後照顧"
  },
  {
    slug: "urinary-incontinence-night-care",
    href: articleHref("urinary-incontinence-night-care"),
    category: "夜間照顧",
    title: "長輩漏尿、夜尿變多，家屬不要只急著換尿布",
    excerpt: "先觀察尿量、疼痛、飲水、藥物與夜間動線，才能降低皮膚、跌倒與照顧衝突。",
    image: "assets/health3/generated/fall-prevention-night-route-hero.jpg",
    author: "歲悅居家安全團隊",
    date: "2026.07.11",
    keywords: "漏尿 夜尿 尿失禁 跌倒 尿布 皮膚照顧"
  },
  {
    slug: "social-isolation-depression-signs",
    href: articleHref("social-isolation-depression-signs"),
    category: "心理支持",
    title: "長輩越來越不出門，是懶得動還是孤立與憂鬱警訊？",
    excerpt: "少說話、少吃、睡眠變化、拒絕活動，可能都在提醒家屬需要把社交支持放回照顧。",
    image: "assets/homepage-batch/11-elder-art-activity-fast.jpg",
    author: "歲悅家庭支持團隊",
    date: "2026.07.11",
    keywords: "孤立 憂鬱 社交 長輩活動 家屬支持"
  },
  {
    slug: "assistive-device-selection",
    href: articleHref("assistive-device-selection"),
    category: "居家安全",
    title: "助行器、扶手、便盆椅怎麼選？先看長輩真正怎麼動",
    excerpt: "輔具不是買越多越安全，要看起身、轉身、如廁、洗澡與家中空間能不能配合。",
    image: "assets/nursing-detail-03-home-safety-fast.jpg",
    author: "歲悅居家安全團隊",
    date: "2026.07.11",
    keywords: "輔具 助行器 扶手 便盆椅 居家安全"
  },
  {
    slug: "home-emergency-care-folder",
    href: articleHref("home-emergency-care-folder"),
    category: "家庭準備",
    title: "家中照顧資料夾：急診、請假、交接時都用得到",
    excerpt: "把疾病、用藥、過敏、照顧限制、聯絡人與回診資訊集中，意外發生時家人比較不慌。",
    image: "assets/homepage-batch/14-care-notes-fast.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.07.11",
    keywords: "照顧資料夾 急診 用藥 交接 家庭照顧"
  },
  {
    slug: "heat-injury-older-adults",
    href: articleHref("heat-injury-older-adults"),
    category: "季節照顧",
    title: "高溫天氣照顧長輩：不要等口渴才補水",
    excerpt: "長輩、慢病患者與服用部分藥物者更容易受熱傷害影響，家屬要把降溫和觀察排進日常。",
    image: "assets/homepage-batch/15-phone-consultation-fast.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.07.11",
    keywords: "熱傷害 高溫 長輩 補水 慢病 季節照顧"
  },
  {
    slug: "family-care-meeting-guide",
    href: articleHref("family-care-meeting-guide"),
    category: "家屬支持",
    title: "家庭照顧會議怎麼開，才不會每次都變成吵架？",
    excerpt: "把任務、費用、醫療決策、緊急聯絡和喘息安排說清楚，照顧才不會只靠一個人撐。",
    image: "assets/homepage-batch/family-consultation-clear.jpg",
    author: "歲悅家庭支持團隊",
    date: "2026.07.11",
    keywords: "家庭會議 照顧分工 家屬溝通 喘息 醫療決策"
  }
];

healthArticles.push(...additionalHealthArticles);
Object.assign(articlePages, Object.fromEntries(additionalHealthArticles.map((article) => [
  article.slug,
  {
    category: article.category,
    title: article.title,
    dek: article.excerpt,
    image: article.image,
    author: article.author,
    date: article.date,
    readTime: "8 min read",
    tags: article.keywords.split(" ").filter(Boolean),
    summary: [article.excerpt],
    content: [["文章內容更新中", article.excerpt]]
  }
])));

const careworkerHardshipArticles = [
  {
    slug: "careworker-hard-work-overview",
    href: articleHref("careworker-hard-work-overview"),
    category: "照服員辛苦談",
    title: "照顧服務員辛苦在哪裡？不是做家事，是把安全扛在身上",
    excerpt: "從移位、沐浴、情緒安撫到服務紀錄，看見照服員每天承擔的身體與心理負荷。",
    image: "assets/homepage-batch/orange-polo-caregiver-clear.jpg",
    author: "歲悅教育品管",
    date: "2026.07.12",
    keywords: "照顧服務員 居服員 辛苦談 長照工作 情緒勞動"
  },
  {
    slug: "careworker-back-pain-transfer",
    href: articleHref("careworker-back-pain-transfer"),
    category: "照服員辛苦談",
    title: "腰痠背痛不是職業必然：照服員移位照顧為何這麼耗力",
    excerpt: "翻身、扶站、轉位、沐浴都需要技術與輔具，不能只靠照服員硬撐。",
    image: "assets/homecare-detail-03-safe-transfer-fast.jpg",
    author: "歲悅復能與職安小組",
    date: "2026.07.12",
    keywords: "照服員 腰背痛 移位 翻身 輔具 職業傷害"
  },
  {
    slug: "careworker-emotional-labor",
    href: articleHref("careworker-emotional-labor"),
    category: "照服員辛苦談",
    title: "照服員最累的，有時不是身體，是每天都要穩住情緒",
    excerpt: "面對焦慮家屬、失智長輩、拒絕照顧與臨時變化，情緒勞動也需要被支持。",
    image: "assets/homepage-batch/10-family-consultation-fast.jpg",
    author: "歲悅家庭支持團隊",
    date: "2026.07.12",
    keywords: "照服員 情緒勞動 家屬溝通 失智照顧 督導支持"
  },
  {
    slug: "home-careworker-travel-between-homes",
    href: articleHref("home-careworker-travel-between-homes"),
    category: "照服員辛苦談",
    title: "居服員的一天，常常辛苦在兩個案家之間",
    excerpt: "交通、停車、雨天、臨時取消與時間壓力，都是到宅服務不容易被看見的勞動。",
    image: "assets/homepage-batch/15-phone-consultation-fast.jpg",
    author: "歲悅居家服務團隊",
    date: "2026.07.12",
    keywords: "居服員 到宅服務 交通 排班 工時 長照"
  },
  {
    slug: "careworker-service-boundaries-family",
    href: articleHref("careworker-service-boundaries-family"),
    category: "照服員辛苦談",
    title: "照服員不是萬能幫手：服務界線說清楚，家屬和人員都比較安心",
    excerpt: "把照顧任務、家務協助、額外要求與風險回報說明白，才能避免誤會累積。",
    image: "assets/service-journey-13-family-system.jpg",
    author: "歲悅服務督導團隊",
    date: "2026.07.12",
    keywords: "服務界線 照服員 家屬溝通 居家服務 長照"
  },
  {
    slug: "dementia-careworker-safety",
    href: articleHref("dementia-careworker-safety"),
    category: "照服員辛苦談",
    title: "照服員照顧失智長輩時，最需要的是安全流程而不是膽子大",
    excerpt: "拒絕照顧、重複提問、遊走、情緒激動，都需要團隊支持與清楚處理流程。",
    image: "assets/homepage-batch/19-health-dementia-cover-fast.jpg",
    author: "歲悅失智照顧小組",
    date: "2026.07.12",
    keywords: "失智照顧 照服員 安全流程 遊走 情緒安撫"
  },
  {
    slug: "careworker-shift-sleep-fatigue",
    href: articleHref("careworker-shift-sleep-fatigue"),
    category: "照服員辛苦談",
    title: "輪班、早班、臨時加班：照服員疲勞也會影響照顧安全",
    excerpt: "長時間工作和睡眠不足不只是個人問題，也會影響判斷、移位安全與服務品質。",
    image: "assets/homecare-detail-04-daily-support-fast.jpg",
    author: "歲悅教育品管",
    date: "2026.07.12",
    keywords: "照服員 疲勞 輪班 睡眠 工作負荷 照顧安全"
  },
  {
    slug: "careworker-records-supervision-support",
    href: articleHref("careworker-records-supervision-support"),
    category: "照服員辛苦談",
    title: "照顧紀錄不是行政負擔，是照服員被團隊接住的方式",
    excerpt: "好的紀錄能讓異常被看見、督導能介入、家屬能理解，也讓照服員不用獨自扛責任。",
    image: "assets/homepage-batch/14-care-notes-fast.jpg",
    author: "歲悅服務督導團隊",
    date: "2026.07.12",
    keywords: "照顧紀錄 督導支持 照服員 服務品質 家屬回報"
  },
  {
    slug: "careworker-respect-retention",
    href: articleHref("careworker-respect-retention"),
    category: "照服員辛苦談",
    title: "留住照服員，不能只靠一句辛苦了",
    excerpt: "尊重、合理排班、職安輔具、督導支持與清楚升遷，才是讓長照人力穩定的關鍵。",
    image: "assets/homepage-batch/06-orange-polo-supervisor-fast.jpg",
    author: "歲悅人才發展團隊",
    date: "2026.07.12",
    keywords: "照服員 留任 尊重 薪資 排班 督導 長照人力"
  },
  {
    slug: "new-careworker-first-year",
    href: articleHref("new-careworker-first-year"),
    category: "照服員辛苦談",
    title: "新手照服員第一年，最需要的是有人陪跑",
    excerpt: "從第一次進案家、第一次協助沐浴到第一次遇到突發狀況，新手需要訓練也需要心理安全。",
    image: "assets/quality-recruit-02-training-clear-display.jpg",
    author: "歲悅教育訓練團隊",
    date: "2026.07.12",
    keywords: "新手照服員 教育訓練 督導 陪跑 心理安全 長照"
  }
];

healthArticles.push(...careworkerHardshipArticles);
Object.assign(articlePages, Object.fromEntries(careworkerHardshipArticles.map((article) => [
  article.slug,
  {
    category: article.category,
    title: article.title,
    dek: article.excerpt,
    image: article.image,
    author: article.author,
    date: article.date,
    readTime: "8 min read",
    tags: article.keywords.split(" ").filter(Boolean),
    summary: [article.excerpt],
    content: [["文章內容更新中", article.excerpt]]
  }
])));

const health30ArticlePack = [
  {
    slug: "fall-prevention-home-checklist",
    category: "居家安全",
    title: "夜間跌倒預防：家裡最該先改的 8 個地方",
    dek: "半夜起身、如廁、走到客廳，是許多家庭最緊張的時段。先從動線、照明與扶手把風險降下來。",
    excerpt: "把床邊到浴室的路線整理好，往往比一次買很多輔具更有效。",
    image: "assets/health3/generated/fall-prevention-night-route-hero.jpg",
    author: "歲悅居家安全團隊",
    date: "2026.07.04",
    readingMinutes: 5,
    tags: ["跌倒預防", "夜間照顧", "居家安全"],
    summary: ["先檢查床邊到浴室這條路線。", "夜燈、止滑鞋、扶手位置比裝飾更重要。", "若跌倒後有頭痛、嗜睡、持續疼痛或走路異常，應盡快就醫。"],
    content: [
      ["先整理最常走的那一條路", "不要一開始就想把整個家大改。先陪長輩從床邊走到浴室，看哪裡需要轉身、哪裡要跨門檻、哪裡光線不足。只要這條路變安全，夜間風險就能先降一大段。"],
      ["把光線放在腳下與轉角", "半夜醒來時視線反應比較慢，床邊、走廊轉角與浴室門口最好有柔和夜燈。燈不需要很亮，但要能看見地面、拖鞋與門檻。"],
      ["止滑不是只放浴室", "拖鞋太鬆、地毯邊緣翹起、延長線橫跨走道，都可能讓長輩絆倒。浴室止滑墊之外，也要檢查客廳、床邊與餐桌旁是否有容易勾腳的物品。"],
      ["扶手要裝在真正用力的位置", "扶手不是有裝就好，而是要符合長輩起身、轉身、坐下的動作。馬桶旁、淋浴區與床邊若需要扶持，建議請專業人員一起評估位置。"]
    ],
    cta: "想知道家裡哪裡最需要先改？可以預約歲悅居家安全檢視。",
    sourceName: "PubMed PMID 38833257",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/38833257/",
    keywords: "跌倒預防 夜間照顧 居家安全 浴室 床邊 長輩"
  },
  {
    slug: "hydration-low-appetite-elderly",
    category: "飲食營養",
    title: "長輩喝水少、吃不下：家屬先觀察這 5 件事",
    dek: "吃得少不一定只是胃口差。體重、精神、排便、藥物與吞嚥狀況，都可能是照顧提醒。",
    excerpt: "比起一直勸吃，先把一週的飲食、水分與精神狀態記錄下來。",
    image: "assets/health3/generated/hydration-meal-observation-hero.jpg",
    author: "歲悅營養照顧小組",
    date: "2026.07.04",
    readingMinutes: 5,
    tags: ["飲食營養", "水分補充", "食慾觀察"],
    summary: ["觀察一週比只看單餐更準。", "喝水少可能和吞嚥、藥物、如廁擔心或情緒有關。", "若體重快速下降、精神變差或常嗆咳，應諮詢醫療專業。"],
    content: [
      ["先看體重與精神變化", "如果長輩最近衣服變鬆、站起來比較吃力、白天更容易累，這些都比「今天吃幾口」更值得留意。可以固定每週同一時間量體重，搭配精神與活動量一起看。"],
      ["水分可以分次補，不一定一次喝很多", "有些長輩怕一直跑廁所，會刻意少喝水。家屬可以把水分拆成早餐後、午餐前、下午、晚餐後的小份量，也可以用湯品、含水量高的食物協助。"],
      ["用餐變慢和剩餐變多都要記", "長輩吃很久、常把肉類或青菜挑掉、咀嚼很久才吞，可能和牙口、吞嚥或食物質地有關。記錄下來後，再和醫療或營養專業討論會更有方向。"],
      ["不要只靠補品解決問題", "營養補充品可以是工具，但不應取代原因判斷。若出現明顯體重下降、反覆嗆咳、脫水疑慮或急性精神變化，請優先尋求醫療評估。"]
    ],
    cta: "如果家中長輩吃得越來越少，歲悅可以協助整理觀察紀錄與服務安排。",
    sourceName: "PubMed PMID 37330324",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/37330324/",
    keywords: "長輩 食慾 喝水 營養 體重 吞嚥"
  },
  {
    slug: "dementia-evening-agitation",
    category: "失智照顧",
    title: "失智傍晚變焦躁：先調整環境與作息",
    dek: "傍晚情緒起伏常讓家屬很挫折。與其一直說服，不如先降低刺激、建立固定節奏。",
    excerpt: "先回應情緒，再用簡短提示、光線與固定作息幫長輩找回安全感。",
    image: "assets/health3/generated/dementia-evening-routine-hero.jpg",
    author: "歲悅失智照顧編輯部",
    date: "2026.07.04",
    readingMinutes: 6,
    tags: ["失智照顧", "傍晚焦躁", "情緒安撫"],
    summary: ["傍晚焦躁常與疲累、光線變暗、飢餓或環境刺激有關。", "先安撫情緒，不急著糾正內容。", "若突然混亂、發燒、疼痛或行為劇烈改變，應諮詢醫療專業。"],
    content: [
      ["先把傍晚變成可預期的時間", "每天接近傍晚時，盡量固定做同一套流程：開燈、喝水、簡單點心、播放熟悉音樂或整理晚餐。可預期的節奏會讓長輩比較不需要用焦躁來確認安全感。"],
      ["光線與聲音都要降一點", "天色變暗、電視聲太大、家人同時說話，都可能讓長輩更混亂。傍晚可以提前開柔和燈光，降低背景聲，讓現場只保留一個主要溝通者。"],
      ["回答要短，不要連續追問", "當長輩一直問「我要回家嗎」，先回應情緒，例如「你有點擔心，我陪你」。再用短句說明現在要做的事。越急著糾正，衝突越容易升高。"],
      ["替家屬安排喘息也很重要", "傍晚常是家屬下班後最疲累的時段。若每天都在同一時段爆發衝突，可以考慮居家照顧、日照或喘息服務協助銜接。"]
    ],
    cta: "家中若常在傍晚卡住，歲悅可以陪你一起整理作息與服務分工。",
    sourceName: "PubMed PMID 31862527",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/31862527/",
    keywords: "失智 傍晚 焦躁 日落症候群 情緒安撫 家屬支持"
  },
  {
    slug: "post-discharge-first-week",
    category: "出院返家",
    title: "出院返家第一週：家屬每天要記錄的重點",
    dek: "剛出院最怕資訊斷掉。用簡單紀錄把用藥、飲食、活動、疼痛與回診提醒接起來。",
    excerpt: "第一週不用求完美，先把每天最重要的變化留下來。",
    image: "assets/health3/generated/post-discharge-care-station-hero.jpg",
    author: "歲悅照顧管理團隊",
    date: "2026.07.04",
    readingMinutes: 6,
    tags: ["出院返家", "照顧紀錄", "家庭照顧"],
    summary: ["每天記錄精神、食慾、疼痛、用藥與活動狀況。", "把回診、傷口、復能與照顧服務放在同一張表。", "若突然喘、胸痛、意識改變或傷口惡化，請立即就醫。"],
    content: [
      ["第一天先確認家裡能不能安全生活", "床的高度、廁所動線、夜間照明、常用物品位置都要先調整。剛返家時不要急著恢復所有生活，先確保長輩能安全起身、如廁與用餐。"],
      ["每天固定看五件事", "建議記錄精神、食慾水分、疼痛不適、排便排尿、活動能力。這些項目不用寫很長，只要能讓下一位照顧者快速知道今天和昨天有什麼不同。"],
      ["用藥不要靠記憶接力", "出院藥、原本慢性病藥、暫停藥物與回診日期容易混在一起。可以把藥袋、服用時間、注意事項和疑問集中放在同一本紀錄裡。"],
      ["服務進場越早，家屬越不需要亂猜", "居家照顧、護理復能或日照不一定要等家屬崩潰才開始。第一週先建立觀察與回報流程，後面調整會容易很多。"]
    ],
    cta: "剛出院不知道怎麼安排？留下狀況，讓歲悅協助判斷下一步。",
    sourceName: "PubMed PMID 34823079",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/34823079/",
    keywords: "出院返家 照顧紀錄 用藥 回診 長照申請 居家照顧"
  },
  {
    slug: "safe-bathing-care",
    category: "照顧技巧",
    title: "浴室安全照顧：洗澡前中後的檢查清單",
    dek: "浴室是家中跌倒高風險區。先把水溫、止滑、扶手、坐姿與保暖順序固定下來。",
    excerpt: "洗澡不是只有清潔，更是觀察皮膚、體力與安全風險的時刻。",
    image: "assets/health3/generated/safe-bathing-preparation-hero.jpg",
    author: "歲悅居家照顧團隊",
    date: "2026.07.04",
    readingMinutes: 5,
    tags: ["浴室安全", "洗澡照顧", "跌倒預防"],
    summary: ["洗澡前先確認地面、椅子、水溫與毛巾位置。", "盡量坐著洗，減少站立轉身。", "若洗澡後頭暈、喘或虛弱，應先停止並觀察。"],
    content: [
      ["洗澡前先把東西放到手邊", "毛巾、衣物、沐浴用品與防滑拖鞋都要先放好，避免洗到一半才轉身拿東西。地面若濕滑或有門檻，建議先處理再開始。"],
      ["坐著洗比站著洗穩定", "淋浴椅能減少久站與轉身風險。照顧者協助時，注意不要拉扯長輩手臂，應讓長輩扶穩，並用清楚口令提醒下一步。"],
      ["水溫與保暖要先確認", "長輩對冷熱反應可能比較慢。先由照顧者測試水溫，洗完後立即擦乾、穿衣，避免因溫差造成不適或跌倒。"],
      ["洗澡也是皮膚觀察時間", "可以順便觀察皮膚紅腫、破皮、瘀青、腳趾縫濕疹或壓痕。若發現傷口、異常疼痛或感染徵象，應及早諮詢專業。"]
    ],
    cta: "想讓洗澡照顧更安全，可以預約歲悅到宅檢視浴室與動作流程。",
    sourceName: "PubMed PMID 37489124",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/37489124/",
    keywords: "浴室安全 洗澡照顧 淋浴椅 扶手 止滑 長輩"
  },
  {
    slug: "pressure-injury-prevention",
    category: "護理觀察",
    title: "久坐久躺的皮膚照顧：壓傷風險怎麼早點看見",
    dek: "皮膚紅、壓痕、潮濕與活動變少，都可能是壓傷提醒。越早看見，越容易處理。",
    excerpt: "照顧不是等傷口出現才處理，而是每天看皮膚、姿勢與濕度。",
    image: "assets/health3/generated/pressure-injury-posture-care-hero.jpg",
    author: "歲悅護理照護團隊",
    date: "2026.07.04",
    readingMinutes: 6,
    tags: ["護理觀察", "皮膚照顧", "壓傷預防"],
    summary: ["常見風險點包含尾椎、腳跟、臀部、手肘與肩胛。", "皮膚持續發紅、破皮或滲液，應尋求醫療/護理協助。", "翻身、減壓、保持乾爽與營養補充都很重要。"],
    content: [
      ["先知道哪些地方最容易受壓", "尾椎、臀部、腳跟、手肘、肩胛與耳後都是常見壓力點。若長輩活動量少、久坐輪椅或長時間臥床，這些地方要每天看。"],
      ["紅不紅，不只看表面", "如果某個部位壓完後持續發紅、摸起來比較熱、長輩喊痛或出現破皮，就不是普通壓痕。這時候不要自行按摩破皮處，應請專業評估。"],
      ["減壓要回到日常流程", "翻身、坐姿調整、靠墊位置、床單平整、尿布更換與皮膚保持乾爽，都要變成固定流程。只買氣墊床但沒有照顧節奏，效果會打折。"],
      ["營養和水分也是皮膚照顧", "蛋白質、水分與整體營養狀況會影響皮膚修復。若食慾差、體重下降或傷口不易癒合，建議一併諮詢醫療或營養專業。"]
    ],
    cta: "若家中長輩久坐久躺，歲悅可以協助建立皮膚觀察與照顧紀錄。",
    sourceName: "PubMed PMID 32924821",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/32924821/",
    keywords: "壓傷 褥瘡 皮膚照顧 久坐 久躺 護理觀察"
  },
  {
    slug: "medication-reminder-system",
    category: "用藥提醒",
    title: "用藥提醒不只靠記憶：家庭可以建立的小系統",
    dek: "把藥袋、藥盒、手機提醒與照顧紀錄接在一起，減少漏吃、重複吃與家人吵架。",
    excerpt: "用藥管理不是誰記性好，而是家裡有沒有一套不容易出錯的流程。",
    image: "assets/health3/generated/medication-reminder-family-system-hero.jpg",
    author: "歲悅照顧管理團隊",
    date: "2026.07.04",
    readingMinutes: 5,
    tags: ["用藥提醒", "照顧紀錄", "家庭照顧"],
    summary: ["所有藥物先集中整理，避免多人各管一包。", "藥盒、提醒與紀錄要一起使用。", "藥物調整請由醫師或藥師確認，勿自行停藥。"],
    content: [
      ["先把所有藥放到同一張清單", "包含慢性病藥、出院藥、保健品、中藥與外用藥，都先寫在同一張清單。家人看到的是同一份資料，才不容易重複或漏掉。"],
      ["藥盒只是工具，紀錄才是接力棒", "一週藥盒可以幫助分裝，但仍需要記錄今天是否已服用、是否有漏吃、是否有不舒服。照顧者交接時，看紀錄比靠口頭更穩。"],
      ["手機提醒要配合長輩習慣", "提醒可以設在家屬手機、照顧者手機或家中固定鬧鐘，但不要同時太多聲音，避免長輩焦慮。重點是固定、簡單、有人確認。"],
      ["有疑問就問藥師或醫師", "藥變多、劑量改變、吃藥後頭暈嗜睡、食慾變差，都應回頭詢問專業。不要因為怕麻煩就自行停藥或混合調整。"]
    ],
    cta: "想建立用藥與照顧紀錄流程，歲悅可以協助把家中分工整理清楚。",
    sourceName: "PubMed PMID 38822740",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/38822740/",
    keywords: "用藥提醒 藥盒 藥物管理 照顧紀錄 家庭照顧"
  },
  {
    slug: "caregiver-burnout-signs",
    category: "家屬支持",
    title: "照顧者快撐不住：不是不孝，是需要喘息",
    dek: "長期照顧會累，是因為責任太密、休息太少。先看見耗竭訊號，再把服務接進來。",
    excerpt: "喘息不是放棄家人，而是讓照顧關係有機會走得更久。",
    image: "assets/health3/generated/caregiver-respite-planning-hero.jpg",
    author: "歲悅家庭支持團隊",
    date: "2026.07.04",
    readingMinutes: 6,
    tags: ["照顧者支持", "喘息服務", "照顧壓力"],
    summary: ["睡不好、易怒、常自責、身體不適都是耗竭訊號。", "先找出最難熬的三個時段。", "喘息、居家照顧、日照與家人分工可以一起安排。"],
    content: [
      ["先承認照顧真的會累", "很多家屬最痛苦的不是做不到，而是不敢說累。長期睡不好、一直擔心、很容易生氣或常常自責，都可能是照顧耗竭的訊號。"],
      ["把壓力拆成時段，而不是整個人生", "先寫下最難熬的三個時段：洗澡、夜間如廁、用餐、回診、下班後交接。當問題變成具體時段，就比較能安排服務或家人輪替。"],
      ["喘息是照顧計畫的一部分", "喘息不是把長輩丟給別人，而是讓家屬能睡覺、工作、看醫生、恢復情緒。家庭照顧要走得長，照顧者也必須被照顧。"],
      ["不要等到崩潰才求助", "如果已經影響工作、健康或親密關係，建議盡快找長照窗口、社工、醫療或照顧團隊討論。越早接服務，越不需要用硬撐換安全。"]
    ],
    cta: "如果你已經快撐不住，先留下目前卡住的時段，歲悅協助你整理下一步。",
    sourceName: "PubMed PMID 30450915",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/30450915/",
    keywords: "照顧者 壓力 喘息服務 家屬支持 長照 家庭照顧"
  },
  {
    slug: "day-care-transition",
    category: "日間照顧",
    title: "第一次去日照不適應：陪長輩度過前兩週",
    dek: "不適應不代表不適合。用參觀、短時間體驗、固定接送與回家後安撫，讓轉換更柔和。",
    excerpt: "前兩週的目標不是立刻愛上日照，而是建立安全感與可預期感。",
    image: "assets/health3/generated/day-care-adaptation-welcome-hero.jpg",
    author: "歲悅日照團隊",
    date: "2026.07.04",
    readingMinutes: 5,
    tags: ["日間照顧", "家庭喘息", "服務適應"],
    summary: ["先讓長輩知道今天去哪裡、誰接送、幾點回家。", "前期可用短時間、固定物品與熟悉活動降低焦慮。", "家屬不要只看第一天情緒，要看一到兩週的變化。"],
    content: [
      ["先讓環境變熟悉", "正式開始前，可以先參觀中心、認識照顧人員、看活動區與休息區。對長輩來說，知道廁所在哪、誰會接他、午餐在哪吃，都能降低焦慮。"],
      ["前幾天不要塞太滿", "剛開始不一定要從最長時段開始。若條件允許，可以先用短時間體驗，讓長輩知道自己會被接回家，建立信任感。"],
      ["回家後先聽感受，不急著說服", "長輩說不想去時，先問最不舒服的是什麼：人太多、怕找不到家人、不習慣午睡、吃不下。知道原因後，中心才有機會一起調整。"],
      ["家屬也需要看見回報", "日照不是把人送去就結束。活動、用餐、精神狀況與特殊需求應該有回報，家屬才知道服務是否真的讓家庭變穩。"]
    ],
    cta: "想知道日照是否適合家中長輩，可以先預約參觀與需求討論。",
    sourceName: "PubMed PMID 39443968",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/39443968/",
    keywords: "日間照顧 日照 適應 家庭喘息 接送 長照"
  },
  {
    slug: "swallowing-meal-safety",
    category: "飲食營養",
    title: "吃飯常嗆到：家屬該先觀察與避免的事",
    dek: "嗆咳不是小事。先看坐姿、食物質地、進食速度與精神狀態，必要時尋求吞嚥評估。",
    excerpt: "先不要急著餵快一點。吃飯安全的第一步，是讓長輩坐穩、慢慢吃、有人觀察。",
    image: "assets/health3/generated/swallowing-safe-meal-hero.jpg",
    author: "歲悅照顧編輯部",
    date: "2026.07.04",
    readingMinutes: 6,
    tags: ["吞嚥安全", "飲食照顧", "嗆咳觀察"],
    summary: ["吃飯時坐直、保持清醒，避免邊躺邊吃。", "常嗆咳、聲音濕濕的、吃完發燒或喘，應諮詢醫療專業。", "食物質地調整需依專業建議，不要自行大幅改變。"],
    content: [
      ["先確認坐姿與清醒程度", "吃飯前先讓長輩坐直、腳能踩穩，避免躺著或半睡半醒時進食。若精神很差、一直嗆咳或喘，應先暫停並評估狀況。"],
      ["小口、慢速、一次一件事", "不要邊吃邊說話，也不要急著連續餵。每一口確認吞完再下一口，水分、湯品與乾硬食物都要特別留意。"],
      ["觀察嗆咳以外的訊號", "聲音變濕、清喉嚨變多、吃完容易發燒、體重下降或害怕吃飯，都可能和吞嚥安全有關。這些訊號應該記錄並帶去諮詢。"],
      ["需要時請專業評估質地", "有些家庭會自行把食物打成泥或加稠，但不一定適合每位長輩。吞嚥困難建議由醫療、語言治療或營養專業一起判斷。"]
    ],
    cta: "如果家中長輩常嗆到，歲悅可以協助整理觀察重點並建議下一步資源。",
    sourceName: "PubMed PMID 35623866",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/35623866/",
    keywords: "吞嚥 嗆咳 飲食安全 長輩 吃飯 照顧技巧"
  }
];

health30ArticlePack.forEach((article) => {
  article.contentRevision = article.contentRevision || "2026-07-10-full-rewrite";
});

Object.assign(
  articlePages,
  Object.fromEntries(
    health30ArticlePack.map(({ slug, excerpt, keywords, ...article }) => [slug, article])
  )
);

healthArticles.unshift(
  ...health30ArticlePack.map((article) => ({
    href: articleHref(article.slug),
    category: article.category,
    title: article.title,
    subtitle: article.dek,
    excerpt: article.excerpt,
    image: article.image,
    author: article.author,
    date: article.date,
    readingMinutes: article.readingMinutes,
    tags: article.tags,
    keywords: article.keywords
  }))
);

let supabaseHealthArticles = [];
let supabaseHealthArticlesLoaded = false;
let supabaseHealthArticlesPromise = null;
let supabaseArticleCategories = [];
let supabaseArticleCategoriesLoaded = false;
let supabaseArticleCategoriesPromise = null;
const supabaseArticlePageCache = new Map();
let homeModulesLoadedFromSupabase = false;
const careStoryPageCache = new Map();
const expertTalkPageCache = new Map();

function stripHTML(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function focalPointToObjectPosition(value = "center") {
  const positions = {
    center: "center center",
    top: "center top",
    bottom: "center bottom",
    left: "left center",
    right: "right center",
    "top-left": "left top",
    "top-right": "right top",
    "bottom-left": "left bottom",
    "bottom-right": "right bottom"
  };
  return positions[value] || positions.center;
}

function imageUsageToAspectRatio(value = "card") {
  const ratios = {
    hero: "21 / 9",
    service_hero: "4 / 3",
    article_cover: "16 / 9",
    card: "4 / 3",
    square: "1 / 1",
    avatar: "1 / 1",
    logo: "auto",
    map: "auto",
    freeform: "auto"
  };
  return ratios[value] || ratios.card;
}

function imageUsageToFit(value = "card", explicitFit = "") {
  if (explicitFit) return explicitFit;
  return ["logo", "map"].includes(value) ? "contain" : "cover";
}

function cmsImageStyle({ usage = "card", focalPoint = "center", fit = "" } = {}) {
  const aspectRatio = imageUsageToAspectRatio(usage);
  const declarations = [
    `--cms-image-position:${focalPointToObjectPosition(focalPoint)}`,
    `--cms-image-fit:${imageUsageToFit(usage, fit)}`
  ];
  if (aspectRatio !== "auto") declarations.push(`--cms-image-ratio:${aspectRatio}`);
  return declarations.join(";");
}

function imageStyleAttr(options = {}) {
  return ` style="${escapeHTML(cmsImageStyle(options))}"`;
}

function formatPostDate(dateValue, yearOnly = false) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  if (yearOnly) return String(date.getFullYear());
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const fallbackImages = {
  healthArticle: "assets/fallbacks/health-article-fallback.jpg",
  course: "assets/fallbacks/course-training-fallback.jpg",
  recruiting: "assets/fallbacks/recruiting-team-fallback.jpg",
  serviceModule: "assets/fallbacks/service-module-fallback.jpg",
  careStory: "assets/fallbacks/care-story-fallback.jpg",
  investor: "assets/fallbacks/investor-operations-fallback.jpg",
  contact: "assets/fallbacks/contact-consultation-fallback.jpg",
  serviceHero: "assets/fallbacks/service-hero-fallback.jpg"
};

function fallbackImageForText(text = "", fallback = fallbackImages.serviceModule) {
  const normalized = String(text || "").toLowerCase();
  if (/健康|文章|失智|跌倒|營養|用藥|照顧技巧|health|article/.test(normalized)) return fallbackImages.healthArticle;
  if (/課程|培訓|訓練|講座|研習|course|class|training/.test(normalized)) return fallbackImages.course;
  if (/招募|人才|職缺|應徵|recruit|career|talent|job/.test(normalized)) return fallbackImages.recruiting;
  if (/投資|治理|股東|財務|營運|investor|governance|finance|shareholder/.test(normalized)) return fallbackImages.investor;
  if (/聯絡|諮詢|客服|contact|consult/.test(normalized)) return fallbackImages.contact;
  if (/故事|心得|回饋|story|testimonial/.test(normalized)) return fallbackImages.careStory;
  if (/hero|主視覺|滿版|服務頁/.test(normalized)) return fallbackImages.serviceHero;
  return fallback;
}

function getPostImage(post, fallback = fallbackImages.healthArticle) {
  const embedded = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const acfImage = post?.acf?.image?.url || post?.acf?.avatar?.url || post?.acf?.speaker_photo?.url || post?.acf?.cover?.url;
  const fallbackImage = fallbackImageForText(`${post?.title?.rendered || ""} ${post?.excerpt?.rendered || ""}`, fallback);
  return contentImageUrl(acfImage || embedded || fallbackImage);
}

function getHealthArticleThemeImage(article = {}) {
  const identityText = [
    article.slug,
    article.category,
    article.categorySlug,
    article.title
  ].filter(Boolean).join(" ").toLowerCase();
  const text = [
    article.slug,
    article.category,
    article.categorySlug,
    article.title,
    article.subtitle,
    article.dek,
    article.excerpt,
    article.relatedService,
    ...(Array.isArray(article.tags) ? article.tags : [])
  ].filter(Boolean).join(" ").toLowerCase();

  if (/safe-bathing|bath|浴室安全|洗澡|沐浴/.test(identityText)) return "assets/health3/generated/safe-bathing-preparation-hero.jpg";
  if (/fall-prevention|跌倒|夜間|起身|居家安全|床邊|扶手/.test(identityText)) return "assets/health3/generated/fall-prevention-night-route-hero.jpg";
  if (/bath|浴室|洗澡|沐浴/.test(text)) return "assets/health3/generated/safe-bathing-preparation-hero.jpg";
  if (/fall|跌倒|夜間|起身|居家安全|床邊|扶手|廁所|如廁/.test(text)) return "assets/health3/generated/fall-prevention-night-route-hero.jpg";
  if (/hydration|喝水|水分|食慾|吃不下|營養|食慾下降/.test(text)) return "assets/health3/generated/hydration-meal-observation-hero.jpg";
  if (/swallow|吞嚥|嗆|嗆咳|吃飯常嗆|飲食安全/.test(text)) return "assets/health3/generated/swallowing-safe-meal-hero.jpg";
  if (/dementia|失智|傍晚|焦躁|日落|重複提問/.test(text)) return "assets/health3/generated/dementia-evening-routine-hero.jpg";
  if (/discharge|出院|返家|回診|第一週/.test(text)) return "assets/health3/generated/post-discharge-care-station-hero.jpg";
  if (/pressure|壓傷|褥瘡|久坐|久躺|皮膚/.test(text)) return "assets/health3/generated/pressure-injury-posture-care-hero.jpg";
  if (/medication|用藥|藥物|藥盒|提醒/.test(text)) return "assets/health3/generated/medication-reminder-family-system-hero.jpg";
  if (/burnout|喘息|撐不住|照顧者|照顧壓力|家屬支持/.test(text)) return "assets/health3/generated/caregiver-respite-planning-hero.jpg";
  if (/day-care|daycare|日照|日間照顧|第一次去日照|適應/.test(text)) return "assets/health3/generated/day-care-adaptation-welcome-hero.jpg";
  return "";
}

function getHealthArticleImage(article = {}, cover = {}) {
  const themedImage = getHealthArticleThemeImage(article);
  return normalizeLocalAssetUrl(contentImageUrl(article.image || cover?.public_url || themedImage || fallbackImages.healthArticle));
}

function healthArticleImageAttrs(article = {}, options = {}) {
  const fallback = escapeHTML(normalizeLocalAssetUrl(contentImageUrl(getHealthArticleThemeImage(article) || fallbackImages.healthArticle)));
  const image = escapeHTML(getHealthArticleImage(article));
  const alt = escapeHTML(article.title || "健康3.0文章圖片");
  return `src="${image}" alt="${alt}" data-fallback-src="${fallback}"${imageStyleAttr(options)}`;
}

function getCmsModuleImage(item, fallback = fallbackImages.serviceModule) {
  const fallbackImage = fallbackImageForText(`${item?.module_key || ""} ${item?.title || ""} ${item?.subtitle || ""} ${item?.body || ""}`, fallback);
  return fastAssetUrl(item?.image?.public_url || item?.metadata?.image_url || fallbackImage);
}

function getCmsDisplayModuleImage(item, fallback = fallbackImages.serviceModule) {
  const fallbackImage = fallbackImageForText(`${item?.module_key || ""} ${item?.title || ""} ${item?.subtitle || ""} ${item?.body || ""}`, fallback);
  return contentImageUrl(item?.image?.public_url || item?.metadata?.image_url || fallbackImage);
}

const serviceCardImages = [
  "assets/homepage-batch/service-card-01-home-care-clear-display.jpg",
  "assets/homepage-batch/service-card-02-day-care-clear-display.jpg",
  "assets/homepage-batch/service-card-03-community-clear-display.jpg",
  "assets/homepage-batch/service-card-04-nursing-clear-display.jpg",
  "assets/homepage-batch/service-card-05-migrant-training-clear-display.jpg",
  "assets/homepage-batch/service-card-06-quality-clear-display.jpg",
  "assets/admin-recruit-02-operations-hires.jpg"
];

const testimonialAvatarPaths = new Map([
  ["林小姐", "assets/testimonial-avatars/feedback-lin-home-care.jpg"],
  ["陳小姐", "assets/testimonial-avatars/feedback-chen-day-care.jpg"],
  ["黃小姐", "assets/testimonial-avatars/feedback-huang-training.jpg"],
  ["王小姐", "assets/testimonial-avatars/feedback-wang-rehab.jpg"],
  ["張小姐", "assets/testimonial-avatars/feedback-chang-home-care.jpg"],
  ["吳小姐", "assets/testimonial-avatars/feedback-wu-quality.jpg"],
  ["鄭小姐", "assets/testimonial-avatars/feedback-cheng-community.jpg"],
  ["謝小姐", "assets/testimonial-avatars/feedback-hsieh-records.jpg"],
  ["何小姐", "assets/testimonial-avatars/feedback-ho-supervisor.jpg"],
  ["許小姐", "assets/testimonial-avatars/feedback-hsu-integrated-care.jpg"],
  ["蔡先生", "assets/testimonial-avatars/feedback-tsai-home-care.jpg"],
  ["周先生", "assets/testimonial-avatars/feedback-chou-day-care.jpg"],
  ["何先生", "assets/testimonial-avatars/feedback-shen-rehab.jpg"],
  ["沈先生", "assets/testimonial-avatars/feedback-shen-rehab.jpg"],
  ["賴先生", "assets/testimonial-avatars/feedback-lai-training.jpg"],
  ["郭小姐", "assets/testimonial-avatars/feedback-hsu-integrated-care.jpg"],
  ["李小姐", "assets/testimonial-avatars/feedback-ho-supervisor.jpg"],
  ["謝先生", "assets/testimonial-avatars/feedback-tsai-home-care.jpg"],
  ["營運主管", "assets/testimonial-avatars/feedback-operations-manager.jpg"],
  ["行政窗口", "assets/testimonial-avatars/feedback-hsieh-records.jpg"],
  ["服務督導", "assets/testimonial-avatars/feedback-service-supervisor.jpg"],
  ["蘇小姐", "assets/testimonial-avatars/feedback-hsieh-records.jpg"],
  ["馬先生", "assets/testimonial-avatars/feedback-tsai-home-care.jpg"],
  ["高小姐", "assets/testimonial-avatars/feedback-chang-home-care.jpg"],
  ["楊小姐", "assets/testimonial-avatars/feedback-chen-day-care.jpg"],
  ["廖先生", "assets/testimonial-avatars/feedback-chou-day-care.jpg"],
  ["曾小姐", "assets/testimonial-avatars/feedback-hsu-integrated-care.jpg"],
  ["曾先生", "assets/testimonial-avatars/feedback-cheng-community.jpg"],
  ["朱小姐", "assets/testimonial-avatars/feedback-wu-quality.jpg"],
  ["邱小姐", "assets/testimonial-avatars/feedback-hsu-integrated-care.jpg"],
  ["許先生", "assets/testimonial-avatars/feedback-shen-rehab.jpg"],
  ["陳先生", "assets/testimonial-avatars/feedback-tsai-home-care.jpg"],
  ["趙小姐", "assets/testimonial-avatars/feedback-wang-rehab.jpg"],
  ["林先生", "assets/testimonial-avatars/feedback-lai-training.jpg"],
  ["陳太太", "assets/testimonial-avatars/feedback-huang-training.jpg"],
  ["蘇先生", "assets/testimonial-avatars/feedback-lai-training.jpg"],
  ["黃先生", "assets/testimonial-avatars/feedback-service-supervisor.jpg"],
  ["朱先生", "assets/testimonial-avatars/feedback-operations-manager.jpg"],
  ["林督導", "assets/testimonial-avatars/feedback-service-supervisor.jpg"],
  ["財務窗口", "assets/testimonial-avatars/feedback-operations-manager.jpg"],
  ["區域主管", "assets/testimonial-avatars/feedback-service-supervisor.jpg"],
  ["人資窗口", "assets/testimonial-avatars/feedback-ho-supervisor.jpg"]
]);

const testimonialServiceFallbackAvatars = {
  "居家照顧": "assets/testimonial-avatars/feedback-lin-home-care.jpg",
  "日間照顧": "assets/testimonial-avatars/feedback-chen-day-care.jpg",
  "社區據點": "assets/testimonial-avatars/feedback-cheng-community.jpg",
  "護理復能": "assets/testimonial-avatars/feedback-wang-rehab.jpg",
  "移工培訓": "assets/testimonial-avatars/feedback-huang-training.jpg",
  "教育品管": "assets/testimonial-avatars/feedback-wu-quality.jpg",
  "軟體系統": "assets/testimonial-avatars/feedback-operations-manager.jpg",
  "home-care": "assets/testimonial-avatars/feedback-lin-home-care.jpg",
  "day-care": "assets/testimonial-avatars/feedback-chen-day-care.jpg",
  community: "assets/testimonial-avatars/feedback-cheng-community.jpg",
  nursing: "assets/testimonial-avatars/feedback-wang-rehab.jpg",
  "migrant-training": "assets/testimonial-avatars/feedback-huang-training.jpg",
  quality: "assets/testimonial-avatars/feedback-wu-quality.jpg",
  software: "assets/testimonial-avatars/feedback-operations-manager.jpg"
};

function testimonialAvatarUrl(name = "", service = "", fallback = "assets/testimonial-avatars/feedback-lin-home-care.jpg") {
  const normalizedName = String(name || "").replace(/\s+/g, "");
  const normalizedService = String(service || "").trim();
  const avatar =
    testimonialAvatarPaths.get(normalizedName) ||
    testimonialServiceFallbackAvatars[normalizedService] ||
    fallback;
  return contentImageUrl(avatar);
}

const masterTalkPortraitPaths = {
  "care-psychology-chou": "assets/master-talk/portrait-care-psychology-chou.jpg",
  "senior-nutrition-lee": "assets/master-talk/portrait-senior-nutrition-lee.jpg",
  "rehab-therapist-hsu": "assets/master-talk/portrait-rehab-therapist-hsu.jpg",
  "home-safety-chang": "assets/master-talk/portrait-home-safety-chang.jpg",
  "care-management-chen": "assets/master-talk/portrait-care-management-chen.jpg",
  "dementia-care-lin": "assets/master-talk/portrait-dementia-care-lin.jpg",
  "nursing-care-huang": "assets/master-talk/portrait-nursing-care-huang.jpg",
  "family-communication-wu": "assets/master-talk/portrait-family-communication-wu.jpg",
  "community-health-cheng": "assets/master-talk/portrait-community-health-cheng.jpg",
  "longterm-policy-wang": "assets/master-talk/portrait-longterm-policy-wang.jpg",
  "medication-safety-tsai": "assets/nursing-detail-01-vitals-clear-display.jpg",
  "frailty-prevention-kuo": "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
  "swallowing-care-ho": "assets/daycare-detail-02-meal-fast.jpg",
  "sleep-rhythm-tseng": "assets/homecare-detail-04-daily-support-fast.jpg",
  "care-subsidy-yang": "assets/homepage-batch/family-consultation-clear-display.jpg",
  "careworker-training-su": "assets/quality-recruit-02-training-clear-display.jpg",
  "care-technology-lai": "assets/admin-recruit-02-operations-hero-hires.jpg"
};

const masterTalkCoverPaths = {
  "care-psychology-chou": "assets/master-talk/cover-care-psychology-chou.jpg",
  "senior-nutrition-lee": "assets/master-talk/cover-senior-nutrition-lee.jpg",
  "rehab-therapist-hsu": "assets/master-talk/cover-rehab-therapist-hsu.jpg",
  "home-safety-chang": "assets/master-talk/cover-home-safety-chang.jpg",
  "care-management-chen": "assets/master-talk/cover-care-management-chen.jpg",
  "dementia-care-lin": "assets/master-talk/cover-dementia-care-lin.jpg",
  "nursing-care-huang": "assets/master-talk/cover-nursing-care-huang.jpg",
  "family-communication-wu": "assets/master-talk/cover-family-communication-wu.jpg",
  "community-health-cheng": "assets/master-talk/cover-community-health-cheng.jpg",
  "longterm-policy-wang": "assets/master-talk/cover-longterm-policy-wang.jpg",
  "medication-safety-tsai": "assets/nursing-detail-01-vitals-clear-display.jpg",
  "frailty-prevention-kuo": "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
  "swallowing-care-ho": "assets/daycare-detail-02-meal-fast.jpg",
  "sleep-rhythm-tseng": "assets/homecare-detail-04-daily-support-fast.jpg",
  "care-subsidy-yang": "assets/homepage-batch/family-consultation-clear-display.jpg",
  "careworker-training-su": "assets/quality-recruit-02-training-clear-display.jpg",
  "care-technology-lai": "assets/admin-recruit-02-operations-hero-hires.jpg"
};

function masterTalkKeyFromParts(...parts) {
  const text = parts.filter(Boolean).join(" ").replace(/\s+/g, "");
  if (/care-psychology-chou|master-talk-care-psychology|周小姐|照顧心理/.test(text)) return "care-psychology-chou";
  if (/senior-nutrition-lee|李先生|銀髮營養|營養顧問|吃得下|吃得夠/.test(text)) return "senior-nutrition-lee";
  if (/rehab-therapist-hsu|許小姐|復能治療|復能不是|生活能力/.test(text)) return "rehab-therapist-hsu";
  if (/home-safety-chang|張先生|居家安全|家中最危險|浴室|床邊/.test(text)) return "home-safety-chang";
  if (/care-management-chen|陳小姐|照顧管理|照顧需要計畫|喘息/.test(text)) return "care-management-chen";
  if (/dementia-care-lin|林先生|失智照顧|重複提問|不安/.test(text)) return "dementia-care-lin";
  if (/nursing-care-huang|黃小姐|護理照護|觀察不是緊張|血壓|食慾|睡眠|傷口/.test(text)) return "nursing-care-huang";
  if (/family-communication-wu|吳先生|家庭溝通|家屬會累|照顧分工|家庭會議/.test(text)) return "family-communication-wu";
  if (/community-health-cheng|鄭小姐|社區健康|被邀請出門|共餐|社區據點/.test(text)) return "community-health-cheng";
  if (/longterm-policy-wang|王先生|長照政策|服務入口|資源串接|下一步在哪裡/.test(text)) return "longterm-policy-wang";
  if (/medication-safety-tsai|蔡藥師|藥事照護|用藥|藥不是吃完/.test(text)) return "medication-safety-tsai";
  if (/frailty-prevention-kuo|郭教練|失能預防|衰弱|生活力留住/.test(text)) return "frailty-prevention-kuo";
  if (/swallowing-care-ho|何小姐|吞嚥照護|嗆咳|一口飯/.test(text)) return "swallowing-care-ho";
  if (/sleep-rhythm-tseng|曾小姐|睡眠照顧|夜裡安穩|日夜顛倒/.test(text)) return "sleep-rhythm-tseng";
  if (/care-subsidy-yang|楊先生|長照補助|補助和自費|部分負擔/.test(text)) return "care-subsidy-yang";
  if (/careworker-training-su|蘇小姐|照服員培訓|每一次靠近|服務紀錄/.test(text)) return "careworker-training-su";
  if (/care-technology-lai|賴先生|科技照顧|系統不是取代人|家屬回報/.test(text)) return "care-technology-lai";
  return "care-psychology-chou";
}

function fallbackAssetFromParts(parts, fallback) {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    if (typeof part === "string" && /assets\//.test(part)) return part;
  }
  return fallback;
}

function masterTalkPortraitUrl(...parts) {
  const fallback = fallbackAssetFromParts(parts, "assets/master-talk/portrait-care-psychology-chou.jpg");
  return contentImageUrl(masterTalkPortraitPaths[masterTalkKeyFromParts(...parts)] || fallback);
}

function masterTalkCoverUrl(...parts) {
  const fallback = fallbackAssetFromParts(parts, "assets/master-talk/cover-care-psychology-chou.jpg");
  return contentImageUrl(masterTalkCoverPaths[masterTalkKeyFromParts(...parts)] || fallback);
}

function getServiceCardImage(item, index = 0) {
  const text = `${item?.title || ""} ${item?.slug || ""} ${item?.link_url || ""}`.toLowerCase();
  if (text.includes("居家") || text.includes("home-care")) return serviceCardImages[0];
  if (text.includes("日間") || text.includes("日照") || text.includes("day-care")) return serviceCardImages[1];
  if (text.includes("社區") || text.includes("community")) return serviceCardImages[2];
  if (text.includes("護理") || text.includes("復能") || text.includes("nursing")) return serviceCardImages[3];
  if (text.includes("移工") || text.includes("migrant")) return serviceCardImages[4];
  if (text.includes("品管") || text.includes("教育") || text.includes("quality")) return serviceCardImages[5];
  if (text.includes("系統") || text.includes("software")) return serviceCardImages[6];
  return serviceCardImages[index] || getCmsModuleImage(item, serviceCardImages[0]);
}

const fastAssetPaths = new Set([
  "assets/nursing-detail-02-walking-clear.jpg",
  "assets/hero-care-fast.jpg",
  "assets/nursing-detail-04-care-plan-fast.jpg",
  "assets/admin-recruit-02-operations-hero-hires.jpg",
  "assets/migrant-detail-01-classroom-fast.jpg",
  "assets/scene-care-note-fast.jpg",
  "assets/hero-care-hero-fast.jpg",
  "assets/service-overview-fast.jpg",
  "assets/quality-recruit-contact-sheet-fast.jpg",
  "assets/homecare-detail-01-greeting-hero-fast.jpg",
  "assets/admin-recruit-02-operations-hires.jpg",
  "assets/community-detail-02-meal-fast.jpg",
  "assets/homecare-detail-01-greeting-fast.jpg",
  "assets/quality-detail-04-improvement-fast.jpg",
  "assets/daycare-recruit-contact-sheet-fast.jpg",
  "assets/admin-recruit-contact-sheet-fast.jpg",
  "assets/location-taipei-fast.jpg",
  "assets/homecare-detail-03-safe-transfer-fast.jpg",
  "assets/homecare-detail-02-care-plan-fast.jpg",
  "assets/migrant-recruit-contact-sheet-fast.jpg",
  "assets/nursing-detail-03-home-safety-fast.jpg",
  "assets/homepage-batch/04-admin-team-office-fast.jpg",
  "assets/homepage-batch/orange-polo-supervisor-clear.jpg",
  "assets/homepage-batch/07-orange-apron-meal-prep-fast.jpg",
  "assets/homepage-batch/care-home-greeting-clear.jpg",
  "assets/homepage-batch/14-care-notes-fast.jpg",
  "assets/homepage-batch/family-consultation-clear.jpg",
  "assets/homepage-batch/03-supervisor-care-plan-fast.jpg",
  "assets/homepage-batch/orange-polo-caregiver-clear.jpg",
  "assets/homepage-batch/09-nurse-blood-pressure-hires.jpg",
  "assets/homepage-batch/11-elder-art-activity-hires.jpg",
  "assets/homepage-batch/16-taipei-service-office-fast.jpg",
  "assets/homepage-batch/12-community-health-class-hires.jpg",
  "assets/homepage-batch/19-health-dementia-cover-fast.jpg",
  "assets/homepage-batch/02-daycare-group-exercise-hires.jpg",
  "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
  "assets/cis-guide-fast.jpg",
  "assets/quality-detail-02-training-fast.jpg",
  "assets/homecare-detail-04-daily-support-fast.jpg",
  "assets/migrant-detail-01-classroom-hero-fast.jpg",
  "assets/migrant-recruit-04-communication-fast.jpg",
  "assets/community-detail-03-workshop-fast.jpg",
  "assets/location-taoyuan-fast.jpg",
  "assets/quality-detail-03-audit-fast.jpg",
  "assets/daycare-detail-01-exercise-fast.jpg",
  "assets/quality-recruit-02-training-clear.jpg",
  "assets/community-detail-01-exercise-hero-hires.jpg",
  "assets/daycare-detail-02-meal-fast.jpg",
  "assets/daycare-detail-04-checkin-fast.jpg",
  "assets/scene-home-care-fast.jpg",
  "assets/recruit-home-care-supervisor-fast.jpg",
  "assets/daycare-detail-03-activity-fast.jpg",
  "assets/location-newtaipei-fast.jpg",
  "assets/community-detail-01-exercise-fast.jpg",
  "assets/nursing-detail-02-walking-hero-fast.jpg",
  "assets/recruit-day-care-worker-fast.jpg",
  "assets/daycare-detail-01-exercise-hero-fast.jpg",
  "assets/north-service-map-fast.jpg",
  "assets/community-detail-04-consult-fast.jpg",
  "assets/quality-detail-01-materials-fast.jpg",
  "assets/migrant-detail-03-meal-fast.jpg",
  "assets/migrant-detail-04-communication-fast.jpg",
  "assets/recruit-home-care-worker-fast.jpg",
  "assets/migrant-detail-02-transfer-fast.jpg",
  "assets/nursing-detail-01-vitals-clear.jpg",
  "assets/quality-detail-04-improvement-hero-fast.jpg"
]);

const displayAssetPaths = new Set([
  "assets/homepage-batch/family-consultation-clear-display.jpg",
  "assets/homepage-batch/care-home-greeting-clear-display.jpg",
  "assets/homepage-batch/health-video-bathroom-safety-clear-display.jpg",
  "assets/homepage-batch/health-video-fall-observation-clear-display.jpg",
  "assets/homepage-batch/orange-polo-caregiver-clear-display.jpg",
  "assets/homepage-batch/orange-polo-supervisor-clear-display.jpg",
  "assets/homepage-batch/service-card-01-home-care-clear-display.jpg",
  "assets/homepage-batch/service-card-02-day-care-clear-display.jpg",
  "assets/homepage-batch/service-card-03-community-clear-display.jpg",
  "assets/homepage-batch/service-card-04-nursing-clear-display.jpg",
  "assets/homepage-batch/service-card-05-migrant-training-clear-display.jpg",
  "assets/homepage-batch/service-card-06-quality-clear-display.jpg",
  "assets/admin-recruit-05-meeting-clear-display.jpg",
  "assets/daycare-recruit-02-exercise-clear-display.jpg",
  "assets/nursing-detail-01-vitals-clear-display.jpg",
  "assets/nursing-detail-02-walking-clear-display.jpg",
  "assets/quality-recruit-02-training-clear-display.jpg",
  "assets/quality-recruit-04-quality-meeting-clear-display.jpg"
]);

const instantHeroAssetPaths = new Map([
  ["assets/hero-care-fast.jpg", HOME_HERO_INSTANT_IMAGE],
  ["assets/hero-care-hero-fast.jpg", HOME_HERO_INSTANT_IMAGE],
  ["assets/homepage-batch/care-home-greeting-clear.jpg", HOME_HERO_INSTANT_IMAGE]
]);

const legacyAssetPathMap = new Map([
  ["assets/hero-care.png", "assets/hero-care-hero-fast.jpg"],
  ["assets/homepage-batch/01-care-home-greeting.png", "assets/homecare-detail-01-greeting-hero-fast.jpg"],
  ["assets/homepage-batch/02-daycare-group-exercise.png", "assets/daycare-detail-01-exercise-hero-fast.jpg"],
  ["assets/homepage-batch/04-admin-team-office.png", "assets/homepage-batch/04-admin-team-office-fast.jpg"],
  ["assets/homepage-batch/05-orange-polo-caregiver.png", "assets/homepage-batch/orange-polo-caregiver-clear.jpg"],
  ["assets/homepage-batch/06-orange-polo-supervisor.png", "assets/homepage-batch/orange-polo-supervisor-clear.jpg"],
  ["assets/homecare-detail-01-greeting.png", "assets/homecare-detail-01-greeting-hero-fast.jpg"],
  ["assets/daycare-detail-01-exercise.png", "assets/daycare-detail-01-exercise-hero-fast.jpg"],
  ["assets/community-detail-01-exercise.png", "assets/community-detail-01-exercise-hero-hires.jpg"],
  ["assets/nursing-detail-02-walking.png", "assets/nursing-detail-02-walking-hero-fast.jpg"],
  ["assets/migrant-detail-01-classroom.png", "assets/migrant-detail-01-classroom-hero-fast.jpg"],
  ["assets/quality-detail-04-improvement.png", "assets/quality-detail-04-improvement-hero-fast.jpg"],
  ["assets/admin-recruit-02-operations.png", "assets/admin-recruit-02-operations-hero-hires.jpg"],
  ["assets/location-taipei.png", "assets/location-taipei-fast.jpg"]
]);

function localAssetPath(url = "") {
  const raw = String(url || "");
  if (!raw) return "";
  try {
    const parsed = new URL(raw, SITE_ORIGIN);
    if (parsed.origin !== SITE_ORIGIN && !["suiyuecare.com", "www.suiyuecare.com"].includes(parsed.hostname)) return "";
    return parsed.pathname.replace(/^\/assets\//, "assets/");
  } catch {
    return raw.replace(/^\/assets\//, "assets/");
  }
}

function withOriginalAssetFormat(original = "", assetPath = "") {
  const raw = String(original || "");
  if (!assetPath) return raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      parsed.pathname = `/${assetPath}`;
      parsed.search = "";
      parsed.hash = "";
      return parsed.href;
    } catch {
      return assetPath;
    }
  }
  return raw.startsWith("/assets/") ? `/${assetPath}` : assetPath;
}

function fastAssetUrl(url = "") {
  const raw = String(url || "");
  const normalized = localAssetPath(raw);
  const legacyPath = legacyAssetPathMap.get(normalized);
  if (legacyPath) return withOriginalAssetFormat(raw, legacyPath);
  if (!/\.png$/i.test(normalized)) return raw;
  const fastPath = normalized.replace(/\.png$/i, "-fast.jpg");
  if (!fastAssetPaths.has(fastPath)) return raw;
  return withOriginalAssetFormat(raw, fastPath);
}

function displayAssetUrl(url = "") {
  const raw = String(url || "");
  const normalized = localAssetPath(raw);
  if (!/\.jpe?g$/i.test(normalized) || /-display\.jpe?g$/i.test(normalized) || /-mobile\.jpe?g$/i.test(normalized)) return raw;
  const displayPath = normalized.replace(/\.jpe?g$/i, "-display.jpg");
  if (!displayAssetPaths.has(displayPath)) return raw;
  return withOriginalAssetFormat(raw, displayPath);
}

function contentImageUrl(url = "") {
  return displayAssetUrl(fastAssetUrl(url));
}

function instantHeroAssetUrl(url = "", fallback = HOME_HERO_INSTANT_IMAGE) {
  const fastUrl = fastAssetUrl(url || fallback);
  const normalized = localAssetPath(fastUrl || fallback);
  const instantPath = instantHeroAssetPaths.get(normalized);
  if (!instantPath) return fastUrl || fallback;
  return withOriginalAssetFormat(fastUrl, instantPath);
}

function normalizeLocalAssetUrl(url = "") {
  const fastUrl = fastAssetUrl(url);
  const normalized = String(fastUrl || "");
  if (location.protocol === "file:") return normalized.replace(/^\/assets\//, "assets/");
  return normalized.replace(/^assets\//, "/assets/");
}

function normalizeYouTubeEmbedUrl(value = "") {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";
  if (rawValue.includes("/embed/")) return rawValue;

  try {
    const url = new URL(rawValue);
    let videoId = "";
    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
    }
    return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : rawValue;
  } catch {
    return rawValue;
  }
}

function getArticleVideoData(contentJson = {}) {
  const source = contentJson && typeof contentJson === "object" ? contentJson : {};
  const nested = source.video && typeof source.video === "object" ? source.video : {};
  const url = source.video_url || nested.url || "";
  const provider = source.video_provider || nested.provider || (String(url).includes("youtu") ? "youtube" : "direct");
  const type = source.video_type || nested.type || "";
  let embedUrl = url;
  if (provider === "youtube") {
    embedUrl = normalizeYouTubeEmbedUrl(url);
  } else if (provider === "vimeo") {
    try {
      const parsedUrl = new URL(url);
      const videoId = parsedUrl.pathname.split("/").filter(Boolean).pop();
      embedUrl = videoId ? `https://player.vimeo.com/video/${encodeURIComponent(videoId)}` : url;
    } catch {
      embedUrl = url;
    }
  }
  return {
    url,
    embedUrl,
    provider,
    type,
    duration: source.video_duration || nested.duration || "",
    label: source.video_label || nested.label || "",
    caption: source.video_caption || nested.caption || ""
  };
}

function formatArticleDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function getHealthArticleList() {
  const staticArticles = healthArticles.map(normalizeStaticArticle);
  if (!supabaseHealthArticles.length) return staticArticles;

  const seenHrefs = new Set(supabaseHealthArticles.map((article) => normalizePublicHref(article.href)));
  return [
    ...supabaseHealthArticles,
    ...staticArticles.filter((article) => !seenHrefs.has(normalizePublicHref(article.href)))
  ];
}

function categorySlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHealthCategoryList() {
  const uniqueCategories = [...new Set(healthArticles.map((article) => article.category).filter(Boolean))];
  const staticCategories = uniqueCategories.map((name) => ({ name, slug: categorySlug(name) }));
  if (!supabaseArticleCategories.length) return staticCategories;

  const seenSlugs = new Set(supabaseArticleCategories.map((category) => category.slug));
  return [
    ...supabaseArticleCategories,
    ...staticCategories.filter((category) => !seenSlugs.has(category.slug))
  ];
}

function getArticleRewriteFields(slug = "") {
  const rewrite = articlePages[slug] || articleRewriteFields[slug];
  if (!rewrite?.contentRevision) return null;
  const fields = {};
  [
    "contentRevision",
    "dek",
    "summary",
    "content",
    "cta",
    "inlineImages",
    "warning",
    "checklists",
    "tables",
    "slides",
    "visualFormat",
    "faq",
    "references",
    "targetAudience",
    "readingMinutes",
    "sourceName",
    "sourceUrl"
  ].forEach((key) => {
    if (rewrite[key] !== undefined) fields[key] = rewrite[key];
  });
  return fields;
}

function normalizeSupabaseArticle(article, mediaById, categoriesById) {
  const categoryData = categoriesById.get(article.category_id);
  const category = categoryData?.display_label || categoryData?.name || "照顧知識";
  const slug = categoryData?.slug || categorySlug(category);
  const cover = mediaById.get(article.cover_image_id);
  const rewrite = getArticleRewriteFields(article.slug);
  const subtitle = article.subtitle || rewrite?.dek || article.excerpt || "";
  const excerpt = rewrite?.dek || article.excerpt || article.subtitle || stripHTML(article.content || "").slice(0, 88);
  const publishedAt = article.published_at || article.updated_at;
  const tagList = Array.isArray(article.tags) ? article.tags : [];
  const tags = tagList.join(" ");
  const video = getArticleVideoData(article.content_json || {});

  return {
    href: articleHref(article.slug),
    slug: article.slug,
    category,
    categorySlug: slug,
    categoryType: categoryData?.type || "article",
    categorySection: categoryData?.section_key || "health",
    contentType: article.content_type || article.content_json?.content_type || categoryData?.type || "article",
    title: article.title || "未命名文章",
    subtitle,
    excerpt,
    image: getHealthArticleImage({ ...article, category, categorySlug: slug, subtitle, excerpt }, cover),
    imageUsage: cover?.image_usage || "article_cover",
    focalPoint: cover?.focal_point || "center",
    videoUrl: video.url,
    videoEmbedUrl: video.embedUrl,
    videoProvider: video.provider,
    videoType: video.type,
    videoDuration: video.duration,
    videoLabel: video.label,
    videoCaption: video.caption,
    author: article.author_name || "歲悅照顧編輯部",
    date: formatArticleDate(publishedAt),
    publishedAt,
    readingMinutes: article.reading_minutes || rewrite?.readingMinutes,
    difficulty: article.difficulty || "",
    targetAudience: article.target_audience || rewrite?.targetAudience || "",
    relatedService: article.related_service || "",
    recommendedSlots: Array.isArray(article.recommended_slots) ? article.recommended_slots : [],
    summaryPoints: rewrite?.summary || (Array.isArray(article.summary_points) ? article.summary_points : []),
    relatedSlugs: Array.isArray(article.content_json?.related_slugs) ? article.content_json.related_slugs : [],
    ctaText: article.cta_text || article.content_json?.cta_text || rewrite?.cta || "",
    ctaUrl: article.cta_url || article.content_json?.cta_url || "",
    isFeatured: Boolean(article.is_featured),
    tags: tagList,
    keywords: `${article.title || ""} ${subtitle} ${excerpt} ${category} ${tags} ${article.target_audience || ""} ${article.related_service || ""}`
  };
}

function normalizeStaticArticle(article) {
  return {
    ...article,
    categorySlug: article.categorySlug || categorySlug(article.category)
  };
}

async function fetchSupabaseArticleCategories() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("article_categories")
    .select("id, name, slug, display_label, type, section_key, show_in_nav, sort_order, is_enabled")
    .eq("is_enabled", true)
    .eq("show_in_nav", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []).map((category) => ({
    id: category.id,
    name: category.display_label || category.name,
    slug: category.slug || categorySlug(category.name),
    type: category.type || "article",
    sectionKey: category.section_key || "health"
  }));
}

async function loadSupabaseArticleCategories({ rerender = false } = {}) {
  if (supabaseArticleCategoriesLoaded) return supabaseArticleCategories;
  if (!supabaseArticleCategoriesPromise) {
    supabaseArticleCategoriesPromise = fetchSupabaseArticleCategories()
      .then((categories) => {
        supabaseArticleCategories = categories;
        supabaseArticleCategoriesLoaded = true;
        return categories;
      })
      .catch((error) => {
        console.warn("Supabase article categories unavailable, using static categories.", error);
        supabaseArticleCategoriesLoaded = true;
        return [];
      });
  }

  const categories = await supabaseArticleCategoriesPromise;
  if (rerender && categories.length) {
    const current = routeSlugFromLocation() || "home";
    const currentBase = current.split("?")[0];
    if (currentBase === "health") renderPage(current);
  }
  return categories;
}

async function fetchSupabaseHealthArticles() {
  if (!supabase) return [];

  const { data: articles, error: articleError } = await supabase
    .from("articles")
    .select(`
      id,
      category_id,
      slug,
      title,
      subtitle,
      excerpt,
      content,
      content_json,
      content_type,
      cover_image_id,
      author_name,
      tags,
      recommended_slots,
      summary_points,
      reading_minutes,
      difficulty,
      target_audience,
      related_service,
      cta_text,
      cta_url,
      is_featured,
      sort_order,
      published_at,
      updated_at
    `)
    .eq("status", "published")
    .eq("is_enabled", true)
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(48);

  if (articleError) throw articleError;
  if (!articles?.length) return [];

  const mediaIds = [...new Set(articles.map((article) => article.cover_image_id).filter(Boolean))];
  const categoryIds = [...new Set(articles.map((article) => article.category_id).filter(Boolean))];
  const [mediaResult, categoriesResult] = await Promise.all([
    mediaIds.length
      ? supabase.from("media").select("id, public_url, alt_text, file_name, image_usage, focal_point").in("id", mediaIds)
      : Promise.resolve({ data: [], error: null }),
    categoryIds.length
      ? supabase.from("article_categories").select("id, name, display_label, slug, type, section_key, is_enabled").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (mediaResult.error) throw mediaResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  const mediaById = new Map((mediaResult.data || []).map((media) => [media.id, media]));
  const categoriesById = new Map((categoriesResult.data || []).filter((category) => category.is_enabled !== false).map((category) => [category.id, category]));
  return articles
    .filter((article) => !article.category_id || categoriesById.has(article.category_id))
    .map((article) => normalizeSupabaseArticle(article, mediaById, categoriesById));
}

async function loadSupabaseHealthArticles({ rerender = false } = {}) {
  if (supabaseHealthArticlesLoaded) return supabaseHealthArticles;
  if (!supabaseHealthArticlesPromise) {
    supabaseHealthArticlesPromise = fetchSupabaseHealthArticles()
      .then((articles) => {
        supabaseHealthArticles = articles;
        supabaseHealthArticlesLoaded = true;
        return articles;
      })
      .catch((error) => {
        console.warn("Supabase articles unavailable, using static health articles.", error);
        supabaseHealthArticlesLoaded = true;
        return [];
      });
  }

  const articles = await supabaseHealthArticlesPromise;
  if (rerender && articles.length) {
    const current = routeSlugFromLocation() || "home";
    const currentBase = current.split("?")[0];
    if (currentBase === "health" || currentBase === "search") renderPage(current);
  }
  return articles;
}

function renderMarkdownContent(content = "") {
  const rawContent = String(content || "").trim();
  if (/<\/?(p|h2|h3|figure|img|ul|ol|li|strong|b|em|i|span|a|br|iframe|video)[\s>]/i.test(rawContent)) {
    return sanitizeArticleHtml(rawContent);
  }

  const lines = String(content || "").split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${escapeHTML(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(`<h3>${escapeHTML(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(`<h2>${escapeHTML(trimmed.slice(3))}</h2>`);
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return blocks.length ? blocks.join("") : "<p>文章內容準備中。</p>";
}

function sanitizeArticleHtml(html = "") {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  const allowedTags = new Set(["P", "BR", "H2", "H3", "UL", "OL", "LI", "STRONG", "B", "EM", "I", "SPAN", "FONT", "A", "FIGURE", "FIGCAPTION", "IMG", "IFRAME", "VIDEO", "SOURCE"]);
  const allowedAttrs = {
    A: new Set(["href", "target", "rel"]),
    IMG: new Set(["src", "alt", "data-image-usage", "data-focal-point"]),
    IFRAME: new Set(["src", "title", "loading", "allow", "allowfullscreen", "referrerpolicy"]),
    VIDEO: new Set(["src", "controls", "preload", "poster"]),
    SOURCE: new Set(["src", "type"]),
    SPAN: new Set(["style"]),
    FONT: new Set(["color", "size"]),
    FIGURE: new Set(["class"]),
    P: new Set(["style"]),
    H2: new Set(["style"]),
    H3: new Set(["style"])
  };

  const walk = (node) => {
    [...node.children].forEach((child) => {
      if (!allowedTags.has(child.tagName)) {
        child.replaceWith(document.createTextNode(child.textContent || ""));
        return;
      }

      [...child.attributes].forEach((attr) => {
        const tagAttrs = allowedAttrs[child.tagName] || new Set();
        const isSafeStyle = attr.name === "style" && /^(color|font-size|background-color)\s*:/i.test(attr.value);
        if (!tagAttrs.has(attr.name) && !isSafeStyle) {
          child.removeAttribute(attr.name);
          return;
        }
        if ((attr.name === "href" || attr.name === "src") && /^(javascript|data:text)/i.test(attr.value)) {
          child.removeAttribute(attr.name);
        }
      });

      if (child.tagName === "A") {
        child.setAttribute("rel", "noopener");
        if (/^https?:\/\//i.test(child.getAttribute("href") || "")) child.setAttribute("target", "_blank");
      }
      if (child.tagName === "FIGURE") child.classList.add("article-inline-image");
      walk(child);
    });
  };

  walk(template.content);
  return template.innerHTML || "<p>文章內容準備中。</p>";
}

function normalizeSupabaseArticlePage(article, category, cover) {
  const publishedAt = article.published_at || article.updated_at;
  const video = getArticleVideoData(article.content_json || {});
  const rewrite = getArticleRewriteFields(article.slug);
  const summary = rewrite?.summary || (Array.isArray(article.summary_points) ? article.summary_points : []);
  const content = rewrite?.content || article.content || "";
  return {
    slug: article.slug,
    category: category?.display_label || category?.name || "照顧知識",
    categorySlug: category?.slug || categorySlug(category?.name || "照顧知識"),
    title: article.title || "未命名文章",
    subtitle: article.subtitle || rewrite?.dek || article.excerpt || "",
    excerpt: rewrite?.dek || article.excerpt || article.subtitle || "",
    image: getHealthArticleImage({ ...article, image: rewrite?.image || article.content_json?.image_url || article.content_json?.image || article.image, category: category?.display_label || category?.name || "照顧知識", categorySlug: category?.slug || categorySlug(category?.name || "照顧知識") }, cover),
    imageUsage: cover?.image_usage || "article_cover",
    focalPoint: cover?.focal_point || "center",
    videoUrl: video.url,
    videoEmbedUrl: video.embedUrl,
    videoProvider: video.provider,
    videoType: video.type,
    videoDuration: video.duration,
    videoLabel: video.label,
    videoCaption: video.caption,
    author: article.author_name || "歲悅照顧編輯部",
    date: formatArticleDate(publishedAt),
    tags: Array.isArray(article.tags) ? article.tags : [],
    summary,
    readingMinutes: article.reading_minutes || rewrite?.readingMinutes,
    difficulty: article.difficulty || "",
    targetAudience: article.target_audience || rewrite?.targetAudience || "",
    relatedService: article.related_service || "",
    ctaText: article.cta_text || article.content_json?.cta_text || rewrite?.cta || "",
    ctaUrl: article.cta_url || article.content_json?.cta_url || "",
    sourceName: article.source_name || article.content_json?.source_name || rewrite?.sourceName || "",
    sourceUrl: article.source_url || article.content_json?.source_url || rewrite?.sourceUrl || "",
    faq: rewrite?.faq || (Array.isArray(article.faq_json) ? article.faq_json : []),
    relatedSlugs: Array.isArray(article.content_json?.related_slugs) ? article.content_json.related_slugs : [],
    content,
    inlineImages: rewrite?.inlineImages || [],
    warning: rewrite?.warning,
    checklists: rewrite?.checklists || [],
    tables: rewrite?.tables || [],
    slides: rewrite?.slides || (Array.isArray(article.content_json?.slides) ? article.content_json.slides : []),
    visualFormat: rewrite?.visualFormat || article.content_json?.visual_format || "",
    references: rewrite?.references || [],
    contentRevision: rewrite?.contentRevision || "",
    seoTitle: article.seo_title || "",
    seoDescription: article.seo_description || ""
  };
}

async function fetchSupabaseArticlePage(slug) {
  if (!supabase || !slug) return null;
  if (supabaseArticlePageCache.has(slug)) return supabaseArticlePageCache.get(slug);

  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      id,
      category_id,
      slug,
      title,
      subtitle,
      excerpt,
      content,
      content_json,
      content_type,
      cover_image_id,
      author_name,
      tags,
      summary_points,
      reading_minutes,
      difficulty,
      target_audience,
      related_service,
      source_name,
      source_url,
      canonical_url,
      faq_json,
      cta_text,
      cta_url,
      status,
      is_enabled,
      published_at,
      updated_at,
      seo_title,
      seo_description
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_enabled", true)
    .maybeSingle();

  if (error) throw error;
  if (!article) {
    supabaseArticlePageCache.set(slug, null);
    return null;
  }

  const [categoryResult, coverResult] = await Promise.all([
    article.category_id
      ? supabase
          .from("article_categories")
          .select("id, name, display_label, slug, type, section_key")
          .eq("id", article.category_id)
          .eq("is_enabled", true)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    article.cover_image_id
      ? supabase
          .from("media")
          .select("id, public_url, alt_text, file_name, image_usage, focal_point")
          .eq("id", article.cover_image_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);

  if (categoryResult.error) throw categoryResult.error;
  if (coverResult.error) throw coverResult.error;

  const normalized = normalizeSupabaseArticlePage(article, categoryResult.data, coverResult.data);
  supabaseArticlePageCache.set(slug, normalized);
  return normalized;
}

function getSectionContent(section) {
  return section?.content_json && typeof section.content_json === "object" ? section.content_json : {};
}

function setCmsText(root, field, value) {
  if (value === undefined || value === null || value === "") return;
  root.querySelectorAll(`[data-cms-field="${field}"]`).forEach((element) => {
    element.textContent = value;
  });
}

function setCmsImage(root, field, url, alt = "") {
  if (!url) return;
  const normalizedUrl = fastAssetUrl(url);
  const content = root.__cmsContent || {};
  const usage = content.image_usage || "card";
  const focalPoint = content.focal_point || "center";
  const fit = content.image_fit || "";
  root.querySelectorAll(`[data-cms-field="${field}"]`).forEach((element) => {
    element.dataset.imageUsage = usage;
    element.dataset.focalPoint = focalPoint;
    element.style.setProperty("--cms-image-position", focalPointToObjectPosition(focalPoint));
    element.style.setProperty("--cms-image-fit", imageUsageToFit(usage, fit));
    const ratio = imageUsageToAspectRatio(usage);
    if (ratio !== "auto") element.style.setProperty("--cms-image-ratio", ratio);
    if (element.tagName === "IMG") {
      element.src = contentImageUrl(normalizedUrl);
      if (alt) element.alt = alt;
    } else {
      element.style.backgroundImage = `url("${normalizedUrl}")`;
    }
  });
}

function setCmsButton(root, buttonName, text, href) {
  const button = root.querySelector(`[data-cms-button="${buttonName}"]`);
  if (!button) return;
  if (text) button.textContent = text;
  if (href) button.setAttribute("href", href);
}

function findCmsSectionRoot(sectionKey) {
  return [...document.querySelectorAll("[data-cms-section]")]
    .find((section) => section.dataset.cmsSection === sectionKey) || null;
}

function isStaticHomeHeroSection(section) {
  return Boolean(section?.dataset?.cmsSection === "hero" && section.closest?.("#home"));
}

function applyCmsSection(section) {
  const root = findCmsSectionRoot(section.section_key);
  if (!root) return;

  const content = getSectionContent(section);
  const sectionKey = root.dataset.cmsSection || "";
  const normalizeCmsValue = (field, value) => {
    if (!value || typeof value !== "string") return value;
    if (sectionKey === "hero" && field === "eyebrow" && value === "Professional Care Network") {
      return "AI Empowered Suiyuecare System";
    }
    if (sectionKey === "contact") {
      const contactCopy = {
        Contact: "Contact Us",
        "先留下需求，讓我們協助判斷適合的照顧方向。": "把需求交給歲悅，讓專人陪你釐清下一步。",
        "服務諮詢、課程報名、人才招募、土地合作與投資洽談，都可以從這裡開始。": "不論是長照服務、課程報名、人才加入、土地合作或投資洽談，我們會依照你的需求安排合適窗口主動聯繫。",
        "不論是服務諮詢、課程報名、場地合作、人才加入或投資洽談，都可以從這裡開始。": "不論是長照服務、課程報名、人才加入、土地合作或投資洽談，我們會依照你的需求安排合適窗口主動聯繫。"
      };
      return contactCopy[value] || value;
    }
    return value;
  };
  root.__cmsContent = content;
  root.hidden = false;
  root.dataset.cmsLoaded = "true";

  setCmsText(root, "eyebrow", normalizeCmsValue("eyebrow", content.eyebrow));
  setCmsText(root, "title", normalizeCmsValue("title", section.title || content.title));
  setCmsText(root, "subtitle", normalizeCmsValue("subtitle", content.subtitle));
  setCmsText(root, "body", normalizeCmsValue("body", section.body || content.body));

  if (content.fields && typeof content.fields === "object") {
    Object.entries(content.fields).forEach(([field, value]) => setCmsText(root, field, normalizeCmsValue(field, value)));
  }

  const imageUrl = content.image_url || content.background_image_url;
  setCmsImage(root, "image", imageUrl, content.image_alt || section.title || "");
  setCmsImage(root, "background_image", content.background_image_url || imageUrl, content.image_alt || section.title || "");

  setCmsButton(root, "primary", content.button_text, content.button_href);
  setCmsButton(root, "secondary", content.secondary_button_text, content.secondary_button_href);
}

function applyCmsPage(page, sections) {
  setRouteSeo(page.slug || "home", {
    title: page.seo_title || (page.title ? `${page.title}｜歲悅長照集團` : undefined),
    description: page.seo_description || undefined
  });

  const pageContent = getSectionContent(page);
  const managedSections = Array.isArray(pageContent.managed_sections) ? pageContent.managed_sections : [];
  const isCmsManaged = sections.length > 0 || pageContent.cms_mode === true || managedSections.length > 0;
  if (!isCmsManaged) return;

  const sectionsToHide = (managedSections.length
    ? managedSections.map(findCmsSectionRoot).filter(Boolean)
    : [...document.querySelectorAll("[data-cms-section]")])
      .filter((section) => !(page.slug === "home" && isStaticHomeHeroSection(section)));

  sectionsToHide.forEach((section) => {
    section.hidden = true;
    section.dataset.cmsLoaded = "false";
  });
  sections
    .filter((section) => !(page.slug === "home" && section.section_key === "hero"))
    .forEach(applyCmsSection);
}

async function loadSupabasePageContent(slug) {
  if (!supabase) return;

  try {
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, slug, title, seo_title, seo_description, content_json")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("is_enabled", true)
      .maybeSingle();

    if (pageError) throw pageError;
    if (!page) return;

    const { data: sections, error: sectionsError } = await supabase
      .from("page_sections")
      .select("id, section_key, title, body, image_id, content_json, sort_order")
      .eq("page_id", page.id)
      .eq("status", "published")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (sectionsError) throw sectionsError;
    applyCmsPage(page, sections || []);
  } catch (error) {
    console.warn(`Supabase page content unavailable for ${slug}.`, error);
  }
}

function renderCmsDetailPage(page, sections = []) {
  const pageContent = getSectionContent(page);
  const heroImage = fastAssetUrl(pageContent.hero_image_url || sections.find((section) => getSectionContent(section).image_url)?.content_json?.image_url || fallbackImages.serviceHero);
  const heroAlt = pageContent.hero_image_alt || page.title || "歲悅長照頁面主視覺";
  const primaryText = pageContent.button_text || "聯絡諮詢";
  const primaryHref = pageContent.button_href || "#contact";

  return `
    <article class="cms-detail-page">
      <section class="service-detail-hero">
        <div>
          <p class="eyebrow">${escapeHTML(pageContent.eyebrow || page.menu_label || "Suiyuecare")}</p>
          <h1>${escapeHTML(page.hero_title || page.title)}</h1>
          <p>${escapeHTML(page.hero_body || page.subtitle || pageContent.body || page.seo_description || "")}</p>
          <div class="hero-actions">
            <a class="primary-button" href="${escapeHTML(primaryHref)}">${escapeHTML(primaryText)}</a>
            <a class="secondary-button" href="#home">回到首頁</a>
          </div>
        </div>
        <figure>
          <img src="${escapeHTML(heroImage)}" alt="${escapeHTML(heroAlt)}"${imageStyleAttr({ usage: pageContent.image_usage || "service_hero", focalPoint: pageContent.focal_point || "center" })} />
        </figure>
      </section>
      <section class="cms-section-stack">
        ${sections.map((section, index) => {
          const content = getSectionContent(section);
          const image = contentImageUrl(content.image_url || content.background_image_url || "");
          const items = Array.isArray(content.items) ? content.items : [];
          return `
            <article class="cms-managed-section ${image ? "has-image" : ""}">
              ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(content.image_alt || section.title || page.title)}"${imageStyleAttr({ usage: content.image_usage || "card", focalPoint: content.focal_point || "center" })} />` : ""}
              <div>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <p class="eyebrow">${escapeHTML(content.eyebrow || section.eyebrow || section.section_key)}</p>
                <h2>${escapeHTML(section.title || content.title || "")}</h2>
                <p>${escapeHTML(section.body || content.body || section.subtitle || "")}</p>
                ${items.length ? `<ul>${items.map((item) => `<li>${escapeHTML(item.title || item)}</li>`).join("")}</ul>` : ""}
                ${content.button_href ? `<a href="${escapeHTML(content.button_href)}">${escapeHTML(content.button_text || "閱讀更多")}</a>` : ""}
              </div>
            </article>
          `;
        }).join("")}
      </section>
    </article>
  `;
}

async function loadSupabaseDetailPage(slug) {
  if (!supabase || !slug || slug === "home") return;

  try {
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, slug, title, subtitle, menu_label, hero_title, hero_body, seo_title, seo_description, content_json")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("is_enabled", true)
      .maybeSingle();

    if (pageError) throw pageError;
    if (!page) return;

    const { data: sections, error: sectionsError } = await supabase
      .from("page_sections")
      .select("id, section_key, title, subtitle, eyebrow, body, image_id, content_json, sort_order")
      .eq("page_id", page.id)
      .eq("status", "published")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (sectionsError) throw sectionsError;
    const pageContent = getSectionContent(page);
    const shouldOverride = pageContent.cms_mode === true || (sections || []).length > 0;
    if (!shouldOverride || routeSlugFromLocation() !== slug) return;

    setRouteSeo(page.slug || slug, {
      title: page.seo_title || (page.title ? `${page.title}｜歲悅長照集團` : undefined),
      description: page.seo_description || undefined
    });
    pageView.innerHTML = renderCmsDetailPage(page, sections || []);
  } catch (error) {
    console.warn(`Supabase detail page unavailable for ${slug}.`, error);
  }
}

const serviceTemplateSlugs = new Set([
  "software"
]);

const cmsEnhancedServiceSlugs = new Set([
  "home-care",
  "day-care",
  "community",
  "nursing",
  "migrant-training",
  "quality"
]);

const supabaseServiceFieldCache = new Map();

function getTemplateFieldValue(field) {
  if (!field) return "";
  if (field.field_type === "image") return fastAssetUrl(field.image?.public_url || field.text_value || "");
  if (field.field_type === "boolean") return Boolean(field.boolean_value);
  if (field.field_type === "number") return field.number_value ?? "";
  if (field.field_type === "json") return field.json_value;
  return field.text_value || "";
}

function mapTemplateFields(fields = []) {
  return fields.reduce((map, field) => {
    const current = map[field.field_key];
    const currentValue = getTemplateFieldValue(current);
    const nextValue = getTemplateFieldValue(field);
    const currentHasValue = Array.isArray(currentValue)
      ? currentValue.length > 0
      : currentValue !== "" && currentValue !== null && currentValue !== undefined && !(typeof currentValue === "object" && !Object.keys(currentValue || {}).length);
    const nextHasValue = Array.isArray(nextValue)
      ? nextValue.length > 0
      : nextValue !== "" && nextValue !== null && nextValue !== undefined && !(typeof nextValue === "object" && !Object.keys(nextValue || {}).length);
    if (currentHasValue && !nextHasValue) return map;
    if (current?.field_type === "image" && current.image?.public_url && !field.image?.public_url) return map;
    map[field.field_key] = field;
    return map;
  }, {});
}

function getTemplateText(fieldMap, key, fallback = "") {
  const value = getTemplateFieldValue(fieldMap[key]);
  if (Array.isArray(value) || typeof value === "object") return fallback;
  const resolved = value === "" || value === null || value === undefined ? fallback : String(value);
  return key.includes("image") ? fastAssetUrl(resolved) : resolved;
}

function getTemplateArray(fieldMap, key, fallback = []) {
  const value = getTemplateFieldValue(fieldMap[key]);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return fallback;
}

function renderTemplateCards(items, type = "feature") {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return "";
  if (type === "flow") {
    return `
      <div class="service-flow-track">
        ${list.map((item, index) => `
          <article>
            <b>${escapeHTML(item.step || item.number || String(index + 1).padStart(2, "0"))}</b>
            <h3>${escapeHTML(item.title || "")}</h3>
            <p>${escapeHTML(item.body || item.description || "")}</p>
          </article>
        `).join("")}
      </div>
    `;
  }
  return `
    <div class="service-highlight-grid">
      ${list.map((item, index) => `
        <article>
          <span>${escapeHTML(item.label || String(index + 1).padStart(2, "0"))}</span>
          <h3>${escapeHTML(item.title || "")}</h3>
          <p>${escapeHTML(item.body || item.description || "")}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderTemplateFaq(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return "";
  return `
    <div class="shareholder-faq service-template-faq">
      ${list.map((item, index) => `
        <details ${index === 0 ? "open" : ""}>
          <summary>${escapeHTML(item.question || item.title || "")}</summary>
          <p>${escapeHTML(item.answer || item.body || "")}</p>
        </details>
      `).join("")}
    </div>
  `;
}

function renderFixedServiceTemplate(slug, fields = []) {
  const fieldMap = mapTemplateFields(fields);
  const title = getTemplateText(fieldMap, "hero_title", "歲悅服務");
  const heroImage = getTemplateText(fieldMap, "hero_image", fallbackImages.serviceHero);
  const primaryText = getTemplateText(fieldMap, "primary_cta_text", "預約諮詢");
  const primaryUrl = getTemplateText(fieldMap, "primary_cta_url", "#contact");
  const secondaryText = getTemplateText(fieldMap, "secondary_cta_text", "查看服務據點");
  const secondaryUrl = getTemplateText(fieldMap, "secondary_cta_url", "#network");
  const featureCards = getTemplateArray(fieldMap, "feature_cards");
  const flowCards = getTemplateArray(fieldMap, "flow_cards");
  const enrollmentItems = getTemplateArray(fieldMap, "enrollment_items");
  const faqItems = getTemplateArray(fieldMap, "faq_items");

  return `
    <div class="service-detail-page service-template-page ${escapeHTML(slug)}-template-page">
      <section class="service-detail-hero ${escapeHTML(slug)}-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">${escapeHTML(getTemplateText(fieldMap, "hero_eyebrow", "Suiyuecare Service"))}</p>
          <h1>${escapeHTML(title)}</h1>
          <p>${escapeHTML(getTemplateText(fieldMap, "hero_body", ""))}</p>
          <div class="hero-actions">
            <a class="primary-button" href="${escapeHTML(primaryUrl)}">${escapeHTML(primaryText)}</a>
            <a class="secondary-button" href="${escapeHTML(secondaryUrl)}">${escapeHTML(secondaryText)}</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="${escapeHTML(heroImage)}" alt="${escapeHTML(title)}"${imageStyleAttr({ usage: "service_hero", focalPoint: getTemplateText(fieldMap, "hero_focal_point", "center") })} />
          <div>
            <span>${escapeHTML(getTemplateText(fieldMap, "hero_badge", "Suiyuecare Corps."))}</span>
            <strong>${escapeHTML(getTemplateText(fieldMap, "hero_card_title", title))}</strong>
          </div>
        </aside>
      </section>

      ${featureCards.length ? `
        <section class="service-detail-section">
          <div class="service-section-head">
            <p class="eyebrow">${escapeHTML(getTemplateText(fieldMap, "feature_eyebrow", "Care Focus"))}</p>
            <h2>${escapeHTML(getTemplateText(fieldMap, "feature_title", "服務特色"))}</h2>
            <span>${escapeHTML(getTemplateText(fieldMap, "feature_body", ""))}</span>
          </div>
          ${renderTemplateCards(featureCards)}
        </section>
      ` : ""}

      ${flowCards.length ? `
        <section class="service-detail-section">
          <div class="service-section-head">
            <p class="eyebrow">${escapeHTML(getTemplateText(fieldMap, "flow_eyebrow", "Service Flow"))}</p>
            <h2>${escapeHTML(getTemplateText(fieldMap, "flow_title", "服務流程"))}</h2>
            <span>${escapeHTML(getTemplateText(fieldMap, "flow_body", ""))}</span>
          </div>
          ${renderTemplateCards(flowCards, "flow")}
        </section>
      ` : ""}

      ${enrollmentItems.length ? `
        <section class="service-detail-section">
          <div class="service-section-head">
            <p class="eyebrow">${escapeHTML(getTemplateText(fieldMap, "enrollment_eyebrow", "Enrollment Checklist"))}</p>
            <h2>${escapeHTML(getTemplateText(fieldMap, "enrollment_title", "入托準備清單"))}</h2>
            <span>${escapeHTML(getTemplateText(fieldMap, "enrollment_body", "體檢完成後，請依長輩平時生活習慣準備以下用品。"))}</span>
          </div>
          ${renderTemplateCards(enrollmentItems)}
        </section>
      ` : ""}

      ${faqItems.length ? `
        <section class="service-detail-section">
          <div class="service-section-head">
            <p class="eyebrow">${escapeHTML(getTemplateText(fieldMap, "faq_eyebrow", "FAQ"))}</p>
            <h2>${escapeHTML(getTemplateText(fieldMap, "faq_title", "常見問題"))}</h2>
            <span>${escapeHTML(getTemplateText(fieldMap, "faq_body", "整理服務前最常被詢問的問題，協助你更快判斷下一步。"))}</span>
          </div>
          ${renderTemplateFaq(faqItems)}
        </section>
      ` : ""}

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">${escapeHTML(getTemplateText(fieldMap, "cta_eyebrow", "Contact"))}</p>
          <h2>${escapeHTML(getTemplateText(fieldMap, "cta_title", "讓歲悅協助你安排下一步"))}</h2>
          <p>${escapeHTML(getTemplateText(fieldMap, "cta_body", "留下需求，我們會由專人協助判斷適合的服務與合作方式。"))}</p>
        </div>
        <a class="primary-button" href="${escapeHTML(getTemplateText(fieldMap, "cta_button_url", "#contact"))}">${escapeHTML(getTemplateText(fieldMap, "cta_button_text", "聯絡我們"))}</a>
      </section>
    </div>
  `;
}

async function fetchSupabaseServiceFields(slug) {
  if (!supabase || !cmsEnhancedServiceSlugs.has(slug)) return [];
  if (supabaseServiceFieldCache.has(slug)) return supabaseServiceFieldCache.get(slug);
  const { data, error } = await supabase
    .from("page_template_fields")
    .select("template_key, field_key, field_label, field_type, text_value, number_value, boolean_value, json_value, sort_order, image:media!page_template_fields_image_id_fkey(id, public_url, alt_text, file_name)")
    .eq("page_slug", slug)
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const fields = data || [];
  supabaseServiceFieldCache.set(slug, fields);
  return fields;
}

function getCmsItemValue(item, keys = [], fallback = "") {
  if (Array.isArray(item)) {
    const indexMap = {
      label: 0,
      step: 0,
      number: 0,
      image: 0,
      title: 1,
      body: 2,
      copy: 2,
      description: 2,
      note: 2,
      fit: 2,
      answer: 1,
      question: 0
    };
    for (const key of keys) {
      const index = indexMap[key];
      if (index !== undefined && item[index] !== undefined) return item[index];
    }
    return fallback;
  }
  if (!item || typeof item !== "object") return fallback;
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
  }
  return fallback;
}

function setNodeText(root, selector, value) {
  if (value === "" || value === null || value === undefined) return;
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
}

function setNodeHref(root, selector, value) {
  if (value === "" || value === null || value === undefined) return;
  const node = root.querySelector(selector);
  if (node) node.setAttribute("href", value);
}

function applyServiceSectionHead(root, gridSelector, fieldMap, prefix) {
  const section = root.querySelector(gridSelector)?.closest(".service-detail-section");
  if (!section) return;
  setNodeText(section, ".service-section-head .eyebrow", getTemplateText(fieldMap, `${prefix}_eyebrow`, ""));
  setNodeText(section, ".service-section-head h2", getTemplateText(fieldMap, `${prefix}_title`, ""));
  setNodeText(section, ".service-section-head span", getTemplateText(fieldMap, `${prefix}_body`, ""));
}

function renderCmsHighlightGrid(items) {
  return items.map((item, index) => `
    <article>
      <span>${escapeHTML(getCmsItemValue(item, ["label", "step", "number"], String(index + 1).padStart(2, "0")))}</span>
      <h3>${escapeHTML(getCmsItemValue(item, ["title"], ""))}</h3>
      <p>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</p>
    </article>
  `).join("");
}

function renderCmsProblemGrid(items) {
  return items.map((item) => `
    <article>
      <h3>${escapeHTML(getCmsItemValue(item, ["title"], ""))}</h3>
      <p>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</p>
    </article>
  `).join("");
}

function renderCmsGallery(items) {
  return items.map((item) => {
    const title = getCmsItemValue(item, ["title"], "");
    const image = contentImageUrl(getCmsItemValue(item, ["image", "image_url", "url"], fallbackImageForText(title, fallbackImages.serviceModule)));
    return `
      <figure>
        <img src="${escapeHTML(image)}" alt="${escapeHTML(getCmsItemValue(item, ["alt", "image_alt"], title))}"${imageStyleAttr({ usage: "card", focalPoint: getCmsItemValue(item, ["focal_point"], "center") })} />
        <figcaption>
          <strong>${escapeHTML(title)}</strong>
          <span>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</span>
        </figcaption>
      </figure>
    `;
  }).join("");
}

function renderCmsProgramGrid(items) {
  return items.map((item) => `
    <article>
      <h3>${escapeHTML(getCmsItemValue(item, ["title"], ""))}</h3>
      <p>${escapeHTML(getCmsItemValue(item, ["body", "items", "copy", "description"], ""))}</p>
      <span>${escapeHTML(getCmsItemValue(item, ["fit", "note", "tag"], ""))}</span>
    </article>
  `).join("");
}

function renderCmsScenarioGrid(items) {
  return items.map((item) => `
    <article>
      <h3>${escapeHTML(getCmsItemValue(item, ["title"], ""))}</h3>
      <p>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</p>
      <small>${escapeHTML(getCmsItemValue(item, ["tag", "note", "fit"], ""))}</small>
    </article>
  `).join("");
}

function renderCmsFlowTrack(items) {
  return items.map((item, index) => `
    <article>
      <b>${escapeHTML(getCmsItemValue(item, ["step", "label", "number"], String(index + 1).padStart(2, "0")))}</b>
      <h3>${escapeHTML(getCmsItemValue(item, ["title"], ""))}</h3>
      <p>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</p>
    </article>
  `).join("");
}

function renderCmsFamilyBoard(items) {
  return items.map((item, index) => {
    if (index === 0) {
      return `
        <article>
          <p class="eyebrow">${escapeHTML(getCmsItemValue(item, ["eyebrow", "label"], "Family Communication"))}</p>
          <h2>${escapeHTML(getCmsItemValue(item, ["title"], ""))}</h2>
          <p>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</p>
        </article>
      `;
    }
    return `
      <article>
        <b>${escapeHTML(getCmsItemValue(item, ["label", "step", "number"], String(index).padStart(2, "0")))}</b>
        <h3>${escapeHTML(getCmsItemValue(item, ["title"], ""))}</h3>
        <p>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</p>
      </article>
    `;
  }).join("");
}

function renderCmsFaqList(items) {
  return items.map((item) => `
    <details>
      <summary>${escapeHTML(getCmsItemValue(item, ["question", "title"], ""))}</summary>
      <p>${escapeHTML(getCmsItemValue(item, ["answer", "body", "copy"], ""))}</p>
    </details>
  `).join("");
}

function applyCmsEnhancedServicePage(html, slug, fields = []) {
  if (!fields.length) return html;
  const fieldMap = mapTemplateFields(fields);
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const root = template.content;

  const title = getTemplateText(fieldMap, "hero_title", "");
  const body = getTemplateText(fieldMap, "hero_body", "");
  setNodeText(root, ".service-detail-hero .service-detail-copy .eyebrow", getTemplateText(fieldMap, "hero_eyebrow", ""));
  setNodeText(root, ".service-detail-hero .service-detail-copy h1", title);
  setNodeText(root, ".service-detail-hero .service-detail-copy > p:not(.eyebrow):not(.hero-slogan)", body);
  setNodeText(root, ".hero-actions .primary-button", getTemplateText(fieldMap, "primary_cta_text", ""));
  setNodeHref(root, ".hero-actions .primary-button", getTemplateText(fieldMap, "primary_cta_url", ""));
  setNodeText(root, ".hero-actions .secondary-button", getTemplateText(fieldMap, "secondary_cta_text", ""));
  setNodeHref(root, ".hero-actions .secondary-button", getTemplateText(fieldMap, "secondary_cta_url", ""));
  setNodeText(root, ".service-hero-card span", getTemplateText(fieldMap, "hero_badge", ""));
  setNodeText(root, ".service-hero-card strong", getTemplateText(fieldMap, "hero_card_title", ""));
  const heroImage = getTemplateText(fieldMap, "hero_image", "");
  const heroImageNode = root.querySelector(".service-hero-card img");
  if (heroImage && heroImageNode) {
    heroImageNode.setAttribute("src", fastAssetUrl(heroImage));
    heroImageNode.setAttribute("alt", getTemplateText(fieldMap, "hero_image_alt", title || heroImageNode.getAttribute("alt") || ""));
    heroImageNode.setAttribute("style", `object-position:${getTemplateText(fieldMap, "hero_focal_point", "center")};`);
  }

  const heroPoints = getTemplateArray(fieldMap, "hero_points");
  const heroPointsNode = root.querySelector(".homecare-hero-points");
  if (heroPoints.length && heroPointsNode) {
    heroPointsNode.innerHTML = heroPoints.map((item) => `
      <article><span>${escapeHTML(getCmsItemValue(item, ["label", "title"], ""))}</span><strong>${escapeHTML(getCmsItemValue(item, ["body", "copy", "description"], ""))}</strong></article>
    `).join("");
  }

  const featureCards = getTemplateArray(fieldMap, "feature_cards");
  if (featureCards.length) {
    const node = root.querySelector(".service-highlight-grid");
    if (node) node.innerHTML = renderCmsHighlightGrid(featureCards);
  }
  applyServiceSectionHead(root, ".service-highlight-grid", fieldMap, "feature");

  const painPoints = getTemplateArray(fieldMap, "pain_points");
  if (painPoints.length) {
    const node = root.querySelector(".homecare-problem-grid");
    if (node) node.innerHTML = renderCmsProblemGrid(painPoints);
  }
  applyServiceSectionHead(root, ".homecare-problem-grid", fieldMap, "pain");

  const sceneCards = getTemplateArray(fieldMap, "scene_cards");
  if (sceneCards.length) {
    const node = root.querySelector(".homecare-gallery");
    if (node) node.innerHTML = renderCmsGallery(sceneCards);
  }
  applyServiceSectionHead(root, ".homecare-gallery", fieldMap, "scene");

  const serviceItems = getTemplateArray(fieldMap, "service_items");
  if (serviceItems.length) {
    const node = root.querySelector(".community-program-grid");
    if (node) node.innerHTML = renderCmsProgramGrid(serviceItems);
  }
  applyServiceSectionHead(root, ".community-program-grid", fieldMap, "service");

  const scenarioCards = getTemplateArray(fieldMap, "scenario_cards");
  if (scenarioCards.length) {
    const node = root.querySelector(".homecare-scenario-grid");
    if (node) node.innerHTML = renderCmsScenarioGrid(scenarioCards);
  }
  applyServiceSectionHead(root, ".homecare-scenario-grid", fieldMap, "scenario");

  const flowCards = getTemplateArray(fieldMap, "flow_cards");
  if (flowCards.length) {
    const node = root.querySelector(".service-flow-track");
    if (node) node.innerHTML = renderCmsFlowTrack(flowCards);
  }
  applyServiceSectionHead(root, ".service-flow-track", fieldMap, "flow");

  const qualityCards = getTemplateArray(fieldMap, "quality_cards");
  if (qualityCards.length) {
    const node = root.querySelector(".homecare-quality-grid");
    if (node) node.innerHTML = renderCmsProblemGrid(qualityCards);
  }
  applyServiceSectionHead(root, ".homecare-quality-grid", fieldMap, "quality");

  const familyBoard = getTemplateArray(fieldMap, "family_board");
  if (familyBoard.length) {
    const node = root.querySelector(".homecare-family-board");
    if (node) node.innerHTML = renderCmsFamilyBoard(familyBoard);
  }

  const faqItems = getTemplateArray(fieldMap, "faq_items");
  if (faqItems.length) {
    const node = root.querySelector(".software-faq-list");
    if (node) node.innerHTML = renderCmsFaqList(faqItems);
  }
  applyServiceSectionHead(root, ".software-faq-list", fieldMap, "faq");

  setNodeText(root, ".service-cta-panel .eyebrow", getTemplateText(fieldMap, "cta_eyebrow", ""));
  setNodeText(root, ".service-cta-panel h2", getTemplateText(fieldMap, "cta_title", ""));
  setNodeText(root, ".service-cta-panel p:not(.eyebrow)", getTemplateText(fieldMap, "cta_body", ""));
  setNodeText(root, ".service-cta-panel .primary-button", getTemplateText(fieldMap, "cta_button_text", ""));
  setNodeHref(root, ".service-cta-panel .primary-button", getTemplateText(fieldMap, "cta_button_url", ""));

  if (title || body || heroImage) {
    setRouteSeo(slug, {
      title: title ? (title.includes("歲悅") ? title : `${title}｜歲悅長照集團`) : undefined,
      description: body || undefined,
      image: heroImage || undefined
    });
  }

  return template.innerHTML;
}

async function renderCmsEnhancedServicePageOnce(slug, fallbackRenderer) {
  const fallbackHtml = fallbackRenderer();
  setPageViewBusy(true);
  try {
    const fields = await fetchSupabaseServiceFields(slug);
    if (routeSlugFromLocation() !== slug) return;
    pageView.innerHTML = fields.length
      ? applyCmsEnhancedServicePage(fallbackHtml, slug, fields)
      : fallbackHtml;
    hydrateDayCareFeeGroups(pageView);
    hydrateNursingFeeGroups(pageView);
    setPageViewBusy(false);
  } catch (error) {
    console.warn(`Supabase enhanced service page unavailable for ${slug}.`, error);
    if (routeSlugFromLocation() !== slug) return;
    pageView.innerHTML = fallbackHtml;
    hydrateDayCareFeeGroups(pageView);
    hydrateNursingFeeGroups(pageView);
    setPageViewBusy(false);
  }
}

async function loadSupabaseServiceTemplatePage(slug) {
  if (!supabase || !serviceTemplateSlugs.has(slug)) return false;

  try {
    const { data, error } = await supabase
      .from("page_template_fields")
      .select("template_key, field_key, field_label, field_type, text_value, number_value, boolean_value, json_value, sort_order, image:media!page_template_fields_image_id_fkey(id, public_url, alt_text, file_name)")
      .eq("page_slug", slug)
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    if (!data?.some((field) => field.field_key === "hero_title")) return false;
    if (routeSlugFromLocation() !== slug) return true;
    const fieldMap = mapTemplateFields(data);
    const title = getTemplateText(fieldMap, "hero_title", routeSeoMap[slug]?.title || pages[slug]?.title || "歲悅服務");
    const body = getTemplateText(fieldMap, "hero_body", routeSeoMap[slug]?.description || pages[slug]?.intro || DEFAULT_SEO.description);
    const image = getTemplateText(fieldMap, "hero_image", DEFAULT_SEO.image);
    setRouteSeo(slug, {
      title: title.includes("歲悅") ? title : `${title}｜歲悅長照集團`,
      description: body,
      image
    });
    pageView.innerHTML = renderFixedServiceTemplate(slug, data);
    return true;
  } catch (error) {
    console.warn(`Supabase service template unavailable for ${slug}.`, error);
    return false;
  }
}

const recruitingTemplateSlugs = new Set(["talent", "land", "investor-recruiting"]);
const supabaseRecruitingPageCache = new Map();

async function fetchRecruitingMediaMap(items = []) {
  const imageIds = [...new Set(items.flatMap((item) => [item?.hero_image_id, item?.image_id]).filter(Boolean))];
  if (!imageIds.length) return new Map();
  const { data, error } = await supabase
    .from("media")
    .select("id, public_url, alt_text, file_name, image_usage, focal_point")
    .in("id", imageIds);
  if (error) throw error;
  return new Map((data || []).map((image) => [image.id, image]));
}

function attachRecruitingImage(item, mediaMap) {
  if (!item) return item;
  return {
    ...item,
    hero_image: mediaMap.get(item.hero_image_id) || item.hero_image || null,
    image: mediaMap.get(item.image_id) || item.image || null
  };
}

function normalizeRecruitingAssetUrl(url = "") {
  const normalized = contentImageUrl(url);
  if (location.protocol === "file:") return String(normalized).replace(/^\/assets\//, "assets/");
  return String(normalized).replace(/^assets\//, "/assets/");
}

const recruitingImageProfiles = [
  {
    pattern: /社群|媒體|行銷|內容|短影音|facebook|instagram|tiktok|菲律賓.*社群|social|marketing|media/i,
    image: "assets/migrant-recruit-04-communication-fast.jpg",
    label: "跨文化社群與內容製作",
    caption: "適合需要對外溝通、社群經營與內容企劃的職務。"
  },
  {
    pattern: /日照|日間照顧|日間照護|日照中心|萬華|day.?care/i,
    image: "assets/daycare-recruit-02-exercise-clear-display.jpg",
    label: "日照中心服務現場",
    caption: "以團體活動、生活支持與長輩互動為核心的日照職務。"
  },
  {
    pattern: /督導|服務督導|個案管理|個案服務|個管|協調員|家庭窗口|照顧計畫|a單位|aa01|aa02|派案|家訪|電訪|supervisor|case.?manager/i,
    image: "assets/homepage-batch/03-supervisor-care-plan-fast.jpg",
    label: "督導與個案管理",
    caption: "串接家庭、照服員與服務紀錄，讓照顧品質被穩定追蹤。"
  },
  {
    pattern: /居家照顧服務員|居家照顧員|居服員|居家服務員|照顧服務員|到宅|身體照顧|生活支持|caregiver|home.?care/i,
    image: "assets/homepage-batch/orange-polo-caregiver-clear-display.jpg",
    label: "居家照顧服務現場",
    caption: "到宅陪伴長輩與家庭，把照顧做得穩定、清楚、有紀錄。"
  },
  {
    pattern: /移工|外籍看護|廠工|培訓|課程|活動企劃|雇主安心|教學|菲律賓|migrant|training|course/i,
    image: "assets/migrant-recruit-01-classroom-fast.jpg",
    label: "移工培訓與課程活動",
    caption: "把照顧技能、溝通情境與課程活動整理成可學習的流程。"
  },
  {
    pattern: /品管|品質|教育訓練|內訓|教材|稽核|紀錄審查|改善|quality|audit/i,
    image: "assets/quality-recruit-02-training-clear-display.jpg",
    label: "教育品管與服務改善",
    caption: "把前線經驗整理成教材、稽核與改善節奏。"
  },
  {
    pattern: /人資|招募|面試|人才|hr|recruit/i,
    image: "assets/admin-recruit-01-hr-fast.jpg",
    label: "人資招募與人才支持",
    caption: "協助夥伴進到對的位置，也讓團隊穩定長大。"
  },
  {
    pattern: /行政|專案|投資人|財務|會計|總務|客服|營運|辦公室|公文|秘書|operations|admin|finance|project/i,
    image: "assets/admin-recruit-05-meeting-clear-display.jpg",
    label: "行政營運與專案協作",
    caption: "支援跨部門流程、資料整理與營運節奏，讓前線服務更穩。"
  }
];

function recruitingImageText(item = {}) {
  return [
    item?.page_slug,
    item?.department_slug,
    item?.opening_slug,
    item?.title,
    item?.subtitle,
    item?.summary,
    item?.employment_type,
    item?.location,
    item?.salary_text,
    item?.capacity_label,
    JSON.stringify(item?.duties || ""),
    JSON.stringify(item?.requirements || ""),
    JSON.stringify(item?.benefits || item?.support || ""),
    JSON.stringify(item?.metadata || {})
  ].filter(Boolean).join(" ");
}

function recruitingImagePriorityText(item = {}) {
  return [
    item?.title,
    item?.subtitle,
    item?.opening_slug,
    item?.department_slug,
    item?.employment_type
  ].filter(Boolean).join(" ");
}

function getRecruitingImageRule(text = "") {
  const normalized = String(text || "");
  return recruitingImageProfiles.find((profile) => profile.pattern.test(normalized));
}

function getRecruitingImageProfileForText(text = "", fallback = fallbackImages.recruiting, priorityText = "") {
  const matched = getRecruitingImageRule(priorityText) || getRecruitingImageRule(text);
  if (matched) return matched;
  const normalized = String(text || "");
  const image = fallbackImageForText(normalized, fallback);
  return {
    image,
    label: "歲悅工作情境",
    caption: "依職缺內容安排合適的團隊與服務現場。"
  };
}

function getRecruitingImageProfile(item, fallback = fallbackImages.recruiting) {
  const text = recruitingImageText(item);
  const profile = getRecruitingImageProfileForText(text, fallback, recruitingImagePriorityText(item));
  const explicitUrl = item?.image?.public_url || item?.hero_image?.public_url || item?.image_url || item?.hero_image_url;
  const fallbackSrc = normalizeRecruitingAssetUrl(profile.image || fallback);
  return {
    ...profile,
    src: normalizeRecruitingAssetUrl(explicitUrl || profile.image || fallback),
    fallbackSrc
  };
}

function getRecruitingImage(item, fallback = fallbackImages.recruiting) {
  return getRecruitingImageProfile(item, fallback).src;
}

function normalizeRecruitingList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

const talentRecruitingTabs = [
  ["job-list", "職位一覽"],
  ["benefits", "公司福利制度"],
  ["career-growth", "公司升遷發展"],
  ["organization", "公司組織圖"],
  ["department-mission", "部門使命"]
];

const talentCareerSteps = [
  ["0-3 個月", "新人陪跑", "完成基礎訓練、服務倫理、紀錄回報與安全照顧流程，由督導陪同熟悉第一線情境。"],
  ["3-6 個月", "穩定上線", "能獨立完成服務紀錄、家庭溝通與異常回報，並建立穩定服務品質。"],
  ["6-12 個月", "專業進階", "依部門選修失智照顧、復能陪伴、日照活動、移工培訓、行政營運等模組。"],
  ["12 個月以上", "帶教與管理", "通過評核後可成為帶教員、服務督導、內訓講師、品管幹部或部門管理人才。"]
];

const talentCareerTracks = [
  ["前線專業線", ["照顧服務員", "資深照服員", "照顧帶教員", "專科照顧師"]],
  ["督導管理線", ["服務督導助理", "居服督導", "資深督導", "區域督導"]],
  ["教育品管線", ["課務助教", "內訓講師", "品管專員", "教育品管主管"]],
  ["行政營運線", ["行政專員", "營運協調", "專案管理", "部門主管"]]
];

const talentPromotionCriteria = [
  ["服務品質", "服務紀錄完整、家屬回饋穩定、異常事件能即時回報與追蹤。"],
  ["專業能力", "完成核心訓練與進階照顧模組，能把照顧流程做得穩、做得細。"],
  ["團隊協作", "能與督導、行政、照服員、家屬共同解決問題，讓服務不中斷。"],
  ["帶教潛力", "能整理經驗、協助新人上線，把個人能力轉化成團隊能力。"]
];

const talentBenefitCategories = [
  {
    key: "learning",
    title: "學習成長",
    summary: "用津貼與課程把照顧能力補起來，讓新人和資深夥伴都能持續升級。",
    items: [
      {
        title: "教育訓練津貼",
        value: "4,000 元/年",
        tags: ["全體員工"],
        copy: "每年提供教育訓練津貼，支持外部課程、專業進修與在職學習。"
      },
      {
        title: "身障 / 失智課程",
        value: "20 小時免費上",
        tags: ["全體員工"],
        copy: "身障與失智照顧 20 小時課程由公司支持，協助夥伴補足現場照顧能力。"
      }
    ]
  },
  {
    key: "bonus",
    title: "獎金禮金",
    summary: "把固定禮金、年度獎金與表現獎勵分開呈現，知道哪些是固定支持、哪些依辦法核定。",
    items: [
      {
        title: "節慶禮金",
        value: "每節 800 元 + 禮盒",
        tags: ["全體員工"],
        copy: "端午與中秋每節提供 800 元禮金與禮盒。"
      },
      {
        title: "生日禮金",
        value: "1,000 元",
        tags: ["全體員工"],
        copy: "生日當月發放 1,000 元生日禮金。"
      },
      {
        title: "年終獎金",
        value: "依年終管理辦法核定",
        tags: ["依辦法核定"],
        copy: "年終獎金依公司年終管理辦法與年度營運、個人狀況核定。"
      },
      {
        title: "績效獎勵",
        value: "另案評核發放",
        tags: ["依辦法核定"],
        copy: "依個人表現與專案狀況另案評核發放。"
      },
      {
        title: "個案開案獎金",
        value: "2,000 元/案",
        tags: ["全體員工", "依辦法核定"],
        copy: "成功協助個案開案後，依公司制度發放 2,000 元開案獎金。"
      },
      {
        title: "照顧服務員介紹費",
        value: "6,000 元/人",
        tags: ["全體員工", "依辦法核定"],
        copy: "成功介紹照顧服務員加入團隊，符合制度條件後發放 6,000 元介紹費。"
      },
      {
        title: "留任獎金",
        value: "最高 5,000 元",
        tags: ["照服員適用", "依辦法核定"],
        copy: "照服員滿 1 年 1,000 元、滿 2 年 2,000 元，依此類推最高至 5,000 元。"
      }
    ]
  },
  {
    key: "insurance",
    title: "保險保障",
    summary: "基礎保險與照顧現場需要的責任保障一次看清楚。",
    items: [
      {
        title: "勞健保及勞退",
        value: "每三個月檢視與調整",
        tags: ["全體員工"],
        copy: "勞保、健保與勞退每三個月檢視與調整，確保基礎保障跟上工作狀態。"
      },
      {
        title: "健康檢查",
        value: "每人每年 1 次",
        tags: ["全體員工"],
        copy: "每人每年安排一次健康檢查，協助夥伴掌握自己的身體狀態。"
      },
      {
        title: "長照機構責任險",
        value: "公司全額負擔",
        tags: ["全體員工"],
        copy: "由公司全額負擔，支援長照服務場域的責任保障。"
      },
      {
        title: "僱主補償責任險",
        value: "公司全額負擔",
        tags: ["全體員工"],
        copy: "由公司全額負擔，補足工作風險相關保障。"
      },
      {
        title: "團體意外險",
        value: "公司全額負擔",
        tags: ["全體員工"],
        copy: "公司提供團體意外險，增加工作與生活中的基本安全網。"
      },
      {
        title: "照顧服務員責任險",
        value: "公司全額負擔",
        tags: ["照服員適用"],
        copy: "照服員適用，由公司全額負擔，協助第一線夥伴安心服務。"
      }
    ]
  },
  {
    key: "flexibility",
    title: "工作彈性",
    summary: "遇到補班日與颱風日，用遠距安排降低通勤負擔與安全風險。",
    items: [
      {
        title: "補班日遠距辦公",
        value: "補班日適用",
        tags: ["全體員工"],
        copy: "補班日採遠距辦公安排，降低額外通勤壓力。"
      },
      {
        title: "颱風日遠距辦公",
        value: "颱風日適用",
        tags: ["全體員工"],
        copy: "颱風日採遠距辦公安排，以夥伴安全為優先。"
      }
    ]
  },
  {
    key: "family-care",
    title: "家庭照顧支持",
    summary: "公司本身做長照，也把照顧支持延伸到夥伴家人。",
    items: [
      {
        title: "家庭照顧假",
        value: "每年 7 天",
        tags: ["全體員工"],
        copy: "每年提供 7 天家庭照顧假，當家人需要臨時照顧支持時，讓夥伴能有清楚可用的請假安排。"
      },
      {
        title: "自家人使用長照服務",
        value: "部分負擔減免",
        tags: ["全體員工", "依辦法核定"],
        copy: "員工家屬使用長照服務可享部分負擔減免，依員工家屬照護福利管理辦法辦理。"
      }
    ]
  },
  {
    key: "future",
    title: "生活與未來",
    summary: "把團隊生活、公司成長與 AI 工具支持放在一起，呈現歲悅的長期工作環境。",
    items: [
      {
        title: "國內、國外旅遊",
        value: "團隊旅遊支持",
        tags: ["全體員工"],
        copy: "提供國內與國外旅遊相關安排，讓團隊有一起充電與交流的時間。"
      },
      {
        title: "IPO 股份分配",
        value: "上市前發放股份",
        tags: ["依辦法核定"],
        copy: "公司上市前將發放股份予員工，依歲悅集團股利分配管理辦法辦理。"
      },
      {
        title: "AI 工具使用支持",
        value: "工具使用支持",
        tags: ["全體員工"],
        copy: "公司提供 ChatGPT、Claude Code、Gemini 等 AI 軟體使用支持，協助行政、企劃與服務流程提效。"
      }
    ]
  }
];

const talentCaregiverExclusiveBenefits = [
  {
    title: "缺工獎勵",
    value: "最高 108,000 元",
    tags: ["僅限照顧服務員", "依申請資格辦理"],
    copy: "符合申請資格的照顧服務員可申請缺工獎勵，最高 108,000 元。"
  },
  {
    title: "留任獎金",
    value: "滿 1 年 1,000 元，逐年增加最高 5,000 元",
    tags: ["照服員適用", "依辦法核定"],
    copy: "照服員滿 1 年 1,000 元、滿 2 年 2,000 元，依此類推，最高至 5,000 元。"
  },
  {
    title: "照顧服務員責任險",
    value: "公司全額負擔",
    tags: ["照服員適用"],
    copy: "第一線照服員適用，協助服務現場有更完整的責任保障。"
  },
  {
    title: "照服員工作包",
    value: "到職提供",
    tags: ["照服員適用"],
    copy: "內含移位腰帶、護腰、背包、口罩、手套、酒精、名牌、版夾與筆，讓第一線服務一開始就有完整裝備。"
  }
];

const talentBenefitStationMeta = {
  learning: {
    icon: "book-open-check",
    tone: "sky",
    image: "assets/benefit-explorer/learning-training.jpg"
  },
  bonus: {
    icon: "gift",
    tone: "orange",
    image: "assets/benefit-explorer/bonus-recognition.jpg"
  },
  insurance: {
    icon: "shield-check",
    tone: "green",
    image: "assets/benefit-explorer/insurance-care.jpg"
  },
  flexibility: {
    icon: "cloud-sun",
    tone: "sky",
    image: "assets/benefit-explorer/flexible-work.jpg"
  },
  "family-care": {
    icon: "heart-handshake",
    tone: "pink",
    image: "assets/benefit-explorer/family-care.jpg"
  },
  future: {
    icon: "rocket",
    tone: "orange",
    image: "assets/benefit-explorer/future-team.jpg"
  },
  "caregiver-exclusive": {
    icon: "backpack",
    tone: "green",
    image: "assets/benefit-explorer/caregiver-kit.jpg"
  }
};

const talentOrgPillars = [
  ["營運管理中心", "人資、行政、客服、財務與專案管理，負責讓制度、資源與日常流程穩定運作。"],
  ["照顧服務體系", "居家照顧、日間照顧、護理復能與社區服務，負責把照顧交付到每個家庭與長輩身邊。"],
  ["教育品管與人才發展", "新人訓練、內訓教材、服務稽核與升遷培力，負責讓專業能力持續長出來。"]
];

const defaultTalentMissionDepartments = [
  {
    department_slug: "home-care-team",
    title: "居家照顧部門",
    description: "到長輩熟悉的家中提供照顧，讓安全、尊嚴與家屬安心都被穩定承接。",
    image_url: "assets/homepage-batch/care-home-greeting-clear.jpg",
    highlights: ["到宅服務", "督導陪跑", "家屬溝通"]
  },
  {
    department_slug: "day-care-team",
    title: "日間照顧部",
    description: "陪長輩白天有規律作息、活動參與、共餐與社交，也讓家庭有喘息空間。",
    image_url: "assets/daycare-recruit-02-exercise-clear.jpg",
    highlights: ["團體照顧", "活動帶領", "生活支持"]
  },
  {
    department_slug: "quality-team",
    title: "教學品管部",
    description: "把前線經驗整理成教材、稽核與改善流程，讓服務品質可以被複製。",
    image_url: "assets/quality-recruit-02-training-clear-display.jpg",
    highlights: ["教育訓練", "品質稽核", "改善專案"]
  },
  {
    department_slug: "admin-team",
    title: "行政部",
    description: "支援營運、人資、財務、總務與投資人關係，讓前線照顧能穩定運作。",
    image_url: "assets/homepage-batch/04-admin-team-office-fast.jpg",
    highlights: ["人資招募", "營運調度", "跨部門協作"]
  }
];

function talentPanelId(key) {
  return `talent-panel-${key}`;
}

function talentTabId(key) {
  return `talent-tab-${key}`;
}

function renderTalentTabNav(activeKey = "job-list") {
  return `
    <nav class="career-tabs recruiting-experience-tabs" role="tablist" aria-label="人才招募分頁">
      ${talentRecruitingTabs.map(([key, label]) => `
        <button
          class="${key === activeKey ? "active" : ""}"
          id="${escapeHTML(talentTabId(key))}"
          type="button"
          role="tab"
          aria-selected="${key === activeKey ? "true" : "false"}"
          aria-controls="${escapeHTML(talentPanelId(key))}"
          tabindex="${key === activeKey ? "0" : "-1"}"
          data-career-tab="${escapeHTML(key)}"
        >${escapeHTML(label)}</button>
      `).join("")}
    </nav>
  `;
}

function renderTalentTabPanel(key, content, activeKey = "job-list") {
  const isActive = key === activeKey;
  return `
    <section
      class="career-tab-panel talent-tab-panel ${isActive ? "active" : ""}"
      id="${escapeHTML(talentPanelId(key))}"
      role="tabpanel"
      aria-labelledby="${escapeHTML(talentTabId(key))}"
      data-career-panel="${escapeHTML(key)}"
      ${isActive ? "" : "hidden"}
    >
      ${content}
    </section>
  `;
}

function renderTalentPanelLead(eyebrow, title, copy) {
  return `
    <div class="career-section-head talent-panel-head">
      <p class="eyebrow">${escapeHTML(eyebrow)}</p>
      <h2>${escapeHTML(title)}</h2>
      <span>${escapeHTML(copy)}</span>
    </div>
  `;
}

function renderRecruitingHero(page) {
  const fallback = page.page_slug === "investor-recruiting" ? fallbackImages.investor : fallbackImages.recruiting;
  const image = heroImageForViewport(getRecruitingImage(page, fallback));
  const focalPoint = focalPointToObjectPosition(page.metadata?.focal_point || "center");
  const heroLabel = page.hero_badge || page.subtitle || page.title || "Suiyuecare Careers";
  const contactNeed = page.page_slug === "talent" ? "人才招募" : page.page_slug === "land" ? "土地合作" : "投資洽談";
  const contactMessage = page.page_slug === "talent"
    ? "我想了解歲悅長照職缺或投遞應徵資料，請協助安排招募窗口聯繫。"
    : page.page_slug === "land"
      ? "我想提供土地或空間合作資料，請協助評估基地條件、服務半徑、合作模式與下一步需要準備的資料。"
      : "我想了解歲悅投資合作，請協助安排投資人窗口，說明公司簡介、展店模型、營運進度與合作架構。";
  const secondaryHref = page.secondary_cta_url || "#contact";
  const secondaryText = page.secondary_cta_text || (page.page_slug === "talent" ? "留下應徵資料" : page.page_slug === "land" ? "提供基地資料" : "預約投資洽談");
  const secondaryContactAttrs = secondaryHref.includes("#contact")
    ? ` data-contact-need="${escapeHTML(contactNeed)}" data-contact-message="${escapeHTML(contactMessage)}"`
    : "";
  return `
    <section class="hero service-detail-hero one-minute-service-hero recruiting-cms-hero ${escapeHTML(page.page_slug)}-recruiting-hero">
      <div
        class="hero-bg"
        style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(image)}'); background-position: ${escapeHTML(focalPoint)};"
        aria-hidden="true"
      ></div>
      <div class="hero-copy service-detail-copy">
        <p class="eyebrow">${escapeHTML(page.eyebrow || "Recruiting")}</p>
        <h1>${escapeHTML(page.title || "")}</h1>
        <p class="hero-slogan">${escapeHTML(heroLabel)}</p>
        <p>${escapeHTML(page.body || page.subtitle || "")}</p>
        <div class="hero-actions">
          <a class="primary-button" href="${escapeHTML(page.primary_cta_url || "#recruiting-openings")}">${escapeHTML(page.primary_cta_text || "查看內容")}</a>
          <a class="secondary-button" href="${escapeHTML(secondaryHref)}"${secondaryContactAttrs}>${escapeHTML(secondaryText)}</a>
        </div>
      </div>
    </section>
  `;
}

function renderRecruitingDepartmentTabs(departments) {
  if (!departments.length) return "";
  return `
    <nav class="career-tabs recruiting-cms-tabs" aria-label="招募部門分頁">
      ${departments.map((department, index) => `
        <button class="${index === 0 ? "active" : ""}" type="button" data-career-tab="${escapeHTML(department.department_slug)}">${escapeHTML(department.title)}</button>
      `).join("")}
    </nav>
  `;
}

function renderRecruitingDepartmentPanel(page, department, openings, index) {
  const image = getRecruitingImage(department, fallbackImages.recruiting);
  const highlights = normalizeRecruitingList(department.highlights);
  const gallery = normalizeRecruitingList(department.gallery);
  return `
    <section class="career-tab-panel ${index === 0 ? "active" : ""}" data-career-panel="${escapeHTML(department.department_slug)}">
      <div class="homecare-recruit recruiting-cms-department">
        <section class="career-hero">
          <div class="service-detail-copy">
            <p class="eyebrow">${escapeHTML(department.eyebrow || page.eyebrow || "Recruiting")}</p>
            <h2>${escapeHTML(department.title)}</h2>
            <p>${escapeHTML(department.description || "")}</p>
            ${highlights.length ? `
              <div class="career-hero-points">
                ${highlights.map((item) => `<span>${escapeHTML(item.title || item)}</span>`).join("")}
              </div>
            ` : ""}
          </div>
          <figure class="career-dept-image">
            <img src="${escapeHTML(image)}" alt="${escapeHTML(department.title)}" />
            <figcaption>${escapeHTML(department.metadata?.caption || department.title)}</figcaption>
          </figure>
        </section>

        ${gallery.length ? `
          <section class="homecare-gallery recruiting-cms-gallery" aria-label="${escapeHTML(department.title)}工作情境">
            ${gallery.map((item) => `
              <figure>
                <img src="${escapeHTML(normalizeRecruitingAssetUrl(item.image || item.url || image))}" alt="${escapeHTML(item.caption || department.title)}" />
                <figcaption>${escapeHTML(item.caption || "")}</figcaption>
              </figure>
            `).join("")}
          </section>
        ` : ""}

        <section class="homecare-role-section" id="${index === 0 ? "career-openings" : ""}">
          <div class="career-section-head compact">
            <p class="eyebrow">Open Roles</p>
            <h2>${escapeHTML(department.title)}招募卡片</h2>
            <span>選擇想了解的職缺或合作方向，留下資料後由合適窗口協助回覆。</span>
          </div>
          ${renderRecruitingOpeningGrid(page, department, openings)}
        </section>
      </div>
    </section>
  `;
}

function renderRecruitingOpeningGrid(page, department, openings) {
  if (!openings.length) return `<div class="health-empty-state"><h2>目前尚未開放卡片</h2><p>可以先留下需求，我們會依照你的方向安排合適窗口回覆。</p></div>`;
  return `
    <div class="homecare-role-grid recruiting-opening-grid">
      ${openings.map((opening, index) => renderRecruitingOpeningCard(page, department, opening, index)).join("")}
    </div>
  `;
}

function renderRecruitingOpeningCard(page, department, opening, index) {
  const image = getRecruitingImage(opening, getRecruitingImage(department, fallbackImages.recruiting));
  const duties = normalizeRecruitingList(opening.duties);
  const requirements = normalizeRecruitingList(opening.requirements);
  const benefits = normalizeRecruitingList(opening.benefits);
  const formType = opening.metadata?.form_type || page.metadata?.form_type || "recruiting";
  return `
    <details class="homecare-role-card recruiting-opening-card" ${index === 0 ? "open" : ""}>
      <summary>
        <img src="${escapeHTML(image)}" alt="${escapeHTML(opening.title)}" />
        <div>
          <span>${escapeHTML(opening.subtitle || department?.title || page.title)}</span>
          <h3>${escapeHTML(opening.title)}</h3>
          <p>${escapeHTML(opening.summary || "")}</p>
          <small>${[opening.employment_type, opening.location, opening.capacity_label].filter(Boolean).map(escapeHTML).join(" · ")}</small>
        </div>
        <b>查看內容</b>
      </summary>
      <div class="homecare-role-detail">
        <article>
          <h4>${page.page_slug === "talent" ? "工作內容" : "合作內容"}</h4>
          <ul>${duties.map((item) => `<li>${escapeHTML(item.title || item)}</li>`).join("")}</ul>
        </article>
        <article>
          <h4>${page.page_slug === "talent" ? "應徵條件" : "合作條件"}</h4>
          <ul>${requirements.map((item) => `<li>${escapeHTML(item.title || item)}</li>`).join("")}</ul>
        </article>
        <div class="homecare-role-support">
          ${benefits.map((item) => `<span>${escapeHTML(item.title || item)}</span>`).join("")}
        </div>
        <div class="course-info-line">
          <span><em>地點</em>${escapeHTML(opening.location || "洽談確認")}</span>
          <b><em>${page.page_slug === "talent" ? "薪資" : "模式"}</em>${escapeHTML(opening.salary_text || "洽談確認")}</b>
        </div>
        ${opening.apply_form_enabled ? `
          <button
            class="primary-button"
            type="button"
            data-recruit-apply
            data-form-type="${escapeHTML(formType)}"
            data-page-slug="${escapeHTML(page.page_slug)}"
            data-department-id="${escapeHTML(department?.id || "")}"
            data-department-title="${escapeHTML(department?.title || "")}"
            data-opening-id="${escapeHTML(opening.id || "")}"
            data-opening-slug="${escapeHTML(opening.opening_slug || "")}"
            data-opening-title="${escapeHTML(opening.title || "")}"
          >${escapeHTML(opening.apply_button_text || "申請應徵")}</button>
        ` : ""}
      </div>
    </details>
  `;
}

function departmentTalentKey(department, index = 0) {
  return String(department?.department_slug || department?.slug || department?.id || `department-${index + 1}`)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || `department-${index + 1}`;
}

function buildRecruitingOpeningGroups(departments = [], openings = []) {
  const departmentById = new Map(departments.map((department, index) => [department.id, { department, key: departmentTalentKey(department, index) }]));
  const groups = departments.map((department, index) => {
    const key = departmentTalentKey(department, index);
    return {
      key,
      department,
      openings: openings.filter((opening) => opening.department_id === department.id)
    };
  }).filter((group) => group.openings.length);
  const assignedIds = new Set(departments.map((department) => department.id).filter(Boolean));
  const unassignedOpenings = openings.filter((opening) => !assignedIds.has(opening.department_id));
  if (unassignedOpenings.length) {
    groups.push({
      key: "other",
      department: { id: "", title: "其他招募職位", department_slug: "other", description: "尚未歸類到特定部門的招募項目。" },
      openings: unassignedOpenings
    });
  }
  if (!groups.length && openings.length) {
    groups.push({
      key: "all",
      department: departmentById.values().next().value?.department || { id: "", title: "職位一覽", department_slug: "all" },
      openings
    });
  }
  return groups;
}

const talentJobFallbacks = {
  salary: "面議 / 依經驗核定",
  location: "依職缺安排",
  employmentType: "全職 / 排班依職缺",
  capacity: "持續招募"
};

function talentText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function talentListItems(value, fallback = []) {
  const items = normalizeRecruitingList(value)
    .map((item) => talentText(item?.title || item?.label || item))
    .filter(Boolean);
  return items.length ? items : fallback;
}

function talentSafeKey(value, fallback = "job") {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function talentUniqueOptions(items = []) {
  const seen = new Set();
  return items
    .map((item) => talentText(item))
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function formatTalentUpdatedAt(value) {
  if (!value) return "近期更新";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "近期更新";
  return `更新 ${new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date).replace(/\//g, ".")}`;
}

function compareTalentJobs(a, b) {
  const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
  if (featuredDiff) return featuredDiff;
  const sortDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  if (sortDiff) return sortDiff;
  return Number(b.updatedMs || 0) - Number(a.updatedMs || 0);
}

function buildTalentJobBoardModel(page = {}, departments = [], openings = []) {
  const departmentById = new Map(departments.map((department, index) => [
    department.id,
    {
      ...department,
      key: departmentTalentKey(department, index)
    }
  ]));
  const fallbackDepartment = departments[0]
    ? { ...departments[0], key: departmentTalentKey(departments[0], 0) }
    : { id: "", key: "talent", title: page.title || "職位一覽", department_slug: "talent" };
  const jobs = openings.map((opening, index) => {
    const department = departmentById.get(opening.department_id) || {
      ...fallbackDepartment,
      title: opening.subtitle || fallbackDepartment.title || "職位一覽"
    };
    const openingSlug = talentSafeKey(opening.opening_slug || opening.id || opening.title || `opening-${index + 1}`, `opening-${index + 1}`);
    const jobKey = `${talentSafeKey(department.department_slug || department.key || department.id || "department")}-${openingSlug}-${index + 1}`;
    const title = talentText(opening.title, "未命名職缺");
    const departmentTitle = talentText(department.title || opening.subtitle, "職位一覽");
    const duties = talentListItems(opening.duties, ["依職缺內容安排主要工作，面談時會由招募窗口完整說明。"]);
    const requirements = talentListItems(opening.requirements, ["願意學習、重視溝通與服務品質，相關經驗或證照尤佳。"]);
    const benefits = talentListItems(opening.benefits || opening.support, ["新人訓練", "督導支持", "團隊陪跑"]);
    const updatedDate = new Date(opening.updated_at || opening.published_at || opening.created_at || "");
    const updatedMs = Number.isNaN(updatedDate.getTime()) ? 0 : updatedDate.getTime();
    const employmentType = talentText(opening.employment_type, talentJobFallbacks.employmentType);
    const locationText = talentText(opening.location, talentJobFallbacks.location);
    const salaryText = talentText(opening.salary_text, talentJobFallbacks.salary);
    const capacityText = talentText(opening.capacity_label, talentJobFallbacks.capacity);
    const summary = talentText(opening.summary, duties[0] || "歡迎與招募窗口聊聊職務內容與適合度。");
    const imageProfile = getRecruitingImageProfile(opening, getRecruitingImage(department, fallbackImages.recruiting));
    const formType = opening.metadata?.form_type || page.metadata?.form_type || "recruiting";
    return {
      id: String(opening.id || openingSlug || jobKey),
      key: jobKey,
      title,
      subtitle: talentText(opening.subtitle, departmentTitle),
      summary,
      department,
      departmentTitle,
      departmentKey: talentSafeKey(department.department_slug || department.key || department.id || departmentTitle),
      employmentType,
      location: locationText,
      salary: salaryText,
      capacity: capacityText,
      duties,
      requirements,
      benefits,
      isFeatured: Boolean(opening.is_featured),
      applyFormEnabled: opening.apply_form_enabled !== false,
      applyButtonText: talentText(opening.apply_button_text, "申請應徵"),
      formType,
      pageSlug: page.page_slug || opening.page_slug || "talent",
      departmentId: department.id || opening.department_id || "",
      openingSlug,
      image: imageProfile.src,
      imageFallback: imageProfile.fallbackSrc,
      imageLabel: imageProfile.label,
      imageCaption: imageProfile.caption,
      imageAlt: `${title}工作情境：${imageProfile.label}`,
      sortOrder: Number(opening.sort_order || index * 10),
      updatedMs,
      updatedLabel: formatTalentUpdatedAt(opening.updated_at || opening.published_at || opening.created_at)
    };
  }).sort(compareTalentJobs);

  return {
    jobs,
    departmentOptions: talentUniqueOptions(jobs.map((job) => job.departmentTitle))
  };
}

function talentApplyAttributes(job) {
  return [
    `data-form-type="${escapeHTML(job.formType)}"`,
    `data-page-slug="${escapeHTML(job.pageSlug)}"`,
    `data-department-id="${escapeHTML(job.departmentId)}"`,
    `data-department-title="${escapeHTML(job.departmentTitle)}"`,
    `data-opening-id="${escapeHTML(job.id)}"`,
    `data-opening-slug="${escapeHTML(job.openingSlug)}"`,
    `data-opening-title="${escapeHTML(job.title)}"`
  ].join(" ");
}

function renderTalentApplyControl(job, className = "primary-button", label = job.applyButtonText) {
  if (!job.applyFormEnabled) return "";
  return `
    <button class="${escapeHTML(className)}" type="button" data-recruit-apply ${talentApplyAttributes(job)}>
      ${escapeHTML(label)}
    </button>
  `;
}

function renderTalentJobMeta(job) {
  return `
    <dl class="talent-job-meta" aria-label="${escapeHTML(job.title)}職缺資訊">
      <div><dt>薪資</dt><dd>${escapeHTML(job.salary)}</dd></div>
      <div><dt>地點</dt><dd>${escapeHTML(job.location)}</dd></div>
      <div><dt>類型</dt><dd>${escapeHTML(job.employmentType)}</dd></div>
      <div><dt>名額</dt><dd>${escapeHTML(job.capacity)}</dd></div>
    </dl>
  `;
}

function renderTalentJobCompactMeta(job) {
  return `
    <dl class="talent-job-compact-meta" aria-label="${escapeHTML(job.title)}職缺重點">
      <div><dt>薪資</dt><dd>${escapeHTML(job.salary)}</dd></div>
      <div><dt>地點</dt><dd>${escapeHTML(job.location)}</dd></div>
      <div><dt>類型</dt><dd>${escapeHTML(job.employmentType)}</dd></div>
    </dl>
  `;
}

function renderTalentJobImage(job, className, loading = "lazy") {
  return `
    <figure class="${escapeHTML(className)}">
      <img
        src="${escapeHTML(job.image)}"
        alt="${escapeHTML(job.imageAlt || `${job.title}工作情境`)}"
        loading="${escapeHTML(loading)}"
        decoding="async"
        data-fallback-src="${escapeHTML(job.imageFallback || fallbackImages.recruiting)}"
      />
      <figcaption>
        <span>${escapeHTML(job.imageLabel || "工作情境")}</span>
        <strong>${escapeHTML(job.departmentTitle)}</strong>
      </figcaption>
    </figure>
  `;
}

function renderTalentJobDetail(job, inline = false) {
  return `
    <div class="${inline ? "talent-job-inline-detail-inner" : "talent-job-detail-inner"}">
      <div class="talent-job-detail-head">
        <div>
          <span>${job.isFeatured ? "重點職缺" : "職缺詳情"}</span>
          <h3>${escapeHTML(job.title)}</h3>
          <p>${escapeHTML(job.summary)}</p>
        </div>
        ${renderTalentApplyControl(job)}
      </div>
      ${renderTalentJobImage(job, `talent-job-detail-media${inline ? " is-inline" : ""}`, inline ? "lazy" : "eager")}
      ${renderTalentJobMeta(job)}
      <section class="talent-job-detail-summary">
        <h4>職缺摘要</h4>
        <p>${escapeHTML(job.summary)}</p>
        <div>
          <span>${escapeHTML(job.departmentTitle)}</span>
          <span>${escapeHTML(job.updatedLabel)}</span>
          ${job.isFeatured ? `<span>重點職缺</span>` : ""}
        </div>
        <small>${escapeHTML(job.imageCaption || "依職缺內容安排合適的團隊與服務現場。")}</small>
      </section>
      <div class="talent-job-detail-sections">
        <section>
          <h4>工作內容</h4>
          <ul>${job.duties.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </section>
        <section>
          <h4>應徵條件</h4>
          <ul>${job.requirements.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </section>
      </div>
      <section class="talent-job-support">
        <h4>福利支持</h4>
        <div>${job.benefits.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div>
      </section>
      <section class="talent-job-process">
        <h4>應徵流程</h4>
        <ol>
          <li>送出應徵資料，招募窗口確認職缺與可服務區域。</li>
          <li>安排電話或面談，了解經驗、期待與排班條件。</li>
          <li>媒合部門主管，說明工作內容、訓練與到職安排。</li>
        </ol>
      </section>
      <div class="talent-job-detail-actions">
        ${renderTalentApplyControl(job, "primary-button", job.applyButtonText)}
      </div>
    </div>
  `;
}

function renderTalentJobCard(job, index) {
  const isActive = index === 0;
  return `
    <article
      class="talent-job-card ${isActive ? "is-active" : ""}"
      role="option"
      tabindex="0"
      aria-selected="${isActive ? "true" : "false"}"
      aria-controls="talent-job-detail-${escapeHTML(job.key)}"
      data-talent-job-card
      data-job-id="${escapeHTML(job.key)}"
      data-talent-department="${escapeHTML(job.departmentTitle)}"
      data-apply-text="${escapeHTML(job.applyButtonText)}"
      data-form-type="${escapeHTML(job.formType)}"
      data-page-slug="${escapeHTML(job.pageSlug)}"
      data-department-id="${escapeHTML(job.departmentId)}"
      data-department-title="${escapeHTML(job.departmentTitle)}"
      data-opening-id="${escapeHTML(job.id)}"
      data-opening-slug="${escapeHTML(job.openingSlug)}"
      data-opening-title="${escapeHTML(job.title)}"
    >
      <div class="talent-job-card-shell">
        <div class="talent-job-card-copy">
          <div class="talent-job-card-top">
            <span class="talent-job-department">${escapeHTML(job.departmentTitle)}</span>
            <time>${escapeHTML(job.updatedLabel)}</time>
          </div>
          <div class="talent-job-title-row">
            <div>
              <h3>${escapeHTML(job.title)}</h3>
              <p>${escapeHTML(job.subtitle)}</p>
            </div>
            ${job.isFeatured ? `<strong>重點</strong>` : ""}
          </div>
          ${renderTalentJobCompactMeta(job)}
          <p class="talent-job-summary">${escapeHTML(job.summary)}</p>
          <div class="talent-job-tags" aria-label="福利與支持">
            ${job.benefits.slice(0, 2).map((item) => `<span>${escapeHTML(item)}</span>`).join("")}
          </div>
          <div class="talent-job-card-actions">
            ${renderTalentApplyControl(job, "primary-button compact")}
          </div>
        </div>
      </div>
      <div class="talent-job-mobile-detail" id="talent-job-mobile-detail-${escapeHTML(job.key)}">
        ${renderTalentJobDetail(job, true)}
      </div>
    </article>
  `;
}

function renderTalentJobBoard(page, model) {
  const { jobs, departmentOptions } = model;
  if (!jobs.length) {
    return `
      <section class="talent-job-board is-empty" id="career-openings" aria-label="職位一覽">
        <span class="talent-scroll-anchor" id="recruiting-openings" aria-hidden="true"></span>
        <div class="health-empty-state">
          <h2>職缺整理中</h2>
          <p>可以先留下應徵資料，我們會依照你的經驗與期待安排招募窗口回覆。</p>
          <a class="primary-button" href="#contact" data-contact-need="人才招募" data-contact-message="我想了解歲悅長照職缺或投遞應徵資料，請協助安排招募窗口聯繫。">留下應徵資料</a>
        </div>
      </section>
    `;
  }
  const firstJob = jobs[0];
  return `
    <section class="talent-job-board" id="career-openings" aria-label="職位一覽" data-talent-job-board data-active-job="${escapeHTML(firstJob.key)}">
      <span class="talent-scroll-anchor" id="recruiting-openings" aria-hidden="true"></span>
      <select hidden data-talent-filter="department" aria-hidden="true" tabindex="-1">
        <option value="">全部職缺</option>
        ${departmentOptions.map((department) => `<option value="${escapeHTML(department)}">${escapeHTML(department)}</option>`).join("")}
      </select>
      <div class="talent-job-chip-row" aria-label="部門快速篩選">
        <button class="is-active" type="button" data-talent-chip="department" data-value="">全部職缺</button>
        ${departmentOptions.map((department) => `<button type="button" data-talent-chip="department" data-value="${escapeHTML(department)}">${escapeHTML(department)}</button>`).join("")}
      </div>
      <div class="talent-job-result-line" aria-live="polite">
        <strong data-talent-result-count>${jobs.length}</strong>
        <span>個職缺符合條件</span>
      </div>
      <div class="talent-job-layout">
        <div class="talent-job-list" role="listbox" aria-label="職缺列表">
          ${jobs.map((job, index) => renderTalentJobCard(job, index)).join("")}
        </div>
        <div class="talent-job-detail-slot">
          <aside class="talent-job-detail" aria-live="polite" aria-label="職缺詳情">
            ${jobs.map((job, index) => `
              <article
                id="talent-job-detail-${escapeHTML(job.key)}"
                data-talent-job-detail="${escapeHTML(job.key)}"
                ${index === 0 ? "" : "hidden"}
              >
                ${renderTalentJobDetail(job)}
              </article>
            `).join("")}
          </aside>
        </div>
      </div>
      <div class="talent-job-empty" data-talent-empty hidden>
        <h3>沒有符合條件的職缺</h3>
        <p>可以切換部門或清除篩選，再看看其他適合的角色。</p>
        <button class="primary-button" type="button" data-talent-clear-filters>清除篩選</button>
      </div>
      <div class="talent-job-mobile-cta" data-talent-mobile-cta>
        ${jobs.map((job, index) => `
          <div data-talent-mobile-cta-item="${escapeHTML(job.key)}" ${index === 0 ? "" : "hidden"}>
            ${renderTalentApplyControl(job)}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRecruitingJobListPanel(page, departments, openings, activeKey = "job-list") {
  const model = buildTalentJobBoardModel(page, departments, openings);
  const content = `
    ${renderTalentPanelLead("Open Roles", "職位一覽", "像求職網站一樣快速比較職缺，再展開完整內容；把地點、薪資、類型、福利與應徵入口放在同一個畫面。")}
    ${renderTalentJobBoard(page, model)}
  `;
  return renderTalentTabPanel("job-list", content, activeKey);
}

function talentBenefitStations() {
  return [
    ...talentBenefitCategories.map((category) => ({ ...category, ...talentBenefitStationMeta[category.key], countable: true })),
    {
      key: "caregiver-exclusive",
      title: "照服員專屬支持",
      summary: "第一線服務所需要的留任、責任保障與工作裝備，在這一站一次帶走。",
      items: talentCaregiverExclusiveBenefits,
      ...talentBenefitStationMeta["caregiver-exclusive"],
      countable: false
    }
  ];
}

function renderTalentBenefitTags(tags = []) {
  return `
    <div class="benefit-explorer-tags" aria-label="適用標籤">
      ${tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}
    </div>
  `;
}

function renderTalentBenefitCard(item, index) {
  return `
    <article class="benefit-explorer-card">
      <span class="benefit-explorer-card-index">${String(index + 1).padStart(2, "0")}</span>
      <div>
        <h4>${escapeHTML(item.title)}</h4>
        <strong>${escapeHTML(item.value)}</strong>
      </div>
      ${renderTalentBenefitTags(item.tags)}
      <p>${escapeHTML(item.copy)}</p>
    </article>
  `;
}

function renderTalentBenefitStation(station, index) {
  const panelId = `benefit-station-panel-${station.key}`;
  const tabId = `benefit-station-tab-${station.key}`;
  const isActive = index === 0;
  return `
    <article
      class="benefit-explorer-stage benefit-explorer-tone-${escapeHTML(station.tone)} ${isActive ? "is-active" : ""}"
      id="${escapeHTML(panelId)}"
      role="tabpanel"
      aria-labelledby="${escapeHTML(tabId)}"
      data-benefit-station-panel="${escapeHTML(station.key)}"
      ${isActive ? "" : "hidden"}
    >
      <div class="benefit-explorer-stage-media">
        <img src="${escapeHTML(station.image)}" alt="${escapeHTML(station.title)}相關工作情境" />
        <span>${escapeHTML(station.title)}</span>
      </div>
      <div class="benefit-explorer-stage-copy">
        <h3>${escapeHTML(station.title)}</h3>
        <p>${escapeHTML(station.summary)}</p>
        <div class="benefit-explorer-card-grid">
          ${station.items.map(renderTalentBenefitCard).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderTalentBenefitsPanel(activeKey = "job-list") {
  const stations = talentBenefitStations();
  const mainStations = stations.filter((station) => station.countable);
  const content = `
    ${renderTalentPanelLead("Benefits Passport", "公司福利制度", "選一站，快速看懂歲悅的工作支持。")}
    <section class="benefit-explorer" data-benefit-explorer>
      <div class="benefit-explorer-map-wrap">
        <div class="benefit-explorer-map-head">
          <div>
            <h3>想先看哪一種支持？</h3>
          </div>
        </div>
        <div class="benefit-explorer-map" role="tablist" aria-label="福利探索站點">
          ${stations.map((station, index) => {
            const panelId = `benefit-station-panel-${station.key}`;
            const tabId = `benefit-station-tab-${station.key}`;
            const isActive = index === 0;
            return `
              <button
                class="benefit-explorer-station benefit-explorer-tone-${escapeHTML(station.tone)} ${station.countable ? "" : "is-bonus"} ${isActive ? "is-active" : ""}"
                id="${escapeHTML(tabId)}"
                type="button"
                role="tab"
                aria-selected="${isActive ? "true" : "false"}"
                aria-controls="${escapeHTML(panelId)}"
                tabindex="${isActive ? "0" : "-1"}"
                data-benefit-station="${escapeHTML(station.key)}"
                data-benefit-countable="${station.countable ? "true" : "false"}"
              >
                <span class="benefit-explorer-station-icon" aria-hidden="true"><i data-lucide="${escapeHTML(station.icon)}"></i></span>
                <span>${station.countable ? String(mainStations.findIndex((item) => item.key === station.key) + 1).padStart(2, "0") : "BONUS"}</span>
                <b>${escapeHTML(station.title)}</b>
                <i class="benefit-explorer-station-stamp" aria-hidden="true"><span data-lucide="check"></span></i>
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <div class="benefit-explorer-stage-wrap">
        ${stations.map(renderTalentBenefitStation).join("")}
      </div>
    </section>
  `;
  return renderTalentTabPanel("benefits", content, activeKey);
}

function renderTalentGrowthPanel(activeKey = "job-list") {
  const content = `
    ${renderTalentPanelLead("Career Path", "公司升遷發展", "歲悅不把升遷只交給年資，而是把品質、能力、帶教與責任感變成清楚可追蹤的發展路徑。")}
    <div class="career-growth-intro">
      <article>
        <span>Promotion System</span>
        <h3>讓照顧者知道自己正在往哪裡前進。</h3>
        <p>每位夥伴入職後會有新人陪跑、月度回饋、教育訓練紀錄與職能評核。當服務品質穩定、能處理現場問題，也能支持其他夥伴時，就會進入下一階段培力。</p>
      </article>
      <div>
        <b>4</b><span>發展路徑</span>
        <b>12+</b><span>進階訓練月期</span>
        <b>100%</b><span>督導陪跑</span>
      </div>
    </div>
    <div class="career-timeline">
      ${talentCareerSteps.map(([period, title, copy], index) => `<article><span>${String(index + 1).padStart(2, "0")}｜${escapeHTML(period)}</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p></article>`).join("")}
    </div>
    <div class="career-track-map">
      ${talentCareerTracks.map(([track, stages]) => `
        <article class="career-track-card">
          <h3>${escapeHTML(track)}</h3>
          <div class="career-stage-list">
            ${stages.map((stage, index) => `<span><i>${index + 1}</i>${escapeHTML(stage)}</span>`).join("")}
          </div>
        </article>
      `).join("")}
    </div>
    <div class="career-evaluation-grid">
      ${talentPromotionCriteria.map(([title, copy]) => `<article><span>Evaluation</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p></article>`).join("")}
    </div>
    <div class="career-growth-board">
      <article><b>3 個月</b><span>新人陪跑與第一次回饋</span></article>
      <article><b>6 個月</b><span>進階模組與職能確認</span></article>
      <article><b>12 個月</b><span>帶教、督導或講師培力</span></article>
      <article><b>18 個月</b><span>跨部門專案與管理職準備</span></article>
    </div>
  `;
  return renderTalentTabPanel("career-growth", content, activeKey);
}

function normalizeTalentDepartmentsForDisplay(departments = []) {
  return departments.length ? departments : defaultTalentMissionDepartments;
}

function renderTalentOrganizationPanel(departments = [], activeKey = "job-list") {
  const displayDepartments = normalizeTalentDepartmentsForDisplay(departments);
  const content = `
    ${renderTalentPanelLead("Organization", "公司組織圖", "用求職者看得懂的方式呈現歲悅團隊：誰支持前線、誰負責品質、各部門如何一起把服務交付到家庭。")}
    <div class="talent-org-chart" aria-label="歲悅人才招募組織圖">
      <article class="talent-org-node talent-org-root">
        <span>Suiyuecare Corps.</span>
        <strong>歲悅長照集團</strong>
        <p>以照顧服務、人才培育、品質管理與營運支援形成同一套長照工作系統。</p>
      </article>
      <div class="talent-org-pillars">
        ${talentOrgPillars.map(([title, copy]) => `
          <article class="talent-org-node">
            <span>Function</span>
            <strong>${escapeHTML(title)}</strong>
            <p>${escapeHTML(copy)}</p>
          </article>
        `).join("")}
      </div>
      <div class="talent-org-units">
        ${displayDepartments.map((department, index) => `
          <article class="talent-org-unit">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHTML(department.title || "招募部門")}</strong>
            <p>${escapeHTML(department.description || "負責把部門專業接進日常服務與團隊協作。")}</p>
          </article>
        `).join("")}
      </div>
    </div>
  `;
  return renderTalentTabPanel("organization", content, activeKey);
}

function renderTalentMissionPanel(page, departments = [], openings = [], activeKey = "job-list") {
  const displayDepartments = normalizeTalentDepartmentsForDisplay(departments);
  const groups = buildRecruitingOpeningGroups(displayDepartments, openings);
  const openingCountByKey = new Map(groups.map((group) => [group.key, group.openings.length]));
  const content = `
    ${renderTalentPanelLead("Department Mission", "部門使命", "每個部門的工作都不是孤立的職稱，而是在長照現場承接不同責任；了解使命後，再回到職缺一覽選擇適合自己的位置。")}
    <div class="talent-mission-grid">
      ${displayDepartments.map((department, index) => {
        const key = departmentTalentKey(department, index);
        const image = getRecruitingImage(department, fallbackImages.recruiting);
        const highlights = normalizeRecruitingList(department.highlights).slice(0, 3);
        return `
          <article class="talent-mission-card">
            <figure>
              <img src="${escapeHTML(image)}" alt="${escapeHTML(department.title || page.title)}" />
            </figure>
            <div>
              <span>${escapeHTML(department.eyebrow || "Mission")}</span>
              <h3>${escapeHTML(department.title || page.title)}</h3>
              <p>${escapeHTML(department.description || "把部門專業放進照顧現場，讓長輩、家屬與團隊都能被穩定支持。")}</p>
              ${highlights.length ? `<ul>${highlights.map((item) => `<li>${escapeHTML(item.title || item)}</li>`).join("")}</ul>` : ""}
              <button
                class="secondary-button compact"
                type="button"
                data-career-jump-tab="job-list"
                data-career-jump-target="#talent-openings-${escapeHTML(key)}"
              >查看相關職缺${openingCountByKey.has(key) ? ` ${openingCountByKey.get(key)}` : ""}</button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
  return renderTalentTabPanel("department-mission", content, activeKey);
}

function renderRecruitingOpportunityPage(page, departments, openings) {
  const primaryDepartment = departments[0] || { id: "", title: page.title, department_slug: page.page_slug };
  return `
    <div class="service-detail-page recruiting-cms-page ${escapeHTML(page.page_slug)}-cms-page">
      ${renderRecruitingHero(page)}
      <section class="service-detail-section" id="recruiting-openings">
        <div class="service-section-head">
          <p class="eyebrow">${escapeHTML(primaryDepartment.eyebrow || "Opportunities")}</p>
          <h2>${escapeHTML(primaryDepartment.title || page.title)}</h2>
          <span>${escapeHTML(primaryDepartment.description || page.subtitle || "")}</span>
        </div>
        ${renderRecruitingOpeningGrid(page, primaryDepartment, openings)}
      </section>
      ${renderRecruitingApplicationModal(page)}
    </div>
  `;
}

function renderRecruitingTalentPage(page, departments, openings) {
  const activeKey = "job-list";
  return `
    <div class="career-page recruiting-cms-page">
      ${renderRecruitingHero(page)}
      ${renderTalentTabNav(activeKey)}
      ${renderRecruitingJobListPanel(page, departments, openings, activeKey)}
      ${renderTalentBenefitsPanel(activeKey)}
      ${renderTalentGrowthPanel(activeKey)}
      ${renderTalentOrganizationPanel(departments, activeKey)}
      ${renderTalentMissionPanel(page, departments, openings, activeKey)}
      ${renderRecruitingApplicationModal(page)}
    </div>
  `;
}

function renderRecruitingApplicationModal(page) {
  const isTalent = page.page_slug === "talent";
  const submitText = isTalent ? "送出應徵資料" : "送出洽談資料";
  const confirmText = isTalent
    ? "送出後，資料會寄到歲悅招募窗口並留存在系統，窗口原則上 1 個工作天內回覆。"
    : "送出後，資料會寄到歲悅合作窗口並留存在系統，窗口原則上 1 個工作天內回覆。";
  const fields = isTalent ? `
          <p class="recruit-apply-context">申請職缺：<strong id="recruitApplyContext"></strong></p>
          <label>您的大名<input name="姓名" type="text" required autocomplete="name" placeholder="請輸入姓名" /></label>
          <label>您的電話<input name="電話" type="tel" required autocomplete="tel" inputmode="tel" placeholder="請輸入電話" /></label>
          <label class="recruit-resume-field">履歷上傳 <span>非必填</span><input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
          <p class="recruit-resume-hint">支援 PDF、DOC、DOCX，檔案上限 3 MB。</p>
          <input name="subject" id="recruitApplyTitle" type="hidden" />
  ` : `
          <label>您的大名<input name="姓名" type="text" required placeholder="請輸入姓名" /></label>
          <label>您的電話<input name="電話" type="tel" required placeholder="請輸入電話" /></label>
          <label>Email<input name="Email" type="email" required placeholder="請輸入 Email" /></label>
          <label>申請項目<input name="subject" id="recruitApplyTitle" type="text" readonly /></label>
          <label>補充說明<textarea name="說明" rows="4" placeholder="可填寫可聯絡時間、經歷、場域資料或合作想法"></textarea></label>
  `;
  const privacy = isTalent
    ? `<p class="recruit-privacy-note">送出資料即表示同意歲悅長照集團為招募與後續聯繫目的使用所提供資料。</p>`
    : `<label class="privacy-consent"><input type="checkbox" name="privacy_consent" required />我同意歲悅長照集團為應徵、合作洽談與後續聯繫目的，使用我填寫的個人資料。</label>`;
  return `
    <div class="course-modal recruiting-apply-modal" id="recruitApplyModal" hidden role="dialog" aria-modal="true" aria-labelledby="recruitApplyHeading">
      <form class="course-modal-card recruit-apply-form" id="recruitApplyForm">
        <button class="course-modal-close" type="button" data-recruit-close aria-label="關閉">×</button>
        <p class="eyebrow">Apply</p>
        <h2 id="recruitApplyHeading">${escapeHTML(isTalent ? "申請應徵" : "提交洽談資料")}</h2>
          ${fields}
          <input name="recruiting_page" id="recruitApplyPage" type="hidden" />
          <input name="department_id" id="recruitApplyDepartmentId" type="hidden" />
          <input name="department_title" id="recruitApplyDepartmentTitle" type="hidden" />
          <input name="opening_id" id="recruitApplyOpeningId" type="hidden" />
          <input name="opening_slug" id="recruitApplyOpeningSlug" type="hidden" />
          <input name="opening_title" id="recruitApplyOpeningTitle" type="hidden" />
          <input name="_honey" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />
          ${privacy}
          <p class="course-confirm-text">${escapeHTML(confirmText)}</p>
          <button class="primary-button" type="submit">${escapeHTML(submitText)}</button>
          <p class="course-modal-status" id="recruitApplyStatus" role="status" aria-live="polite"></p>
      </form>
    </div>
  `;
}

async function fetchSupabaseRecruitingPage(slug) {
  if (supabaseRecruitingPageCache.has(slug)) return supabaseRecruitingPageCache.get(slug);
  const pageQuery = supabase
    .from("recruiting_pages")
    .select("*")
    .eq("page_slug", slug)
    .eq("is_enabled", true)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  const departmentsQuery = supabase
    .from("recruiting_departments")
    .select("*")
    .eq("page_slug", slug)
    .eq("is_enabled", true)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("sort_order", { ascending: true });

  const openingsQuery = supabase
    .from("recruiting_openings")
    .select("*")
    .eq("page_slug", slug)
    .eq("is_enabled", true)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  const [{ data: page, error: pageError }, { data: departments, error: departmentsError }, { data: openings, error: openingsError }] = await Promise.all([
    pageQuery,
    departmentsQuery,
    openingsQuery
  ]);
  if (pageError) throw pageError;
  if (departmentsError) throw departmentsError;
  if (openingsError) throw openingsError;
  if (!page) return null;

  const mediaMap = await fetchRecruitingMediaMap([page, ...(departments || []), ...(openings || [])]);
  const result = {
    page: attachRecruitingImage(page, mediaMap),
    departments: (departments || []).map((department) => attachRecruitingImage(department, mediaMap)),
    openings: (openings || []).map((opening) => attachRecruitingImage(opening, mediaMap))
  };
  supabaseRecruitingPageCache.set(slug, result);
  return result;
}

async function loadSupabaseRecruitingPage(slug) {
  if (!supabase || !recruitingTemplateSlugs.has(slug)) return false;
  try {
    const data = await fetchSupabaseRecruitingPage(slug);
    if (!data || routeSlugFromLocation() !== slug) return false;
    pageView.innerHTML = slug === "talent"
      ? renderRecruitingTalentPage(data.page, data.departments, data.openings)
      : renderRecruitingOpportunityPage(data.page, data.departments, data.openings);
    return true;
  } catch (error) {
    console.warn(`Supabase recruiting page unavailable for ${slug}.`, error);
    return false;
  }
}

const supabaseInvestorCache = new Map();

function fileHref(file) {
  if (!file) return "#contact";
  if (file.id && ((file.public_url && file.public_url !== "#contact") || file.storage_path)) {
    return `/api/download-file?id=${encodeURIComponent(file.id)}`;
  }
  return "#contact";
}

function hasDownloadFile(file) {
  return Boolean(file?.id && ((file.public_url && file.public_url !== "#contact") || file.storage_path));
}

function isRequestOnlyFile(file) {
  return Boolean(file) && !hasDownloadFile(file);
}

function renderInvestorDownloadCell(file, label = "下載") {
  if (isRequestOnlyFile(file)) return `<a href="#contact" class="ir-request-file">申請${escapeHTML(label)}</a>`;
  if (!hasDownloadFile(file)) return `<span class="ir-muted-action" aria-label="未提供公開下載檔案">—</span>`;
  return `<a href="${escapeHTML(fileHref(file))}" target="_blank" rel="noopener">${escapeHTML(label)}</a>`;
}

function groupByKey(items = [], key) {
  return items.reduce((groups, item) => {
    const value = item[key] || "general";
    if (!groups[value]) groups[value] = [];
    groups[value].push(item);
    return groups;
  }, {});
}

function renderCmsNoticeLinks(items, fallbackHref = "#investors") {
  return (items || []).map((item) => `
    <a href="${escapeHTML(normalizePublicHref(item.link_url || fileHref(item.file) || fallbackHref))}">
      <time>${escapeHTML(item.date_label || formatArticleDate(item.published_on || item.published_at))}</time>
      <strong>${escapeHTML(item.title)}</strong>
      <p>${escapeHTML(item.summary || item.body || "")}</p>
    </a>
  `).join("");
}

function renderCmsDownloadGrid(files, emptyText = "目前暫無公開下載檔案") {
  const visibleFiles = (files || []).filter((file) => hasDownloadFile(file) || isRequestOnlyFile(file));
  if (!visibleFiles.length) return `<div class="health-empty-state"><h2>${escapeHTML(emptyText)}</h2><p>相關文件將依公司公告時程更新。</p></div>`;
  return `
    <div class="download-grid">
      ${visibleFiles.map((file) => `
        <a href="${escapeHTML(fileHref(file))}" target="${hasDownloadFile(file) ? "_blank" : ""}" rel="noopener" class="${isRequestOnlyFile(file) ? "request-only-file" : ""}">
          <span>${escapeHTML(isRequestOnlyFile(file) ? "申請" : (file.file_type || "PDF"))}</span>
          <strong>${escapeHTML(file.title)}</strong>
          <em>${escapeHTML(isRequestOnlyFile(file) ? "請留下需求，由投資人窗口提供正式文件" : (file.description || file.category || "下載檔案"))}</em>
        </a>
      `).join("")}
    </div>
  `;
}

function renderCmsBarChart(points = []) {
  const values = points.map((point) => Number(point.value || 0));
  const max = Math.max(...values, 1);
  return `
    <div class="bar-line-chart">
      ${points.map((point) => `<i style="--h:${Math.max(6, Math.round(Number(point.value || 0) / max * 100))}%"><b>${escapeHTML(point.label || "")}</b></i>`).join("")}
    </div>
  `;
}

function renderCmsDonutChart(points = [], label = "Data") {
  const total = points.reduce((sum, point) => sum + Number(point.value || 0), 0) || 1;
  const segments = points.slice(0, 4).map((point) => `${Math.round(Number(point.value || 0) / total * 100)}%`);
  return `
    <div class="donut-chart" style="--a:${segments[0] || "25%"};--b:${segments[1] || "25%"};--c:${segments[2] || "25%"};--d:${segments[3] || "25%"}"><em>${escapeHTML(label)}</em></div>
    <ul class="chart-legend">${points.map((point) => `<li>${escapeHTML(point.label || "")} ${escapeHTML(point.value || "")}${escapeHTML(point.unit || "")}</li>`).join("")}</ul>
  `;
}

function renderCmsLineChart(points = []) {
  const values = points.map((point) => Number(point.value || 0));
  const max = Math.max(...values, 1);
  const coords = points.map((point, index) => {
    const x = points.length <= 1 ? 50 : Math.round(index / (points.length - 1) * 100);
    const y = 96 - Math.max(8, Math.round(Number(point.value || 0) / max * 88));
    return `${x},${y}`;
  }).join(" ");
  return `
    <div class="cms-line-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${escapeHTML(coords)}"></polyline></svg>
      ${points.map((point, index) => {
        const x = points.length <= 1 ? 50 : Math.round(index / (points.length - 1) * 100);
        const y = Math.max(8, Math.round(Number(point.value || 0) / max * 92));
        return `<i style="--x:${x}%;--y:${y}%"><b>${escapeHTML(point.label || "")}</b><em>${escapeHTML(point.value || "")}${escapeHTML(point.unit || "")}</em></i>`;
      }).join("")}
    </div>
  `;
}

function renderCmsScoreChart(points = [], unitLabel = "Score") {
  const primary = points[0] || { value: 0, label: unitLabel };
  const score = Math.max(0, Math.min(100, Number(primary.value || 0)));
  return `
    <div class="score-ring cms-score-ring" style="--score:${score}%"><b>${escapeHTML(score)}</b><span>${escapeHTML(primary.label || unitLabel || "Score")}</span></div>
    <ul class="chart-legend">${points.slice(1).map((point) => `<li>${escapeHTML(point.label || "")} ${escapeHTML(point.value || "")}${escapeHTML(point.unit || "")}</li>`).join("")}</ul>
  `;
}

function renderCmsProgressCards(points = []) {
  if (!points.length) return `<div class="health-empty-state"><h2>進度資料整理中</h2><p>近期資訊確認後會更新，也可以先留下投資人需求由窗口回覆。</p></div>`;
  return `
    <div class="ir-progress-grid">
      ${points.map((project) => `
        <article class="ir-progress-card"><div class="ir-progress-top"><span>${escapeHTML(project.type || "進度")}</span><strong>${escapeHTML(project.percent || project.value || 0)}%</strong></div><h3>${escapeHTML(project.area || project.label || "")}</h3><p>${escapeHTML(project.status || project.note || "")}</p><div class="ir-main-progress"><i style="width:${Number(project.percent || project.value || 0)}%"></i></div><div class="ir-step-list">${(project.steps || []).map((step) => {
          const label = Array.isArray(step) ? step[0] : step.label;
          const value = Array.isArray(step) ? step[1] : step.value;
          return `<div><b>${escapeHTML(label || "")}</b><span><i style="width:${Number(value || 0)}%"></i></span><em>${escapeHTML(value || 0)}%</em></div>`;
        }).join("")}</div></article>
      `).join("")}
    </div>
  `;
}

function renderCmsChart(chart, options = {}) {
  const points = chart?.data_points || [];
  const type = chart?.chart_type || options.fallbackType || "bar";
  if (type === "donut") return renderCmsDonutChart(points, chart?.unit_label || options.label || "Data");
  if (type === "line" || type === "combo") return renderCmsLineChart(points);
  if (type === "score") return renderCmsScoreChart(points, chart?.unit_label || options.label || "Score");
  if (type === "progress") return renderCmsProgressCards(points);
  return renderCmsBarChart(points);
}

function renderCmsChartCard(chart, className = "") {
  if (!chart) return "";
  const points = chart.data_points || [];
  const featured = points[0];
  const featuredText = chart.chart_type === "donut"
    ? "100%"
    : featured ? `${featured.value ?? featured.percent ?? ""}${featured.unit || chart.unit_label || ""}` : "--";
  return `
    <article class="chart-card ${escapeHTML(className)}">
      <div class="chart-card-head"><span>${escapeHTML(chart.chart_title || chart.chart_key || "圖表資料")}</span><strong>${escapeHTML(featuredText)}</strong></div>
      ${renderCmsChart(chart)}
    </article>
  `;
}

function renderCmsChartGrid(charts = []) {
  if (!charts.length) return "";
  return `<div class="cms-chart-grid">${charts.map((chart, index) => renderCmsChartCard(chart, index % 3 === 0 ? "wide" : "")).join("")}</div>`;
}

function getInvestorConfig(pageSlug) {
  const configs = getSiteObject("investor_pages", {});
  return configs[pageSlug] || {};
}

function renderInvestorHeroActions(config = {}, fallbackPrimaryHref = "#contact", fallbackSecondaryHref = "#investor-downloads") {
  const primaryText = config.primary_cta_text || "聯絡投資人窗口";
  const primaryHref = config.primary_cta_url || fallbackPrimaryHref;
  const secondaryText = config.secondary_cta_text || "下載資料";
  const secondaryHref = config.secondary_cta_url || fallbackSecondaryHref;
  return `<div class="investor-hero-actions"><a class="primary-button" href="${escapeHTML(primaryHref)}">${escapeHTML(primaryText)}</a><a class="secondary-button" href="${escapeHTML(secondaryHref)}">${escapeHTML(secondaryText)}</a></div>`;
}

function renderInvestorKpis(kpis = []) {
  if (!Array.isArray(kpis) || !kpis.length) return "";
  return `
    <section class="ir-kpi-strip">
      ${kpis.map((kpi) => `<article><span>${escapeHTML(kpi.label || "")}</span><strong>${escapeHTML(kpi.value || "")}</strong><em>${escapeHTML(kpi.note || "")}</em></article>`).join("")}
    </section>
  `;
}

function renderInvestorSnapshot(config = {}) {
  const snapshot = Array.isArray(config.snapshot) ? config.snapshot : [];
  const title = config.snapshot_title || "照顧服務網絡持續擴張";
  return `
    <aside class="investor-snapshot">
      <span>${escapeHTML(config.snapshot_label || "Suiyuecare Corps.")}</span>
      <strong>${escapeHTML(title)}</strong>
      ${snapshot.length ? `<div>${snapshot.map((item) => `<p><b>${escapeHTML(item.value || "")}</b>${escapeHTML(item.label || "")}</p>`).join("")}</div>` : ""}
    </aside>
  `;
}

function renderInvestorFaq(config = {}) {
  const faqs = Array.isArray(config.faqs) ? config.faqs : [];
  if (!faqs.length) return `<div class="health-empty-state"><h2>常見問答整理中</h2><p>若你有投資、股務或合作問題，可以先留下需求由窗口回覆。</p></div>`;
  return `<div class="shareholder-faq">${faqs.map((item, index) => `<details ${index === 0 ? "open" : ""}><summary>${escapeHTML(item.question || "")}</summary><p>${escapeHTML(item.answer || "")}</p></details>`).join("")}</div>`;
}

async function fetchInvestorFileMap(items = []) {
  const fileIds = [...new Set(items.map((item) => item?.file_id).filter(Boolean))];
  if (!fileIds.length) return new Map();
  const { data, error } = await supabase
    .from("downloadable_files")
    .select("id, title, description, public_url, file_type, category, status, is_enabled, is_public, published_at")
    .in("id", fileIds);
  if (error) throw error;
  return new Map((data || []).map((file) => [file.id, file]));
}

function attachInvestorFiles(items = [], fileMap) {
  return (items || []).map((item) => ({
    ...item,
    file: fileMap.get(item.file_id) || item.file || null
  }));
}

async function fetchSupabaseInvestorData(pageSlug = "investors") {
  const cacheKey = pageSlug;
  if (supabaseInvestorCache.has(cacheKey)) return supabaseInvestorCache.get(cacheKey);
  await loadSupabaseSiteSettings();

  const now = new Date().toISOString();
  const [{ data: notices, error: noticeError }, { data: financials, error: financialError }, { data: charts, error: chartError }, { data: files, error: fileError }] = await Promise.all([
    supabase
      .from("investor_notices")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("sort_order", { ascending: true })
      .order("published_on", { ascending: false, nullsFirst: false }),
    supabase
      .from("investor_financial_items")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("sort_order", { ascending: true }),
    supabase
      .from("investor_chart_datasets")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .in("page_slug", ["investors", pageSlug])
      .order("sort_order", { ascending: true }),
    supabase
      .from("downloadable_files")
      .select("*")
      .eq("is_enabled", true)
      .eq("is_public", true)
      .eq("status", "published")
      .lte("published_at", now)
      .in("category", ["monthly_revenue", "quarterly_report", "annual_report", "governance", "shareholder", "investor", "finance"])
      .order("sort_order", { ascending: true })
  ]);

  if (noticeError) throw noticeError;
  if (financialError) throw financialError;
  if (chartError) throw chartError;
  if (fileError) throw fileError;
  const fileMap = await fetchInvestorFileMap([...(notices || []), ...(financials || [])]);
  const noticesWithFiles = attachInvestorFiles(notices, fileMap);
  const financialsWithFiles = attachInvestorFiles(financials, fileMap);
  const result = {
    notices: noticesWithFiles,
    noticesByType: groupByKey(noticesWithFiles, "notice_type"),
    financials: financialsWithFiles,
    financialsByType: groupByKey(financialsWithFiles, "item_type"),
    charts: charts || [],
    chartsByKey: groupByKey(charts || [], "chart_key"),
    files: files || [],
    filesByCategory: groupByKey(files || [], "category")
  };
  supabaseInvestorCache.set(cacheKey, result);
  return result;
}

function renderCmsInvestorsPage(data) {
  const progressChart = data.chartsByKey["establishment-progress"]?.[0];
  const news = data.noticesByType.news || [];
  const awards = data.noticesByType.award || [];
  const config = getInvestorConfig("investors");
  return `
    <div class="investor-page">
      <section class="investor-hero">
        <div>
          <p class="eyebrow">${escapeHTML(config.eyebrow || "Investor Relations")}</p>
          <h1>${escapeHTML(config.title || "投資人專區")}</h1>
          <p>${escapeHTML(config.body || "以清楚、穩定、可信任的資訊揭露，讓投資人理解歲悅長照集團的服務網絡、治理節奏與成長策略。")}</p>
          ${renderInvestorHeroActions(config)}
        </div>
        ${renderInvestorSnapshot(config)}
      </section>
      <nav class="investor-directory" aria-label="投資人專區主要分類">
        <a href="#ir-finance"><span>Financials</span><strong>財務資訊</strong><em>每月營收、財務分析、季報與年報</em></a>
        <a href="#ir-governance"><span>Governance</span><strong>公司治理</strong><em>治理運作、稽核、風險與誠信經營</em></a>
        <a href="#ir-shareholders"><span>Shareholders</span><strong>股東專區</strong><em>股務資訊、股東會、法說會與 FAQ</em></a>
      </nav>
      <section class="investor-panel active ir-progress-section">
        <div class="investor-section-head"><p class="eyebrow">Expansion Progress</p><h2>機構設立進度</h2><span>整理歲悅目前推進中的據點與服務擴張狀態，讓投資人快速理解布局節奏。</span></div>
        ${renderCmsChart(progressChart, { fallbackType: "progress" })}
      </section>
      <section class="investor-panel active">
        <div class="investor-section-head"><p class="eyebrow">Latest Updates</p><h2>投資人最新動態</h2><span>整理最新消息、得標紀錄與營運進度，讓重要資訊更容易追蹤。</span></div>
        <div class="ir-updates-grid">
          <article class="ir-update-card"><div><p class="eyebrow">News</p><h3>最新消息</h3></div>${renderCmsNoticeLinks(news, "#ir-finance")}</article>
          <article class="ir-update-card"><div><p class="eyebrow">Awards</p><h3>得標紀錄</h3></div>${renderCmsNoticeLinks(awards, "#ir-governance")}</article>
        </div>
      </section>
      <section class="investor-panel active" id="investor-downloads"><div class="investor-section-head"><p class="eyebrow">Downloads</p><h2>投資人下載檔</h2><span>彙整已公開的投資人資料與文件，完整資料可依洽談需求提供。</span></div>${renderCmsDownloadGrid(data.files)}</section>
    </div>
  `;
}

function renderCmsFinancePage(data) {
  const revenueRows = data.financialsByType.monthly_revenue || [];
  const quarterly = data.financialsByType.quarterly_report || [];
  const annual = data.financialsByType.annual_report || [];
  const revenueChart = data.chartsByKey["monthly-revenue-trend"]?.[0];
  const serviceMix = data.chartsByKey["service-mix"]?.[0];
  const latest = revenueRows[0];
  const config = getInvestorConfig("ir-finance");
  return `
    <div class="investor-page finance-page">
      <section class="ir-sub-hero finance-visual"><div><a class="search-back" href="#investors">返回投資人專區</a><p class="eyebrow">${escapeHTML(config.eyebrow || "Financial Information")}</p><h1>${escapeHTML(config.title || "財務資訊")}</h1><p>${escapeHTML(config.body || "彙整月營收、財務分析、季報年報與可公開下載資料，協助投資人理解營運變化。")}</p></div><aside class="finance-hero-chart"><span>${escapeHTML(config.snapshot_label || "Revenue Trend")}</span><strong>${escapeHTML(latest?.amount_label || config.snapshot_value || "更新中")}</strong><p>${escapeHTML(latest?.growth_label || config.snapshot_note || "最近月營收")}</p></aside></section>
      <nav class="investor-tabs ir-finance-tabs" aria-label="財務資訊分頁"><button class="active" type="button" data-ir-tab="monthly-revenue">每月營收</button><button type="button" data-ir-tab="finance-analysis">財務資訊分析</button><button type="button" data-ir-tab="quarterly-reports">季度財報</button><button type="button" data-ir-tab="annual-reports">股東會年報</button></nav>
      ${renderInvestorKpis(config.kpis || [{ label: "Monthly Revenue", value: latest?.amount_label || "--", note: "最近月營收" }, { label: "Growth", value: latest?.growth_label || "--", note: "成長率" }, { label: "Reports", value: String(quarterly.length), note: "季度財報" }, { label: "Files", value: String(data.files.length), note: "下載檔" }])}
      <section class="ir-tab-panel active" data-ir-panel="monthly-revenue"><div class="investor-section-head"><p class="eyebrow">Monthly Revenue</p><h2>每月營收</h2><span>月營收表格與圖表會依最新公開資料更新。</span></div><div class="finance-dashboard">${renderCmsChartCard(revenueChart, "wide") || `<article class="chart-card wide"><div class="chart-card-head"><span>月營收趨勢</span><strong>${escapeHTML(latest?.amount_label || "--")}</strong></div>${renderCmsBarChart([])}</article>`}${renderCmsChartCard(serviceMix) || `<article class="chart-card"><div class="chart-card-head"><span>服務收入組成</span><strong>100%</strong></div>${renderCmsDonutChart([], "Revenue")}</article>`}</div><div class="investor-table-card"><div class="table-title"><h3>月營收公告</h3><a href="#contact">訂閱財務通知</a></div><table><thead><tr><th>月份</th><th>營收</th><th>成長</th><th>說明</th><th>下載</th></tr></thead><tbody>${revenueRows.map((row) => `<tr><td>${escapeHTML(row.period_label)}</td><td>${escapeHTML(row.amount_label || "")}</td><td>${escapeHTML(row.growth_label || "")}</td><td>${escapeHTML(row.note || "")}</td><td>${renderInvestorDownloadCell(row.file, "PDF")}</td></tr>`).join("")}</tbody></table></div></section>
      <section class="ir-tab-panel" data-ir-panel="finance-analysis"><div class="investor-section-head"><p class="eyebrow">Analysis</p><h2>財務資訊分析</h2><span>可用投資人公告或下載檔補充管理層討論與分析。</span></div>${renderCmsDownloadGrid(data.filesByCategory.finance || data.files)}</section>
      <section class="ir-tab-panel" data-ir-panel="quarterly-reports"><div class="investor-section-head"><p class="eyebrow">Quarterly Reports</p><h2>季度財報</h2><span>季度財報與下載檔會依公開時程整理上架。</span></div><div class="investor-table-card compact-table"><table><thead><tr><th>文件</th><th>期間</th><th>說明</th><th>下載</th></tr></thead><tbody>${quarterly.map((row) => `<tr><td>${escapeHTML(row.title)}</td><td>${escapeHTML(row.period_label)}</td><td>${escapeHTML(row.note || "")}</td><td>${renderInvestorDownloadCell(row.file)}</td></tr>`).join("")}</tbody></table></div></section>
      <section class="ir-tab-panel" data-ir-panel="annual-reports"><div class="investor-section-head"><p class="eyebrow">Annual Reports</p><h2>股東會年報</h2><span>年度報告、議事手冊與附件集中管理。</span></div>${renderCmsDownloadGrid((data.filesByCategory.annual_report || []).concat(annual.map((item) => item.file).filter(Boolean)))}</section>
    </div>
  `;
}

function renderCmsGovernancePage(data) {
  const notices = data.noticesByType.governance || [];
  const files = data.filesByCategory.governance || [];
  const charts = data.charts.filter((chart) => chart.page_slug === "ir-governance");
  const config = getInvestorConfig("ir-governance");
  return `
    <div class="investor-page governance-page">
      <section class="ir-sub-hero governance-visual"><div><a class="search-back" href="#investors">返回投資人專區</a><p class="eyebrow">${escapeHTML(config.eyebrow || "Corporate Governance")}</p><h1>${escapeHTML(config.title || "公司治理")}</h1><p>${escapeHTML(config.body || "整理治理公告、制度文件、稽核與風險資訊，讓公司治理狀態更透明。")}</p></div><aside class="governance-hero-card"><span>${escapeHTML(config.snapshot_label || "Governance")}</span><div class="score-ring governance-score"><b>${escapeHTML(config.snapshot_value || "91")}</b><span>${escapeHTML(config.snapshot_unit || "Index")}</span></div><p>${escapeHTML(config.snapshot_note || "治理成熟度")}</p></aside></section>
      <nav class="investor-tabs governance-tabs" aria-label="公司治理分頁"><button class="active" type="button" data-ir-tab="governance-news">重要訊息</button><button type="button" data-ir-tab="governance-operation">治理文件</button><button type="button" data-ir-tab="risk-management">風險管理</button></nav>
      ${renderInvestorKpis(config.kpis || [{ label: "Notices", value: String(notices.length), note: "治理公告" }, { label: "Files", value: String(files.length), note: "治理下載" }, { label: "Audit", value: "92%", note: "稽核完成率" }, { label: "Cases", value: "0", note: "重大未結" }])}
      ${renderCmsChartGrid(charts)}
      <section class="ir-tab-panel active" data-ir-panel="governance-news"><div class="investor-section-head"><p class="eyebrow">Material Information</p><h2>重要訊息</h2><span>整理公司治理相關公告與重大訊息。</span></div><div class="ir-update-card">${renderCmsNoticeLinks(notices, "#ir-governance")}</div></section>
      <section class="ir-tab-panel" data-ir-panel="governance-operation"><div class="investor-section-head"><p class="eyebrow">Documents</p><h2>治理文件</h2><span>公司治理、誠信經營、稽核與風險文件從下載檔管理。</span></div>${renderCmsDownloadGrid(files)}</section>
      <section class="ir-tab-panel" data-ir-panel="risk-management"><div class="investor-section-head"><p class="eyebrow">Risk</p><h2>風險管理</h2><span>可上傳風險管理政策與年度報告。</span></div>${renderCmsDownloadGrid(files)}</section>
    </div>
  `;
}

function renderCmsShareholdersPage(data) {
  const notices = data.noticesByType.shareholder || [];
  const files = (data.filesByCategory.shareholder || []).concat(data.filesByCategory.annual_report || []);
  const charts = data.charts.filter((chart) => chart.page_slug === "ir-shareholders");
  const config = getInvestorConfig("ir-shareholders");
  return `
    <div class="investor-page shareholders-page">
      <section class="ir-sub-hero shareholders-visual"><div><a class="search-back" href="#investors">返回投資人專區</a><p class="eyebrow">${escapeHTML(config.eyebrow || "Shareholders")}</p><h1>${escapeHTML(config.title || "股東專區")}</h1><p>${escapeHTML(config.body || "彙整股務資訊、股東會、法說會與常見問答，協助股東快速找到需要的資料。")}</p></div><aside class="shareholder-hero-card"><span>${escapeHTML(config.snapshot_label || "Shareholder Service")}</span><strong>${escapeHTML(config.snapshot_value || String(files.length))}</strong><p>${escapeHTML(config.snapshot_note || "已上架股東文件")}</p></aside></section>
      <nav class="investor-tabs shareholder-tabs" aria-label="股東專區分頁"><button class="active" type="button" data-ir-tab="stock-affairs">股務資訊</button><button type="button" data-ir-tab="shareholder-meeting">股東會</button><button type="button" data-ir-tab="investor-conference">法說會</button><button type="button" data-ir-tab="shareholder-faq">常見問答</button></nav>
      ${renderInvestorKpis(config.kpis || [{ label: "Notices", value: String(notices.length), note: "股東公告" }, { label: "Files", value: String(files.length), note: "股東文件" }, { label: "Contact", value: "IR", note: "投資人窗口" }, { label: "FAQ", value: "Online", note: "常見問答" }])}
      ${renderCmsChartGrid(charts)}
      <section class="ir-tab-panel active" data-ir-panel="stock-affairs"><div class="investor-section-head"><p class="eyebrow">Stock Affairs</p><h2>股務資訊</h2><span>整理股東服務、股務公告與聯絡窗口資訊。</span></div><div class="ir-update-card">${renderCmsNoticeLinks(notices, "#ir-shareholders")}</div></section>
      <section class="ir-tab-panel" data-ir-panel="shareholder-meeting"><div class="investor-section-head"><p class="eyebrow">Meeting</p><h2>股東會</h2><span>股東會年報、議事手冊與附件由檔案下載管理。</span></div>${renderCmsDownloadGrid(files)}</section>
      <section class="ir-tab-panel" data-ir-panel="investor-conference"><div class="investor-section-head"><p class="eyebrow">Conference</p><h2>法說會</h2><span>法說會簡報、影音與問答資料將依公開時程整理。</span></div>${renderCmsDownloadGrid(data.filesByCategory.investor || [])}</section>
      <section class="ir-tab-panel" data-ir-panel="shareholder-faq"><div class="investor-section-head"><p class="eyebrow">FAQ</p><h2>常見問答</h2><span>${escapeHTML(config.faq_intro || "整理股東與投資人常見問題，讓資料查詢更直覺。")}</span></div>${renderInvestorFaq(config)}</section>
    </div>
  `;
}

async function fetchWordPressJSON(path) {
  const response = await fetch(`${WP_API_BASE}${path}`);
  if (!response.ok) throw new Error(`WordPress API error: ${response.status}`);
  return response.json();
}

async function fetchCategoryId(slug) {
  const categories = await fetchWordPressJSON(`/categories?slug=${encodeURIComponent(slug)}`);
  return categories?.[0]?.id || null;
}

async function fetchPostsByCategory(slug, limit = 10) {
  const categoryId = await fetchCategoryId(slug);
  if (!categoryId) return [];
  return fetchWordPressJSON(`/posts?categories=${categoryId}&per_page=${limit}&_embed`);
}

function renderWordPressNews(posts, panel, yearOnly = false) {
  if (!posts.length || !panel) return;
  panel.innerHTML = posts.map((post) => `
    <article>
      <time>${escapeHTML(formatPostDate(post.date, yearOnly))}</time>
      <strong>${post.title?.rendered || ""}</strong>
      <p>${escapeHTML(stripHTML(post.excerpt?.rendered || post.content?.rendered || ""))}</p>
    </article>
  `).join("");
}

function renderWordPressStories(posts) {
  if (!posts.length) return;
  const stories = posts.map((post) => {
    const acf = post.acf || {};
    const name = acf.family_name || acf.person_name || stripHTML(post.title?.rendered || "家屬回饋");
    const service = acf.service_type || "居家照顧";
    const quote = acf.quote || stripHTML(post.title?.rendered || "");
    const feedback = acf.short_feedback || stripHTML(post.excerpt?.rendered || post.content?.rendered || "");
    return {
      name,
      service,
      title: quote,
      praise: feedback,
      avatar: testimonialAvatarUrl(name, service, getPostImage(post, "assets/homepage-batch/orange-polo-caregiver-clear.jpg"))
    };
  });
  renderCareStorySlider(stories);
}

function renderWordPressHealth(posts) {
  const articleRow = document.querySelector(".home-health-section .article-row");
  if (!posts.length || !articleRow) {
    renderHomeHealthArticles();
    return;
  }
  const [feature, ...items] = posts;
  const miniItems = items.slice(0, 4);
  articleRow.innerHTML = `
    <article class="health-preview feature">
      <img src="${escapeHTML(getPostImage(feature))}" alt="${escapeHTML(stripHTML(feature.title?.rendered || "Health 3.0"))}" />
      <div><span>熱門文章</span><h3>${feature.title?.rendered || ""}</h3><p>${escapeHTML(stripHTML(feature.excerpt?.rendered || feature.content?.rendered || ""))}</p><a href="${escapeHTML(feature.link || "#health")}" target="_blank" rel="noopener">閱讀更多</a></div>
    </article>
    <div class="mini-article-grid">
      ${miniItems.map((post) => `
        <article class="health-preview compact">
          <img src="${escapeHTML(getPostImage(post))}" alt="${escapeHTML(stripHTML(post.title?.rendered || "Health 3.0"))}" />
          <div><span>照顧知識</span><h3>${post.title?.rendered || ""}</h3><a href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">閱讀更多</a></div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderHomeHealthArticles(articles = getHealthArticleList()) {
  const articleRow = document.querySelector(".home-health-section .article-row");
  if (!articleRow) return false;
  const latest = sortHealthArticlesLatest(uniqueHealthArticles(articles))
    .filter((article) => article.href && article.title)
    .slice(0, 5);
  if (!latest.length) return false;

  const [feature, ...miniItems] = latest;
  articleRow.innerHTML = `
    <article class="health-preview feature click-card" data-href="${escapeHTML(normalizePublicHref(feature.href))}" tabindex="0" role="link">
      <img ${healthArticleImageAttrs(feature, { usage: feature.imageUsage || "article_cover", focalPoint: feature.focalPoint })} />
      <div>
        <span>${escapeHTML(feature.category || "最新文章")}</span>
        <h3>${escapeHTML(feature.title)}</h3>
        <p>${escapeHTML(feature.subtitle || feature.excerpt || "")}</p>
        <a href="${escapeHTML(normalizePublicHref(feature.href))}">閱讀更多</a>
      </div>
    </article>
    <div class="mini-article-grid">
      ${miniItems.map((post) => `
        <article class="health-preview compact click-card" data-href="${escapeHTML(normalizePublicHref(post.href))}" tabindex="0" role="link">
          <img ${healthArticleImageAttrs(post, { usage: "card", focalPoint: post.focalPoint })} />
          <div>
            <span>${escapeHTML(post.category || "照顧知識")}</span>
            <h3>${escapeHTML(post.title)}</h3>
            <a href="${escapeHTML(normalizePublicHref(post.href))}">閱讀更多</a>
          </div>
        </article>
      `).join("")}
    </div>
  `;
  return true;
}

function renderWordPressMasterTalk(posts) {
  const slider = document.querySelector(".celebrity-slider");
  if (!posts.length || posts.length < HOMEPAGE_MASTER_TALK_LIMIT || !slider) return false;
  const homepagePosts = posts.slice(0, HOMEPAGE_MASTER_TALK_LIMIT);
  slider.innerHTML = homepagePosts.map((post) => {
    const acf = post.acf || {};
    const speaker = [acf.speaker_title, acf.speaker_name].filter(Boolean).join(" ") || "名人講堂";
    const portrait = masterTalkPortraitUrl(post.slug, speaker, post.title?.rendered, getPostImage(post, "assets/master-talk/portrait-care-psychology-chou.jpg"));
    return `
      <article>
        <figure>
          <img src="${escapeHTML(portrait)}" alt="${escapeHTML(speaker)}" />
          <figcaption>${escapeHTML(speaker)}</figcaption>
        </figure>
        <div>
          <h3>${post.title?.rendered || ""}</h3>
          <p>${escapeHTML(stripHTML(acf.summary || post.excerpt?.rendered || post.content?.rendered || ""))}</p>
          <a href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">閱讀更多</a>
        </div>
      </article>
    `;
  }).join("");
  return true;
}

function groupHomeModules(items = []) {
  return items.reduce((groups, item) => {
    if (!groups[item.module_key]) groups[item.module_key] = [];
    groups[item.module_key].push(item);
    return groups;
  }, {});
}

const homepageLatestUpdates = {
  news: [
    {
      date: "2026.08",
      title: "歲悅長照系統專案管理模組上線",
      body: "專案管理模組正式上線，協助照顧服務、政府計畫、內部任務與跨部門進度更清楚被追蹤。"
    },
    {
      date: "2026.08",
      title: "歲悅長照系統電子用印模組上線",
      body: "電子用印模組導入行政流程，讓文件申請、核准、用印與紀錄留存更有效率。"
    },
    {
      date: "2026.07",
      title: "併購新北市愛無限居家長照機構與好窩居家職能治療所",
      body: "整合新店、中和、永和居家照顧服務，並納入復能與個案管理專業，擴大新北照顧服務網絡。"
    },
    {
      date: "2026.06",
      title: "設立臺北市歲悅社區長照機構萬華二館",
      body: "萬華二館完成設立，延伸社區長照服務量能，讓臺北市西區家庭有更多在地支持。"
    },
    {
      date: "2026.05",
      title: "歲悅長照系統會計模組上線",
      body: "會計模組正式上線，串接財務、行政與照顧營運資料，強化內部管理與服務紀錄銜接。"
    },
    {
      date: "2026.03",
      title: "參與 Team Taipei 挺就業青年畢業啟航",
      body: "參與臺北市勞工局 115 年度青年就業活動，與青年人才交流長照職涯、服務現場與未來發展。"
    },
    {
      date: "2025.12",
      title: "設立臺北市歲悅社區長照機構萬華一館",
      body: "萬華一館完成設立，作為社區長照服務的重要起點，提供長輩日間支持與家屬照顧資源。"
    },
    {
      date: "2025.06",
      title: "成立臺北市歲悅居家長照機構",
      body: "士林、北投、南港區居家長照服務啟動，建立臺北市到宅照顧、督導管理與家庭支持基礎。"
    }
  ],
  awards: [
    {
      date: "2026.06",
      title: "得標臺北市失智社區服務據點",
      body: "得標士林、大同、信義區失智社區服務據點，提供失智友善活動、家屬諮詢與社區支持。"
    },
    {
      date: "2026.04",
      title: "得標臺北市雇主安心計畫集中訓練",
      body: "得標臺北市勞動力重建運用處 115 年度「雇主安心計畫-集中訓練」，協助家庭雇主與看護工作者提升照顧品質。"
    },
    {
      date: "2026.02",
      title: "得標移工數位學習計畫",
      body: "得標勞動部勞動力發展署 115-116 年度「移工數位學習計劃」，推動移工照顧技能數位化學習。"
    },
    {
      date: "2025.10",
      title: "得標家庭看護工作補充訓練計畫",
      body: "得標高雄市政府勞工局 115 年度「外國人從事家庭看護工作補充訓練計畫」，強化家庭看護照顧訓練支持。"
    }
  ]
};

function renderHomeUpdateItems(items, panel) {
  if (!items?.length || !panel) return;
  panel.innerHTML = items.map((item) => `
    <article>
      <time>${escapeHTML(item.date || item.date_label || item.eyebrow || "")}</time>
      <strong>${escapeHTML(item.title || "")}</strong>
      <p>${escapeHTML(item.body || item.subtitle || "")}</p>
    </article>
  `).join("");
}

function renderHomepageLatestUpdates() {
  renderHomeUpdateItems(homepageLatestUpdates.news, document.querySelector('[data-news-panel="news"]'));
  renderHomeUpdateItems(homepageLatestUpdates.awards, document.querySelector('[data-news-panel="awards"]'));
}

function renderSupabaseNews(items, panel) {
  renderHomeUpdateItems(items, panel);
}

function recruitCardFallbackImage(item = {}, index = 0) {
  const text = `${item?.title || ""} ${item?.subtitle || ""} ${item?.body || ""} ${item?.link_url || ""}`;
  if (/督導|supervisor/.test(text)) return "assets/homepage-batch/orange-polo-supervisor-clear-display.jpg";
  if (/日照|日間|day.?care/.test(text)) return "assets/daycare-recruit-02-exercise-clear-display.jpg";
  if (/個案|管理師|照顧計畫|case/.test(text)) return "assets/homepage-batch/03-supervisor-care-plan-fast.jpg";
  if (/護理|nursing/.test(text)) return "assets/daycare-detail-04-checkin-fast.jpg";
  if (/失智|社區|據點|community/.test(text)) return "assets/homepage-batch/12-community-health-class-hires.jpg";
  if (/移工|菲律賓|migrant|philippines/i.test(text)) return "assets/migrant-recruit-04-communication-fast.jpg";
  if (/活動|企劃|品管|訓練|quality|training/.test(text)) return "assets/quality-recruit-02-training-clear-display.jpg";
  if (/業務負責|行政|營運|桃園|admin|operation/.test(text)) return "assets/admin-recruit-02-operations-hires.jpg";
  return [
    "assets/homepage-batch/orange-polo-caregiver-clear-display.jpg",
    "assets/homepage-batch/orange-polo-supervisor-clear-display.jpg",
    "assets/daycare-recruit-02-exercise-clear-display.jpg"
  ][index] || "assets/homepage-batch/orange-polo-caregiver-clear-display.jpg";
}

function renderSupabaseRecruit(items) {
  const recruitList = document.querySelector(".recruit-list");
  if (!items?.length || !recruitList) return;

  recruitList.innerHTML = items.map((item, index) => {
    const fallback = contentImageUrl(recruitCardFallbackImage(item, index));
    const image = getCmsDisplayModuleImage(item, fallback);
    return `
      <a href="${escapeHTML(normalizePublicHref(item.link_url || "/talent"))}">
        <figure>
          <img src="${escapeHTML(image)}" alt="${escapeHTML(item.title || "員工招募")}" data-fallback-src="${escapeHTML(fallback)}" />
          <figcaption>${escapeHTML(item.title || "員工招募")}</figcaption>
        </figure>
        <div><p>${escapeHTML(item.body || item.subtitle || "")}</p></div>
      </a>
    `;
  }).join("");
}

function renderSupabaseVideo(items) {
  const video = items?.[0];
  const frame = document.querySelector(".youtube-frame iframe");
  if (!frame) return;

  const nextSource = normalizeYouTubeEmbedUrl(video?.link_url || video?.body || video?.metadata?.youtube_url || HOME_UNIT_VIDEO_URL);
  frame.src = nextSource.includes(LEGACY_HOME_UNIT_VIDEO_ID) ? HOME_UNIT_VIDEO_URL : nextSource;
  frame.loading = "lazy";
  frame.allow = YOUTUBE_IFRAME_ALLOW;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  if (video?.title) frame.title = video.title;
}

function renderSupabaseStories(items) {
  if (!items?.length) return;
  const stories = items.map((item) => {
    const name = item.subtitle || item.metadata?.person_name || "家屬回饋";
    const service = item.badge_label || item.metadata?.service_type || "居家照顧";
    const image = testimonialAvatarUrl(name, service, getCmsDisplayModuleImage(item, "assets/homepage-batch/orange-polo-caregiver-clear.jpg"));
    return {
      name,
      service,
      title: item.title || "",
      praise: item.body || "",
      avatar: image
    };
  });
  renderCareStorySlider(stories);
}

function renderSupabaseMasterTalk(items) {
  const slider = document.querySelector(".celebrity-slider");
  if (!items?.length || items.length < HOMEPAGE_MASTER_TALK_LIMIT || !slider) return false;

  const homepageItems = items.slice(0, HOMEPAGE_MASTER_TALK_LIMIT);
  slider.innerHTML = homepageItems.map((item) => {
    const speaker = item.subtitle || item.metadata?.speaker || "名人講堂";
    const image = masterTalkPortraitUrl(item.key, speaker, item.title, item.body, getCmsDisplayModuleImage(item, "assets/master-talk/portrait-care-psychology-chou.jpg"));
    const href = normalizePublicHref(item.link_url || "/health");
    return `
      <article data-href="${escapeHTML(href)}">
        <figure>
          <img src="${escapeHTML(image)}" alt="${escapeHTML(speaker)}" />
          <figcaption>${escapeHTML(speaker)}</figcaption>
        </figure>
        <div>
          <h3>${escapeHTML(item.title || "")}</h3>
          <p>${escapeHTML(item.body || "")}</p>
          <a href="${escapeHTML(href)}">${escapeHTML(item.link_text || "閱讀更多")}</a>
        </div>
      </article>
    `;
  }).join("");
  return true;
}

function renderSupabaseHero(items) {
  const item = items?.[0];
  const hero = home?.querySelector(".hero");
  if (!item || !hero) return;

  const image = heroImageForViewport(instantHeroAssetUrl(getCmsModuleImage(item, HOME_HERO_INSTANT_IMAGE), HOME_HERO_INSTANT_IMAGE));
  preloadHeroImage(image);
  const background = hero.querySelector(".hero-bg");
  if (background) {
    background.style.backgroundImage = `
      linear-gradient(90deg, rgba(255, 248, 238, 0.72) 0%, rgba(255, 248, 238, 0.5) 38%, rgba(255, 248, 238, 0.12) 68%, rgba(255, 248, 238, 0) 100%),
      linear-gradient(180deg, rgba(255, 248, 238, 0.06), rgba(255, 248, 238, 0.18)),
      url("${image}")
    `;
    background.style.backgroundPosition = item.metadata?.image_position || "center";
    background.style.backgroundSize = "cover";
    background.style.backgroundRepeat = "no-repeat";
  }

  const setText = (selector, value) => {
    const element = hero.querySelector(selector);
    if (element && value) element.textContent = value;
  };
  const eyebrow = item.eyebrow === "Professional Care Network" ? "AI Empowered Suiyuecare System" : item.eyebrow;
  setText('[data-cms-field="eyebrow"]', eyebrow);
  setText('[data-cms-field="title"]', item.title);
  setText('[data-cms-field="subtitle"]', item.subtitle);
  setText('[data-cms-field="body"]', item.body);

  const primary = hero.querySelector('[data-cms-button="primary"]');
  const secondary = hero.querySelector('[data-cms-button="secondary"]');
  if (primary) {
    if (item.link_text) primary.textContent = item.link_text;
    if (item.link_url) primary.href = normalizePublicHref(item.link_url);
  }
  if (secondary) {
    if (item.metadata?.secondary_text) secondary.textContent = item.metadata.secondary_text;
    if (item.metadata?.secondary_url) secondary.href = normalizePublicHref(item.metadata.secondary_url);
  }

  const stats = Array.isArray(item.metadata?.stats) ? item.metadata.stats : [];
  const statsRoot = hero.querySelector(".dash-stats");
  if (stats.length && statsRoot) {
    statsRoot.innerHTML = stats.map((stat) => `
      <article><strong>${escapeHTML(stat.value || "")}</strong><span>${escapeHTML(stat.label || "")}</span></article>
    `).join("");
  }
}

function renderSupabaseServices(items) {
  const grid = document.querySelector(".service-grid");
  if (!items?.length || !grid) return;

  grid.innerHTML = items.map((item, index) => {
    const image = fastAssetUrl(getServiceCardImage(item, index));
    const href = normalizePublicHref(item.link_url || "#contact");
    return `
      <a href="${escapeHTML(href)}">
        <img src="${escapeHTML(image)}" alt="${escapeHTML(item.metadata?.image_alt || `${item.title}服務情境`)}" />
        <span>${escapeHTML(item.badge_label || String(index + 1).padStart(2, "0"))}</span>
        <strong>${escapeHTML(item.title || "")}</strong>
        <p>${escapeHTML(item.body || item.subtitle || "")}</p>
      </a>
    `;
  }).join("");
}

const locationImageFallbacks = {
  shilin: "assets/homepage-batch/16-taipei-service-office-fast.jpg",
  datong: "assets/homepage-batch/family-consultation-clear.jpg",
  "wanhua-a": "assets/homepage-batch/07-orange-apron-meal-prep-fast.jpg",
  "wanhua-b": "assets/homepage-batch/14-care-notes-fast.jpg",
  xinyi: "assets/homepage-batch/family-consultation-clear.jpg",
  xindian: "assets/homepage-batch/12-community-health-class-hires.jpg",
  xinzhuang: "assets/homepage-batch/12-community-health-class-hires.jpg",
  luzhu: "assets/homepage-batch/13-rehab-walking-practice-fast.jpg"
};

function locationImageFallbackForKey(key = "") {
  const normalizedKey = String(key || "").replace(/-a$|-b$/g, "");
  return locationImageFallbacks[key] || locationImageFallbacks[normalizedKey] || fallbackImages.serviceModule;
}

function normalizeLocationImage(item, key) {
  const fallback = normalizeLocalAssetUrl(contentImageUrl(locationImageFallbackForKey(key)));
  const image = normalizeLocalAssetUrl(contentImageUrl(item?.image?.public_url || item?.metadata?.image_url || fallback));
  return { image, fallback };
}

function normalizeSupabaseLocation(item) {
  const metadata = item.metadata || {};
  const key = item.item_key || item.id;
  const email = metadata.email || "generalaffairs@suiyuecare.com";
  const phone = metadata.phone || item.link_text || "02-6604-5432";
  const normalizedImage = normalizeLocationImage(item, key);
  return {
    image: normalizedImage.image,
    fallbackImage: normalizedImage.fallback,
    alt: metadata.image_alt || `${item.title}據點照片`,
    type: item.subtitle || metadata.type || "服務據點",
    name: item.title || "Suiyuecare Corps. 服務據點",
    desc: item.body || "",
    services: item.badge_label || metadata.services || "",
    hours: item.date_label || metadata.hours || "",
    phone,
    phoneHref: metadata.phone_href || `tel:${phone.replace(/[^\d+]/g, "")}`,
    address: metadata.address || "",
    email,
    key,
    pinLabel: metadata.pin_label || item.title || key,
    pinClass: metadata.pin_class || `pin-${key.replace(/-a|-b/g, "")}`,
    pinStyle: metadata.pin_style || "",
    tabGroup: metadata.tab_group || "",
    tabLabel: metadata.tab_label || ""
  };
}

function renderSupabaseLocations(items) {
  if (!items?.length) return;
  const map = document.querySelector(".north-map");
  if (!map) return;

  const nextLocationData = {};
  const pinItems = [];
  items.forEach((item) => {
    const data = normalizeSupabaseLocation(item);
    nextLocationData[data.key] = data;
    const existingPinKey = data.tabGroup ? Object.values(nextLocationData).find((location) => location.tabGroup === data.tabGroup)?.key : "";
    if (!data.tabGroup || existingPinKey === data.key) pinItems.push(data);
  });

  locationData = nextLocationData;
  map.querySelectorAll(".location-pin").forEach((pin) => pin.remove());
  pinItems.forEach((data, index) => {
    const button = document.createElement("button");
    button.className = `location-pin ${data.pinClass || ""} ${index === 0 ? "active" : ""}`.trim();
    button.type = "button";
    button.dataset.location = data.key;
    button.textContent = data.pinLabel;
    if (data.pinStyle) button.setAttribute("style", data.pinStyle);
    map.appendChild(button);
  });

  bindLocationControls();
  updateLocation(pinItems[0]?.key || Object.keys(locationData)[0]);
}

function renderSupabasePartners(items) {
  const track = document.querySelector(".partners-track");
  if (!items?.length || !track) return;

  const partnerItems = items.map((item) => {
    const image = getCmsModuleImage(item, "assets/company-logo.png");
    const href = normalizePublicHref(item.link_url || "#contact");
    return `
      <a class="partner-item" href="${escapeHTML(href)}" target="_blank" rel="noopener">
        <img src="${escapeHTML(image)}" alt="" />
        <span>${escapeHTML(item.title || "")}</span>
      </a>
    `;
  }).join("");
  track.innerHTML = partnerItems + partnerItems;
}

function setSectionText(root, selector, value) {
  if (!root || !value) return;
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
}

function renderSupabaseSectionSettings(items) {
  if (!items?.length) return;
  items.forEach((item) => {
    const selector = item.metadata?.selector || `[data-cms-section="${item.item_key}"]`;
    const root = document.querySelector(selector);
    if (!root) return;

    if (isStaticHomeHeroSection(root)) {
      root.hidden = false;
      root.classList.remove("is-cms-hidden");
      return;
    }

    root.hidden = Boolean(item.metadata?.hidden);
    root.classList.toggle("is-cms-hidden", Boolean(item.metadata?.hidden));
    if (item.metadata?.hidden) return;

    if (root.matches(".celebrity-head")) {
      setSectionText(root, ".eyebrow", item.eyebrow);
      setSectionText(root, "h3", item.title);
      return;
    }

    if (root.matches(".partners-strip")) {
      setSectionText(root, ".partners-heading span", item.eyebrow);
      setSectionText(root, ".partners-heading strong", item.title);
      return;
    }

    setSectionText(root, '[data-cms-field="eyebrow"]', item.eyebrow);
    setSectionText(root, '[data-cms-field="title"]', item.title);
    setSectionText(root, '[data-cms-field="subtitle"]', item.subtitle);
    setSectionText(root, '[data-cms-field="body"]', item.body || item.subtitle);
    setSectionText(root, ".section-head > p", item.body || item.subtitle);
    setSectionText(root, ".section-head > div > .eyebrow", item.eyebrow);
    setSectionText(root, ".section-head > div > h2", item.title);
  });
}

const defaultPrimaryNav = [
  { type: "group", label: "服務項目", items: [
    { label: "關於歲悅", href: "/about" }, { label: "大事記", href: "/milestones" },
    { label: "居家照顧", href: "/home-care" }, { label: "日間照顧", href: "/day-care" },
    { label: "社區據點", href: "/community" }, { label: "護理復能", href: "/nursing" },
    { label: "移工培訓", href: "/migrant-training" }, { label: "教育品管", href: "/quality" },
    { label: "軟體系統", href: "/software" }
  ] },
  { type: "group", label: "招募與合作", items: [
    { label: "人才招募", href: "/talent" }, { label: "土地招募", href: "/land" }, { label: "投資人招募", href: "/investor-recruiting" }
  ] },
  { type: "link", label: "健康3.0", href: "/health" },
  { type: "link", label: "課程報名", href: "/courses" },
  { type: "group", label: "投資人專區", items: [
    { label: "投資人首頁", href: "/investors" }, { label: "財務資訊", href: "/ir-finance" },
    { label: "公司治理", href: "/ir-governance" }, { label: "股東專區", href: "/ir-shareholders" }
  ] },
  { type: "cta", label: "聯絡我們", href: "#contact" }
];

const defaultFooterColumns = [
  { title: "營業項目", items: [
    { label: "居家照顧", href: "/home-care" }, { label: "日間照顧", href: "/day-care" },
    { label: "社區據點", href: "/community" }, { label: "護理復能", href: "/nursing" },
    { label: "教育品管", href: "/quality" }, { label: "軟體系統", href: "/software" }
  ] },
  { title: "合作入口", items: [
    { label: "人才招募", href: "/talent" }, { label: "土地招募", href: "/land" },
    { label: "投資人招募", href: "/investor-recruiting" }
  ] },
  { title: "資訊內容", items: [
    { label: "健康3.0", href: "/health" }, { label: "課程報名", href: "/courses" },
    { label: "投資人專區", href: "/investors" }, { label: "財務資訊", href: "/ir-finance" },
    { label: "聯絡我們", href: "#contact" }
  ] }
];

function normalizeFooterColumns(columns = []) {
  const sourceItems = [
    ...(Array.isArray(columns) ? columns : []),
    ...defaultFooterColumns
  ].flatMap((column) => Array.isArray(column?.items) ? column.items : []);

  return defaultFooterColumns.map((column) => ({
    ...column,
    items: column.items.map((defaultItem) => {
      const sourceItem = sourceItems.find((item) => item?.label === defaultItem.label);
      return {
        label: defaultItem.label,
        href: sourceItem?.href || defaultItem.href
      };
    })
  }));
}

function getSiteText(key, fallback = "") {
  return siteSettings[key]?.value_text || fallback;
}

function getSiteJson(key, fallback = []) {
  const value = siteSettings[key]?.value_json;
  return Array.isArray(value) ? value : fallback;
}

function getSiteObject(key, fallback = {}) {
  const value = siteSettings[key]?.value_json;
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function bindNavigationDropdowns() {
  navGroups = document.querySelectorAll(".nav-group");
  navGroups.forEach((group) => {
    const trigger = group.querySelector(".nav-trigger");
    if (!trigger) return;
    trigger.onclick = () => {
      navGroups.forEach((otherGroup) => {
        if (otherGroup === group) return;
        otherGroup.classList.remove("open");
        otherGroup.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
      });
      const open = group.classList.toggle("open");
      trigger.setAttribute("aria-expanded", String(open));
    };
  });
}

function setActiveNavLink(link, isActive) {
  link.classList.toggle("active", isActive);
  if (isActive) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
}

function renderHeaderNav(items = defaultPrimaryNav) {
  if (!nav || !Array.isArray(items) || !items.length) return;
  nav.innerHTML = items.map((item) => {
    if (item.type === "group" && Array.isArray(item.items)) {
      return `
        <div class="nav-group">
          <button class="nav-trigger" type="button" aria-expanded="false">${escapeHTML(item.label || "選單")}</button>
          <div class="dropdown">
            ${item.items.map((link) => `<a href="${escapeHTML(normalizePublicHref(link.href || "#home"))}">${escapeHTML(link.label || "未命名")}</a>`).join("")}
          </div>
        </div>
      `;
    }
    const className = item.type === "cta" ? ' class="nav-cta"' : "";
    return `<a${className} href="${escapeHTML(normalizePublicHref(item.href || "#home"))}">${escapeHTML(item.label || "未命名")}</a>`;
  }).join("");
  bindNavigationDropdowns();
  const currentSlug = routeSlugFromLocation() || "home";
  const current = `#${currentSlug}`;
  const currentPath = currentSlug === "home" ? "/" : `/${currentSlug}`;
  nav.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    setActiveNavLink(link, href === current || href === currentPath);
  });
}

function renderFooterColumns(columns = defaultFooterColumns) {
  const footerSitemap = document.querySelector(".footer-sitemap");
  const footerColumns = normalizeFooterColumns(columns);
  if (!footerSitemap || !footerColumns.length) return;
  footerSitemap.innerHTML = footerColumns.map((column) => `
    <div>
      <h3>${escapeHTML(column.title || "網站地圖")}</h3>
      ${(column.items || []).map((item) => `<a href="${escapeHTML(normalizePublicHref(item.href || "#home"))}">${escapeHTML(item.label || "未命名")}</a>`).join("")}
    </div>
  `).join("");
}

function applySiteSettings() {
  const brandName = getSiteText("brand_name", "歲悅長照集團");
  const brandNameEn = getSiteText("brand_name_en", "Suiyuecare Corps.");
  const slogan = getSiteText("slogan", "照顧就像去超商，買牛奶一樣簡單。");
  const logoUrl = getSiteText("logo_url", "assets/company-logo.png");
  const phone = getSiteText("phone", "02-6604-5432");
  const email = getSiteText("email", "generalaffairs@suiyuecare.com");
  const footerIntro = getSiteText("footer_intro", "服務諮詢、課程報名、人才合作與投資洽談");
  const copyright = getSiteText("copyright", "© 2026 Suiyuecare Corps. All rights reserved.");
  const contactCtaText = getSiteText("contact_cta_text", "聯絡我們");

  document.querySelectorAll(".brand-mark img").forEach((image) => {
    image.src = logoUrl;
    image.alt = `${brandName} Logo`;
  });
  document.querySelectorAll(".brand strong").forEach((item) => { item.textContent = brandName; });
  document.querySelectorAll(".brand small").forEach((item) => { item.textContent = brandNameEn; });

  const introBrand = document.querySelector(".intro-brand");
  if (introBrand) {
    introBrand.querySelector("span").textContent = brandName;
    introBrand.querySelector("strong").textContent = brandNameEn;
    introBrand.querySelector("em").textContent = slogan;
  }

  renderHeaderNav(getSiteJson("primary_nav", defaultPrimaryNav));
  const navCta = document.querySelector(".primary-nav .nav-cta");
  if (navCta) navCta.textContent = contactCtaText;

  const footerContact = document.querySelector(".footer-contact");
  if (footerContact) {
    footerContact.innerHTML = `
      <h3>聯絡資訊</h3>
      <p>電話 ${escapeHTML(phone)}</p>
      <p>信箱 ${escapeHTML(email)}</p>
      <p>${escapeHTML(footerIntro)}</p>
    `;
  }
  renderFooterColumns(getSiteJson("footer_columns", defaultFooterColumns));
  const footerBottom = document.querySelector(".footer-bottom");
  if (footerBottom) footerBottom.innerHTML = `<span>${escapeHTML(copyright)}</span><span>${escapeHTML(slogan)}</span>`;

  const locationPhone = document.querySelector("#locationPhone");
  const locationEmail = document.querySelector("#locationEmail");
  const locationMail = document.querySelector("#locationMail");
  if (locationPhone) locationPhone.textContent = phone;
  if (locationEmail) locationEmail.textContent = email;
  if (locationMail) locationMail.href = `mailto:${email}`;
}

async function loadSupabaseSiteSettings() {
  if (!supabase) return false;
  if (siteSettingsLoaded) return true;
  if (siteSettingsPromise) return siteSettingsPromise;
  siteSettingsPromise = (async () => {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_key, value_text, value_json")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    siteSettings = (data || []).reduce((acc, item) => {
      acc[item.setting_key] = item;
      return acc;
    }, {});
    siteSettingsLoaded = true;
    applySiteSettings();
    return true;
  } catch (error) {
    console.warn("Supabase site settings unavailable, using static global settings.", error);
    return false;
  } finally {
    siteSettingsPromise = null;
  }
  })();
  return siteSettingsPromise;
}

async function loadSupabaseHomeModules() {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from("content_modules")
      .select("id, module_key, item_key, title, subtitle, eyebrow, body, date_label, badge_label, link_text, link_url, metadata, sort_order, is_featured, image:media!content_modules_image_id_fkey(id, public_url, alt_text, file_name)")
      .eq("target_slug", "home")
      .eq("status", "published")
      .eq("is_enabled", true)
      .order("module_key", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;
    if (!data?.length) return false;

    const groups = groupHomeModules(data);
    renderSupabaseSectionSettings(groups.section_setting);
    renderHomeHealthArticles();
    // Keep the homepage hero static so first paint, hydration, and CMS loading do not swap headers.
    renderHomepageLatestUpdates();
    renderSupabaseRecruit(groups.recruit);
    renderSupabaseVideo(groups.video);
    renderSupabaseMasterTalk(groups.master_talk);
    renderSupabaseServices(groups.service_item);
    renderSupabaseLocations(groups.location);
    renderSupabasePartners(groups.partner);

    homeModulesLoadedFromSupabase = true;
    return true;
  } catch (error) {
    console.warn("Supabase home modules unavailable, falling back to WordPress/static homepage content.", error);
    return false;
  }
}

function normalizeCareStory(row) {
  const cover = normalizeLocalAssetUrl(contentImageUrl(row.cover_image?.public_url || row.cover_image_url || fallbackImages.careStory));
  const avatar = normalizeLocalAssetUrl(testimonialAvatarUrl(row.person_name, row.service_type, row.avatar_image?.public_url || row.avatar_image_url || cover));
  return {
    slug: row.slug,
    href: careStoryHref(row.slug),
    name: row.person_name,
    label: row.person_label || "家屬",
    service: row.service_type,
    title: row.title,
    quote: row.quote,
    praise: row.praise || row.summary || "",
    body: row.story_body || "",
    image: cover,
    avatar,
    date: formatArticleDate(row.published_at),
    tags: row.tags || []
  };
}

function normalizeExpertTalk(row) {
  const image = normalizeLocalAssetUrl(masterTalkCoverUrl(row.slug, row.speaker_name, row.speaker_title, row.topic, row.title, row.image?.public_url || row.image_url || "assets/master-talk/cover-care-psychology-chou.jpg"));
  const portrait = normalizeLocalAssetUrl(masterTalkPortraitUrl(row.slug, row.speaker_name, row.speaker_title, row.topic, row.title, row.image?.public_url || row.image_url || "assets/master-talk/portrait-care-psychology-chou.jpg"));
  return {
    slug: row.slug,
    href: masterTalkHref(row.slug),
    speaker: row.speaker_name,
    titleLabel: row.speaker_title || "名人講堂",
    organization: row.organization || "",
    topic: row.topic || "照顧觀點",
    title: row.title,
    quote: row.quote,
    summary: row.summary || "",
    body: row.body || "",
    image,
    portrait,
    date: formatArticleDate(row.published_at),
    tags: row.tags || []
  };
}

function renderCareStorySlider(stories) {
  const slider = document.querySelector("#home .story-slider");
  const renderedStories = ensureHomepageStoryCoverage(stories);
  if (!renderedStories.length || !slider) return false;
  slider.innerHTML = renderedStories.map((story) => `
    <article>
      <img class="story-face" src="${escapeHTML(story.avatar)}" alt="${escapeHTML(story.name)}頭像" />
      <span class="story-meta"><b>${escapeHTML(story.name)}</b><em>${escapeHTML(story.service)}</em></span>
      <h3>${escapeHTML(story.title)}</h3>
      <div class="story-points"><p>${escapeHTML(story.praise)}</p></div>
    </article>
  `).join("");
  return true;
}

function renderExpertTalkSlider(talks) {
  const slider = document.querySelector(".celebrity-slider");
  if (!talks?.length || talks.length < HOMEPAGE_MASTER_TALK_LIMIT || !slider) return false;
  const homepageTalks = talks.slice(0, HOMEPAGE_MASTER_TALK_LIMIT);
  slider.innerHTML = homepageTalks.map((talk) => `
    <article data-href="${escapeHTML(normalizePublicHref(talk.href))}">
      <figure>
        <img src="${escapeHTML(talk.portrait || talk.image)}" alt="${escapeHTML(`${talk.titleLabel} ${talk.speaker}`)}" />
        <figcaption>${escapeHTML(`${talk.titleLabel} ${talk.speaker}`)}</figcaption>
      </figure>
      <div>
        <h3>${escapeHTML(talk.title)}</h3>
        <p>${escapeHTML(talk.summary || talk.quote || "")}</p>
        <a href="${escapeHTML(normalizePublicHref(talk.href))}">閱讀更多</a>
      </div>
    </article>
  `).join("");
  return true;
}

async function loadSupabaseStoryDatabases() {
  if (!supabase) return false;
  try {
    const now = new Date().toISOString();
    const [{ data: stories, error: storyError }, { data: talks, error: talkError }] = await Promise.all([
      supabase
        .from("care_stories")
        .select("*, cover_image:media!care_stories_cover_image_id_fkey(id, public_url, alt_text), avatar_image:media!care_stories_avatar_image_id_fkey(id, public_url, alt_text)")
        .eq("is_enabled", true)
        .eq("status", "published")
        .lte("published_at", now)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(12),
      supabase
        .from("expert_talks")
        .select("*, image:media!expert_talks_image_id_fkey(id, public_url, alt_text)")
        .eq("is_enabled", true)
        .eq("status", "published")
        .lte("published_at", now)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(HOMEPAGE_MASTER_TALK_LIMIT)
    ]);
    if (storyError) throw storyError;
    if (talkError) throw talkError;
    const normalizedStories = (stories || []).map(normalizeCareStory);
    const normalizedTalks = (talks || []).map(normalizeExpertTalk);
    normalizedStories.forEach((story) => careStoryPageCache.set(story.slug, story));
    normalizedTalks.forEach((talk) => expertTalkPageCache.set(talk.slug, talk));
    const renderedStories = renderCareStorySlider(normalizedStories);
    const renderedTalks = renderExpertTalkSlider(normalizedTalks);
    return renderedStories || renderedTalks;
  } catch (error) {
    console.warn("Supabase care stories / expert talks unavailable.", error);
    return false;
  }
}

async function loadWordPressContent() {
  if (homeModulesLoadedFromSupabase) return;
  try {
    const [careStories, health30, masterTalk] = await Promise.all([
      fetchPostsByCategory(WP_CATEGORIES.careStories, 10),
      fetchPostsByCategory(WP_CATEGORIES.health30, 10),
      fetchPostsByCategory(WP_CATEGORIES.masterTalk, HOMEPAGE_MASTER_TALK_LIMIT)
    ]);

    renderHomepageLatestUpdates();
    renderWordPressStories(careStories);
    renderWordPressHealth(health30);
    renderWordPressMasterTalk(masterTalk);
  } catch (error) {
    console.warn("WordPress content unavailable, using static homepage content.", error);
  }
}

let locationData = {
  shilin: {
    image: "assets/homepage-batch/16-taipei-service-office-fast.jpg",
    alt: "士林服務據點照片",
    type: "臺北市｜居家照顧站",
    name: "歲悅士林失智據點 / 居家長照機構",
    desc: "服務士林、北投生活圈，提供長照需求初談、居家照顧媒合與家屬諮詢。",
    services: "居家照顧、喘息服務、家屬諮詢",
    hours: "週一至週五 09:00-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市士林區照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  datong: {
    image: "assets/homepage-batch/family-consultation-clear.jpg",
    alt: "大同服務據點照片",
    type: "臺北市｜家屬諮詢站",
    name: "歲悅大同失智據點",
    desc: "協助大同、南港與周邊家庭釐清照顧需求，安排到宅照顧與照顧計畫。",
    services: "照顧評估、服務媒合、課程報名",
    hours: "週一至週五 09:00-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市大同區照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  "wanhua-a": {
    image: "assets/homepage-batch/07-orange-apron-meal-prep-fast.jpg",
    alt: "萬華居家服務據點照片",
    type: "臺北市｜居家服務點",
    name: "歲悅萬華日照1館",
    desc: "支援萬華北側社區與高齡家庭，提供日常生活協助、陪伴與照顧紀錄回報。",
    services: "生活照顧、陪伴服務、家屬回報",
    hours: "週一至週六 08:30-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市萬華區北側服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  "wanhua-b": {
    image: "assets/homepage-batch/14-care-notes-fast.jpg",
    alt: "萬華照顧支援據點照片",
    type: "臺北市｜照顧支援點",
    name: "歲悅萬華日照2館",
    desc: "服務萬華南側生活圈，串接居家照顧、喘息安排與健康3.0照顧衛教。",
    services: "喘息服務、健康衛教、照顧諮詢",
    hours: "週一至週五 09:00-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市萬華區南側服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  xinyi: {
    image: "assets/homepage-batch/family-consultation-clear.jpg",
    alt: "信義服務據點照片",
    type: "臺北市｜健康促進站",
    name: "歲悅信義失智據點",
    desc: "提供信義、南港周邊家屬照顧諮詢、預防延緩失能活動與課程報名。",
    services: "健康促進、家屬課程、照顧諮詢",
    hours: "週一至週五 09:00-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "臺北市信義區健康促進據點",
    email: "generalaffairs@suiyuecare.com"
  },
  xindian: {
    image: "assets/homepage-batch/12-community-health-class-hires.jpg",
    alt: "新店日間照顧據點照片",
    type: "新北市｜日間照顧點",
    name: "歲悅新店居家長照機構 / 歲悅職能治療所",
    desc: "以白天托顧、團體活動、共餐與復能安排，支持新店、中和、永和家庭喘息。",
    services: "日間照顧、社區共餐、延緩失能活動",
    hours: "週一至週六 08:30-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "新北市新店區日間照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  xinzhuang: {
    image: "assets/homepage-batch/12-community-health-class-hires.jpg",
    alt: "新莊社區據點照片",
    type: "新北市｜社區照顧點",
    name: "歲悅新莊辦公室",
    desc: "串接新莊周邊社區照顧、預防延緩失能與家庭支持服務。",
    services: "社區據點、健康促進、家屬支持",
    hours: "週一至週五 09:00-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "新北市新莊區社區照顧服務據點",
    email: "generalaffairs@suiyuecare.com"
  },
  luzhu: {
    image: "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
    alt: "蘆竹護理復能據點照片",
    type: "桃園市｜護理復能點",
    name: "歲悅蘆竹居家長照機構",
    desc: "支援蘆竹、大園生活圈，由護理與復能團隊協助建立個案目標並追蹤照顧風險。",
    services: "護理評估、復能訓練、照顧風險追蹤",
    hours: "週一至週五 09:00-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "桃園市蘆竹區護理復能服務中心",
    email: "generalaffairs@suiyuecare.com"
  }
};

function updateLocation(locationKey) {
  const data = locationData[locationKey];
  const detail = document.querySelector("#locationDetail");
  if (!data || !detail) return;
  const activeGroup = data.tabGroup || "";
  const groupedLocations = activeGroup
    ? Object.entries(locationData).filter(([, location]) => location.tabGroup === activeGroup)
    : [];
  const showTabs = groupedLocations.length > 1;

  const detailImage = detail.querySelector("img");
  detailImage.dataset.fallbackApplied = "false";
  detailImage.dataset.fallbackSrc = data.fallbackImage || data.image;
  detailImage.src = data.image;
  detailImage.alt = data.alt;
  document.querySelector("#locationType").textContent = data.type;
  document.querySelector("#locationName").textContent = data.name;
  document.querySelector("#locationDesc").textContent = data.desc;
  document.querySelector("#locationServices").textContent = data.services;
  document.querySelector("#locationHours").textContent = data.hours;
  document.querySelector("#locationPhone").textContent = data.phone;
  document.querySelector("#locationAddress").textContent = data.address;
  document.querySelector("#locationEmail").textContent = data.email;
  document.querySelector("#locationCall").href = data.phoneHref;
  document.querySelector("#locationMail").href = `mailto:${data.email}`;

  const wanhuaTabs = document.querySelector("#wanhuaTabs");
  if (wanhuaTabs) {
    wanhuaTabs.hidden = !showTabs;
    if (showTabs) {
      wanhuaTabs.innerHTML = groupedLocations.map(([key, location]) => `
        <button type="button" class="${key === locationKey ? "active" : ""}" data-location-tab="${escapeHTML(key)}">${escapeHTML(location.tabLabel || location.name)}</button>
      `).join("");
    }
  }

  document.querySelectorAll(".location-pin").forEach((pin) => {
    const pinLocation = locationData[pin.dataset.location];
    const isActive = pin.dataset.location === locationKey || (activeGroup && pinLocation?.tabGroup === activeGroup);
    pin.classList.toggle("active", isActive);
  });
}

function bindLocationControls() {
  document.querySelectorAll(".location-pin").forEach((pin) => {
    if (pin.dataset.boundLocation === "true") return;
    pin.dataset.boundLocation = "true";
    pin.addEventListener("click", () => updateLocation(pin.dataset.location));
  });
}

const healthSectionCategorySlugs = {
  lazyPack: ["lazy-pack", "lazy_pack", "guide", "懶人包"],
  activity: ["activity", "event", "活動專區"],
  video: ["video", "影音", "影片"],
  shortVideo: ["short-video", "short_video", "shorts", "短影片"]
};

function articleMatchesHealthSection(article, slugs = []) {
  const normalizedSlugs = slugs.map((slug) => categorySlug(slug));
  const tagText = (article.tags || []).map(categorySlug).join(" ");
  const typeText = [article.contentType, article.categoryType, article.categorySection].map(categorySlug).join(" ");
  return normalizedSlugs.includes(article.categorySlug) || normalizedSlugs.some((slug) => tagText.includes(slug) || typeText.includes(slug));
}

function getArticleSortTime(article) {
  const rawDate = article.publishedAt || article.date || "";
  const normalized = String(rawDate).replace(/\./g, "-");
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortHealthArticlesLatest(list = []) {
  return [...list].sort((a, b) => getArticleSortTime(b) - getArticleSortTime(a));
}

function uniqueHealthArticles(list = []) {
  const seen = new Set();
  return list.filter((article) => {
    const key = article.slug || article.href || article.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getHealthSectionArticles(sectionKey, fallbackSlugs = []) {
  const allArticles = getHealthArticleList();
  const slugs = healthSectionCategorySlugs[sectionKey] || [];
  const matched = allArticles.filter((article) => articleMatchesHealthSection(article, slugs));
  if (matched.length) return sortHealthArticlesLatest(matched);
  return fallbackSlugs
    .map((slug) => allArticles.find((article) => article.slug === slug))
    .filter(Boolean);
}

function getLatestCareArticles(sourceArticles = []) {
  const specialSections = [
    ...healthSectionCategorySlugs.lazyPack,
    ...healthSectionCategorySlugs.activity,
    ...healthSectionCategorySlugs.video,
    ...healthSectionCategorySlugs.shortVideo
  ];
  const filtered = sourceArticles.filter((article) => !articleMatchesHealthSection(article, specialSections));
  return sortHealthArticlesLatest(filtered.length ? filtered : sourceArticles).slice(0, 6);
}

function getHealthSectionUrl(sectionKey, fallbackQuery) {
  const sectionSlugs = (healthSectionCategorySlugs[sectionKey] || []).map(categorySlug);
  const matchedCategory = getHealthCategoryList().find((category) => {
    const values = [category.slug, category.type, category.sectionKey].map(categorySlug);
    return values.some((value) => sectionSlugs.includes(value));
  });
  return matchedCategory ? `#health?category=${encodeURIComponent(matchedCategory.slug)}` : `#search?q=${encodeURIComponent(fallbackQuery)}`;
}

function renderHealthMiniCard(article, label = article.category) {
  const href = normalizePublicHref(article.href);
  return `
    <article class="health-pack-card click-card" data-href="${escapeHTML(href)}" tabindex="0" role="link">
      <img ${healthArticleImageAttrs(article, { usage: "card", focalPoint: article.focalPoint })} />
      <div><span>${escapeHTML(label)}</span><h3>${escapeHTML(article.title)}</h3><p>${escapeHTML(article.subtitle || article.excerpt || "")}</p></div>
    </article>
  `;
}

function renderHealthEventCard(article) {
  const href = normalizePublicHref(article.href);
  return `
    <article class="health-event-card click-card" data-href="${escapeHTML(href)}" tabindex="0" role="link">
      <img ${healthArticleImageAttrs(article, { usage: "card", focalPoint: article.focalPoint })} />
      <div><time>${escapeHTML(article.date || "近期")}</time><h3>${escapeHTML(article.title)}</h3><p>${escapeHTML(article.subtitle || article.excerpt || "")}</p></div>
    </article>
  `;
}

function renderHealthVideoCard(article, label = article.category) {
  const displayLabel = article.videoLabel || label;
  const href = normalizePublicHref(article.href);
  const media = article.videoEmbedUrl
    ? article.videoProvider === "youtube" || article.videoProvider === "vimeo"
      ? `<iframe src="${escapeHTML(article.videoEmbedUrl)}" title="${escapeHTML(article.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
      : `<video src="${escapeHTML(article.videoEmbedUrl)}" controls preload="metadata" poster="${escapeHTML(getHealthArticleImage(article))}"></video>`
    : `<img ${healthArticleImageAttrs(article, { usage: "card", focalPoint: article.focalPoint })} />`;
  return `
    <article class="health-video-card ${article.videoEmbedUrl ? "has-video" : "click-card"}" ${article.videoEmbedUrl ? "" : `data-href="${escapeHTML(href)}" tabindex="0" role="link"`}>
      ${media}
      <div><span>${escapeHTML(displayLabel)}${article.videoDuration ? ` · ${escapeHTML(article.videoDuration)}` : ""}</span><h3>${escapeHTML(article.title)}</h3>${article.videoCaption ? `<p>${escapeHTML(article.videoCaption)}</p>` : ""}<a href="${escapeHTML(href)}">閱讀更多 &gt;</a></div>
    </article>
  `;
}

function renderHealthPage(selectedCategorySlug = "") {
  const allArticles = getHealthArticleList();
  const categories = getHealthCategoryList();
  const activeCategory = selectedCategorySlug || "";
  const articles = activeCategory
    ? allArticles.filter((article) => article.categorySlug === activeCategory)
    : allArticles;
  const isCategoryView = Boolean(activeCategory);
  const feature = articles[0];
  const quickCards = articles.slice(1, 5);
  const latestCards = getLatestCareArticles(articles);
  const lazyPacks = getHealthSectionArticles("lazyPack", ["longterm-care-apply", "family-care-story", "dementia-response"]).slice(0, 6);
  const eventCards = getHealthSectionArticles("activity", ["family-care-course", "day-care-respite", "reablement-workshop"]).slice(0, 3);
  const mediaCards = uniqueHealthArticles([
    ...getHealthSectionArticles("video", ["home-care-video-guide", "day-care-video-guide", "master-talk-care-psychology"]),
    ...getHealthSectionArticles("shortVideo", ["fall-observation", "bathroom-safety"])
  ]).sort((a, b) => getArticleSortTime(b) - getArticleSortTime(a)).slice(0, 4);

  return `
    <div class="health-page">
      <section class="health-hero">
        <div class="health-topline">
          <div>
            <p class="eyebrow">Health 3.0</p>
            <h1>健康3.0</h1>
            <p>照顧知識專欄，整理疾病徵兆、飲食營養、復能運動、失智照顧與家屬實用技巧。</p>
          </div>
          <form class="health-search">
            <input name="q" type="search" placeholder="搜尋跌倒、失智、營養、復能" />
            <button type="submit">搜尋</button>
          </form>
        </div>
        <div class="health-cats">
          <button class="click-card ${activeCategory ? "" : "active"}" type="button" data-href="#search">全部文章</button>
          ${categories.map((category) => `
            <button class="click-card ${activeCategory === category.slug ? "active" : ""}" type="button" data-href="#search?q=${encodeURIComponent(category.name)}">${escapeHTML(category.name)}</button>
          `).join("")}
        </div>
      </section>

      ${articles.length ? `
      <section class="health-board">
        <article class="health-feature click-card" data-href="${escapeHTML(feature.href)}" tabindex="0" role="link">
          <img ${healthArticleImageAttrs(feature, { usage: feature.imageUsage || "article_cover", focalPoint: feature.focalPoint })} />
          <div>
            <span class="health-tag">本週精選</span>
            <h2>${escapeHTML(feature.title)}</h2>
            <p>${escapeHTML(feature.subtitle || feature.excerpt)}</p>
            <a class="health-readmore" href="${escapeHTML(feature.href)}">閱讀更多</a>
          </div>
        </article>

        <div class="health-quick-grid">
          ${quickCards.map((post) => `
            <article class="health-card click-card" data-href="${escapeHTML(post.href)}" tabindex="0" role="link">
              <img ${healthArticleImageAttrs(post, { usage: "card", focalPoint: post.focalPoint })} />
              <div>
                <span class="health-tag">${escapeHTML(post.category)}</span>
                <h3>${escapeHTML(post.title)}</h3>
                <a href="${escapeHTML(post.href)}">閱讀更多</a>
              </div>
            </article>
          `).join("")}
        </div>

        <aside class="ranking-panel">
          <div class="ranking-title"><span>Ranking</span><h3>熱門文章</h3></div>
          <ol>
            ${articles.slice(0, 6).map((post) => `<li><a href="${escapeHTML(post.href)}">${escapeHTML(post.title)}</a></li>`).join("")}
          </ol>
        </aside>
      </section>
      ` : `
      <section class="health-empty-state">
        <h2>這個分類目前還沒有已發布文章</h2>
        <p>相關內容正在整理中，可以先查看全部文章或搜尋其他照顧主題。</p>
        <a href="#health">查看全部文章</a>
      </section>
      `}

      ${isCategoryView ? "" : `
      <section class="health-latest">
        <div class="health-section-head">
          <div><p class="eyebrow">Latest</p><h2>最新照顧文章</h2></div>
          <a href="#search?q=${encodeURIComponent("照顧")}">查看全部</a>
        </div>
        <div class="health-latest-grid">
          ${latestCards.map((post) => `
            <article class="health-list-card click-card" data-href="${escapeHTML(post.href)}" tabindex="0" role="link">
              <img ${healthArticleImageAttrs(post, { usage: "article_cover", focalPoint: post.focalPoint })} />
              <div>
                <span>${escapeHTML(post.category)}</span>
                <h3>${escapeHTML(post.title)}</h3>
                <p>${escapeHTML(post.subtitle || post.excerpt)}</p>
                <small>${escapeHTML(post.author)} · ${escapeHTML(post.date)}</small>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="health-pack-section">
        <div class="health-section-head">
          <div><p class="eyebrow">Guides</p><h2>懶人包</h2></div>
          <a href="${escapeHTML(getHealthSectionUrl("lazyPack", "懶人包"))}">更多懶人包</a>
        </div>
        <div class="health-pack-grid">
          ${lazyPacks.map((article) => renderHealthMiniCard(article, "懶人包")).join("") || `<div class="health-empty-state"><h2>懶人包整理中</h2><p>我們會陸續補上更容易閱讀的照顧指南。</p></div>`}
        </div>
      </section>

      <section class="health-event-section">
        <div class="health-section-head">
          <div><p class="eyebrow">Events</p><h2>活動專區</h2></div>
          <a href="${escapeHTML(getHealthSectionUrl("activity", "活動專區"))}">更多活動</a>
        </div>
        <div class="health-event-grid">
          ${eventCards.map(renderHealthEventCard).join("") || `<div class="health-empty-state"><h2>活動內容整理中</h2><p>新的講座、課程與社區活動會在確認後放上來。</p></div>`}
        </div>
      </section>

      <section class="health-media-hub">
        <div class="health-section-head">
          <div><p class="eyebrow">Video</p><h2>影音與短影片</h2></div>
          <a href="${escapeHTML(getHealthSectionUrl("video", "影片"))}">更多影音</a>
        </div>
        <div class="health-media-grid">
          ${mediaCards.map((article) => renderHealthVideoCard(article, articleMatchesHealthSection(article, healthSectionCategorySlugs.shortVideo) ? "短影片" : "影片")).join("")}
          ${!mediaCards.length ? `<div class="health-empty-state"><h2>影音內容整理中</h2><p>短影片與照顧示範會在完成後陸續更新。</p></div>` : ""}
        </div>
      </section>
      `}
    </div>
  `;
}

function renderSearchPage(query = "") {
  const keyword = decodeURIComponent(query || "").trim();
  const normalizedKeyword = keyword.toLowerCase();
  const articles = getHealthArticleList();
  const results = normalizedKeyword
    ? articles.filter((post) => `${post.title} ${post.subtitle || ""} ${post.excerpt} ${post.category} ${post.categorySlug || ""} ${post.keywords || ""} ${(post.tags || []).join(" ")}`.toLowerCase().includes(normalizedKeyword))
    : articles;

  return `
    <div class="search-page">
      <section class="search-hero">
        <a class="search-back" href="#health">返回健康3.0</a>
        <p class="eyebrow">Search</p>
        <h1>搜尋照顧知識</h1>
        <form class="health-search search-page-form">
          <input name="q" type="search" value="${escapeHTML(keyword)}" placeholder="搜尋跌倒、失智、營養、復能" />
          <button type="submit">搜尋</button>
        </form>
        <p>${keyword ? `「${escapeHTML(keyword)}」共有 ${results.length} 筆相關內容` : "輸入關鍵字，快速找到文章、影音與照顧資源。"}</p>
      </section>
      <section class="search-results">
        ${results.length ? results.map((post) => `
          <article class="search-result-card click-card" data-href="${escapeHTML(post.href)}" tabindex="0" role="link">
            <img ${healthArticleImageAttrs(post, { usage: "article_cover", focalPoint: post.focalPoint })} />
            <div>
              <span>${escapeHTML(post.category)}</span>
              <h2>${escapeHTML(post.title)}</h2>
              <p>${escapeHTML(post.subtitle || post.excerpt)}</p>
              <small>${escapeHTML(post.author)} · ${escapeHTML(post.date)}</small>
            </div>
          </article>
        `).join("") : `
          <div class="search-empty">
            <h2>目前沒有找到相關內容</h2>
            <p>可以試試「長照申請」、「跌倒」、「失智」、「營養」或「喘息」。</p>
            <a href="#health">回健康3.0</a>
          </div>
        `}
      </section>
    </div>
  `;
}

let supabaseCourses = [];
let coursesLoadedFromSupabase = false;
let coursesLoadFailed = false;
let coursesLoadPromise = null;
let courseCoverById = new Map();

function formatCourseDate(value) {
  if (!value) return "可隨時觀看";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日期待公告";
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date).replace(/\//g, ".");
}

function formatCourseTime(start, end) {
  if (!start) return "可隨時觀看";
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "時間待公告";
  const formatter = new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
  const startText = formatter.format(startDate);
  const endDate = end ? new Date(end) : null;
  return endDate && !Number.isNaN(endDate.getTime()) ? `${startText}-${formatter.format(endDate)}` : startText;
}

function courseIsOpen(course) {
  if (course.registration_status && course.registration_status !== "open") return false;
  if (!course.starts_at) return true;
  const startsAt = new Date(course.starts_at);
  if (Number.isNaN(startsAt.getTime())) return true;
  return startsAt.getTime() >= Date.now();
}

function getCourseCardImage(course, cover = {}) {
  const text = `${course?.title || ""} ${course?.subtitle || ""} ${course?.excerpt || ""} ${course?.course_type || ""}`.toLowerCase();
  const localImage = (() => {
    if (text.includes("移工") || text.includes("migrant")) return "assets/homepage-batch/service-card-05-migrant-training-clear.jpg";
    if (text.includes("督導") || text.includes("品管") || text.includes("品質") || text.includes("quality")) return "assets/homepage-batch/service-card-06-quality-clear.jpg";
    if (text.includes("護理") || text.includes("復能") || text.includes("nursing") || text.includes("rehab")) return "assets/homepage-batch/service-card-04-nursing-clear.jpg";
    if (text.includes("日間") || text.includes("日照") || text.includes("day")) return "assets/homepage-batch/service-card-02-day-care-clear.jpg";
    if (text.includes("社區") || text.includes("據點") || text.includes("失智") || text.includes("community")) return "assets/homepage-batch/service-card-03-community-clear.jpg";
    if (text.includes("家屬") || text.includes("家庭") || text.includes("家人") || text.includes("居家") || text.includes("照顧技巧") || text.includes("home")) return "assets/homepage-batch/family-consultation-clear.jpg";
    if (text.includes("照服員") || text.includes("核心") || text.includes("訓練") || text.includes("培訓") || text.includes("training")) return "assets/quality-recruit-02-training-clear.jpg";
    return "";
  })();
  return contentImageUrl(localImage || cover.public_url || fallbackImageForText(text, fallbackImages.course));
}

function courseImageAttrs(course) {
  const fallback = escapeHTML(contentImageUrl(fallbackImages.course));
  const image = escapeHTML(course.image || fallbackImages.course);
  const alt = escapeHTML(course.title || "歲悅課程圖片");
  return `src="${image}" alt="${alt}" data-fallback-src="${fallback}"`;
}

function normalizeCourse(course) {
  const cover = courseCoverById.get(course.cover_image_id) || course.cover_image || course.media || {};
  const isOpen = courseIsOpen(course);
  return {
    id: course.id,
    title: course.title,
    intro: course.excerpt || course.subtitle || course.description || "",
    date: formatCourseDate(course.starts_at),
    time: formatCourseTime(course.starts_at, course.ends_at),
    price: course.price_text || "免費",
    type: course.course_type || "實體課",
    location: course.location || "待公告",
    seats: isOpen ? (course.seats_label || (course.capacity ? `${course.capacity} 人` : "名額開放中")) : "已截止",
    image: getCourseCardImage(course, cover),
    isFeatured: Boolean(course.is_featured),
    registrationStatus: course.registration_status || "open",
    isOpen,
    statusLabel: isOpen ? "立即報名" : "已截止"
  };
}

function getVisibleCourses() {
  if (coursesLoadedFromSupabase) return supabaseCourses.map(normalizeCourse);
  return [];
}

async function loadSupabaseCourses({ rerender = false } = {}) {
  if (!supabase) {
    coursesLoadFailed = true;
    return [];
  }
  if (coursesLoadPromise) return coursesLoadPromise;
  coursesLoadPromise = (async () => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, subtitle, excerpt, description, course_type, location, location_detail, starts_at, ends_at, price_text, capacity, seats_label, registration_status, registration_url, is_featured, sort_order, cover_image_id")
      .eq("status", "published")
      .eq("is_enabled", true)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("starts_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    supabaseCourses = data || [];
    const coverIds = [...new Set(supabaseCourses.map((course) => course.cover_image_id).filter(Boolean))];
    if (coverIds.length) {
      const { data: coverRows, error: coverError } = await supabase
        .from("media")
        .select("id, public_url, alt_text, file_name, image_usage, focal_point")
        .in("id", coverIds);
      if (coverError) throw coverError;
      courseCoverById = new Map((coverRows || []).map((cover) => [cover.id, cover]));
    } else {
      courseCoverById = new Map();
    }
    coursesLoadedFromSupabase = true;
    coursesLoadFailed = false;
    if (rerender && routeSlugFromLocation() === "courses") {
      pageView.innerHTML = renderCoursesPage();
    }
    return supabaseCourses;
  } catch (error) {
    console.warn("Supabase courses unavailable.", error);
    coursesLoadedFromSupabase = false;
    coursesLoadFailed = true;
    courseCoverById = new Map();
    return [];
  } finally {
    coursesLoadPromise = null;
  }
  })();
  return coursesLoadPromise;
}

async function renderCoursesPageFromCms() {
  home.classList.remove("active");
  pageView.classList.add("active");
  pageView.innerHTML = renderCoursesPage();
  if (!coursesLoadedFromSupabase && !coursesLoadFailed) {
    loadSupabaseCourses({ rerender: true });
  }
}

function renderCoursesPage() {
  const courses = getVisibleCourses();
  const featuredCourses = courses.filter((course) => course.isFeatured);
  const importantCourses = (featuredCourses.length ? featuredCourses : courses).slice(0, 6);

  return `
    <div class="courses-page">
      <section class="courses-hero">
        <div>
          <p class="eyebrow">Courses</p>
          <h1>課程報名</h1>
          <p>像活動平台一樣快速篩選長照課程：照服員訓練、移工培訓、家屬照顧課、督導品管與專業研習。</p>
          <div class="course-filters"><span>全部活動</span><span>本週熱門</span><span>免費課程</span><span>線上課程</span><span>實體課程</span></div>
        </div>
        <div class="course-hero-card">
          <h2>找一堂適合你的長照課</h2>
          <form class="course-search">
            <input name="course_query" type="search" placeholder="搜尋課程或講師" />
            <select name="course_location"><option value="">全部地點</option><option>台北</option><option>新北</option><option>線上</option></select>
            <button type="submit">搜尋</button>
          </form>
        </div>
      </section>
      <section class="featured-courses">
        <div class="health-section-head">
          <div><p class="eyebrow">Featured</p><h2>重要課程</h2></div>
          <span>左右滑動查看本月主打課程</span>
        </div>
        <div class="featured-course-track" aria-label="重要課程輪播">
          ${importantCourses.length ? importantCourses.map((course) => `
            <article class="featured-course-card click-card ${course.isOpen ? "" : "is-closed"}" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}" data-course-open="${course.isOpen ? "true" : "false"}" data-course-search-text="${escapeHTML(`${course.title} ${course.intro} ${course.type} ${course.location}`)}" tabindex="0" role="button">
              <img ${courseImageAttrs(course)} />
              <div>
                <span>${escapeHTML(course.type)}</span>
                <h3>${escapeHTML(course.title)}</h3>
                <p>${escapeHTML(course.intro)}</p>
                <button class="course-register" type="button" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}" ${course.isOpen ? "" : "disabled"}>${escapeHTML(course.statusLabel)}</button>
              </div>
            </article>
          `).join("") : `
            <article class="featured-course-card">
              <div>
                <span>Coming Soon</span>
                <h3>重要課程準備中</h3>
                <p>近期主打課程確認後，會在這裡優先顯示。</p>
              </div>
            </article>
          `}
        </div>
      </section>
      <section class="course-list">
        ${courses.length ? courses.map((course, index) => `
          <article class="course-card click-card ${course.isOpen ? "" : "is-closed"}" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}" data-course-open="${course.isOpen ? "true" : "false"}" data-course-search-text="${escapeHTML(`${course.title} ${course.intro} ${course.type} ${course.location}`)}" tabindex="0" role="button">
            <div class="course-thumb"><img ${courseImageAttrs(course)} /><span>${String(index + 1).padStart(2, "0")}</span></div>
            <div class="course-body">
              <div class="course-topline"><span class="course-type">${escapeHTML(course.type)}</span><span class="course-seats">${escapeHTML(course.seats)}</span></div>
              <h3>${escapeHTML(course.title)}</h3>
              <p>${escapeHTML(course.intro)}</p>
              <div class="course-info-line"><span><em>地點</em>${escapeHTML(course.type)}｜${escapeHTML(course.location)}</span><b><em>費用</em>${escapeHTML(course.price)}</b></div>
              <div class="course-info-line"><span><em>日期</em>${escapeHTML(course.date)}</span><b><em>時間</em>${escapeHTML(course.time)}</b></div>
              <button class="course-register" type="button" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}" ${course.isOpen ? "" : "disabled"}>${escapeHTML(course.statusLabel)}</button>
            </div>
          </article>
        `).join("") : `
          <div class="course-empty-state">
            <h2>${coursesLoadFailed ? "課程資料暫時無法讀取" : "目前沒有開放報名的課程"}</h2>
            <p>${coursesLoadFailed ? "請稍後重新整理，或直接聯絡課程窗口。" : "新課程確認後會在這裡開放報名，也可以先留下需求詢問適合的課程。"}</p>
            <a class="primary-button" href="#contact">聯絡課程窗口</a>
          </div>
        `}
      </section>
      <div class="course-modal" id="courseSignupModal" hidden>
        <form class="course-modal-card" id="courseSignupForm">
          <button class="course-modal-close" type="button" data-course-close aria-label="關閉報名視窗">×</button>
          <p class="eyebrow">Course Signup</p>
          <h2>課程報名確認</h2>
          <label>您的大名<input name="姓名" type="text" required placeholder="請輸入姓名" /></label>
          <label>您的電話<input name="電話" type="tel" required placeholder="請輸入電話" /></label>
          <label>Email<input name="Email" type="email" required placeholder="請輸入 Email" /></label>
          <label>您本次報名的課程<input name="課程" id="courseSignupTitle" type="text" readonly /></label>
          <input name="course_id" id="courseSignupId" type="hidden" />
          <input name="_subject" type="hidden" value="歲悅長照課程報名通知" />
          <input name="_captcha" type="hidden" value="false" />
          <input name="_honey" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <label class="privacy-consent"><input type="checkbox" name="privacy_consent" required />我同意歲悅長照集團為課程報名、通知與後續聯繫目的，使用我填寫的個人資料。</label>
          <p class="course-confirm-text">是否要報名？</p>
          <div class="course-modal-actions">
            <button type="button" data-course-close>否</button>
            <button type="submit">是，送出報名</button>
          </div>
          <p class="course-modal-status" id="courseSignupStatus" aria-live="polite"></p>
        </form>
      </div>
    </div>
  `;
}

function renderInvestorsPage() {
  const irNews = [
    ["2026.05", "歲悅長照新增北北桃服務調度窗口", "整合居家照顧、日間照顧與護理復能諮詢，協助家庭更快找到適合服務。"],
    ["2026.04", "健康3.0照顧知識專欄上線", "提供家屬可快速理解的照顧技巧、營養衛教與安全提醒。"],
    ["2026.03", "移工照顧訓練課程開放報名", "以實作情境、家庭溝通與照顧安全為核心，提升家庭照顧穩定度。"]
  ];
  const irAwards = [
    ["2026", "臺北市居家照顧服務合作案", "承接區域照顧支持與家屬諮詢服務，建立可追蹤的照顧流程。"],
    ["2025", "新北市社區照顧據點服務案", "協助社區健康促進、共餐活動與預防延緩失能課程執行。"],
    ["2025", "桃園市護理復能支持服務案", "串接護理評估、復能訓練與服務品質追蹤。"]
  ];
  const establishmentProgress = [
    {
      type: "居家長照機構",
      area: "臺北市｜士林・北投服務區",
      status: "籌設申請與人力盤點",
      percent: 72,
      steps: [["市場評估", 100], ["場域/法人文件", 90], ["主管機關送件", 68], ["人力招募", 54], ["開辦準備", 32]]
    },
    {
      type: "居家長照機構",
      area: "新北市｜新店・中永和服務區",
      status: "主管機關文件補正",
      percent: 64,
      steps: [["市場評估", 100], ["場域/法人文件", 82], ["主管機關送件", 62], ["人力招募", 48], ["開辦準備", 28]]
    },
    {
      type: "日間照顧中心",
      area: "臺北市｜萬華服務區",
      status: "基地評估與室內規劃",
      percent: 58,
      steps: [["基地評估", 86], ["空間設計", 66], ["消防/無障礙", 45], ["設備採購", 30], ["試營運準備", 18]]
    },
    {
      type: "日間照顧中心",
      area: "桃園市｜蘆竹服務區",
      status: "合作場域洽談",
      percent: 46,
      steps: [["區域需求", 92], ["場域洽談", 56], ["財務試算", 48], ["圖面規劃", 26], ["送件準備", 12]]
    }
  ];

  return `
    <div class="investor-page">
      <section class="investor-hero">
        <div>
          <p class="eyebrow">Investor Relations</p>
          <h1>投資人專區</h1>
          <p>以清楚、穩定、可信任的資訊揭露，讓投資人理解歲悅長照集團的服務網絡、治理節奏與成長策略。</p>
          <div class="investor-hero-actions">
            <a class="primary-button" href="#contact" data-contact-need="投資洽談" data-contact-message="我想了解歲悅投資合作或投資人資訊，請協助安排投資人窗口回覆。">聯絡投資人窗口</a>
            <a class="secondary-button" href="#investor-downloads">下載資料</a>
          </div>
        </div>
        <aside class="investor-snapshot">
          <span>Suiyuecare Corps.</span>
          <strong>照顧服務網絡持續擴張</strong>
          <div>
            <p><b>3</b>核心縣市</p>
            <p><b>6</b>服務事業</p>
            <p><b>95%</b>服務滿意度</p>
          </div>
        </aside>
      </section>

      <nav class="investor-directory" aria-label="投資人專區主要分類">
        <a href="#ir-finance"><span>Financials</span><strong>財務資訊</strong><em>每月營收、財務分析、季報與年報</em></a>
        <a href="#ir-governance"><span>Governance</span><strong>公司治理</strong><em>治理運作、稽核、風險與誠信經營</em></a>
        <a href="#ir-shareholders"><span>Shareholders</span><strong>股東專區</strong><em>股務資訊、股東會、法說會與 FAQ</em></a>
      </nav>

      <section class="investor-panel active ir-progress-section">
        <div class="investor-section-head">
          <p class="eyebrow">Expansion Progress</p>
          <h2>機構設立進度</h2>
          <span>追蹤居家長照機構、日間照顧中心與區域服務網絡的設立進度，讓投資人看見展店不是口號，而是可以被管理的專案。</span>
        </div>
        <div class="ir-progress-grid">
          ${establishmentProgress.map((project) => `
            <article class="ir-progress-card">
              <div class="ir-progress-top">
                <span>${project.type}</span>
                <strong>${project.percent}%</strong>
              </div>
              <h3>${project.area}</h3>
              <p>${project.status}</p>
              <div class="ir-main-progress"><i style="width:${project.percent}%"></i></div>
              <div class="ir-step-list">
                ${project.steps.map(([label, value]) => `
                  <div><b>${label}</b><span><i style="width:${value}%"></i></span><em>${value}%</em></div>
                `).join("")}
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="investor-panel active">
        <div class="investor-section-head">
          <p class="eyebrow">Latest Updates</p>
          <h2>投資人最新動態</h2>
          <span>把首頁的最新消息與得標紀錄同步整理到投資人專區，讓投資人快速掌握營運進度。</span>
        </div>
        <div class="ir-updates-grid">
          <article class="ir-update-card">
            <div><p class="eyebrow">News</p><h3>最新消息</h3></div>
            ${irNews.map(([date, title, copy]) => `<a href="#ir-finance"><time>${date}</time><strong>${title}</strong><p>${copy}</p></a>`).join("")}
          </article>
          <article class="ir-update-card">
            <div><p class="eyebrow">Awards</p><h3>得標紀錄</h3></div>
            ${irAwards.map(([date, title, copy]) => `<a href="#ir-governance"><time>${date}</time><strong>${title}</strong><p>${copy}</p></a>`).join("")}
          </article>
        </div>
      </section>
    </div>
  `;
}

function renderAboutPage() {
  const aboutValues = [
    ["歲月安心", "我們理解家屬第一次面對照顧安排時，常常不知道該找誰、該問什麼、該怎麼判斷服務是否合適。歲悅把評估、媒合、派案、紀錄與回報整理成清楚流程，讓照顧不再只靠家屬自己摸索。"],
    ["悅享生活", "長照不是把長輩從生活中抽離，而是協助長輩在安全基礎上保有選擇、尊嚴與原本熟悉的節奏。我們重視每一次移位、用餐、沐浴、活動與對話背後的感受。"],
    ["陪伴成長", "好的照顧需要整個團隊一起變好。歲悅支持照顧服務員、督導、行政、治療師、講師與家庭照顧者共同學習，讓經驗能被整理、品質能被複製、服務能持續升級。"]
  ];
  const aboutPrinciples = [
    ["需求先被聽懂", "每個家庭遇到的困難不同，有人需要喘息，有人需要出院返家銜接，有人需要失智照顧建議。我們先釐清真實情境，再提出服務安排。"],
    ["照顧要可追蹤", "服務不是完成一次就結束，而是要能留下紀錄、回報狀態、看見變化。讓家屬知道今天做了什麼，也讓督導能更快發現風險。"],
    ["專業要變親切", "長照制度、補助、服務類型與課程常讓家庭覺得複雜。歲悅希望把專業說成家屬聽得懂的語言，讓開始照顧變得更容易。"],
    ["長輩保有主體感", "我們重視長輩的習慣、偏好與情緒反應。照顧不是代替長輩做所有事，而是在安全範圍裡支持長輩繼續參與生活。"],
    ["照顧者也被支持", "第一線人員需要清楚的工作流程、教育訓練、督導支援與情緒支持。照顧者被照顧，服務才會穩定。"],
    ["品質可以被改善", "現場回饋、家屬意見、異常事件與教育訓練都會回到品管流程，讓服務不是靠個人熱情，而是靠系統持續變好。"]
  ];
  const aboutSystems = [
    ["居家照顧", "到宅身體照顧、生活支持、服務紀錄與家屬回報。", "assets/homepage-batch/care-home-greeting-clear.jpg"],
    ["日間照顧", "白天托顧、活動參與、共餐休息與家屬喘息支持。", "assets/daycare-recruit-02-exercise-clear.jpg"],
    ["社區據點", "失智據點、健康促進、家屬課程與社區預防延緩失能。", "assets/homepage-batch/12-community-health-class-hires.jpg"],
    ["護理復能", "職能治療、復能訓練、居家安全建議與生活功能支持。", "assets/nursing-detail-02-walking-clear.jpg"],
    ["移工培訓", "把家庭照顧技能拆成可理解、可練習、可追蹤的課程。", "assets/homepage-batch/service-card-05-migrant-training-clear.jpg"],
    ["教育品管", "用教材、訓練、稽核與改善流程承接服務品質。", "assets/quality-recruit-04-quality-meeting-clear.jpg"]
  ];
  const aboutStats = [
    ["3", "核心服務縣市", "臺北、新北、桃園持續拓展"],
    ["8", "服務事業模組", "居家、日照、據點、復能、培訓、品管、招募、系統"],
    ["95%", "服務滿意度", "持續追蹤家屬與長輩回饋"],
    ["12+", "年度訓練模組", "讓前線與後勤都有成長路徑"]
  ];
  const aboutSteps = [
    ["理解需求", "先聽懂家庭真正卡住的地方，而不是急著推服務。"],
    ["建立計畫", "把照顧目標、服務內容、回報方式與風險提醒整理清楚。"],
    ["穩定執行", "透過督導、紀錄與行政支援，讓每一次服務都可追蹤。"],
    ["持續改善", "把現場回饋變成訓練、品管與下一次更好的照顧。"]
  ];
  const aboutTeams = [
    ["居家照顧團隊", "由照顧服務員、居服督導、個案管理與行政支援一起承接到宅服務，協助家庭完成身體照顧、生活支持、服務安排與即時溝通。"],
    ["日間照顧團隊", "透過照服員、社工、護理與活動設計，讓長輩白天有安全陪伴、規律活動與共餐休息，也讓家屬獲得喘息。"],
    ["社區據點團隊", "在社區中提供健康促進、失智友善活動、家屬支持與課程報名，讓預防照顧更早進入生活。"],
    ["護理復能團隊", "以治療師與復能人員協助長輩維持日常功能，從移位、步行、認知活動到居家環境調整，讓生活能力被看見。"],
    ["移工培訓團隊", "把家庭照顧常見情境轉化為課程，協助移工、雇主與家庭照顧者理解安全技巧、溝通方法與照顧流程。"],
    ["教育品管與行政團隊", "負責教材、訓練、稽核、資料紀錄、系統維護與表單流程，讓前線可以專心照顧，讓管理可以更透明。"]
  ];
  const aboutQuality = [
    ["服務紀錄", "每一次服務都應留下可回顧的紀錄，包含服務項目、長輩狀態、異常提醒與家屬需要知道的資訊。"],
    ["督導訪視", "督導不是只處理問題，也會定期理解照顧現場，協助人員調整方法、回應家庭需求。"],
    ["異常回報", "跌倒風險、情緒變化、用藥疑慮、家屬溝通落差，都需要被及早發現、被正確回報。"],
    ["教育訓練", "我們把常見照顧情境做成教材與課程，讓新進人員、在職人員與家庭照顧者都能持續學習。"],
    ["家屬回饋", "家屬的安心感是重要指標。服務回饋會進入改善流程，讓下一次安排更貼近家庭需要。"],
    ["數位管理", "透過後台、表單、文章、課程與資料下載管理，讓組織資訊更容易維護，也讓服務內容能持續更新。"]
  ];
  const aboutFuture = [
    ["北北桃服務網絡", "持續深化臺北、新北、桃園服務據點，讓家庭能更快找到附近可銜接的照顧資源。"],
    ["Health 3.0 照顧知識", "用文章、影片、短影片與名人講堂，把長照知識做成一般家庭也能理解的內容。"],
    ["照顧系統工具", "發展居家、日照、會計、人資、電子公文、專案管理與 PDF 工具，讓長照單位更有效率。"],
    ["人才培育", "打造清楚的招募、培訓、升遷與福利制度，讓願意投入長照的人能看見自己的職涯路徑。"]
  ];
  const aboutPainPoints = [
    ["家屬不知道從哪裡開始", "面對出院返家、失智症狀、跌倒風險或照顧者壓力時，家庭最常遇到的不是不願意照顧，而是不知道第一步該怎麼做。"],
    ["服務資訊太分散", "居家、日照、據點、復能、補助、課程與移工照顧各自有不同入口，家屬常常需要自己拼湊答案。"],
    ["照顧品質難以判斷", "人到了現場不等於服務品質穩定。家屬需要知道服務內容、照顧狀態、異常提醒與後續調整是否有人追蹤。"],
    ["第一線照顧者缺支援", "照顧服務員與督導每天面對大量現場變化，如果沒有清楚流程、教育訓練與行政支援，很容易把壓力全部留在個人身上。"],
    ["跨部門協作不透明", "居家、日照、復能、課程、行政與品管都在照顧鏈上，但如果資料沒有串起來，家庭會感覺每次都要重講一次。"],
    ["長照難以被信任地放大", "服務據點越多，越需要一致的訓練、紀錄、回報、稽核與管理方法，才能讓品質不是靠單一人員撐住。"]
  ];
  const aboutOperatingModel = [
    ["01", "諮詢入口", "先讓家庭用最容易說出口的方式描述困難，不急著貼標籤，也不急著推服務。"],
    ["02", "需求評估", "整理長輩身體狀態、生活習慣、家庭照顧量能、風險情境與預算限制。"],
    ["03", "服務設計", "依照需求組合居家照顧、日間照顧、社區據點、護理復能、課程或移工培訓。"],
    ["04", "人員媒合", "依照地區、時段、照顧難度與服務目標安排適合的人員與督導支持。"],
    ["05", "紀錄回報", "讓服務內容、長輩狀態、異常提醒與家屬關心事項，都能被記錄與追蹤。"],
    ["06", "改善迭代", "把現場回饋帶回訓練、品管、流程與系統，讓下一次服務比這一次更好。"]
  ];
  const aboutStakeholders = [
    ["對長輩", "我們希望長輩不是被照顧到失去主體，而是在安全、尊嚴與陪伴裡，保有選擇、節奏與生活感。"],
    ["對家屬", "我們協助家屬把焦慮變成可討論的問題，把問題變成可安排的計畫，讓照顧不再只靠一個人硬撐。"],
    ["對照顧服務員", "我們重視第一線的專業與情緒支持，讓照顧者有訓練、有督導、有工具，也有可以長期發展的職涯。"],
    ["對督導與行政", "我們把流程、紀錄、表單、回報與品管整理清楚，讓管理不是一直救火，而是能看見問題並提前處理。"],
    ["對合作單位", "我們以清楚窗口、服務資料、課程品質與合作紀錄建立信任，讓政府、學校、社區與企業夥伴能順利協作。"]
  ];
  const aboutStandards = [
    ["服務標準化", "把個案建檔、需求評估、服務媒合、服務紀錄、異常回報與督導追蹤整理成可訓練、可交接、可稽核的流程。"],
    ["教育模組化", "將移位、沐浴、用餐、失智溝通、跌倒預防、紀錄品質與服務倫理拆成可學習、可演練的課程模組。"],
    ["資料透明化", "重要資訊不只存在聊天紀錄裡，而是透過後台、表單、文章、課程、下載檔與報表，讓組織記憶能被保存。"],
    ["風險前置化", "跌倒、營養、情緒、家庭壓力、服務缺口與人員異動都應及早被看見，避免問題變大後才處理。"],
    ["溝通一致化", "讓家屬、督導、第一線、行政與合作窗口使用一致語言，降低重複說明與資訊落差。"],
    ["改善持續化", "服務不是一次交付，而是持續接收回饋、調整流程、更新教材、改善系統與優化團隊分工。"]
  ];
  const aboutPromises = [
    ["清楚", "把複雜長照服務整理成家屬能理解的選項與下一步。"],
    ["穩定", "用督導、紀錄、訓練與品管降低服務落差。"],
    ["尊重", "讓長輩的習慣、情緒、偏好與生活節奏被納入照顧安排。"],
    ["支持", "不只支持家庭，也支持第一線照顧者與內部管理團隊。"],
    ["透明", "重要服務資訊、表單、課程、公告與紀錄能被追蹤與更新。"],
    ["成長", "把照顧經驗轉成知識、制度、人才與系統，讓組織持續往前。"]
  ];
  const aboutFaqs = [
    ["歲悅長照集團跟一般照顧單位有什麼不同？", "歲悅不只提供單一服務，而是把居家、日照、社區據點、復能、移工培訓、教育品管、招募與系統工具整合成可長期運作的照顧網絡。"],
    ["如果家人不知道該選居家還是日照，可以先問歲悅嗎？", "可以。歲悅會先協助理解家庭情境，再依長輩狀態、家屬照顧量能、地區與服務目標，討論適合的組合。"],
    ["歲悅如何維持服務品質？", "我們重視服務紀錄、督導追蹤、教育訓練、異常回報、家屬回饋與流程改善，讓品質不只靠個人經驗，也靠制度承接。"],
    ["歲悅是否只服務長輩家庭？", "主要服務長輩與家庭，也協助長照單位、合作機構、學校、社區與企業進行課程、合作、招募與系統工具導入。"],
    ["未來歲悅想成為什麼樣的長照品牌？", "我們希望成為家庭想到長照時最容易開始的入口，也成為照顧者、合作夥伴與長照單位能信任的專業支持系統。"]
  ];

  return `
    <div class="about-page">
      <section class="about-hero">
        <div>
          <p class="eyebrow">About Suiyuecare</p>
          <h1>歲悅長照集團</h1>
          <p>歲悅長照以「歲月安心、悅享生活」為核心，整合居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管，建立一套讓家庭能理解、讓服務能追蹤、讓照顧者被支持的長照系統。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact" data-contact-need="長照服務諮詢" data-contact-message="我想了解歲悅長照集團的服務內容，請協助判斷適合的服務與下一步。">留下需求諮詢</a>
            <a class="secondary-button" href="#services">查看服務項目</a>
          </div>
        </div>
        <aside class="about-hero-image">
          <img src="/assets/hero-care-fast.jpg" alt="歲悅長照照顧情境" />
          <div><span>Suiyuecare Corps.</span><strong>照顧就像去超商，買牛奶一樣簡單。</strong></div>
        </aside>
      </section>

      <section class="about-story">
        <article class="about-story-card">
          <p class="eyebrow">Why We Exist</p>
          <h2>歲悅想解決的，不只是「有沒有人來照顧」，而是家庭在照顧路上不知道下一步該怎麼走。</h2>
          <p>許多家庭第一次接觸長照，是在長輩突然跌倒、出院返家、失智症狀變明顯，或主要照顧者已經快撐不住的時候。這些時刻通常很急、很亂，也很孤單。歲悅長照集團希望把照顧變成一件可以被理解、可以被安排、可以被追蹤的事。</p>
          <p>我們的 slogan 是「照顧就像去超商，買牛奶一樣簡單」。這不是把照顧說得很輕，而是提醒自己：再複雜的專業，都應該被整理成家庭容易開始的入口。當家屬需要協助時，可以知道要找誰、要準備什麼、接下來會發生什麼，也知道有人會一起承接。</p>
        </article>
        <div class="about-story-notes">
          <article><b>01</b><span>把照顧入口變簡單</span><p>從諮詢、評估到媒合服務，降低家屬開始尋求協助的門檻。</p></article>
          <article><b>02</b><span>把服務過程變清楚</span><p>透過紀錄、回報、督導與行政支援，讓照顧不是黑盒子。</p></article>
          <article><b>03</b><span>把長照經驗變資產</span><p>把前線經驗整理成課程、品管、內容與系統，讓組織持續進步。</p></article>
        </div>
      </section>

      <section class="about-belief">
        <div class="about-section-head">
          <p class="eyebrow">Brand Belief</p>
          <h2>我們相信，真正的照顧，是讓人重新感覺自己仍被生活溫柔接住。</h2>
          <span>歲悅不是只提供人力，而是用專業、尊嚴、陪伴與信任，承接家庭在照顧路上的不安。</span>
        </div>
        <div class="about-value-grid">
          ${aboutValues.map(([title, copy]) => `<article><span></span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-problem-section">
        <div class="about-section-head">
          <p class="eyebrow">Problems We Solve</p>
          <h2>長照現場真正困難的地方，往往不是單一服務不足，而是資訊、流程與支持系統沒有接起來。</h2>
          <span>歲悅把家庭、第一線、督導、行政與合作單位常遇到的問題整理成服務設計的起點。</span>
        </div>
        <div class="about-problem-grid">
          ${aboutPainPoints.map(([title, copy]) => `<article><h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-principles">
        <div class="about-section-head">
          <p class="eyebrow">Care Principles</p>
          <h2>我們判斷服務好不好，不只看任務有沒有完成，也看家庭是不是更安心。</h2>
          <span>歲悅把照顧拆成可以被執行的原則，讓每個部門、每位夥伴都能往同一個方向前進。</span>
        </div>
        <div class="about-principle-grid">
          ${aboutPrinciples.map(([title, copy], index) => `<article><b>${String(index + 1).padStart(2, "0")}</b><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-operating-section">
        <div class="about-section-head">
          <p class="eyebrow">Operating Model</p>
          <h2>從第一通電話到長期追蹤，歲悅把照顧拆成可以被理解、被交接、被改善的六個步驟。</h2>
          <span>這套方法不是為了讓服務變得冰冷，而是讓每一位長輩、家屬與照顧者都不必在混亂中靠運氣。</span>
        </div>
        <div class="about-operating-grid">
          ${aboutOperatingModel.map(([step, title, copy]) => `<article><b>${escapeHTML(step)}</b><h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-system">
        <div class="about-system-copy">
          <p class="eyebrow">Care System</p>
          <h2>我們把照顧做成一套可以被理解、被執行、被改善的系統。</h2>
          <p>從第一通電話開始，歲悅會協助家庭整理需求、媒合服務、追蹤紀錄、回報狀態，也把前線經驗回收到教育訓練與品質管理中。照顧不是單點交付，而是一個可以長期運作的支持網絡。</p>
        </div>
        <div class="about-system-grid">
          ${aboutSystems.map(([title, copy, image]) => `
            <article>
              <img src="${image}" alt="${title}" />
              <div><h3>${title}</h3><p>${copy}</p></div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="about-stakeholder-section">
        <div class="about-section-head">
          <p class="eyebrow">For Everyone In Care</p>
          <h2>歲悅的服務設計，不只看見長輩，也看見長輩身邊每一個正在承擔的人。</h2>
          <span>照顧如果只要求某一個人更努力，通常走不久；照顧需要被分工、被支持、被制度化。</span>
        </div>
        <div class="about-stakeholder-board">
          ${aboutStakeholders.map(([title, copy], index) => `
            <article>
              <b>${String(index + 1).padStart(2, "0")}</b>
              <h3>${escapeHTML(title)}</h3>
              <p>${escapeHTML(copy)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="about-team-section">
        <div class="about-section-head">
          <p class="eyebrow">Our Teams</p>
          <h2>歲悅不是單一服務單位，而是一個把前線、督導、教育、行政與系統串在一起的照顧團隊。</h2>
          <span>每個部門都有自己的專業位置，但共同目標都是讓家庭被承接、長輩被尊重、照顧者被支持。</span>
        </div>
        <div class="about-team-grid">
          ${aboutTeams.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-standard-section">
        <div class="about-section-head">
          <p class="eyebrow">Management Standard</p>
          <h2>我們把溫暖放進制度裡，也把制度做得足夠親切，讓現場真的願意使用。</h2>
          <span>品質管理不是只做稽核，而是把服務、教育、資料、風險、溝通與改善變成日常的一部分。</span>
        </div>
        <div class="about-standard-grid">
          ${aboutStandards.map(([title, copy]) => `<article><h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-stats">
        ${aboutStats.map(([value, label, copy]) => `<article><strong>${value}</strong><span>${label}</span><p>${copy}</p></article>`).join("")}
      </section>

      <section class="about-method">
        <div class="about-section-head">
          <p class="eyebrow">How We Care</p>
          <h2>歲悅的照顧方法</h2>
          <span>我們用清楚流程承接家庭，也用持續回饋照顧前線。</span>
        </div>
        <div class="about-step-grid">
          ${aboutSteps.map(([title, copy], index) => `<article><b>${String(index + 1).padStart(2, "0")}</b><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-quality-section">
        <div class="about-quality-board">
          <div>
            <p class="eyebrow">Quality Management</p>
            <h2>品質不是一句口號，而是每一天都要被紀錄、被檢查、被修正。</h2>
            <p>長照服務最困難的地方，是每個家庭都不同、每個現場都會變動。歲悅用紀錄、督導、教育與回饋流程，讓照顧品質可以被看見，也可以被持續改善。</p>
          </div>
          <div class="about-quality-grid">
            ${aboutQuality.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}
          </div>
        </div>
      </section>

      <section class="about-future">
        <div class="about-section-head">
          <p class="eyebrow">Future Direction</p>
          <h2>未來的歲悅，會把長照服務、照顧知識、人才培育與數位系統做得更完整。</h2>
          <span>我們希望不只照顧個別家庭，也能協助更多長照單位、照顧者與社區建立更穩定的照顧能力。</span>
        </div>
        <div class="about-future-grid">
          ${aboutFuture.map(([title, copy]) => `<article><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-promise-section">
        <div class="about-section-head">
          <p class="eyebrow">Brand Promise</p>
          <h2>歲悅希望每一次照顧，都能讓家庭感覺事情正在變清楚，而不是更混亂。</h2>
          <span>我們對外說的是品牌承諾，對內要求的是每天都要能落地的工作標準。</span>
        </div>
        <div class="about-promise-grid">
          ${aboutPromises.map(([title, copy]) => `<article><strong>${escapeHTML(title)}</strong><p>${escapeHTML(copy)}</p></article>`).join("")}
        </div>
      </section>

      <section class="about-faq-section">
        <div class="about-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>認識歲悅常見問題</h2>
          <span>如果你是家屬、合作夥伴、投資人或想加入長照產業的人，可以先從這裡理解歲悅的定位。</span>
        </div>
        <div class="about-faq-list">
          ${aboutFaqs.map(([question, answer], index) => `
            <details ${index === 0 ? "open" : ""}>
              <summary>${escapeHTML(question)}</summary>
              <p>${escapeHTML(answer)}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel about-cta-panel">
        <div>
          <p class="eyebrow">Start With Suiyuecare</p>
          <h2>如果你正在找一個能把照顧說清楚、做穩定、走長久的團隊，歲悅可以一起討論下一步。</h2>
          <p>不論是家庭照顧諮詢、服務合作、人才招募、土地合作、投資洽詢或系統導入，都可以從一個清楚的對話開始。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡歲悅</a>
      </section>
    </div>
  `;
}

function renderAboutPageThreeMinute() {
  const heroImage = heroImageForViewport("/assets/homepage-batch/04-admin-team-office-fast.jpg");
  const chapters = [
    {
      id: "about-vision",
      number: "01",
      eyebrow: "Vision",
      title: "組織願景",
      lead: "讓每個家庭想到長照時，不再先感到混亂，而是知道有一個清楚、親切、值得信任的入口。",
      body: "歲悅想建立的不是單一服務，而是一套靠近家庭生活的長照網絡。從居家照顧、日間照顧、社區據點到復能、培訓與品管，我們希望把複雜制度整理成家屬聽得懂、用得到、願意開始的下一步。",
      image: "/assets/homepage-batch/family-consultation-clear.jpg",
      points: ["家庭更容易開始", "長輩保有尊嚴與生活感", "照顧品質能被追蹤與改善"]
    },
    {
      id: "about-mission",
      number: "02",
      eyebrow: "Mission",
      title: "組織使命",
      lead: "把照顧變成可以被理解、被安排、被回報，也被持續改善的日常系統。",
      body: "我們每天做的事，是把家庭的焦慮翻譯成服務計畫，把現場照顧整理成紀錄與回饋，再把經驗回收到教育訓練和品質管理。讓家屬不用一個人摸索，讓第一線照顧者不是只靠熱情硬撐。",
      image: "/assets/homepage-batch/03-supervisor-care-plan-fast.jpg",
      points: ["先聽懂需求，再安排服務", "服務後留下家屬看得懂的紀錄", "用督導與教育支持第一線"]
    },
    {
      id: "about-culture",
      number: "03",
      eyebrow: "Culture",
      title: "團隊文化",
      lead: "我們相信，溫柔不是抽象的感覺，而是每一次準時、每一筆紀錄、每一次回報都做得更清楚。",
      body: "歲悅的文化很簡單：把專業說成人聽得懂的話，把現場經驗變成可學習的方法，把家屬的不安接住，也把照顧者的壓力看見。團隊可以快速前進，但不犧牲長輩與家屬真正需要的安心感。",
      image: "/assets/quality-recruit-04-quality-meeting-clear.jpg",
      points: ["清楚溝通", "主動回報", "一起改善"]
    },
    {
      id: "about-team",
      number: "04",
      eyebrow: "Team",
      title: "團隊成員",
      lead: "歲悅不是單一人員到場服務，而是一群不同角色一起承接家庭的照顧系統。",
      body: "從第一線服務、督導追蹤、護理復能、教育品管到行政系統，歲悅用角色分工承接家庭不同階段的照顧問題。",
      image: "/assets/homepage-batch/04-admin-team-office-fast.jpg",
      points: ["第一線照顧", "督導品管", "行政與系統支援"]
    }
  ];

  const serviceCards = [
    ["居家照顧", "到宅照顧、生活支持、服務紀錄與家屬回報。", "/assets/homecare-detail-01-greeting-fast.jpg", "#home-care"],
    ["日間照顧", "白天到中心活動、用餐、休息，晚上仍能回家。", "/assets/daycare-detail-01-exercise-fast.jpg", "#day-care"],
    ["社區據點", "健康促進、共餐、社區活動與長照資源諮詢。", "/assets/community-detail-01-exercise-fast.jpg", "#community"],
    ["護理復能", "健康觀察、復能目標、移位步行與居家安全建議。", "/assets/nursing-detail-02-walking-clear.jpg", "#nursing"],
    ["移工培訓", "把移位、沐浴、用餐與溝通做成可練習的課程。", "/assets/migrant-detail-02-transfer-fast.jpg", "#migrant-training"],
    ["教育品管", "教材、訓練、稽核、紀錄檢核與改善流程。", "/assets/quality-detail-02-training-fast.jpg", "#quality"]
  ];

  const cultureCards = [
    ["把話說清楚", "專業如果聽不懂，就很難讓家庭安心。我們練習把制度、服務與風險說成家屬能理解的下一步。"],
    ["把紀錄留下來", "照顧不是只有當下完成，服務後的紀錄、回報與追蹤，會讓家屬知道狀態，也讓督導能看見變化。"],
    ["把問題帶回團隊", "現場遇到的卡點不只交給個人消化，而是回到教育、品管、流程和系統裡一起改善。"],
    ["把照顧者也照顧好", "長期穩定的服務，需要第一線有人教、有人問、有人一起承擔，而不是只要求人員自己撐住。"]
  ];

  const teamCards = [
    ["照顧服務員", "在長輩熟悉的生活場域中，協助沐浴、用餐、移位、陪伴與生活支持。", "/assets/homepage-batch/orange-polo-caregiver-clear.jpg"],
    ["居服督導", "協助評估需求、安排服務、追蹤紀錄與回應家屬在服務中的變化。", "/assets/homepage-batch/03-supervisor-care-plan-fast.jpg"],
    ["日照與社區團隊", "設計白天作息、團體活動、共餐與社區支持，讓長輩有穩定參與。", "/assets/homepage-batch/02-daycare-group-exercise-hires.jpg"],
    ["護理復能夥伴", "用健康觀察、復能訓練與居家安全建議，陪長輩練回生活能力。", "/assets/homepage-batch/13-rehab-walking-practice-fast.jpg"],
    ["教育品管與培訓", "把服務經驗整理成教材、課程、稽核與改善流程，讓品質能被複製。", "/assets/quality-detail-04-improvement-fast.jpg"],
    ["行政、系統與品牌", "支援表單、後台、內容、合作與營運資料，讓前線能專心照顧。", "/assets/homepage-batch/04-admin-team-office-fast.jpg"]
  ];

  return `
    <div class="about-page about-three-minute-page">
      <section class="hero service-detail-hero one-minute-service-hero about-full-hero">
        <div
          class="hero-bg"
          style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(heroImage)}');"
          aria-hidden="true"
        ></div>
        <div class="hero-copy service-detail-copy">
          <p class="eyebrow">About Suiyuecare</p>
          <h1>關於歲悅</h1>
          <p class="hero-slogan">3 分鐘看懂歲悅長照集團</p>
          <p>歲悅長照把居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管整合成一套更好開始、更好追蹤、也更好被信任的照顧系統。</p>
          <div class="one-minute-service-actions">
            <a class="primary-button" href="#about-vision" data-service-scroll="#about-vision">開始認識歲悅</a>
            <a class="ghost-button" href="#about-services" data-service-scroll="#about-services">先看服務總覽</a>
          </div>
          <div class="one-minute-proof about-minute-proof" aria-label="關於歲悅閱讀摘要">
            <span>3 分鐘</span>
            <strong>願景、使命、文化、團隊，一次看完</strong>
          </div>
        </div>
      </section>

      <section class="about-read-map service-motion" aria-label="關於歲悅快速閱讀路徑">
        ${chapters.map((chapter) => `
          <a href="#${escapeHTML(chapter.id)}" data-service-scroll="#${escapeHTML(chapter.id)}">
            <span>${escapeHTML(chapter.number)}</span>
            <strong>${escapeHTML(chapter.title)}</strong>
            <p>${escapeHTML(chapter.lead)}</p>
          </a>
        `).join("")}
      </section>

      <section id="about-services" class="about-services-section service-motion">
        <div class="about-section-head">
          <p class="eyebrow">What We Do</p>
          <h2>我們提供什麼服務？</h2>
          <span>如果只用一分鐘理解歲悅，重點就是：我們協助家庭把照顧需求整理清楚，再接上合適服務與後續追蹤。</span>
        </div>
        <div class="about-service-card-grid">
          ${serviceCards.map(([title, copy, image, href]) => `
            <a href="${escapeHTML(href)}">
              <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" />
              <div>
                <strong>${escapeHTML(title)}</strong>
                <p>${escapeHTML(copy)}</p>
              </div>
            </a>
          `).join("")}
        </div>
      </section>

      ${chapters.slice(0, 2).map((chapter, index) => `
        <section id="${escapeHTML(chapter.id)}" class="about-feature-panel service-motion ${index % 2 ? "is-reversed" : ""}">
          <figure>
            <img src="${escapeHTML(chapter.image)}" alt="${escapeHTML(chapter.title)}" />
          </figure>
          <div>
            <p class="eyebrow">${escapeHTML(chapter.eyebrow)}</p>
            <span>${escapeHTML(chapter.number)}</span>
            <h2>${escapeHTML(chapter.title)}</h2>
            <h3>${escapeHTML(chapter.lead)}</h3>
            <p>${escapeHTML(chapter.body)}</p>
            <ul>${chapter.points.map((point) => `<li>${escapeHTML(point)}</li>`).join("")}</ul>
          </div>
        </section>
      `).join("")}

      <section id="about-culture" class="about-culture-section service-motion">
        <div class="about-section-head">
          <p class="eyebrow">Culture</p>
          <h2>團隊文化</h2>
          <span>文化不是貼在牆上的字，而是服務現場每天做決定時，團隊會回頭檢查的工作方式。</span>
        </div>
        <div class="about-culture-layout">
          <figure>
            <img src="${escapeHTML(chapters[2].image)}" alt="歲悅團隊文化與教育品管" />
          </figure>
          <div class="about-culture-grid">
            ${cultureCards.map(([title, copy], index) => `
              <article>
                <b>${String(index + 1).padStart(2, "0")}</b>
                <h3>${escapeHTML(title)}</h3>
                <p>${escapeHTML(copy)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </section>

      <section id="about-team" class="about-members-section service-motion">
        <div class="about-section-head">
          <p class="eyebrow">Team</p>
          <h2>團隊成員</h2>
          <span>先用角色看懂歲悅的團隊組成：真正穩定的照顧，背後需要前線、督導、教育、行政與系統一起運作。</span>
        </div>
        <div class="about-member-grid">
          ${teamCards.map(([title, copy, image]) => `
            <article>
              <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" />
              <div>
                <strong>${escapeHTML(title)}</strong>
                <p>${escapeHTML(copy)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel about-cta-panel service-motion">
        <div>
          <p class="eyebrow">Start With Suiyuecare</p>
          <h2>想更了解歲悅，或想討論照顧服務、合作、人才與系統導入？</h2>
          <p>留下需求，我們會依照你的身份與問題，安排合適窗口回覆。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡歲悅</a>
      </section>
    </div>
  `;
}

function renderMilestonesPage() {
  const heroImage = heroImageForViewport("/assets/milestones/homecare-agency-launch.jpg");
  const milestoneStats = [
    ["14", "重要歷程", "從機構成立、政府計畫、官方網站到系統模組逐步展開"],
    ["8", "服務行政區", "臺北士林、北投、南港、萬華，以及新北新店、中和、永和等區域"],
    ["5", "公共計畫與標案", "串接移工培訓、雇主支持、青年就業與失智社區服務"],
    ["3", "系統模組上線", "會計、專案管理與電子用印模組陸續完成"]
  ];
  const timeline = [
    ["2025", "06", "成立臺北市歲悅居家長照機構", "成立", "士林、北投、南港區居家長照服務啟動，建立到宅照顧、督導管理與家庭支持的服務基礎。", "/assets/milestones/homecare-agency-launch.jpg", "已完成"],
    ["2025", "10", "得標高雄市家庭看護工作補充訓練計畫", "得標", "得標高雄市政府勞工局 115 年度「外國人從事家庭看護工作補充訓練計畫」，推動家庭看護照顧技能訓練。", "/assets/milestones/kaohsiung-caregiver-training.jpg", "已完成"],
    ["2025", "12", "設立臺北市歲悅社區長照機構萬華一館", "設立", "萬華一館完成設立，作為社區長照服務的重要起點，提供長輩日間支持與家屬照顧資源。", "/assets/milestones/wanhua-community-care-one.jpg", "已完成"],
    ["2025", "12", "第一版官方網站上線", "上線", "第一版官方網站完成上線，建立品牌資訊、服務介紹與聯絡入口，讓家庭能更快了解歲悅服務。", "/assets/milestones/official-website-v1-launch.jpg", "已完成"],
    ["2026", "02", "得標勞動部移工數位學習計畫", "得標", "得標勞動部勞動力發展署 115-116 年度「移工數位學習計劃」，推動移工照顧技能數位化學習。", "/assets/milestones/migrant-digital-learning.jpg", "已完成"],
    ["2026", "03", "參與 Team Taipei 挺就業青年畢業啟航", "參與", "參與臺北市勞工局 115 年度 Team Taipei 挺就業-青年畢業啟航，與青年人才交流長照職涯與服務現場。", "/assets/milestones/youth-employment-event.jpg", "已完成"],
    ["2026", "04", "得標臺北市雇主安心計畫集中訓練", "得標", "得標臺北市勞動力重建運用處 115 年度「雇主安心計畫-集中訓練」，協助家庭雇主與看護工作者提升照顧品質。", "/assets/milestones/employer-training.jpg", "已完成"],
    ["2026", "05", "歲悅長照系統會計模組上線", "上線", "會計模組正式上線，串接財務、行政與照顧營運資料，強化內部管理與服務紀錄銜接。", "/assets/milestones/accounting-module.jpg", "已完成"],
    ["2026", "06", "設立臺北市歲悅社區長照機構萬華二館", "設立", "萬華二館完成設立，延伸社區長照服務量能，讓臺北市西區家庭有更多在地支持。", "/assets/milestones/wanhua-community-care-two.jpg", "已完成"],
    ["2026", "06", "得標臺北市失智社區服務據點", "得標", "得標士林、大同、信義區失智社區服務據點，提供失智友善活動、家屬諮詢與社區支持。", "/assets/milestones/dementia-community-point.jpg", "已完成"],
    ["2026", "06", "第二版官方網站上線", "上線", "第二版官方網站完成上線，優化服務動線、內容架構與視覺呈現，讓使用者更清楚找到所需資訊。", "/assets/milestones/official-website-v2-launch.jpg", "已完成"],
    ["2026", "07", "併購新北市愛無限居家長照機構與好窩居家職能治療所", "併購", "整合新店、中和、永和居家照顧服務，並納入復能與個案管理專業，擴大新北照顧服務網絡。", "/assets/milestones/newtaipei-integration.jpg", "已完成"],
    ["2026", "08", "歲悅長照系統專案管理模組上線", "上線", "專案管理模組正式上線，協助照顧服務、政府計畫、內部任務與跨部門進度更清楚被追蹤。", "/assets/milestones/project-management-module.jpg", "已完成"],
    ["2026", "08", "歲悅長照系統電子用印模組上線", "上線", "電子用印模組導入行政流程，讓文件申請、核准、用印與紀錄留存更有效率。", "/assets/milestones/e-seal-module.jpg", "已完成"],
  ].map(([year, month, title, tag, copy, image, status]) => ({ year, month, title, tag, copy, image, status }));
  const sortedTimeline = [...timeline].sort((a, b) => Number(b.year) - Number(a.year) || Number(b.month) - Number(a.month));
  const timelineGroups = [...new Set(sortedTimeline.map((item) => item.year))]
    .map((year) => ({ year, items: sortedTimeline.filter((item) => item.year === year) }));

  return `
    <div class="milestones-page">
      <section class="hero service-detail-hero one-minute-service-hero milestones-full-hero">
        <div
          class="hero-bg"
          style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(heroImage)}');"
          aria-hidden="true"
        ></div>
        <div class="hero-copy service-detail-copy">
          <p class="eyebrow">Milestones</p>
          <h1>大事記</h1>
          <p class="hero-slogan">沿著時間軸，看歲悅如何把照顧系統一步步整理成形。</p>
          <p>從一通照顧諮詢開始，到北北桃服務網絡與教育品管系統，歲悅把每一個家庭的需求，慢慢整理成可以被理解、被追蹤、被信任的照顧歷程。</p>
          <div class="one-minute-service-actions">
            <a class="primary-button" href="#milestone-timeline" data-service-scroll="#milestone-timeline">看時間軸</a>
            <a class="ghost-button" href="#contact">合作洽詢</a>
          </div>
          <div class="milestone-scroll-cue">
            <span></span>
            <strong>往下滑，看歲悅的發展歷程</strong>
          </div>
        </div>
      </section>

      <section class="milestone-stats">
        ${milestoneStats.map(([value, label, copy]) => `<article><strong>${value}</strong><span>${label}</span><p>${copy}</p></article>`).join("")}
      </section>

      <section id="milestone-timeline" class="milestone-journey" aria-label="歲悅長照發展時間軸">
        <div class="milestone-rail" aria-hidden="true">
          <span class="milestone-rail-progress"></span>
        </div>
        <div class="milestone-list">
          ${timelineGroups.map((group) => `
            <section class="milestone-year-group" aria-label="${group.year} 年大事記">
              <div class="milestone-year-heading">
                <span>${group.year}</span>
                <p>${group.year === "2026" ? "從最新上線準備往前回看，整理網站、內容、後台與資料化管理如何一步步成形。" : "12 月回到 1 月，回看歲悅如何建立服務、品管與營運基礎。"}</p>
              </div>
              ${group.items.map((item, index) => {
                const globalIndex = sortedTimeline.findIndex((entry) => entry.year === item.year && entry.month === item.month);
                return `
                  <article class="milestone-card ${globalIndex === 0 ? "active" : ""}" data-milestone-card style="--card-index:${globalIndex}">
                    <div class="milestone-year">
                      <span>${item.month}月</span>
                      <b>${item.year}</b>
                    </div>
                    <figure>
                      <img src="${item.image}" alt="${item.title}" loading="${globalIndex < 2 ? "eager" : "lazy"}" />
                    </figure>
                    <div class="milestone-copy">
                      <small>${globalIndex === 0 ? "<i>最新</i>" : ""}${item.tag}<em>${item.status}</em></small>
                      <h3>${item.title}</h3>
                      <p>${item.copy}</p>
                    </div>
                  </article>
                `;
              }).join("")}
            </section>
          `).join("")}
        </div>
      </section>

      <section class="milestone-next">
        <p class="eyebrow">Next Chapter</p>
        <h2>下一段歲悅，會繼續把照顧變簡單。</h2>
        <p>我們會持續擴大照顧服務、人才招募、教育品管與合作網絡，讓更多家庭在需要照顧時，有一個清楚、親切、值得信任的入口。</p>
        <div class="hero-actions">
          <a class="primary-button" href="/talent">加入歲悅</a>
          <a class="secondary-button" href="#contact">合作洽詢</a>
        </div>
      </section>
    </div>
  `;
}

const oneMinuteServices = {
  "home-care": {
    eyebrow: "Home Care",
    title: "居家照顧",
    oneLiner: "讓長輩在熟悉的家裡被安全陪伴，也讓家屬不用一個人硬撐。",
    image: "assets/homecare-detail-01-greeting-hero-fast.jpg",
    imageAlt: "居家照顧服務員到宅問候長輩",
    badge: "到宅照顧",
    idealFor: ["出院返家需要協助", "白天家人不在家", "主要照顧者需要喘息"],
    outcomes: ["沐浴、用餐、移位與生活支持", "服務後有紀錄，家屬看得懂", "督導追蹤，必要時調整服務"],
    flow: ["說明家中照顧情境", "確認區域、時段與照顧強度", "安排服務並回報紀錄"],
    scenes: [
      { image: "assets/homecare-detail-02-care-plan-fast.jpg", title: "到宅評估", text: "先看長輩生活動線、起身移位、用餐與如廁情況。" },
      { image: "assets/homecare-detail-03-safe-transfer-fast.jpg", title: "安全移位", text: "協助床邊、輪椅、浴室移動，降低跌倒與拉傷風險。" },
      { image: "assets/homecare-detail-04-daily-support-fast.jpg", title: "日常支持", text: "陪伴用餐、盥洗、整理與服務紀錄，讓家屬掌握狀態。" }
    ],
    applySteps: ["留下聯絡方式與照顧地點", "專人電話釐清長輩狀態與可服務時段", "確認服務內容、頻率與開始日期"],
    primaryCta: "預約居家諮詢",
    secondaryCta: "查看服務據點"
  },
  "day-care": {
    eyebrow: "Day Care",
    title: "日間照顧",
    oneLiner: "白天到中心活動、用餐、休息與被照顧，晚上仍能回家。",
    image: "assets/daycare-detail-01-exercise-hero-fast.jpg",
    imageAlt: "日間照顧中心長輩活動",
    badge: "白天托顧",
    idealFor: ["白天獨自在家不放心", "需要活動與社交刺激", "家屬上班需要穩定支持"],
    outcomes: ["日常作息、餐食、活動被安排", "中心照顧團隊觀察狀態", "減少家屬白天照顧壓力"],
    flow: ["了解長輩生活能力", "安排參觀與適應", "建立出席、接送與回報方式"],
    scenes: [
      { image: "assets/daycare-detail-02-meal-fast.jpg", title: "營養共餐", text: "依長輩吞嚥、飲食習慣與作息，安排白天餐食。" },
      { image: "assets/daycare-detail-03-activity-fast.jpg", title: "團體活動", text: "用運動、手作、認知與社交活動維持生活參與。" },
      { image: "assets/daycare-detail-04-checkin-fast.jpg", title: "每日回報", text: "中心觀察精神、食慾與活動情形，必要時提醒家屬。" }
    ],
    applySteps: ["填寫想參觀的中心或區域", "安排參觀、試托或適應討論", "確認接送、出席頻率與補助資料"],
    primaryCta: "詢問日照名額",
    secondaryCta: "申請服務須知"
  },
  community: {
    eyebrow: "Community",
    title: "社區據點",
    oneLiner: "把健康促進、共餐、活動與資源諮詢放在熟悉社區。",
    image: "assets/community-detail-01-exercise-hero-hires.jpg",
    imageAlt: "社區據點健康促進活動",
    badge: "在地支持",
    idealFor: ["想讓長輩增加外出", "需要預防延緩失能活動", "家屬想先理解長照資源"],
    outcomes: ["固定活動與健康促進", "共餐、陪伴與社交連結", "可銜接居家、日照或其他資源"],
    flow: ["確認所在區域", "選擇適合活動或諮詢", "安排參與並追蹤需求"],
    scenes: [
      { image: "assets/community-detail-02-meal-fast.jpg", title: "社區共餐", text: "讓長輩有固定外出理由，也有人留意飲食與精神狀態。" },
      { image: "assets/community-detail-03-workshop-fast.jpg", title: "健康活動", text: "肌力、平衡、認知與手作活動，做在熟悉生活圈裡。" },
      { image: "assets/community-detail-04-consult-fast.jpg", title: "資源諮詢", text: "協助家屬理解可申請的長照服務與下一步窗口。" }
    ],
    applySteps: ["告訴我們所在里別或常去區域", "確認近期活動、共餐或諮詢時段", "由據點協助報名與後續資源銜接"],
    primaryCta: "詢問社區活動",
    secondaryCta: "查看服務據點"
  },
  nursing: {
    eyebrow: "Nursing Rehab",
    title: "護理復能",
    oneLiner: "用護理觀察與復能目標，陪長輩安全練回生活能力。",
    image: "assets/nursing-detail-02-walking-hero-fast.jpg",
    imageAlt: "護理復能步行練習",
    badge: "健康與復能",
    idealFor: ["出院後行動變弱", "擔心跌倒或健康變化", "需要家屬照顧教學"],
    outcomes: ["健康量測與風險提醒", "移位、步行、日常能力練習", "居家安全與照顧方法建議"],
    flow: ["描述目前身體狀態", "確認復能目標與風險", "安排服務與家屬教學"],
    scenes: [
      { image: "assets/nursing-detail-01-vitals-clear.jpg", title: "健康觀察", text: "量測血壓、皮膚、食慾、睡眠與用藥，提早看見變化。" },
      { image: "assets/nursing-detail-02-walking-clear.jpg", title: "步行練習", text: "把復能目標放回生活，練起身、移位、走路與安全轉身。" },
      { image: "assets/nursing-detail-03-home-safety-fast.jpg", title: "居家安全", text: "檢查浴室、床邊、動線與輔具，給家屬可執行的建議。" }
    ],
    applySteps: ["說明診斷、出院時間或目前身體狀況", "專人確認適合的護理或復能目標", "安排服務並提供家屬照顧提醒"],
    primaryCta: "諮詢護理復能",
    secondaryCta: "預約居家諮詢"
  },
  "migrant-training": {
    eyebrow: "Migrant Training",
    title: "移工培訓",
    oneLiner: "讓家庭照顧移工學會安全照顧、溝通與日常觀察。",
    image: "assets/migrant-detail-01-classroom-hero-fast.jpg",
    imageAlt: "移工照顧培訓課程",
    badge: "技能訓練",
    idealFor: ["家中剛聘請移工", "照顧方法常常不一致", "希望降低移位與沐浴風險"],
    outcomes: ["翻身、移位、沐浴與用餐技巧", "失智陪伴與家庭溝通情境", "家屬可共同理解照顧方法"],
    flow: ["說明家中照顧難題", "選擇課程或到府教學形式", "課後整理重點與練習方向"],
    scenes: [
      { image: "assets/migrant-detail-02-transfer-fast.jpg", title: "移位實作", text: "拆解翻身、坐起、站立與輪椅轉移，讓照顧更安全。" },
      { image: "assets/migrant-detail-03-meal-fast.jpg", title: "用餐照顧", text: "練習備餐、餵食、吞嚥觀察與飯後清潔回報。" },
      { image: "assets/migrant-detail-04-communication-fast.jpg", title: "家庭溝通", text: "把每日回報、突發狀況與照顧界線整理成共同語言。" }
    ],
    applySteps: ["留下想訓練的照顧主題", "確認課程、到府教學或家屬共同參與方式", "完成報名後提供上課提醒與練習重點"],
    primaryCta: "詢問移工培訓",
    secondaryCta: "查看課程",
    contactNeed: "課程報名"
  },
  quality: {
    eyebrow: "Quality",
    title: "教育品管",
    oneLiner: "把照顧經驗變成教材、訓練、稽核與改善流程。",
    image: "assets/quality-detail-04-improvement-hero-fast.jpg",
    imageAlt: "教育品管品質改善會議",
    badge: "品質系統",
    idealFor: ["需要建立訓練制度", "服務品質想更一致", "希望用紀錄看見改善點"],
    outcomes: ["教材與標準流程整理", "新人與在職教育訓練", "服務紀錄檢核與改善會議"],
    flow: ["盤點目前服務流程", "找出訓練與稽核重點", "建立可追蹤的改善節奏"],
    scenes: [
      { image: "assets/quality-detail-01-materials-fast.jpg", title: "教材整理", text: "把現場經驗轉成新人看得懂、主管追得到的教材。" },
      { image: "assets/quality-detail-02-training-fast.jpg", title: "教育訓練", text: "用案例、演練與回饋，讓服務語言與標準更一致。" },
      { image: "assets/quality-detail-03-audit-fast.jpg", title: "品質檢核", text: "從紀錄、流程與服務回饋找出可改善的地方。" }
    ],
    applySteps: ["提出目前最想改善的服務流程", "安排訪談、文件盤點或訓練需求確認", "規劃教材、訓練與追蹤節奏"],
    primaryCta: "洽詢教育品管",
    secondaryCta: "了解軟體系統"
  },
  software: {
    eyebrow: "Software",
    title: "軟體系統",
    oneLiner: "把會計、人資、公文、專案、PDF、居家與日照流程整合成後台。",
    image: "assets/admin-recruit-02-operations-hero-hires.jpg",
    imageAlt: "長照營運系統儀表板",
    badge: "客製系統",
    idealFor: ["資料散在 Excel 和 LINE", "主管想看進度與報表", "多據點或多部門需要權限控管"],
    outcomes: ["表單、檔案、任務與報表集中", "角色權限與操作紀錄清楚", "可依單位流程客製模組"],
    flow: ["盤點最卡的流程", "規劃第一階段模組", "導入後依使用回饋迭代"],
    scenes: [
      { image: "assets/admin-recruit-02-operations-hires.jpg", title: "營運後台", text: "把案件、任務、文件與進度集中，主管不用到處找資料。" },
      { image: "assets/quality-detail-04-improvement-fast.jpg", title: "改善追蹤", text: "把會議決議、稽核缺失與改善期限變成可追蹤任務。" },
      { image: "assets/homecare-detail-02-care-plan-fast.jpg", title: "照顧流程", text: "依居家、日照、行政或專案需求客製表單與權限。" }
    ],
    applySteps: ["列出目前最花時間的表單或流程", "安排線上訪談確認權限、報表與模組範圍", "提供第一階段導入規劃與時程"],
    primaryCta: "洽詢系統客製",
    secondaryCta: "了解教育品管"
  }
};

const serviceInsightDetails = {
  "出院返家需要協助": "剛回家時最容易卡在移位、洗澡、用餐與藥物作息，先把安全和節奏穩住。",
  "白天家人不在家": "家屬上班時仍有人到宅陪伴與觀察，減少長輩獨處的不安與風險。",
  "主要照顧者需要喘息": "照顧者可以保留休息、工作與處理家務的時間，不必每件事都自己扛。",
  "沐浴、用餐、移位與生活支持": "把每天最消耗體力的照顧動作交給受訓人員協助，讓家裡更穩。",
  "服務後有紀錄，家屬看得懂": "每次服務留下重點紀錄，家屬不用靠猜，也能追蹤長輩狀態。",
  "督導追蹤，必要時調整服務": "照顧不是排好就結束，會依長輩變化調整方式、頻率與提醒。",
  "說明家中照顧情境": "先不用準備完整資料，只要把目前最卡的日常情境說清楚。",
  "確認區域、時段與照顧強度": "我們會協助判斷服務可行性、適合頻率與下一步安排。",
  "安排服務並回報紀錄": "確認後安排服務，並用紀錄讓家屬知道每次照顧發生了什麼。",
  "白天獨自在家不放心": "日照讓長輩白天有安全場域、固定作息與照顧團隊看見。",
  "需要活動與社交刺激": "活動不是打發時間，而是維持身體、認知與人際互動。",
  "家屬上班需要穩定支持": "家屬白天可以安心工作，晚上再把長輩接回熟悉的家。",
  "日常作息、餐食、活動被安排": "中心把報到、活動、用餐、休息與回家準備串成穩定節奏。",
  "中心照顧團隊觀察狀態": "食慾、精神、活動參與和身體狀況會被看見，異常可及早提醒。",
  "減少家屬白天照顧壓力": "把白天照顧壓力分出去，家庭互動比較不只剩照顧工作。",
  "了解長輩生活能力": "先確認行走、用餐、如廁、溝通與需要協助的程度。",
  "安排參觀與適應": "透過參觀或適應討論，讓長輩與家屬更安心進入服務。",
  "建立出席、接送與回報方式": "把每天怎麼到中心、怎麼回家、怎麼回報先說清楚。",
  "想讓長輩增加外出": "從熟悉社區開始，讓長輩有比較低壓的外出理由。",
  "需要預防延緩失能活動": "用規律活動維持肌力、平衡、認知與日常參與。",
  "家屬想先理解長照資源": "據點可以作為第一個入口，先問問題，再銜接合適服務。",
  "固定活動與健康促進": "把健康促進放進生活圈，讓參與變成習慣。",
  "共餐、陪伴與社交連結": "不只吃一餐，也讓長輩被看見、有人說話、有連結。",
  "可銜接居家、日照或其他資源": "當需求增加時，可以再協助轉介更合適的長照服務。",
  "確認所在區域": "先確認離家近、交通可行的據點或活動。",
  "選擇適合活動或諮詢": "依長輩興趣、能力與家屬問題選擇參與方式。",
  "安排參與並追蹤需求": "參與後若發現照顧需求，也能再協助下一步。",
  "出院後行動變弱": "從安全起身、走路與日常動作開始，慢慢找回能力。",
  "擔心跌倒或健康變化": "透過觀察與提醒，把風險提早看見，不等出事才處理。",
  "需要家屬照顧教學": "家屬可以學會更安全的扶持、移位與日常照顧方法。",
  "健康量測與風險提醒": "觀察血壓、皮膚、食慾、睡眠與用藥，整理成可理解的提醒。",
  "移位、步行、日常能力練習": "把復能放回生活情境，練的是回到日常需要的能力。",
  "居家安全與照顧方法建議": "從浴室、床邊、動線與輔具提出可執行調整。",
  "描述目前身體狀態": "先說明疾病、出院時間、行走能力與最擔心的風險。",
  "確認復能目標與風險": "一起把目標訂得清楚，例如能安全起身、走到廁所或減少跌倒。",
  "安排服務與家屬教學": "服務同時照顧長輩，也讓家屬知道在家怎麼接續。",
  "家中剛聘請移工": "剛開始最需要建立共同照顧方法，避免每個人做法不同。",
  "照顧方法常常不一致": "把翻身、移位、用餐與回報方式統一，家裡比較不混亂。",
  "希望降低移位與沐浴風險": "針對最容易受傷的動作反覆練習，讓照顧更安全。",
  "翻身、移位、沐浴與用餐技巧": "用實作讓移工知道每個動作的順序、力道與注意事項。",
  "失智陪伴與家庭溝通情境": "練習情緒安撫、日常提醒與跟家屬回報的方式。",
  "家屬可共同理解照顧方法": "家屬和移工使用同一套語言，照顧比較容易合作。",
  "說明家中照顧難題": "先從最常卡住的一兩件事開始，例如洗澡、移位或溝通。",
  "選擇課程或到府教學形式": "依家庭需求選擇團體課、個別課或到府教學。",
  "課後整理重點與練習方向": "課程後留下可回家練習的重點，不讓學習停在教室。",
  "需要建立訓練制度": "把新人訓練與在職教育整理成可複製的制度。",
  "服務品質想更一致": "讓不同人員在紀錄、溝通與照顧流程上有共同標準。",
  "希望用紀錄看見改善點": "從紀錄和回饋找問題，讓改善有依據，不靠感覺。",
  "教材與標準流程整理": "把現場經驗轉成教材、流程、案例與檢核表。",
  "新人與在職教育訓練": "讓新人進得來、資深人員也能持續校準服務品質。",
  "服務紀錄檢核與改善會議": "定期看紀錄、討論問題，形成持續改善節奏。",
  "盤點目前服務流程": "先了解現在怎麼做、卡在哪裡、誰需要參與。",
  "找出訓練與稽核重點": "優先處理最影響品質與風險的環節。",
  "建立可追蹤的改善節奏": "讓每次改善都有負責人、期限與回看方式。",
  "資料散在 Excel 和 LINE": "把訊息、檔案與表單收回系統，降低漏看與重工。",
  "主管想看進度與報表": "把任務、案件、費用與文件狀態整理成可追蹤畫面。",
  "多據點或多部門需要權限控管": "依角色設定可看、可編、可審核的範圍，資料更安全。",
  "表單、檔案、任務與報表集中": "把日常營運需要的資料放在同一個後台。",
  "角色權限與操作紀錄清楚": "每個人負責什麼、做過什麼，都能被追蹤。",
  "可依單位流程客製模組": "不是套一個固定系統，而是依照實際流程逐步導入。",
  "盤點最卡的流程": "先找出最浪費時間、最容易出錯的一段流程。",
  "規劃第一階段模組": "從最有感的功能開始做，避免一次導入太大太重。",
  "導入後依使用回饋迭代": "上線後依使用狀況調整，讓系統真正貼近日常工作。"
};

const oneMinuteServiceStories = {
  "home-care": [
    {
      name: "林小姐",
      image: "assets/homepage-batch/orange-polo-caregiver-clear.jpg",
      title: "「爸爸出院後，我終於知道每天該注意什麼。」",
      text: "每日回報會把移位、用餐、精神狀態和安全提醒說清楚，家人不用下班後一直追問。"
    },
    {
      name: "張小姐",
      image: "assets/homepage-batch/07-orange-apron-meal-prep-fast.jpg",
      title: "「照服員很細心，也會主動提醒家中風險。」",
      text: "浴室止滑、床邊動線和用藥提醒都有被看見，感覺不是只有完成服務，而是真的有人一起照顧。"
    },
    {
      name: "蔡先生",
      image: "assets/homecare-detail-04-daily-support-fast.jpg",
      title: "「媽媽白天有人陪，我工作時安心很多。」",
      text: "固定時段有人到家協助盥洗、用餐與陪伴，家屬不用把所有照顧壓力都壓在自己身上。"
    },
    {
      name: "蘇小姐",
      image: "assets/homecare-detail-02-care-plan-fast.jpg",
      title: "「照顧紀錄讓兄弟姊妹終於能同步。」",
      text: "每次服務後都有重點回報，誰也不用只靠群組訊息猜狀況，家人討論下一步時比較有共識。"
    },
    {
      name: "馬先生",
      image: "assets/homecare-detail-03-safe-transfer-fast.jpg",
      title: "「洗澡和移位有人示範後，媽媽比較不害怕。」",
      text: "照服員會用長輩聽得懂的節奏提醒動作，家屬也學到怎麼扶比較安全，不再每次洗澡都很緊張。"
    },
    {
      name: "高小姐",
      image: "assets/homepage-batch/family-consultation-clear.jpg",
      title: "「臨時狀況有人可以問，不再只靠家人硬撐。」",
      text: "遇到食慾變差、睡不好或服務時段要調整時，有窗口協助整理情況，讓家庭知道先處理哪一件事。"
    },
    {
      name: "謝小姐",
      image: "assets/homecare-detail-01-greeting-hero-fast.jpg",
      title: "「固定到宅後，媽媽的生活節奏比較穩。」",
      text: "照服員熟悉媽媽的作息和習慣後，盥洗、備餐與陪伴都更順，家人也能把照顧責任分得更清楚。"
    }
  ],
  "day-care": [
    {
      name: "陳小姐",
      image: "assets/homepage-batch/02-daycare-group-exercise-hires.jpg",
      title: "「媽媽白天有人陪，晚上還能回家睡。」",
      text: "活動、餐食和休息都有安排，媽媽回家後比較有精神，家屬上班也比較放得下心。"
    },
    {
      name: "周先生",
      image: "assets/daycare-detail-03-activity-fast.jpg",
      title: "「長輩開始期待每天去中心。」",
      text: "從一開始抗拒出門，到後來會主動問今天有什麼活動，家裡的照顧氣氛也變輕鬆。"
    },
    {
      name: "吳小姐",
      image: "assets/daycare-detail-04-checkin-fast.jpg",
      title: "「中心回報讓我下班後能快速掌握狀況。」",
      text: "出席、食慾、活動參與和特殊狀況都有人整理，家屬不需要靠零碎訊息拼湊。"
    },
    {
      name: "楊小姐",
      image: "assets/daycare-detail-02-meal-fast.jpg",
      title: "「活動照片和紀錄讓我知道爸爸真的有參與。」",
      text: "不只是接送到中心，團隊會回報今天做了什麼、吃得如何，家屬看得到白天的生活。"
    },
    {
      name: "廖先生",
      image: "assets/daycare-recruit-02-exercise-clear.jpg",
      title: "「固定接送後，家裡早上不再手忙腳亂。」",
      text: "原本每天出門都像打仗，現在時間和流程穩定，長輩比較有安全感，家人上班也不會一直遲到。"
    },
    {
      name: "曾小姐",
      image: "assets/daycare-detail-01-exercise-hero-fast.jpg",
      title: "「媽媽在中心吃得比較穩，回家也比較好睡。」",
      text: "規律活動和用餐讓作息慢慢固定，晚上回家後情緒比較平穩，家屬也能稍微喘口氣。"
    },
    {
      name: "羅小姐",
      image: "assets/daycare-recruit-05-handover-fast.jpg",
      title: "「接送交接很清楚，我們不用每天反覆交代。」",
      text: "早上接送、傍晚回家和當天狀況都有固定交接，家屬知道今天活動、用餐和精神狀態如何。"
    }
  ],
  community: [
    {
      name: "鄭小姐",
      image: "assets/homepage-batch/12-community-health-class-hires.jpg",
      title: "「阿嬤開始期待每週的活動。」",
      text: "固定出門、共餐和健康活動讓長輩重新有生活節奏，也讓家屬更早看見狀態變化。"
    },
    {
      name: "何先生",
      image: "assets/community-detail-02-meal-fast.jpg",
      title: "「共餐不只是吃飯，是有人記得關心她。」",
      text: "長輩白天多了互動和陪伴，家屬也能透過據點知道最近精神與食慾如何。"
    },
    {
      name: "許小姐",
      image: "assets/community-detail-04-consult-fast.jpg",
      title: "「第一次有人把長照資源說得這麼清楚。」",
      text: "原本不知道該從哪裡開始，據點協助整理可以問誰、怎麼申請、下一步怎麼安排。"
    },
    {
      name: "曾先生",
      image: "assets/community-detail-01-exercise-hero-hires.jpg",
      title: "「先從據點開始，爸爸比較願意走出家門。」",
      text: "不用一開始就談很重的照顧安排，先用健康促進和共餐建立習慣，長輩接受度高很多。"
    },
    {
      name: "朱小姐",
      image: "assets/community-detail-03-workshop-fast.jpg",
      title: "「健康促進課讓阿公重新願意活動。」",
      text: "課程不會讓長輩覺得被訓練，而是用聊天和小活動帶進去，家人也更容易鼓勵他持續參與。"
    },
    {
      name: "邱小姐",
      image: "assets/community-detail-04-consult-fast.jpg",
      title: "「有問題能先問據點，比自己上網查安心。」",
      text: "照顧資源、申請方式和服務差異都有人解釋，家屬不用在一堆資訊裡越看越焦慮。"
    },
    {
      name: "潘先生",
      image: "assets/community-detail-01-exercise-fast.jpg",
      title: "「社區活動讓爸爸重新有了固定朋友。」",
      text: "健康促進和共餐讓長輩每週有期待，也有人會注意他的精神和活動狀況，家裡比較放心。"
    }
  ],
  nursing: [
    {
      name: "王小姐",
      image: "assets/homepage-batch/13-rehab-walking-practice-fast.jpg",
      title: "「不是催長輩走快一點，而是陪他慢慢有把握。」",
      text: "復能團隊把目標拆小，從安全起身、站穩到短距離步行，家屬也看得懂進步。"
    },
    {
      name: "沈先生",
      image: "assets/nursing-detail-01-vitals-clear.jpg",
      title: "「有人幫忙觀察，我們比較不會慌。」",
      text: "血壓、食慾、睡眠和皮膚狀況都有被提醒，家屬知道哪些變化需要再注意。"
    },
    {
      name: "李小姐",
      image: "assets/nursing-detail-03-home-safety-fast.jpg",
      title: "「家裡怎麼調整，終於有具體方向。」",
      text: "浴室、床邊和走道動線被重新檢查，家人知道哪些地方要先處理，照顧更安全。"
    },
    {
      name: "許先生",
      image: "assets/nursing-detail-02-walking-clear.jpg",
      title: "「復能目標寫清楚後，每天練什麼都知道。」",
      text: "不是模糊地叫長輩多走動，而是把起身、站立和平衡拆成小步驟，家人陪練比較有方向。"
    },
    {
      name: "陳先生",
      image: "assets/nursing-detail-01-vitals-clear.jpg",
      title: "「血壓和皮膚狀況有人追，回診時資料更完整。」",
      text: "以前回診常說不清楚最近變化，現在有觀察紀錄，醫師和家屬都比較容易判斷下一步。"
    },
    {
      name: "趙小姐",
      image: "assets/nursing-detail-03-home-safety-fast.jpg",
      title: "「家裡動線調整後，半夜起身比較安心。」",
      text: "團隊提醒床邊、走道和廁所的風險點，先做小調整，就讓夜間照顧少了很多緊張。"
    },
    {
      name: "彭小姐",
      image: "assets/nursing-detail-02-walking-hero-fast.jpg",
      title: "「從出院返家到穩定練走路，有人陪著調整。」",
      text: "復能目標會依爸爸每天狀況調整，不是硬練，而是讓他慢慢找回站起來和走到客廳的信心。"
    }
  ],
  "migrant-training": [
    {
      name: "黃小姐",
      image: "assets/migrant-detail-02-transfer-fast.jpg",
      title: "「家裡有移工後，最需要的是有人教方法。」",
      text: "翻身、移位和沐浴安全用實作方式教清楚，家屬和移工都知道同一套照顧標準。"
    },
    {
      name: "賴先生",
      image: "assets/migrant-detail-04-communication-fast.jpg",
      title: "「溝通方式對齊後，家裡少了很多誤會。」",
      text: "課程把每日回報、突發狀況和照顧界線說明白，照顧不再只是各做各的。"
    },
    {
      name: "郭小姐",
      image: "assets/migrant-detail-03-meal-fast.jpg",
      title: "「用餐照顧比想像中細，學過後放心很多。」",
      text: "從備餐、餵食姿勢到吞嚥觀察都有練習，回家後比較知道怎麼看長輩狀態。"
    },
    {
      name: "林先生",
      image: "assets/migrant-detail-01-classroom-hero-fast.jpg",
      title: "「移工和家屬一起聽，照顧規則比較一致。」",
      text: "課程把安全移位、回報方式和緊急狀況講清楚，家裡比較不會因為標準不同而吵架。"
    },
    {
      name: "陳太太",
      image: "assets/migrant-detail-02-transfer-fast.jpg",
      title: "「洗澡抗拒的情境演練，回家真的用得上。」",
      text: "老師不是只講理論，而是示範怎麼安撫、怎麼分段完成，照顧者比較知道怎麼接住情緒。"
    },
    {
      name: "蘇先生",
      image: "assets/migrant-detail-04-communication-fast.jpg",
      title: "「課後有重點回饋，知道下一週要練什麼。」",
      text: "家屬、移工和督導能對齊下一步，不會上完課就結束，真正回到家裡的照顧流程。"
    },
    {
      name: "許小姐",
      image: "assets/migrant-recruit-03-meal-prep-fast.jpg",
      title: "「移工學會怎麼觀察用餐，家裡少了很多緊張。」",
      text: "課程把備餐、餵食、嗆咳觀察和回報方式講清楚，家屬知道哪些狀況要追蹤。"
    }
  ],
  quality: [
    {
      name: "吳小姐",
      image: "assets/homepage-batch/14-care-notes-fast.jpg",
      title: "「每次服務後有紀錄，我下班也能掌握狀況。」",
      text: "服務紀錄不是口頭交代，而是清楚整理飲食、活動、情緒與需要追蹤的狀況。"
    },
    {
      name: "何小姐",
      image: "assets/quality-detail-03-audit-fast.jpg",
      title: "「遇到問題時，不是只有現場人員自己扛。」",
      text: "督導和品管會一起檢視流程、調整做法，讓家屬感覺背後真的有一個團隊。"
    },
    {
      name: "謝先生",
      image: "assets/quality-detail-02-training-fast.jpg",
      title: "「新人訓練有標準，服務品質比較穩。」",
      text: "教材、演練與回饋讓每位照顧人員知道怎麼做，也讓主管比較容易追蹤改善。"
    },
    {
      name: "黃先生",
      image: "assets/quality-recruit-04-quality-meeting-clear.jpg",
      title: "「紀錄格式一致後，交班少了很多漏接。」",
      text: "服務重點、異常狀況和後續追蹤都用同一套格式整理，新舊人員交接時比較清楚。"
    },
    {
      name: "朱先生",
      image: "assets/quality-detail-04-improvement-fast.jpg",
      title: "「品管不是責備，而是一起找下一次怎麼更好。」",
      text: "督導會和現場一起看情境，調整流程和提醒方式，團隊比較願意把問題說出來。"
    },
    {
      name: "林督導",
      image: "assets/quality-detail-03-audit-fast.jpg",
      title: "「新人訓練和案例討論讓團隊更敢回報問題。」",
      text: "遇到不確定的狀況時，照顧人員知道可以回報、可以被支持，品質才會穩定往上走。"
    },
    {
      name: "蔡小姐",
      image: "assets/quality-detail-01-materials-fast.jpg",
      title: "「教材和檢核表整理後，新人比較快進入狀況。」",
      text: "服務倫理、紀錄方式和異常回報都有清楚範本，主管不用每次從零開始教。"
    }
  ],
  software: [
    {
      name: "營運主管",
      image: "assets/admin-recruit-02-operations-hires.jpg",
      title: "「不用再從 LINE、Excel 和紙本裡找同一份資料。」",
      text: "案件、表單、任務和文件集中後，主管看進度更快，交接也比較不容易漏。"
    },
    {
      name: "行政窗口",
      image: "assets/quality-detail-04-improvement-fast.jpg",
      title: "「改善事項有人負責、有期限，也能回頭追。」",
      text: "會議結論、稽核缺失和後續處理被整理成任務，跨部門協作比較清楚。"
    },
    {
      name: "服務督導",
      image: "assets/homecare-detail-02-care-plan-fast.jpg",
      title: "「服務流程和權限清楚後，團隊更敢使用。」",
      text: "不同角色看到該看的資料，紀錄和報表也能依流程累積，不再只靠人腦記。"
    },
    {
      name: "財務窗口",
      image: "assets/admin-recruit-02-operations-hires.jpg",
      title: "「請款和收據集中後，月底對帳快很多。」",
      text: "過去要從不同表單和訊息找資料，現在服務、費用和文件能一起查，行政負擔明顯少很多。"
    },
    {
      name: "區域主管",
      image: "assets/admin-recruit-05-meeting-clear.jpg",
      title: "「不同據點的進度放在同一張看板上。」",
      text: "主管不用逐一問人，案件狀態、待辦和異常都能快速掌握，跨據點管理比較穩。"
    },
    {
      name: "人資窗口",
      image: "assets/quality-recruit-02-training-clear.jpg",
      title: "「招募與新人資料不用反覆重填。」",
      text: "從履歷、面談、報到到訓練紀錄能接在一起，資料比較完整，也減少重複輸入。"
    },
    {
      name: "王主管",
      image: "assets/admin-recruit-05-meeting-fast.jpg",
      title: "「例行報表自動整理後，管理會議更快進入重點。」",
      text: "服務量、待辦、表單與改善進度能集中查看，會議不用再花半小時整理資料來源。"
    }
  ]
};

const homepageCareStoryServiceOrder = [
  ["home-care", "居家照顧"],
  ["day-care", "日間照顧"],
  ["community", "社區據點"],
  ["nursing", "護理復能"],
  ["migrant-training", "移工培訓"],
  ["quality", "教育品管"],
  ["software", "軟體系統"]
];

function getHomepageCareStoryFallbacks() {
  return homepageCareStoryServiceOrder.flatMap(([slug, service]) => {
    const stories = oneMinuteServiceStories[slug] || [];
    return stories.slice(0, 2).map((story) => ({
      name: story.name,
      service,
      title: story.title,
      praise: story.text,
      avatar: testimonialAvatarUrl(story.name, service, story.image)
    }));
  });
}

function ensureHomepageStoryCoverage(stories = []) {
  const requiredServices = new Map(homepageCareStoryServiceOrder.map(([, service]) => [service, 2]));
  const normalizedStories = (stories || [])
    .filter(Boolean)
    .map((story) => {
      const service = story.service || story.service_type || "居家照顧";
      const name = story.name || story.person_name || "家屬回饋";
      return {
        name,
        service,
        title: story.title || story.quote || "「照顧被看見，家人就比較安心。」",
        praise: story.praise || story.text || story.body || story.summary || "",
        avatar: story.avatar || testimonialAvatarUrl(name, service, story.image)
      };
    });
  const serviceCount = new Map();
  const seen = new Set();
  normalizedStories.forEach((story) => {
    const key = `${story.service}:${story.name}:${story.title}`;
    seen.add(key);
    serviceCount.set(story.service, (serviceCount.get(story.service) || 0) + 1);
  });

  getHomepageCareStoryFallbacks().forEach((fallback) => {
    if (!requiredServices.has(fallback.service)) return;
    if ((serviceCount.get(fallback.service) || 0) >= requiredServices.get(fallback.service)) return;
    const key = `${fallback.service}:${fallback.name}:${fallback.title}`;
    if (seen.has(key)) return;
    normalizedStories.push(fallback);
    seen.add(key);
    serviceCount.set(fallback.service, (serviceCount.get(fallback.service) || 0) + 1);
  });

  return normalizedStories;
}

function normalizeServiceInsight(item) {
  if (item && typeof item === "object") {
    return {
      title: item.title || "",
      text: item.text || serviceInsightDetails[item.title] || ""
    };
  }
  return {
    title: String(item || ""),
    text: serviceInsightDetails[item] || "我們會依你的情境協助判斷，讓下一步更清楚。"
  };
}

function renderServiceInsightList(items = [], scenes = [], offset = 0) {
  return items.map((item, index) => {
    const insight = normalizeServiceInsight(item);
    const scene = scenes[(index + offset) % Math.max(scenes.length, 1)] || {};
    const sceneImage = scene.image ? contentImageUrl(scene.image) : "";
    return `
      <li>
        <span class="service-timeline-dot">${String(index + 1).padStart(2, "0")}</span>
        ${sceneImage ? `<figure><img src="${escapeHTML(sceneImage)}" alt="${escapeHTML(insight.title)}" /></figure>` : ""}
        <div>
          <strong>${escapeHTML(insight.title)}</strong>
          <p>${escapeHTML(insight.text)}</p>
        </div>
      </li>
    `;
  }).join("");
}

function renderServiceSceneCards(items = []) {
  return items.map((item) => `
    <article>
      <img src="${escapeHTML(contentImageUrl(item.image))}" alt="${escapeHTML(item.title)}" />
      <div>
        <strong>${escapeHTML(item.title)}</strong>
        <p>${escapeHTML(item.text)}</p>
      </div>
    </article>
  `).join("");
}

function serviceSecondaryHref(text = "") {
  if (text.includes("課程")) return "#courses";
  if (text.includes("據點")) return "#network";
  if (text.includes("居家")) return "#home-care";
  if (text.includes("軟體")) return "#software";
  if (text.includes("品管")) return "#quality";
  return "#contact";
}

function renderServiceStorySection(service, slug) {
  const stories = oneMinuteServiceStories[slug] || [];
  if (!stories.length) return "";
  return `
    <section class="story-section service-story-section service-detail-section service-motion" aria-label="${escapeHTML(service.title)}使用者心得回饋">
      <div class="service-section-head">
        <div>
          <p class="eyebrow">Care Stories</p>
          <h2>${escapeHTML(service.title)}使用者心得回饋</h2>
        </div>
        <span>這裡只放與${escapeHTML(service.title)}相關的回饋，讓你看到接近自己情境的真實感受。</span>
      </div>
      <div class="story-slider service-story-slider" aria-label="${escapeHTML(service.title)}心得回饋滑動列表">
        ${stories.map((story) => `
          <article>
            <img class="story-face" src="${escapeHTML(testimonialAvatarUrl(story.name, service.title, story.image))}" alt="${escapeHTML(story.name)}心得照片" />
            <span class="story-meta"><b>${escapeHTML(story.name)}</b><em>${escapeHTML(service.title)}</em></span>
            <h3>${escapeHTML(story.title)}</h3>
            <div class="story-points"><p>${escapeHTML(story.text)}</p></div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderServicePlainList(items = []) {
  return items.map((item, index) => `
    <li class="${item.featured ? "is-featured" : ""} ${item.cta ? "has-cta" : ""}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${escapeHTML(item.title)}</strong>
      ${item.text ? `<p>${escapeHTML(item.text)}</p>` : ""}
      ${Array.isArray(item.points) && item.points.length ? `
        <ul class="service-info-points">
          ${item.points.map((point) => `<li>${escapeHTML(point)}</li>`).join("")}
        </ul>
      ` : ""}
      ${item.cta ? `<a class="service-info-link" href="${escapeHTML(item.href || "#service-contact")}" data-service-scroll="${escapeHTML(item.href || "#service-contact")}">${escapeHTML(item.cta)}</a>` : ""}
    </li>
  `).join("");
}

function serviceFeeBody(slug) {
  if (slug === "home-care" || slug === "day-care" || slug === "nursing") {
    return "實際自付額會依長照等級、補助身分、核定額度與使用頻率不同，我們可先協助初步試算。";
  }
  return "實際費用會依服務內容、補助資格、區域與頻率確認，先留下需求即可協助試算。";
}

function serviceFeeItems(service, slug) {
  if (slug === "home-care") {
    return [
      { title: "先看補助與照顧計畫", text: "居家照顧不是每項都要全額自費。窗口會先確認長照等級、核定額度、身分別與你想安排的頻率，再估算每月可能自付額。", featured: true },
      {
        title: "常見居家項目參考",
        text: "以下為長照給（支）付價格參考，格式為一般價格／原民區或離島價格，實際自付額會再依補助比例計算。",
        points: [
          "BA01 基本身體清潔：NT$260／NT$310",
          "BA02 基本日常照顧：NT$195／NT$235",
          "BA07 協助沐浴及洗頭：NT$325／NT$385",
          "BA14 陪同就醫：NT$685／NT$825",
          "BA15 家務協助：NT$195／NT$235"
        ]
      },
      { title: "想知道每月大概多少？", text: "留下長輩狀況、所在地區、每週想安排幾次服務，我們會協助抓出比較貼近家庭日常的試算範圍。", cta: "請窗口協助試算", href: "#service-contact" }
    ];
  }
  if (slug === "day-care") {
    return [
      { title: "先看等級、全日或半日", text: "日間照顧會依長照需要等級、全日或半日、每週出席天數來估算。若需要接送、晚餐或沐浴等中心附加服務，會再一起確認。", featured: true },
      {
        title: "日照常見價格範圍",
        text: "以下為長照給（支）付價格參考，格式為一般價格／原民區或離島價格；交通接送與附加服務需依中心安排另行確認。",
        points: [
          "BB01/BB02 等級二：全日 NT$675／NT$810、半日 NT$340／NT$405",
          "BB13/BB14 等級八：全日 NT$1,285／NT$1,540、半日 NT$645／NT$770",
          "BD01 協助沐浴：NT$200／NT$240，實際需要時可能另計",
          "BD02 晚餐：NT$150／NT$180；BD03 接送：NT$100／NT$120，符合條件時可能另計"
        ]
      },
      { title: "想估一週去幾天的費用？", text: "告訴我們長照等級、想安排全日或半日、每週天數與是否需要接送，中心窗口可以先幫你抓大概自付額。", cta: "請中心協助試算", href: "#service-contact" }
    ];
  }
  if (slug === "nursing") {
    return [
      { title: "先訂專業目標", text: "護理復能不是把所有項目都排上去，而是先看長輩目前最需要改善的生活能力、營養吞嚥或照護風險，再確認適合的服務組合。", featured: true },
      {
        title: "專業服務價格參考",
        text: "以下為長照給（支）付價格參考，格式為一般價格／原民區或離島價格；實際自付額依補助資格、核定額度與服務次數確認。",
        points: [
          "CA07 IADLs／ADLs 復能：3 次措施 NT$4,500／NT$5,400",
          "CA08 個別化服務計畫（ISP）：4 次措施 NT$6,000／NT$7,200",
          "CB01 營養照護：3 次措施 NT$4,500／NT$5,400",
          "CB02 進食與吞嚥照護：6 次措施 NT$9,000／NT$10,800",
          "CB03 困擾行為照護：3 次措施 NT$4,500／NT$5,400",
          "CB04 臥床或長期活動受限照護：6 次措施 NT$9,000／NT$10,800"
        ]
      },
      { title: "不確定適合哪一項？", text: "先描述診斷、出院時間、行走能力、飲食吞嚥或目前最擔心的狀況，我們會協助判斷是否適合安排護理復能。", cta: "請專人協助判斷", href: "#service-contact" }
    ];
  }
  return [
    { title: "依服務內容確認", text: "費用會依服務類型、頻率、時段、區域與是否使用補助而不同。" },
    { title: "可先諮詢試算", text: "不用先準備完整資料，留下需求後會由窗口協助初步判斷。" },
    { title: "確認後再安排", text: "服務內容、費用與開始日期會確認清楚後再進入安排流程。" }
  ];
}

const cmsAllowanceLevels = [
  { level: 1, care: "不納入給付", respite: "不適用", shortCare: "不適用" },
  { level: 2, care: "10,020", respite: "32,340", shortCare: "87,780" },
  { level: 3, care: "15,460", respite: "32,340", shortCare: "87,780" },
  { level: 4, care: "18,580", respite: "32,340", shortCare: "87,780" },
  { level: 5, care: "24,100", respite: "32,340", shortCare: "87,780" },
  { level: 6, care: "28,070", respite: "32,340", shortCare: "87,780" },
  { level: 7, care: "32,090", respite: "48,510", shortCare: "71,610" },
  { level: 8, care: "36,180", respite: "48,510", shortCare: "71,610" }
];

function renderCmsAllowanceTable() {
  return `
    <div class="fee-allowance-table-wrap" role="region" aria-label="CMS 等級給付額度表" tabindex="0">
      <table class="fee-allowance-table">
        <thead><tr><th scope="col">CMS 等級</th><th scope="col">照顧及專業服務（月）</th><th scope="col">喘息服務 G 碼（年）</th><th scope="col">短照服務 SC 碼（年）</th></tr></thead>
        <tbody>${cmsAllowanceLevels.map((item) => `
          <tr><th scope="row">第 ${item.level} 級</th><td>${escapeHTML(item.care)}${item.level === 1 ? "" : " 元"}</td><td>${escapeHTML(item.respite)}${item.level === 1 ? "" : " 元"}</td><td>${escapeHTML(item.shortCare)}${item.level === 1 ? "" : " 元"}</td></tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function renderFeeCodeTable(rows = []) {
  return `
    <div class="fee-code-table-wrap" role="region" aria-label="長照服務碼表" tabindex="0">
      <table class="fee-code-table">
        <thead><tr><th scope="col">碼別</th><th scope="col">項目</th><th scope="col">內容／單位</th><th scope="col">一般價格</th><th scope="col">原民區或離島</th><th scope="col">備註</th></tr></thead>
        <tbody>${rows.map((row) => `
          <tr><th scope="row">${escapeHTML(row.code)}</th><td>${escapeHTML(row.name)}</td><td>${escapeHTML(row.content)}</td><td>${escapeHTML(row.price)} 元</td><td>${escapeHTML(row.remotePrice)} 元</td><td>${escapeHTML(row.note || "依照顧計畫與照管中心核定。")}</td></tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

let dayCareFeeDataPromise = null;

function loadDayCareFeeData() {
  if (!dayCareFeeDataPromise) {
    dayCareFeeDataPromise = import("./daycare-fees.js").catch((error) => {
      dayCareFeeDataPromise = null;
      throw error;
    });
  }
  return dayCareFeeDataPromise;
}

function hydrateDayCareFeeGroups(root = document) {
  const target = root.querySelector?.("[data-daycare-fee-groups]");
  if (!target || target.dataset.loaded === "true" || target.dataset.loaded === "loading") return;
  target.dataset.loaded = "loading";
  loadDayCareFeeData()
    .then(({ dayCareFeeGroups }) => {
      if (routeSlugFromLocation().split("?")[0] !== "day-care") return;
      target.innerHTML = dayCareFeeGroups.map((group, index) => `
        <details class="fee-code-group" ${index === 0 ? "open" : ""}>
          <summary><span>${escapeHTML(group.title)}</span><small>${escapeHTML(group.note)}</small></summary>
          ${renderFeeCodeTable(group.rows)}
        </details>
      `).join("");
      target.dataset.loaded = "true";
    })
    .catch((error) => {
      console.warn("Day care fee data unavailable.", error);
      target.dataset.loaded = "error";
      target.textContent = "碼別資料暫時無法載入，請稍後重新整理或直接向中心詢問。";
    });
}

let nursingFeeDataPromise = null;

function loadNursingFeeData() {
  if (!nursingFeeDataPromise) nursingFeeDataPromise = import("./nursing-fees.js");
  return nursingFeeDataPromise;
}

function hydrateNursingFeeGroups(root = document) {
  if (!root.querySelector("[data-ns]")) return;
  loadNursingFeeData().then(({ hydrateNursingPage }) => hydrateNursingPage(root)).catch(Boolean);
}

function renderDayCareFeeSection() {
  return `
    <section class="service-fee-section service-detail-section service-motion">
      <div class="service-section-head"><div><p class="eyebrow">Pricing</p><h2>費用怎麼算</h2></div><span>日間照顧會依長照等級、全日或半日、接送與附加服務，以及補助身分估算；中心可協助試算每月可能費用。</span></div>
      <div class="fee-summary-grid">
        <article><strong>依等級與全日／半日計價</strong><p>日照 BB 碼依長照第 2-8 級分全日、半日；第 2 級全日為 675／810 元，第 8 級全日為 1,285／1,540 元。</p></article>
        <article><strong>可能另計的附加項目</strong><p>社區式沐浴 BD01、晚餐 BD02、交通接送 BD03，會依中心安排與照管核定狀況另外估算。</p></article>
        <article class="has-cta"><strong>想知道每月大概多少？</strong><p>告訴我們每週天數、全日或半日、是否接送與補助身分，中心可先協助試算。</p><a class="service-info-link" href="#service-contact" data-service-scroll="#service-contact">請中心協助試算</a></article>
      </div>
      <article class="fee-allowance-card"><div><p class="eyebrow">CMS Wallet</p><h3>CMS 第 1-8 級可用額度</h3><p>第 1 級不納入長照給付；第 2-8 級依核定額度補助。超過核定額度、非核定項目或額外加購服務，皆採自費。</p></div>${renderCmsAllowanceTable()}</article>
      <div class="fee-code-groups" data-daycare-fee-groups aria-live="polite"><p class="fee-code-loading">碼別服務介紹載入中...</p></div>
      <p class="fee-source-note">實際可用服務、部分負擔與自費金額，仍以照管中心核定、地方政府公告及服務契約為準。</p>
    </section>
  `;
}

function renderNursingFeeSection() {
  const service = oneMinuteServices.nursing;
  return `
    <section class="service-fee-section service-detail-section service-motion">
      <div class="service-section-head"><div><p class="eyebrow">Pricing</p><h2>費用怎麼算</h2></div><span>${escapeHTML(serviceFeeBody("nursing"))}</span></div>
      <div class="fee-summary-grid">
        ${serviceFeeItems(service, "nursing").map((item) => `
          <article class="${item.cta ? "has-cta" : ""}">
            <strong>${escapeHTML(item.title)}</strong>
            <p>${escapeHTML(item.text)}</p>
            ${Array.isArray(item.points) && item.points.length ? `<ul class="service-info-points">${item.points.map((point) => `<li>${escapeHTML(point)}</li>`).join("")}</ul>` : ""}
            ${item.cta ? `<a class="service-info-link" href="${escapeHTML(item.href || "#service-contact")}" data-service-scroll="${escapeHTML(item.href || "#service-contact")}">${escapeHTML(item.cta)}</a>` : ""}
          </article>
        `).join("")}
      </div>
      <article class="fee-allowance-card"><div><p class="eyebrow">CMS Wallet</p><h3>CMS 第 1-8 級可用額度</h3><p>第 1 級不納入長照給付；第 2-8 級依核定額度補助。超過核定額度、非核定項目或額外加購服務，皆採自費。</p></div>${renderCmsAllowanceTable()}</article>
      <div class="fee-code-groups" data-nursing-fee-groups aria-live="polite"><p class="fee-code-loading">護理復能碼別服務介紹載入中...</p></div>
      <p class="fee-source-note">實際可用服務、部分負擔與自費金額，仍以照管中心核定、地方政府公告及服務契約為準。</p>
    </section>
  `;
}

function renderDayCarePreparationSection() {
  const items = [
    { title: "先完成參觀與試上一日", text: "確認長輩適應環境、活動、用餐與作息後，再安排體檢與正式入托。" },
    { title: "準備六個月內體檢文件", text: "包含抽血、B 肝表面抗原、尿液、胸部 X 光與皮膚檢查；不需糞便檢查。" },
    { title: "帶好日常用品與用藥", text: "衛生與盥洗用品、保溫瓶、寢具、替換衣物、藥盒與必要衛生用品；藥盒請先分裝並附服藥說明。" }
  ];
  return renderServiceInfoSection({
    eyebrow: "Before Enrollment",
    title: "入托前，先知道這三件事",
    body: "請依長輩平時生活習慣準備；不確定的項目可在參觀或試上一日後再和中心確認。",
    items,
    className: "service-notes-section day-care-preparation-section"
  });
}

function serviceLocationItems(service, slug) {
  if (slug === "day-care") {
    return [
      { title: "一館｜歲悅萬華社區長照機構", text: "108 臺北市萬華區康定路43號2樓" },
      { title: "二館｜歲悅萬華二館社區長照機構", text: "108 臺北市萬華區西門里成都路159號2樓（雅香石頭火鍋二樓）" }
    ];
  }
  if (slug === "software") {
    return [
      { title: "線上訪談", text: "先以線上會議盤點流程、角色權限與第一階段模組。" },
      { title: "跨區導入", text: "可依單位、部門或據點分階段導入，不限單一場域。" },
      { title: "到場討論", text: "若流程複雜，可再安排現場訪談或工作坊確認細節。" }
    ];
  }
  return [
    { title: "台北市", text: "依服務項目、時段與人力安排確認可服務區域。" },
    { title: "新北市", text: "可先留下所在地區，窗口會協助確認最近可銜接資源。" },
    { title: "桃園市", text: "日照、居家、社區與其他服務會依各據點與服務範圍確認。" }
  ];
}

function renderDayCareLocationMap() {
  const mapQuery = encodeURIComponent("歲悅萬華社區長照機構 108臺北市萬華區康定路43號2樓");
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&origin=108%E8%87%BA%E5%8C%97%E5%B8%82%E8%90%AC%E8%8F%AF%E5%8D%80%E5%BA%B7%E5%AE%9A%E8%B7%AF43%E8%99%9F2%E6%A8%93&destination=108%E8%87%BA%E5%8C%97%E5%B8%82%E8%90%AC%E8%8F%AF%E5%8D%80%E8%A5%BF%E9%96%80%E9%87%8C%E6%88%90%E9%83%BD%E8%B7%AF159%E8%99%9F2%E6%A8%93";
  return `
    <div class="day-care-location-map">
      <div class="day-care-location-map-copy">
        <p class="eyebrow">Map</p>
        <strong>萬華兩館都在西門周邊</strong>
        <p>一館與二館距離不遠，參觀前可先依地址確認方便前往的館別。</p>
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer">在 Google 地圖開啟兩館位置</a>
      </div>
      <iframe
        title="歲悅萬華日照中心周邊地圖"
        src="https://www.google.com/maps?output=embed&q=${mapQuery}&z=15"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  `;
}

function serviceNoticeItems(service, slug) {
  return [
    { title: "先描述情境即可", text: "不用一次準備完整資料，先說明長輩狀態、所在地區與最急迫的需求。" },
    { title: "窗口會協助判斷", text: `我們會依${service.title}需求確認適合服務、可服務時間與下一步資料。` },
    { title: "安排前會再次確認", text: "服務內容、費用、頻率與開始日期確認後，才會進入正式安排。" }
  ];
}

function renderServiceInfoSection({ eyebrow, title, body, items, className = "", id = "", content = "" }) {
  return `
    <section${id ? ` id="${escapeHTML(id)}"` : ""} class="service-info-section service-detail-section service-motion ${escapeHTML(className)}">
      <div class="service-section-head">
        <div>
          <p class="eyebrow">${escapeHTML(eyebrow)}</p>
          <h2>${escapeHTML(title)}</h2>
        </div>
        <span>${escapeHTML(body)}</span>
      </div>
      <ol class="service-info-grid">
        ${renderServicePlainList(items)}
      </ol>
      ${content}
    </section>
  `;
}

function renderServiceContactSection(service, slug) {
  const contactNeed = service.contactNeed || (slug === "software" ? "軟體系統諮詢" : slug === "quality" ? "教育品管諮詢" : "長照服務諮詢");
  const isDayCare = slug === "day-care";
  const title = isDayCare
    ? "先安排參觀，讓長輩親自感受。"
    : `想申請${service.title}？直接留下需求，讓歲悅協助你確認下一步。`;
  const intro = isDayCare
    ? "填寫姓名、電話與需求，我們會先協助安排參觀；是否試上一日、入托與費用，都能在看完環境後再決定。"
    : `不用先準備完整資料。先留下姓名、電話與需求類型，我們會依照${service.title}安排合適窗口，原則上 1 個工作天內主動聯繫。`;
  const expectation = isDayCare
    ? "送出後，我們會聯繫你確認館別、長輩狀況與方便參觀時間。"
    : "送出後會寄到歲悅窗口並留存在系統，窗口會依需求類型安排專人回覆。";
  const buttonLabel = isDayCare ? "送出參觀需求" : `送出${service.title}諮詢`;
  return `
    <section class="contact-section service-contact-section service-motion" id="service-contact" aria-label="${escapeHTML(service.title)}申請諮詢表單">
      <div>
        <p class="eyebrow">Contact Us</p>
        <h2>${escapeHTML(title)}</h2>
        <p>${escapeHTML(intro)}</p>
      </div>
      <form class="contact-form" action="/api/send-email" method="POST" data-form-type="contact">
        <input type="hidden" name="form_type" value="${escapeHTML(contactNeedToFormType(contactNeed))}" />
        <input type="hidden" name="_subject" value="歲悅長照官網${escapeHTML(service.title)}諮詢表單" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <label>姓名<input type="text" name="姓名" placeholder="請輸入姓名" required /></label>
        <label>電話<input type="tel" name="電話" placeholder="請輸入聯絡電話" required /></label>
        <label>Email<input type="email" name="Email" placeholder="可選填，方便寄送回覆紀錄" /></label>
        <label>需求<select name="需求" required>${renderContactNeedOptions(contactNeed)}</select></label>
        ${slug === "nursing" ? `<i data-ni></i>` : ""}
        <label class="form-notes">說明<textarea name="說明" rows="6" placeholder="可簡單描述目前遇到的情境、希望詢問的服務內容、所在地區或方便聯絡時間"></textarea></label>
        <p class="form-expectation">${escapeHTML(expectation)}</p>
        <label class="privacy-consent"><input type="checkbox" name="privacy_consent" required />我同意歲悅長照集團為回覆諮詢、服務安排與後續聯繫目的，使用我填寫的個人資料。</label>
        <p class="contact-form-status" role="status" aria-live="polite" hidden></p>
        <button type="submit">${escapeHTML(buttonLabel)}</button>
      </form>
    </section>
  `;
}

function renderOneMinuteServicePage(slug, layout = {}) {
  const service = oneMinuteServices[slug] || oneMinuteServices["home-care"];
  const contactNeed = service.contactNeed || "長照服務諮詢";
  const usesDayCareTemplate = layout.template === "day-care";
  const isNursing = slug === "nursing";
  const isDayCare = slug === "day-care";
  const heroImage = heroImageForViewport(service.image);
  return `
    <div class="service-detail-page one-minute-service-page ${usesDayCareTemplate ? "day-care-template-page" : ""} ${escapeHTML(slug)}-page">
      <section class="hero service-detail-hero one-minute-service-hero ${escapeHTML(slug)}-hero">
        <div
          class="hero-bg"
          data-cms-field="background_image"
          style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(heroImage)}');"
          aria-hidden="true"
        ></div>
        <div class="hero-copy service-detail-copy">
          <p class="eyebrow">${escapeHTML(service.eyebrow)}</p>
          <h1>${escapeHTML(service.title)}</h1>
          <p class="hero-slogan">${escapeHTML(service.badge)}｜2 分鐘了解</p>
          <p>${escapeHTML(service.oneLiner)}</p>
          <div class="one-minute-service-actions">
            <a class="primary-button" href="#service-contact" data-service-scroll="#service-contact" data-contact-need="${escapeHTML(contactNeed)}" data-contact-message="我想了解${escapeHTML(service.title)}，希望協助判斷服務內容、可服務區域、費用與下一步申請方式。">${escapeHTML(service.primaryCta)}</a>
            <a class="ghost-button" href="#service-apply-notes" data-service-scroll="#service-apply-notes">申請服務須知</a>
          </div>
          <div class="one-minute-proof" aria-label="${escapeHTML(service.title)}重點摘要">
            <span>2 分鐘了解</span>
            <strong>先看照護情境，再知道怎麼申請</strong>
          </div>
        </div>
      </section>

      <section class="one-minute-service-summary service-motion" aria-label="${escapeHTML(service.title)}快速摘要">
        <article class="service-motion">
          <span>01</span>
          <h2>你遇到的狀況</h2>
          <ul>${renderServiceInsightList(service.idealFor, service.scenes, 0)}</ul>
        </article>
        <article class="service-motion">
          <span>02</span>
          <h2>我們可以提供什麼協助</h2>
          <ul>${renderServiceInsightList(service.outcomes, service.scenes, 1)}</ul>
        </article>
        <article class="service-motion">
          <span>03</span>
          <h2>如何申請服務</h2>
          <ul>${renderServiceInsightList(service.applySteps || service.flow, service.scenes, 2)}</ul>
        </article>
      </section>

      ${isNursing ? `<i data-ns></i>` : `<section class="two-minute-scenes service-motion" aria-label="${escapeHTML(service.title)}實際照護畫面">
        <div class="service-section-head">
          <p class="eyebrow">Care Scenes</p>
          <h2>實際照顧現場畫面</h2>
        </div>
        <div class="two-minute-scene-grid">
          ${renderServiceSceneCards(service.scenes)}
        </div>
      </section>`}

      ${isNursing ? "" : renderServiceStorySection(service, slug)}

      ${isDayCare ? renderDayCareFeeSection() : isNursing ? renderNursingFeeSection() : renderServiceInfoSection({
        eyebrow: "Pricing",
        title: "費用怎麼算",
        body: serviceFeeBody(slug),
        items: serviceFeeItems(service, slug),
        className: "service-fee-section"
      })}

      ${renderServiceInfoSection({
        eyebrow: "Locations",
        title: "地點分佈",
        body: "先確認你所在區域，我們會協助判斷可服務性、鄰近據點或合適窗口。",
        items: serviceLocationItems(service, slug),
        className: "service-location-section",
        content: isDayCare ? renderDayCareLocationMap() : ""
      })}

      ${renderServiceInfoSection({
        eyebrow: "Before Apply",
        title: "申請服務須知",
        body: "申請前不用焦慮準備資料，先把目前情境說清楚，窗口會帶你往下一步走。",
        items: serviceNoticeItems(service, slug),
        className: "service-notes-section",
        id: "service-apply-notes"
      })}

      ${isDayCare ? renderDayCarePreparationSection() : ""}

      ${isNursing ? renderServiceStorySection(service, slug) : ""}

      ${renderServiceContactSection(service, slug)}
    </div>
  `;
}

function renderHomeCarePage() {
  return renderOneMinuteServicePage("home-care");
}

function renderDayCarePage() {
  return renderOneMinuteServicePage("day-care", { template: "day-care" });
}

function renderNursingPage() {
  return renderOneMinuteServicePage("nursing", { template: "day-care" });
}

function renderMigrantTrainingPage() {
  return renderOneMinuteServicePage("migrant-training");
}

function renderQualityPage() {
  return renderOneMinuteServicePage("quality");
}

function renderInvestorRecruitingPage() {
  const heroImage = heroImageForViewport("assets/investor-recruit-hero-hd.jpg");
  const thesis = [
    ["剛性需求", "高齡化、家庭照顧人力不足與出院返家支持需求，讓長照服務不是短期題材，而是長期基礎服務。"],
    ["多事業佈局", "居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管可彼此導流與支援。"],
    ["區域複製", "以北北桃為核心建立服務密度，再用標準化流程、人力訓練與品管制度複製到新區域。"],
    ["品牌差異", "用溫暖、可信任、容易理解的品牌語言降低家庭進入長照服務的門檻。"]
  ];
  const model = [
    ["居家服務密度", "先以居家照顧與家屬諮詢建立區域服務入口，累積需求資料與服務口碑。", "Phase 01"],
    ["日照與社區基地", "在需求成熟區域導入日照、社區據點與課程服務，提升區域服務覆蓋。", "Phase 02"],
    ["教育品管中台", "用訓練、督導、服務紀錄與標準作業支撐展店速度，降低品質落差。", "Phase 03"],
    ["投資與合作擴張", "透過資金、場域、政府合作與營運夥伴，形成可管理的展店節奏。", "Phase 04"]
  ];
  const metrics = [
    ["3", "核心縣市", "臺北、新北、桃園優先布局"],
    ["6", "服務事業", "照顧、日照、據點、復能、培訓、品管"],
    ["12+", "籌設節點", "服務區域與基地持續評估"],
    ["95%", "服務滿意度", "以回報、督導與品管追蹤服務體驗"]
  ];
  const useOfFunds = [
    ["展店與場域", 34],
    ["人才招募訓練", 24],
    ["系統與品管", 18],
    ["品牌與內容", 14],
    ["營運週轉", 10]
  ];
  const process = [
    ["01", "初步洽談", "了解投資人背景、合作期待、投資規模與關注的風險議題。"],
    ["02", "資料說明", "提供公司簡介、事業布局、展店模型、營運進度與初步財務假設。"],
    ["03", "策略會議", "針對投資架構、投入資源、治理權責與合作期程進一步討論。"],
    ["04", "盡調與簽約", "進入文件、財務、法務與合作條件確認，完成投資或策略合作安排。"]
  ];
  const documents = [
    ["Company Deck", "歲悅長照集團簡介", "品牌、服務事業、北北桃布局與核心團隊"],
    ["Expansion Plan", "展店與基地策略", "居家長照機構、日照中心與社區據點籌設進度"],
    ["Governance Note", "治理與風險說明", "品管制度、資訊揭露、內控方向與營運風險控管"]
  ];

  return `
    <div class="service-detail-page investor-recruit-page">
      <section class="hero service-detail-hero one-minute-service-hero investor-recruit-hero">
        <div
          class="hero-bg"
          style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(heroImage)}');"
          aria-hidden="true"
        ></div>
        <div class="hero-copy service-detail-copy">
          <p class="eyebrow">Investor Recruiting</p>
          <h1>投資人招募</h1>
          <p class="hero-slogan">把長照需求，變成可治理、可複製、可長期信任的服務網絡。</p>
          <p>歲悅長照集團正在尋找理解長照產業、認同在地服務網絡與長期品牌價值的投資夥伴。這不是單一據點生意，而是用服務密度、標準化訓練與品管中台建立可擴張的照顧基礎建設。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact" data-contact-need="投資洽談" data-contact-message="我想了解歲悅投資合作，請協助安排投資人窗口，說明公司簡介、展店模型、營運進度與合作架構。">預約投資洽談</a>
            <a class="secondary-button" href="#investors">前往投資人專區</a>
          </div>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Why Suiyuecare</p>
          <h2>投資歲悅的核心邏輯</h2>
          <span>我們聚焦的是長照服務網絡，不是只開一個漂亮據點。服務、場域、人力與內容要能互相支援，才有機會走得久。</span>
        </div>
        <div class="service-highlight-grid investor-thesis-grid">
          ${thesis.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section investor-growth-section">
        <div class="investor-growth-copy">
          <p class="eyebrow">Growth Snapshot</p>
          <h2>從北北桃開始，建立可管理的展店節奏</h2>
          <p>歲悅會用居家服務作為區域入口，逐步延伸日照、社區據點、護理復能與培訓服務。投資資源將優先投入能提升服務密度、人才供給與品質穩定度的項目。</p>
          <div class="investor-metric-row">
            ${metrics.map(([value, label, copy]) => `
              <article>
                <strong>${value}</strong>
                <span>${label}</span>
                <p>${copy}</p>
              </article>
            `).join("")}
          </div>
        </div>
        <aside class="investor-fund-card">
          <p class="eyebrow">Use of Funds</p>
          <h3>資金用途規劃</h3>
          ${useOfFunds.map(([label, value]) => `
            <div class="fund-bar">
              <span>${label}</span>
              <b>${value}%</b>
              <i><em style="width:${value}%"></em></i>
            </div>
          `).join("")}
        </aside>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Expansion Model</p>
          <h2>事業擴張模型</h2>
          <span>從單點服務到區域服務網絡，每一階段都需要營運數據、人才訓練、場域策略與投資資源配合。</span>
        </div>
        <div class="community-program-grid investor-model-grid">
          ${model.map(([title, copy, phase]) => `
            <article>
              <span>${phase}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section investor-map-section">
        <div class="service-section-head">
          <p class="eyebrow">Regional Strategy</p>
          <h2>北北桃優先布局</h2>
          <span>投資人可從投資人專區追蹤居家長照機構與日間照顧中心的設立進度，理解展店不是概念，而是可拆解的專案管理。</span>
        </div>
        <div class="land-area-board investor-area-board">
          <img src="/assets/north-service-map-fast.jpg" alt="歲悅長照投資人招募北北桃布局地圖" />
          <div>
            <span>臺北市：士林、北投、大同、萬華、信義、南港服務密度提升</span>
            <span>新北市：新店、中永和、新莊照顧服務與場域合作評估</span>
            <span>桃園市：蘆竹、大園與桃園核心生活圈拓點規劃</span>
          </div>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Investor Materials</p>
          <h2>投資人資料包</h2>
          <span>完整資料可於洽談後提供，你也可以先留下想了解的主題，由投資人窗口協助回覆。</span>
        </div>
        <div class="download-grid investor-doc-grid">
          ${documents.map(([type, title, copy]) => `
            <a href="#contact" data-contact-need="投資洽談" data-contact-message="我想索取或了解「${escapeHTML(title)}」相關資訊，請協助安排投資人窗口回覆。">
              <span>${type}</span>
              <strong>${title}</strong>
              <em>${copy}</em>
            </a>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Process</p>
          <h2>投資洽談流程</h2>
          <span>我們希望把合作講清楚，所以會先確認期待與風險，再進入資料、策略會議與盡調流程。</span>
        </div>
        <div class="service-flow-track">
          ${process.map(([step, title, copy]) => `
            <article>
              <b>${step}</b>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Investor Contact</p>
          <h2>想參與歲悅長照集團的下一階段成長嗎？</h2>
          <p>留下聯絡方式、投資或合作方向、可投入資源與希望了解的議題，我們會安排投資人窗口與你進一步說明。</p>
        </div>
        <a class="primary-button" href="#contact" data-contact-need="投資洽談" data-contact-message="我想了解歲悅投資合作，請協助安排投資人窗口，說明公司簡介、展店模型、營運進度與合作架構。">預約投資洽談</a>
      </section>
    </div>
  `;
}

function renderLandRecruitingPage() {
  const heroImage = heroImageForViewport("assets/land-recruit-hero-hd.jpg");
  const siteTypes = [
    ["日間照顧中心", "建議一樓或低樓層、動線平整、可規劃活動區、用餐區、休息區與復能空間。", "120-300坪"],
    ["社區據點", "適合鄰近市場、公園、里民活動中心或長輩日常移動路線，方便長輩固定參與。", "40-120坪"],
    ["複合式長照基地", "可結合居家服務辦公、課程教室、社區據點與日照籌設，形成區域照顧中心。", "180坪以上"],
    ["教育訓練場域", "適合移工培訓、照服員內訓、家屬課程與實作教室，需具備良好採光與可彈性配置空間。", "60-180坪"]
  ];
  const cooperation = [
    ["租賃合作", "由歲悅評估基地條件與區域需求，簽訂租賃後進行裝修規劃與長照用途申請。"],
    ["地主共創", "地主提供空間資源，歲悅負責服務設計、營運管理與品牌導入，共同建立在地照顧據點。"],
    ["建物活化", "協助閒置店面、辦公室、校舍或社區空間轉型為可長期營運的照顧服務場域。"]
  ];
  const checklist = [
    ["位置", "北北桃人口密集、交通便利、鄰近住宅區或醫療生活圈。"],
    ["動線", "出入口清楚、可改善無障礙、消防與接送動線，長輩進出安全。"],
    ["空間", "格局方正、採光通風佳，可分區規劃活動、休息、備餐、辦公與衛浴。"],
    ["法規", "可進行用途、消防、建管與長照設立可行性初評。"],
    ["鄰里", "周邊具長輩服務需求，且能與里辦、醫療、社區資源串聯。"],
    ["期程", "屋況、租期與裝修條件能支援長期穩定營運。"]
  ];
  const flow = [
    ["01", "提供基地資料", "填寫地址、坪數、樓層、照片、平面圖或現況說明。"],
    ["02", "初步可行性評估", "歲悅從區域需求、法規限制、動線、租期與營運模型進行初評。"],
    ["03", "現場會勘", "確認出入口、格局、採光、消防、無障礙與未來服務配置方式。"],
    ["04", "合作方案討論", "依基地條件規劃租賃、共創或建物活化合作方式。"]
  ];
  const targetAreas = ["臺北市：士林、北投、大同、萬華、信義、南港", "新北市：新店、中和、永和、新莊", "桃園市：蘆竹、大園、桃園核心生活圈"];

  return `
    <div class="service-detail-page land-recruit-page">
      <section class="hero service-detail-hero one-minute-service-hero land-recruit-hero">
        <div
          class="hero-bg"
          style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(heroImage)}');"
          aria-hidden="true"
        ></div>
        <div class="hero-copy service-detail-copy">
          <p class="eyebrow">Land Partnership</p>
          <h1>土地招募</h1>
          <p class="hero-slogan">把合適的空間，變成家庭真正用得到的照顧據點。</p>
          <p>歲悅正在尋找能承接長照服務的土地、店面、辦公空間與社區場域。從基地評估、設立可行性到營運規劃，我們希望和地主、建物持有人與合作夥伴一起打造北北桃的照顧基礎建設。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact" data-contact-need="土地合作" data-contact-message="我想提供土地或空間合作資料，請協助評估基地條件、服務半徑、合作模式與下一步需要準備的資料。">提供基地資料</a>
            <a class="secondary-button" href="#investors">查看展店進度</a>
          </div>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Site Needs</p>
          <h2>我們正在找的場域</h2>
          <span>不只找坪數，更重視動線、社區需求、設立條件與能不能長期穩定服務附近家庭。</span>
        </div>
        <div class="community-program-grid land-site-grid">
          ${siteTypes.map(([title, copy, size]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
              <span>${size}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section land-evaluation-section">
        <div class="land-evaluation-card">
          <div>
            <p class="eyebrow">Evaluation</p>
            <h2>基地初評會看什麼？</h2>
            <p>歲悅會用長照設立與實際營運兩個角度檢視場地，不會只看地點漂亮，而是判斷未來能不能安全、合規、可持續地服務長輩。</p>
          </div>
          <img src="/assets/homepage-batch/04-admin-team-office-fast.jpg" alt="歲悅團隊進行基地與營運評估" />
        </div>
        <div class="land-checklist-grid">
          ${checklist.map(([title, copy]) => `
            <article>
              <strong>${title}</strong>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Cooperation Models</p>
          <h2>合作模式</h2>
          <span>可依空間狀態與合作期待討論租賃、共創或建物活化，不同基地會有不同的切入方式。</span>
        </div>
        <div class="service-highlight-grid land-model-grid">
          ${cooperation.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section land-area-section">
        <div class="service-section-head">
          <p class="eyebrow">Priority Areas</p>
          <h2>優先招募區域</h2>
          <span>目前以北北桃生活圈為主要拓點方向，會依照服務需求、交通可近性與照顧資源缺口做排序。</span>
        </div>
        <div class="land-area-board">
          <img src="/assets/north-service-map-fast.jpg" alt="歲悅土地招募北北桃優先區域地圖" />
          <div>
            ${targetAreas.map((area) => `<span>${area}</span>`).join("")}
          </div>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Process</p>
          <h2>從提供資料到合作討論</h2>
          <span>如果你手上有合適空間，先不需要整理成完整企劃，只要有基本資料與照片，就可以先讓我們評估。</span>
        </div>
        <div class="service-flow-track">
          ${flow.map(([step, title, copy]) => `
            <article>
              <b>${step}</b>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Land Inquiry</p>
          <h2>有店面、土地或閒置空間想一起活化嗎？</h2>
          <p>請提供地址、坪數、樓層、使用現況、照片與聯絡方式，歲悅會協助做第一輪長照用途可行性評估。</p>
        </div>
        <a class="primary-button" href="#contact" data-contact-need="土地合作" data-contact-message="我想提供土地或空間合作資料，請協助評估基地條件、服務半徑、合作模式與下一步需要準備的資料。">提供基地資料</a>
      </section>
    </div>
  `;
}

function renderCommunityPage() {
  return renderOneMinuteServicePage("community");
}

function renderFinancePage() {
  const revenueRows = [
    ["2026.05", "8.6M", "+12.4%", "居家照顧與教育品管需求提升"],
    ["2026.04", "7.7M", "+8.1%", "北北桃服務量穩定增加"],
    ["2026.03", "7.1M", "+6.8%", "課程與移工培訓開課帶動"],
    ["2026.02", "6.8M", "+5.5%", "日照與社區據點服務穩定"]
  ];
  const reports = [
    ["2026 Q1 財務報告", "PDF", "2026.05.15", "已上架"],
    ["2025 Q4 財務報告", "PDF", "2026.03.31", "已上架"],
    ["2025 Q3 財務報告", "PDF", "2025.11.14", "已上架"],
    ["2025 Q2 財務報告", "PDF", "2025.08.14", "已上架"]
  ];
  const annualReports = [
    ["2025 年度股東會年報", "PDF", "2026.05", "申請下載"],
    ["2025 股東會議事手冊", "PDF", "2026.05", "申請下載"],
    ["2024 年度營運摘要", "PDF", "2025.05", "申請下載"]
  ];

  return `
    <div class="investor-page finance-page">
      <section class="ir-sub-hero finance-visual">
        <div>
          <a class="search-back" href="#investors">返回投資人專區</a>
          <p class="eyebrow">Financial Information</p>
          <h1>財務資訊</h1>
          <p>以月營收、季度財報、財務分析與股東會年報為核心，建立投資人能快速閱讀、下載與追蹤的財務資訊中心。</p>
        </div>
        <aside class="finance-hero-chart" aria-label="年度營運趨勢圖">
          <span>Revenue Trend</span>
          <div class="mini-line-chart">
            <i style="--x:8%;--y:70%"></i><i style="--x:25%;--y:56%"></i><i style="--x:42%;--y:62%"></i><i style="--x:59%;--y:42%"></i><i style="--x:76%;--y:36%"></i><i style="--x:92%;--y:22%"></i>
          </div>
          <strong>+12.4%</strong>
          <p>最近月營收成長率</p>
        </aside>
      </section>

      <nav class="investor-tabs ir-finance-tabs" aria-label="財務資訊分頁">
        <button class="active" type="button" data-ir-tab="monthly-revenue">每月營收</button>
        <button type="button" data-ir-tab="finance-analysis">財務資訊分析</button>
        <button type="button" data-ir-tab="quarterly-reports">季度財報</button>
        <button type="button" data-ir-tab="annual-reports">股東會年報</button>
      </nav>

      <section class="ir-kpi-strip" aria-label="財務資訊摘要">
        <article><span>Monthly Revenue</span><strong>NT$ 8.6M</strong><em>最近月營收</em></article>
        <article><span>YoY Growth</span><strong>+12.4%</strong><em>年增率</em></article>
        <article><span>Service Mix</span><strong>4 Units</strong><em>主要收入來源</em></article>
        <article><span>Disclosure</span><strong>Quarterly</strong><em>季度更新節奏</em></article>
      </section>

      <section class="ir-tab-panel active" data-ir-panel="monthly-revenue">
        <div class="investor-section-head">
          <p class="eyebrow">Monthly Revenue</p>
          <h2>每月營收</h2>
          <span>用表格與折線/柱狀圖呈現月營收變化，後續會依財務報表與公開資料持續更新。</span>
        </div>
        <div class="finance-dashboard">
          <article class="chart-card wide">
            <div class="chart-card-head"><span>月營收趨勢</span><strong>NT$ 8.6M</strong></div>
            <div class="bar-line-chart">
              ${[42, 48, 46, 55, 61, 70, 68, 74, 78, 82, 88, 96].map((value, index) => `<i style="--h:${value}%"><b>${index + 1}</b></i>`).join("")}
            </div>
          </article>
          <article class="chart-card">
            <div class="chart-card-head"><span>服務收入組成</span><strong>100%</strong></div>
            <div class="donut-chart" style="--a:42%;--b:26%;--c:18%;--d:14%"><em>Revenue</em></div>
            <ul class="chart-legend"><li>居家照顧 42%</li><li>日間照顧 26%</li><li>教育培訓 18%</li><li>其他服務 14%</li></ul>
          </article>
        </div>
        <div class="investor-table-card">
          <div class="table-title"><h3>月營收公告</h3><a href="#contact">訂閱財務通知</a></div>
          <table>
            <thead><tr><th>月份</th><th>營收</th><th>年增率</th><th>說明</th><th>下載</th></tr></thead>
            <tbody>${revenueRows.map(([month, revenue, growth, note]) => `<tr><td>${month}</td><td>${revenue}</td><td>${growth}</td><td>${note}</td><td><a href="#contact">PDF</a></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="finance-analysis">
        <div class="investor-section-head">
          <p class="eyebrow">Analysis</p>
          <h2>財務資訊分析</h2>
          <span>以服務收入、成本結構、現金流與展店投資四個角度，讓投資人快速讀懂營運品質。</span>
        </div>
        <div class="analysis-grid">
          <article class="finance-highlight">
            <span>Management Discussion</span>
            <h3>照顧服務收入穩定，培訓與品管形成可複製的營運護城河。</h3>
            <p>此區可放管理層對營收、成本、人力、展店與現金流的說明，讓財務數字不只是結果，而能對應到服務品質與區域策略。</p>
          </article>
          <article class="chart-card"><div class="chart-card-head"><span>成本結構</span><strong>Q1</strong></div><div class="donut-chart cost" style="--a:54%;--b:22%;--c:15%;--d:9%"><em>Cost</em></div><ul class="chart-legend"><li>人事 54%</li><li>場域 22%</li><li>教材品管 15%</li><li>行政 9%</li></ul></article>
          <article class="chart-card"><div class="chart-card-head"><span>現金流穩定度</span><strong>88</strong></div><div class="score-ring"><b>88</b><span>Cash Index</span></div></article>
        </div>
        <div class="download-grid">
          <a href="#contact"><span>PDF</span><strong>財務分析月報</strong><em>申請下載</em></a>
          <a href="#contact"><span>XLS</span><strong>營運指標資料表</strong><em>申請下載</em></a>
          <a href="#contact"><span>PDF</span><strong>管理層討論與分析</strong><em>申請下載</em></a>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="quarterly-reports">
        <div class="investor-section-head">
          <p class="eyebrow">Quarterly Reports</p>
          <h2>季度財報</h2>
          <span>以季度報告、簡報與主要財務比率呈現，方便投資人按年度與季度查找。</span>
        </div>
        <div class="report-layout">
          <article class="chart-card wide">
            <div class="chart-card-head"><span>季度營收與毛利率</span><strong>2025-2026</strong></div>
            <div class="combo-chart">
              ${[58, 64, 62, 71, 76, 84].map((value, index) => `<i style="--h:${value}%"><b>Q${(index % 4) + 1}</b></i>`).join("")}
            </div>
          </article>
          <div class="investor-table-card compact-table">
            <div class="table-title"><h3>季度財報下載</h3><a href="#contact">索取完整檔案</a></div>
            <table><thead><tr><th>文件</th><th>格式</th><th>日期</th><th>下載</th></tr></thead><tbody>${reports.map(([name, type, date, status]) => `<tr><td>${name}</td><td>${type}</td><td>${date}</td><td><a href="#contact">${status}</a></td></tr>`).join("")}</tbody></table>
          </div>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="annual-reports">
        <div class="investor-section-head">
          <p class="eyebrow">Annual Reports</p>
          <h2>股東會年報</h2>
          <span>集中放置年度營運摘要、股東會年報、議事手冊與相關附件。</span>
        </div>
        <div class="annual-grid">
          <article class="annual-cover">
            <img src="/assets/homepage-batch/04-admin-team-office-fast.jpg" alt="歲悅行政團隊整理年度報告" />
            <div><span>2025 Annual Report</span><h3>讓投資人看見照顧網絡如何被制度化。</h3></div>
          </article>
          <div class="download-grid vertical">
            ${annualReports.map(([name, type, date, status]) => `<a href="#contact"><span>${type}</span><strong>${name}</strong><small>${date}</small><em>${status}</em></a>`).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderGovernancePage() {
  const majorMessages = [
    ["2026.05.15", "董事會通過北區服務品質治理計畫", "強化督導訪視、異常事件追蹤與家屬回報流程。"],
    ["2026.04.22", "個資與照顧紀錄權限控管制度更新", "建立分級權限、紀錄稽核與教育訓練節點。"],
    ["2026.03.18", "誠信經營與吹哨者保護辦法公告", "建立內外部通報管道與案件追蹤原則。"]
  ];
  const executives = [
    ["執行長", "營運策略與服務網絡拓展", "assets/homepage-batch/04-admin-team-office-fast.jpg"],
    ["照顧品質長", "服務品管、督導制度與異常事件改善", "assets/homepage-batch/03-supervisor-care-plan-fast.jpg"],
    ["教育訓練長", "照服員、督導與移工培訓制度", "assets/homepage-batch/11-elder-art-activity-hires.jpg"],
    ["財務行政長", "財務控管、人資行政與投資人關係", "assets/homepage-batch/family-consultation-clear.jpg"]
  ];
  const auditItems = [
    ["服務紀錄稽核", "92%", "完成率"],
    ["個資權限檢核", "88%", "完成率"],
    ["教育訓練覆蓋", "96%", "完成率"],
    ["異常追蹤結案", "84%", "完成率"]
  ];
  const downloads = [
    ["公司治理實務守則", "PDF", "2026.05"],
    ["誠信經營守則", "PDF", "2026.05"],
    ["內部稽核年度計畫", "PDF", "2026.04"],
    ["風險管理政策", "PDF", "2026.04"],
    ["吹哨者通報與保護辦法", "PDF", "2026.03"]
  ];

  return `
    <div class="investor-page governance-page">
      <section class="ir-sub-hero governance-visual">
        <div>
          <a class="search-back" href="#investors">返回投資人專區</a>
          <p class="eyebrow">Corporate Governance</p>
          <h1>公司治理</h1>
          <p>以服務品質、內控稽核、風險管理與誠信經營為核心，讓歲悅長照集團的照顧系統能被追蹤、被改善，也能被投資人信任。</p>
        </div>
        <aside class="governance-hero-card">
          <span>Governance Score</span>
          <div class="score-ring governance-score"><b>91</b><span>Index</span></div>
          <p>治理成熟度</p>
        </aside>
      </section>

      <nav class="investor-tabs governance-tabs" aria-label="公司治理分頁">
        <button class="active" type="button" data-ir-tab="governance-news">重要訊息</button>
        <button type="button" data-ir-tab="governance-operation">公司治理運作</button>
        <button type="button" data-ir-tab="executives">重要管理階層</button>
        <button type="button" data-ir-tab="whistleblower">吹哨者專區</button>
        <button type="button" data-ir-tab="evaluation">治理評鑑專區</button>
        <button type="button" data-ir-tab="internal-audit">內部稽核</button>
        <button type="button" data-ir-tab="risk-management">風險管理</button>
        <button type="button" data-ir-tab="integrity">誠信經營</button>
      </nav>

      <section class="ir-kpi-strip governance-kpis" aria-label="公司治理摘要">
        <article><span>Governance Index</span><strong>91</strong><em>治理成熟度</em></article>
        <article><span>Audit Coverage</span><strong>92%</strong><em>服務紀錄稽核</em></article>
        <article><span>Training</span><strong>96%</strong><em>年度訓練覆蓋</em></article>
        <article><span>Open Cases</span><strong>0</strong><em>重大未結案件</em></article>
      </section>

      <section class="ir-tab-panel active" data-ir-panel="governance-news">
        <div class="investor-section-head">
          <p class="eyebrow">Material Information</p>
          <h2>重要訊息</h2>
          <span>用投資人看得懂的方式呈現重大決議、制度更新與治理公告。</span>
        </div>
        <div class="governance-news-grid">
          <article class="governance-image-card">
            <img src="/assets/homepage-batch/04-admin-team-office-fast.jpg" alt="歲悅行政團隊治理會議" />
            <div><span>Board Updates</span><h3>治理訊息不只是公告，而是讓投資人看見公司如何運作。</h3></div>
          </article>
          <div class="ir-update-card">
            <div><p class="eyebrow">Announcements</p><h3>治理公告</h3></div>
            ${majorMessages.map(([date, title, copy]) => `<a href="#contact"><time>${date}</time><strong>${title}</strong><p>${copy}</p></a>`).join("")}
          </div>
        </div>
        <div class="download-grid">
          ${downloads.slice(0, 3).map(([name, type, date]) => `<a href="#contact"><span>${type}</span><strong>${name}</strong><small>${date}</small><em>下載文件</em></a>`).join("")}
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="governance-operation">
        <div class="investor-section-head">
          <p class="eyebrow">Governance Operation</p>
          <h2>公司治理運作</h2>
          <span>呈現董事會、功能委員會、內控與利害關係人溝通的治理運作節奏。</span>
        </div>
        <div class="finance-dashboard">
          <article class="chart-card wide">
            <div class="chart-card-head"><span>治理會議與追蹤事項</span><strong>2026</strong></div>
            <div class="bar-line-chart governance-bars">
              ${[80, 66, 72, 88, 76, 91, 84, 93].map((value, index) => `<i style="--h:${value}%"><b>${["董事會","品管","稽核","風險","個資","訓練","服務","利害"][index]}</b></i>`).join("")}
            </div>
          </article>
          <article class="chart-card">
            <div class="chart-card-head"><span>治理資源配置</span><strong>100%</strong></div>
            <div class="donut-chart governance-donut" style="--a:34%;--b:28%;--c:22%;--d:16%"><em>Gov</em></div>
            <ul class="chart-legend"><li>服務品質 34%</li><li>內控稽核 28%</li><li>風險管理 22%</li><li>利害關係人 16%</li></ul>
          </article>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="executives">
        <div class="investor-section-head">
          <p class="eyebrow">Leadership</p>
          <h2>重要管理階層</h2>
          <span>讓投資人理解管理團隊如何分工，並把照顧現場、品管、教育與財務治理串起來。</span>
        </div>
        <div class="executive-grid">
          ${executives.map(([role, duty, image]) => `
            <article>
              <img src="${image}" alt="${role}形象圖" />
              <div><span>${role}</span><h3>${duty}</h3><a href="#contact">閱讀更多</a></div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="whistleblower">
        <div class="investor-section-head">
          <p class="eyebrow">Whistleblower</p>
          <h2>吹哨者專區</h2>
          <span>建立保密、可追蹤、有回覆機制的通報入口，保障員工、服務對象與合作夥伴。</span>
        </div>
        <div class="whistle-layout">
          <article class="finance-highlight">
            <span>Protected Reporting</span>
            <h3>每一個通報都需要被承接，而不是被消音。</h3>
            <p>通報會依適用範圍、保密原則、處理流程與回覆時程承接，並明確禁止任何形式的報復。</p>
          </article>
          <article class="process-card">
            <h3>處理流程</h3>
            <ol><li>收到通報</li><li>初步分級</li><li>成立處理小組</li><li>回覆與改善追蹤</li></ol>
          </article>
        </div>
        <div class="download-grid">
          <a href="#contact"><span>Form</span><strong>吹哨者通報表</strong><em>開啟表單</em></a>
          <a href="#contact"><span>PDF</span><strong>通報人保護辦法</strong><em>下載文件</em></a>
          <a href="#contact"><span>PDF</span><strong>案件處理流程</strong><em>下載文件</em></a>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="evaluation">
        <div class="investor-section-head">
          <p class="eyebrow">Evaluation</p>
          <h2>治理評鑑專區</h2>
          <span>把治理目標拆成可追蹤指標，呈現年度進度、改善項目與評鑑資料。</span>
        </div>
        <div class="evaluation-grid">
          <article class="chart-card"><div class="chart-card-head"><span>年度治理指標</span><strong>91/100</strong></div><div class="score-ring governance-score"><b>91</b><span>Score</span></div></article>
          <article class="chart-card wide"><div class="chart-card-head"><span>治理評鑑趨勢</span><strong>2023-2026</strong></div><div class="combo-chart">${[58, 66, 73, 82, 91].map((value, index) => `<i style="--h:${value}%"><b>${2022 + index}</b></i>`).join("")}</div></article>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="internal-audit">
        <div class="investor-section-head">
          <p class="eyebrow">Internal Audit</p>
          <h2>內部稽核</h2>
          <span>以服務、財務、個資與訓練四個面向呈現稽核計畫與執行進度。</span>
        </div>
        <div class="audit-grid">
          ${auditItems.map(([title, value, label]) => `<article><span>${title}</span><strong>${value}</strong><em>${label}</em><div><i style="width:${value}"></i></div></article>`).join("")}
        </div>
        <div class="investor-table-card">
          <div class="table-title"><h3>稽核文件下載</h3><a href="#contact">申請完整報告</a></div>
          <table><thead><tr><th>文件</th><th>格式</th><th>更新日期</th><th>操作</th></tr></thead><tbody>${downloads.filter(([name]) => name.includes("稽核") || name.includes("治理")).map(([name, type, date]) => `<tr><td>${name}</td><td>${type}</td><td>${date}</td><td><a href="#contact">下載</a></td></tr>`).join("")}</tbody></table>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="risk-management">
        <div class="investor-section-head">
          <p class="eyebrow">Risk Management</p>
          <h2>風險管理</h2>
          <span>把長照營運的服務品質、人力、個資、法遵與財務風險放進同一張治理地圖。</span>
        </div>
        <div class="risk-layout">
          <article class="risk-matrix">
            <h3>風險矩陣</h3>
            <div class="matrix-grid">
              <span style="grid-column:3;grid-row:1">個資</span><span style="grid-column:2;grid-row:2">人力</span><span style="grid-column:3;grid-row:2">服務</span><span style="grid-column:1;grid-row:3">法遵</span><span style="grid-column:2;grid-row:3">財務</span>
            </div>
          </article>
          <article class="chart-card"><div class="chart-card-head"><span>風險類型占比</span><strong>Q1</strong></div><div class="donut-chart cost" style="--a:30%;--b:25%;--c:25%;--d:20%"><em>Risk</em></div><ul class="chart-legend"><li>服務 30%</li><li>人力 25%</li><li>個資 25%</li><li>財務 20%</li></ul></article>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="integrity">
        <div class="investor-section-head">
          <p class="eyebrow">Integrity</p>
          <h2>誠信經營</h2>
          <span>以制度、教育、申報與追蹤為基礎，讓誠信經營成為日常管理的一部分。</span>
        </div>
        <div class="integrity-layout">
          <article class="governance-image-card">
            <img src="/assets/homepage-batch/14-care-notes-fast.jpg" alt="歲悅照顧紀錄與誠信經營" />
            <div><span>Integrity System</span><h3>照顧產業的信任，來自每一筆紀錄、每一次回報與每一個承諾。</h3></div>
          </article>
          <div class="finance-metrics">
            <article><b>誠信訓練覆蓋率</b><strong>96%</strong><span>年度教育訓練</span></article>
            <article><b>利益衝突申報</b><strong>100%</strong><span>管理階層完成</span></article>
            <article><b>案件追蹤</b><strong>0</strong><span>重大未結案件</span></article>
          </div>
        </div>
        <div class="download-grid">
          <a href="#contact"><span>PDF</span><strong>誠信經營守則</strong><em>下載文件</em></a>
          <a href="#contact"><span>PDF</span><strong>利益衝突申報辦法</strong><em>下載文件</em></a>
          <a href="#contact"><span>PDF</span><strong>員工行為準則</strong><em>下載文件</em></a>
        </div>
      </section>
    </div>
  `;
}

function renderShareholdersPage() {
  const meetingFiles = [
    ["2026 股東常會開會通知", "PDF", "2026.05.20"],
    ["2026 股東常會議事手冊", "PDF", "2026.05.20"],
    ["2026 股東常會年報", "PDF", "2026.05.20"],
    ["2025 股東常會議事錄", "PDF", "2025.06.18"]
  ];
  const briefingFiles = [
    ["2026 Q1 法說會簡報", "PDF", "2026.05.15"],
    ["2025 年度營運說明會", "PDF", "2026.03.31"],
    ["北北桃服務網絡說明", "PDF", "2026.01.20"]
  ];
  const faq = [
    ["如何更新股東通訊資料？", "請透過股務服務窗口提出申請，並備妥身分證明與股東資料，窗口確認後協助更新。"],
    ["如何索取股東會相關文件？", "可在本頁股東會 tab 申請下載，或來信 generalaffairs@suiyuecare.com 由專人協助。"],
    ["歲悅目前是否有定期法說會？", "目前以季度營運說明與投資人簡報為主，正式法說會時程將依公司階段公告。"],
    ["投資人如何提出問題？", "可使用聯絡我們表單，選擇投資洽談或股東服務，由投資人關係窗口回覆。"]
  ];

  return `
    <div class="investor-page shareholders-page">
      <section class="ir-sub-hero shareholders-visual">
        <div>
          <a class="search-back" href="#investors">返回投資人專區</a>
          <p class="eyebrow">Shareholder Services</p>
          <h1>股東專區</h1>
          <p>集中整理股務資訊、股東會、法說會與常見問答，讓股東能快速找到文件、窗口與重要時程。</p>
        </div>
        <aside class="shareholder-hero-card">
          <span>Shareholder Service</span>
          <strong>02-6604-5432</strong>
          <p>週一至週五 09:00-18:00</p>
          <a href="#contact">聯絡股務窗口</a>
        </aside>
      </section>

      <nav class="investor-tabs shareholder-tabs" aria-label="股東專區分頁">
        <button class="active" type="button" data-ir-tab="stock-affairs">股務資訊</button>
        <button type="button" data-ir-tab="shareholder-meeting">股東會</button>
        <button type="button" data-ir-tab="investor-conference">法說會</button>
        <button type="button" data-ir-tab="shareholder-faq">常見問答</button>
      </nav>

      <section class="ir-kpi-strip shareholder-kpis" aria-label="股東服務摘要">
        <article><span>Service Line</span><strong>02-6604-5432</strong><em>股東服務窗口</em></article>
        <article><span>Documents</span><strong>11+</strong><em>可下載文件</em></article>
        <article><span>Meetings</span><strong>Annual</strong><em>股東會資訊</em></article>
        <article><span>Response</span><strong>Business Day</strong><em>工作日回覆</em></article>
      </section>

      <section class="ir-tab-panel active" data-ir-panel="stock-affairs">
        <div class="investor-section-head">
          <p class="eyebrow">Stock Affairs</p>
          <h2>股務資訊</h2>
          <span>提供股東服務窗口、股務流程、股東結構與常用文件下載。</span>
        </div>
        <div class="shareholder-info-grid">
          <article class="shareholder-contact">
            <span>Service Window</span>
            <h3>股務服務窗口</h3>
            <p>歲悅長照集團 投資人關係 / 股東服務</p>
            <dl>
              <div><dt>電話</dt><dd>02-6604-5432</dd></div>
              <div><dt>信箱</dt><dd>generalaffairs@suiyuecare.com</dd></div>
              <div><dt>服務時間</dt><dd>週一至週五 09:00-18:00</dd></div>
            </dl>
          </article>
          <article class="chart-card">
            <div class="chart-card-head"><span>股東結構</span><strong>100%</strong></div>
            <div class="donut-chart shareholder-donut" style="--a:46%;--b:28%;--c:16%;--d:10%"><em>Holders</em></div>
            <ul class="chart-legend"><li>創辦團隊 46%</li><li>策略投資人 28%</li><li>員工持股 16%</li><li>其他股東 10%</li></ul>
          </article>
        </div>
        <div class="download-grid">
          <a href="#contact"><span>PDF</span><strong>股務作業說明</strong><em>下載文件</em></a>
          <a href="#contact"><span>Form</span><strong>股東資料變更申請</strong><em>下載表單</em></a>
          <a href="#contact"><span>PDF</span><strong>投資人聯絡窗口</strong><em>下載文件</em></a>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="shareholder-meeting">
        <div class="investor-section-head">
          <p class="eyebrow">Shareholder Meeting</p>
          <h2>股東會</h2>
          <span>整理股東會時程、議案、年報、議事手冊、議事錄與出席統計。</span>
        </div>
        <div class="meeting-layout">
          <article class="governance-image-card">
            <img src="/assets/homepage-batch/family-consultation-clear.jpg" alt="歲悅股東會與投資人溝通情境" />
            <div><span>Annual Meeting</span><h3>把年度營運、治理進度與照顧網絡成長，清楚交代給每一位股東。</h3></div>
          </article>
          <article class="chart-card">
            <div class="chart-card-head"><span>股東會出席率</span><strong>2026</strong></div>
            <div class="combo-chart attendance-chart">
              ${[72, 76, 81, 85, 88].map((value, index) => `<i style="--h:${value}%"><b>${2022 + index}</b></i>`).join("")}
            </div>
          </article>
        </div>
        <div class="investor-table-card">
          <div class="table-title"><h3>股東會文件下載</h3><a href="#contact">索取完整資料</a></div>
          <table><thead><tr><th>文件</th><th>格式</th><th>公告日期</th><th>操作</th></tr></thead><tbody>${meetingFiles.map(([name, type, date]) => `<tr><td>${name}</td><td>${type}</td><td>${date}</td><td><a href="#contact">下載</a></td></tr>`).join("")}</tbody></table>
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="investor-conference">
        <div class="investor-section-head">
          <p class="eyebrow">Investor Conference</p>
          <h2>法說會</h2>
          <span>呈現季度營運說明、法說會簡報、投資人問答與未來時程。</span>
        </div>
        <div class="conference-layout">
          <article class="chart-card wide">
            <div class="chart-card-head"><span>投資人溝通頻率</span><strong>2025-2026</strong></div>
            <div class="bar-line-chart conference-chart">
              ${[36, 42, 48, 55, 64, 72, 78, 86].map((value, index) => `<i style="--h:${value}%"><b>Q${(index % 4) + 1}</b></i>`).join("")}
            </div>
          </article>
          <div class="finance-metrics">
            <article><b>本年度簡報</b><strong>3</strong><span>已上架</span></article>
            <article><b>投資人提問</b><strong>24</strong><span>累積回覆</span></article>
            <article><b>下一場說明</b><strong>可洽詢</strong><span>依需求安排窗口</span></article>
          </div>
        </div>
        <div class="download-grid">
          ${briefingFiles.map(([name, type, date]) => `<a href="#contact"><span>${type}</span><strong>${name}</strong><small>${date}</small><em>下載簡報</em></a>`).join("")}
        </div>
      </section>

      <section class="ir-tab-panel" data-ir-panel="shareholder-faq">
        <div class="investor-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>常見問答</h2>
          <span>把股東最常詢問的資料更新、文件索取、法說會與投資人聯絡流程集中整理。</span>
        </div>
        <div class="faq-layout">
          <article class="governance-image-card">
            <img src="/assets/homepage-batch/15-phone-consultation-fast.jpg" alt="歲悅投資人窗口電話諮詢" />
            <div><span>Investor Q&A</span><h3>投資人關係的核心，是讓問題被清楚承接、被準確回覆。</h3></div>
          </article>
          <div class="shareholder-faq">
            ${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}
          </div>
        </div>
        <div class="download-grid">
          <a href="#contact"><span>PDF</span><strong>股東常見問答手冊</strong><em>下載文件</em></a>
          <a href="#contact"><span>Form</span><strong>投資人提問表</strong><em>開啟表單</em></a>
          <a href="#contact"><span>PDF</span><strong>股東服務流程</strong><em>下載文件</em></a>
        </div>
      </section>
    </div>
  `;
}

function renderSoftwarePage() {
  return renderOneMinuteServicePage("software");
}

function renderTalentPage() {
  const heroImage = heroImageForViewport("assets/career-team-hero-hd.jpg");
  const talentAsset = (url) => escapeHTML(normalizeLocalAssetUrl(url));
  const talentContactAttrs = `data-contact-need="人才招募" data-contact-message="我想了解歲悅長照職缺或投遞應徵資料，請協助安排招募窗口聯繫。"`;
  const staticDepartmentList = [
    {
      id: "home-care-team",
      department_slug: "home-care-team",
      title: "居家照顧部門",
      eyebrow: "Home Care Team",
      description: "到宅服務、居服督導、個案管理與區域服務支援，是歲悅最靠近家庭的一線團隊。",
      image_url: talentAsset("assets/homepage-batch/care-home-greeting-clear.jpg"),
      highlights: ["居服員招募", "居服督導", "個案管理"]
    },
    {
      id: "day-care-team",
      department_slug: "day-care-team",
      title: "日間照顧部",
      eyebrow: "Day Care Team",
      description: "讓長輩白天有活動、共餐、陪伴與安全照顧，也讓家庭有穩定喘息。",
      image_url: talentAsset("assets/daycare-recruit-02-exercise-clear.jpg"),
      highlights: ["日照照服員", "中心主任", "活動照顧"]
    },
    {
      id: "migrant-team",
      department_slug: "migrant-team",
      title: "移工培訓部",
      eyebrow: "Migrant Training",
      description: "把照顧技能、跨文化溝通與課程活動整理成移工與家庭都能理解的學習支持。",
      image_url: talentAsset("assets/homepage-batch/service-card-05-migrant-training-clear.jpg"),
      highlights: ["社群行銷", "活動企劃", "培訓課程"]
    },
    {
      id: "quality-team",
      department_slug: "quality-team",
      title: "教學品管部",
      eyebrow: "Teaching Quality",
      description: "將前線經驗轉成教材、內訓、稽核與改善流程，讓服務品質能被複製。",
      image_url: talentAsset("assets/quality-recruit-02-training-clear.jpg"),
      highlights: ["教育訓練", "服務檢核", "品質改善"]
    },
    {
      id: "admin-team",
      department_slug: "admin-team",
      title: "行政部",
      eyebrow: "Administration",
      description: "支援人資、營運、財務、客服、投資人與專案流程，讓前線照顧穩定運作。",
      image_url: talentAsset("assets/admin-recruit-05-meeting-clear.jpg"),
      highlights: ["品牌行銷", "營運支援", "行政協作"]
    }
  ];
  const talentOpeningProfiles = {
    caregiver: {
      image: "/assets/recruit-home-care-worker-fast.jpg",
      duties: ["依照顧計畫到宅提供身體照顧、備餐、家務或陪同外出等支持", "完成服務紀錄、異常回報與家屬溝通", "配合督導安排排班、調班、教育訓練與品質追蹤"],
      requirements: ["具照顧服務員訓練結業證明或長照小卡佳", "守時、重視安全與長輩尊嚴", "可配合服務區域排班並完成手機紀錄"],
      benefits: ["BA 碼拆帳", "AA 碼拆帳", "缺工獎勵可申請", "公發工作包"]
    },
    supervisor: {
      image: "/assets/recruit-home-care-supervisor-fast.jpg",
      duties: ["安排居家服務個案、照服員媒合與服務異動", "定期家訪或電訪，處理家屬回饋與服務問題", "支援照服員培訓、評鑑資料與內部品質管理"],
      requirements: ["具居督、社工、護理或長照相關背景佳", "熟悉長照 2.0、BA 碼與照顧計畫尤佳", "能在家屬、照服員與照管中心間清楚協調"],
      benefits: ["保障月薪", "業績獎金", "督導培訓", "開發獎金"]
    },
    dayCare: {
      image: "/assets/daycare-recruit-02-exercise-clear.jpg",
      duties: ["協助日照長輩活動、用餐、如廁、休息與生活支持", "完成服務紀錄、交班、異常觀察與團隊回報", "配合護理、社工、督導執行照顧計畫與中心活動"],
      requirements: ["具照顧服務員訓練結業證明佳", "能觀察長輩狀態並重視安全、尊嚴與交班", "喜歡團體照顧場域與固定作息"],
      benefits: ["月薪制", "新人帶教", "缺工獎勵可申請", "日照活動訓練"]
    },
    planning: {
      image: "/assets/admin-recruit-05-meeting-clear.jpg",
      duties: ["規劃社群、課程、活動或專案內容", "協調素材、時程、現場執行與成效追蹤", "整理企劃文件、活動紀錄與跨部門需求"],
      requirements: ["具企劃、行銷、課務或跨文化溝通經驗佳", "文字清楚，能掌握時程與細節", "能與設計、講師、業務或營運窗口合作"],
      benefits: ["內容企劃", "跨部門協作", "成長訓練", "AI 工具支持"]
    },
    manager: {
      image: "/assets/homepage-batch/family-consultation-clear.jpg",
      duties: ["統籌中心營運、個案流程或服務品質追蹤", "串接家庭、照管中心與跨專業資源", "管理紀錄、進度、法規或評鑑需求"],
      requirements: ["具長照、社工、護理或管理經驗佳", "能掌握資料、溝通與服務品質", "具主管、個案管理或 A 單位經驗尤佳"],
      benefits: ["保障月薪", "管理培訓", "發展機會", "跨部門資源"]
    }
  };
  const caregiverDistricts = [
    ["taipei-shilin", "臺北市", "士林區", "230-420", 10, true],
    ["taipei-beitou", "臺北市", "北投區", "230-420", 20],
    ["taipei-nangang", "臺北市", "南港區", "230-420", 30],
    ["new-taipei-zhonghe", "新北市", "中和區", "235-420", 40],
    ["new-taipei-yonghe", "新北市", "永和區", "235-420", 50],
    ["new-taipei-xindian", "新北市", "新店區", "235-420", 60],
    ["new-taipei-tamsui", "新北市", "淡水區", "235-420", 70],
    ["taoyuan-dayuan", "桃園市", "大園區", "235-420", 80],
    ["taoyuan-luzhu", "桃園市", "蘆竹區", "235-420", 90]
  ];
  const staticOpeningRows = [
    ...caregiverDistricts.map(([slugPrefix, city, district, hourly, sortOrder, isFeatured = false]) => [
      "caregiver", "home-care-team", `${slugPrefix}-home-caregiver`, `${city}居家照顧服務員（${district}）`, "居服員",
      `在${city}${district}到宅服務，提供身體照顧、生活支持、陪伴與服務紀錄，協助家庭把日常照顧接穩。`,
      "全職 / 兼職", `${city}${district}`, `時薪 ${hourly} 元`, "持續招募", sortOrder, isFeatured, "2026-07-08"
    ]),
    ["dayCare", "day-care-team", "wanhua-day-care-caregiver", "萬華日照中心照顧服務員", "日照照服員", "在萬華日照中心陪伴長輩完成活動、餐食、休息與生活照顧，讓白天作息安全、有節奏。", "全職", "臺北市萬華區", "月薪 33,000-35,000 元", "1-2 名", 100, true, "2026-07-08"],
    ["supervisor", "home-care-team", "taipei-home-care-supervisor", "臺北市居家服務督導員", "居服督導", "負責台北居家服務派案、品質追蹤、家訪電訪、照服員支持與補助核銷資料，讓服務穩定接上家庭需求。", "全職", "臺北市士林區", "月薪 38,000-42,000 元", "1-2 名", 110, true, "2026-07-08"],
    ["planning", "migrant-team", "filipino-social-marketing-specialist", "全職社群行銷專員（菲律賓）", "菲律賓社群", "經營菲律賓語系社群、短影音與招募溝通，讓移工培訓服務被更多家庭與學員看見。", "全職", "新北市新莊區", "月薪 35,000-38,000 元", "1 名", 120, true, "2026-07-08"],
    ["planning", "migrant-team", "migrant-training-event-planner", "活動企劃專員", "移工培訓活動", "規劃移工培訓課程、節慶活動、交流活動與多語教材，協助課程順利執行。", "全職", "新北市新莊區", "月薪 38,000-42,000 元", "1 名", 130, false, "2026-07-08"],
    ["planning", "admin-team", "social-media-marketing-planner", "社群媒體行銷企劃", "品牌行銷", "規劃社群內容、品牌故事與招募溝通，讓長照服務與職缺被穩定看見。", "全職", "臺北市信義區", "月薪 36,000-42,000 元", "1 名", 140, false, "2026-07-08"],
    ["manager", "day-care-team", "taipei-day-care-director", "臺北市日間照顧中心主任（純白班、儲備主管職）", "中心主任", "負責日照中心營運、人員管理、招生社區關係、法規評鑑與服務品質。", "全職", "臺北市萬華區", "月薪 50,000 元以上", "1 名", 150, true, "2026-07-08"],
    ["supervisor", "home-care-team", "new-taipei-home-care-supervisor", "新北市居家服務督導員（新店／中和／永和區）", "居服督導", "負責新店、中和、永和居家服務個案管理、照服員督導與品質追蹤。", "全職", "新北市新店區", "月薪 38,000-42,000 元", "1-2 名", 160, true, "2026-07-07"],
    ["manager", "home-care-team", "new-taipei-case-manager", "新北市個案管理師（新店區）", "個案管理", "負責 A 單位個案管理、照顧計畫、AA01/AA02 追蹤與跨資源溝通。", "全職", "新北市新店區", "月薪 40,000-65,000 元", "1-2 名", 170, true, "2026-07-09"]
  ];
  const staticOpenings = staticOpeningRows.map(([profileKey, departmentId, openingSlug, title, subtitle, summary, employmentType, location, salaryText, capacityLabel, sortOrder, isFeatured, updatedAt], index) => {
    const profile = talentOpeningProfiles[profileKey] || talentOpeningProfiles.caregiver;
    return {
    id: `${departmentId}-${index + 1}`,
    page_slug: "talent",
    department_id: departmentId,
    opening_slug: openingSlug,
    title,
    subtitle,
    summary,
    employment_type: employmentType,
    location,
    salary_text: salaryText,
    capacity_label: capacityLabel,
    image_url: profile.image,
    duties: profile.duties,
    requirements: profile.requirements,
    benefits: profile.benefits,
    apply_button_text: "申請應徵",
    apply_form_enabled: true,
    sort_order: sortOrder,
    is_featured: isFeatured,
    updated_at: updatedAt
    };
  });
  const staticTalentPage = {
    page_slug: "talent",
    title: "人才招募",
    metadata: { form_type: "recruiting" }
  };
  const activeKey = "job-list";

  return `
    <div class="career-page">
      <section class="hero service-detail-hero one-minute-service-hero talent-recruit-hero">
        <div
          class="hero-bg"
          style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(heroImage)}');"
          aria-hidden="true"
        ></div>
        <div class="hero-copy service-detail-copy">
          <p class="eyebrow">Talent Recruiting</p>
          <h1>人才招募</h1>
          <p class="hero-slogan">讓照顧專業被看見，也讓夥伴有路可以走。</p>
          <p>歲悅長照集團提供清楚訓練、督導支持、部門分工與升遷制度，讓照顧工作不只是辛苦，而是能被支持、被看見、被成就。</p>
          <div class="hero-actions"><a class="primary-button" href="#career-openings">查看職缺</a><a class="secondary-button" href="#contact" ${talentContactAttrs}>留下應徵資料</a></div>
        </div>
      </section>

      ${renderTalentTabNav(activeKey)}
      ${renderRecruitingJobListPanel(staticTalentPage, staticDepartmentList, staticOpenings, activeKey)}
      ${renderTalentBenefitsPanel(activeKey)}
      ${renderTalentGrowthPanel(activeKey)}
      ${renderTalentOrganizationPanel(staticDepartmentList, activeKey)}
      ${renderTalentMissionPanel({ title: "人才招募" }, staticDepartmentList, [], activeKey)}
      ${renderRecruitingApplicationModal(staticTalentPage)}
    </div>
  `;
}

function renderIrPlaceholderPage(kind) {
  const config = {
    governance: {
      eyebrow: "Corporate Governance",
      title: "公司治理",
      intro: "整理歲悅的治理架構、管理制度、風險控管與重要訊息，讓合作夥伴與投資人可以快速掌握營運透明度。",
      tabs: ["重要訊息", "公司治理運作", "重要管理階層", "吹哨者專區", "治理評鑑專區", "內部稽核", "風險管理", "誠信經營"]
    },
    shareholders: {
      eyebrow: "Shareholder Services",
      title: "股東專區",
      intro: "集中股務資訊、股東會、法說會與常見問答，協助股東與投資人找到資料索取與聯絡窗口。",
      tabs: ["股務資訊", "股東會", "法說會", "常見問答"]
    }
  }[kind];

  return `
    <div class="investor-page">
      <section class="ir-sub-hero">
        <div>
          <a class="search-back" href="#investors">返回投資人專區</a>
          <p class="eyebrow">${config.eyebrow}</p>
          <h1>${config.title}</h1>
          <p>${config.intro}</p>
        </div>
      </section>
      <nav class="investor-tabs">
        ${config.tabs.map((tab, index) => `<button class="${index === 0 ? "active" : ""}" type="button">${tab}</button>`).join("")}
      </nav>
      <section class="investor-panel active">
        <div class="investor-section-head"><p class="eyebrow">Investor Desk</p><h2>${config.tabs[0]}</h2><span>目前資料以窗口回覆與正式公告為準，需要文件或進一步說明可直接留下需求。</span></div>
        <div class="download-grid">
          ${config.tabs.slice(0, 4).map((tab) => `<a href="#contact" class="request-only-file" data-contact-need="投資洽談" data-contact-message="我想索取或了解「${tab}」相關資訊，請協助安排投資人窗口回覆。"><span>索取</span><strong>${tab}</strong><em>洽窗口索取</em></a>`).join("")}
        </div>
      </section>
    </div>
  `;
}

async function renderServiceTemplatePageOnce(slug, fallbackRenderer, afterRender) {
  setPageViewBusy(true);
  const loaded = await loadSupabaseServiceTemplatePage(slug);
  if (routeSlugFromLocation() !== slug) return;
  if (!loaded) pageView.innerHTML = fallbackRenderer();
  setPageViewBusy(false);
  if (typeof afterRender === "function") afterRender();
}

function renderArticleNotFoundPage() {
  return `
    <article class="article-page">
      <div class="article-topbar">
        <a class="article-back" href="#health">返回上一頁</a>
        <span class="article-category">Health 3.0</span>
      </div>
      <section class="health-empty-state">
        <h2>文章尚未發布或不存在</h2>
        <p>這篇內容目前無法閱讀，可以回健康3.0查看其他照顧文章。</p>
        <a href="#health">回健康3.0</a>
      </section>
    </article>
  `;
}

function renderNotFoundPage(slug = "") {
  return `
    <section class="not-found-page">
      <div>
        <p class="eyebrow">404</p>
        <h1>這個頁面目前不存在或尚未發布。</h1>
        <p>你可以回到首頁、健康3.0，或直接留下需求讓歲悅協助判斷下一步。</p>
        <div class="hero-actions">
          <a class="primary-button" href="#home">回到首頁</a>
          <a class="secondary-button" href="#contact" data-contact-need="長照服務諮詢" data-contact-message="我找不到想看的頁面，請協助判斷適合的服務或下一步。">留下需求諮詢</a>
        </div>
      </div>
      <aside>
        <strong>找不到的路徑</strong>
        <code>${escapeHTML(slug || location.hash || location.pathname)}</code>
      </aside>
    </section>
  `;
}

function getRelatedArticles(slug) {
  const current = getHealthArticleList().find((item) => articleRouteMatches(item, slug));
  const relatedSlugs = Array.isArray(current?.relatedSlugs) ? current.relatedSlugs : [];
  const curatedRelated = relatedSlugs
    .map((relatedSlug) => getHealthArticleList().find((item) => articleRouteMatches(item, relatedSlug)))
    .filter(Boolean)
    .map((item) => ({
      href: normalizePublicHref(item.href),
      image: item.image,
      category: item.category,
      title: item.title,
      focalPoint: item.focalPoint
    }));
  if (curatedRelated.length) return curatedRelated.slice(0, 7);

  const cmsRelated = getHealthArticleList()
    .filter((item) => !articleRouteMatches(item, slug))
    .slice(0, 7)
    .map((item) => ({
      href: normalizePublicHref(item.href),
      image: item.image,
      category: item.category,
      title: item.title
    }));

  if (cmsRelated.length) return cmsRelated;
  return relatedArticleCards
    .filter((item) => normalizePublicHref(item.href) !== articleHref(slug))
    .slice(0, 7)
    .map((item) => ({ ...item, href: normalizePublicHref(item.href) }));
}

function searchHrefForTag(tag = "") {
  return `/search?q=${encodeURIComponent(String(tag || "").replace(/^#\s*/, "").trim())}`;
}

function renderArticleTagLinks(tags = []) {
  return (Array.isArray(tags) ? tags : [])
    .filter(Boolean)
    .map((tag) => `<a class="meta-tag" href="${escapeHTML(searchHrefForTag(tag))}" aria-label="搜尋 ${escapeHTML(tag)} 相關文章"># ${escapeHTML(tag)}</a>`)
    .join("");
}

function renderArticleInlineImage(image = {}) {
  if (!image?.src) return "";
  const imageSrc = normalizeLocalAssetUrl(contentImageUrl(image.src));
  return `
    <figure class="article-inline-image">
      <img src="${escapeHTML(imageSrc)}" alt="${escapeHTML(image.alt || image.caption || "健康3.0文章補充圖片")}" />
      ${image.caption ? `<figcaption>${escapeHTML(image.caption)}</figcaption>` : ""}
    </figure>
  `;
}

function renderArticleContentSection(section, index, inlineImages = []) {
  const [heading, rawBody] = Array.isArray(section) ? section : [section?.heading, section?.body];
  const bodies = Array.isArray(rawBody) ? rawBody : [rawBody].filter(Boolean);
  const images = inlineImages.filter((image) => Number(image.afterSection) === index);
  return `
    <section>
      <h2>${escapeHTML(heading || "")}</h2>
      ${bodies.map((body) => `<p>${escapeHTML(body || "")}</p>`).join("")}
      ${images.map(renderArticleInlineImage).join("")}
    </section>
  `;
}

function renderArticleCallout(callout = {}) {
  if (!callout?.items?.length && !callout?.body) return "";
  return `
    <aside class="article-callout">
      <strong>${escapeHTML(callout.title || "照顧提醒")}</strong>
      ${callout.body ? `<p>${escapeHTML(callout.body)}</p>` : ""}
      ${callout.items?.length ? `<ul>${callout.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}
    </aside>
  `;
}

function renderArticleChecklist(checklist = {}) {
  if (!checklist?.items?.length) return "";
  return `
    <section class="article-checklist">
      <h2>${escapeHTML(checklist.title || "家屬可以這樣檢查")}</h2>
      <ul>${checklist.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function renderArticleTable(table = {}) {
  if (!table?.rows?.length) return "";
  const headers = table.headers?.length ? table.headers : ["狀況", "可能原因", "下一步"];
  return `
    <section class="article-table-section">
      <h2>${escapeHTML(table.title || "快速對照表")}</h2>
      <div class="article-table-wrap">
        <table>
          <thead><tr>${headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}</tr></thead>
          <tbody>
            ${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function safeClassToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 48);
}

function renderSlideVisualIcon(name = "pulse") {
  const icons = {
    pulse: `<svg viewBox="0 0 48 48" focusable="false"><path d="M5 25h8l5-12 8 24 6-16h11"/><path d="M36 8a12 12 0 0 1 0 24"/></svg>`,
    gauge: `<svg viewBox="0 0 48 48" focusable="false"><path d="M9 34a17 17 0 1 1 30 0"/><path d="M24 34l10-14"/><path d="M16 34h16"/></svg>`,
    calendar: `<svg viewBox="0 0 48 48" focusable="false"><rect x="9" y="11" width="30" height="28" rx="4"/><path d="M16 7v8M32 7v8M9 20h30M16 27h5M27 27h5M16 34h5M27 34h5"/></svg>`,
    clock: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="24" r="16"/><path d="M24 15v10l7 4"/></svg>`,
    sun: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="24" r="8"/><path d="M24 5v7M24 36v7M5 24h7M36 24h7M10.5 10.5l5 5M32.5 32.5l5 5M37.5 10.5l-5 5M15.5 32.5l-5 5"/></svg>`,
    moon: `<svg viewBox="0 0 48 48" focusable="false"><path d="M32 38A16 16 0 0 1 27 7a13 13 0 1 0 5 31Z"/></svg>`,
    warning: `<svg viewBox="0 0 48 48" focusable="false"><path d="M24 7 43 40H5L24 7Z"/><path d="M24 18v10M24 34h.1"/></svg>`,
    phone: `<svg viewBox="0 0 48 48" focusable="false"><path d="M16 8h7l3 8-4 3a23 23 0 0 0 8 8l3-4 8 3v7c0 4-3 7-7 7A27 27 0 0 1 9 15c0-4 3-7 7-7Z"/></svg>`,
    pill: `<svg viewBox="0 0 48 48" focusable="false"><path d="M18 35 35 18a9 9 0 0 0-13-13L5 22a9 9 0 0 0 13 13Z"/><path d="m14 26 8 8"/></svg>`,
    note: `<svg viewBox="0 0 48 48" focusable="false"><path d="M13 7h16l8 8v26H13Z"/><path d="M29 7v9h8M18 24h14M18 31h14M18 38h8"/></svg>`,
    person: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="24" cy="13" r="6"/><path d="M14 41c1-9 5-14 10-14s9 5 10 14"/></svg>`,
    walk: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="25" cy="8" r="4"/><path d="M22 17 17 29l-4 10M25 18l6 8 8 2M22 28l8 4 2 9"/></svg>`,
    shield: `<svg viewBox="0 0 48 48" focusable="false"><path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11Z"/><path d="m16 24 5 5 11-12"/></svg>`,
    home: `<svg viewBox="0 0 48 48" focusable="false"><path d="M7 22 24 8l17 14"/><path d="M13 20v21h22V20"/><path d="M20 41V29h8v12"/></svg>`,
    heart: `<svg viewBox="0 0 48 48" focusable="false"><path d="M24 40S8 30 8 18A9 9 0 0 1 24 12a9 9 0 0 1 16 6c0 12-16 22-16 22Z"/><path d="M15 25h6l3-6 4 12 3-6h5"/></svg>`,
    brain: `<svg viewBox="0 0 48 48" focusable="false"><path d="M18 39a8 8 0 0 1-8-8 8 8 0 0 1 3-6 8 8 0 0 1 4-15 9 9 0 0 1 7-4 9 9 0 0 1 7 4 8 8 0 0 1 4 15 8 8 0 0 1-5 14"/><path d="M24 10v29M17 19h7M24 24h8M16 30h8"/></svg>`,
    kidney: `<svg viewBox="0 0 48 48" focusable="false"><path d="M18 10c-6 0-10 6-10 14s4 15 10 15c5 0 7-4 7-9 0-4-3-5-3-8 0-3 2-4 2-7 0-3-2-5-6-5Z"/><path d="M30 10c6 0 10 6 10 14s-4 15-10 15c-5 0-7-4-7-9 0-4 3-5 3-8 0-3-2-4-2-7 0-3 2-5 6-5Z"/></svg>`,
    team: `<svg viewBox="0 0 48 48" focusable="false"><circle cx="18" cy="16" r="5"/><circle cx="31" cy="14" r="6"/><path d="M8 40c1-8 5-13 10-13s9 5 10 13"/><path d="M23 27c2-3 5-5 8-5 5 0 9 6 10 18"/></svg>`,
    checklist: `<svg viewBox="0 0 48 48" focusable="false"><rect x="10" y="6" width="28" height="36" rx="4"/><path d="m16 18 3 3 6-7M28 19h5M16 30l3 3 6-7M28 31h5"/></svg>`
  };
  return `<span class="slide-visual-icon" aria-hidden="true">${icons[name] || icons.pulse}</span>`;
}

function renderInfographicMetric(visual = {}) {
  if (!visual.metric && !visual.metricLabel) return "";
  return `
    <div class="slide-visual-metric">
      ${visual.metric ? `<strong>${escapeHTML(visual.metric)}</strong>` : ""}
      ${visual.metricLabel ? `<span>${escapeHTML(visual.metricLabel)}</span>` : ""}
    </div>
  `;
}

function renderInfographicCards(cards = []) {
  if (!Array.isArray(cards) || cards.length === 0) return "";
  return `
    <div class="slide-visual-cards">
      ${cards.slice(0, 6).map((card) => {
        const tone = safeClassToken(card.tone);
        return `
          <div class="slide-visual-card ${tone ? `tone-${tone}` : ""}">
            ${renderSlideVisualIcon(card.icon)}
            <div>
              ${card.value ? `<b>${escapeHTML(card.value)}</b>` : ""}
              ${card.label ? `<span>${escapeHTML(card.label)}</span>` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderInfographicFlow(flow = []) {
  if (!Array.isArray(flow) || flow.length === 0) return "";
  return `
    <div class="slide-visual-flow">
      ${flow.slice(0, 4).map((step, index) => `
        <div class="slide-visual-step">
          <i>${String(index + 1).padStart(2, "0")}</i>
          ${renderSlideVisualIcon(step.icon)}
          <span>${escapeHTML(step.label || "")}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderInfographicAlerts(alerts = []) {
  if (!Array.isArray(alerts) || alerts.length === 0) return "";
  return `
    <div class="slide-visual-alerts">
      ${alerts.slice(0, 4).map((alert) => `<span>${renderSlideVisualIcon(alert.icon || "warning")}${escapeHTML(alert.label || alert)}</span>`).join("")}
    </div>
  `;
}

function renderArticleInfographicVisual(slide = {}, article = {}) {
  const visual = slide.visual || {};
  const tone = safeClassToken(visual.tone || slide.tone);
  return `
    <figure class="article-slide-visual article-slide-visual--infographic ${tone ? `tone-${tone}` : ""}">
      <div class="slide-infographic-canvas">
        <div class="slide-visual-top">
          <span>${escapeHTML(visual.eyebrow || slide.eyebrow || "Visual")}</span>
          ${visual.badge ? `<b>${escapeHTML(visual.badge)}</b>` : ""}
        </div>
        <div class="slide-visual-title">
          ${renderSlideVisualIcon(visual.icon)}
          <div>
            <strong>${escapeHTML(visual.title || slide.title || article.title || "")}</strong>
            ${visual.subtitle ? `<small>${escapeHTML(visual.subtitle)}</small>` : ""}
          </div>
        </div>
        <div class="slide-visual-main">
          ${renderInfographicMetric(visual)}
          ${renderInfographicCards(visual.cards)}
          ${renderInfographicFlow(visual.flow)}
          ${renderInfographicAlerts(visual.alerts)}
        </div>
        ${visual.caption ? `<figcaption>${escapeHTML(visual.caption)}</figcaption>` : ""}
      </div>
    </figure>
  `;
}

function renderArticleSlideVisual(slide = {}, article = {}) {
  if (slide.visual) return renderArticleInfographicVisual(slide, article);
  const image = slide.image || article.image;
  if (!image) return "";
  const imageSrc = normalizeLocalAssetUrl(contentImageUrl(image));
  return `
    <figure class="article-slide-visual">
      <img src="${escapeHTML(imageSrc)}" alt="${escapeHTML(slide.alt || slide.title || article.title || "懶人包視覺頁")}" loading="lazy" decoding="async" />
      ${slide.visualLabel ? `<figcaption>${escapeHTML(slide.visualLabel)}</figcaption>` : ""}
    </figure>
  `;
}

function renderArticleSlideDeck(article) {
  const slides = Array.isArray(article.slides) ? article.slides.filter(Boolean).slice(0, 10) : [];
  if (slides.length < 1) return "";
  const deckHint = article.visualFormat === "ppt-icon-pack"
    ? "70% 圖解、icon、短句，像簡報一樣快速抓重點。"
    : "大圖、短句、清單，快速抓重點。";
  return `
    <section class="article-slide-deck" aria-label="${escapeHTML(article.title)} PPT式懶人包">
      <div class="article-slide-deck-head">
        <span>PPT式懶人包</span>
        <strong>${slides.length} 頁速讀</strong>
        <p>${deckHint}</p>
      </div>
      <nav class="article-slide-jump" aria-label="懶人包頁面索引">
        ${slides.map((slide, index) => `<a href="#slide-${escapeHTML(article.slug)}-${index + 1}">${String(index + 1).padStart(2, "0")}</a>`).join("")}
      </nav>
      <div class="article-slides">
        ${slides.map((slide, index) => {
          const slideClasses = [
            "article-slide",
            article.visualFormat === "ppt-icon-pack" ? "is-icon-pack" : "",
            slide.visual ? "has-infographic" : "",
            slide.tone ? `tone-${safeClassToken(slide.tone)}` : ""
          ].filter(Boolean).join(" ");
          return `
            <section class="${slideClasses}" id="slide-${escapeHTML(article.slug)}-${index + 1}">
              ${renderArticleSlideVisual(slide, article)}
              <div class="article-slide-copy">
                <div class="article-slide-kicker">
                  <span>${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}</span>
                  ${slide.eyebrow ? `<em>${escapeHTML(slide.eyebrow)}</em>` : ""}
                </div>
                <h2>${escapeHTML(slide.title || "")}</h2>
                ${slide.lede ? `<p class="article-slide-lede">${escapeHTML(slide.lede)}</p>` : ""}
                ${slide.stat || slide.statLabel ? `
                  <div class="article-slide-stat">
                    ${slide.stat ? `<b>${escapeHTML(slide.stat)}</b>` : ""}
                    ${slide.statLabel ? `<span>${escapeHTML(slide.statLabel)}</span>` : ""}
                  </div>
                ` : ""}
                ${Array.isArray(slide.points) && slide.points.length ? `
                  <ul>
                    ${slide.points.slice(0, 4).map((point) => `<li>${escapeHTML(point)}</li>`).join("")}
                  </ul>
                ` : ""}
              </div>
            </section>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderArticleReferences(article) {
  const references = Array.isArray(article.references) ? article.references : [];
  const legacySource = references.length === 0 && (article.sourceName || article.sourceUrl)
    ? [{ name: article.sourceName || article.sourceUrl, url: article.sourceUrl || "" }]
    : [];
  const seenReferences = new Set();
  const allReferences = [...references, ...legacySource]
    .filter((item) => item?.citation || item?.name || item?.url)
    .sort((a, b) => Number(a.evidenceRank || 99) - Number(b.evidenceRank || 99))
    .filter((item) => {
      const key = String(item.pmid || item.doi || item.url || item.citation || item.name || "")
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\/(www\.)?/, "")
        .replace(/\/$/, "");
      if (!key || seenReferences.has(key)) return false;
      seenReferences.add(key);
      return true;
    });
  if (!allReferences.length) return "";
  return `
    <section class="article-references">
      <h2>參考資料</h2>
      <ol>
        ${allReferences.map((item) => `
          <li>${item.url ? `<a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">${escapeHTML(item.citation || item.name || item.url)}</a>` : escapeHTML(item.citation || item.name)}</li>
        `).join("")}
      </ol>
    </section>
  `;
}

function renderArticleLayout(article) {
  const related = getRelatedArticles(article.slug);
  const hasSlideDeck = Array.isArray(article.slides) && article.slides.length > 0;

  return `
    <article class="article-page">
      <div class="article-topbar">
        <a class="article-back" href="#health">返回上一頁</a>
        <span class="article-category">${escapeHTML(article.category)}</span>
      </div>

      <header class="article-hero">
        <figure>
          <img ${healthArticleImageAttrs(article, { usage: article.imageUsage || "article_cover", focalPoint: article.focalPoint })} />
          <figcaption>
            <h1>${escapeHTML(article.title)}</h1>
            <p>${escapeHTML(article.subtitle || article.excerpt || "")}</p>
          </figcaption>
        </figure>
      </header>

      <section class="article-layout">
        <div class="article-main">
          <div class="article-meta">
            <span class="meta-editor">編輯人｜${escapeHTML(article.author)}</span>
            <span class="meta-date">${escapeHTML(article.date)}</span>
            ${article.readingMinutes ? `<span class="meta-editor">閱讀時間｜${Number(article.readingMinutes)} 分鐘</span>` : ""}
            ${article.targetAudience ? `<span class="meta-editor">適合｜${escapeHTML(article.targetAudience)}</span>` : ""}
            ${renderArticleTagLinks(article.tags)}
          </div>

          ${article.videoEmbedUrl ? `
            <section class="article-video-block">
              ${article.videoProvider === "youtube" || article.videoProvider === "vimeo"
                ? `<iframe src="${escapeHTML(article.videoEmbedUrl)}" title="${escapeHTML(article.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
                : `<video src="${escapeHTML(article.videoEmbedUrl)}" controls preload="metadata" poster="${escapeHTML(getHealthArticleImage(article))}"></video>`}
              <div><span>${escapeHTML(article.videoLabel || article.category)}${article.videoDuration ? ` · ${escapeHTML(article.videoDuration)}` : ""}</span><p>${escapeHTML(article.videoCaption || article.subtitle || "")}</p></div>
            </section>
          ` : ""}

          ${hasSlideDeck
            ? renderArticleSlideDeck(article)
            : `${article.summary?.length ? `
              <div class="article-summary">
                <strong>本文重點</strong>
                <ul>${article.summary.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
              </div>
            ` : ""}`}

          <div class="article-body ${hasSlideDeck ? "article-body-compact" : ""}">
            ${hasSlideDeck ? "" : renderArticleCallout(article.warning)}
            ${hasSlideDeck ? "" : (Array.isArray(article.content)
              ? article.content.map((section, index) => renderArticleContentSection(section, index, article.inlineImages || [])).join("")
              : renderMarkdownContent(article.content))}
            ${hasSlideDeck ? "" : (Array.isArray(article.checklists) ? article.checklists.map(renderArticleChecklist).join("") : "")}
            ${hasSlideDeck ? "" : (Array.isArray(article.tables) ? article.tables.map(renderArticleTable).join("") : "")}
            ${hasSlideDeck ? "" : (Array.isArray(article.faq) && article.faq.length ? `
                <section class="article-faq">
                  <h2>常見問題</h2>
                  ${article.faq.map((item) => `
                    <details>
                      <summary>${escapeHTML(item.question || "")}</summary>
                      <p>${escapeHTML(item.answer || "")}</p>
                    </details>
                  `).join("")}
                </section>
              ` : "")}
            <div class="article-cta">
              <p>${escapeHTML(article.cta || "不確定下一步怎麼安排？留下需求，讓歲悅協助判斷。")}</p>
              <a href="${escapeHTML(article.ctaUrl || "#contact")}">${escapeHTML(article.ctaText || "預約照顧諮詢")}</a>
            </div>
            ${renderArticleReferences(article)}
          </div>

        </div>

        <aside class="article-ads" aria-label="側邊推薦">
          <a class="article-ad featured" href="#contact">
            <span>Suiyuecare Corps.</span>
            <strong>第一次照顧諮詢</strong>
            <p>不知道該選居家、日照還是復能？讓專人協助判斷。</p>
            <em>預約諮詢</em>
          </a>
          <a class="article-ad" href="#courses">
            <span>Care Course</span>
            <strong>家屬照顧課</strong>
            <p>把移位、用餐、跌倒預防變成看得懂的日常技巧。</p>
          </a>
          <a class="article-ad" href="/talent">
            <span>We want you</span>
            <strong>加入歲悅團隊</strong>
            <p>居服員、督導、日照照服員招募中。</p>
          </a>
        </aside>

        <section class="article-related">
          <div class="article-related-head">
            <span>Related Articles</span>
            <strong>延伸閱讀</strong>
          </div>
          <div class="article-related-grid">
            ${related.map((item) => `
              <a href="${escapeHTML(normalizePublicHref(item.href))}">
                <img ${healthArticleImageAttrs(item, { usage: "card", focalPoint: item.focalPoint })} />
                <span>${escapeHTML(item.category)}</span>
                <b>${escapeHTML(item.title)}</b>
              </a>
            `).join("")}
          </div>
        </section>
      </section>
    </article>
  `;
}

function renderStaticArticlePage(slug) {
  const article = articlePages[slug] || articlePages["longterm-care-apply"];
  return renderArticleLayout({
    slug,
    category: article.category,
    title: article.title,
    subtitle: article.dek,
    excerpt: article.dek,
    image: article.image,
    author: article.author,
    date: article.date,
    tags: article.tags,
    summary: article.summary,
    content: article.content,
    warning: article.warning,
    inlineImages: article.inlineImages,
    checklists: article.checklists,
    tables: article.tables,
    slides: article.slides,
    visualFormat: article.visualFormat,
    faq: article.faq,
    references: article.references,
    cta: article.cta,
    ctaText: article.ctaText,
    ctaUrl: article.ctaUrl,
    focalPoint: article.focalPoint,
    imageUsage: article.imageUsage,
    readingMinutes: article.readingMinutes,
    sourceName: article.sourceName,
    sourceUrl: article.sourceUrl
  });
}

async function loadArticlePage(slug) {
  try {
    await ensureStaticArticleRewrites();
    const article = await fetchSupabaseArticlePage(slug);
    if (routeSlugFromLocation() !== `article-${slug}`) return;
    if (article) {
      setRouteSeo(`article-${slug}`, {
        title: article.seoTitle || `${article.title}｜健康3.0`,
        description: article.seoDescription || article.excerpt || article.subtitle || DEFAULT_SEO.description,
        image: article.image,
        imageAlt: article.title,
        type: "article",
        canonical: routeCanonical(`article-${slug}`)
      });
    } else if (articlePages[slug]) {
      const fallback = articlePages[slug];
      setRouteSeo(`article-${slug}`, {
        title: `${fallback.title}｜健康3.0`,
        description: fallback.dek || DEFAULT_SEO.description,
        image: fallback.image,
        imageAlt: fallback.title,
        type: "article",
        canonical: routeCanonical(`article-${slug}`)
      });
    } else {
      setRouteSeo("health", {
        title: "文章尚未發布｜健康3.0",
        description: "這篇文章目前尚未發布或不存在。",
        robots: "noindex, follow",
        canonical: routeCanonical("health")
      });
    }
    pageView.innerHTML = article ? renderArticleLayout(article) : (articlePages[slug] ? renderStaticArticlePage(slug) : renderArticleNotFoundPage());
  } catch (error) {
    console.warn("Supabase article page unavailable.", error);
    if (routeSlugFromLocation() !== `article-${slug}`) return;
    if (articlePages[slug]) {
      const fallback = articlePages[slug];
      setRouteSeo(`article-${slug}`, {
        title: `${fallback.title}｜健康3.0`,
        description: fallback.dek || DEFAULT_SEO.description,
        image: fallback.image,
        imageAlt: fallback.title,
        type: "article",
        canonical: routeCanonical(`article-${slug}`)
      });
    } else {
      setRouteSeo("health", {
        title: "文章尚未發布｜健康3.0",
        description: "這篇文章目前尚未發布或不存在。",
        robots: "noindex, follow",
        canonical: routeCanonical("health")
      });
    }
    pageView.innerHTML = articlePages[slug] ? renderStaticArticlePage(slug) : renderArticleNotFoundPage();
  }
}

async function renderRecruitingPageOnce(slug, fallbackRenderer) {
  setPageViewBusy(true);
  const loaded = await loadSupabaseRecruitingPage(slug);
  if (routeSlugFromLocation() !== slug) return;
  if (!loaded) pageView.innerHTML = fallbackRenderer();
  setPageViewBusy(false);
}

async function fetchCareStoryPage(slug) {
  if (careStoryPageCache.has(slug)) return careStoryPageCache.get(slug);
  const { data, error } = await supabase
    .from("care_stories")
    .select("*, cover_image:media!care_stories_cover_image_id_fkey(id, public_url, alt_text), avatar_image:media!care_stories_avatar_image_id_fkey(id, public_url, alt_text)")
    .eq("slug", slug)
    .eq("is_enabled", true)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const story = normalizeCareStory(data);
  careStoryPageCache.set(slug, story);
  return story;
}

async function fetchExpertTalkPage(slug) {
  if (expertTalkPageCache.has(slug)) return expertTalkPageCache.get(slug);
  const { data, error } = await supabase
    .from("expert_talks")
    .select("*, image:media!expert_talks_image_id_fkey(id, public_url, alt_text)")
    .eq("slug", slug)
    .eq("is_enabled", true)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const talk = normalizeExpertTalk(data);
  expertTalkPageCache.set(slug, talk);
  return talk;
}

function renderCareStoryArticle(story) {
  const serviceLabel = story.service || "照顧服務";
  const praise = story.praise || story.quote || "家屬在照顧過程中感受到資訊變清楚，服務也更容易被接上。";
  const storyBody = story.body || story.quote || praise;
  return renderArticleLayout({
    slug: `care-story-${story.slug}`,
    category: serviceLabel,
    title: story.title,
    subtitle: `${story.name}｜${story.label}`,
    excerpt: story.praise,
    image: story.image,
    author: "Suiyuecare Corps.",
    date: story.date,
    tags: story.tags,
    contentRevision: "2026-07-10-dynamic-rewrite",
    summary: [
      praise,
      `${serviceLabel}的重點不只在一次服務，而是讓家庭知道每天該留意什麼。`,
      "透過紀錄、回報與督導追蹤，照顧可以從緊急應付變成可被安排的日常。"
    ].filter(Boolean),
    content: [
      ["照顧開始前，家庭最需要的是有人把狀況說清楚", `這個故事來自${story.name || "家屬"}對${serviceLabel}的回饋。家屬一開始面對的通常不是單一問題，而是一連串日常細節：什麼時候需要協助、哪些狀況算異常、家人能負擔多少、服務進場後要怎麼交接。`],
      ["被稱讚的不是單一動作，而是照顧被接住的感覺", storyBody],
      ["把經驗留下來，下一次照顧才會更穩", "歲悅會把服務紀錄、家屬回報與督導追蹤放在同一個照顧流程裡。當狀況改變時，家庭不需要重新摸索，而是可以依照紀錄與專業建議調整服務，讓長輩和家屬都比較安心。"]
    ],
    cta: "想知道家人的狀況適合哪一種照顧安排？留下需求，讓歲悅協助判斷。"
  });
}

function renderExpertTalkArticle(talk) {
  const topic = talk.topic || talk.summary || talk.quote || "照顧現場需要被整理成家庭聽得懂、做得到的方法。";
  const viewpoint = talk.quote || talk.summary || topic;
  const body = talk.body || talk.summary || talk.quote || topic;
  return renderArticleLayout({
    slug: `master-talk-${talk.slug}`,
    category: "名人講堂",
    title: talk.title,
    subtitle: `${talk.titleLabel} ${talk.speaker}${talk.organization ? `｜${talk.organization}` : ""}`,
    excerpt: talk.summary || talk.quote,
    image: talk.image,
    author: talk.speaker,
    date: talk.date,
    tags: talk.tags,
    contentRevision: "2026-07-10-dynamic-rewrite",
    summary: [
      topic,
      viewpoint,
      "把專業觀點轉成日常可執行的照顧步驟，是名人講堂最重要的目的。"
    ].filter(Boolean),
    content: [
      ["講者從照顧現場看見的問題", viewpoint],
      ["把觀點轉成家庭能使用的方法", body],
      ["歲悅如何把這些提醒放回服務流程", "名人講堂不是只留下金句，而是把照顧心理、營養、復能、居家安全、溝通、用藥與系統回報等觀點，轉成家庭可理解的提醒與服務流程。當家屬知道下一步怎麼做，長輩的照顧就比較不會只靠臨場反應。"]
    ],
    cta: "想看更多照顧觀點與健康3.0內容？回到健康3.0閱讀更多文章。"
  });
}

async function loadCareStoryPage(slug) {
  try {
    const story = await fetchCareStoryPage(slug);
    if (routeSlugFromLocation() !== `care-story-${slug}`) return;
    if (story) {
      setRouteSeo(`care-story-${slug}`, {
        title: `${story.title}｜真實照顧情境`,
        description: story.praise || story.quote || DEFAULT_SEO.description,
        image: story.image,
        imageAlt: story.title,
        type: "article",
        canonical: routeCanonical(`care-story-${slug}`)
      });
    } else {
      setRouteSeo("health", { title: "故事尚未發布｜歲悅長照集團", robots: "noindex, follow", canonical: routeCanonical("health") });
    }
    pageView.innerHTML = story ? renderCareStoryArticle(story) : renderArticleNotFoundPage();
  } catch (error) {
    console.warn("Care story page unavailable.", error);
    setRouteSeo("health", { title: "故事尚未發布｜歲悅長照集團", robots: "noindex, follow", canonical: routeCanonical("health") });
    pageView.innerHTML = renderArticleNotFoundPage();
  }
}

async function loadExpertTalkPage(slug) {
  try {
    const talk = await fetchExpertTalkPage(slug);
    if (routeSlugFromLocation() !== `master-talk-${slug}`) return;
    if (talk) {
      setRouteSeo(`master-talk-${slug}`, {
        title: `${talk.title}｜名人講堂`,
        description: talk.summary || talk.quote || DEFAULT_SEO.description,
        image: talk.image,
        imageAlt: talk.title,
        type: "article",
        canonical: routeCanonical(`master-talk-${slug}`)
      });
    } else {
      setRouteSeo("health", { title: "名人講堂尚未發布｜健康3.0", robots: "noindex, follow", canonical: routeCanonical("health") });
    }
    pageView.innerHTML = talk ? renderExpertTalkArticle(talk) : renderArticleNotFoundPage();
  } catch (error) {
    console.warn("Expert talk page unavailable.", error);
    setRouteSeo("health", { title: "名人講堂尚未發布｜健康3.0", robots: "noindex, follow", canonical: routeCanonical("health") });
    pageView.innerHTML = renderArticleNotFoundPage();
  }
}

function renderPage(slug) {
  if (!home || !pageView) return;

  const rawSlug = slug || "home";
  const [normalized, queryString = ""] = rawSlug.split("?");
  preloadHeroImage(routeHeroImageForViewport(normalized));
  const searchParams = new URLSearchParams(queryString);
  const articleSlug = normalized.startsWith("article-") ? normalized.replace("article-", "") : null;
  const careStorySlug = normalized.startsWith("care-story-") ? normalized.replace("care-story-", "") : null;
  const masterTalkSlug = normalized.startsWith("master-talk-") ? normalized.replace("master-talk-", "") : null;
  const anchorTarget = normalized === "home" ? null : document.getElementById(normalized);
  const page = anchorTarget ? null : pages[normalized];
  const isHome = !articleSlug && !careStorySlug && !masterTalkSlug && (normalized === "home" || Boolean(anchorTarget));
  const handledBySpecialCms =
    normalized === "about" ||
    normalized === "milestones" ||
    normalized === "home-care" ||
    normalized === "day-care" ||
    normalized === "community" ||
    normalized === "nursing" ||
    normalized === "migrant-training" ||
    normalized === "quality" ||
    serviceTemplateSlugs.has(normalized) ||
    recruitingTemplateSlugs.has(normalized) ||
    ["investors", "ir-finance", "ir-governance", "ir-shareholders"].includes(normalized);

  if (articleSlug) {
    setRouteSeo(`article-${articleSlug}`, { title: "文章載入中｜健康3.0", canonical: routeCanonical(`article-${articleSlug}`) });
  } else if (careStorySlug) {
    setRouteSeo(`care-story-${careStorySlug}`, { title: "故事載入中｜真實照顧情境", canonical: routeCanonical(`care-story-${careStorySlug}`) });
  } else if (masterTalkSlug) {
    setRouteSeo(`master-talk-${masterTalkSlug}`, { title: "名人講堂載入中｜健康3.0", canonical: routeCanonical(`master-talk-${masterTalkSlug}`) });
  } else {
    setRouteSeo(normalized || "home");
  }

  home.classList.toggle("active", isHome);
  pageView.classList.toggle("active", !isHome);
  pageView.innerHTML = "";
  setPageViewBusy(false);

  if (articleSlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = "";
    loadArticlePage(articleSlug);
  } else if (careStorySlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = "";
    loadCareStoryPage(careStorySlug);
  } else if (masterTalkSlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = "";
    loadExpertTalkPage(masterTalkSlug);
  } else if (normalized === "about") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderAboutPageThreeMinute();
  } else if (normalized === "milestones") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderMilestonesPage();
    initMilestonePage();
  } else if (normalized === "home-care") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderCmsEnhancedServicePageOnce(normalized, renderHomeCarePage);
  } else if (normalized === "day-care") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderCmsEnhancedServicePageOnce(normalized, renderDayCarePage);
  } else if (normalized === "community") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderCmsEnhancedServicePageOnce(normalized, renderCommunityPage);
  } else if (normalized === "nursing") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderCmsEnhancedServicePageOnce(normalized, renderNursingPage);
  } else if (normalized === "migrant-training") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderCmsEnhancedServicePageOnce(normalized, renderMigrantTrainingPage);
  } else if (normalized === "quality") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderCmsEnhancedServicePageOnce(normalized, renderQualityPage);
  } else if (normalized === "software") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderServiceTemplatePageOnce(normalized, renderSoftwarePage);
  } else if (normalized === "land") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderLandRecruitingPage();
  } else if (normalized === "investor-recruiting") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderInvestorRecruitingPage();
  } else if (normalized === "health") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderHealthPage(searchParams.get("category") || "");
    ensureStaticArticleRewrites().then(() => {
      const [currentRoute, currentQuery = ""] = routeSlugFromLocation().split("?");
      if (currentRoute === "health") pageView.innerHTML = renderHealthPage(new URLSearchParams(currentQuery).get("category") || "");
    });
    // Keep Health 3.0 first paint stable; remote data warms the cache without replacing the visible page.
    loadSupabaseHealthArticles({ rerender: false });
    loadSupabaseArticleCategories({ rerender: false });
  } else if (normalized === "search") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderSearchPage(searchParams.get("q") || "");
    ensureStaticArticleRewrites().then(() => {
      const [currentRoute, currentQuery = ""] = routeSlugFromLocation().split("?");
      if (currentRoute === "search") pageView.innerHTML = renderSearchPage(new URLSearchParams(currentQuery).get("q") || "");
    });
    loadSupabaseHealthArticles({ rerender: true });
  } else if (normalized === "courses") {
    renderCoursesPageFromCms();
  } else if (normalized === "talent") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderTalentPage();
  } else if (normalized === "investors") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderInvestorsPage();
  } else if (normalized === "ir-finance") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderFinancePage();
  } else if (normalized === "ir-governance") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderGovernancePage();
  } else if (normalized === "ir-shareholders") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderShareholdersPage();
  } else if (page) {
    pageView.innerHTML = `
      <div class="detail-hero">
        <div>
          <p class="eyebrow">${page.eyebrow}</p>
          <h1>${page.title}</h1>
          <p>${page.intro}</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">聯絡諮詢</a>
            <a class="secondary-button" href="#courses">查看課程</a>
          </div>
        </div>
        <aside class="detail-panel">
          <strong>此頁建議內容</strong>
          <ul>${page.focus.map((item) => `<li>${item}</li>`).join("")}</ul>
        </aside>
      </div>
      <div class="detail-content">
        ${page.features
          .map(
            (item, index) => `
              <article class="feature-tile">
                <span>${index + 1}</span>
                <h3>${item}</h3>
                <p>我們會依照你的需求安排合適窗口，協助提供流程、照片、常見問題或後續資料。</p>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  } else if (!articleSlug && normalized !== "home" && !anchorTarget && !page) {
    home.classList.remove("active");
    pageView.classList.add("active");
    setRouteSeo(normalized, {
      title: "找不到頁面｜歲悅長照集團",
      description: "這個頁面目前不存在或尚未發布。",
      robots: "noindex, follow",
      canonical: absoluteSiteUrl("/404")
    });
    pageView.innerHTML = renderNotFoundPage(rawSlug);
    trackAnalyticsEvent("error_404", {
      label: rawSlug,
      targetUrl: location.href,
      metadata: { normalized }
    });
  }

  document.querySelectorAll(".primary-nav a, .dropdown a").forEach((link) => {
    const href = link.getAttribute("href");
    const currentHash = `#${normalized || "home"}`;
    const currentPath = !normalized || normalized === "home" ? "/" : `/${normalized}`;
    setActiveNavLink(link, href === currentHash || href === currentPath);
  });

  nav?.classList.remove("open");
  document.body.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "開啟主選單");
  navGroups.forEach((group) => group.classList.remove("open"));
  navGroups.forEach((group) => group.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false"));

  if (anchorTarget && normalized !== "home") {
    const scrollTarget = normalized === "contact" ? anchorTarget.querySelector(".contact-form") || anchorTarget : anchorTarget;
    [80, 650, 1500, 2800].forEach((delay, index) => {
      window.setTimeout(() => {
        if (routeSlugFromLocation() !== normalized) return;
        scrollTarget.scrollIntoView({ behavior: index === 0 ? "smooth" : "auto", block: "start" });
      }, delay);
    });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (!isHome && !articleSlug && !careStorySlug && !masterTalkSlug && !handledBySpecialCms && !["health", "search"].includes(normalized)) {
    loadSupabaseDetailPage(normalized);
  }

  optimizeImageLoading(isHome ? home : pageView);
  if (window.location.hash === "#contact") {
    window.setTimeout(applyPendingContactPreset, 180);
  }
  trackPageView(`#${rawSlug || "home"}`);
}

let serviceMotionObserver = null;
let serviceMotionFrame = 0;
let imageOptimizationFrame = 0;

function observeServiceMotion(root = document) {
  const items = root.querySelectorAll?.(".service-motion:not(.motion-bound)") || [];
  items.forEach((item) => {
    item.classList.add("motion-bound");
    if (serviceMotionObserver) {
      serviceMotionObserver.observe(item);
    } else {
      item.classList.add("in-view");
    }
  });
}

function optimizeImageLoading(root = document) {
  const images = root.querySelectorAll?.("img") || [];
  images.forEach((image) => {
    const isPriority =
      image.closest(".hero, .service-detail-hero, .about-full-hero, .milestones-full-hero, .article-hero") ||
      image.classList.contains("active") ||
      image.classList.contains("map-image");
    if (!isPriority) {
      const currentSrc = image.getAttribute("src") || "";
      const displaySrc = displayAssetUrl(currentSrc);
      if (displaySrc && displaySrc !== currentSrc) image.setAttribute("src", displaySrc);
    }
    if (!image.hasAttribute("decoding")) image.setAttribute("decoding", "async");
    if (isPriority) {
      image.setAttribute("fetchpriority", "high");
      image.setAttribute("loading", "eager");
    } else {
      image.setAttribute("loading", "lazy");
      if (!image.hasAttribute("fetchpriority")) image.setAttribute("fetchpriority", "auto");
    }
  });
}

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const fallback = image.dataset?.fallbackSrc;
  if (!fallback || image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = fallback;
}, true);

function scheduleServiceMotionObservation(root = document) {
  if (serviceMotionFrame) return;
  serviceMotionFrame = window.requestAnimationFrame(() => {
    serviceMotionFrame = 0;
    observeServiceMotion(root);
  });
}

function scheduleImageLoadingOptimization(root = document) {
  if (imageOptimizationFrame) return;
  imageOptimizationFrame = window.requestAnimationFrame(() => {
    imageOptimizationFrame = 0;
    optimizeImageLoading(root);
  });
}

function contactFormFromTrigger(trigger) {
  const href = trigger?.getAttribute?.("href") || "";
  const targetSelector = href.startsWith("#") ? href : "";
  const activePage = document.querySelector(".page.active");
  const target =
    targetSelector && targetSelector.length > 1
      ? activePage?.querySelector(targetSelector) || document.querySelector(targetSelector)
      : null;
  return (
    target?.querySelector?.(".contact-form") ||
    trigger?.closest?.(".contact-section")?.querySelector?.(".contact-form") ||
    activePage?.querySelector?.(".contact-form") ||
    document.querySelector(".contact-section#contact .contact-form") ||
    document.querySelector(".contact-form")
  );
}

function applyContactPreset(trigger) {
  const need = trigger?.dataset?.contactNeed;
  const message = trigger?.dataset?.contactMessage;
  const form = contactFormFromTrigger(trigger);
  if (!form) return;
  const select = form.querySelector('select[name="需求"]');
  if (select && need) {
    const hasOption = [...select.options].some((option) => option.value === need || option.textContent === need);
    if (!hasOption) {
      select.add(new Option(need, need), 0);
    }
    select.value = need;
  }
  const textarea = form.querySelector('textarea[name="說明"]');
  if (textarea && message && !textarea.value.trim()) textarea.value = message;
}

function focusContactForm(trigger) {
  const form = contactFormFromTrigger(trigger);
  const input = form?.querySelector('input[name="姓名"], input:not([type="hidden"]):not([tabindex="-1"]), textarea, select');
  window.setTimeout(() => input?.focus?.({ preventScroll: true }), 260);
}

const pendingContactPresetKey = "suiyuecare_pending_contact_preset";

function savePendingContactPreset(trigger) {
  const need = trigger?.dataset?.contactNeed || "";
  const message = trigger?.dataset?.contactMessage || "";
  if (!need && !message) return;
  try {
    sessionStorage.setItem(pendingContactPresetKey, JSON.stringify({ need, message }));
  } catch (error) {
    console.warn("Unable to persist contact preset.", error);
  }
}

function applyPendingContactPreset() {
  let preset = null;
  try {
    preset = JSON.parse(sessionStorage.getItem(pendingContactPresetKey) || "null");
    sessionStorage.removeItem(pendingContactPresetKey);
  } catch (error) {
    sessionStorage.removeItem(pendingContactPresetKey);
  }
  if (!preset?.need && !preset?.message) return;
  applyContactPreset({
    dataset: {
      contactNeed: preset.need || "",
      contactMessage: preset.message || ""
    },
    getAttribute: () => "#contact"
  });
}

function handleContactAnchorClick(link) {
  const href = link?.getAttribute?.("href") || "";
  if (href !== "#contact") return false;
  const activePage = document.querySelector(".page.active");
  const localTarget = activePage?.querySelector("#service-contact");
  if (localTarget) {
    localTarget.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => applyContactPreset(link), 120);
    focusContactForm(link);
    return true;
  }
  savePendingContactPreset(link);
  if (routeSlugFromPath() === "home") return false;
  window.location.href = "/#contact";
  return true;
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  serviceMotionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          serviceMotionObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );
  observeServiceMotion(document);
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
  observeServiceMotion(document);
}

window.setTimeout(() => {
  revealItems.forEach((item) => item.classList.add("in-view"));
  observeServiceMotion(document);
}, 900);

if ("MutationObserver" in window && pageView) {
  const serviceMotionMutationObserver = new MutationObserver(() => scheduleServiceMotionObservation(pageView));
  serviceMotionMutationObserver.observe(pageView, { childList: true, subtree: true });
  const imageLoadingMutationObserver = new MutationObserver(() => scheduleImageLoadingOptimization(pageView));
  imageLoadingMutationObserver.observe(pageView, { childList: true, subtree: true });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-service-scroll]");
  if (!trigger) return;
  const selector = trigger.getAttribute("data-service-scroll");
  const target = selector ? pageView?.querySelector(selector) : null;
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  if (target.querySelector?.(".contact-form")) {
    window.setTimeout(() => applyContactPreset(trigger), 120);
    focusContactForm(trigger);
  }
});

const careDaySection = document.querySelector("[data-care-day]");
let activeCareDayIndex = -1;
let careDayRailFrame = 0;
let careDayRailProgrammatic = false;
let careDayLastPageScrollAt = 0;

function isCareDayMobile() {
  return window.innerWidth <= 640;
}

function setCareDayActive(index) {
  if (!careDaySection) return;
  const steps = [...careDaySection.querySelectorAll("[data-care-day-step]")];
  const images = [...careDaySection.querySelectorAll("[data-care-day-image]")];
  const markers = [...careDaySection.querySelectorAll("[data-care-day-marker]")];
  const nextIndex = Math.max(0, Math.min(index, steps.length - 1));
  if (nextIndex === activeCareDayIndex) return;
  activeCareDayIndex = nextIndex;
  careDaySection.dataset.activeCareDayStep = String(nextIndex + 1).padStart(2, "0");

  steps.forEach((step, stepIndex) => {
    const isActive = stepIndex === nextIndex;
    step.classList.toggle("active", isActive);
    step.setAttribute("aria-current", isActive ? "step" : "false");
  });
  images.forEach((image, imageIndex) => image.classList.toggle("active", imageIndex === nextIndex));
  markers.forEach((marker, markerIndex) => {
    const markerTarget = Number(marker.dataset.careDayMarker || markerIndex);
    const nextMarkerTarget = Number(markers[markerIndex + 1]?.dataset.careDayMarker || steps.length);
    const isActive = nextIndex >= markerTarget && nextIndex < nextMarkerTarget;
    marker.classList.toggle("active", isActive);
    marker.setAttribute("aria-current", isActive ? "step" : "false");
  });
}

function setCareDayProgressFromIndex(index, total) {
  if (!careDaySection || !total) return;
  const progress = total <= 1 ? 1 : index / (total - 1);
  careDaySection.style.setProperty("--care-day-progress", `${Math.max(0, Math.min(100, progress * 100))}%`);
}

function syncCareDayFromMobileRail() {
  if (!careDaySection || !isCareDayMobile()) return;
  const steps = [...careDaySection.querySelectorAll("[data-care-day-step]")];
  const rail = careDaySection.querySelector(".care-day-steps");
  if (!steps.length || !rail) return;
  const railRect = rail.getBoundingClientRect();
  const railCenter = railRect.left + railRect.width / 2;
  let nextIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  steps.forEach((step, index) => {
    const rect = step.getBoundingClientRect();
    const stepCenter = rect.left + rect.width / 2;
    const distance = Math.abs(stepCenter - railCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      nextIndex = index;
    }
  });

  setCareDayProgressFromIndex(nextIndex, steps.length);
  setCareDayActive(nextIndex);
}

function scrollCareDayRailTo(index, behavior = "smooth", syncProgress = true) {
  const rail = careDaySection?.querySelector(".care-day-steps");
  const steps = [...(careDaySection?.querySelectorAll("[data-care-day-step]") || [])];
  const target = steps[index];
  if (!rail || !target) return false;
  const railRect = rail.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const left = rail.scrollLeft + targetRect.left - railRect.left - (rail.clientWidth - targetRect.width) / 2;
  careDayRailProgrammatic = true;
  rail.scrollTo({ left, behavior });
  window.setTimeout(() => {
    careDayRailProgrammatic = false;
  }, behavior === "auto" ? 80 : 420);
  if (syncProgress) setCareDayProgressFromIndex(index, steps.length);
  return true;
}

function updateCareDayPin(rect) {
  const sticky = careDaySection?.querySelector(".care-day-sticky");
  if (!sticky) return;
  sticky.classList.remove("is-fixed", "is-docked");
  sticky.style.left = "";
  sticky.style.width = "";
  if (window.innerWidth <= 1180) return;

  const topOffset = Number.parseFloat(getComputedStyle(sticky).top) || 0;
  const stickyHeight = sticky.offsetHeight;
  const sectionStyle = getComputedStyle(careDaySection);
  const paddingLeft = Number.parseFloat(sectionStyle.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(sectionStyle.paddingRight) || 0;

  if (rect.top <= topOffset && rect.bottom > topOffset + stickyHeight) {
    sticky.classList.add("is-fixed");
    sticky.style.left = `${rect.left + paddingLeft}px`;
    sticky.style.width = `${Math.max(0, rect.width - paddingLeft - paddingRight)}px`;
    return;
  }

  if (rect.bottom <= topOffset + stickyHeight && rect.bottom > 0) {
    sticky.classList.add("is-docked");
  }
}

function updateCareDayScroll() {
  if (!careDaySection) return;
  const steps = careDaySection.querySelectorAll("[data-care-day-step]");
  if (!steps.length) return;
  const rect = careDaySection.getBoundingClientRect();
  updateCareDayPin(rect);
  const scrollable = Math.max(1, careDaySection.offsetHeight - window.innerHeight);
  const sectionTop = window.scrollY + rect.top;
  const progress = Math.max(0, Math.min(1, (window.scrollY - sectionTop) / scrollable));
  const nextIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  careDaySection.style.setProperty("--care-day-progress", `${progress * 100}%`);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    careDaySection.style.setProperty("--care-day-parallax", `${Math.round((progress - .5) * -28)}px`);
  }
  setCareDayActive(nextIndex);
  if (isCareDayMobile()) {
    careDayLastPageScrollAt = performance.now();
    scrollCareDayRailTo(nextIndex, "auto", false);
    return;
  }
}

function initCareDayScroll() {
  if (!careDaySection) return;
  const markers = [...careDaySection.querySelectorAll("[data-care-day-marker]")];
  const steps = [...careDaySection.querySelectorAll("[data-care-day-step]")];
  const rail = careDaySection.querySelector(".care-day-steps");
  markers.forEach((marker, index) => {
    marker.addEventListener("click", () => {
      const targetIndex = Math.max(0, Math.min(Number(marker.dataset.careDayMarker || index), steps.length - 1));
      setCareDayActive(targetIndex);
      if (isCareDayMobile()) {
        scrollCareDayRailTo(targetIndex);
        const rect = careDaySection.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const scrollable = Math.max(1, careDaySection.offsetHeight - window.innerHeight);
        const targetY = sectionTop + scrollable * (targetIndex / Math.max(1, steps.length - 1));
        window.scrollTo({ top: targetY, behavior: "smooth" });
        return;
      }
      if (window.innerWidth <= 1180) {
        steps[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const rect = careDaySection.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrollable = Math.max(1, careDaySection.offsetHeight - window.innerHeight);
      const targetY = sectionTop + scrollable * (targetIndex / Math.max(1, steps.length - 1));
      window.scrollTo({ top: targetY, behavior: "smooth" });
    });
  });
  rail?.addEventListener("scroll", () => {
    if (!isCareDayMobile() || careDayRailProgrammatic) return;
    if (performance.now() - careDayLastPageScrollAt < 420) return;
    window.cancelAnimationFrame(careDayRailFrame);
    careDayRailFrame = window.requestAnimationFrame(syncCareDayFromMobileRail);
  }, { passive: true });
  updateCareDayScroll();
}

menuToggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open");
  document.body.classList.toggle("nav-open", Boolean(open));
  menuToggle.setAttribute("aria-expanded", String(Boolean(open)));
  menuToggle.setAttribute("aria-label", open ? "關閉主選單" : "開啟主選單");
  if (!open) {
    navGroups.forEach((group) => {
      group.classList.remove("open");
      group.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false");
    });
  }
});

bindNavigationDropdowns();

bindLocationControls();

document.querySelector("#wanhuaTabs")?.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-location-tab]");
  if (tab) updateLocation(tab.dataset.locationTab);
});

document.querySelectorAll("[data-news-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.newsTab;
    document.querySelectorAll("[data-news-tab]").forEach((item) => item.classList.toggle("active", item === tab));
    document.querySelectorAll("[data-news-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.newsPanel === key);
    });
  });
});

function openCourseSignup(courseTitle = "", courseId = "") {
  const modal = document.querySelector("#courseSignupModal");
  const form = document.querySelector("#courseSignupForm");
  const titleInput = document.querySelector("#courseSignupTitle");
  const idInput = document.querySelector("#courseSignupId");
  const status = document.querySelector("#courseSignupStatus");
  if (!modal || !form || !titleInput || !status) return;

  form.reset();
  titleInput.value = courseTitle;
  if (idInput) idInput.value = courseId;
  status.textContent = "";
  modal.hidden = false;
  document.body.classList.add("modal-open");
  form.querySelector("input[name='姓名']")?.focus();
}

function closeCourseSignup() {
  const modal = document.querySelector("#courseSignupModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function openRecruitApply(dataset = {}) {
  const modal = document.querySelector("#recruitApplyModal");
  const form = document.querySelector("#recruitApplyForm");
  const status = document.querySelector("#recruitApplyStatus");
  if (!modal || !form) return;

  form.reset();
  form.dataset.formType = dataset.formType || "recruiting";
  const setValue = (id, value = "") => {
    const input = document.querySelector(id);
    if (input) input.value = value;
  };
  setValue("#recruitApplyTitle", dataset.openingTitle || "");
  setValue("#recruitApplyPage", dataset.pageSlug || "");
  setValue("#recruitApplyDepartmentId", dataset.departmentId || "");
  setValue("#recruitApplyDepartmentTitle", dataset.departmentTitle || "");
  setValue("#recruitApplyOpeningId", dataset.openingId || "");
  setValue("#recruitApplyOpeningSlug", dataset.openingSlug || "");
  setValue("#recruitApplyOpeningTitle", dataset.openingTitle || "");
  const context = document.querySelector("#recruitApplyContext");
  if (context) context.textContent = dataset.openingTitle || "職缺申請";
  if (status) status.textContent = "";
  modal.hidden = false;
  document.body.classList.add("modal-open");
  form.querySelector("input[name='姓名']")?.focus();
}

function closeRecruitApply() {
  const modal = document.querySelector("#recruitApplyModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function updateMilestoneProgress() {
  const journey = document.querySelector(".milestone-journey");
  const progress = document.querySelector(".milestone-rail-progress");
  const cards = [...document.querySelectorAll("[data-milestone-card]")];
  if (!journey || !progress || !cards.length) return;

  const rect = journey.getBoundingClientRect();
  const viewportAnchor = window.innerHeight * 0.52;
  const total = Math.max(rect.height - window.innerHeight * 0.45, 1);
  const current = Math.min(Math.max(viewportAnchor - rect.top, 0), total);
  progress.style.height = `${(current / total) * 100}%`;

  let activeCard = cards[0];
  let activeDistance = Number.POSITIVE_INFINITY;
  cards.forEach((card) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.top + cardRect.height / 2;
    const distance = Math.abs(cardCenter - viewportAnchor);
    if (distance < activeDistance) {
      activeDistance = distance;
      activeCard = card;
    }
  });

  cards.forEach((card) => card.classList.toggle("active", card === activeCard));
}

function initMilestonePage() {
  updateMilestoneProgress();
  window.requestAnimationFrame(updateMilestoneProgress);
}

function updateScrollProgress() {
  const bar = document.querySelector(".scroll-progress-bar");
  if (!bar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(scrollTop / scrollable, 0), 1);
  bar.style.transform = `scaleX(${progress})`;
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (link) {
    const href = link.getAttribute("href") || "";
    const label = link.textContent.trim().slice(0, 80) || href;
    const normalizedRouteHref = normalizePublicHref(href);
    if (handleContactAnchorClick(link)) {
      event.preventDefault();
      trackAnalyticsEvent("cta_click", { label, targetUrl: href });
      return;
    }
    if (href.startsWith("#") && normalizedRouteHref.startsWith("/") && !link.target) {
      event.preventDefault();
      navigateToPublicHref(normalizedRouteHref);
      return;
    }
    if (href.startsWith("tel:")) {
      trackAnalyticsEvent("phone_click", { label, targetUrl: href });
    } else if (href.startsWith("mailto:")) {
      trackAnalyticsEvent("email_click", { label, targetUrl: href });
    } else if (/lin\.ee|line\.me/i.test(href)) {
      trackAnalyticsEvent("line_click", { label, targetUrl: href });
    } else if (/google\.[^/]+\/maps|maps\.app\.goo\.gl/i.test(href)) {
      trackAnalyticsEvent("google_maps_click", { label, targetUrl: href });
    } else if (/\.pdf($|\?)/i.test(href) || /下載|download/i.test(label)) {
      trackAnalyticsEvent("pdf_download", { label, targetUrl: href });
    } else if (/預約參觀|預約|申請|聯絡|諮詢|應徵|官方 LINE/i.test(label)) {
      trackAnalyticsEvent("cta_click", { label, targetUrl: href });
    }
  }

  const recruitButton = event.target.closest("[data-recruit-apply]");
  if (recruitButton) {
    event.preventDefault();
    event.stopPropagation();
    trackAnalyticsEvent("reservation_click", {
      label: recruitButton.dataset.openingTitle || recruitButton.textContent.trim(),
      targetUrl: location.hash || "/talent"
    });
    openRecruitApply(recruitButton.dataset);
    return;
  }

  if (event.target.closest("[data-recruit-close]") || event.target.id === "recruitApplyModal") {
    closeRecruitApply();
    return;
  }

  const registerButton = event.target.closest(".course-register");
  if (registerButton) {
    event.preventDefault();
    event.stopPropagation();
    if (registerButton.disabled) return;
    trackAnalyticsEvent("reservation_click", {
      label: registerButton.dataset.courseTitle || registerButton.textContent.trim(),
      targetUrl: "#courses"
    });
    openCourseSignup(
      registerButton.dataset.courseTitle || registerButton.closest("[data-course-title]")?.dataset.courseTitle || "",
      registerButton.dataset.courseId || registerButton.closest("[data-course-id]")?.dataset.courseId || ""
    );
    return;
  }

  const courseCard = event.target.closest(".course-card, .featured-course-card");
  if (courseCard && !event.target.closest("a, button, input, select, textarea")) {
    event.preventDefault();
    if (courseCard.dataset.courseOpen === "false") return;
    openCourseSignup(courseCard.dataset.courseTitle || courseCard.querySelector("h3")?.textContent || "", courseCard.dataset.courseId || "");
    return;
  }

  if (event.target.closest("[data-course-close]") || event.target.id === "courseSignupModal") {
    closeCourseSignup();
    return;
  }

  const contactNeedLink = event.target.closest("[data-contact-need]");
  if (contactNeedLink) {
    window.setTimeout(() => {
      applyContactPreset(contactNeedLink);
    }, 120);
  }
});

document.addEventListener("submit", async (event) => {
  const recruitForm = event.target.closest("#recruitApplyForm");
  if (recruitForm) {
    event.preventDefault();
    const status = document.querySelector("#recruitApplyStatus");
    const submitButton = recruitForm.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    if (status) status.textContent = "正在送出資料...";

    try {
      const result = await sendBackendForm(recruitForm, recruitForm.dataset.formType || "recruiting");
      trackAnalyticsEvent("form_submit", {
        label: recruitForm.dataset.formType || "招募應徵",
        targetUrl: "generalaffairs@suiyuecare.com",
        metadata: { form_id: "recruitApplyForm", email_sent: Boolean(result.emailSent) }
      });
      if (status) {
        status.textContent = result.emailSent
          ? "已送出，我們會在 1 個工作天內與你聯繫。"
          : "資料已送出並留存在系統，窗口會依紀錄安排後續聯繫。";
      }
      window.setTimeout(closeRecruitApply, 1400);
    } catch (error) {
      console.warn("Recruiting apply failed.", error);
      trackFrontendError("recruit_apply_failed", { message: error.message, stack: error.stack });
      if (status) status.textContent = error.message || "送出失敗，請稍後再試。";
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
    return;
  }

  const form = event.target.closest("#courseSignupForm");
  if (!form) return;

  event.preventDefault();
  const status = document.querySelector("#courseSignupStatus");
  const submitButton = form.querySelector("button[type='submit']");
  if (!status || !submitButton) return;

  submitButton.disabled = true;
  status.textContent = "正在送出報名資訊...";

  let result;
  try {
    result = await sendBackendForm(form, "course_signup");
    trackAnalyticsEvent("form_submit", {
      label: "課程報名",
      targetUrl: COURSE_NOTIFY_EMAIL,
      metadata: { form_id: "courseSignupForm", email_sent: Boolean(result.emailSent) }
    });
  } catch (error) {
    console.warn("Course signup failed.", error);
    trackFrontendError("course_signup_failed", { message: error.message, stack: error.stack });
    status.textContent = error.message || "送出失敗，請稍後再試。";
    submitButton.disabled = false;
    return;
  }

  let seconds = 2;
  status.textContent = result.emailSent
    ? `報名資訊已寄出，${seconds} 秒後前往 LINE@。`
    : `報名資訊已送出並留存在系統，${seconds} 秒後前往 LINE@。`;
  const countdown = window.setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      window.clearInterval(countdown);
      trackAnalyticsEvent("join_line_click", { label: "課程報名完成後前往 LINE@", targetUrl: COURSE_LINE_URL });
      window.location.assign(COURSE_LINE_URL);
    } else {
      status.textContent = result.emailSent
        ? `報名資訊已寄出，${seconds} 秒後前往 LINE@。`
        : `報名資訊已送出並留存在系統，${seconds} 秒後前往 LINE@。`;
    }
  }, 1000);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form");
  if (!form || form.id === "courseSignupForm" || form.classList.contains("health-search")) return;
  if (form.classList.contains("contact-form")) {
    event.preventDefault();
    const formType = contactFormType(form);
    const formTypeInput = form.querySelector('input[name="form_type"]');
    if (formTypeInput) formTypeInput.value = formType;
    const submitButton = form.querySelector("button[type='submit']");
    const originalText = submitButton?.textContent || "送出諮詢";
    setContactFormStatus(form, "正在送出資料，請稍候...", "loading");
    submitButton?.setAttribute("disabled", "true");
    if (submitButton) submitButton.textContent = "送出中...";
    sendBackendForm(form, formType).then((result) => {
      trackAnalyticsEvent("form_submit", {
        label: `聯絡我們｜${formType}`,
        targetUrl: form.action || location.href,
        metadata: { form_class: "contact-form", form_type: formType, email_sent: Boolean(result.emailSent) }
      });
      form.reset();
      setContactFormStatus(
        form,
        result.emailSent
          ? "已收到你的需求，我們會依照填寫內容安排合適窗口，原則上 1 個工作天內主動聯繫。"
          : "資料已送出並留存在系統，窗口會依紀錄安排後續聯繫。",
        result.emailSent ? "success" : "warning"
      );
      if (submitButton) {
        submitButton.textContent = result.emailSent
          ? "已送出，1 個工作天內聯絡"
          : "已送出，系統已紀錄";
      }
      window.setTimeout(() => {
        if (submitButton) {
          submitButton.textContent = originalText;
          submitButton.removeAttribute("disabled");
        }
      }, 3200);
    }).catch((error) => {
      console.warn("Contact form failed.", error);
      trackFrontendError("contact_form_failed", { message: error.message, stack: error.stack });
      setContactFormStatus(form, error.message || "送出失敗，請稍後再試，或直接透過電話、LINE 聯繫我們。", "error");
      if (submitButton) {
        submitButton.textContent = originalText;
        submitButton.removeAttribute("disabled");
      }
    });
    return;
  }
  trackAnalyticsEvent("form_submit", {
    label: form.getAttribute("aria-label") || form.id || form.className || "前台表單",
    targetUrl: form.action || location.href,
    metadata: { form_id: form.id || null, form_class: form.className || null }
  });
}, true);

function activateCareerTab(tabName, options = {}) {
  const buttons = [...document.querySelectorAll("[data-career-tab]")];
  const panels = [...document.querySelectorAll("[data-career-panel]")];
  if (!buttons.length || !panels.length) return;
  buttons.forEach((button) => {
    const isActive = button.dataset.careerTab === tabName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("tabindex", isActive ? "0" : "-1");
    if (isActive && options.focus) button.focus({ preventScroll: true });
  });
  panels.forEach((panel) => {
    const isActive = panel.dataset.careerPanel === tabName;
    panel.classList.toggle("active", isActive);
    if (isActive) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  });
  requestAnimationFrame(updateTalentJobDetailPosition);
  if (tabName === "benefits") {
    const benefitPanel = panels.find((panel) => panel.dataset.careerPanel === "benefits");
    import("./src/lib/talentBenefitExplorer.js").then(({ hydrateTalentBenefitIcons }) => hydrateTalentBenefitIcons(benefitPanel));
  }
}

function selectTalentJob(board, jobId, options = {}) {
  if (!board) return;
  const cards = [...board.querySelectorAll("[data-talent-job-card]")];
  const visibleCards = cards.filter((card) => !card.hidden);
  const targetCard = visibleCards.find((card) => card.dataset.jobId === jobId) || visibleCards[0];
  cards.forEach((card) => {
    const isActive = Boolean(targetCard && card === targetCard);
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  board.querySelectorAll("[data-talent-job-detail]").forEach((panel) => {
    panel.hidden = !targetCard || panel.dataset.talentJobDetail !== targetCard.dataset.jobId;
  });
  board.querySelectorAll("[data-talent-mobile-cta-item]").forEach((item) => {
    item.hidden = !targetCard || item.dataset.talentMobileCtaItem !== targetCard.dataset.jobId;
  });
  if (!targetCard) {
    delete board.dataset.activeJob;
    return;
  }
  board.dataset.activeJob = targetCard.dataset.jobId || "";
  if (options.focus) targetCard.focus({ preventScroll: true });
  if (options.scrollDetail && window.matchMedia("(min-width: 901px)").matches) {
    board.querySelector(".talent-job-detail")?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  requestAnimationFrame(updateTalentJobDetailPosition);
}

function applyTalentJobFilters(board) {
  if (!board) return;
  const department = board.querySelector('[data-talent-filter="department"]')?.value || "";
  const cards = [...board.querySelectorAll("[data-talent-job-card]")];
  let visibleCount = 0;

  cards.forEach((card) => {
    const isVisible = !department || card.dataset.talentDepartment === department;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  const countTarget = board.querySelector("[data-talent-result-count]");
  if (countTarget) countTarget.textContent = String(visibleCount);
  const emptyState = board.querySelector("[data-talent-empty]");
  if (emptyState) emptyState.hidden = visibleCount > 0;
  board.classList.toggle("has-no-results", visibleCount === 0);

  const selectedDepartment = board.querySelector('[data-talent-filter="department"]')?.value || "";
  board.querySelectorAll('[data-talent-chip="department"]').forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.value === selectedDepartment);
  });

  const activeCard = cards.find((card) => card.dataset.jobId === board.dataset.activeJob);
  if (!activeCard || activeCard.hidden) {
    selectTalentJob(board);
  } else {
    selectTalentJob(board, activeCard.dataset.jobId);
  }
  requestAnimationFrame(updateTalentJobDetailPosition);
}

function resetTalentJobFilters(board) {
  if (!board) return;
  board.querySelectorAll("[data-talent-filter]").forEach((filter) => {
    filter.value = "";
  });
  applyTalentJobFilters(board);
}

function clearTalentJobDetailFixedState(board) {
  board.classList.remove("is-detail-fixed");
  board.classList.remove("is-detail-docked");
  board.style.removeProperty("--talent-detail-left");
  board.style.removeProperty("--talent-detail-width");
  board.style.removeProperty("--talent-detail-top");
}

function getTalentStickyTopOffset(extraGap = 18) {
  const cssHeaderHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 86;
  const headerRect = document.querySelector(".site-header")?.getBoundingClientRect();
  const visibleHeaderBottom = headerRect ? Math.max(0, headerRect.bottom) : 0;
  return Math.round(Math.max(cssHeaderHeight, visibleHeaderBottom) + extraGap);
}

function updateTalentJobDetailPosition() {
  const isDesktop = window.matchMedia("(min-width: 901px)").matches;
  document.querySelectorAll("[data-talent-job-board]").forEach((board) => {
    const slot = board.querySelector(".talent-job-detail-slot");
    const detail = board.querySelector(".talent-job-detail");
    const layout = board.querySelector(".talent-job-layout");
    if (!slot || !detail || !layout || !isDesktop || !board.getClientRects().length) {
      clearTalentJobDetailFixedState(board);
      return;
    }
    const topOffset = getTalentStickyTopOffset();
    const bottomGap = 18;
    const layoutRect = layout.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const detailHeight = detail.getBoundingClientRect().height;
    const hasEnteredJobLayout = layoutRect.top <= topOffset;
    const canPin = hasEnteredJobLayout && layoutRect.bottom > topOffset + detailHeight + bottomGap && slotRect.width >= 320;
    const shouldDock = hasEnteredJobLayout && layoutRect.bottom > topOffset + bottomGap && slotRect.width >= 320;
    if (canPin) {
      board.style.setProperty("--talent-detail-left", `${Math.round(slotRect.left)}px`);
      board.style.setProperty("--talent-detail-width", `${Math.round(slotRect.width)}px`);
      board.style.setProperty("--talent-detail-top", `${topOffset}px`);
      board.classList.add("is-detail-fixed");
      board.classList.remove("is-detail-docked");
      return;
    }
    if (shouldDock) {
      board.classList.remove("is-detail-fixed");
      board.classList.add("is-detail-docked");
      board.style.removeProperty("--talent-detail-left");
      board.style.removeProperty("--talent-detail-width");
      board.style.removeProperty("--talent-detail-top");
      return;
    }
    if (!canPin) {
      clearTalentJobDetailFixedState(board);
      return;
    }
  });
}

document.addEventListener("keydown", (event) => {
  const eventTarget = event.target instanceof Element ? event.target : null;
  const currentTab = eventTarget?.closest("[data-career-tab]");
  if (!currentTab) return;
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const tablist = currentTab.closest('[role="tablist"], .career-tabs');
  const tabs = [...(tablist?.querySelectorAll("[data-career-tab]") || [])];
  if (!tabs.length) return;
  const currentIndex = tabs.indexOf(currentTab);
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tabs.length - 1;
  event.preventDefault();
  const nextTab = tabs[nextIndex];
  activateCareerTab(nextTab.dataset.careerTab, { focus: true });
});

document.addEventListener("keydown", (event) => {
  const currentStation = event.target instanceof Element ? event.target.closest("[data-benefit-station]") : null;
  if (!currentStation) return;
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const explorer = currentStation.closest("[data-benefit-explorer]");
  const stations = [...(explorer?.querySelectorAll("[data-benefit-station]") || [])];
  const currentIndex = stations.indexOf(currentStation);
  if (currentIndex < 0) return;
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % stations.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + stations.length) % stations.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = stations.length - 1;
  event.preventDefault();
  import("./src/lib/talentBenefitExplorer.js").then(({ selectTalentBenefitStation }) => {
    selectTalentBenefitStation(explorer, stations[nextIndex].dataset.benefitStation, { focus: true });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const eventTarget = event.target instanceof Element ? event.target : null;
  const jobCard = eventTarget?.closest("[data-talent-job-card]");
  if (!jobCard || eventTarget?.closest("a, button, input, select, textarea")) return;
  event.preventDefault();
  selectTalentJob(jobCard.closest("[data-talent-job-board]"), jobCard.dataset.jobId, { focus: true, scrollDetail: true });
});

document.addEventListener("click", (event) => {
  const carouselButton = event.target.closest("[data-scroll-carousel]");
  if (carouselButton) {
    const carousel = document.querySelector(carouselButton.dataset.scrollCarousel || "");
    if (!carousel) return;
    const direction = Number(carouselButton.dataset.scrollDirection || 1);
    const firstCard = carousel.querySelector("article, a, .featured-course-card");
    const cardWidth = firstCard?.getBoundingClientRect().width || carousel.clientWidth * 0.8;
    const gap = parseFloat(getComputedStyle(carousel).columnGap || getComputedStyle(carousel).gap || "16") || 16;
    carousel.scrollBy({
      left: direction * Math.max(cardWidth + gap, carousel.clientWidth * 0.72),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
    return;
  }

  const talentClearFilters = event.target.closest("[data-talent-clear-filters]");
  if (talentClearFilters) {
    resetTalentJobFilters(talentClearFilters.closest("[data-talent-job-board]"));
    return;
  }

  const talentChip = event.target.closest("[data-talent-chip]");
  if (talentChip) {
    const board = talentChip.closest("[data-talent-job-board]");
    const filterName = talentChip.dataset.talentChip || "";
    const filter = [...(board?.querySelectorAll("[data-talent-filter]") || [])].find((item) => item.dataset.talentFilter === filterName);
    if (filter) filter.value = talentChip.dataset.value || "";
    applyTalentJobFilters(board);
    return;
  }

  const benefitStation = event.target.closest("[data-benefit-station]");
  if (benefitStation) {
    import("./src/lib/talentBenefitExplorer.js").then(({ selectTalentBenefitStation }) => {
      selectTalentBenefitStation(benefitStation.closest("[data-benefit-explorer]"), benefitStation.dataset.benefitStation);
    });
    return;
  }

  const talentJobCard = event.target.closest("[data-talent-job-card]");
  if (talentJobCard && !event.target.closest("a, button, input, select, textarea")) {
    selectTalentJob(talentJobCard.closest("[data-talent-job-board]"), talentJobCard.dataset.jobId, { scrollDetail: true });
    return;
  }

  const careerJump = event.target.closest("[data-career-jump-tab]");
  if (careerJump) {
    const targetTab = careerJump.dataset.careerJumpTab;
    activateCareerTab(targetTab);
    const targetSelector = careerJump.dataset.careerJumpTarget;
    if (targetSelector) {
      requestAnimationFrame(() => {
        document.querySelector(targetSelector)?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
    }
    return;
  }

  const careerTab = event.target.closest("[data-career-tab]");
  if (careerTab) {
    activateCareerTab(careerTab.dataset.careerTab);
    return;
  }

  const irTab = event.target.closest("[data-ir-tab]");
  if (irTab) {
    const tabName = irTab.dataset.irTab;
    document.querySelectorAll("[data-ir-tab]").forEach((button) => {
      button.classList.toggle("active", button === irTab);
    });
    document.querySelectorAll("[data-ir-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.irPanel === tabName);
    });
    return;
  }

  const investorTab = event.target.closest("[data-investor-tab]");
  if (investorTab) {
    const tabName = investorTab.dataset.investorTab;
    document.querySelectorAll("[data-investor-tab]").forEach((button) => {
      button.classList.toggle("active", button === investorTab);
    });
    document.querySelectorAll("[data-investor-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.investorPanel === tabName);
    });
    return;
  }

  const routeButton = event.target.closest("button[data-href]");
  if (routeButton && !routeButton.disabled) {
    event.preventDefault();
    navigateToPublicHref(routeButton.dataset.href);
    return;
  }

  const card = event.target.closest(".click-card, .health-preview, .celebrity-slider article");
  if (!card || event.target.closest("a, button, input, select, textarea")) return;
  const href = card.dataset.href || card.querySelector("a[href]")?.getAttribute("href");
  if (href) navigateToPublicHref(href);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".click-card");
  if (!card || event.target.closest("a, button, input, select, textarea")) return;
  event.preventDefault();
  const href = card.dataset.href;
  if (href) navigateToPublicHref(href);
});

document.addEventListener("submit", (event) => {
  const courseSearch = event.target.closest(".course-search");
  if (courseSearch) {
    event.preventDefault();
    const formData = new FormData(courseSearch);
    const keyword = String(formData.get("course_query") || "").trim().toLowerCase();
    const locationFilter = String(formData.get("course_location") || "").trim();
    const cards = document.querySelectorAll("[data-course-search-text]");
    cards.forEach((card) => {
      const text = String(card.dataset.courseSearchText || "").toLowerCase();
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesLocation = !locationFilter || text.includes(locationFilter.toLowerCase());
      card.hidden = !(matchesKeyword && matchesLocation);
    });
    return;
  }

  const form = event.target.closest(".health-search");
  if (!form) return;
  event.preventDefault();
  const formData = new FormData(form);
  const query = String(formData.get("q") || "").trim();
  navigateToPublicHref(`/search?q=${encodeURIComponent(query)}`);
});

const sceneImages = document.querySelectorAll(".scene-carousel img");
const sceneCopies = document.querySelectorAll(".scene-carousel .scene-copy");
if (sceneImages.length > 1) {
  let sceneIndex = 0;
  window.setInterval(() => {
    sceneImages[sceneIndex].classList.remove("active");
    sceneCopies[sceneIndex]?.classList.remove("active");
    sceneIndex = (sceneIndex + 1) % sceneImages.length;
    sceneImages[sceneIndex].classList.add("active");
    sceneCopies[sceneIndex]?.classList.add("active");
  }, 3600);
}

window.addEventListener("hashchange", () => {
  if (routeSlugFromPath() !== "home" && scrollToCurrentPageAnchor()) return;
  renderPage(routeSlugFromLocation());
});
window.addEventListener("scroll", () => {
  updateMilestoneProgress();
  updateCareDayScroll();
  updateScrollProgress();
  updateTalentJobDetailPosition();
}, { passive: true });
window.addEventListener("error", (event) => {
  trackFrontendError("window_error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});
window.addEventListener("unhandledrejection", (event) => {
  trackFrontendError("unhandled_rejection", {
    message: event.reason?.message || event.reason,
    stack: event.reason?.stack
  });
});
window.addEventListener("resize", () => {
  updateMilestoneProgress();
  updateCareDayScroll();
  updateScrollProgress();
  updateTalentJobDetailPosition();
});
window.addEventListener("pagehide", flushPageEngagement);
initCareDayScroll();
updateScrollProgress();
optimizeImageLoading(document);
renderPage(routeSlugFromLocation());
requestAnimationFrame(updateTalentJobDetailPosition);
renderHomeHealthArticles();
document.documentElement.dataset.appReady = "true";
window.requestAnimationFrame(() => scrollToCurrentPageAnchor());
loadSupabaseSiteSettings();
loadSupabasePageContent("home");
loadSupabaseHomeModules().then((loaded) => {
  if (!loaded) loadWordPressContent();
  loadSupabaseStoryDatabases();
});

function removeIntroLoader() {
  try {
    sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, "true");
    document.documentElement.dataset.introSeen = "true";
  } catch {
    document.documentElement.dataset.introSeen = "unavailable";
  }
  introLoader?.remove();
}

if (document.documentElement.dataset.introMode !== "play" || document.documentElement.dataset.introSeen === "true") {
  removeIntroLoader();
} else {
  introLoader?.addEventListener("animationend", (event) => {
    if (event.animationName === "intro-out") removeIntroLoader();
  });
  window.setTimeout(removeIntroLoader, 1900);
}
