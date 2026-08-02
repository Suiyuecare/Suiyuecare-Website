import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createPortalHandoffHandler } = require("../api/portal-handoff.js");
const { staticPortalModuleGrants } = require("../server/portal-module-policy.js");

const portalToken = "portal-google-session";
const issuedAtMs = 1_785_632_400_000;
const fixedJti = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const apmSecret = "a".repeat(48);
const edocSecret = "e".repeat(48);
const environment = {
  NODE_ENV: "test",
  SUPABASE_URL: "https://portalref.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"p".repeat(36)}`,
  APM_PORTAL_SIGNING_SECRET: apmSecret,
  EDOC_PORTAL_HANDOFF_SECRET: edocSecret
};

function verifiedGoogleUser(email, overrides = {}) {
  return {
    id: "portal-auth-user-id",
    email,
    email_confirmed_at: "2026-08-02T00:00:00.000Z",
    app_metadata: { provider: "google", providers: ["google"] },
    identities: [{ provider: "google", identity_data: { email } }],
    ...overrides
  };
}

function portalClientFor(user, error = null, calls = []) {
  return () => ({
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
  const expected = crypto
    .createHmac("sha256", result.body.token === `${encoded}.${result.body.signature}`
      && JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")).aud === "apm"
      ? apmSecret
      : edocSecret)
    .update(encoded)
    .digest("base64url");
  assert.equal(result.body.signature, expected);
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
}

function handlerFor(user, overrides = {}) {
  return createPortalHandoffHandler({
    environment,
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

// A Finance fallback identity is revalidated server-side and can only receive
// an APM identity assertion, never an EDOC assertion.
{
  const email = "homecare.tpe1@suiyuecare.com";
  const calls = [];
  const user = verifiedGoogleUser(email);
  const handler = handlerFor(user, {
    financeLookup: async (...args) => {
      calls.push(args);
      return { email, allowedModules: ["apm"] };
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
  assert.equal(edocResult.status, 403);
  assert.equal(edocResult.body.ok, false);
  assert.equal(calls.length, 1, "EDOC denial must not consult or inherit the APM fallback grant");
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

console.log("ok - Portal handoff server authorization and direct escalation verifier passed");
