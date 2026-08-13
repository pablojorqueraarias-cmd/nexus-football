-- =========================================================
-- Nexus Football — v3: fotos y videos
-- (galería general con video/categoría/destacados +
--  fotos y videos privados por jugador)
-- =========================================================

-- =========================================================
-- 1. Galería general: video, categoría y destacados
-- =========================================================
alter table public.gallery_items alter column storage_path drop not null;
alter table public.gallery_items add column media_type text not null default 'photo';
alter table public.gallery_items add column video_url text;
alter table public.gallery_items add column category_id uuid references public.categories(id);
alter table public.gallery_items add column is_featured boolean not null default false;

alter table public.gallery_items
  add constraint chk_gallery_media_type check (media_type in ('photo', 'video'));

alter table public.gallery_items
  add constraint chk_gallery_media_source check (
    (media_type = 'photo' and storage_path is not null) or
    (media_type = 'video' and video_url is not null)
  );

create index on public.gallery_items (category_id);

-- =========================================================
-- 2. Fotos y videos privados por jugador
-- =========================================================
create table public.player_media (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.players(id) on delete cascade,
  media_type    text not null,
  storage_path  text,
  video_url     text,
  caption       text,
  uploaded_by   uuid references public.profiles(id),
  uploaded_at   timestamptz not null default now(),
  constraint chk_player_media_type check (media_type in ('photo', 'video')),
  constraint chk_player_media_source check (
    (media_type = 'photo' and storage_path is not null) or
    (media_type = 'video' and video_url is not null)
  )
);

create index on public.player_media (player_id);

alter table public.player_media enable row level security;

create policy "player_media_select_own_or_admin" on public.player_media
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.players p
      where p.id = player_id and (p.parent_id = auth.uid() or p.user_id = auth.uid())
    )
  );

create policy "player_media_write_admin" on public.player_media
  for all using (public.is_admin()) with check (public.is_admin());
