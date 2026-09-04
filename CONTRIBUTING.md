# Contributing

- Keep agent reasoning and workflow side effects separate.
- Add provider-specific behavior behind an adapter interface.
- Never place provider tokens in browser code.
- Every new external side effect needs idempotency and an audit event.
- Every workflow mutation must consider retry safety.
- Add tests for domain behavior before adding UI-only coverage.

Use conventional commits when practical: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
