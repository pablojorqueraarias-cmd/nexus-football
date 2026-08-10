import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePlayerAction } from "@/lib/actions/players";
import { PlayerStatusSelect } from "@/components/admin/player-status-select";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminJugadoresPage() {
  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, full_name, status, birth_date, category:categories(name), parent:profiles(full_name, id)")
    .order("full_name");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
            Alumnos
          </h1>
          <p className="mt-1 text-ink-900/60">Listado de jugadores/as de la academia.</p>
        </div>
        <Link
          href="/admin/jugadores/nuevo"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Nuevo alumno
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-ink-900/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Apoderado</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(players ?? []).map((p) => {
              const category = p.category as { name: string } | null;
              const parent = p.parent as { full_name: string; id: string } | null;
              return (
                <tr key={p.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-semibold text-ink-900">{p.full_name}</td>
                  <td className="px-4 py-3">{category?.name ?? "—"}</td>
                  <td className="px-4 py-3">{parent?.full_name ?? "Sin asignar"}</td>
                  <td className="px-4 py-3">
                    <PlayerStatusSelect playerId={p.id} status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={deletePlayerAction.bind(null, p.id)}
                      confirmMessage={`¿Eliminar a ${p.full_name}? Esta acción no se puede deshacer.`}
                    />
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
