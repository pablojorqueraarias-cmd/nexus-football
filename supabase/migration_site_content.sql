-- Contenido editable del sitio (textos del inicio, footer, etc.)
-- Fila única (id siempre 1).

create table public.site_content (
  id                  int primary key default 1,
  hero_eyebrow        text not null default 'Academia de fútbol · Chile',
  hero_description    text not null default 'Formamos jugadoras y jugadores con pasión, jerarquía y actitud — desde el primer contacto con la pelota hasta la proyección a clubes.',
  cta_description     text not null default '¿Quieres que tu hijo o hija forme parte de Nexus Football? Completa la inscripción y te contactaremos para confirmar el cupo.',
  footer_description  text not null default 'Academia de fútbol formativo en Chile, con categorías desde Iniciación hasta Proyección.',
  location            text not null default 'Chile',
  constraint site_content_singleton check (id = 1)
);

insert into public.site_content (id) values (1);

alter table public.site_content enable row level security;

create policy "site_content_select_public" on public.site_content
  for select to anon, authenticated using (true);

create policy "site_content_write_admin" on public.site_content
  for update using (public.is_admin()) with check (public.is_admin());
