const revisionFields = ["updatedAt", "updated_at", "lastmod"];
const publicationFields = ["publishedAt", "published_at", "date"];

function publicContentTime(value) {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value === "number") {
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : null;
  }

  const raw = String(value || "").trim();
  if (!raw) return null;
  const dateOnly = raw.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (dateOnly) {
    const [, yearValue, monthValue, dayValue] = dateOnly;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    // Editorial date-only values represent the start of that day in Taiwan.
    // Keep them equal to the build-time `T00:00:00+08:00` representation so
    // hydration never mistakes the same article for a newer revision.
    const time = Date.UTC(year, month - 1, day) - (8 * 60 * 60 * 1000);
    const date = new Date(time);
    const taipeiDate = new Date(time + (8 * 60 * 60 * 1000));
    return taipeiDate.getUTCFullYear() === year
      && taipeiDate.getUTCMonth() === month - 1
      && taipeiDate.getUTCDate() === day
      ? time
      : null;
  }

  const time = Date.parse(raw);
  return Number.isFinite(time) ? time : null;
}

function firstValidTime(item, fields) {
  if (!item || typeof item !== "object") return null;
  for (const field of fields) {
    const time = publicContentTime(item[field]);
    if (time !== null) return time;
  }
  return null;
}

export function normalizePublicContentHref(value = "") {
  const raw = String(value || "").trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("?")) return "";
  try {
    const url = new URL(raw, "https://www.suiyuecare.com");
    if (!["http:", "https:"].includes(url.protocol)) return "";
    const pathname = url.pathname.replace(/\/{2,}/g, "/");
    return pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  } catch {
    return "";
  }
}

export function publicContentKey(item = {}) {
  const href = normalizePublicContentHref(item?.href);
  if (href) return `href:${href}`;

  const contentKind = String(item?.contentKind || item?.content_kind || "").trim().toLowerCase();
  const slug = String(item?.slug || "").trim().replace(/^\/+|\/+$/g, "");
  return contentKind && slug ? `content:${contentKind}:${slug}` : "";
}

export function publicContentPublishedTime(item = {}) {
  return firstValidTime(item, publicationFields);
}

export function publicContentRevisionTime(item = {}) {
  return firstValidTime(item, [...revisionFields, ...publicationFields]);
}

export function selectLatestPublicContent(current, candidate) {
  if (current == null) return candidate;
  if (candidate == null) return current;

  const currentRevision = publicContentRevisionTime(current);
  const candidateRevision = publicContentRevisionTime(candidate);
  if (currentRevision === null || candidateRevision === null) return current;
  return candidateRevision > currentRevision ? candidate : current;
}

function publicContentSequence(item = {}) {
  const direct = Number(item.publicNumber ?? item.public_number);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const href = normalizePublicContentHref(item.href);
  const match = href.match(/^\/article\/article(\d+)$/i);
  return match ? Number(match[1]) : null;
}

export function mergeLatestPublicContent(...lists) {
  const entries = [];
  const entriesByKey = new Map();
  let position = 0;

  lists.forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const key = publicContentKey(item);
      const existing = key ? entriesByKey.get(key) : null;
      if (existing) {
        existing.item = selectLatestPublicContent(existing.item, item);
        return;
      }

      const entry = { item, position };
      position += 1;
      entries.push(entry);
      if (key) entriesByKey.set(key, entry);
    });
  });

  return entries
    .sort((left, right) => {
      const leftPublished = publicContentPublishedTime(left.item);
      const rightPublished = publicContentPublishedTime(right.item);
      if (leftPublished !== null && rightPublished !== null && leftPublished !== rightPublished) {
        return rightPublished - leftPublished;
      }
      if (leftPublished !== null && rightPublished === null) return -1;
      if (leftPublished === null && rightPublished !== null) return 1;
      const leftRevision = publicContentRevisionTime(left.item);
      const rightRevision = publicContentRevisionTime(right.item);
      if (leftRevision !== null && rightRevision !== null && leftRevision !== rightRevision) {
        return rightRevision - leftRevision;
      }
      const leftSequence = publicContentSequence(left.item);
      const rightSequence = publicContentSequence(right.item);
      if (leftSequence !== null && rightSequence !== null && leftSequence !== rightSequence) {
        return rightSequence - leftSequence;
      }
      return left.position - right.position;
    })
    .map(({ item }) => item);
}
