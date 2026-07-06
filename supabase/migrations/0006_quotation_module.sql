-- =============================================================================
-- ARTIVERGES NEXT — Quotation module
-- Client-facing quotations generated from an approved BOQ. Builds on 0002
-- (quotations, quotation_items) and 0005 (boqs). References docs/02 §5.3.
-- =============================================================================

-- 1. Workflow states -----------------------------------------------------------
-- Existing quotation_status = draft | sent | approved | rejected | revised.
alter type public.quotation_status add value if not exists 'viewed';
alter type public.quotation_status add value if not exists 'expired';

-- 2. Quotation columns ---------------------------------------------------------
-- Commercial header + terms. `discount` and `tax_amount` are computed amounts;
-- `discount_type`/`discount_value` and `tax_pct` are the inputs.
alter table public.quotations add column if not exists title text;
alter table public.quotations add column if not exists issue_date date;
alter table public.quotations add column if not exists expiry_date date;
alter table public.quotations add column if not exists payment_terms text;
alter table public.quotations add column if not exists warranty text;
alter table public.quotations add column if not exists scope text;
alter table public.quotations add column if not exists excluded_items text;
alter table public.quotations add column if not exists notes text;
alter table public.quotations
  add column if not exists discount_type text not null default 'amount';
alter table public.quotations
  add column if not exists discount_value numeric(14,2) not null default 0;
alter table public.quotations
  add column if not exists tax_amount numeric(14,2) not null default 0;
alter table public.quotations add column if not exists viewed_at timestamptz;
alter table public.quotations add column if not exists rejected_at timestamptz;

do $$
begin
  alter table public.quotations
    add constraint quotations_discount_type_chk
    check (discount_type in ('percent', 'amount'));
exception when duplicate_object then null;
end $$;
