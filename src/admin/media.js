import { supabase } from "../lib/supabaseClient.js";
import { fetchMediaImages, getFocalPointOption, getImageUsageOption, prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const uploadForm = document.querySelector("#adminMediaUploadForm");
const mediaStatus = document.querySelector("#adminMediaStatus");
const mediaGrid = document.querySelector("#adminMediaGrid");
const refreshMediaButton = document.querySelector("#adminRefreshMedia");
const mediaSearchInput = document.querySelector("#adminMediaSearch");
const mediaUsageFilter = document.querySelector("#adminMediaUsageFilter");
const mediaTypeFilter = document.querySelector("#adminMediaTypeFilter");
const mediaCountTargets = {
  total: document.querySelector('[data-media-count="total"]'),
  used: document.querySelector('[data-media-count="used"]'),
  unused: document.querySelector('[data-media-count="unused"]'),
  missingAlt: document.querySelector('[data-media-count="missingAlt"]')
};

let mediaUsageMap = new Map();
let mediaItems = [];

function setMediaStatus(message, type = "info") {
  if (!mediaStatus) return;
  mediaStatus.hidden = !message;
  mediaStatus.textContent = message;
  mediaStatus.dataset.status = type;
}

function addUsage(usageMap, mediaId, usage) {
  if (!mediaId) return;
  const list = usageMap.get(mediaId) || [];
  const normalizedUsage = {
    front: getUsageFrontHint(usage.type),
    field: getUsageFieldHint(usage.type),
    ...usage
  };
  const key = `${normalizedUsage.type}|${normalizedUsage.title}|${normalizedUsage.href}|${normalizedUsage.field}`;
  if (!list.some((item) => `${item.type}|${item.title}|${item.href}|${item.field}` === key)) {
    list.push(normalizedUsage);
  }
  usageMap.set(mediaId, list);
}

function getUsageFrontHint(type = "") {
  if (type.includes("Hero")) return "前台頁面頂部 Hero";
  if (type.includes("OG")) return "社群分享預覽圖";
  if (type.includes("頁面區塊")) return "前台頁面內容區塊";
  if (type.includes("服務頁")) return "服務項目子頁固定版型";
  if (type.includes("首頁")) return "首頁模組";
  if (type.includes("文章分類")) return "Health 3.0 分類卡片";
  if (type.includes("文章")) return "Health 3.0 列表與文章內頁";
  if (type.includes("課程")) return "課程報名卡片與輪播";
  if (type.includes("真實照顧")) return "首頁真實照顧情境";
  if (type.includes("名人講堂")) return "Health 3.0 名人講堂";
  if (type.includes("招募") || type.includes("職缺")) return "招募與合作頁面";
  if (type.includes("全站")) return "Header / Footer / 全站固定文字";
  if (type.includes("投資人")) return "投資人專區";
  if (type.includes("檔案下載")) return "下載資料或投資人附件";
  return "前台或後台內容";
}

function getUsageFieldHint(type = "") {
  if (type.includes("URL")) return "以圖片 URL 方式引用";
  if (type.includes("Hero")) return "Hero 圖片欄位";
  if (type.includes("OG")) return "SEO / 社群分享圖欄位";
  if (type.includes("封面")) return "封面圖欄位";
  if (type.includes("頭像")) return "人物頭像欄位";
  if (type.includes("Logo")) return "Logo 圖片欄位";
  if (type.includes("分類")) return "分類圖片欄位";
  if (type.includes("卡片")) return "卡片圖片欄位";
  return "圖片欄位";
}

function normalizeMediaReference(value) {
  if (!value || typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+/, "")
    .split("?")[0]
    .split("#")[0];
}

function collectStringValues(value, values = []) {
  if (!value) return values;
  if (typeof value === "string") {
    values.push(value);
    return values;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, values));
    return values;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectStringValues(item, values));
  }
  return values;
}

function createMediaReferenceMap(items) {
  const lookup = new Map();
  items.forEach((item) => {
    [
      item.public_url,
      item.storage_path,
      item.storage_path ? `/${item.storage_path}` : "",
      item.storage_path ? `assets/${item.storage_path.split("/").pop()}` : ""
    ].forEach((reference) => {
      const normalized = normalizeMediaReference(reference);
      if (!normalized) return;
      const ids = lookup.get(normalized) || new Set();
      ids.add(item.id);
      lookup.set(normalized, ids);
    });
  });
  return lookup;
}

async function safeUsageQuery(table, select, column, mediaIds, makeUsage) {
  if (!mediaIds.length) return [];
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .in(column, mediaIds);

  if (error) {
    console.warn(`Failed to read media usage from ${table}.${column}`, error);
    return [];
  }

  return (data || []).map((row) => ({ mediaId: row[column], ...makeUsage(row) })).filter((item) => item.mediaId);
}

async function safeUrlUsageQuery(table, select, mediaReferenceMap, getReferences, makeUsage) {
  if (!mediaReferenceMap.size) return [];
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .limit(1000);

  if (error) {
    console.warn(`Failed to read media URL usage from ${table}`, error);
    return [];
  }

  const usages = [];
  (data || []).forEach((row) => {
    const references = getReferences(row).map(normalizeMediaReference).filter(Boolean);
    references.forEach((reference) => {
      const mediaIds = mediaReferenceMap.get(reference);
      if (!mediaIds) return;
      mediaIds.forEach((mediaId) => usages.push({ mediaId, ...makeUsage(row) }));
    });
  });
  return usages;
}

async function fetchMediaUsage(items) {
  const mediaIds = items.map((item) => item.id).filter(Boolean);
  const usageMap = new Map(mediaIds.map((id) => [id, []]));
  const mediaReferenceMap = createMediaReferenceMap(items);
  if (!mediaIds.length) return usageMap;

  const usageGroups = await Promise.all([
    safeUsageQuery("pages", "id, title, slug, hero_image_id", "hero_image_id", mediaIds, (row) => ({
      type: "頁面 Hero",
      title: row.title || row.slug || "未命名頁面",
      href: `/admin/pages/${encodeURIComponent(row.id)}`
    })),
    safeUsageQuery("pages", "id, title, slug, og_image_id", "og_image_id", mediaIds, (row) => ({
      type: "頁面 OG 圖",
      title: row.title || row.slug || "未命名頁面",
      href: `/admin/pages/${encodeURIComponent(row.id)}`
    })),
    safeUsageQuery("page_sections", "id, page_id, section_key, title, image_id", "image_id", mediaIds, (row) => ({
      type: "頁面區塊",
      title: row.title || row.section_key || "未命名區塊",
      href: row.page_id ? `/admin/pages/${encodeURIComponent(row.page_id)}` : "/admin/pages"
    })),
    safeUsageQuery("page_template_fields", "id, page_slug, field_label, field_key, image_id", "image_id", mediaIds, (row) => ({
      type: "服務頁固定內容",
      title: `${row.page_slug || "頁面"}｜${row.field_label || row.field_key || "圖片欄位"}`,
      href: "/admin/pages"
    })),
    safeUsageQuery("content_modules", "id, module_key, title, item_key, image_id", "image_id", mediaIds, (row) => ({
      type: "首頁固定內容",
      title: row.title || row.item_key || row.module_key || "未命名模組",
      href: "/admin/pages"
    })),
    safeUsageQuery("articles", "id, slug, title, cover_image_id", "cover_image_id", mediaIds, (row) => ({
      type: "文章封面",
      title: row.title || row.slug || "未命名文章",
      href: `/admin/articles/${encodeURIComponent(row.id)}`
    })),
    safeUsageQuery("articles", "id, slug, title, author_avatar_id", "author_avatar_id", mediaIds, (row) => ({
      type: "文章作者頭像",
      title: row.title || row.slug || "未命名文章",
      href: `/admin/articles/${encodeURIComponent(row.id)}`
    })),
    safeUsageQuery("articles", "id, slug, title, og_image_id", "og_image_id", mediaIds, (row) => ({
      type: "文章 OG 圖",
      title: row.title || row.slug || "未命名文章",
      href: `/admin/articles/${encodeURIComponent(row.id)}`
    })),
    safeUsageQuery("article_categories", "id, name, slug, image_id", "image_id", mediaIds, (row) => ({
      type: "文章分類",
      title: row.name || row.slug || "未命名分類",
      href: "/admin/categories"
    })),
    safeUsageQuery("courses", "id, title, cover_image_id", "cover_image_id", mediaIds, (row) => ({
      type: "課程封面",
      title: row.title || "未命名課程",
      href: "/admin/courses"
    })),
    safeUsageQuery("care_stories", "id, title, person_name, cover_image_id", "cover_image_id", mediaIds, (row) => ({
      type: "真實照顧情境封面",
      title: row.title || row.person_name || "未命名故事",
      href: "/admin/articles"
    })),
    safeUsageQuery("care_stories", "id, title, person_name, avatar_image_id", "avatar_image_id", mediaIds, (row) => ({
      type: "真實照顧情境頭像",
      title: row.person_name || row.title || "未命名故事",
      href: "/admin/articles"
    })),
    safeUsageQuery("expert_talks", "id, title, speaker_name, image_id", "image_id", mediaIds, (row) => ({
      type: "名人講堂圖片",
      title: row.title || row.speaker_name || "未命名講堂",
      href: "/admin/articles"
    })),
    safeUsageQuery("recruiting_pages", "id, page_slug, title, hero_image_id", "hero_image_id", mediaIds, (row) => ({
      type: "招募頁 Hero",
      title: row.title || row.page_slug || "未命名招募頁",
      href: "/admin/recruiting"
    })),
    safeUsageQuery("recruiting_departments", "id, page_slug, title, image_id", "image_id", mediaIds, (row) => ({
      type: "招募部門圖片",
      title: row.title || row.page_slug || "未命名部門",
      href: "/admin/recruiting"
    })),
    safeUsageQuery("recruiting_openings", "id, page_slug, title, image_id", "image_id", mediaIds, (row) => ({
      type: "職缺卡片圖片",
      title: row.title || row.page_slug || "未命名職缺",
      href: "/admin/recruiting"
    })),
    safeUsageQuery("site_settings", "id, setting_label, setting_key, media_id", "media_id", mediaIds, (row) => ({
      type: "全站固定內容",
      title: row.setting_label || row.setting_key || "全站圖片",
      href: "/admin/pages"
    })),
    safeUrlUsageQuery("pages", "id, title, slug, content_json", mediaReferenceMap, (row) => collectStringValues(row.content_json), (row) => ({
      type: "頁面內容圖片 URL",
      title: row.title || row.slug || "未命名頁面",
      href: `/admin/pages/${encodeURIComponent(row.id)}`
    })),
    safeUrlUsageQuery("page_sections", "id, page_id, section_key, title, content_json", mediaReferenceMap, (row) => collectStringValues(row.content_json), (row) => ({
      type: "頁面區塊圖片 URL",
      title: row.title || row.section_key || "未命名區塊",
      href: row.page_id ? `/admin/pages/${encodeURIComponent(row.page_id)}` : "/admin/pages"
    })),
    safeUrlUsageQuery("page_template_fields", "id, page_slug, field_label, field_key, text_value, json_value", mediaReferenceMap, (row) => [
      row.text_value,
      ...collectStringValues(row.json_value)
    ], (row) => ({
      type: "服務頁固定內容 URL",
      title: `${row.page_slug || "頁面"}｜${row.field_label || row.field_key || "圖片欄位"}`,
      href: "/admin/pages"
    })),
    safeUrlUsageQuery("content_modules", "id, module_key, title, item_key, metadata", mediaReferenceMap, (row) => collectStringValues(row.metadata), (row) => ({
      type: "首頁模組圖片 URL",
      title: row.title || row.item_key || row.module_key || "未命名模組",
      href: "/admin/pages"
    })),
    safeUrlUsageQuery("articles", "id, slug, title, subtitle, excerpt, content, content_json", mediaReferenceMap, (row) => [
      row.subtitle,
      row.excerpt,
      row.content,
      ...collectStringValues(row.content_json)
    ], (row) => ({
      type: "文章內文圖片 URL",
      title: row.title || row.slug || "未命名文章",
      href: `/admin/articles/${encodeURIComponent(row.id)}`
    })),
    safeUrlUsageQuery("care_stories", "id, title, person_name, cover_image_url, avatar_image_url", mediaReferenceMap, (row) => [row.cover_image_url, row.avatar_image_url], (row) => ({
      type: "真實照顧情境圖片 URL",
      title: row.title || row.person_name || "未命名故事",
      href: "/admin/articles"
    })),
    safeUrlUsageQuery("expert_talks", "id, title, speaker_name, image_url", mediaReferenceMap, (row) => [row.image_url], (row) => ({
      type: "名人講堂圖片 URL",
      title: row.title || row.speaker_name || "未命名講堂",
      href: "/admin/articles"
    })),
    safeUrlUsageQuery("recruiting_pages", "id, page_slug, title, hero_image_url", mediaReferenceMap, (row) => [row.hero_image_url], (row) => ({
      type: "招募頁 Hero URL",
      title: row.title || row.page_slug || "未命名招募頁",
      href: "/admin/recruiting"
    })),
    safeUrlUsageQuery("recruiting_departments", "id, page_slug, title, image_url, gallery", mediaReferenceMap, (row) => [row.image_url, ...collectStringValues(row.gallery)], (row) => ({
      type: "招募部門圖片 URL",
      title: row.title || row.page_slug || "未命名部門",
      href: "/admin/recruiting"
    })),
    safeUrlUsageQuery("recruiting_openings", "id, page_slug, title, image_url", mediaReferenceMap, (row) => [row.image_url], (row) => ({
      type: "職缺圖片 URL",
      title: row.title || row.page_slug || "未命名職缺",
      href: "/admin/recruiting"
    })),
    safeUrlUsageQuery("site_settings", "id, setting_label, setting_key, value_text, value_json", mediaReferenceMap, (row) => [
      row.value_text,
      ...collectStringValues(row.value_json)
    ], (row) => ({
      type: "全站固定內容 URL",
      title: row.setting_label || row.setting_key || "全站圖片",
      href: "/admin/pages"
    })),
    safeUrlUsageQuery("investor_notices", "id, notice_type, title, summary, body, link_url, metadata", mediaReferenceMap, (row) => [
      row.summary,
      row.body,
      row.link_url,
      ...collectStringValues(row.metadata)
    ], (row) => ({
      type: "投資人公告圖片 URL",
      title: row.title || row.notice_type || "未命名公告",
      href: "/admin/investor-data"
    })),
    safeUrlUsageQuery("investor_financial_items", "id, item_type, period_label, title, note, metadata", mediaReferenceMap, (row) => [
      row.note,
      ...collectStringValues(row.metadata)
    ], (row) => ({
      type: "投資人財務資料圖片 URL",
      title: `${row.period_label || ""} ${row.title || row.item_type || "未命名財務資料"}`.trim(),
      href: "/admin/investor-data"
    })),
    safeUrlUsageQuery("investor_chart_datasets", "id, page_slug, chart_title, chart_key, data_points, metadata", mediaReferenceMap, (row) => [
      ...collectStringValues(row.data_points),
      ...collectStringValues(row.metadata)
    ], (row) => ({
      type: "投資人圖表圖片 URL",
      title: row.chart_title || row.chart_key || "未命名圖表",
      href: "/admin/investor-data"
    })),
    safeUrlUsageQuery("downloadable_files", "id, title, category, public_url, storage_path, metadata", mediaReferenceMap, (row) => [
      row.public_url,
      row.storage_path,
      ...collectStringValues(row.metadata)
    ], (row) => ({
      type: "檔案下載 URL",
      title: row.title || row.category || "未命名下載檔",
      href: "/admin/investor-data"
    }))
  ]);

  usageGroups.flat().forEach((usage) => addUsage(usageMap, usage.mediaId, usage));
  return usageMap;
}

function renderUsageSummary(item) {
  const usages = mediaUsageMap.get(item.id) || [];
  if (!usages.length) {
    return `
      <div class="admin-media-usage empty">
        <strong>使用位置：未偵測到引用</strong>
        <span>目前沒有在頁面、文章、課程、招募、投資人或全站設定中找到這張圖片。若是手動貼在外部平台，仍建議再確認一次。</span>
      </div>
    `;
  }

  const visibleUsages = usages.slice(0, 6);
  const restCount = Math.max(0, usages.length - visibleUsages.length);
  const hiddenUsages = usages.slice(visibleUsages.length);
  return `
    <div class="admin-media-usage">
      <strong>使用位置：${usages.length} 個</strong>
      <span>刪除前請先到下列位置更換圖片，避免前台缺圖或版面跑掉。</span>
      <ul>
        ${visibleUsages.map((usage) => `
          <li>
            <a href="${escapeHTML(usage.href)}">${escapeHTML(usage.type)}</a>
            <span>${escapeHTML(usage.title)}</span>
            <small>${escapeHTML(usage.front || "前台內容")} · ${escapeHTML(usage.field || "圖片欄位")}</small>
          </li>
        `).join("")}
      </ul>
      ${restCount ? `
        <details>
          <summary>另有 ${restCount} 個位置，展開查看</summary>
          <ul>
            ${hiddenUsages.map((usage) => `
              <li>
                <a href="${escapeHTML(usage.href)}">${escapeHTML(usage.type)}</a>
                <span>${escapeHTML(usage.title)}</span>
                <small>${escapeHTML(usage.front || "前台內容")} · ${escapeHTML(usage.field || "圖片欄位")}</small>
              </li>
            `).join("")}
          </ul>
        </details>
      ` : ""}
    </div>
  `;
}

function renderMedia(items) {
  if (!mediaGrid) return;

  if (!items.length) {
    mediaGrid.innerHTML = `<div class="admin-empty-state">${mediaItems.length ? "沒有符合篩選條件的圖片。" : "目前沒有圖片。請先上傳第一張圖片。"}</div>`;
    return;
  }

  mediaGrid.innerHTML = items.map((item) => {
    const usages = mediaUsageMap.get(item.id) || [];
    return `
    <article class="admin-media-card" data-media-id="${escapeHTML(item.id)}" data-bucket="${escapeHTML(item.bucket)}" data-path="${escapeHTML(item.storage_path)}" data-usage-count="${usages.length}">
      <figure data-image-usage="${escapeHTML(item.image_usage || "card")}" data-focal-point="${escapeHTML(item.focal_point || "center")}">
        <img src="${escapeHTML(item.public_url || "")}" alt="${escapeHTML(item.alt_text || item.file_name || "媒體圖片")}" loading="lazy" />
      </figure>
      <div>
        <strong>${escapeHTML(item.file_name || "未命名圖片")}</strong>
        <span>${escapeHTML(item.alt_text || "尚未填寫 alt text")}</span>
        <span>用途：${escapeHTML(getImageUsageOption(item.image_usage)?.label || "卡片縮圖")} · 焦點：${escapeHTML(getFocalPointOption(item.focal_point)?.label || "置中")}</span>
        <span>${item.width && item.height ? `${item.width} × ${item.height}` : "尺寸未記錄"}</span>
        ${renderUsageSummary(item)}
        <code>${escapeHTML(item.public_url || "")}</code>
        <time>上傳時間：${formatUpdatedAt(item.created_at)}</time>
        <button type="button" data-delete-media data-has-usage="${usages.length ? "true" : "false"}">${usages.length ? "已使用，仍要刪除" : "刪除圖片"}</button>
      </div>
    </article>
  `;
  }).join("");
}

function updateMediaCounts(items = mediaItems) {
  const used = items.filter((item) => (mediaUsageMap.get(item.id) || []).length > 0).length;
  const missingAlt = items.filter((item) => !String(item.alt_text || "").trim()).length;
  const counts = {
    total: items.length,
    used,
    unused: Math.max(0, items.length - used),
    missingAlt
  };
  Object.entries(counts).forEach(([key, value]) => {
    if (mediaCountTargets[key]) mediaCountTargets[key].textContent = String(value);
  });
}

function matchesSearch(item, query) {
  if (!query) return true;
  const usageText = (mediaUsageMap.get(item.id) || [])
    .map((usage) => [usage.type, usage.title, usage.front, usage.field].filter(Boolean).join(" "))
    .join(" ");
  const haystack = [
    item.file_name,
    item.alt_text,
    item.caption,
    item.public_url,
    item.storage_path,
    getImageUsageOption(item.image_usage)?.label,
    getFocalPointOption(item.focal_point)?.label,
    usageText
  ].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function applyMediaFilters() {
  const query = mediaSearchInput?.value?.trim() || "";
  const usageFilter = mediaUsageFilter?.value || "all";
  const typeFilter = mediaTypeFilter?.value || "all";

  const filtered = mediaItems.filter((item) => {
    const usageCount = (mediaUsageMap.get(item.id) || []).length;
    const hasAlt = Boolean(String(item.alt_text || "").trim());
    if (!matchesSearch(item, query)) return false;
    if (typeFilter !== "all" && (item.image_usage || "card") !== typeFilter) return false;
    if (usageFilter === "used" && !usageCount) return false;
    if (usageFilter === "unused" && usageCount) return false;
    if (usageFilter === "missing-alt" && hasAlt) return false;
    return true;
  });

  renderMedia(filtered);
}

async function loadMedia() {
  if (!supabase) return;
  refreshMediaButton?.setAttribute("disabled", "true");
  setMediaStatus("正在讀取圖片列表...", "info");

  try {
    const data = await fetchMediaImages();
    setMediaStatus("正在比對圖片使用位置...", "info");
    mediaUsageMap = await fetchMediaUsage(data);
    mediaItems = data;
    updateMediaCounts(mediaItems);
    applyMediaFilters();
    setMediaStatus("", "success");
  } catch (error) {
    console.error("Failed to load media", error);
    setMediaStatus(`無法讀取圖片列表：${error.message}`, "error");
    mediaItems = [];
    updateMediaCounts(mediaItems);
    renderMedia([]);
  } finally {
    refreshMediaButton?.removeAttribute("disabled");
  }
}

async function uploadMedia(event) {
  event.preventDefault();
  if (!supabase || !uploadForm) return;

  const fileInput = uploadForm.elements.file;
  const file = fileInput.files?.[0];
  if (!file) {
    setMediaStatus("請先選擇圖片檔案。", "error");
    return;
  }
  if (!file.type.startsWith("image/")) {
    setMediaStatus("只支援圖片檔案。", "error");
    return;
  }

  const submitButton = document.querySelector('button[form="adminMediaUploadForm"]');
  submitButton?.setAttribute("disabled", "true");
  setMediaStatus("正在檢查圖片比例...", "info");

  try {
    const preparedFile = await prepareImageForUpload(file, uploadForm.elements.image_usage.value);
    if (!preparedFile) {
      setMediaStatus("已取消上傳。", "info");
      return;
    }
    setMediaStatus("正在上傳圖片到 Supabase Storage...", "info");
    await uploadImageToMedia({
      file: preparedFile,
      altText: uploadForm.elements.alt_text.value,
      caption: uploadForm.elements.caption.value,
      imageUsage: uploadForm.elements.image_usage.value,
      focalPoint: uploadForm.elements.focal_point.value
    });

    uploadForm.reset();
    setMediaStatus("圖片已上傳並寫入 media 資料表。", "success");
    await loadMedia();
  } catch (error) {
    console.error("Failed to upload media", error);
    setMediaStatus(`上傳失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

async function deleteMedia(card) {
  const mediaId = card.dataset.mediaId;
  const bucket = card.dataset.bucket;
  const storagePath = card.dataset.path;
  if (!mediaId || !bucket || !storagePath) return;
  const usages = mediaUsageMap.get(mediaId) || [];
  const usageText = usages.length
    ? `\n\n這張圖片目前被 ${usages.length} 個位置使用：\n${usages.slice(0, 6).map((usage) => `- ${usage.type}：${usage.title}`).join("\n")}\n\n刪除後相關頁面可能會缺圖，建議先到對應位置更換圖片。`
    : "";
  if (!window.confirm(`確定要刪除這張圖片嗎？此動作會刪除 Storage 檔案與 media 資料。${usageText}`)) return;

  setMediaStatus("正在刪除圖片...", "info");

  try {
    const { error: storageError } = await supabase.storage.from(bucket).remove([storagePath]);
    if (storageError) throw storageError;

    const { error: deleteError } = await supabase.from("media").delete().eq("id", mediaId);
    if (deleteError) throw deleteError;

    setMediaStatus("圖片已刪除。", "success");
    await loadMedia();
  } catch (error) {
    console.error("Failed to delete media", error);
    setMediaStatus(`刪除失敗：${error.message}`, "error");
  }
}

uploadForm?.addEventListener("submit", uploadMedia);
refreshMediaButton?.addEventListener("click", loadMedia);
mediaSearchInput?.addEventListener("input", applyMediaFilters);
mediaUsageFilter?.addEventListener("change", applyMediaFilters);
mediaTypeFilter?.addEventListener("change", applyMediaFilters);
mediaGrid?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-media]");
  if (!deleteButton) return;
  const card = deleteButton.closest(".admin-media-card");
  if (card) deleteMedia(card);
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadMedia
}).catch((error) => reportAdminBootError(loading, error));
