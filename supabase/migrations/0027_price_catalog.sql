-- Reusable standard price list (ราคากลาง) for BOQ line items.
create table public.price_catalog_items (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  unit           text,
  material_cost  numeric(14,2) not null default 0,
  labor_cost     numeric(14,2) not null default 0,
  category       text,
  note           text,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.price_catalog_items enable row level security;
