-- =============================================================================
-- ARTIVERGES NEXT — Per-project LINE trigger reminders
--   project_triggers : user-entered message + target date, pushed to a shared
--                       LINE group via a Vercel Cron job once the date arrives
-- RLS enabled (deny-by-default via PostgREST; the app reads through Prisma,
-- which bypasses RLS and enforces access in the repository layer).
-- =============================================================================

create table if not exists public.project_triggers (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  message      text not null,
  trigger_date date not null,
  sent_at      timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_project_triggers_project
  on public.project_triggers (project_id, trigger_date);
create index if not exists idx_project_triggers_due
  on public.project_triggers (trigger_date, sent_at);

alter table public.project_triggers enable row level security;
