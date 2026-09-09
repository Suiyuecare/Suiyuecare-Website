import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Execute the production helpers, not a copied implementation. Only selected
// catalog declarations and pure launch helpers enter the VM: never the roster,
// Supabase client, storage-backed profiles, boot code, or a real browser session.
const source = fs.readFileSync(new URL("../src/portal/login.js", import.meta.url), "utf8");
const functionNames = [
  "normalizeEmail", "getModuleDisplayName", "canOpenDaycareEntry", "moduleIsAllowed",
  "getModuleAccessState", "buildModuleLaunchUrl", "launchConnectedModule",
  "safeModuleLaunchRequest", "moduleReturnPath"
];
const declarationNames = [
  "modules", "moduleDisplayNames", "moduleDescriptions", "moduleLaunchUrls", "connectedModuleIds",
  "temporarilyOpenModuleIds", "sharedGeneralAffairsModules", "restrictedGeneralAffairsModules",
  "generalAffairsManagers", "signedHandoffModuleIds", "postHandoffModuleIds",
  "externalLaunchOrigins", "apmWorkspacePaths", "portalProductionOrigin"
];

function functionSource(name) {
  const pattern = new RegExp(`^(?:async )?function ${name}\\([^]*?^\\}`, "m");
  const match = source.match(pattern);
  assert.ok(match, `Production helper ${name} must exist and be extractable`);
  return match[0];
}

function declarationSource(name) {
  const pattern = new RegExp(`^const ${name} = [^]*?;[ \\t]*$`, "m");
  const match = source.match(pattern);
  assert.ok(match, `Production declaration ${name} must exist and be extractable`);
  return match[0];
}

const calls = { payload: [], signed: [], submit: [], encoded: [], navigation: [], paint: [], network: [] };
let broadRolePermission = false;
const context = vm.createContext({
  URL, URLSearchParams, console,
  modulePermissionAllowsRole: () => broadRolePermission,
  buildModuleLaunchPayload(moduleId, profile, returnTo = "") {
    calls.payload.push({ moduleId, returnTo });
    return { moduleId, email: profile.email, sourceRoleKey: "synthetic-role", dataScopeKey: "synthetic-scope", returnTo };
  },
  async createSignedModuleHandoff(payload) {
    calls.signed.push(payload);
    return { payload: "synthetic-signed-payload", signature: "synthetic-signature", token: "synthetic-token" };
  },
  submitSignedModuleHandoff(moduleId, launchUrl, handoff) { calls.submit.push({ moduleId, launchUrl, handoff }); },
  encodePortalPayload(payload) { calls.encoded.push(payload); return "synthetic-encoded-payload"; },
  async waitForModuleLaunchLoadingPaint(moduleId) { calls.paint.push(moduleId); },
  fetch(...args) { calls.network.push(args); throw new Error("REAL_NETWORK_FORBIDDEN_IN_CARE_ENTRY_TEST"); },
  window: { location: {
    assign(url) { calls.navigation.push({ mode: "assign", url }); },
    replace(url) { calls.navigation.push({ mode: "replace", url }); }
  } }
});
vm.runInContext([
  ...declarationNames.map(declarationSource), ...functionNames.map(functionSource),
  `globalThis.subject = { ${[...declarationNames, ...functionNames].join(", ")} };`
].join("\n"), context, { timeout: 1000, filename: "portal-care-entry-extracted.js" });
const subject = context.subject;
const daycareUrl = "https://daycare.suiyuecare.com/login";
const ceo = {
  id: "synthetic-employee", sourceProfileId: "ceo", roleKey: "ceo",
  email: "entrepreneur@suiyuecare.com", modules: ["business", "home-care", "day-care", "accounting", "edoc", "apm"]
};
const business = subject.modules.find((module) => module.id === "business");
const daycare = business?.children.find((module) => module.id === "day-care");
const homecare = business?.children.find((module) => module.id === "home-care");
const plain = (value) => JSON.parse(JSON.stringify(value));
let cases = 0;
let assertions = 0;
function check(actual, expected, message) { assertions += 1; assert.deepEqual(plain(actual), plain(expected), message); }
function ok(value, message) { assertions += 1; assert.ok(value, message); }
function resetCalls() { for (const value of Object.values(calls)) value.length = 0; broadRolePermission = false; }
async function test(name, run) {
  resetCalls();
  try { await run(); cases += 1; }
  catch (error) { throw new Error(`Portal care entry regression: ${name}`, { cause: error }); }
}
function assertNoIdentityTransfer() {
  check(calls.payload.length, 0, "Care entry must not construct an identity/permission payload");
  check(calls.signed.length, 0, "Care entry must not request a signed SSO handoff");
  check(calls.submit.length, 0, "Care entry must not POST a handoff");
  check(calls.encoded.length, 0, "Care entry must not encode profile data");
  check(calls.network.length, 0, "Care entry test and plain navigation must make no Auth/network request");
}
function assertCleanDaycareUrl(value) {
  check(value, daycareUrl);
  const url = new URL(value);
  check([url.search, url.hash, url.username, url.password], ["", "", "", ""]);
}

await test("exact existing business hierarchy and display labels", () => {
  ok(business && daycare && homecare);
  check(subject.getModuleDisplayName(business), "業務系統");
  check(plain(business.children).map(({ id, number, name }) => ({ id, number, name })), [
    { id: "home-care", number: "1-1", name: "居家照顧系統" },
    { id: "day-care", number: "1-2", name: "日間照顧系統" }
  ]);
  check(subject.getModuleDisplayName(homecare), "居家照顧系統");
  check(subject.getModuleDisplayName(daycare), "日間照顧系統");
  check(subject.moduleDescriptions["day-care"], "日照管理驗證版，僅開放執行長使用 Google 登入；登入後須完成雙因素驗證");
  ok(!subject.moduleDescriptions["day-care"].includes("Google 登入設定中"));
  check(subject.modules.filter((module) => module.id === "business").length, 1);
});

await test("daycare is connected without joining the signed-handoff policy", () => {
  assertCleanDaycareUrl(subject.moduleLaunchUrls["day-care"]);
  check(subject.connectedModuleIds.has("day-care"), true);
  check(subject.temporarilyOpenModuleIds.has("day-care"), true);
  check(Array.from(subject.signedHandoffModuleIds).sort(), ["apm", "edoc"]);
  check(Array.from(subject.postHandoffModuleIds).sort(), ["apm", "edoc"]);
});

const allowedProfiles = [
  ["exact CEO", ceo],
  ["normalized email", { ...ceo, email: "  ENTREPRENEUR@SUIYUECARE.COM  " }],
  ["roleKey fallback", { ...ceo, sourceProfileId: "", roleKey: "ceo" }],
  ["id fallback", { ...ceo, sourceProfileId: undefined, roleKey: undefined, id: "ceo" }],
  ["source role takes precedence", { ...ceo, sourceProfileId: "ceo", roleKey: "staff", id: "staff" }],
  ["additional metadata grants nothing beyond the same explicit module", { ...ceo, financeManaged: true }]
];
for (const [name, profile] of allowedProfiles) {
  await test(`allow matrix: ${name}`, () => {
    check(subject.canOpenDaycareEntry(profile), true);
    check(subject.moduleIsAllowed(daycare, profile), true);
    const state = subject.getModuleAccessState(daycare, profile);
    check(state.allowed, true);
    check(state.status, "ready");
  });
}

const deniedProfiles = [
  ["null", null], ["undefined", undefined], ["empty", {}],
  ["missing email", { ...ceo, email: undefined }],
  ["other account with CEO role", { ...ceo, email: "other@example.test" }],
  ["company colleague with CEO role", { ...ceo, email: "colleague@suiyuecare.com" }],
  ["lookalike email suffix", { ...ceo, email: "entrepreneur@suiyuecare.com.evil.example" }],
  ["staff source overrides spoofed CEO role", { ...ceo, sourceProfileId: "staff", roleKey: "ceo", id: "ceo" }],
  ["staff roleKey overrides spoofed CEO id", { ...ceo, sourceProfileId: "", roleKey: "staff", id: "ceo" }],
  ["uppercase role is not a template", { ...ceo, sourceProfileId: "CEO" }],
  ["missing role", { ...ceo, sourceProfileId: undefined, roleKey: undefined, id: undefined }],
  ["missing module", { ...ceo, modules: ["business", "home-care"] }],
  ["empty modules", { ...ceo, modules: [] }],
  ["null modules", { ...ceo, modules: null }],
  ["missing modules", { ...ceo, modules: undefined }],
  ["string modules cannot impersonate array", { ...ceo, modules: "day-care" }],
  ["custom includes is not a module array", { ...ceo, modules: { includes: () => true } }],
  ["Finance APM-only may not enter even with spoofed CEO fields", { ...ceo, financeApmOnly: true }],
  ["Finance-managed missing module", { ...ceo, financeManaged: true, modules: ["apm", "edoc"] }],
  ["client permission strings alone", { email: ceo.email, role: "ceo", modulePermissions: { roleKey: "ceo" }, modules: ["day-care"] }]
];
for (const [name, profile] of deniedProfiles) {
  await test(`deny matrix: ${name}`, async () => {
    broadRolePermission = true; // A local role override must never bypass this dedicated gate.
    check(subject.canOpenDaycareEntry(profile), false);
    check(subject.moduleIsAllowed(daycare, profile), false);
    const state = subject.getModuleAccessState(daycare, profile);
    check(state.allowed, false);
    check(state.status, "denied");
    await assert.rejects(() => subject.buildModuleLaunchUrl("day-care", profile), /僅開放執行長帳號/u);
    await assert.rejects(() => subject.launchConnectedModule("day-care", profile), /僅開放執行長帳號/u);
    assertions += 2;
    check(calls.navigation.length, 0);
    assertNoIdentityTransfer();
  });
}

await test("business is a usable folder for CEO, homecare remains unconfigured", async () => {
  check(subject.getModuleAccessState(business, ceo).status, "folder");
  check(subject.getModuleAccessState(business, ceo).allowed, true);
  check(subject.getModuleAccessState(homecare, ceo).status, "building");
  check(Object.hasOwn(subject.moduleLaunchUrls, "home-care"), false);
  check(subject.connectedModuleIds.has("home-care"), false);
  check(await subject.buildModuleLaunchUrl("home-care", ceo), null);
  check(await subject.launchConnectedModule("home-care", ceo), false);
  check(calls.navigation.length, 0);
  assertNoIdentityTransfer();
});

for (const override of [
  "", "https://evil.example/", "//evil.example/", "javascript:alert(1)",
  "https://finance.suiyuecare.com/", "https://daycare.suiyuecare.com/app/dashboard?email=synthetic&role=admin#access_token=synthetic",
  "https://daycare.suiyuecare.com/login?next=https://evil.example&payload=synthetic&signature=synthetic"
]) {
  await test(`daycare launch ignores override (${override ? "provided" : "empty"})`, async () => {
    assertCleanDaycareUrl(await subject.buildModuleLaunchUrl("day-care", ceo, override));
    check(await subject.launchConnectedModule("day-care", ceo, override), true);
    check(calls.navigation.length, 1);
    check(calls.navigation[0].mode, "assign");
    assertCleanDaycareUrl(calls.navigation[0].url);
    assertNoIdentityTransfer();
  });
}

await test("replace navigation stays fixed and carries no identity", async () => {
  check(await subject.launchConnectedModule("day-care", ceo, "https://evil.example", "replace"), true);
  check(calls.navigation, [{ mode: "replace", url: daycareUrl }]);
  assertNoIdentityTransfer();
});

for (const rawNext of [
  "https://daycare.suiyuecare.com/",
  "https://daycare.suiyuecare.com/login?email=synthetic&role=admin",
  "https://daycare.suiyuecare.com/app/dashboard#access_token=synthetic",
  "https://daycare.suiyuecare.com/auth/callback?code=synthetic"
]) {
  for (const explicit of ["", "day-care"]) {
    await test("same-origin daycare deep links canonicalize to clean login", () => {
      check(subject.safeModuleLaunchRequest(rawNext, explicit), { moduleId: "day-care", returnTo: daycareUrl });
    });
  }
}

await test("explicit daycare with no return destination uses canonical login", () => {
  check(subject.safeModuleLaunchRequest("", "day-care"), { moduleId: "day-care", returnTo: daycareUrl });
  check(subject.safeModuleLaunchRequest("", "home-care"), null);
});

await test("foreign and mismatched deep links never become an external redirect", () => {
  for (const raw of ["https://evil.example/", "javascript:alert(1)", "https://daycare.suiyuecare.com.evil.example/", "https://daycare.suiyuecare.com@evil.example/"]) {
    check(subject.safeModuleLaunchRequest(raw), null);
    const explicitResult = subject.safeModuleLaunchRequest(raw, "day-care");
    // Both rejecting the request and ignoring an override in favor of the
    // canonical entry are safe; forwarding the input is never acceptable.
    ok(explicitResult === null || (explicitResult.moduleId === "day-care" && explicitResult.returnTo === daycareUrl));
  }
  check(subject.safeModuleLaunchRequest(daycareUrl, "accounting"), null);
  check(subject.safeModuleLaunchRequest(daycareUrl, "apm"), null);
  assertNoIdentityTransfer();
});

await test("Finance keeps its existing unsigned launch contract", async () => {
  check(subject.moduleLaunchUrls.accounting, "https://finance.suiyuecare.com/");
  const destination = new URL(await subject.buildModuleLaunchUrl("accounting", { email: "synthetic@example.test" }));
  check(destination.origin, "https://finance.suiyuecare.com");
  check(destination.searchParams.get("portal"), "1");
  check(destination.searchParams.get("email"), "synthetic@example.test");
  check(destination.searchParams.get("payload"), "synthetic-encoded-payload");
  check(calls.signed.length, 0);
  check(calls.submit.length, 0);
  check(subject.safeModuleLaunchRequest("https://finance.suiyuecare.com/?login=1", "accounting"), {
    moduleId: "accounting", returnTo: "https://finance.suiyuecare.com/?login=1"
  });
});

for (const moduleId of ["apm", "edoc"]) {
  await test(`${moduleId} retains signed POST handoff instead of token query strings`, async () => {
    await assert.rejects(() => subject.buildModuleLaunchUrl(moduleId, ceo), /POST/u);
    assertions += 1;
    check(await subject.launchConnectedModule(moduleId, ceo), true);
    check(calls.payload.length, 1);
    check(calls.signed.length, 1);
    check(calls.submit.length, 1);
    check(calls.submit[0].moduleId, moduleId);
    check(calls.submit[0].launchUrl, `https://${moduleId}.suiyuecare.com/`);
    check(calls.navigation.length, 0);
    check(calls.encoded.length, 0);
    check(calls.network.length, 0);
  });
}

await test("existing APM-only Finance profile remains APM-only", () => {
  const profile = { id: "synthetic-finance-user", email: "synthetic@example.test", financeApmOnly: true, modules: ["apm"] };
  for (const moduleId of ["accounting", "edoc", "business", "home-care", "day-care"]) {
    check(subject.moduleIsAllowed({ id: moduleId }, profile), false);
  }
  check(subject.moduleIsAllowed({ id: "apm" }, profile), true);
  check(subject.safeModuleLaunchRequest("https://apm.suiyuecare.com/projects?filter=open", "apm"), {
    moduleId: "apm", returnTo: "https://apm.suiyuecare.com/projects?filter=open"
  });
  check(subject.safeModuleLaunchRequest("https://edoc.suiyuecare.com/", "edoc"), {
    moduleId: "edoc", returnTo: "https://edoc.suiyuecare.com/"
  });
});

// A separate VM executes the actual loading implementation with a tiny DOM and
// deterministic timers. No jsdom, browser profile, real clock waits or network.
function loadingHarness({ overlayPresent = true } = {}) {
  class Element {
    hidden = false;
    disabled = false;
    textContent = "";
    attributes = new Map();
    focused = [];
    classes = new Set();
    classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name)
    };
    setAttribute(name, value) { this.attributes.set(name, value); if (name === "hidden") this.hidden = true; }
    removeAttribute(name) { this.attributes.delete(name); if (name === "hidden") this.hidden = false; }
    focus(options) { this.focused.push(options); }
  }
  class Button extends Element {}
  const elements = {
    overlay: new Element(), title: new Element(), description: new Element(),
    recovery: new Button(), shell: new Element(), body: new Element()
  };
  elements.overlay.hidden = true;
  elements.recovery.hidden = true;
  const timers = new Map();
  const frames = [];
  let sequence = 0;
  const timerWindow = {
    setTimeout(callback, delay) { const id = ++sequence; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; }
  };
  const loadingFunctions = [
    "getModuleLaunchProfile", "startModuleLaunchRecoveryTimer", "resetModuleLaunchLoadingContent",
    "showModuleLaunchLoading", "hideModuleLaunchLoading", "waitForModuleLaunchLoadingPaint"
  ];
  const loadingContext = vm.createContext({
    HTMLButtonElement: Button, window: timerWindow, document: { body: elements.body },
    moduleLaunchLoading: overlayPresent ? elements.overlay : null,
    moduleLaunchLoadingTitle: elements.title, moduleLaunchLoadingDescription: elements.description,
    moduleLaunchRecoveryButton: elements.recovery, portalShell: elements.shell
  });
  const initialState = ["activeModuleLaunchId", "activeModuleLaunchButton", "moduleLaunchRecoveryTimer"].map((name) => {
    const match = source.match(new RegExp(`^let ${name} = [^]*?;[ \\t]*$`, "m"));
    assert.ok(match, `Loading state ${name} must remain explicitly owned`);
    return match[0];
  });
  vm.runInContext([
    ...initialState,
    ...["moduleLaunchDefaultTitle", "moduleLaunchDefaultDescription", "moduleLaunchRecoveryDelayMs"].map(declarationSource),
    ...loadingFunctions.map(functionSource),
    `globalThis.loading = { ${loadingFunctions.join(", ")}, owner: () => activeModuleLaunchId };`
  ].join("\n"), loadingContext, { timeout: 1000, filename: "portal-loading-extracted.js" });
  function runTimers(delay) {
    for (const [id, timer] of Array.from(timers)) {
      if (timer.delay !== delay) continue;
      timers.delete(id);
      timer.callback();
    }
  }
  return {
    ...elements, Button, timers, frames, runTimers, loading: loadingContext.loading,
    runFrames() { for (const callback of frames.splice(0)) callback(); }
  };
}

for (const moduleId of ["apm", "day-care"]) {
  await test(`${moduleId} loading can only be cleared by its owner`, () => {
    const ui = loadingHarness();
    const trigger = new ui.Button();
    ui.loading.showModuleLaunchLoading(moduleId, trigger);
    check(ui.loading.owner(), moduleId);
    check(ui.overlay.hidden, false);
    check(trigger.disabled, true);
    check(trigger.attributes.get("aria-busy"), "true");
    check(ui.shell.attributes.has("inert"), true);
    check(ui.body.classes.has("is-module-launching"), true);
    check(ui.timers.size, 1);
    for (const wrongModule of ["accounting", "edoc", "unknown", moduleId === "apm" ? "day-care" : "apm"]) {
      ui.loading.hideModuleLaunchLoading(wrongModule);
      check(ui.overlay.hidden, false, "A stale or foreign operation cannot dismiss this overlay");
      check(trigger.disabled, true);
      check(ui.shell.attributes.has("inert"), true);
      check(ui.timers.size, 1);
      check(trigger.focused.length, 0);
    }
    ui.loading.hideModuleLaunchLoading(moduleId);
    check(ui.overlay.hidden, true);
    check(trigger.disabled, false);
    check(trigger.attributes.has("aria-busy"), false);
    check(ui.shell.attributes.has("aria-busy"), false);
    check(ui.shell.attributes.has("inert"), false);
    check(ui.body.classes.has("is-module-launching"), false);
    check(ui.timers.size, 0);
    check(ui.recovery.hidden, true);
    check(trigger.focused, [{ preventScroll: true }]);
  });

  await test(`${moduleId} loading/recovery copy stays with its own module`, () => {
    const ui = loadingHarness();
    ui.loading.showModuleLaunchLoading(moduleId, new ui.Button());
    const expectedName = moduleId === "day-care" ? "日間照顧系統" : "敏捷專案管理系統";
    ok(ui.title.textContent.includes(expectedName));
    if (moduleId === "day-care") {
      ok(ui.description.textContent.includes("日照管理驗證版登入頁"));
      ok(ui.description.textContent.includes("獨立驗證執行長的公司 Google 帳號"));
      ok(ui.description.textContent.includes("登入後須完成雙因素驗證"));
      ok(!ui.description.textContent.includes("Google 登入設定中"));
      ok(!`${ui.title.textContent}${ui.description.textContent}`.includes("敏捷專案"));
    }
    ui.runTimers(30_000);
    check(ui.recovery.hidden, false);
    ok(ui.title.textContent.includes(`${expectedName}連線時間較久`));
    ok(ui.description.textContent.includes(expectedName));
    if (moduleId === "day-care") ok(!`${ui.title.textContent}${ui.description.textContent}`.includes("敏捷專案"));
    ui.loading.hideModuleLaunchLoading(); // BFCache/recovery path defaults to the actual owner.
    check(ui.overlay.hidden, true);
    check(ui.recovery.hidden, true);
    ok(ui.title.textContent.includes(expectedName));
    check(ui.shell.attributes.has("inert"), false);
  });
}

await test("Finance/eDoc never acquire this APM/Daycare-only loading overlay", () => {
  const ui = loadingHarness();
  for (const moduleId of ["accounting", "edoc", "home-care", "unknown"]) {
    const trigger = new ui.Button();
    ui.loading.showModuleLaunchLoading(moduleId, trigger);
    check(ui.overlay.hidden, true);
    check(trigger.disabled, false);
    check(ui.shell.attributes.has("inert"), false);
    check(ui.timers.size, 0);
  }
});

await test("late APM completion cannot clear a newer Daycare owner", () => {
  const ui = loadingHarness();
  const apmTrigger = new ui.Button();
  ui.loading.showModuleLaunchLoading("apm", apmTrigger);
  const daycareTrigger = new ui.Button();
  ui.loading.showModuleLaunchLoading("day-care", daycareTrigger);
  check(apmTrigger.disabled, false);
  check(apmTrigger.attributes.has("aria-busy"), false);
  ui.loading.hideModuleLaunchLoading("apm");
  check(ui.loading.owner(), "day-care");
  check(ui.overlay.hidden, false);
  check(daycareTrigger.disabled, true);
  check(ui.timers.size, 1);
  ok(ui.title.textContent.includes("日間照顧系統"));
  ui.loading.hideModuleLaunchLoading();
  check(ui.overlay.hidden, true);
  check(daycareTrigger.disabled, false);
  check(apmTrigger.disabled, false);
  check(ui.shell.attributes.has("inert"), false);
});

await test("an already queued recovery callback cannot reshow controls after cleanup", () => {
  const ui = loadingHarness();
  ui.loading.showModuleLaunchLoading("day-care");
  const callback = Array.from(ui.timers.values())[0].callback;
  ui.loading.hideModuleLaunchLoading();
  const cleanTitle = ui.title.textContent;
  callback();
  check(ui.overlay.hidden, true);
  check(ui.recovery.hidden, true);
  check(ui.title.textContent, cleanTitle);
  check(ui.timers.size, 0);
});

await test("paint wait resolves immediately when the overlay is hidden or absent", async () => {
  for (const overlayPresent of [true, false]) {
    const ui = loadingHarness({ overlayPresent });
    await ui.loading.waitForModuleLaunchLoadingPaint("day-care");
    check(ui.frames.length, 0);
    check(ui.timers.size, 0);
  }
  const ui = loadingHarness();
  ui.loading.showModuleLaunchLoading("apm");
  await ui.loading.waitForModuleLaunchLoadingPaint("apm");
  check(ui.frames.length, 0);
  check(ui.timers.size, 1, "The existing APM recovery timer is the only timer");
});

await test("visible Daycare paint waits for the frame and clears its fallback", async () => {
  const ui = loadingHarness();
  ui.loading.showModuleLaunchLoading("day-care");
  let resolved = false;
  const paint = ui.loading.waitForModuleLaunchLoadingPaint("day-care").then(() => { resolved = true; });
  await Promise.resolve();
  check(resolved, false);
  check(ui.frames.length, 1);
  ui.runFrames();
  ui.runTimers(0);
  await paint;
  check(resolved, true);
  check(Array.from(ui.timers.values()).map((timer) => timer.delay), [30_000]);
});

await test("Daycare paint has a bounded fallback without animation frames", async () => {
  const ui = loadingHarness();
  ui.loading.showModuleLaunchLoading("day-care");
  const paint = ui.loading.waitForModuleLaunchLoadingPaint("day-care");
  ui.runTimers(100);
  await paint;
  check(Array.from(ui.timers.values()).map((timer) => timer.delay), [30_000]);
});

await test("loading still honors reduced-motion CSS", () => {
  const css = fs.readFileSync(new URL("../src/portal/portal.css", import.meta.url), "utf8");
  ok(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.module-launch-loading-bar b\s*\{[^}]*animation:\s*none;/u.test(css));
});

console.log(`ok - Portal care entry: ${cases} regression cases, ${assertions} assertions; extracted production helpers/loading, no real roster/Auth/network`);
