-- =========================================================
-- Nexus Football — v2: evaluación por puntaje, becas, fecha
-- de pago por jugador, cuenta bancaria y partidos jugados
-- =========================================================

-- =========================================================
-- 1. Evaluaciones: de Sí/No a puntaje 1-10 + comentario
-- =========================================================
alter table public.evaluation_items add column score smallint;
alter table public.evaluation_items add column comment text;

update public.evaluation_items set score = case when meets then 8 else 3 end;

alter table public.evaluation_items alter column score set not null;
alter table public.evaluation_items add constraint chk_score_range check (score between 1 and 10);
alter table public.evaluation_items drop column meets;

-- =========================================================
-- 2. Criterios por posición (fases defensiva/ofensiva)
-- =========================================================
insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'general', c.label, c.ord
from public.positions, unnest(array[
  'Biotipo',
  'Atajar',
  'Salidas (aéreas y en profundidad)',
  'Juego con los pies',
  'Distribución (pase corto y largo)',
  'Comunicación y liderazgo',
  'Tiempo y distancia (balones detenidos)'
]) with ordinality as c(label, ord)
where positions.code = 'arquero';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'defensiva', c.label, c.ord
from public.positions, unnest(array[
  'Ubicación (coberturas, cierres, perfiles)',
  'Marcar (perfiles, anticipación, punteo, bloqueo de remates y centro)',
  'Juego aéreo defensivo',
  'Voz de mando - liderazgo, concentración'
]) with ordinality as c(label, ord)
where positions.code = 'defensa_central';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'ofensiva', c.label, c.ord
from public.positions, unnest(array[
  'Control y pase de salida, pase filtrado entre líneas',
  'Pase largo profundidad',
  'Salida jugada bajo presión',
  'Juego aéreo ofensivo (balones detenidos)'
]) with ordinality as c(label, ord)
where positions.code = 'defensa_central';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'defensiva', c.label, c.ord
from public.positions, unnest(array[
  'Marcar (ubicación, anticipo, perfiles)',
  'Cortar pase',
  'Cerrar con perfil correcto, coberturas',
  'Juego aéreo defensivo',
  'Transición ofensiva-defensiva'
]) with ordinality as c(label, ord)
where positions.code = 'lateral';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'ofensiva', c.label, c.ord
from public.positions, unnest(array[
  'Dar amplitud y variantes en ataque',
  'Dominar variantes de centros al área',
  'Dominio de pared y 2vs1',
  'Desdoble',
  'Transición defensiva-ofensiva'
]) with ordinality as c(label, ord)
where positions.code = 'lateral';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'defensiva', c.label, c.ord
from public.positions, unnest(array[
  'Marcar',
  'Ubicación',
  'Presión post pérdida',
  'Ganar primer y segundo balón'
]) with ordinality as c(label, ord)
where positions.code = 'volante';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'ofensiva', c.label, c.ord
from public.positions, unnest(array[
  'Pase corto',
  'Pase en profundidad',
  'Visión de juego',
  'Llegada al área',
  'Movilidad (jugar en relación)'
]) with ordinality as c(label, ord)
where positions.code = 'volante';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'defensiva', c.label, c.ord
from public.positions, unnest(array[
  'Inicio de presión',
  'Cerrar orientar a banda',
  'Coberturas - dominio de la función del lateral'
]) with ordinality as c(label, ord)
where positions.code = 'extremo';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'ofensiva', c.label, c.ord
from public.positions, unnest(array[
  'Conducción, habilidad 1vs1, dominio de pared',
  'Desmarcar',
  'Definición ambos perfiles',
  'Centros al área',
  'Jugar en relación a la lateral'
]) with ordinality as c(label, ord)
where positions.code = 'extremo';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'defensiva', c.label, c.ord
from public.positions, unnest(array[
  'Orientar la presión',
  'Agresividad',
  'Cobertura'
]) with ordinality as c(label, ord)
where positions.code = 'delantero';

insert into public.checklist_criteria (position_id, phase, label, display_order)
select id, 'ofensiva', c.label, c.ord
from public.positions, unnest(array[
  'Definición (ambos perfiles, improvisación)',
  'Movilidad (generar espacios, desmarque)',
  'Juego aéreo (pivote)',
  'Habilidad 1vs1'
]) with ordinality as c(label, ord)
where positions.code = 'delantero';

-- =========================================================
-- 3. Becas y fecha de pago
-- =========================================================
alter table public.players add column is_scholarship boolean not null default false;
alter table public.payments add column due_date date;

-- =========================================================
-- 4. Datos de cuenta bancaria (auto-servicio en Admin → Contenido)
-- =========================================================
alter table public.site_content add column bank_name text;
alter table public.site_content add column bank_account_type text;
alter table public.site_content add column bank_account_number text;
alter table public.site_content add column bank_account_holder text;
alter table public.site_content add column bank_account_rut text;
alter table public.site_content add column bank_transfer_email text;

-- =========================================================
-- 5. Vista de resumen: agrega cantidad de partidos jugados
-- =========================================================
drop view if exists public.player_stats_summary;

create view public.player_stats_summary
with (security_invoker = true) as
select
  p.id as player_id,
  p.full_name,
  coalesce(sum(pms.minutes_played), 0) as total_minutes,
  coalesce(sum(pms.goals), 0) as total_goals,
  coalesce(sum(pms.assists), 0) as total_assists,
  count(distinct pms.match_id) as matches_played,
  (select count(*) filter (where a.present) from public.attendance a where a.player_id = p.id) as sessions_present,
  (select count(*) from public.attendance a where a.player_id = p.id) as sessions_total
from public.players p
left join public.player_match_stats pms on pms.player_id = p.id
group by p.id, p.full_name;
