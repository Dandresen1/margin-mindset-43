-- Organizations / membership
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

-- Reports (top-level units the user requests)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete set null,
  name text not null,
  input jsonb not null default '{}'::jsonb,        -- parameters for generation
  status text not null default 'pending' check (status in ('pending','running','succeeded','failed')),
  output jsonb,                                     -- structured JSON result
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

-- Per-run history (so re-runs don't overwrite)
create table if not exists report_runs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed')),
  logs text,                        -- optional aggregated logs
  meta jsonb,                       -- versions, model names, etc.
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

-- Generated files (PDFs, images, CSVs)
create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  kind text not null,               -- 'pdf' | 'html' | 'csv' | 'image'
  path text not null,               -- storage path
  size_bytes bigint,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- RLS helper: is the current user in org?
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from memberships m
    where m.org_id = org and m.user_id = auth.uid()
  );
$$;

alter table organizations enable row level security;
alter table memberships  enable row level security;
alter table reports      enable row level security;
alter table report_runs  enable row level security;
alter table artifacts    enable row level security;

-- Policies
create policy org_read   on organizations for select using ( is_org_member(id) );
create policy org_insert on organizations for insert with check ( auth.uid() is not null );

create policy mem_self on memberships for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy rpt_rw on reports for all
  using ( is_org_member(org_id) ) with check ( is_org_member(org_id) );

create policy run_rw on report_runs for all
  using ( exists(select 1 from reports r where r.id=report_id and is_org_member(r.org_id)) )
  with check ( exists(select 1 from reports r where r.id=report_id and is_org_member(r.org_id)) );

create policy art_rw on artifacts for all
  using ( exists(select 1 from reports r where r.id=report_id and is_org_member(r.org_id)) )
  with check ( exists(select 1 from reports r where r.id=report_id and is_org_member(r.org_id)) );