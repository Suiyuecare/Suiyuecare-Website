import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ARTICLE_SOURCE_SLUGS, articlePublicNumber } from "../article-url-map.mjs";
import { dailyArticles } from "../daily-articles/index.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const batchIndexPath = path.join(rootDir, "daily-articles", "batch-index.json");
const batchIndex = JSON.parse(fs.readFileSync(batchIndexPath, "utf8"));
const expectedRotation = {
  0: ["移工培訓", "教育品管", "軟體系統"],
  1: ["居家照顧", "日間照顧", "社區據點"],
  2: ["護理復能", "移工培訓", "教育品管"],
  3: ["軟體系統", "居家照顧", "日間照顧"],
  4: ["社區據點", "護理復能", "移工培訓"],
  5: ["教育品管", "軟體系統", "居家照顧"],
  6: ["日間照顧", "社區據點", "護理復能"]
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function taipeiWeekday(date) {
  const noon = new Date(`${date}T12:00:00+08:00`);
  return noon.getUTCDay();
}

function normalizedTitle(value = "") {
  return String(value).normalize("NFKC").replace(/[\s：:，,。！？!?、｜|（）()「」『』]/g, "").toLowerCase();
}

function contentHash(article) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(article)).digest("hex")}`;
}

function localAsset(value) {
  return String(value || "").replace(/^\/?/, "");
}

function verifyAsset(assetPath, label) {
  const relative = localAsset(assetPath);
  const sourcePath = path.join(rootDir, relative);
  const mirrorPath = path.join(rootDir, "public", relative);
  assert(fs.existsSync(sourcePath), `${label} source asset is missing: ${relative}`);
  assert(fs.existsSync(mirrorPath), `${label} public mirror is missing: ${relative}`);
  assert(fs.readFileSync(sourcePath).equals(fs.readFileSync(mirrorPath)), `${label} mirror differs: ${relative}`);
  const size = fs.statSync(sourcePath).size;
  assert(size > 10_000 || relative.endsWith(".svg"), `${label} asset is unexpectedly small: ${relative}`);
  if (relative.endsWith(".svg")) {
    const svg = fs.readFileSync(sourcePath, "utf8");
    assert(/<svg[^>]+width="1200"[^>]+height="675"/.test(svg), `${label} SVG must be 1200x675`);
    assert(/role="img"/.test(svg) && /<title\b/.test(svg) && /<desc\b/.test(svg), `${label} SVG accessibility metadata is incomplete`);
  }
}

const indexedSlugs = new Set(ARTICLE_SOURCE_SLUGS);
const articleBySlug = new Map(dailyArticles.map((article) => [article.slug, article]));
const allTitles = new Set();
const allNumbers = new Set();

batchIndex.batches.forEach((batch) => {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(batch.date), `Invalid batch date: ${batch.date}`);
  assert(batch.commit === "SELF" || /^[0-9a-f]{40}$/.test(batch.commit), `Invalid commit pointer for ${batch.date}`);
  assert(batch.articles.length === 3, `${batch.date} must contain exactly three articles`);
  const businessItems = batch.articles.map((item) => item.businessItem);
  assert(new Set(businessItems).size === 3, `${batch.date} business items must be distinct`);
  const expected = expectedRotation[taipeiWeekday(batch.date)];
  assert(expected.every((item) => businessItems.includes(item)), `${batch.date} does not match the weekday rotation`);

  const numbers = batch.articles.map((item) => item.publicNumber).sort((a, b) => a - b);
  assert(numbers[2] - numbers[0] === 2 && numbers[1] - numbers[0] === 1, `${batch.date} public numbers are not consecutive`);

  batch.articles.forEach((entry) => {
    const article = articleBySlug.get(entry.slug);
    assert(article, `Indexed daily article is missing: ${entry.slug}`);
    assert(indexedSlugs.has(entry.slug), `Article URL map is missing: ${entry.slug}`);
    assert(articlePublicNumber(entry.slug) === entry.publicNumber, `Public number mismatch for ${entry.slug}`);
    assert(article.title === entry.title, `Title mismatch for ${entry.slug}`);
    assert(article.relatedService === entry.businessItem, `Business item mismatch for ${entry.slug}`);
    assert(contentHash(article) === entry.contentHash, `Content hash mismatch for ${entry.slug}`);
    assert(article.date === batch.displayDate, `Display date mismatch for ${entry.slug}`);
    assert(article.publishedAt.startsWith(batch.date), `Taipei publish date mismatch for ${entry.slug}`);
    assert(!allNumbers.has(entry.publicNumber), `Duplicate public number: ${entry.publicNumber}`);
    allNumbers.add(entry.publicNumber);
    const titleKey = normalizedTitle(article.title);
    assert(!allTitles.has(titleKey), `Duplicate normalized title: ${article.title}`);
    allTitles.add(titleKey);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(article.slug), `Invalid slug: ${article.slug}`);
    assert(article.readingMinutes >= 8 && article.readingMinutes <= 12, `Reading time out of range: ${entry.slug}`);
    assert(article.content.length >= 5 && article.content.length <= 7, `Content section count out of range: ${entry.slug}`);
    assert(article.content.every((section) => Array.isArray(section[1]) && section[1].length === 2), `Each section needs two paragraphs: ${entry.slug}`);
    assert(article.summary.length >= 3 && article.summary.length <= 5, `Summary point count out of range: ${entry.slug}`);
    assert(article.checklists.length === 1, `Each article needs one checklist: ${entry.slug}`);
    assert(article.tables.length === 1, `Each article needs one table: ${entry.slug}`);
    assert(article.faq.length === 3, `Each article needs three FAQ items: ${entry.slug}`);
    assert(article.relatedSlugs.length === 3 && article.relatedSlugs.every((slug) => indexedSlugs.has(slug)), `Related slugs invalid: ${entry.slug}`);
    assert(article.references.length >= 4 && article.references.length <= 8, `Reference count out of range: ${entry.slug}`);
    article.references.forEach((reference) => {
      assert(/^https:\/\//.test(reference.url), `Reference URL must use HTTPS: ${entry.slug}`);
      assert(reference.citation && Number.isFinite(reference.evidenceRank), `Reference metadata incomplete: ${entry.slug}`);
      if (reference.pmid) assert(/^\d{7,9}$/.test(reference.pmid), `Invalid PMID: ${reference.pmid}`);
      if (reference.doi) assert(/^10\.\d{4,9}\//.test(reference.doi), `Invalid DOI: ${reference.doi}`);
    });
    assert(article.imageAlt && article.imageCaption, `Hero alt or caption missing: ${entry.slug}`);
    verifyAsset(article.image, `${entry.slug} hero`);
    const rasters = article.inlineImages.filter((item) => !item.src.endsWith(".svg"));
    const charts = article.inlineImages.filter((item) => item.src.endsWith(".svg"));
    assert(article.inlineImages.length >= 3 && rasters.length >= 2 && charts.length === 1, `Inline image mix invalid: ${entry.slug}`);
    article.inlineImages.forEach((image, index) => {
      assert(image.alt && image.caption, `Inline image alt or caption missing: ${entry.slug} #${index + 1}`);
      verifyAsset(image.src, `${entry.slug} inline #${index + 1}`);
    });
  });
});

assert(articleBySlug.size === batchIndex.batches.reduce((sum, batch) => sum + batch.articles.length, 0), "Daily articles and batch index are out of sync");
console.log(`ok - ${articleBySlug.size} daily articles across ${batchIndex.batches.length} batch(es) passed`);
