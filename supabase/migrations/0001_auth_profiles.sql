-- =============================================================================
-- ARTIVERGES NEXT — Authentication module schema
-- Roles, profiles, RLS, signup trigger, and privilege guard.
-- References: docs/02_DATABASE.md §5.1, docs/06_PERMISSION_MATRIX.md
-- =============================================================================

-- 1. Role enum -----------------------------------------------------------------
-- Subset of the 10 platform roles per current scope. Extend later with:
--   ALTER TYPE public.user_role ADD VALUE 'foreman'; (etc.)
do $$
begin
  create type public.user_role as enum (
    'owner', 'admin', 'ae', 'site_engineer', 'worker', 'client'
  );
exception
  when duplicate_object then null;
end $$;

-- 2. Profiles (1:1 with auth.users) -------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       public.user_role not null default 'client',
  status     text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile + role for each auth user (docs/02_DATABASE.md §5.1).';

-- 3. updated_at maintenance ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 4. Current user's role (SECURITY DEFINER to avoid RLS recursion) -------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 5. Auto-create a profile for each new auth user ------------------------------
-- full_name / role may be provided via sign-up metadata; role defaults to
-- 'client' and can only be elevated by an owner/admin (see guard below).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'role', '')::public.user_role,
      'client'
    )
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Prevent privilege escalation ---------------------------------------------
-- Users may update their own profile, but only an owner/admin may change the
-- role or status columns (docs: least privilege, separation of duties).
create or replace function public.guard_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role
      or new.status is distinct from old.status)
     and coalesce(public.current_user_role(), 'client') not in ('owner', 'admin')
  then
    raise exception 'Not authorized to change role or status';
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_fields();

-- 7. Row Level Security --------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all
  using (public.current_user_role() in ('owner', 'admin'))
  with check (public.current_user_role() in ('owner', 'admin'));

-- 8. Grants --------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant execute on function public.current_user_role() to authenticated;
