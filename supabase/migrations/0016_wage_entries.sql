-- =============================================================================
-- ARTIVERGES NEXT — Wage entries (สรุปค่าแรง)
-- Labor-cost ledger with free-text worker names (workers rarely have accounts),
-- per project, with a simple unpaid → paid status.
-- =============================================================================

do $$ begin
  create type public.wage_status as enum ('unpaid', 'paid');
exception when duplicate_object then null; end $$;

create table if not exists public.wage_entries (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete set null,
  worker_name text not null,
  role_label  text,
  days_worked numeric(6,2) not null default 0,
  amount      numeric(14,2) not null,
  work_date   date,
  status      public.wage_status not null default 'unpaid',
  note        text,
  paid_at     timestamptz,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint wage_entries_amount_chk check (amount >= 0)
);

create index if not exists idx_wage_entries_project on public.wage_entries (project_id);
create index if not exists idx_wage_entries_status
  on public.wage_entries (status, created_at desc);

alter table public.wage_entries enable row level security;
