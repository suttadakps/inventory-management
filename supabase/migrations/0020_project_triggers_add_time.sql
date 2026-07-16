-- Upgrade project_triggers.trigger_date (date-only) to trigger_at (timestamptz)
-- so reminders can carry a specific time of day, not just a date.
alter table public.project_triggers
  alter column trigger_date type timestamptz using trigger_date::timestamptz;
alter table public.project_triggers
  rename column trigger_date to trigger_at;

drop index if exists idx_project_triggers_project;
drop index if exists idx_project_triggers_due;
create index if not exists idx_project_triggers_project
  on public.project_triggers (project_id, trigger_at);
create index if not exists idx_project_triggers_due
  on public.project_triggers (trigger_at, sent_at);
