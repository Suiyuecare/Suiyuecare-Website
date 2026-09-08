import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const app = fs.readFileSync(new URL("app.js", root), "utf8");
const removedFiles = [
  "service-decision-navigation.js", "service-decision-navigation.css",
  "migrant-training-page.js", "migrant-training-programs.mjs",
  "migrant-training-portfolio.mjs", "migrant-training-portfolio.css",
  "assets/migrant-portfolio", "public/assets/migrant-portfolio"
];
for (const path of removedFiles) assert.ok(!fs.existsSync(new URL(path, root)), `${path} must stay removed`);
for (const marker of ["service-decision", "ServiceDecision", "migrant-training-projects", "hydrateMigrantTraining", "migrant-portfolio", "先找到你在意的答案"]) {
  assert.ok(!app.includes(marker), `Removed presentation must not return: ${marker}`);
}

const start = app.indexOf("function renderOneMinuteServicePage(");
const end = app.indexOf("function renderHomeCarePage(", start);
assert.ok(start > 0 && end > start);
const template = app.slice(start, end);
for (const marker of ["renderServiceFeeSection(service, slug)", "renderDayCareStartChecklist()", "data-day-care-health-exam-host", "data-community-safety-host", "data-community-eligibility-host", "renderServiceSceneCards(service.scenes)", "renderServiceStorySection(service, slug)"]) {
  assert.ok(template.includes(marker), `Original service information remains: ${marker}`);
}
assert.equal((template.match(/renderServiceContactSection\(service, slug\)/g) || []).length, 1);
for (const marker of ["renderMigrantTrainingPage", "renderHealthTopicNavigation", "renderContactPage", "ensurePublicArticleRenderer", "hydrateServiceLocalLinks", "scrollToContactSection(target, trigger)"]) {
  assert.ok(app.includes(marker), `Unrelated content and navigation remain: ${marker}`);
}

// Inspect all generated public files, including lazy bundles, not just the entry point.
function checkBuild(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) checkBuild(path);
    else if (/\.(?:html|js|css)$/.test(entry.name)) {
      const content = fs.readFileSync(path, "utf8");
      for (const marker of ["先找到你在意的答案", "migrant-training-projects", "migrant-portfolio/", "service-decision-guide"]) {
        assert.ok(!content.includes(marker), `Build contains removed presentation: ${path.pathname}: ${marker}`);
      }
    }
  }
}
assert.ok(fs.existsSync(new URL("dist/index.html", root)), "Build before verifying public output");
checkBuild(new URL("dist/", root));
console.log("PASS: removed service guide and migrant portfolio are absent from source/build; original services and unrelated UX remain.");
