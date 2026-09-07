const serviceSlugs = ["home-care", "day-care", "community", "nursing", "migrant-training", "quality", "software"];

function cleanText(node) {
  return String(node?.textContent || "").replace(/\s+/g, " ").trim();
}

function firstText(root, selectors) {
  for (const selector of selectors) {
    const value = cleanText(root?.querySelector(selector));
    if (value) return value;
  }
  return "";
}

function textList(root, selector, limit = 3) {
  return [...(root?.querySelectorAll(selector) || [])].map(cleanText).filter(Boolean).slice(0, limit).join("；");
}

function targetId(node, fallback) {
  if (!node) return "";
  if (!node.id) node.id = fallback;
  node.classList.add("service-decision-target");
  return node.id;
}

function escapeText(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

/** Read the final rendered source, so CMS edits and later location hydration stay authoritative. */
export function collectServiceDecisionData(page, slug) {
  const summary = page.querySelector(".one-minute-service-summary");
  const fit = page.querySelector("#community-eligibility") || summary || page.querySelector(".service-highlight-grid")?.closest("section");
  const location = page.querySelector(".service-location-section");
  const fees = page.querySelector(".service-fee-section");
  const journey = page.querySelector(".day-care-application-journey") || page.querySelector(".service-flow-track")?.closest("section");
  const preparation = page.querySelector("#day-care-start, #service-apply-notes");
  const contact = page.querySelector("#service-contact, .service-cta-panel");
  const start = journey || preparation || contact;
  const contactTarget = targetId(contact, `${slug}-consultation`);
  const fitText = textList(fit, ".community-eligibility-grid > article > strong")
    || textList(summary, ":scope > article:first-child li > div > strong")
    || textList(fit, ".service-highlight-grid h3")
    || "先閱讀服務內容，再和窗口確認是否符合目前需求。";
  const homeAreas = [...(location?.querySelectorAll(".home-care-city-tab") || [])]
    .map((button) => `${cleanText(button.querySelector("span"))}：${cleanText(button.querySelector("strong"))}`).join("；");
  const locationText = homeAreas
    || textList(location, ".day-care-location-tab strong, .community-location-tab strong")
    || textList(location, ".service-info-grid > li > strong")
    || firstText(location, [".service-section-head > span"])
    || "此頁未列出固定服務地點，請先向窗口確認安排方式。";
  const feeText = firstText(fees, [".community-section-head > p", ".service-section-head > span"])
    || "此頁未列出固定費用，請先向窗口確認服務範圍與費用。";
  const startTitle = firstText(journey, [".day-care-application-card h3", ".service-flow-track article h3"])
    || firstText(preparation, [".service-info-grid > li > strong"])
    || "先留下聯絡方式與需求，由窗口協助確認下一步。";
  const startBody = firstText(journey, [".day-care-application-card p", ".service-flow-track article p"])
    || firstText(preparation, [".service-info-grid > li > p"]);
  const startText = startBody ? `${startTitle}：${startBody}` : startTitle;
  const cards = [
    { key: "fit", title: "適合誰？", text: fitText, target: targetId(fit, `${slug}-service-fit`) || contactTarget, action: "看服務內容與適用情境" },
    { key: "location", title: "哪裡有服務？", text: locationText, target: targetId(location, `${slug}-service-locations`) || contactTarget, action: location ? "看據點與服務範圍" : "諮詢服務安排" },
    { key: "fees", title: "費用怎麼看？", text: feeText, target: targetId(fees, `${slug}-service-fees`) || contactTarget, action: fees ? "看完整費用與條件" : "諮詢費用" },
    { key: "start", title: "如何開始？", text: startText, target: targetId(start, `${slug}-service-start`) || contactTarget, action: journey ? "看完整申請流程" : preparation ? "看申請前準備" : "直接留下需求" }
  ].filter((card) => card.target);
  const extraSections = [
    [page.querySelector("#community-service-boundary"), "服務界線與注意事項"],
    [preparation, "申請前準備"],
    [page.querySelector("#day-care-health-exam"), "體檢項目"],
    [page.querySelector(".two-minute-scenes"), "看照顧現場"],
    [contact, "直接諮詢"]
  ];
  const usedTargets = new Set(cards.map((card) => card.target));
  const links = extraSections.flatMap(([section, title], index) => {
    const target = targetId(section, `${slug}-service-detail-${index + 1}`);
    if (!target || usedTargets.has(target)) return [];
    usedTargets.add(target);
    return [{ title, target }];
  });
  return { cards, links };
}

export function renderServiceDecisionNavigation({ cards, links }) {
  return `
    <header class="service-decision-heading">
      <div><p class="eyebrow">先確認，再決定</p><h2 id="service-decision-title">先找到你在意的答案</h2></div>
      <p>點選問題，直接看完整說明；不確定是否適合，也可以先諮詢。</p>
    </header>
    <nav aria-labelledby="service-decision-title">
      <div class="service-decision-cards">
        ${cards.map((card) => `<a class="service-decision-card" href="#${escapeText(card.target)}" data-service-decision-link="${escapeText(card.key)}">
          <strong>${escapeText(card.title)}</strong><p>${escapeText(card.text)}</p><span>${escapeText(card.action)}<i aria-hidden="true">↓</i></span>
        </a>`).join("")}
      </div>
      ${links.length ? `<div class="service-decision-more">${links.map((link) => `<a href="#${escapeText(link.target)}" data-service-decision-link="detail">${escapeText(link.title)}<span aria-hidden="true"> ↓</span></a>`).join("")}</div>` : ""}
    </nav>`;
}

/** Idempotent enhancement: never replaces source sections, location choices, or form fields. */
export function hydrateServiceDecisionNavigation(root = document) {
  const page = root.querySelector?.(".one-minute-service-page, .service-template-page");
  if (!page) return;
  const slug = serviceSlugs.find((key) => page.classList.contains(`${key}-page`) || page.classList.contains(`${key}-template-page`));
  const hero = page.querySelector(":scope > .service-detail-hero");
  if (!slug || !hero) return;
  const data = collectServiceDecisionData(page, slug);
  if (!data.cards.length) return;
  const locationCard = data.cards.find((card) => card.key === "location");
  const secondary = hero.querySelector(".ghost-button, .secondary-button");
  if (locationCard && page.querySelector(".service-location-section")
      && secondary?.getAttribute("href") === "#network") {
    // Legacy CMS templates point to the hidden homepage map. Keep this service's map local.
    secondary.setAttribute("href", `#${locationCard.target}`);
    secondary.setAttribute("data-service-scroll", `#${locationCard.target}`);
  }
  const secondaryHref = secondary?.getAttribute("href") || "";
  const secondaryTarget = secondaryHref.startsWith("#") ? page.ownerDocument.getElementById(secondaryHref.slice(1)) : null;
  if (secondaryTarget && page.contains(secondaryTarget)) {
    secondary.setAttribute("data-service-decision-link", "hero-detail");
  }
  let guide = page.querySelector(":scope > .service-decision-guide");
  if (!guide) {
    guide = page.ownerDocument.createElement("section");
    guide.className = "service-decision-guide";
    guide.setAttribute("aria-labelledby", "service-decision-title");
    hero.insertAdjacentElement("afterend", guide);
  }
  const signature = JSON.stringify(data);
  if (guide.dataset.sourceSignature === signature) return;
  const focusedKey = guide.contains(page.ownerDocument.activeElement)
    ? page.ownerDocument.activeElement.getAttribute("href") : "";
  guide.innerHTML = renderServiceDecisionNavigation(data);
  guide.dataset.sourceSignature = signature;
  if (focusedKey) [...guide.querySelectorAll("a")].find((link) => link.getAttribute("href") === focusedKey)?.focus({ preventScroll: true });
}

/** Local anchors have a single handler and transfer keyboard focus without a long animated jump. */
export function handleServiceDecisionClick(event, root = document) {
  const link = event.target.closest?.("[data-service-decision-link]");
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const id = link.getAttribute("href")?.slice(1);
  const target = id ? root.querySelector(`[id="${CSS.escape(id)}"]`) : null;
  if (!target) return false;
  event.preventDefault();
  const win = target.ownerDocument.defaultView;
  const heading = target.querySelector("h2, h3") || target;
  if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  // Animated jumps can end at stale positions while content-visibility sections expand.
  // An immediate jump also respects reduced-motion settings and exposes the answer directly.
  target.scrollIntoView({ behavior: "instant", block: "start" });
  // The site routes on hashchange. replaceState keeps this an in-page jump, not a page rerender.
  win.history.replaceState(win.history.state, "", `#${id}`);
  return true;
}
