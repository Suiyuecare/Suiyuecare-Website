import assert from "node:assert/strict";
import { analyticsPagePath } from "../analytics-route.mjs";
import { ARTICLE_SOURCE_SLUGS } from "../article-url-map.mjs";

const locationFor = (path) => new URL(path, "https://www.suiyuecare.com");
const cases = [
  ["/", "#home"],
  ["/day-care", "#day-care"],
  ["/day-care/", "#day-care"],
  ["/article/article7", "#article-article7"],
  ["/article/article43", "#article-article43"],
  ["/article/daycare-first-week", "#article-article7"],
  ["/article/newly-published-cms-story", "#article-newly-published-cms-story"],
  ["/article/article999", "#article-article999"],
  ["/care-story/family-first-visit", "#care-story-family-first-visit"],
  ["/master-talk/therapist-daily-practice", "#master-talk-therapist-daily-practice"],
  ["/locations/wanhua-day-care/", "#locations-wanhua-day-care"],
  ["/guides/day-care", "#guides-day-care"],
  ["/#guides-day-care", "#guides-day-care"],
  ["/#day-care", "#day-care"],
  ["/#article-daycare-first-week", "#article-article7"],
  ["/#article-article43", "#article-article43"],
  ["/#/day-care", "#day-care"],
  ["/home-care#day-care", "#day-care"],
  ["/article/article7#references", "#article-article7"],
  ["/day-care#day-care-health-exam", "#day-care"],
  ["/#network", "#home"],
  ["/contact?name=PRIVATE_NAME&phone=PRIVATE_PHONE&message=PRIVATE_MESSAGE", "#contact"],
  ["/search?q=PRIVATE_SEARCH#results", "#search"],
  ["/#day-care?message=PRIVATE_MESSAGE", "#day-care"],
  ["/article/article7?utm_source=campaign#references", "#article-article7"],
  ["/guides/day-care?location=wanhua-day-care#eligibility", "#guides-day-care"],
  ["/unknown-page?message=PRIVATE_MESSAGE", "#404"],
  ["/admin/users/PRIVATE_ID", "#404"],
  ["/article/PRIVATE_EMAIL%40example.com", "#404"]
];

for (const [url, expected] of cases) {
  const result = analyticsPagePath(locationFor(url));
  assert.equal(result, expected, url);
  assert.ok(!/[?&=%]/.test(result), `${url}: never record query data as a route`);
  assert.ok(!result.includes("PRIVATE_"));
}

// A source slug must group with its numbered URL, including the article7/43 pair.
for (const [index, slug] of ARTICLE_SOURCE_SLUGS.entries()) {
  const expected = `#article-article${index + 1}`;
  assert.equal(analyticsPagePath(locationFor(`/article/${slug}`)), expected);
  assert.equal(analyticsPagePath(locationFor(`/#article-${slug}`)), expected);
}

// The browser URL changes before the previous page's engagement is flushed.
// Both hash navigation and pretty-URL navigation must retain the explicit old page.
for (const currentUrl of ["/day-care", "/#day-care", "/contact?name=PRIVATE_NAME"]) {
  assert.equal(analyticsPagePath(locationFor(currentUrl), "#article-daycare-first-week?utm_source=old"), "#article-article7");
  assert.equal(analyticsPagePath(locationFor(currentUrl), "/article/article43#references"), "#article-article43");
  assert.equal(analyticsPagePath(locationFor(currentUrl), "/"), "#home");
}
assert.equal(analyticsPagePath(locationFor("/article/article7"), "#references"), "#article-article7");
assert.equal(analyticsPagePath(locationFor("/article/article7"), "?message=PRIVATE_MESSAGE"), "#article-article7");
assert.equal(analyticsPagePath({ pathname: "/contact", hash: "", search: "?phone=PRIVATE_PHONE" }, "#contact?phone=PRIVATE_PHONE"), "#contact");
assert.equal(analyticsPagePath(), "#home");
assert.equal(analyticsPagePath(null), "#home");

console.log("ok - analytics pretty URLs, legacy hashes, article aliases, guides, anchors, private query exclusion, and prior-page engagement override");
