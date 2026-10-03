import assert from "node:assert/strict";
import test from "node:test";
import {
  marketingSkillRegistry,
  routeMarketingSkills,
} from "../src/lib/agent/marketing-skills";

test("marketing skill registry is versioned and contains the 12 donor-inspired capabilities", () => {
  assert.equal(marketingSkillRegistry.length, 12);
  assert.equal(new Set(marketingSkillRegistry.map((skill) => skill.id)).size, 12);
  assert.ok(marketingSkillRegistry.every((skill) => skill.version === "marketing-skill/v1"));
});

test("routes research objectives deterministically to matching skills", () => {
  const routes = routeMarketingSkills("Research competitors and create an SEO keyword brief");
  assert.deepEqual(
    routes.map((route) => route.skill.id),
    ["seo-brief", "competitor-research"],
  );
  assert.deepEqual(routes[0].matchedKeywords, ["seo", "keyword"]);
  assert.deepEqual(routes[1].matchedKeywords, ["competitor"]);
});

test("publish pipeline remains privileged and workflow-only", () => {
  const route = routeMarketingSkills("Publish this approved campaign")[0];
  assert.equal(route.skill.id, "publish-pipeline");
  assert.equal(route.skill.risk, "privileged");
  assert.equal(route.skill.execution.mode, "workflow");
  assert.equal(route.skill.execution.directExecutionAllowed, false);
});

test("short-form video delegates to the owned rendering product", () => {
  const route = routeMarketingSkills("Render video creative for a short-form video")[0];
  assert.equal(route.skill.id, "short-form-video");
  assert.equal(route.skill.execution.mode, "delegate");
  assert.equal(route.skill.execution.target, "faceless-content-creator");
  assert.equal(route.skill.execution.directExecutionAllowed, false);
});

test("unmatched marketing objectives fall back to the governed full pipeline", () => {
  const routes = routeMarketingSkills("Help me improve growth for this product");
  assert.equal(routes.length, 1);
  assert.equal(routes[0].skill.id, "full-pipeline");
  assert.deepEqual(routes[0].matchedKeywords, []);
});
