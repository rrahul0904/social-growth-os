export type MarketingSkillId =
  | "ad-copy-generator"
  | "community-post-generator"
  | "competitor-research"
  | "content-calendar"
  | "content-repurposer"
  | "email-outreach"
  | "email-sequence"
  | "full-pipeline"
  | "publish-pipeline"
  | "seo-brief"
  | "short-form-video"
  | "visual-brief-generator";

export type MarketingSkillRisk = "read" | "draft" | "privileged";
export type MarketingSkillExecutionMode = "agent" | "workflow" | "delegate";

export interface MarketingSkillExecution {
  mode: MarketingSkillExecutionMode;
  target?: "faceless-content-creator";
  directExecutionAllowed: boolean;
}

export interface MarketingSkillDefinition {
  id: MarketingSkillId;
  version: "marketing-skill/v1";
  title: string;
  description: string;
  risk: MarketingSkillRisk;
  keywords: readonly string[];
  execution: MarketingSkillExecution;
}

const agentExecution: MarketingSkillExecution = {
  mode: "agent",
  directExecutionAllowed: true,
};

export const marketingSkillRegistry: readonly MarketingSkillDefinition[] = [
  {
    id: "ad-copy-generator",
    version: "marketing-skill/v1",
    title: "Ad Copy Generator",
    description: "Draft channel-aware paid advertising copy and variants.",
    risk: "draft",
    keywords: ["ad copy", "ads", "advertising", "paid media", "paid campaign"],
    execution: agentExecution,
  },
  {
    id: "community-post-generator",
    version: "marketing-skill/v1",
    title: "Community Post Generator",
    description: "Draft community-native posts without publishing them.",
    risk: "draft",
    keywords: ["community post", "reddit", "community", "forum", "social post"],
    execution: agentExecution,
  },
  {
    id: "competitor-research",
    version: "marketing-skill/v1",
    title: "Competitor Research",
    description: "Research competitors and synthesize positioning evidence.",
    risk: "read",
    keywords: ["competitor", "competition", "competitive", "market research", "alternatives"],
    execution: agentExecution,
  },
  {
    id: "content-calendar",
    version: "marketing-skill/v1",
    title: "Content Calendar",
    description: "Plan channel-aware content against campaign objectives.",
    risk: "draft",
    keywords: ["content calendar", "editorial calendar", "calendar", "content plan", "schedule content"],
    execution: agentExecution,
  },
  {
    id: "content-repurposer",
    version: "marketing-skill/v1",
    title: "Content Repurposer",
    description: "Transform a source asset into channel-specific drafts.",
    risk: "draft",
    keywords: ["repurpose", "repurposing", "turn this into", "reuse content", "adapt content"],
    execution: agentExecution,
  },
  {
    id: "email-outreach",
    version: "marketing-skill/v1",
    title: "Email Outreach",
    description: "Draft personalized outbound messages without sending them.",
    risk: "draft",
    keywords: ["outreach", "cold email", "prospecting", "prospect email", "outbound"],
    execution: agentExecution,
  },
  {
    id: "email-sequence",
    version: "marketing-skill/v1",
    title: "Email Sequence",
    description: "Draft multi-step lifecycle or outbound email sequences.",
    risk: "draft",
    keywords: ["email sequence", "drip", "nurture", "follow-up email", "lifecycle email"],
    execution: agentExecution,
  },
  {
    id: "full-pipeline",
    version: "marketing-skill/v1",
    title: "Full Marketing Pipeline",
    description: "Coordinate multiple marketing capabilities into a governed campaign plan.",
    risk: "draft",
    keywords: ["full pipeline", "launch campaign", "go to market", "go-to-market", "full campaign", "marketing plan"],
    execution: agentExecution,
  },
  {
    id: "publish-pipeline",
    version: "marketing-skill/v1",
    title: "Publish Pipeline",
    description: "Request approved publishing through the durable workflow engine.",
    risk: "privileged",
    keywords: ["publish", "post this", "send this", "schedule post", "go live"],
    execution: {
      mode: "workflow",
      directExecutionAllowed: false,
    },
  },
  {
    id: "seo-brief",
    version: "marketing-skill/v1",
    title: "SEO Brief",
    description: "Create an evidence-backed search content brief.",
    risk: "read",
    keywords: ["seo", "search brief", "keyword", "search intent", "organic search"],
    execution: agentExecution,
  },
  {
    id: "short-form-video",
    version: "marketing-skill/v1",
    title: "Short-form Video",
    description: "Create a media-render request for the owned rendering service.",
    risk: "draft",
    keywords: ["short-form video", "short form video", "reel", "tiktok video", "video creative", "render video"],
    execution: {
      mode: "delegate",
      target: "faceless-content-creator",
      directExecutionAllowed: false,
    },
  },
  {
    id: "visual-brief-generator",
    version: "marketing-skill/v1",
    title: "Visual Brief Generator",
    description: "Draft a structured creative brief for visual production.",
    risk: "draft",
    keywords: ["visual brief", "creative brief", "design brief", "art direction", "visual concept"],
    execution: agentExecution,
  },
] as const;

export interface MarketingSkillRoute {
  skill: MarketingSkillDefinition;
  score: number;
  matchedKeywords: string[];
}

function scoreSkill(objective: string, skill: MarketingSkillDefinition): MarketingSkillRoute {
  const normalized = objective.toLowerCase();
  const matchedKeywords = skill.keywords.filter((keyword) => normalized.includes(keyword));
  return {
    skill,
    score: matchedKeywords.length,
    matchedKeywords: [...matchedKeywords],
  };
}

export function routeMarketingSkills(objective: string, limit = 4): MarketingSkillRoute[] {
  const scored = marketingSkillRegistry
    .map((skill) => scoreSkill(objective, skill))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return marketingSkillRegistry.indexOf(left.skill) - marketingSkillRegistry.indexOf(right.skill);
    });

  if (scored.length > 0) return scored.slice(0, Math.max(1, limit));

  const fallback = marketingSkillRegistry.find((skill) => skill.id === "full-pipeline");
  if (!fallback) throw new Error("marketing skill registry is missing full-pipeline fallback");

  return [{ skill: fallback, score: 0, matchedKeywords: [] }];
}
