-- Allow project_status_history.status to hold arbitrary free-text labels for
-- manually-added timeline entries, not just the fixed project_status enum.
-- Project.status (the live project status) is untouched and stays enum-typed.
alter table public.project_status_history
  alter column status type text using status::text;
