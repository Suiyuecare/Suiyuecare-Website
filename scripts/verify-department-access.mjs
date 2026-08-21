import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(`Department access contract failed: ${message}`);
}

function assertIncludes(source, expected, message) {
  assert(source.includes(expected), message);
}

function assertExcludes(source, unexpected, message) {
  assert(!source.includes(unexpected), message);
}

const ownershipMigration = read("supabase/migrations/20260720090000_add_department_content_ownership.sql");
const boundaryMigration = read("supabase/migrations/20260720091000_enforce_department_content_boundaries.sql");
const approvalMigration = read("supabase/migrations/20260720092000_require_owner_approval_for_content_changes.sql");
const resetLegacyMembershipsMigration = read("supabase/migrations/20260720123745_reset_legacy_department_memberships.sql");
const contentScopeSource = read("src/admin/content-scope.js");
const contentScopeModule = await import(`data:text/javascript;base64,${Buffer.from(contentScopeSource).toString("base64")}`);
const contentScopeLabelBlock = contentScopeSource
  .split("export const contentScopeLabels = {", 2)[1]
  ?.split("};", 1)[0] || "";
const allContentScopeKeys = [...contentScopeLabelBlock.matchAll(/^\s*(?:"([^"]+)"|([a-z][a-z0-9-]*)):\s*/gm)]
  .map((match) => match[1] || match[2]);
const contentAreaSeed = ownershipMigration
  .split("insert into public.cms_content_areas", 2)[1]
  ?.split("on conflict (scope_key)", 1)[0] || "";
const migrationScopes = [...contentAreaSeed.matchAll(/\('([^']+)'\s*,/g)].map((match) => match[1]);

assert(migrationScopes.length > 0, "內容責任範圍 migration 沒有 seed 資料");
assert(
  JSON.stringify([...migrationScopes].sort()) === JSON.stringify([...allContentScopeKeys].sort()),
  "資料庫 cms_content_areas 與前端 contentScopeLabels 不一致"
);

const testScope = "service:nursing";
const viewerPermissions = { role: "viewer", content_scopes: [testScope], edit_scopes: [], publish_scopes: [] };
const editorPermissions = { role: "editor", content_scopes: [testScope], edit_scopes: [testScope], publish_scopes: [] };
const managerPermissions = { role: "admin", content_scopes: [testScope], edit_scopes: [testScope], publish_scopes: [] };
const ownerPermissions = { role: "owner", content_scopes: [], edit_scopes: [], publish_scopes: [] };
assert(contentScopeModule.canViewScope(viewerPermissions, testScope), "viewer 應可檢視所屬部門頁面");
assert(!contentScopeModule.canEditScope(viewerPermissions, testScope), "viewer 不可編輯部門頁面");
assert(contentScopeModule.canEditScope(editorPermissions, testScope), "editor 應可編輯並送審所屬頁面");
assert(!contentScopeModule.canPublishScope(editorPermissions, testScope), "editor 不可核准發布");
assert(contentScopeModule.canEditScope(managerPermissions, testScope), "manager 應可編輯並送審所屬頁面");
assert(!contentScopeModule.canPublishScope(managerPermissions, testScope), "manager 不可核准發布");
assert(contentScopeModule.canPublishScope(ownerPermissions, testScope), "Owner／執行長應可核准所有頁面");
assert(contentScopeModule.isEducationCourseManager({
  role: "editor",
  departments: [{ slug: "education-quality", role: "manager" }],
  content_scopes: ["service:quality", "courses", "forms:courses"],
  edit_scopes: ["service:quality", "courses", "forms:courses"],
  publish_scopes: []
}), "教育品管課程負責人應進入簡化課程工作區");
assert(!contentScopeModule.isEducationCourseManager(ownerPermissions), "Owner 不應被限制在簡化課程工作區");

const frontendAdminContracts = [
  ["site_settings", "src/admin/site-settings.js", '.from("site_settings")'],
  ["content_modules", "src/admin/home-modules.js", '.from("content_modules")'],
  ["page_template_fields", "src/admin/template-fields.js", '.from("page_template_fields")'],
  ["downloadable_files", "src/admin/files.js", '.from("downloadable_files")'],
  ["form_submissions", "src/admin/forms.js", 'rpc("submit_form_submission"'],
  ["pages", "src/admin/pages.js", '.from("pages")'],
  ["articles", "src/admin/articles.js", '.from("articles")'],
  ["courses", "src/admin/courses.js", '.from("courses")'],
  ["recruiting_openings", "src/admin/recruiting.js", '.from("recruiting_openings")'],
  ["investor_notices", "src/admin/investor-data.js", '.from("investor_notices")']
];

const frontend = read("app.js");
for (const [table, adminFile, frontendNeedle] of frontendAdminContracts) {
  assertIncludes(frontend, frontendNeedle, `前台未連接 ${table}`);
  assertIncludes(read(adminFile), `.from("${table}")`, `${table} 沒有對應可維護的後台模組`);
}

const uploadFiles = fs
  .readdirSync(path.join(root, "src/admin"))
  .filter((file) => file.endsWith(".js") && file !== "media-utils.js");
for (const file of uploadFiles) {
  const source = read(`src/admin/${file}`);
  const calls = [...source.matchAll(/uploadImageToMedia\(\{([\s\S]*?)\n\s*\}\)/g)];
  for (const call of calls) {
    assert(/\bscopeKey\s*:/.test(call[1]), `${file} 的圖片上傳沒有指定 scopeKey`);
  }
}

assertIncludes(ownershipMigration, "create table if not exists public.department_memberships", "缺少部門成員資料表");
assertIncludes(ownershipMigration, "private.cms_permission_migration_backups", "權限轉換前缺少 private 回復快照");
assertIncludes(ownershipMigration, "membership_role in ('viewer', 'editor', 'manager')", "部門角色必須區分 viewer/editor/manager");
assertIncludes(ownershipMigration, "private.can_edit_content_scope(new.scope_key)", "送審前未驗證責任範圍");
assertIncludes(ownershipMigration, "public.replace_department_memberships", "缺少原子化部門權限更新 RPC");
assertIncludes(ownershipMigration, "and private.current_profile_is_owner()", "發布權限必須只屬於 Owner／執行長");
assertIncludes(ownershipMigration, ") || jsonb_build_object(", "權限 JSON 必須拆段，避免 PostgreSQL 函式參數上限");
assertExcludes(ownershipMigration, "auth.role()", "新權限 RPC 不應使用已淘汰的 auth.role() 判斷");

assertIncludes(boundaryMigration, "with check (private.can_edit_content_scope", "UPDATE RLS 缺少 WITH CHECK");
assertIncludes(boundaryMigration, "scope_key = private.entity_scope_key(entity_table, entity_id)", "發布申請未鎖定實際內容範圍");
assertIncludes(boundaryMigration, "private.can_publish_content_scope(request_row.scope_key)", "舊版發布審核未驗證可發布範圍");
assertIncludes(boundaryMigration, "old_was_published", "已發布內容未鎖定主管權限");
assertIncludes(boundaryMigration, "private.can_edit_storage_object(name)", "Storage 未套用部門責任範圍");

assertIncludes(approvalMigration, "base_snapshot jsonb", "送審資料缺少修改前快照");
assertIncludes(approvalMigration, "proposed_snapshot jsonb", "送審資料缺少待核准快照");
assertIncludes(approvalMigration, "change_action text", "送審資料未區分修改與刪除");
assertIncludes(approvalMigration, "private.stage_department_content_change()", "部門儲存未自動建立執行長送審單");
assertIncludes(approvalMigration, "before insert or update or delete", "新增、修改或刪除未完整套用審核流程");
assertIncludes(approvalMigration, "if not private.current_profile_is_owner()", "送審核准未限制為 Owner／執行長");
assertIncludes(approvalMigration, "private.apply_content_snapshot", "執行長核准後無法套用待審版本");
assertIncludes(approvalMigration, "publish_requests_one_pending_entity_idx", "同一內容未限制單一待審版本");
assertIncludes(approvalMigration, "Only Owner can delete media", "圖片刪除未保留給 Owner／執行長");
assertIncludes(approvalMigration, "public.replace_content_area_assignments", "後台缺少內容責任配置 RPC");
assertIncludes(approvalMigration, "Only the chief executive account can hold the Owner role", "資料庫未防止非執行長取得 Owner");
assertIncludes(approvalMigration, "private.ensure_viewer_profile_for_auth_user", "同仁首次登入後未自動建立待指派帳號");
assertIncludes(approvalMigration, "delete from public.admin_content_scopes", "舊版直接授權未在轉換後清除");
assertIncludes(approvalMigration, "child.base_snapshot->>'page_id'", "整頁審核未包含區塊刪除申請");
assertIncludes(approvalMigration, "delete from public.page_sections", "執行長核准後未套用區塊刪除");
assertExcludes(approvalMigration, "auth.role()", "責任配置 RPC 不應使用已淘汰的 auth.role() 判斷");
assertIncludes(resetLegacyMembershipsMigration, "profile.role <> 'owner'", "非 Owner 的舊式跨部門授權未清除");

const usersApi = read("api/admin-users.js");
const mediaUtils = read("src/admin/media-utils.js");
const filesAdmin = read("src/admin/files.js");
const coursesAdmin = read("src/admin/courses.js");
assertIncludes(usersApi, 'rpc("replace_department_memberships"', "使用者管理未透過部門 membership RPC 儲存");
assertIncludes(usersApi, 'rpc("replace_content_area_assignments"', "內容責任矩陣未透過 Owner RPC 儲存");
assertIncludes(usersApi, 'currentAdmin?.role === "owner"', "權限矩陣 API 未限制為 Owner 操作");
assertExcludes(usersApi, "if (totalProfiles === 0) return true", "空資料庫不得讓任意第一位使用者成為 Owner");
assertIncludes(mediaUtils, "cms/${normalizedScopeKey}/", "圖片 Storage 路徑未包含 scopeKey");
assertIncludes(filesAdmin, "cms/${scopeKey}/", "下載檔 Storage 路徑未包含 scopeKey");
assertIncludes(coursesAdmin, 'hostname === "forms.gle"', "課程後台未驗證 Google 表單短網址");
assertIncludes(coursesAdmin, 'hostname === "docs.google.com"', "課程後台未驗證 Google 表單完整網址");
assertIncludes(frontend, "registrationUrl: safeCourseRegistrationUrl(course.registration_url)", "課程前台未讀取外部報名網址");
assertIncludes(frontend, "location.assign(registrationUrl)", "課程報名按鈕未直接前往 Google 表單");

const requiredAdminPages = [
  "admin/files/index.html",
  "admin/forms/index.html",
  "admin/home-modules/index.html",
  "admin/site-settings/index.html"
];
const viteConfig = read("vite.config.js");
for (const file of requiredAdminPages) {
  const source = read(file);
  assert(!/http-equiv=["']refresh["']/i.test(source), `${file} 不可導向 404`);
  assertIncludes(viteConfig, `"${file}"`, `${file} 未列入 Vite 正式建置入口`);
}

console.log(`ok - ${migrationScopes.length} content scopes have matching ownership, staged CEO approval, RLS, storage, forms, and admin routes`);
