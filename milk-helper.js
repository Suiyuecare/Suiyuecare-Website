import {
  ArrowRight,
  BookOpenCheck,
  Handshake,
  HeartHandshake,
  X,
  createElement as createLucideElement
} from "lucide";

const helperIcons = {
  arrow: ArrowRight,
  care: HeartHandshake,
  close: X,
  courses: BookOpenCheck,
  partnership: Handshake
};

function hydrateHelperIcons(root) {
  root.querySelectorAll("[data-milk-helper-icon]").forEach((host) => {
    const icon = helperIcons[host.dataset.milkHelperIcon];
    if (!icon) return;
    host.replaceChildren(createLucideElement(icon, {
      "aria-hidden": "true",
      focusable: "false",
      stroke: "currentColor",
      "stroke-width": 2.2
    }));
  });
}

function pushHelperAnalytics(action) {
  if (!Array.isArray(window.dataLayer)) return;
  window.dataLayer.push({
    event: "milk_helper_interaction",
    milk_helper_action: action
  });
}

export function initMilkHelper() {
  const root = document.querySelector("[data-milk-helper]");
  const trigger = root?.querySelector("[data-milk-helper-trigger]");
  const dialog = root?.querySelector("#milkHelperDialog");
  const closeButton = root?.querySelector("[data-milk-helper-close]");
  if (!root || !trigger || !dialog || !closeButton) return;

  hydrateHelperIcons(root);
  let returnFocus = null;

  const closeDialog = ({ restoreFocus = true } = {}) => {
    if (dialog.hidden) return;
    dialog.hidden = true;
    root.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "開啟快速幫手");
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  };

  const openDialog = () => {
    if (!dialog.hidden) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
    dialog.hidden = false;
    root.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "關閉快速幫手");
    dialog.querySelector("a")?.focus();
    pushHelperAnalytics("open");
  };

  trigger.addEventListener("click", () => {
    if (dialog.hidden) {
      openDialog();
    } else {
      closeDialog();
    }
  });

  closeButton.addEventListener("click", () => closeDialog());

  root.querySelectorAll("[data-milk-helper-choice]").forEach((choice) => {
    choice.addEventListener("click", () => {
      pushHelperAnalytics(choice.dataset.milkHelperChoice || "unknown");
      closeDialog({ restoreFocus: false });
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (dialog.hidden || root.contains(event.target)) return;
    closeDialog({ restoreFocus: false });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || dialog.hidden) return;
    event.preventDefault();
    closeDialog();
  });
}
