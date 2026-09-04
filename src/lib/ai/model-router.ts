import type { CampaignPlan, SocialChannel } from "../types";

interface ModelRouterInput {
  objective: string;
  productContext: string;
  brandContext: string;
  performanceContext: string;
  channels: SocialChannel[];
}

const fallbackPlan = (input: ModelRouterInput): CampaignPlan => ({
  title: "Conversion-led product story",
  objective: input.objective,
  audience: "High-intent shoppers who value practical design, quality materials and uncomplicated styling.",
  thesis: "Lead with the customer's real use-case, prove versatility visually, and use channel-specific calls to action rather than reposting identical creative everywhere.",
  channels: input.channels.map((channel) => ({
    channel,
    angle:
      channel === "tiktok"
        ? "Fast transformation / styling narrative"
        : channel === "pinterest"
          ? "Saveable visual guide with evergreen search intent"
          : channel === "linkedin"
            ? "Founder/product-design story"
            : "Benefit-led product story with social proof",
    format: channel === "tiktok" ? "short video" : channel === "instagram" ? "carousel" : "image + copy",
    cta: channel === "pinterest" ? "Save and shop the collection" : "Explore the product",
  })),
  experiments: [
    "Test utility-first vs. aspiration-first opening hooks",
    "Test product-only creative vs. styled-in-context creative",
    "Retarget high-intent clickers with proof-led messaging",
  ],
  successMetrics: ["qualified clicks", "add-to-cart rate", "conversion rate", "revenue per 1,000 impressions"],
});

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(candidate.slice(start, end + 1));
}

function isCampaignPlan(value: unknown): value is CampaignPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<CampaignPlan>;
  return Boolean(
    plan.title &&
      plan.objective &&
      plan.audience &&
      plan.thesis &&
      Array.isArray(plan.channels) &&
      Array.isArray(plan.experiments) &&
      Array.isArray(plan.successMetrics),
  );
}

export async function generateCampaignPlan(input: ModelRouterInput): Promise<CampaignPlan> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.AI_DEFAULT_MODEL;
  const endpoint = process.env.AI_GATEWAY_URL;

  if (!apiKey || !model || !endpoint) return fallbackPlan(input);

  const system = [
    "You are the strategy engine inside a governed social growth operating system.",
    "Create a concrete cross-channel campaign plan. Do not invent product facts.",
    "Return only valid JSON with keys: title, objective, audience, thesis, channels, experiments, successMetrics.",
    "Each channels item must contain channel, angle, format, cta.",
  ].join(" ");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({
            objective: input.objective,
            productContext: input.productContext,
            brandContext: input.brandContext,
            performanceContext: input.performanceContext,
            channels: input.channels,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("AI gateway failure", response.status, await response.text());
    return fallbackPlan(input);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) return fallbackPlan(input);

  try {
    const candidate = extractJson(text);
    return isCampaignPlan(candidate) ? candidate : fallbackPlan(input);
  } catch {
    return fallbackPlan(input);
  }
}
