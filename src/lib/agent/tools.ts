import { analyticsSnapshot, posts, products } from "../demo-data";
import type { AgentToolTrace, Product } from "../types";

async function traced<T>(
  tool: string,
  fn: () => Promise<T> | T,
  summarize: (value: T) => string,
): Promise<{ value: T; trace: AgentToolTrace }> {
  const start = Date.now();
  try {
    const value = await fn();
    return {
      value,
      trace: { tool, status: "completed", summary: summarize(value), durationMs: Date.now() - start },
    };
  } catch (error) {
    return {
      value: undefined as T,
      trace: {
        tool,
        status: "failed",
        summary: error instanceof Error ? error.message : "Tool failed",
        durationMs: Date.now() - start,
      },
    };
  }
}

export async function lookupProducts(query: string) {
  return traced(
    "catalog.search",
    () => {
      const q = query.toLowerCase();
      const matches = products.filter((product) =>
        [product.title, product.description, ...product.tags].join(" ").toLowerCase().includes(q),
      );
      return matches.length ? matches : products.slice(0, 2);
    },
    (value: Product[]) => `Loaded ${value.length} product records from normalized commerce catalog`,
  );
}

export async function loadBrandContext() {
  return traced(
    "brand.context",
    () => ({
      voice: "confident, useful, modern, never overhyped",
      audience: "design-conscious shoppers ages 25-44",
      prohibitedClaims: ["unverified sustainability claims", "guaranteed outcomes"],
      winningThemes: ["versatility", "quality materials", "practical design"],
    }),
    () => "Loaded brand voice, audience, guardrails and historical winning themes",
  );
}

export async function loadPerformance() {
  return traced(
    "analytics.read",
    () => ({ snapshot: analyticsSnapshot, topPost: posts.find((post) => post.status === "published") }),
    (value) => `Loaded current funnel performance: ${value.snapshot.clicks.toLocaleString()} qualified clicks`,
  );
}

export async function loadCalendar() {
  return traced(
    "calendar.read",
    () => posts.filter((post) => post.status === "scheduled" || post.status === "approval"),
    (value) => `Loaded ${value.length} scheduled or approval-pending posts`,
  );
}
