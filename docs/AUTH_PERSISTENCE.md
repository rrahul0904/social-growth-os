# Phase 1 — Auth, Persistence and Workspace Isolation

## Runtime modes

### Demo mode
`DEMO_MODE=true` keeps the product runnable without external services. Auth resolves to the seeded Northstar Commerce workspace and repositories return demo data.

### Live mode
Set `DEMO_MODE=false` plus:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

Supabase owns authentication/session refresh. PostgreSQL remains the control-plane system of record.

## Auth flow

1. Browser signs in through `/login`.
2. Supabase stores the SSR session in cookies.
3. Next.js `proxy.ts` refreshes/verifies auth claims.
4. Server Components and Route Handlers call `getRequestContext()`.
5. The verified `sub` claim is mapped to `workspace_members.user_id`.
6. A first-time authenticated user receives a workspace and owner membership.
7. Every server repository query receives the resolved workspace ID; callers cannot select a workspace by request body/query string.

Do not use `user_metadata` for roles. Workspace authorization lives in `workspace_members.role`.

## Authorization

- owner/admin/editor: agent runs, approvals, workflow execution and publish requests
- analyst/viewer: read-only product/analytics surfaces

The same boundary is reinforced by Supabase RLS for Data API reads.

## Database access model

The browser uses the Supabase publishable key only for auth/session operations. Product data is currently read through server repositories using `DATABASE_URL`.

Sensitive tables are not available to the browser Data API:

- `connections` (OAuth credentials/token ciphertext)
- `job_queue` (durable execution payloads)

All public-schema tables have RLS enabled. Safe tables grant authenticated read access only, scoped through `workspace_members` policies.

## Durable multi-tenancy

Phase 1 adds `job_queue.workspace_id`. Commerce webhooks resolve their owning workspace from `connections(provider, external_account_id)` before enqueueing `catalog.sync`. This prevents cross-workspace job ambiguity as workers scale horizontally.

## Approval persistence

`POST /api/approvals` records the decision, actor and comment. Post approvals update `approved_by`, `approved_at` and status, and emit an immutable `audit_log` entry. `/api/publish` requires a persisted approval in live mode; a caller cannot bypass it by sending `approved: true`.

## Supabase setup notes

For email confirmation in SSR, configure the Supabase confirmation email template to route `token_hash` and `type` to `/auth/confirm`. The route verifies the OTP before redirecting into the protected application.
