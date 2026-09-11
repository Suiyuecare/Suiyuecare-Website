import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { parse } from "acorn";
import { parseHTML } from "linkedom";
import { homepageImageUrl, homepageImageVariants } from "../home-image-variants.mjs";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const ast = parse(source, { sourceType: "module", ecmaVersion: "latest" });
function appFunction(name) {
  const node = ast.body.find((item) => item.type === "FunctionDeclaration" && item.id.name === name);
  assert.ok(node, `Find the production ${name} function`);
  return source.slice(node.start, node.end);
}

// All URL forms occur in published CMS data. Off-site or unknown images must
// retain their source rather than be replaced with a different photograph.
for (const [original, variants] of Object.entries(homepageImageVariants)) {
  for (const [usage, variant] of Object.entries(variants)) {
    for (const url of [original, `/${original}`, `./${original}`, `https://www.suiyuecare.com/${original}`, `https://suiyuecare.com/${original}?v=1#image`]) {
      assert.equal(homepageImageUrl(url, usage), `/${variant}`, `${usage}: ${url}`);
    }
    assert.equal(homepageImageUrl(`/${variant}`, usage), `/${variant}`, "Repeated hydration is idempotent");
    const asset = fs.readFileSync(path.join(root, variant));
    assert.deepEqual(asset, fs.readFileSync(path.join(root, "public", variant)), `${variant} is also served by the public build`);
    assert.ok(asset.length < (usage === "avatar" ? 12_000 : 60_000), `${variant} stays within its display budget`);
    assert.ok(asset.length < fs.statSync(path.join(root, original)).size, `${variant} reduces download size`);
    assert.equal(asset.toString("ascii", 8, 12), "WEBP");
  }
}
for (const url of ["https://photos.example/assets/homepage-batch/10-family-consultation.png", "/assets/new-upload.jpg", "data:image/png;base64,AA==", ""]) {
  assert.equal(homepageImageUrl(url, "avatar"), url);
}

const { document } = parseHTML('<html><body><div class="brand-mark"><img src="/assets/company-logo.png"></div><div id="home"><section class="hero"><img src="/assets/hero-care-hero-fast.jpg"></section><div class="story-slider"></div><div class="celebrity-slider"></div><img class="active" src="/assets/service-journey-01-application.jpg"><img class="map-image" src="/assets/north-service-map-fast.jpg"></div><section id="detail" class="article-hero"><img src="/assets/detail-hero.jpg"></section></body></html>');
const context = vm.createContext({
  document,
  homepageImageUrl,
  ensureHomepageStoryCoverage: (stories) => stories,
  normalizePublicHref: (href) => href,
  displayAssetUrl: (url) => url,
  HOMEPAGE_MASTER_TALK_LIMIT: 8
});
const functions = ["escapeHTML", "renderCareStorySlider", "renderExpertTalkSlider", "optimizeImageLoading"];
vm.runInContext(functions.map(appFunction).join("\n"), context);
const snapshots = JSON.parse(fs.readFileSync(path.join(root, "public/cms-fallbacks.json"), "utf8"));
context.stories = snapshots.careStories.map((story) => ({
  name: story.person_name || "家屬回饋", service: story.service_type, title: story.title,
  praise: story.excerpt, avatar: story.avatar_image_url
}));
context.talks = snapshots.expertTalks.map((talk) => ({
  href: `/master-talk/${talk.slug}`, title: talk.title,
  titleLabel: talk.speaker_title, speaker: talk.speaker_name, image: talk.image_url
}));
vm.runInContext("renderCareStorySlider(stories); renderExpertTalkSlider(talks);", context);
// Check immediately after the actual CMS renderers insert markup, before the
// observer runs: setting lazy later cannot prevent an already-started request.
for (const image of document.querySelectorAll(".story-slider img, .celebrity-slider img")) {
  assert.match(image.getAttribute("src"), /^\/assets\/home-optimized\/.+\.webp$/);
  assert.equal(image.getAttribute("loading"), "lazy");
  assert.equal(image.getAttribute("decoding"), "async");
  assert.ok(image.getAttribute("alt"));
}
vm.runInContext("optimizeImageLoading(document)", context);
assert.equal(document.querySelector("#home > img.active").getAttribute("src"), "/assets/home-optimized/service-journey-01-application-card.webp", "Later CMS inserts also use the journey variant");
for (const image of document.querySelectorAll("#home img:not(.hero img)")) {
  assert.equal(image.getAttribute("loading"), "lazy", `${image.getAttribute("src")} must not become eager after hydration`);
}
for (const image of document.querySelectorAll(".brand-mark img, .hero img, .article-hero img")) {
  assert.equal(image.getAttribute("loading"), "eager");
  assert.equal(image.getAttribute("fetchpriority"), "high");
  assert.ok(!image.getAttribute("src").includes("home-optimized"), "Priority photos retain their full resolution");
}

const staticDocument = parseHTML(fs.readFileSync(path.join(root, "index.html"), "utf8")).document;
for (const image of staticDocument.querySelectorAll("#home img")) {
  assert.equal(image.getAttribute("loading"), "lazy");
  assert.equal(image.getAttribute("decoding"), "async");
}
for (const image of staticDocument.querySelectorAll(".story-slider img, .celebrity-slider img")) {
  assert.match(image.getAttribute("src"), /^\/assets\/home-optimized\/.+\.webp$/);
}
assert.equal(staticDocument.querySelector(".brand-mark img").getAttribute("loading"), "eager");

const journey = staticDocument.querySelector("[data-care-day]");
const journeyImages = [...journey.querySelectorAll("[data-care-day-image]")];
assert.equal(journeyImages.length, 16, "All sixteen journey steps retain their images");
const journeySources = journeyImages.map((image) => image.getAttribute("src"));
let journeyBytes = 0;
for (const image of journeyImages) {
  const src = image.getAttribute("src");
  assert.match(src, /^\/assets\/home-optimized\/service-journey-\d{2}-.+-card\.webp$/, "The HTML references the public asset without creating another hashed copy");
  const asset = fs.readFileSync(path.join(root, "public", src));
  assert.equal(asset.toString("ascii", 12, 16), "VP8 ");
  assert.equal(asset.readUInt16LE(26) & 0x3fff, 640);
  assert.equal(asset.readUInt16LE(28) & 0x3fff, 360, "Keep the original sixteen-to-nine framing");
  journeyBytes += asset.length;
}
assert.ok(journeyBytes < 600_000, "The entire journey stays under 600 KB even when the browser loads nearby lazy images");
const journeyContext = vm.createContext({ careDaySection: journey, activeCareDayIndex: -1 });
vm.runInContext(appFunction("setCareDayActive"), journeyContext);
for (const index of [0, 5, 15, 0]) {
  vm.runInContext(`setCareDayActive(${index})`, journeyContext);
  assert.equal(journey.querySelectorAll("[data-care-day-image].active").length, 1);
  assert.equal(journey.querySelector("[data-care-day-image].active"), journeyImages[index]);
  assert.deepEqual(journeyImages.map((image) => image.getAttribute("src")), journeySources, "Changing steps must retain the optimized URLs");
}
console.log("ok - home image variants, CMS URLs, pre-insertion lazy loading, hero priority, and all sixteen journey steps");
