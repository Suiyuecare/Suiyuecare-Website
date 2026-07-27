import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../api/rebuild-public-content.js");
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const originalEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  VERCEL_DEPLOY_HOOK_URL: process.env.VERCEL_DEPLOY_HOOK_URL
};

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.VITE_SUPABASE_ANON_KEY = "public-anon-key";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function responseMock() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    end(body = "") {
      this.body = body;
    }
  };
}

async function runRequest({
  method = "POST",
  token = "",
  body = { entity_table: "articles" }
} = {}) {
  const response = responseMock();
  await handler({
    method,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body
  }, response);
  return {
    status: response.statusCode,
    headers: response.headers,
    body: response.body ? JSON.parse(response.body) : {}
  };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
    async text() {
      return JSON.stringify(payload);
    }
  };
}

try {
  console.error = () => {};

  let fetchCalls = [];
  globalThis.fetch = async (...args) => {
    fetchCalls.push(args);
    throw new Error("fetch should not be called");
  };

  const methodResult = await runRequest({ method: "GET" });
  assert(methodResult.status === 405, "GET should return 405.");
  assert(fetchCalls.length === 0, "GET must not call Supabase or Vercel.");

  const anonymousResult = await runRequest();
  assert(anonymousResult.status === 401, "Anonymous rebuild should return 401.");
  assert(fetchCalls.length === 0, "Anonymous rebuild must not call Supabase or Vercel.");

  fetchCalls = [];
  globalThis.fetch = async (url) => {
    fetchCalls.push(String(url));
    if (String(url).endsWith("/auth/v1/user")) {
      return jsonResponse(200, { id: "editor-user", email: "editor@suiyuecare.com" });
    }
    return jsonResponse(200, {
      role: "editor",
      email: "editor@suiyuecare.com",
      can_review_publish: false
    });
  };
  const editorResult = await runRequest({ token: "editor-token" });
  assert(editorResult.status === 403, "Non-owner rebuild should return 403.");
  assert(fetchCalls.length === 2, "Non-owner rebuild should stop after permission checks.");

  const hookUrl = "https://api.vercel.com/v1/integrations/deploy/test-hook";
  process.env.VERCEL_DEPLOY_HOOK_URL = hookUrl;
  fetchCalls = [];
  globalThis.fetch = async (url, options = {}) => {
    fetchCalls.push({ url: String(url), options });
    if (String(url).endsWith("/auth/v1/user")) {
      return jsonResponse(200, { id: "owner-user", email: "entrepreneur@suiyuecare.com" });
    }
    if (String(url).includes("/rest/v1/rpc/get_current_admin_permissions")) {
      return jsonResponse(200, {
        role: "owner",
        email: "entrepreneur@suiyuecare.com",
        can_review_publish: true
      });
    }
    if (String(url) === hookUrl) {
      return jsonResponse(200, { job: { id: "deploy-job" } });
    }
    return jsonResponse(404, { message: "unexpected request" });
  };

  const invalidTableResult = await runRequest({
    token: "owner-token",
    body: { entity_table: "pages" }
  });
  assert(invalidTableResult.status === 400, "Unrelated tables should return 400.");
  assert(!fetchCalls.some((call) => call.url === hookUrl), "Invalid tables must not trigger Vercel.");

  fetchCalls = [];
  const ownerResult = await runRequest({
    token: "owner-token",
    body: {
      entity_table: "articles",
      entity_tables: ["articles", "care_stories"],
      action: "approved",
      request_id: "request-123"
    }
  });
  assert(ownerResult.status === 202, "Owner rebuild should return 202.");
  assert(ownerResult.body.status === "rebuild_queued", "Owner rebuild should report a queued deployment.");
  const hookCall = fetchCalls.find((call) => call.url === hookUrl);
  assert(hookCall, "Owner rebuild should call the configured Vercel Deploy Hook.");
  const hookBody = JSON.parse(hookCall.options.body);
  assert(hookBody.requested_by === "owner-user", "Deploy Hook payload should identify the owner.");
  assert(
    JSON.stringify(hookBody.entity_tables) === JSON.stringify(["articles", "care_stories"]),
    "Deploy Hook payload should include only approved public-content tables."
  );

  console.log("ok - public content rebuild requires an authenticated Owner and queues only approved content tables");
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
