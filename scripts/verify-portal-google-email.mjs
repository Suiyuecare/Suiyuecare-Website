import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { preferredGoogleIdentityEmail } = require("../server/portal-finance-profile.js");
const { createPortalApiHandler } = require("../api/portal-handoff.js");
const oldEmail = "cms.ntpc.2@suiyuecare.com";
const email = "cms.ntpc2@suiyuecare.com";
const identity = (address, verified = true, provider = "google") => ({
  provider, identity_data: { email: address, email_verified: verified }
});
const user = (identities = [identity(email)]) => ({
  id: "renamed-workspace-user", email: oldEmail,
  email_confirmed_at: "2026-07-30T04:29:45.429Z",
  app_metadata: { provider: "google", providers: ["google"] }, identities
});

// Browser matching and server verification must resolve the same identity.
const source = fs.readFileSync(new URL("../src/portal/login.js", import.meta.url), "utf8");
const start = source.indexOf("function preferredGoogleIdentityEmail(user) {");
assert.ok(start >= 0);
const end = source.indexOf("\n}\n", start) + 2;
const context = { normalizeEmail: value => String(value || "").trim().toLowerCase() };
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
assert.ok(source.includes("const email = preferredGoogleIdentityEmail(data.session?.user);"));
for (const [input, expected] of [
  [user(), email],
  [user([identity(` ${email.toUpperCase()} `)]), email],
  [user([identity(email, false)]), oldEmail],
  [user([{ provider: "google", identity_data: { email } }]), oldEmail],
  [user([identity(email, true, "email")]), oldEmail],
  [user([identity(email), identity("other@suiyuecare.com")]), ""],
  [{ ...user([]), user_metadata: { email, email_verified: true } }, oldEmail],
  [{ ...user([identity(email)]), email }, email]
]) {
  assert.equal(preferredGoogleIdentityEmail(input), expected);
  assert.equal(context.preferredGoogleIdentityEmail(input), expected);
}

async function invoke(authUser, method, claimedEmail = email) {
  const lookups = [];
  const handler = createPortalApiHandler({
    environment: {
      NODE_ENV: "test", APM_PORTAL_SIGNING_SECRET: "a".repeat(48),
      FINANCE_SOURCE_SUPABASE_URL: "https://udtlppnrugmtzhigdsxo.supabase.co",
      FINANCE_SOURCE_SECRET_KEY: `sb_secret_${"f".repeat(48)}`
    },
    createPortalClient: () => ({ auth: { getUser: async token => {
      assert.equal(token, "verified-session");
      return { data: { user: authUser }, error: null };
    } } }),
    financeLookup: async address => {
      lookups.push(address);
      assert.equal(address, email);
      return { source: "finance-portal-self", email, allowedModules: ["apm"] };
    },
    fetchImplementation: async input => {
      const address = new URL(input).searchParams.get("email");
      lookups.push(address);
      assert.equal(address, `eq.${email}`);
      return Response.json([{
        id: "employee-fixture", name: "Employee", email, job_title: "專員",
        department_code: "G1102", active: true, org_status: "active",
        org_source: "pptx_org_chart_20260728"
      }]);
    }
  });
  const response = { setHeader() {}, end(body) { this.body = JSON.parse(body); } };
  await handler({
    method, headers: { authorization: "Bearer verified-session" },
    body: { payload: { moduleId: "apm", email: claimedEmail, returnTo: "/tasks", role: "ceo" } }
  }, response);
  return { ...response, lookups };
}

const profile = await invoke(user(), "GET");
assert.equal(profile.statusCode, 200);
assert.equal(profile.body.profile.email, email);
const handoff = await invoke(user(), "POST");
assert.equal(handoff.statusCode, 200);
const payload = JSON.parse(Buffer.from(handoff.body.payload, "base64url"));
assert.equal(payload.email, email);
assert.equal(payload.aud, "apm");
assert.equal(payload.returnTo, "/tasks");
assert.equal(Object.hasOwn(payload, "role"), false);
for (const claimed of [oldEmail, "entrepreneur@suiyuecare.com"]) {
  assert.equal((await invoke(user(), "POST", claimed)).statusCode, 403);
}
for (const invalid of [
  user([identity(email, false)]),
  user([{ provider: "google", identity_data: { email } }]),
  user([identity(email), identity("other@suiyuecare.com")]),
  { ...user(), email_confirmed_at: null },
  user([identity(email, true, "email")])
]) {
  for (const method of ["GET", "POST"]) {
    const result = await invoke(invalid, method);
    assert.ok([401, 403].includes(result.statusCode));
    assert.deepEqual(result.lookups, []);
    assert.equal(result.body.signature, undefined);
  }
}
console.log("ok - verified Google email rename: client, profile, signed APM handoff and denial cases");
