import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { employeeEmails, employeeHandler, invokePortal, verifyAssertion, fixtureToken } from "./verify-portal-employee-modules.mjs";

const require = createRequire(import.meta.url);
const { chromium } = process.env.PORTAL_PLAYWRIGHT_MODULE
  ? require(process.env.PORTAL_PLAYWRIGHT_MODULE) : require("playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(process.env.PORTAL_BROWSER_OUTPUT || "/tmp/portal-employee-modules-browser");
fs.mkdirSync(output, { recursive: true });
const productFiles = ["src/portal/login.js", "server/portal-finance-profile.js", "api/portal-handoff.js"];
const hashes = () => Object.fromEntries(productFiles.map((name) => [name, crypto.createHash("sha256").update(fs.readFileSync(path.join(root, name))).digest("hex")]));
const before = hashes();
let current;
let serverError;
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://local.invalid").pathname;
    if (pathname === "/api/portal-handoff") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const result = await invokePortal(current.handler, req.method, raw ? JSON.parse(raw).payload : undefined, req.headers);
      res.writeHead(result.statusCode, { ...result.headers, "content-type": "application/json" });
      res.end(JSON.stringify(result.body));
      return;
    }
    if (pathname === "/src/lib/supabaseClient.js") {
      res.writeHead(200, { "content-type": "text/javascript" });
      res.end(`export const supabase = {auth:{async getSession(){return {data:{session:{access_token:${JSON.stringify(fixtureToken)},user:{id:'fictional-browser-auth',email:window.__fixtureEmail}}},error:null}},async signOut(){return {}},async signInWithOAuth(){throw new Error('No real OAuth in this test')}}};`);
      return;
    }
    const target = path.join(root, pathname === "/portal/" ? "portal/index.html" : pathname.replace(/^\//, ""));
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      res.writeHead(404); res.end(); return;
    }
    const type = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" }[path.extname(target)] || "application/octet-stream";
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    res.end(fs.readFileSync(target));
  } catch (error) { serverError = error; res.writeHead(500); res.end("Local fixture failed"); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: process.env.FINANCE_BROWSER_CHANNEL || "chrome", headless: true });
const evidence = { mode: "local fictional identities and transport; real UI and API functions", before, cases: [], errors: [] };
try {
  for (const width of [1440, 390]) {
    for (const [index, email] of employeeEmails.entries()) {
      current = employeeHandler(email);
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript((value) => { window.__fixtureEmail = value; }, email);
      const received = [];
      await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === origin) return route.continue();
        if (["finance.suiyuecare.com", "edoc.suiyuecare.com", "apm.suiyuecare.com"].includes(url.hostname)) {
          received.push({ url: url.toString(), method: request.method(), body: request.postData() });
          return route.fulfill({ status: 200, contentType: "text/html", body: "<p>Local destination fixture</p>" });
        }
        return route.abort();
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => evidence.errors.push(error.message));
      const open = async () => {
        await page.goto(origin + "/portal/", { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => document.body.classList.contains("is-signed-in"));
      };
      await open();
      const cards = await page.locator("#moduleLevelOneGrid .module-card").evaluateAll((nodes) => nodes.map((node) => ({ id: node.dataset.moduleId, status: node.dataset.accessStatus })));
      assert.deepEqual(cards.filter((card) => card.status === "ready").map((card) => card.id).sort(), ["accounting", "apm", "edoc"]);
      assert.equal(cards.filter((card) => !["accounting", "apm", "edoc"].includes(card.id)).every((card) => card.status === "denied"), true);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false);
      if (index === 1) await page.screenshot({ path: path.join(output, `modules-${width}.png`), fullPage: true });
      await page.locator('[data-module-id="website-backoffice"]').click({ force: true });
      assert.match(await page.locator("#loginStatus").textContent(), /此帳號無權限/);
      assert.equal(received.length, 0);
      for (const moduleId of ["accounting", "edoc", "apm"]) {
        if (moduleId !== "accounting") await open();
        const count = received.length;
        await page.locator(`[data-module-id="${moduleId}"]`).click();
        await page.waitForURL((url) => url.origin !== origin);
        assert.equal(received.length, count + 1);
        const destination = received.at(-1);
        if (moduleId === "accounting") {
          assert.deepEqual(destination, { url: "https://finance.suiyuecare.com/", method: "GET", body: null });
        } else {
          assert.equal(destination.method, "POST");
          assert.equal(destination.url, `https://${moduleId}.suiyuecare.com/api/auth/handoff`);
          const form = new URLSearchParams(destination.body);
          const [payload, signature] = moduleId === "edoc" ? form.get("token").split(".") : [form.get("payload"), form.get("signature")];
          verifyAssertion({ statusCode: 200, headers: { "cache-control": "no-store" }, body: { payload, signature } }, moduleId, email);
        }
      }
      evidence.cases.push({ width, identity: index, threeModulesVisible: true, deniedAdminClick: true, ownFinanceEntry: true, signedEdocAndApm: true, overflow });
      await context.close();
    }
    for (const [name, options] of [["inactive", { rows: [] }], ["unverified", { user: { email_confirmed_at: null } }]]) {
      current = employeeHandler(employeeEmails[1], options);
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript((value) => { window.__fixtureEmail = value; }, employeeEmails[1]);
      await context.route("**/*", (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on("pageerror", (error) => evidence.errors.push(error.message));
      await page.goto(origin + "/portal/", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.querySelector("#loginStatus")?.dataset.status === "error");
      assert.equal(await page.locator("body").evaluate((body) => body.classList.contains("is-signed-in")), false);
      evidence.cases.push({ width, identity: name, accessDenied: true });
      await context.close();
    }
  }
  assert.equal(serverError, undefined);
  assert.deepEqual(evidence.errors, []);
  assert.deepEqual(hashes(), before);
  evidence.ok = true;
  console.log(`ok - ${evidence.cases.length} desktop/mobile Portal scenarios, 18 real destination clicks, no external network or page errors`);
} finally {
  evidence.after = hashes();
  fs.writeFileSync(path.join(output, "evidence.json"), JSON.stringify(evidence, null, 2));
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
