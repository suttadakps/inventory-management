-- =============================================================================
-- ARTIVERGES NEXT — BOQ module (core)
-- Hierarchical Bill of Quantities: Project → BOQ → Sections → Categories → Items.
-- Adds the workflow states, the section/category tables, and the rich item
-- schema. Builds on 0002 (boqs, boq_items, materials, suppliers, profiles).
--
-- NOTE: boq_items is redefined here (greenfield — no production data yet) to
-- move items under categories and carry the full cost breakdown.
-- References: docs/02_DATABASE.md §5.3.
-- =============================================================================

-- 1. Workflow states -----------------------------------------------------------
-- Existing boq_status = draft | finalized | superseded. Add the states this
-- module uses. (ADD VALUE is idempotent and safe to re-run.)
alter type public.boq_status add value if not exists 'submitted';
alter type public.boq_status add value if not exists 'approved';
alter type public.boq_status add value if not exists 'archived';

-- 2. BOQ workflow columns ------------------------------------------------------
alter table public.boqs add column if not exists title text;
alter table public.boqs add column if not exists notes text;
alter table public.boqs add column if not exists submitted_at timestamptz;
alter table public.boqs add column if not exists approved_at timestamptz;
alter table public.boqs
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

-- 3. Sections ------------------------------------------------------------------
create table if not exists public.boq_sections (
  id         uuid primary key default gen_random_uuid(),
  boq_id     uuid not null references public.boqs(id) on delete cascade,
  name       text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Categories ----------------------------------------------------------------
create table if not exists public.boq_categories (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.boq_sections(id) on delete cascade,
  name       text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Items (redefined under categories, full cost breakdown) -------------------
drop table if exists public.boq_items cascade;
create table public.boq_items (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references public.boq_categories(id) on delete cascade,
  material_id    uuid references public.materials(id) on delete set null,
  supplier_id    uuid references public.suppliers(id) on delete set null,
  item_code      text,
  description    text not null,
  unit           text,
  quantity       numeric(14,3) not null default 0,
  material_cost  numeric(14,2) not null default 0,  -- per unit
  labor_cost     numeric(14,2) not null default 0,  -- per unit
  equipment_cost numeric(14,2) not null default 0,  -- per unit
  overhead       numeric(14,2) not null default 0,  -- per unit
  selling_price  numeric(14,2) not null default 0,  -- per unit
  notes          text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint boq_items_qty_chk check (quantity >= 0),
  constraint boq_items_costs_chk check (
    material_cost >= 0 and labor_cost >= 0 and equipment_cost >= 0
    and overhead >= 0 and selling_price >= 0
  )
);

-- 6. Indexes -------------------------------------------------------------------
create index if not exists idx_boq_sections_boq on public.boq_sections (boq_id, sort_order);
create index if not exists idx_boq_categories_section on public.boq_categories (section_id, sort_order);
create index if not exists idx_boq_items_category on public.boq_items (category_id, sort_order);
create index if not exists idx_boq_items_material on public.boq_items (material_id);
create index if not exists idx_boq_items_supplier on public.boq_items (supplier_id);

-- 7. updated_at triggers -------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['boq_sections','boq_categories','boq_items']
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- 8. Row Level Security --------------------------------------------------------
-- Coarse staff baseline (fine-grained RBAC is app-enforced; docs/03 §6).
do $$
declare t text;
begin
  foreach t in array array['boq_sections','boq_categories','boq_items']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t || '_staff_all', t);
    execute format(
      'create policy %I on public.%I for all
         using (public.is_staff()) with check (public.is_staff());',
      t || '_staff_all', t);
  end loop;
end $$;

grant select, insert, update, delete
  on public.boq_sections, public.boq_categories, public.boq_items
  to authenticated;
