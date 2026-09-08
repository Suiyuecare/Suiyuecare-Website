export function initArticleReadingNavigation() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("[data-article-anchor]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const article = link.closest(".article-page");
    const id = link.getAttribute("href")?.slice(1);
    const target = id && article?.querySelector(`#${CSS.escape(id)}`);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, true);
}
