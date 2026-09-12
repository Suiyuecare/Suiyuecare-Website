import { articlePublicSlug } from "./article-url-map.mjs";

// Retain the existing analytics table's #route format so page views and events
// can be joined without introducing a second pathname-based identity.
const publicRoutes = new Set([
  "home", "about", "milestones", "home-care", "day-care", "community",
  "nursing", "migrant-training", "quality", "software", "talent", "land",
  "investor-recruiting", "health", "search", "courses", "investors",
  "ir-finance", "ir-governance", "ir-shareholders", "contact", "editorial-policy", "404"
]);

function routeFromValue(value, { rootIsHome = false } = {}) {
  // Do not decode query strings or collect user-entered form/search content.
  const route = String(value || "").trim().replace(/^#/, "").split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  if (!route) return rootIsHome ? "home" : "";
  if (publicRoutes.has(route)) return route;

  const content = route.match(/^(article|care-story|master-talk|locations|guides)[/-]([a-zA-Z0-9][a-zA-Z0-9-]{0,159})$/);
  if (!content) return "";
  const [, kind, contentSlug] = content;
  // Known source slugs and public article numbers share one reporting key.
  // Future valid CMS slugs remain distinguishable before the numbered map updates.
  const identity = kind === "article" ? articlePublicSlug(contentSlug) || contentSlug : contentSlug;
  return `${kind}-${identity}`;
}

/**
 * Return a query-free public analytics key from a browser Location-like object.
 * pageOverride accepts a route key or public path. Use the previous currentPath
 * when flushing engagement after the browser has already moved to another page.
 */
export function analyticsPagePath(locationLike = {}, pageOverride = "") {
  if (typeof pageOverride === "string" && pageOverride.trim()) {
    const explicit = routeFromValue(pageOverride, { rootIsHome: pageOverride.trim() === "/" });
    if (explicit) return `#${explicit}`;
  }

  // A recognized legacy hash is an actual route. Ordinary in-page anchors are
  // ignored, retaining the containing pretty-URL page instead.
  const hashRoute = routeFromValue(locationLike?.hash);
  if (hashRoute) return `#${hashRoute}`;
  const pathname = String(locationLike?.pathname || "/");
  const pathRoute = routeFromValue(pathname, { rootIsHome: true });
  return pathRoute ? `#${pathRoute}` : "#404";
}
