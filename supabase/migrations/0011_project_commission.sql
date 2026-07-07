-- =============================================================================
-- ARTIVERGES NEXT — Project sales commission
-- Adds a per-project commission rate (percent) used by the AE "โปรเจคของฉัน"
-- view. Additive only; defaults to 0 so existing rows are unaffected.
-- =============================================================================

alter table public.projects
  add column if not exists commission_rate numeric(6,3) not null default 0;

do $$ begin
  alter table public.projects
    add constraint projects_commission_rate_chk
    check (commission_rate >= 0 and commission_rate <= 100);
exception when duplicate_object then null; end $$;
