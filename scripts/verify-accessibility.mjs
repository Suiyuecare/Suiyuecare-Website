import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const htmlFiles = [];
const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}

function relative(file) {
  return path.relative(process.cwd(), file);
}

function isFrontHtml(file) {
  const rel = relative(file);
  return !rel.startsWith("dist/admin/") && !rel.startsWith("dist/portal/");
}

function stripTags(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function attr(tag = "", name = "") {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1] || "";
}

function hasAttr(tag = "", name = "") {
  return new RegExp(`\\b${name}(?:=["'][^"']*["'])?`, "i").test(tag);
}

function verifyImages(html, file) {
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!hasAttr(tag, "alt")) {
      failures.push(`${relative(file)} -> image missing alt: ${tag.slice(0, 140)}`);
    }
    if (!attr(tag, "loading")) {
      failures.push(`${relative(file)} -> image missing loading strategy: ${tag.slice(0, 140)}`);
    }
    if (attr(tag, "decoding") !== "async") {
      failures.push(`${relative(file)} -> image should use decoding="async": ${tag.slice(0, 140)}`);
    }
  }
}

function verifyIframes(html, file) {
  for (const match of html.matchAll(/<iframe\b[^>]*>/gi)) {
    const tag = match[0];
    if (!attr(tag, "title")) {
      failures.push(`${relative(file)} -> iframe missing title`);
    }
    if (attr(tag, "loading") !== "lazy") {
      failures.push(`${relative(file)} -> iframe should use loading="lazy"`);
    }
    if (!attr(tag, "allow")) {
      failures.push(`${relative(file)} -> iframe missing allow permissions`);
    }
  }
}

function verifyButtons(html, file) {
  for (const match of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
    const tag = match[0];
    const label = stripTags(match[1]) || attr(tag, "aria-label") || attr(tag, "title");
    if (!label) {
      failures.push(`${relative(file)} -> button missing accessible name: ${tag.slice(0, 140)}`);
    }
  }
}

function verifyFormControls(html, file) {
  for (const match of html.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/gi)) {
    const label = match[0];
    const inner = stripTags(label);
    if (/<(?:input|select|textarea)\b/i.test(label) && !inner) {
      failures.push(`${relative(file)} -> wrapped form control label has no visible text`);
    }
  }

  for (const match of html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const tag = match[0];
    const type = attr(tag, "type").toLowerCase();
    if (["hidden", "submit", "button", "checkbox", "radio"].includes(type)) continue;
    if (hasAttr(tag, "aria-hidden")) continue;
    if (attr(tag, "aria-label") || attr(tag, "aria-labelledby")) continue;

    const id = attr(tag, "id");
    if (id && new RegExp(`<label\\b[^>]*\\bfor=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(html)) continue;

    const before = html.slice(0, match.index);
    if (before.toLowerCase().lastIndexOf("<label") > before.toLowerCase().lastIndexOf("</label>")) continue;

    failures.push(`${relative(file)} -> form control missing label: ${tag.slice(0, 140)}`);
  }
}

if (!fs.existsSync(distDir)) {
  console.error("dist/ does not exist. Run pnpm build before pnpm verify:accessibility.");
  process.exit(1);
}

walk(distDir);

for (const file of htmlFiles) {
  if (!isFrontHtml(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  verifyImages(html, file);
  verifyIframes(html, file);
  verifyButtons(html, file);
  verifyFormControls(html, file);
}

if (failures.length) {
  console.error("Accessibility verification failed:");
  failures.slice(0, 120).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 120) console.error(`...and ${failures.length - 120} more`);
  process.exit(1);
}

console.log(`ok - verified accessibility basics in ${htmlFiles.length} built HTML files`);
