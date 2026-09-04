# Implementation Plan

## Phase 0 — Foundation (implemented in this repository)
- Production-oriented Next.js application shell
- Command Center, Agent, Workflows, Calendar, Library, Analytics, Integrations, Settings
- Domain model
- Commerce normalization for Shopify/WooCommerce
- HMAC webhook verification
- Agent evidence tools + deterministic fallback planner
- Workflow engine with approval boundary
- Social publisher interface
- PostgreSQL schema
- Durable PostgreSQL queue primitives
- Worker skeleton
- Docker + CI
- Unit tests

## Phase 1 — Real persistence and auth (implemented foundation)
- Supabase SSR cookie auth + Next.js proxy refresh
- verified claims → workspace context mapping
- automatic first-workspace provisioning
- owner/admin/editor mutation authorization
- PostgreSQL-backed dashboard/products/campaigns/posts/workflows/analytics repositories
- persisted agent runs, workflow runs and approval decisions
- RLS on every public control-plane table
- Data API read policies scoped through workspace membership
- connections/job queue blocked from browser Data API
- tenant-scoped background jobs and commerce webhook ownership resolution
- persisted approval/audit trail before publish

Remaining Phase 1 hardening:
- KMS-backed token envelope encryption implementation
- migration/seed CLI around target Supabase project
- generated database TypeScript types once the real project is linked

## Phase 2 — Provider connectivity
- Shopify OAuth + app installation
- WooCommerce credential UI
- Meta OAuth + Instagram/Facebook publishing
- LinkedIn OAuth/publishing
- TikTok Content Posting API
- Pinterest Pins API
- X API
- Token refresh and connection-health monitor

## Phase 3 — Media + AI production
- Multi-provider text model router with budget policies
- Image generation adapter
- Video generation adapter
- Object storage upload pipeline
- Brand memory / retrieved evidence index
- Tool-level telemetry, token usage and cost ledger

## Phase 4 — Closed-loop intelligence
- Analytics collectors per platform
- First-party UTM/click attribution
- Shopify order attribution
- Creative experiment registry
- Winner/loser detection
- Growth agent memory updates from observed outcomes

## Phase 5 — Agency / enterprise
- Multi-client portfolio dashboard
- granular RBAC / SSO
- approval SLA / escalation
- audit export
- webhooks / public API
- spend and AI-budget controls
- ClickHouse event plane if volume warrants it
