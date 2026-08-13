import { createClient } from "@/lib/supabase/server";

export default async function AdminRankingPage() {
  const supabase = await createClient();

  const [{ data: stats }, { data: players }] = await Promise.all([
    supabase.from("player_stats_summary").select("*"),
    supabase.from("players").select("id, category:categories(name)").eq("status", "activo"),
  ]);

  const categoryByPlayer = new Map(
    (players ?? []).map((p) => [p.id, (p.category as { name: string } | null)?.name ?? "—"])
  );

  const rows = (stats ?? [])
    .filter((s) => categoryByPlayer.has(s.player_id))
    .map((s) => ({
      ...s,
      category: categoryByPlayer.get(s.player_id) ?? "—",
      attendancePct: s.sessions_total > 0 ? Math.round((s.sessions_present / s.sessions_total) * 100) : null,
    }))
    .sort((a, b) => b.total_goals - a.total_goals || b.total_minutes - a.total_minutes);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Ranking
      </h1>
      <p className="mt-1 text-ink-900/60">
        Asistencia, minutos, goles y asistencias acumuladas por alumno activo.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-ink-900/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Alumno</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Asistencia</th>
              <th className="px-4 py-3">Minutos</th>
              <th className="px-4 py-3">Goles</th>
              <th className="px-4 py-3">Asistencias</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.player_id} className="border-t border-ink-900/5">
                <td className="px-4 py-3 font-semibold text-ink-900">{r.full_name}</td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3">
                  {r.attendancePct === null ? "—" : `${r.attendancePct}% (${r.sessions_present}/${r.sessions_total})`}
                </td>
                <td className="px-4 py-3">{r.total_minutes}′</td>
                <td className="px-4 py-3">{r.total_goals}</td>
                <td className="px-4 py-3">{r.total_assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="mt-4 text-sm text-ink-900/50">No hay datos todavía.</p>
      )}
    </div>
  );
}
