# Social Growth OS — Technical Architecture

## Product boundary

Social Growth OS is an AI-native control plane for social growth. It does **not** copy commerce or social-platform databases. It keeps normalized product/context records, agent/workflow state, generated assets, publishing state, approvals, audit history and analytics required to operate and learn.

The closed loop is:

`discover/context → plan → create → approve → schedule/publish → measure → learn → optimize`

## Logical architecture

```text
Browser / Mobile
      |
      v
Next.js App Router (Vercel or container)
      |
      +----------------------+-----------------------+
      |                      |                       |
      v                      v                       v
Growth Agent             Workflow API          Webhook/API Edge
(tool orchestration)     (deterministic)        (Shopify/Woo/social)
      |                      |                       |
      v                      v                       v
Model Router          PostgreSQL Job Queue     Adapter Boundary
      |                      |                       |
      +----------------------+-----------------------+
                             |
                             v
                        Worker Pool
                             |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
 Social publishers     Analytics collectors   Media/model providers
        |                    |                    |
        +--------------------+--------------------+
                             |
                             v
                     PostgreSQL + Object Storage
```

## Why two execution systems?

The **Growth Agent** is goal-driven and can choose which context tools are needed. It must not directly perform high-risk external side effects. Its output is a proposal with an evidence/tool trace.

The **Workflow Engine** is deterministic and durable. Side effects such as scheduling, publishing, catalog synchronization and analytics collection happen here, with idempotency, retries, leases and explicit approval gates.

This separation prevents a transient LLM conversation from becoming the system of record.

## Core services

### Web application
- Next.js App Router
- Server Components for read-heavy product surfaces
- Route Handlers for public APIs/webhooks
- Client Components only where interaction is required
- Deployable to Vercel or as a standalone Docker image

### Agent orchestration
The current implementation exposes four evidence tools:
1. normalized commerce catalog
2. brand rules/strategy memory
3. content calendar
4. performance analytics

The model router is optional. With no key, the product remains fully demoable using a deterministic strategy fallback. With `AI_GATEWAY_*` configured, the agent calls an OpenAI-compatible gateway and validates the returned plan shape.

### Durable workflows
- PostgreSQL-backed queue
- `FOR UPDATE SKIP LOCKED` leasing
- lease expiry and worker ownership
- bounded retries with exponential backoff
- dead-letter state
- explicit approval step

### Integration adapters
Provider-specific behavior stays behind interfaces:
- Commerce: Shopify, WooCommerce
- Social: Meta/Instagram/Facebook, TikTok, LinkedIn, Pinterest, X
- AI/media: configured model gateway/provider
- Analytics: platform insights + owned-site attribution

Adapters own OAuth/token refresh, provider rate limits, media upload protocols and API version quirks.

## Data model

Primary entities:
- workspaces / workspace_members
- brands
- connections
- products
- campaigns
- content_assets
- posts
- workflows / workflow_runs
- agent_runs
- approvals
- analytics_events
- job_queue
- audit_log

### Analytics scale path
Raw event volume can later move from PostgreSQL to ClickHouse/BigQuery/Snowflake without changing the product control plane. PostgreSQL should continue to own configuration, state, approvals and durable jobs.

## Safety and governance

1. **Approval before publishing** — external posting requires an explicit approval record.
2. **Evidence trace** — agent runs store which context tools were consulted.
3. **Brand claim guardrails** — product claims come from normalized catalog/context, not model memory.
4. **Audit log** — every external side effect records actor, entity and action.
5. **Credential isolation** — provider tokens are encrypted/server-side and never sent to the browser.
6. **Webhook verification** — HMAC verification at ingress outside demo mode.
7. **Idempotency** — provider side effects should use stable idempotency keys derived from post/run IDs.

## Deployment modes

### Vercel-first
- Web/API: Vercel
- Postgres: Supabase/Neon/RDS
- Worker: Render/Fly.io/Railway/Kubernetes or a queue service capable of durable jobs
- Object storage: Supabase Storage/S3/R2

### Docker
`docker compose up --build` runs web + PostgreSQL + worker locally.

### Kubernetes
Deploy web and worker as separate Deployments. Use a managed PostgreSQL service or StatefulSet for non-production environments. Scale workers horizontally because job leases use `SKIP LOCKED`.

## Production hardening backlog

1. Real OAuth flows and encrypted token vault
2. Real provider publishers with idempotency keys
3. Object storage and media pipeline
4. Per-workspace RBAC enforcement
5. AI budget/cost ledger and provider failover
6. ClickHouse analytics event plane above sustained high event volume
7. OpenTelemetry traces + Sentry
8. End-to-end Playwright certification against sandbox social accounts
