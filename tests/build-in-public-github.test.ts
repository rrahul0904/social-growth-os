import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMergedPullRequest, normalizeRelease } from "../src/lib/build-in-public/github";

const repository = {
  fullName: "acme/widget",
  htmlUrl: "https://github.com/acme/widget",
  private: true,
};

test("normalizes merged pull requests without exposing raw secrets", () => {
  const event = normalizeMergedPullRequest({
    workspaceId: "ws-1",
    projectId: "project-1",
    repository,
    number: 42,
    title: "Ship onboarding improvements",
    body: "Configured ghp_abcdefghijklmnopqrstuvwxyz123456 for founder@example.com",
    htmlUrl: "https://github.com/acme/widget/pull/42",
    mergedAt: "2026-10-11T12:00:00Z",
    labels: ["growth", "onboarding"],
  });

  assert.equal(event.kind, "pull_request_merged");
  assert.equal(event.evidence[0].visibility, "private");
  assert.equal(event.evidence[0].url, "https://github.com/acme/widget/pull/42");
  assert.match(event.details ?? "", /\[REDACTED_TOKEN\]/);
  assert.match(event.details ?? "", /\[REDACTED_EMAIL\]/);
  assert.doesNotMatch(event.details ?? "", /ghp_/);
  assert.doesNotMatch(event.details ?? "", /founder@example\.com/);
});

test("bounds long PR bodies before they become model or publication context", () => {
  const event = normalizeMergedPullRequest({
    workspaceId: "ws-1",
    projectId: "project-1",
    repository: { ...repository, private: false },
    number: 43,
    title: "Bounded context",
    body: "a".repeat(5_000),
    htmlUrl: "https://github.com/acme/widget/pull/43",
    mergedAt: "2026-10-11T12:10:00Z",
  });

  assert.equal(event.evidence[0].visibility, "public");
  assert.ok((event.details?.length ?? 0) <= 1_500);
  assert.match(event.details ?? "", /…$/);
});

test("normalizes releases as evidence-backed launch events", () => {
  const event = normalizeRelease({
    workspaceId: "ws-1",
    projectId: "project-1",
    repository: { ...repository, private: false },
    id: 99,
    tagName: "v1.4.0",
    name: "Faster onboarding",
    body: "Reduced setup steps and improved first-run guidance.",
    htmlUrl: "https://github.com/acme/widget/releases/tag/v1.4.0",
    publishedAt: "2026-10-11T13:00:00Z",
  });

  assert.equal(event.kind, "release_published");
  assert.equal(event.summary, "Faster onboarding");
  assert.equal(event.evidence.length, 1);
  assert.ok(event.tags?.includes("stable-release"));
});
