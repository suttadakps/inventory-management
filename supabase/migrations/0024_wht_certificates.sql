-- Thai withholding-tax certificate ("หนังสือรับรองการหักภาษี ณ ที่จ่าย" /
-- 50 ทวิ, ภ.ง.ด.3 filing). Only income categories 5/6 get real data entry;
-- categories 1-4 render statically unfilled on the print template.
create table public.wht_certificates (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid references public.projects(id) on delete set null,
  filing_form        text not null default 'pnd3', -- pnd3 | pnd53
  book_no            text,
  doc_no             text,
  payer_tax_id       text,
  payee_tax_id       text,
  payee_name         text not null,
  payee_address      text,
  income_category    text not null default '6', -- '5' | '6'
  income_description text not null,
  payment_date       date not null,
  amount_paid        numeric(14,2) not null,
  tax_withheld       numeric(14,2) not null,
  withholding_type   text not null default '1', -- '1' หัก ณ ที่จ่าย | '2' ออกให้ตลอดไป | '3' ออกให้ครั้งเดียว | '4' อื่นๆ
  withholding_other  text,
  signer_name        text,
  signed_date        date,
  source_type        text, -- 'expense' | 'disbursement' | null
  source_id          uuid,
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_wht_certificates_project on public.wht_certificates (project_id, created_at desc);
alter table public.wht_certificates enable row level security;
