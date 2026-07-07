-- =============================================================================
-- ARTIVERGES NEXT — Custom BOQ payment schedule
-- Store a user-defined payment-milestone schedule (งวดงาน) as JSON on the BOQ.
-- The additional-conditions text (เงื่อนไขเพิ่มเติม) reuses the existing
-- boqs.notes column. Additive only.
--   payment_schedule: [{ "label": "งวดที่ 1", "percent": 30 }, ...]
-- =============================================================================

alter table public.boqs add column if not exists payment_schedule jsonb;
