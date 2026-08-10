-- Datos de ejemplo para horarios. Edítalos desde /admin/horarios una vez
-- que tengas usuarios admin, o ajusta estos valores antes de correrlo.

insert into public.schedules (category_id, day_of_week, start_time, end_time, location, display_order)
select id, 'lunes', '17:00', '18:30', 'Cancha Nexus Football', 1 from public.categories where name = 'Iniciación'
union all
select id, 'miercoles', '17:00', '18:30', 'Cancha Nexus Football', 2 from public.categories where name = 'Iniciación'
union all
select id, 'martes', '17:30', '19:00', 'Cancha Nexus Football', 1 from public.categories where name = 'Formación'
union all
select id, 'jueves', '17:30', '19:00', 'Cancha Nexus Football', 2 from public.categories where name = 'Formación'
union all
select id, 'lunes', '19:00', '20:30', 'Cancha Nexus Football', 1 from public.categories where name = 'Proyección'
union all
select id, 'miercoles', '19:00', '20:30', 'Cancha Nexus Football', 2 from public.categories where name = 'Proyección'
union all
select id, 'viernes', '19:00', '20:30', 'Cancha Nexus Football', 3 from public.categories where name = 'Proyección';
