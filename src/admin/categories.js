import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, renderEnabledBadge } from "./utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const categoryForm = document.querySelector("#adminCategoryForm");
const categoryFormTitle = document.querySelector("#categoryFormTitle");
const categoriesStatus = document.querySelector("#adminCategoriesStatus");
const categoriesTableBody = document.querySelector("#adminCategoriesTableBody");
const refreshCategoriesButton = document.querySelector("#adminRefreshCategories");

let categories = [];
let mediaImages = [];

const typeSectionMap = {
  article: "health",
  lazy_pack: "lazy_pack",
  event: "activity",
  video: "video",
  short_video: "short_video",
  interview: "master_talk",
  story: "care_story"
};

function toCsvList(value = []) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function fromCsvList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderTypeLabel(value = "article") {
  const labels = {
    article: "一般文章",
    lazy_pack: "懶人包",
    event: "活動",
    video: "影音",
    short_video: "短影片",
    interview: "名人講堂",
    story: "真實照顧情境"
  };
  return labels[value] || value || "一般文章";
}

function renderSectionLabel(value = "health") {
  const labels = {
    health: "健康3.0 一般文章",
    lazy_pack: "懶人包",
    activity: "活動專區",
    video: "影音",
    short_video: "短影片",
    master_talk: "名人講堂",
    care_story: "真實照顧情境"
  };
  return labels[value] || value || "健康3.0 一般文章";
}

function getCategoryFrontHint(category = {}) {
  const sectionKey = category.section_key || typeSectionMap[category.type] || "health";
  const sectionLabel = renderSectionLabel(sectionKey);
  if (category.is_enabled === false) return "停用後，前台分類列與分類篩選不會顯示。";
  if (category.show_in_nav === false) return `文章仍可歸類為「${sectionLabel}」，但不會出現在 Health 3.0 分類列。`;
  return `會出現在 Health 3.0 分類列；此分類文章會進入「${sectionLabel}」版位與分類頁。`;
}

function syncSectionFromType() {
  const matchedSection = typeSectionMap[categoryForm.elements.type.value] || "health";
  categoryForm.elements.section_key.value = matchedSection;
  renderCategoryFormHint();
}

function renderCategoryFormHint() {
  const hint = document.querySelector("#categoryFrontMapHint");
  if (!hint || !categoryForm) return;
  const pseudoCategory = {
    section_key: categoryForm.elements.section_key.value,
    type: categoryForm.elements.type.value,
    is_enabled: categoryForm.elements.is_enabled.checked,
    show_in_nav: categoryForm.elements.show_in_nav.checked
  };
  hint.innerHTML = `
    <strong>前台對應</strong>
    <span>${escapeHTML(getCategoryFrontHint(pseudoCategory))}</span>
    <span>若文章同時設定「內容型態」，前台會以內容型態與分類區塊共同判斷，避免影音、懶人包或活動文章跑錯區。</span>
  `;
}

function setCategoriesStatus(message, type = "info") {
  if (!categoriesStatus) return;
  categoriesStatus.hidden = !message;
  categoriesStatus.textContent = message;
  categoriesStatus.dataset.status = type;
}

function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resetCategoryForm() {
  categoryForm.reset();
  categoryForm.elements.id.value = "";
  categoryForm.elements.parent_id.value = "";
  categoryForm.elements.type.value = "article";
  categoryForm.elements.section_key.value = "health";
  categoryForm.elements.display_label.value = "";
  categoryForm.elements.sort_order.value = "0";
  categoryForm.elements.color.value = "";
  categoryForm.elements.icon.value = "";
  categoryForm.elements.audience.value = "";
  categoryForm.elements.seo_keywords.value = "";
  categoryForm.elements.image_id.value = "";
  categoryForm.elements.is_enabled.checked = true;
  categoryForm.elements.show_in_nav.checked = true;
  categoryForm.elements.is_featured.checked = false;
  categoryForm.elements.seo_title.value = "";
  categoryForm.elements.seo_description.value = "";
  categoryFormTitle.textContent = "新增分類";
  renderParentOptions();
  renderMediaOptions();
  renderCategoryFormHint();
}

function renderParentOptions(selectedId = "") {
  const currentId = categoryForm.elements.id.value;
  const options = ['<option value="">無上層分類</option>'];
  categories
    .filter((category) => category.id !== currentId)
    .forEach((category) => {
      const selected = category.id === selectedId ? "selected" : "";
      options.push(`<option value="${escapeHTML(category.id)}" ${selected}>${escapeHTML(category.name || "未命名分類")}</option>`);
    });
  categoryForm.elements.parent_id.innerHTML = options.join("");
}

function renderMediaOptions(selectedId = "") {
  const options = ['<option value="">不設定分類圖片</option>'];
  mediaImages.forEach((media) => {
    const selected = media.id === selectedId ? "selected" : "";
    options.push(`<option value="${escapeHTML(media.id)}" ${selected}>${escapeHTML(media.file_name || media.alt_text || "未命名圖片")}</option>`);
  });
  categoryForm.elements.image_id.innerHTML = options.join("");
}

function renderCategories() {
  if (!categoriesTableBody) return;

  if (!categories.length) {
    categoriesTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="admin-empty-state">目前沒有分類資料。</div>
        </td>
      </tr>
    `;
    return;
  }

  categoriesTableBody.innerHTML = categories.map((category) => `
    <tr>
      <td>
        <strong>${escapeHTML(category.name || "未命名分類")}</strong>
        <small>${escapeHTML(category.parent?.name ? `上層：${category.parent.name}` : category.description || "尚無描述")}</small>
      </td>
      <td>
        <strong>${escapeHTML(renderTypeLabel(category.type))}</strong>
        <small>${escapeHTML(category.section_key || "health")}${category.show_in_nav ? " · 顯示於分類列" : " · 不顯示於分類列"}</small>
        <small>${escapeHTML(getCategoryFrontHint(category))}</small>
      </td>
      <td><code>/${escapeHTML(category.slug || "")}</code></td>
      <td>${Number(category.sort_order || 0)}</td>
      <td>${renderEnabledBadge(Boolean(category.is_enabled))}</td>
      <td>
        <div class="admin-table-actions">
          <button type="button" data-edit-category="${escapeHTML(category.id)}">編輯</button>
          <button type="button" data-delete-category="${escapeHTML(category.id)}">刪除</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function attachParentCategories(items = []) {
  const lookup = new Map(items.map((category) => [category.id, category]));
  return items.map((category) => ({
    ...category,
    parent: category.parent_id ? lookup.get(category.parent_id) || null : null
  }));
}

async function loadCategories() {
  if (!supabase) return;
  refreshCategoriesButton?.setAttribute("disabled", "true");
  setCategoriesStatus("正在讀取文章分類...", "info");

  try {
    const [categoryResult, mediaResult] = await Promise.all([
      supabase
        .from("article_categories")
        .select(`
          id,
          parent_id,
          name,
          slug,
          description,
          type,
          section_key,
          display_label,
          color,
          icon,
          audience,
          show_in_nav,
          is_featured,
          image_id,
          sort_order,
          is_enabled,
          seo_title,
          seo_description,
          seo_keywords
        `)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("media")
        .select("id, public_url, file_name, alt_text, image_usage")
        .eq("is_enabled", true)
        .order("created_at", { ascending: false })
        .limit(200)
    ]);

    if (categoryResult.error) throw categoryResult.error;
    if (mediaResult.error) throw mediaResult.error;

    categories = attachParentCategories(categoryResult.data || []);
    mediaImages = mediaResult.data || [];
    renderParentOptions();
    renderMediaOptions();
    renderCategories();
    setCategoriesStatus("", "success");
  } catch (error) {
    console.error("Failed to load categories", error);
    setCategoriesStatus(`無法讀取分類資料：${error.message}`, "error");
    categories = [];
    renderCategories();
  } finally {
    refreshCategoriesButton?.removeAttribute("disabled");
  }
}

async function saveCategory(event) {
  event.preventDefault();
  const submitButton = document.querySelector('button[form="adminCategoryForm"]');
  submitButton?.setAttribute("disabled", "true");
  setCategoriesStatus("正在儲存分類...", "info");

  const id = categoryForm.elements.id.value;
  const payload = {
    name: categoryForm.elements.name.value.trim(),
    slug: slugify(categoryForm.elements.slug.value),
    parent_id: categoryForm.elements.parent_id.value || null,
    description: categoryForm.elements.description.value.trim() || null,
    type: categoryForm.elements.type.value || "article",
    section_key: categoryForm.elements.section_key.value || typeSectionMap[categoryForm.elements.type.value] || "health",
    display_label: categoryForm.elements.display_label.value.trim() || null,
    color: categoryForm.elements.color.value.trim() || null,
    icon: categoryForm.elements.icon.value.trim() || null,
    audience: categoryForm.elements.audience.value.trim() || null,
    image_id: categoryForm.elements.image_id.value || null,
    sort_order: Number(categoryForm.elements.sort_order.value || 0),
    is_enabled: categoryForm.elements.is_enabled.checked,
    show_in_nav: categoryForm.elements.show_in_nav.checked,
    is_featured: categoryForm.elements.is_featured.checked,
    seo_title: categoryForm.elements.seo_title.value.trim() || null,
    seo_description: categoryForm.elements.seo_description.value.trim() || null,
    seo_keywords: fromCsvList(categoryForm.elements.seo_keywords.value)
  };

  try {
    if (id) {
      const { error } = await supabase.from("article_categories").update(payload).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("article_categories").insert(payload);
      if (error) throw error;
    }

    resetCategoryForm();
    setCategoriesStatus("分類已儲存。前台分類篩選讀取啟用分類時會自動同步。", "success");
    await loadCategories();
  } catch (error) {
    console.error("Failed to save category", error);
    setCategoriesStatus(`儲存失敗：${error.message}`, "error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
}

function editCategory(id) {
  const category = categories.find((item) => item.id === id);
  if (!category) return;

  categoryForm.elements.id.value = category.id;
  renderParentOptions(category.parent_id || "");
  renderMediaOptions(category.image_id || "");
  categoryForm.elements.name.value = category.name || "";
  categoryForm.elements.slug.value = category.slug || "";
  categoryForm.elements.parent_id.value = category.parent_id || "";
  categoryForm.elements.type.value = category.type || "article";
  categoryForm.elements.section_key.value = category.section_key || "health";
  categoryForm.elements.display_label.value = category.display_label || "";
  categoryForm.elements.description.value = category.description || "";
  categoryForm.elements.color.value = category.color || "";
  categoryForm.elements.icon.value = category.icon || "";
  categoryForm.elements.audience.value = category.audience || "";
  categoryForm.elements.seo_keywords.value = toCsvList(category.seo_keywords);
  categoryForm.elements.image_id.value = category.image_id || "";
  categoryForm.elements.sort_order.value = Number(category.sort_order || 0);
  categoryForm.elements.is_enabled.checked = Boolean(category.is_enabled);
  categoryForm.elements.show_in_nav.checked = category.show_in_nav !== false;
  categoryForm.elements.is_featured.checked = Boolean(category.is_featured);
  categoryForm.elements.seo_title.value = category.seo_title || "";
  categoryForm.elements.seo_description.value = category.seo_description || "";
  categoryFormTitle.textContent = "編輯分類";
  renderCategoryFormHint();
  categoryForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteCategory(id) {
  const category = categories.find((item) => item.id === id);
  if (!category) return;
  if (!window.confirm(`確定要刪除「${category.name}」嗎？已使用此分類的文章會失去分類關聯。`)) return;

  setCategoriesStatus("正在刪除分類...", "info");
  try {
    const { error } = await supabase.from("article_categories").delete().eq("id", id);
    if (error) throw error;

    if (categoryForm.elements.id.value === id) resetCategoryForm();
    setCategoriesStatus("分類已刪除。", "success");
    await loadCategories();
  } catch (error) {
    console.error("Failed to delete category", error);
    setCategoriesStatus(`刪除失敗：${error.message}`, "error");
  }
}

categoryForm?.addEventListener("submit", saveCategory);
categoryForm?.elements.name.addEventListener("input", () => {
  if (!categoryForm.elements.id.value && !categoryForm.elements.slug.value) {
    categoryForm.elements.slug.value = slugify(categoryForm.elements.name.value);
  }
});
categoryForm?.elements.type.addEventListener("change", syncSectionFromType);
categoryForm?.elements.section_key.addEventListener("change", renderCategoryFormHint);
categoryForm?.elements.is_enabled.addEventListener("change", renderCategoryFormHint);
categoryForm?.elements.show_in_nav.addEventListener("change", renderCategoryFormHint);
categoryForm?.elements.slug.addEventListener("blur", () => {
  categoryForm.elements.slug.value = slugify(categoryForm.elements.slug.value);
});
refreshCategoriesButton?.addEventListener("click", loadCategories);
categoriesTableBody?.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-category]");
  const deleteButton = event.target.closest("[data-delete-category]");
  if (editButton) editCategory(editButton.dataset.editCategory);
  if (deleteButton) deleteCategory(deleteButton.dataset.deleteCategory);
});
bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadCategories
}).catch((error) => reportAdminBootError(loading, error));
