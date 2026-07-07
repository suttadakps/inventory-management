-- =============================================================================
-- ARTIVERGES NEXT — Partner referrals (พาร์ทเนอร์แนะนำงาน)
-- Project leads submitted from the company's public website. Admins track the
-- follow-up status (contact-back) here.
-- =============================================================================

do $$ begin
  create type public.referral_status as enum
    ('new', 'contacted', 'in_progress', 'won', 'lost');
exception when duplicate_object then null; end $$;

create table if not exists public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_name   text not null,
  referrer_contact text,
  project_title   text not null,
  details         text,
  prospect_name   text,
  budget          numeric(14,2),
  source          text not null default 'website',
  status          public.referral_status not null default 'new',
  admin_note      text,
  handled_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_referrals_status
  on public.referrals (status, created_at desc);

alter table public.referrals enable row level security;
