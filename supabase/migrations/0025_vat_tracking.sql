-- VAT tracking for ภ.พ.30 monthly filing.
-- Additive columns: opt-in VAT amount per cost/payment line.
alter table public.expenses add column if not exists vat_amount numeric(14,2);
alter table public.payments add column if not exists vat_amount numeric(14,2);

-- Saved monthly filing snapshot (frozen once created, matching how BOQ/WHT
-- documents are saved snapshots rather than always-live reports).
create table public.vat_filings (
  id             uuid primary key default gen_random_uuid(),
  period_year    int not null,
  period_month   int not null, -- 1-12
  payer_tax_id   text,
  sales_total    numeric(14,2) not null,
  sales_vat      numeric(14,2) not null,
  purchase_total numeric(14,2) not null,
  purchase_vat   numeric(14,2) not null,
  overpaid_prior numeric(14,2) not null default 0,
  filed_date     date,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (period_year, period_month)
);
alter table public.vat_filings enable row level security;
