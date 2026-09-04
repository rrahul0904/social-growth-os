export type SocialChannel =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "pinterest"
  | "x";

export type PostStatus = "draft" | "approval" | "scheduled" | "published" | "failed";

export interface MetricPoint {
  label: string;
  value: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down" | "flat";
  helper: string;
}

export interface Product {
  id: string;
  externalId?: string;
  source: "shopify" | "woocommerce" | "manual";
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  inventory?: number;
  tags: string[];
  updatedAt: string;
}

export interface Post {
  id: string;
  channel: SocialChannel;
  title: string;
  copy: string;
  status: PostStatus;
  scheduledAt: string;
  campaignId: string;
  assetType: "image" | "video" | "carousel" | "text";
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: "planning" | "approval" | "active" | "completed";
  channels: SocialChannel[];
  startAt: string;
  endAt: string;
  posts: number;
  spend?: number;
  revenue?: number;
}

export type WorkflowTrigger =
  | "product.created"
  | "product.updated"
  | "schedule.daily"
  | "campaign.approved"
  | "manual";

export type WorkflowStepType =
  | "load_brand_context"
  | "load_product"
  | "generate_copy"
  | "generate_image_prompt"
  | "request_approval"
  | "schedule_post"
  | "publish_post"
  | "measure_results";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  label: string;
  config?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  enabled: boolean;
  steps: WorkflowStep[];
  lastRunAt?: string;
  runCount: number;
}

export interface WorkflowRunResult {
  workflowId: string;
  runId: string;
  status: "completed" | "waiting_approval" | "failed";
  startedAt: string;
  finishedAt?: string;
  stepResults: Array<{
    stepId: string;
    status: "completed" | "waiting" | "failed";
    output?: Record<string, unknown>;
    error?: string;
  }>;
}

export interface AgentToolTrace {
  tool: string;
  status: "completed" | "skipped" | "failed";
  summary: string;
  durationMs: number;
}

export interface CampaignPlan {
  title: string;
  objective: string;
  audience: string;
  thesis: string;
  channels: Array<{
    channel: SocialChannel;
    angle: string;
    format: string;
    cta: string;
  }>;
  experiments: string[];
  successMetrics: string[];
}

export interface AgentResponse {
  summary: string;
  plan: CampaignPlan;
  trace: AgentToolTrace[];
  requiresApproval: boolean;
}

export interface AnalyticsSnapshot {
  impressions: number;
  engagements: number;
  clicks: number;
  conversions: number;
  revenue: number;
  spend: number;
  followersGained: number;
}
