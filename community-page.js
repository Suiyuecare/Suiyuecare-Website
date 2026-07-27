import "./day-care-application-journey.css";
import "./community-page.css";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  CreditCard,
  FileCheck2,
  HeartPulse,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Soup,
  UserCheck,
  Users,
  XCircle,
  createElement as createLucideElement
} from "lucide";

const communityHeroImage = "assets/community-dementia-hero-v3.jpg";

const communitySituations = [
  {
    title: "已確診輕度失智",
    body: "長輩 CDR 為 0.5 至 1，想透過規律課程維持認知與生活參與。",
    image: "assets/community-orientation-v3.jpg"
  },
  {
    title: "白天缺少規律活動",
    body: "希望長輩固定出門、與人互動，建立熟悉而有節奏的日常。",
    image: "assets/community-course-v3.jpg"
  },
  {
    title: "想找住家附近的課程",
    body: "家屬想先確認資格、費用，以及士林、大同或信義哪一處較方便。",
    image: "assets/community-meal-v3.jpg"
  }
];

const communityAssistance = [
  {
    title: "生命徵象量測",
    body: "課程開始前依需要量測血壓、體溫等基本數值，協助留意當日狀態。",
    image: "assets/community-vitals-v3.jpg",
    alt: "社區據點人員為可自行活動的長輩量測血壓"
  },
  {
    title: "定向感訓練",
    body: "運用日期、天氣、季節與生活線索，協助維持時間及環境定向。",
    image: "assets/community-orientation-v3.jpg",
    alt: "失智社區據點帶領長輩進行定向感訓練"
  },
  {
    title: "用餐",
    body: "符合供餐補助資格者，每餐自付 30 元；參與者需能自行進食。",
    image: "assets/community-meal-v3.jpg",
    alt: "失智社區據點長輩自行用餐並與同儕互動"
  },
  {
    title: "認知與健康促進課程",
    body: "透過配對、創作及生活主題活動，維持認知刺激與參與感。",
    image: "assets/community-course-v3.jpg",
    alt: "失智社區據點長輩參與認知與健康促進課程"
  }
];

const communityScenes = communityAssistance.map((item) => ({
  image: item.image,
  title: item.title,
  body: item.body,
  alt: item.alt
}));

const communityLocations = {
  shilin: {
    label: "士林據點",
    shortAddress: "社子街 63 巷",
    name: "歲悅士林失智症據點",
    address: "臺北市士林區社子街63巷21弄2號1樓",
    image: "assets/community-orientation-v3.jpg",
    alt: "士林失智症據點定向感課程情境示意",
    description: "提供生命徵象量測、定向感訓練、認知與健康促進課程及共餐。",
    contactMessage: "我想了解士林失智症據點的服務資格、課程時段與報名方式。"
  },
  datong: {
    label: "大同據點",
    shortAddress: "承德路三段",
    name: "歲悅大同失智症據點",
    address: "臺北市大同區承德路三段24巷38弄17號1樓",
    image: "assets/community-course-v3.jpg",
    alt: "大同失智症據點認知課程情境示意",
    description: "提供生命徵象量測、定向感訓練、認知與健康促進課程及共餐。",
    contactMessage: "我想了解大同失智症據點的服務資格、課程時段與報名方式。"
  },
  xinyi: {
    label: "信義據點",
    shortAddress: "基隆路一段",
    name: "歲悅信義失智症據點",
    address: "臺北市信義區基隆路一段364巷6號1樓",
    image: "assets/community-meal-v3.jpg",
    alt: "信義失智症據點社區共餐情境示意",
    description: "提供生命徵象量測、定向感訓練、認知與健康促進課程及共餐。",
    contactMessage: "我想了解信義失智症據點的服務資格、課程時段與報名方式。"
  }
};

const communityApplicationSteps = [
  {
    step: "01",
    title: "選擇鄰近據點",
    body: "先從士林、大同或信義三處據點中，選擇交通最方便的一處洽詢。",
    image: "assets/community-dementia-hero-v3.jpg",
    alt: "家屬為長輩選擇鄰近的失智社區服務據點"
  },
  {
    step: "02",
    title: "準備資格文件",
    body: "備妥一年內的失智診斷、CDR 評估或符合條件的身心障礙證明其中一項。",
    image: "assets/community-orientation-v3.jpg",
    alt: "據點人員說明失智社區服務資格文件"
  },
  {
    step: "03",
    title: "確認補助資格",
    body: "據點依診斷、CDR、CMS 與當年度核定規範，協助確認是否符合補助收案資格。",
    image: "assets/community-vitals-v3.jpg",
    alt: "失智社區據點確認長輩當日狀態與服務資格"
  },
  {
    step: "04",
    title: "確認自理與陪同",
    body: "長輩需能自行如廁、進食與移動；若需要協助，家屬或外籍家庭看護工須全程陪同。",
    image: "assets/community-meal-v3.jpg",
    alt: "家屬陪同長輩參與失智社區據點活動"
  },
  {
    step: "05",
    title: "選擇課程與時段",
    body: "和據點確認合適的課程日期、共餐需求及首次參與時段。",
    image: "assets/community-course-v3.jpg",
    alt: "長輩選擇並參與失智社區據點課程"
  },
  {
    step: "06",
    title: "攜帶健保卡報到",
    body: "首次到點請攜帶健保卡完成身分核對，再依確認的課程與時段參與。",
    image: "assets/community-dementia-hero-v3.jpg",
    alt: "長輩攜帶健保卡到失智社區服務據點報到"
  }
];

const iconMap = {
  brain: Brain,
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  compass: Compass,
  card: CreditCard,
  file: FileCheck2,
  pulse: HeartPulse,
  map: MapPin,
  phone: PhoneCall,
  shield: ShieldCheck,
  meal: Soup,
  person: UserCheck,
  people: Users,
  unavailable: XCircle
};

function escapeText(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function hydrateIcons(root) {
  root.querySelectorAll?.("[data-community-icon]:not([data-community-icon-ready])").forEach((host) => {
    const icon = iconMap[host.dataset.communityIcon];
    if (!icon) return;
    host.append(createLucideElement(icon, { "aria-hidden": "true" }));
    host.dataset.communityIconReady = "true";
  });
}

function cardScrollLeft(track, card) {
  return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
}

function bindHorizontalTrack({ track, cards, previous, next, status, currentValue = "true" }) {
  if (!track || !cards.length || !previous || !next || !status || track.dataset.communityTrackBound === "true") return;
  track.dataset.communityTrackBound = "true";
  previous.append(createLucideElement(ArrowLeft, { class: "day-care-assistance-control-icon", "aria-hidden": "true" }));
  next.append(createLucideElement(ArrowRight, { class: "day-care-assistance-control-icon", "aria-hidden": "true" }));
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let updateFrame = 0;

  const currentIndex = () => cards.reduce((nearest, card, index) => (
    Math.abs(cardScrollLeft(track, card) - track.scrollLeft)
      < Math.abs(cardScrollLeft(track, cards[nearest]) - track.scrollLeft)
      ? index
      : nearest
  ), 0);

  const update = () => {
    updateFrame = 0;
    const index = currentIndex();
    status.value = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    cards.forEach((card, cardIndex) => {
      if (cardIndex === index) card.setAttribute("aria-current", currentValue);
      else card.removeAttribute("aria-current");
    });
  };

  const scheduleUpdate = () => {
    if (updateFrame) return;
    updateFrame = window.requestAnimationFrame(update);
  };
  const scrollToCard = (index) => {
    const safeIndex = Math.max(0, Math.min(cards.length - 1, index));
    track.scrollTo({
      left: cardScrollLeft(track, cards[safeIndex]),
      behavior: reducedMotion ? "auto" : "smooth"
    });
  };

  previous.addEventListener("click", () => scrollToCard(currentIndex() - 1));
  next.addEventListener("click", () => scrollToCard(currentIndex() + 1));
  track.addEventListener("scroll", scheduleUpdate, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scrollToCard(currentIndex() + (event.key === "ArrowRight" ? 1 : -1));
  });

  let dragging = false;
  let pointerId = null;
  let dragStartX = 0;
  let dragStartScroll = 0;
  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragging = true;
    pointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(pointerId);
    event.preventDefault();
  });
  track.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });
  const finishDragging = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
    pointerId = null;
    scrollToCard(currentIndex());
  };
  track.addEventListener("pointerup", finishDragging);
  track.addEventListener("pointercancel", finishDragging);
  window.ResizeObserver && new ResizeObserver(scheduleUpdate).observe(track);
  update();
}

function summaryItemMarkup(item, index) {
  return `<li>
    <span class="service-timeline-dot">${String(index + 1).padStart(2, "0")}</span>
    <figure><img src="${escapeText(item.image)}" alt="${escapeText(item.alt || item.title)}" /></figure>
    <div>
      <strong>${escapeText(item.title)}</strong>
      <p>${escapeText(item.body)}</p>
    </div>
  </li>`;
}

function hydrateCommunityHero(root) {
  const page = root.querySelector?.(".community-page");
  if (!page || page.dataset.communityHeroHydrated === "true") return;
  const heroBackground = page.querySelector(".community-hero .hero-bg");
  if (heroBackground) {
    heroBackground.style.backgroundImage = `linear-gradient(90deg, rgba(255, 253, 248, 0.97) 0%, rgba(255, 248, 238, 0.9) 40%, rgba(255, 248, 238, 0.34) 68%, rgba(255, 248, 238, 0.04) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.12), rgba(255, 239, 218, 0.2)), url("${communityHeroImage}")`;
  }
  const copy = page.querySelector(".community-hero .service-detail-copy");
  if (!copy) return;
  copy.querySelector(".eyebrow").textContent = "Dementia Community Hub";
  copy.querySelector("h1").innerHTML = "<span>失智社區</span><span>服務據點</span>";
  copy.querySelector(".hero-slogan").textContent = "輕度失智課程｜2 分鐘了解";
  const body = copy.querySelector(":scope > p:not(.eyebrow):not(.hero-slogan)");
  if (body) body.textContent = "為輕度失智長輩安排規律課程、健康量測與共餐，在熟悉社區維持生活節奏。";
  const primary = copy.querySelector(".primary-button");
  if (primary) {
    primary.textContent = "詢問課程名額";
    primary.dataset.contactMessage = "我想了解失智社區服務據點的資格、課程時段、費用與鄰近據點。";
  }
  const secondary = copy.querySelector(".ghost-button");
  if (secondary) {
    secondary.textContent = "查看服務資格";
    secondary.href = "#community-eligibility";
    secondary.dataset.serviceScroll = "#community-eligibility";
  }
  page.dataset.communityHeroHydrated = "true";
}

function hydrateCommunitySeo() {
  const title = "失智社區服務據點｜歲悅長照集團";
  const description = "歲悅於士林、大同與信義設有失智症據點，為符合資格的輕度失智長輩提供定向感、認知課程、生命徵象量測與共餐。";
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
}

function hydrateCommunityQuickSummary(root) {
  const summary = root.querySelector?.(".community-page .one-minute-service-summary");
  if (!summary || summary.dataset.communityHydrated === "true") return;
  const articles = [...summary.querySelectorAll(":scope > article")];
  const situations = articles.find((article) => article.querySelector("h2")?.textContent.trim() === "你遇到的狀況");
  const assistance = articles.find((article) => article.querySelector("h2")?.textContent.trim() === "我們可以提供什麼協助");
  const situationList = situations?.querySelector("ul");
  const assistanceList = assistance?.querySelector("ul");
  if (!situationList || !assistanceList) return;

  situationList.innerHTML = communitySituations.map(summaryItemMarkup).join("");
  assistanceList.innerHTML = communityAssistance.map(summaryItemMarkup).join("");
  assistance.classList.add("day-care-assistance-summary", "community-assistance-summary");
  assistanceList.classList.add("day-care-assistance-track", "community-assistance-track");
  assistanceList.tabIndex = 0;
  assistanceList.setAttribute("aria-label", "社區據點可提供的課程與服務，可左右拖曳瀏覽");
  const cards = [...assistanceList.querySelectorAll(":scope > li")];
  cards.forEach((card) => card.classList.add("day-care-assistance-card", "community-assistance-card"));

  assistance.querySelector(".day-care-assistance-controls")?.remove();
  const controls = document.createElement("div");
  controls.className = "day-care-assistance-controls";
  controls.innerHTML = `
    <output data-community-assistance-status aria-live="polite">01 / ${String(cards.length).padStart(2, "0")}</output>
    <button type="button" data-community-assistance-previous aria-label="上一項服務" title="上一項服務"></button>
    <button type="button" data-community-assistance-next aria-label="下一項服務" title="下一項服務"></button>
  `;
  assistance.querySelector("h2")?.insertAdjacentElement("afterend", controls);
  bindHorizontalTrack({
    track: assistanceList,
    cards,
    previous: controls.querySelector("[data-community-assistance-previous]"),
    next: controls.querySelector("[data-community-assistance-next]"),
    status: controls.querySelector("[data-community-assistance-status]")
  });
  summary.dataset.communityHydrated = "true";
}

function hydrateCommunitySafety(root) {
  const host = root.querySelector?.("[data-community-safety-host]");
  if (!host || host.dataset.hydrated === "true") return;
  host.innerHTML = `
    <section id="community-service-boundary" class="community-boundary-section service-motion" aria-labelledby="community-boundary-title">
      <div class="community-boundary-inner">
        <header>
          <span class="community-section-icon" data-community-icon="shield"></span>
          <div>
            <p class="eyebrow">Safety First</p>
            <h2 id="community-boundary-title">先確認：這裡是課程據點，不是日間照顧中心</h2>
            <p>歲悅三處失智症據點目前提供課程、基本健康量測與共餐，不提供生活照顧或持續看視。</p>
          </div>
        </header>
        <div class="community-boundary-grid">
          <article class="community-boundary-do">
            <span data-community-icon="check"></span>
            <div>
              <h3>據點會提供</h3>
              <ul>
                <li>生命徵象量測與當日狀態留意</li>
                <li>定向感、認知與健康促進課程</li>
                <li>符合補助資格者的社區共餐</li>
              </ul>
            </div>
          </article>
          <article class="community-boundary-no">
            <span data-community-icon="unavailable"></span>
            <div>
              <h3>據點不提供</h3>
              <ul>
                <li>如廁、沐浴、餵食、移位等生活照顧</li>
                <li>照顧服務員的一對一照顧或持續看視</li>
                <li>日間照顧中心的托顧與接送服務</li>
              </ul>
            </div>
          </article>
        </div>
        <aside class="community-self-care-rule">
          <span data-community-icon="person"></span>
          <div>
            <strong>參與者必須能自行完成基本日常活動</strong>
            <p>若長輩無法自行如廁、進食或安全移動，家屬或外籍家庭看護工須全程陪同，並負責所需照顧與安全協助。</p>
          </div>
        </aside>
      </div>
    </section>
  `;
  hydrateIcons(host);
  host.dataset.hydrated = "true";
}

function hydrateCommunityScenes(root) {
  const section = root.querySelector?.(".community-page .two-minute-scenes");
  if (!section || section.dataset.communityHydrated === "true") return;
  section.setAttribute("aria-label", "失智社區服務據點課程與服務現場");
  const eyebrow = section.querySelector(".service-section-head .eyebrow");
  const title = section.querySelector(".service-section-head h2");
  if (eyebrow) eyebrow.textContent = "Course & Service Scenes";
  if (title) title.textContent = "我們提供的四項服務";
  const grid = section.querySelector(".two-minute-scene-grid");
  if (grid) {
    grid.innerHTML = communityScenes.map((scene) => `
      <article>
        <img src="${escapeText(scene.image)}" alt="${escapeText(scene.alt)}" loading="lazy" decoding="async" />
        <div>
          <strong>${escapeText(scene.title)}</strong>
          <p>${escapeText(scene.body)}</p>
        </div>
      </article>
    `).join("");
  }
  section.dataset.communityHydrated = "true";
}

function hydrateCommunityEligibility(root) {
  const host = root.querySelector?.("[data-community-eligibility-host]");
  if (!host || host.dataset.hydrated === "true") return;
  host.innerHTML = `
    <section id="community-eligibility" class="community-eligibility-section service-motion" aria-labelledby="community-eligibility-title">
      <div class="community-section-head">
        <div>
          <p class="eyebrow">Eligibility</p>
          <h2 id="community-eligibility-title">先用 1 分鐘確認是否適合</h2>
        </div>
        <p>依 115 年失智照護服務計畫規範整理；最終仍由據點依文件、個別狀況與當年度核定規範確認。</p>
      </div>
      <div class="community-eligibility-grid">
        <article>
          <span data-community-icon="brain"></span>
          <strong>確診輕度失智</strong>
          <p>已有失智症診斷，臨床失智評估量表 CDR 為 0.5 或 1。</p>
        </article>
        <article>
          <span data-community-icon="person"></span>
          <strong>未失能或 CMS 3 級以下</strong>
          <p>長輩尚未失能，或長照需要等級經評估為 CMS 3 級以下。</p>
        </article>
        <article>
          <span data-community-icon="check"></span>
          <strong>未入住 24 小時機構</strong>
          <p>目前不是住宿式機構、護理之家等 24 小時服務機構的住民。</p>
        </article>
      </div>
      <div class="community-document-panel">
        <div>
          <span data-community-icon="file"></span>
          <div>
            <h3>請準備一年內的資格文件</h3>
            <p>下列文件擇一即可先提供據點確認，不需要一開始全部備齊。</p>
          </div>
        </div>
        <ul>
          <li>載明 CDR 0.5 或 1 的失智症診斷證明書</li>
          <li>符合失智症類別的有效身心障礙證明</li>
          <li>醫師診斷證明搭配 CDR 評估報告</li>
        </ul>
      </div>
      <aside class="community-eligibility-note">
        <strong>若尚未做 CMS 評估</strong>
        <p>可先由據點協助確認下一步；若後續 CDR 達 2 以上或 CMS 為 4 至 8 級，會協助轉介更合適的長照或照顧服務。</p>
        <a href="#service-contact" data-service-scroll="#service-contact" data-contact-need="長照服務諮詢" data-contact-message="我不確定長輩是否符合失智社區服務據點資格，想請協助確認。">請據點協助確認資格</a>
      </aside>
    </section>
  `;
  hydrateIcons(host);
  host.dataset.hydrated = "true";
}

function hydrateCommunityFees(root) {
  const section = root.querySelector?.(".community-page .service-fee-section");
  if (!section || section.dataset.communityHydrated === "true") return;
  section.classList.add("community-fee-section");
  section.innerHTML = `
    <div class="community-section-head">
      <div>
        <p class="eyebrow">Pricing</p>
        <h2>費用一眼看懂</h2>
      </div>
      <p>先由據點確認是否符合補助收案資格，再依參與方式計費。</p>
    </div>
    <div class="community-fee-grid">
      <article>
        <span data-community-icon="card"></span>
        <small>符合補助資格</small>
        <strong>課程 0 元</strong>
        <p>攜帶健保卡完成身分核對，符合計畫補助資格者不另收課程費。</p>
      </article>
      <article>
        <span data-community-icon="clipboard"></span>
        <small>未使用計畫補助</small>
        <strong>300 元／堂</strong>
        <p>自費參與課程，每堂收費 300 元；課程時段由各據點確認。</p>
      </article>
      <article>
        <span data-community-icon="meal"></span>
        <small>符合供餐補助</small>
        <strong>30 元／餐</strong>
        <p>午餐扣除供餐補助後，每餐自付 30 元；參與者需能自行進食。</p>
      </article>
    </div>
    <aside class="community-fee-note">
      <span data-community-icon="shield"></span>
      <p><strong>健保卡用於身分核對，不代表持卡即自動免費。</strong>是否符合補助資格，仍由據點依失智診斷、CDR、CMS 與當年度核定規範確認。</p>
    </aside>
  `;
  hydrateIcons(section);
  section.dataset.communityHydrated = "true";
}

function googleMapHref(location) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
}

function googleMapEmbedHref(location) {
  return `https://www.google.com/maps?q=${encodeURIComponent(location.address)}&output=embed`;
}

function communityLocationMarkup() {
  const location = communityLocations.shilin;
  return `
    <div class="community-location-layout">
      <div class="community-location-map-column">
        <div class="community-location-tabs" role="tablist" aria-label="選擇失智症據點">
          ${Object.entries(communityLocations).map(([key, item], index) => `
            <button type="button" role="tab" class="community-location-tab${index === 0 ? " active" : ""}" data-community-location="${key}" aria-selected="${index === 0 ? "true" : "false"}">
              <strong>${escapeText(item.label)}</strong>
              <span>${escapeText(item.shortAddress)}</span>
            </button>
          `).join("")}
        </div>
        <div class="community-google-map">
          <iframe
            data-community-map-frame
            src="${googleMapEmbedHref(location)}"
            title="${escapeText(location.label)} Google 地圖"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
          <div>
            <span data-community-icon="map"></span>
            <p><strong data-community-map-label>${escapeText(location.label)}</strong><span data-community-map-address>${escapeText(location.address)}</span></p>
          </div>
        </div>
      </div>
      <aside class="community-location-detail" data-community-location-detail aria-live="polite">
        <figure>
          <img data-community-location-image src="${escapeText(location.image)}" alt="${escapeText(location.alt)}" loading="lazy" decoding="async" />
          <figcaption>課程情境示意</figcaption>
        </figure>
        <div>
          <span class="community-location-type">臺北市｜失智症據點</span>
          <h3 data-community-location-name>${escapeText(location.name)}</h3>
          <p data-community-location-description>${escapeText(location.description)}</p>
          <dl>
            <div><dt>地址</dt><dd data-community-location-address>${escapeText(location.address)}</dd></div>
            <div><dt>服務</dt><dd>生命徵象量測、定向感訓練、用餐、課程</dd></div>
            <div><dt>服務界線</dt><dd>課程據點，不提供生活照顧或持續看視</dd></div>
          </dl>
          <div class="community-location-actions">
            <a data-community-location-map-link href="${googleMapHref(location)}" target="_blank" rel="noopener noreferrer"><span data-community-icon="map"></span>地圖導航</a>
            <a href="#service-contact" data-service-scroll="#service-contact" data-contact-need="長照服務諮詢" data-community-location-contact data-contact-message="${escapeText(location.contactMessage)}"><span data-community-icon="phone"></span>詢問此據點</a>
          </div>
        </div>
      </aside>
    </div>
  `;
}

function updateCommunityLocation(host, key) {
  const location = communityLocations[key];
  if (!location) return;
  const image = host.querySelector("[data-community-location-image]");
  if (image) {
    image.src = location.image;
    image.alt = location.alt;
  }
  host.querySelector("[data-community-location-name]").textContent = location.name;
  host.querySelector("[data-community-location-description]").textContent = location.description;
  host.querySelector("[data-community-location-address]").textContent = location.address;
  host.querySelector("[data-community-map-label]").textContent = location.label;
  host.querySelector("[data-community-map-address]").textContent = location.address;
  host.querySelector("[data-community-location-map-link]").href = googleMapHref(location);
  host.querySelector("[data-community-location-contact]").dataset.contactMessage = location.contactMessage;
  const map = host.querySelector("[data-community-map-frame]");
  if (map) {
    map.src = googleMapEmbedHref(location);
    map.title = `${location.label} Google 地圖`;
  }
  host.querySelectorAll("[data-community-location]").forEach((tab) => {
    const active = tab.dataset.communityLocation === key;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function hydrateCommunityLocations(root) {
  const host = root.querySelector?.("[data-community-location-map-host]");
  if (!host || host.dataset.hydrated === "true") return;
  const section = host.closest(".service-location-section");
  if (section) {
    section.id = "community-locations";
    section.classList.add("community-location-section");
    const eyebrow = section.querySelector(".service-section-head .eyebrow");
    const title = section.querySelector(".service-section-head h2");
    const body = section.querySelector(".service-section-head span");
    if (eyebrow) eyebrow.textContent = "Locations";
    if (title) title.textContent = "三處失智症據點";
    if (body) body.textContent = "選擇士林、大同或信義據點，查看完整地址與 Google 地圖。";
  }
  host.innerHTML = communityLocationMarkup();
  hydrateIcons(host);
  host.querySelectorAll("[data-community-location]").forEach((tab) => {
    tab.addEventListener("click", () => updateCommunityLocation(host, tab.dataset.communityLocation));
  });
  host.dataset.hydrated = "true";
}

function applicationJourneyMarkup(steps) {
  return `
    <section id="community-application" class="day-care-application-journey community-application-journey" aria-labelledby="community-application-title">
      <div class="day-care-application-inner">
        <header class="day-care-application-head">
          <div>
            <p class="eyebrow">Application Journey</p>
            <h2 id="community-application-title">如何申請服務</h2>
            <p>從選擇據點、確認資格到帶健保卡報到，依序完成即可；不確定的文件可先請據點協助判斷。</p>
          </div>
          <div class="day-care-application-controls">
            <output data-community-journey-status aria-live="polite">01 / ${String(steps.length).padStart(2, "0")}</output>
            <button type="button" data-community-journey-previous aria-label="上一個步驟" title="上一個步驟"></button>
            <button type="button" data-community-journey-next aria-label="下一個步驟" title="下一個步驟"></button>
          </div>
        </header>
        <div class="day-care-application-track" data-community-journey-track role="list" tabindex="0" aria-label="失智社區服務據點申請步驟">
          ${steps.map((item) => `
            <article class="day-care-application-card" data-community-journey-card role="listitem">
              <figure>
                <img src="${escapeText(item.image)}" alt="${escapeText(item.alt)}" loading="lazy" decoding="async" />
                <span>STEP ${escapeText(item.step)}</span>
              </figure>
              <div>
                <h3>${escapeText(item.title)}</h3>
                <p>${escapeText(item.body)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function hydrateCommunityApplication(root) {
  const host = root.querySelector?.("[data-community-application-journey-host]");
  if (!host || host.dataset.hydrated === "true") return;
  host.innerHTML = applicationJourneyMarkup(communityApplicationSteps);
  bindHorizontalTrack({
    track: host.querySelector("[data-community-journey-track]"),
    cards: [...host.querySelectorAll("[data-community-journey-card]")],
    previous: host.querySelector("[data-community-journey-previous]"),
    next: host.querySelector("[data-community-journey-next]"),
    status: host.querySelector("[data-community-journey-status]"),
    currentValue: "step"
  });
  host.dataset.hydrated = "true";
}

export function hydrateCommunityPage(root = document) {
  hydrateCommunitySeo();
  hydrateCommunityHero(root);
  hydrateCommunityQuickSummary(root);
  hydrateCommunitySafety(root);
  hydrateCommunityScenes(root);
  hydrateCommunityEligibility(root);
  hydrateCommunityFees(root);
  hydrateCommunityLocations(root);
  hydrateCommunityApplication(root);
  hydrateIcons(root);
}
