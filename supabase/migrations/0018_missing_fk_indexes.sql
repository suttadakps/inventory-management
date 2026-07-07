-- =============================================================================
-- ARTIVERGES NEXT — Missing foreign-key indexes (performance)
-- Postgres does not auto-index the referencing side of a foreign key (only
-- the referenced/primary-key side). These 4 FK columns were unindexed, which
-- would slow joins/filters/lookups through them as their tables grow, and
-- can add lock contention on updates/deletes to the referenced row. Purely
-- additive — no schema/relationship changes.
--
-- Index names follow Prisma's default `<table>_<column>_idx` convention (set
-- via @@index([field]) in schema.prisma) so this migration matches what
-- `prisma db push`/`migrate` would produce from the schema.
-- =============================================================================

create index if not exists disbursements_project_id_idx
  on public.disbursements (project_id);

create index if not exists documents_uploaded_by_idx
  on public.documents (uploaded_by);

create index if not exists photos_uploaded_by_idx
  on public.photos (uploaded_by);

create index if not exists quotations_boq_id_idx
  on public.quotations (boq_id);
