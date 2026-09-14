import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { parse } from "acorn";

const require = createRequire(import.meta.url);
const { createPortalApiHandler } = require("../api/portal-handoff.js");
const source = fs.readFileSync(new URL("../src/portal/login.js", import.meta.url), "utf8");
const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
export const employeeEmails = ["reference@example.suiyuecare.com", "new-employee-one@example.suiyuecare.com", "new-employee-two@example.suiyuecare.com"];
export const allowedModules = ["accounting", "apm", "edoc"];
export const fixtureToken = "fictional-local-session-only";
const secrets = { apm: "a".repeat(48), edoc: "e".repeat(48) };

// All identities and transport results are local fixtures. No real session is
// requested and no real account, role, roster or notification is written.
export function employeeHandler(email, options = {}) {
  const reads = [];
  const user = options.noUser ? null : {
    id: "fictional-portal-auth-id", email,
    email_confirmed_at: "2026-09-14T00:00:00Z",
    app_metadata: { provider: "google", providers: ["google"] },
    identities: [{ provider: "google", identity_data: { email } }],
    ...options.user
  };
  const row = {
    id: "fictional-finance-employee", name: "範例個管專員", email,
    job_title: "新北個管課專員", department_code: "G1102", active: true,
    org_status: "active", org_source: "personnel_management", ...options.row
  };
  const handler = createPortalApiHandler({
    environment: {
      NODE_ENV: "test", SUPABASE_URL: "https://portal.invalid",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_localfixture",
      FINANCE_SOURCE_SUPABASE_URL: "https://udtlppnrugmtzhigdsxo.supabase.co",
      FINANCE_SOURCE_SECRET_KEY: "sb_secret_" + "f".repeat(48),
      APM_PORTAL_SIGNING_SECRET: secrets.apm, EDOC_PORTAL_HANDOFF_SECRET: secrets.edoc
    },
    createPortalClient: () => ({ auth: { getUser: async (token) => ({
      data: { user: token === fixtureToken ? user : null }, error: null
    }) } }),
    fetchImplementation: async (input, init) => {
      const url = new URL(input);
      assert.equal(url.pathname, "/rest/v1/finance_users");
      assert.equal(url.searchParams.get("email"), `eq.${email}`);
      assert.equal(url.searchParams.get("active"), "eq.true");
      assert.equal(url.searchParams.get("org_status"), "eq.active");
      assert.equal(url.searchParams.get("org_source"), "in.(pptx_org_chart_20260728,personnel_management)");
      assert.equal(init.method, "GET");
      reads.push(url.toString());
      return Response.json(options.rows ?? [row]);
    },
    now: () => Date.parse("2026-09-14T00:00:00Z"),
    randomUUID: () => "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
  });
  return { handler, reads };
}

export async function invokePortal(handler, method = "GET", payload, headers = { authorization: `Bearer ${fixtureToken}` }) {
  const response = { statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(body) { this.body = JSON.parse(body); } };
  await handler({ method, headers, body: payload ? { payload } : undefined }, response);
  return response;
}

export function verifyAssertion(result, moduleId, email) {
  assert.equal(result.statusCode, 200);
  const body = result.body;
  assert.equal(body.signature, crypto.createHmac("sha256", secrets[moduleId]).update(body.payload).digest("base64url"));
  const claim = JSON.parse(Buffer.from(body.payload, "base64url").toString());
  assert.equal(claim.email, email);
  assert.equal(claim.aud, moduleId);
  assert.equal(claim.exp - claim.iat, 600);
  assert.deepEqual(Object.keys(claim).sort(), (moduleId === "edoc"
    ? ["email", "iat", "exp", "jti", "source", "aud", "moduleId", "authUserId"]
    : ["email", "iat", "exp", "jti", "aud", "returnTo"]).sort());
  assert.equal(result.headers["cache-control"], "no-store");
  return claim;
}

function realFunctions(names) {
  return names.map((name) => {
    const node = ast.body.find((n) => n.type === "FunctionDeclaration" && n.id.name === name);
    assert.ok(node, `Missing real function ${name}`);
    return source.slice(node.start, node.end);
  }).join("\n");
}

export async function verifyEmployeeModules() {
  let checks = 0;
  for (const email of employeeEmails) {
    const { handler, reads } = employeeHandler(email);
    const result = await invokePortal(handler);
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.profile.allowedModules, allowedModules); checks++;
    const context = vm.createContext({
      fetch: async () => ({ status: result.statusCode, ok: true, json: async () => result.body }),
      moduleLaunchUrls: { accounting: "https://finance.suiyuecare.com/" },
      modulePermissionAllowsRole: () => true, sharedGeneralAffairsModules: new Set(["pdf-editor"]),
      restrictedGeneralAffairsModules: new Set(["system-permissions", "organization-chart"]),
      generalAffairsManagers: new Set(["ceo"]),
      temporarilyOpenModuleIds: new Set(allowedModules), connectedModuleIds: new Set(allowedModules)
    });
    vm.runInContext(realFunctions(["normalizeEmail", "findFinancePortalProfile", "canOpenDaycareEntry", "moduleIsAllowed", "getModuleAccessState", "buildModuleLaunchUrl"]), context);
    const profile = await context.findFinancePortalProfile({ access_token: fixtureToken }, email);
    assert.equal(profile.scope, "self");
    assert.equal(profile.financeManaged, true);
    assert.deepEqual(Array.from(profile.modules), allowedModules); checks++;
    for (const moduleId of allowedModules) {
      assert.equal(context.getModuleAccessState({ id: moduleId }, profile).status, "ready"); checks++;
    }
    for (const moduleId of ["hr", "day-care", "website-backoffice", "system-permissions", "employee-accounts", "organization-chart", "general-affairs", "pdf-editor"]) {
      assert.equal(context.getModuleAccessState({ id: moduleId }, profile).status, "denied", moduleId); checks++;
    }
    assert.equal(await context.buildModuleLaunchUrl("accounting", profile, "https://attacker.invalid/"), "https://finance.suiyuecare.com/"); checks++;
    for (const moduleId of ["apm", "edoc"]) {
      const assertion = await invokePortal(handler, "POST", { moduleId, email, role: "ceo", scope: "group", actions: ["manage"], authUserId: "attacker", returnTo: "/tasks" });
      verifyAssertion(assertion, moduleId, email); checks++;
    }
    assert.equal(reads.length, 3, "Profile and both signed handoffs revalidate independently"); checks++;
    for (const moduleId of ["accounting", "website-backoffice", "system-permissions", "hr"]) {
      assert.equal((await invokePortal(handler, "POST", { moduleId, email })).statusCode, 400); checks++;
    }
    // A malicious or stale profile cannot add a fourth module or lose exact identity.
    for (const patch of [{ allowedModules: [...allowedModules, "website-backoffice"] }, { allowedModules: ["apm"] }, { email: "someone-else@suiyuecare.com" }]) {
      context.fetch = async () => ({ status: 200, ok: true, json: async () => ({ ok: true, profile: { ...result.body.profile, ...patch } }) });
      await assert.rejects(() => context.findFinancePortalProfile({ access_token: fixtureToken }, email), /格式無效/); checks++;
    }
  }
  for (const options of [
    { rows: [] }, { row: { active: false } }, { row: { org_status: "inactive" } },
    { row: { org_source: "preexisting_finance_runtime" } }, { row: { department_code: null } },
    { row: { email: "other@suiyuecare.com" } }, { noUser: true },
    { user: { email_confirmed_at: null } },
    { user: { identities: [{ provider: "google", identity_data: { email: "other@suiyuecare.com" } }] } }
  ]) {
    const { handler } = employeeHandler(employeeEmails[1], options);
    for (const method of ["GET", "POST"]) {
      const result = await invokePortal(handler, method, method === "POST" ? { moduleId: "edoc", email: employeeEmails[1] } : undefined);
      assert.notEqual(result.statusCode, 200);
      assert.equal(result.body.signature, undefined);
      assert.equal(result.body.profile, undefined); checks++;
    }
  }
  const { handler, reads } = employeeHandler(employeeEmails[2]);
  for (const method of ["GET", "POST"]) {
    assert.equal((await invokePortal(handler, method, { moduleId: "edoc" }, {})).statusCode, 401); checks++;
  }
  assert.equal(reads.length, 0); checks++;
  console.log(`ok - ${checks} Portal employee module checks passed (fictional sessions only)`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await verifyEmployeeModules();
