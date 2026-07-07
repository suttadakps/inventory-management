-- =============================================================================
-- ARTIVERGES NEXT — BOQ document header fields
-- Editable Project / Date / Site / Client on the BOQ document. Project reuses
-- the existing title; add Site, Client, and document Date. Additive only.
-- =============================================================================

alter table public.boqs add column if not exists site text;
alter table public.boqs add column if not exists client_name text;
alter table public.boqs add column if not exists doc_date date;
