import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMatchAction, deleteMatchAction } from "@/lib/actions/matches";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminPartidosPage() {
  const supabase = await createClient();

  const [{ data: matches }, { data: categories }] = await Promise.all([
    supabase
      .from("matches")
      .select("id, match_date, opponent, category:categories(name)")
      .order("match_date", { ascending: false }),
    supabase.from("categories").select("id, name").order("display_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Partidos
      </h1>
      <p className="mt-1 text-ink-900/60">Registra partidos y el minutaje/goles/asistencias de cada jugador/a.</p>

      <form action={createMatchAction} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/10 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase text-ink-900/60">Fecha</label>
          <input name="match_date" type="date" required className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase text-ink-900/60">Rival</label>
          <input name="opponent" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase text-ink-900/60">Categoría</label>
          <select name="category_id" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            <option value="">Sin categoría</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Crear partido
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-ink-900/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Rival</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(matches ?? []).map((m) => {
              const category = m.category as { name: string } | null;
              return (
                <tr key={m.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-semibold text-ink-900">
                    <Link href={`/admin/partidos/${m.id}`} className="hover:text-brand-500 hover:underline">
                      {new Date(m.match_date).toLocaleDateString("es-CL")}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{m.opponent ?? "—"}</td>
                  <td className="px-4 py-3">{category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={deleteMatchAction.bind(null, m.id)}
                      confirmMessage="¿Eliminar este partido y sus estadísticas?"
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
