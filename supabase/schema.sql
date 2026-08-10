-- =========================================================
-- Nexus Football — esquema de base de datos
-- =========================================================

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. Roles y perfiles de usuario
-- =========================================================
create type user_role as enum ('admin', 'parent');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        user_role not null default 'parent',
  phone       text,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- 2. Categorías
-- =========================================================
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  age_range     text,
  description   text,
  display_order int not null default 0
);

insert into public.categories (name, age_range, description, display_order) values
  ('Iniciación', '4 a 7 años', 'Primer contacto con el fútbol: motricidad, coordinación y el gusto por el juego.', 1),
  ('Formación', '8 a 12 años', 'Desarrollo técnico-táctico individual y trabajo en equipo.', 2),
  ('Proyección', '13 a 17 años', 'Preparación de alto rendimiento orientada a la competencia y la proyección a clubes.', 3);

-- =========================================================
-- 3. Horarios (por categoría)
-- =========================================================
create table public.schedules (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories(id) on delete cascade,
  day_of_week   text not null check (day_of_week in ('lunes','martes','miercoles','jueves','viernes','sabado','domingo')),
  start_time    time not null,
  end_time      time not null,
  location      text not null,
  display_order int not null default 0
);

create index on public.schedules (category_id);

-- =========================================================
-- 4. Alumnos
-- =========================================================
create type player_status as enum ('activo', 'inactivo');

create table public.players (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  birth_date    date,
  category_id   uuid references public.categories(id),
  parent_id     uuid references public.profiles(id) on delete set null,
  status        player_status not null default 'activo',
  notes         text,
  photo_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.players (category_id);
create index on public.players (parent_id);
create index on public.players (status);

-- =========================================================
-- 5. Inscripciones (formulario público)
-- =========================================================
create type inscription_status as enum ('pendiente', 'aprobada', 'rechazada');

create table public.inscriptions (
  id                    uuid primary key default gen_random_uuid(),
  child_full_name       text not null,
  birth_date            date,
  desired_category_id   uuid references public.categories(id),
  parent_full_name      text not null,
  parent_email          text not null,
  parent_phone          text,
  message               text,
  status                inscription_status not null default 'pendiente',
  reviewed_by           uuid references public.profiles(id),
  created_player_id     uuid references public.players(id),
  created_at            timestamptz not null default now()
);

create index on public.inscriptions (status);

-- =========================================================
-- 6. Pagos (registro manual: transferencia/efectivo)
-- =========================================================
create type payment_method as enum ('transferencia', 'efectivo');
create type payment_status as enum ('pendiente', 'pagado');

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.players(id) on delete cascade,
  period        text not null, -- ej. '2026-08'
  amount        numeric not null,
  method        payment_method not null default 'transferencia',
  status        payment_status not null default 'pendiente',
  registered_by uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

create index on public.payments (player_id);
create index on public.payments (status);

-- =========================================================
-- 7. Mensajes de contacto (formulario público)
-- =========================================================
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- 8. Galería
-- =========================================================
create table public.gallery_items (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,
  caption       text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

-- =========================================================
-- 9. updated_at automático
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

-- =========================================================
-- 10. Perfil automático al registrar usuario
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'parent');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- 11. Row Level Security
-- =========================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.schedules enable row level security;
alter table public.players enable row level security;
alter table public.inscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.gallery_items enable row level security;

-- profiles
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- categories: públicas para lectura (usadas en el sitio público)
create policy "categories_select_public" on public.categories
  for select to anon, authenticated using (true);

create policy "categories_write_admin" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- schedules: públicas para lectura
create policy "schedules_select_public" on public.schedules
  for select to anon, authenticated using (true);

create policy "schedules_write_admin" on public.schedules
  for all using (public.is_admin()) with check (public.is_admin());

-- players: el apoderado ve solo a sus hijos; admin ve todo
create policy "players_select_own_or_admin" on public.players
  for select using (parent_id = auth.uid() or public.is_admin());

create policy "players_write_admin" on public.players
  for all using (public.is_admin()) with check (public.is_admin());

-- inscriptions: cualquiera (incluso anónimo) puede insertar; solo admin lee/edita
create policy "inscriptions_insert_public" on public.inscriptions
  for insert to anon, authenticated with check (true);

create policy "inscriptions_select_admin" on public.inscriptions
  for select using (public.is_admin());

create policy "inscriptions_update_admin" on public.inscriptions
  for update using (public.is_admin());

-- payments: el apoderado ve los pagos de sus hijos (solo lectura); admin todo
create policy "payments_select_own_or_admin" on public.payments
  for select using (
    public.is_admin() or
    exists (select 1 from public.players p where p.id = player_id and p.parent_id = auth.uid())
  );

create policy "payments_write_admin" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- contact_messages: cualquiera inserta; solo admin lee
create policy "contact_insert_public" on public.contact_messages
  for insert to anon, authenticated with check (true);

create policy "contact_select_admin" on public.contact_messages
  for select using (public.is_admin());

create policy "contact_update_admin" on public.contact_messages
  for update using (public.is_admin());

-- gallery_items: lectura pública, escritura admin
create policy "gallery_select_public" on public.gallery_items
  for select to anon, authenticated using (true);

create policy "gallery_write_admin" on public.gallery_items
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- 12. Storage: bucket de galería
-- =========================================================
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery_bucket_select_public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'gallery');

create policy "gallery_bucket_write_admin" on storage.objects
  for all using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());
