import { loadPublicContent } from "./load-public-content.mjs";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseHTML } from "linkedom";
import { prerenderPublicPages, PUBLIC_PRERENDER_SLUGS, SERVICE_PRERENDER_SLUGS } from "./prerender-public-pages.mjs";
import { normalizePublicHtmlAssets } from "./public-html-assets.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const snapshot = JSON.parse(fs.readFileSync(path.join(rootDir, "public/cms-fallbacks.json"), "utf8"));
const pages = await prerenderPublicPages(snapshot, { verifyHydration: true, articles: (await loadPublicContent()).articles });
const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();
const documentFor = (html) => parseHTML(`<!doctype html><html><body><main>${html}</main></body></html>`).document;
const assetFixture = `<img src="assets/a.jpg" data-fallback-src="assets/fallback.jpg" srcset="assets/a.jpg 1x, ./assets/b.jpg 2x" alt="A > B"><a href='assets/info.pdf'>Read</a><div style="background-image:url('assets/hero.jpg')"></div><script src="assets/example.js">const html = '<img src="assets/inside-script.jpg">';</script><script type="application/json">{"src":"assets/snapshot.jpg"}</script>`;
const normalizedAssets = normalizePublicHtmlAssets(assetFixture);
assert.ok(normalizedAssets.includes('src="/assets/a.jpg" data-fallback-src="/assets/fallback.jpg" srcset="/assets/a.jpg 1x, /assets/b.jpg 2x"'));
assert.ok(normalizedAssets.includes("href='/assets/info.pdf'"));
assert.ok(normalizedAssets.includes("url('/assets/hero.jpg')"));
assert.ok(normalizedAssets.includes('<script src="/assets/example.js">'));
assert.ok(normalizedAssets.includes(`const html = '<img src="assets/inside-script.jpg">';`), "Do not rewrite JavaScript text that looks like HTML");
assert.ok(normalizedAssets.includes('{"src":"assets/snapshot.jpg"}'), "Do not rewrite serialized CMS data");

for (const slug of PUBLIC_PRERENDER_SLUGS) {
  const { html } = pages.get(slug);
  const sourceDocument = documentFor(html);
  assert.equal(sourceDocument.querySelectorAll("h1").length, 1, `${slug}: exactly one visible page heading`);
  assert.ok(sourceDocument.querySelectorAll("h2, h3").length >= 2, `${slug}: complete page sections must exist`);
  assert.equal(sourceDocument.querySelectorAll(".service-motion:not(.in-view)").length, 0, `${slug}: page content must be visible without JavaScript`);
  for (const forbidden of ["service-decision-guide", "先找到你在意的答案", "migrant-training-projects", "PRIVATE_ROW_SHOULD_NOT_RENDER"]) {
    assert.ok(!html.includes(forbidden), `${slug}: removed/private presentation must not return`);
  }
  const builtPath = path.join(rootDir, "dist", slug, "index.html");
  assert.ok(fs.existsSync(builtPath), `Build before verification: ${builtPath}`);
  const builtDocument = parseHTML(fs.readFileSync(builtPath, "utf8")).document;
  const pageView = builtDocument.querySelector("#pageView");
  assert.ok(pageView.classList.contains("active"), `${slug}: prerendered page must be visible before JS`);
  assert.equal(pageView.dataset.prerenderedRoute, slug, `${slug}: client must recognize its prerendered route`);
  // Compare every text node across the full page, not just the title or a synthetic SEO summary.
  assert.equal(normalize(pageView.textContent), normalize(sourceDocument.querySelector("main").textContent), `${slug}: build body must match the browser renderer with the public CMS snapshot`);
  assert.equal(builtDocument.querySelector('link[rel="canonical"]').getAttribute("href"), `https://www.suiyuecare.com/${slug}`);
  assert.equal(builtDocument.querySelector("#publicPrerenderHeroStyles")?.textContent || "", pages.get(slug).inlineStyles, `${slug}: mobile hero CSS must use the same viewport mapping as the browser`);
  if (pages.get(slug).inlineStyles) {
    assert.match(pages.get(slug).inlineStyles, /@media \(max-width: 640px\)/);
    assert.match(pages.get(slug).inlineStyles, /linear-gradient\(/, `${slug}: mobile hero must retain the existing gradient`);
    for (const [, asset] of pages.get(slug).inlineStyles.matchAll(/url\("([^"]+)"\)/g)) {
      assert.ok(asset.startsWith("/assets/"), `${slug}: mobile hero assets must resolve from the site root`);
      assert.ok(fs.existsSync(path.join(rootDir, "dist", asset)), `${slug}: mobile hero variant must exist`);
    }
  }
  if (slug === "courses") assert.equal(builtDocument.querySelector("#coursePageStyles")?.getAttribute("href"), "/course-page.css", "Course layout styles must load without JavaScript");
  for (const node of pageView.querySelectorAll("[src], [href], [poster], [data-fallback-src], [srcset], [style]")) {
    for (const name of ["src", "href", "poster", "data-fallback-src"]) assert.ok(!/^(?:\.\/)?assets\//.test(node.getAttribute(name) || ""), `${slug}: ${name} assets must resolve from the site root`);
    assert.ok(!/(?:^|,\s*)(?:\.\/)?assets\//.test(node.getAttribute("srcset") || ""), `${slug}: srcset assets must resolve from the site root`);
    assert.ok(!/url\(['"]?(?:\.\/)?assets\//.test(node.getAttribute("style") || ""), `${slug}: background assets must resolve from the site root`);
  }
  for (const anchor of pageView.querySelectorAll("a[href]")) {
    const target = anchor.getAttribute("href");
    assert.ok(!/^#(?:home|about|home-care|day-care|community|nursing|migrant-training|quality|software|health|contact|courses|talent|land|investor-recruiting|investors|ir-finance|ir-governance|ir-shareholders)$/.test(target), `${slug}: cross-page links must use crawlable paths: ${target}`);
  }
}

for (const slug of SERVICE_PRERENDER_SLUGS) {
  const document = documentFor(pages.get(slug).html);
  assert.equal(document.querySelectorAll(".service-contact-section form").length, 1, `${slug}: retain the actual service inquiry form once`);
  assert.ok(document.querySelector(".two-minute-scene-grid img"), `${slug}: retain actual care scenes`);
  assert.ok(document.querySelector(".service-fee-section"), `${slug}: retain actual pricing information`);
  assert.ok(!document.querySelector(".fee-code-loading"), `${slug}: include fee and location content rather than a loading label`);
}
assert.match(pages.get("day-care").html, /血液生化檢查/);
assert.match(pages.get("home-care").html, /士林区|士林區/);
assert.match(pages.get("community").html, /不提供生活照顧或持續看視/);

// A CMS edit must replace fallback copy; disabled service fields and draft records stay unpublished.
const fixture = structuredClone(snapshot);
fixture.serviceFields = fixture.serviceFields.filter((field) => !(field.page_slug === "home-care" && ["hero_title", "hero_body"].includes(field.field_key)));
fixture.serviceFields.push(
  { page_slug: "home-care", field_key: "hero_title", field_type: "text", text_value: "公開服務測試標題", is_enabled: true },
  { page_slug: "home-care", field_key: "hero_body", field_type: "text", text_value: "CMS <script>must stay text</script> & content", is_enabled: true },
  { page_slug: "home-care", field_key: "hero_title", field_type: "text", text_value: "PRIVATE_ROW_SHOULD_NOT_RENDER", is_enabled: false }
);
fixture.courses.push({ ...fixture.courses[0], id: "private-test-course", title: "PRIVATE_ROW_SHOULD_NOT_RENDER", status: "draft" });
fixture.recruitingOpenings.push({ ...fixture.recruitingOpenings[0], id: "private-test-opening", title: "PRIVATE_ROW_SHOULD_NOT_RENDER", status: "draft" });
const changed = await prerenderPublicPages(fixture);
const changedHome = documentFor(changed.get("home-care").html);
assert.equal(changedHome.querySelector("h1").textContent, "公開服務測試標題");
assert.ok(changedHome.body.textContent.includes("CMS <script>must stay text</script> & content"));
assert.equal(changedHome.querySelectorAll("script").length, 0);
for (const { html } of changed.values()) assert.ok(!html.includes("PRIVATE_ROW_SHOULD_NOT_RENDER"));

const customHeroFixture = structuredClone(snapshot);
customHeroFixture.serviceFields = customHeroFixture.serviceFields.filter((field) => !(field.page_slug === "home-care" && field.field_key === "hero_image"));
customHeroFixture.serviceFields.push({ page_slug: "home-care", field_key: "hero_image", field_type: "image", text_value: "https://example.test/custom-cms-hero.jpg", is_enabled: true });
const customHero = (await prerenderPublicPages(customHeroFixture)).get("home-care");
assert.equal(customHero.inlineStyles, "", "A new CMS hero without a known mobile variant must keep its own image");
assert.match(customHero.html, /https:\/\/example\.test\/custom-cms-hero\.jpg/);
assert.ok(!customHero.html.includes("data-public-mobile-hero"), "A CMS custom image must not inherit a route's default mobile override");
const editorialDocument = parseHTML(fs.readFileSync(path.join(rootDir, "dist/editorial-policy/index.html"), "utf8")).document;
assert.equal(editorialDocument.querySelector("#heroPreload"), null, "The text-only editorial policy must not preload a homepage hero");

console.log(`PASS: ${pages.size} complete public pages match browser/CMS content; seven service pages survive hydration without duplicate controls; drafts and disabled fields stay excluded.`);
