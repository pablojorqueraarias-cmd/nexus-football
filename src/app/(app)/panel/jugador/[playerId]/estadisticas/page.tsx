import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function JugadorEstadisticasPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase.from("players").select("id, full_name").eq("id", playerId).single();
  if (!player) notFound();

  const { data: stats } = await supabase
    .from("player_match_stats")
    .select("minutes_played, goals, assists, match:matches(match_date, opponent)")
    .eq("player_id", playerId);

  const sorted = (stats ?? []).sort((a, b) => {
    const da = (a.match as { match_date: string } | null)?.match_date ?? "";
    const db = (b.match as { match_date: string } | null)?.match_date ?? "";
    return db.localeCompare(da);
  });

  const totalMinutes = sorted.reduce((sum, s) => sum + s.minutes_played, 0);
  const totalGoals = sorted.reduce((sum, s) => sum + s.goals, 0);
  const totalAssists = sorted.reduce((sum, s) => sum + s.assists, 0);

  return (
    <div>
      <Link href={`/panel/jugador/${playerId}`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
        ← {player.full_name}
      </Link>
      <h1 className="font-display mt-1 text-3xl font-bold uppercase tracking-tight text-ink-900">
        Estadísticas
      </h1>
      <p className="mt-1 text-ink-900/60">
        Total: {sorted.length} partidos · {totalMinutes}′ jugados · {totalGoals} goles · {totalAssists} asistencias
      </p>

      {sorted.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
          Aún no hay partidos registrados.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
              <tr>
                <th className="px-4 py-3">Partido</th>
                <th className="px-4 py-3">Minutos</th>
                <th className="px-4 py-3">Goles</th>
                <th className="px-4 py-3">Asistencias</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const match = s.match as { match_date: string; opponent: string | null } | null;
                return (
                  <tr key={i} className="border-t border-ink-900/5">
                    <td className="px-4 py-3 font-semibold text-ink-900">
                      {match ? new Date(match.match_date).toLocaleDateString("es-CL") : "—"}
                      {match?.opponent ? ` vs. ${match.opponent}` : ""}
                    </td>
                    <td className="px-4 py-3">{s.minutes_played}′</td>
                    <td className="px-4 py-3">{s.goals}</td>
                    <td className="px-4 py-3">{s.assists}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
