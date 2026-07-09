import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.resolve(root, "dist");
const siteOrigin = "https://www.suiyuecare.com";
const expectedNavigation = [
  ["關於歲悅", "/about"],
  ["居家照顧", "/home-care"],
  ["日間照顧", "/day-care"],
  ["社區據點", "/community"],
  ["健康3.0", "/health"],
  ["課程報名", "/courses"],
  ["人才招募", "/talent"],
  ["聯絡我們", "/contact"]
];

function read(file) {
  return fs.readFileSync(path.resolve(root, file), "utf8");
}

function uniq(values) {
  return [...new Set(values)].sort();
}

function parsePublicRoutePaths() {
  const source = read("scripts/generate-static-routes.mjs");
  const match = source.match(/const\s+publicRoutePaths\s*=\s*new Map\(\[([\s\S]*?)\]\);/);
  if (!match) throw new Error("Missing publicRoutePaths map.");
  return uniq([...match[1].matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)].map((item) => item[1]));
}

function routePath(slug) {
  return slug === "home" ? "/" : `/${slug}`;
}

function routeHtmlPath(slug) {
  return slug === "home" ? path.join(distDir, "index.html") : path.join(distDir, slug, "index.html");
}

function extractStructuredData(html, route) {
  const match = html.match(/<script id="structuredData" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`${route}: missing #structuredData JSON-LD script.`);
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`${route}: structured data is not valid JSON: ${error.message}`);
  }
}

function graphNodes(data) {
  if (!data || data["@context"] !== "https://schema.org") return [];
  if (Array.isArray(data["@graph"])) return data["@graph"];
  return [data];
}

function hasType(node, type) {
  const value = node?.["@type"];
  return Array.isArray(value) ? value.includes(type) : value === type;
}

function nodeTypes(node) {
  const value = node?.["@type"];
  return Array.isArray(value) ? value : value ? [value] : [];
}

function absoluteUrl(value) {
  return `${siteOrigin}${value}`;
}

const failures = [];
const slugs = parsePublicRoutePaths();

for (const slug of slugs) {
  const htmlFile = routeHtmlPath(slug);
  if (!fs.existsSync(htmlFile)) {
    failures.push(`${slug}: missing built HTML at ${path.relative(root, htmlFile)}`);
    continue;
  }

  const html = fs.readFileSync(htmlFile, "utf8");
  const data = extractStructuredData(html, slug);
  const graph = graphNodes(data);
  const currentPath = routePath(slug);
  const canonical = absoluteUrl(currentPath);
  const organization = graph.find((node) => hasType(node, "Organization") && hasType(node, "LocalBusiness"));
  const website = graph.find((node) => hasType(node, "WebSite"));
  const webpage = graph.find((node) => hasType(node, "WebPage"));
  const navigation = graph.find((node) => hasType(node, "ItemList") && node["@id"] === `${siteOrigin}/#site-navigation`);
  const breadcrumb = graph.find((node) => hasType(node, "BreadcrumbList"));

  if (!organization) {
    failures.push(`${slug}: missing Organization + LocalBusiness node.`);
  } else {
    if (organization["@id"] !== `${siteOrigin}/#organization`) failures.push(`${slug}: organization @id should use www canonical origin.`);
    if (organization.url !== `${siteOrigin}/`) failures.push(`${slug}: organization url should be ${siteOrigin}/.`);
    if (!organization.logo?.startsWith(`${siteOrigin}/assets/`)) failures.push(`${slug}: organization logo should use absolute www asset URL.`);
    if (!organization.telephone || !organization.email) failures.push(`${slug}: organization should expose phone and email for local search.`);
  }

  if (!website) {
    failures.push(`${slug}: missing WebSite node.`);
  } else if (website.url !== `${siteOrigin}/` || website.publisher?.["@id"] !== `${siteOrigin}/#organization`) {
    failures.push(`${slug}: WebSite node should point to canonical site and organization publisher.`);
  }

  if (!webpage) {
    failures.push(`${slug}: missing WebPage node.`);
  } else {
    if (webpage.url !== canonical) failures.push(`${slug}: WebPage url should be ${canonical}, received ${webpage.url || "(missing)"}.`);
    if (webpage.isPartOf?.["@id"] !== `${siteOrigin}/#website`) failures.push(`${slug}: WebPage should be part of the WebSite node.`);
    if (webpage.about?.["@id"] !== `${siteOrigin}/#organization`) failures.push(`${slug}: WebPage should reference the organization.`);
    if (!webpage.primaryImageOfPage?.url?.startsWith(`${siteOrigin}/assets/`)) failures.push(`${slug}: WebPage should include an absolute primaryImageOfPage asset.`);
  }

  if (!navigation) {
    failures.push(`${slug}: missing site navigation ItemList.`);
  } else {
    const items = Array.isArray(navigation.itemListElement) ? navigation.itemListElement : [];
    const missingNav = expectedNavigation.filter(([name, href]) => !items.some((item) =>
      hasType(item, "SiteNavigationElement") &&
      item.name === name &&
      item.url === absoluteUrl(href)
    ));
    for (const [name, href] of missingNav) {
      failures.push(`${slug}: site navigation is missing ${name} (${href}).`);
    }
  }

  if (slug === "home") {
    if (breadcrumb) failures.push("home: homepage should not need a BreadcrumbList node.");
  } else if (!breadcrumb) {
    failures.push(`${slug}: missing BreadcrumbList node.`);
  } else {
    const items = Array.isArray(breadcrumb.itemListElement) ? breadcrumb.itemListElement : [];
    const homeCrumb = items.find((item) => item.position === 1);
    const pageCrumb = items.find((item) => item.position === 2);
    if (homeCrumb?.item !== `${siteOrigin}/` || homeCrumb?.name !== "首頁") failures.push(`${slug}: breadcrumb should start at homepage.`);
    if (pageCrumb?.item !== canonical) failures.push(`${slug}: breadcrumb final item should be ${canonical}.`);
  }

  for (const node of graph) {
    const types = nodeTypes(node).join(", ");
    if ("aggregateRating" in node) failures.push(`${slug}: ${types || "node"} must not self-declare aggregateRating for Google reviews.`);
    if ("review" in node || "reviews" in node) failures.push(`${slug}: ${types || "node"} must not self-declare reviews for Google rich results.`);
  }
}

if (failures.length) {
  console.error("SEO verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`ok - verified structured SEO data in ${slugs.length} public route shells`);
