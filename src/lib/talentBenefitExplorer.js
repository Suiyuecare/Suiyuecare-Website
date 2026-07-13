import { createTalentBenefitIcon } from "./talentBenefitIcons.js";

export function hydrateTalentBenefitIcons(root = document) {
  root.querySelectorAll("[data-benefit-explorer] [data-lucide]").forEach((placeholder) => {
    const svg = createTalentBenefitIcon(placeholder.dataset.lucide);
    if (svg) placeholder.replaceWith(svg);
  });
}

export function selectTalentBenefitStation(explorer, stationKey, options = {}) {
  if (!explorer) return;
  const stations = [...explorer.querySelectorAll("[data-benefit-station]")];
  const target = stations.find((station) => station.dataset.benefitStation === stationKey) || stations[0];
  if (!target) return;

  const explored = new Set((explorer.dataset.benefitExplored || "").split(",").filter(Boolean));
  if (target.dataset.benefitCountable === "true") explored.add(target.dataset.benefitStation);
  explorer.dataset.benefitExplored = [...explored].join(",");

  stations.forEach((station) => {
    const isActive = station === target;
    station.classList.toggle("is-active", isActive);
    station.classList.toggle("is-explored", explored.has(station.dataset.benefitStation));
    station.setAttribute("aria-selected", isActive ? "true" : "false");
    station.tabIndex = isActive ? 0 : -1;
  });
  explorer.querySelectorAll("[data-benefit-station-panel]").forEach((panel) => {
    const isActive = panel.dataset.benefitStationPanel === target.dataset.benefitStation;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  if (options.focus) target.focus({ preventScroll: true });
}
