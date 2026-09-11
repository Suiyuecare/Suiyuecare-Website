import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse } from "acorn";
import { build } from "vite";

// Build the actual article form and editor functions without authentication,
// startup handlers, credentials, or any API calls. Output stays outside dist/.
const root = path.resolve(import.meta.dirname, "..");
const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "suiyue-article-editorial-fixture-")));
const source = fs.readFileSync(path.join(root, "src/admin/article-edit.js"), "utf8");
const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
const declarations = ast.body.filter((node) => ["VariableDeclaration", "FunctionDeclaration"].includes(node.type)).map((node) => source.slice(node.start, node.end)).join("\n");
const editorialImport = ast.body.find((node) => node.type === "ImportDeclaration" && node.source.value === "./article-editorial-fields.mjs");
if (!editorialImport) throw new Error("Article editor must import the shared editorial fields module.");
const importedNames = editorialImport.specifiers.map((item) => item.imported.name).join(", ");
const fixtureArticle = {
  id: "local-fixture", title: "本機測試文章", slug: "local-editorial-fixture", status: "draft", content: "<p>原有正文保持不變。</p>",
  author_name: "歲悅日照團隊", author_title: "原有職稱", published_at: "2026-09-01T00:00:00Z",
  content_json: { extension_keep: { value: 42 }, editorial: { unknown_policy: { keep: true }, author: { type: "Organization", name: "歲悅日照團隊", credentials: "原有測試資料", profileUrl: "https://example.org/author", unknown_identity: "keep" }, reviewer: { type: "Person", name: "測試審閱者", unknown_review: true }, reviewedAt: "2026-09-01T16:45:30.123456+00:00" } }
};
const script = `
import ${JSON.stringify(path.join(root, "src/admin/admin.css"))};
import ${JSON.stringify(path.join(root, "src/admin/article-editorial-fields.css"))};
import { ${importedNames} } from ${JSON.stringify(path.join(root, "src/admin/article-editorial-fields.mjs"))};
import { escapeHTML, formatUpdatedAt } from ${JSON.stringify(path.join(root, "src/admin/utils.js"))};
${declarations}
shell.hidden = false;
loading && (loading.hidden = true);
userEmail.textContent = "本機表單驗證，不連線後台";
simplifyArticleEditorLayout();
const fixtureArticle = ${JSON.stringify(fixtureArticle)};
fillForm(fixtureArticle);
setEditorStatus("本機驗證：儲存只顯示 payload，不會送出。", "info");
form.addEventListener("submit", (event) => { event.preventDefault(); window.fixtureLastPayload = buildPayload(); });
window.articleEditorFixture = {
  original: fixtureArticle,
  load: (article) => { fillForm(article); return true; },
  values: readEditorialEditorValues,
  payload: buildPayload,
  errors: () => validateEditorialFormValues(initialEditorialValues, readEditorialEditorValues())
};
`;
fs.writeFileSync(path.join(directory, "fixture.js"), script);
let html = fs.readFileSync(path.join(root, "admin/articles/[id]/index.html"), "utf8")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<link\b[^>]*>/gi, "")
  .replace(/<img\b[^>]*>/gi, "")
  .replace("</body>", '<script type="module" src="/fixture.js"></script></body>');
fs.writeFileSync(path.join(directory, "index.html"), html);
await build({ configFile: false, root: directory, publicDir: false, build: { outDir: path.join(directory, "build"), emptyOutDir: true } });
console.log(`EDITORIAL_FIXTURE_DIR=${path.join(directory, "build")}`);
