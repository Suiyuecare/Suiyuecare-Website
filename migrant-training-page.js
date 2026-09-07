import { renderMigrantTrainingPortfolio } from "./migrant-training-portfolio.mjs";
import { migrantTrainingPrograms } from "./migrant-training-programs.mjs";
import "./migrant-training-portfolio.css";

/** Append curated public program data without replacing CMS content or a user's form. */
export function hydrateMigrantTrainingPortfolio(root = document) {
  const page = root.querySelector?.(".migrant-training-page, .migrant-training-template-page");
  if (!page || page.querySelector("#migrant-training-projects")) return;
  const hero = page.querySelector(":scope > .service-detail-hero");
  if (!hero) return;
  const anchor = page.querySelector(":scope > .service-decision-guide") || hero;
  anchor.insertAdjacentHTML("afterend", renderMigrantTrainingPortfolio(migrantTrainingPrograms));

  const secondary = hero.querySelector(".ghost-button, .secondary-button");
  if (secondary) {
    secondary.textContent = "查看計畫與實績";
    secondary.setAttribute("href", "#migrant-training-projects");
    secondary.setAttribute("data-service-scroll", "#migrant-training-projects");
    secondary.setAttribute("data-service-decision-link", "hero-detail");
  }

  // Keep explanatory service illustrations separate from documentary evidence.
  const scenes = page.querySelector(".two-minute-scenes");
  scenes?.setAttribute("aria-label", "移工訓練內容與情境說明");
  const heading = scenes?.querySelector("h2");
  if (heading) heading.textContent = "訓練內容與情境說明";
  if (scenes && !scenes.querySelector(".migrant-scene-note")) {
    const note = page.ownerDocument.createElement("p");
    note.className = "migrant-scene-note";
    note.textContent = "以下圖片用於說明訓練主題；實際活動照片與年度紀錄請見上方「訓練實績與執行計畫」。";
    scenes.querySelector(".service-section-head")?.insertAdjacentElement("afterend", note);
  }
}
