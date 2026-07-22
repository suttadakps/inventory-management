-- Track task completion separately from LINE delivery status.
alter table public.project_triggers add column if not exists done_at timestamptz;
