// Serialized service HTML contains the same content and controls as the hydrated page.
// Event handlers are browser-only, so reset the presentation modules' binding guards once.
export function preparePrerenderedService(root) {
  const page = root?.querySelector?.("[data-public-service-prerendered]");
  if (!page) return;
  page.removeAttribute("data-public-service-prerendered");
  for (const node of [page, ...page.querySelectorAll("*")]) {
    for (const attribute of [...node.attributes]) {
      if (/^data-(?:.*-)?(?:hydrated|bound|loaded)$/.test(attribute.name)) node.removeAttribute(attribute.name);
    }
  }
  // Day/home summary renderers insert these controls; their normal bind step recreates them.
  for (const control of page.querySelectorAll(".day-care-assistance-controls")) control.remove();
}

export function replacePublicPageContent(root, html, { preserveInput = false } = {}) {
  const document = root.ownerDocument;
  const focused = preserveInput ? document?.activeElement : null;
  const retained = preserveInput
    ? [".service-contact-section form", ".recruiting-apply-modal", ".course-search"]
      .map((selector) => ({ selector, node: root.querySelector(selector) }))
      .filter(({ node }) => node)
    : [];
  let selection;
  if (focused && retained.some(({ node }) => node.contains(focused))) {
    try { selection = [focused.selectionStart, focused.selectionEnd, focused.selectionDirection]; } catch {}
  }
  root.innerHTML = html;
  for (const { selector, node } of retained) root.querySelector(selector)?.replaceWith(node);
  if (focused && root.contains(focused)) {
    focused.focus({ preventScroll: true });
    if (selection && typeof focused.setSelectionRange === "function" && selection[0] !== null) {
      try { focused.setSelectionRange(...selection); } catch {}
    }
  }
}
