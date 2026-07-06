-- =============================================================================
-- ARTIVERGES NEXT — Contracts module
-- Contracts originate from an approved quotation, with milestone payment
-- schedules, versions, files, comments, and an audit log.
-- Builds on 0002 (quotations, projects, clients, profiles, is_staff(),
-- current_user_client_id()). References docs/02_DATABASE.md §5.3.
-- =============================================================================

-- 1. Enums ---------------------------------------------------------------------
do $$ begin create type public.contract_status as enum
  ('draft','pending_approval','approved','signed','cancelled','completed');
exception when duplicate_object then null; end $$;

do $$ begin create type public.milestone_payment_status as enum
  ('unpaid','partial','paid');
exception when duplicate_object then null; end $$;

do $$ begin create type public.milestone_invoice_status as enum
  ('not_invoiced','invoiced','paid');
exception when duplicate_object then null; end $$;

-- 2. Contracts -----------------------------------------------------------------
create table if not exists public.contracts (
  id              uuid primary key default gen_random_uuid(),
  contract_no     text not null unique,
  quotation_id    uuid not null references public.quotations(id) on delete restrict,
  project_id      uuid not null references public.projects(id) on delete cascade,
  client_id       uuid not null references public.clients(id) on delete restrict,
  title           text,
  version         integer not null default 1,
  status          public.contract_status not null default 'draft',
  value           numeric(14,2) not null default 0,
  scope           text,
  payment_terms   text,
  warranty        text,
  notes           text,
  start_date      date,
  end_date        date,
  approved_at     timestamptz,
  approved_by     uuid references public.profiles(id) on delete set null,
  signed_at       timestamptz,
  signed_by       uuid references public.profiles(id) on delete set null,
  client_signed_at timestamptz,
  cancelled_at    timestamptz,
  completed_at    timestamptz,
  created_by      uuid references public.profiles(id) on delete set null,
  updated_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  constraint contracts_value_chk check (value >= 0),
  constraint contracts_dates_chk check (end_date is null or start_date is null or end_date >= start_date)
);

-- At most one live (non-cancelled, non-deleted) contract per quotation.
create unique index if not exists uq_contracts_active_quotation
  on public.contracts (quotation_id)
  where deleted_at is null and status <> 'cancelled';

-- 3. Contract versions (history snapshots) -------------------------------------
create table if not exists public.contract_versions (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  version     integer not null,
  snapshot    jsonb not null,
  note        text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint contract_versions_unique unique (contract_id, version)
);

-- 4. Milestones ----------------------------------------------------------------
create table if not exists public.contract_milestones (
  id             uuid primary key default gen_random_uuid(),
  contract_id    uuid not null references public.contracts(id) on delete cascade,
  title          text not null,
  percentage     numeric(6,3) not null default 0,
  amount         numeric(14,2) not null default 0,
  due_date       date,
  payment_status public.milestone_payment_status not null default 'unpaid',
  invoice_status public.milestone_invoice_status not null default 'not_invoiced',
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint contract_milestones_amount_chk check (amount >= 0),
  constraint contract_milestones_pct_chk check (percentage >= 0 and percentage <= 100)
);

-- 5. Files (attachment references) ---------------------------------------------
create table if not exists public.contract_files (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  file_name   text not null,
  file_url    text not null,
  mime_type   text,
  size_bytes  bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- 6. Comments ------------------------------------------------------------------
create table if not exists public.contract_comments (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- 7. Audit log -----------------------------------------------------------------
create table if not exists public.contract_logs (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  detail      text,
  created_at  timestamptz not null default now()
);

-- 8. Indexes -------------------------------------------------------------------
create index if not exists idx_contracts_project on public.contracts (project_id);
create index if not exists idx_contracts_client on public.contracts (client_id);
create index if not exists idx_contracts_quotation on public.contracts (quotation_id);
create index if not exists idx_contracts_status on public.contracts (status);
create index if not exists idx_contracts_active on public.contracts (id) where deleted_at is null;
create index if not exists idx_contract_versions_contract on public.contract_versions (contract_id, version);
create index if not exists idx_contract_milestones_contract on public.contract_milestones (contract_id, sort_order);
create index if not exists idx_contract_files_contract on public.contract_files (contract_id);
create index if not exists idx_contract_comments_contract on public.contract_comments (contract_id, created_at);
create index if not exists idx_contract_logs_contract on public.contract_logs (contract_id, created_at);

-- 9. updated_at triggers -------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['contracts','contract_milestones']
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- 10. Row Level Security -------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'contracts','contract_versions','contract_milestones',
    'contract_files','contract_comments','contract_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t || '_staff_all', t);
    execute format(
      'create policy %I on public.%I for all
         using (public.is_staff()) with check (public.is_staff());',
      t || '_staff_all', t);
  end loop;
end $$;

-- Clients may read only their own signed contracts.
drop policy if exists contracts_client_read on public.contracts;
create policy contracts_client_read on public.contracts
  for select using (
    status = 'signed' and client_id = public.current_user_client_id()
  );

grant select, insert, update, delete on
  public.contracts, public.contract_versions, public.contract_milestones,
  public.contract_files, public.contract_comments, public.contract_logs
  to authenticated;
