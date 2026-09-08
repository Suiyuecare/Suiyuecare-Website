import fs from "node:fs";
import path from "node:path";

const roots = ["assets", "public/assets"].filter((dir) => fs.existsSync(dir));
const ignoredPathPattern = /(^|\/)(backups|backup|archive|tmp|TemporaryItems)(\/|$)|-instant\./i;
const imagePattern = /\.(jpe?g|png|webp)$/i;
const strict = process.argv.includes("--strict");
const scanAll = process.argv.includes("--all");
const scanUnused = process.argv.includes("--unused");
const sourceRoots = ["app.js", "index.html", "styles.css", "scripts", "supabase/migrations"].filter((target) => fs.existsSync(target));
const unusedLargeImageLimit = 1.1 * 1024 * 1024;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const normalized = fullPath.replaceAll(path.sep, "/");
    if (ignoredPathPattern.test(normalized)) continue;
    if (entry.isDirectory()) walk(fullPath, files);
    else if (imagePattern.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function walkSource(target, files = []) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
      const fullPath = path.join(target, entry.name);
      if (entry.isDirectory()) walkSource(fullPath, files);
      else if (/\.(js|mjs|html|css|sql)$/i.test(entry.name)) files.push(fullPath);
    }
    return files;
  }
  files.push(target);
  return files;
}

function readUInt24LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function pngSize(buffer) {
  if (buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpgSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return null;
  let offset = 12;
  while (offset + 8 < buffer.length) {
    const chunk = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (chunk === "VP8X") {
      return { width: readUInt24LE(buffer, data + 4) + 1, height: readUInt24LE(buffer, data + 7) + 1 };
    }
    if (chunk === "VP8 " && buffer[data + 3] === 0x9d && buffer[data + 4] === 0x01 && buffer[data + 5] === 0x2a) {
      return { width: buffer.readUInt16LE(data + 6) & 0x3fff, height: buffer.readUInt16LE(data + 8) & 0x3fff };
    }
    if (chunk === "VP8L" && buffer[data] === 0x2f) {
      const b1 = buffer[data + 1];
      const b2 = buffer[data + 2];
      const b3 = buffer[data + 3];
      const b4 = buffer[data + 4];
      return {
        width: 1 + (((b2 & 0x3f) << 8) | b1),
        height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6))
      };
    }
    offset += 8 + size + (size % 2);
  }
  return null;
}

function imageSize(file) {
  const buffer = fs.readFileSync(file);
  return pngSize(buffer) || jpgSize(buffer) || webpSize(buffer);
}

function classify(file) {
  const normalized = file.replaceAll(path.sep, "/");
  if (/logo|partner|favicon|cis/i.test(normalized)) return "logo";
  if (/testimonial-avatars|avatar/i.test(normalized)) return "avatar";
  if (/(^|[-_/])hero([-_.\/]|$)/i.test(normalized)) return "hero";
  if (/(^|[-_/])cover([-_.\/]|$)/i.test(normalized)) return "cover";
  return "card";
}

const issues = [];
const seenFiles = new Set();
const sourceText = sourceRoots.flatMap((source) => walkSource(source)).map((file) => fs.readFileSync(file, "utf8")).join("\n");
const physicalFiles = roots.flatMap((root) => walk(root));

function canonicalAssetPath(file) {
  return file.replaceAll(path.sep, "/").replace(/^public\//, "");
}

function isReferenced(file) {
  const normalized = canonicalAssetPath(file);
  return sourceText.includes(normalized) || sourceText.includes(`/${normalized}`);
}

const allFiles = physicalFiles.filter((file) => {
  const key = file.replaceAll(path.sep, "/").replace(/^public\//, "");
  if (seenFiles.has(key)) return false;
  seenFiles.add(key);
  return true;
});
const files = scanAll ? allFiles : allFiles.filter(isReferenced);

for (const file of files) {
  const stat = fs.statSync(file);
  const size = imageSize(file);
  const type = classify(file);
  if (!size) {
    issues.push({ severity: "warning", file, detail: "無法讀取圖片尺寸" });
    continue;
  }
  if (type === "hero" && size.width < 1500) {
    issues.push({ severity: "critical", file, detail: `Hero 圖寬 ${size.width}px，建議至少 1500px` });
  }
  if (type === "cover" && size.width < 1200) {
    issues.push({ severity: "warning", file, detail: `封面圖寬 ${size.width}px，建議至少 1200px` });
  }
  if (type === "avatar" && size.width < 320) {
    issues.push({ severity: "warning", file, detail: `頭像圖寬 ${size.width}px，建議至少 320px` });
  }
  if (type === "card" && size.width < 900) {
    issues.push({ severity: "warning", file, detail: `卡片/內容圖寬 ${size.width}px，建議至少 900px` });
  }
  const limit = type === "hero" ? 2.5 * 1024 * 1024 : 1.2 * 1024 * 1024;
  if (type !== "logo" && stat.size > limit) {
    issues.push({ severity: "info", file, detail: `檔案 ${(stat.size / 1024 / 1024).toFixed(2)}MB，可再壓縮或轉 WebP/AVIF` });
  }
}

if (scanUnused) {
  const unusedFiles = physicalFiles
    .filter((file) => !isReferenced(file))
    .map((file) => {
      const stat = fs.statSync(file);
      const size = imageSize(file);
      return { file, stat, size };
    })
    .filter(({ file, stat }) => stat.size >= unusedLargeImageLimit && !/logo|partner|favicon|cis/i.test(file))
    .sort((a, b) => b.stat.size - a.stat.size);

  const unusedBytes = unusedFiles.reduce((sum, item) => sum + item.stat.size, 0);
  const publicUnusedBytes = unusedFiles
    .filter(({ file }) => file.replaceAll(path.sep, "/").startsWith("public/assets/"))
    .reduce((sum, item) => sum + item.stat.size, 0);

  if (unusedFiles.length) {
    issues.push({
      severity: "info",
      file: "assets",
      detail: `未使用大圖 ${unusedFiles.length} 張，共 ${(unusedBytes / 1024 / 1024).toFixed(1)}MB；其中 public/assets 約 ${(publicUnusedBytes / 1024 / 1024).toFixed(1)}MB，正式 build 會自動從 dist 排除未引用大圖`
    });
  }

  unusedFiles.slice(0, 80).forEach(({ file, stat, size }) => {
    const normalized = file.replaceAll(path.sep, "/");
    const dimension = size ? `${size.width}x${size.height}` : "尺寸未知";
    const publicNote = normalized.startsWith("public/assets/") ? "，位於 public/assets，build 會從 dist 排除此未引用大圖" : "";
    const legacyNote = /\.png$/i.test(file) ? "，疑似舊 PNG 原圖" : "";
    issues.push({
      severity: "info",
      file,
      detail: `目前沒有被前台引用，${dimension}，${(stat.size / 1024 / 1024).toFixed(2)}MB${publicNote}${legacyNote}`
    });
  });
}

const counts = issues.reduce((acc, issue) => {
  acc[issue.severity] = (acc[issue.severity] || 0) + 1;
  return acc;
}, {});

console.log(`Scanned ${files.length} ${scanAll ? "library" : "referenced"} images${scanAll ? "" : ` (${allFiles.length - files.length} unused skipped)`}${scanUnused ? " plus unused large-image inventory" : ""}.`);
console.log(`Issues: critical ${counts.critical || 0}, warning ${counts.warning || 0}, info ${counts.info || 0}`);

issues.slice(0, 120).forEach((issue) => {
  console.log(`[${issue.severity}] ${issue.file} - ${issue.detail}`);
});

if (issues.length > 120) console.log(`...and ${issues.length - 120} more issues.`);
if (strict && issues.some((issue) => issue.severity === "critical")) process.exitCode = 1;
