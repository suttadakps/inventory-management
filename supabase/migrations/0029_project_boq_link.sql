-- Optional external link to a project's BOQ (e.g. a shared doc/drive link),
-- separate from the structured in-app BOQ builder.
alter table public.projects add column if not exists boq_link text;
