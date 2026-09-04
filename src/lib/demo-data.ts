import type {
  AnalyticsSnapshot,
  Campaign,
  DashboardMetric,
  MetricPoint,
  Post,
  Product,
  WorkflowDefinition,
} from "./types";

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Revenue influenced", value: "$18,420", change: "+18.7%", direction: "up", helper: "vs. previous 30 days" },
  { label: "Social conversions", value: "312", change: "+12.4%", direction: "up", helper: "attributed purchases" },
  { label: "Qualified clicks", value: "8,941", change: "+21.3%", direction: "up", helper: "to owned properties" },
  { label: "Content velocity", value: "4.8/day", change: "+0.6", direction: "up", helper: "approved posts per day" },
];

export const revenueTrend: MetricPoint[] = [
  { label: "Mon", value: 1510 },
  { label: "Tue", value: 1980 },
  { label: "Wed", value: 1770 },
  { label: "Thu", value: 2450 },
  { label: "Fri", value: 2790 },
  { label: "Sat", value: 3140 },
  { label: "Sun", value: 2860 },
];

export const products: Product[] = [
  {
    id: "prod_linen_01",
    externalId: "shopify_7811",
    source: "shopify",
    title: "Summer Linen Shirt",
    description: "Breathable stone-washed linen shirt with a relaxed fit.",
    price: 59,
    currency: "USD",
    tags: ["summer", "linen", "menswear"],
    inventory: 184,
    updatedAt: "2026-09-03T18:30:00Z",
  },
  {
    id: "prod_weekender_02",
    externalId: "shopify_7812",
    source: "shopify",
    title: "Canvas Weekender",
    description: "Structured carry-on weekender with leather trim.",
    price: 119,
    currency: "USD",
    tags: ["travel", "bags", "gift"],
    inventory: 76,
    updatedAt: "2026-09-03T17:05:00Z",
  },
  {
    id: "prod_sneaker_03",
    source: "woocommerce",
    title: "Court Low Sneaker",
    description: "Minimal leather sneaker built for everyday wear.",
    price: 89,
    currency: "USD",
    tags: ["footwear", "essential"],
    inventory: 91,
    updatedAt: "2026-09-03T16:10:00Z",
  },
];

export const campaigns: Campaign[] = [
  {
    id: "camp_001",
    name: "Labor Day Essentials",
    objective: "Drive collection revenue",
    status: "active",
    channels: ["instagram", "facebook", "pinterest", "tiktok"],
    startAt: "2026-08-29T08:00:00Z",
    endAt: "2026-09-07T23:00:00Z",
    posts: 24,
    revenue: 7420,
  },
  {
    id: "camp_002",
    name: "Fall Preview",
    objective: "Grow qualified audience",
    status: "approval",
    channels: ["instagram", "tiktok", "pinterest"],
    startAt: "2026-09-08T08:00:00Z",
    endAt: "2026-09-21T23:00:00Z",
    posts: 18,
  },
];

export const posts: Post[] = [
  {
    id: "post_001",
    channel: "instagram",
    title: "Linen, without the fuss",
    copy: "The layer that makes late-summer dressing easy. Breathable linen, relaxed cut, no overthinking required.",
    status: "scheduled",
    scheduledAt: "2026-09-04T13:00:00Z",
    campaignId: "camp_001",
    assetType: "carousel",
  },
  {
    id: "post_002",
    channel: "tiktok",
    title: "3 ways to style one linen shirt",
    copy: "Hook: One shirt, three settings. Workday → rooftop → weekend.",
    status: "approval",
    scheduledAt: "2026-09-04T19:30:00Z",
    campaignId: "camp_001",
    assetType: "video",
  },
  {
    id: "post_003",
    channel: "linkedin",
    title: "Behind the material choice",
    copy: "Why we chose washed linen for a product designed around repeat wear.",
    status: "draft",
    scheduledAt: "2026-09-05T15:00:00Z",
    campaignId: "camp_001",
    assetType: "image",
  },
  {
    id: "post_004",
    channel: "pinterest",
    title: "Late Summer Capsule Wardrobe",
    copy: "Save this 5-piece capsule for warm days and cool evenings.",
    status: "published",
    scheduledAt: "2026-09-03T14:00:00Z",
    campaignId: "camp_001",
    assetType: "image",
    impressions: 18440,
    clicks: 1460,
    conversions: 42,
  },
];

export const workflows: WorkflowDefinition[] = [
  {
    id: "wf_product_launch",
    name: "New product launch",
    description: "Turn a newly synced product into a multi-channel launch campaign with an approval gate.",
    trigger: "product.created",
    enabled: true,
    runCount: 47,
    lastRunAt: "2026-09-03T18:31:12Z",
    steps: [
      { id: "s1", type: "load_brand_context", label: "Load brand context" },
      { id: "s2", type: "load_product", label: "Load product" },
      { id: "s3", type: "generate_copy", label: "Generate channel copy" },
      { id: "s4", type: "generate_image_prompt", label: "Generate creative brief" },
      { id: "s5", type: "request_approval", label: "Request approval" },
      { id: "s6", type: "schedule_post", label: "Schedule approved posts" },
      { id: "s7", type: "measure_results", label: "Collect performance" },
    ],
  },
  {
    id: "wf_daily_optimizer",
    name: "Daily growth optimizer",
    description: "Inspect yesterday's winners and update today's content recommendations.",
    trigger: "schedule.daily",
    enabled: true,
    runCount: 121,
    lastRunAt: "2026-09-03T12:00:00Z",
    steps: [
      { id: "s1", type: "load_brand_context", label: "Load brand context" },
      { id: "s2", type: "measure_results", label: "Read performance" },
      { id: "s3", type: "generate_copy", label: "Generate optimized angles" },
      { id: "s4", type: "request_approval", label: "Request approval" },
    ],
  },
];

export const analyticsSnapshot: AnalyticsSnapshot = {
  impressions: 428300,
  engagements: 34720,
  clicks: 8941,
  conversions: 312,
  revenue: 18420,
  spend: 2840,
  followersGained: 1870,
};
