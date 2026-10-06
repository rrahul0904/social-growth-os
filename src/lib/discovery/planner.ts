export type SignalKind =
  | "profile_relevance"
  | "problem_discussion"
  | "solution_search"
  | "tool_switching"
  | "buying_intent";

export type BusinessContext = {
  product: string;
  audience: string;
  constraints: string[];
  tried: string[];
};

export type EvidenceSource = {
  id: string;
  channel: string;
  title: string;
  url: string;
};

export type CustomerSignal = {
  id: string;
  kind: SignalKind;
  audience: string;
  summary: string;
  fit: number;
  confidence: number;
  source: EvidenceSource;
};

export type RankedOpportunity = {
  signalId: string;
  kind: SignalKind;
  audience: string;
  score: number;
  hypothesis: string;
  reason: string;
  source: EvidenceSource;
};

export type GtmExperiment = {
  title: string;
  audience: string;
  channel: string;
  hypothesis: string;
  deliverables: string[];
  successSignal: string;
  approvalRequired: true;
};

export type DiscoveryPlan = {
  context: BusinessContext;
  rankedOpportunities: RankedOpportunity[];
  primaryExperiment: GtmExperiment;
};

const signalWeights: Record<SignalKind, number> = {
  profile_relevance: 0.15,
  problem_discussion: 0.55,
  solution_search: 0.75,
  tool_switching: 0.85,
  buying_intent: 1,
};

function bounded(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function scoreSignal(signal: CustomerSignal) {
  return Math.round(
    signalWeights[signal.kind] * bounded(signal.fit) * bounded(signal.confidence) * 100,
  );
}

function describeHypothesis(signal: CustomerSignal) {
  if (signal.kind === "profile_relevance") {
    return `${signal.audience} may fit the ICP, but the source does not establish an active problem or buying intent.`;
  }

  return `${signal.audience} is showing ${signal.kind.replaceAll("_", " ")} that may indicate a timely acquisition opportunity.`;
}

function buildExperiment(context: BusinessContext, opportunity?: RankedOpportunity): GtmExperiment {
  if (!opportunity) {
    return {
      title: "Collect source-backed problem evidence",
      audience: context.audience,
      channel: "public communities",
      hypothesis: `Before choosing a growth channel for ${context.product}, find repeated first-person evidence that ${context.audience} has the problem we intend to solve.`,
      deliverables: [
        "Collect five public discussions that describe the problem in the customer’s own words.",
        "Record the original source URL and the exact reason each discussion is relevant.",
        "Separate generic profile fit from explicit problem, search, switching, or buying signals.",
      ],
      successSignal: "At least three independent sources describe the same problem or desired outcome.",
      approvalRequired: true,
    };
  }

  if (opportunity.kind === "profile_relevance") {
    return {
      title: "Validate the problem before outreach",
      audience: opportunity.audience,
      channel: opportunity.source.channel,
      hypothesis: `${opportunity.audience} looks relevant, but profile fit alone is too weak to justify outreach. Validate the customer moment first.`,
      deliverables: [
        "Find three first-person discussions from this audience about the target problem.",
        "Classify each source as problem, solution-search, switching, or buying evidence.",
        "Only draft outreach after a stronger signal is observed.",
      ],
      successSignal: "Three independent problem-or-stronger signals are found before any outreach is approved.",
      approvalRequired: true,
    };
  }

  return {
    title: "Run one bounded first-customer experiment",
    audience: opportunity.audience,
    channel: opportunity.source.channel,
    hypothesis: `${opportunity.hypothesis} A small proof test should reveal whether the signal converts into real product use.`,
    deliverables: [
      "Recruit five matching people from the evidenced customer moment without bulk outreach.",
      `Have each person try one real ${context.product} workflow end to end.`,
      "Capture completion, the point of friction, and whether they would repeat the workflow.",
    ],
    successSignal: "At least three of five complete the workflow and at least two voluntarily repeat or ask for the next step.",
    approvalRequired: true,
  };
}

export function buildDiscoveryPlan(
  context: BusinessContext,
  signals: CustomerSignal[],
): DiscoveryPlan {
  const rankedOpportunities = signals
    .map((signal) => ({
      signalId: signal.id,
      kind: signal.kind,
      audience: signal.audience,
      score: scoreSignal(signal),
      hypothesis: describeHypothesis(signal),
      reason: `${signal.summary} Source strength: ${signal.kind.replaceAll("_", " ")}; confidence ${Math.round(bounded(signal.confidence) * 100)}%.`,
      source: signal.source,
    }))
    .sort((left, right) => right.score - left.score || left.signalId.localeCompare(right.signalId));

  return {
    context,
    rankedOpportunities,
    primaryExperiment: buildExperiment(context, rankedOpportunities[0]),
  };
}
