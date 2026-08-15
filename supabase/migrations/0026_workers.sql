-- Worker roster (รายชื่อช่าง) for reuse when issuing ใบทวิ 50.
create table public.workers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  tax_id      text,
  position    text,
  phone       text,
  address     text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.workers enable row level security;
