import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const file = path.resolve("public/cms-fallbacks.json");
const failures = [];
const requiredServiceSlugs = [
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
const requiredRecruitingSlugs = ["talent", "land", "investor-recruiting"];

if (!fs.existsSync(file)) {
  failures.push("public/cms-fallbacks.json is missing");
} else {
  const snapshot = JSON.parse(fs.readFileSync(file, "utf8"));
  const {
    generatedAt,
    contentHash,
    schemaVersion,
    ...payload
  } = snapshot;
  const expectedHash = crypto.createHash("sha256").update(JSON.stringify({ schemaVersion, ...payload })).digest("hex");

  if (schemaVersion !== 1) failures.push("CMS fallback snapshot schemaVersion must be 1");
  if (!generatedAt || Number.isNaN(new Date(generatedAt).getTime())) failures.push("CMS fallback snapshot generatedAt is invalid");
  if (contentHash !== expectedHash) failures.push("CMS fallback snapshot contentHash does not match its payload");

  for (const slug of requiredServiceSlugs) {
    const fields = (snapshot.serviceFields || []).filter((field) => field.page_slug === slug);
    for (const fieldKey of ["hero_title", "hero_body"]) {
      if (!fields.some((field) => field.field_key === fieldKey)) {
        failures.push(`${slug}: fallback snapshot is missing ${fieldKey}`);
      }
    }
    const keys = fields.map((field) => field.field_key);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    if (duplicates.length) failures.push(`${slug}: duplicate fallback field keys: ${[...new Set(duplicates)].join(", ")}`);
  }

  for (const slug of requiredRecruitingSlugs) {
    if (!(snapshot.recruitingPages || []).some((page) => page.page_slug === slug)) {
      failures.push(`${slug}: fallback snapshot is missing its recruiting page`);
    }
  }

  if (!(snapshot.courses || []).length) failures.push("fallback snapshot must include published courses");
  if (!(snapshot.milestones || []).length) failures.push("fallback snapshot must include published milestones");
  if (!(snapshot.articles || []).length) failures.push("fallback snapshot must include published articles");

  const serialized = JSON.stringify(snapshot).toLowerCase();
  for (const privateMarker of ["service_role", "password_hash", "resume_storage_path", "applicant_phone"]) {
    if (serialized.includes(privateMarker)) failures.push(`fallback snapshot contains private marker: ${privateMarker}`);
  }
}

if (failures.length) {
  console.error("CMS fallback snapshot verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("ok - CMS fallback snapshot is complete, valid, and contains no private form data");
