import assert from "node:assert/strict";
import test from "node:test";
import { classifyStoryCandidate, rankStoryCandidates } from "../src/lib/build-in-public/milestones";
import { redactForPublication } from "../src/lib/build-in-public/privacy";
import type { BuildEvent } from "../src/lib/build-in-public/contracts";

const releaseEvent: BuildEvent = {
  id: "evt-release-1",
  workspaceId: "ws-1",
  projectId: "project-1",
  source: "github",
  kind: "release_published",
  occurredAt: "2026-10-11T12:00:00Z",
  summary: "Shipped the new onboarding flow",
  evidence: [
    {
      source: "github",
      externalId: "release-v1.4.0",
      observedAt: "2026-10-11T12:00:01Z",
      visibility: "public",
      url: "https://github.com/example/app/releases/tag/v1.4.0",
    },
  ],
};

test("classifies evidence-backed releases as launch stories", () => {
  const result = classifyStoryCandidate(releaseEvent);
  assert.equal(result.arc, "launch");
  assert.ok(result.score >= 85);
  assert.equal(result.evidence.length, 1);
  assert.equal(result.suggestedClaims[0], "Shipped the new onboarding flow");
});

test("rejects factual source events without evidence", () => {
  const invalid: BuildEvent = {
    ...releaseEvent,
    id: "evt-invalid",
    evidence: [],
  };

  assert.throws(() => classifyStoryCandidate(invalid), /no evidence references/);
});

test("ranks business milestones ahead of routine code activity", () => {
  const prEvent: BuildEvent = {
    ...releaseEvent,
    id: "evt-pr",
    kind: "pull_request_merged",
    summary: "Merged a refactor",
  };

  const revenueEvent: BuildEvent = {
    ...releaseEvent,
    id: "evt-revenue",
    source: "billing",
    kind: "revenue_milestone",
    summary: "Crossed a revenue milestone",
    metrics: [{ name: "MRR", value: 2000, previousValue: 1200, unit: "USD" }],
    evidence: [
      {
        source: "billing",
        externalId: "metric-mrr-2026-10-11",
        observedAt: "2026-10-11T12:00:01Z",
        visibility: "private",
      },
    ],
  };

  const ranked = rankStoryCandidates([prEvent, revenueEvent]);
  assert.equal(ranked[0].eventId, "evt-revenue");
  assert.equal(ranked[0].arc, "metric");
});

test("redacts secrets, database URLs and email addresses before publication", () => {
  const unsafe = [
    "Contact founder@example.com",
    "token ghp_abcdefghijklmnopqrstuvwxyz123456",
    "db postgresql://user:password@db.internal/app",
  ].join(" | ");

  const result = redactForPublication(unsafe);
  assert.equal(result.changed, true);
  assert.match(result.text, /\[REDACTED_EMAIL\]/);
  assert.match(result.text, /\[REDACTED_TOKEN\]/);
  assert.match(result.text, /\[REDACTED_DATABASE_URL\]/);
  assert.doesNotMatch(result.text, /founder@example\.com/);
  assert.doesNotMatch(result.text, /ghp_/);
  assert.doesNotMatch(result.text, /postgresql:\/\//);
});

test("optionally redacts financial amounts for privacy-sensitive workspaces", () => {
  const result = redactForPublication("MRR reached $12,500 and 9500 USD ARR", {
    redactFinancialAmounts: true,
  });

  assert.equal(result.changed, true);
  assert.equal(result.text, "MRR reached [REDACTED_AMOUNT] and [REDACTED_AMOUNT] ARR");
  assert.ok(result.kinds.includes("financial_amount"));
});
