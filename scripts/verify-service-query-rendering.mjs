import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { parseHTML } from "linkedom";
import { replacePublicPageContent } from "../public-service-prerender.mjs";
import { parse } from "acorn";

// Exercise the actual async renderer, without importing browser/CMS clients.
const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const start = source.indexOf("async function renderCmsEnhancedServicePageOnce(");
const end = source.indexOf("\nasync function loadSupabaseServiceTemplatePage(", start);
assert.ok(start >= 0 && end > start, "Locate the real shared service renderer");
const rendererSource = source.slice(start, end);
const hydrationNames = [
  "hydrateServiceLocalLinks", "hydrateServiceLocationLinks", "hydrateServiceFeeCodeGroups",
  "hydrateDayCareLocationContent", "hydrateHomeCareLocationContent",
  "hydrateCommunityContent",
  "optimizeImageLoading", "observeServiceMotion"
];

function harness(functionSource, initialRoute, { prerenderedRoute, initialHtml = "previous page" } = {}) {
  let route = initialRoute;
  let html = initialHtml;
  let resolveFields;
  let rejectFields;
  const fields = new Promise((resolve, reject) => { resolveFields = resolve; rejectFields = reject; });
  const writes = [];
  const busy = [];
  const hydrations = [];
  const fetches = [];
  const warnings = [];
  const replacements = [];
  let fallbackCalls = 0;
  let cmsCalls = 0;
  const pageView = {
    dataset: { ...(prerenderedRoute ? { prerenderedRoute } : {}) },
    get innerHTML() { return html; },
    set innerHTML(value) { html = value; writes.push(value); }
  };
  const context = vm.createContext({
    pageView,
    routeSlugFromLocation: () => route,
    setPageViewBusy: (value) => busy.push(value),
    replacePublicPageContent: (node, nextHtml, options) => {
      assert.equal(node, pageView);
      replacements.push(options.preserveInput);
      node.innerHTML = nextHtml;
    },
    fetchSupabaseServiceFields: (slug) => { fetches.push(slug); return fields; },
    applyCmsEnhancedServicePage: (fallback, slug, data) => {
      cmsCalls++;
      assert.equal(fallback, `<main>${slug} fallback</main>`);
      assert.equal(data.length, 1);
      return `<main>${slug} CMS</main>`;
    },
    console: { warn: (...args) => warnings.push(args) },
    ...Object.fromEntries(hydrationNames.map((name) => [name, (node) => {
      assert.equal(node, pageView);
      hydrations.push(name);
    }]))
  });
  const render = vm.runInContext(`${functionSource}\nrenderCmsEnhancedServicePageOnce`, context);
  return {
    pageView, writes, busy, hydrations, fetches, warnings, replacements,
    get fallbackCalls() { return fallbackCalls; },
    get cmsCalls() { return cmsCalls; },
    setRoute(value) { route = value; },
    resolve: resolveFields, reject: rejectFields,
    begin(slug) {
      return render(slug, () => { fallbackCalls++; return `<main>${slug} fallback</main>`; });
    }
  };
}

async function assertSuccessfulRender(functionSource, route, slug, mode = "cms") {
  const state = harness(functionSource, route);
  const pending = state.begin(slug);
  assert.deepEqual(state.writes, [""], "Initial loading clears the previous page once");
  assert.deepEqual(state.busy, [true]);
  assert.deepEqual(state.fetches, [slug]);
  if (mode === "failure") state.reject(new Error("Simulated CMS unavailable"));
  else state.resolve(mode === "empty" ? [] : [{ field_key: "hero_title" }]);
  await pending;
  const expected = `<main>${slug} ${mode === "cms" ? "CMS" : "fallback"}</main>`;
  assert.equal(state.pageView.innerHTML, expected, "A query on the same route must not leave the service page blank");
  assert.deepEqual(state.writes, ["", expected], "Final content renders exactly once");
  assert.deepEqual(state.busy, [true, false], "Loading must finish on the still-active route");
  assert.deepEqual(state.hydrations, hydrationNames, "All service enhancements run exactly once");
  assert.equal(state.fallbackCalls, 1);
  assert.equal(state.cmsCalls, mode === "cms" ? 1 : 0);
  assert.equal(state.warnings.length, mode === "failure" ? 1 : 0);
}

const serviceSlugs = ["about", "home-care", "day-care", "community", "nursing", "migrant-training", "quality", "software"];
for (const slug of serviceSlugs) {
  await assertSuccessfulRender(rendererSource, slug, slug);
  await assertSuccessfulRender(rendererSource, `${slug}?release=d369ba1&utm_source=verification`, slug);
}
await assertSuccessfulRender(rendererSource, "migrant-training?release=d369ba1", "migrant-training", "empty");
await assertSuccessfulRender(rendererSource, "migrant-training?release=d369ba1", "migrant-training", "failure");

for (const mode of ["cms", "empty", "failure"]) {
  const initialHtml = "<main>完整預產的服務內容與表單</main>";
  const state = harness(rendererSource, "day-care?utm_source=search", { prerenderedRoute: "day-care", initialHtml });
  const pending = state.begin("day-care");
  assert.deepEqual(state.writes, [], "A matching prerender stays visible while CMS is pending");
  assert.equal(state.pageView.innerHTML, initialHtml);
  assert.deepEqual(state.busy, [false], "Do not show a loading state over usable prerendered content");
  if (mode === "failure") state.reject(new Error("CMS unavailable after prerender"));
  else state.resolve(mode === "empty" ? [] : [{ field_key: "hero_title" }]);
  await pending;
  if (mode !== "cms") {
    assert.equal(state.pageView.innerHTML, initialHtml, "An unavailable CMS must preserve complete prerendered content");
    assert.deepEqual(state.writes, []);
    assert.deepEqual(state.replacements, []);
    assert.deepEqual(state.busy, [false, false]);
    continue;
  }
  const expected = `<main>day-care ${mode === "cms" ? "CMS" : "fallback"}</main>`;
  assert.deepEqual(state.writes, [expected], "Replace prerender with the resolved renderer once");
  assert.deepEqual(state.busy, [false, false]);
  assert.deepEqual(state.hydrations, hydrationNames);
  assert.deepEqual(state.replacements, [true], "A matching prerender update must preserve user input");
}

for (const options of [{ prerenderedRoute: "home-care" }, { prerenderedRoute: "day-care", initialHtml: "  " }]) {
  const state = harness(rendererSource, "day-care", options);
  const pending = state.begin("day-care");
  assert.deepEqual(state.writes, [""], "A different or empty prerender must be cleared");
  assert.deepEqual(state.busy, [true]);
  state.resolve([]);
  await pending;
  assert.equal(state.pageView.innerHTML, "<main>day-care fallback</main>");
}

for (const shouldReject of [false, true]) {
  for (const prerenderedRoute of [undefined, "migrant-training"]) {
  const state = harness(rendererSource, "migrant-training?release=d369ba1", { prerenderedRoute });
  const pending = state.begin("migrant-training");
  state.setRoute("home-care?utm_source=next-page");
  state.pageView.innerHTML = "<main>new route and user input</main>";
  const writeCount = state.writes.length;
  if (shouldReject) state.reject(new Error("Old route CMS failed"));
  else state.resolve([{ field_key: "hero_title" }]);
  await pending;
  assert.equal(state.pageView.innerHTML, "<main>new route and user input</main>");
  assert.equal(state.writes.length, writeCount, "A stale fetch must not overwrite the new page");
  assert.deepEqual(state.busy, [!prerenderedRoute], "A stale fetch must not change the new page's loading state");
  assert.equal(state.hydrations.length, 0);
  assert.equal(state.cmsCalls, 0);
  }
}

// A sensitivity check proves these behavioral assertions catch the old guard.
const legacySource = rendererSource.replace(
  /routeSlugFromLocation\(\)\.split\(["']\?["']\)\[0\]/,
  "routeSlugFromLocation()"
);
assert.notEqual(legacySource, rendererSource, "The shared renderer must normalize query parameters before its stale-route guard");
await assert.rejects(
  assertSuccessfulRender(legacySource, "migrant-training?release=d369ba1", "migrant-training"),
  /same route must not leave the service page blank/,
  "Regression check must reject the pre-fix query behavior"
);

// Exercise the real DOM replacement: retain inputs, a pending submission and focus, not just copied values.
const { document, Event } = parseHTML('<html><body><main id="root"><section class="service-contact-section"><form><input name="姓名"><textarea name="說明"></textarea><button type="submit">送出</button><output>等待填寫</output></form></section></main></body></html>');
const root = document.querySelector("#root");
const form = root.querySelector("form");
const input = form.querySelector("input");
input.value = "林家屬";
form.querySelector("textarea").value = "已填寫的照顧需求";
form.querySelector("button").disabled = true;
form.querySelector("output").textContent = "送出中";
form.dataset.submitting = "true";
let submitted = 0;
let focused = false;
form.addEventListener("submit", (event) => { event.preventDefault(); submitted += 1; });
Object.defineProperty(document, "activeElement", { configurable: true, get: () => input });
input.focus = ({ preventScroll }) => { focused = preventScroll; };
input.selectionStart = 1;
input.selectionEnd = 3;
input.selectionDirection = "forward";
input.setSelectionRange = (...range) => assert.deepEqual(range, [1, 3, "forward"]);
replacePublicPageContent(root, '<h1>更新後服務內容</h1><section class="service-contact-section"><form><input name="姓名"><button>新的預設按鈕</button></form></section>', { preserveInput: true });
assert.equal(root.querySelector("form"), form, "Keep the actual form node and its handlers");
assert.equal(input.value, "林家屬");
assert.equal(form.querySelector("textarea").value, "已填寫的照顧需求");
assert.equal(form.dataset.submitting, "true");
assert.equal(form.querySelector("button").disabled, true);
assert.equal(form.querySelector("output").textContent, "送出中");
assert.equal(focused, true);
form.dispatchEvent(new Event("submit", { cancelable: true }));
assert.equal(submitted, 1);

const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
function actualFunction(name) {
  const node = ast.body.find((entry) => entry.type === "FunctionDeclaration" && entry.id?.name === name);
  assert.ok(node, `Find actual ${name}`);
  return source.slice(node.start, node.end);
}

for (const kind of ["recruiting", "courses"]) {
  const slug = kind === "recruiting" ? "talent" : "courses";
  const name = kind === "recruiting" ? "renderRecruitingPageOnce" : "renderCoursesPageFromCms";
  for (const hasPrerender of [false, true]) {
    for (const mode of ["cms", "empty", "failure", "stale"]) {
      let route = `${slug}?utm_source=search`;
      let html = "<main>saved published content</main>";
      let resolve;
      const loaded = new Promise((done) => { resolve = done; });
      const writes = [];
      const busy = [];
      const retained = [];
      const page = {
        dataset: hasPrerender ? { prerenderedRoute: slug } : {},
        classList: { add() {} },
        get innerHTML() { return html; }, set innerHTML(value) { html = value; writes.push(value); }
      };
      const context = vm.createContext({
        pageView: page, home: { classList: { remove() {} } }, document: { querySelector: () => ({}) },
        window: { requestAnimationFrame() {} }, console: { warn() {} },
        routeSlugFromLocation: () => route, setPageViewBusy: (value) => busy.push(value),
        loadSupabaseRecruitingPage: () => loaded,
        loadSupabaseCourses: async () => { await loaded; context.coursesLoadFailed = mode === "failure"; },
        coursesLoadedFromSupabase: false, coursesLoadFailed: false,
        renderCoursesPage: () => `<main>courses ${mode}</main>`,
        replacePublicPageContent: (node, value, options) => { retained.push(options.preserveInput); node.innerHTML = value; },
        optimizeImageLoading() {}, observeServiceMotion() {}, updateTalentJobDetailPosition() {}, updateTalentBenefitNavPosition() {}
      });
      const render = vm.runInContext(`${actualFunction(name)}\n${name}`, context);
      const pending = kind === "recruiting" ? render(slug, () => "<main>fallback</main>") : render();
      assert.deepEqual(writes, hasPrerender ? [] : [""], `${name}: retain published initial content while CMS waits`);
      if (mode === "stale") { route = "day-care?from=next"; page.innerHTML = "new page with user input"; }
      resolve(mode === "cms" || mode === "stale" ? "<main>current published CMS</main>" : "");
      await pending;
      if (mode === "stale") {
        assert.equal(html, "new page with user input", `${name}: an old result must not overwrite another route`);
        assert.deepEqual(busy, [!hasPrerender]);
      } else if (hasPrerender && (mode === "failure" || (kind === "recruiting" && mode === "empty"))) {
        assert.equal(html, "<main>saved published content</main>", `${name}: failure must not downgrade a published prerender to fallback`);
        assert.deepEqual(retained, []);
      } else {
        assert.ok(html.includes(kind === "courses" ? `courses ${mode}` : mode === "cms" ? "current published CMS" : "fallback"));
        assert.deepEqual(retained, [hasPrerender]);
      }
    }
  }
}

// The recruiting data loader has its own route guard; it must accept tracking queries too.
for (const route of ["talent?utm_source=search", "day-care"]) {
  const context = vm.createContext({
    recruitingTemplateSlugs: new Set(["talent"]), supabase: null,
    loadCmsFallback: async () => ({ page: {}, departments: [], openings: [] }),
    routeSlugFromLocation: () => route,
    renderRecruitingTalentPage: () => "published talent content", console: { warn() {} }
  });
  const loader = vm.runInContext(`${actualFunction("loadSupabaseRecruitingPage")}\nloadSupabaseRecruitingPage`, context);
  assert.equal(await loader("talent"), route.startsWith("talent") ? "published talent content" : "");
}

console.log("PASS: service/recruiting/course renderers preserve published prerenders and form state, accept tracking queries, keep content on CMS failures, reject stale writes, and detect the old query regression.");
