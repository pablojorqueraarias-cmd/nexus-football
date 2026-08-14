-- =========================================================
-- Nexus Football — v4: evaluación vuelve a "A destacar / A
-- corregir" en vez de nota 1-10 (se conserva el comentario)
-- =========================================================

alter table public.evaluation_items add column highlight boolean;

update public.evaluation_items set highlight = (score >= 6);

alter table public.evaluation_items alter column highlight set not null;
alter table public.evaluation_items drop constraint chk_score_range;
alter table public.evaluation_items drop column score;
