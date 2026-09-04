-- Social Growth OS core schema. Works on PostgreSQL 15+ and Supabase Postgres.
create extension if not exists pgcrypto;

create type workspace_role as enum ('owner','admin','editor','analyst','viewer');
create type post_status as enum ('draft','approval','scheduled','published','failed');
create type job_status as enum ('queued','running','completed','dead');

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id text not null,
  role workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  voice jsonb not null default '{}'::jsonb,
  guardrails jsonb not null default '{}'::jsonb,
  strategy_memory jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  provider text not null,
  kind text not null check (kind in ('commerce','social','analytics','ai')),
  external_account_id text,
  status text not null default 'connected',
  token_ciphertext text,
  refresh_token_ciphertext text,
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider, external_account_id)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source text not null,
  external_id text not null,
  title text not null,
  description text not null default '',
  price numeric(14,2) not null default 0,
  currency text not null default 'USD',
  inventory integer,
  image_url text,
  tags text[] not null default '{}',
  source_payload jsonb not null default '{}'::jsonb,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, source, external_id)
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  objective text not null,
  status text not null default 'planning',
  channels text[] not null default '{}',
  strategy jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table content_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  kind text not null,
  storage_url text,
  prompt text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  channel text not null,
  external_post_id text,
  title text not null default '',
  copy text not null default '',
  asset_id uuid references content_assets(id) on delete set null,
  status post_status not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  approved_by text,
  approved_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  trigger_type text not null,
  enabled boolean not null default true,
  definition jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  status text not null,
  trigger_payload jsonb not null default '{}'::jsonb,
  step_results jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text
);

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  actor_id text,
  objective text not null,
  model_provider text,
  model_id text,
  tool_trace jsonb not null default '[]'::jsonb,
  output jsonb not null default '{}'::jsonb,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  estimated_cost_usd numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

create table analytics_events (
  id bigserial primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  post_id uuid references posts(id) on delete set null,
  event_type text not null,
  value numeric(18,4) not null default 1,
  dimensions jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  ingested_at timestamptz not null default now()
);

create index analytics_events_workspace_time_idx on analytics_events(workspace_id, occurred_at desc);
create index analytics_events_post_time_idx on analytics_events(post_id, occurred_at desc);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  status text not null default 'pending',
  requested_by text,
  decided_by text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  comment text
);

create table job_queue (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status job_status not null default 'queued',
  priority integer not null default 0,
  run_at timestamptz not null default now(),
  attempts integer not null default 0,
  max_attempts integer not null default 8,
  leased_by text,
  lease_expires_at timestamptz,
  last_error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index job_queue_lease_idx on job_queue(status, run_at, priority desc, created_at);

create table audit_log (
  id bigserial primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  actor_id text,
  action text not null,
  entity_type text,
  entity_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Minimal seed workspace for local/dev environments.
insert into workspaces (name, slug) values ('Northstar Commerce', 'northstar-commerce') on conflict do nothing;
