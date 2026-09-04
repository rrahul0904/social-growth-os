# Security

## Current guarantees
- Supabase SSR sessions are verified server-side before workspace context is created.
- Workspace role comes from `workspace_members`, never editable user metadata.
- Protected mutations require owner/admin/editor role.
- RLS is enabled on all public-schema application tables.
- OAuth connection tokens and durable queue payloads are not exposed through the browser Data API.
- Webhook HMAC verification is implemented and required outside demo mode.
- Publishing endpoint requires explicit approval.
- Provider logic is isolated behind adapter interfaces.
- No secrets are exposed in client components or committed to source.
- Queue workers use leases and bounded retries.

## Production requirements before real social accounts are connected
- Encrypt OAuth access/refresh tokens using KMS-managed envelope encryption.
- Enforce workspace RBAC server-side on every mutation.
- Add CSRF/state/PKCE validation to OAuth flows.
- Use provider-scoped least-privilege permissions.
- Add idempotency keys for all external publishes.
- Store immutable audit events for approvals and side effects.
- Rotate webhook secrets and provider credentials on a defined schedule.
- Add dependency, secret and container scanning in CI.

Report security issues privately to the repository owner rather than opening a public issue.
