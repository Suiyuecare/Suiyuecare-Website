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

  const exploredStations = stations.filter((station) => station.dataset.benefitCountable === "true" && explored.has(station.dataset.benefitStation));
  const totalStations = stations.filter((station) => station.dataset.benefitCountable === "true").length;
  const progressCount = explorer.querySelector("[data-benefit-progress-count]");
  if (progressCount) progressCount.textContent = String(exploredStations.length);

  const exploredList = explorer.querySelector("[data-benefit-explored-list]");
  if (exploredList) {
    const names = exploredStations.map((station) => station.querySelector("b")?.textContent?.trim()).filter(Boolean);
    exploredList.textContent = names.length === totalStations
      ? "六站探索完成。去看看適合你的職位。"
      : names.length
        ? `已探索：${names.join("、")}。再選幾站看看更多支持。`
        : "再選幾站，看看更多支持。";
  }
  if (options.focus) target.focus({ preventScroll: true });
}
