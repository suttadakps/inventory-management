-- AI Estimation Assistant Phase 1: track an uploaded drawing/PDF and its
-- Claude-extracted BOQ line items until the user reviews/edits and commits
-- them into a real BOQ (via the existing BOQ editor/repository functions).
create table public.boq_extractions (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  file_name      text not null,
  storage_path   text not null,
  mime_type      text not null,
  status         text not null default 'pending', -- pending | processing | done | error
  result         jsonb,
  error_message  text,
  boq_id         uuid references public.boqs(id) on delete set null,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);
create index idx_boq_extractions_project on public.boq_extractions (project_id, created_at desc);
alter table public.boq_extractions enable row level security;

-- Private storage bucket for the uploaded source files (drawings/PDFs).
-- No storage RLS policies: the app only touches this bucket server-side via
-- the service-role key, same trust model already used for Postgres (Prisma
-- bypasses RLS; access is enforced in the app's repository/action layer).
insert into storage.buckets (id, name, public)
values ('estimation-uploads', 'estimation-uploads', false)
on conflict (id) do nothing;
