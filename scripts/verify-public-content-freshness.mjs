import assert from "node:assert/strict";
import {
  mergeLatestPublicContent,
  normalizePublicContentHref,
  publicContentKey,
  publicContentPublishedTime,
  publicContentRevisionTime,
  selectLatestPublicContent
} from "../public-content-freshness.mjs";

const staticArticle = {
  contentKind: "article",
  slug: "shared-article",
  href: "/article/shared-article/",
  title: "static article",
  publishedAt: "2026-09-08T08:00:00+08:00",
  updatedAt: "2026-09-08T08:00:00+08:00"
};
const newerCmsArticle = {
  contentKind: "article",
  slug: "legacy-cms-slug",
  href: "https://www.suiyuecare.com/article/shared-article?preview=1#content",
  title: "newer CMS article",
  published_at: "2026-09-08T08:00:00+08:00",
  updated_at: "2026-09-08T09:00:00+08:00"
};

assert.equal(normalizePublicContentHref(newerCmsArticle.href), "/article/shared-article");
assert.equal(publicContentKey(staticArticle), "href:/article/shared-article");
assert.equal(publicContentKey(newerCmsArticle), publicContentKey(staticArticle));
assert.equal(
  publicContentKey({ contentKind: "care-story", slug: "/family-a/" }),
  "content:care-story:family-a"
);
assert.equal(normalizePublicContentHref("mailto:editor@suiyuecare.com"), "");

assert.equal(publicContentRevisionTime({ updatedAt: "invalid", updated_at: "2026-09-08T10:00:00Z" }), Date.parse("2026-09-08T10:00:00Z"));
const taipeiMidnight = Date.UTC(2026, 8, 8) - (8 * 60 * 60 * 1000);
assert.equal(publicContentRevisionTime({ lastmod: "2026.09.08" }), taipeiMidnight);
assert.equal(publicContentPublishedTime({ date: "2026.02.30" }), null);
assert.equal(publicContentPublishedTime({ date: "2026.09.08" }), taipeiMidnight);
assert.equal(
  publicContentPublishedTime({ date: "2026.09.08" }),
  publicContentPublishedTime({ publishedAt: "2026-09-08T00:00:00+08:00" }),
  "Date-only editorial values and explicit Taiwan-midnight timestamps must be equivalent"
);

assert.equal(selectLatestPublicContent(staticArticle, newerCmsArticle), newerCmsArticle);
const equalRevision = { ...newerCmsArticle, title: "equal revision", updated_at: staticArticle.updatedAt };
assert.equal(selectLatestPublicContent(staticArticle, equalRevision), staticArticle, "equal revisions must preserve the first source");
assert.equal(
  selectLatestPublicContent(staticArticle, { ...newerCmsArticle, updated_at: "invalid", published_at: "invalid" }),
  staticArticle,
  "an invalid candidate revision must preserve the first source"
);
assert.equal(
  selectLatestPublicContent({ ...staticArticle, updatedAt: "invalid", publishedAt: "invalid" }, newerCmsArticle).title,
  "static article",
  "a valid candidate cannot be proven newer when the current revision is invalid"
);

const oldFeaturedArticle = {
  contentKind: "article",
  slug: "old-featured",
  href: "/article/old-featured",
  title: "old featured",
  publishedAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-02T00:00:00Z",
  isFeatured: true
};
const latestArticle = {
  contentKind: "article",
  slug: "latest",
  href: "/article/latest",
  title: "latest publication",
  publishedAt: "2026-09-09T00:00:00Z",
  updatedAt: "2026-09-09T00:00:00Z",
  isFeatured: false
};
const storyFirst = {
  contentKind: "care-story",
  slug: "family-a",
  title: "first story",
  publishedAt: "2026-07-01T00:00:00Z",
  updatedAt: "2026-07-02T00:00:00Z"
};
const storyEqual = { ...storyFirst, title: "equal CMS story", updated_at: storyFirst.updatedAt };
delete storyEqual.updatedAt;
const talkFirst = {
  contentKind: "master-talk",
  slug: "expert-a",
  title: "first talk",
  publishedAt: "invalid",
  updatedAt: "2026-06-01T00:00:00Z"
};
const talkNewer = {
  contentKind: "master-talk",
  slug: "expert-a",
  title: "newer talk",
  published_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-02T00:00:00Z"
};
const invalidPublicationA = { contentKind: "article", slug: "stable-a", title: "stable A" };
const invalidPublicationB = { contentKind: "article", slug: "stable-b", title: "stable B" };

const merged = mergeLatestPublicContent(
  [staticArticle, oldFeaturedArticle, storyFirst, talkFirst, invalidPublicationA, invalidPublicationB],
  [newerCmsArticle, latestArticle, storyEqual, talkNewer]
);

assert.deepEqual(
  merged.map((item) => item.title),
  [
    "latest publication",
    "newer CMS article",
    "first story",
    "newer talk",
    "old featured",
    "stable A",
    "stable B"
  ],
  "content must be deduplicated, newest-publication first, and stable for invalid publication dates"
);
assert.equal(merged.filter((item) => publicContentKey(item) === "href:/article/shared-article").length, 1);
assert.equal(merged.find((item) => item.slug === "family-a"), storyFirst, "an equal story revision must keep the first item");
assert.equal(merged.find((item) => item.slug === "expert-a"), talkNewer, "a newer master talk revision must replace the first item");
assert.ok(
  merged.indexOf(latestArticle) < merged.indexOf(oldFeaturedArticle),
  "an older featured item must never outrank a newer publication"
);
const sameDayArticles = mergeLatestPublicContent([
  { contentKind: "article", href: "/article/article147", publicNumber: 147, publishedAt: "2026.09.08", updatedAt: "2026.09.08" },
  { contentKind: "article", href: "/article/article149", publicNumber: 149, publishedAt: "2026-09-08T00:00:00+08:00", updatedAt: "2026-09-08T00:00:00+08:00" },
  { contentKind: "article", href: "/article/article148", publicNumber: 148, publishedAt: "2026.09.08", updatedAt: "2026.09.08" }
]);
assert.deepEqual(
  sameDayArticles.map((item) => item.publicNumber),
  [149, 148, 147],
  "Articles published on the same editorial day must use the newest public number first"
);
assert.equal(staticArticle.title, "static article", "merge must not mutate input records");

console.log("ok - public content freshness keeps one canonical item, selects only strictly newer revisions, and sorts by latest publication");
