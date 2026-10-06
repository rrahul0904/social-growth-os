import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDiscoveryPlan,
  scoreSignal,
  type BusinessContext,
  type CustomerSignal,
} from "../src/lib/discovery/planner";

const context: BusinessContext = {
  product: "developer deployment assistant",
  audience: "solo SaaS founders",
  constraints: ["small team", "no bulk outreach"],
  tried: ["generic social posts"],
};

function signal(overrides: Partial<CustomerSignal>): CustomerSignal {
  return {
    id: "signal-1",
    kind: "problem_discussion",
    audience: "solo SaaS founders",
    summary: "Founder describes a repeated deployment problem.",
    fit: 1,
    confidence: 1,
    source: {
      id: "source-1",
      channel: "Reddit",
      title: "How do I get this project online?",
      url: "https://example.com/source-1",
    },
    ...overrides,
  };
}

test("direct intent evidence outranks generic profile relevance", () => {
  const profile = signal({ id: "profile", kind: "profile_relevance" });
  const intent = signal({ id: "intent", kind: "buying_intent" });
  assert.ok(scoreSignal(intent) > scoreSignal(profile));

  const plan = buildDiscoveryPlan(context, [profile, intent]);
  assert.equal(plan.rankedOpportunities[0]?.signalId, "intent");
});

test("profile relevance does not get upgraded into buying intent", () => {
  const plan = buildDiscoveryPlan(context, [
    signal({ id: "profile", kind: "profile_relevance", summary: "Profile title matches the ICP." }),
  ]);

  assert.match(plan.primaryExperiment.title, /validate the problem/i);
  assert.match(plan.rankedOpportunities[0]?.hypothesis ?? "", /does not establish/i);
  assert.equal(plan.primaryExperiment.approvalRequired, true);
});

test("planner selects one primary experiment while preserving ranked evidence", () => {
  const plan = buildDiscoveryPlan(context, [
    signal({ id: "problem", kind: "problem_discussion", confidence: 0.9 }),
    signal({ id: "search", kind: "solution_search", confidence: 0.8 }),
    signal({ id: "switch", kind: "tool_switching", confidence: 0.95 }),
  ]);

  assert.equal(plan.rankedOpportunities.length, 3);
  assert.equal(plan.rankedOpportunities[0]?.signalId, "switch");
  assert.equal(plan.primaryExperiment.approvalRequired, true);
  assert.equal(Array.isArray(plan.primaryExperiment.deliverables), true);
});

test("missing evidence yields a research experiment rather than invented demand", () => {
  const plan = buildDiscoveryPlan(context, []);
  assert.equal(plan.rankedOpportunities.length, 0);
  assert.match(plan.primaryExperiment.title, /collect source-backed problem evidence/i);
  assert.match(plan.primaryExperiment.successSignal, /independent sources/i);
});
