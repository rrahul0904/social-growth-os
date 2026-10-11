# Build-in-Public Autopilot — Reverse Engineering Dossier

## Status

Research and first implementation slice started on `reverse/loudcode-build-in-public-autopilot`.

Canonical owner: **Social Growth OS**. This capability should not become a separate scheduler product or disconnected repository.

## Public donor concept

The public LoudCode concept is straightforward: founders often build but do not market because they do not know what to post, marketing takes time, and they forget to post. The product takes information from a project/app, turns it into build-in-public-ready posts, and schedules them.

This dossier uses that public behavior as inspiration only. We do not copy donor source code, private APIs, prompts, branding, visual design, wording, or proprietary implementation details.

## Competitive bar

The category already contains implementations that:

- turn GitHub releases and milestones into social posts;
- connect GitHub + Stripe-style business signals;
- auto-generate build-in-public drafts;
- schedule content;
- generate multiple content artifacts from one source of truth;
- link claims back to real PRs/diffs in stronger evidence-first designs.

Therefore, parity is not enough.

## Product thesis

**Connect the systems where building already happens. Social Growth OS detects what is worth sharing, proves every factual claim, protects sensitive information, creates channel-native stories in the founder's voice, routes them through the chosen autonomy policy, publishes reliably, and learns which stories create qualified business outcomes.**

## Capability map

### MATCH

- Connect a product/project.
- Detect development/product activity.
- Generate build-in-public content.
- Schedule and publish.

### IMPROVE

- Evidence references for factual claims.
- GitHub PR/commit/release context instead of generic app descriptions alone.
- Deploy, billing, signup and usage signals.
- Privacy/redaction before model invocation and before publication.
- Approval by default.
- Channel-native composition instead of identical cross-posts.
- Content dedupe and fatigue protection.
- Attribution to qualified clicks, signups and revenue.
- Durable workflows with retries, leases, idempotency and replay.
- Multi-product and multi-repository founder workspaces.

### NEW

- Evidence graph: every generated factual claim can answer "why do we believe this?"
- Story arcs: ship, launch, metric, struggle, lesson, ask, customer win.
- Narrative continuity: avoid posting isolated events; build multi-week product stories.
- Founder voice memory: preferred tone, banned phrases, technical depth, disclosure rules.
- Autonomy ladder: draft-only → approval-required → scheduled autopublish → policy-bounded autopilot.
- Risk classifier for secrets, customer identifiers, private-repo details, unreleased work and sensitive financials.
- Experiment registry for hook/format/channel variants.
- Edit-distance learning from what the founder changes before publishing.
- Conversion-quality optimization, not only likes/impressions.
- Weekly founder digest, changelog and investor update from the same evidence graph.
- Quiet hours, budgets, kill switch, cancellation and replay.

### OMIT

- Donor UI/branding/wording reproduction.
- Unreviewed publication of private code or sensitive business data.
- Post-count optimization as the primary goal.
- Model-generated factual claims without source evidence.

## Target architecture

```text
GitHub / Deploy / Billing / Analytics / Manual note
                    │
                    ▼
             Source adapters
                    │
                    ▼
          Normalized BuildEvent
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
 Privacy / redaction      Evidence ledger
         │                     │
         └──────────┬──────────┘
                    ▼
        Milestone + story detector
                    │
                    ▼
             Story candidate
                    │
                    ▼
        Founder voice + channel policy
                    │
                    ▼
          Draft / variants / assets
                    │
                    ▼
          Autonomy + approval policy
                    │
                    ▼
       Durable schedule / publisher
                    │
                    ▼
           Provider publish receipt
                    │
                    ▼
  UTM / click / signup / revenue attribution
                    │
                    ▼
      Performance + human-edit learning
                    └───────────────► next plan
```

## Core domain contracts

Initial code implements:

- `BuildEvent`
- `EvidenceReference`
- `BuildMetric`
- `StoryCandidate`
- `PublicationReceipt`
- `AutonomyLevel`
- evidence-required assertion for factual source events
- privacy/redaction gate
- deterministic story/milestone ranking

## Source adapter roadmap

### GitHub

Events:
- pull request merged
- release published
- issue closed / milestone completed
- repository star milestone
- commit roundup

Rules:
- bounded context only;
- no raw source files by default;
- public/private visibility carried into evidence metadata;
- summarize diffs/PR descriptions rather than exposing code;
- checksum or provider ID retained for replay/audit.

### Deployments

Adapter boundary for Vercel/Railway-style providers:
- deployment ready
- rollback
- production promotion
- uptime/reliability milestone

### Billing

Adapter boundary for Stripe-style providers:
- MRR/ARR thresholds
- first paid customer
- customer-count thresholds
- expansion milestones

Financial values must be independently configurable for public disclosure or redaction.

### Product analytics

Adapter boundary for PostHog/GA-style providers:
- activation milestone
- signup threshold
- active-user threshold
- retention milestone
- feature-adoption threshold

### Manual evidence

Founder may attach:
- note
- screenshot
- changelog item
- customer quote with explicit disclosure status

Manual notes are the only event class allowed to exist without external evidence, and factual publication generated from them should still be treated as unverified until corroborated.

## Story selection

Story candidates are scored from:

1. event importance;
2. business significance;
3. evidence quality/quantity;
4. metric growth;
5. novelty versus recent posts;
6. audience relevance;
7. historical conversion quality;
8. founder strategy/goal.

The first deterministic implementation intentionally uses only event importance, metrics and evidence count. Learning-based ranking is a later phase.

## Privacy and safety model

Two gates are required:

1. **pre-model gate** — minimize/redact sensitive input before it reaches an AI provider;
2. **pre-publish gate** — scan the final payload again after generation and human edits.

Initial deterministic redaction covers:
- common API-token patterns;
- private keys;
- database URLs/credentials;
- email addresses;
- optionally financial amounts.

Later controls:
- customer-name/identifier policy;
- secret scanners;
- private-repository vocabulary allow/deny lists;
- unreleased-feature embargo tags;
- workspace-specific disclosure policy;
- provider-specific content policy.

## Autonomy model

### Level 0 — Draft only
Generate candidates, never schedule or publish.

### Level 1 — Approval required
Human approval is required for each external post.

### Level 2 — Scheduled autopublish
Approved content can publish automatically at its scheduled time.

### Level 3 — Policy-bounded autopilot
The system may select, generate and schedule only when every workspace policy passes. Sensitive categories always fall back to approval.

All levels require a kill switch and durable cancellation semantics.

## Content quality model

A good build-in-public engine should not emit endless variants of "Just shipped X".

The composer should maintain a balanced story mix:
- ship
- launch
- metric
- struggle
- lesson
- ask
- customer win

It should also use narrative continuity:
- what problem were we solving?
- what changed?
- what surprised us?
- what measurable outcome followed?
- what are we trying next?

## Multi-channel behavior

Do not duplicate one text blob everywhere.

- X / Threads: concise hook, progress or lesson, conversational CTA.
- LinkedIn: problem → decision → evidence → takeaway.
- Mastodon: concise technical/indie-builder update with minimal growth-hack language.
- Changelog: factual and product-centered.
- Newsletter / digest: multi-event narrative.

Channel adapters must own provider length/media/link constraints.

## Attribution and learning loop

Every publish should carry:
- source event IDs;
- evidence references;
- draft and final text;
- human edit delta;
- campaign/story taxonomy;
- channel/provider receipt;
- attribution metadata.

The closed loop should optimize toward:
- qualified clicks;
- waitlist/signup conversion;
- activation;
- paid conversion;
- attributed revenue;
- retention/expansion where applicable.

Likes and impressions remain diagnostic signals, not the primary objective.

## Durable workflow state

Recommended state machine:

```text
observed
  → normalized
  → safety_checked
  → candidate
  → drafted
  → awaiting_approval
  → approved
  → scheduled
  → publishing
  → published
  → measured
  → learned
```

Terminal/alternate states:

```text
rejected | cancelled | quarantined | failed | dead_lettered
```

Publishing must be idempotent. Retry/restart may not create duplicate external posts.

## Acceptance contracts

- Factual generated claims require evidence references.
- Private/sensitive data is minimized before model invocation and scanned again before publication.
- Near-duplicate stories are blocked within the configured horizon.
- Scheduled publication survives process restart.
- Repeated delivery/retry cannot double-post.
- Publishing is approval-gated unless an explicit workspace policy permits otherwise.
- Final publication records preserve evidence, draft, edits, final payload and provider receipt.
- A provider API success without a stored provider receipt is not considered verified publication.
- Local tests or a green build do not equal shipped product status.

## Verification plan

### Deterministic
- normalization fixtures
- evidence-required checks
- redaction fixtures
- milestone classification
- story ranking
- dedupe
- autonomy-policy checks

### Negative tests
- secret leakage
- database credential leakage
- private-key leakage
- customer/private-data leakage
- unsupported factual claims
- double-publish attempt
- retry/restart replay

### Integration
- GitHub webhook/API fixture → normalized event
- event → evidence-backed candidate
- candidate → approval
- approval → durable schedule
- schedule → provider adapter
- provider receipt → analytics attribution

### Production certification
- exact-head CI
- hosted preview health
- real-browser UAT
- OAuth/provider test-account verification
- restart/recovery verification
- tenant isolation
- security/privacy review
- exact deployment SHA + evidence receipts

## Phase plan

### Phase A — Trust primitives
- contracts
- redaction
- milestone classifier
- tests

### Phase B — GitHub MVP
- GitHub connection boundary
- bounded PR/release ingestion
- evidence ledger persistence
- candidate feed UI
- deterministic draft fallback

### Phase C — Approval + schedule
- approval queue
- schedule UI
- durable publication jobs
- cancellation/retry/idempotency

### Phase D — Business signals
- billing adapter
- product-analytics adapter
- deployment adapter
- composite milestones

### Phase E — Attribution
- UTM generator
- click capture
- signup/revenue attribution
- story/channel performance dashboard

### Phase F — Learning
- edit-delta memory
- repetition/fatigue model
- hook/format experiments
- performance-informed ranking

### Phase G — Policy-bounded autopilot
- autonomy levels
- quiet hours
- disclosure budgets
- sensitive-category fallback
- kill switch

### Phase H — Production certification
- provider OAuth
- hosted queues/storage
- observability
- browser/device UAT
- exact-SHA deployment receipts

## Current truth

The first trust-primitives slice is implemented on the isolated reverse-engineering branch. It is **not yet a deployed product** and must not be marked shipped until CI, hosted deployment, browser UAT and provider-level verification are complete.
