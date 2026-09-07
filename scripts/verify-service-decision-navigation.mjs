import assert from "node:assert/strict";
import fs from "node:fs";
import { renderServiceDecisionNavigation } from "../service-decision-navigation.js";

const sample = {
  cards: [
    { key: "fit", title: "適合誰？", text: "已存在的服務情境", target: "service-fit", action: "看完整說明" },
    { key: "location", title: "哪裡有服務？", text: "已存在的地區", target: "service-locations", action: "看完整說明" },
    { key: "fees", title: "費用怎麼看？", text: "保留完整條件，不推定價格", target: "service-fees", action: "看完整說明" },
    { key: "start", title: "如何開始？", text: '<img src=x onerror="bad()">', target: "service-start", action: "看完整說明" }
  ],
  links: [{ title: "體檢項目", target: "day-care-health-exam" }]
};
const rendered = renderServiceDecisionNavigation(sample);
assert.equal((rendered.match(/class="service-decision-card"/g) || []).length, 4);
assert.equal((rendered.match(/<nav /g) || []).length, 1, "Use one navigation surface, not duplicated menus");
assert.ok(!rendered.includes("<form"), "The decision guide must not duplicate a form");
assert.ok(!rendered.includes("<img src=x"), "CMS-provided summary text must be escaped");
assert.ok(rendered.includes("&lt;img src=x onerror=&quot;bad()&quot;&gt;"));
for (const target of [...sample.cards, ...sample.links]) assert.ok(rendered.includes(`href="#${target.target}"`));

const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const renderStart = appSource.indexOf("function renderOneMinuteServicePage(");
const renderEnd = appSource.indexOf("function renderHomeCarePage(", renderStart);
const serviceTemplate = appSource.slice(renderStart, renderEnd);
assert.ok(serviceTemplate.includes("renderServiceFeeSection(service, slug)"));
assert.ok(serviceTemplate.includes("renderDayCareStartChecklist()"));
assert.ok(serviceTemplate.includes("data-day-care-health-exam-host"));
assert.ok(serviceTemplate.includes("data-community-safety-host"));
assert.ok(serviceTemplate.includes("data-community-eligibility-host"));
assert.ok(serviceTemplate.includes("renderServiceContactSection(service, slug)"));
assert.ok(serviceTemplate.indexOf("renderServiceFeeSection(service, slug)") < serviceTemplate.indexOf('class="two-minute-scenes'), "Complete fees should precede the large photo gallery");
assert.ok(serviceTemplate.indexOf("data-day-care-health-exam-host") < serviceTemplate.indexOf("renderServiceStorySection(service, slug)"), "Application requirements should precede testimonials");
assert.equal((serviceTemplate.match(/renderServiceContactSection\(service, slug\)/g) || []).length, 1);
console.log("Service decision navigation: four question links, escaping, single form, and preserved decision information passed.");
