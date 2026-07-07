-- =============================================================================
-- ARTIVERGES NEXT — Project status timeline + daily notes
-- Two new tables:
--   project_status_history : one row per status change (Timeline สถานะ)
--   project_notes          : text daily-log entries (บันทึกรายวัน)
-- RLS enabled (deny-by-default via PostgREST; the app reads through Prisma,
-- which bypasses RLS and enforces access in the repository layer).
-- =============================================================================

create table if not exists public.project_status_history (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status     public.project_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_project_status_history_project
  on public.project_status_history (project_id, created_at desc);

create table if not exists public.project_notes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  author_name text,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_project_notes_project
  on public.project_notes (project_id, created_at desc);

alter table public.project_status_history enable row level security;
alter table public.project_notes enable row level security;
