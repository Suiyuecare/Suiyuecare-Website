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
  categoryForm.elements.sort_order.value = "0";
  categoryForm.elements.is_enabled.checked = true;
  categoryFormTitle.textContent = "新增分類";
}

function renderCategories() {
  if (!categoriesTableBody) return;

  if (!categories.length) {
    categoriesTableBody.innerHTML = `
      <tr>
        <td colspan="5">
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
        <small>${escapeHTML(category.description || "尚無描述")}</small>
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

async function loadCategories() {
  if (!supabase) return;
  refreshCategoriesButton?.setAttribute("disabled", "true");
  setCategoriesStatus("正在讀取文章分類...", "info");

  try {
    const { data, error } = await supabase
      .from("article_categories")
      .select("id, name, slug, description, sort_order, is_enabled")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    categories = data || [];
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
    description: categoryForm.elements.description.value.trim() || null,
    sort_order: Number(categoryForm.elements.sort_order.value || 0),
    is_enabled: categoryForm.elements.is_enabled.checked,
    type: "article"
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
  categoryForm.elements.name.value = category.name || "";
  categoryForm.elements.slug.value = category.slug || "";
  categoryForm.elements.description.value = category.description || "";
  categoryForm.elements.sort_order.value = Number(category.sort_order || 0);
  categoryForm.elements.is_enabled.checked = Boolean(category.is_enabled);
  categoryFormTitle.textContent = "編輯分類";
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
