import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const rootDir = path.resolve(import.meta.dirname, "..");
const outputFile = path.join(rootDir, "public", "cms-fallbacks.json");
const checkOnly = process.argv.includes("--check");
const serviceSlugs = [
  "about",
  "milestones",
  "home-care",
  "day-care",
  "community",
  "nursing",
  "migrant-training",
  "quality",
  "software"
];

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
    process.env[match[1]] = value;
  }
}

[".env.local", ".env.production.local", ".env"].forEach((file) => loadEnvFile(path.join(rootDir, file)));

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});
const now = new Date().toISOString();

async function rows(label, query) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function single(label, query) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || null;
}

const [
  serviceFields,
  recruitingPages,
  recruitingDepartments,
  recruitingOpenings,
  courses,
  milestones,
  articles,
  articleCategories,
  careStories,
  expertTalks,
  homeModules,
  homePage,
  siteSettings
] = await Promise.all([
  rows(
    "page_template_fields",
    supabase
      .from("page_template_fields")
      .select("*")
      .in("page_slug", serviceSlugs)
      .eq("is_enabled", true)
      .order("page_slug")
      .order("sort_order")
  ),
  rows(
    "recruiting_pages",
    supabase
      .from("recruiting_pages")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("page_slug")
  ),
  rows(
    "recruiting_departments",
    supabase
      .from("recruiting_departments")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("page_slug")
      .order("sort_order")
  ),
  rows(
    "recruiting_openings",
    supabase
      .from("recruiting_openings")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("page_slug")
      .order("is_featured", { ascending: false })
      .order("sort_order")
  ),
  rows(
    "courses",
    supabase
      .from("courses")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("starts_at", { nullsFirst: false })
  ),
  rows(
    "milestones",
    supabase
      .from("milestones")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("sort_order")
  ),
  rows(
    "articles",
    supabase
      .from("articles")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(100)
  ),
  rows(
    "article_categories",
    supabase
      .from("article_categories")
      .select("*")
      .eq("is_enabled", true)
      .order("sort_order")
      .order("name")
  ),
  rows(
    "care_stories",
    supabase
      .from("care_stories")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("sort_order")
  ),
  rows(
    "expert_talks",
    supabase
      .from("expert_talks")
      .select("*")
      .eq("is_enabled", true)
      .eq("status", "published")
      .lte("published_at", now)
      .order("sort_order")
  ),
  rows(
    "content_modules",
    supabase
      .from("content_modules")
      .select("*")
      .eq("target_slug", "home")
      .eq("is_enabled", true)
      .eq("status", "published")
      .order("module_key")
      .order("sort_order")
  ),
  single(
    "home page",
    supabase
      .from("pages")
      .select("*")
      .eq("slug", "home")
      .eq("is_enabled", true)
      .eq("status", "published")
      .maybeSingle()
  ),
  rows(
    "site_settings",
    supabase
      .from("site_settings")
      .select("*")
      .eq("is_enabled", true)
      .order("sort_order")
  )
]);

const homeSections = homePage
  ? await rows(
      "home page_sections",
      supabase
        .from("page_sections")
        .select("*")
        .eq("page_id", homePage.id)
        .eq("is_enabled", true)
        .eq("status", "published")
        .order("sort_order")
    )
  : [];

const mediaIds = [...new Set([
  ...serviceFields.map((item) => item.image_id),
  ...recruitingPages.flatMap((item) => [item.hero_image_id, item.image_id]),
  ...recruitingDepartments.flatMap((item) => [item.hero_image_id, item.image_id]),
  ...recruitingOpenings.flatMap((item) => [item.hero_image_id, item.image_id]),
  ...courses.map((item) => item.cover_image_id),
  ...milestones.map((item) => item.image_id),
  ...articles.map((item) => item.cover_image_id),
  ...careStories.flatMap((item) => [item.cover_image_id, item.avatar_image_id]),
  ...expertTalks.map((item) => item.image_id),
  ...homeModules.map((item) => item.image_id),
  ...homeSections.map((item) => item.image_id)
].filter(Boolean))];

const media = mediaIds.length
  ? await rows(
      "media",
      supabase
        .from("media")
        .select("id, public_url, alt_text, file_name, image_usage, focal_point")
        .in("id", mediaIds)
        .order("id")
    )
  : [];

const payload = {
  schemaVersion: 1,
  serviceSlugs,
  serviceFields,
  recruitingPages,
  recruitingDepartments,
  recruitingOpenings,
  courses,
  milestones,
  articles,
  articleCategories,
  careStories,
  expertTalks,
  homeModules,
  homePage,
  homeSections,
  siteSettings,
  media
};
const canonicalPayload = JSON.stringify(payload);
const contentHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
const snapshot = {
  generatedAt: new Date().toISOString(),
  contentHash,
  ...payload
};
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;

if (checkOnly) {
  if (!fs.existsSync(outputFile)) {
    throw new Error("CMS fallback snapshot is missing. Run pnpm cms:fallbacks:sync.");
  }
  const current = JSON.parse(fs.readFileSync(outputFile, "utf8"));
  if (current.contentHash !== contentHash) {
    throw new Error("CMS fallback snapshot differs from the currently published CMS content.");
  }
  console.log(`ok - CMS fallback snapshot matches published content (${contentHash.slice(0, 12)})`);
} else {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, serialized);
  console.log(`ok - wrote ${path.relative(rootDir, outputFile)} (${contentHash.slice(0, 12)})`);
}
