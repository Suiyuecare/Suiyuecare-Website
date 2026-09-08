(() => {
  window.__publicContentHydration = {
    directChildMutations: 0,
    initial: null
  };

  const observePrerender = () => {
    const pageView = document.querySelector("#pageView");
    if (!pageView || pageView.dataset.hydrationObserved === "true") return;
    pageView.dataset.hydrationObserved = "true";
    const root = pageView.firstElementChild;
    window.__publicContentHydration.initial = root ? {
      layout: root.dataset.publicLayout || "",
      revision: root.dataset.healthContentRevision || root.dataset.publicContentUpdatedAt || "",
      category: root.dataset.healthCategory || "",
      title: root.querySelector("h1, h2")?.textContent?.trim() || "",
      categoryPending: document.documentElement.dataset.healthCategoryPending === "true"
    } : null;
    new MutationObserver((records) => {
      window.__publicContentHydration.directChildMutations += records.filter((record) => (
        record.type === "childList" && record.target === pageView
      )).length;
    }).observe(pageView, { childList: true });
  };

  document.addEventListener("DOMContentLoaded", observePrerender, { once: true });
})();
