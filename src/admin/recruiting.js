import { supabase } from "../lib/supabaseClient.js";
import { bindAdminLogout, bootProtectedAdminPage, reportAdminBootError } from "./session.js";
import { escapeHTML, formatUpdatedAt } from "./utils.js";
import { prepareImageForUpload, uploadImageToMedia } from "./media-utils.js";

const shell = document.querySelector(".admin-app-shell");
const loading = document.querySelector("#adminLoading");
const userEmail = document.querySelector("#adminUserEmail");
const userInitial = document.querySelector("#adminUserInitial");
const logoutButton = document.querySelector("#adminLogout");
const statusBox = document.querySelector("#adminRecruitingStatus");
const pageFilter = document.querySelector("#recruitingPageFilter");
const refreshButton = document.querySelector("#refreshRecruitingButton");
const pageForm = document.querySelector("#pageSettingsForm");
const pageSettingsTitle = document.querySelector("#pageSettingsTitle");
const departmentForm = document.querySelector("#departmentEditorForm");
const openingForm = document.querySelector("#openingEditorForm");
const departmentTitle = document.querySelector("#departmentFormTitle");
const openingTitle = document.querySelector("#openingFormTitle");
const newDepartmentButton = document.querySelector("#newDepartmentButton");
const newOpeningButton = document.querySelector("#newOpeningButton");
const dataList = document.querySelector("#recruitingDataList");

let departments = [];
let openings = [];

function setStatus(message, type = "info") {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.dataset.status = type;
}

function slugify(value = "", fallback = "item") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `${fallback}-${Date.now()}`;
}

function parseListInput(value, label) {
  const trimmed = (value || "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) throw new Error(`${label} 必須是 JSON 陣列。`);
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch (error) {
      throw new Error(`${label} JSON 格式錯誤：${error.message}`);
    }
  }
  return trimmed
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function formatListInput(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

async function uploadRecruitingImage(file, altText, imageUsage = "card") {
  if (!file || !file.name) return null;
  const preparedFile = await prepareImageForUpload(file, imageUsage);
  if (!preparedFile) return null;
  return uploadImageToMedia({
    file: preparedFile,
    altText,
    caption: altText,
    imageUsage,
    focalPoint: "center"
  });
}

function clearFileInput(input) {
  if (input) input.value = "";
}

function parseJsonObject(value, label) {
  try {
    const parsed = JSON.parse(value || "{}");
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error(`${label} 必須是 JSON 物件。`);
    return parsed;
  } catch (error) {
    throw new Error(`${label} JSON 格式錯誤：${error.message}`);
  }
}

function statusLabel(status) {
  const labels = { draft: "草稿", published: "已發布", archived: "封存", scheduled: "排程" };
  return labels[status] || status || "草稿";
}

function resetDepartmentForm() {
  departmentForm.reset();
  departmentForm.elements.id.value = "";
  departmentForm.elements.status.value = "draft";
  departmentForm.elements.is_enabled.checked = true;
  departmentForm.elements.sort_order.value = departments.length * 10;
  departmentForm.elements.highlights.value = "";
  departmentTitle.textContent = "新增部門/分類";
}

function resetOpeningForm() {
  openingForm.reset();
  openingForm.elements.id.value = "";
  openingForm.elements.status.value = "draft";
  openingForm.elements.is_enabled.checked = true;
  openingForm.elements.apply_form_enabled.checked = true;
  openingForm.elements.apply_button_text.value = pageFilter.value === "talent" ? "申請應徵" : "提交洽談資料";
  openingForm.elements.sort_order.value = openings.length * 10;
  openingForm.elements.duties.value = "";
  openingForm.elements.requirements.value = "";
  openingForm.elements.benefits.value = "";
  openingTitle.textContent = "新增職缺/合作卡片";
}

function fallbackPageTitle(pageSlug) {
  const labels = {
    talent: "人才招募",
    land: "土地招募",
    "investor-recruiting": "投資人招募"
  };
  return labels[pageSlug] || pageSlug;
}

function fillPageForm(page) {
  const pageSlug = pageFilter.value;
  pageForm.elements.id.value = page?.id || "";
  pageForm.elements.eyebrow.value = page?.eyebrow || "Recruiting";
  pageForm.elements.title.value = page?.title || fallbackPageTitle(pageSlug);
  pageForm.elements.subtitle.value = page?.subtitle || "";
  pageForm.elements.body.value = page?.body || "";
  pageForm.elements.hero_badge.value = page?.hero_badge || "Suiyuecare Corps.";
  pageForm.elements.hero_card_title.value = page?.hero_card_title || page?.subtitle || "";
  pageForm.elements.primary_cta_text.value = page?.primary_cta_text || (pageSlug === "talent" ? "查看職缺" : "查看合作項目");
  pageForm.elements.primary_cta_url.value = page?.primary_cta_url || "#recruiting-openings";
  pageForm.elements.secondary_cta_text.value = page?.secondary_cta_text || "聯絡我們";
  pageForm.elements.secondary_cta_url.value = page?.secondary_cta_url || "#contact";
  pageForm.elements.hero_image_url.value = page?.hero_image_url || page?.hero_image?.public_url || "";
  pageForm.elements.form_recipient_email.value = page?.form_recipient_email || "";
  pageForm.elements.sort_order.value = page?.sort_order || 0;
  pageForm.elements.status.value = page?.status || "draft";
  pageForm.elements.is_enabled.checked = page ? Boolean(page.is_enabled) : true;
  pageForm.elements.metadata.value = JSON.stringify(page?.metadata || { form_type: pageSlug === "land" ? "land" : pageSlug === "investor-recruiting" ? "investor" : "recruiting", focal_point: "center" }, null, 2);
  clearFileInput(pageForm.elements.hero_image_file);
  pageSettingsTitle.textContent = `${fallbackPageTitle(pageSlug)} Hero 主文案`;
}

function renderDepartmentOptions() {
  openingForm.elements.department_id.innerHTML = departments.map((department) => `
    <option value="${escapeHTML(department.id)}">${escapeHTML(department.title)}</option>
  `).join("");
}

function renderDataList() {
  if (!departments.length && !openings.length) {
    dataList.innerHTML = `<div class="admin-empty-state">目前沒有招募資料。</div>`;
    return;
  }

  dataList.innerHTML = `
    <article class="admin-section-card">
      <header><div><span>Departments</span><strong>部門 / 合作分類</strong></div></header>
      <div class="admin-table-wrap">
        <table class="admin-data-table">
          <thead><tr><th>名稱</th><th>狀態</th><th>更新</th><th>操作</th></tr></thead>
          <tbody>
            ${departments.map((department) => `
              <tr>
                <td><strong>${escapeHTML(department.title)}</strong><small>${escapeHTML(department.department_slug)}</small></td>
                <td>${escapeHTML(statusLabel(department.status))}${department.is_enabled ? "" : " / 停用"}</td>
                <td>${formatUpdatedAt(department.updated_at)}</td>
                <td><div class="admin-table-actions"><button type="button" data-edit-department="${escapeHTML(department.id)}">編輯</button><button type="button" data-delete-department="${escapeHTML(department.id)}">刪除</button></div></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </article>
    <article class="admin-section-card">
      <header><div><span>Cards</span><strong>職缺 / 合作卡片</strong></div></header>
      <div class="admin-table-wrap">
        <table class="admin-data-table">
          <thead><tr><th>卡片</th><th>分類</th><th>狀態</th><th>操作</th></tr></thead>
          <tbody>
            ${openings.map((opening) => {
              const department = departments.find((item) => item.id === opening.department_id);
              return `
                <tr>
                  <td><strong>${escapeHTML(opening.title)}</strong><small>${escapeHTML(opening.opening_slug)}</small></td>
                  <td>${escapeHTML(department?.title || "-")}</td>
                  <td>${escapeHTML(statusLabel(opening.status))}${opening.is_enabled ? "" : " / 停用"}</td>
                  <td><div class="admin-table-actions"><button type="button" data-edit-opening="${escapeHTML(opening.id)}">編輯</button><button type="button" data-delete-opening="${escapeHTML(opening.id)}">刪除</button></div></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function fillDepartmentForm(department) {
  departmentForm.elements.id.value = department.id;
  departmentForm.elements.title.value = department.title || "";
  departmentForm.elements.department_slug.value = department.department_slug || "";
  departmentForm.elements.eyebrow.value = department.eyebrow || "";
  departmentForm.elements.description.value = department.description || "";
  departmentForm.elements.image_url.value = department.image_url || department.image?.public_url || "";
  departmentForm.elements.highlights.value = formatListInput(department.highlights);
  clearFileInput(departmentForm.elements.image_file);
  departmentForm.elements.sort_order.value = department.sort_order || 0;
  departmentForm.elements.status.value = department.status || "draft";
  departmentForm.elements.is_enabled.checked = Boolean(department.is_enabled);
  departmentTitle.textContent = `編輯：${department.title}`;
}

function fillOpeningForm(opening) {
  openingForm.elements.id.value = opening.id;
  openingForm.elements.department_id.value = opening.department_id || "";
  openingForm.elements.title.value = opening.title || "";
  openingForm.elements.opening_slug.value = opening.opening_slug || "";
  openingForm.elements.subtitle.value = opening.subtitle || "";
  openingForm.elements.summary.value = opening.summary || "";
  openingForm.elements.employment_type.value = opening.employment_type || "";
  openingForm.elements.location.value = opening.location || "";
  openingForm.elements.salary_text.value = opening.salary_text || "";
  openingForm.elements.capacity_label.value = opening.capacity_label || "";
  openingForm.elements.image_url.value = opening.image_url || opening.image?.public_url || "";
  openingForm.elements.duties.value = formatListInput(opening.duties);
  openingForm.elements.requirements.value = formatListInput(opening.requirements);
  openingForm.elements.benefits.value = formatListInput(opening.benefits);
  clearFileInput(openingForm.elements.image_file);
  openingForm.elements.apply_button_text.value = opening.apply_button_text || "申請應徵";
  openingForm.elements.sort_order.value = opening.sort_order || 0;
  openingForm.elements.status.value = opening.status || "draft";
  openingForm.elements.is_featured.checked = Boolean(opening.is_featured);
  openingForm.elements.is_enabled.checked = Boolean(opening.is_enabled);
  openingForm.elements.apply_form_enabled.checked = Boolean(opening.apply_form_enabled);
  openingTitle.textContent = `編輯：${opening.title}`;
}

async function loadRecruitingData() {
  setStatus("正在讀取招募資料...", "info");
  try {
    const pageSlug = pageFilter.value;
    const [{ data: pageData, error: pageError }, { data: departmentData, error: departmentError }, { data: openingData, error: openingError }] = await Promise.all([
      supabase
        .from("recruiting_pages")
        .select("*, hero_image:media!recruiting_pages_hero_image_id_fkey(id, public_url, alt_text, file_name)")
        .eq("page_slug", pageSlug)
        .maybeSingle(),
      supabase
        .from("recruiting_departments")
        .select("*, image:media!recruiting_departments_image_id_fkey(id, public_url, alt_text, file_name)")
        .eq("page_slug", pageSlug)
        .order("sort_order", { ascending: true }),
      supabase
        .from("recruiting_openings")
        .select("*, image:media!recruiting_openings_image_id_fkey(id, public_url, alt_text, file_name)")
        .eq("page_slug", pageSlug)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
    ]);
    if (pageError) throw pageError;
    if (departmentError) throw departmentError;
    if (openingError) throw openingError;
    fillPageForm(pageData);
    departments = departmentData || [];
    openings = openingData || [];
    renderDepartmentOptions();
    renderDataList();
    resetDepartmentForm();
    resetOpeningForm();
    setStatus("", "success");
  } catch (error) {
    console.error("Failed to load recruiting data", error);
    departments = [];
    openings = [];
    renderDepartmentOptions();
    renderDataList();
    setStatus(`讀取招募資料失敗：${error.message}`, "error");
  }
}

function pagePayload() {
  const pageSlug = pageFilter.value;
  const status = pageForm.elements.status.value || "draft";
  return {
    page_slug: pageSlug,
    eyebrow: pageForm.elements.eyebrow.value.trim() || null,
    title: pageForm.elements.title.value.trim() || fallbackPageTitle(pageSlug),
    subtitle: pageForm.elements.subtitle.value.trim() || null,
    body: pageForm.elements.body.value.trim() || null,
    hero_badge: pageForm.elements.hero_badge.value.trim() || null,
    hero_card_title: pageForm.elements.hero_card_title.value.trim() || null,
    primary_cta_text: pageForm.elements.primary_cta_text.value.trim() || null,
    primary_cta_url: pageForm.elements.primary_cta_url.value.trim() || null,
    secondary_cta_text: pageForm.elements.secondary_cta_text.value.trim() || null,
    secondary_cta_url: pageForm.elements.secondary_cta_url.value.trim() || null,
    hero_image_url: pageForm.elements.hero_image_url.value.trim() || null,
    form_recipient_email: pageForm.elements.form_recipient_email.value.trim() || null,
    metadata: parseJsonObject(pageForm.elements.metadata.value, "進階設定"),
    sort_order: Number(pageForm.elements.sort_order.value || 0),
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    is_enabled: pageForm.elements.is_enabled.checked
  };
}

function departmentPayload() {
  const status = departmentForm.elements.status.value || "draft";
  return {
    page_slug: pageFilter.value,
    title: departmentForm.elements.title.value.trim(),
    department_slug: slugify(departmentForm.elements.department_slug.value || departmentForm.elements.title.value, "department"),
    eyebrow: departmentForm.elements.eyebrow.value.trim() || null,
    description: departmentForm.elements.description.value.trim() || null,
    image_url: departmentForm.elements.image_url.value.trim() || null,
    highlights: parseListInput(departmentForm.elements.highlights.value, "亮點"),
    sort_order: Number(departmentForm.elements.sort_order.value || 0),
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    is_enabled: departmentForm.elements.is_enabled.checked
  };
}

function openingPayload() {
  const status = openingForm.elements.status.value || "draft";
  return {
    page_slug: pageFilter.value,
    department_id: openingForm.elements.department_id.value || null,
    title: openingForm.elements.title.value.trim(),
    opening_slug: slugify(openingForm.elements.opening_slug.value || openingForm.elements.title.value, "opening"),
    subtitle: openingForm.elements.subtitle.value.trim() || null,
    summary: openingForm.elements.summary.value.trim() || null,
    employment_type: openingForm.elements.employment_type.value.trim() || null,
    location: openingForm.elements.location.value.trim() || null,
    salary_text: openingForm.elements.salary_text.value.trim() || null,
    capacity_label: openingForm.elements.capacity_label.value.trim() || null,
    image_url: openingForm.elements.image_url.value.trim() || null,
    duties: parseListInput(openingForm.elements.duties.value, "內容"),
    requirements: parseListInput(openingForm.elements.requirements.value, "條件"),
    benefits: parseListInput(openingForm.elements.benefits.value, "支持/福利"),
    apply_button_text: openingForm.elements.apply_button_text.value.trim() || "申請應徵",
    apply_form_enabled: openingForm.elements.apply_form_enabled.checked,
    sort_order: Number(openingForm.elements.sort_order.value || 0),
    is_featured: openingForm.elements.is_featured.checked,
    is_enabled: openingForm.elements.is_enabled.checked,
    status,
    published_at: status === "published" ? new Date().toISOString() : null
  };
}

async function saveDepartment(event) {
  event.preventDefault();
  setStatus("正在儲存部門資料...", "info");
  try {
    const payload = departmentPayload();
    const uploadedImage = await uploadRecruitingImage(departmentForm.elements.image_file?.files?.[0], payload.title, "card");
    if (uploadedImage) {
      payload.image_id = uploadedImage.id;
      payload.image_url = uploadedImage.public_url;
    }
    const id = departmentForm.elements.id.value;
    const query = id ? supabase.from("recruiting_departments").update(payload).eq("id", id) : supabase.from("recruiting_departments").insert(payload);
    const { error } = await query;
    if (error) throw error;
    setStatus("部門資料已儲存。", "success");
    await loadRecruitingData();
  } catch (error) {
    setStatus(`儲存部門失敗：${error.message}`, "error");
  }
}

async function savePageSettings(event) {
  event.preventDefault();
  setStatus("正在儲存頁面 Hero 主文案...", "info");
  try {
    const payload = pagePayload();
    const uploadedImage = await uploadRecruitingImage(pageForm.elements.hero_image_file?.files?.[0], payload.title, "service_hero");
    if (uploadedImage) {
      payload.hero_image_id = uploadedImage.id;
      payload.hero_image_url = uploadedImage.public_url;
    }
    const id = pageForm.elements.id.value;
    const query = id
      ? supabase.from("recruiting_pages").update(payload).eq("id", id)
      : supabase.from("recruiting_pages").insert(payload);
    const { error } = await query;
    if (error) throw error;
    setStatus("頁面 Hero 主文案已儲存。", "success");
    await loadRecruitingData();
  } catch (error) {
    console.error("Failed to save recruiting page", error);
    setStatus(`儲存頁面 Hero 失敗：${error.message}`, "error");
  }
}

async function saveOpening(event) {
  event.preventDefault();
  setStatus("正在儲存卡片資料...", "info");
  try {
    const payload = openingPayload();
    const uploadedImage = await uploadRecruitingImage(openingForm.elements.image_file?.files?.[0], payload.title, "card");
    if (uploadedImage) {
      payload.image_id = uploadedImage.id;
      payload.image_url = uploadedImage.public_url;
    }
    const id = openingForm.elements.id.value;
    const query = id ? supabase.from("recruiting_openings").update(payload).eq("id", id) : supabase.from("recruiting_openings").insert(payload);
    const { error } = await query;
    if (error) throw error;
    setStatus("卡片資料已儲存。", "success");
    await loadRecruitingData();
  } catch (error) {
    setStatus(`儲存卡片失敗：${error.message}`, "error");
  }
}

async function deleteDepartment(id) {
  const department = departments.find((item) => item.id === id);
  if (!department || !window.confirm(`確定刪除「${department.title}」嗎？相關卡片會保留但失去分類。`)) return;
  const { error } = await supabase.from("recruiting_departments").delete().eq("id", id);
  if (error) setStatus(`刪除失敗：${error.message}`, "error");
  else await loadRecruitingData();
}

async function deleteOpening(id) {
  const opening = openings.find((item) => item.id === id);
  if (!opening || !window.confirm(`確定刪除「${opening.title}」嗎？`)) return;
  const { error } = await supabase.from("recruiting_openings").delete().eq("id", id);
  if (error) setStatus(`刪除失敗：${error.message}`, "error");
  else await loadRecruitingData();
}

pageForm?.addEventListener("submit", savePageSettings);
departmentForm?.addEventListener("submit", saveDepartment);
openingForm?.addEventListener("submit", saveOpening);
newDepartmentButton?.addEventListener("click", resetDepartmentForm);
newOpeningButton?.addEventListener("click", resetOpeningForm);
refreshButton?.addEventListener("click", loadRecruitingData);
pageFilter?.addEventListener("change", loadRecruitingData);
departmentForm?.elements.title?.addEventListener("input", () => {
  if (!departmentForm.elements.id.value && !departmentForm.elements.department_slug.value) departmentForm.elements.department_slug.value = slugify(departmentForm.elements.title.value, "department");
});
openingForm?.elements.title?.addEventListener("input", () => {
  if (!openingForm.elements.id.value && !openingForm.elements.opening_slug.value) openingForm.elements.opening_slug.value = slugify(openingForm.elements.title.value, "opening");
});
dataList?.addEventListener("click", (event) => {
  const editDepartment = event.target.closest("[data-edit-department]");
  const deleteDepartmentButton = event.target.closest("[data-delete-department]");
  const editOpening = event.target.closest("[data-edit-opening]");
  const deleteOpeningButton = event.target.closest("[data-delete-opening]");
  if (editDepartment) fillDepartmentForm(departments.find((item) => item.id === editDepartment.dataset.editDepartment));
  if (deleteDepartmentButton) deleteDepartment(deleteDepartmentButton.dataset.deleteDepartment);
  if (editOpening) fillOpeningForm(openings.find((item) => item.id === editOpening.dataset.editOpening));
  if (deleteOpeningButton) deleteOpening(deleteOpeningButton.dataset.deleteOpening);
});

bindAdminLogout(logoutButton);

bootProtectedAdminPage({
  loading,
  shell,
  userEmail,
  userInitial,
  logoutButton,
  onReady: loadRecruitingData
}).catch((error) => reportAdminBootError(loading, error));
