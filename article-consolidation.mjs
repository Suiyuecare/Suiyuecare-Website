import { articlePublicHref, articleSourceSlug } from "./article-url-map.mjs";

// Public numbers remain reserved in ARTICLE_SOURCE_SLUGS. Only confirmed duplicate
// content is consolidated; this does not renumber articles or delete CMS records.
export const ARTICLE_CONSOLIDATIONS = Object.freeze([
  Object.freeze({ source: "day-care-transition", target: "daycare-first-week" })
]);

export function canonicalArticleSourceSlug(value = "") {
  const source = articleSourceSlug(value) || String(value || "");
  return ARTICLE_CONSOLIDATIONS.find((item) => item.source === source)?.target || source;
}

export function canonicalArticleHref(value = "", explicitNumber = null) {
  const source = articleSourceSlug(value) || articleSourceSlug(`article${explicitNumber}`) || value;
  const canonical = canonicalArticleSourceSlug(source);
  return canonical !== source ? articlePublicHref(canonical) : articlePublicHref(value, explicitNumber);
}

export function canonicalizeArticleLink(value = "") {
  const raw = String(value || "");
  const match = raw.match(/^(?:https:\/\/www\.suiyuecare\.com)?\/article\/([^/?#]+)([?#].*)?$/)
    || raw.match(/^#article-([^?#]+)(\?.*)?$/);
  if (!match) return raw;
  const href = canonicalArticleHref(match[1]);
  return href === "/health" ? raw : `${href}${match[2] || ""}`;
}

export function consolidatePublicArticles(items = []) {
  const sourceOf = (item) => articleSourceSlug(item.sourceSlug || item.slug || item.publicSlug)
    || articleSourceSlug(String(item.href || "").match(/\/article\/([^/?#]+)/)?.[1]);
  const available = new Set(items.map(sourceOf));
  return items.filter((item) => {
    const source = sourceOf(item);
    const target = canonicalArticleSourceSlug(source);
    return target === source || !available.has(target);
  });
}
