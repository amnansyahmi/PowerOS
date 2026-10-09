-- PowerOS Neon foundation. Run with the owner role, never the runtime role.
-- Auth stays in Supabase. The server supplies a verified subject per transaction.
grant poweros_runtime to poweros_owner;
create schema if not exists poweros_private;
revoke all on schema poweros_private from public;
grant usage on schema public, poweros_private to poweros_runtime;

create table public.app_users (
  id text primary key,
  email text,
  created_at timestamptz not null default now()
);
create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  slug text unique,
  created_at timestamptz not null default now()
);
create table public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id text not null references public.app_users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index org_members_user_id_idx on public.org_members(user_id);
create table public.audit_events (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.orgs(id),
  actor_id text not null references public.app_users(id),
  event_type text not null,
  created_at timestamptz not null default now()
);
create index audit_events_org_created_idx on public.audit_events(org_id, created_at);

create function poweros_private.user_id() returns text
language sql stable set search_path = '' as $$
  select nullif(current_setting('app.user_id', true), '');
$$;
create function poweros_private.is_member(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.org_members
    where org_id = target and user_id = poweros_private.user_id());
$$;
create function poweros_private.is_admin(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.org_members
    where org_id = target and user_id = poweros_private.user_id()
    and role in ('owner','admin'));
$$;

alter table public.app_users enable row level security;
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.audit_events enable row level security;
create policy users_read_self on public.app_users for select to poweros_runtime
  using (id = poweros_private.user_id());
create policy orgs_read_member on public.orgs for select to poweros_runtime
  using (poweros_private.is_member(id));
create policy orgs_update_admin on public.orgs for update to poweros_runtime
  using (poweros_private.is_admin(id)) with check (poweros_private.is_admin(id));
create policy members_read_org on public.org_members for select to poweros_runtime
  using (poweros_private.is_member(org_id));
create policy audit_read_admin on public.audit_events for select to poweros_runtime
  using (poweros_private.is_admin(org_id));
grant select on public.app_users, public.orgs, public.org_members, public.audit_events to poweros_runtime;
grant update(name) on public.orgs to poweros_runtime;

-- Membership and audit writes are limited to these narrowly scoped functions.
create function poweros_private.create_workspace(org_name text, user_email text, demo boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
declare subject text; workspace uuid;
begin
  subject := poweros_private.user_id();
  if subject is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if length(trim(org_name)) not between 1 and 120 then raise exception 'invalid workspace name'; end if;
  perform pg_advisory_xact_lock(hashtextextended(subject, 0));
  insert into public.app_users(id,email) values(subject,user_email) on conflict(id) do nothing;
  select org_id into workspace from public.org_members where user_id = subject order by created_at, org_id limit 1;
  if workspace is not null then return workspace; end if;
  insert into public.orgs(name) values(trim(org_name)) returning id into workspace;
  insert into public.org_members(org_id,user_id,role)
    values(workspace,subject,case when demo then 'viewer' else 'owner' end);
  insert into public.audit_events(org_id,actor_id,event_type)
    values(workspace,subject,case when demo then 'demo_workspace.created' else 'workspace.created' end);
  return workspace;
end;
$$;
revoke all on all functions in schema poweros_private from public;
grant execute on all functions in schema poweros_private to poweros_runtime;

create table public.schema_migrations(version text primary key, applied_at timestamptz not null default now());
insert into public.schema_migrations(version) values('001_neon_tenancy');
