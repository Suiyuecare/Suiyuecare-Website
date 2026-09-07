import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
// Uses an existing Playwright installation; no service or form submission is performed.
// PLAYWRIGHT_MODULE may point to a workspace-provided Playwright ESM entry point.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origin = process.env.QA_ORIGIN || 'http://localhost:4183';
const blockCms = process.env.QA_BLOCK_CMS === '1';
const output = new URL(`../output/ux-345/service-decision${blockCms ? '-fallback' : ''}/`, import.meta.url).pathname;
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: process.env.QA_MOTION || 'reduce' });
    if (blockCms) await context.route('**/*.supabase.co/rest/v1/**', route => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const slug of ['home-care', 'day-care', 'community', 'nursing', 'migrant-training', 'quality', 'software']) {
      await page.goto(`${origin}/${slug}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.service-decision-card');
      if (slug === 'home-care') await page.waitForSelector('[data-home-care-location-map-host][data-hydrated="true"]');
      if (slug === 'day-care') await page.waitForSelector('[data-day-care-health-exam-host][data-hydrated="true"]');
      if (slug === 'community') await page.waitForSelector('.community-page[data-community-hero-hydrated="true"]');
      await page.waitForTimeout(250);
      const baseline = await page.evaluate(() => {
        const content = document.querySelector('.one-minute-service-page');
        const guide = content.querySelector('.service-decision-guide');
        const feeSection = content.querySelector('.service-fee-section');
        const scenes = content.querySelector('.two-minute-scenes');
        const cards = [...guide.querySelectorAll('.service-decision-card')];
        return {
          cards: cards.length,
          guideCount: content.querySelectorAll('.service-decision-guide').length,
          formCount: content.querySelectorAll('.contact-form').length,
          guideAfterHero: guide.previousElementSibling.classList.contains('service-detail-hero'),
          allTargets: [...guide.querySelectorAll('a')].every(link => document.getElementById(link.hash.slice(1))),
          targetIds: cards.map(card => card.hash.slice(1)),
          text: cards.map(card => card.innerText),
          feesBeforeScenes: Boolean(feeSection.compareDocumentPosition(scenes) & Node.DOCUMENT_POSITION_FOLLOWING),
          overflow: document.documentElement.scrollWidth > innerWidth + 1
        };
      });
      assert.equal(baseline.cards, 4, `${slug}: four questions`);
      assert.equal(baseline.guideCount, 1);
      assert.equal(baseline.formCount, 1);
      assert.ok(baseline.guideAfterHero && baseline.allTargets && baseline.feesBeforeScenes);
      assert.ok(!baseline.overflow, `${slug}: no overflow at ${width}`);
      if (['home-care', 'day-care'].includes(slug)) {
        const locationButton = page.locator('.one-minute-service-hero .ghost-button');
        const locationId = await page.locator('.service-location-section').getAttribute('id');
        assert.equal(await locationButton.getAttribute('href'), `#${locationId}`);
        await locationButton.click();
        await page.waitForFunction(id => {
          const y = document.getElementById(id).getBoundingClientRect().top;
          return y >= 70 && y < 200;
        }, locationId);
        const areaPosition = await page.locator(`#${locationId}`).boundingBox();
        assert.ok(areaPosition.y >= 70 && areaPosition.y < 200, 'Hero points to the local service map');
      }
      await page.locator('.service-decision-guide').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}${slug}-${width}-guide.png` });
      for (const key of ['fit', 'location', 'fees', 'start']) {
        const link = page.locator(`[data-service-decision-link="${key}"]`);
        await link.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(120);
        const position = await page.evaluate(() => {
          const target = document.getElementById(location.hash.slice(1));
          return { headerBottom: document.querySelector('.site-header').getBoundingClientRect().bottom, targetTop: target.getBoundingClientRect().top, focused: target.contains(document.activeElement), guideCount: document.querySelectorAll('.service-decision-guide').length };
        });
        assert.ok(position.focused, `${slug} ${key}: focus transferred`);
        assert.ok(position.targetTop >= position.headerBottom - 1, `${slug} ${key}: heading below sticky header (${JSON.stringify(position)})`);
        assert.equal(position.guideCount, 1);
      }
      // Source changes should update only the guide, never replace an in-progress form.
      await page.evaluate(() => {
        const field = document.querySelector('.service-contact-section input[name="姓名"]');
        field.value = '本機驗證，未送出';
        window.__serviceTestField = field;
        const feeCopy = document.querySelector('.service-fee-section .service-section-head > span, .service-fee-section .community-section-head > p');
        window.__serviceTestCopy = { node: feeCopy, text: feeCopy.textContent };
        feeCopy.textContent = '本機驗證用摘要；不變更原始資料。';
      });
      await page.waitForFunction(() => document.querySelector('[data-service-decision-link="fees"]').textContent.includes('本機驗證用摘要'));
      assert.ok(await page.evaluate(() => window.__serviceTestField === document.querySelector('.service-contact-section input[name="姓名"]') && window.__serviceTestField.value === '本機驗證，未送出'));
      await page.evaluate(() => { window.__serviceTestCopy.node.textContent = window.__serviceTestCopy.text; window.__serviceTestField.value = ''; });
      results.push({ slug, width, motion: process.env.QA_MOTION || 'reduce', cmsReadsBlocked: blockCms, ...baseline, keyboardAndMutation: 'pass' });
      console.log(`${slug} ${width}: passed`);
    }
    // Start from a fresh render: otherwise visiting earlier sections can mask skipped-layout jumps.
    for (const slug of ['home-care', 'day-care']) {
      await page.goto(`${origin}/${slug}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.service-decision-guide');
      await page.waitForTimeout(250);
      await page.locator(width === 1440 ? '.site-header .nav-cta' : '.one-minute-service-hero .primary-button').click();
      await page.waitForFunction(() => {
        const contact = document.querySelector('#service-contact');
        const formTop = contact?.querySelector('.contact-form').getBoundingClientRect().top;
        return contact?.contains(document.activeElement) && formTop >= 0 && formTop < innerHeight - 100;
      });
      assert.equal(new URL(page.url()).pathname, `/${slug}`, 'Service CTA should preserve the current service route');
      await page.screenshot({ path: `${output}${slug}-${width}-consultation.png` });
      console.log(`${slug} ${width}: fresh consultation CTA passed`);
    }
    assert.deepEqual(errors, [], `No JS exceptions at ${width}`);
    await context.close();
  }
  await fs.writeFile(`${output}results.json`, JSON.stringify(results, null, 2));
  console.log(`Service browser checks passed: ${results.length} views. Evidence: ${output}`);
} finally {
  await browser.close();
}
