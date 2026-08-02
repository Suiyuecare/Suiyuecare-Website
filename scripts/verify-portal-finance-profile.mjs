import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const profileApi = require("../api/portal-finance-profile.js");
const {
  createPortalFinanceProfileHandler,
  financeConfiguration,
  financeRequestHeaders,
  projectSafeProfile
} = profileApi;

const portalToken = "portal-session-token";
const portalEmail = "homecare.tpe1@suiyuecare.com";
const financeSecret = `sb_secret_${"f".repeat(48)}`;
const environment = {
  SUPABASE_URL: "https://portalref.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"p".repeat(36)}`,
  FINANCE_SOURCE_SUPABASE_URL: "https://udtlppnrugmtzhigdsxo.supabase.co",
  FINANCE_SOURCE_SECRET_KEY: financeSecret
};

{
  const portalSource = fs.readFileSync(new URL("../src/portal/login.js", import.meta.url), "utf8");
  const staticLookup = portalSource.indexOf("let profile = findProfileByEmail(email);");
  const fallbackGuard = portalSource.indexOf("if (!profile) {", staticLookup);
  const financeLookup = portalSource.indexOf(
    "profile = await findFinanceApmProfile(data.session, email)",
    fallbackGuard
  );
  assert.ok(staticLookup >= 0 && fallbackGuard > staticLookup && financeLookup > fallbackGuard);
  assert.ok(
    portalSource.slice(staticLookup, financeLookup).includes("if (!profile)"),
    "Finance lookup must remain a static-profile miss fallback"
  );
  assert.ok(portalSource.includes('if (profile?.financeApmOnly) return module.id === "apm"'));
  assert.ok(portalSource.includes('modules: ["apm"]'));
}

function responseRecorder() {
  const headers = new Map();
  return {
    statusCode: 0,
    body: "",
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), String(value));
    },
    getHeader(name) {
      return headers.get(String(name).toLowerCase()) || "";
    },
    end(body = "") {
      this.body = String(body);
    }
  };
}

async function invoke(handler, request) {
  const response = responseRecorder();
  await handler(request, response);
  return {
    status: response.statusCode,
    headers: response,
    body: JSON.parse(response.body)
  };
}

function portalClientFor(user, error = null, calls = []) {
  const authenticatedUser = user
    ? {
        email_confirmed_at: "2026-08-02T00:00:00.000Z",
        app_metadata: { provider: "google", providers: ["google"] },
        identities: [{ provider: "google", identity_data: { email: user.email } }],
        ...user
      }
    : user;
  return () => ({
    auth: {
      async getUser(token) {
        calls.push(token);
        return { data: { user: authenticatedUser }, error };
      }
    }
  });
}

function financeRow(overrides = {}) {
  return {
    id: "u_ppt_profile",
    name: "尤䅍笙",
    email: portalEmail,
    job_title: "臺北居家服務課專員",
    department_code: "B1101",
    active: true,
    org_status: "active",
    org_source: "pptx_org_chart_20260728",
    ...overrides
  };
}

{
  const authCalls = [];
  const financeCalls = [];
  const handler = createPortalFinanceProfileHandler({
    environment,
    createPortalClient: portalClientFor(
      { id: "portal-user-id", email: portalEmail },
      null,
      authCalls
    ),
    fetchImplementation: async (input, init) => {
      financeCalls.push({ url: new URL(input), init });
      return Response.json([financeRow()]);
    }
  });
  const result = await invoke(handler, {
    method: "GET",
    url: "https://login.suiyuecare.com/api/portal-finance-profile?email=attacker@suiyuecare.com",
    headers: { authorization: `Bearer ${portalToken}` }
  });

  assert.equal(result.status, 200);
  assert.deepEqual(authCalls, [portalToken]);
  assert.equal(financeCalls.length, 1);
  assert.equal(financeCalls[0].url.searchParams.get("email"), `eq.${portalEmail}`);
  assert.equal(financeCalls[0].url.searchParams.get("active"), "eq.true");
  assert.equal(financeCalls[0].url.searchParams.get("org_status"), "eq.active");
  assert.equal(financeCalls[0].url.searchParams.get("org_source"), "eq.pptx_org_chart_20260728");
  assert.equal(financeCalls[0].init.cache, "no-store");
  assert.ok(financeCalls[0].init.signal instanceof AbortSignal);
  assert.equal(financeCalls[0].init.headers.apikey, financeSecret);
  assert.equal(financeCalls[0].init.headers.Authorization, undefined);
  assert.deepEqual(result.body, {
    ok: true,
    profile: {
      source: "finance-apm-self",
      email: portalEmail,
      displayName: "尤䅍笙",
      jobTitle: "臺北居家服務課專員",
      departmentCode: "B1101",
      allowedModules: ["apm"]
    }
  });
  assert.equal(result.headers.getHeader("cache-control"), "no-store");
  assert.equal(result.headers.getHeader("vary"), "Authorization");
  const serialized = JSON.stringify(result.body);
  for (const forbidden of ["u_ppt_profile", "role", "canApprove", "supervisor", "authUserId"]) {
    assert.equal(serialized.includes(forbidden), false, `Response leaked ${forbidden}`);
  }
}

{
  let financeCalled = false;
  const handler = createPortalFinanceProfileHandler({
    environment,
    createPortalClient: portalClientFor({ id: "unused", email: portalEmail }),
    fetchImplementation: async () => {
      financeCalled = true;
      return Response.json([]);
    }
  });
  const result = await invoke(handler, { method: "GET", headers: {} });
  assert.equal(result.status, 401);
  assert.equal(financeCalled, false);
}

{
  let financeCalled = false;
  const handler = createPortalFinanceProfileHandler({
    environment,
    createPortalClient: portalClientFor(null, new Error("expired raw auth detail")),
    fetchImplementation: async () => {
      financeCalled = true;
      return Response.json([]);
    }
  });
  const result = await invoke(handler, {
    method: "GET",
    headers: { authorization: `Bearer ${portalToken}` }
  });
  assert.equal(result.status, 401);
  assert.equal(financeCalled, false);
  assert.equal(JSON.stringify(result.body).includes("raw auth detail"), false);
}

{
  let financeCalled = false;
  const handler = createPortalFinanceProfileHandler({
    environment,
    createPortalClient: portalClientFor({
      id: "portal-user-id",
      email: portalEmail,
      email_confirmed_at: null
    }),
    fetchImplementation: async () => {
      financeCalled = true;
      return Response.json([financeRow()]);
    }
  });
  const result = await invoke(handler, {
    method: "GET",
    headers: { authorization: `Bearer ${portalToken}` }
  });
  assert.equal(result.status, 403);
  assert.equal(financeCalled, false);
}

{
  const handler = createPortalFinanceProfileHandler({
    environment,
    createPortalClient: portalClientFor({ id: "portal-user-id", email: portalEmail }),
    fetchImplementation: async () => Response.json([])
  });
  const result = await invoke(handler, {
    method: "GET",
    headers: { authorization: `Bearer ${portalToken}` }
  });
  assert.equal(result.status, 403);
  assert.equal(result.body.ok, false);
}

{
  const handler = createPortalFinanceProfileHandler({
    environment,
    createPortalClient: portalClientFor({ id: "portal-user-id", email: portalEmail }),
    fetchImplementation: async () => new Response("private upstream error", { status: 500 })
  });
  const result = await invoke(handler, {
    method: "GET",
    headers: { authorization: `Bearer ${portalToken}` }
  });
  assert.equal(result.status, 503);
  assert.equal(JSON.stringify(result.body).includes("private upstream"), false);
}

{
  const handler = createPortalFinanceProfileHandler({
    environment,
    createPortalClient: portalClientFor({ id: "portal-user-id", email: portalEmail }),
    fetchImplementation: async () => {
      throw new Error(`network failed with ${financeSecret}`);
    }
  });
  const result = await invoke(handler, {
    method: "GET",
    headers: { authorization: `Bearer ${portalToken}` }
  });
  assert.equal(result.status, 503);
  assert.equal(JSON.stringify(result.body).includes(financeSecret), false);
}

{
  assert.throws(
    () => projectSafeProfile([financeRow({ email: "different@suiyuecare.com" })], portalEmail),
    /invalid employee profile/
  );
}

function legacyServiceRoleKey(ref) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role: "service_role", ref })).toString("base64url");
  return `${header}.${payload}.${"s".repeat(48)}`;
}

{
  const key = legacyServiceRoleKey("udtlppnrugmtzhigdsxo");
  const configuration = financeConfiguration({
    FINANCE_SOURCE_SUPABASE_URL: "https://udtlppnrugmtzhigdsxo.supabase.co",
    FINANCE_SOURCE_SECRET_KEY: key
  });
  const headers = financeRequestHeaders(configuration);
  assert.equal(headers.apikey, key);
  assert.equal(headers.Authorization, `Bearer ${key}`);
}

{
  assert.throws(
    () => financeConfiguration({
      NODE_ENV: "production",
      FINANCE_SOURCE_SUPABASE_URL: "https://attacker-project.supabase.co",
      FINANCE_SOURCE_SECRET_KEY: financeSecret
    }),
    /not configured/
  );
  assert.throws(
    () => financeConfiguration({
      NODE_ENV: "production",
      FINANCE_SOURCE_SUPABASE_URL: "https://udtlppnrugmtzhigdsxo.supabase.co@attacker.example",
      FINANCE_SOURCE_SECRET_KEY: financeSecret
    }),
    /not configured/
  );
}

console.log("ok - Portal Finance self-profile verifier passed");
