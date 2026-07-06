-- =============================================================================
-- ARTIVERGES NEXT — BOQ flat line-item model (single Unit Price)
-- Additive only. Adds a simple, quotation-style flat BOQ alongside the existing
-- hierarchical Section → Category → Item structure:
--   * boqs        : proposer name + VAT/WHT toggles (document-level options)
--   * boq_items   : optional direct link to a BOQ (boq_id), plus a free-text
--                   section label and size; category_id is relaxed to nullable
--                   so a line item can belong directly to a BOQ.
-- Nothing is dropped; existing hierarchical items (category_id set) are untouched.
-- =============================================================================

-- Document-level options on the BOQ ------------------------------------------
alter table public.boqs add column if not exists proposer_name text;
alter table public.boqs
  add column if not exists vat_enabled boolean not null default true;
alter table public.boqs
  add column if not exists wht_enabled boolean not null default true;

-- Flat line items linked directly to a BOQ -----------------------------------
alter table public.boq_items
  add column if not exists boq_id uuid references public.boqs(id) on delete cascade;
alter table public.boq_items add column if not exists section_label text;
alter table public.boq_items add column if not exists size text;

-- Allow a line item to belong directly to a BOQ (no category).
alter table public.boq_items alter column category_id drop not null;

create index if not exists idx_boq_items_boq
  on public.boq_items (boq_id, sort_order);
