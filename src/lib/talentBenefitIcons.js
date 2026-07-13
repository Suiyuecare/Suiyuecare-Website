import createLucideElement from "lucide/dist/esm/createElement.mjs";
import ArrowRight from "lucide/dist/esm/icons/arrow-right.mjs";
import Backpack from "lucide/dist/esm/icons/backpack.mjs";
import BookOpenCheck from "lucide/dist/esm/icons/book-open-check.mjs";
import Check from "lucide/dist/esm/icons/check.mjs";
import CloudSun from "lucide/dist/esm/icons/cloud-sun.mjs";
import Gift from "lucide/dist/esm/icons/gift.mjs";
import HeartHandshake from "lucide/dist/esm/icons/heart-handshake.mjs";
import Rocket from "lucide/dist/esm/icons/rocket.mjs";
import ShieldCheck from "lucide/dist/esm/icons/shield-check.mjs";

const icons = {
  "arrow-right": ArrowRight,
  backpack: Backpack,
  "book-open-check": BookOpenCheck,
  check: Check,
  "cloud-sun": CloudSun,
  gift: Gift,
  "heart-handshake": HeartHandshake,
  rocket: Rocket,
  "shield-check": ShieldCheck
};

export function createTalentBenefitIcon(iconName) {
  const icon = icons[iconName];
  return icon ? createLucideElement(icon, { "aria-hidden": "true", focusable: "false", "stroke-width": 2 }) : null;
}
