# Social Growth OS

AI-native social growth operating system inspired by the strongest parts of modern social automation products, but designed around a broader closed loop:

**context → plan → create → approve → publish → measure → learn → optimize**

The repo intentionally separates **agent reasoning** from **durable workflow execution**. Agents may propose work. External side effects remain governed and replayable.

## What is implemented

- Premium dark Command Center UI
- Growth Agent with catalog / brand / calendar / analytics evidence trace
- deterministic fallback campaign planner (works without an AI key)
- optional OpenAI-compatible AI gateway route
- workflow engine with explicit approval boundary
- Shopify + WooCommerce webhook normalization and HMAC verification
- social publisher adapter contract
- PostgreSQL schema for workspace, brand, product, campaign, post, workflow, agent, approval, analytics, queue and audit state
- PostgreSQL durable job leasing with `SKIP LOCKED`, tenant scoping, retries and dead-letter state
- worker skeleton
- Supabase SSR authentication with Next.js proxy token refresh
- workspace auto-provisioning + role authorization
- PostgreSQL-backed live repositories with demo fallback
- persisted approval/audit trail and agent/workflow runs
- Supabase RLS policies for workspace-isolated Data API reads
- analytics and attribution surface
- integration control plane UI
- Docker / Docker Compose
- GitHub Actions CI
- unit tests for commerce normalization, HMAC and approval-safe workflows

## Product routes

| Route | Purpose |
|---|---|
| `/dashboard` | Business-outcome command center |
| `/agent` | Goal-driven campaign planning + evidence trace |
| `/workflows` | Durable automation definitions |
| `/calendar` | Approval and publishing calendar |
| `/library` | Content asset registry |
| `/analytics` | Closed-loop performance / attribution |
| `/integrations` | Commerce, social and AI connections |
| `/settings` | Autonomy and governance policy |

## Run locally in demo mode

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. `DEMO_MODE=true` is the default, so no database or API credentials are required for the UI and agent demo.

## Activate live auth + persistence

Create/link the intended Supabase project, apply both migrations, then set:

```bash
DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
DATABASE_URL=<server-side postgres/pooler connection>
```

See [`docs/AUTH_PERSISTENCE.md`](docs/AUTH_PERSISTENCE.md). Until those values are set, the same codebase stays usable in demo mode.

## Run the production-shaped stack with Docker

```bash
docker compose up --build
```

This starts PostgreSQL, the Next.js web service and a separate worker process.

## Configure real AI planning

Set these variables:

```bash
AI_GATEWAY_URL=<OpenAI-compatible chat-completions endpoint>
AI_GATEWAY_API_KEY=<secret>
AI_DEFAULT_MODEL=<provider/model configured in your gateway>
```

No model ID is hard-coded. This prevents the repo from baking in a provider choice that will age quickly.

## Test / verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

See:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md)
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)
- [`docs/AUTH_PERSISTENCE.md`](docs/AUTH_PERSISTENCE.md)
- [`SECURITY.md`](SECURITY.md)

## Repository philosophy

1. **The model is not the database.** Product, campaign, approval and analytics state live in durable systems.
2. **The chat is not the workflow engine.** Long-running external actions go through durable jobs/workflows.
3. **Publishing is a privileged action.** Agent plans stay behind explicit approval until policy allows otherwise.
4. **Every recommendation should have evidence.** Agent tool traces make the context chain inspectable.
5. **Optimize for revenue/qualified outcomes, not post count.** Analytics feeds the next planning cycle.
