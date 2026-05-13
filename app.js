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
const WP_API_BASE = "https://www.suiyuecare.com/wp-json/wp/v2";
const WP_CATEGORIES = {
  latestNews: "latest-news",
  awards: "awards",
  careStories: "care-stories",
  health30: "health-30",
  masterTalk: "master-talk"
};

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

function renderHealthPage() {
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
            <input type="search" placeholder="搜尋跌倒、失智、營養、復能" />
            <button type="button">搜尋</button>
          </form>
        </div>
        <div class="health-cats">
          <span>疾病症狀</span><span>健康生活</span><span>飲食營養</span><span>復能運動</span><span>失智照顧</span><span>影音專區</span><span>專家專欄</span><span>圖解文章</span>
        </div>
      </section>
      <section class="health-grid">
        <article class="health-feature">
          <img src="assets/homepage-batch/02-daycare-group-exercise.png" alt="長照健康3.0精選文章" />
          <div>
            <span class="health-tag">早安精選</span>
            <h2>第一次申請長照服務，家人需要先準備什麼？</h2>
            <p>從需求盤點、照顧計畫、政府補助到服務媒合，用一篇文章把流程講清楚。</p>
          </div>
        </article>
        <article class="health-card"><span class="health-tag">疾病症狀</span><h3>長輩跌倒後的黃金觀察期</h3><p>整理家人可以在家先觀察的身體訊號與就醫時機。</p></article>
        <article class="health-card"><span class="health-tag">飲食營養</span><h3>吃得少不是正常老化</h3><p>從體重、食慾與肌力看出營養風險。</p></article>
        <article class="health-card"><span class="health-tag">失智照顧</span><h3>重複提問怎麼回應？</h3><p>降低衝突，讓照顧者與長輩都保有安全感。</p></article>
        <aside class="ranking-panel">
          <h3>熱門文章</h3>
          <ol>
            <li>一分鐘看懂長照2.0申請流程</li>
            <li>日照中心適合哪些長輩？</li>
            <li>失智初期家屬常忽略的5個訊號</li>
            <li>復能不是復健，差異在哪裡？</li>
            <li>照顧者壓力過高時的求助清單</li>
          </ol>
        </aside>
      </section>
    </div>
  `;
}

function renderCoursesPage() {
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
      <section class="course-list">
        ${[
          ["照服員核心訓練班", "實體", "5/20", "剩餘 12 名"],
          ["家庭照顧者實用課", "線上", "5/24", "免費"],
          ["失智照顧溝通工作坊", "實體", "6/02", "熱賣中"],
          ["移工照顧技能培訓", "實體", "6/08", "開放報名"],
          ["督導品質管理研習", "線上", "6/15", "專業課"],
          ["護理復能基礎課", "實體", "6/22", "早鳥中"]
        ].map((course, index) => `
          <article class="course-card">
            <div class="course-thumb">${String(index + 1).padStart(2, "0")}</div>
            <div class="course-body">
              <div class="course-meta"><span>${course[1]}</span><span>${course[2]}</span><span>${course[3]}</span></div>
              <h3>${course[0]}</h3>
              <p>課程包含案例說明、現場演練與可帶回使用的照顧檢核表。</p>
              <a href="#contact">立即報名</a>
            </div>
          </article>
        `).join("")}
      </section>
    </div>
  `;
}

function renderPage(slug) {
  if (!home || !pageView) return;

  const normalized = slug || "home";
  const anchorTarget = normalized === "home" ? null : document.getElementById(normalized);
  const page = anchorTarget ? null : pages[normalized];
  const isHome = normalized === "home" || Boolean(anchorTarget) || !page;

  home.classList.toggle("active", isHome);
  pageView.classList.toggle("active", !isHome);
  pageView.innerHTML = "";

  if (normalized === "health") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderHealthPage();
  } else if (normalized === "courses") {
    home.classList.remove("active");
    pageView.classList.add("active");
    pageView.innerHTML = renderCoursesPage();
  } else if (!isHome) {
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
renderPage(location.hash.slice(1));
loadWordPressContent();

window.setTimeout(() => {
  introLoader?.remove();
}, 6200);

window.addEventListener("load", () => {
  window.setTimeout(() => {
    if (location.hash !== "#home") {
      history.replaceState(null, "", "#home");
      renderPage("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    introLoader?.remove();
  }, 4850);
});
