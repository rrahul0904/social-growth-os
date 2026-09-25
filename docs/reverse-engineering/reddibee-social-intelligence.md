# RE-242 — Reddibee clean-room reverse-engineering dossier

Verified: 2026-09-25  
Source thread: https://www.reddit.com/r/SideProject/comments/1wpv4ey/i_built_a_reddit_mcp_so_my_ai_agent_can_read/  
Current product: https://reddibee.com/

## 1. Decision

Reddibee is a **capability donor for Social Growth OS**, not a new standalone canonical product.

The donor owns the read-only front of the growth loop:

```text
listen -> discover -> validate -> cite -> watch
```

Social Growth OS continues to own:

```text
context -> plan -> approve -> publish -> measure -> learn -> optimize
```

RE-242 must not weaken the existing approval boundary or create autonomous social side effects.

## 2. Evidence discipline

This dossier separates:

- **verified behavior** — observable in the Reddit launch thread or current public product pages;
- **feedback-derived requirements** — explicit needs surfaced by retrievable comments;
- **our clean-room architecture** — implementation choices for Social Growth OS;
- **unresolved questions** — behavior not established by public evidence.

No claim is made about Reddibee's private database, framework, queues, hosting, ranking implementation, prompts, or current model provider.

## 3. Verified current product contract

The current live product presents itself as a read-only MCP that:

- reads Reddit, X, Hacker News, and Product Hunt;
- returns cited threads/permalinks;
- classifies discussion intent;
- never posts, votes, replies, or DMs;
- exposes an HTTP MCP endpoint at `https://reddibee.com/mcp`;
- uses Bearer API-key setup in its documented connection flow;
- supports saved watches and scheduled alerts;
- offers browser workflows over the same research problem space.

Observed classification examples include:

- `asks-for-tool`
- `describes-problem`
- `complains-about-product`
- `asks-for-alternative`

Observed research/tool concepts include:

- `demand_evidence`
- `find_asks`
- `find_communities`
- `community_pulse`
- `community_posts`
- `search_discussions`
- `launch_pulse`
- `get_thread`
- `check_post_fit`
- product/alternative pulse
- watches

Public browser workflows currently include:

1. Where's My Audience
2. Post Score
3. Demand Check
4. Switching Map
5. Idea Atlas

These names describe observable product workflows; our implementation should preserve the underlying capabilities without copying branding or private implementation.

## 4. What the product is really doing

### 4.1 Evidence retrieval, not generic search

The differentiator is not "search social sites." The product turns a question into **auditable evidence**:

```text
natural-language question
  -> source-aware retrieval
  -> normalized thread/comment evidence
  -> intent/entity classification
  -> dedupe/counting
  -> clustering/trending
  -> cited answer
```

Every aggregate should be reversible to the evidence items that produced it.

### 4.2 Demand semantics

Demand Check makes an important semantic distinction:

- an **ask** is evidence that someone wants a capability/solution;
- a **mention** is merely a reference and must not automatically increase demand.

Therefore the classifier is part of the measurement definition, not decorative metadata.

### 4.3 Discussion-level competitive intelligence

Switching Map demonstrates a second pattern:

- identify alternative-seeking threads;
- inspect replies/comments;
- extract candidate destinations;
- count and trend those destinations;
- preserve a source anchor for each extracted claim.

A public statement of switching intent is **not** confirmed churn. Our model must preserve that distinction.

### 4.4 Watches are stateful queries

A watch is not just a scheduled search. It requires durable state so the system knows:

- what query ran;
- when it last ran;
- which evidence was already seen;
- which new matches were emitted;
- which notifications were sent;
- why a match qualified.

## 5. Reddit feedback audit

Reddit metadata reported six comments at audit time. The accessible retrieval surface exposed four unique comment bodies. Two bodies were not available and are intentionally not reconstructed.

### 5.1 Highest-value feedback: can the numbers be trusted?

One commenter specifically challenged whether the headline "101 Notion mentions" style count:

- deduplicates crossposts / the same underlying discussion; and
- avoids counting one person repeating the same point in multiple communities as independent demand.

This is the most important product-design feedback in the thread.

**Unresolved:** no reviewed public source states that Reddibee already performs those dedupe operations.

**RE-242 consequence:** our counts must never be an unexplained integer.

Expose at minimum:

- `raw_mentions`
- `unique_threads`
- `unique_authors`

and provide a dedupe receipt explaining merges/exclusions.

### 5.2 Composability feedback

A visible reply indicates intent to use the product inside another app.

Consequence:

- machine-readable contracts matter;
- MCP/API behavior should be first-class;
- stable structured evidence matters more than a dashboard-only workflow.

### 5.3 Demo feedback

Two visible comments praise the launch video and ask how it was produced.

Consequence:

- demo quality matters for GTM and documentation;
- it is not part of the core runtime acceptance gate.

## 6. Documentation drift

The current homepage describes a four-source read-only MCP.

A privacy page last updated 2026-02-06 still describes an older product shape centered on Reddit/Google keyword tracking and AI comment suggestions.

Treat this as evidence of product evolution/documentation drift.

Precedence rule for this reverse engineering:

1. current live product surface for current behavior;
2. launch thread for historical launch behavior and community feedback;
3. dated/legacy pages only for explicitly historical facts;
4. never use stale copy to infer the current private implementation stack.

## 7. Clean-room target architecture

### 7.1 Core domain

```ts
type SocialSource = "reddit" | "hacker_news" | "x" | "product_hunt";

type EvidenceClass =
  | "asks_for_tool"
  | "describes_problem"
  | "complains_about_product"
  | "asks_for_alternative"
  | "mentions_product"
  | "other";

interface ThreadEvidence {
  id: string;
  source: SocialSource;
  sourceId: string;
  canonicalUrl: string;
  communityId?: string;
  authorRef?: string;
  threadId: string;
  parentId?: string;
  title?: string;
  excerpt?: string;
  createdAt: string;
  retrievedAt: string;
  classification: {
    label: EvidenceClass;
    confidence?: number;
    rationale: string;
    classifierVersion: string;
  };
  freshness: {
    sourceCursor?: string;
    observedAt: string;
  };
}

interface DedupeReceipt {
  evidenceId: string;
  canonicalThreadKey: string;
  normalizedUrl?: string;
  contentFingerprint?: string;
  crosspostOf?: string;
  repeatedAuthorGroup?: string;
  decision: "keep" | "merge" | "exclude";
  reason: string;
}

interface EvidenceCount {
  rawMentions: number;
  uniqueThreads: number;
  uniqueAuthors: number;
  countingPolicyVersion: string;
}
```

### 7.2 Source adapter contract

```ts
interface SourceAdapter {
  readonly source: SocialSource;
  search(input: SearchQuery): Promise<ThreadEvidence[]>;
  getThread(input: ThreadQuery): Promise<ThreadEvidence[]>;
  getCommunity?(input: CommunityQuery): Promise<CommunityEvidence>;
}
```

Source-specific rules, identifiers, pagination, rate limits and freshness remain behind adapters.

### 7.3 Evidence pipeline

```text
SourceAdapter
  -> normalize
  -> canonicalize URL/thread
  -> dedupe
  -> classify
  -> persist evidence + receipts
  -> aggregate
  -> cite
```

Do not run aggregation before dedupe receipts exist.

### 7.4 Query services

Phase A should expose internal services for:

- `searchDiscussions`
- `findAsks`
- `findCommunities`
- `demandEvidence`
- `getThread`
- `communityPulse`
- `productPulse`
- `checkPostFit`

A later workflow layer can compose these into "Demand Check", "Switching Map", etc.

### 7.5 Read-only MCP boundary

The MCP layer should call the same internal query services as the web/API layer.

Requirements:

- scoped API keys;
- revocation;
- per-tool-call quota accounting;
- structured errors;
- deterministic pagination;
- source/citation preservation;
- audit log containing tool, redacted argument summary, timing, result counts, and policy version;
- **no social mutation tools in RE-242**.

### 7.6 Watch model

```text
Watch
  query + source filters + cadence + owner/workspace

WatchRun
  started_at + completed_at + cursor/window + status

WatchMatch
  watch_id + evidence_id + first_seen_at + emitted_at + notification_state
```

Invariant: the same canonical evidence item must not trigger repeated alerts unless policy explicitly allows re-notification.

## 8. Dedupe and counting contract

The Reddit comment makes this a release gate.

### Canonical thread dedupe

Prefer stable source thread IDs. URL normalization is secondary.

### Crosspost handling

Represent crosspost relationships explicitly. Allow the caller to choose:

- source-post count;
- canonical-discussion count.

### Same-author repeats

Do not silently collapse them in raw evidence. Provide a unique-author metric and optionally a repeated-author diagnostic.

### Content fingerprint

Use normalized-content fingerprints only as a heuristic with a receipt. Similar text is not sufficient to prove identity.

### Count output example

```json
{
  "raw_mentions": 101,
  "unique_threads": 83,
  "unique_authors": 71,
  "excluded": {
    "crosspost_duplicates": 9,
    "same_thread_duplicates": 6,
    "other": 3
  },
  "policy_version": "v1"
}
```

The exact numbers above are illustrative only; they are not Reddibee data.

## 9. Storage and governance integration

Use Social Growth OS's existing durable persistence and workspace boundary.

Add domain tables/entities for:

- evidence items;
- dedupe receipts;
- classification receipts;
- query runs;
- count snapshots;
- watches;
- watch runs;
- watch matches;
- source cursors/backfill state;
- scoped research API keys / quota ledger if not already available.

Do not persist more author-level personal data than required for dedupe and provenance. Prefer opaque source references/hashes where possible.

## 10. Test plan

### Unit
- URL normalization
- canonical thread keys
- crosspost relationships
- same-author repeat metrics
- content-fingerprint false-positive cases
- classification receipt serialization
- count-policy versioning

### Fixture scenarios
- same thread returned by two query variants
- Reddit crosspost linking to an original
- same author repeats an ask in three communities
- three different authors make genuinely independent asks
- same text copied by different users
- deleted/unknown author
- comment names a switching destination
- ambiguous/common-word product name
- stale source cursor/backfill

### Contract
- read-only MCP tool schemas
- stable structured errors
- quota charged once per tool call
- citations present on every evidence-derived result

### Watch
- first run emits matches
- second identical run emits none
- new evidence emits once
- failed notification is retryable without duplicating WatchMatch
- cadence/window boundaries are deterministic

### Safety/governance
- no posting/voting/replying/DM tool exists
- workspace isolation
- scoped-key authorization
- logs redact secrets
- classification output is not treated as ground truth without receipts

## 11. Implementation phases

### Phase A — evidence truth layer
Domain contracts, fixtures, dedupe/count engine, classification receipts, source-adapter interface, persistence.

### Phase B — first bounded live adapter
One source adapter, search/get-thread, provenance, rate-limit/error handling.

### Phase C — read-only MCP
Search, asks, communities, demand evidence, thread retrieval.

### Phase D — watches
Durable scheduling, cursoring, match idempotency, notifications/feed.

### Phase E — additional sources
Add sources behind the same adapter/evidence contract. Verify source-specific semantics independently.

### Phase F — product workflows
Community discovery, post-fit, competitive switching, idea mining, weekly briefs.

## 12. Definition of done

RE-242 is not "complete" until:

- counts expose their semantics;
- crosspost and repeat-author fixtures are covered;
- evidence and dedupe receipts are queryable;
- every aggregate can be traced to source links;
- MCP is read-only and contract-tested;
- watches are idempotent;
- at least one real source path is separately certified;
- exact-head CI evidence exists;
- the tracker distinguishes implemented behavior from planned parity.

## 13. Open questions

- What exact semantics should `uniqueAuthors` use across platforms where identity cannot be safely/reliably unified?
- Which community-rule sources are legally/operationally available per platform?
- How should deleted posts/comments affect historical counts?
- What freshness/backfill SLA should each source expose?
- Should repeated asks by one person be shown as persistence/urgency even when excluded from unique-demand counts?
- Which classification tasks should be deterministic/rules-first versus model-assisted?

These are design questions for our implementation, not claims about Reddibee.
