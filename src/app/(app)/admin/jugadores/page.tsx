import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePlayerAction } from "@/lib/actions/players";
import { PlayerStatusSelect } from "@/components/admin/player-status-select";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminJugadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .neq("name", "General")
    .order("display_order");

  let query = supabase
    .from("players")
    .select("id, full_name, status, birth_date, category:categories(name), parent:profiles(full_name, id)")
    .order("full_name");

  if (q) query = query.ilike("full_name", `%${q}%`);
  if (category) query = query.eq("category_id", category);

  const { data: players } = await query;

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

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/10 p-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="q" className="text-xs font-semibold uppercase text-ink-900/60">
            Buscar por nombre
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Nombre del jugador/a"
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-xs font-semibold uppercase text-ink-900/60">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Todas</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-ink-900/15 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-zinc-100"
        >
          Buscar
        </button>
        {(q || category) && (
          <Link
            href="/admin/jugadores"
            className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500"
          >
            Limpiar
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-900/10">
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
              const cat = p.category as { name: string } | null;
              const parent = p.parent as { full_name: string; id: string } | null;
              return (
                <tr key={p.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-semibold text-ink-900">
                    <Link href={`/admin/jugadores/${p.id}`} className="hover:text-brand-500 hover:underline">
                      {p.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{cat?.name ?? "—"}</td>
                  <td className="px-4 py-3">{parent?.full_name ?? "Sin asignar"}</td>
                  <td className="px-4 py-3">
                    <PlayerStatusSelect playerId={p.id} status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/jugadores/${p.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-600"
                      >
                        Ver ficha
                      </Link>
                      <Link
                        href={`/admin/jugadores/${p.id}/editar`}
                        className="text-xs font-semibold uppercase tracking-wide text-ink-900/50 hover:text-brand-500"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        action={deletePlayerAction.bind(null, p.id)}
                        confirmMessage={`¿Eliminar a ${p.full_name}? Esta acción no se puede deshacer.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(players ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-900/50">
                  No hay jugadores/as que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
