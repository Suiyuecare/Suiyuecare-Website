import assert from "node:assert/strict";
import {
  EDITORIAL_IDENTITY_FIELDS, editorialFieldName, editorialFormValues,
  mergeEditorialFormValues, validateEditorialFormValues
} from "../src/admin/article-editorial-fields.mjs";

const defaults = { author_name: "歲悅日照團隊", author_title: "既有編輯署名" };
const original = {
  untouched_extension: { keep: [1, 2, 3] }, related_slugs: ["article7"],
  editorial: {
    unknown_policy: { version: 3 },
    author: { type: "Organization", name: "歲悅日照團隊", role: "原有職稱", credentials: "原有資料", profileUrl: "https://example.org/author", unknown_identity: ["keep"] },
    reviewer: { type: "Person", name: "測試審閱者", url: "https://example.org/reviewer", unknown_review: true },
    reviewedAt: "2026-09-01T16:45:30.123456+00:00", sourceCheckedAt: "2026-09-01"
  }
};
const frozen = JSON.stringify(original);
const initial = editorialFormValues(original, defaults);
assert.equal(initial.editorial_reviewedAt, "2026-09-02");
assert.equal(initial.editorial_author_url, "https://example.org/author");
assert.strictEqual(mergeEditorialFormValues(original, initial, { ...initial }), original, "untouched save must retain exact JSON");
assert.equal(mergeEditorialFormValues(original, initial, initial).editorial.reviewedAt, original.editorial.reviewedAt, "untouched ISO date precision must survive");

const edited = { ...initial, editorial_author_credentials: "新資料", editorial_contentUpdatedAt: "2026-09-11" };
const saved = mergeEditorialFormValues(original, initial, edited);
assert.equal(saved.editorial.author.credentials, "新資料");
assert.equal(saved.editorial.contentUpdatedAt, "2026-09-11");
assert.deepEqual(saved.untouched_extension, original.untouched_extension);
assert.deepEqual(saved.editorial.unknown_policy, original.editorial.unknown_policy);
assert.deepEqual(saved.editorial.author.unknown_identity, ["keep"]);
assert.equal(saved.editorial.author.profileUrl, original.editorial.author.profileUrl);
assert.equal(JSON.stringify(original), frozen, "merger must not mutate the loaded article");

const urlCleared = mergeEditorialFormValues(original, initial, { ...initial, editorial_author_url: "", editorial_sourceCheckedAt: "" });
assert.equal(Object.hasOwn(urlCleared.editorial.author, "url"), false);
assert.equal(Object.hasOwn(urlCleared.editorial.author, "profileUrl"), false);
assert.equal(Object.hasOwn(urlCleared.editorial, "sourceCheckedAt"), false);
const reviewerCleared = { ...initial, editorial_reviewedAt: "" };
for (const { key } of EDITORIAL_IDENTITY_FIELDS) reviewerCleared[editorialFieldName("reviewer", key)] = "";
const cleared = mergeEditorialFormValues(original, initial, reviewerCleared, { clearedGroups: ["reviewer"] });
assert.deepEqual(cleared.editorial.reviewer, { unknown_review: true });
assert.equal(Object.hasOwn(cleared.editorial, "reviewedAt"), false);

const noEditorial = { other: { untouched: true } };
const defaultValues = editorialFormValues(noEditorial, defaults);
assert.equal(defaultValues.editorial_author_name, defaults.author_name);
assert.equal(defaultValues.editorial_author_role, defaults.author_title);
assert.equal(defaultValues.editorial_author_type, "", "do not invent a person or organization type");
assert.equal(defaultValues.editorial_reviewedAt, "", "do not auto-fill dates");
assert.strictEqual(mergeEditorialFormValues(noEditorial, defaultValues, defaultValues), noEditorial);
const activated = mergeEditorialFormValues(noEditorial, defaultValues, { ...defaultValues, editorial_author_type: "Organization" });
assert.deepEqual(activated.editorial.author, { type: "Organization", name: defaults.author_name, role: defaults.author_title });
assert.equal(activated.editorial.reviewedAt, undefined);
const emptyValues = Object.fromEntries(Object.keys(defaultValues).map((key) => [key, ""]));
const entirelyCleared = mergeEditorialFormValues({ editorial: { author: { type: "Organization", name: defaults.author_name } } }, defaultValues, emptyValues, { clearedGroups: ["author"] });
assert.equal(Object.hasOwn(entirelyCleared, "editorial"), false);

assert.deepEqual(validateEditorialFormValues(initial, initial), []);
for (const url of ["javascript:alert(1)", "data:text/html,x", "//evil.example/"]) {
  assert.equal(validateEditorialFormValues(initial, { ...initial, editorial_author_url: url })[0].name, "editorial_author_url");
}
assert.deepEqual(validateEditorialFormValues(initial, { ...initial, editorial_author_url: "/about#team" }), []);
assert.equal(validateEditorialFormValues(initial, { ...initial, editorial_reviewedAt: "2026-02-30" })[0].name, "editorial_reviewedAt");
assert.deepEqual(validateEditorialFormValues(initial, { ...initial, editorial_reviewedAt: "" }), []);
console.log("Article editorial payload verification passed: untouched JSON, date precision, defaults, partial edits, explicit clearing, unknown fields, and safe input validation.");
