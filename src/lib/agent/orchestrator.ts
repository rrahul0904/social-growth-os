import { generateCampaignPlan } from "../ai/model-router";
import { loadBrandContext, loadCalendar, loadPerformance, lookupProducts } from "./tools";
import type { AgentResponse, SocialChannel } from "../types";

const defaultChannels: SocialChannel[] = ["instagram", "tiktok", "pinterest", "facebook"];

function inferProductQuery(message: string): string {
  const lowered = message.toLowerCase();
  if (lowered.includes("linen")) return "linen";
  if (lowered.includes("weekender") || lowered.includes("bag")) return "weekender";
  if (lowered.includes("sneaker")) return "sneaker";
  return "summer";
}

export async function runGrowthAgent(message: string): Promise<AgentResponse> {
  const [catalog, brand, performance, calendar] = await Promise.all([
    lookupProducts(inferProductQuery(message)),
    loadBrandContext(),
    loadPerformance(),
    loadCalendar(),
  ]);

  const productContext = JSON.stringify(catalog.value ?? []);
  const brandContext = JSON.stringify(brand.value ?? {});
  const performanceContext = JSON.stringify({ performance: performance.value ?? {}, calendar: calendar.value ?? [] });

  const plan = await generateCampaignPlan({
    objective: message,
    productContext,
    brandContext,
    performanceContext,
    channels: defaultChannels,
  });

  return {
    summary: `Built a governed campaign plan using commerce catalog, brand rules, current calendar and performance signals. Nothing will publish until approval.`,
    plan,
    trace: [catalog.trace, brand.trace, performance.trace, calendar.trace],
    requiresApproval: true,
  };
}
