# Nexus Football

Sitio web y plataforma de gestión para la academia Nexus Football: páginas
públicas (inicio, programas, horarios, galería, contacto, inscripción), login
para padres/apoderados y panel de administración.

Stack: Next.js (App Router) + TypeScript + Tailwind v4 + Supabase (auth y
base de datos) + react-hook-form + zod.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El sitio público funciona
sin configuración adicional (usa datos de respaldo para categorías/horarios),
pero los formularios de contacto/inscripción y todo el login/panel necesitan
un proyecto de Supabase conectado — ver la siguiente sección.

## Conectar Supabase (obligatorio para login, inscripciones y panel)

1. **Crea un proyecto gratis** en [supabase.com](https://supabase.com/dashboard) →
   "New project". Elige nombre y contraseña de base de datos (cualquiera,
   solo tú la usarás).

2. **Corre el esquema de base de datos.** En el proyecto Supabase, abre el
   **SQL Editor** → pega y ejecuta el contenido completo de
   [`supabase/schema.sql`](supabase/schema.sql). Esto crea todas las tablas,
   las categorías (Iniciación/Formación/Proyección) y las reglas de seguridad
   (RLS).

3. **(Opcional) Carga horarios de ejemplo.** Corre también
   [`supabase/seed.sql`](supabase/seed.sql) en el SQL Editor si quieres ver
   horarios de ejemplo en `/horarios`. Puedes editarlos o borrarlos después
   desde `/admin/horarios`.

4. **Copia las claves de API.** En el proyecto Supabase ve a
   **Settings → API** y copia:
   - `Project URL`
   - `anon public` key
   - `service_role` key (¡secreta, no la compartas ni la subas a git!)

5. **Completa `.env.local`** en la raíz del proyecto (créalo copiando
   `.env.local.example` si no existe):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```

6. **Reinicia el servidor de desarrollo** (`npm run dev`) para que tome las
   nuevas variables.

7. **Crea el primer usuario administrador.** Como todavía no hay ningún
   admin para invitar a otros, créalo manualmente:
   - En Supabase, ve a **Authentication → Users → Add user** (o "Invite").
     Crea tu usuario con tu correo.
   - Ve a **Table Editor → profiles**, busca la fila con tu `id` de usuario,
     y cambia la columna `role` de `parent` a `admin`.
   - Entra a `/login` en el sitio con ese correo (si lo creaste con
     contraseña) o usa el link de invitación que te llegó por correo para
     definir tu contraseña en `/set-password`.
   - Ya dentro, en `/admin/usuarios` puedes invitar a más administradores o
     apoderados normalmente desde la interfaz.

8. **Storage de la galería.** El bucket `gallery` se crea automáticamente al
   correr `schema.sql` (público, solo admin puede subir/borrar). No necesitas
   configurarlo aparte.

## Agregar el logo

Copia tu archivo de logo a `public/logo.png`. El sitio lo detecta
automáticamente y reemplaza el logotipo de texto por la imagen (en el header,
footer y login). Si no existe el archivo, se usa el texto "NEXUS×FOOTBALL"
como respaldo — el sitio funciona igual sin el logo.

## Estructura del proyecto

- `src/app/(public)/*` — sitio público (inicio, programas, horarios, galería,
  contacto, inscripción)
- `src/app/(app)/panel/*` — panel de padres/apoderados (requiere login)
- `src/app/(app)/admin/*` — panel de administración (requiere rol admin)
- `src/app/login`, `src/app/set-password`, `src/app/auth/callback` — flujo de
  autenticación
- `src/lib/actions/*` — server actions (formularios, CRUD del admin)
- `src/lib/supabase/*` — clientes de Supabase (browser, server, middleware,
  admin con service role)
- `supabase/schema.sql` — esquema completo de base de datos + RLS
- `supabase/seed.sql` — datos de ejemplo opcionales (horarios)

## Pagos

Los pagos se registran manualmente desde `/admin/pagos` (transferencia o
efectivo) — no hay pasarela de pago online integrada.
