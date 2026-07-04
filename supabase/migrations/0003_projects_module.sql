-- =============================================================================
-- ARTIVERGES NEXT — Projects module additions
-- Adds the two project fields that were not yet columns: site address and a
-- project-level progress percentage. Backward-compatible (additive only).
-- Everything else the module needs already exists:
--   - Project Manager  -> projects.manager_id
--   - Site Engineer    -> project_members (project_role = 'engineer')
--   - Archive          -> projects.deleted_at (soft delete)
-- =============================================================================

alter table public.projects
  add column if not exists address text;

alter table public.projects
  add column if not exists progress_pct numeric(5,2) not null default 0;

-- progress_pct must be a valid percentage.
do $$
begin
  alter table public.projects
    add constraint projects_progress_chk check (progress_pct between 0 and 100);
exception
  when duplicate_object then null;
end $$;
