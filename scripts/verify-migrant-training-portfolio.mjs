import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderMigrantTrainingPortfolio as render } from "../migrant-training-portfolio.mjs";

// Offline, read-only checks. Live URL availability and visual QA remain separate gates.
const root = fileURLToPath(new URL("../", import.meta.url));
const rendererOnly = process.argv.includes("--renderer-only");
const count = (html, pattern) => [...html.matchAll(pattern)].length;
const escape = (value) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
const idsIn = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const sample = (overrides = {}) => ({ id: "taipei", title: "臺北市集中訓練", summary: "課堂活動紀錄", period: "114 年度", status: "歷年活動", images: [], links: [], children: [], ...overrides });
const photo = { src: "/assets/real-training.webp", alt: "參與者在教室聆聽課程說明", caption: "2025 年臺北市集中訓練活動紀錄", width: 1280, height: 960 };

function assertUniqueIdsAndTargets(html, externalTargets = []) {
  const ids = idsIn(html);
  assert.equal(new Set(ids).size, ids.length, "Every article and heading ID must be unique");
  for (const match of html.matchAll(/\shref="#([^"]+)"/g)) assert.ok(ids.includes(match[1]) || externalTargets.includes(match[1]), `Anchor target must exist or be explicitly owned by the containing page: ${match[1]}`);
  for (const match of html.matchAll(/\saria-labelledby="([^"]+)"/g)) {
    for (const id of match[1].split(/\s+/)) assert.ok(ids.includes(id), `Accessible heading target must exist: ${id}`);
  }
}

function assertExternalLinksSafe(html) {
  for (const match of html.matchAll(/<a\s[^>]*href="https?:\/\/[^>]+>/g)) {
    assert.match(match[0], /target="_blank"/, "External links must preserve the current page");
    assert.match(match[0], /rel="[^\"]*noopener[^\"]*"/, "External links must protect the opener");
    assert.ok(!match[0].includes("data-service-decision-link"), "External links must not be intercepted as local page anchors");
  }
  for (const match of html.matchAll(/<a\s[^>]*href="#[^>]+>/g)) assert.match(match[0], /data-service-decision-link="portfolio"/, "Local anchors must reuse the focus/scroll handler without rerendering the page");
}

const programs = [0, 1, 2, 3].map((index) => sample({ id: `plan-${index}`, title: `計畫 ${index + 1}`, images: index === 0 ? [photo] : [], children: index === 3 ? [0, 1, 2, 3].map((child) => sample({ id: `child-${child}`, title: `數位子項 ${child + 1}`, status: "籌備中" })) : [] }));
const output = render(programs);
assert.equal(count(output, /<section\s/g), 1);
assert.equal(count(output, /class="migrant-portfolio-card(?: migrant-portfolio-card-(?:group|wide))?"/g), 4);
assert.equal(count(output, /class="migrant-portfolio-child"/g), 4);
assert.equal(count(output, /<h2\s/g), 1);
assert.equal(count(output, /<h3\s/g), 4);
assert.equal(count(output, /<h4\s/g), 4);
assert.equal(count(output, /<nav\s/g), 1);
assert.equal(count(output, /<figure>/g), 1);
assert.match(output, /id="migrant-training-projects"/);
assert.match(output, /訓練實績與執行計畫/);
assert.match(output, /alt="參與者在教室聆聽課程說明"/);
assert.match(output, /<figcaption>2025 年臺北市集中訓練活動紀錄<\/figcaption>/);
assert.match(output, /width="1280" height="960"/);
assert.ok(!/<(?:form|dialog)|role="tab|\shidden(?:\s|=|>)/.test(output), "Do not hide portfolio content or add forms, dialogs, or tabs");
assertUniqueIdsAndTargets(output);
assert.match(render([sample({ layout: "wide" })]), /class="migrant-portfolio-card migrant-portfolio-card-wide"/);
assert.ok(!render([sample({ layout: 'wide" onclick="bad()' })]).includes("migrant-portfolio-card-wide"));

const collisionInputs = [
  ["same", "same", "same-2", "same"],
  ["alpha", "alpha-heading", "alpha-child-1", "alpha"],
  ["alpha-heading", "alpha-child-1", "alpha", "alpha"],
  ["中文", "", "1", "1-heading"],
  ['bad\" onfocus=\"alert(1)', "bad-onfocus-alert-1", "bad-onfocus-alert-1", "bad-onfocus-alert-1-heading"]
];
for (const ids of collisionInputs) {
  assertUniqueIdsAndTargets(render(ids.map((id) => sample({ id, children: [sample({ title: "子項" })] }))));
}

const attack = '<img src=x onerror="alert(1)"> & \'quoted\'';
const hostileText = render([sample({ id: attack, title: attack, summary: attack, period: attack, status: attack, images: [{ ...photo, alt: attack, caption: attack }], links: [{ label: attack, url: "https://example.com/?a=1&b=2", note: attack }], children: [sample({ title: attack, summary: attack, status: attack })] })]);
assert.ok(!hostileText.includes("<img src=x"));
assert.ok(!hostileText.includes(' onerror="alert(1)"'));
assert.ok(hostileText.includes(escape(attack)), "Source text must remain present and escaped");
assertExternalLinksSafe(hostileText);

const forbidden = ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<svg/onload=alert(1)>", "vbscript:msgbox(1)", "file:///etc/passwd", "//attacker.example/a", "/\\attacker.example", "https://example.com/\nmalicious", "https://user:password@example.com/", "mailto:private@example.com", "ftp://example.com/a"];
for (const url of forbidden) {
  const html = render([sample({ links: [{ label: "FORBIDDEN_LINK", url }], images: [{ ...photo, src: url }] })]);
  assert.ok(!html.includes("FORBIDDEN_LINK"), `Reject unsafe link: ${JSON.stringify(url)}`);
  assert.equal(count(html, /<figure>/g), 0, `Reject unsafe image: ${JSON.stringify(url)}`);
}
const permitted = render([sample({ links: [{ label: "公開活動", url: "https://example.com/event?a=1&b=2", note: "依活動頁公告" }, { label: "公開HTTP", url: "http://example.com/event" }, { label: "站內課程", url: "/courses?type=training" }, { label: "本節", url: "#migrant-training-projects" }], images: [{ ...photo, src: "assets/real-training.webp" }] })]);
assert.match(permitted, /href="https:\/\/example.com\/event\?a=1&amp;b=2"/);
assert.match(permitted, /href="\/courses\?type=training"/);
assert.match(permitted, /src="\/assets\/real-training.webp"/);
assertExternalLinksSafe(permitted);

const grouped = render([sample({ children: [sample({ title: "四國線上學習社團", links: [{ label: "原有一般連結", url: "/courses" }], linkGroups: ["印尼", "越南", "菲律賓", "泰國"].map((label) => ({ label, links: [{ label: "初階", url: "https://example.com/basic" }, { label: "進階", url: "https://example.com/advanced" }] })) })] })]);
assert.equal(count(grouped, /class="migrant-portfolio-link-group"/g), 4);
assert.equal(count(grouped, /<h5>/g), 4);
assert.equal(count(grouped, /href="https:\/\/example.com\/(?:basic|advanced)"/g), 8);
assert.ok(grouped.includes("原有一般連結"), "Grouped community links must not replace existing links");
assertExternalLinksSafe(grouped);
const maliciousGroup = render([sample({ children: [sample({ linkGroups: [{ label: attack, links: [{ label: attack, url: "https://example.com/", note: attack }, ...forbidden.map((url) => ({ label: "FORBIDDEN_GROUP_LINK", url }))] }, { label: "EMPTY_GROUP", links: [] }] })] })]);
assert.ok(!maliciousGroup.includes("FORBIDDEN_GROUP_LINK") && !maliciousGroup.includes("EMPTY_GROUP"));
assert.ok(maliciousGroup.includes(`<h5>${escape(attack)}</h5>`));
assert.ok(!maliciousGroup.includes("<img src=x"));
for (const dimensions of [{ width: -1, height: 20 }, { width: 20, height: 0 }, { width: 1.5, height: 20 }, { width: "1280", height: 960 }, { width: '1" onload="alert(1)', height: 960 }, { width: Infinity, height: 960 }]) {
  const html = render([sample({ images: [{ ...photo, ...dimensions }] })]);
  assert.ok(!/\s(?:width|height)="/.test(html), "Only positive safe integer image dimensions are allowed");
}

for (const images of [undefined, [], [null], [{ src: photo.src, caption: photo.caption }], [{ ...photo, alt: " " }], [{ ...photo, caption: "" }], [{ ...photo, src: "" }]]) {
  const html = render([sample({ images, status: "籌備中（尚無活動照片）" })]);
  assert.equal(count(html, /<figure>|<img\s/g), 0, "Missing image data must not create a placeholder");
  assert.ok(!html.includes("migrant-portfolio-gallery"));
  assert.ok(html.includes("籌備中（尚無活動照片）"), "Do not infer completion from missing photos");
}
for (const input of [null, undefined, {}, [], [null, {}, { title: " " }]]) assert.equal(render(input), "");
assert.match(render([sample({ status: "已額滿，停止受理報名" })]), /已額滿，停止受理報名/, "Statuses must retain source wording");
console.log("PASS: renderer structure, 4 main cards / 4 children, unique IDs, keyboard anchor targets, escaping, URL safety and no-placeholder behavior.");

function imageDimensions(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { format: "PNG", width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), hasExif: buffer.includes(Buffer.from("eXIf")) };
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    let dimensions;
    let hasExif = false;
    for (let offset = 12; offset + 8 <= buffer.length;) {
      const type = buffer.toString("ascii", offset, offset + 4);
      const size = buffer.readUInt32LE(offset + 4);
      const start = offset + 8;
      assert.ok(start + size <= buffer.length, "WebP chunks must not be truncated");
      if (type === "VP8X") dimensions = { width: 1 + buffer.readUIntLE(start + 4, 3), height: 1 + buffer.readUIntLE(start + 7, 3) };
      if (type === "VP8 " && !dimensions) dimensions = { width: buffer.readUInt16LE(start + 6) & 0x3fff, height: buffer.readUInt16LE(start + 8) & 0x3fff };
      if (type === "VP8L" && !dimensions) {
        const bits = buffer.readUInt32LE(start + 1);
        dimensions = { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
      }
      if (type === "EXIF") hasExif = true;
      offset = start + size + (size % 2);
    }
    assert.ok(dimensions, "WebP must contain pixel dimensions");
    return { format: "WebP", ...dimensions, hasExif };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let dimensions;
    let hasExif = false;
    for (let offset = 2; offset + 4 < buffer.length;) {
      assert.equal(buffer[offset], 0xff, "JPEG marker must be valid");
      const marker = buffer[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      const size = buffer.readUInt16BE(offset + 2);
      assert.ok(size >= 2 && offset + 2 + size <= buffer.length, "JPEG segment must not be truncated");
      if ([0xc0, 0xc1, 0xc2].includes(marker)) dimensions = { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      if (marker === 0xe1 && buffer.toString("ascii", offset + 4, offset + 8) === "Exif") hasExif = true;
      offset += 2 + size;
    }
    assert.ok(dimensions, "JPEG must contain pixel dimensions");
    return { format: "JPEG", ...dimensions, hasExif };
  }
  throw new Error("Portfolio photos must be genuine raster files, not SVG or placeholder content");
}

if (!rendererOnly) {
  const { migrantTrainingPrograms: actual } = await import("../migrant-training-programs.mjs");
  assert.ok(Array.isArray(actual), "Data must export migrantTrainingPrograms");
  assert.equal(actual.length, 4, "Portfolio must present four main plans");
  const children = actual.flatMap((program) => program.children || []);
  assert.equal(children.length, 4, "Digital-learning plan must present four distinct child items");
  assert.equal(actual.filter((program) => program.children?.length).length, 1);
  const all = [...actual, ...children];
  assert.equal(new Set(actual.map((program) => program.id)).size, 4, "Actual main IDs must be distinct");
  assert.equal(new Set(children.map((program) => program.id)).size, 4, "Actual child IDs must be distinct");
  const actualHtml = render(actual);
  assertUniqueIdsAndTargets(actualHtml, ["service-contact"]);
  assertExternalLinksSafe(actualHtml);
  assert.equal(count(actualHtml, /class="migrant-portfolio-card(?: migrant-portfolio-card-(?:group|wide))?"/g), 4);
  assert.equal(count(actualHtml, /class="migrant-portfolio-child"/g), 4);
  assert.equal(count(actualHtml, /<figure>/g), all.reduce((total, program) => total + (program.images?.length || 0), 0), "Every supplied photo must render exactly once");
  const kaohsiung = actual.find((program) => /高雄/.test(program.title));
  assert.ok(kaohsiung, "Kaohsiung plan must be present");
  assert.match(kaohsiung.status, /額滿/);
  assert.match(kaohsiung.status, /停止|暫停|截止|不再/);
  let photoCount = 0;
  let publicLinkCount = 0;
  for (const program of all) {
    for (const field of ["id", "title", "summary", "period", "status"]) assert.ok(typeof program[field] === "string" && program[field].trim(), `${program.title}: ${field} must be explicit source data`);
    assert.ok(actualHtml.includes(escape(program.status)), `${program.title}: source status must remain visible`);
    if (program.linkGroups?.length) {
      assert.equal(program.linkGroups.length, 4, "Learning communities must retain four country groups");
      for (const group of program.linkGroups) {
        assert.ok(typeof group.label === "string" && group.label.trim());
        assert.equal(group.links?.length, 2, `${group.label}: preserve basic and advanced community entry points`);
        assert.ok(actualHtml.includes(`<h5>${escape(group.label)}</h5>`));
      }
    }
    const allLinks = [...(program.links || []), ...(program.linkGroups || []).flatMap((group) => group.links || [])];
    for (const link of allLinks) {
      assert.ok(typeof link.label === "string" && link.label.trim());
      const url = new URL(link.url, "https://www.suiyuecare.com");
      assert.ok(["http:", "https:"].includes(url.protocol));
      assert.ok(!url.username && !url.password);
      assert.ok(!/(^|\.)drive\.google\.com$|(^|\.)drive\.usercontent\.google\.com$/.test(url.hostname), "Private Drive source links belong in the local provenance record, not public CTA data");
      assert.ok(!url.pathname.startsWith("/document/d/") && !url.pathname.startsWith("/spreadsheets/d/") && !url.pathname.startsWith("/presentation/d/"), "Private Workspace source links must not become public CTAs");
      const normalized = /^https?:\/\//i.test(link.url) ? url.href : link.url;
      assert.ok(actualHtml.includes(`href="${escape(normalized)}"`), `${program.title}: public link must render`);
      if (/^https?:\/\//i.test(link.url)) publicLinkCount++;
    }
    for (const image of program.images || []) {
      assert.ok(typeof image.alt === "string" && image.alt.trim().length >= 8, `${program.title}: photo alt must describe the actual scene`);
      assert.ok(typeof image.caption === "string" && image.caption.trim().length >= 8);
      assert.match(image.caption, /20\d{2}|1[01]\d\s*年/, `${program.title}: photo caption must identify its actual year separately from the plan period`);
      assert.ok(!/placeholder|placehold\.|via\.placeholder|待補|示意圖|AI生成|AI 生成/i.test(`${image.src} ${image.alt} ${image.caption}`), "Do not substitute placeholders or generated scenes for genuine event photos");
      const relative = image.src.replace(/^\//, "");
      assert.match(relative, /^assets\//, "Final photos must be local site assets");
      assert.ok(!relative.split("/").includes(".."));
      const asset = fs.readFileSync(path.join(root, relative));
      const mirror = fs.readFileSync(path.join(root, "public", relative));
      assert.ok(asset.equals(mirror), `Asset and public mirror differ: ${relative}`);
      const meta = imageDimensions(asset);
      assert.ok(Number.isSafeInteger(image.width) && image.width > 0 && Number.isSafeInteger(image.height) && image.height > 0, `${relative}: source dimensions must be positive integers`);
      assert.equal(image.width, meta.width, `${relative}: declared width must match raster metadata`);
      assert.equal(image.height, meta.height, `${relative}: declared height must match raster metadata`);
      assert.ok(meta.width > 0 && meta.height > 0, `${relative}: raster dimensions must be valid`);
      assert.ok(asset.length <= 1_200_000, `${relative}: compressed photo must stay within 1.2 MB`);
      if (meta.width < 800) console.warn(`  WARNING: ${relative} is ${meta.width}px wide; preserve the genuine source size, do not upscale to simulate detail.`);
      assert.ok(!meta.hasExif, `${relative}: public derivatives must remove EXIF and GPS metadata`);
      assert.ok(actualHtml.includes(`alt="${escape(image.alt)}"`) && actualHtml.includes(`<figcaption>${escape(image.caption)}</figcaption>`));
      photoCount++;
      console.log(`  Photo: ${relative} — ${meta.format} ${meta.width}×${meta.height}, ${asset.length} bytes; mirror exact, no EXIF`);
    }
  }
  assert.ok(photoCount > 0, "Actual portfolio needs real event photos; empty-image planning items are allowed");
  assert.ok(publicLinkCount > 0, "Actual portfolio needs verified public information entry points");
  console.log(`PASS: actual 4 plans / 4 children, ${photoCount} real-photo assets, ${publicLinkCount} public links, source statuses including Kaohsiung closure, captions and exact asset mirrors.`);
  console.log("Scope: offline data/render/file verification only; does not claim live URL availability, visual browser QA or deployment.");
} else {
  console.log("Renderer-only mode: actual program data and image assets were not checked.");
}
