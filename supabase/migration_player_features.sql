-- =========================================================
-- Nexus Football — perfiles de jugador: asistencia, minutaje,
-- documentos y evaluación por posición
-- =========================================================

-- =========================================================
-- 1. Rol jugador (login propio, separado del apoderado)
-- =========================================================
alter type user_role add value 'player';

-- =========================================================
-- 2. Login y posición del jugador
-- =========================================================
alter table public.players add column user_id uuid references auth.users(id) on delete set null;
create unique index players_user_id_key on public.players(user_id) where user_id is not null;

-- =========================================================
-- 3. Posiciones
-- =========================================================
create table public.positions (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,
  has_phases    boolean not null default true,
  display_order int not null default 0
);

alter table public.players add column position_id uuid references public.positions(id);

insert into public.positions (code, name, has_phases, display_order) values
  ('arquero', 'Arquero/a', false, 1),
  ('defensa_central', 'Defensa Central', true, 2),
  ('lateral', 'Lateral', true, 3),
  ('volante', 'Volante', true, 4),
  ('extremo', 'Extremo', true, 5),
  ('delantero', 'Delantero/a', true, 6);

-- =========================================================
-- 4. Checklist de criterios (configurable por Admin)
-- =========================================================
create type criterion_phase as enum ('general','defensiva','ofensiva');

create table public.checklist_criteria (
  id             uuid primary key default gen_random_uuid(),
  position_id    uuid references public.positions(id) on delete cascade,
  phase          criterion_phase not null default 'general',
  label          text not null,
  description    text,
  display_order  int not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table public.checklist_criteria
  add constraint chk_general_phase
  check (position_id is not null or phase = 'general');

-- Criterios generales (aplican a cualquier jugador, sin importar posición)
insert into public.checklist_criteria (position_id, phase, label, display_order) values
  (null, 'general', 'Calidad técnica individual', 1),
  (null, 'general', 'Toma de decisiones', 2),
  (null, 'general', 'Intensidad en la transición', 3),
  (null, 'general', 'Condición física', 4),
  (null, 'general', 'Personalidad y competitividad', 5),
  (null, 'general', 'Mirar antes de recibir', 6),
  (null, 'general', 'Contacto bajo presión', 7),
  (null, 'general', 'Velocidad de decisión', 8),
  (null, 'general', 'Lenguaje corporal', 9);

-- =========================================================
-- 5. Evaluaciones
-- =========================================================
create table public.evaluations (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.players(id) on delete cascade,
  evaluated_by  uuid not null references public.profiles(id),
  strengths     text,
  weaknesses    text,
  conclusion    text,
  match_context text,
  created_at    timestamptz not null default now()
);

create table public.evaluation_items (
  id              uuid primary key default gen_random_uuid(),
  evaluation_id   uuid not null references public.evaluations(id) on delete cascade,
  criterion_id    uuid not null references public.checklist_criteria(id),
  meets           boolean,
  unique (evaluation_id, criterion_id)
);

-- =========================================================
-- 6. Asistencia
-- =========================================================
create table public.attendance (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.players(id) on delete cascade,
  session_date  date not null,
  present       boolean not null default false,
  notes         text,
  recorded_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  unique (player_id, session_date)
);

-- =========================================================
-- 7. Partidos y minutaje/goles/asistencias
-- =========================================================
create table public.matches (
  id            uuid primary key default gen_random_uuid(),
  match_date    date not null,
  opponent      text,
  category_id   uuid references public.categories(id),
  notes         text,
  created_at    timestamptz not null default now()
);

create table public.player_match_stats (
  id              uuid primary key default gen_random_uuid(),
  match_id        uuid not null references public.matches(id) on delete cascade,
  player_id       uuid not null references public.players(id) on delete cascade,
  minutes_played  int not null default 0,
  goals           int not null default 0,
  assists         int not null default 0,
  unique (match_id, player_id)
);

-- =========================================================
-- 8. Documentos por jugador (bucket privado)
-- =========================================================
create table public.player_documents (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.players(id) on delete cascade,
  storage_path  text not null,
  file_name     text not null,
  category      text,
  uploaded_by   uuid references public.profiles(id),
  uploaded_at   timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_bucket_admin_all" on storage.objects
  for all using (bucket_id = 'documents' and public.is_admin())
  with check (bucket_id = 'documents' and public.is_admin());

-- =========================================================
-- 9. Índices
-- =========================================================
create index on public.checklist_criteria (position_id, phase);
create index on public.evaluations (player_id);
create index on public.evaluations (evaluated_by);
create index on public.evaluation_items (evaluation_id);
create index on public.attendance (player_id);
create index on public.attendance (session_date);
create index on public.player_match_stats (match_id);
create index on public.player_match_stats (player_id);
create index on public.player_documents (player_id);

-- =========================================================
-- 10. Row Level Security
-- =========================================================
alter table public.positions enable row level security;
alter table public.checklist_criteria enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_items enable row level security;
alter table public.attendance enable row level security;
alter table public.matches enable row level security;
alter table public.player_match_stats enable row level security;
alter table public.player_documents enable row level security;

-- Reemplaza la política de players: ahora también el propio jugador (login
-- propio) puede ver su ficha, además del apoderado y el admin.
drop policy if exists "players_select_own_or_admin" on public.players;
create policy "players_select_own_or_admin" on public.players
  for select using (
    parent_id = auth.uid() or user_id = auth.uid() or public.is_admin()
  );

-- positions: lectura para cualquier autenticado, escritura admin
create policy "positions_select_authenticated" on public.positions
  for select to authenticated using (true);

create policy "positions_write_admin" on public.positions
  for all using (public.is_admin()) with check (public.is_admin());

-- checklist_criteria: lectura para cualquier autenticado, escritura admin
create policy "criteria_select_authenticated" on public.checklist_criteria
  for select to authenticated using (true);

create policy "criteria_write_admin" on public.checklist_criteria
  for all using (public.is_admin()) with check (public.is_admin());

-- evaluations: el admin ve todo; el apoderado o el propio jugador ven las
-- evaluaciones de su jugador. Solo el admin escribe.
create policy "evaluations_select_own_or_admin" on public.evaluations
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.players p
      where p.id = player_id and (p.parent_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "evaluations_write_admin" on public.evaluations
  for all using (public.is_admin()) with check (public.is_admin());

-- evaluation_items: mismo criterio de acceso, a través de la evaluación
create policy "eval_items_select_own_or_admin" on public.evaluation_items
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.evaluations e
      join public.players p on p.id = e.player_id
      where e.id = evaluation_id and (p.parent_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "eval_items_write_admin" on public.evaluation_items
  for all using (public.is_admin()) with check (public.is_admin());

-- attendance: apoderado/jugador ven lo propio; solo admin escribe
create policy "attendance_select_own_or_admin" on public.attendance
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.players p
      where p.id = player_id and (p.parent_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "attendance_write_admin" on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

-- matches: lectura para cualquier autenticado (no expone datos personales), escritura admin
create policy "matches_select_authenticated" on public.matches
  for select to authenticated using (true);

create policy "matches_write_admin" on public.matches
  for all using (public.is_admin()) with check (public.is_admin());

-- player_match_stats: apoderado/jugador ven lo propio; solo admin escribe
create policy "match_stats_select_own_or_admin" on public.player_match_stats
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.players p
      where p.id = player_id and (p.parent_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "match_stats_write_admin" on public.player_match_stats
  for all using (public.is_admin()) with check (public.is_admin());

-- player_documents: apoderado/jugador ven lo propio (para listar); solo admin escribe.
-- La descarga real del archivo va por signed URL generada en servidor, no por
-- acceso directo al bucket.
create policy "documents_select_own_or_admin" on public.player_documents
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.players p
      where p.id = player_id and (p.parent_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "documents_write_admin" on public.player_documents
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- 11. Vista de resumen por jugador (asistencia %, minutos, goles, asistencias)
-- =========================================================
create view public.player_stats_summary
with (security_invoker = true) as
select
  p.id as player_id,
  p.full_name,
  coalesce(sum(pms.minutes_played), 0) as total_minutes,
  coalesce(sum(pms.goals), 0) as total_goals,
  coalesce(sum(pms.assists), 0) as total_assists,
  (select count(*) filter (where a.present) from public.attendance a where a.player_id = p.id) as sessions_present,
  (select count(*) from public.attendance a where a.player_id = p.id) as sessions_total
from public.players p
left join public.player_match_stats pms on pms.player_id = p.id
group by p.id, p.full_name;
