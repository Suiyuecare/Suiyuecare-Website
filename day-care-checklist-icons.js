import Backpack from "lucide/dist/esm/icons/backpack.mjs";
import Bed from "lucide/dist/esm/icons/bed.mjs";
import Brush from "lucide/dist/esm/icons/brush.mjs";
import CupSoda from "lucide/dist/esm/icons/cup-soda.mjs";
import MapPinned from "lucide/dist/esm/icons/map-pinned.mjs";
import Package from "lucide/dist/esm/icons/package.mjs";
import PillBottle from "lucide/dist/esm/icons/pill-bottle.mjs";
import Shirt from "lucide/dist/esm/icons/shirt.mjs";
import ShowerHead from "lucide/dist/esm/icons/shower-head.mjs";
import Stethoscope from "lucide/dist/esm/icons/stethoscope.mjs";
import Toilet from "lucide/dist/esm/icons/toilet.mjs";
import createLucideElement from "lucide/dist/esm/createElement.mjs";

const checklistIcons = {
  backpack: Backpack,
  bed: Bed,
  brush: Brush,
  "cup-soda": CupSoda,
  "map-pinned": MapPinned,
  package: Package,
  "pill-bottle": PillBottle,
  shirt: Shirt,
  "shower-head": ShowerHead,
  stethoscope: Stethoscope,
  toilet: Toilet
};

const checklistIconRules = [
  { keywords: ["衛生紙", "濕紙巾"], icon: "toilet" },
  { keywords: ["個人物品"], icon: "backpack" },
  { keywords: ["保溫瓶"], icon: "cup-soda" },
  { keywords: ["牙刷", "牙膏", "盥洗"], icon: "brush" },
  { keywords: ["棉被", "薄毯"], icon: "bed" },
  { keywords: ["替換衣物", "衣物"], icon: "shirt" },
  { keywords: ["沐浴"], icon: "shower-head" },
  { keywords: ["藥盒", "用藥", "服藥"], icon: "pill-bottle" },
  { keywords: ["體檢"], icon: "stethoscope" },
  { keywords: ["參觀", "試上一日"], icon: "map-pinned" }
];

function checklistIconName(host) {
  const text = host.closest("li")?.textContent || "";
  return checklistIconRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)))?.icon || "package";
}

export function hydrateDayCareChecklistIconNodes(root = document) {
  const hosts = root?.querySelectorAll?.("[data-day-care-checklist-icon]") || [];
  hosts.forEach((host) => {
    if (host.dataset.iconHydrated === "true") return;
    const icon = checklistIcons[checklistIconName(host)] || Package;
    const svg = createLucideElement(icon, {
      class: "service-info-lucide-icon",
      "aria-hidden": "true",
      focusable: "false"
    });
    host.replaceChildren(svg);
    host.dataset.iconHydrated = "true";
  });
}
