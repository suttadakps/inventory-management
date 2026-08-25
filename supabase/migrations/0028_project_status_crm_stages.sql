-- CRM-style pre-sale/lost stages, plus a "started" stage marking the
-- transition from planning into active operational work.
alter type public.project_status add value 'quotation' before 'planning';
alter type public.project_status add value 'lost' before 'planning';
alter type public.project_status add value 'started' before 'active';
