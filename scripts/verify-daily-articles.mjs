import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseHTML } from "linkedom";
import { ARTICLE_SOURCE_SLUGS, articlePublicNumber } from "../article-url-map.mjs";
import { dailyArticles } from "../daily-articles/index.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const batchIndexPath = path.join(rootDir, "daily-articles", "batch-index.json");
const batchIndex = JSON.parse(fs.readFileSync(batchIndexPath, "utf8"));
const baSeriesIndexPath = path.join(rootDir, "daily-articles", "ba-series-index.json");
const baSeriesIndex = fs.existsSync(baSeriesIndexPath)
  ? JSON.parse(fs.readFileSync(baSeriesIndexPath, "utf8"))
  : null;
const BA_SERIES_ID = "ltc3-ba-code-series-v1";
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

function verifyAsset(assetPath, label, approvedDraft = false) {
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
    if (approvedDraft) {
      const box = svg.match(/viewBox="\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*"/);
      assert(box && Number(box[3]) > 0 && Number(box[4]) > 0, `${label} approved SVG needs a valid viewBox`);
    } else {
      assert(/<svg[^>]+width="1200"[^>]+height="675"/.test(svg), `${label} SVG must be 1200x675`);
    }
    assert(/role="img"/.test(svg) && /<title\b/.test(svg) && /<desc\b/.test(svg), `${label} SVG accessibility metadata is incomplete`);
  }
}

// Approval metadata preserves the reviewed batch. It does not grant publishing
// permission; explicit user approval is recorded before these entries are made.
function verifyApprovedBatch(batch) {
  assert(batch.approval?.source === "explicit-user-message" && Number.isFinite(Date.parse(batch.approval.recordedAt)), `${batch.date} needs explicit approval provenance`);
  assert(Number.isSafeInteger(batch.expectedCount) && batch.expectedCount > 0 && batch.articles.length === batch.expectedCount, `${batch.date} approved article count mismatch`);
  assert(Array.isArray(batch.approvedDrafts) && batch.approvedDrafts.length === batch.expectedCount, `${batch.date} approval manifest count mismatch`);
  const ordinals = new Set(batch.approvedDrafts.map(item => item.draftNumber));
  assert(ordinals.size === batch.expectedCount && [...ordinals].every(n => Number.isSafeInteger(n) && n > 0), `${batch.date} duplicate or invalid approved draft numbers`);
  const declared = batch.approval.approvedDraftOrdinals;
  const pending = batch.approval.pendingDraftOrdinals;
  assert(Array.isArray(declared) && declared.length === ordinals.size && new Set(declared).size === ordinals.size && declared.every(n => ordinals.has(n)), `${batch.date} manifest differs from the explicitly approved draft numbers`);
  assert(Array.isArray(pending) && new Set(pending).size === pending.length && pending.every(n => Number.isSafeInteger(n) && n > 0 && !ordinals.has(n)), `${batch.date} pending drafts must not be published`);
  const publishedOrdinals = new Set();
  batch.articles.forEach(entry => {
    const approved = batch.approvedDrafts.find(item => item.draftNumber === entry.draftNumber);
    assert(approved && !publishedOrdinals.has(entry.draftNumber), `${batch.date} article lacks unique approval: ${entry.slug}`);
    publishedOrdinals.add(entry.draftNumber);
    assert(approved.draftKey && approved.sourceFile && /^[a-f0-9]{64}$/.test(approved.sourceSha256), `${entry.slug} draft provenance incomplete`);
    assert(entry.sourceSha256 === approved.sourceSha256, `${entry.slug} reviewed source hash differs`);
    assert(entry.contentHash === approved.contentHash, `${entry.slug} formatted content differs from approval manifest`);
    assert(JSON.stringify(entry.assets) === JSON.stringify(approved.assets) && entry.assets?.length > 0, `${entry.slug} approved assets differ`);
  });
  for (const item of batch.withheldArticles || []) {
    assert(pending.includes(item.draftNumber) && !ordinals.has(item.draftNumber) && item.title && item.reason === "not-approved", `${batch.date} invalid pending draft`);
  }
}

function verifyApprovedArticle(article, entry) {
  assert(typeof article.content === "string" && article.content.length > 900, `${entry.slug} approved article body is missing`);
  const { document } = parseHTML(`<html><body>${article.content}</body></html>`);
  const bodyText = document.body.textContent.replace(/\s+/g, " ").trim();
  assert(entry.bodyTextHash === `sha256:${crypto.createHash("sha256").update(bodyText).digest("hex")}`, `${entry.slug} approved body text differs`);
  assert(document.querySelectorAll("h2, h3").length >= 3, `${entry.slug} approved article sections are missing`);
  assert(!document.querySelector("script, iframe, object, embed, form"), `${entry.slug} unsafe article markup`);
  for (const node of document.querySelectorAll("*")) {
    assert([...node.attributes].every(attr => !/^on/i.test(attr.name)), `${entry.slug} inline event handler is not allowed`);
    for (const attr of ["href", "src"]) assert(!/^\s*(javascript|data):/i.test(node.getAttribute(attr) || ""), `${entry.slug} unsafe URL`);
  }
  assert(article.readingMinutes >= 3 && article.readingMinutes <= 15 && article.summary?.length >= 1, `${entry.slug} reading metadata incomplete`);
  assert(article.relatedSlugs?.length === 3 && article.relatedSlugs.every(slug => indexedSlugs.has(slug)), `${entry.slug} related articles invalid`);
  assert(article.references?.length >= 2 && article.references.every(ref => /^https:\/\//.test(ref.url) && ref.citation && Number.isFinite(ref.evidenceRank)), `${entry.slug} source references incomplete`);
  assert(JSON.stringify(article.references.map(ref => ref.url)) === JSON.stringify(entry.referenceUrls), `${entry.slug} references differ from reviewed manifest`);
  assert(article.imageAlt && article.imageCaption, `${entry.slug} illustration description is missing`);
  const usedAssets = new Set([article.image, ...[...document.querySelectorAll("img")].map(img => img.getAttribute("src")), ...article.inlineImages.map(img => img.src)]);
  assert(entry.assets.length === usedAssets.size && entry.assets.every(asset => usedAssets.has(asset.path)), `${entry.slug} unapproved or missing illustration`);
  for (const asset of entry.assets) {
    verifyAsset(asset.path, entry.slug, true);
    const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(rootDir, localAsset(asset.path)))).digest("hex");
    assert(actual === asset.sha256, `${entry.slug} illustration differs from approved source`);
  }
  if (entry.baCode) {
    const item = baQueue.find(item => item.code === entry.baCode);
    assert(item && article.baCode === entry.baCode && article.seriesId === BA_SERIES_ID, `${entry.slug} BA metadata invalid`);
    assert(article.title.includes(entry.baCode) && article.title.includes(item.name), `${entry.slug} BA official name missing`);
    assert(item.slug === entry.slug && item.publicNumber === entry.publicNumber && item.contentHash === entry.contentHash, `${entry.slug} BA index differs`);
    completedBaCodes.add(entry.baCode);
  }
}

function selfTestApprovedBatchRules() {
  const approved = { draftNumber: 1, draftKey: "fixture:approved", sourceFile: "approved.md", sourceSha256: "a".repeat(64), contentHash: `sha256:${"b".repeat(64)}`, assets: [{ path: "assets/approved.svg", sha256: "c".repeat(64) }] };
  const fixture = { date: "fixture-approval", expectedCount: 1, approval: { source: "explicit-user-message", recordedAt: "2026-09-15T00:00:00Z", approvedDraftOrdinals: [1], pendingDraftOrdinals: [2] }, approvedDrafts: [approved], articles: [{ ...approved, slug: "approved-article" }], withheldArticles: [{ draftNumber: 2, title: "Pending draft", reason: "not-approved" }] };
  verifyApprovedBatch(fixture);
  for (const mutate of [
    batch => { batch.articles[0].draftNumber = 2; },
    batch => { batch.articles.push({ ...batch.articles[0], draftNumber: 2 }); },
    batch => { batch.articles[0].sourceSha256 = "d".repeat(64); },
    batch => { batch.articles[0].contentHash = `sha256:${"d".repeat(64)}`; },
    batch => { batch.articles[0].assets[0].sha256 = "d".repeat(64); },
    batch => { batch.expectedCount = 2; batch.approvedDrafts.push({ ...approved, draftNumber: 2 }); batch.articles.push({ ...approved, draftNumber: 2, slug: "pending-article" }); },
    batch => { batch.approval.pendingDraftOrdinals.push(1); },
    batch => { batch.approval.source = "automatic"; }
  ]) {
    const invalid = structuredClone(fixture);
    // Separate the fixture's approval and article asset arrays before mutation.
    invalid.articles[0].assets = structuredClone(invalid.articles[0].assets);
    mutate(invalid);
    let rejected = false;
    try { verifyApprovedBatch(invalid); } catch { rejected = true; }
    assert(rejected, "Unapproved or changed drafts must be rejected");
  }
}

function expectedBaCodes(queue, completedCodes) {
  const remaining = queue.filter((item) => !completedCodes.has(item.code));
  return remaining.slice(0, Math.min(3, remaining.length)).map((item) => item.code);
}

function verifyBaBatchShape(batch, queue, completedCodes) {
  const codes = batch.articles.map((item) => String(item.baCode || "").trim());
  const expected = expectedBaCodes(queue, completedCodes);
  assert(codes.length === expected.length, `${batch.date} BA batch must contain ${expected.length} article(s)`);
  assert(new Set(codes).size === codes.length, `${batch.date} BA codes must be distinct full code strings`);
  assert(codes.every((code, index) => code === expected[index]), `${batch.date} BA codes must follow the stable queue: ${expected.join(", ")}`);
  assert(batch.expectedCount === expected.length, `${batch.date} BA expectedCount does not match remaining catalog`);
  assert(codes.length === 3 || completedCodes.size + codes.length === queue.length, `${batch.date} may contain fewer than three BA articles only in the final batch`);
  codes.forEach((code) => completedCodes.add(code));
}

function selfTestBaBatchRules() {
  const queue = [{ code: "BA01" }, { code: "BA02" }, { code: "BA03" }, { code: "BA04" }, { code: "BA05" }];
  verifyBaBatchShape({ date: "fixture-first", expectedCount: 3, articles: [{ baCode: "BA01" }, { baCode: "BA02" }, { baCode: "BA03" }] }, queue, new Set());
  const finalCompleted = new Set(["BA01", "BA02", "BA03"]);
  verifyBaBatchShape({ date: "fixture-final", expectedCount: 2, articles: [{ baCode: "BA04" }, { baCode: "BA05" }] }, queue, finalCompleted);
  for (const fixture of [
    { date: "fixture-duplicate", expectedCount: 3, articles: [{ baCode: "BA01" }, { baCode: "BA01" }, { baCode: "BA03" }] },
    { date: "fixture-short", expectedCount: 2, articles: [{ baCode: "BA01" }, { baCode: "BA02" }] }
  ]) {
    let rejected = false;
    try { verifyBaBatchShape(fixture, queue, new Set()); } catch { rejected = true; }
    assert(rejected, `${fixture.date} must be rejected by BA batch rules`);
  }
}

selfTestBaBatchRules();
selfTestApprovedBatchRules();

const indexedSlugs = new Set(ARTICLE_SOURCE_SLUGS);
const articleBySlug = new Map(dailyArticles.map((article) => [article.slug, article]));
const allTitles = new Set();
const allNumbers = new Set();
const baQueue = baSeriesIndex?.stableQueue || [];
const completedBaCodes = new Set();

if (baSeriesIndex) {
  assert(baSeriesIndex.seriesId === BA_SERIES_ID, "Unexpected BA series id");
  assert(baQueue.length === 29, "BA series must contain 29 independent code or subcode targets");
  assert(new Set(baQueue.map((item) => item.code)).size === baQueue.length, "BA series queue contains duplicate codes");
}

batchIndex.batches.forEach((batch) => {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(batch.date), `Invalid batch date: ${batch.date}`);
  assert(batch.commit === "SELF" || /^[0-9a-f]{40}$/.test(batch.commit), `Invalid commit pointer for ${batch.date}`);
  const withheldArticles = Array.isArray(batch.withheldArticles) ? batch.withheldArticles : [];
  const isEditorialSelection = batch.publicationMode === "editorial-selection";
  const isApprovedDraft = batch.publicationMode === "user-approved-drafts";
  const isBaSeries = batch.seriesId === BA_SERIES_ID;
  if (isApprovedDraft) {
    verifyApprovedBatch(batch);
  } else if (isEditorialSelection) {
    assert(withheldArticles.length > 0, `${batch.date} editorial selection must record withheld articles`);
    assert(
      batch.articles.length + withheldArticles.length === 3,
      `${batch.date} editorial selection must account for exactly three planned articles`
    );
  } else {
    assert(!batch.publicationMode, `${batch.date} has an unsupported publication mode`);
    assert(withheldArticles.length === 0, `${batch.date} cannot withhold articles without editorial selection`);
    if (isBaSeries) {
      assert(baSeriesIndex, `${batch.date} BA batch requires ba-series-index.json`);
      verifyBaBatchShape(batch, baQueue, completedBaCodes);
    } else {
      assert(batch.articles.length === 3, `${batch.date} must contain exactly three articles`);
    }
  }

  const plannedArticles = [...batch.articles, ...withheldArticles];
  const isDiseaseBatch = batch.topicMode === "disease";
  assert(!batch.topicMode || isDiseaseBatch, `${batch.date} has an unsupported topic mode`);
  if (isDiseaseBatch) {
    assert(!isEditorialSelection, `${batch.date} disease batch must publish all three prepared articles together`);
    assert(Number.isInteger(batch.cycleDay) && batch.cycleDay >= 1 && batch.cycleDay <= 4, `${batch.date} disease cycle day must be 1–4`);
    const topics = plannedArticles.map((item) => String(item.diseaseTopic || "").trim());
    assert(topics.every(Boolean) && new Set(topics).size === 3, `${batch.date} disease topics must be present and distinct`);
  } else if (!isBaSeries && !isApprovedDraft) {
    const businessItems = plannedArticles.map((item) => item.businessItem);
    assert(new Set(businessItems).size === 3, `${batch.date} business items must be distinct`);
    const expected = expectedRotation[taipeiWeekday(batch.date)];
    assert(expected.every((item) => businessItems.includes(item)), `${batch.date} does not match the weekday rotation`);
  }

  const numbers = batch.articles.map((item) => item.publicNumber).sort((a, b) => a - b);
  assert(
    numbers.length > 0 && numbers.every((number, index) => index === 0 || number === numbers[index - 1] + 1),
    `${batch.date} published public numbers are not consecutive`
  );

  if (isEditorialSelection) {
    const draftNumbers = plannedArticles.map((item) => item.draftNumber).sort((a, b) => a - b);
    assert(
      draftNumbers.every((number) => Number.isSafeInteger(number) && number > 0),
      `${batch.date} editorial selection must preserve every draft number`
    );
    assert(
      draftNumbers.every((number, index) => index === 0 || number === draftNumbers[index - 1] + 1),
      `${batch.date} draft numbers are not consecutive`
    );
    withheldArticles.forEach((entry) => {
      assert(entry.reason === "explicit-user-request", `Invalid withholding reason for ${entry.slug}`);
      assert(!articleBySlug.has(entry.slug), `Withheld daily article was still installed: ${entry.slug}`);
      assert(!indexedSlugs.has(entry.slug), `Withheld article still has a public URL: ${entry.slug}`);
      assert(/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(entry.slug), `Invalid withheld slug: ${entry.slug}`);
      assert(entry.title && entry.businessItem, `Withheld article metadata is incomplete: ${entry.slug}`);
    });
  }

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
    if (isApprovedDraft) {
      verifyApprovedArticle(article, entry);
      return;
    }
    assert(article.readingMinutes >= 8 && article.readingMinutes <= 12, `Reading time out of range: ${entry.slug}`);
    assert(article.content.length >= 5 && article.content.length <= 7, `Content section count out of range: ${entry.slug}`);
    assert(article.content.every((section) => Array.isArray(section[1]) && section[1].length === 2), `Each section needs two paragraphs: ${entry.slug}`);
    if (isDiseaseBatch) {
      assert(article.diseaseTopic === entry.diseaseTopic, `Disease topic mismatch for ${entry.slug}`);
      for (const field of ["primaryQuestion", "careContext"]) {
        assert(typeof article[field] === "string" && article[field].trim() && article[field] === entry[field], `Disease ${field} metadata missing or mismatched: ${entry.slug}`);
      }
      const headings = new Set(article.content.map((section) => section[0]));
      for (const area of ["introduction", "treatment", "care"]) {
        assert(headings.has(article.coverage?.[area]), `Disease ${area} section missing: ${entry.slug}`);
      }
    }
    if (isBaSeries) {
      const catalogItem = baQueue.find((item) => item.code === entry.baCode);
      assert(catalogItem, `BA code is not in the current series catalog: ${entry.baCode}`);
      assert(article.seriesId === BA_SERIES_ID && article.baCode === entry.baCode, `BA metadata mismatch for ${entry.slug}`);
      assert(article.policyCheckedAt === batch.catalogCheckedAt, `BA policy check date mismatch for ${entry.slug}`);
      for (const field of ["primaryQuestion", "careContext"]) {
        assert(typeof article[field] === "string" && article[field].trim() && article[field] === entry[field], `BA ${field} metadata missing or mismatched: ${entry.slug}`);
      }
      assert(article.title.includes(entry.baCode) && article.title.includes(catalogItem.name), `BA title must include code and official name: ${entry.slug}`);
      const searchable = JSON.stringify([article.dek, article.summary, article.content, article.tables, article.faq]);
      for (const required of [entry.baCode, catalogItem.name, "核定", "支付價格", "個案管理員"]) {
        assert(searchable.includes(required), `BA article is missing required coverage '${required}': ${entry.slug}`);
      }
      assert(/不得|不能|不包含|不適用/.test(searchable), `BA service boundary is missing: ${entry.slug}`);
      const seriesEntry = baQueue.find((item) => item.code === entry.baCode);
      assert(seriesEntry.slug === entry.slug && seriesEntry.publicNumber === entry.publicNumber, `BA persistent index mismatch: ${entry.slug}`);
      assert(seriesEntry.contentHash === entry.contentHash && seriesEntry.batchId === batch.batchId, `BA hash or batch id mismatch: ${entry.slug}`);
    }
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
