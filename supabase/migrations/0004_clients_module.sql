-- =============================================================================
-- ARTIVERGES NEXT — Clients module additions
-- Adds the client fields not yet present as columns: contact person, tax id,
-- and free-text notes. Backward-compatible (additive only).
-- Existing columns cover the rest:
--   Company Name -> name · Phone -> primary_phone · Email -> primary_email
--   Address -> billing_address · Archive -> deleted_at (soft delete)
-- =============================================================================

alter table public.clients
  add column if not exists contact_person text;

alter table public.clients
  add column if not exists tax_id text;

alter table public.clients
  add column if not exists notes text;
