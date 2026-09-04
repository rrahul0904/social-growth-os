-- Phase 1: authenticated workspace isolation and tenant-safe durable jobs.
-- This migration is designed for Supabase/Postgres. Application server mutations
-- continue to use DATABASE_URL; browser-facing Data API access is read-only.

alter table job_queue add column if not exists workspace_id uuid references workspaces(id) on delete cascade;
create index if not exists job_queue_workspace_lease_idx on job_queue(workspace_id, status, run_at, priority desc, created_at);
create index if not exists workspace_members_user_idx on workspace_members(user_id, workspace_id);

alter table approvals add constraint approvals_workspace_entity_unique unique (workspace_id, entity_type, entity_id);

-- Every table in the exposed public schema is protected by RLS, even when the app
-- currently reaches it only through server-side repositories.
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table brands enable row level security;
alter table connections enable row level security;
alter table products enable row level security;
alter table campaigns enable row level security;
alter table content_assets enable row level security;
alter table posts enable row level security;
alter table workflows enable row level security;
alter table workflow_runs enable row level security;
alter table agent_runs enable row level security;
alter table analytics_events enable row level security;
alter table approvals enable row level security;
alter table job_queue enable row level security;
alter table audit_log enable row level security;

-- The browser client only needs read access to safe product/control-plane tables.
-- Mutations stay behind authenticated Next.js server routes/actions.
grant select on workspaces, workspace_members, brands, products, campaigns, content_assets, posts, workflows, workflow_runs, agent_runs, analytics_events, approvals, audit_log to authenticated;
revoke all on connections from anon, authenticated;
revoke all on job_queue from anon, authenticated;
revoke all on workspaces, workspace_members, brands, products, campaigns, content_assets, posts, workflows, workflow_runs, agent_runs, analytics_events, approvals, audit_log from anon;

-- A user may see only their own membership rows.
drop policy if exists "members can read own memberships" on workspace_members;
create policy "members can read own memberships"
on workspace_members for select
to authenticated
using (user_id = (select auth.uid())::text);

-- Workspace rows are visible only when the verified user has a membership.
drop policy if exists "members can read workspaces" on workspaces;
create policy "members can read workspaces"
on workspaces for select
to authenticated
using (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = (select auth.uid())::text
  )
);

-- Helper macro cannot be used in policy SQL without a function; avoid SECURITY DEFINER
-- and keep membership predicates explicit to preserve RLS semantics.
drop policy if exists "members can read brands" on brands;
create policy "members can read brands" on brands for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=brands.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read products" on products;
create policy "members can read products" on products for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=products.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read campaigns" on campaigns;
create policy "members can read campaigns" on campaigns for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=campaigns.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read content assets" on content_assets;
create policy "members can read content assets" on content_assets for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=content_assets.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read posts" on posts;
create policy "members can read posts" on posts for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=posts.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read workflows" on workflows;
create policy "members can read workflows" on workflows for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=workflows.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read workflow runs" on workflow_runs;
create policy "members can read workflow runs" on workflow_runs for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=workflow_runs.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read agent runs" on agent_runs;
create policy "members can read agent runs" on agent_runs for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=agent_runs.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read analytics" on analytics_events;
create policy "members can read analytics" on analytics_events for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=analytics_events.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read approvals" on approvals;
create policy "members can read approvals" on approvals for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=approvals.workspace_id and wm.user_id=(select auth.uid())::text)
);

drop policy if exists "members can read audit log" on audit_log;
create policy "members can read audit log" on audit_log for select to authenticated using (
  exists (select 1 from workspace_members wm where wm.workspace_id=audit_log.workspace_id and wm.user_id=(select auth.uid())::text)
);

-- Connections and jobs intentionally have no authenticated Data API policies.
-- OAuth tokens and queue payloads are server-only.
