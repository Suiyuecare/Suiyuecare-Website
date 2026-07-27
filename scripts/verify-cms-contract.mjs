import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`CMS contract missing: ${label}`);
  }
}

function assertExcludes(source, unexpected, label) {
  if (source.includes(unexpected)) {
    throw new Error(`CMS contract violation: ${label}`);
  }
}

const app = read("app.js");
const vite = read("vite.config.js");
const navigation = read("src/admin/navigation.js");
const auth = read("src/admin/auth.js");
const pageEditor = read("src/admin/page-edit.js");
const pageEditorHtml = read("admin/pages/[id]/index.html");
const templateHtml = read("admin/template-fields/index.html");
const templateEditor = read("src/admin/template-fields.js");
const milestoneAdmin = read("src/admin/milestones.js");
const milestonePage = read("milestones-page.js");
const hardeningMigration = read("supabase/migrations/20260711082531_harden_milestones_and_template_fields.sql");
const talentSeedMigration = read("supabase/migrations/20260711082543_seed_current_talent_openings.sql");
const contentScopeMigration = read("supabase/migrations/20260711122701_content_scope_permission_matrix.sql");

assertIncludes(app, "renderRecruitingPageOnce(normalized, renderTalentPage)", "人才招募路由必須由 recruiting CMS 實際渲染");
assertIncludes(app, "renderRecruitingPageOnce(normalized, renderLandRecruitingPage)", "土地招募路由必須由 recruiting CMS 實際渲染");
assertIncludes(app, "renderRecruitingPageOnce(normalized, renderInvestorRecruitingPage)", "投資人招募路由必須由 recruiting CMS 實際渲染");
assertExcludes(app, "warmRecruitingCmsData", "招募路由不可只暖快取而不更新畫面");
assertIncludes(app, '.from("recruiting_openings")', "人才招募前台必須讀 recruiting_openings");
assertIncludes(app, '.from("recruiting_departments")', "土地招募前台必須讀 recruiting CMS");
assertIncludes(app, '.from("recruiting_pages")', "投資人招募前台必須讀 recruiting CMS");
assertIncludes(app, "renderFixedRecruitingOpportunityPage(slug, data.page", "土地與投資招募必須保留完整固定版型再注入 CMS 卡片");
assertIncludes(app, "renderMilestonesPageOnce()", "大事記前台必須讀 milestones");
assertIncludes(app, '.from("milestones")', "大事記前台資料表查詢");
assertIncludes(app, 'if (!supabase) return null;', "未設定 Supabase 與成功查無大事記必須可區分");
assertIncludes(milestonePage, "Array.isArray(milestoneEntries)", "成功查無大事記時不可回退硬編碼資料");
assertIncludes(milestonePage, "大事記整理中", "大事記空集合必須有固定版型空狀態");

assertIncludes(vite, 'adminTemplateFields: "admin/template-fields/index.html"', "固定版位後台 build 入口");
assertIncludes(vite, 'adminMilestones: "admin/milestones/index.html"', "大事記後台 build 入口");
assertIncludes(navigation, 'href: "/admin/milestones"', "大事記後台導覽");
assertIncludes(auth, '"/admin/milestones": "can_view_brand_content"', "大事記後台檢視權限");
assertIncludes(auth, '"/admin/template-fields": "can_view_service_content"', "服務固定版位後台檢視權限");

assertExcludes(templateHtml, "http-equiv=\"refresh\"", "固定版位後台不可再導向 404");
assertExcludes(templateHtml, 'value="talent"', "招募 Hero 不可同時出現在兩套管理來源");
assertIncludes(templateEditor, "supportedPageSlugs", "固定版位後台只能列出前台實際讀取的頁面");
assertIncludes(templateEditor, "canEditServicePage", "固定欄位必須依服務責任範圍判斷可否修改");
assertExcludes(pageEditor, "createEmptySection", "固定頁面不可建立無前台對應的自由 section");
assertIncludes(pageEditor, "specialPageManagers", "特殊固定頁必須導向真正的內容管理來源");
assertIncludes(pageEditor, "canEditScope(adminPermissions, currentPageScope)", "通用頁面編輯器必須依責任範圍讓 viewer 保持唯讀");
assertExcludes(pageEditorHtml, "addSectionButton", "固定頁面不可顯示自由新增 Section 按鈕");
assertIncludes(milestoneAdmin, 'canEditScope(adminPermissions, "brand")', "大事記管理必須依品牌責任範圍判斷");
assertIncludes(milestoneAdmin, "imageUrlChanged ? null", "改用圖片 URL 時必須解除舊 media 綁定");
assertIncludes(hardeningMigration, "private.can_delete_pages_cms()", "大事記 DELETE RLS 必須使用專屬刪除權限");
assertIncludes(hardeningMigration, "validate constraint media_image_usage_check", "大事記圖片用途 constraint 必須完成驗證");
assertIncludes(talentSeedMigration, "case-service-coordinator", "前台既有完整人才職位必須同步到 CMS");
assertIncludes(talentSeedMigration, "on conflict (page_slug, opening_slug) do nothing", "同步人才職位不可覆蓋後台既有編輯");
assertIncludes(contentScopeMigration, "admin_content_scopes", "內容責任範圍必須存入資料庫");
assertIncludes(contentScopeMigration, "private.can_manage_recruiting_page", "人才與合作招募必須分開授權");
assertIncludes(contentScopeMigration, "private.can_manage_service_page", "各服務頁必須分開授權");

console.log("ok - frontend and CMS routes share the fixed-layout content contract");
