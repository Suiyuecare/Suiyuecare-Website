import "./day-care-application-journey.css";
import "./home-care-location.css";
import ArrowLeft from "lucide/dist/esm/icons/arrow-left.mjs";
import ArrowRight from "lucide/dist/esm/icons/arrow-right.mjs";
import createLucideElement from "lucide/dist/esm/createElement.mjs";

const homeCareLocations = {
  taipei: {
    city: "臺北市",
    image: "assets/homecare-scene-assessment-fast.jpg",
    alt: "居家照顧服務員在長輩家中與家屬進行照顧需求評估",
    type: "臺北市｜居家長照特約機構",
    name: "臺北市歲悅居家長照機構",
    desc: "由同一個居家長照團隊承接士林、北投與南港區的到宅需求，協助家庭安排照顧服務與後續追蹤。",
    services: "身體照顧、生活支持、陪同外出、喘息服務",
    districts: ["士林區", "北投區", "南港區"],
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    dispatch: "依個案地址、希望時段、照顧強度與人力媒合確認",
    contactMessage: "我住在臺北市士林、北投或南港區，想了解居家照顧服務，請協助確認可服務時段與申請方式。"
  },
  newtaipei: {
    city: "新北市",
    image: "assets/location-xindian-integrated-care-v2.jpg",
    alt: "居家照顧團隊在新北市家庭中協助長輩步行並與家屬討論照顧安排",
    type: "新北市｜居家長照特約機構",
    name: "歲悅新店居家長照機構",
    desc: "由新店團隊承接新店、中和與永和區的到宅需求，並可依長輩狀況協助銜接復能與家庭照顧資源。",
    services: "身體照顧、生活支持、陪同就醫、家屬支持",
    districts: ["新店區", "中和區", "永和區"],
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    dispatch: "依個案地址、希望時段、照顧強度與人力媒合確認",
    contactMessage: "我住在新北市新店、中和或永和區，想了解居家照顧服務，請協助確認可服務時段與申請方式。"
  }
};

const homeCareAssistanceVisuals = {
  "身體照顧": {
    image: "assets/homecare-scene-bathing-fast.jpg",
    alt: "照顧服務員在家中協助長輩安全沐浴"
  },
  "生活照顧": {
    image: "assets/homecare-scene-meal-prep-fast.jpg",
    alt: "照顧服務員在長輩家中準備餐食"
  },
  "陪同就醫": {
    image: "assets/homecare-scene-outing-fast.jpg",
    alt: "照顧服務員陪長輩從家中安全外出"
  },
  "喘息支持": {
    image: "assets/homecare-scene-joint-activity-fast.jpg",
    alt: "照顧服務員在家中陪伴長輩活動，讓家屬獲得喘息"
  },
  "失智陪伴": {
    image: "assets/homecare-detail-04-daily-support-fast.jpg",
    alt: "照顧服務員在熟悉的家中陪伴失智長輩"
  },
  "安全觀察": {
    image: "assets/homecare-scene-assessment-fast.jpg",
    alt: "居家照顧服務員觀察長輩居家動線與安全需求"
  },
  "家屬回報": {
    image: "assets/homecare-detail-02-care-plan-fast.jpg",
    alt: "居家照顧團隊與家屬確認服務紀錄和照顧計畫"
  },
  "資源銜接": {
    image: "assets/location-xindian-integrated-care-v2.jpg",
    alt: "居家照顧與復能團隊在家中協助長輩並和家屬討論資源"
  },
  "沐浴、用餐、移位與生活支持": {
    image: "assets/homecare-scene-bathing-fast.jpg",
    alt: "照顧服務員在家中提供身體照顧與生活支持"
  },
  "服務後有紀錄，家屬看得懂": {
    image: "assets/homecare-detail-04-daily-support-fast.jpg",
    alt: "居家照顧服務後留下清楚紀錄供家屬確認"
  },
  "督導追蹤，必要時調整服務": {
    image: "assets/homecare-scene-assessment-fast.jpg",
    alt: "居家服務督導在家中與長輩及家屬追蹤照顧需求"
  }
};

const homeCareSceneComplements = [
  {
    image: "assets/homecare-scene-meal-prep-fast.jpg",
    title: "餐食備餐",
    text: "依長輩飲食習慣與吞嚥狀況，協助備餐、擺餐與進食觀察。"
  },
  {
    image: "assets/homecare-scene-bathing-fast.jpg",
    title: "沐浴洗澡",
    text: "在安全與隱私被照顧好的前提下，協助沐浴、擦身與浴後整理。"
  },
  {
    image: "assets/homecare-scene-outing-fast.jpg",
    title: "外出服務",
    text: "陪同外出、就醫或採買，協助移動安全與途中狀況留意。"
  },
  {
    image: "assets/homecare-scene-joint-activity-fast.jpg",
    title: "肢體關節活動",
    text: "陪長輩做溫和關節活動與日常伸展，降低僵硬並維持活動度。"
  }
];

const defaultHomeCareApplicationSteps = [
  {
    step: "01",
    title: "需求諮詢",
    body: "先說明長輩狀況、照顧地點、最需要協助的日常情境與希望服務時段。",
    image: "assets/homecare-scene-assessment-fast.jpg",
    alt: "居家照顧人員在長輩家中了解照顧需求"
  },
  {
    step: "02",
    title: "到宅或電話評估",
    body: "確認生活能力、居家動線、照顧風險與目前可銜接的服務資源。",
    image: "assets/homecare-detail-01-greeting-fast.jpg",
    alt: "照顧服務員到長輩家中問候並進行初步評估"
  },
  {
    step: "03",
    title: "建立照顧計畫",
    body: "把服務內容、注意事項、家屬期待與回報方式整理清楚。",
    image: "assets/homecare-detail-02-care-plan-fast.jpg",
    alt: "居家照顧團隊在家中與家屬討論照顧計畫"
  },
  {
    step: "04",
    title: "照服員媒合",
    body: "依服務區域、時段、照顧強度與長輩特性安排合適人員。",
    image: "assets/homecare-detail-03-safe-transfer-fast.jpg",
    alt: "合適的照顧服務員在家中協助長輩安全移位"
  },
  {
    step: "05",
    title: "正式到宅服務",
    body: "照服員依照計畫進到家中，提供身體照顧、生活支持或陪同服務。",
    image: "assets/homecare-scene-bathing-fast.jpg",
    alt: "照顧服務員在家中提供正式到宅照顧服務"
  },
  {
    step: "06",
    title: "紀錄與持續追蹤",
    body: "服務後留下重點紀錄，督導再依長輩變化與家屬回饋調整安排。",
    image: "assets/homecare-detail-04-daily-support-fast.jpg",
    alt: "居家照顧服務員完成服務紀錄並持續支持長輩日常"
  }
];

function escapeText(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function districtMarkup(location) {
  return location.districts.map((district) => `
    <li>
      <span aria-hidden="true"></span>
      <strong>${escapeText(district)}</strong>
      <small>特約服務區</small>
    </li>
  `).join("");
}

export function homeCareLocationMapMarkup() {
  const location = homeCareLocations.taipei;
  return `<div class="day-care-home-map home-care-service-map">
    <div class="map-column">
      <section class="home-care-coverage-board" aria-labelledby="home-care-coverage-board-title">
        <header>
          <p class="eyebrow">Service Area</p>
          <h3 id="home-care-coverage-board-title">兩個特約機構，服務六個行政區</h3>
          <p>請先選擇所在縣市；以下是到宅派案範圍，不是六個實體門市。</p>
        </header>
        <div class="home-care-city-tabs" role="tablist" aria-label="選擇居家照顧特約機構">
          <button class="home-care-city-tab active" type="button" role="tab" data-home-care-location="taipei" aria-selected="true">
            <span>臺北市</span>
            <strong>士林・北投・南港</strong>
            <small>3 個特約服務區</small>
          </button>
          <button class="home-care-city-tab" type="button" role="tab" data-home-care-location="newtaipei" aria-selected="false">
            <span>新北市</span>
            <strong>新店・中和・永和</strong>
            <small>3 個特約服務區</small>
          </button>
        </div>
        <div class="home-care-district-panel" role="tabpanel" aria-live="polite">
          <div>
            <span data-home-care-city>${location.city}</span>
            <strong data-home-care-district-summary>${location.districts.join("・")}</strong>
          </div>
          <ul data-home-care-districts>${districtMarkup(location)}</ul>
        </div>
        <p class="home-care-coverage-note">是否可派案，仍會依詳細地址、希望時段、照顧需求與當下人力媒合確認。</p>
      </section>
    </div>
    <aside class="location-detail day-care-location-detail home-care-location-detail" data-home-care-location-detail aria-live="polite">
      <img data-home-care-location-image src="${location.image}" alt="${location.alt}" />
      <div>
        <div class="location-meta-row"><span data-home-care-location-type>${location.type}</span></div>
        <h3 data-home-care-location-name>${location.name}</h3>
        <p data-home-care-location-desc>${location.desc}</p>
        <dl>
          <div><dt>特約範圍</dt><dd data-home-care-location-address>${location.districts.join("、")}</dd></div>
          <div><dt>可協助</dt><dd data-home-care-location-services>${location.services}</dd></div>
          <div><dt>派案說明</dt><dd data-home-care-location-dispatch>${location.dispatch}</dd></div>
          <div><dt>諮詢電話</dt><dd data-home-care-location-phone>${location.phone}</dd></div>
        </dl>
        <div class="location-actions">
          <a data-home-care-location-call href="${location.phoneHref}">撥打電話</a>
          <a
            data-home-care-location-contact
            href="#service-contact"
            data-service-scroll="#service-contact"
            data-contact-need="長照服務諮詢"
            data-contact-message="${location.contactMessage}"
          >詢問此區服務</a>
        </div>
      </div>
    </aside>
  </div>`;
}

function updateHomeCareLocation(host, key) {
  const location = homeCareLocations[key];
  if (!location) return;

  const image = host.querySelector("[data-home-care-location-image]");
  image.src = location.image;
  image.alt = location.alt;
  host.querySelector("[data-home-care-city]").textContent = location.city;
  host.querySelector("[data-home-care-district-summary]").textContent = location.districts.join("・");
  host.querySelector("[data-home-care-districts]").innerHTML = districtMarkup(location);
  host.querySelector("[data-home-care-location-type]").textContent = location.type;
  host.querySelector("[data-home-care-location-name]").textContent = location.name;
  host.querySelector("[data-home-care-location-desc]").textContent = location.desc;
  host.querySelector("[data-home-care-location-services]").textContent = location.services;
  host.querySelector("[data-home-care-location-dispatch]").textContent = location.dispatch;
  host.querySelector("[data-home-care-location-phone]").textContent = location.phone;
  host.querySelector("[data-home-care-location-address]").textContent = location.districts.join("、");
  host.querySelector("[data-home-care-location-call]").href = location.phoneHref;
  host.querySelector("[data-home-care-location-contact]").dataset.contactMessage = location.contactMessage;

  host.querySelectorAll("[data-home-care-location]").forEach((tab) => {
    const active = tab.dataset.homeCareLocation === key;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function cardScrollLeft(track, card) {
  return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
}

function bindHorizontalTrack({
  track,
  cards,
  previous,
  next,
  status,
  currentValue = "true",
  ariaCurrent = "true"
}) {
  if (!track || !cards.length || !previous || !next || !status) return;

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
    track.scrollTo({ left: cardScrollLeft(track, cards[safeIndex]), behavior: reducedMotion ? "auto" : "smooth" });
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

  if (ariaCurrent === "step") cards[0]?.setAttribute("aria-current", "step");
}

function hydrateHomeCareQuickSummary(root) {
  const summary = root.querySelector?.(".home-care-page .one-minute-service-summary");
  if (!summary || summary.dataset.homeCareHydrated === "true") return;
  const articles = [...summary.querySelectorAll(":scope > article")];
  const situations = articles.find((article) => article.querySelector("h2")?.textContent.trim() === "你遇到的狀況");
  const assistance = articles.find((article) => article.querySelector("h2")?.textContent.trim() === "我們可以提供什麼協助");

  [...(situations?.querySelectorAll("li") || [])].slice(3).forEach((item) => item.remove());
  if (!assistance) return;

  const track = assistance.querySelector("ul");
  const cards = [...(track?.querySelectorAll(":scope > li") || [])];
  if (!track || !cards.length) return;

  assistance.classList.add("day-care-assistance-summary", "home-care-assistance-summary");
  track.classList.add("day-care-assistance-track", "home-care-assistance-track");
  track.tabIndex = 0;
  track.setAttribute("aria-label", "居家照顧可提供的協助，可左右拖曳瀏覽");
  cards.forEach((card, index) => {
    const title = card.querySelector("strong")?.textContent.trim() || "";
    const visual = homeCareAssistanceVisuals[title]
      || Object.values(homeCareAssistanceVisuals)[index % Object.values(homeCareAssistanceVisuals).length];
    const image = card.querySelector("img");
    if (image && visual) {
      image.src = visual.image;
      image.alt = visual.alt;
    }
    card.classList.add("day-care-assistance-card", "home-care-assistance-card");
  });

  const controls = document.createElement("div");
  controls.className = "day-care-assistance-controls";
  controls.innerHTML = `
    <output data-home-care-assistance-status aria-live="polite">01 / ${String(cards.length).padStart(2, "0")}</output>
    <button type="button" data-home-care-assistance-previous aria-label="上一項協助" title="上一項協助"></button>
    <button type="button" data-home-care-assistance-next aria-label="下一項協助" title="下一項協助"></button>
  `;
  assistance.querySelector("h2")?.insertAdjacentElement("afterend", controls);
  bindHorizontalTrack({
    track,
    cards,
    previous: controls.querySelector("[data-home-care-assistance-previous]"),
    next: controls.querySelector("[data-home-care-assistance-next]"),
    status: controls.querySelector("[data-home-care-assistance-status]")
  });
  summary.dataset.homeCareHydrated = "true";
}

function completeHomeCareSceneGallery(root) {
  const gallery = root.querySelector?.(".home-care-page .two-minute-scene-grid");
  if (!gallery || gallery.dataset.homeCareCompleted === "true") return;
  const missingCount = Math.max(0, 8 - gallery.children.length);
  homeCareSceneComplements.slice(0, missingCount).forEach((scene) => {
    gallery.insertAdjacentHTML("beforeend", `
      <article>
        <img src="${escapeText(scene.image)}" alt="${escapeText(scene.title)}" loading="lazy" decoding="async" />
        <div>
          <strong>${escapeText(scene.title)}</strong>
          <p>${escapeText(scene.text)}</p>
        </div>
      </article>
    `);
  });
  gallery.dataset.homeCareCompleted = "true";
}

function homeCareApplicationSteps(host) {
  let source = [];
  if (host.dataset.flowCards) {
    try {
      const parsed = JSON.parse(host.dataset.flowCards);
      if (Array.isArray(parsed)) source = parsed;
    } catch (error) {
      console.warn("Home-care application steps could not be parsed.", error);
    }
  }
  if (!source.length) return defaultHomeCareApplicationSteps;
  return source.map((item, index) => {
    const fallback = defaultHomeCareApplicationSteps[index] || defaultHomeCareApplicationSteps.at(-1);
    return {
      step: item.step || item.label || fallback.step,
      title: item.title || fallback.title,
      body: item.body || item.copy || item.description || fallback.body,
      image: fallback.image,
      alt: fallback.alt
    };
  });
}

function homeCareApplicationJourneyMarkup(host, steps) {
  const eyebrow = host.dataset.flowEyebrow || "Application Journey";
  const cmsTitle = String(host.dataset.flowTitle || "").trim();
  const title = !cmsTitle || cmsTitle === "居家照顧流程" ? "如何申請居家照顧" : cmsTitle;
  const body = host.dataset.flowBody || "從需求諮詢、評估、媒合到正式到宅服務，依序確認即可，不必一開始就準備所有資料。";
  return `<section id="home-care-application" class="day-care-application-journey home-care-application-journey" aria-labelledby="home-care-application-title">
    <div class="day-care-application-inner">
      <header class="day-care-application-head">
        <div>
          <p class="eyebrow">${escapeText(eyebrow)}</p>
          <h2 id="home-care-application-title">${escapeText(title)}</h2>
          <p>${escapeText(body)}</p>
        </div>
        <div class="day-care-application-controls">
          <output data-home-care-journey-status aria-live="polite">01 / ${String(steps.length).padStart(2, "0")}</output>
          <button type="button" data-home-care-journey-previous aria-label="上一個步驟" title="上一個步驟"></button>
          <button type="button" data-home-care-journey-next aria-label="下一個步驟" title="下一個步驟"></button>
        </div>
      </header>
      <div class="day-care-application-track" data-home-care-journey-track role="list" tabindex="0" aria-label="居家照顧申請服務步驟">
        ${steps.map((item) => `<article class="day-care-application-card" data-home-care-journey-card role="listitem">
          <figure>
            <img src="${escapeText(item.image)}" alt="${escapeText(item.alt)}" loading="lazy" decoding="async" />
            <span>STEP ${escapeText(item.step)}</span>
          </figure>
          <div>
            <h3>${escapeText(item.title)}</h3>
            <p>${escapeText(item.body)}</p>
          </div>
        </article>`).join("")}
      </div>
    </div>
  </section>`;
}

function hydrateHomeCareApplicationJourney(root) {
  const host = root.querySelector?.("[data-home-care-application-journey-host]");
  if (!host || host.dataset.hydrated === "true") return;
  const steps = homeCareApplicationSteps(host);
  host.innerHTML = homeCareApplicationJourneyMarkup(host, steps);
  bindHorizontalTrack({
    track: host.querySelector("[data-home-care-journey-track]"),
    cards: [...host.querySelectorAll("[data-home-care-journey-card]")],
    previous: host.querySelector("[data-home-care-journey-previous]"),
    next: host.querySelector("[data-home-care-journey-next]"),
    status: host.querySelector("[data-home-care-journey-status]"),
    currentValue: "step",
    ariaCurrent: "step"
  });
  host.dataset.hydrated = "true";
}

export function hydrateHomeCareLocation(root = document) {
  completeHomeCareSceneGallery(root);
  hydrateHomeCareQuickSummary(root);
  hydrateHomeCareApplicationJourney(root);

  const host = root.querySelector?.("[data-home-care-location-map-host]");
  if (!host || host.dataset.hydrated === "true") return;
  const section = host.closest(".service-location-section");
  if (section) {
    section.id = "home-care-coverage";
    const title = section.querySelector(".service-section-head h2");
    if (title) title.textContent = "服務範圍";
  }
  const coverageLink = root.querySelector(".home-care-page .one-minute-service-actions .ghost-button");
  if (coverageLink) {
    coverageLink.href = "#home-care-coverage";
    coverageLink.dataset.serviceScroll = "#home-care-coverage";
  }
  if (!host.querySelector("[data-home-care-location-detail]")) {
    host.innerHTML = homeCareLocationMapMarkup();
  }
  host.querySelectorAll("[data-home-care-location]").forEach((tab) => {
    tab.addEventListener("click", () => updateHomeCareLocation(host, tab.dataset.homeCareLocation));
  });
  host.dataset.hydrated = "true";
}
