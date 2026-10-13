import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createPortalApiHandler } = require("../api/portal-handoff.js");
const profileApi = require("../server/portal-finance-profile.js");
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
    "profile = await findFinancePortalProfile(data.session, email)",
    fallbackGuard
  );
  assert.ok(staticLookup >= 0 && fallbackGuard > staticLookup && financeLookup > fallbackGuard);
  assert.ok(
    portalSource.slice(staticLookup, financeLookup).includes("if (!profile)"),
    "Finance lookup must remain a static-profile miss fallback"
  );
  assert.ok(portalSource.includes('if (profile?.financeManaged) return module.id === "hr" || profile.modules.includes(module.id)'));
  assert.ok(portalSource.includes('actionText: "核對權限"'));
  assert.ok(portalSource.includes('由人資系統確認授權'));
  assert.ok(portalSource.includes('modules: ["accounting", "apm", "edoc"]'));
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
    rpc:async(name)=>{assert.equal(name,'portal_session_status');return{data:{active:true,userId:authenticatedUser?.id},error:null};},
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
  const handler = createPortalApiHandler({
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
    url: "https://login.suiyuecare.com/api/portal-handoff?email=attacker@suiyuecare.com",
    headers: { authorization: `Bearer ${portalToken}` }
  });

  assert.equal(result.status, 200);
  assert.deepEqual(authCalls, [portalToken]);
  assert.equal(financeCalls.length, 1);
  assert.equal(financeCalls[0].url.searchParams.get("email"), `eq.${portalEmail}`);
  assert.equal(financeCalls[0].url.searchParams.get("active"), "eq.true");
  assert.equal(financeCalls[0].url.searchParams.get("org_status"), "eq.active");
  assert.equal(
    financeCalls[0].url.searchParams.get("org_source"),
    "in.(pptx_org_chart_20260728,personnel_management,atomic_member_admin_v1)"
  );
  assert.equal(financeCalls[0].init.cache, "no-store");
  assert.ok(financeCalls[0].init.signal instanceof AbortSignal);
  assert.equal(financeCalls[0].init.headers.apikey, financeSecret);
  assert.equal(financeCalls[0].init.headers.Authorization, undefined);
  assert.deepEqual(result.body, {
    ok: true,
    profile: {
      source: "finance-portal-self",
      email: portalEmail,
      displayName: "尤䅍笙",
      jobTitle: "臺北居家服務課專員",
      departmentCode: "B1101",
      allowedModules: ["accounting", "apm", "edoc"]
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

{
  const profile = projectSafeProfile([
    financeRow({
      org_source: "personnel_management",
      email: "homecare.taipei2@suiyuecare.com"
    })
  ], "homecare.taipei2@suiyuecare.com");
  assert.equal(profile.email, "homecare.taipei2@suiyuecare.com");
  assert.deepEqual(profile.allowedModules, ["accounting", "apm", "edoc"]);
}

// A member saved by the transactional personnel editor can enter Portal and
// launch both signed modules through the same real Finance profile lookup.
// This is a fictional account outside the static roster, including a Workspace
// primary-address change. Auth's old email must not pick another employee.
{
  const email = "atomic-member.fixture@suiyuecare.com";
  const authId = "fixture-portal-auth-id";
  const user = {
    id: authId,
    email: "old-address.fixture@suiyuecare.com",
    identities: [{ provider: "google", identity_data: { email, email_verified: true } }]
  };
  let currentRows = [financeRow({ email, org_source: "atomic_member_admin_v1" })];
  let currentSession = { active: true, userId: authId };
  const financeCalls = [];
  const handler = createPortalApiHandler({
    environment: {
      ...environment,
      APM_PORTAL_SIGNING_SECRET: "a".repeat(48),
      EDOC_PORTAL_HANDOFF_SECRET: "e".repeat(48)
    },
    createPortalClient: () => ({
      ...portalClientFor(user)(),
      rpc: async (name) => {
        assert.equal(name, "portal_session_status");
        return { data: currentSession, error: null };
      }
    }),
    fetchImplementation: async (input) => {
      const url = new URL(input);
      financeCalls.push(url);
      assert.equal(url.searchParams.get("email"), `eq.${email}`);
      assert.equal(url.searchParams.get("active"), "eq.true");
      assert.equal(url.searchParams.get("org_status"), "eq.active");
      assert.equal(url.searchParams.get("org_source"),
        "in.(pptx_org_chart_20260728,personnel_management,atomic_member_admin_v1)");
      return Response.json(currentRows);
    }
  });
  const getRequest = { method: "GET", headers: { authorization: `Bearer ${portalToken}` } };
  const getResult = await invoke(handler, getRequest);
  assert.equal(getResult.status, 200);
  assert.equal(getResult.body.profile.email, email);
  assert.deepEqual(getResult.body.profile.allowedModules, ["accounting", "apm", "edoc"]);
  for (const forbidden of ["u_ppt_profile", "role", "scope", "authUserId"]) {
    assert.equal(JSON.stringify(getResult.body).includes(forbidden), false);
  }

  for (const moduleId of ["apm", "edoc"]) {
    const before = financeCalls.length;
    const result = await invoke(handler, {
      method: "POST", headers: getRequest.headers,
      body: { payload: { moduleId, email, role: "ceo", scope: "group", actions: ["manage"] } }
    });
    assert.equal(result.status, 200);
    assert.equal(financeCalls.length, before + 1, "Each launch must revalidate the member");
    const signed = JSON.parse(Buffer.from(result.body.payload, "base64url").toString("utf8"));
    assert.equal(signed.email, email);
    assert.equal(signed.aud, moduleId);
    assert.equal(Object.hasOwn(signed, "role"), false);
    assert.equal(Object.hasOwn(signed, "scope"), false);
    assert.equal(Object.hasOwn(signed, "actions"), false);
    if (moduleId === "edoc") assert.equal(signed.authUserId, authId);
  }

  const validRow = currentRows[0];
  for (const rows of [[], [validRow, validRow], [{ ...validRow, active: false }],
    [{ ...validRow, org_status: "inactive" }], [{ ...validRow, email: user.email }],
    [{ ...validRow, org_source: "untrusted-member-source" }]]) {
    currentRows = rows;
    const result = await invoke(handler, getRequest);
    assert.notEqual(result.status, 200, "Invalid members must remain blocked");
    assert.equal(result.body.profile, undefined);
    for (const moduleId of ["apm", "edoc"]) {
      const denied = await invoke(handler, {
        method: "POST", headers: getRequest.headers, body: { payload: { moduleId, email } }
      });
      assert.notEqual(denied.status, 200, "Invalid members must not obtain module assertions");
      assert.equal(denied.body.signature, undefined);
    }
  }
  currentRows = [validRow];
  for (const session of [{ active: false, userId: authId }, { active: true, userId: "another-auth-id" }]) {
    currentSession = session;
    const before = financeCalls.length;
    const result = await invoke(handler, getRequest);
    assert.equal(result.status, 401);
    assert.equal(financeCalls.length, before, "Invalid sessions must not query employee profiles");
  }
}

{
  for (const forbiddenSource of ["preexisting_finance_runtime", null]) {
    assert.throws(
      () => projectSafeProfile([financeRow({ org_source: forbiddenSource })], portalEmail),
      /invalid employee profile/
    );
  }
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
