import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Exercise the actual async renderer, without importing browser/CMS clients.
const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const start = source.indexOf("async function renderCmsEnhancedServicePageOnce(");
const end = source.indexOf("\nasync function loadSupabaseServiceTemplatePage(", start);
assert.ok(start >= 0 && end > start, "Locate the real shared service renderer");
const rendererSource = source.slice(start, end);
const hydrationNames = [
  "hydrateServiceLocalLinks", "hydrateServiceFeeCodeGroups",
  "hydrateDayCareLocationContent", "hydrateHomeCareLocationContent",
  "hydrateCommunityContent",
  "optimizeImageLoading", "observeServiceMotion"
];

function harness(functionSource, initialRoute) {
  let route = initialRoute;
  let html = "previous page";
  let resolveFields;
  let rejectFields;
  const fields = new Promise((resolve, reject) => { resolveFields = resolve; rejectFields = reject; });
  const writes = [];
  const busy = [];
  const hydrations = [];
  const fetches = [];
  const warnings = [];
  let fallbackCalls = 0;
  let cmsCalls = 0;
  const pageView = {
    get innerHTML() { return html; },
    set innerHTML(value) { html = value; writes.push(value); }
  };
  const context = vm.createContext({
    pageView,
    routeSlugFromLocation: () => route,
    setPageViewBusy: (value) => busy.push(value),
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
    pageView, writes, busy, hydrations, fetches, warnings,
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

for (const shouldReject of [false, true]) {
  const state = harness(rendererSource, "migrant-training?release=d369ba1");
  const pending = state.begin("migrant-training");
  state.setRoute("home-care?utm_source=next-page");
  state.pageView.innerHTML = "<main>new route and user input</main>";
  const writeCount = state.writes.length;
  if (shouldReject) state.reject(new Error("Old route CMS failed"));
  else state.resolve([{ field_key: "hero_title" }]);
  await pending;
  assert.equal(state.pageView.innerHTML, "<main>new route and user input</main>");
  assert.equal(state.writes.length, writeCount, "A stale fetch must not overwrite the new page");
  assert.deepEqual(state.busy, [true], "A stale fetch must not change the new page's loading state");
  assert.equal(state.hydrations.length, 0);
  assert.equal(state.cmsCalls, 0);
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

console.log("PASS: actual service renderer handles plain/query routes, empty/failed CMS fallback, single final render, stale-route protection, and detects the pre-fix query regression.");
