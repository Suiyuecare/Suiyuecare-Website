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
    intro: "長照內容農場，提供家屬照顧知識、疾病照護、復能觀念、營養衛教與長照政策整理。",
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
    eyebrow: "Contact",
    title: "聯絡我們",
    intro: "不論是服務諮詢、課程報名、場地合作、人才加入或投資洽談，都可以從這裡開始。",
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
const COURSE_NOTIFY_EMAIL = "edu.control@suiyuecare.com";
const COURSE_LINE_URL = "https://lin.ee/oaPkGiq";
let siteSettings = {};
let siteSettingsLoaded = false;
let siteSettingsPromise = null;

const SITE_ORIGIN = "https://suiyuecare.com";
const DEFAULT_SEO = {
  title: "歲悅長照集團｜Suiyuecare Corps.",
  description: "歲悅長照集團整合居家照顧、日間照顧、社區據點、護理復能、移工培訓與教育品管，讓照顧變成家人看得懂、也放得下心的日常系統。",
  image: "assets/hero-care.png",
  imageAlt: "歲悅長照照顧服務形象照",
  type: "website"
};

const routeSeoMap = {
  home: DEFAULT_SEO,
  about: {
    title: "關於歲悅｜歲悅長照集團",
    description: "認識歲悅長照集團的品牌理念、照顧系統、服務網絡與專業團隊。"
  },
  milestones: {
    title: "大事記｜歲悅長照集團",
    description: "查看歲悅長照集團的重要里程碑、服務擴張、據點成立與合作紀錄。"
  },
  "home-care": {
    title: "居家照顧｜歲悅長照集團",
    description: "歲悅居家照顧提供到宅照顧、生活協助、家屬溝通與服務紀錄，支持長輩在家安心生活。"
  },
  "day-care": {
    title: "日間照顧｜歲悅長照集團",
    description: "歲悅日間照顧以活動設計、餐食、復能與社交支持，降低家庭照顧壓力。"
  },
  community: {
    title: "社區據點｜歲悅長照集團",
    description: "歲悅社區據點提供健康促進、共餐活動、預防延緩失能與在地照顧支持。"
  },
  nursing: {
    title: "護理復能｜歲悅長照集團",
    description: "結合護理評估、復能目標與健康監測，協助長輩恢復生活能力並降低照顧風險。"
  },
  "migrant-training": {
    title: "移工培訓｜歲悅長照集團",
    description: "歲悅移工培訓提供照顧技能、家庭溝通、衛教與安全實作訓練，提升家庭照顧品質。"
  },
  quality: {
    title: "教育品管｜歲悅長照集團",
    description: "歲悅教育品管以標準化教材、督導制度、服務稽核與持續改善守住照顧品質。"
  },
  software: {
    title: "軟體系統｜歲悅長照集團",
    description: "歲悅提供可客製化軟體系統，包含會計、人資、電子公文交換、專案管理、PDF 工具，以及居家與日照業務系統。"
  },
  talent: {
    title: "人才招募｜歲悅長照集團",
    description: "加入歲悅長照團隊，探索照顧服務員、督導、日照、教學品管與行政職涯機會。"
  },
  land: {
    title: "土地招募｜歲悅長照集團",
    description: "歲悅尋找適合日照、社區據點與複合式長照服務的土地或空間合作機會。"
  },
  "investor-recruiting": {
    title: "投資人招募｜歲悅長照集團",
    description: "了解歲悅長照集團的展店模型、產業策略與投資合作機會。"
  },
  health: {
    title: "健康3.0｜歲悅長照照顧知識",
    description: "健康3.0整理長照申請、居家照顧、日照、復能、營養、失智與家屬支持文章。"
  },
  search: {
    title: "搜尋照顧知識｜健康3.0",
    description: "搜尋歲悅健康3.0照顧知識文章、影音與照顧指南。",
    robots: "noindex, follow"
  },
  courses: {
    title: "課程報名｜歲悅長照集團",
    description: "查看歲悅照顧課程、移工培訓、家屬課程與專業研習，線上送出報名資訊。"
  },
  investors: {
    title: "投資人專區｜歲悅長照集團",
    description: "歲悅投資人專區提供最新動態、營運進度、財務資訊、公司治理與股東專區資料。"
  },
  "ir-finance": {
    title: "財務資訊｜歲悅長照投資人專區",
    description: "查看歲悅長照每月營收、財務分析、季度財報、年報與可下載文件。"
  },
  "ir-governance": {
    title: "公司治理｜歲悅長照投資人專區",
    description: "查看歲悅長照重要訊息、治理運作、管理階層、稽核、風險管理與誠信經營。"
  },
  "ir-shareholders": {
    title: "股東專區｜歲悅長照投資人專區",
    description: "查看歲悅長照股務資訊、股東會、法說會、常見問答與股東文件下載。"
  },
  contact: {
    title: "聯絡我們｜歲悅長照集團",
    description: "聯絡歲悅長照集團，預約服務諮詢、課程合作、招募合作、投資洽談或一般客服。"
  }
};

function absoluteSiteUrl(path = "") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path || "").startsWith("/") ? path : `/${path || ""}`;
  return `${SITE_ORIGIN}${normalized}`;
}

function routeCanonical(slug = "home") {
  const normalized = slug && slug !== "home" ? `/#${slug}` : "/";
  return absoluteSiteUrl(normalized);
}

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

const articlePages = {
  "longterm-care-apply": {
    category: "Health 3.0",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    dek: "從需求盤點、照顧計畫、政府補助到服務媒合，用一篇文章把流程講清楚。",
    image: "assets/homepage-batch/10-family-consultation.png",
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
    image: "assets/homepage-batch/01-care-home-greeting.png",
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
    image: "assets/homepage-batch/10-family-consultation.png",
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
    image: "assets/homepage-batch/18-health-fall-prevention-cover.png",
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
    image: "assets/homepage-batch/17-health-nutrition-cover.png",
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
    image: "assets/homepage-batch/19-health-dementia-cover.png",
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
    image: "assets/homepage-batch/20-health-caregiver-stress-cover.png",
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
    image: "assets/homepage-batch/12-community-health-class.png",
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
    image: "assets/homepage-batch/02-daycare-group-exercise.png",
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
    image: "assets/homepage-batch/13-rehab-walking-practice.png",
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
    image: "assets/homepage-batch/14-care-notes.png",
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
    image: "assets/homepage-batch/08-orange-apron-walking.png",
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

const relatedArticleCards = [
  {
    href: "#article-longterm-care-apply",
    category: "Health 3.0",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    image: "assets/homepage-batch/10-family-consultation.png"
  },
  {
    href: "#article-family-care-story",
    category: "Care Stories",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    image: "assets/homepage-batch/01-care-home-greeting.png"
  },
  {
    href: "#article-master-talk-care-psychology",
    category: "Master Talk",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    image: "assets/homepage-batch/10-family-consultation.png"
  },
  {
    href: "#article-safe-transfer-tips",
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    image: "assets/homepage-batch/18-health-fall-prevention-cover.png"
  },
  {
    href: "#article-nutrition-warning",
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    image: "assets/homepage-batch/17-health-nutrition-cover.png"
  },
  {
    href: "#article-dementia-response",
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    image: "assets/homepage-batch/19-health-dementia-cover.png"
  },
  {
    href: "#article-caregiver-support",
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover.png"
  },
  {
    href: "#article-family-care-course",
    category: "課程報名",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    image: "assets/homepage-batch/12-community-health-class.png"
  }
];

const healthArticles = [
  {
    href: "#article-longterm-care-apply",
    category: "長照申請",
    title: "第一次申請長照服務，家人需要先準備什麼？",
    excerpt: "從需求盤點、照顧計畫、政府補助到服務媒合，用一篇文章把流程講清楚。",
    image: "assets/homepage-batch/10-family-consultation.png",
    author: "歲悅照顧編輯部",
    date: "2026.05.13",
    keywords: "長照申請 家庭照顧 服務媒合 居家照顧"
  },
  {
    href: "#article-family-care-story",
    category: "家屬故事",
    title: "爸爸出院後，我終於知道每天該注意什麼。",
    excerpt: "每日回報、照顧紀錄與督導追蹤，讓出院返家的照顧不再只能靠家人猜。",
    image: "assets/homepage-batch/01-care-home-greeting.png",
    author: "林小姐｜居家照顧",
    date: "2026.05.13",
    keywords: "出院返家 居家照顧 家屬回饋 照顧紀錄"
  },
  {
    href: "#article-master-talk-care-psychology",
    category: "專家專欄",
    title: "好的照顧，是讓長輩和家屬都保有生活感。",
    excerpt: "照顧心理講師談家庭照顧中的焦慮、溝通與支持系統。",
    image: "assets/homepage-batch/10-family-consultation.png",
    author: "照顧心理講師 周小姐",
    date: "2026.05.13",
    keywords: "名人講堂 照顧心理 家屬支持"
  },
  {
    href: "#article-safe-transfer-tips",
    category: "照顧技巧",
    title: "協助長輩安全起身的三個提醒",
    excerpt: "從床邊高度、手部支撐到起身節奏，降低跌倒與拉傷風險。",
    image: "assets/homepage-batch/18-health-fall-prevention-cover.png",
    author: "歲悅復能團隊",
    date: "2026.05.10",
    keywords: "跌倒 起身 移位 復能"
  },
  {
    href: "#article-nutrition-warning",
    category: "飲食營養",
    title: "吃得少不是正常老化，家人該先看哪些訊號？",
    excerpt: "從體重、食慾、肌力與精神狀態，快速判斷是否需要營養或醫療協助。",
    image: "assets/homepage-batch/17-health-nutrition-cover.png",
    author: "歲悅營養照顧小組",
    date: "2026.05.08",
    keywords: "營養 飲食 肌力 食慾 體重"
  },
  {
    href: "#article-dementia-response",
    category: "失智照顧",
    title: "重複提問怎麼回應，才不會讓彼此更焦慮？",
    excerpt: "理解長輩不安背後的需求，用更穩定的語句降低照顧衝突。",
    image: "assets/homepage-batch/19-health-dementia-cover.png",
    author: "歲悅照顧編輯部",
    date: "2026.05.06",
    keywords: "失智 重複提問 溝通 情緒"
  },
  {
    href: "#article-caregiver-support",
    category: "家屬支持",
    title: "照顧者快撐不住時，可以先做的三件事",
    excerpt: "先盤點照顧時段、找到喘息入口，讓家庭照顧可以走得更久。",
    image: "assets/homepage-batch/20-health-caregiver-stress-cover.png",
    author: "歲悅家庭支持團隊",
    date: "2026.05.02",
    keywords: "照顧者 壓力 喘息 家屬支持"
  },
  {
    href: "#article-family-care-course",
    category: "課程",
    title: "家屬照顧課：把照顧技巧變成每天用得到的方法",
    excerpt: "把移位、用餐、跌倒預防與照顧溝通整理成家人也能操作的課程。",
    image: "assets/homepage-batch/12-community-health-class.png",
    author: "歲悅教育品管",
    date: "2026.04.28",
    keywords: "課程 家屬照顧 移位 跌倒預防"
  }
];

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

function getPostImage(post, fallback = "assets/homepage-batch/02-daycare-group-exercise.png") {
  const embedded = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const acfImage = post?.acf?.image?.url || post?.acf?.avatar?.url || post?.acf?.speaker_photo?.url || post?.acf?.cover?.url;
  return acfImage || embedded || fallback;
}

function getCmsModuleImage(item, fallback = "assets/homepage-batch/02-daycare-group-exercise.png") {
  return item?.image?.public_url || item?.metadata?.image_url || fallback;
}

function normalizeLocalAssetUrl(url = "") {
  return location.protocol === "file:" ? String(url).replace(/^\/assets\//, "assets/") : url;
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
  return supabaseHealthArticles.length ? supabaseHealthArticles : healthArticles.map(normalizeStaticArticle);
}

function categorySlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHealthCategoryList() {
  if (supabaseArticleCategories.length) return supabaseArticleCategories;
  const uniqueCategories = [...new Set(healthArticles.map((article) => article.category).filter(Boolean))];
  return uniqueCategories.map((name) => ({ name, slug: categorySlug(name) }));
}

function normalizeSupabaseArticle(article, mediaById, categoriesById) {
  const categoryData = categoriesById.get(article.category_id);
  const category = categoryData?.display_label || categoryData?.name || "照顧知識";
  const slug = categoryData?.slug || categorySlug(category);
  const cover = mediaById.get(article.cover_image_id);
  const image = cover?.public_url || "assets/homepage-batch/10-family-consultation.png";
  const subtitle = article.subtitle || article.excerpt || "";
  const excerpt = article.excerpt || article.subtitle || stripHTML(article.content || "").slice(0, 88);
  const publishedAt = article.published_at || article.updated_at;
  const tagList = Array.isArray(article.tags) ? article.tags : [];
  const tags = tagList.join(" ");
  const video = getArticleVideoData(article.content_json || {});

  return {
    href: `#article-${article.slug}`,
    slug: article.slug,
    category,
    categorySlug: slug,
    categoryType: categoryData?.type || "article",
    categorySection: categoryData?.section_key || "health",
    contentType: article.content_type || article.content_json?.content_type || categoryData?.type || "article",
    title: article.title || "未命名文章",
    subtitle,
    excerpt,
    image,
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
    readingMinutes: article.reading_minutes,
    difficulty: article.difficulty || "",
    targetAudience: article.target_audience || "",
    relatedService: article.related_service || "",
    recommendedSlots: Array.isArray(article.recommended_slots) ? article.recommended_slots : [],
    summaryPoints: Array.isArray(article.summary_points) ? article.summary_points : [],
    relatedSlugs: Array.isArray(article.content_json?.related_slugs) ? article.content_json.related_slugs : [],
    ctaText: article.cta_text || article.content_json?.cta_text || "",
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
    const current = location.hash.slice(1).split("?")[0] || "home";
    if (current === "health") renderPage(location.hash.slice(1));
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
      ? supabase.from("article_categories").select("id, name, display_label, slug, type, section_key").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (mediaResult.error) throw mediaResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  const mediaById = new Map((mediaResult.data || []).map((media) => [media.id, media]));
  const categoriesById = new Map((categoriesResult.data || []).map((category) => [category.id, category]));
  return articles.map((article) => normalizeSupabaseArticle(article, mediaById, categoriesById));
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
    const current = location.hash.slice(1).split("?")[0] || "home";
    if (current === "health" || current === "search") renderPage(location.hash.slice(1));
  }
  return articles;
}

function renderMarkdownContent(content = "") {
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

function normalizeSupabaseArticlePage(article, category, cover) {
  const publishedAt = article.published_at || article.updated_at;
  const video = getArticleVideoData(article.content_json || {});
  return {
    slug: article.slug,
    category: category?.display_label || category?.name || "照顧知識",
    categorySlug: category?.slug || categorySlug(category?.name || "照顧知識"),
    title: article.title || "未命名文章",
    subtitle: article.subtitle || article.excerpt || "",
    excerpt: article.excerpt || article.subtitle || "",
    image: cover?.public_url || "assets/homepage-batch/10-family-consultation.png",
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
    summary: Array.isArray(article.summary_points) ? article.summary_points : [],
    readingMinutes: article.reading_minutes,
    difficulty: article.difficulty || "",
    targetAudience: article.target_audience || "",
    relatedService: article.related_service || "",
    ctaText: article.cta_text || article.content_json?.cta_text || "",
    ctaUrl: article.cta_url || article.content_json?.cta_url || "",
    sourceName: article.source_name || article.content_json?.source_name || "",
    sourceUrl: article.source_url || article.content_json?.source_url || "",
    faq: Array.isArray(article.faq_json) ? article.faq_json : [],
    relatedSlugs: Array.isArray(article.content_json?.related_slugs) ? article.content_json.related_slugs : [],
    content: article.content || "",
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
      element.src = url;
      if (alt) element.alt = alt;
    } else {
      element.style.backgroundImage = `url("${url}")`;
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

function applyCmsSection(section) {
  const root = findCmsSectionRoot(section.section_key);
  if (!root) return;

  const content = getSectionContent(section);
  root.__cmsContent = content;
  root.hidden = false;
  root.dataset.cmsLoaded = "true";

  setCmsText(root, "eyebrow", content.eyebrow);
  setCmsText(root, "title", section.title || content.title);
  setCmsText(root, "subtitle", content.subtitle);
  setCmsText(root, "body", section.body || content.body);

  if (content.fields && typeof content.fields === "object") {
    Object.entries(content.fields).forEach(([field, value]) => setCmsText(root, field, value));
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

  const sectionsToHide = managedSections.length
    ? managedSections.map(findCmsSectionRoot).filter(Boolean)
    : [...document.querySelectorAll("[data-cms-section]")];

  sectionsToHide.forEach((section) => {
    section.hidden = true;
    section.dataset.cmsLoaded = "false";
  });
  sections.forEach(applyCmsSection);
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
  const heroImage = pageContent.hero_image_url || sections.find((section) => getSectionContent(section).image_url)?.content_json?.image_url || "assets/hero-care.png";
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
          const image = content.image_url || content.background_image_url || "";
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
                ${content.button_href ? `<a href="${escapeHTML(content.button_href)}">${escapeHTML(content.button_text || "Read More")}</a>` : ""}
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
    if (!shouldOverride || location.hash.slice(1).split("?")[0] !== slug) return;

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
  if (field.field_type === "image") return field.image?.public_url || field.text_value || "";
  if (field.field_type === "boolean") return Boolean(field.boolean_value);
  if (field.field_type === "number") return field.number_value ?? "";
  if (field.field_type === "json") return field.json_value;
  return field.text_value || "";
}

function mapTemplateFields(fields = []) {
  return fields.reduce((map, field) => {
    const current = map[field.field_key];
    if (current?.field_type === "image" && current.image?.public_url && !field.image?.public_url) return map;
    map[field.field_key] = field;
    return map;
  }, {});
}

function getTemplateText(fieldMap, key, fallback = "") {
  const value = getTemplateFieldValue(fieldMap[key]);
  if (Array.isArray(value) || typeof value === "object") return fallback;
  return value === "" || value === null || value === undefined ? fallback : String(value);
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
  const heroImage = getTemplateText(fieldMap, "hero_image", "assets/hero-care.png");
  const primaryText = getTemplateText(fieldMap, "primary_cta_text", "預約諮詢");
  const primaryUrl = getTemplateText(fieldMap, "primary_cta_url", "#contact");
  const secondaryText = getTemplateText(fieldMap, "secondary_cta_text", "查看服務據點");
  const secondaryUrl = getTemplateText(fieldMap, "secondary_cta_url", "#network");
  const featureCards = getTemplateArray(fieldMap, "feature_cards");
  const flowCards = getTemplateArray(fieldMap, "flow_cards");
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

      ${faqItems.length ? `
        <section class="service-detail-section">
          <div class="service-section-head">
            <p class="eyebrow">${escapeHTML(getTemplateText(fieldMap, "faq_eyebrow", "FAQ"))}</p>
            <h2>${escapeHTML(getTemplateText(fieldMap, "faq_title", "常見問題"))}</h2>
            <span>${escapeHTML(getTemplateText(fieldMap, "faq_body", "管理者可在後台新增或調整常見問答內容。"))}</span>
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
    const image = getCmsItemValue(item, ["image", "image_url", "url"], "assets/homepage-batch/01-care-home-greeting.png");
    const title = getCmsItemValue(item, ["title"], "");
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
  setNodeText(root, ".service-detail-hero .service-detail-copy > p:not(.eyebrow)", body);
  setNodeText(root, ".hero-actions .primary-button", getTemplateText(fieldMap, "primary_cta_text", ""));
  setNodeHref(root, ".hero-actions .primary-button", getTemplateText(fieldMap, "primary_cta_url", ""));
  setNodeText(root, ".hero-actions .secondary-button", getTemplateText(fieldMap, "secondary_cta_text", ""));
  setNodeHref(root, ".hero-actions .secondary-button", getTemplateText(fieldMap, "secondary_cta_url", ""));
  setNodeText(root, ".service-hero-card span", getTemplateText(fieldMap, "hero_badge", ""));
  setNodeText(root, ".service-hero-card strong", getTemplateText(fieldMap, "hero_card_title", ""));
  const heroImage = getTemplateText(fieldMap, "hero_image", "");
  const heroImageNode = root.querySelector(".service-hero-card img");
  if (heroImage && heroImageNode) {
    heroImageNode.setAttribute("src", heroImage);
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
  pageView.innerHTML = fallbackHtml;
  try {
    const fields = await fetchSupabaseServiceFields(slug);
    if (location.hash.slice(1).split("?")[0] !== slug) return;
    pageView.innerHTML = applyCmsEnhancedServicePage(fallbackHtml, slug, fields);
  } catch (error) {
    console.warn(`Supabase enhanced service page unavailable for ${slug}.`, error);
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
    if (location.hash.slice(1).split("?")[0] !== slug) return true;
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

function getRecruitingImage(item, fallback = "assets/homepage-batch/04-admin-team-office.png") {
  const url = item?.image?.public_url || item?.hero_image?.public_url || item?.image_url || item?.hero_image_url || fallback;
  return normalizeRecruitingAssetUrl(url);
}

function normalizeRecruitingAssetUrl(url = "") {
  return location.protocol === "file:" ? String(url).replace(/^\/assets\//, "assets/") : url;
}

function normalizeRecruitingList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function renderRecruitingHero(page) {
  const image = getRecruitingImage(page, "assets/homepage-batch/04-admin-team-office.png");
  return `
    <section class="service-detail-hero recruiting-cms-hero ${escapeHTML(page.page_slug)}-recruiting-hero">
      <div class="service-detail-copy">
        <p class="eyebrow">${escapeHTML(page.eyebrow || "Recruiting")}</p>
        <h1>${escapeHTML(page.title || "")}</h1>
        <p>${escapeHTML(page.body || page.subtitle || "")}</p>
        <div class="hero-actions">
          <a class="primary-button" href="${escapeHTML(page.primary_cta_url || "#recruiting-openings")}">${escapeHTML(page.primary_cta_text || "查看內容")}</a>
          <a class="secondary-button" href="${escapeHTML(page.secondary_cta_url || "#contact")}">${escapeHTML(page.secondary_cta_text || "聯絡我們")}</a>
        </div>
      </div>
      <aside class="service-hero-card">
        <img src="${escapeHTML(image)}" alt="${escapeHTML(page.title || "歲悅招募")}"${imageStyleAttr({ usage: "service_hero", focalPoint: page.metadata?.focal_point || "center" })} />
        <div>
          <span>${escapeHTML(page.hero_badge || "Suiyuecare Corps.")}</span>
          <strong>${escapeHTML(page.hero_card_title || page.subtitle || page.title || "")}</strong>
        </div>
      </aside>
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
  const image = getRecruitingImage(department, "assets/recruit-home-care-worker.png");
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
            <span>這些職缺與合作卡片來自 Supabase，後台增減卡片後前台會跟著變動。</span>
          </div>
          ${renderRecruitingOpeningGrid(page, department, openings)}
        </section>
      </div>
    </section>
  `;
}

function renderRecruitingOpeningGrid(page, department, openings) {
  if (!openings.length) return `<div class="health-empty-state"><h2>目前尚未開放卡片</h2><p>請到後台新增職缺或合作項目。</p></div>`;
  return `
    <div class="homecare-role-grid recruiting-opening-grid">
      ${openings.map((opening, index) => renderRecruitingOpeningCard(page, department, opening, index)).join("")}
    </div>
  `;
}

function renderRecruitingOpeningCard(page, department, opening, index) {
  const image = getRecruitingImage(opening, getRecruitingImage(department, "assets/recruit-home-care-worker.png"));
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
  const panels = departments.map((department, index) => {
    const departmentOpenings = openings.filter((opening) => opening.department_id === department.id);
    return renderRecruitingDepartmentPanel(page, department, departmentOpenings, index);
  }).join("");
  return `
    <div class="career-page recruiting-cms-page">
      ${renderRecruitingHero(page)}
      ${renderRecruitingDepartmentTabs(departments)}
      ${panels || `<section class="service-detail-section"><div class="health-empty-state"><h2>尚未建立招募部門</h2><p>請到後台新增部門資料。</p></div></section>`}
      ${renderRecruitingApplicationModal(page)}
    </div>
  `;
}

function renderRecruitingApplicationModal(page) {
  return `
    <div class="course-signup-modal recruiting-apply-modal" id="recruitApplyModal" hidden>
      <div class="course-signup-dialog">
        <button class="course-modal-close" type="button" data-recruit-close aria-label="關閉">×</button>
        <p class="eyebrow">Apply</p>
        <h2>${escapeHTML(page.page_slug === "talent" ? "申請應徵" : "提交洽談資料")}</h2>
        <form id="recruitApplyForm">
          <label>您的大名<input name="姓名" type="text" required placeholder="請輸入姓名" /></label>
          <label>您的電話<input name="電話" type="tel" required placeholder="請輸入電話" /></label>
          <label>Email<input name="Email" type="email" required placeholder="請輸入 Email" /></label>
          <label>申請項目<input name="subject" id="recruitApplyTitle" type="text" readonly /></label>
          <label>補充說明<textarea name="說明" rows="4" placeholder="可填寫可聯絡時間、經歷、場域資料或合作想法"></textarea></label>
          <input name="recruiting_page" id="recruitApplyPage" type="hidden" />
          <input name="department_id" id="recruitApplyDepartmentId" type="hidden" />
          <input name="department_title" id="recruitApplyDepartmentTitle" type="hidden" />
          <input name="opening_id" id="recruitApplyOpeningId" type="hidden" />
          <input name="opening_slug" id="recruitApplyOpeningSlug" type="hidden" />
          <input name="opening_title" id="recruitApplyOpeningTitle" type="hidden" />
          <label class="privacy-consent"><input type="checkbox" name="privacy_consent" required />我同意歲悅長照集團為應徵、合作洽談與後續聯繫目的，使用我填寫的個人資料。</label>
          <p class="course-confirm-text">送出後，資料會寄到歲悅窗口並留存在後台表單資料。</p>
          <button class="primary-button" type="submit">確認送出</button>
          <span id="recruitApplyStatus"></span>
        </form>
      </div>
    </div>
  `;
}

async function fetchSupabaseRecruitingPage(slug) {
  if (supabaseRecruitingPageCache.has(slug)) return supabaseRecruitingPageCache.get(slug);
  const pageQuery = supabase
    .from("recruiting_pages")
    .select("*, hero_image:media!recruiting_pages_hero_image_id_fkey(id, public_url, alt_text, file_name)")
    .eq("page_slug", slug)
    .eq("is_enabled", true)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  const departmentsQuery = supabase
    .from("recruiting_departments")
    .select("*, image:media!recruiting_departments_image_id_fkey(id, public_url, alt_text, file_name)")
    .eq("page_slug", slug)
    .eq("is_enabled", true)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("sort_order", { ascending: true });

  const openingsQuery = supabase
    .from("recruiting_openings")
    .select("*, image:media!recruiting_openings_image_id_fkey(id, public_url, alt_text, file_name)")
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

  const result = { page, departments: departments || [], openings: openings || [] };
  supabaseRecruitingPageCache.set(slug, result);
  return result;
}

async function loadSupabaseRecruitingPage(slug) {
  if (!supabase || !recruitingTemplateSlugs.has(slug)) return;
  try {
    const data = await fetchSupabaseRecruitingPage(slug);
    if (!data || location.hash.slice(1).split("?")[0] !== slug) return;
    pageView.innerHTML = slug === "talent"
      ? renderRecruitingTalentPage(data.page, data.departments, data.openings)
      : renderRecruitingOpportunityPage(data.page, data.departments, data.openings);
  } catch (error) {
    console.warn(`Supabase recruiting page unavailable for ${slug}.`, error);
  }
}

const supabaseInvestorCache = new Map();

function fileHref(file) {
  if (!file) return "#contact";
  if (file.public_url) return file.public_url;
  if (file.id) return `/api/download-file?id=${encodeURIComponent(file.id)}`;
  return "#contact";
}

function hasDownloadFile(file) {
  return Boolean(file?.public_url || file?.id);
}

function renderInvestorDownloadCell(file, label = "下載") {
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
    <a href="${escapeHTML(item.link_url || fileHref(item.file) || fallbackHref)}">
      <time>${escapeHTML(item.date_label || formatArticleDate(item.published_on || item.published_at))}</time>
      <strong>${escapeHTML(item.title)}</strong>
      <p>${escapeHTML(item.summary || item.body || "")}</p>
    </a>
  `).join("");
}

function renderCmsDownloadGrid(files, emptyText = "目前暫無公開下載檔案") {
  const downloadableFiles = (files || []).filter(hasDownloadFile);
  if (!downloadableFiles.length) return `<div class="health-empty-state"><h2>${escapeHTML(emptyText)}</h2><p>相關文件將依公司公告時程更新。</p></div>`;
  return `
    <div class="download-grid">
      ${downloadableFiles.map((file) => `
        <a href="${escapeHTML(fileHref(file))}" target="${file.public_url && file.public_url.startsWith("#") ? "" : "_blank"}" rel="noopener">
          <span>${escapeHTML(file.file_type || "PDF")}</span>
          <strong>${escapeHTML(file.title)}</strong>
          <em>${escapeHTML(file.description || file.category || "下載檔案")}</em>
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
  if (!points.length) return `<div class="health-empty-state"><h2>尚未建立進度資料</h2><p>請到後台投資人資料管理新增進度圖表。</p></div>`;
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
  if (!faqs.length) return `<div class="health-empty-state"><h2>尚未建立常見問答</h2><p>請到後台投資人資料管理的頁面文案設定新增 FAQ。</p></div>`;
  return `<div class="shareholder-faq">${faqs.map((item, index) => `<details ${index === 0 ? "open" : ""}><summary>${escapeHTML(item.question || "")}</summary><p>${escapeHTML(item.answer || "")}</p></details>`).join("")}</div>`;
}

async function fetchSupabaseInvestorData(pageSlug = "investors") {
  const cacheKey = pageSlug;
  if (supabaseInvestorCache.has(cacheKey)) return supabaseInvestorCache.get(cacheKey);
  await loadSupabaseSiteSettings();

  const now = new Date().toISOString();
  const [{ data: notices, error: noticeError }, { data: financials, error: financialError }, { data: charts, error: chartError }, { data: files, error: fileError }] = await Promise.all([
    supabase
      .from("investor_notices")
      .select("*, file:downloadable_files(id, title, public_url, file_type, category)")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("sort_order", { ascending: true })
      .order("published_on", { ascending: false, nullsFirst: false }),
    supabase
      .from("investor_financial_items")
      .select("*, file:downloadable_files(id, title, public_url, file_type, category)")
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
  const result = {
    notices: notices || [],
    noticesByType: groupByKey(notices || [], "notice_type"),
    financials: financials || [],
    financialsByType: groupByKey(financials || [], "item_type"),
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
        <div class="investor-section-head"><p class="eyebrow">Expansion Progress</p><h2>機構設立進度</h2><span>這些進度資料來自後台圖表資料，可由管理者調整百分比與階段。</span></div>
        ${renderCmsChart(progressChart, { fallbackType: "progress" })}
      </section>
      <section class="investor-panel active">
        <div class="investor-section-head"><p class="eyebrow">Latest Updates</p><h2>投資人最新動態</h2><span>公告與得標紀錄由 Supabase 投資人公告資料表管理。</span></div>
        <div class="ir-updates-grid">
          <article class="ir-update-card"><div><p class="eyebrow">News</p><h3>最新消息</h3></div>${renderCmsNoticeLinks(news, "#ir-finance")}</article>
          <article class="ir-update-card"><div><p class="eyebrow">Awards</p><h3>得標紀錄</h3></div>${renderCmsNoticeLinks(awards, "#ir-governance")}</article>
        </div>
      </section>
      <section class="investor-panel active" id="investor-downloads"><div class="investor-section-head"><p class="eyebrow">Downloads</p><h2>投資人下載檔</h2><span>下載檔沿用後台檔案下載管理。</span></div>${renderCmsDownloadGrid(data.files)}</section>
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
      <section class="ir-sub-hero finance-visual"><div><a class="search-back" href="#investors">返回投資人專區</a><p class="eyebrow">${escapeHTML(config.eyebrow || "Financial Information")}</p><h1>${escapeHTML(config.title || "財務資訊")}</h1><p>${escapeHTML(config.body || "財務資料來自後台投資人資料中心，月營收、財報與下載檔可獨立更新。")}</p></div><aside class="finance-hero-chart"><span>${escapeHTML(config.snapshot_label || "Revenue Trend")}</span><strong>${escapeHTML(latest?.amount_label || config.snapshot_value || "更新中")}</strong><p>${escapeHTML(latest?.growth_label || config.snapshot_note || "最近月營收")}</p></aside></section>
      <nav class="investor-tabs ir-finance-tabs" aria-label="財務資訊分頁"><button class="active" type="button" data-ir-tab="monthly-revenue">每月營收</button><button type="button" data-ir-tab="finance-analysis">財務資訊分析</button><button type="button" data-ir-tab="quarterly-reports">季度財報</button><button type="button" data-ir-tab="annual-reports">股東會年報</button></nav>
      ${renderInvestorKpis(config.kpis || [{ label: "Monthly Revenue", value: latest?.amount_label || "--", note: "最近月營收" }, { label: "Growth", value: latest?.growth_label || "--", note: "成長率" }, { label: "Reports", value: String(quarterly.length), note: "季度財報" }, { label: "Files", value: String(data.files.length), note: "下載檔" }])}
      <section class="ir-tab-panel active" data-ir-panel="monthly-revenue"><div class="investor-section-head"><p class="eyebrow">Monthly Revenue</p><h2>每月營收</h2><span>月營收表格與圖表皆可由後台資料更新。</span></div><div class="finance-dashboard">${renderCmsChartCard(revenueChart, "wide") || `<article class="chart-card wide"><div class="chart-card-head"><span>月營收趨勢</span><strong>${escapeHTML(latest?.amount_label || "--")}</strong></div>${renderCmsBarChart([])}</article>`}${renderCmsChartCard(serviceMix) || `<article class="chart-card"><div class="chart-card-head"><span>服務收入組成</span><strong>100%</strong></div>${renderCmsDonutChart([], "Revenue")}</article>`}</div><div class="investor-table-card"><div class="table-title"><h3>月營收公告</h3><a href="#contact">訂閱財務通知</a></div><table><thead><tr><th>月份</th><th>營收</th><th>成長</th><th>說明</th><th>下載</th></tr></thead><tbody>${revenueRows.map((row) => `<tr><td>${escapeHTML(row.period_label)}</td><td>${escapeHTML(row.amount_label || "")}</td><td>${escapeHTML(row.growth_label || "")}</td><td>${escapeHTML(row.note || "")}</td><td>${renderInvestorDownloadCell(row.file, "PDF")}</td></tr>`).join("")}</tbody></table></div></section>
      <section class="ir-tab-panel" data-ir-panel="finance-analysis"><div class="investor-section-head"><p class="eyebrow">Analysis</p><h2>財務資訊分析</h2><span>可用投資人公告或下載檔補充管理層討論與分析。</span></div>${renderCmsDownloadGrid(data.filesByCategory.finance || data.files)}</section>
      <section class="ir-tab-panel" data-ir-panel="quarterly-reports"><div class="investor-section-head"><p class="eyebrow">Quarterly Reports</p><h2>季度財報</h2><span>季度財報資料由後台財務項目與下載檔連動。</span></div><div class="investor-table-card compact-table"><table><thead><tr><th>文件</th><th>期間</th><th>說明</th><th>下載</th></tr></thead><tbody>${quarterly.map((row) => `<tr><td>${escapeHTML(row.title)}</td><td>${escapeHTML(row.period_label)}</td><td>${escapeHTML(row.note || "")}</td><td>${renderInvestorDownloadCell(row.file)}</td></tr>`).join("")}</tbody></table></div></section>
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
      <section class="ir-sub-hero governance-visual"><div><a class="search-back" href="#investors">返回投資人專區</a><p class="eyebrow">${escapeHTML(config.eyebrow || "Corporate Governance")}</p><h1>${escapeHTML(config.title || "公司治理")}</h1><p>${escapeHTML(config.body || "治理公告、制度文件與下載檔改由後台管理。")}</p></div><aside class="governance-hero-card"><span>${escapeHTML(config.snapshot_label || "Governance")}</span><div class="score-ring governance-score"><b>${escapeHTML(config.snapshot_value || "91")}</b><span>${escapeHTML(config.snapshot_unit || "Index")}</span></div><p>${escapeHTML(config.snapshot_note || "治理成熟度")}</p></aside></section>
      <nav class="investor-tabs governance-tabs" aria-label="公司治理分頁"><button class="active" type="button" data-ir-tab="governance-news">重要訊息</button><button type="button" data-ir-tab="governance-operation">治理文件</button><button type="button" data-ir-tab="risk-management">風險管理</button></nav>
      ${renderInvestorKpis(config.kpis || [{ label: "Notices", value: String(notices.length), note: "治理公告" }, { label: "Files", value: String(files.length), note: "治理下載" }, { label: "Audit", value: "92%", note: "稽核完成率" }, { label: "Cases", value: "0", note: "重大未結" }])}
      ${renderCmsChartGrid(charts)}
      <section class="ir-tab-panel active" data-ir-panel="governance-news"><div class="investor-section-head"><p class="eyebrow">Material Information</p><h2>重要訊息</h2><span>治理公告由後台公告資料表管理。</span></div><div class="ir-update-card">${renderCmsNoticeLinks(notices, "#ir-governance")}</div></section>
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
      <section class="ir-sub-hero shareholders-visual"><div><a class="search-back" href="#investors">返回投資人專區</a><p class="eyebrow">${escapeHTML(config.eyebrow || "Shareholders")}</p><h1>${escapeHTML(config.title || "股東專區")}</h1><p>${escapeHTML(config.body || "股務資訊、股東會、法說會與常見問答由後台管理。")}</p></div><aside class="shareholder-hero-card"><span>${escapeHTML(config.snapshot_label || "Shareholder Service")}</span><strong>${escapeHTML(config.snapshot_value || String(files.length))}</strong><p>${escapeHTML(config.snapshot_note || "已上架股東文件")}</p></aside></section>
      <nav class="investor-tabs shareholder-tabs" aria-label="股東專區分頁"><button class="active" type="button" data-ir-tab="stock-affairs">股務資訊</button><button type="button" data-ir-tab="shareholder-meeting">股東會</button><button type="button" data-ir-tab="investor-conference">法說會</button><button type="button" data-ir-tab="shareholder-faq">常見問答</button></nav>
      ${renderInvestorKpis(config.kpis || [{ label: "Notices", value: String(notices.length), note: "股東公告" }, { label: "Files", value: String(files.length), note: "股東文件" }, { label: "Contact", value: "IR", note: "投資人窗口" }, { label: "FAQ", value: "Online", note: "常見問答" }])}
      ${renderCmsChartGrid(charts)}
      <section class="ir-tab-panel active" data-ir-panel="stock-affairs"><div class="investor-section-head"><p class="eyebrow">Stock Affairs</p><h2>股務資訊</h2><span>股東相關公告由後台資料表管理。</span></div><div class="ir-update-card">${renderCmsNoticeLinks(notices, "#ir-shareholders")}</div></section>
      <section class="ir-tab-panel" data-ir-panel="shareholder-meeting"><div class="investor-section-head"><p class="eyebrow">Meeting</p><h2>股東會</h2><span>股東會年報、議事手冊與附件由檔案下載管理。</span></div>${renderCmsDownloadGrid(files)}</section>
      <section class="ir-tab-panel" data-ir-panel="investor-conference"><div class="investor-section-head"><p class="eyebrow">Conference</p><h2>法說會</h2><span>未來可新增法說會簡報與影音連結。</span></div>${renderCmsDownloadGrid(data.filesByCategory.investor || [])}</section>
      <section class="ir-tab-panel" data-ir-panel="shareholder-faq"><div class="investor-section-head"><p class="eyebrow">FAQ</p><h2>常見問答</h2><span>${escapeHTML(config.faq_intro || "股東問題由後台全站設定管理。")}</span></div>${renderInvestorFaq(config)}</section>
    </div>
  `;
}

async function loadSupabaseInvestorPage(slug) {
  if (!supabase || !["investors", "ir-finance", "ir-governance", "ir-shareholders"].includes(slug)) return false;
  try {
    const data = await fetchSupabaseInvestorData(slug);
    if (location.hash.slice(1).split("?")[0] !== slug) return true;
    setRouteSeo(slug);
    if (slug === "investors") pageView.innerHTML = renderCmsInvestorsPage(data);
    if (slug === "ir-finance") pageView.innerHTML = renderCmsFinancePage(data);
    if (slug === "ir-governance") pageView.innerHTML = renderCmsGovernancePage(data);
    if (slug === "ir-shareholders") pageView.innerHTML = renderCmsShareholdersPage(data);
    return true;
  } catch (error) {
    console.warn(`Supabase investor data unavailable for ${slug}.`, error);
    return false;
  }
}

async function renderInvestorPageOnce(slug, fallbackRenderer) {
  const loaded = await loadSupabaseInvestorPage(slug);
  if (location.hash.slice(1).split("?")[0] !== slug) return;
  if (!loaded) {
    pageView.innerHTML = fallbackRenderer();
  }
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
  const slider = document.querySelector(".story-slider");
  if (!posts.length || !slider) return;
  slider.innerHTML = posts.map((post) => {
    const acf = post.acf || {};
    const name = acf.family_name || acf.person_name || stripHTML(post.title?.rendered || "家屬回饋");
    const service = acf.service_type || "居家照顧";
    const quote = acf.quote || stripHTML(post.title?.rendered || "");
    const feedback = acf.short_feedback || stripHTML(post.excerpt?.rendered || post.content?.rendered || "");
    const image = getPostImage(post, "assets/homepage-batch/05-orange-polo-caregiver.png");
    return `
      <article>
        <img class="story-face" src="${escapeHTML(image)}" alt="${escapeHTML(name)}頭像" />
        <span class="story-meta"><b>${escapeHTML(name)}</b><em>${escapeHTML(service)}</em></span>
        <h3>${escapeHTML(quote)}</h3>
        <div class="story-points"><p>${escapeHTML(feedback)}</p></div>
        <a class="story-readmore" href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">Read More</a>
      </article>
    `;
  }).join("");
}

function renderWordPressHealth(posts) {
  const articleRow = document.querySelector(".home-health-section .article-row");
  if (!posts.length || !articleRow) return;
  const [feature, ...items] = posts;
  const miniItems = items.slice(0, 4);
  articleRow.innerHTML = `
    <article class="health-preview feature">
      <img src="${escapeHTML(getPostImage(feature))}" alt="${escapeHTML(stripHTML(feature.title?.rendered || "Health 3.0"))}" />
      <div><span>熱門文章</span><h3>${feature.title?.rendered || ""}</h3><p>${escapeHTML(stripHTML(feature.excerpt?.rendered || feature.content?.rendered || ""))}</p><a href="${escapeHTML(feature.link || "#health")}" target="_blank" rel="noopener">Read More</a></div>
    </article>
    <div class="mini-article-grid">
      ${miniItems.map((post) => `
        <article class="health-preview compact">
          <img src="${escapeHTML(getPostImage(post))}" alt="${escapeHTML(stripHTML(post.title?.rendered || "Health 3.0"))}" />
          <div><span>照顧知識</span><h3>${post.title?.rendered || ""}</h3><a href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">Read More</a></div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderWordPressMasterTalk(posts) {
  const slider = document.querySelector(".celebrity-slider");
  if (!posts.length || !slider) return;
  slider.innerHTML = posts.map((post) => {
    const acf = post.acf || {};
    const speaker = [acf.speaker_title, acf.speaker_name].filter(Boolean).join(" ") || "名人講堂";
    return `
      <article>
        <figure>
          <img src="${escapeHTML(getPostImage(post, "assets/homepage-batch/10-family-consultation.png"))}" alt="${escapeHTML(speaker)}" />
          <figcaption>${escapeHTML(speaker)}</figcaption>
        </figure>
        <div>
          <h3>${post.title?.rendered || ""}</h3>
          <p>${escapeHTML(stripHTML(acf.summary || post.excerpt?.rendered || post.content?.rendered || ""))}</p>
          <a href="${escapeHTML(post.link || "#health")}" target="_blank" rel="noopener">Read More</a>
        </div>
      </article>
    `;
  }).join("");
}

function groupHomeModules(items = []) {
  return items.reduce((groups, item) => {
    if (!groups[item.module_key]) groups[item.module_key] = [];
    groups[item.module_key].push(item);
    return groups;
  }, {});
}

function renderSupabaseNews(items, panel) {
  if (!items?.length || !panel) return;
  panel.innerHTML = items.map((item) => `
    <article>
      <time>${escapeHTML(item.date_label || item.eyebrow || "")}</time>
      <strong>${escapeHTML(item.title || "")}</strong>
      <p>${escapeHTML(item.body || item.subtitle || "")}</p>
    </article>
  `).join("");
}

function renderSupabaseRecruit(items) {
  const recruitList = document.querySelector(".recruit-list");
  if (!items?.length || !recruitList) return;

  recruitList.innerHTML = items.map((item) => {
    const image = getCmsModuleImage(item, "assets/homepage-batch/05-orange-polo-caregiver.png");
    return `
      <a href="${escapeHTML(item.link_url || "#talent")}">
        <figure>
          <img src="${escapeHTML(image)}" alt="${escapeHTML(item.title || "員工招募")}" />
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
  if (!video || !frame) return;

  const nextSource = normalizeYouTubeEmbedUrl(video.link_url || video.body || video.metadata?.youtube_url);
  if (nextSource) frame.src = nextSource;
  if (video.title) frame.title = video.title;
}

function renderSupabaseStories(items) {
  const slider = document.querySelector(".story-slider");
  if (!items?.length || !slider) return;

  slider.innerHTML = items.map((item) => {
    const name = item.subtitle || item.metadata?.person_name || "家屬回饋";
    const service = item.badge_label || item.metadata?.service_type || "居家照顧";
    const image = getCmsModuleImage(item, "assets/homepage-batch/05-orange-polo-caregiver.png");
    return `
      <article>
        <img class="story-face" src="${escapeHTML(image)}" alt="${escapeHTML(name)}頭像" />
        <span class="story-meta"><b>${escapeHTML(name)}</b><em>${escapeHTML(service)}</em></span>
        <h3>${escapeHTML(item.title || "")}</h3>
        <div class="story-points"><p>${escapeHTML(item.body || "")}</p></div>
        <a class="story-readmore" href="${escapeHTML(item.link_url || "#health")}">${escapeHTML(item.link_text || "Read More")}</a>
      </article>
    `;
  }).join("");
}

function renderSupabaseMasterTalk(items) {
  const slider = document.querySelector(".celebrity-slider");
  if (!items?.length || !slider) return;

  slider.innerHTML = items.map((item) => {
    const speaker = item.subtitle || item.metadata?.speaker || "名人講堂";
    const image = getCmsModuleImage(item, "assets/homepage-batch/10-family-consultation.png");
    return `
      <article>
        <figure>
          <img src="${escapeHTML(image)}" alt="${escapeHTML(speaker)}" />
          <figcaption>${escapeHTML(speaker)}</figcaption>
        </figure>
        <div>
          <h3>${escapeHTML(item.title || "")}</h3>
          <p>${escapeHTML(item.body || "")}</p>
          <a href="${escapeHTML(item.link_url || "#health")}">${escapeHTML(item.link_text || "Read More")}</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderSupabaseHero(items) {
  const item = items?.[0];
  const hero = document.querySelector(".hero");
  if (!item || !hero) return;

  const image = getCmsModuleImage(item, "assets/homepage-batch/01-care-home-greeting.png");
  const background = hero.querySelector(".hero-bg");
  if (background) {
    background.style.background = `
      linear-gradient(90deg, rgba(255, 248, 238, 0.72) 0%, rgba(255, 248, 238, 0.5) 38%, rgba(255, 248, 238, 0.12) 68%, rgba(255, 248, 238, 0) 100%),
      linear-gradient(180deg, rgba(255, 248, 238, 0.06), rgba(255, 248, 238, 0.18)),
      url("${image}") ${item.metadata?.image_position || "center"} / cover
    `;
  }

  const setText = (selector, value) => {
    const element = hero.querySelector(selector);
    if (element && value) element.textContent = value;
  };
  setText('[data-cms-field="eyebrow"]', item.eyebrow);
  setText('[data-cms-field="title"]', item.title);
  setText('[data-cms-field="subtitle"]', item.subtitle);
  setText('[data-cms-field="body"]', item.body);

  const primary = hero.querySelector('[data-cms-button="primary"]');
  const secondary = hero.querySelector('[data-cms-button="secondary"]');
  if (primary) {
    if (item.link_text) primary.textContent = item.link_text;
    if (item.link_url) primary.href = item.link_url;
  }
  if (secondary) {
    if (item.metadata?.secondary_text) secondary.textContent = item.metadata.secondary_text;
    if (item.metadata?.secondary_url) secondary.href = item.metadata.secondary_url;
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
    const image = getCmsModuleImage(item, "assets/homepage-batch/07-orange-apron-meal-prep.png");
    return `
      <a href="${escapeHTML(item.link_url || "#contact")}">
        <img src="${escapeHTML(image)}" alt="${escapeHTML(item.metadata?.image_alt || `${item.title}服務情境`)}" />
        <span>${escapeHTML(item.badge_label || String(index + 1).padStart(2, "0"))}</span>
        <strong>${escapeHTML(item.title || "")}</strong>
        <p>${escapeHTML(item.body || item.subtitle || "")}</p>
      </a>
    `;
  }).join("");
}

function normalizeSupabaseLocation(item) {
  const metadata = item.metadata || {};
  const key = item.item_key || item.id;
  const email = metadata.email || "generalaffairs@suiyuecare.com";
  const phone = metadata.phone || item.link_text || "02-6604-5432";
  return {
    image: getCmsModuleImage(item, "assets/homepage-batch/16-taipei-service-office.png"),
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
    return `
      <a class="partner-item" href="${escapeHTML(item.link_url || "#contact")}" target="_blank" rel="noopener">
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
    { label: "關於歲悅", href: "#about" }, { label: "大事記", href: "#milestones" },
    { label: "居家照顧", href: "#home-care" }, { label: "日間照顧", href: "#day-care" },
    { label: "社區據點", href: "#community" }, { label: "護理復能", href: "#nursing" },
    { label: "移工培訓", href: "#migrant-training" }, { label: "教育品管", href: "#quality" },
    { label: "軟體系統", href: "#software" }
  ] },
  { type: "group", label: "招募與合作", items: [
    { label: "人才招募", href: "#talent" }, { label: "土地招募", href: "#land" }, { label: "投資人招募", href: "#investor-recruiting" }
  ] },
  { type: "link", label: "健康3.0", href: "#health" },
  { type: "link", label: "課程報名", href: "#courses" },
  { type: "group", label: "投資人專區", items: [
    { label: "投資人首頁", href: "#investors" }, { label: "財務資訊", href: "#ir-finance" },
    { label: "公司治理", href: "#ir-governance" }, { label: "股東專區", href: "#ir-shareholders" }
  ] },
  { type: "cta", label: "聯絡我們", href: "#contact" }
];

const defaultFooterColumns = [
  { title: "營業項目", items: [
    { label: "居家照顧", href: "#home-care" }, { label: "日間照顧", href: "#day-care" },
    { label: "社區據點", href: "#community" }, { label: "護理復能", href: "#nursing" },
    { label: "軟體系統", href: "#software" }
  ] },
  { title: "合作入口", items: [
    { label: "人才招募", href: "#talent" }, { label: "土地招募", href: "#land" },
    { label: "投資人招募", href: "#investor-recruiting" }, { label: "教育品管", href: "#quality" }
  ] },
  { title: "資訊內容", items: [
    { label: "健康3.0", href: "#health" }, { label: "課程報名", href: "#courses" },
    { label: "投資人專區", href: "#investors" }, { label: "財務資訊", href: "#ir-finance" },
    { label: "聯絡我們", href: "#contact" }
  ] }
];

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

function renderHeaderNav(items = defaultPrimaryNav) {
  if (!nav || !Array.isArray(items) || !items.length) return;
  nav.innerHTML = items.map((item) => {
    if (item.type === "group" && Array.isArray(item.items)) {
      return `
        <div class="nav-group">
          <button class="nav-trigger" type="button" aria-expanded="false">${escapeHTML(item.label || "選單")}</button>
          <div class="dropdown">
            ${item.items.map((link) => `<a href="${escapeHTML(link.href || "#home")}">${escapeHTML(link.label || "未命名")}</a>`).join("")}
          </div>
        </div>
      `;
    }
    const className = item.type === "cta" ? ' class="nav-cta"' : "";
    return `<a${className} href="${escapeHTML(item.href || "#home")}">${escapeHTML(item.label || "未命名")}</a>`;
  }).join("");
  bindNavigationDropdowns();
  const current = `#${(location.hash.slice(1).split("?")[0] || "home")}`;
  nav.querySelectorAll("a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === current);
  });
}

function renderFooterColumns(columns = defaultFooterColumns) {
  const footerSitemap = document.querySelector(".footer-sitemap");
  if (!footerSitemap || !Array.isArray(columns) || !columns.length) return;
  footerSitemap.innerHTML = columns.map((column) => `
    <div>
      <h3>${escapeHTML(column.title || "網站地圖")}</h3>
      ${(column.items || []).map((item) => `<a href="${escapeHTML(item.href || "#home")}">${escapeHTML(item.label || "未命名")}</a>`).join("")}
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
    renderSupabaseHero(groups.hero);
    renderSupabaseNews(groups.news, document.querySelector('[data-news-panel="news"]'));
    renderSupabaseNews(groups.awards, document.querySelector('[data-news-panel="awards"]'));
    renderSupabaseRecruit(groups.recruit);
    renderSupabaseVideo(groups.video);
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
  const cover = normalizeLocalAssetUrl(row.cover_image?.public_url || row.cover_image_url || "assets/homepage-batch/05-orange-polo-caregiver.png");
  const avatar = normalizeLocalAssetUrl(row.avatar_image?.public_url || row.avatar_image_url || cover);
  return {
    slug: row.slug,
    href: `#care-story-${row.slug}`,
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
  const image = normalizeLocalAssetUrl(row.image?.public_url || row.image_url || "assets/homepage-batch/10-family-consultation.png");
  return {
    slug: row.slug,
    href: `#master-talk-${row.slug}`,
    speaker: row.speaker_name,
    titleLabel: row.speaker_title || "名人講堂",
    organization: row.organization || "",
    topic: row.topic || "照顧觀點",
    title: row.title,
    quote: row.quote,
    summary: row.summary || "",
    body: row.body || "",
    image,
    date: formatArticleDate(row.published_at),
    tags: row.tags || []
  };
}

function renderCareStorySlider(stories) {
  const slider = document.querySelector(".story-slider");
  if (!stories?.length || !slider) return false;
  slider.innerHTML = stories.map((story) => `
    <article data-href="${escapeHTML(story.href)}">
      <img class="story-face" src="${escapeHTML(story.avatar)}" alt="${escapeHTML(story.name)}頭像" />
      <span class="story-meta"><b>${escapeHTML(story.name)}</b><em>${escapeHTML(story.service)}</em></span>
      <h3>${escapeHTML(story.title)}</h3>
      <div class="story-points"><p>${escapeHTML(story.praise)}</p></div>
      <a class="story-readmore" href="${escapeHTML(story.href)}">Read More</a>
    </article>
  `).join("");
  return true;
}

function renderExpertTalkSlider(talks) {
  const slider = document.querySelector(".celebrity-slider");
  if (!talks?.length || !slider) return false;
  slider.innerHTML = talks.map((talk) => `
    <article data-href="${escapeHTML(talk.href)}">
      <figure>
        <img src="${escapeHTML(talk.image)}" alt="${escapeHTML(`${talk.titleLabel} ${talk.speaker}`)}" />
        <figcaption>${escapeHTML(`${talk.titleLabel} ${talk.speaker}`)}</figcaption>
      </figure>
      <div>
        <h3>${escapeHTML(talk.title)}</h3>
        <p>${escapeHTML(talk.summary || talk.quote || "")}</p>
        <a href="${escapeHTML(talk.href)}">Read More</a>
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
        .limit(12)
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
    const [latestNews, awards, careStories, health30, masterTalk] = await Promise.all([
      fetchPostsByCategory(WP_CATEGORIES.latestNews, 10),
      fetchPostsByCategory(WP_CATEGORIES.awards, 10),
      fetchPostsByCategory(WP_CATEGORIES.careStories, 10),
      fetchPostsByCategory(WP_CATEGORIES.health30, 10),
      fetchPostsByCategory(WP_CATEGORIES.masterTalk, 10)
    ]);

    renderWordPressNews(latestNews, document.querySelector('[data-news-panel="news"]'));
    renderWordPressNews(awards, document.querySelector('[data-news-panel="awards"]'), true);
    renderWordPressStories(careStories);
    renderWordPressHealth(health30);
    renderWordPressMasterTalk(masterTalk);
  } catch (error) {
    console.warn("WordPress content unavailable, using static homepage content.", error);
  }
}

let locationData = {
  shilin: {
    image: "assets/homepage-batch/16-taipei-service-office.png",
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
    image: "assets/homepage-batch/10-family-consultation.png",
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
    image: "assets/homepage-batch/07-orange-apron-meal-prep.png",
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
    image: "assets/homepage-batch/14-care-notes.png",
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
    image: "assets/homepage-batch/10-family-consultation.png",
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
    image: "assets/homepage-batch/12-community-health-class.png",
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
    image: "assets/homepage-batch/12-community-health-class.png",
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
    image: "assets/homepage-batch/13-rehab-walking-practice.png",
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

  detail.querySelector("img").src = data.image;
  detail.querySelector("img").alt = data.alt;
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
  return `
    <article class="health-pack-card click-card" data-href="${escapeHTML(article.href)}" tabindex="0" role="link">
      <img src="${escapeHTML(article.image)}" alt="${escapeHTML(article.title)}"${imageStyleAttr({ usage: "card", focalPoint: article.focalPoint })} />
      <div><span>${escapeHTML(label)}</span><h3>${escapeHTML(article.title)}</h3><p>${escapeHTML(article.subtitle || article.excerpt || "")}</p></div>
    </article>
  `;
}

function renderHealthEventCard(article) {
  return `
    <article class="health-event-card click-card" data-href="${escapeHTML(article.href)}" tabindex="0" role="link">
      <img src="${escapeHTML(article.image)}" alt="${escapeHTML(article.title)}"${imageStyleAttr({ usage: "card", focalPoint: article.focalPoint })} />
      <div><time>${escapeHTML(article.date || "近期")}</time><h3>${escapeHTML(article.title)}</h3><p>${escapeHTML(article.subtitle || article.excerpt || "")}</p></div>
    </article>
  `;
}

function renderHealthVideoCard(article, label = article.category) {
  const displayLabel = article.videoLabel || label;
  const media = article.videoEmbedUrl
    ? article.videoProvider === "youtube" || article.videoProvider === "vimeo"
      ? `<iframe src="${escapeHTML(article.videoEmbedUrl)}" title="${escapeHTML(article.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
      : `<video src="${escapeHTML(article.videoEmbedUrl)}" controls preload="metadata" poster="${escapeHTML(article.image)}"></video>`
    : `<img src="${escapeHTML(article.image)}" alt="${escapeHTML(article.title)}"${imageStyleAttr({ usage: "card", focalPoint: article.focalPoint })} />`;
  return `
    <article class="health-video-card ${article.videoEmbedUrl ? "has-video" : "click-card"}" ${article.videoEmbedUrl ? "" : `data-href="${escapeHTML(article.href)}" tabindex="0" role="link"`}>
      ${media}
      <div><span>${escapeHTML(displayLabel)}${article.videoDuration ? ` · ${escapeHTML(article.videoDuration)}` : ""}</span><h3>${escapeHTML(article.title)}</h3>${article.videoCaption ? `<p>${escapeHTML(article.videoCaption)}</p>` : ""}</div>
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
            <p>長照內容農場，整理疾病症狀、飲食營養、復能運動、失智照顧與家屬照顧技巧。</p>
          </div>
          <form class="health-search">
            <input name="q" type="search" placeholder="搜尋跌倒、失智、營養、復能" />
            <button type="submit">搜尋</button>
          </form>
        </div>
        <div class="health-cats">
          <button class="click-card ${activeCategory ? "" : "active"}" type="button" data-href="#health">全部文章</button>
          ${categories.map((category) => `
            <button class="click-card ${activeCategory === category.slug ? "active" : ""}" type="button" data-href="#health?category=${encodeURIComponent(category.slug)}">${escapeHTML(category.name)}</button>
          `).join("")}
        </div>
      </section>

      ${articles.length ? `
      <section class="health-board">
        <article class="health-feature click-card" data-href="${escapeHTML(feature.href)}" tabindex="0" role="link">
          <img src="${escapeHTML(feature.image)}" alt="${escapeHTML(feature.title)}"${imageStyleAttr({ usage: feature.imageUsage || "article_cover", focalPoint: feature.focalPoint })} />
          <div>
            <span class="health-tag">本週精選</span>
            <h2>${escapeHTML(feature.title)}</h2>
            <p>${escapeHTML(feature.subtitle || feature.excerpt)}</p>
            <a class="health-readmore" href="${escapeHTML(feature.href)}">Read More</a>
          </div>
        </article>

        <div class="health-quick-grid">
          ${quickCards.map((post) => `
            <article class="health-card click-card" data-href="${escapeHTML(post.href)}" tabindex="0" role="link">
              <img src="${escapeHTML(post.image)}" alt="${escapeHTML(post.title)}"${imageStyleAttr({ usage: "card", focalPoint: post.focalPoint })} />
              <div>
                <span class="health-tag">${escapeHTML(post.category)}</span>
                <h3>${escapeHTML(post.title)}</h3>
                <a href="${escapeHTML(post.href)}">Read More</a>
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
        <p>後台新增並發布文章後，這裡會自動同步顯示。</p>
        <a href="#health">查看全部文章</a>
      </section>
      `}

      <section class="health-topic-strip">
        ${["長照2.0", "出院返家", "跌倒預防", "營養補充", "失智陪伴", "日間照顧", "復能訓練", "喘息服務"].map((keyword) => `<a href="#search?q=${encodeURIComponent(keyword)}"># ${keyword}</a>`).join("")}
      </section>

      ${isCategoryView ? "" : `
      <section class="health-latest">
        <div class="health-section-head">
          <div><p class="eyebrow">Latest</p><h2>最新照顧文章</h2></div>
          <a href="#search?q=${encodeURIComponent("照顧")}">查看全部</a>
        </div>
        <div class="health-latest-grid">
          ${latestCards.map((post) => `
            <article class="health-list-card click-card" data-href="${escapeHTML(post.href)}" tabindex="0" role="link">
              <img src="${escapeHTML(post.image)}" alt="${escapeHTML(post.title)}"${imageStyleAttr({ usage: "article_cover", focalPoint: post.focalPoint })} />
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
          ${lazyPacks.map((article) => renderHealthMiniCard(article, "懶人包")).join("") || `<div class="health-empty-state"><h2>尚未建立懶人包文章</h2><p>請在後台文章管理新增分類為「懶人包」的文章。</p></div>`}
        </div>
      </section>

      <section class="health-event-section">
        <div class="health-section-head">
          <div><p class="eyebrow">Events</p><h2>活動專區</h2></div>
          <a href="${escapeHTML(getHealthSectionUrl("activity", "活動專區"))}">更多活動</a>
        </div>
        <div class="health-event-grid">
          ${eventCards.map(renderHealthEventCard).join("") || `<div class="health-empty-state"><h2>尚未建立活動文章</h2><p>請在後台文章管理新增分類為「活動專區」的文章。</p></div>`}
        </div>
      </section>

      <section class="health-media-hub">
        <div class="health-section-head">
          <div><p class="eyebrow">Video</p><h2>影音與短影片</h2></div>
          <a href="${escapeHTML(getHealthSectionUrl("video", "影片"))}">更多影音</a>
        </div>
        <div class="health-media-grid">
          ${mediaCards.map((article) => renderHealthVideoCard(article, articleMatchesHealthSection(article, healthSectionCategorySlugs.shortVideo) ? "短影片" : "影片")).join("")}
          ${!mediaCards.length ? `<div class="health-empty-state"><h2>尚未建立影音文章</h2><p>請在後台文章管理新增分類為「影音」或「短影片」的文章。</p></div>` : ""}
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
    ? articles.filter((post) => `${post.title} ${post.subtitle || ""} ${post.excerpt} ${post.category} ${post.keywords}`.toLowerCase().includes(normalizedKeyword))
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
            <img src="${escapeHTML(post.image)}" alt="${escapeHTML(post.title)}"${imageStyleAttr({ usage: "article_cover", focalPoint: post.focalPoint })} />
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

function formatCourseDate(value) {
  if (!value) return "可隨時觀看";
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)).replace(/\//g, ".");
}

function formatCourseTime(start, end) {
  if (!start) return "可隨時觀看";
  const formatter = new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
  const startText = formatter.format(new Date(start));
  return end ? `${startText}-${formatter.format(new Date(end))}` : startText;
}

function normalizeCourse(course) {
  const cover = course.cover_image || course.media || {};
  return {
    id: course.id,
    title: course.title,
    intro: course.excerpt || course.subtitle || course.description || "",
    date: formatCourseDate(course.starts_at),
    time: formatCourseTime(course.starts_at, course.ends_at),
    price: course.price_text || "免費",
    type: course.course_type || "實體課",
    location: course.location || "待公告",
    seats: course.seats_label || (course.capacity ? `${course.capacity} 人` : "名額開放中"),
    image: cover.public_url || "assets/homepage-batch/12-community-health-class.png",
    isFeatured: Boolean(course.is_featured),
    registrationStatus: course.registration_status || "open"
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
      .select("id, title, subtitle, excerpt, description, course_type, location, location_detail, starts_at, ends_at, price_text, capacity, seats_label, registration_status, registration_url, is_featured, sort_order, cover_image:media!courses_cover_image_id_fkey(id, public_url, alt_text)")
      .eq("status", "published")
      .eq("is_enabled", true)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("starts_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    supabaseCourses = data || [];
    coursesLoadedFromSupabase = true;
    coursesLoadFailed = false;
    if (rerender && location.hash.slice(1).split("?")[0] === "courses") {
      pageView.innerHTML = renderCoursesPage();
    }
    return supabaseCourses;
  } catch (error) {
    console.warn("Supabase courses unavailable.", error);
    coursesLoadedFromSupabase = false;
    coursesLoadFailed = true;
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
  if (!coursesLoadedFromSupabase && !coursesLoadFailed) {
    pageView.innerHTML = `
      <div class="courses-page">
        <section class="courses-hero">
          <div>
            <p class="eyebrow">Courses</p>
            <h1>課程報名</h1>
            <p>正在讀取後台課程資料，請稍候。</p>
          </div>
        </section>
      </div>
    `;
    await loadSupabaseCourses();
  }
  if (location.hash.slice(1).split("?")[0] === "courses") {
    pageView.innerHTML = renderCoursesPage();
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
            <input type="search" placeholder="搜尋課程或講師" />
            <select><option>台北</option><option>新北</option><option>線上</option></select>
            <button type="button">搜尋</button>
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
            <article class="featured-course-card click-card" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}" tabindex="0" role="button">
              <img src="${escapeHTML(course.image)}" alt="${escapeHTML(course.title)}" />
              <div>
                <span>${escapeHTML(course.type)}</span>
                <h3>${escapeHTML(course.title)}</h3>
                <p>${escapeHTML(course.intro)}</p>
                <button class="course-register" type="button" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}">立即報名</button>
              </div>
            </article>
          `).join("") : `
            <article class="featured-course-card">
              <div>
                <span>CMS</span>
                <h3>等待後台新增重要課程</h3>
                <p>在課程管理中勾選「重要課程輪播」並發布後，這裡會自動顯示。</p>
              </div>
            </article>
          `}
        </div>
      </section>
      <section class="course-list">
        ${courses.length ? courses.map((course, index) => `
          <article class="course-card click-card" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}" tabindex="0" role="button">
            <div class="course-thumb"><img src="${escapeHTML(course.image)}" alt="${escapeHTML(course.title)}" /><span>${String(index + 1).padStart(2, "0")}</span></div>
            <div class="course-body">
              <div class="course-topline"><span class="course-type">${escapeHTML(course.type)}</span><span class="course-seats">${escapeHTML(course.seats)}</span></div>
              <h3>${escapeHTML(course.title)}</h3>
              <p>${escapeHTML(course.intro)}</p>
              <div class="course-info-line"><span><em>地點</em>${escapeHTML(course.type)}｜${escapeHTML(course.location)}</span><b><em>費用</em>${escapeHTML(course.price)}</b></div>
              <div class="course-info-line"><span><em>日期</em>${escapeHTML(course.date)}</span><b><em>時間</em>${escapeHTML(course.time)}</b></div>
              <button class="course-register" type="button" data-course-id="${escapeHTML(course.id)}" data-course-title="${escapeHTML(course.title)}">立即報名</button>
            </div>
          </article>
        `).join("") : `
          <div class="course-empty-state">
            <h2>${coursesLoadFailed ? "課程資料暫時無法讀取" : "目前沒有開放報名的課程"}</h2>
            <p>${coursesLoadFailed ? "請稍後重新整理，或直接聯絡課程窗口。系統不會顯示寫死的範例課程。" : "後台新增課程並設為「已發布」與「前台顯示」後，這裡會自動出現。"}</p>
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
            <a class="primary-button" href="#contact">聯絡投資人窗口</a>
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
    ["居家照顧", "到宅身體照顧、生活支持、服務紀錄與家屬回報。", "assets/homepage-batch/01-care-home-greeting.png"],
    ["日間照顧", "白天托顧、活動參與、共餐休息與家屬喘息支持。", "assets/daycare-recruit-02-exercise.png"],
    ["社區據點", "失智據點、健康促進、家屬課程與社區預防延緩失能。", "assets/homepage-batch/12-community-health-class.png"],
    ["護理復能", "職能治療、復能訓練、居家安全建議與生活功能支持。", "assets/nursing-rehab-hero.png"],
    ["移工培訓", "把家庭照顧技能拆成可理解、可練習、可追蹤的課程。", "assets/migrant-recruit-01-classroom.png"],
    ["教育品管", "用教材、訓練、稽核與改善流程承接服務品質。", "assets/quality-recruit-04-quality-meeting.png"]
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
            <a class="primary-button" href="#contact">聯絡我們</a>
            <a class="secondary-button" href="#services">查看服務項目</a>
          </div>
        </div>
        <aside class="about-hero-image">
          <img src="assets/hero-care.png" alt="歲悅長照照顧情境" />
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

function renderMilestonesPage() {
  const milestoneStats = [
    ["3", "核心服務城市", "臺北、新北、桃園逐步建立照顧網絡"],
    ["6", "照顧服務模組", "居家、日照、社區、復能、培訓與品管"],
    ["10+", "合作與服務節點", "持續擴大服務半徑與專業支援"],
    ["1", "共同使命", "讓照顧變得更容易理解、更容易開始"]
  ];
  const timeline = [
    ["2025", "01", "北區服務藍圖盤點", "Planning", "整理臺北、新北、桃園家庭照顧需求，確認居家、日照、社區與復能服務的發展方向。", "assets/homepage-batch/10-family-consultation.png", "已完成"],
    ["2025", "02", "居家照顧流程標準化", "Home Care", "建立個案建檔、服務媒合、派案、照顧紀錄與家屬回報的基礎流程。", "assets/homepage-batch/01-care-home-greeting.png", "已完成"],
    ["2025", "03", "督導陪跑制度啟動", "Quality", "把督導訪視、異常回報、服務品質檢核與照服員支持放進日常管理。", "assets/homepage-batch/03-supervisor-care-plan.png", "已完成"],
    ["2025", "04", "日間照顧場域規劃", "Day Care", "規劃長輩白天活動、餐食、休息、健康觀察與家屬回報的中心營運節奏。", "assets/homepage-batch/02-daycare-group-exercise.png", "已完成"],
    ["2025", "05", "社區據點服務設計", "Community", "盤點健康促進、家屬課程、照顧諮詢與社區活動，讓照顧支持更靠近生活圈。", "assets/homepage-batch/12-community-health-class.png", "已完成"],
    ["2025", "06", "護理復能協作模型成形", "Reablement", "整合護理觀察、復能訓練與照顧陪伴，讓長輩能在生活裡重新練回能力。", "assets/homepage-batch/13-rehab-walking-practice.png", "已完成"],
    ["2025", "07", "移工照顧培訓課程開發", "Training", "將移位、沐浴、用餐、溝通與安全照顧拆成可演練的課程內容。", "assets/migrant-recruit-02-transfer.png", "已完成"],
    ["2025", "08", "教育品管教材整理", "Education", "把第一線服務經驗轉化為教材、檢核表與案例討論，讓照顧品質可以被複製。", "assets/quality-recruit-04-quality-meeting.png", "已完成"],
    ["2025", "09", "北北桃據點資料盤點", "Network", "整理士林、大同、萬華、信義、新店、新莊與蘆竹等服務節點資訊。", "assets/north-service-map.png", "已完成"],
    ["2025", "10", "人才招募制度擴充", "Recruiting", "建立居家、日照、移工培訓、教學品管與行政部門的職缺內容與發展路徑。", "assets/homepage-batch/06-orange-polo-supervisor.png", "已完成"],
    ["2025", "11", "後台內容管理架構規劃", "CMS", "規劃文章、圖片、課程、表單、檔案下載與頁面文案的後台管理方式。", "assets/homepage-batch/04-admin-team-office.png", "已完成"],
    ["2025", "12", "年度服務與合作成果整理", "Review", "彙整服務據點、合作單位、得標紀錄與年度營運成果，作為 2026 擴展基礎。", "assets/homepage-batch/16-taipei-service-office.png", "已完成"],
    ["2026", "01", "健康 3.0 內容中心上線", "Health 3.0", "建立文章、懶人包、活動專區、影音與短影片內容，讓家屬更容易理解照顧知識。", "assets/homepage-batch/18-health-fall-prevention-cover.png", "已完成"],
    ["2026", "02", "課程報名與表單留存完成", "Courses", "課程卡片、報名彈窗、表單資料留存與後台課程管理逐步串接。", "assets/homepage-batch/12-community-health-class.png", "已完成"],
    ["2026", "03", "投資人專區資料化", "Investor", "將公告、財報、下載檔與圖表資料改為後台可管理，提升對外資訊透明度。", "assets/homepage-batch/04-admin-team-office.png", "已完成"],
    ["2026", "04", "服務八大子頁模板化", "Service Pages", "居家、日照、社區、護理復能、移工培訓、教育品管、關於與大事記版型統一整理。", "assets/homepage-batch/09-nurse-blood-pressure.png", "已完成"],
    ["2026", "05", "網站上線前總檢與內容補強", "Launch Check", "檢查前後台資料、SEO、RWD、表單寄信、圖片裁切、權限與內容健康檢查。", "assets/homepage-batch/15-phone-consultation.png", "進行中"],
  ].map(([year, month, title, tag, copy, image, status]) => ({ year, month, title, tag, copy, image, status }));
  const sortedTimeline = [...timeline].sort((a, b) => Number(b.year) - Number(a.year) || Number(b.month) - Number(a.month));
  const timelineGroups = [...new Set(sortedTimeline.map((item) => item.year))]
    .map((year) => ({ year, items: sortedTimeline.filter((item) => item.year === year) }));

  return `
    <div class="milestones-page">
      <section class="milestone-hero">
        <div>
          <p class="eyebrow">Milestones</p>
          <h1>大事記</h1>
          <p>從一通照顧諮詢開始，到北北桃服務網絡與教育品管系統，歲悅把每一個家庭的需求，慢慢整理成可以被理解、被追蹤、被信任的照顧歷程。</p>
          <div class="milestone-scroll-cue">
            <span></span>
            <strong>往下滑，看歲悅的發展歷程</strong>
          </div>
        </div>
        <aside class="milestone-hero-card">
          <img src="assets/homepage-batch/04-admin-team-office.png" alt="歲悅長照團隊發展" />
          <div>
            <span>Suiyuecare Corps.</span>
            <strong>讓照顧從不安，走向清楚與安心。</strong>
          </div>
        </aside>
      </section>

      <section class="milestone-stats">
        ${milestoneStats.map(([value, label, copy]) => `<article><strong>${value}</strong><span>${label}</span><p>${copy}</p></article>`).join("")}
      </section>

      <section class="milestone-journey" aria-label="歲悅長照發展時間軸">
        <div class="milestone-rail" aria-hidden="true">
          <span class="milestone-rail-progress"></span>
        </div>
        <div class="milestone-intro">
          <p class="eyebrow">Our Journey</p>
          <h2>最新進度在最上方，越往下越接近歲悅開始整理照顧系統的起點。</h2>
          <p>大事記依年度與月份倒序排列，先看最近完成與正在推進的內容，再一路往下回看 2026、2025 的服務、品管、內容與後台建置歷程。</p>
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
                  <article class="milestone-card ${globalIndex === 0 ? "active" : ""}" data-milestone-card>
                    <div class="milestone-year">
                      <span>${item.month}月</span>
                      <b>${item.year}</b>
                    </div>
                    <figure>
                      <img src="${item.image}" alt="${item.title}" />
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
          <a class="primary-button" href="#talent">加入歲悅</a>
          <a class="secondary-button" href="#contact">合作洽詢</a>
        </div>
      </section>
    </div>
  `;
}

function renderHomeCarePage() {
  const highlights = [
    ["把需求講清楚", "先釐清長輩目前最困擾的生活情境，例如洗澡、如廁、移位、用餐、出院返家或白天無人陪伴。"],
    ["把服務排穩定", "依照區域、時段、照顧強度與長輩個性安排照顧服務員，讓家庭不是每次都重新適應。"],
    ["把紀錄留完整", "服務後整理照顧紀錄、狀態變化與提醒事項，讓家屬知道今天發生什麼，也知道下一步要注意什麼。"],
    ["把品質追到底", "督導定期回訪、檢視服務內容與家屬回饋，讓照顧不是有人到場而已，而是有人持續負責。"]
  ];
  const painPoints = [
    ["剛出院返家", "床邊起身、輪椅轉位、沐浴動線、用餐狀態都需要重新安排，家屬常常不知道第一週該怎麼做。"],
    ["白天沒人在家", "家屬上班後最擔心跌倒、忘記吃飯、情緒低落或臨時狀況無人協助。"],
    ["失智照顧壓力", "反覆詢問、作息混亂、抗拒洗澡或外出，需要有耐心且能理解行為背後需求的陪伴。"],
    ["照顧者太累", "長期照顧容易累積睡眠不足、情緒壓力與家庭摩擦，需要喘息，也需要有人一起分擔。"],
    ["不知道服務品質", "只知道有人來，卻不清楚今天做了什麼、長輩狀態有沒有變化、是否需要調整服務。"],
    ["家人意見不同", "每位家屬對照顧期待不同，歲悅會協助把需求、服務範圍與回報方式說清楚。"]
  ];
  const scenes = [
    ["assets/homecare-detail-01-greeting.png", "進門先看見人", "服務員進門後先問候、觀察精神與情緒，讓長輩知道今天不是被處理，而是被陪伴。"],
    ["assets/homecare-detail-02-care-plan.png", "家屬與督導一起排照顧", "把服務目標、時段、禁忌、回報方式與家屬最在意的事情寫進計畫裡。"],
    ["assets/homecare-detail-03-safe-transfer.png", "安全移動不靠硬撐", "協助起身、移位、陪同走動時，用合適步調與支撐方式降低跌倒風險。"],
    ["assets/homecare-detail-04-daily-support.png", "日常細節也要被記得", "備餐、用餐觀察、生活提醒與照顧紀錄，讓家裡的照顧變得清楚可追蹤。"]
  ];
  const serviceItems = [
    ["身體照顧", "沐浴、穿脫衣物、如廁、移位、翻身、拍背、用餐協助。", "適合出院返家、行動不便、需協助盥洗或日常照顧者。"],
    ["生活照顧", "備餐、陪伴、簡易環境整理、代購、陪同外出與生活提醒。", "適合獨居、白天家人不在、需要日常支持的長輩。"],
    ["陪同就醫", "陪同掛號、候診、拿藥、交通動線提醒與回家後重點回報。", "適合家屬無法請假，或長輩外出需要有人陪同者。"],
    ["喘息支持", "短時段接手照顧，讓主要照顧者能休息、辦事、上班或恢復生活。", "適合長期照顧壓力高、需要固定喘息時段的家庭。"],
    ["失智陪伴", "用穩定語氣、生活線索與熟悉活動陪伴，降低焦躁與抗拒。", "適合有認知退化、作息混亂或需要耐心引導的長輩。"],
    ["安全觀察", "觀察跌倒風險、進食飲水、精神變化、皮膚狀況與居家動線。", "適合希望及早發現風險並調整環境的家庭。"],
    ["家屬回報", "服務紀錄、照片回報、異常提醒、家屬溝通與督導追蹤。", "適合想掌握照顧品質、需要清楚資訊的家屬。"],
    ["資源銜接", "協助家屬理解長照資源、日照、復能、輔具與其他服務銜接。", "適合剛開始接觸長照、不確定該怎麼安排的家庭。"]
  ];
  const scenarios = [
    ["出院返家第一週", "協助家屬把床邊、浴室、用餐、服藥提醒與移位方式重新整理，降低返家初期的混亂。", "重點：安全動線、照顧教學、服務銜接"],
    ["白天獨居陪伴", "固定到宅確認長輩狀態、協助備餐與生活提醒，讓家屬在上班時也能安心。", "重點：陪伴、飲食、狀態回報"],
    ["失智長輩支持", "用熟悉節奏陪伴盥洗、進食、活動與情緒安撫，降低家屬每天溝通拉扯。", "重點：耐心引導、穩定作息、情緒支持"],
    ["主要照顧者喘息", "由照顧服務員在固定時段接手，讓家屬能補眠、外出、工作或照顧自己。", "重點：短時接手、穩定交班、家屬支持"]
  ];
  const qualityItems = [
    ["媒合不是只看地點", "同時評估服務時段、長輩個性、照顧強度與照服員經驗，降低不適配機率。"],
    ["服務前有交代", "把注意事項、服務範圍、禁忌與家屬期待先交代清楚，避免現場靠猜。"],
    ["服務後有紀錄", "服務內容、長輩狀態、特殊狀況與下次提醒都會留下紀錄，讓家屬可追蹤。"],
    ["督導會回頭看", "不是派案後就結束，督導會依回饋調整服務內容，讓品質能一路維持。"],
    ["異常要被提醒", "跌倒風險、食慾改變、情緒變化、皮膚狀況或居家安全問題，都會提醒家屬。"],
    ["跨服務可銜接", "若長輩後續需要日照、護理復能、輔具或其他資源，可協助整理下一步。"]
  ];
  const flow = [
    ["01", "需求諮詢", "先了解長輩生活能力、疾病狀態、照顧困難、服務區域、希望時段與家屬期待。"],
    ["02", "到宅或電話評估", "整理服務目標、風險提醒、可提供項目與目前最需要優先處理的照顧問題。"],
    ["03", "照顧計畫建立", "把服務內容、注意事項、回報方式、家屬溝通窗口與可能變動狀況寫清楚。"],
    ["04", "照服員媒合", "依照地區、時段、照顧強度與長輩特性安排合適人員，必要時由督導協助銜接。"],
    ["05", "正式到宅服務", "服務員依計畫執行照顧，並在現場觀察長輩狀態與家庭環境變化。"],
    ["06", "紀錄與追蹤", "服務後回報重點，督導依家屬回饋與長輩變化調整服務，讓照顧走得久。"]
  ];
  const faqs = [
    ["居家照顧一定要每天使用嗎？", "不一定。可以依家庭需求安排固定時段、短時喘息、陪同就醫或階段性服務，重點是先把需求與可安排區域確認清楚。"],
    ["家屬不在家也可以服務嗎？", "可以，但服務開始前會先確認進出方式、聯絡窗口、緊急狀況處理與回報方式，讓責任界線清楚。"],
    ["可以協助失智長輩嗎？", "可以。會依長輩的習慣、情緒觸發點、溝通方式與安全風險安排服務內容，並提醒家屬需要一起配合的地方。"],
    ["如果照顧服務員不適合怎麼辦？", "歲悅會先了解不適合的原因，包含服務內容、溝通方式、時段或照顧強度，再由督導協助調整。"],
    ["服務內容可以中途調整嗎？", "可以。長輩狀態會變，家庭需求也會變，因此會透過紀錄與回饋逐步調整服務重點。"],
    ["目前服務區域有哪些？", "目前以臺北市、新北市與桃園部分區域為主，實際可服務範圍會依人力、時段與照顧需求確認。"]
  ];

  return `
    <div class="service-detail-page home-care-page">
      <section class="service-detail-hero home-care-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Home Care</p>
          <h1>居家照顧</h1>
          <p>歲悅居家照顧把服務帶進長輩熟悉的家，從出院返家、日常生活支持、身體照顧到家屬回報，將看似零散的照顧需求整理成一套可安排、可追蹤、可調整的日常系統。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約居家諮詢</a>
            <a class="secondary-button" href="#network">查看服務區域</a>
          </div>
          <div class="homecare-hero-points">
            <article><span>服務範圍</span><strong>士林、北投、大同、南港、萬華、新店、中和、永和、新莊、蘆竹等區域陸續安排</strong></article>
            <article><span>服務重點</span><strong>到宅陪伴、身體照顧、生活支持、家屬回報、督導追蹤</strong></article>
            <article><span>適合家庭</span><strong>出院返家、獨居、失智陪伴、主要照顧者需要喘息的家庭</strong></article>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/homecare-detail-01-greeting.png" alt="歲悅居家照顧到宅問候情境" />
          <div>
            <span>Home Care Service</span>
            <strong>把照顧帶進家裡，也把安心留在家裡。</strong>
          </div>
        </aside>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Focus</p>
          <h2>居家照顧在做什麼</h2>
          <span>不是單純派人到家，而是把照顧需求、服務紀錄、督導追蹤與家屬溝通串成穩定系統。</span>
        </div>
        <div class="service-highlight-grid">
          ${highlights.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-positioning">
        <div class="service-section-head">
          <p class="eyebrow">Family Pain Points</p>
          <h2>家屬真正卡住的，通常不是一件事。</h2>
          <span>居家照顧最難的是每天都會發生的小狀況。歲悅會先把問題拆清楚，再把照顧安排進家庭可以承受的節奏。</span>
        </div>
        <div class="homecare-problem-grid">
          ${painPoints.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>這一頁新增 4 張居家照顧情境圖，呈現服務從進門、評估、移動到日常支持的完整感受。</span>
        </div>
        <div class="homecare-gallery">
          ${scenes.map(([image, title, copy]) => `
            <figure>
              <img src="${image}" alt="${title}" />
              <figcaption>
                <strong>${title}</strong>
                <span>${copy}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Services</p>
          <h2>服務內容</h2>
          <span>居家照顧會依長輩狀態與家庭節奏調整，不把每個家庭硬塞進同一套流程。</span>
        </div>
        <div class="community-program-grid">
          ${serviceItems.map(([title, items, fit]) => `
            <article>
              <h3>${title}</h3>
              <p>${items}</p>
              <span>${fit}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Scenarios</p>
          <h2>不同家庭，需要不同的居家照顧設計。</h2>
          <span>歲悅不會只問「要幾小時」，而會先問家裡最需要被解決的是什麼。</span>
        </div>
        <div class="homecare-scenario-grid">
          ${scenarios.map(([title, copy, tag]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
              <small>${tag}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">How It Works</p>
          <h2>從諮詢到穩定服務</h2>
          <span>讓家屬不用自己摸索：先釐清需求，再安排服務，最後用紀錄與督導讓照顧持續被看見。</span>
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

      <section class="service-detail-section homecare-quality-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality System</p>
          <h2>居家照顧要走得長，靠的是細節被持續看見。</h2>
          <span>我們把服務、紀錄、督導與家屬溝通放在同一套節奏裡，讓照顧不只是今天有來，而是明天能更穩。</span>
        </div>
        <div class="homecare-quality-grid">
          ${qualityItems.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="homecare-family-board">
          <article>
            <p class="eyebrow">Family Communication</p>
            <h2>家屬不用自己猜，照顧者也不是單打獨鬥。</h2>
            <p>居家照顧最需要的是資訊透明。歲悅會把服務內容、現場觀察、家屬提醒與督導追蹤串在一起，讓每個家庭知道現在正在做什麼、為什麼這樣做、接下來要注意什麼。</p>
          </article>
          <article>
            <b>01</b>
            <h3>服務前確認</h3>
            <p>先確認服務範圍、長輩習慣、禁忌、鑰匙或門禁、緊急聯絡與回報方式。</p>
          </article>
          <article>
            <b>02</b>
            <h3>服務中觀察</h3>
            <p>看見食慾、精神、情緒、移位安全、居家環境與家屬需要知道的小變化。</p>
          </article>
          <article>
            <b>03</b>
            <h3>服務後回報</h3>
            <p>留下照顧紀錄與提醒事項，讓家屬下班後不用從零開始追問。</p>
          </article>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>家屬常見問題</h2>
          <span>正式安排前，最重要的是把服務範圍、責任界線與回報方式說清楚。</span>
        </div>
        <div class="software-faq-list">
          ${faqs.map(([question, answer]) => `
            <details>
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Start Home Care</p>
          <h2>家裡開始需要有人幫忙照顧了嗎？</h2>
          <p>留下需求後，歲悅會協助確認長輩狀態、服務區域、可安排時段與適合的居家照顧內容。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡我們</a>
      </section>
    </div>
  `;
}

function renderDayCarePage() {
  const highlights = [
    ["白天有安全場域", "讓長輩離開長時間獨處的狀態，在有人看見、有人陪伴、有人觀察的環境中度過白天。"],
    ["生活節奏被重新建立", "用報到、量測、活動、共餐、午休與回家準備，讓長輩每天有穩定節奏與期待。"],
    ["活動不是填時間", "透過伸展、肌力、認知、手作、音樂與團體互動，讓長輩保有參與感與生活功能。"],
    ["家屬也能喘口氣", "白天照顧由團隊接手，讓主要照顧者能工作、休息與處理生活，同時仍能掌握長輩狀態。"]
  ];
  const painPoints = [
    ["白天一個人在家", "家屬上班後最擔心長輩跌倒、忘記吃飯、久坐不動或突然身體不舒服。"],
    ["在家越來越少活動", "長輩如果缺少外出與互動，身體功能、食慾、情緒與睡眠常會一起下降。"],
    ["家屬無法長期請假", "照顧不是一天兩天，家屬需要一個可以穩定銜接白天照顧的服務場域。"],
    ["長輩抗拒陌生環境", "第一次去日照中心常會緊張，因此需要熟悉、試讀、陪伴與逐步建立安全感。"],
    ["不知道白天過得如何", "家屬需要知道長輩今天吃得好不好、活動狀態如何、精神與情緒是否有變化。"],
    ["照顧壓力持續累積", "主要照顧者若沒有喘息，長期下來容易疲乏，也會影響家庭關係與照顧品質。"]
  ];
  const scenes = [
    ["assets/daycare-detail-01-exercise.png", "團體活動讓身體醒過來", "用安全、可跟上的節奏帶領伸展與律動，讓長輩重新感覺自己仍然能動。"],
    ["assets/daycare-detail-02-meal.png", "共餐不是吃飯而已", "餐食照顧會觀察食慾、吞嚥、飲水與情緒，也讓長輩在陪伴中用餐。"],
    ["assets/daycare-detail-03-activity.png", "手作與認知活動", "透過簡單任務、顏色、記憶與互動，讓活動成為長輩有成就感的時刻。"],
    ["assets/daycare-detail-04-checkin.png", "早晨報到與家屬交接", "從進門問候與健康觀察開始，讓家屬知道今天有人接住長輩。"]
  ];
  const serviceItems = [
    ["生活照顧", "報到接待、健康觀察、如廁協助、午休照顧、回家準備與安全巡視。", "適合白天需要陪伴、提醒與基本生活支持的長輩。"],
    ["餐食照顧", "共餐、飲水提醒、用餐觀察、吞嚥風險提醒與營養狀態初步留意。", "適合食慾下降、容易忘記吃飯或需要用餐陪伴者。"],
    ["健康促進", "椅上運動、伸展、肌力、平衡、律動、認知刺激與生活功能活動。", "適合希望維持活動量、延緩退化與增加生活刺激者。"],
    ["社交陪伴", "團體活動、節慶活動、手作課程、音樂互動與同儕交流。", "適合在家較少出門、情緒低落或需要人際互動者。"],
    ["失智友善支持", "用熟悉節奏、環境提示、活動引導與安全陪伴，降低焦躁與不安。", "適合輕中度失智、需要白天規律活動與陪伴者。"],
    ["家屬回報", "出席狀況、用餐活動、精神情緒、特殊事件與照顧建議回饋。", "適合希望知道長輩白天過得如何的家庭。"],
    ["交通與接送提醒", "依實際服務條件協助討論交通安排、接送注意事項與到離場交接。", "適合家屬上班時間不易親自接送者。"],
    ["資源銜接", "協助家屬理解長照資源、居家照顧、復能、課程與家庭支持方案。", "適合照顧需求可能逐步變化的家庭。"]
  ];
  const scenarios = [
    ["家屬白天要上班", "長輩白天到中心參與活動、用餐與休息，家屬能安心工作，晚上再回到熟悉的家。", "重點：白天托顧、家屬喘息、規律回報"],
    ["長輩在家越來越少動", "透過團體律動、伸展、手作與社交互動，讓長輩重新建立活動量與生活期待。", "重點：活動參與、功能維持、生活刺激"],
    ["失智長輩需要規律", "用固定流程、熟悉人員、活動提示與友善環境，降低不安與抗拒。", "重點：熟悉節奏、情緒安撫、安全觀察"],
    ["出院後需要白天支持", "日照能承接白天活動、餐食、休息與觀察，搭配家屬與居家資源一起穩定恢復。", "重點：照顧銜接、體力恢復、家庭支持"]
  ];
  const qualityItems = [
    ["到離場都有觀察", "從報到、量測、精神狀態到離場準備，都會留意長輩今天是否和平常不同。"],
    ["活動設計有目的", "每一類活動都對應到身體、認知、情緒、社交或生活功能，不只是讓時間過去。"],
    ["餐食狀況要被看見", "用餐速度、食慾、飲水、吞嚥與精神變化，都可能是照顧調整的重要線索。"],
    ["交班回報要清楚", "團隊內部交班與對家屬回報能銜接，避免重要狀況只停留在某個人腦中。"],
    ["家屬意見會被整理", "家屬的擔心、長輩回家後的狀態與服務建議，都會回到照顧調整。"],
    ["跨服務能銜接", "當長輩需要居家照顧、護理復能、課程或其他資源時，可協助家屬整理下一步。"]
  ];
  const flow = [
    ["01", "電話諮詢", "了解長輩身體狀態、認知情形、生活習慣、交通需求與家屬最擔心的問題。"],
    ["02", "預約參觀", "讓家屬與長輩實際看見空間、活動安排、照顧人員與一日作息。"],
    ["03", "初步評估", "整理照顧風險、活動能力、用餐需求、情緒反應與適合參與的活動節奏。"],
    ["04", "試讀熟悉", "讓長輩慢慢熟悉環境與人員，降低第一次進入陌生場域的不安。"],
    ["05", "穩定出席", "依照出席頻率、活動參與、餐食與精神狀態，調整照顧安排。"],
    ["06", "家屬回報", "把每日重要觀察與建議回饋給家屬，必要時連結其他照顧資源。"]
  ];
  const faqs = [
    ["日間照顧和居家照顧差在哪裡？", "日間照顧是白天到中心接受照顧、活動、共餐與休息；居家照顧則是照顧服務員到家裡協助。兩者可以依家庭需求搭配。"],
    ["長輩不想去陌生地方怎麼辦？", "可以先參觀、短時間試讀或由家屬陪同熟悉。重點不是強迫長輩接受，而是慢慢建立安全感。"],
    ["日照中心一天會做什麼？", "通常會包含報到觀察、量測、活動、共餐、午休、下午活動、點心與回家準備，實際安排會依中心與長輩狀態調整。"],
    ["家屬可以知道長輩白天狀態嗎？", "可以。日照會回報出席、活動、餐食、精神狀況與特殊事件，讓家屬知道白天照顧重點。"],
    ["失智長輩適合日照嗎？", "許多失智長輩適合規律的日間照顧，但仍要依行為狀態、安全風險與中心照顧量能評估。"],
    ["如果只想先體驗可以嗎？", "可以先預約參觀或討論試讀安排，讓長輩與家屬確認環境、活動與照顧方式是否合適。"]
  ];

  return `
    <div class="service-detail-page day-care-page">
      <section class="service-detail-hero day-care-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Day Care</p>
          <h1>日間照顧</h1>
          <p>歲悅日間照顧把白天最需要被接住的照顧需求整理成一套穩定節奏：安全場域、規律活動、共餐休息、健康觀察、家屬回報與喘息支持，讓長輩白天有陪伴，晚上安心回家。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約參觀日照</a>
            <a class="secondary-button" href="#courses">查看體驗活動</a>
          </div>
          <div class="homecare-hero-points">
            <article><span>服務重點</span><strong>白天托顧、共餐休息、健康促進、團體活動、家屬回報</strong></article>
            <article><span>適合對象</span><strong>白天獨處、活動量下降、需要規律作息或家屬需要喘息的長輩</strong></article>
            <article><span>照顧特色</span><strong>讓長輩白天被看見、被陪伴、被鼓勵，也讓家屬能持續掌握狀態</strong></article>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/daycare-detail-01-exercise.png" alt="歲悅日間照顧團體活動情境" />
          <div>
            <span>Day Care Center</span>
            <strong>白天有生活，晚上安心回家。</strong>
          </div>
        </aside>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Focus</p>
          <h2>日間照顧在做什麼</h2>
          <span>日照不是把長輩安置一整天，而是用活動、餐食、休息、觀察與回報，幫家庭建立可持續的照顧節奏。</span>
        </div>
        <div class="service-highlight-grid">
          ${highlights.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-positioning">
        <div class="service-section-head">
          <p class="eyebrow">Family Pain Points</p>
          <h2>日間照顧承接的，是家庭每天白天最擔心的空窗。</h2>
          <span>歲悅不是只提供一個白天待著的地方，而是把照顧、活動、餐食、觀察與回報安排成可持續的日常。</span>
        </div>
        <div class="homecare-problem-grid">
          ${painPoints.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>這一頁新增 4 張日照情境圖，讓參觀者可以快速感受到中心的一日照顧節奏。</span>
        </div>
        <div class="homecare-gallery">
          ${scenes.map(([image, title, copy]) => `
            <figure>
              <img src="${image}" alt="${title}" />
              <figcaption>
                <strong>${title}</strong>
                <span>${copy}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Scenarios</p>
          <h2>哪些家庭適合日間照顧？</h2>
          <span>只要白天照顧開始成為家裡最大的壓力，日照就可能是讓家庭重新穩定的一個選項。</span>
        </div>
        <div class="homecare-scenario-grid">
          ${scenarios.map(([title, copy, tag]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
              <small>${tag}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Services</p>
          <h2>服務內容</h2>
          <span>依照長輩能力、家屬需求與出席頻率安排，不只照顧身體，也保留長輩的生活感。</span>
        </div>
        <div class="community-program-grid">
          ${serviceItems.map(([title, items, fit]) => `
            <article>
              <h3>${title}</h3>
              <p>${items}</p>
              <span>${fit}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">How It Works</p>
          <h2>從參觀到穩定出席</h2>
          <span>先讓長輩與家屬理解環境，再用試讀與回報建立信任，讓日照變成家庭穩定支持。</span>
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

      <section class="service-detail-section homecare-quality-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality System</p>
          <h2>好的日照，不只看活動熱不熱鬧，更要看細節有沒有被記住。</h2>
          <span>日照中心每天都有很多小變化。歲悅重視到離場觀察、活動參與、餐食狀態、團隊交班與家屬回報。</span>
        </div>
        <div class="homecare-quality-grid">
          ${qualityItems.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="homecare-family-board">
          <article>
            <p class="eyebrow">Daily Rhythm</p>
            <h2>一日照顧的重點，是讓長輩重新有生活節奏。</h2>
            <p>日照的價值不只是安全看顧，而是讓長輩在白天有互動、有活動、有休息、有被鼓勵的時刻。當白天變得穩定，家裡晚上的照顧壓力也會跟著下降。</p>
          </article>
          <article>
            <b>AM</b>
            <h3>報到與健康觀察</h3>
            <p>進門問候、確認精神、量測或觀察身體狀態，讓團隊知道今天該如何安排活動強度。</p>
          </article>
          <article>
            <b>NOON</b>
            <h3>共餐與午休</h3>
            <p>觀察用餐、飲水、吞嚥與休息狀況，讓照顧不只停留在活動表上。</p>
          </article>
          <article>
            <b>PM</b>
            <h3>活動與回家準備</h3>
            <p>下午活動後整理物品、交接提醒，讓家屬知道今天的狀態與需要留意的事情。</p>
          </article>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>家屬常見問題</h2>
          <span>正式加入前，最重要的是讓長輩熟悉場域，也讓家屬清楚知道照顧方式。</span>
        </div>
        <div class="software-faq-list">
          ${faqs.map(([question, answer]) => `
            <details>
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Visit Day Care</p>
          <h2>想讓家人白天有安全又有活力的照顧場域？</h2>
          <p>留下需求後，歲悅會協助確認長輩狀態、交通距離、體驗參觀時段與適合的日照參與方式。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡我們</a>
      </section>
    </div>
  `;
}

function renderNursingPage() {
  const highlights = [
    ["看見身體變化", "護理觀察不是只量數字，而是把血壓、食慾、睡眠、皮膚、傷口、用藥與精神狀態放回生活脈絡裡判斷。"],
    ["把能力練回生活", "復能不是做漂亮動作，而是讓長輩能更安全地起身、移位、走路、用餐、洗澡與參與日常。"],
    ["讓家屬學會方法", "把移位、翻身、跌倒預防、居家動線、用餐姿勢與照顧觀察教給家屬和照顧者。"],
    ["跨專業一起追蹤", "護理、治療、督導、照服員與家庭用同一套紀錄理解狀態，避免每個人各說各話。"]
  ];
  const painPoints = [
    ["出院後不敢動", "長輩回家後常因怕跌倒、怕痛、怕麻煩而越來越少活動，能力反而退得更快。"],
    ["家屬不知道怎麼扶", "起身、移位、洗澡、上廁所都怕出事，照顧者常用蠻力撐，長期下來人也受傷。"],
    ["健康數字看不懂", "血壓、食慾、睡眠、傷口、精神狀態出現變化時，家屬不知道哪些需要注意、哪些需要就醫。"],
    ["居家環境有風險", "浴室濕滑、床邊動線、椅子高度、夜間照明與門檻，都可能讓長輩跌倒或不敢活動。"],
    ["訓練無法延續", "在專業人員面前做得到，回家卻不知道怎麼練、練多久、什麼狀況要停止。"],
    ["照顧者缺少回饋", "家屬、移工或照服員每天都在照顧，但很少有人回頭看方法是否正確、是否需要調整。"]
  ];
  const scenes = [
    ["assets/nursing-detail-01-vitals.png", "護理觀察與健康量測", "從血壓、精神、食慾與日常變化看見風險，讓家屬知道什麼需要注意。"],
    ["assets/nursing-detail-02-walking.png", "步行與移位練習", "復能不是催促長輩，而是用安全步調陪他一步一步重新找回把握。"],
    ["assets/nursing-detail-03-home-safety.png", "居家安全與家屬教學", "把浴室、床邊、動線與扶手配置說清楚，降低家庭照顧的意外風險。"],
    ["assets/nursing-detail-04-care-plan.png", "跨專業目標討論", "護理、治療、照顧與家屬一起確認目標，讓練習回到真實生活。"]
  ];
  const serviceItems = [
    ["健康狀態追蹤", "血壓、食慾、睡眠、排泄、皮膚、傷口、用藥與精神狀態觀察。", "適合出院返家、慢性病、身體狀況不穩或家屬需要判斷指引者。"],
    ["復能訓練支持", "坐站、移位、步行、平衡、肌力、耐力與日常生活動作練習。", "適合希望恢復活動能力、降低臥床與維持生活自理者。"],
    ["居家安全建議", "床邊動線、浴室安全、扶手、照明、門檻、椅高與防滑配置建議。", "適合有跌倒風險、家中動線不順或家屬擔心意外者。"],
    ["照顧技巧教學", "移位、翻身、拍背、沐浴安全、陪走、用餐姿勢與日常觀察方法。", "適合家屬、移工、照服員共同照顧，需要統一方法的家庭。"],
    ["復能目標設計", "把專業訓練拆成生活目標，例如安全走到浴室、自己坐起、穩定用餐。", "適合不想只做訓練，而想改善真正生活場景的長輩。"],
    ["營養與吞嚥提醒", "觀察食慾、飲水、吞嚥、餐具姿勢與用餐疲累狀況，提供照顧提醒。", "適合用餐速度變慢、容易嗆咳、食慾下降或體力不足者。"],
    ["照顧紀錄與回報", "整理每次觀察、練習內容、家屬提醒、風險變化與後續建議。", "適合需要多人協作、希望照顧資訊透明可追蹤的家庭。"],
    ["跨服務銜接", "依需求銜接居家照顧、日間照顧、輔具資源、課程或家庭照顧支持。", "適合需求變化快、需要整合不同服務的家庭。"]
  ];
  const scenarios = [
    ["出院返家後體力下降", "協助家屬理解哪些活動可以練、哪些要避免，並把復能目標拆回日常生活。", "重點：返家銜接、體力恢復、安全活動"],
    ["跌倒後不敢走", "透過步行、平衡、坐站與環境調整，陪長輩慢慢恢復移動信心。", "重點：跌倒預防、步態安全、心理支持"],
    ["家屬照顧方法不一致", "把移位、翻身、陪走、沐浴與用餐方法統一，降低家屬與照顧者之間的落差。", "重點：家庭教學、照顧一致性、風險降低"],
    ["慢性病與功能退化並存", "同時追蹤健康狀態與生活功能，避免只看疾病數字，卻忽略長輩每天能不能生活。", "重點：護理觀察、復能支持、生活功能"]
  ];
  const qualityItems = [
    ["先評估再練習", "每一次復能都要先看精神、疼痛、血壓、活動能力與安全風險，不是直接開始訓練。"],
    ["目標要回到生活", "復能目標不是只看步數或肌力，而是能不能安全起身、走到廁所、坐穩吃飯。"],
    ["家屬要學得會", "專業人員做得到不夠，家屬與照顧者也要理解怎麼做、何時停止、何時求助。"],
    ["環境要一起調整", "如果床、椅、浴室、照明與動線不安全，再多訓練都可能被居家風險抵消。"],
    ["紀錄要能追蹤", "每次練習內容、身體反應、風險提醒與下次目標都要留下來，讓照顧能延續。"],
    ["跨專業要對齊", "護理、治療、督導、照服員與家屬需要用同一套目標說話，才不會互相抵消。"]
  ];
  const flow = [
    ["01", "需求諮詢", "了解長輩疾病史、近期變化、出院狀態、跌倒經驗、家屬擔心與生活目標。"],
    ["02", "護理與功能評估", "整理健康狀態、活動能力、用藥、疼痛、居家環境與照顧者能力。"],
    ["03", "目標設定", "把復能目標拆成小步驟，例如安全起身、穩定步行、自己用餐或到浴室。"],
    ["04", "到宅或場域支持", "由專業人員陪同練習，並同步教家屬與照顧者日常照顧方法。"],
    ["05", "居家環境調整", "依實際動線提出扶手、防滑、照明、床椅高度與輔具使用建議。"],
    ["06", "追蹤與轉介", "依紀錄與回饋調整訓練強度，必要時銜接醫療、輔具、居家或日照服務。"]
  ];
  const faqs = [
    ["護理復能和一般復健有什麼不同？", "護理復能更重視生活場景、居家風險、照顧者教學與日常延續，不只是在場域中完成訓練動作。"],
    ["長輩很虛弱也可以做復能嗎？", "可以先從安全評估、姿勢調整、床邊活動、坐站或低強度練習開始，重點是依狀態安排，不勉強。"],
    ["家屬需要一起學嗎？", "非常建議。復能真正有效的關鍵，是家屬與照顧者在每天生活中能用正確方式陪伴。"],
    ["可以協助居家安全建議嗎？", "可以。會從浴室、床邊、走道、照明、門檻、椅高與常用物品位置看起，協助降低跌倒與移位風險。"],
    ["服務會留下紀錄嗎？", "會。每次服務會整理觀察、練習內容、身體反應與後續提醒，讓家庭與團隊能持續追蹤。"],
    ["護理復能可以和居家照顧搭配嗎？", "可以。復能人員設定方法與目標後，居家照顧服務員與家屬可以在日常中協助延續。"]
  ];

  return `
    <div class="service-detail-page nursing-page">
      <section class="service-detail-hero nursing-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Nursing & Reablement</p>
          <h1>護理復能</h1>
          <p>歲悅護理復能把護理觀察、生活功能評估、復能訓練、居家安全與家屬教學串在一起，讓長輩不是被動被照顧，而是在安全支持下重新練回能參與生活的能力。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約復能諮詢</a>
            <a class="secondary-button" href="#health">閱讀復能知識</a>
          </div>
          <div class="homecare-hero-points">
            <article><span>服務重點</span><strong>護理觀察、功能評估、步行移位、居家安全、家屬教學與追蹤回報</strong></article>
            <article><span>適合對象</span><strong>出院返家、跌倒後不敢動、體力下降、慢性病或照顧方法需要調整者</strong></article>
            <article><span>核心目標</span><strong>讓復能回到生活，不只練身體，也讓家庭知道每天怎麼陪伴</strong></article>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/nursing-detail-02-walking.png" alt="歲悅護理復能步行練習情境" />
          <div>
            <span>Nursing Reablement</span>
            <strong>復能不是催促，而是陪長輩一步一步重新有把握。</strong>
          </div>
        </aside>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Focus</p>
          <h2>護理復能在做什麼</h2>
          <span>以護理觀察看見風險，以復能練習維持功能，再把方法教給家庭，讓照顧能延續到每天。</span>
        </div>
        <div class="service-highlight-grid">
          ${highlights.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-positioning">
        <div class="service-section-head">
          <p class="eyebrow">Family Pain Points</p>
          <h2>護理復能處理的，是家屬每天最怕做錯的照顧細節。</h2>
          <span>不是只把長輩帶去練習，而是回到家裡真正會發生的移位、步行、用餐、沐浴與安全問題。</span>
        </div>
        <div class="homecare-problem-grid">
          ${painPoints.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>這一頁新增 4 張護理復能情境圖，呈現健康量測、步行訓練、居家安全與跨專業討論。</span>
        </div>
        <div class="homecare-gallery">
          ${scenes.map(([image, title, copy]) => `
            <figure>
              <img src="${image}" alt="${title}" />
              <figcaption>
                <strong>${title}</strong>
                <span>${copy}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Scenarios</p>
          <h2>哪些家庭適合護理復能？</h2>
          <span>只要長輩的身體變化開始影響生活能力，或家屬不知道怎麼安全照顧，就適合先做復能與照顧評估。</span>
        </div>
        <div class="homecare-scenario-grid">
          ${scenarios.map(([title, copy, tag]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
              <small>${tag}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Services</p>
          <h2>服務內容</h2>
          <span>護理復能會依照長輩身體狀況、生活目標與家庭照顧能力安排，不做過度訓練，也不放任風險。</span>
        </div>
        <div class="community-program-grid">
          ${serviceItems.map(([title, items, fit]) => `
            <article>
              <h3>${title}</h3>
              <p>${items}</p>
              <span>${fit}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-quality-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality System</p>
          <h2>復能要走得長，必須把專業變成家庭每天做得到的方法。</h2>
          <span>歲悅重視評估、目標、教學、環境、紀錄與跨專業協作，讓復能不是一次性的訓練，而是能延續的生活支持。</span>
        </div>
        <div class="homecare-quality-grid">
          ${qualityItems.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="homecare-family-board">
          <article>
            <p class="eyebrow">Reablement Philosophy</p>
            <h2>復能不是要長輩變回以前，而是讓現在的生活多一點把握。</h2>
            <p>我們會尊重長輩目前的身體狀態與意願，把專業目標轉成家庭看得懂的生活任務。能安全坐起來、能穩定走到餐桌、能自己拿杯子喝水，這些都是值得被看見的進步。</p>
          </article>
          <article>
            <b>01</b>
            <h3>先保安全</h3>
            <p>評估血壓、疼痛、跌倒風險與環境動線，避免用錯方法造成二次傷害。</p>
          </article>
          <article>
            <b>02</b>
            <h3>再練能力</h3>
            <p>把坐站、移位、步行與日常活動拆成長輩能完成的小步驟。</p>
          </article>
          <article>
            <b>03</b>
            <h3>最後延續</h3>
            <p>教會家屬與照顧者如何在每天生活中安全陪伴與觀察變化。</p>
          </article>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">How It Works</p>
          <h2>從評估到生活能力恢復</h2>
          <span>先理解長輩的身體狀態，再把復能目標放回真正的生活場景裡。</span>
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>家屬常見問題</h2>
          <span>護理復能最重要的是先安全、再練習、最後把方法留在家裡。</span>
        </div>
        <div class="software-faq-list">
          ${faqs.map(([question, answer]) => `
            <details>
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Reablement Support</p>
          <h2>想讓長輩安全恢復更多生活能力？</h2>
          <p>留下需求後，歲悅會協助確認長輩狀態、復能目標、家庭照顧方式與適合的護理復能支持。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡我們</a>
      </section>
    </div>
  `;
}

function renderMigrantTrainingPage() {
  const highlights = [
    ["把技能教到能做", "翻身、移位、沐浴、如廁、用餐、陪走與拍背都要拆成看得懂、練得會、回家後做得出來的步驟。"],
    ["把溝通變成共同語言", "協助移工理解家屬期待、長輩情緒、每日回報與突發狀況處理，降低誤會。"],
    ["把安全放進每個動作", "跌倒預防、感染控制、用藥提醒、營養觀察、環境安全與緊急狀況都要能被實作。"],
    ["把訓練延續到家庭", "課後可搭配督導回饋、家屬諮詢、複訓安排與照顧紀錄，讓技巧真的進到日常。"]
  ];
  const painPoints = [
    ["移工聽過但不會做", "很多課程停留在聽講，回到家面對洗澡、移位、餵食、情緒抗拒時仍不知道如何操作。"],
    ["家屬交代不清楚", "家屬常用自己的經驗交代事情，但沒有把優先順序、禁忌、回報方式與緊急處理說成共同語言。"],
    ["長輩拒絕照顧", "移工需要理解長輩為什麼抗拒，也要學會用合適語氣、順序與情境引導，而不是硬做。"],
    ["安全動作不穩定", "翻身、移位、扶走、沐浴和用餐是高風險情境，只要姿勢錯，長輩和照顧者都可能受傷。"],
    ["文化與語言有落差", "家庭期待、長輩習慣、照顧價值和回報方式不同，若沒有演練，很容易累積摩擦。"],
    ["訓練後沒有人追蹤", "如果課後沒有回饋與複訓，學到的技巧很容易在真實家庭壓力中變形。"]
  ];
  const scenes = [
    ["assets/migrant-detail-01-classroom.png", "課堂示範與分組練習", "把照顧技能拆成步驟，讓移工不只聽懂，也能實際操作。"],
    ["assets/migrant-detail-02-transfer.png", "安全移位實作", "床到輪椅、翻身與扶走都要反覆演練，降低長輩與照顧者受傷風險。"],
    ["assets/migrant-detail-03-meal.png", "餐食與營養照顧", "從備餐、吞嚥、餵食姿勢到飲水提醒，讓日常照顧更細緻。"],
    ["assets/migrant-detail-04-communication.png", "家庭溝通情境演練", "透過角色扮演練習每日回報、家屬交代與長輩抗拒照顧的處理。"]
  ];
  const serviceItems = [
    ["基礎身體照顧", "翻身、拍背、移位、沐浴、如廁、穿脫衣物、陪走與床邊照顧。", "適合剛到家庭服務或需要建立基礎照顧技巧的移工。"],
    ["安全移位與防跌", "床到輪椅、椅到站立、浴室動線、扶走姿勢、跌倒預防與輔具使用。", "適合家中長輩行動不穩、跌倒風險高或照顧者常用蠻力者。"],
    ["餐食與營養觀察", "備餐、軟質餐、飲水提醒、餵食姿勢、吞嚥觀察、食慾與體重變化。", "適合長輩食慾下降、吞嚥不順或家屬擔心營養不足者。"],
    ["失智與情緒照顧", "重複詢問、抗拒洗澡、日夜顛倒、情緒不安與熟悉線索引導。", "適合照顧認知退化、失智症或情緒起伏較大的長輩。"],
    ["家庭溝通與回報", "家屬交代、每日回報、異常提醒、照片紀錄、照顧邊界與衝突處理。", "適合家庭溝通容易卡住、照顧分工不清或期待不同者。"],
    ["衛教與感染控制", "手部衛生、口腔清潔、皮膚觀察、傷口提醒、感染預防與用藥安全。", "適合慢性病、臥床、皮膚脆弱或需長期照顧的家庭。"],
    ["突發狀況處理", "跌倒、嗆咳、發燒、意識改變、呼吸不適與緊急聯絡流程。", "適合需要建立家庭緊急處理 SOP 的雇主與照顧者。"],
    ["證書與複訓", "課程紀錄、完訓證明、技能回饋、複訓安排與督導建議。", "適合企業、家庭或仲介單位安排系統化訓練。"]
  ];
  const scenarios = [
    ["新聘移工剛到家", "先建立基礎照顧方法、家庭規則、長輩習慣與每日回報方式，降低磨合期混亂。", "重點：基礎技能、家庭交接、日常回報"],
    ["家中有高風險動作", "針對移位、洗澡、如廁、扶走與床邊照顧反覆演練，避免照顧者與長輩一起受傷。", "重點：安全移位、防跌、照顧者保護"],
    ["長輩有失智或抗拒照顧", "透過情境演練理解行為背後需求，學習非強迫式溝通、環境提示與活動引導。", "重點：失智友善、情緒安撫、溝通引導"],
    ["雇主想建立一致照顧標準", "把家庭禁忌、服務期待、回報方式、緊急流程與照顧紀錄整理成共同規則。", "重點：雇主溝通、流程標準、照顧紀錄"]
  ];
  const qualityItems = [
    ["先看照顧場景", "課程不是套版教材，會先理解長輩狀態、家庭環境、移工語言能力與家屬期待。"],
    ["示範後要實作", "每個動作都要從老師示範進到學員練習，才知道回家後能不能真的做。"],
    ["錯誤動作要修正", "訓練現場會看姿勢、力道、站位、語氣與流程，避免錯誤技巧被帶回家庭。"],
    ["回報方式要一致", "家屬需要知道移工每天該回報什麼，移工也要知道哪些狀況不能自己判斷。"],
    ["語言文化要被考慮", "用圖像、示範、簡單語句與角色扮演降低理解落差，讓課程更接近真實家庭。"],
    ["課後要能追蹤", "透過複訓、督導建議與家屬諮詢，讓培訓效果能持續延伸到照顧現場。"]
  ];
  const flow = [
    ["01", "確認家庭情境", "了解照顧對象狀態、家庭規則、移工語言能力、照顧困難與最需要補強的技能。"],
    ["02", "設計課程模組", "依需求組合基礎照顧、安全移位、餐食營養、失智陪伴、溝通回報與衛教安全。"],
    ["03", "示範與分解", "由講師把每個照顧動作拆解成順序、站位、提醒語與注意事項。"],
    ["04", "實作與角色演練", "透過分組練習、情境演練與即時修正，確認學員不是只聽懂。"],
    ["05", "家屬共識整理", "把家屬期待、禁忌、回報方式、緊急流程與照顧紀錄整理成可執行規則。"],
    ["06", "訓後回饋與複訓", "課後提供重點回饋，必要時安排複訓、督導諮詢或家庭照顧建議。"]
  ];
  const faqs = [
    ["移工培訓可以客製化嗎？", "可以。可以依長輩狀態、家庭環境、移工語言能力與雇主期待，安排不同課程模組。"],
    ["家屬需要一起上課嗎？", "建議家屬至少參與需求確認或重點回饋，因為照顧標準與回報方式需要家庭一起對齊。"],
    ["課程會有實作嗎？", "會。移位、翻身、餵食、沐浴安全、溝通情境等都會用示範與演練確認學員理解。"],
    ["適合剛來台灣的移工嗎？", "適合。課程會盡量用圖像、示範、簡單語句與實作降低理解門檻。"],
    ["可以提供完訓證明嗎？", "可以依課程規劃提供課程紀錄或完訓證明，適合家庭、企業或合作單位留存。"],
    ["如果課後在家還是遇到問題怎麼辦？", "可再安排複訓、督導諮詢或家庭照顧建議，把實際問題帶回課程調整。"]
  ];

  return `
    <div class="service-detail-page migrant-training-page">
      <section class="service-detail-hero migrant-training-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Migrant Care Training</p>
          <h1>移工培訓</h1>
          <p>歲悅移工培訓把家庭照顧現場常見的困難轉成可練習、可回報、可追蹤的課程，讓移工、家屬與長輩之間有共同語言，也讓照顧技巧真正能回到家裡使用。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">洽詢培訓課程</a>
            <a class="secondary-button" href="#courses">查看課程報名</a>
          </div>
          <div class="homecare-hero-points">
            <article><span>訓練重點</span><strong>身體照顧、安全移位、餐食營養、失智陪伴、家庭溝通與緊急處理</strong></article>
            <article><span>適合對象</span><strong>剛到家庭服務、需要補強技能、或雇主希望建立一致照顧標準的移工</strong></article>
            <article><span>課程特色</span><strong>示範、實作、角色演練與訓後回饋，讓技能不只停在課堂</strong></article>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/migrant-detail-01-classroom.png" alt="歲悅移工照顧培訓課堂情境" />
          <div>
            <span>Training Program</span>
            <strong>把照顧技巧教到能真的回家使用。</strong>
          </div>
        </aside>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Training Focus</p>
          <h2>移工培訓在做什麼</h2>
          <span>不是上完課就結束，而是把家庭照顧的真實情境拆解成技能、溝通、安全與回報。</span>
        </div>
        <div class="service-highlight-grid">
          ${highlights.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-positioning">
        <div class="service-section-head">
          <p class="eyebrow">Training Pain Points</p>
          <h2>移工培訓要解決的，不只是「會不會做」，而是家庭能不能一起做對。</h2>
          <span>移工、家屬與長輩常常卡在同一件事：方法沒有說清楚、現場沒練過、回家後沒人追蹤。</span>
        </div>
        <div class="homecare-problem-grid">
          ${painPoints.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Training Scenes</p>
          <h2>訓練現場情境</h2>
          <span>這一頁新增 4 張移工培訓情境圖，呈現課堂、移位、餐食照顧與家庭溝通演練。</span>
        </div>
        <div class="homecare-gallery">
          ${scenes.map(([image, title, copy]) => `
            <figure>
              <img src="${image}" alt="${title}" />
              <figcaption>
                <strong>${title}</strong>
                <span>${copy}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Scenarios</p>
          <h2>哪些家庭或單位適合移工培訓？</h2>
          <span>只要家庭照顧開始出現溝通落差、技巧不穩或安全風險，就需要把方法重新對齊。</span>
        </div>
        <div class="homecare-scenario-grid">
          ${scenarios.map(([title, copy, tag]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
              <small>${tag}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Courses</p>
          <h2>培訓內容</h2>
          <span>課程可以依家庭、企業或合作單位需求調整，讓不同程度的照顧者都能找到適合模組。</span>
        </div>
        <div class="community-program-grid">
          ${serviceItems.map(([title, items, fit]) => `
            <article>
              <h3>${title}</h3>
              <p>${items}</p>
              <span>${fit}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-quality-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality System</p>
          <h2>好的培訓，不是上完課，而是回家後照顧真的變穩。</h2>
          <span>歲悅重視需求、示範、實作、修正、溝通與訓後追蹤，讓培訓變成家庭照顧品質的一部分。</span>
        </div>
        <div class="homecare-quality-grid">
          ${qualityItems.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="homecare-family-board">
          <article>
            <p class="eyebrow">Training Philosophy</p>
            <h2>我們不是只教移工，而是幫整個家庭建立照顧共識。</h2>
            <p>移工培訓如果只要求移工學會，卻沒有讓家屬說清楚期待、禁忌與回報方式，照顧仍然會卡住。歲悅把課程設計成家庭共同語言，讓每一個照顧動作都有人知道為什麼這樣做。</p>
          </article>
          <article>
            <b>01</b>
            <h3>先對齊期待</h3>
            <p>確認家庭規則、長輩習慣、服務邊界與每日回報方式。</p>
          </article>
          <article>
            <b>02</b>
            <h3>再練習技能</h3>
            <p>用示範與實作讓移位、沐浴、用餐、陪走不只停在聽懂。</p>
          </article>
          <article>
            <b>03</b>
            <h3>最後追蹤改善</h3>
            <p>把課後遇到的問題帶回回饋與複訓，讓照顧越來越穩。</p>
          </article>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">How It Works</p>
          <h2>從需求到訓後支持</h2>
          <span>先理解家庭照顧問題，再安排課程與演練，最後用回饋讓訓練不只是一次性活動。</span>
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>家屬常見問題</h2>
          <span>移工培訓最重要的是讓技能、溝通與回報方式都能回到家庭現場。</span>
        </div>
        <div class="software-faq-list">
          ${faqs.map(([question, answer]) => `
            <details>
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Training Inquiry</p>
          <h2>想讓家中的照顧方法更穩定嗎？</h2>
          <p>留下需求後，歲悅會協助確認照顧情境、訓練人數、語言需求與適合的移工培訓模組。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡我們</a>
      </section>
    </div>
  `;
}

function renderQualityPage() {
  const highlights = [
    ["把經驗整理成教材", "第一線的好做法不能只留在資深人員身上，要轉成教材、流程、案例與檢核表。"],
    ["把新人帶進標準", "新人不只需要知道工作內容，更要理解歲悅的照顧語言、服務邊界、紀錄方式與家屬溝通。"],
    ["把紀錄變成品質線索", "服務紀錄不是行政作業，而是看見風險、追蹤改善與判斷訓練需求的重要依據。"],
    ["把問題轉成改善", "品管不是抓錯，而是把家屬回饋、異常事件與現場困難轉成下一次更穩的流程。"]
  ];
  const painPoints = [
    ["好服務靠個人經驗", "如果服務品質只靠資深人員提醒，新人一多、據點一多，做法就容易不一致。"],
    ["訓練上完就忘", "課程如果沒有對應現場情境、紀錄檢核與督導回饋，學到的內容很難落地。"],
    ["紀錄寫了但沒被用", "服務紀錄若只是留存，沒有被回看、分析與轉成行動，就無法真的改善品質。"],
    ["家屬回饋沒有閉環", "家屬提出問題後，如果沒有處理狀態、改善責任與追蹤結果，信任就會流失。"],
    ["跨部門資訊斷裂", "教育、督導、行政與現場如果各自處理問題，服務品質就很難累積成制度。"],
    ["擴張時品質容易掉", "當服務量、據點與人員增加，如果沒有標準化中台支撐，品質落差會快速放大。"]
  ];
  const scenes = [
    ["assets/quality-detail-01-materials.png", "教材與流程整理", "把照顧現場的經驗整理成可學習、可複製、可追蹤的訓練資料。"],
    ["assets/quality-detail-02-training.png", "內部教育訓練", "訓練不是把人叫來上課，而是讓服務方法、語言與判斷更一致。"],
    ["assets/quality-detail-03-audit.png", "服務紀錄檢核", "從紀錄看見服務品質、照顧風險與需要再支持的現場問題。"],
    ["assets/quality-detail-04-improvement.png", "品質改善會議", "讓督導、教育與營運一起把問題轉成下一輪改善行動。"]
  ];
  const serviceItems = [
    ["新人訓練制度", "品牌理念、服務倫理、照顧流程、紀錄規範、家屬溝通與異常回報。", "適合新進照服員、督導、行政與跨部門新人。"],
    ["在職訓練規劃", "失智照顧、移位安全、溝通技巧、風險辨識、服務紀錄與專題課程。", "適合需要持續提升專業與一致做法的服務團隊。"],
    ["服務標準建立", "照顧流程、紀錄格式、風險提醒、家屬回報、交班與異常處理標準。", "適合擴張服務量或多據點營運時維持品質。"],
    ["紀錄與稽核", "服務紀錄、督導訪視、家屬回饋、課程出席、異常事件與改善追蹤。", "適合需要定期檢視服務穩定度與風險的單位。"],
    ["案例討論會", "把真實照顧事件轉成案例，討論判斷、溝通、流程與下次可改善行動。", "適合督導、照服員與教育品管共同學習。"],
    ["家屬回饋管理", "整理家屬問題、處理狀態、責任分工、回覆內容與追蹤結果。", "適合想建立信任閉環與客訴改善機制的團隊。"],
    ["異常事件改善", "問題盤點、原因分析、改善方案、追蹤指標、回饋會議與再教育。", "適合要把現場問題轉成制度改善的服務單位。"],
    ["管理報表設計", "訓練覆蓋率、稽核完成率、缺失類型、改善進度與服務品質指標。", "適合需要管理者快速掌握品質狀態的組織。"]
  ];
  const scenarios = [
    ["新據點或新團隊建立", "先建立教材、流程、交班、紀錄與督導標準，避免團隊各做各的。", "重點：新人訓練、SOP、服務標準"],
    ["服務量快速增加", "用訓練、稽核與報表管理品質落差，讓擴張不犧牲服務穩定度。", "重點：品質中台、稽核追蹤、管理報表"],
    ["家屬回饋變多", "把問題分類、處理狀態、改善責任與回覆節奏建立起來，讓信任能被修復。", "重點：回饋管理、客訴閉環、改善追蹤"],
    ["現場問題反覆發生", "透過案例討論、原因分析與再教育，把重複問題轉成制度調整。", "重點：案例討論、異常改善、再教育"]
  ];
  const qualityItems = [
    ["教材要來自現場", "教材不是漂亮簡報，而是從服務紀錄、督導回饋、家屬問題與實際案例整理出來。"],
    ["訓練要能被驗證", "上課不是結束，要看出席、測驗、演練、紀錄與服務表現是否真的改變。"],
    ["稽核不是找麻煩", "稽核是為了看見風險與缺口，讓現場知道下一步怎麼修正。"],
    ["改善要有負責人", "每個改善行動都要有責任人、期限、追蹤狀態與回看機制。"],
    ["資料要回到管理", "訓練、紀錄、稽核、回饋與異常資料要能變成管理者看得懂的品質指標。"],
    ["文化要支持學習", "品管要讓前線敢回報問題、願意討論案例，而不是害怕被責備。"]
  ];
  const flow = [
    ["01", "盤點品質議題", "整理服務紀錄、家屬回饋、督導觀察、異常事件與現場常見問題。"],
    ["02", "建立標準與教材", "把議題轉成教材、流程、演練情境、檢核表與可追蹤指標。"],
    ["03", "安排訓練與演練", "依職務、場域與服務類型安排新人訓練、在職課程與案例討論。"],
    ["04", "執行紀錄檢核", "檢視服務紀錄、家屬回報、督導訪視與異常處理是否符合標準。"],
    ["05", "召開改善會議", "跨部門討論原因、責任、改善方案與需要再教育的內容。"],
    ["06", "追蹤改善成效", "定期回看訓練覆蓋率、問題類型、改善進度與服務品質變化。"]
  ];
  const faqs = [
    ["教育品管是在抓錯嗎？", "不是。教育品管的目標是讓問題被看見、被討論、被改善，讓前線更有方法，而不是讓人害怕回報。"],
    ["哪些人需要接受教育訓練？", "照服員、督導、行政、課務、管理者都需要。不同角色會有不同訓練重點。"],
    ["服務紀錄為什麼重要？", "紀錄能看見長輩狀態、服務落差、家屬回饋與風險變化，是品質管理最重要的資料來源之一。"],
    ["可以協助其他單位建立品管制度嗎？", "可以依需求協助規劃教材、流程、稽核表、回饋機制與改善追蹤方式。"],
    ["教育品管和後台 CMS 有關嗎？", "有。文章、課程、檔案、表單、內容健康檢查與網站流量中心，都能成為管理與改善的一部分。"],
    ["怎麼知道改善有沒有效？", "需要設定指標，例如訓練完成率、稽核缺失改善率、家屬回饋處理時間與重複問題下降情形。"]
  ];

  return `
    <div class="service-detail-page quality-page">
      <section class="service-detail-hero quality-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Education & Quality</p>
          <h1>教育品管</h1>
          <p>歲悅教育品管把前線服務、督導經驗、家屬回饋、服務紀錄與訓練制度串在一起，讓照顧品質不只是靠個人熱情，而是能被整理、被訓練、被追蹤、被持續改善。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">洽詢品管合作</a>
            <a class="secondary-button" href="#courses">查看訓練課程</a>
          </div>
          <div class="homecare-hero-points">
            <article><span>品管重點</span><strong>教材、訓練、紀錄、稽核、家屬回饋、異常改善與管理報表</strong></article>
            <article><span>適合對象</span><strong>照服員、督導、行政、課務、管理者與正在擴張服務的長照團隊</strong></article>
            <article><span>核心價值</span><strong>讓好服務可以被學會、被複製，也可以在問題發生後被修正</strong></article>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/quality-detail-04-improvement.png" alt="歲悅教育品管品質改善會議情境" />
          <div>
            <span>Quality System</span>
            <strong>讓好的照顧可以被教會，也可以被穩定複製。</strong>
          </div>
        </aside>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality Focus</p>
          <h2>教育品管在做什麼</h2>
          <span>把照顧現場的經驗轉成教材、標準、紀錄與改善流程，讓團隊在擴張時仍能維持服務品質。</span>
        </div>
        <div class="service-highlight-grid">
          ${highlights.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-positioning">
        <div class="service-section-head">
          <p class="eyebrow">Quality Pain Points</p>
          <h2>教育品管要處理的，是服務擴張後最容易被忽略的品質落差。</h2>
          <span>當人員、據點與服務量增加，品質不能只靠提醒，而要靠一套能學習、能檢核、能改善的制度。</span>
        </div>
        <div class="homecare-problem-grid">
          ${painPoints.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality Scenes</p>
          <h2>教育品管情境</h2>
          <span>這一頁新增 4 張教育品管情境圖，呈現教材整理、內訓課堂、紀錄稽核與改善會議。</span>
        </div>
        <div class="homecare-gallery">
          ${scenes.map(([image, title, copy]) => `
            <figure>
              <img src="${image}" alt="${title}" />
              <figcaption>
                <strong>${title}</strong>
                <span>${copy}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Scenarios</p>
          <h2>哪些團隊最需要教育品管？</h2>
          <span>服務越多、據點越多、人員越多，就越需要把照顧品質整理成系統。</span>
        </div>
        <div class="homecare-scenario-grid">
          ${scenarios.map(([title, copy, tag]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
              <small>${tag}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality Modules</p>
          <h2>品管服務內容</h2>
          <span>以訓練、標準、稽核與改善四個模組承接服務品質，讓前線有方法、管理者有依據。</span>
        </div>
        <div class="community-program-grid">
          ${serviceItems.map(([title, items, fit]) => `
            <article>
              <h3>${title}</h3>
              <p>${items}</p>
              <span>${fit}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-quality-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality System</p>
          <h2>品管不是單一部門的事，而是讓整個組織一起變穩的方式。</h2>
          <span>歲悅用教材、訓練、稽核、改善會議與管理報表，把前線經驗整理成可以持續運作的品質系統。</span>
        </div>
        <div class="homecare-quality-grid">
          ${qualityItems.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="homecare-family-board">
          <article>
            <p class="eyebrow">Quality Philosophy</p>
            <h2>我們相信，照顧品質不是被要求出來的，而是被支持出來的。</h2>
            <p>前線願意學、督導願意回饋、行政願意整理資料、管理者願意修正流程，品質才會真正提升。教育品管的目的，是讓每個人知道問題可以被說出來，也可以被一起解決。</p>
          </article>
          <article>
            <b>01</b>
            <h3>讓方法一致</h3>
            <p>把照顧流程、紀錄、回報與異常處理整理成清楚標準。</p>
          </article>
          <article>
            <b>02</b>
            <h3>讓問題可追</h3>
            <p>透過紀錄、稽核、家屬回饋與改善狀態，看見品質變化。</p>
          </article>
          <article>
            <b>03</b>
            <h3>讓團隊成長</h3>
            <p>把案例、問題與改善變成下一輪訓練，讓團隊越做越穩。</p>
          </article>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">How It Works</p>
          <h2>從現場問題到制度改善</h2>
          <span>教育品管的重點不是抓錯，而是把問題轉成團隊下一次能做得更好的方法。</span>
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>常見問題</h2>
          <span>教育品管的核心，是把現場經驗變成組織能長期使用的服務能力。</span>
        </div>
        <div class="software-faq-list">
          ${faqs.map(([question, answer]) => `
            <details>
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Quality Partnership</p>
          <h2>想讓照顧服務品質變成可管理的系統？</h2>
          <p>留下需求後，歲悅會協助確認訓練對象、品管目標、目前流程與適合的教育品管模組。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡我們</a>
      </section>
    </div>
  `;
}

function renderInvestorRecruitingPage() {
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
      <section class="service-detail-hero investor-recruit-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Investor Recruiting</p>
          <h1>投資人招募</h1>
          <p>歲悅長照集團正在尋找理解長照產業、認同在地服務網絡與長期品牌價值的投資夥伴。這不是單一據點生意，而是用服務密度、標準化訓練與品管中台建立可擴張的照顧基礎建設。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約投資洽談</a>
            <a class="secondary-button" href="#investors">前往投資人專區</a>
          </div>
        </div>
        <aside class="service-hero-card investor-recruit-card">
          <img src="assets/homepage-batch/04-admin-team-office.png" alt="歲悅長照集團投資人招募與營運團隊會議" />
          <div>
            <span>Suiyuecare Growth</span>
            <strong>把長照需求，變成可治理、可複製、可長期信任的服務網絡。</strong>
          </div>
        </aside>
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
          <img src="assets/north-service-map.png" alt="歲悅長照投資人招募北北桃布局地圖" />
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
          <span>正式資料可於洽談後提供，目前先以模板呈現未來下載區塊，方便後續接 CMS 或投資人文件管理。</span>
        </div>
        <div class="download-grid investor-doc-grid">
          ${documents.map(([type, title, copy]) => `
            <a href="#contact">
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
        <a class="primary-button" href="#contact">聯絡投資人窗口</a>
      </section>
    </div>
  `;
}

function renderLandRecruitingPage() {
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
      <section class="service-detail-hero land-recruit-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Land Partnership</p>
          <h1>土地招募</h1>
          <p>歲悅正在尋找能承接長照服務的土地、店面、辦公空間與社區場域。從基地評估、設立可行性到營運規劃，我們希望和地主、建物持有人與合作夥伴一起打造北北桃的照顧基礎建設。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">提供基地資料</a>
            <a class="secondary-button" href="#investors">查看展店進度</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/homepage-batch/16-taipei-service-office.png" alt="歲悅長照北北桃服務基地合作場域" />
          <div>
            <span>Care Infrastructure</span>
            <strong>把合適的空間，變成家庭真正用得到的照顧據點。</strong>
          </div>
        </aside>
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
          <img src="assets/homepage-batch/04-admin-team-office.png" alt="歲悅團隊進行基地與營運評估" />
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
          <img src="assets/north-service-map.png" alt="歲悅土地招募北北桃優先區域地圖" />
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
        <a class="primary-button" href="#contact">聯絡土地合作</a>
      </section>
    </div>
  `;
}

function renderCommunityPage() {
  const highlights = [
    ["離家近的照顧入口", "讓長輩不用等到失能很嚴重才接觸長照，而是在生活圈裡就能開始參與活動、被看見與被提醒。"],
    ["預防延緩失能", "透過伸展、肌力、平衡、認知與社交活動，把預防照顧做在生活裡，而不是等問題發生才處理。"],
    ["家屬支持與諮詢", "據點也是家屬最容易開口詢問的地方，協助釐清長照資源、服務選擇與下一步安排。"],
    ["區域資源串聯", "把居家照顧、日間照顧、護理復能、家屬課程與社區活動串起來，讓照顧更貼近日常。"]
  ];
  const painPoints = [
    ["長輩不想出門", "在家待久了，活動量、食慾、社交互動與情緒都可能慢慢下降，需要一個熟悉且壓力低的出門理由。"],
    ["家屬不知道去哪問", "很多家庭還不到需要大量服務，但已經開始擔心跌倒、失智、營養、用藥與照顧壓力。"],
    ["社區資源太零散", "活動、課程、服務、補助與轉介常分散在不同窗口，家屬需要有人協助整理。"],
    ["預防常被忽略", "長輩還能走、還能自理時，最適合透過活動維持功能，但這也是最容易被忽視的階段。"],
    ["照顧者缺少同伴", "家屬在照顧路上常覺得孤單，據點能提供課程、交流與被理解的空間。"],
    ["需要更早發現變化", "出席、互動、食慾、活動表現與情緒變化，都是社區工作者可以早一步看見的訊號。"]
  ];
  const scenes = [
    ["assets/community-detail-01-exercise.png", "健康促進小組", "用椅上運動、伸展與平衡練習，讓長輩在熟悉社區裡維持活動量。"],
    ["assets/community-detail-02-meal.png", "共餐與茶敘陪伴", "共餐不只是吃飯，也是在固定時間被看見、被關心、重新建立社交節奏。"],
    ["assets/community-detail-03-workshop.png", "認知手作活動", "透過手作、桌遊、懷舊與互動設計，讓長輩在活動中保有參與感。"],
    ["assets/community-detail-04-consult.png", "家屬資源諮詢", "把長照資源、服務轉介與照顧疑問說成家屬聽得懂的下一步。"]
  ];
  const flow = [
    ["01", "初步諮詢", "了解長輩生活狀態、活動能力、交通距離、家屬期待與最想改善的問題。"],
    ["02", "活動媒合", "依體力、興趣、認知狀態與交通可近性，建議適合的課程、共餐或健康促進活動。"],
    ["03", "第一次參與", "由據點人員協助熟悉環境、活動流程、安全注意事項與同儕互動。"],
    ["04", "固定出席", "透過固定活動建立生活節奏，讓長輩有出門理由，也讓家屬看見變化。"],
    ["05", "狀態觀察", "觀察出席、食慾、互動、情緒、活動表現與精神狀態，必要時提醒家屬。"],
    ["06", "資源轉介", "依照需求銜接居家照顧、日間照顧、護理復能、家屬課程或其他長照資源。"]
  ];
  const programs = [
    ["活力伸展班", "椅上運動、肌力練習、平衡訓練、跌倒預防與柔軟度活動。", "適合行動較慢、想維持體力與活動信心的長輩。"],
    ["共餐關懷", "營養餐食、用餐陪伴、茶敘互動、日常觀察與情緒支持。", "適合獨居、白天需要社交、飲食與關懷者。"],
    ["認知手作課", "手作、桌遊、懷舊活動、節慶創作、記憶刺激與團體互動。", "適合希望維持專注、記憶刺激與人際互動者。"],
    ["健康講座", "跌倒預防、營養、失智友善、用藥安全、睡眠與照顧技巧。", "適合長輩、家屬與社區民眾一起建立照顧知識。"],
    ["家屬支持", "資源說明、照顧技巧、服務轉介、情緒支持與照顧者交流。", "適合剛開始面對長照需求或照顧壓力增加的家庭。"],
    ["照顧諮詢", "協助理解長照服務、居家照顧、日照、復能、課程與後續安排。", "適合不知道下一步該找誰、該怎麼安排的家屬。"],
    ["失智友善活動", "以熟悉節奏、懷舊素材與低壓互動陪伴，降低焦慮並增加參與。", "適合輕度認知退化、需要社交與規律刺激的長輩。"],
    ["社區資源轉介", "協助家屬連結長照、社福、醫療、復能與其他在地支持資源。", "適合需求開始變複雜、需要整合資訊的家庭。"]
  ];
  const scenarios = [
    ["長輩還沒失能，但越來越少出門", "透過固定活動、共餐與社交互動，讓長輩重新有出門理由，避免功能與情緒慢慢退化。", "重點：預防延緩、社交參與、生活節奏"],
    ["家屬剛開始接觸長照", "據點可以先提供諮詢、課程與資源說明，讓家屬不用一開始就面對複雜制度。", "重點：家屬支持、資源說明、服務轉介"],
    ["獨居或白天少人互動", "共餐、茶敘與團體活動能增加被關心的頻率，也讓社區人員早一步看見狀態變化。", "重點：共餐關懷、情緒支持、日常觀察"],
    ["失智友善與家屬喘息", "以熟悉、安全、低壓活動陪伴長輩，也讓家屬能獲得照顧技巧與情緒支持。", "重點：失智友善、家屬課程、照顧技巧"]
  ];
  const qualityItems = [
    ["活動不是越多越好", "據點活動要符合長輩體力、興趣與安全狀態，重點是願意持續參與。"],
    ["出席狀態要被看見", "長輩突然缺席、互動下降、食慾改變或情緒低落，都可能是需要關心的訊號。"],
    ["課程要能帶回生活", "跌倒預防、營養、失智友善與用藥安全，都要讓長輩與家屬回家後用得上。"],
    ["家屬問題要被整理", "家屬常問的服務、補助、照顧技巧與轉介問題，會被整理成清楚的下一步。"],
    ["社區合作要穩定", "據點會連結里辦、公部門、醫療與社福資源，讓照顧網絡不只靠單一單位。"],
    ["轉介要有邏輯", "當長輩需求變高時，能從社區活動銜接居家、日照、復能或其他照顧資源。"]
  ];
  const faqs = [
    ["社區據點和日間照顧有什麼不同？", "社區據點多以健康促進、共餐、課程與社區支持為主，日間照顧則是較完整的白天托顧與生活照顧。兩者可以依需求銜接。"],
    ["長輩一定要失能才能參加嗎？", "不一定。社區據點很適合還能出門、但需要增加活動、社交與預防照顧的長輩。"],
    ["家屬可以一起參加課程嗎？", "可以。許多據點活動與家屬支持課程，都鼓勵家屬一起理解照顧技巧與資源。"],
    ["據點活動會固定嗎？", "活動會依據點規劃、服務區域與年度課程調整，建議先聯絡確認最近活動與報名方式。"],
    ["如果長輩後續需要更多服務怎麼辦？", "據點可以協助家屬理解居家照顧、日間照顧、護理復能與其他長照資源，做下一步銜接。"],
    ["社區據點適合獨居長輩嗎？", "適合。固定共餐、活動與關懷能增加長輩被看見的頻率，也能讓家屬更安心。"]
  ];

  return `
    <div class="service-detail-page community-page">
      <section class="service-detail-hero community-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Community Care</p>
          <h1>社區據點</h1>
          <p>歲悅社區據點把健康促進、共餐陪伴、預防延緩失能、家屬支持與資源轉介放進生活圈，讓長輩在離家更近的地方開始被看見，也讓家庭在真正需要大量照顧前，就有一個可以先問、先來、先被接住的入口。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約據點諮詢</a>
            <a class="secondary-button" href="#network">查看服務區域</a>
          </div>
          <div class="homecare-hero-points">
            <article><span>據點角色</span><strong>健康促進、共餐關懷、家屬諮詢、失智友善與長照資源入口</strong></article>
            <article><span>適合對象</span><strong>還能出門但活動量下降、獨居、白天缺少互動或家屬剛開始接觸長照者</strong></article>
            <article><span>服務特色</span><strong>把預防、陪伴、課程與轉介放在社區，讓照顧更早、更近、更自然</strong></article>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/community-detail-01-exercise.png" alt="歲悅社區據點健康促進活動" />
          <div>
            <span>Community Hub</span>
            <strong>讓照顧從生活圈附近開始。</strong>
          </div>
        </aside>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Focus</p>
          <h2>社區據點在做什麼</h2>
          <span>不是把長輩集中起來而已，而是用規律活動、熟悉人際與專業觀察，提早支持生活功能。</span>
        </div>
        <div class="service-highlight-grid">
          ${highlights.map(([title, copy], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-positioning">
        <div class="service-section-head">
          <p class="eyebrow">Community Pain Points</p>
          <h2>社區據點要解決的，是照顧開始之前的空白。</h2>
          <span>很多家庭還沒準備好接受長照服務，但已經有擔心。據點就是讓長輩與家屬更早靠近資源的地方。</span>
        </div>
        <div class="homecare-problem-grid">
          ${painPoints.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section community-scenes">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>這一頁新增 4 張社區據點情境圖，呈現健康促進、共餐、認知活動與家屬諮詢。</span>
        </div>
        <div class="homecare-gallery">
          ${scenes.map(([image, title, copy]) => `
            <figure>
              <img src="${image}" alt="${title}" />
              <figcaption>
                <strong>${title}</strong>
                <span>${copy}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Care Scenarios</p>
          <h2>哪些家庭適合先從社區據點開始？</h2>
          <span>社區據點不是最後一步，而是很多家庭開始理解照顧的第一站。</span>
        </div>
        <div class="homecare-scenario-grid">
          ${scenarios.map(([title, copy, tag]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
              <small>${tag}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section community-programs">
        <div class="service-section-head">
          <p class="eyebrow">Programs</p>
          <h2>據點服務內容</h2>
          <span>每一項活動都以「長輩願意來、家屬看得懂、狀態能追蹤」為設計核心。</span>
        </div>
        <div class="community-program-grid">
          ${programs.map(([title, items, fit]) => `
            <article>
              <h3>${title}</h3>
              <p>${items}</p>
              <span>${fit}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section homecare-quality-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality System</p>
          <h2>社區據點的價值，在於讓變化被更早看見。</h2>
          <span>出席、互動、食慾、活動表現與家屬提問，都是據點判斷是否需要進一步支持的重要線索。</span>
        </div>
        <div class="homecare-quality-grid">
          ${qualityItems.map(([title, copy]) => `
            <article>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section community-area-section">
        <div class="community-area-card">
          <img src="assets/north-service-map.png" alt="歲悅北北桃社區服務區域地圖" />
          <div>
            <p class="eyebrow">North Taiwan Network</p>
            <h2>北北桃社區據點與健康促進服務</h2>
            <p>服務規劃以臺北、新北、桃園為核心，串接社區活動、健康促進、長照諮詢與家庭照顧資源，讓據點成為家屬可以先問、長輩可以先來的照顧入口。</p>
            <div class="community-area-tags">
              <span>臺北市</span>
              <span>新北市</span>
              <span>桃園市</span>
              <span>共餐陪伴</span>
              <span>健康促進</span>
              <span>預防延緩失能</span>
            </div>
          </div>
        </div>
      </section>

      <section class="service-detail-section">
        <div class="homecare-family-board">
          <article>
            <p class="eyebrow">Community Role</p>
            <h2>據點是一個讓照顧更早發生、也更不害怕的地方。</h2>
            <p>許多長輩一開始不覺得自己需要長照，家屬也不知道該怎麼開口。社區據點用活動、共餐、課程與諮詢降低進入門檻，讓照顧不再像突然發生的大事，而是可以慢慢靠近的日常支持。</p>
          </article>
          <article>
            <b>01</b>
            <h3>長輩願意來</h3>
            <p>活動要有趣、環境要熟悉、人員要親切，長輩才會願意固定出門。</p>
          </article>
          <article>
            <b>02</b>
            <h3>家屬問得到</h3>
            <p>把補助、服務、轉介與照顧技巧說清楚，讓家屬不用在網路上自己亂找。</p>
          </article>
          <article>
            <b>03</b>
            <h3>資源接得上</h3>
            <p>當需求提高時，能銜接居家、日照、護理復能與其他長照服務。</p>
          </article>
        </div>
      </section>

      <section class="service-detail-section community-flow-section">
        <div class="service-section-head">
          <p class="eyebrow">How It Works</p>
          <h2>從諮詢到穩定參與</h2>
          <span>我們把社區據點設計成長照入口，讓家屬知道下一步該怎麼走。</span>
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>家屬常見問題</h2>
          <span>社區據點最重要的功能，是讓長輩與家屬更早接觸照顧支持。</span>
        </div>
        <div class="software-faq-list">
          ${faqs.map(([question, answer]) => `
            <details>
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Start From Nearby</p>
          <h2>想替家人找一個可以安心出門的地方？</h2>
          <p>留下需求後，歲悅會協助確認服務區域、據點活動、交通可近性與是否需要同步評估居家或日照服務。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡我們</a>
      </section>
    </div>
  `;
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
          <span>用表格與折線/柱狀圖呈現月營收變化，後續可串接 WordPress 或財務 CSV 自動更新。</span>
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
            <img src="assets/homepage-batch/04-admin-team-office.png" alt="歲悅行政團隊整理年度報告" />
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
    ["執行長", "營運策略與服務網絡拓展", "assets/homepage-batch/04-admin-team-office.png"],
    ["照顧品質長", "服務品管、督導制度與異常事件改善", "assets/homepage-batch/03-supervisor-care-plan.png"],
    ["教育訓練長", "照服員、督導與移工培訓制度", "assets/homepage-batch/11-elder-art-activity.png"],
    ["財務行政長", "財務控管、人資行政與投資人關係", "assets/homepage-batch/10-family-consultation.png"]
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
            <img src="assets/homepage-batch/04-admin-team-office.png" alt="歲悅行政團隊治理會議" />
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
              <div><span>${role}</span><h3>${duty}</h3><a href="#contact">Read More</a></div>
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
            <p>此區建議放通報適用範圍、保密原則、處理流程、回覆時程與禁止報復聲明。正式上線時可串接表單，寄送至指定治理信箱。</p>
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
            <img src="assets/homepage-batch/14-care-notes.png" alt="歲悅照顧紀錄與誠信經營" />
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
            <img src="assets/homepage-batch/10-family-consultation.png" alt="歲悅股東會與投資人溝通情境" />
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
            <article><b>下一場說明</b><strong>Q2</strong><span>時程規劃中</span></article>
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
            <img src="assets/homepage-batch/15-phone-consultation.png" alt="歲悅投資人窗口電話諮詢" />
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

function renderSystemScreen(title, subtitle, stats = [], rows = [], accent = "orange") {
  return `
    <article class="software-screen-card" data-accent="${escapeHTML(accent)}">
      <header>
        <span></span><span></span><span></span>
        <strong>${escapeHTML(title)}</strong>
      </header>
      <div class="software-screen-body">
        <div>
          <b>${escapeHTML(subtitle)}</b>
          <small>Suiyuecare System Suite</small>
        </div>
        <div class="software-screen-stats">
          ${stats.map(([label, value]) => `<em><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span></em>`).join("")}
        </div>
        <div class="software-screen-table">
          ${rows.map(([label, value, status]) => `
            <p>
              <span>${escapeHTML(label)}</span>
              <b>${escapeHTML(value)}</b>
              <i>${escapeHTML(status)}</i>
            </p>
          `).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderSoftwarePage() {
  const systems = [
    ["會計系統", "收入、支出、請款、憑證與月結流程整合，讓財務資料不再散落在表格與訊息中。", "請款批次、收支分類、月報匯出、權限簽核"],
    ["人資系統", "員工資料、排班、出勤、訓練、證照與績效紀錄集中管理，支援長照單位人力調度。", "員工主檔、證照效期、排班出勤、教育訓練"],
    ["電子公文交換系統", "收文、發文、簽核、附件、追蹤與歸檔流程電子化，降低公文遺漏與版本混亂。", "收發文號、線上簽核、附件控管、進度追蹤"],
    ["專案管理", "把展店、標案、課程、稽核與跨部門任務拆成看板、時程與負責人，讓進度透明。", "任務看板、里程碑、負責人、逾期提醒"],
    ["PDF 工具", "支援 PDF 合併、拆分、壓縮、浮水印、簽核頁與文件歸檔，讓行政文件處理更快。", "合併拆分、壓縮轉檔、浮水印、簽核紀錄"],
    ["居家業務系統", "從個案建檔、服務媒合、派案、照顧紀錄、督導訪視到家屬回報，建立完整居服流程。", "個案管理、派案排程、服務紀錄、督導追蹤"],
    ["日照業務系統", "整合出席、接送、餐食、活動、量測、照顧紀錄與家屬回報，支援日照中心每日營運。", "出席接送、餐食活動、健康量測、家屬回報"]
  ];
  const screens = [
    {
      title: "居家業務系統",
      subtitle: "個案服務儀表板",
      stats: [["本月服務", "1,284"], ["待派案", "36"], ["回報完成", "98%"]],
      rows: [["士林個案 A", "今日 09:00", "已排班"], ["萬華個案 B", "督導回訪", "處理中"], ["新店個案 C", "服務紀錄", "已完成"]],
      accent: "orange"
    },
    {
      title: "日照業務系統",
      subtitle: "中心每日營運",
      stats: [["今日出席", "42"], ["活動完成", "6"], ["餐食回報", "100%"]],
      rows: [["晨間量測", "血壓/體溫", "完成"], ["團體活動", "椅上律動", "進行中"], ["家屬回報", "LINE 摘要", "待送出"]],
      accent: "blue"
    },
    {
      title: "行政整合系統",
      subtitle: "會計、人資、公文與專案",
      stats: [["待簽核", "18"], ["到期證照", "5"], ["本週任務", "73%"]],
      rows: [["會計月結", "四月營收", "覆核中"], ["人資證照", "照服員證照", "提醒"], ["電子公文", "北市府來文", "待承辦"]],
      accent: "brown"
    }
  ];
  const flow = [
    ["01", "流程盤點", "先理解單位現有表單、角色權限、審核節點與最容易卡住的作業。"],
    ["02", "模組規劃", "依照會計、人資、公文、專案或長照業務需求拆成可上線的功能模組。"],
    ["03", "介面與資料設計", "規劃欄位、清單、儀表板、下載檔、權限與手機/平板使用情境。"],
    ["04", "導入與迭代", "先以核心流程上線，再依使用者回饋持續調整報表、權限與操作細節。"]
  ];
  const painPoints = [
    ["資料散落", "個案、課程、員工、合約、帳務與公文分散在 Excel、LINE、紙本與雲端資料夾，交接時很容易漏。"],
    ["流程看不見", "主管想知道進度，卻只能一個一個問；誰負責、卡在哪、下一步是什麼，都缺少共同畫面。"],
    ["報表做很久", "每月統計、服務量、收入支出、課程名單、稽核資料都要人工整理，越忙越容易出錯。"],
    ["權限不清楚", "不同職務需要看到不同資料，但一般表格很難控管權限，也缺少操作紀錄。"],
    ["工具不貼現場", "套裝軟體常常要求人配合系統，導致前線不想用；我們更重視讓系統配合真實工作。"],
    ["擴點難複製", "當單位變多、部門變多，如果沒有一致流程與資料結構，管理品質很難穩定放大。"]
  ];
  const scenarios = [
    ["長照居家機構", "個案建檔、服務媒合、派案排班、服務紀錄、督導訪視、家屬回報與核銷資料整合。", "適合需要降低督導追蹤壓力、提升服務紀錄完整度的居家服務單位。"],
    ["日間照顧中心", "出席接送、餐食、活動、健康量測、異常事件、家屬通知與中心每日營運看板。", "適合需要掌握現場動線、活動紀錄與家屬溝通品質的日照中心。"],
    ["教育訓練單位", "課程上架、報名名單、繳費狀態、簽到退、證書、講師、回饋表與課後追蹤。", "適合辦理照服員課程、長照繼續教育與內部訓練的單位。"],
    ["企業行政部門", "會計、人資、公文、合約、專案、檔案下載與跨部門任務集中管理。", "適合正在擴編、展店、投標或需要建立管理制度的企業。"]
  ];
  const roleMatrix = [
    ["經營主管", "看整體營運數據、異常警示、部門進度與財務摘要，不需要再等月底人工彙整。"],
    ["部門主管 / 督導", "追蹤個案、班表、紀錄、任務、待處理事項與服務品質，讓問題能被即時接住。"],
    ["第一線同仁", "用手機或平板完成紀錄、回報、簽到、上傳照片與查看今日任務，降低行政負擔。"],
    ["行政 / 財務 / 人資", "管理請款、發票、薪資資料、證照效期、教育訓練、公文與檔案下載。"],
    ["家屬 / 合作窗口", "依權限看到服務摘要、通知、回報與必要文件，讓溝通更透明但不暴露敏感資料。"]
  ];
  const packages = [
    ["Starter", "先把最痛的單一流程系統化", "適合先做課程報名、文件下載、表單留存、專案看板或單一部門工作流。"],
    ["Operation", "多模組整合到日常營運", "適合把會計、人資、公文、居家或日照營運資料串在同一個後台。"],
    ["Enterprise", "跨單位、跨部門、跨權限管理", "適合多據點管理、投資人資料、內部稽核、報表中心與權限分級。"],
    ["Custom", "依單位流程客製開發", "適合已有清楚流程但市面軟體無法符合，需要客製欄位、簽核與報表。"]
  ];
  const controls = [
    ["權限分級", "依董事、主管、督導、行政、第一線與外部窗口設定可讀、可寫、可下載範圍。"],
    ["操作紀錄", "重要新增、修改、刪除與發布動作保留紀錄，方便追蹤責任與還原問題。"],
    ["圖片裁切", "後台上傳圖片可依桌機、平板、手機預覽裁切，降低前台跑版與照片切臉。"],
    ["檔案下載", "公告、財報、課程簡章、表單與內部文件可上傳、分類、排序與設定是否公開。"],
    ["報表匯出", "營運數據可依日期、分類、單位與狀態篩選，匯出 CSV、Excel 或 PDF。"],
    ["表單留存", "聯絡、課程、招募、投資人詢問等表單可寄信，也會留存在後台方便追蹤。"]
  ];
  const faqs = [
    ["可以只做其中一個系統嗎？", "可以。通常會建議先從最常卡住、最耗人力、最容易出錯的流程開始，例如課程報名、居家派案或文件下載。"],
    ["會不會改動現有網站版型？", "不會以破壞前台版型為前提。系統會把內容、圖片、檔案與卡片資料化，前台仍維持既有設計規範。"],
    ["可以匯入舊資料嗎？", "可以評估 Excel、CSV 或既有表格資料匯入。導入前會先盤點欄位，避免錯誤資料直接進到新系統。"],
    ["手機和平板可以使用嗎？", "可以。後台可依不同使用者情境調整表格、卡片、操作按鈕與圖片比例，讓第一線不必只靠電腦作業。"],
    ["需要多久才能上線？", "依範圍不同而定。單一模組可先以短週期上線，多模組整合則會分階段驗收，避免一次改太多造成團隊不會用。"]
  ];

  return `
    <div class="service-detail-page software-page">
      <section class="service-detail-hero software-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Software System</p>
          <h1>軟體系統</h1>
          <p>歲悅不只做長照服務，也把營運現場需要的後台工具整理成可客製化的系統。從會計、人資、電子公文、專案管理、PDF 文件工具，到居家與日照業務系統，都能依單位流程調整。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">洽詢系統客製</a>
            <a class="secondary-button" href="#quality">了解教育品管</a>
          </div>
        </div>
        <aside class="software-hero-board" aria-label="歲悅軟體系統畫面">
          ${renderSystemScreen(screens[0].title, screens[0].subtitle, screens[0].stats, screens[0].rows, screens[0].accent)}
        </aside>
      </section>

      <section class="service-detail-section software-positioning">
        <div class="service-section-head">
          <p class="eyebrow">Why Software</p>
          <h2>把單位每天最耗力的工作，變成可以被追蹤、交接與改善的流程</h2>
          <span>歲悅的軟體系統不是為了炫技，而是為了讓照顧服務、行政營運、財務資料與管理制度能夠同步前進。系統要讓人更輕鬆，不是讓團隊多一個負擔。</span>
        </div>
        <div class="software-problem-grid">
          ${painPoints.map(([title, copy]) => `
            <article>
              <h3>${escapeHTML(title)}</h3>
              <p>${escapeHTML(copy)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">System Modules</p>
          <h2>我們可以協助單位客製的系統</h2>
          <span>不是把別人的套裝軟體硬塞進單位，而是把實際工作流程、權限、報表與文件管理做成可以被使用的系統。</span>
        </div>
        <div class="software-module-grid">
          ${systems.map(([title, copy, tags], index) => `
            <article>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${escapeHTML(title)}</h3>
              <p>${escapeHTML(copy)}</p>
              <small>${escapeHTML(tags)}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Use Cases</p>
          <h2>不同單位可以依照自己的現場情境導入</h2>
          <span>我們會先理解單位是居家、日照、教育訓練、行政管理或混合型組織，再決定資料欄位、角色權限與第一階段最該上線的功能。</span>
        </div>
        <div class="software-scenario-grid">
          ${scenarios.map(([title, copy, note]) => `
            <article>
              <h3>${escapeHTML(title)}</h3>
              <p>${escapeHTML(copy)}</p>
              <small>${escapeHTML(note)}</small>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">System Screens</p>
          <h2>系統畫面佐證</h2>
          <span>以下以歲悅系統介面風格呈現實際營運會用到的儀表板、清單與進度狀態，方便單位快速理解導入後的使用情境。</span>
        </div>
        <div class="software-screen-grid">
          ${screens.map((screen) => renderSystemScreen(screen.title, screen.subtitle, screen.stats, screen.rows, screen.accent)).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Roles & Permissions</p>
          <h2>不是每個人都看同一套資料，而是每個角色看到剛好需要的資訊</h2>
          <span>真正能被長期使用的系統，關鍵不是功能很多，而是主管、督導、行政、第一線與外部窗口都能在自己的位置上快速完成工作。</span>
        </div>
        <div class="software-role-board">
          ${roleMatrix.map(([title, copy], index) => `
            <article>
              <b>${String(index + 1).padStart(2, "0")}</b>
              <h3>${escapeHTML(title)}</h3>
              <p>${escapeHTML(copy)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Customization Flow</p>
          <h2>客製化導入方式</h2>
          <span>我們會先把流程釐清，再做功能分期，避免一次做太大、使用者反而不會用。</span>
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Service Packages</p>
          <h2>從單一流程到整套營運後台，都能分階段上線</h2>
          <span>如果單位明天就要改善某一個痛點，可以先做小；如果已經準備擴點或整合部門，也可以直接規劃成企業級後台。</span>
        </div>
        <div class="software-package-grid">
          ${packages.map(([title, subtitle, copy]) => `
            <article>
              <h3>${escapeHTML(title)}</h3>
              <strong>${escapeHTML(subtitle)}</strong>
              <p>${escapeHTML(copy)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section software-control-section">
        <div class="service-section-head">
          <p class="eyebrow">Management Control</p>
          <h2>後台要讓新同仁也敢操作，讓管理者也能放心控管</h2>
          <span>我們會把內容更新、圖片裁切、表單留存、權限、檔案下載與操作紀錄納入規劃，讓系統不是只有工程師能懂。</span>
        </div>
        <div class="software-control-grid">
          ${controls.map(([title, copy]) => `
            <article>
              <h3>${escapeHTML(title)}</h3>
              <p>${escapeHTML(copy)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="service-detail-section software-faq-section">
        <div class="service-section-head">
          <p class="eyebrow">FAQ</p>
          <h2>常見導入問題</h2>
          <span>先把期待講清楚，導入系統才不會變成只完成畫面、卻沒有人真正使用。</span>
        </div>
        <div class="software-faq-list">
          ${faqs.map(([question, answer]) => `
            <details>
              <summary>${escapeHTML(question)}</summary>
              <p>${escapeHTML(answer)}</p>
            </details>
          `).join("")}
        </div>
      </section>

      <section class="service-cta-panel">
        <div>
          <p class="eyebrow">Digital Transformation</p>
          <h2>想把單位流程從 Excel、紙本與群組訊息中整理出來嗎？</h2>
          <p>留下需求後，歲悅可以協助盤點流程，評估適合先做會計、人資、公文、專案、PDF 工具，或居家/日照業務系統。</p>
        </div>
        <a class="primary-button" href="#contact">聯絡我們</a>
      </section>
    </div>
  `;
}

function renderTalentPage() {
  const openings = [
    ["居家照顧服務員", "居家照顧部門", "到宅身體照顧、生活支持、陪伴與服務紀錄。", "assets/homepage-batch/05-orange-polo-caregiver.png"],
    ["居家服務督導", "居家照顧部門", "服務媒合、品質追蹤、照服員支持與家屬溝通。", "assets/homepage-batch/06-orange-polo-supervisor.png"],
    ["日照照顧服務員", "日間照顧部", "長輩活動陪伴、餐食照顧、生活支持與安全觀察。", "assets/homepage-batch/02-daycare-group-exercise.png"]
  ];
  const careerSteps = [
    ["0-3 個月", "新人陪跑", "完成基礎訓練、服務倫理、紀錄回報與安全照顧流程，由督導陪同熟悉第一線情境。"],
    ["3-6 個月", "穩定上線", "能獨立完成服務紀錄、家庭溝通與異常回報，並建立穩定服務品質。"],
    ["6-12 個月", "專業進階", "依部門選修失智照顧、復能陪伴、日照活動、移工培訓、行政營運等模組。"],
    ["12 個月以上", "帶教與管理", "通過評核後可成為帶教員、服務督導、內訓講師、品管幹部或部門管理人才。"]
  ];
  const careerTracks = [
    ["前線專業線", ["照顧服務員", "資深照服員", "照顧帶教員", "專科照顧師"]],
    ["督導管理線", ["服務督導助理", "居服督導", "資深督導", "區域督導"]],
    ["教育品管線", ["課務助教", "內訓講師", "品管專員", "教育品管主管"]],
    ["行政營運線", ["行政專員", "營運協調", "專案管理", "部門主管"]]
  ];
  const promotionCriteria = [
    ["服務品質", "服務紀錄完整、家屬回饋穩定、異常事件能即時回報與追蹤。"],
    ["專業能力", "完成核心訓練與進階照顧模組，能把照顧流程做得穩、做得細。"],
    ["團隊協作", "能與督導、行政、照服員、家屬共同解決問題，讓服務不中斷。"],
    ["帶教潛力", "能整理經驗、協助新人上線，把個人能力轉化成團隊能力。"]
  ];
  const benefits = [
    ["薪酬與獎金", "透明薪資、服務津貼、績效獎金、年終獎金與特殊服務加給，讓努力被清楚看見。", ["服務津貼", "績效獎金", "年終獎金"]],
    ["排班與生活", "依服務區域、交通條件與個人狀態安排班表，降低跨區奔波，保留生活彈性。", ["彈性排班", "區域媒合", "休假協調"]],
    ["訓練與證照", "新人訓練、在職教育、專業模組、證照補助與情境演練，讓照顧專業能持續升級。", ["新人訓練", "證照補助", "進階課程"]],
    ["督導與安全", "第一線遇到照顧困難不單打獨鬥，督導、行政與品管一起支援回報、溝通與調整。", ["督導陪跑", "異常支援", "安全回報"]],
    ["健康與保障", "提供勞健保、團保規劃、健康關懷與工作安全提醒，讓照顧者也被照顧。", ["勞健保", "團體保險", "健康關懷"]],
    ["團隊與歸屬", "定期聚會、表揚制度、跨部門交流與照顧故事分享，讓好服務不只是個人撐起來。", ["夥伴聚會", "表揚制度", "團隊交流"]]
  ];
  const benefitHighlights = [
    ["照顧者支持率", "100%", "每位新人都有督導陪跑與回饋"],
    ["年度訓練模組", "12+", "涵蓋居家、日照、復能與家庭溝通"],
    ["發展方向", "4 線", "前線、督導、教育品管、行政營運"]
  ];
  const benefitSystems = [
    ["基本保障", ["勞保、健保、勞退提撥", "團體保險規劃", "依法給假與特休制度"]],
    ["工作支持", ["區域媒合與排班溝通", "督導即時支援", "服務紀錄與異常回報工具"]],
    ["成長補助", ["新人教育訓練", "在職進修與證照補助", "內訓講師與帶教培力"]],
    ["團隊文化", ["定期團隊會議", "優良服務表揚", "照顧案例分享與跨部門交流"]]
  ];
  const homeCareRecruit = {
    highlights: [
      ["服務範圍", "士林、北投、大同、南港、萬華、新店、中永和、新莊、蘆竹"],
      ["工作特色", "到宅服務、督導陪跑、家屬溝通、服務紀錄與跨專業協作"],
      ["適合對象", "喜歡與長輩相處、重視細節、願意穩定累積照顧專業的夥伴"]
    ],
    gallery: [
      ["assets/homepage-batch/01-care-home-greeting.png", "到宅服務前，用問候建立安心感。"],
      ["assets/homepage-batch/05-orange-polo-caregiver.png", "照顧服務員是家庭最靠近現場的支持。"],
      ["assets/homepage-batch/03-supervisor-care-plan.png", "督導與家屬討論照顧計畫。"],
      ["assets/homepage-batch/14-care-notes.png", "服務紀錄讓照顧變得可追蹤。"],
      ["assets/homepage-batch/10-family-consultation.png", "把家庭的擔心轉成清楚可執行的安排。"]
    ],
    roles: [
      {
        title: "居家照顧服務員",
        tag: "一線服務",
        image: "assets/recruit-home-care-worker.png",
        summary: "到宅提供身體照顧、生活支持、陪伴與服務紀錄，是長輩與家屬最直接的安心來源。",
        duties: ["身體照顧、備餐、陪同活動與安全觀察", "依服務計畫完成服務紀錄與回報", "與督導配合調整照顧細節"],
        requirements: ["具照顧服務員訓練結業證明或相關經驗佳", "願意學習服務紀錄、家屬溝通與安全照顧流程", "有耐心、守時、重視長輩尊嚴"],
        support: ["新人陪跑", "區域排班", "服務津貼"]
      },
      {
        title: "居家服務督導",
        tag: "服務管理",
        image: "assets/recruit-home-care-supervisor.png",
        summary: "負責服務媒合、品質追蹤、照服員支持與家屬溝通，把照顧現場變成穩定系統。",
        duties: ["評估服務需求並安排合適照服員", "追蹤服務品質、異常事件與家屬回饋", "支持照服員工作狀況與教育訓練"],
        requirements: ["具居服督導、社工、護理或長照相關經驗佳", "能清楚溝通、整理紀錄並追蹤問題", "願意在前線與行政之間協調資源"],
        support: ["督導培訓", "管理津貼", "跨部門支援"]
      },
      {
        title: "個案服務協調員",
        tag: "家庭窗口",
        image: "assets/homepage-batch/10-family-consultation.png",
        summary: "協助家庭理解服務內容、建立照顧安排，讓需求、資源與實際執行能順利接起來。",
        duties: ["接洽家庭諮詢並整理需求", "協助服務說明、派案前資料確認", "追蹤服務開始後的家屬回饋"],
        requirements: ["具客服、行政、長照或社福溝通經驗佳", "文字紀錄清楚，能穩定追蹤細節", "面對家屬焦慮時能保持同理與秩序"],
        support: ["話術訓練", "行政工具", "主管陪談"]
      },
      {
        title: "居家護理復能夥伴",
        tag: "專業協作",
        image: "assets/homepage-batch/13-rehab-walking-practice.png",
        summary: "與護理、復能與照顧團隊合作，協助長輩把日常動作重新練回生活裡。",
        duties: ["協助復能活動與安全陪伴", "觀察長輩身體狀況並回報團隊", "配合專業人員執行居家支持建議"],
        requirements: ["具護理、復健、職能、照顧服務或運動指導背景佳", "能重視安全、節奏與長輩意願", "願意與跨專業團隊合作"],
        support: ["專業督導", "復能訓練", "案例討論"]
      },
      {
        title: "居家行政調度專員",
        tag: "營運支援",
        image: "assets/homepage-batch/04-admin-team-office.png",
        summary: "負責班表、服務紀錄、文件與行政追蹤，讓前線照顧能順利運作、不被雜事卡住。",
        duties: ["協助排班、服務異動與資料整理", "追蹤服務紀錄、文件與行政流程", "支援督導與客服窗口回覆"],
        requirements: ["熟悉文書、表格與資料整理", "細心、穩定，能處理多項進度", "具長照行政或客服經驗佳"],
        support: ["行政訓練", "流程模板", "固定工時"]
      }
    ]
  };
  const dayCareRecruit = {
    highlights: [
      ["服務場域", "長輩白天來到中心，有規律作息、共餐、活動、休息與安全照顧"],
      ["工作特色", "團體照顧、活動帶領、餐食支持、身心觀察、家屬回報與團隊交班"],
      ["適合對象", "喜歡團隊合作、擅長帶動氣氛，也能細心觀察長輩狀態的夥伴"]
    ],
    gallery: [
      ["assets/daycare-recruit-01-checkin.png", "早晨報到與健康關懷，讓長輩安心開始一天。"],
      ["assets/daycare-recruit-02-exercise.png", "帶領團體活動，讓生活重新有節奏與期待。"],
      ["assets/daycare-recruit-03-meal.png", "餐食與營養支持，是日照照顧的重要細節。"],
      ["assets/daycare-recruit-04-activity.png", "認知活動與陪伴，讓互動不只是消磨時間。"],
      ["assets/daycare-recruit-05-handover.png", "交班與紀錄，讓團隊照顧能持續接住每位長輩。"]
    ],
    roles: [
      {
        title: "日照照顧服務員",
        tag: "一線照顧",
        image: "assets/daycare-recruit-02-exercise.png",
        summary: "陪伴長輩在日照中心完成活動、餐食、休息與生活照顧，是現場最重要的穩定力量。",
        duties: ["協助長輩活動參與、餐食、如廁、休息與安全觀察", "完成日常服務紀錄與異常回報", "與護理、社工、督導配合調整照顧安排"],
        requirements: ["具照顧服務員訓練結業證明佳", "能主動觀察長輩狀態並清楚回報", "喜歡與長輩互動，重視尊嚴與安全"],
        support: ["新人帶教", "日照排班", "活動訓練"]
      },
      {
        title: "日照活動帶領員",
        tag: "活動設計",
        image: "assets/daycare-recruit-04-activity.png",
        summary: "規劃健康促進、認知刺激、手作、音樂與社交活動，讓長輩白天有參與感與成就感。",
        duties: ["設計與帶領日照團體活動", "觀察活動反應並調整難度", "整理活動紀錄、照片與家屬回饋素材"],
        requirements: ["具活動帶領、社工、職能、教育或長照經驗佳", "能掌握現場氣氛與長輩安全", "願意把活動設計成可複製的課程模組"],
        support: ["活動教材", "課程共備", "講師培力"]
      },
      {
        title: "日照護理人員",
        tag: "健康照護",
        image: "assets/daycare-recruit-03-meal.png",
        summary: "負責健康評估、用藥與身體狀況觀察，協助團隊把日常照顧做得更安全。",
        duties: ["長輩健康狀況觀察、量測與紀錄", "協助用藥提醒、傷口與慢病照護追蹤", "與家屬、照服員與外部醫療資源溝通"],
        requirements: ["具護理師或護士證照", "熟悉長者照護、慢病管理或日照場域佳", "能把專業資訊轉成團隊看得懂的照顧提醒"],
        support: ["護理支援", "案例討論", "專業進修"]
      },
      {
        title: "日照個案管理員",
        tag: "家庭窗口",
        image: "assets/daycare-recruit-01-checkin.png",
        summary: "協助家庭完成服務說明、長輩適應、照顧計畫追蹤與家屬溝通，是中心與家庭之間的橋樑。",
        duties: ["接洽家庭諮詢並整理長輩需求", "追蹤長輩適應狀況與服務目標", "定期彙整家屬回饋與團隊照顧建議"],
        requirements: ["具社工、長照、客服或個案管理經驗佳", "擅長傾聽、紀錄與跨角色溝通", "能在家庭焦慮時提供清楚流程與支持"],
        support: ["溝通模板", "督導陪談", "個案會議"]
      },
      {
        title: "日照行政營運專員",
        tag: "營運支援",
        image: "assets/daycare-recruit-05-handover.png",
        summary: "處理出缺勤、交通、耗材、文件、課程與現場行政，讓日照中心每天穩定運作。",
        duties: ["協助中心行政、文件、物資與課表安排", "追蹤出缺勤、交通接送與家屬通知", "支援主管完成營運報表與品質資料"],
        requirements: ["熟悉文書、表格與流程追蹤", "細心穩定，能處理多項現場需求", "具長照行政、課務或客服經驗佳"],
        support: ["行政流程", "固定工時", "跨部門支援"]
      }
    ]
  };
  const migrantRecruit = {
    highlights: [
      ["培訓定位", "把家庭照顧技能拆成聽得懂、練得到、帶回家能執行的課程"],
      ["工作特色", "照顧技能教學、跨文化溝通、情境演練、教材設計與課後追蹤"],
      ["適合對象", "擅長教學、溝通清楚、尊重不同文化，也重視照顧安全的夥伴"]
    ],
    gallery: [
      ["assets/migrant-recruit-01-classroom.png", "從照顧流程開始，讓每位學員知道為什麼要這樣做。"],
      ["assets/migrant-recruit-02-transfer.png", "移位與安全照顧，需要反覆示範與實作。"],
      ["assets/migrant-recruit-03-meal-prep.png", "備餐與營養訓練，讓家庭照顧更穩定。"],
      ["assets/migrant-recruit-04-communication.png", "溝通演練把照顧指令變成聽得懂的行動。"],
      ["assets/migrant-recruit-05-certificate.png", "培訓紀錄與結訓追蹤，讓學習能被延續。"]
    ],
    roles: [
      {
        title: "移工照顧培訓講師",
        tag: "課程教學",
        image: "assets/migrant-recruit-01-classroom.png",
        summary: "負責設計與帶領移工照顧課程，把照顧流程、服務安全與家庭溝通轉成可練習的教學內容。",
        duties: ["帶領照顧技能、移位安全、備餐與溝通課程", "依學員程度調整教學節奏與示範方式", "整理教材、評量與課後改善建議"],
        requirements: ["具長照、護理、社工、職能或照顧教學經驗佳", "能清楚示範照顧步驟並耐心修正動作", "尊重多元文化，能用簡單語言說明複雜流程"],
        support: ["講師培力", "教材模板", "課程共備"]
      },
      {
        title: "照顧技能實作教練",
        tag: "實作訓練",
        image: "assets/migrant-recruit-02-transfer.png",
        summary: "專注於移位、翻身、沐浴、用餐與安全照顧演練，讓學員不是只聽懂，而是真的做得出來。",
        duties: ["進行照顧動作示範、分組演練與姿勢修正", "協助建立安全檢核表與實作評量", "回報學員學習狀況與需要補強的技能"],
        requirements: ["具照顧服務、護理、復健或實作教學經驗佳", "熟悉身體力學與長者安全照顧原則", "能細心觀察動作風險並即時提醒"],
        support: ["實作教案", "安全訓練", "案例討論"]
      },
      {
        title: "跨文化溝通輔導員",
        tag: "溝通支持",
        image: "assets/migrant-recruit-04-communication.png",
        summary: "協助移工、家庭與照顧團隊理解彼此需求，降低溝通誤會，讓照顧指令可以被正確執行。",
        duties: ["協助照顧情境溝通演練與用語整理", "支援家庭照顧規則、禁忌與回報方式說明", "收集學員困難並回饋課程設計"],
        requirements: ["具移工服務、語言教學、社福、客服或跨文化工作經驗佳", "能同理不同文化背景與家庭壓力", "文字整理與口語表達清楚"],
        support: ["溝通腳本", "主管陪談", "情境卡教材"]
      },
      {
        title: "培訓課務專員",
        tag: "課務行政",
        image: "assets/migrant-recruit-05-certificate.png",
        summary: "負責開課行政、學員資料、課程通知、簽到評量與結訓文件，讓每一堂課順利運作。",
        duties: ["處理課程報名、通知、簽到與教材準備", "整理學員資料、評量結果與結訓紀錄", "支援講師、場地、物資與課後回饋追蹤"],
        requirements: ["熟悉文書、表格與課務行政流程", "細心穩定，能處理多項課程進度", "具教育訓練、行政或長照課務經驗佳"],
        support: ["課務流程", "表單模板", "固定工時"]
      },
      {
        title: "家庭照顧課程企劃",
        tag: "內容企劃",
        image: "assets/migrant-recruit-03-meal-prep.png",
        summary: "把家庭照顧常見問題整理成課程、懶人包與實作教材，協助家庭與移工建立共同照顧語言。",
        duties: ["規劃照顧課程主題、教材架構與活動流程", "整理照顧知識、圖卡、評量與課後提醒", "與講師、督導、行政協作優化課程品質"],
        requirements: ["具課程企劃、教材設計、長照或健康教育經驗佳", "能把複雜知識轉成簡單可操作內容", "重視使用者理解與實際照顧情境"],
        support: ["教材素材庫", "跨部門共備", "企劃培訓"]
      }
    ]
  };
  const qualityRecruit = {
    highlights: [
      ["部門任務", "把前線經驗整理成教材、訓練、稽核與改善流程，讓服務品質能被複製"],
      ["工作特色", "教材設計、內訓帶領、服務紀錄檢核、品質稽核、數據追蹤與改善專案"],
      ["適合對象", "重視細節、善於整理知識、能把現場問題轉成方法與制度的夥伴"]
    ],
    gallery: [
      ["assets/quality-recruit-01-materials.png", "把照顧經驗整理成教材，讓好服務可以被學會。"],
      ["assets/quality-recruit-02-training.png", "內訓不是上課而已，而是讓現場做法更一致。"],
      ["assets/quality-recruit-03-record-review.png", "服務紀錄檢核，讓照顧品質被看見也被追蹤。"],
      ["assets/quality-recruit-04-quality-meeting.png", "從問題到改善，讓團隊一起把流程變好。"],
      ["assets/quality-recruit-05-feedback.png", "現場回饋要具體、友善，也要能真正幫上忙。"]
    ],
    roles: [
      {
        title: "教育品管專員",
        tag: "品質管理",
        image: "assets/quality-recruit-03-record-review.png",
        summary: "負責服務紀錄、照顧流程與品質資料檢核，把前線服務轉化為可追蹤、可改善的品質系統。",
        duties: ["檢核服務紀錄、異常回報與品管表單", "追蹤品質指標、改善事項與結案進度", "協助督導整理服務品質回饋與教育需求"],
        requirements: ["具長照、護理、社工、品管或行政稽核經驗佳", "細心、邏輯清楚，能穩定追蹤多項資料", "能把問題整理成具體可執行的改善建議"],
        support: ["品管模板", "督導共作", "數據工具"]
      },
      {
        title: "內訓講師",
        tag: "教育訓練",
        image: "assets/quality-recruit-02-training.png",
        summary: "帶領新人訓練與在職教育，把照顧倫理、服務流程、情境處理與紀錄回報教到能落地。",
        duties: ["規劃並執行新人訓練、在職教育與情境演練", "依服務問題設計補強課程與測驗", "追蹤學員學習成果與現場應用狀況"],
        requirements: ["具照顧教學、護理、社工、督導或教育訓練經驗佳", "表達清楚，能把複雜流程拆成好理解步驟", "願意和前線團隊共同修正教材"],
        support: ["講師培力", "課程共備", "教材素材庫"]
      },
      {
        title: "教材設計企劃",
        tag: "內容設計",
        image: "assets/quality-recruit-01-materials.png",
        summary: "把照顧知識、服務流程與案例整理成簡報、圖卡、手冊與線上教材，讓知識更容易被吸收。",
        duties: ["設計長照教材、流程圖、照顧圖卡與課程簡報", "整理案例、FAQ 與標準作業說明", "與講師、督導、行政協作更新教材版本"],
        requirements: ["具教材設計、內容企劃、教育、長照或健康知識背景佳", "能把文字、圖像與流程整理得清楚易懂", "重視學習者視角與實際現場使用"],
        support: ["設計模板", "案例資料庫", "跨部門共備"]
      },
      {
        title: "服務稽核人員",
        tag: "稽核改善",
        image: "assets/quality-recruit-05-feedback.png",
        summary: "透過現場觀察、紀錄檢查與團隊訪談，協助服務單位發現風險、修正流程並維持品質。",
        duties: ["執行服務流程、紀錄與現場品質檢核", "整理稽核結果與改善追蹤表", "用支持性的方式給予前線具體回饋"],
        requirements: ["具長照服務、督導、品管、稽核或護理背景佳", "能客觀觀察、清楚記錄並友善溝通", "重視安全、倫理與服務一致性"],
        support: ["稽核工具", "主管陪同", "改善會議"]
      },
      {
        title: "品質改善專案管理",
        tag: "專案推進",
        image: "assets/quality-recruit-04-quality-meeting.png",
        summary: "把服務問題、數據與跨部門需求整合成改善專案，讓品管不只是檢查，而是推動變好。",
        duties: ["規劃品質改善專案、時程與追蹤指標", "整合督導、行政、講師與前線回饋", "製作改善報告、會議資料與成果追蹤"],
        requirements: ["具專案管理、營運、品管或長照管理經驗佳", "能整理資料、掌握進度並推動跨部門合作", "喜歡把混亂問題變成清楚流程"],
        support: ["專案模板", "資料儀表板", "管理培力"]
      }
    ]
  };
  const adminRecruit = {
    highlights: [
      ["部門任務", "支援人資、財務、總務、客服、營運與投資人窗口，讓前線照顧能穩定運作"],
      ["工作特色", "資料整理、流程管理、跨部門協作、電話諮詢、文件追蹤與營運報表"],
      ["適合對象", "細心穩定、溝通清楚、能整理複雜資訊，也願意支援照顧現場的夥伴"]
    ],
    gallery: [
      ["assets/admin-recruit-01-hr.png", "人資招募與新人報到，是讓好夥伴加入團隊的第一步。"],
      ["assets/admin-recruit-02-operations.png", "營運調度讓服務、人力與資料能順利接上。"],
      ["assets/admin-recruit-03-finance.png", "財務行政把數字、文件與報表整理清楚。"],
      ["assets/admin-recruit-04-service.png", "客服總務承接家庭問題，也支援前線服務。"],
      ["assets/admin-recruit-05-meeting.png", "跨部門會議讓每個專案都有進度與負責人。"]
    ],
    roles: [
      {
        title: "人資招募專員",
        tag: "人才招募",
        image: "assets/admin-recruit-01-hr.png",
        summary: "負責招募、面談安排、新人報到與員工關懷，協助歲悅找到願意長久投入照顧的夥伴。",
        duties: ["發布職缺、履歷篩選、面談安排與錄取通知", "協助新人報到、資料建檔與入職流程", "追蹤新人適應狀況與部門人力需求"],
        requirements: ["具人資、招募、行政或客服經驗佳", "溝通親切、紀錄清楚，能穩定追蹤進度", "認同長照服務，願意理解前線工作型態"],
        support: ["招募模板", "面談流程", "新人關懷"]
      },
      {
        title: "營運行政專員",
        tag: "營運支援",
        image: "assets/admin-recruit-02-operations.png",
        summary: "協助服務資料、排程、跨部門需求與營運進度追蹤，讓每天的照顧服務不被行政流程卡住。",
        duties: ["整理服務資料、排程異動與跨部門需求", "追蹤營運專案、會議待辦與改善進度", "支援主管製作營運報表與流程文件"],
        requirements: ["熟悉表格、文件與資料整理", "能同時管理多項進度並主動回報", "具長照、醫療、教育或服務業行政經驗佳"],
        support: ["流程模板", "主管帶教", "跨部門協作"]
      },
      {
        title: "財務行政專員",
        tag: "財務文件",
        image: "assets/admin-recruit-03-finance.png",
        summary: "負責請款、收支資料、發票憑證、報表整理與行政核對，讓公司營運數據穩定清楚。",
        duties: ["整理收支、請款、發票、憑證與對帳資料", "協助月報、專案報表與合約文件歸檔", "追蹤付款時程、費用申請與行政核銷"],
        requirements: ["具財務、會計、行政或出納經驗佳", "細心、守時，對數字與文件有耐心", "熟悉試算表與基本文書工具"],
        support: ["報表格式", "核銷流程", "財務主管支援"]
      },
      {
        title: "客服總務專員",
        tag: "服務窗口",
        image: "assets/admin-recruit-04-service.png",
        summary: "承接電話、信箱、一般諮詢與總務事項，協助家庭、合作單位與內部團隊快速找到對的人。",
        duties: ["接聽電話、回覆信箱與初步分類需求", "協助總務採購、文件收發與環境物資管理", "追蹤諮詢案件、轉介窗口與回覆進度"],
        requirements: ["具客服、總務、行政或服務窗口經驗佳", "說明清楚、態度穩定，能面對焦急詢問", "能整理資訊並確實追蹤到結案"],
        support: ["回覆腳本", "總務清單", "窗口訓練"]
      },
      {
        title: "投資人與專案行政",
        tag: "專案窗口",
        image: "assets/admin-recruit-05-meeting.png",
        summary: "支援投資人資料、合作提案、專案文件與會議進度，讓外部合作與內部執行有清楚節奏。",
        duties: ["整理投資人資料、簡報、會議紀錄與追蹤事項", "協助合作提案、標案文件與專案時程管理", "彙整各部門進度，製作對外與內部報告"],
        requirements: ["具專案行政、企劃、投資人關係或秘書經驗佳", "文字整理清楚，能掌握會議重點與時程", "具保密意識與跨部門溝通能力"],
        support: ["簡報模板", "專案管理", "主管共作"]
      }
    ]
  };
  const departments = {
    "home-care-team": {
      eyebrow: "Home Care Team",
      title: "居家照顧部門",
      image: "assets/homepage-batch/01-care-home-greeting.png",
      intro: "到長輩熟悉的家中提供照顧，讓安全、尊嚴與家屬安心都被穩定承接。",
      roles: ["居家照顧服務員", "居家服務督導", "個案服務協調"],
      skills: ["身體照顧與生活支持", "服務紀錄與家屬溝通", "異常事件回報"]
    },
    "day-care-team": {
      eyebrow: "Day Care Team",
      title: "日間照顧部",
      image: "assets/homepage-batch/12-community-health-class.png",
      intro: "陪長輩白天有規律作息、活動參與、共餐與社交，也讓家庭有喘息空間。",
      roles: ["日照照顧服務員", "活動帶領員", "照顧班表協調"],
      skills: ["團體活動陪伴", "餐食與休息照顧", "日常安全觀察"]
    },
    "migrant-team": {
      eyebrow: "Migrant Training",
      title: "移工培訓部",
      image: "assets/homepage-batch/11-elder-art-activity.png",
      intro: "把家庭照顧技能拆解成可理解、可練習、可追蹤的課程內容。",
      roles: ["移工培訓講師", "課務助教", "家庭照顧課程企劃"],
      skills: ["照顧技能教學", "跨文化溝通", "課程教材製作"]
    },
    "quality-team": {
      eyebrow: "Teaching Quality",
      title: "教學品管部",
      image: "assets/homepage-batch/14-care-notes.png",
      intro: "把前線經驗整理成教材、稽核與改善流程，讓服務品質可以被複製。",
      roles: ["教育品管專員", "內訓講師", "服務稽核人員"],
      skills: ["教材設計", "服務紀錄檢核", "品管改善追蹤"]
    },
    "admin-team": {
      eyebrow: "Administration",
      title: "行政部",
      image: "assets/homepage-batch/04-admin-team-office.png",
      intro: "支援營運、人資、財務、總務與投資人關係，讓前線照顧能穩定運作。",
      roles: ["行政總務", "人資招募", "財務行政", "客服與投資人窗口"],
      skills: ["跨部門協作", "資料整理與流程管理", "溝通與問題追蹤"]
    }
  };

  const departmentPanel = (key) => {
    const item = departments[key];
    const departmentHero = ({ eyebrow, title, copy, highlights, image, imageAlt, coverClass = "", coverEyebrow, coverTitle }) => `
            <section class="homecare-intro ${coverClass ? `${coverClass}-intro` : ""}">
              <div>
                <p class="eyebrow">${eyebrow}</p>
                <h2>${title}</h2>
                <p>${copy}</p>
                <div class="homecare-highlight-row">
                  ${highlights.map(([highlightTitle, highlightCopy]) => `<article><span>${highlightTitle}</span><strong>${highlightCopy}</strong></article>`).join("")}
                </div>
              </div>
              <aside class="${coverClass ? `${coverClass}-cover` : ""}">
                <img src="${image}" alt="${imageAlt}" />
                <div><span>${coverEyebrow}</span><strong>${coverTitle}</strong></div>
              </aside>
            </section>
    `;
    if (key === "home-care-team") {
      return `
        <section class="career-tab-panel" data-career-panel="${key}">
          <div class="homecare-recruit">
            ${departmentHero({
              eyebrow: "Home Care Team",
              title: "居家照顧部門",
              copy: "居家照顧是歲悅最靠近家庭的一線服務。我們進到長輩熟悉的家，把身體照顧、生活支持、家屬溝通與服務紀錄串成一套穩定流程，讓家庭不用自己猜、照顧者也不是單打獨鬥。",
              highlights: homeCareRecruit.highlights,
              image: "assets/homepage-batch/01-care-home-greeting.png",
              imageAlt: "歲悅居家照顧服務情境",
              coverEyebrow: "Suiyuecare Home Care",
              coverTitle: "把照顧帶進家裡，也把安心留在家裡。"
            })}

            <section class="homecare-gallery" aria-label="居家照顧工作情境">
              ${homeCareRecruit.gallery.map(([image, caption]) => `<figure><img src="${image}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`).join("")}
            </section>

            <section class="homecare-role-section">
              <div class="career-section-head compact">
                <p class="eyebrow">Open Roles</p>
                <h2>居家照顧部門職缺</h2>
                <span>點開每一個職位，可以看到工作內容、應徵條件、公司支持與申請入口。</span>
              </div>
              <div class="homecare-role-grid">
                ${homeCareRecruit.roles.map((role, index) => `
                  <details class="homecare-role-card" ${index === 0 ? "open" : ""}>
                    <summary>
                      <img src="${role.image}" alt="${role.title}" />
                      <div>
                        <span>${role.tag}</span>
                        <h3>${role.title}</h3>
                        <p>${role.summary}</p>
                      </div>
                      <b>查看內容</b>
                    </summary>
                    <div class="homecare-role-detail">
                      <article>
                        <h4>工作內容</h4>
                        <ul>${role.duties.map((duty) => `<li>${duty}</li>`).join("")}</ul>
                      </article>
                      <article>
                        <h4>應徵條件</h4>
                        <ul>${role.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}</ul>
                      </article>
                      <div class="homecare-role-support">
                        ${role.support.map((support) => `<span>${support}</span>`).join("")}
                      </div>
                      <a class="primary-button" href="#contact">申請應徵</a>
                    </div>
                  </details>
                `).join("")}
              </div>
            </section>
          </div>
        </section>
      `;
    }
    if (key === "day-care-team") {
      return `
        <section class="career-tab-panel" data-career-panel="${key}">
          <div class="homecare-recruit daycare-recruit">
            ${departmentHero({
              eyebrow: "Day Care Team",
              title: "日間照顧部",
              copy: "日間照顧是讓長輩白天有安全、有活動、有同伴，也讓家庭有喘息空間的服務。歲悅的日照團隊把作息、餐食、活動、健康觀察與家屬回報整合在一起，讓每一天都被好好安排。",
              highlights: dayCareRecruit.highlights,
              image: "assets/daycare-recruit-02-exercise.png",
              imageAlt: "歲悅日間照顧團體活動情境",
              coverClass: "daycare",
              coverEyebrow: "Suiyuecare Day Care",
              coverTitle: "讓長輩白天被陪伴，也讓家庭晚上更安心。"
            })}

            <section class="homecare-gallery daycare-gallery" aria-label="日間照顧工作情境">
              ${dayCareRecruit.gallery.map(([image, caption]) => `<figure><img src="${image}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`).join("")}
            </section>

            <section class="homecare-role-section">
              <div class="career-section-head compact">
                <p class="eyebrow">Open Roles</p>
                <h2>日間照顧部職缺</h2>
                <span>點開每一個職位，可以看到工作內容、應徵條件、公司支持與申請入口。</span>
              </div>
              <div class="homecare-role-grid">
                ${dayCareRecruit.roles.map((role, index) => `
                  <details class="homecare-role-card daycare-role-card" ${index === 0 ? "open" : ""}>
                    <summary>
                      <img src="${role.image}" alt="${role.title}" />
                      <div>
                        <span>${role.tag}</span>
                        <h3>${role.title}</h3>
                        <p>${role.summary}</p>
                      </div>
                      <b>查看內容</b>
                    </summary>
                    <div class="homecare-role-detail">
                      <article>
                        <h4>工作內容</h4>
                        <ul>${role.duties.map((duty) => `<li>${duty}</li>`).join("")}</ul>
                      </article>
                      <article>
                        <h4>應徵條件</h4>
                        <ul>${role.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}</ul>
                      </article>
                      <div class="homecare-role-support">
                        ${role.support.map((support) => `<span>${support}</span>`).join("")}
                      </div>
                      <a class="primary-button" href="#contact">申請應徵</a>
                    </div>
                  </details>
                `).join("")}
              </div>
            </section>
          </div>
        </section>
      `;
    }
    if (key === "migrant-team") {
      return `
        <section class="career-tab-panel" data-career-panel="${key}">
          <div class="homecare-recruit migrant-recruit">
            ${departmentHero({
              eyebrow: "Migrant Training",
              title: "移工培訓部",
              copy: "移工培訓部把家庭照顧常見的身體照顧、移位安全、備餐營養、溝通回報與照顧紀錄，整理成可以聽懂、看懂、練習、回家後能執行的課程。這個部門不只是教技能，更是在家庭、移工與照顧團隊之間建立共同語言。",
              highlights: migrantRecruit.highlights,
              image: "assets/migrant-recruit-01-classroom.png",
              imageAlt: "歲悅移工培訓課堂情境",
              coverClass: "migrant",
              coverEyebrow: "Suiyuecare Training",
              coverTitle: "把照顧教到會，也把家庭接得更穩。"
            })}

            <section class="homecare-gallery migrant-gallery" aria-label="移工培訓工作情境">
              ${migrantRecruit.gallery.map(([image, caption]) => `<figure><img src="${image}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`).join("")}
            </section>

            <section class="homecare-role-section">
              <div class="career-section-head compact">
                <p class="eyebrow">Open Roles</p>
                <h2>移工培訓部職缺</h2>
                <span>點開每一個職位，可以看到工作內容、應徵條件、公司支持與申請入口。</span>
              </div>
              <div class="homecare-role-grid">
                ${migrantRecruit.roles.map((role, index) => `
                  <details class="homecare-role-card migrant-role-card" ${index === 0 ? "open" : ""}>
                    <summary>
                      <img src="${role.image}" alt="${role.title}" />
                      <div>
                        <span>${role.tag}</span>
                        <h3>${role.title}</h3>
                        <p>${role.summary}</p>
                      </div>
                      <b>查看內容</b>
                    </summary>
                    <div class="homecare-role-detail">
                      <article>
                        <h4>工作內容</h4>
                        <ul>${role.duties.map((duty) => `<li>${duty}</li>`).join("")}</ul>
                      </article>
                      <article>
                        <h4>應徵條件</h4>
                        <ul>${role.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}</ul>
                      </article>
                      <div class="homecare-role-support">
                        ${role.support.map((support) => `<span>${support}</span>`).join("")}
                      </div>
                      <a class="primary-button" href="#contact">申請應徵</a>
                    </div>
                  </details>
                `).join("")}
              </div>
            </section>
          </div>
        </section>
      `;
    }
    if (key === "quality-team") {
      return `
        <section class="career-tab-panel" data-career-panel="${key}">
          <div class="homecare-recruit quality-recruit">
            ${departmentHero({
              eyebrow: "Teaching Quality",
              title: "教學品管部",
              copy: "教學品管部把前線照顧經驗變成可被學習、檢核與改善的系統。從新人訓練、教材設計、服務紀錄檢核到品質改善專案，這個部門讓歲悅的服務不是只靠個人努力，而是靠制度穩定變好。",
              highlights: qualityRecruit.highlights,
              image: "assets/quality-recruit-04-quality-meeting.png",
              imageAlt: "歲悅教學品管品質會議情境",
              coverClass: "quality",
              coverEyebrow: "Suiyuecare Quality",
              coverTitle: "把好的照顧整理成方法，再讓方法長成制度。"
            })}

            <section class="homecare-gallery quality-gallery" aria-label="教學品管工作情境">
              ${qualityRecruit.gallery.map(([image, caption]) => `<figure><img src="${image}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`).join("")}
            </section>

            <section class="homecare-role-section">
              <div class="career-section-head compact">
                <p class="eyebrow">Open Roles</p>
                <h2>教學品管部職缺</h2>
                <span>點開每一個職位，可以看到工作內容、應徵條件、公司支持與申請入口。</span>
              </div>
              <div class="homecare-role-grid">
                ${qualityRecruit.roles.map((role, index) => `
                  <details class="homecare-role-card quality-role-card" ${index === 0 ? "open" : ""}>
                    <summary>
                      <img src="${role.image}" alt="${role.title}" />
                      <div>
                        <span>${role.tag}</span>
                        <h3>${role.title}</h3>
                        <p>${role.summary}</p>
                      </div>
                      <b>查看內容</b>
                    </summary>
                    <div class="homecare-role-detail">
                      <article>
                        <h4>工作內容</h4>
                        <ul>${role.duties.map((duty) => `<li>${duty}</li>`).join("")}</ul>
                      </article>
                      <article>
                        <h4>應徵條件</h4>
                        <ul>${role.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}</ul>
                      </article>
                      <div class="homecare-role-support">
                        ${role.support.map((support) => `<span>${support}</span>`).join("")}
                      </div>
                      <a class="primary-button" href="#contact">申請應徵</a>
                    </div>
                  </details>
                `).join("")}
              </div>
            </section>
          </div>
        </section>
      `;
    }
    if (key === "admin-team") {
      return `
        <section class="career-tab-panel" data-career-panel="${key}">
          <div class="homecare-recruit admin-recruit">
            ${departmentHero({
              eyebrow: "Administration",
              title: "行政部",
              copy: "行政部是讓歲悅前線服務能穩定運作的後勤核心。從人資招募、營運調度、財務行政、客服總務到投資人與專案支援，每一個看似細節的流程，都會影響照顧是否能準時、清楚、持續地被交付。",
              highlights: adminRecruit.highlights,
              image: "assets/admin-recruit-05-meeting.png",
              imageAlt: "歲悅行政部跨部門會議情境",
              coverClass: "admin",
              coverEyebrow: "Suiyuecare Admin",
              coverTitle: "讓後勤有秩序，前線照顧才有餘裕。"
            })}

            <section class="homecare-gallery admin-gallery" aria-label="行政部工作情境">
              ${adminRecruit.gallery.map(([image, caption]) => `<figure><img src="${image}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`).join("")}
            </section>

            <section class="homecare-role-section">
              <div class="career-section-head compact">
                <p class="eyebrow">Open Roles</p>
                <h2>行政部職缺</h2>
                <span>點開每一個職位，可以看到工作內容、應徵條件、公司支持與申請入口。</span>
              </div>
              <div class="homecare-role-grid">
                ${adminRecruit.roles.map((role, index) => `
                  <details class="homecare-role-card admin-role-card" ${index === 0 ? "open" : ""}>
                    <summary>
                      <img src="${role.image}" alt="${role.title}" />
                      <div>
                        <span>${role.tag}</span>
                        <h3>${role.title}</h3>
                        <p>${role.summary}</p>
                      </div>
                      <b>查看內容</b>
                    </summary>
                    <div class="homecare-role-detail">
                      <article>
                        <h4>工作內容</h4>
                        <ul>${role.duties.map((duty) => `<li>${duty}</li>`).join("")}</ul>
                      </article>
                      <article>
                        <h4>應徵條件</h4>
                        <ul>${role.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}</ul>
                      </article>
                      <div class="homecare-role-support">
                        ${role.support.map((support) => `<span>${support}</span>`).join("")}
                      </div>
                      <a class="primary-button" href="#contact">申請應徵</a>
                    </div>
                  </details>
                `).join("")}
              </div>
            </section>
          </div>
        </section>
      `;
    }
    return `
      <section class="career-tab-panel" data-career-panel="${key}">
        <div class="career-dept-layout">
          <article class="career-dept-image">
            <img src="${item.image}" alt="${item.title}招募情境" />
            <div><span>${item.eyebrow}</span><h3>${item.title}</h3></div>
          </article>
          <div class="career-dept-content">
            <p class="eyebrow">${item.eyebrow}</p>
            <h2>${item.title}</h2>
            <p>${item.intro}</p>
            <div class="career-role-grid">
              ${item.roles.map((role) => `<article><span>Role</span><strong>${role}</strong></article>`).join("")}
            </div>
            <div class="career-skill-list">
              ${item.skills.map((skill) => `<span>${skill}</span>`).join("")}
            </div>
            <a class="primary-button" href="#contact">我要應徵</a>
          </div>
        </div>
      </section>
    `;
  };

  return `
    <div class="career-page">
      <section class="service-detail-hero talent-recruit-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">We want you</p>
          <h1>加入歲悅，把照顧變成一份能長久發展的專業。</h1>
          <p>歲悅長照集團提供清楚訓練、督導支持、部門分工與升遷制度，讓照顧工作不只是辛苦，而是能被支持、被看見、被成就。</p>
          <div class="hero-actions"><a class="primary-button" href="#contact">投遞履歷</a><a class="secondary-button" href="#career-openings">查看職缺</a></div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/homepage-batch/06-orange-polo-supervisor.png" alt="歲悅長照人才招募" />
          <div><span>Suiyuecare Careers</span><strong>有制度的照顧，才走得長久。</strong></div>
        </aside>
      </section>

      <nav class="career-tabs" aria-label="人才招募分頁">
        <button class="active" type="button" data-career-tab="career-growth">公司升遷發展制度</button>
        <button type="button" data-career-tab="benefits">公司福利制度</button>
        <button type="button" data-career-tab="home-care-team">居家照顧部門</button>
        <button type="button" data-career-tab="day-care-team">日間照顧部</button>
        <button type="button" data-career-tab="migrant-team">移工培訓部</button>
        <button type="button" data-career-tab="quality-team">教學品管部</button>
        <button type="button" data-career-tab="admin-team">行政部</button>
      </nav>

      <section class="career-tab-panel active" data-career-panel="career-growth">
        <div class="career-section-head">
          <p class="eyebrow">Career Path</p>
          <h2>公司升遷發展制度</h2>
          <span>歲悅不把升遷只交給年資，而是把品質、能力、帶教與責任感變成清楚可追蹤的發展路徑。</span>
        </div>
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
          ${careerSteps.map(([period, title, copy], index) => `<article><span>${String(index + 1).padStart(2, "0")}｜${period}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
        <div class="career-track-map">
          ${careerTracks.map(([track, stages]) => `
            <article class="career-track-card">
              <h3>${track}</h3>
              <div class="career-stage-list">
                ${stages.map((stage, index) => `<span><i>${index + 1}</i>${stage}</span>`).join("")}
              </div>
            </article>
          `).join("")}
        </div>
        <div class="career-evaluation-grid">
          ${promotionCriteria.map(([title, copy]) => `<article><span>Evaluation</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
        </div>
        <div class="career-growth-board">
          <article><b>3 個月</b><span>新人陪跑與第一次回饋</span></article>
          <article><b>6 個月</b><span>進階模組與職能確認</span></article>
          <article><b>12 個月</b><span>帶教、督導或講師培力</span></article>
          <article><b>18 個月</b><span>跨部門專案與管理職準備</span></article>
        </div>
      </section>

      <section class="career-tab-panel" data-career-panel="benefits">
        <div class="career-section-head">
          <p class="eyebrow">Benefits</p>
          <h2>公司福利制度</h2>
          <span>福利不只是項目，而是讓照顧者能穩定工作、放心成長、被團隊接住的支持系統。</span>
        </div>
        <div class="benefit-hero-board">
          <article class="benefit-hero-copy">
            <span>Suiyuecare Benefits</span>
            <h3>照顧者被好好支持，長輩才會被好好照顧。</h3>
            <p>歲悅把福利設計成一套可以落地的工作支持：薪資獎金、排班溝通、督導陪跑、教育訓練、健康保障與團隊歸屬，讓夥伴不用靠硬撐完成照顧工作。</p>
          </article>
          <aside class="benefit-highlight-grid">
            ${benefitHighlights.map(([label, value, copy]) => `<div><strong>${value}</strong><span>${label}</span><p>${copy}</p></div>`).join("")}
          </aside>
        </div>
        <div class="benefit-grid">
          ${benefits.map(([title, copy, tags]) => `<article><span>Benefit</span><h3>${title}</h3><p>${copy}</p><div>${tags.map((tag) => `<em>${tag}</em>`).join("")}</div></article>`).join("")}
        </div>
        <div class="benefit-system-board">
          ${benefitSystems.map(([title, items]) => `
            <article>
              <h3>${title}</h3>
              <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
            </article>
          `).join("")}
        </div>
      </section>

      ${departmentPanel("home-care-team")}
      ${departmentPanel("day-care-team")}
      ${departmentPanel("migrant-team")}
      ${departmentPanel("quality-team")}
      ${departmentPanel("admin-team")}

      <section class="career-openings" id="career-openings">
        <div class="career-section-head">
          <p class="eyebrow">Open Roles</p>
          <h2>熱門招募職缺</h2>
          <span>可先放熱門職缺，後續再串接 WordPress 後台或招募平台資料。</span>
        </div>
        <div class="opening-grid">
          ${openings.map(([title, dept, copy, image]) => `
            <article>
              <img src="${image}" alt="${title}" />
              <div><span>${dept}</span><h3>${title}</h3><p>${copy}</p><a href="#contact">立即應徵</a></div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderIrPlaceholderPage(kind) {
  const config = {
    governance: {
      eyebrow: "Corporate Governance",
      title: "公司治理",
      intro: "此頁將整理重要訊息、公司治理運作、重要管理階層、吹哨者專區、治理評鑑、內部稽核、風險管理與誠信經營。",
      tabs: ["重要訊息", "公司治理運作", "重要管理階層", "吹哨者專區", "治理評鑑專區", "內部稽核", "風險管理", "誠信經營"]
    },
    shareholders: {
      eyebrow: "Shareholder Services",
      title: "股東專區",
      intro: "此頁將整理股務資訊、股東會、法說會與常見問答，未來可接公告文件、會議資料與投資人提問流程。",
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
        <div class="investor-section-head"><p class="eyebrow">Coming Next</p><h2>${config.tabs[0]}</h2><span>這個大項已接上 Header，下一步可依你的順序逐頁設計完整內容。</span></div>
        <div class="download-grid">
          ${config.tabs.slice(0, 4).map((tab) => `<a href="#contact"><span>Template</span><strong>${tab}</strong><em>規劃中</em></a>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderArticleLoadingPage() {
  return `
    <article class="article-page">
      <div class="article-topbar">
        <a class="article-back" href="#health">返回上一頁</a>
        <span class="article-category">Health 3.0</span>
      </div>
      <section class="health-empty-state">
        <h2>正在讀取文章</h2>
        <p>請稍候，正在從 Supabase 取得已發布內容。</p>
      </section>
    </article>
  `;
}

function renderPageLoadingState(title = "正在讀取頁面", body = "請稍候，正在取得最新後台內容。") {
  return `
    <article class="article-page">
      <section class="health-empty-state">
        <h2>${escapeHTML(title)}</h2>
        <p>${escapeHTML(body)}</p>
      </section>
    </article>
  `;
}

async function renderServiceTemplatePageOnce(slug, fallbackRenderer, afterRender) {
  const fallbackHtml = fallbackRenderer();
  pageView.innerHTML = fallbackHtml;
  const loaded = await loadSupabaseServiceTemplatePage(slug);
  if (location.hash.slice(1).split("?")[0] !== slug) return;
  if (!loaded) {
    pageView.innerHTML = fallbackHtml;
  }
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
        <p>前台只會顯示已發布並啟用的文章。若這篇文章還是草稿，請先到後台文章管理將狀態改為已發布。</p>
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
          <a class="secondary-button" href="#contact">聯絡我們</a>
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
  const current = getHealthArticleList().find((item) => item.slug === slug || item.href === `#article-${slug}`);
  const relatedSlugs = Array.isArray(current?.relatedSlugs) ? current.relatedSlugs : [];
  const curatedRelated = relatedSlugs
    .map((relatedSlug) => getHealthArticleList().find((item) => item.slug === relatedSlug || item.href === `#article-${relatedSlug}`))
    .filter(Boolean)
    .map((item) => ({
      href: item.href,
      image: item.image,
      category: item.category,
      title: item.title,
      focalPoint: item.focalPoint
    }));
  if (curatedRelated.length) return curatedRelated.slice(0, 7);

  const cmsRelated = getHealthArticleList()
    .filter((item) => item.slug !== slug && item.href !== `#article-${slug}`)
    .slice(0, 7)
    .map((item) => ({
      href: item.href,
      image: item.image,
      category: item.category,
      title: item.title
    }));

  if (cmsRelated.length) return cmsRelated;
  return relatedArticleCards
    .filter((item) => item.href !== `#article-${slug}`)
    .slice(0, 7);
}

function renderArticleLayout(article) {
  const related = getRelatedArticles(article.slug);

  return `
    <article class="article-page">
      <div class="article-topbar">
        <a class="article-back" href="#health">返回上一頁</a>
        <span class="article-category">${escapeHTML(article.category)}</span>
      </div>

      <header class="article-hero">
        <figure>
          <img src="${escapeHTML(article.image)}" alt="${escapeHTML(article.title)}"${imageStyleAttr({ usage: article.imageUsage || "article_cover", focalPoint: article.focalPoint })} />
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
            ${(article.tags || []).map((tag) => `<span class="meta-tag"># ${escapeHTML(tag)}</span>`).join("")}
          </div>

          ${article.videoEmbedUrl ? `
            <section class="article-video-block">
              ${article.videoProvider === "youtube" || article.videoProvider === "vimeo"
                ? `<iframe src="${escapeHTML(article.videoEmbedUrl)}" title="${escapeHTML(article.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
                : `<video src="${escapeHTML(article.videoEmbedUrl)}" controls preload="metadata" poster="${escapeHTML(article.image)}"></video>`}
              <div><span>${escapeHTML(article.videoLabel || article.category)}${article.videoDuration ? ` · ${escapeHTML(article.videoDuration)}` : ""}</span><p>${escapeHTML(article.videoCaption || article.subtitle || "")}</p></div>
            </section>
          ` : ""}

          ${article.summary?.length ? `
            <div class="article-summary">
              <strong>本文重點</strong>
              <ul>${article.summary.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
            </div>
          ` : ""}

          <div class="article-body">
            ${Array.isArray(article.content) ? article.content.map(([heading, body]) => `
              <section>
                <h2>${escapeHTML(heading)}</h2>
                <p>${escapeHTML(body)}</p>
              </section>
            `).join("") : renderMarkdownContent(article.content)}
            ${Array.isArray(article.faq) && article.faq.length ? `
              <section class="article-faq">
                <h2>常見問題</h2>
                ${article.faq.map((item) => `
                  <details>
                    <summary>${escapeHTML(item.question || "")}</summary>
                    <p>${escapeHTML(item.answer || "")}</p>
                  </details>
                `).join("")}
              </section>
            ` : ""}
            <div class="article-cta">
              <p>${escapeHTML(article.cta || "不確定下一步怎麼安排？留下需求，讓歲悅協助判斷。")}</p>
              <a href="${escapeHTML(article.ctaUrl || "#contact")}">${escapeHTML(article.ctaText || "預約照顧諮詢")}</a>
            </div>
            ${article.sourceName || article.sourceUrl ? `
              <p class="article-source">資料來源：${article.sourceUrl ? `<a href="${escapeHTML(article.sourceUrl)}" target="_blank" rel="noopener">${escapeHTML(article.sourceName || article.sourceUrl)}</a>` : escapeHTML(article.sourceName)}</p>
            ` : ""}
          </div>

          <section class="article-related">
            <div class="article-related-head">
              <span>Related Articles</span>
              <strong>延伸閱讀</strong>
            </div>
            <div class="article-related-grid">
              ${related.map((item) => `
                <a href="${escapeHTML(item.href)}">
                  <img src="${escapeHTML(item.image)}" alt=""${imageStyleAttr({ usage: "card", focalPoint: item.focalPoint })} />
                  <span>${escapeHTML(item.category)}</span>
                  <b>${escapeHTML(item.title)}</b>
                </a>
              `).join("")}
            </div>
          </section>
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
          <a class="article-ad" href="#talent">
            <span>We want you</span>
            <strong>加入歲悅團隊</strong>
            <p>居服員、督導、日照照服員招募中。</p>
          </a>
        </aside>
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
    cta: article.cta
  });
}

async function loadArticlePage(slug) {
  try {
    const article = await fetchSupabaseArticlePage(slug);
    if (location.hash.slice(1).split("?")[0] !== `article-${slug}`) return;
    if (article) {
      setRouteSeo(`article-${slug}`, {
        title: article.seoTitle || `${article.title}｜健康3.0`,
        description: article.seoDescription || article.excerpt || article.subtitle || DEFAULT_SEO.description,
        image: article.image,
        imageAlt: article.title,
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
    pageView.innerHTML = article ? renderArticleLayout(article) : renderArticleNotFoundPage();
  } catch (error) {
    console.warn("Supabase article page unavailable.", error);
    if (location.hash.slice(1).split("?")[0] !== `article-${slug}`) return;
    if (!supabase && articlePages[slug]) {
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
    pageView.innerHTML = supabase ? renderArticleNotFoundPage() : renderStaticArticlePage(slug);
  }
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
  return renderArticleLayout({
    slug: `care-story-${story.slug}`,
    category: story.service,
    title: story.title,
    subtitle: `${story.name}｜${story.label}`,
    excerpt: story.praise,
    image: story.image,
    author: "Suiyuecare Corps.",
    date: story.date,
    tags: story.tags,
    summary: [story.praise, story.quote].filter(Boolean),
    content: [
      ["家屬怎麼稱讚歲悅", story.praise],
      ["照顧故事", story.body || story.quote || story.praise]
    ],
    cta: "想知道家人的狀況適合哪一種照顧安排？留下需求，讓歲悅協助判斷。"
  });
}

function renderExpertTalkArticle(talk) {
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
    summary: [talk.topic, talk.quote].filter(Boolean),
    content: [
      ["講者觀點", talk.quote || talk.summary],
      ["完整分享", talk.body || talk.summary || talk.quote]
    ],
    cta: "想看更多照顧觀點與健康3.0內容？回到健康3.0閱讀更多文章。"
  });
}

async function loadCareStoryPage(slug) {
  try {
    const story = await fetchCareStoryPage(slug);
    if (location.hash.slice(1).split("?")[0] !== `care-story-${slug}`) return;
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
    if (location.hash.slice(1).split("?")[0] !== `master-talk-${slug}`) return;
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

  if (articleSlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderArticleLoadingPage();
    loadArticlePage(articleSlug);
  } else if (careStorySlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderArticleLoadingPage();
    loadCareStoryPage(careStorySlug);
  } else if (masterTalkSlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderArticleLoadingPage();
    loadExpertTalkPage(masterTalkSlug);
  } else if (normalized === "about") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderAboutPage();
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
    loadSupabaseRecruitingPage(normalized);
  } else if (normalized === "investor-recruiting") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderInvestorRecruitingPage();
    loadSupabaseRecruitingPage(normalized);
  } else if (normalized === "health") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderHealthPage(searchParams.get("category") || "");
    loadSupabaseHealthArticles({ rerender: true });
    loadSupabaseArticleCategories({ rerender: true });
  } else if (normalized === "search") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderSearchPage(searchParams.get("q") || "");
    loadSupabaseHealthArticles({ rerender: true });
  } else if (normalized === "courses") {
    renderCoursesPageFromCms();
  } else if (normalized === "talent") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderTalentPage();
    loadSupabaseRecruitingPage(normalized);
  } else if (normalized === "investors") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderInvestorPageOnce(normalized, renderInvestorsPage);
  } else if (normalized === "ir-finance") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderInvestorPageOnce(normalized, renderFinancePage);
  } else if (normalized === "ir-governance") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderInvestorPageOnce(normalized, renderGovernancePage);
  } else if (normalized === "ir-shareholders") {
    home.classList.remove("active");
    pageView.classList.add("active");
    renderInvestorPageOnce(normalized, renderShareholdersPage);
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
                <p>這裡可接續放入正式文案、照片、流程說明、FAQ 或後台資料串接。</p>
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
    link.classList.toggle("active", link.getAttribute("href") === `#${normalized}`);
  });

  nav?.classList.remove("open");
  document.body.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "開啟主選單");
  navGroups.forEach((group) => group.classList.remove("open"));
  navGroups.forEach((group) => group.querySelector(".nav-trigger")?.setAttribute("aria-expanded", "false"));

  if (anchorTarget && normalized !== "home") {
    anchorTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (!isHome && !articleSlug && !careStorySlug && !masterTalkSlug && !handledBySpecialCms && !["health", "search"].includes(normalized)) {
    loadSupabaseDetailPage(normalized);
  }

  trackPageView(`#${rawSlug || "home"}`);
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

window.setTimeout(() => {
  revealItems.forEach((item) => item.classList.add("in-view"));
}, 900);

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
      targetUrl: location.hash || "#talent"
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
    openCourseSignup(courseCard.dataset.courseTitle || courseCard.querySelector("h3")?.textContent || "", courseCard.dataset.courseId || "");
    return;
  }

  if (event.target.closest("[data-course-close]") || event.target.id === "courseSignupModal") {
    closeCourseSignup();
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
          ? "已送出，我們會盡快與你聯繫。"
          : "資料已留存在後台；寄信尚未完成設定，請通知管理者。";
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
    : `報名資訊已留存在後台，但寄信尚未設定，${seconds} 秒後前往 LINE@。`;
  const countdown = window.setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      window.clearInterval(countdown);
      trackAnalyticsEvent("join_line_click", { label: "課程報名完成後前往 LINE@", targetUrl: COURSE_LINE_URL });
      window.location.assign(COURSE_LINE_URL);
    } else {
      status.textContent = result.emailSent
        ? `報名資訊已寄出，${seconds} 秒後前往 LINE@。`
        : `報名資訊已留存在後台，但寄信尚未設定，${seconds} 秒後前往 LINE@。`;
    }
  }, 1000);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form");
  if (!form || form.id === "courseSignupForm" || form.classList.contains("health-search")) return;
  if (form.classList.contains("contact-form")) {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const originalText = submitButton?.textContent || "送出諮詢";
    submitButton?.setAttribute("disabled", "true");
    if (submitButton) submitButton.textContent = "送出中...";
    sendBackendForm(form, "contact").then((result) => {
      trackAnalyticsEvent("form_submit", {
        label: "聯絡我們",
        targetUrl: form.action || location.href,
        metadata: { form_class: "contact-form", email_sent: Boolean(result.emailSent) }
      });
      form.reset();
      if (submitButton) {
        submitButton.textContent = result.emailSent
          ? "已送出，我們會盡快聯絡"
          : "已留存後台，寄信尚未設定";
      }
    }).catch((error) => {
      console.warn("Contact form failed.", error);
      trackFrontendError("contact_form_failed", { message: error.message, stack: error.stack });
      window.alert(error.message || "送出失敗，請稍後再試。");
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

document.addEventListener("click", (event) => {
  const careerTab = event.target.closest("[data-career-tab]");
  if (careerTab) {
    const tabName = careerTab.dataset.careerTab;
    document.querySelectorAll("[data-career-tab]").forEach((button) => {
      button.classList.toggle("active", button === careerTab);
    });
    document.querySelectorAll("[data-career-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.careerPanel === tabName);
    });
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

  const card = event.target.closest(".click-card, .health-preview, .story-slider article, .celebrity-slider article");
  if (!card || event.target.closest("a, button, input, select, textarea")) return;
  const href = card.dataset.href || card.querySelector("a[href]")?.getAttribute("href");
  if (href) location.hash = href.replace(/^#/, "");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".click-card");
  if (!card || event.target.closest("a, button, input, select, textarea")) return;
  event.preventDefault();
  const href = card.dataset.href;
  if (href) location.hash = href.replace(/^#/, "");
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest(".health-search");
  if (!form) return;
  event.preventDefault();
  const formData = new FormData(form);
  const query = String(formData.get("q") || "").trim();
  location.hash = `search?q=${encodeURIComponent(query)}`;
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

window.addEventListener("hashchange", () => renderPage(location.hash.slice(1)));
window.addEventListener("scroll", () => {
  updateMilestoneProgress();
  updateScrollProgress();
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
  updateScrollProgress();
});
window.addEventListener("pagehide", flushPageEngagement);
updateScrollProgress();
renderPage(location.hash.slice(1));
loadSupabaseSiteSettings();
loadSupabasePageContent("home");
loadSupabaseHomeModules().then((loaded) => {
  if (!loaded) loadWordPressContent();
  loadSupabaseStoryDatabases();
});

window.setTimeout(() => {
  introLoader?.remove();
}, 6200);

window.addEventListener("load", () => {
  window.setTimeout(() => {
    if (!location.hash || location.hash === "#home") {
      history.replaceState(null, "", "#home");
      renderPage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    introLoader?.remove();
  }, 4850);
});
