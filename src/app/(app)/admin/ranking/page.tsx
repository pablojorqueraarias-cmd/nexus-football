import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const SORT_OPTIONS = [
  { key: "goles", label: "Goles" },
  { key: "asistencias", label: "Asistencias" },
  { key: "minutos", label: "Minutos" },
  { key: "partidos", label: "Partidos" },
  { key: "asistencia", label: "Asistencia" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export default async function AdminRankingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const activeSort: SortKey = SORT_OPTIONS.some((o) => o.key === sort) ? (sort as SortKey) : "goles";

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
      attendancePct: s.sessions_total > 0 ? Math.round((s.sessions_present / s.sessions_total) * 100) : 0,
    }));

  const sorters: Record<SortKey, (a: typeof rows[number], b: typeof rows[number]) => number> = {
    goles: (a, b) => b.total_goals - a.total_goals,
    asistencias: (a, b) => b.total_assists - a.total_assists,
    minutos: (a, b) => b.total_minutes - a.total_minutes,
    partidos: (a, b) => b.matches_played - a.matches_played,
    asistencia: (a, b) => b.attendancePct - a.attendancePct,
  };

  const sortedRows = [...rows].sort(sorters[activeSort]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Ranking
      </h1>
      <p className="mt-1 text-ink-900/60">
        Asistencia, partidos, minutos, goles y asistencias acumuladas por alumno activo.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => (
          <Link
            key={option.key}
            href={option.key === "goles" ? "/admin/ranking" : `/admin/ranking?sort=${option.key}`}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
              activeSort === option.key
                ? "bg-brand-500 text-white"
                : "border border-ink-900/15 text-ink-900/60 hover:bg-zinc-100"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink-900/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Alumno</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Asistencia</th>
              <th className="px-4 py-3">Partidos</th>
              <th className="px-4 py-3">Minutos</th>
              <th className="px-4 py-3">Goles</th>
              <th className="px-4 py-3">Asistencias</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.player_id} className="border-t border-ink-900/5">
                <td className="px-4 py-3 font-semibold text-ink-900">{r.full_name}</td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3">
                  {r.sessions_total === 0 ? "—" : `${r.attendancePct}% (${r.sessions_present}/${r.sessions_total})`}
                </td>
                <td className="px-4 py-3">{r.matches_played}</td>
                <td className="px-4 py-3">{r.total_minutes}′</td>
                <td className="px-4 py-3">{r.total_goals}</td>
                <td className="px-4 py-3">{r.total_assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedRows.length === 0 && (
        <p className="mt-4 text-sm text-ink-900/50">No hay datos todavía.</p>
      )}
    </div>
  );
}
