import {
  assertEvidenceBacked,
  type BuildEvent,
  type StoryArc,
  type StoryCandidate,
} from "./contracts";

const BASE_SCORES: Record<BuildEvent["kind"], number> = {
  pull_request_merged: 55,
  release_published: 85,
  deployment_ready: 75,
  revenue_milestone: 95,
  signup_milestone: 85,
  usage_milestone: 80,
  customer_win: 90,
  incident_resolved: 70,
  manual_note: 40,
};

const ARC_BY_KIND: Record<BuildEvent["kind"], StoryArc> = {
  pull_request_merged: "ship",
  release_published: "launch",
  deployment_ready: "ship",
  revenue_milestone: "metric",
  signup_milestone: "metric",
  usage_milestone: "metric",
  customer_win: "customer_win",
  incident_resolved: "lesson",
  manual_note: "ask",
};

function metricBonus(event: BuildEvent): number {
  if (!event.metrics?.length) return 0;

  return event.metrics.reduce((bonus, metric) => {
    if (metric.previousValue === undefined || metric.previousValue <= 0) return bonus + 3;
    const growth = (metric.value - metric.previousValue) / metric.previousValue;
    if (growth >= 1) return bonus + 15;
    if (growth >= 0.5) return bonus + 10;
    if (growth >= 0.2) return bonus + 6;
    if (growth > 0) return bonus + 3;
    return bonus;
  }, 0);
}

function buildSuggestedClaims(event: BuildEvent): string[] {
  const claims = [event.summary.trim()].filter(Boolean);

  for (const metric of event.metrics ?? []) {
    const unit = metric.unit ? ` ${metric.unit}` : "";
    claims.push(`${metric.name}: ${metric.value}${unit}`);
  }

  return claims;
}

export function classifyStoryCandidate(event: BuildEvent): StoryCandidate {
  assertEvidenceBacked(event);

  const evidenceBonus = Math.min(event.evidence.length * 3, 12);
  const score = Math.min(100, BASE_SCORES[event.kind] + metricBonus(event) + evidenceBonus);

  return {
    eventId: event.id,
    arc: ARC_BY_KIND[event.kind],
    score,
    reason: `${event.kind} produced a ${ARC_BY_KIND[event.kind]} candidate with ${event.evidence.length} evidence reference(s)`,
    evidence: event.evidence,
    suggestedClaims: buildSuggestedClaims(event),
  };
}

export function rankStoryCandidates(events: BuildEvent[]): StoryCandidate[] {
  return events
    .map(classifyStoryCandidate)
    .sort((left, right) => right.score - left.score || left.eventId.localeCompare(right.eventId));
}
