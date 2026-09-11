import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPublicServiceLocations, getServiceLocationByRoute, serviceLocationRoutes, serviceLocationSchema, renderServiceLocationPage, renderServiceLocationLinks } from "../public-service-locations.mjs";
import { publicStructuredDataObject } from "../public-route-structured-data.mjs";

const snapshot = JSON.parse(fs.readFileSync("public/cms-fallbacks.json", "utf8"));
const locations = getPublicServiceLocations(snapshot);
assert.equal(locations.length, 6, "six published location/service pages are expected");
assert(!locations.some((item) => /wanhua-two|wanhua-b/.test(item.id)), "planning centre must not be presented as operating");
assert.deepEqual(getPublicServiceLocations({ homeModules: [] }), [], "missing published records cannot silently republish locations");
const disabled = structuredClone(snapshot);
disabled.homeModules.find((item) => item.item_key === "wanhua-a" && item.module_key === "location").is_enabled = false;
assert(!getPublicServiceLocations(disabled).some((item) => item.kind === "day-care"));
const planning = structuredClone(snapshot);
planning.homeModules.find((item) => item.item_key === "wanhua-a" && item.module_key === "location").badge_label = "籌設中";
assert(!getPublicServiceLocations(planning).some((item) => item.kind === "day-care"));
assert.equal(getServiceLocationByRoute("locations-does-not-exist"), null);
const disabledCommunity = structuredClone(snapshot);
disabledCommunity.homeModules.find((item) => item.module_key === "location" && item.item_key === "datong").is_enabled = false;
const filtered = getPublicServiceLocations(disabledCommunity);
assert.equal(getServiceLocationByRoute("locations-datong-dementia", filtered), null);
assert(!renderServiceLocationLinks("community", filtered).includes("/locations/datong-dementia"));
assert(!serviceLocationRoutes(disabledCommunity).find((route) => route.path === "/locations/shilin-dementia").prerenderedHtml.includes("href=\"/locations/datong-dementia\""));
const subtitlePlanning = structuredClone(snapshot);
subtitlePlanning.homeModules.find((item) => item.module_key === "location" && item.item_key === "datong").subtitle = "籌設中";
assert(!getPublicServiceLocations(subtitlePlanning).some((item) => item.id === "datong-dementia"));

for (const route of serviceLocationRoutes(snapshot)) {
  const location = route.location;
  assert.equal(getServiceLocationByRoute(route.slug).path, route.path);
  const html = renderServiceLocationPage(location);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route.path}: one page heading`);
  assert(html.includes(location.phoneHref), `${route.path}: usable telephone link`);
  assert(html.includes(`/contact?location=${location.id}`), `${route.path}: contextual consultation`);
  assert(html.includes(`href="${location.parentPath}"`), `${route.path}: parent service link`);
  const entity = serviceLocationSchema(location);
  if (location.kind === "home-care") {
    assert.equal(entity["@type"], "Service");
    assert.equal(entity.areaServed.length, 3);
    assert(!entity.address, "home service areas must not become fictional storefronts");
  } else {
    assert.equal(entity["@type"], "LocalBusiness");
    assert.equal(entity.address.streetAddress, location.streetAddress);
    assert(html.includes(location.address));
    if (location.kind === "community") assert(!entity.openingHoursSpecification, "office hours are not course schedules");
  }
  const graph = publicStructuredDataObject(route)["@graph"];
  assert(graph.some((node) => node["@id"] === entity["@id"]), `${route.path}: specific service entity in JSON-LD`);
  assert.equal(graph.find((node) => node["@type"] === "WebPage").mainEntity["@id"], entity["@id"]);
  const builtPath = path.join("dist", route.path, "index.html");
  assert(fs.existsSync(builtPath), `${route.path}: generated page`);
  const built = fs.readFileSync(builtPath, "utf8");
  assert(built.includes(`href="https://www.suiyuecare.com${route.path}"`), `${route.path}: canonical`);
  assert(built.includes(`data-public-service-location="${location.id}"`), `${route.path}: static body`);
  assert(fs.readFileSync("dist/sitemap.xml", "utf8").includes(`<loc>https://www.suiyuecare.com${route.path}</loc>`));
}

for (const kind of ["home-care", "day-care", "community"]) {
  const built = fs.readFileSync(`dist/${kind}/index.html`, "utf8");
  for (const location of locations.filter((item) => item.kind === kind)) assert(built.includes(`href="${location.path}"`), `${kind} must link to ${location.path} without JavaScript`);
}
console.log("ok - six published location pages, metadata, real addresses/service areas, planning exclusions and crawlable parent links");
