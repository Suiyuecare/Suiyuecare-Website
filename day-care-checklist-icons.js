import {
  Backpack,
  Bed,
  Brush,
  CupSoda,
  MapPinned,
  Package,
  PillBottle,
  Shirt,
  ShowerHead,
  Stethoscope,
  Toilet,
  createElement as createLucideElement
} from "lucide";

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
