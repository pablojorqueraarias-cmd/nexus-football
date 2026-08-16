-- =========================================================
-- Nexus Football — v6: datos personales y médicos del jugador
-- (ya protegidos por la RLS existente de players: admin,
--  apoderado o el propio jugador)
-- =========================================================

alter table public.players add column rut text;
alter table public.players add column clothing_size text;
alter table public.players add column blood_type text;
alter table public.players add column allergies text;
alter table public.players add column chronic_conditions text;
