import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createPortalApiHandler } = require("../api/portal-handoff.js");
const { staticPortalModuleGrants } = require("../server/portal-module-policy.js");

const portalToken = "portal-google-session";
const issuedAtMs = 1_785_632_400_000;
const fixedJti = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const apmSecret = "a".repeat(48);
const edocSecret = "e".repeat(48);
const daycareSecret = "d".repeat(48);
const environment = {
  NODE_ENV: "test",
  SUPABASE_URL: "https://portalref.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"p".repeat(36)}`,
  APM_PORTAL_SIGNING_SECRET: apmSecret,
  PORTAL_DAYCARE_HANDOFF_SECRET: daycareSecret,
  EDOC_PORTAL_HANDOFF_SECRET: edocSecret
};

function verifiedGoogleUser(email, overrides = {}) {
  return {
    id: "portal-auth-user-id",
    email,
    email_confirmed_at: "2026-08-02T00:00:00.000Z",
    app_metadata: { provider: "google", providers: ["google"] },
    identities: [{ provider: "google", id: "google-sub-123", identity_data: {
      email, email_verified: true, sub: "google-sub-123"
    } }],
    ...overrides
  };
}

function portalClientFor(user, error = null, calls = []) {
  return () => ({
    rpc:async(name)=>{assert.equal(name,'portal_session_status');return {data:{active:true,userId:user?.id},error:null};},
    auth: {
      async getUser(token) {
        calls.push(token);
        return { data: { user }, error };
      }
    }
  });
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

function requestFor(payload, overrides = {}) {
  return {
    method: "POST",
    headers: { authorization: `Bearer ${portalToken}` },
    body: { payload },
    ...overrides
  };
}

function decodeSignedPayload(result) {
  assert.equal(result.body.ok, true);
  const encoded = result.body.payload;
  const audience = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")).aud;
  const secret = audience === "apm" ? apmSecret : audience === "daycare" ? daycareSecret : edocSecret;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  assert.equal(result.body.token, `${encoded}.${result.body.signature}`);
  assert.equal(result.body.signature, expected);
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
}

function handlerFor(user, overrides = {}) {
  return createPortalApiHandler({
    environment: overrides.environment || environment,
    createPortalClient: portalClientFor(user, overrides.authError, overrides.authCalls),
    financeLookup: overrides.financeLookup || (async () => {
      throw Object.assign(new Error("This account is not an active Finance employee profile."), {
        statusCode: 403
      });
    }),
    fetchImplementation: overrides.fetchImplementation || (async () => {
      throw new Error("Unexpected Finance network call");
    }),
    now: () => issuedAtMs,
    randomUUID: () => fixedJti
  });
}

// The server allowlist must stay synchronized with the immutable 啟用 rows.
{
  const portalSource = fs.readFileSync(new URL("../src/portal/login.js", import.meta.url), "utf8");
  const start = portalSource.indexOf("const employeeAccountRows = [");
  const end = portalSource.indexOf("\n];", start) + 3;
  assert.ok(start >= 0 && end > start);
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    portalSource.slice(start, end).replace("const employeeAccountRows", "globalThis.rows"),
    context
  );
  const enabledEmails = JSON.parse(JSON.stringify(context.rows))
    .filter((row) => row[10] === "啟用")
    .map((row) => String(row[2]).toLowerCase())
    .sort();
  assert.deepEqual([...staticPortalModuleGrants.keys()].sort(), enabledEmails);

  const suChihHsuan = JSON.parse(JSON.stringify(context.rows)).find(
    (row) => String(row[2]).toLowerCase() === "admin.ntpc@suiyuecare.com"
  );
  assert.deepEqual(suChihHsuan, [
    54,
    "蘇之瑄",
    "admin.ntpc@suiyuecare.com",
    "職員",
    "行政品管專員",
    "教學品管部",
    "歲悅股份有限公司",
    "新北市",
    "未設定",
    "個人與指派",
    "啟用"
  ]);
  assert.deepEqual(
    [...staticPortalModuleGrants.get("admin.ntpc@suiyuecare.com")].sort(),
    ["apm", "edoc"]
  );
  for (const email of ["entrepreneur@suiyuecare.com", "daycare.wanhua@suiyuecare.com"]) {
    assert.deepEqual([...staticPortalModuleGrants.get(email)].sort(), ["apm", "day-care", "edoc"]);
  }
  assert.deepEqual(
    [...staticPortalModuleGrants].filter(([, modules]) => modules.has("day-care")).map(([email]) => email).sort(),
    ["daycare.wanhua@suiyuecare.com", "entrepreneur@suiyuecare.com"]
  );
}

// A direct API caller cannot turn an enabled employee into CEO or expand EDOC
// scope/actions; every authorization-looking browser field is discarded.
{
  const email = "generalaffairs@suiyuecare.com";
  const financeCalls = [];
  const handler = handlerFor(verifiedGoogleUser(email), {
    financeLookup: async (...args) => financeCalls.push(args)
  });
  const result = await invoke(handler, requestFor({
    moduleId: "edoc",
    email,
    role: "ceo",
    roleKey: "ceo",
    sourceRoleKey: "ceo",
    scope: "group",
    dataScopeKey: "group",
    actions: ["manage", "delete", "approve"],
    moduleActions: ["manage", "delete", "approve"],
    modulePermissions: { roleKey: "ceo", scope: "group", actions: ["manage"] },
    authUserId: "attacker-controlled-auth-id",
    company: "attacker-controlled-company"
  }));
  assert.equal(result.status, 200);
  assert.equal(financeCalls.length, 0);
  const payload = decodeSignedPayload(result);
  assert.deepEqual(payload, {
    email,
    iat: Math.floor(issuedAtMs / 1000),
    exp: Math.floor(issuedAtMs / 1000) + 600,
    jti: fixedJti,
    source: "logging-portal",
    aud: "edoc",
    moduleId: "edoc",
    authUserId: "portal-auth-user-id"
  });
  for (const forbidden of ["role", "roleKey", "scope", "actions", "modulePermissions", "company"] ) {
    assert.equal(Object.hasOwn(payload, forbidden), false, `EDOC assertion copied ${forbidden}`);
  }
  assert.equal(result.headers.getHeader("cache-control"), "no-store");
  assert.equal(result.headers.getHeader("vary"), "Authorization");
}

// A Finance fallback identity is revalidated for both signed destinations;
// each assertion contains identity only, never browser roles or approval scope.
{
  const email = "homecare.tpe1@suiyuecare.com";
  const calls = [];
  const user = verifiedGoogleUser(email);
  const handler = handlerFor(user, {
    financeLookup: async (...args) => {
      calls.push(args);
      return { source: "finance-portal-self", email, allowedModules: ["accounting", "apm", "edoc"] };
    }
  });
  const apmResult = await invoke(handler, requestFor({
    moduleId: "apm",
    email,
    returnTo: "/tasks?create=delegated",
    role: "ceo",
    scope: "group",
    actions: ["manage"]
  }));
  assert.equal(apmResult.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], email);
  const apmPayload = decodeSignedPayload(apmResult);
  assert.deepEqual(apmPayload, {
    email,
    iat: Math.floor(issuedAtMs / 1000),
    exp: Math.floor(issuedAtMs / 1000) + 600,
    jti: fixedJti,
    aud: "apm",
    returnTo: "/tasks?create=delegated"
  });
  assert.equal(Object.hasOwn(apmPayload, "role"), false);

  const edocResult = await invoke(handler, requestFor({ moduleId: "edoc", email, role: "ceo" }));
  assert.equal(edocResult.status, 200);
  assert.equal(calls.length, 2, "EDOC must independently revalidate the Finance employee");
  assert.deepEqual(decodeSignedPayload(edocResult), {
    email, iat: Math.floor(issuedAtMs / 1000), exp: Math.floor(issuedAtMs / 1000) + 600,
    jti: fixedJti, source: "logging-portal", aud: "edoc", moduleId: "edoc",
    authUserId: "portal-auth-user-id"
  });
}

// Notification destinations are preserved without accepting an external redirect.
{
  const email = "homecare.tpe1@suiyuecare.com";
  const handler = handlerFor(verifiedGoogleUser(email), {
    financeLookup: async () => ({ source: "finance-portal-self", email, allowedModules: ["apm"] })
  });
  for (const returnTo of ["/journal?date=2026-09-25&view=team", "/surveys/campaign-1?mode=answer"]) {
    const result = await invoke(handler, requestFor({ moduleId: "apm", email, returnTo }));
    assert.equal(result.status, 200);
    assert.equal(decodeSignedPayload(result).returnTo, returnTo);
  }
  const unsafe = await invoke(handler, requestFor({ moduleId: "apm", email, returnTo: "//outside.example/surveys" }));
  assert.equal(unsafe.status, 400);
}

// Daycare handoff binds the pre-approved employee to the same immutable Google
// subject. No browser role, scope or claimed subject is copied into the HMAC.
{
  for (const email of ["entrepreneur@suiyuecare.com", "daycare.wanhua@suiyuecare.com"]) {
    let financeCalls = 0;
    const handler = handlerFor(verifiedGoogleUser(email), {
      financeLookup: async () => { financeCalls += 1; throw new Error("Daycare must not use Finance grants"); }
    });
    const result = await invoke(handler, requestFor({
      moduleId: "day-care",
      email,
      returnTo: "/app/staff/assessments/abcd?client=123",
      role: "ceo",
      scope: "group",
      googleSub: "attacker-chosen-subject"
    }));
    assert.equal(result.status, 200);
    assert.equal(financeCalls, 0);
    assert.deepEqual(decodeSignedPayload(result), {
      email,
      iat: Math.floor(issuedAtMs / 1000),
      exp: Math.floor(issuedAtMs / 1000) + 600,
      jti: fixedJti,
      aud: "daycare",
      googleSub: "google-sub-123",
      returnTo: "/app/staff/assessments/abcd?client=123"
    });
    assert.equal(result.headers.getHeader("cache-control"), "no-store");
  }

  const unauthorized = await invoke(
    handlerFor(verifiedGoogleUser("admin@suiyuecare.com"), {
      financeLookup: async () => ({ source: "finance-portal-self", email: "admin@suiyuecare.com", allowedModules: ["day-care"] })
    }),
    requestFor({ moduleId: "day-care", role: "ceo", email: "admin@suiyuecare.com" })
  );
  assert.equal(unauthorized.status, 403);
  assert.equal(unauthorized.body.signature, undefined);

  const email = "entrepreneur@suiyuecare.com";
  const providerSubject = await invoke(
    handlerFor(verifiedGoogleUser(email, { identities: [
      { provider: "google", provider_id: "google-sub-123", id: "identity-row-id", identity_data: {
        email, sub: "google-sub-123", email_verified: true
      } }
    ] })),
    requestFor({ moduleId: "day-care", email })
  );
  assert.equal(providerSubject.status, 200);
  assert.equal(decodeSignedPayload(providerSubject).googleSub, "google-sub-123");
  const missingSubject = await invoke(
    handlerFor(verifiedGoogleUser(email, { identities: [
      { provider: "google", identity_data: { email, email_verified: true } }
    ] })),
    requestFor({ moduleId: "day-care", email })
  );
  assert.equal(missingSubject.status, 403);
  const unverifiedIdentity = await invoke(
    handlerFor(verifiedGoogleUser(email, { identities: [
      { provider: "google", identity_data: { email, sub: "google-sub-123", email_verified: false } }
    ] })),
    requestFor({ moduleId: "day-care", email })
  );
  assert.equal(unverifiedIdentity.status, 403);
  const mismatchedSubject = await invoke(
    handlerFor(verifiedGoogleUser(email, { identities: [
      { provider: "google", id: "other-subject", identity_data: { email, sub: "google-sub-123", email_verified: true } }
    ] })),
    requestFor({ moduleId: "day-care", email })
  );
  assert.equal(mismatchedSubject.status, 403);
  const duplicateIdentity = await invoke(
    handlerFor(verifiedGoogleUser(email, { identities: [
      { provider: "google", id: "google-sub-123", identity_data: { email, sub: "google-sub-123", email_verified: true } },
      { provider: "google", id: "google-sub-456", identity_data: { email, sub: "google-sub-456", email_verified: true } }
    ] })),
    requestFor({ moduleId: "day-care", email })
  );
  assert.equal(duplicateIdentity.status, 403);

  for (const returnTo of ["//evil.example/app", "/login", "/api/auth/handoff", "/app#token=secret", "/app\\evil", "/app/%2fadmin", "/app/%5cadmin", "/app/%00admin", { path: "/app" }] ) {
    const rejected = await invoke(handlerFor(verifiedGoogleUser(email)), requestFor({ moduleId: "day-care", email, returnTo }));
    assert.equal(rejected.status, 400, returnTo);
  }

  const noSecret = await invoke(
    handlerFor(verifiedGoogleUser(email), { environment: { ...environment, PORTAL_DAYCARE_HANDOFF_SECRET: "" } }),
    requestFor({ moduleId: "day-care", email })
  );
  assert.equal(noSecret.status, 503);
}

// Modules that do not consume signed Portal assertions cannot be requested by
// calling the API directly.
{
  const email = "entrepreneur@suiyuecare.com";
  const handler = handlerFor(verifiedGoogleUser(email));
  for (const moduleId of ["accounting", "website-backoffice", "system-permissions", "unknown"]) {
    const result = await invoke(handler, requestFor({ moduleId, email, role: "ceo" }));
    assert.equal(result.status, 400, moduleId);
    assert.equal(result.body.ok, false);
    assert.equal(result.body.signature, undefined);
  }
}

// Identity always comes from auth.getUser, and a confirmed Google provider is
// mandatory even when an email exists in the static roster.
{
  const email = "entrepreneur@suiyuecare.com";
  const mismatch = await invoke(
    handlerFor(verifiedGoogleUser(email)),
    requestFor({ moduleId: "apm", email: "admin@suiyuecare.com", returnTo: "/dashboard" })
  );
  assert.equal(mismatch.status, 403);

  const unconfirmed = await invoke(
    handlerFor(verifiedGoogleUser(email, { email_confirmed_at: null })),
    requestFor({ moduleId: "apm", email, returnTo: "/dashboard" })
  );
  assert.equal(unconfirmed.status, 403);

  const passwordIdentity = await invoke(
    handlerFor(verifiedGoogleUser(email, {
      app_metadata: { provider: "email", providers: ["email"] },
      identities: [{ provider: "email", identity_data: { email } }]
    })),
    requestFor({ moduleId: "apm", email, returnTo: "/dashboard" })
  );
  assert.equal(passwordIdentity.status, 403);
}

{
  const email = "entrepreneur@suiyuecare.com";
  const handler = handlerFor(verifiedGoogleUser(email));
  const noSession = await invoke(handler, {
    method: "POST",
    headers: {},
    body: { payload: { moduleId: "apm", email } }
  });
  assert.equal(noSession.status, 401);

  const malformed = await invoke(handler, {
    method: "POST",
    headers: { authorization: `Bearer ${portalToken}` },
    body: "{not-json"
  });
  assert.equal(malformed.status, 400);
}

// The consolidated entrypoint exposes only the authenticated profile GET and
// signed-handoff POST methods. Unsupported methods never reach Auth or Finance.
{
  const email = "entrepreneur@suiyuecare.com";
  const authCalls = [];
  const handler = handlerFor(verifiedGoogleUser(email), { authCalls });
  const unsupported = await invoke(handler, {
    method: "PUT",
    headers: { authorization: `Bearer ${portalToken}` },
    body: { payload: { moduleId: "apm", email } }
  });
  assert.equal(unsupported.status, 405);
  assert.equal(unsupported.headers.getHeader("allow"), "GET, POST");
  assert.deepEqual(authCalls, []);
}

console.log("ok - Portal handoff server authorization and direct escalation verifier passed");
