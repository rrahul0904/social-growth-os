export type BuildEventSource =
  | "github"
  | "deployment"
  | "billing"
  | "analytics"
  | "manual";

export type BuildEventKind =
  | "pull_request_merged"
  | "release_published"
  | "deployment_ready"
  | "revenue_milestone"
  | "signup_milestone"
  | "usage_milestone"
  | "customer_win"
  | "incident_resolved"
  | "manual_note";

export type EvidenceVisibility = "public" | "private";

export interface EvidenceReference {
  source: BuildEventSource;
  externalId: string;
  observedAt: string;
  visibility: EvidenceVisibility;
  url?: string;
  excerpt?: string;
  checksum?: string;
}

export interface BuildMetric {
  name: string;
  value: number;
  unit?: string;
  previousValue?: number;
}

export interface BuildEvent {
  id: string;
  workspaceId: string;
  projectId: string;
  source: BuildEventSource;
  kind: BuildEventKind;
  occurredAt: string;
  summary: string;
  details?: string;
  metrics?: BuildMetric[];
  evidence: EvidenceReference[];
  tags?: string[];
}

export type StoryArc =
  | "ship"
  | "metric"
  | "struggle"
  | "lesson"
  | "ask"
  | "launch"
  | "customer_win";

export type AutonomyLevel =
  | "draft_only"
  | "approval_required"
  | "scheduled_autopublish"
  | "policy_bounded_autopilot";

export interface StoryCandidate {
  eventId: string;
  arc: StoryArc;
  score: number;
  reason: string;
  evidence: EvidenceReference[];
  suggestedClaims: string[];
}

export interface PublicationReceipt {
  workspaceId: string;
  projectId: string;
  postId: string;
  provider: string;
  providerPostId: string;
  publishedAt: string;
  sourceEventIds: string[];
  evidence: EvidenceReference[];
  draftText: string;
  finalText: string;
  attributionUrl?: string;
}

export function assertEvidenceBacked(event: BuildEvent): void {
  if (event.evidence.length === 0 && event.kind !== "manual_note") {
    throw new Error(`Build event ${event.id} has no evidence references`);
  }
}
