import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveMatchStatsAction } from "@/lib/actions/matches";

export default async function AdminPartidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, match_date, opponent, category:categories(name)")
    .eq("id", id)
    .single();

  if (!match) notFound();

  const [{ data: players }, { data: stats }] = await Promise.all([
    supabase.from("players").select("id, full_name").eq("status", "activo").order("full_name"),
    supabase.from("player_match_stats").select("player_id, minutes_played, goals, assists").eq("match_id", id),
  ]);

  const statsByPlayer = new Map((stats ?? []).map((s) => [s.player_id, s]));
  const playerIds = (players ?? []).map((p) => p.id);
  const category = match.category as { name: string } | null;

  const action = saveMatchStatsAction.bind(null, id);

  return (
    <div>
      <Link href="/admin/partidos" className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
        ← Partidos
      </Link>
      <h1 className="font-display mt-1 text-3xl font-bold uppercase tracking-tight text-ink-900">
        {new Date(match.match_date).toLocaleDateString("es-CL")} {match.opponent ? `vs. ${match.opponent}` : ""}
      </h1>
      <p className="mt-1 text-ink-900/60">{category?.name ?? "Sin categoría"}</p>

      <form action={action} className="mt-6">
        <input type="hidden" name="player_ids" value={JSON.stringify(playerIds)} />

        <div className="overflow-x-auto rounded-xl border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Minutos</th>
                <th className="px-4 py-3">Goles</th>
                <th className="px-4 py-3">Asistencias</th>
              </tr>
            </thead>
            <tbody>
              {(players ?? []).map((p) => {
                const s = statsByPlayer.get(p.id);
                return (
                  <tr key={p.id} className="border-t border-ink-900/5">
                    <td className="px-4 py-3 font-semibold text-ink-900">{p.full_name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        name={`minutes_${p.id}`}
                        defaultValue={s?.minutes_played ?? 0}
                        className="w-20 rounded-md border border-ink-900/15 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        name={`goals_${p.id}`}
                        defaultValue={s?.goals ?? 0}
                        className="w-16 rounded-md border border-ink-900/15 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        name={`assists_${p.id}`}
                        defaultValue={s?.assists ?? 0}
                        className="w-16 rounded-md border border-ink-900/15 px-2 py-1 text-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          className="mt-6 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Guardar estadísticas
        </button>
      </form>
    </div>
  );
}
