import assert from "node:assert/strict";
import fs from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.QA_ORIGIN || "http://localhost:4183";
const output = new URL("../output/ux-345/article-reading/", import.meta.url).pathname;
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  for (const width of [375, 390, 430, 760, 900, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${origin}/article/article145`, { waitUntil: "networkidle" });
    await page.locator(".article-toc").waitFor();
    const layout = await page.evaluate(() => {
      const hero = document.querySelector(".article-hero");
      const title = hero.querySelector("h1").getBoundingClientRect();
      const photo = hero.querySelector("img").getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth > innerWidth, titleAbovePhoto: title.bottom < photo.top, weight: getComputedStyle(document.querySelector(".article-body p")).fontWeight, tocOpen: document.querySelector(".article-toc").open, references: document.querySelectorAll(".article-references li").length, helper: getComputedStyle(document.querySelector(".milk-helper")).position };
    });
    assert.equal(layout.overflow, false);
    assert.equal(layout.titleAbovePhoto, true);
    assert.equal(layout.weight, "400");
    assert.equal(layout.tocOpen, false);
    assert.equal(layout.references, 5);
    assert.equal(layout.helper, "relative");
    await page.screenshot({ path: `${output}article145-${width}-hero.png` });
    await page.locator(".article-toc summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".article-toc").getAttribute("open"), "");
    const tocLinks = page.locator(".article-toc a");
    assert.equal(await tocLinks.count(), 10);
    for (const index of [0, 6, 7, 8, 9]) {
      const link = tocLinks.nth(index);
      const id = (await link.getAttribute("href")).slice(1);
      await link.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(id => document.activeElement.id === id && document.activeElement.getBoundingClientRect().top >= 70 && document.activeElement.getBoundingClientRect().top < 300, id);
      assert.equal(new URL(page.url()).pathname, "/article/article145");
    }
    const faq = page.locator(".article-faq details").first();
    await faq.locator("summary").click();
    assert.equal(await faq.getAttribute("open"), "");
    for (const img of await page.locator(".article-inline-image img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(image => image.decode());
      assert.ok(await img.getAttribute("alt"));
    }
    assert.equal(await page.locator(".article-inline-image img").count(), 3);
    assert.ok(await page.locator(".article-table-wrap").evaluate(el => {
      if (el.scrollWidth <= el.clientWidth) return true;
      el.scrollLeft = 120;
      return el.scrollLeft > 0;
    }), "wide tables must scroll within their container");
    await page.locator(".article-summary").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}article145-${width}-reading.png` });
    await page.locator("[data-milk-helper-trigger]").click();
    assert.equal(await page.locator("#milkHelperDialog").isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#milkHelperDialog").isVisible(), false);
    assert.ok(await page.locator("[data-milk-helper-trigger]").evaluate(el => el === document.activeElement));
    assert.deepEqual(errors, []);
    results.push({ width, ...layout, outlineKeyboard: true, faq: true, images: true, errors });
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: "reduce" });
  for (const route of ["/article/article89", "/article/article119", "/article/article146", "/care-story/huang-migrant-training-family", "/master-talk/nutrition-therapist-lin-soft-food"]) {
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    await page.locator(".article-reading-heading h1").waitFor();
    assert.equal(await page.locator(".page.active h1").count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, route);
    assert.ok(await page.locator(".article-hero img").evaluate(el => el.complete && el.naturalWidth > 0));
    results.push({ route, legacyTemplate: true });
  }
  await page.goto(`${origin}/article/article145#reading-section-9`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".article-reading-heading h1").count(), 1);
  assert.ok(await page.locator("#reading-section-9").count());
  await fs.writeFile(`${output}results.json`, JSON.stringify(results, null, 2));
  console.log("PASS article reading: 6 widths, keyboard outline, image/FAQ/table preservation, low-distraction helper, legacy and rich templates, direct fragment URL");
} finally {
  await browser.close();
}
