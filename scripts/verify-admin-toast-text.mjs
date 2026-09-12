import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { parse } from "acorn";
import { parseHTML } from "linkedom";

// Exercise the real shared status-to-toast path without running authentication,
// importing a client, or calling the network.
const source = fs.readFileSync(new URL("../src/admin/session.js", import.meta.url), "utf8");
const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
const required = new Set(["ensureToastRegion", "shouldToastStatus", "showAdminToast", "handleStatusElement"]);
const functions = ast.body.filter((node) => node.type === "FunctionDeclaration" && required.has(node.id?.name));
assert.equal(functions.length, required.size);
const actionPattern = ast.body.find((node) => node.type === "VariableDeclaration"
  && node.declarations.some((declaration) => declaration.id.name === "TOAST_ACTION_PATTERN"));
assert.ok(actionPattern);
const { document } = parseHTML('<!doctype html><html><body><p id="gscStatus" class="admin-data-status"></p></body></html>');
const timers = [];
const context = {
  document,
  window: { setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length; } }
};
vm.createContext(context);
vm.runInContext([actionPattern, ...functions].map((node) => source.slice(node.start, node.end)).join("\n")
  + "\nglobalThis.handleStatus = handleStatusElement;", context);

const status = document.querySelector("#gscStatus");
const filename = '<img src=x onerror=alert(1)>.csv';
const message = `匯入失敗：CSV 沒有可分析的資料列。 仍顯示上次成功匯入的「${filename}」。`;
status.hidden = false;
status.dataset.status = "error";
status.textContent = message;
context.handleStatus(status);
const region = document.querySelector(".admin-toast-region");
const first = region.querySelector(".admin-toast");
assert.equal(region.getAttribute("aria-live"), "polite");
assert.equal(first.getAttribute("role"), "alert");
assert.equal(first.dataset.status, "error");
assert.deepEqual([...first.children].map((node) => node.localName), ["strong", "span"], "preserve the existing toast markup and CSS hooks");
assert.equal(first.querySelector("strong").textContent, "操作失敗");
assert.equal(first.querySelector("span").textContent, message);
assert.equal(first.querySelectorAll("img, script, svg, [onerror], [onload]").length, 0, "a filename must remain text even after the status observer forwards it");
assert.equal(status.textContent, message, "do not rewrite the original status");
context.handleStatus(status);
assert.equal(region.children.length, 1, "unchanged status must keep its existing deduplication behavior");

status.dataset.status = "success";
status.textContent = '已匯入資料。保留字元：< > & " \'';
context.handleStatus(status);
const second = region.lastElementChild;
assert.equal(second.getAttribute("role"), "status");
assert.equal(second.querySelector("strong").textContent, "已完成");
assert.equal(second.querySelector("span").textContent, status.textContent);
assert.equal(timers[0].delay, 4600, "preserve the error/success toast duration");
timers[0].callback();
assert.ok(first.classList.contains("leaving"), "preserve the exit animation class");
assert.equal(timers.at(-1).delay, 220);
timers.at(-1).callback();
assert.equal(region.contains(first), false);
assert.equal(region.contains(second), true);

status.hidden = true;
status.textContent = "匯入中的隱藏訊息";
context.handleStatus(status);
assert.equal(region.children.length, 1, "hidden statuses must remain hidden");
console.log("Admin toast verification passed: CSV-filename failure path stays text; DOM shape, roles, status deduplication, and dismissal timing are preserved.");
