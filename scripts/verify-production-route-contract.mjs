import assert from "node:assert/strict";
import fs from "node:fs";
import { verifyRouteDocument } from "./verify-production-routes.mjs";
import { prerenderPublicPages } from "./prerender-public-pages.mjs";
import { serviceLocationRoutes } from "../public-service-locations.mjs";

const snapshot = JSON.parse(fs.readFileSync(new URL("../public/cms-fallbacks.json", import.meta.url), "utf8"));
const pages = await prerenderPublicPages(snapshot);
const origin = (process.env.PRODUCTION_ORIGIN || "https://www.suiyuecare.com").replace(/\/$/, "");
const response = new Response("", { status: 200, headers: { "cache-control": "no-cache, no-store, must-revalidate" } });
const shell = (slug, html, pathname = `/${slug}`) => `<!doctype html><html data-initial-route="${slug}"><head><link rel="canonical" href="${origin}${pathname}"></head><body><section id="home" data-static-shell="minimal"></section><section class="page active" id="pageView" data-prerendered-route="${slug}">${html}</section></body></html>`;

for (const [slug, page] of pages) {
  const html = shell(slug, page.html);
  const options = { expectedHtml: page.html };
  assert.deepEqual(verifyRouteDocument(slug, { response, html }, options), [], `${slug}: complete published content must pass, including recruiting templates`);
  const blank = shell(slug, "");
  assert.ok(verifyRouteDocument(slug, { response, html: blank }, options).some((failure) => failure.includes("complete first-paint body")), `${slug}: an empty shell must fail`);
  const mismatched = html.replace(`data-prerendered-route="${slug}"`, 'data-prerendered-route="home"');
  assert.ok(verifyRouteDocument(slug, { response, html: mismatched }, options).some((failure) => failure.includes("prerender marker")), `${slug}: another route's body must fail`);
}

const page = pages.get("talent");
const html = shell("talent", page.html);
const verify = (changedHtml, changedResponse = response) => verifyRouteDocument("talent", { response: changedResponse, html: changedHtml }, { expectedHtml: page.html });
assert.ok(verify(html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/, "<h1>Outdated published heading</h1>")).some((failure) => failure.includes("first-paint H1")));
assert.ok(verify(shell("talent", `${page.html}<p>Unexpected stale recruiting copy</p>`)).some((failure) => failure.includes("complete first-paint body")));
assert.ok(verify(html.replace('class="page active"', 'class="page"')).some((failure) => failure.includes("visible before JavaScript")));
assert.ok(verify(html, new Response("", { status: 200 })).some((failure) => failure.includes("Cache-Control")), "original routes must retain their no-cache/no-store requirement");
assert.ok(verify(html.replace(`${origin}/talent`, `${origin}/`)).some((failure) => failure.includes("canonical")));
assert.ok(verify(`${html}<a href="#article-old">Old route</a>`).some((failure) => failure.includes("stale content hash")));
assert.ok(verify(`${html}<div class="home-page page active"></div>`).some((failure) => failure.includes("stale home marker")));

const location = serviceLocationRoutes(snapshot)[0];
const locationHtml = shell(location.slug, location.prerenderedHtml, location.path);
const locationOptions = { pathname: location.path, expectedHtml: location.prerenderedHtml, requirePrerender: true, requireNoCache: false };
assert.deepEqual(verifyRouteDocument(location.slug, { response: new Response("", { status: 200 }), html: locationHtml }, locationOptions), [], "new location routes have no pre-existing no-store requirement");
assert.ok(verifyRouteDocument(location.slug, { response, html: shell(location.slug, "", location.path) }, locationOptions).some((failure) => failure.includes("complete first-paint body")), "new route body checks cannot be skipped");

console.log("PASS: production first-paint contract accepts complete published pages and rejects empty, stale, mismatched, hidden, noncanonical or incorrectly cached originals.");
