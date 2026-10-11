import type { BuildEvent, EvidenceVisibility } from "./contracts";
import { redactForPublication } from "./privacy";

export interface GitHubRepositoryRef {
  fullName: string;
  htmlUrl: string;
  private: boolean;
}

export interface GitHubMergedPullRequestInput {
  workspaceId: string;
  projectId: string;
  repository: GitHubRepositoryRef;
  number: number;
  title: string;
  body?: string | null;
  htmlUrl: string;
  mergedAt: string;
  authorLogin?: string | null;
  labels?: string[];
}

export interface GitHubReleaseInput {
  workspaceId: string;
  projectId: string;
  repository: GitHubRepositoryRef;
  id: string | number;
  tagName: string;
  name?: string | null;
  body?: string | null;
  htmlUrl: string;
  publishedAt: string;
  prerelease?: boolean;
}

function visibility(repository: GitHubRepositoryRef): EvidenceVisibility {
  return repository.private ? "private" : "public";
}

function boundedText(value: string | null | undefined, maxLength: number): string | undefined {
  if (!value) return undefined;
  const redacted = redactForPublication(value).text.trim();
  if (!redacted) return undefined;
  if (redacted.length <= maxLength) return redacted;
  return `${redacted.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function normalizeMergedPullRequest(input: GitHubMergedPullRequestInput): BuildEvent {
  const safeTitle = boundedText(input.title, 240) ?? `Merged PR #${input.number}`;
  const safeBody = boundedText(input.body, 1_500);

  return {
    id: `github:${input.repository.fullName}:pr:${input.number}`,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    source: "github",
    kind: "pull_request_merged",
    occurredAt: input.mergedAt,
    summary: safeTitle,
    details: safeBody,
    evidence: [
      {
        source: "github",
        externalId: `pr:${input.number}`,
        observedAt: input.mergedAt,
        visibility: visibility(input.repository),
        url: input.htmlUrl,
        excerpt: safeTitle,
      },
    ],
    tags: [
      "github",
      "pull-request",
      ...(input.repository.private ? ["private-source"] : ["public-source"]),
      ...(input.labels ?? []).slice(0, 10).map((label) => `label:${label.slice(0, 60)}`),
    ],
  };
}

export function normalizeRelease(input: GitHubReleaseInput): BuildEvent {
  const fallbackName = `Release ${input.tagName}`;
  const safeName = boundedText(input.name, 240) ?? fallbackName;
  const safeBody = boundedText(input.body, 2_000);

  return {
    id: `github:${input.repository.fullName}:release:${input.id}`,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    source: "github",
    kind: "release_published",
    occurredAt: input.publishedAt,
    summary: safeName,
    details: safeBody,
    evidence: [
      {
        source: "github",
        externalId: `release:${input.id}`,
        observedAt: input.publishedAt,
        visibility: visibility(input.repository),
        url: input.htmlUrl,
        excerpt: safeName,
      },
    ],
    tags: [
      "github",
      "release",
      `tag:${input.tagName.slice(0, 80)}`,
      ...(input.prerelease ? ["prerelease"] : ["stable-release"]),
      ...(input.repository.private ? ["private-source"] : ["public-source"]),
    ],
  };
}
