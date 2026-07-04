-- =============================================================================
-- ARTIVERGES NEXT — Core application schema
-- Clients, Projects, ProjectMembers, BOQ (+items), Quotation (+items),
-- Expenses (+items), Payments, Payroll, Suppliers, Materials,
-- PurchaseOrders (+items), Tasks, Documents, Photos, Notifications.
--
-- Builds on 0001_auth_profiles.sql (profiles table, user_role enum,
-- public.set_updated_at(), public.current_user_role()).
-- Conventions: docs/02_DATABASE.md §2/§5/§6/§7/§8/§9.
-- Deploy: this SQL is the source of truth; prisma/schema.prisma mirrors it.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enums (docs/02_DATABASE.md §6). user_role already exists (0001).
-- ---------------------------------------------------------------------------
do $$ begin create type public.project_status as enum
  ('planning','active','on_hold','completed','warranty','closed');
exception when duplicate_object then null; end $$;

do $$ begin create type public.project_member_role as enum
  ('manager','engineer','worker','member','viewer');
exception when duplicate_object then null; end $$;

do $$ begin create type public.boq_status as enum
  ('draft','finalized','superseded');
exception when duplicate_object then null; end $$;

do $$ begin create type public.quotation_status as enum
  ('draft','sent','approved','rejected','revised');
exception when duplicate_object then null; end $$;

do $$ begin create type public.approval_status as enum
  ('draft','pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin create type public.po_status as enum
  ('draft','approved','sent','partially_received','received','closed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin create type public.task_status as enum
  ('todo','in_progress','blocked','done');
exception when duplicate_object then null; end $$;

do $$ begin create type public.payment_direction as enum ('incoming','outgoing');
exception when duplicate_object then null; end $$;

do $$ begin create type public.payment_method as enum
  ('cash','bank_transfer','cheque','card','upi','other');
exception when duplicate_object then null; end $$;

do $$ begin create type public.payroll_status as enum ('draft','approved','paid');
exception when duplicate_object then null; end $$;

do $$ begin create type public.document_visibility as enum
  ('internal','client','partner');
exception when duplicate_object then null; end $$;

do $$ begin create type public.photo_phase as enum ('before','during','after');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- Clients -------------------------------------------------------------------
create table if not exists public.clients (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null default 'individual',
  primary_email   text,
  primary_phone   text,
  billing_address text,
  portal_user_id  uuid references public.profiles(id) on delete set null,
  created_by      uuid references public.profiles(id) on delete set null,
  updated_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- Projects ------------------------------------------------------------------
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  name           text not null,
  client_id      uuid not null references public.clients(id) on delete restrict,
  manager_id     uuid references public.profiles(id) on delete set null,
  status         public.project_status not null default 'planning',
  start_date     date,
  end_date       date,
  contract_value numeric(14,2),
  budget_cost    numeric(14,2),
  actual_cost    numeric(14,2) not null default 0,
  created_by     uuid references public.profiles(id) on delete set null,
  updated_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  constraint projects_dates_chk check (end_date is null or start_date is null or end_date >= start_date),
  constraint projects_actual_cost_chk check (actual_cost >= 0)
);

-- Project members -----------------------------------------------------------
create table if not exists public.project_members (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  project_role public.project_member_role not null default 'member',
  created_at   timestamptz not null default now(),
  constraint project_members_unique unique (project_id, user_id)
);

-- BOQ -----------------------------------------------------------------------
create table if not exists public.boqs (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  version     integer not null default 1,
  status      public.boq_status not null default 'draft',
  total_cost  numeric(14,2) not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  updated_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  constraint boqs_version_chk check (version >= 1),
  constraint boqs_project_version_unique unique (project_id, version)
);

create table if not exists public.boq_items (
  id            uuid primary key default gen_random_uuid(),
  boq_id        uuid not null references public.boqs(id) on delete cascade,
  material_id   uuid,
  section       text,
  description   text not null,
  unit          text,
  quantity      numeric(14,3) not null default 0,
  material_rate numeric(14,2) not null default 0,
  labor_rate    numeric(14,2) not null default 0,
  line_cost     numeric(14,2) not null default 0,
  sort_order    integer not null default 0,
  constraint boq_items_qty_chk check (quantity >= 0)
);

-- Quotation -----------------------------------------------------------------
create table if not exists public.quotations (
  id           uuid primary key default gen_random_uuid(),
  quotation_no text not null unique,
  boq_id       uuid references public.boqs(id) on delete set null,
  project_id   uuid not null references public.projects(id) on delete cascade,
  client_id    uuid not null references public.clients(id) on delete restrict,
  version      integer not null default 1,
  margin_pct   numeric(6,2) not null default 0,
  discount     numeric(14,2) not null default 0,
  tax_pct      numeric(6,2) not null default 0,
  subtotal     numeric(14,2) not null default 0,
  total        numeric(14,2) not null default 0,
  status       public.quotation_status not null default 'draft',
  sent_at      timestamptz,
  approved_at  timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  updated_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  constraint quotations_total_chk check (total >= 0)
);

create table if not exists public.quotation_items (
  id            uuid primary key default gen_random_uuid(),
  quotation_id  uuid not null references public.quotations(id) on delete cascade,
  description   text not null,
  unit          text,
  quantity      numeric(14,3) not null default 0,
  unit_price    numeric(14,2) not null default 0,
  line_total    numeric(14,2) not null default 0,
  sort_order    integer not null default 0,
  constraint quotation_items_qty_chk check (quantity >= 0)
);

-- Suppliers -----------------------------------------------------------------
create table if not exists public.suppliers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_name  text,
  email         text,
  phone         text,
  payment_terms text,
  rating        integer,
  created_by    uuid references public.profiles(id) on delete set null,
  updated_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  constraint suppliers_rating_chk check (rating is null or rating between 1 and 5)
);

-- Materials -----------------------------------------------------------------
create table if not exists public.materials (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  sku           text unique,
  unit          text not null,
  category      text,
  unit_cost     numeric(14,2) not null default 0,
  on_hand_qty   numeric(14,3) not null default 0,
  reorder_level numeric(14,3) not null default 0,
  supplier_id   uuid references public.suppliers(id) on delete set null,
  created_by    uuid references public.profiles(id) on delete set null,
  updated_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  constraint materials_cost_chk check (unit_cost >= 0)
);

-- FK from boq_items.material_id -> materials (added now that materials exists)
alter table public.boq_items
  drop constraint if exists boq_items_material_id_fkey;
alter table public.boq_items
  add constraint boq_items_material_id_fkey
  foreign key (material_id) references public.materials(id) on delete set null;

-- Purchase orders -----------------------------------------------------------
create table if not exists public.purchase_orders (
  id            uuid primary key default gen_random_uuid(),
  po_no         text not null unique,
  supplier_id   uuid not null references public.suppliers(id) on delete restrict,
  project_id    uuid references public.projects(id) on delete set null,
  status        public.po_status not null default 'draft',
  total         numeric(14,2) not null default 0,
  expected_date date,
  ordered_at    timestamptz,
  created_by    uuid references public.profiles(id) on delete set null,
  updated_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  constraint purchase_orders_total_chk check (total >= 0)
);

create table if not exists public.purchase_order_items (
  id                uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  material_id       uuid references public.materials(id) on delete set null,
  description       text not null,
  unit              text,
  quantity          numeric(14,3) not null default 0,
  unit_price        numeric(14,2) not null default 0,
  line_total        numeric(14,2) not null default 0,
  received_qty      numeric(14,3) not null default 0,
  sort_order        integer not null default 0,
  constraint po_items_qty_chk check (quantity >= 0 and received_qty >= 0)
);

-- Expenses ------------------------------------------------------------------
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references public.projects(id) on delete set null,
  spent_by     uuid references public.profiles(id) on delete set null,
  category     text not null,
  description  text,
  amount       numeric(14,2) not null default 0,
  status       public.approval_status not null default 'draft',
  is_billable  boolean not null default true,
  receipt_url  text,
  incurred_at  timestamptz not null default now(),
  approved_at  timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  updated_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  constraint expenses_amount_chk check (amount >= 0)
);

create table if not exists public.expense_items (
  id           uuid primary key default gen_random_uuid(),
  expense_id   uuid not null references public.expenses(id) on delete cascade,
  description  text not null,
  quantity     numeric(14,3) not null default 1,
  unit_price   numeric(14,2) not null default 0,
  line_total   numeric(14,2) not null default 0,
  sort_order   integer not null default 0,
  constraint expense_items_qty_chk check (quantity >= 0)
);

-- Payments ------------------------------------------------------------------
create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  direction         public.payment_direction not null,
  party_type        text not null,
  client_id         uuid references public.clients(id) on delete set null,
  supplier_id       uuid references public.suppliers(id) on delete set null,
  purchase_order_id uuid references public.purchase_orders(id) on delete set null,
  project_id        uuid references public.projects(id) on delete set null,
  amount            numeric(14,2) not null,
  method            public.payment_method,
  reference         text,
  note              text,
  paid_at           timestamptz not null default now(),
  created_by        uuid references public.profiles(id) on delete set null,
  updated_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint payments_amount_chk check (amount >= 0)
);

-- Payroll -------------------------------------------------------------------
create table if not exists public.payroll (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete restrict,
  project_id   uuid references public.projects(id) on delete set null,
  period_start date not null,
  period_end   date not null,
  days_worked  numeric(6,2) not null default 0,
  gross        numeric(14,2) not null default 0,
  allowances   numeric(14,2) not null default 0,
  deductions   numeric(14,2) not null default 0,
  net          numeric(14,2) not null default 0,
  status       public.payroll_status not null default 'draft',
  paid_at      timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  updated_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint payroll_period_chk check (period_end >= period_start),
  constraint payroll_amounts_chk check (gross >= 0 and net >= 0),
  constraint payroll_unique unique (user_id, period_start, period_end)
);

-- Tasks ---------------------------------------------------------------------
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  parent_task_id uuid references public.tasks(id) on delete set null,
  assignee_id    uuid references public.profiles(id) on delete set null,
  name           text not null,
  description    text,
  status         public.task_status not null default 'todo',
  progress_pct   numeric(5,2) not null default 0,
  planned_start  date,
  planned_end    date,
  sort_order     integer not null default 0,
  created_by     uuid references public.profiles(id) on delete set null,
  updated_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  constraint tasks_progress_chk check (progress_pct between 0 and 100),
  constraint tasks_dates_chk check (planned_end is null or planned_start is null or planned_end >= planned_start)
);

-- Documents -----------------------------------------------------------------
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references public.projects(id) on delete cascade,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  category     text not null,
  title        text not null,
  file_url     text not null,
  file_name    text,
  mime_type    text,
  size_bytes   bigint,
  version      integer not null default 1,
  visibility   public.document_visibility not null default 'internal',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- Photos --------------------------------------------------------------------
create table if not exists public.photos (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  task_id      uuid references public.tasks(id) on delete set null,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  file_url     text not null,
  caption      text,
  phase        public.photo_phase,
  taken_at     timestamptz,
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

-- Notifications -------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  entity_type text,
  entity_id   uuid,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Indexes (docs/02_DATABASE.md §7) — FKs, status filters, time-series,
--    and partial indexes on active (non-deleted) rows.
-- ---------------------------------------------------------------------------
create index if not exists idx_clients_name on public.clients (name);
create index if not exists idx_clients_portal_user on public.clients (portal_user_id);

create index if not exists idx_projects_client on public.projects (client_id);
create index if not exists idx_projects_manager on public.projects (manager_id);
create index if not exists idx_projects_status on public.projects (status, client_id);
create index if not exists idx_projects_active on public.projects (id) where deleted_at is null;

create index if not exists idx_project_members_user on public.project_members (user_id);

create index if not exists idx_boqs_project on public.boqs (project_id);
create index if not exists idx_boqs_status on public.boqs (status);
create index if not exists idx_boq_items_boq on public.boq_items (boq_id);
create index if not exists idx_boq_items_material on public.boq_items (material_id);

create index if not exists idx_quotations_project on public.quotations (project_id);
create index if not exists idx_quotations_client on public.quotations (client_id);
create index if not exists idx_quotations_status on public.quotations (status);
create index if not exists idx_quotation_items_quotation on public.quotation_items (quotation_id);

create index if not exists idx_suppliers_name on public.suppliers (name);

create index if not exists idx_materials_name on public.materials (name);
create index if not exists idx_materials_supplier on public.materials (supplier_id);

create index if not exists idx_po_supplier on public.purchase_orders (supplier_id);
create index if not exists idx_po_project on public.purchase_orders (project_id);
create index if not exists idx_po_status on public.purchase_orders (status);
create index if not exists idx_po_items_po on public.purchase_order_items (purchase_order_id);
create index if not exists idx_po_items_material on public.purchase_order_items (material_id);

create index if not exists idx_expenses_project on public.expenses (project_id);
create index if not exists idx_expenses_spent_by on public.expenses (spent_by);
create index if not exists idx_expenses_status on public.expenses (status);
create index if not exists idx_expense_items_expense on public.expense_items (expense_id);

create index if not exists idx_payments_client on public.payments (client_id);
create index if not exists idx_payments_supplier on public.payments (supplier_id);
create index if not exists idx_payments_po on public.payments (purchase_order_id);
create index if not exists idx_payments_project on public.payments (project_id);
create index if not exists idx_payments_paid_at on public.payments (paid_at);

create index if not exists idx_payroll_user on public.payroll (user_id);
create index if not exists idx_payroll_project on public.payroll (project_id);
create index if not exists idx_payroll_status on public.payroll (status);

create index if not exists idx_tasks_project on public.tasks (project_id);
create index if not exists idx_tasks_assignee on public.tasks (assignee_id);
create index if not exists idx_tasks_parent on public.tasks (parent_task_id);
create index if not exists idx_tasks_status on public.tasks (status);

create index if not exists idx_documents_project on public.documents (project_id);
create index if not exists idx_documents_visibility on public.documents (visibility);

create index if not exists idx_photos_project on public.photos (project_id);
create index if not exists idx_photos_task on public.photos (task_id);

create index if not exists idx_notifications_user_unread on public.notifications (user_id, is_read);

-- ---------------------------------------------------------------------------
-- 4. updated_at triggers (reuse public.set_updated_at from 0001)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'clients','projects','boqs','quotations','suppliers','materials',
    'purchase_orders','expenses','payments','payroll','tasks','documents'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security (docs/03 §6, docs/06). RLS is a coarse safety net;
--    fine-grained RBAC is enforced at the application/API layer.
-- ---------------------------------------------------------------------------

-- Internal staff check (external Client/Partner roles excluded).
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    public.current_user_role() in ('owner','admin','ae','site_engineer','worker'),
    false
  );
$$;

-- The client account linked to the current portal user (if any).
create or replace function public.current_user_client_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.clients where portal_user_id = auth.uid() limit 1;
$$;

grant execute on function public.is_staff() to authenticated;
grant execute on function public.current_user_client_id() to authenticated;

-- Enable RLS + a staff-scoped baseline policy on every table.
do $$
declare t text;
begin
  foreach t in array array[
    'clients','projects','project_members','boqs','boq_items','quotations',
    'quotation_items','suppliers','materials','purchase_orders',
    'purchase_order_items','expenses','expense_items','payments','payroll',
    'tasks','documents','photos','notifications'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t || '_staff_all', t);
    execute format(
      'create policy %I on public.%I for all
         using (public.is_staff()) with check (public.is_staff());',
      t || '_staff_all', t);
  end loop;
end $$;

-- Notifications are always self-scoped (each user sees only their own).
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Client portal read access (scoped to the signed-in client's projects).
drop policy if exists projects_client_read on public.projects;
create policy projects_client_read on public.projects
  for select using (client_id = public.current_user_client_id());

drop policy if exists quotations_client_read on public.quotations;
create policy quotations_client_read on public.quotations
  for select using (
    client_id = public.current_user_client_id()
    and status in ('sent','approved','rejected','revised')
  );

drop policy if exists documents_client_read on public.documents;
create policy documents_client_read on public.documents
  for select using (
    visibility = 'client'
    and project_id in (
      select id from public.projects where client_id = public.current_user_client_id()
    )
  );

drop policy if exists photos_client_read on public.photos;
create policy photos_client_read on public.photos
  for select using (
    project_id in (
      select id from public.projects where client_id = public.current_user_client_id()
    )
  );

drop policy if exists payments_client_read on public.payments;
create policy payments_client_read on public.payments
  for select using (client_id = public.current_user_client_id());

-- ---------------------------------------------------------------------------
-- 6. Grants — table privileges for the authenticated role. RLS still governs
--    row visibility; anon has no policies and is therefore denied.
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on all tables in schema public to authenticated;
