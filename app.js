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
    title: "大記事",
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
const groups = document.querySelectorAll(".nav-group");
const home = document.querySelector("#home");
const pageView = document.querySelector("#pageView");
const revealItems = document.querySelectorAll(".reveal");
const introLoader = document.querySelector(".intro-loader");
const COURSE_NOTIFY_EMAIL = "edu.control@suiyuecare.com";
const COURSE_LINE_URL = "https://lin.ee/oaPkGiq";

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
    return {
      source: utmSource || "utm",
      medium: utmMedium || "unknown",
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
  if (!supabase) return;
  const rpcName = table === "analytics_page_views" ? "track_page_view" : "track_analytics_event";
  supabase.rpc(rpcName, { payload }).then(({ error }) => {
    if (error) console.warn(`Analytics insert failed for ${table}.`, error);
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
      form_class: form.className || null
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
  const category = categoryData?.name || "照顧知識";
  const slug = categoryData?.slug || categorySlug(category);
  const cover = mediaById.get(article.cover_image_id);
  const image = cover?.public_url || "assets/homepage-batch/10-family-consultation.png";
  const subtitle = article.subtitle || article.excerpt || "";
  const excerpt = article.excerpt || article.subtitle || stripHTML(article.content || "").slice(0, 88);
  const publishedAt = article.published_at || article.updated_at;
  const tags = Array.isArray(article.tags) ? article.tags.join(" ") : "";

  return {
    href: `#article-${article.slug}`,
    slug: article.slug,
    category,
    categorySlug: slug,
    title: article.title || "未命名文章",
    subtitle,
    excerpt,
    image,
    imageUsage: cover?.image_usage || "article_cover",
    focalPoint: cover?.focal_point || "center",
    author: article.author_name || "歲悅照顧編輯部",
    date: formatArticleDate(publishedAt),
    publishedAt,
    isFeatured: Boolean(article.is_featured),
    keywords: `${article.title || ""} ${subtitle} ${excerpt} ${category} ${tags}`
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
    .select("id, name, slug, sort_order, is_enabled")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug || categorySlug(category.name)
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
      cover_image_id,
      author_name,
      tags,
      is_featured,
      published_at,
      updated_at
    `)
    .eq("status", "published")
    .eq("is_enabled", true)
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
      ? supabase.from("article_categories").select("id, name, slug").in("id", categoryIds)
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
  return {
    slug: article.slug,
    category: category?.name || "照顧知識",
    categorySlug: category?.slug || categorySlug(category?.name || "照顧知識"),
    title: article.title || "未命名文章",
    subtitle: article.subtitle || article.excerpt || "",
    excerpt: article.excerpt || article.subtitle || "",
    image: cover?.public_url || "assets/homepage-batch/10-family-consultation.png",
    imageUsage: cover?.image_usage || "article_cover",
    focalPoint: cover?.focal_point || "center",
    author: article.author_name || "歲悅照顧編輯部",
    date: formatArticleDate(publishedAt),
    tags: Array.isArray(article.tags) ? article.tags : [],
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
      cover_image_id,
      author_name,
      tags,
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
          .select("id, name, slug")
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
  if (page.seo_title || page.title) document.title = page.seo_title || `${page.title}｜Suiyuecare Corps.`;
  const seoDescription = document.querySelector('meta[name="description"]');
  if (seoDescription && page.seo_description) seoDescription.setAttribute("content", page.seo_description);

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

    document.title = page.seo_title || `${page.title}｜Suiyuecare Corps.`;
    const seoDescription = document.querySelector('meta[name="description"]');
    if (seoDescription && page.seo_description) seoDescription.setAttribute("content", page.seo_description);
    pageView.innerHTML = renderCmsDetailPage(page, sections || []);
  } catch (error) {
    console.warn(`Supabase detail page unavailable for ${slug}.`, error);
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

async function loadWordPressContent() {
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

const locationData = {
  shilin: {
    image: "assets/homepage-batch/16-taipei-service-office.png",
    alt: "士林服務據點照片",
    type: "臺北市｜居家照顧站",
    name: "Suiyuecare Corps. 士林照顧站",
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
    name: "Suiyuecare Corps. 大同諮詢站",
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
    name: "Suiyuecare Corps. 萬華居家服務點 A",
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
    name: "Suiyuecare Corps. 萬華照顧服務點 B",
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
    name: "Suiyuecare Corps. 信義健康促進站",
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
    name: "Suiyuecare Corps. 新店日照據點",
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
    name: "Suiyuecare Corps. 新莊社區據點",
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
    name: "Suiyuecare Corps. 蘆竹復能中心",
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
  const isWanhua = locationKey === "wanhua-a" || locationKey === "wanhua-b";

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
    wanhuaTabs.hidden = !isWanhua;
    wanhuaTabs.querySelectorAll("button").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.locationTab === locationKey);
    });
  }

  document.querySelectorAll(".location-pin").forEach((pin) => {
    const isActive = pin.dataset.location === locationKey || (pin.dataset.location === "wanhua-a" && isWanhua);
    pin.classList.toggle("active", isActive);
  });
}

function renderHealthPage(selectedCategorySlug = "") {
  const allArticles = getHealthArticleList();
  const categories = getHealthCategoryList();
  const activeCategory = selectedCategorySlug || "";
  const articles = activeCategory
    ? allArticles.filter((article) => article.categorySlug === activeCategory)
    : allArticles;
  const feature = articles[0];
  const quickCards = articles.slice(1, 5);
  const latestCards = articles.slice(0, 10);
  const lazyPacks = [
    ["長照申請懶人包", "從評估、補助、服務媒合到第一次到宅，照著順序看就懂。", "assets/homepage-batch/10-family-consultation.png", "#article-longterm-care-apply"],
    ["出院返家照顧包", "把返家前準備、移位、用餐與每日觀察整理成家屬清單。", "assets/homepage-batch/01-care-home-greeting.png", "#article-family-care-story"],
    ["失智陪伴懶人包", "重複提問、情緒不安與日常安全，用簡單方法降低摩擦。", "assets/homepage-batch/19-health-dementia-cover.png", "#article-dementia-response"]
  ];
  const eventCards = [
    ["家屬照顧技巧課", "移位、用餐、跌倒預防與照顧溝通", "5/28", "assets/homepage-batch/12-community-health-class.png", "#article-family-care-course"],
    ["日照體驗參觀日", "認識日間照顧流程與家庭喘息安排", "6/05", "assets/homepage-batch/02-daycare-group-exercise.png", "#article-day-care-respite"],
    ["復能照顧工作坊", "讓長輩一步一步恢復生活能力", "6/12", "assets/homepage-batch/13-rehab-walking-practice.png", "#article-reablement-workshop"]
  ];
  const videoCards = [
    ["影片", "三分鐘理解居家照顧安排流程", "assets/homepage-batch/15-phone-consultation.png", "#article-master-talk-care-psychology"],
    ["影片", "日間照顧如何讓家庭喘息", "assets/homepage-batch/12-community-health-class.png", "#article-master-talk-care-psychology"],
    ["短影片", "跌倒後 24 小時觀察重點", "assets/homepage-batch/14-care-notes.png", "#article-fall-observation"],
    ["短影片", "浴室安全的快速檢查", "assets/homepage-batch/08-orange-apron-walking.png", "#article-bathroom-safety"]
  ];

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

      <section class="health-pack-section">
        <div class="health-section-head">
          <div><p class="eyebrow">Guides</p><h2>懶人包</h2></div>
          <a href="#search?q=${encodeURIComponent("懶人包")}">更多懶人包</a>
        </div>
        <div class="health-pack-grid">
          ${lazyPacks.map(([title, desc, image, href]) => `
            <article class="health-pack-card click-card" data-href="${href}" tabindex="0" role="link">
              <img src="${image}" alt="${title}" />
              <div><span>懶人包</span><h3>${title}</h3><p>${desc}</p></div>
            </article>
          `).join("")}
        </div>
      </section>

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

      <section class="health-event-section">
        <div class="health-section-head">
          <div><p class="eyebrow">Events</p><h2>活動專區</h2></div>
          <a href="#courses">課程報名</a>
        </div>
        <div class="health-event-grid">
          ${eventCards.map(([title, desc, date, image, href]) => `
            <article class="health-event-card click-card" data-href="${href}" tabindex="0" role="link">
              <img src="${image}" alt="${title}" />
              <div><time>${date}</time><h3>${title}</h3><p>${desc}</p></div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="health-media-hub">
        <div class="health-section-head">
          <div><p class="eyebrow">Video</p><h2>影音與短影片</h2></div>
          <a href="#search?q=${encodeURIComponent("影片")}">更多影音</a>
        </div>
        <div class="health-media-grid">
          ${videoCards.map(([type, title, image, href]) => `
            <article class="health-video-card click-card" data-href="${href}" tabindex="0" role="link">
              <img src="${image}" alt="${title}" />
              <div><span>${type}</span><h3>${title}</h3></div>
            </article>
          `).join("")}
        </div>
      </section>
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

function renderCoursesPage() {
  const courses = [
    {
      title: "照服員核心訓練班",
      intro: "建立照服員上線前的基本能力。",
      date: "2026.05.20",
      time: "09:00-17:00",
      price: "NT$ 3,600",
      type: "實體課",
      location: "臺北教室",
      seats: "剩餘 12 名",
      image: "assets/homepage-batch/05-orange-polo-caregiver.png"
    },
    {
      title: "家庭照顧者實用課",
      intro: "快速學會起身、用餐、跌倒預防與照顧溝通。",
      date: "2026.05.24",
      time: "19:30-21:00",
      price: "免費",
      type: "線上同步課",
      location: "Google Meet",
      seats: "80 人",
      image: "assets/homepage-batch/12-community-health-class.png"
    },
    {
      title: "失智照顧溝通工作坊",
      intro: "用情境演練理解重複提問、拒絕洗澡與情緒不安。",
      date: "2026.06.02",
      time: "13:30-16:30",
      price: "NT$ 1,200",
      type: "實體課",
      location: "新北據點",
      seats: "24 人",
      image: "assets/homepage-batch/19-health-dementia-cover.png"
    },
    {
      title: "移工照顧技能培訓",
      intro: "建立一致的安全移位、用藥提醒與紀錄回報流程。",
      date: "2026.06.08",
      time: "10:00-15:00",
      price: "NT$ 2,000",
      type: "實體課",
      location: "臺北教室",
      seats: "30 人",
      image: "assets/homepage-batch/03-supervisor-care-plan.png"
    },
    {
      title: "督導品質管理研習",
      intro: "聚焦服務媒合、異常追蹤、紀錄檢核與團隊支持。",
      date: "2026.06.15",
      time: "20:00-22:00",
      price: "NT$ 980",
      type: "線上同步課",
      location: "Zoom",
      seats: "120 人",
      image: "assets/homepage-batch/04-admin-team-office.png"
    },
    {
      title: "護理復能基礎課",
      intro: "理解復能目標、步態觀察與家屬陪伴方法。",
      date: "2026.06.22",
      time: "可隨時觀看",
      price: "NT$ 680",
      type: "預錄課",
      location: "線上學習",
      seats: "不限人數",
      image: "assets/homepage-batch/13-rehab-walking-practice.png"
    }
  ];
  const importantCourses = courses.slice(0, 3);

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
          ${importantCourses.map((course) => `
            <article class="featured-course-card click-card" data-course-title="${course.title}" tabindex="0" role="button">
              <img src="${course.image}" alt="${course.title}" />
              <div>
                <span>${course.type}</span>
                <h3>${course.title}</h3>
                <p>${course.intro}</p>
                <button class="course-register" type="button" data-course-title="${course.title}">立即報名</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="course-list">
        ${courses.map((course, index) => `
          <article class="course-card click-card" data-course-title="${course.title}" tabindex="0" role="button">
            <div class="course-thumb"><img src="${course.image}" alt="${course.title}" /><span>${String(index + 1).padStart(2, "0")}</span></div>
            <div class="course-body">
              <div class="course-topline"><span class="course-type">${course.type}</span><span class="course-seats">${course.seats}</span></div>
              <h3>${course.title}</h3>
              <p>${course.intro}</p>
              <div class="course-info-line"><span><em>地點</em>${course.type}｜${course.location}</span><b><em>費用</em>${course.price}</b></div>
              <div class="course-info-line"><span><em>日期</em>${course.date}</span><b><em>時間</em>${course.time}</b></div>
              <button class="course-register" type="button" data-course-title="${course.title}">立即報名</button>
            </div>
          </article>
        `).join("")}
      </section>
      <div class="course-modal" id="courseSignupModal" hidden>
        <form class="course-modal-card" id="courseSignupForm">
          <button class="course-modal-close" type="button" data-course-close aria-label="關閉報名視窗">×</button>
          <p class="eyebrow">Course Signup</p>
          <h2>課程報名確認</h2>
          <label>您的大名<input name="姓名" type="text" required placeholder="請輸入姓名" /></label>
          <label>您的電話<input name="電話" type="tel" required placeholder="請輸入電話" /></label>
          <label>您本次報名的課程<input name="課程" id="courseSignupTitle" type="text" readonly /></label>
          <input name="_subject" type="hidden" value="歲悅長照課程報名通知" />
          <input name="_captcha" type="hidden" value="false" />
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
    ["歲月安心", "把家屬的焦慮變成清楚流程，讓長輩在熟悉的生活裡被穩定照顧。"],
    ["悅享生活", "照顧不只是完成任務，也要讓長輩保有選擇、尊嚴與生活節奏。"],
    ["陪伴成長", "支持照顧者、督導、行政與家庭一起學習，讓服務品質能持續變好。"]
  ];
  const aboutSystems = [
    ["居家照顧", "到宅身體照顧、生活支持、服務紀錄與家屬回報。", "assets/homepage-batch/01-care-home-greeting.png"],
    ["日間照顧", "白天托顧、活動參與、共餐休息與家屬喘息支持。", "assets/daycare-recruit-02-exercise.png"],
    ["移工培訓", "把家庭照顧技能拆成可理解、可練習、可追蹤的課程。", "assets/migrant-recruit-01-classroom.png"],
    ["教育品管", "用教材、訓練、稽核與改善流程承接服務品質。", "assets/quality-recruit-04-quality-meeting.png"]
  ];
  const aboutStats = [
    ["3", "核心服務縣市", "臺北、新北、桃園持續拓展"],
    ["6", "服務事業模組", "居家、日照、據點、復能、培訓、品管"],
    ["95%", "服務滿意度", "持續追蹤家屬與長輩回饋"],
    ["12+", "年度訓練模組", "讓前線與後勤都有成長路徑"]
  ];
  const aboutSteps = [
    ["理解需求", "先聽懂家庭真正卡住的地方，而不是急著推服務。"],
    ["建立計畫", "把照顧目標、服務內容、回報方式與風險提醒整理清楚。"],
    ["穩定執行", "透過督導、紀錄與行政支援，讓每一次服務都可追蹤。"],
    ["持續改善", "把現場回饋變成訓練、品管與下一次更好的照顧。"]
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
    {
      year: "2019",
      title: "把照顧的第一個問題聽清楚",
      tag: "Origin",
      copy: "歲悅從家庭照顧的真實痛點出發：家屬不知道該找誰、怎麼安排、如何確認服務品質。我們開始把照顧需求整理成可以被理解的流程。",
      image: "assets/homepage-batch/10-family-consultation.png"
    },
    {
      year: "2020",
      title: "建立居家照顧服務雛形",
      tag: "Home Care",
      copy: "從到宅照顧、生活支持、服務紀錄與家屬回報開始，逐步建立前線照服員、督導與行政後勤之間的協作節奏。",
      image: "assets/homepage-batch/01-care-home-greeting.png"
    },
    {
      year: "2021",
      title: "照顧紀錄與督導制度成形",
      tag: "Quality",
      copy: "服務不只要被完成，也要能被追蹤。歲悅把照顧紀錄、家屬回報、督導提醒與服務檢核放進日常管理。",
      image: "assets/homepage-batch/03-supervisor-care-plan.png"
    },
    {
      year: "2022",
      title: "日間照顧與社區支持延伸",
      tag: "Day Care",
      copy: "我們將照顧從家中延伸到日間照顧與社區活動，讓長輩白天有節奏、有陪伴，也讓家屬有喘息與放心的空間。",
      image: "assets/homepage-batch/02-daycare-group-exercise.png"
    },
    {
      year: "2023",
      title: "移工培訓與家庭照顧課程啟動",
      tag: "Training",
      copy: "將移位、用餐、沐浴、溝通與安全照顧拆成可練習的課程，讓家庭照顧不只依賴經驗，也能有方法、有標準。",
      image: "assets/migrant-recruit-02-transfer.png"
    },
    {
      year: "2024",
      title: "教育品管成為集團核心能力",
      tag: "Education",
      copy: "把前線服務經驗轉化為教材、稽核、回饋與改善流程，讓照顧品質可以被複製，也讓每一位照顧者被支持。",
      image: "assets/quality-recruit-04-quality-meeting.png"
    },
    {
      year: "2025",
      title: "北北桃服務網絡持續展開",
      tag: "Network",
      copy: "服務據點與合作單位逐步串接，形成臺北、新北、桃園的照顧網絡，讓更多家庭能在需要時更快找到歲悅。",
      image: "assets/north-service-map.png"
    },
    {
      year: "2026",
      title: "走向更清楚、更可信任的長照集團",
      tag: "Suiyuecare Corps.",
      copy: "我們持續把服務、訓練、招募、資訊與投資人溝通整合在一起，讓歲悅成為家庭、人才與合作夥伴都能信任的長照品牌。",
      image: "assets/homepage-batch/16-taipei-service-office.png"
    }
  ];

  return `
    <div class="milestones-page">
      <section class="milestone-hero">
        <div>
          <p class="eyebrow">Milestones</p>
          <h1>大記事</h1>
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
          <h2>每一步，都是為了讓家庭更容易開始照顧。</h2>
          <p>我們把歲悅的發展做成可以一路往下看的故事。滑到不同年份時，節點會亮起，讓觀看者像翻閱品牌成長紀錄一樣理解我們。</p>
        </div>
        <div class="milestone-list">
          ${timeline.map((item, index) => `
            <article class="milestone-card ${index === 0 ? "active" : ""}" data-milestone-card>
              <div class="milestone-year">
                <span>${item.year}</span>
                <b>${String(index + 1).padStart(2, "0")}</b>
              </div>
              <figure>
                <img src="${item.image}" alt="${item.title}" />
              </figure>
              <div class="milestone-copy">
                <small>${item.tag}</small>
                <h3>${item.title}</h3>
                <p>${item.copy}</p>
              </div>
            </article>
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
    ["到宅生活支持", "協助備餐、陪伴、環境整理與日常安全觀察，讓長輩在熟悉的家裡維持生活節奏。"],
    ["身體照顧服務", "依照個案狀態安排沐浴、如廁、移位、翻身、用餐與陪同外出等照顧。"],
    ["督導品質追蹤", "督導定期回訪，確認服務內容、照顧風險與家屬回饋，讓服務不是派人到場而已。"],
    ["家屬即時回報", "透過照顧紀錄、異常提醒與溝通窗口，讓家人下班後也能掌握長輩狀況。"]
  ];
  const scenes = [
    ["assets/homepage-batch/01-care-home-greeting.png", "到宅前的安心問候", "好的居家照顧從進門開始，先理解長輩今天的狀態與情緒。"],
    ["assets/homepage-batch/07-orange-apron-meal-prep.png", "生活照顧與營養陪伴", "備餐、用餐觀察與日常陪伴，是讓長輩穩定生活的重要細節。"],
    ["assets/homepage-batch/08-orange-apron-walking.png", "陪同活動與安全移動", "用合適步調陪長輩走動，維持活動量，也降低跌倒風險。"],
    ["assets/homepage-batch/03-supervisor-care-plan.png", "督導與家屬討論計畫", "把照顧需求、服務目標與回報方式說清楚，讓家庭不用自己猜。"]
  ];
  const serviceItems = [
    ["身體照顧", "沐浴、穿脫衣物、如廁、移位、翻身、拍背、用餐協助", "適合出院返家、行動不便或需穩定照顧者"],
    ["生活照顧", "備餐、陪伴、環境整理、陪同外出、代購與生活提醒", "適合獨居、白天家人不在或需要日常支持者"],
    ["喘息支持", "短時段照顧接手，讓主要照顧者能休息、辦事或安心上班", "適合長期照顧壓力較高的家庭"],
    ["照顧紀錄", "服務紀錄、狀態回報、異常提醒、督導追蹤與家屬溝通", "適合希望清楚掌握照顧品質的家屬"]
  ];
  const flow = [
    ["01", "需求諮詢", "了解長輩生活能力、疾病狀態、家屬期待與目前最困擾的照顧問題。"],
    ["02", "照顧評估", "由專人整理服務目標、風險提醒、時段需求與適合的照顧內容。"],
    ["03", "人員媒合", "依照地區、服務時段、照顧需求與個案特性安排合適照顧服務員。"],
    ["04", "服務追蹤", "透過紀錄、督導與回訪持續調整，讓照顧能穩定走得長久。"]
  ];

  return `
    <div class="service-detail-page home-care-page">
      <section class="service-detail-hero home-care-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Home Care</p>
          <h1>居家照顧</h1>
          <p>歲悅居家照顧把專業服務帶進家裡，從身體照顧、生活支持到家屬回報，讓長輩能在熟悉的環境中被穩定照顧，也讓家人知道每一步都有依靠。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約居家諮詢</a>
            <a class="secondary-button" href="#network">查看服務區域</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/homepage-batch/01-care-home-greeting.png" alt="歲悅居家照顧到宅服務情境" />
          <div>
            <span>Home Care Service</span>
            <strong>把照顧安排進熟悉的日常。</strong>
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>使用先前生成的歲悅照顧形象照，呈現居家照顧的核心現場：進門問候、備餐陪伴、安全移動與督導溝通。</span>
        </div>
        <div class="community-scene-grid">
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
    ["白天安心托顧", "讓長輩白天有規律作息、有人陪伴，晚上仍能回到熟悉的家。"],
    ["活動與復能", "安排伸展、肌力、認知、手作與團體互動，維持生活能力與參與感。"],
    ["餐食與休息", "照顧用餐、飲水、午休與身體狀態，讓家屬不用擔心白天照顧空窗。"],
    ["家屬喘息支持", "讓主要照顧者能上班、休息或處理生活，也能持續掌握長輩狀態。"]
  ];
  const scenes = [
    ["assets/homepage-batch/02-daycare-group-exercise.png", "日照團體律動", "透過安全、可跟上的活動節奏，讓長輩維持肌力、平衡與自信。"],
    ["assets/daycare-recruit-03-meal.png", "餐食與用餐照顧", "從用餐狀況、食慾到吞嚥觀察，讓日常照顧更細緻。"],
    ["assets/daycare-recruit-04-activity.png", "手作與團體活動", "活動不是填時間，而是讓長輩有互動、有選擇，也有成就感。"],
    ["assets/daycare-recruit-05-handover.png", "交班與家屬回報", "服務紀錄與交班讓家屬知道今天發生什麼，也讓團隊延續照顧。"]
  ];
  const serviceItems = [
    ["日間生活照顧", "接待、量測、用餐、午休、如廁與生活安全觀察", "適合白天需要陪伴與規律照顧的長輩"],
    ["健康促進活動", "椅上運動、伸展、肌力、平衡、音樂律動與認知刺激", "適合希望維持功能與活動量的長輩"],
    ["社交陪伴", "共餐、團體活動、節慶活動與人際互動", "適合在家較少出門、需要生活刺激者"],
    ["家庭喘息", "白天照顧接手、狀態回報、服務建議與資源轉介", "適合主要照顧者需要穩定支持的家庭"]
  ];
  const flow = [
    ["01", "諮詢與參觀", "了解長輩身體狀態、生活習慣、交通需求與家屬期待。"],
    ["02", "初次評估", "整理照顧風險、活動能力、用餐需求與適合參與的活動節奏。"],
    ["03", "試讀體驗", "讓長輩熟悉環境、人員與活動安排，降低第一次到新地方的不安。"],
    ["04", "穩定參與", "依照出席、活動、餐食與精神狀態，持續調整照顧安排。"]
  ];

  return `
    <div class="service-detail-page day-care-page">
      <section class="service-detail-hero day-care-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Day Care</p>
          <h1>日間照顧</h1>
          <p>歲悅日間照顧讓長輩白天有安全場域、規律活動、餐食照顧與社交陪伴，也讓家屬能在工作與照顧之間找到可以喘息的節奏。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約參觀日照</a>
            <a class="secondary-button" href="#courses">查看體驗活動</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/homepage-batch/02-daycare-group-exercise.png" alt="歲悅日間照顧團體活動情境" />
          <div>
            <span>Day Care Center</span>
            <strong>白天有人陪，晚上安心回家。</strong>
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>使用先前生成的日間照顧照片，呈現活動、餐食、團體互動與交班回報等日照現場。</span>
        </div>
        <div class="community-scene-grid">
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
    ["護理觀察", "定期觀察血壓、食慾、睡眠、傷口、用藥與身體變化，及早看見照顧風險。"],
    ["復能陪伴", "依照長輩能力設定可達成的小目標，陪同練習步行、肌力、平衡與日常動作。"],
    ["家庭教學", "把移位、翻身、用餐、跌倒預防與照顧注意事項教給家屬與照顧者。"],
    ["跨專業回報", "讓護理、督導、照服員與家屬用同一份紀錄理解長輩狀態。"]
  ];
  const scenes = [
    ["assets/homepage-batch/13-rehab-walking-practice.png", "步行與平衡練習", "復能不是催促長輩，而是陪他一步一步重新找回把握。"],
    ["assets/homepage-batch/09-nurse-blood-pressure.png", "護理觀察與量測", "用日常量測與觀察提早發現變化，減少家屬不確定感。"],
    ["assets/homepage-batch/14-care-notes.png", "照顧紀錄追蹤", "把每次服務、觀察與提醒留下紀錄，讓照顧可以延續。"],
    ["assets/homepage-batch/03-supervisor-care-plan.png", "復能目標討論", "督導與家庭一起確認目標，讓練習符合生活需求。"]
  ];
  const serviceItems = [
    ["健康狀態追蹤", "血壓、食慾、睡眠、排泄、皮膚與傷口狀態觀察", "適合出院返家、慢性病或身體狀況需追蹤者"],
    ["復能訓練支持", "坐站、步行、平衡、肌力與日常生活動作練習", "適合希望恢復活動能力與生活自理者"],
    ["照顧風險提醒", "跌倒風險、環境動線、用藥安全、吞嚥與營養提醒", "適合家屬擔心照顧細節與意外風險者"],
    ["家屬與照顧者教學", "移位技巧、翻身、沐浴安全、陪走與日常觀察方法", "適合家中多人共同照顧或有移工照顧者"]
  ];
  const flow = [
    ["01", "狀態評估", "先了解疾病史、近期變化、活動能力、用藥與家庭照顧方式。"],
    ["02", "目標設定", "把復能目標拆成小步驟，例如安全起身、穩定步行或自行用餐。"],
    ["03", "到宅支持", "由專業人員陪同練習，並同步提醒家屬日常照顧注意事項。"],
    ["04", "追蹤調整", "依照紀錄與回饋調整訓練強度、照顧方式與風險提醒。"]
  ];

  return `
    <div class="service-detail-page nursing-page">
      <section class="service-detail-hero nursing-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Nursing & Reablement</p>
          <h1>護理復能</h1>
          <p>歲悅護理復能把護理觀察、復能目標與家庭照顧教學串在一起，讓長輩不是被動被照顧，而是在安全支持下慢慢恢復生活能力。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約復能諮詢</a>
            <a class="secondary-button" href="#health">閱讀復能知識</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/homepage-batch/13-rehab-walking-practice.png" alt="歲悅護理復能步行練習情境" />
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>使用先前生成的護理復能照片，呈現步行練習、健康量測、紀錄追蹤與目標討論。</span>
        </div>
        <div class="community-scene-grid">
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
    ["照顧技能實作", "把翻身、移位、沐浴、用餐、陪走等動作拆成能理解、能練習、能回家使用的步驟。"],
    ["家庭溝通情境", "協助移工理解家屬期待、長輩情緒與日常回報方式，減少照顧誤會。"],
    ["安全與衛教", "將跌倒預防、感染控制、用藥提醒、營養觀察與環境安全放入課程。"],
    ["訓後追蹤支持", "課後可搭配督導回饋、家屬諮詢與複訓安排，讓學會的技巧真的用得上。"]
  ];
  const scenes = [
    ["assets/migrant-recruit-01-classroom.png", "照顧課堂示範", "用圖像、示範與情境練習，讓照顧技巧不只停在聽懂。"],
    ["assets/migrant-recruit-02-transfer.png", "安全移位練習", "移位與翻身是家庭照顧的高風險動作，必須反覆練習到穩定。"],
    ["assets/migrant-recruit-03-meal-prep.png", "餐食與營養觀察", "從備餐、用餐姿勢到食慾觀察，讓照顧更貼近日常。"],
    ["assets/migrant-recruit-04-communication.png", "家庭溝通訓練", "透過情境對話，降低語言、文化與期待差異造成的照顧落差。"]
  ];
  const serviceItems = [
    ["基礎照顧訓練", "翻身、拍背、移位、沐浴、如廁、用餐與陪同活動", "適合剛到家庭服務或需要建立基礎技巧的移工"],
    ["長輩狀態觀察", "食慾、睡眠、精神、跌倒風險、皮膚與排泄狀況觀察", "適合需要協助回報長輩狀態的照顧者"],
    ["家庭情境演練", "家屬交代、長輩拒絕照顧、突發狀況與每日回報練習", "適合家庭溝通容易卡住或照顧分工不清者"],
    ["證書與複訓", "課程紀錄、完訓證明、複訓安排與督導建議", "適合企業、家庭或仲介單位安排系統化訓練"]
  ];
  const flow = [
    ["01", "確認訓練需求", "了解家庭照顧情境、移工語言能力、照顧對象狀態與最需要補強的技巧。"],
    ["02", "安排課程模組", "依照需求選擇基礎照顧、安全移位、餐食照顧、溝通情境或衛教主題。"],
    ["03", "實作與演練", "透過示範、分組練習與情境演練，把照顧方法變成可操作的動作。"],
    ["04", "回饋與追蹤", "課後提供重點回饋，必要時安排複訓、督導諮詢或家庭照顧建議。"]
  ];

  return `
    <div class="service-detail-page migrant-training-page">
      <section class="service-detail-hero migrant-training-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Migrant Care Training</p>
          <h1>移工培訓</h1>
          <p>歲悅移工培訓把家庭照顧現場常見的困難轉成可練習的課程，讓移工、家屬與長輩之間有更清楚的照顧方法與溝通節奏。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">洽詢培訓課程</a>
            <a class="secondary-button" href="#courses">查看課程報名</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/migrant-recruit-01-classroom.png" alt="歲悅移工照顧培訓課堂情境" />
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Training Scenes</p>
          <h2>訓練現場情境</h2>
          <span>使用之前生成的移工培訓照片，呈現課堂、移位、餐食照顧與家庭溝通演練。</span>
        </div>
        <div class="community-scene-grid">
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
    ["標準化教材", "把第一線照顧經驗整理成教材、流程與檢核表，讓好服務不是只靠個人經驗。"],
    ["新人與在職訓練", "依職務與服務情境安排訓練，讓照服員、督導與行政都能理解照顧品質標準。"],
    ["服務紀錄稽核", "透過紀錄檢視、督導回饋與異常追蹤，讓照顧品質被看見、被討論、被改善。"],
    ["持續改善機制", "從家屬回饋、現場問題與教育訓練資料中，持續修正服務流程。"]
  ];
  const scenes = [
    ["assets/quality-recruit-01-materials.png", "教材與流程整理", "把照顧現場的經驗整理成可學習、可複製、可追蹤的訓練資料。"],
    ["assets/quality-recruit-02-training.png", "內部教育訓練", "訓練不是把人叫來上課，而是讓服務方法更一致。"],
    ["assets/quality-recruit-03-record-review.png", "服務紀錄檢核", "從紀錄看見服務品質、照顧風險與需要再支持的現場問題。"],
    ["assets/quality-recruit-04-quality-meeting.png", "品質改善會議", "讓督導、教育與營運一起把問題轉成下一輪改善行動。"]
  ];
  const serviceItems = [
    ["教育訓練規劃", "新人訓練、在職訓練、專題課程、情境演練與訓後回饋", "適合照服員、督導、行政與跨部門團隊"],
    ["服務標準建立", "照顧流程、紀錄格式、風險提醒、家屬回報與異常處理標準", "適合需要擴張服務但仍維持品質的團隊"],
    ["品管稽核", "服務紀錄、家屬回饋、督導訪視、課程出席與改善追蹤", "適合需要定期檢視服務穩定度的單位"],
    ["改善專案", "問題盤點、原因分析、改善方案、追蹤指標與回饋會議", "適合想把現場問題轉成制度改善的團隊"]
  ];
  const flow = [
    ["01", "盤點品質議題", "整理服務紀錄、家屬回饋、督導觀察與現場常見問題。"],
    ["02", "建立訓練模組", "把議題轉成教材、演練情境、檢核表與可追蹤指標。"],
    ["03", "執行教育品管", "安排課程、紀錄檢核、督導回饋與跨部門改善會議。"],
    ["04", "追蹤改善成效", "定期回看服務品質、訓練覆蓋率與問題改善狀態。"]
  ];

  return `
    <div class="service-detail-page quality-page">
      <section class="service-detail-hero quality-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Education & Quality</p>
          <h1>教育品管</h1>
          <p>歲悅教育品管把前線服務、督導經驗、家屬回饋與訓練制度串在一起，讓照顧品質不是靠運氣，而是能被訓練、被追蹤、被持續改善。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">洽詢品管合作</a>
            <a class="secondary-button" href="#courses">查看訓練課程</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/quality-recruit-04-quality-meeting.png" alt="歲悅教育品管品質改善會議情境" />
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

      <section class="service-detail-section">
        <div class="service-section-head">
          <p class="eyebrow">Quality Scenes</p>
          <h2>教育品管情境</h2>
          <span>使用之前生成的教學品管照片，呈現教材整理、內部訓練、紀錄檢核與品質改善會議。</span>
        </div>
        <div class="community-scene-grid">
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
    ["健康促進", "每週安排量測、伸展、肌力與認知活動，讓長輩用輕鬆節奏維持身體功能。"],
    ["共餐陪伴", "透過共餐、茶敘與節慶活動，讓長輩有固定出門理由，也讓家屬少一點擔心。"],
    ["預防延緩", "把跌倒預防、營養提醒、用藥安全與日常觀察放進社區課程。"],
    ["資源串聯", "協助串接居家照顧、日間照顧、護理復能與長照資源，不讓家庭自己摸索。"]
  ];
  const scenes = [
    ["assets/homepage-batch/12-community-health-class.png", "健康促進小組", "透過團體活動維持身體功能，也讓長輩重新建立社交節奏。"],
    ["assets/homepage-batch/11-elder-art-activity.png", "手作與認知活動", "以手作、懷舊與互動設計，讓活動不只是打發時間，而是生活參與。"],
    ["assets/homepage-batch/02-daycare-group-exercise.png", "規律運動課", "用安全、可跟上的動作，協助長輩練習肌力、平衡與活動信心。"],
    ["assets/homepage-batch/16-taipei-service-office.png", "在地服務窗口", "據點也是家庭諮詢入口，讓需要照顧的人可以更快被接住。"]
  ];
  const flow = [
    ["01", "電話或 LINE 諮詢", "先了解長輩年齡、生活狀態、活動能力與家屬期待。"],
    ["02", "據點活動媒合", "依照體力、興趣與交通距離，建議適合的課程或活動時段。"],
    ["03", "第一次參與", "由據點人員協助熟悉環境、活動節奏與安全注意事項。"],
    ["04", "持續追蹤", "觀察出席、互動、食慾與精神狀態，必要時轉介其他長照服務。"]
  ];
  const programs = [
    ["活力伸展班", "椅上運動、肌力練習、平衡訓練", "適合行動較慢、想維持體力的長輩"],
    ["共餐關懷", "營養餐食、用餐陪伴、日常觀察", "適合獨居、白天需要社交與關懷者"],
    ["認知手作課", "手作、桌遊、懷舊活動與團體互動", "適合希望維持專注與人際互動者"],
    ["家屬支持", "資源說明、照顧技巧、服務轉介", "適合剛開始面對長照需求的家庭"]
  ];

  return `
    <div class="service-detail-page community-page">
      <section class="service-detail-hero community-hero">
        <div class="service-detail-copy">
          <p class="eyebrow">Community Care</p>
          <h1>社區據點</h1>
          <p>歲悅把健康促進、共餐陪伴、預防延緩失能與家屬支持放進社區，讓長輩在離家更近的地方被看見、被邀請，也被穩定支持。</p>
          <div class="hero-actions">
            <a class="primary-button" href="#contact">預約據點諮詢</a>
            <a class="secondary-button" href="#network">查看服務區域</a>
          </div>
        </div>
        <aside class="service-hero-card">
          <img src="assets/homepage-batch/12-community-health-class.png" alt="歲悅社區據點健康促進活動" />
          <div>
            <span>Community Hub</span>
            <strong>讓照顧從家門口附近開始。</strong>
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

      <section class="service-detail-section community-scenes">
        <div class="service-section-head">
          <p class="eyebrow">Service Scenes</p>
          <h2>真實服務情境</h2>
          <span>用之前生成的歲悅形象照，呈現社區據點最重要的幾個現場：活動、共餐、運動與諮詢。</span>
        </div>
        <div class="community-scene-grid">
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
        <aside class="finance-hero-chart" aria-label="年度營運趨勢示意圖">
          <span>Revenue Trend</span>
          <div class="mini-line-chart">
            <i style="--x:8%;--y:70%"></i><i style="--x:25%;--y:56%"></i><i style="--x:42%;--y:62%"></i><i style="--x:59%;--y:42%"></i><i style="--x:76%;--y:36%"></i><i style="--x:92%;--y:22%"></i>
          </div>
          <strong>+12.4%</strong>
          <p>最近月營收成長率示意</p>
        </aside>
      </section>

      <nav class="investor-tabs ir-finance-tabs" aria-label="財務資訊分頁">
        <button class="active" type="button" data-ir-tab="monthly-revenue">每月營收</button>
        <button type="button" data-ir-tab="finance-analysis">財務資訊分析</button>
        <button type="button" data-ir-tab="quarterly-reports">季度財報</button>
        <button type="button" data-ir-tab="annual-reports">股東會年報</button>
      </nav>

      <section class="ir-kpi-strip" aria-label="財務資訊摘要">
        <article><span>Monthly Revenue</span><strong>NT$ 8.6M</strong><em>最近月營收示意</em></article>
        <article><span>YoY Growth</span><strong>+12.4%</strong><em>年增率示意</em></article>
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
          <p>治理成熟度示意</p>
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
        <article><span>Governance Index</span><strong>91</strong><em>治理成熟度示意</em></article>
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
            <div class="chart-card-head"><span>股東結構示意</span><strong>100%</strong></div>
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
    if (key === "home-care-team") {
      return `
        <section class="career-tab-panel" data-career-panel="${key}">
          <div class="homecare-recruit">
            <section class="homecare-intro">
              <div>
                <p class="eyebrow">Home Care Team</p>
                <h2>居家照顧部門</h2>
                <p>居家照顧是歲悅最靠近家庭的一線服務。我們進到長輩熟悉的家，把身體照顧、生活支持、家屬溝通與服務紀錄串成一套穩定流程，讓家庭不用自己猜、照顧者也不是單打獨鬥。</p>
                <div class="homecare-highlight-row">
                  ${homeCareRecruit.highlights.map(([title, copy]) => `<article><span>${title}</span><strong>${copy}</strong></article>`).join("")}
                </div>
              </div>
              <aside>
                <img src="assets/homepage-batch/01-care-home-greeting.png" alt="歲悅居家照顧服務情境" />
                <div><span>Suiyuecare Home Care</span><strong>把照顧帶進家裡，也把安心留在家裡。</strong></div>
              </aside>
            </section>

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
            <section class="homecare-intro daycare-intro">
              <div>
                <p class="eyebrow">Day Care Team</p>
                <h2>日間照顧部</h2>
                <p>日間照顧是讓長輩白天有安全、有活動、有同伴，也讓家庭有喘息空間的服務。歲悅的日照團隊把作息、餐食、活動、健康觀察與家屬回報整合在一起，讓每一天都被好好安排。</p>
                <div class="homecare-highlight-row">
                  ${dayCareRecruit.highlights.map(([title, copy]) => `<article><span>${title}</span><strong>${copy}</strong></article>`).join("")}
                </div>
              </div>
              <aside class="daycare-cover">
                <img src="assets/daycare-recruit-02-exercise.png" alt="歲悅日間照顧團體活動情境" />
                <div><span>Suiyuecare Day Care</span><strong>讓長輩白天被陪伴，也讓家庭晚上更安心。</strong></div>
              </aside>
            </section>

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
            <section class="homecare-intro migrant-intro">
              <div>
                <p class="eyebrow">Migrant Training</p>
                <h2>移工培訓部</h2>
                <p>移工培訓部把家庭照顧常見的身體照顧、移位安全、備餐營養、溝通回報與照顧紀錄，整理成可以聽懂、看懂、練習、回家後能執行的課程。這個部門不只是教技能，更是在家庭、移工與照顧團隊之間建立共同語言。</p>
                <div class="homecare-highlight-row">
                  ${migrantRecruit.highlights.map(([title, copy]) => `<article><span>${title}</span><strong>${copy}</strong></article>`).join("")}
                </div>
              </div>
              <aside class="migrant-cover">
                <img src="assets/migrant-recruit-01-classroom.png" alt="歲悅移工培訓課堂情境" />
                <div><span>Suiyuecare Training</span><strong>把照顧教到會，也把家庭接得更穩。</strong></div>
              </aside>
            </section>

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
            <section class="homecare-intro quality-intro">
              <div>
                <p class="eyebrow">Teaching Quality</p>
                <h2>教學品管部</h2>
                <p>教學品管部把前線照顧經驗變成可被學習、檢核與改善的系統。從新人訓練、教材設計、服務紀錄檢核到品質改善專案，這個部門讓歲悅的服務不是只靠個人努力，而是靠制度穩定變好。</p>
                <div class="homecare-highlight-row">
                  ${qualityRecruit.highlights.map(([title, copy]) => `<article><span>${title}</span><strong>${copy}</strong></article>`).join("")}
                </div>
              </div>
              <aside class="quality-cover">
                <img src="assets/quality-recruit-04-quality-meeting.png" alt="歲悅教學品管品質會議情境" />
                <div><span>Suiyuecare Quality</span><strong>把好的照顧整理成方法，再讓方法長成制度。</strong></div>
              </aside>
            </section>

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
            <section class="homecare-intro admin-intro">
              <div>
                <p class="eyebrow">Administration</p>
                <h2>行政部</h2>
                <p>行政部是讓歲悅前線服務能穩定運作的後勤核心。從人資招募、營運調度、財務行政、客服總務到投資人與專案支援，每一個看似細節的流程，都會影響照顧是否能準時、清楚、持續地被交付。</p>
                <div class="homecare-highlight-row">
                  ${adminRecruit.highlights.map(([title, copy]) => `<article><span>${title}</span><strong>${copy}</strong></article>`).join("")}
                </div>
              </div>
              <aside class="admin-cover">
                <img src="assets/admin-recruit-05-meeting.png" alt="歲悅行政部跨部門會議情境" />
                <div><span>Suiyuecare Admin</span><strong>讓後勤有秩序，前線照顧才有餘裕。</strong></div>
              </aside>
            </section>

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
            ${(article.tags || []).map((tag) => `<span class="meta-tag"># ${escapeHTML(tag)}</span>`).join("")}
          </div>

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
            <div class="article-cta">
              <p>${escapeHTML(article.cta || "不確定下一步怎麼安排？留下需求，讓歲悅協助判斷。")}</p>
              <a href="#contact">預約照顧諮詢</a>
            </div>
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
    pageView.innerHTML = article ? renderArticleLayout(article) : renderArticleNotFoundPage();
  } catch (error) {
    console.warn("Supabase article page unavailable.", error);
    if (location.hash.slice(1).split("?")[0] !== `article-${slug}`) return;
    pageView.innerHTML = supabase ? renderArticleNotFoundPage() : renderStaticArticlePage(slug);
  }
}

function renderPage(slug) {
  if (!home || !pageView) return;

  const rawSlug = slug || "home";
  const [normalized, queryString = ""] = rawSlug.split("?");
  const searchParams = new URLSearchParams(queryString);
  const articleSlug = normalized.startsWith("article-") ? normalized.replace("article-", "") : null;
  const anchorTarget = normalized === "home" ? null : document.getElementById(normalized);
  const page = anchorTarget ? null : pages[normalized];
  const isHome = !articleSlug && (normalized === "home" || Boolean(anchorTarget));

  home.classList.toggle("active", isHome);
  pageView.classList.toggle("active", !isHome);
  pageView.innerHTML = "";

  if (articleSlug) {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderArticleLoadingPage();
    loadArticlePage(articleSlug);
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
    pageView.innerHTML = renderHomeCarePage();
  } else if (normalized === "day-care") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderDayCarePage();
  } else if (normalized === "community") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderCommunityPage();
  } else if (normalized === "nursing") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderNursingPage();
  } else if (normalized === "migrant-training") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderMigrantTrainingPage();
  } else if (normalized === "quality") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderQualityPage();
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
    loadSupabaseHealthArticles({ rerender: true });
    loadSupabaseArticleCategories({ rerender: true });
  } else if (normalized === "search") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderSearchPage(searchParams.get("q") || "");
    loadSupabaseHealthArticles({ rerender: true });
  } else if (normalized === "courses") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderCoursesPage();
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
  menuToggle?.setAttribute("aria-expanded", "false");
  groups.forEach((group) => group.classList.remove("open"));

  if (anchorTarget && normalized !== "home") {
    anchorTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (!isHome && !articleSlug && !["health", "search"].includes(normalized)) {
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
  menuToggle.setAttribute("aria-expanded", String(Boolean(open)));
});

groups.forEach((group) => {
  const trigger = group.querySelector(".nav-trigger");
  trigger.addEventListener("click", () => {
    const open = group.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(open));
  });
});

document.querySelectorAll(".location-pin").forEach((pin) => {
  pin.addEventListener("click", () => updateLocation(pin.dataset.location));
});

document.querySelectorAll("[data-location-tab]").forEach((tab) => {
  tab.addEventListener("click", () => updateLocation(tab.dataset.locationTab));
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

function openCourseSignup(courseTitle = "") {
  const modal = document.querySelector("#courseSignupModal");
  const form = document.querySelector("#courseSignupForm");
  const titleInput = document.querySelector("#courseSignupTitle");
  const status = document.querySelector("#courseSignupStatus");
  if (!modal || !form || !titleInput || !status) return;

  form.reset();
  titleInput.value = courseTitle;
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

  const registerButton = event.target.closest(".course-register");
  if (registerButton) {
    event.preventDefault();
    event.stopPropagation();
    trackAnalyticsEvent("reservation_click", {
      label: registerButton.dataset.courseTitle || registerButton.textContent.trim(),
      targetUrl: "#courses"
    });
    openCourseSignup(registerButton.dataset.courseTitle || registerButton.closest("[data-course-title]")?.dataset.courseTitle || "");
    return;
  }

  const courseCard = event.target.closest(".course-card, .featured-course-card");
  if (courseCard && !event.target.closest("a, button, input, select, textarea")) {
    event.preventDefault();
    openCourseSignup(courseCard.dataset.courseTitle || courseCard.querySelector("h3")?.textContent || "");
    return;
  }

  if (event.target.closest("[data-course-close]") || event.target.id === "courseSignupModal") {
    closeCourseSignup();
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("#courseSignupForm");
  if (!form) return;

  event.preventDefault();
  const status = document.querySelector("#courseSignupStatus");
  const submitButton = form.querySelector("button[type='submit']");
  if (!status || !submitButton) return;

  submitButton.disabled = true;
  status.textContent = "正在送出報名資訊...";

  try {
    const result = await sendBackendForm(form, "course_signup");
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
  status.textContent = `報名資訊已送出，${seconds} 秒後前往 LINE@。`;
  const countdown = window.setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      window.clearInterval(countdown);
      trackAnalyticsEvent("join_line_click", { label: "課程報名完成後前往 LINE@", targetUrl: COURSE_LINE_URL });
      window.location.assign(COURSE_LINE_URL);
    } else {
      status.textContent = `報名資訊已送出，${seconds} 秒後前往 LINE@。`;
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
      if (submitButton) submitButton.textContent = "已送出，我們會盡快聯絡";
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
window.addEventListener("scroll", updateMilestoneProgress, { passive: true });
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
window.addEventListener("resize", updateMilestoneProgress);
window.addEventListener("pagehide", flushPageEngagement);
renderPage(location.hash.slice(1));
loadSupabasePageContent("home");
loadWordPressContent();

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
