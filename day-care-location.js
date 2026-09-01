import "./day-care-application-journey.css";
import ArrowLeft from "lucide/dist/esm/icons/arrow-left.mjs";
import ArrowRight from "lucide/dist/esm/icons/arrow-right.mjs";
import createLucideElement from "lucide/dist/esm/createElement.mjs";
import { hydrateDayCareChecklistIconNodes } from "./day-care-checklist-icons.js";

const defaultDayCareApplicationSteps = [
  {
    step: "01",
    title: "電話諮詢",
    body: "先了解長輩身體狀態、生活習慣、交通需求，以及家屬最在意的問題。",
    image: "assets/service-journey-01-application.jpg",
    alt: "日照中心人員與長輩及家屬進行需求諮詢"
  },
  {
    step: "02",
    title: "預約參觀",
    body: "讓家屬與長輩實際認識環境、活動安排、照顧人員與一日作息。",
    image: "assets/service-journey-02-facility-tour.jpg",
    alt: "照顧人員陪同長輩與家屬參觀日照中心"
  },
  {
    step: "03",
    title: "試上一日",
    body: "實際參與活動、用餐與休息，觀察長輩對環境及作息的適應情況。",
    image: "assets/daycare-detail-03-activity-fast.jpg",
    alt: "長輩在日照中心參與一日體驗活動"
  },
  {
    step: "04",
    title: "安排體檢",
    body: "確認適應良好後，可至鄰近醫院體檢，並準備六個月內的體檢文件。",
    image: "assets/service-journey-03-health-check.jpg",
    alt: "護理人員陪同長輩進行健康檢查"
  },
  {
    step: "05",
    title: "確認體檢文件",
    body: "確認理學檢查、胸部 X 光、血液常規、血液生化與尿液檢查等五類項目。",
    image: "assets/homepage-batch/14-care-notes-fast.jpg",
    alt: "照顧人員核對長輩體檢文件與入托資料"
  },
  {
    step: "06",
    title: "正式入托與回報",
    body: "文件確認後安排正式入托，中心持續回報出席、餐食、活動與健康觀察。",
    image: "assets/daycare-detail-04-checkin-fast.jpg",
    alt: "長輩與家屬抵達日照中心辦理正式入托"
  }
];

const dayCareApplicationImages = defaultDayCareApplicationSteps.map(({ image, alt }) => ({ image, alt }));

const dayCareHealthExamItems = [
  ["理學檢查", "由醫師問診並進行身體各系統檢查，以及身高、體重與血壓測量。"],
  ["胸部 X 光檢查", "主要用於篩檢肺結核等呼吸道傳染病。"],
  ["血液常規檢查", "包含白血球（WBC）、紅血球（RBC）、血紅素（Hb）、血小板等。"],
  ["血液生化檢查", "包含肝功能（GOT、GPT）、腎功能（肌酸酐）、飯前血糖、膽固醇及三酸甘油脂。"],
  ["尿液檢查", "包含尿蛋白、尿糖等常規項目。"]
];

const dayCareAssistanceVisuals = {
  "生活照顧": {
    image: "assets/service-journey-08-nap-time.jpg",
    alt: "長輩在日照中心安心午休"
  },
  "餐食照顧": {
    image: "assets/daycare-detail-02-meal-fast.jpg",
    alt: "長輩在日照中心由照顧人員陪伴用餐"
  },
  "健康促進": {
    image: "assets/daycare-detail-01-exercise-fast.jpg",
    alt: "長輩在日照中心參與健康促進運動"
  },
  "社交陪伴": {
    image: "assets/daycare-detail-03-activity-fast.jpg",
    alt: "長輩在日照中心參與團體活動與同儕互動"
  },
  "失智友善支持": {
    image: "assets/service-journey-09-mahjong-activity.jpg",
    alt: "照顧人員陪伴長輩參與熟悉的益智活動"
  },
  "家屬回報": {
    image: "assets/homepage-batch/14-care-notes-fast.jpg",
    alt: "照顧人員記錄長輩當日照顧情形"
  },
  "交通與接送提醒": {
    image: "assets/daycare-scene-shuttle-v1.jpg",
    alt: "日照中心交通車接送長輩"
  },
  "資源銜接": {
    image: "assets/service-journey-15-resource-coordination.jpg",
    alt: "專業人員與家屬討論長照資源安排"
  }
};

const defaultDayCareAssistanceItems = [
  {
    title: "生活照顧",
    body: "報到接待、健康觀察、如廁協助、午休照顧、回家準備與安全巡視。"
  },
  {
    title: "餐食照顧",
    body: "共餐、飲水提醒、用餐觀察、吞嚥風險提醒與營養狀態初步留意。"
  },
  {
    title: "健康促進",
    body: "椅上運動、伸展、肌力、平衡、律動、認知刺激與生活功能活動。"
  },
  {
    title: "社交陪伴",
    body: "團體活動、節慶活動、手作課程、音樂互動與同儕交流。"
  },
  {
    title: "失智友善支持",
    body: "用熟悉節奏、環境提示、活動引導與安全陪伴，降低焦躁與不安。"
  },
  {
    title: "家屬回報",
    body: "回報出席、用餐、活動、精神情緒與特殊事件，讓家屬掌握白天狀態。"
  },
  {
    title: "交通與接送提醒",
    body: "依服務條件討論交通安排、接送注意事項與到離場交接。"
  },
  {
    title: "資源銜接",
    body: "協助家屬理解長照資源、居家照顧、復能與家庭支持方案。"
  }
];

function escapeJourneyText(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function dayCareHealthExamMarkup() {
  return `<section id="day-care-health-exam" class="service-info-section service-detail-section service-motion day-care-health-exam-section" aria-labelledby="day-care-health-exam-title">
    <div class="service-section-head">
      <div>
        <p class="eyebrow">Health Examination</p>
        <h2 id="day-care-health-exam-title">收案前體檢項目</h2>
      </div>
      <span>申請日照收案時，請準備六個月內的體檢文件；前往醫療院所前，可先向中心確認報告格式與效期。</span>
    </div>
    <ol class="service-info-grid">
      ${dayCareHealthExamItems.map(([title, body], index) => `<li>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeJourneyText(title)}</strong>
        <p>${escapeJourneyText(body)}</p>
      </li>`).join("")}
    </ol>
  </section>`;
}

function hydrateDayCareHealthExam(root) {
  const host = root.querySelector?.("[data-day-care-health-exam-host]");
  if (!host || host.dataset.hydrated === "true") return;
  host.innerHTML = dayCareHealthExamMarkup();
  host.dataset.hydrated = "true";
}

function journeyImageFor(item = {}, index = 0) {
  const title = String(item.title || "").trim();
  const text = `${title} ${item.body || item.copy || item.description || ""}`;
  if (/體檢項目|體檢文件|檢查項目|文件確認/.test(title)) return dayCareApplicationImages[4];
  if (/正式入托|入托與回報|正式服務|報到/.test(title)) return dayCareApplicationImages[5];
  if (/試上|試讀|一日體驗|適應/.test(title)) return dayCareApplicationImages[2];
  if (/參觀/.test(title)) return dayCareApplicationImages[1];
  if (/安排體檢|健康檢查|體檢/.test(title)) return dayCareApplicationImages[3];
  if (/電話|諮詢|提出申請/.test(title)) return dayCareApplicationImages[0];

  if (/體檢項目|體檢文件|檢查項目|文件確認/.test(text)) return dayCareApplicationImages[4];
  if (/正式入托|入托與回報|正式服務|報到/.test(text)) return dayCareApplicationImages[5];
  if (/試上|試讀|一日體驗|適應/.test(text)) return dayCareApplicationImages[2];
  if (/參觀/.test(text)) return dayCareApplicationImages[1];
  if (/安排體檢|健康檢查|體檢/.test(text)) return dayCareApplicationImages[3];
  if (/電話|諮詢|提出申請|需求/.test(text)) return dayCareApplicationImages[0];

  const explicitImage = typeof item.image === "string"
    ? item.image
    : typeof item.image_url === "string"
      ? item.image_url
      : typeof item.url === "string"
        ? item.url
        : "";
  if (explicitImage) {
    return {
      image: explicitImage,
      alt: item.image_alt || item.alt || `${item.title || "日照申請"}情境照片`
    };
  }
  return dayCareApplicationImages[index % dayCareApplicationImages.length];
}

function dayCareApplicationSteps(host) {
  let source = [];
  if (host.dataset.flowCards) {
    try {
      const parsed = JSON.parse(host.dataset.flowCards);
      if (Array.isArray(parsed)) source = parsed;
    } catch (error) {
      console.warn("Day-care application steps could not be parsed.", error);
    }
  }
  if (!source.length) return defaultDayCareApplicationSteps;

  return source.map((item, index) => {
    const fallback = defaultDayCareApplicationSteps[index] || defaultDayCareApplicationSteps.at(-1);
    const image = journeyImageFor(item, index);
    const title = item.title || fallback.title;
    const usesCurrentHealthExamChecklist = /體檢項目|體檢文件|檢查項目|文件確認/.test(title);
    return {
      step: item.step || item.label || String(index + 1).padStart(2, "0"),
      title,
      body: usesCurrentHealthExamChecklist
        ? defaultDayCareApplicationSteps[4].body
        : item.body || item.copy || item.description || fallback.body,
      image: image.image,
      alt: image.alt
    };
  });
}

function dayCareApplicationJourneyMarkup(host, steps) {
  const eyebrow = host.dataset.flowEyebrow || "Application Journey";
  const cmsTitle = String(host.dataset.flowTitle || "").trim();
  const title = !cmsTitle || cmsTitle === "參觀到入托流程" ? "如何申請服務" : cmsTitle;
  const body = host.dataset.flowBody || "從電話諮詢、參觀、試上一日到正式入托，依序確認即可，不必一次準備所有資料。";
  return `<section id="day-care-application" class="day-care-application-journey" aria-labelledby="day-care-application-title">
    <div class="day-care-application-inner">
      <header class="day-care-application-head">
        <div>
          <p class="eyebrow">${escapeJourneyText(eyebrow)}</p>
          <h2 id="day-care-application-title">${escapeJourneyText(title)}</h2>
          <p>${escapeJourneyText(body)}</p>
        </div>
        <div class="day-care-application-controls">
          <output data-day-care-journey-status aria-live="polite">01 / ${String(steps.length).padStart(2, "0")}</output>
          <button type="button" data-day-care-journey-previous aria-label="上一個步驟" title="上一個步驟"></button>
          <button type="button" data-day-care-journey-next aria-label="下一個步驟" title="下一個步驟"></button>
        </div>
      </header>
      <div class="day-care-application-track" data-day-care-journey-track role="list" tabindex="0" aria-label="日照申請服務步驟">
        ${steps.map((item, index) => `<article class="day-care-application-card" data-day-care-journey-card role="listitem">
          <figure>
            <img src="${escapeJourneyText(item.image)}" alt="${escapeJourneyText(item.alt)}" loading="lazy" decoding="async" />
            <span>STEP ${escapeJourneyText(item.step || String(index + 1).padStart(2, "0"))}</span>
          </figure>
          <div>
            <h3>${escapeJourneyText(item.title)}</h3>
            <p>${escapeJourneyText(item.body)}</p>
          </div>
        </article>`).join("")}
      </div>
    </div>
  </section>`;
}

function cardScrollLeft(track, card) {
  return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
}

function bindDayCareApplicationJourney(host) {
  const track = host.querySelector("[data-day-care-journey-track]");
  const cards = [...host.querySelectorAll("[data-day-care-journey-card]")];
  const previous = host.querySelector("[data-day-care-journey-previous]");
  const next = host.querySelector("[data-day-care-journey-next]");
  const status = host.querySelector("[data-day-care-journey-status]");
  if (!track || !cards.length || !previous || !next || !status) return;

  previous.append(createLucideElement(ArrowLeft, { class: "day-care-application-control-icon", "aria-hidden": "true" }));
  next.append(createLucideElement(ArrowRight, { class: "day-care-application-control-icon", "aria-hidden": "true" }));
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let updateFrame = 0;

  const currentIndex = () => cards.reduce((nearest, card, index) => (
    Math.abs(cardScrollLeft(track, card) - track.scrollLeft) < Math.abs(cardScrollLeft(track, cards[nearest]) - track.scrollLeft)
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
      if (cardIndex === index) card.setAttribute("aria-current", "step");
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
}

function hydrateDayCareApplicationJourney(root = document) {
  const host = root.querySelector?.("[data-day-care-application-journey-host]");
  if (!host || host.dataset.hydrated === "true") return;
  const steps = dayCareApplicationSteps(host);
  host.innerHTML = dayCareApplicationJourneyMarkup(host, steps);
  bindDayCareApplicationJourney(host);
  host.dataset.hydrated = "true";
}

function bindDayCareAssistanceTrack(article) {
  const track = article.querySelector("[data-day-care-assistance-track]");
  const cards = [...article.querySelectorAll("[data-day-care-assistance-card]")];
  const previous = article.querySelector("[data-day-care-assistance-previous]");
  const next = article.querySelector("[data-day-care-assistance-next]");
  const status = article.querySelector("[data-day-care-assistance-status]");
  if (!track || !cards.length || !previous || !next || !status) return;

  previous.append(createLucideElement(ArrowLeft, { class: "day-care-assistance-control-icon", "aria-hidden": "true" }));
  next.append(createLucideElement(ArrowRight, { class: "day-care-assistance-control-icon", "aria-hidden": "true" }));
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let updateFrame = 0;

  const cardLeft = (card) => card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  const currentIndex = () => cards.reduce((nearest, card, index) => (
    Math.abs(cardLeft(card) - track.scrollLeft) < Math.abs(cardLeft(cards[nearest]) - track.scrollLeft)
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
      if (cardIndex === index) card.setAttribute("aria-current", "true");
      else card.removeAttribute("aria-current");
    });
  };

  const scheduleUpdate = () => {
    if (updateFrame) return;
    updateFrame = window.requestAnimationFrame(update);
  };

  const scrollToCard = (index) => {
    const safeIndex = Math.max(0, Math.min(cards.length - 1, index));
    track.scrollTo({ left: cardLeft(cards[safeIndex]), behavior: reducedMotion ? "auto" : "smooth" });
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

function hydrateDayCareQuickSummary(root = document) {
  const summary = root.querySelector?.(".one-minute-service-summary");
  if (!summary || summary.dataset.dayCareHydrated === "true") return;
  const articles = [...summary.querySelectorAll(":scope > article")];
  const situations = articles.find((article) => article.querySelector("h2")?.textContent.trim() === "你遇到的狀況");
  const assistance = articles.find((article) => article.querySelector("h2")?.textContent.trim() === "我們可以提供什麼協助");

  [...(situations?.querySelectorAll("li") || [])].slice(3).forEach((item) => item.remove());
  if (!assistance) return;

  const track = assistance.querySelector("ul");
  let cards = [...(track?.querySelectorAll(":scope > li") || [])];
  if (!track || !cards.length) return;
  const bundledTitles = new Set([
    "日常作息、餐食、活動被安排",
    "中心照顧團隊觀察狀態",
    "減少家屬白天照顧壓力"
  ]);
  const usesBundledFallback = cards.length === 3 && cards.every((card) => (
    bundledTitles.has(card.querySelector("strong")?.textContent.trim())
  ));
  if (usesBundledFallback) {
    track.innerHTML = defaultDayCareAssistanceItems.map((item, index) => {
      const visual = dayCareAssistanceVisuals[item.title];
      return `<li>
        <span class="service-timeline-dot">${String(index + 1).padStart(2, "0")}</span>
        <figure><img src="${escapeJourneyText(visual.image)}" alt="${escapeJourneyText(visual.alt)}" /></figure>
        <div>
          <strong>${escapeJourneyText(item.title)}</strong>
          <p>${escapeJourneyText(item.body)}</p>
        </div>
      </li>`;
    }).join("");
    cards = [...track.querySelectorAll(":scope > li")];
  }
  assistance.classList.add("day-care-assistance-summary");
  track.classList.add("day-care-assistance-track");
  track.dataset.dayCareAssistanceTrack = "";
  track.tabIndex = 0;
  track.setAttribute("aria-label", "日間照顧可提供的協助，可左右拖曳瀏覽");

  cards.forEach((card) => {
    const title = card.querySelector("strong")?.textContent.trim() || "";
    const visual = dayCareAssistanceVisuals[title];
    const image = card.querySelector("img");
    if (visual && image) {
      image.src = visual.image;
      image.alt = visual.alt;
    }
    card.classList.add("day-care-assistance-card");
    card.dataset.dayCareAssistanceCard = "";
  });

  const controls = document.createElement("div");
  controls.className = "day-care-assistance-controls";
  controls.innerHTML = `
    <output data-day-care-assistance-status aria-live="polite">01 / ${String(cards.length).padStart(2, "0")}</output>
    <button type="button" data-day-care-assistance-previous aria-label="上一項協助" title="上一項協助"></button>
    <button type="button" data-day-care-assistance-next aria-label="下一項協助" title="下一項協助"></button>
  `;
  assistance.querySelector("h2")?.insertAdjacentElement("afterend", controls);
  bindDayCareAssistanceTrack(assistance);
  summary.dataset.dayCareHydrated = "true";
}

const dayCareLocations = {
  "wanhua-one": {
    image: "assets/location-wanhua-one-daycare-v2.jpg",
    alt: "歲悅萬華社區長照機構一館照片",
    mapLabel: "萬華一館",
    mapQuery: "臺北市萬華區康定路43號",
    type: "臺北市｜日間照顧中心",
    name: "歲悅萬華社區長照機構",
    desc: "萬華一館提供日間照顧服務，支持長輩白天生活照顧、活動參與與家庭照顧安排。",
    services: "日間照顧、生活支持、家屬諮詢",
    hours: "週一至週六 08:30-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "108 臺北市萬華區康定路43號2樓"
  },
  "wanhua-two": {
    image: "assets/location-wanhua-two-daycare-v2.jpg",
    alt: "歲悅萬華二館社區長照機構照片",
    mapLabel: "萬華二館",
    mapQuery: "臺北市萬華區成都路159號",
    type: "臺北市｜日間照顧中心",
    name: "歲悅萬華二館社區長照機構",
    desc: "萬華二館提供日間照顧服務，支持長輩白天生活照顧、活動參與與家庭照顧安排。",
    services: "日間照顧、生活支持、家屬諮詢",
    hours: "週一至週五 09:00-17:30",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "108 臺北市萬華區西門里成都路159號2樓（雅香石頭火鍋二樓）"
  }
};

function googleMapHref(location) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery || location.address)}`;
}

function googleMapEmbedHref(location) {
  return `https://www.google.com/maps?q=${encodeURIComponent(location.mapQuery || location.address)}&output=embed`;
}

export function dayCareLocationMapMarkup() {
  const location = dayCareLocations["wanhua-one"];
  return `<div class="day-care-home-map">
    <div class="map-column">
      <section class="day-care-two-site-map" aria-label="萬華一館與萬華二館地圖">
        <div class="day-care-location-tabs" aria-label="選擇日照中心">
          <button class="day-care-location-tab active" type="button" data-day-care-location="wanhua-one" aria-pressed="true">
            <strong>萬華一館</strong>
            <span>康定路 43 號 2 樓</span>
          </button>
          <button class="day-care-location-tab" type="button" data-day-care-location="wanhua-two" aria-pressed="false">
            <strong>萬華二館</strong>
            <span>成都路 159 號 2 樓</span>
          </button>
        </div>
        <div class="day-care-google-map">
          <iframe
            data-day-care-location-map-frame
            src="${googleMapEmbedHref(location)}"
            title="${location.mapLabel} Google 地圖"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
          <div class="day-care-map-summary">
            <strong data-day-care-map-label>${location.mapLabel}</strong>
            <span data-day-care-map-address>${location.address}</span>
          </div>
        </div>
      </section>
    </div>
    <aside class="location-detail day-care-location-detail" data-day-care-location-detail aria-live="polite">
      <img data-day-care-location-image src="${location.image}" alt="${location.alt}" />
      <div>
        <div class="location-meta-row"><span data-day-care-location-type>${location.type}</span></div>
        <h3 data-day-care-location-name>${location.name}</h3>
        <p data-day-care-location-desc>${location.desc}</p>
        <dl>
          <div><dt>服務</dt><dd data-day-care-location-services>${location.services}</dd></div>
          <div><dt>時間</dt><dd data-day-care-location-hours>${location.hours}</dd></div>
          <div><dt>電話</dt><dd data-day-care-location-phone>${location.phone}</dd></div>
          <div><dt>地址</dt><dd data-day-care-location-address>${location.address}</dd></div>
        </dl>
        <div class="location-actions">
          <a data-day-care-location-call href="${location.phoneHref}">撥打電話</a>
          <a data-day-care-location-map href="${googleMapHref(location)}" target="_blank" rel="noopener noreferrer">地圖導航</a>
        </div>
      </div>
    </aside>
  </div>`;
}

function updateDayCareLocation(host, key) {
  const location = dayCareLocations[key];
  if (!location) return;

  const image = host.querySelector("[data-day-care-location-image]");
  image.src = location.image;
  image.alt = location.alt;
  host.querySelector("[data-day-care-location-type]").textContent = location.type;
  host.querySelector("[data-day-care-location-name]").textContent = location.name;
  host.querySelector("[data-day-care-location-desc]").textContent = location.desc;
  host.querySelector("[data-day-care-location-services]").textContent = location.services;
  host.querySelector("[data-day-care-location-hours]").textContent = location.hours;
  host.querySelector("[data-day-care-location-phone]").textContent = location.phone;
  host.querySelector("[data-day-care-location-address]").textContent = location.address;
  host.querySelector("[data-day-care-location-call]").href = location.phoneHref;
  host.querySelector("[data-day-care-location-map]").href = googleMapHref(location);

  const mapFrame = host.querySelector("[data-day-care-location-map-frame]");
  if (mapFrame) {
    mapFrame.src = googleMapEmbedHref(location);
    mapFrame.title = `${location.mapLabel} Google 地圖`;
  }
  host.querySelector("[data-day-care-map-label]").textContent = location.mapLabel;
  host.querySelector("[data-day-care-map-address]").textContent = location.address;

  host.querySelectorAll("[data-day-care-location]").forEach((button) => {
    const active = button.dataset.dayCareLocation === key;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

export function hydrateDayCareLocation(root = document) {
  hydrateDayCareChecklistIconNodes(root);
  hydrateDayCareQuickSummary(root);
  hydrateDayCareApplicationJourney(root);
  hydrateDayCareHealthExam(root);
  const host = root.querySelector?.("[data-day-care-location-map-host]");
  if (!host || host.dataset.hydrated === "true") return;
  if (!host.querySelector("[data-day-care-location-detail]")) {
    host.innerHTML = dayCareLocationMapMarkup();
  }
  host.querySelectorAll("[data-day-care-location]").forEach((pin) => {
    pin.addEventListener("click", () => updateDayCareLocation(host, pin.dataset.dayCareLocation));
  });
  host.dataset.hydrated = "true";
}
