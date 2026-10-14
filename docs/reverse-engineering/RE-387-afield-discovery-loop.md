# RE-387 — Afield-inspired evidence-first discovery loop

## Status

Phase A implementation candidate. Clean-room capability donor into `social-growth-os`; not a visual clone of Afield.

## Source identification

- Reddit launch post: `https://www.reddit.com/r/SideProject/comments/1wyqxtr/i_built_afield_ai_marketing_for_saas_founders/`
- First-party product site: `https://afieldai.io/`

## Evidence classification

### first-party-public / official product site

Observed product claims:

- Afield starts from business/product/audience context rather than a blank prompt.
- It describes specialist roles for market analysis, customer research, content, channel execution, and growth planning.
- It attaches source context to recommendations and keeps consequential channel actions behind review/approval gates.
- It presents a loop from research and decision through creation, shipping, measurement, and the next planning cycle.
- Public pricing currently starts at $49/month, with higher tiers advertising broader capabilities and connected analytics/CRM.

These claims establish positioning and advertised behavior. They do **not** establish implementation details, model quality, data coverage, recommendation accuracy, or production reliability.

### first-party-public / Reddit launch post

The creator describes a weekly GTM workflow:

1. capture business context and constraints;
2. research potential customers and public discussions;
3. distinguish actual problem signals from generic role/profile relevance;
4. select a small marketing experiment with a specific observable outcome;
5. prepare drafts for review and use results to inform the next plan.

The post gives an example in which a broad audience hypothesis was sharpened into a more specific customer moment and a five-builder usage experiment. It explicitly says the experiment itself had not yet been reported as completed.

### observed-feedback / Reddit comments

A commenter criticized the site/video presentation as generic AI-generated material. The creator asked for product-specific feedback and accepted responsibility for output quality.

Product implication: visual polish must not substitute for traceable research, specific customer moments, falsifiable experiments, and evidence-backed recommendations.

## Product reconstruction

The valuable unit is not “AI marketing copy.” It is:

`business context → source-backed signals → ranked opportunity → one bounded experiment → governed drafts/actions → measured outcome → next plan`

## Phase A boundary

Implemented in this branch:

- typed business, evidence, signal, opportunity, and experiment contracts;
- deterministic evidence weighting that prevents profile relevance from being treated as purchase intent;
- ranked opportunities with preserved source references;
- exactly one primary experiment;
- explicit `approvalRequired: true` boundary;
- fallback research experiment when evidence is missing;
- `/discovery` workspace using deterministic fixtures;
- unit tests for evidence weighting, weak-evidence handling, ranking, one-experiment output, and missing-evidence fallback.

## Non-goals

- copying Afield branding, layouts, proprietary prompts, or hidden implementation;
- scraping authenticated/private sources;
- autonomous outreach or publishing;
- inferring buying intent from titles/profile fields alone;
- claiming customer acquisition from draft generation;
- claiming live-source coverage before connectors are implemented and independently verified.

## Acceptance / verification gates

### Phase A

- `npm run typecheck`
- `npm test`
- `npm run build`
- exact-head CI evidence

### Phase B — source ingestion

- adapters for explicitly permitted public sources;
- canonical source receipts with timestamp, URL, excerpt/hash, channel, and retrieval status;
- deduplication and stale-source handling;
- negative tests for unavailable/deleted/private sources.

### Phase C — execution preparation

- content/outreach drafts tied to an approved experiment;
- community/channel rule checklist;
- approval record must authorize the exact draft and target scope;
- edit invalidates prior approval;
- no send/publish side effect without authorization.

### Phase D — learning loop

- persist experiment outcomes;
- connect completion, friction, repeat use, qualified replies, and conversion outcomes to the originating evidence and experiment;
- use only verified outcomes when reprioritizing the next plan.

### Phase E — certification

- browser UAT on a hosted preview;
- recovery/replay verification;
- connector failure tests;
- production readiness only after deployment evidence, not from CI alone.
