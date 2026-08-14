-- =========================================================
-- Nexus Football — v5: evaluación con nivel 1-5
-- (1 Iniciación, 2 Formación, 3 Proyección, 4 Competitivo,
--  5 Óptimo) en vez de A destacar / A corregir
-- =========================================================

alter table public.evaluation_items add column level smallint;

update public.evaluation_items set level = case when highlight then 4 else 2 end;

alter table public.evaluation_items alter column level set not null;
alter table public.evaluation_items add constraint chk_level_range check (level between 1 and 5);
alter table public.evaluation_items drop column highlight;
