import { generateCampaignPlan } from "../ai/model-router";
import { recordAgentRun } from "../repositories/workspace";
import type { AgentResponse, AgentToolTrace, SocialChannel } from "../types";
import { routeMarketingSkills } from "./marketing-skills";
import { loadBrandContext, loadCalendar, loadPerformance, lookupProducts } from "./tools";

const defaultChannels: SocialChannel[] = ["instagram", "tiktok", "pinterest", "facebook"];

function inferProductQuery(message: string) {
  const lowered = message.toLowerCase();
  if (lowered.includes("linen")) return "linen";
  if (lowered.includes("weekender") || lowered.includes("bag")) return "weekender";
  if (lowered.includes("sneaker")) return "sneaker";
  return "summer";
}

function buildSkillRoutingTrace(message: string): AgentToolTrace {
  const routes = routeMarketingSkills(message);
  const selected = routes.map(({ skill, matchedKeywords }) => {
    const boundary =
      skill.execution.mode === "delegate"
        ? `delegate:${skill.execution.target}`
        : skill.execution.mode;
    const evidence = matchedKeywords.length > 0 ? ` via ${matchedKeywords.join("|")}` : " via fallback";
    return `${skill.id}[${boundary}]${evidence}`;
  });

  return {
    tool: "marketing_skill_router",
    status: "completed",
    summary: `Selected governed capabilities: ${selected.join(", ")}`,
    durationMs: 0,
  };
}

export async function runGrowthAgent(
  message: string,
  context: { workspaceId: string; userId: string },
): Promise<AgentResponse> {
  const [catalog, brand, performance, calendar] = await Promise.all([
    lookupProducts(context.workspaceId, inferProductQuery(message)),
    loadBrandContext(context.workspaceId),
    loadPerformance(context.workspaceId),
    loadCalendar(context.workspaceId),
  ]);
  const plan = await generateCampaignPlan({
    objective: message,
    productContext: JSON.stringify(catalog.value ?? []),
    brandContext: JSON.stringify(brand.value ?? {}),
    performanceContext: JSON.stringify({
      performance: performance.value ?? {},
      calendar: calendar.value ?? [],
    }),
    channels: defaultChannels,
  });
  const response: AgentResponse = {
    summary:
      "Built a governed campaign plan using commerce catalog, brand rules, current calendar and performance signals. Nothing will publish until approval.",
    plan,
    trace: [
      catalog.trace,
      brand.trace,
      performance.trace,
      calendar.trace,
      buildSkillRoutingTrace(message),
    ],
    requiresApproval: true,
  };
  await recordAgentRun({
    workspaceId: context.workspaceId,
    actorId: context.userId,
    objective: message,
    output: plan,
    trace: response.trace,
  });
  return response;
}
