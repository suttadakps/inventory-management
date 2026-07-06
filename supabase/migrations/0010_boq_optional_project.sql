-- =============================================================================
-- ARTIVERGES NEXT — Standalone BOQ (project optional)
-- Allow a BOQ to exist without a project so a quotation-style BOQ can be created
-- directly (the project name is typed into the document). Additive/relaxing only.
-- =============================================================================

alter table public.boqs alter column project_id drop not null;
