import fs from "node:fs";
import path from "node:path";

const publicAssetsDir = path.resolve("public/assets");
const distDir = path.resolve("dist");
const sourceRoots = ["app.js", "index.html", "styles.css", "scripts", "supabase/migrations"].filter((target) => fs.existsSync(target));
const imagePattern = /\.(jpe?g|png|webp)$/i;
const ignoredPathPattern = /(^|\/)(backups|backup|archive|tmp|TemporaryItems)(\/|$)|-instant\./i;
const largeAssetLimit = 1.1 * 1024 * 1024;
const pruneAllUnused = process.argv.includes("--all");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
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

function isReferenced(sourceText, publicFile) {
  const relativePublic = path.relative(process.cwd(), publicFile).replaceAll(path.sep, "/").replace(/^public\//, "");
  return sourceText.includes(relativePublic) || sourceText.includes(`/${relativePublic}`);
}

function removeEmptyDirs(dir, stopDir) {
  let current = dir;
  while (current.startsWith(stopDir) && current !== stopDir) {
    if (!fs.existsSync(current) || fs.readdirSync(current).length) break;
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

const sourceText = sourceRoots
  .flatMap((source) => walkSource(source))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

let removedCount = 0;
let removedBytes = 0;
const removedSamples = [];

for (const publicFile of walk(publicAssetsDir)) {
  if (isReferenced(sourceText, publicFile)) continue;
  const stat = fs.statSync(publicFile);
  if (!pruneAllUnused && stat.size < largeAssetLimit) continue;

  const relative = path.relative(path.resolve("public"), publicFile);
  const distFile = path.join(distDir, relative);
  if (!fs.existsSync(distFile)) continue;

  const distStat = fs.statSync(distFile);
  fs.rmSync(distFile);
  removedCount += 1;
  removedBytes += distStat.size;
  if (removedSamples.length < 24) removedSamples.push(relative.replaceAll(path.sep, "/"));
  removeEmptyDirs(path.dirname(distFile), distDir);
}

console.log(`Pruned ${removedCount} unused public asset${removedCount === 1 ? "" : "s"} from dist (${(removedBytes / 1024 / 1024).toFixed(1)}MB).`);
if (removedSamples.length) {
  removedSamples.forEach((file) => console.log(`- ${file}`));
  if (removedCount > removedSamples.length) console.log(`...and ${removedCount - removedSamples.length} more`);
}
