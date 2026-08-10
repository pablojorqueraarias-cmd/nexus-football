import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inviteUserAction } from "@/lib/actions/users";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { UserAccessToggle } from "@/components/admin/user-access-toggle";
import { UserDeleteButton } from "@/components/admin/user-delete-button";

export default async function AdminUsuariosPage() {
  const profile = await getCurrentProfile();

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, created_at")
    .order("created_at", { ascending: false });

  const admin = createAdminClient();
  const { data: authData } = await admin.auth.admin.listUsers();
  const authById = new Map(authData?.users.map((u) => [u.id, u]) ?? []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
          Usuarios
        </h1>
        <p className="mt-1 text-ink-900/60">
          Invita apoderados o administradores, cambia roles y gestiona el acceso.
        </p>
      </div>

      <div className="rounded-xl border border-ink-900/10 p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink-900/70">Invitar usuario</h2>
        <form action={inviteUserAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Correo</label>
            <input
              name="email"
              type="email"
              required
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Nombre completo</label>
            <input
              name="full_name"
              required
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Rol</label>
            <select
              name="role"
              defaultValue="parent"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="parent">Apoderado</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
          >
            Enviar invitación
          </button>
        </form>
        <p className="mt-2 text-xs text-ink-900/40">
          Le llega un correo para que cree su contraseña y empiece a usar el panel.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-900/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-900/50">
              <th className="p-3">Nombre</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acceso</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p) => {
              const authUser = authById.get(p.id);
              const isActive =
                !authUser?.banned_until || new Date(authUser.banned_until) < new Date();
              const isPending = !authUser?.email_confirmed_at;
              const isSelf = p.id === profile?.id;
              return (
                <tr key={p.id} className="border-b border-ink-900/5 last:border-none">
                  <td className="p-3 text-ink-900">
                    {p.full_name}
                    {isPending && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Invitación pendiente
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-ink-900/60">{authUser?.email ?? "—"}</td>
                  <td className="p-3">
                    <UserRoleSelect userId={p.id} currentRole={p.role} disabled={isSelf} />
                  </td>
                  <td className="p-3">
                    <UserAccessToggle userId={p.id} isActive={isActive} disabled={isSelf} />
                  </td>
                  <td className="p-3">
                    <UserDeleteButton userId={p.id} userName={p.full_name} disabled={isSelf} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
