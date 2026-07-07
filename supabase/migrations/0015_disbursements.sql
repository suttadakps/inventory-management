-- =============================================================================
-- ARTIVERGES NEXT — Disbursements (เบิกเงิน)
-- Cash-advance / disbursement requests from contractors/workers with an
-- approval workflow: pending → approved → paid (or rejected).
-- =============================================================================

do $$ begin
  create type public.disbursement_status as enum
    ('pending', 'approved', 'paid', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.disbursements (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid references public.projects(id) on delete set null,
  requester_name text not null,
  requested_by   uuid references public.profiles(id) on delete set null,
  amount         numeric(14,2) not null,
  reason         text,
  needed_date    date,
  status         public.disbursement_status not null default 'pending',
  approved_by    uuid references public.profiles(id) on delete set null,
  approved_at    timestamptz,
  paid_at        timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint disbursements_amount_chk check (amount > 0)
);

create index if not exists idx_disbursements_status
  on public.disbursements (status, created_at desc);
create index if not exists idx_disbursements_requested_by
  on public.disbursements (requested_by);

alter table public.disbursements enable row level security;
