import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/data/site-content";
import { BankTransferCard } from "@/components/bank-transfer-card";

const DAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export default async function JugadorFichaPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const supabase = await createClient();

  // El select respeta RLS: si este jugador/a no le pertenece a quien pide la
  // página (ni es su apoderado ni es su propia cuenta), no vuelve fila.
  const { data: player } = await supabase
    .from("players")
    .select("id, full_name, status, birth_date, category:categories(name, age_range)")
    .eq("id", playerId)
    .single();

  if (!player) notFound();

  const [{ data: schedules }, { data: stats }, { data: latestEvaluation }, content] = await Promise.all([
    supabase.from("schedules").select("day_of_week, start_time, end_time, location"),
    supabase.from("player_stats_summary").select("*").eq("player_id", playerId).maybeSingle(),
    supabase
      .from("evaluations")
      .select("id, created_at")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getSiteContent(),
  ]);

  const category = player.category as { name: string; age_range: string | null } | null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
          {player.full_name}
        </h1>
        <p className="mt-1 text-ink-900/60">
          {category?.name ?? "Sin categoría"} {category?.age_range ? `(${category.age_range})` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={`/panel/jugador/${playerId}/asistencia`} className="rounded-xl border border-ink-900/10 p-4 hover:shadow-lg">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Asistencia</h2>
          <p className="font-display mt-2 text-2xl font-bold text-ink-900">
            {stats ? `${stats.sessions_present}/${stats.sessions_total}` : "0/0"}
          </p>
        </Link>

        <Link href={`/panel/jugador/${playerId}/estadisticas`} className="rounded-xl border border-ink-900/10 p-4 hover:shadow-lg">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            Partidos jugados
          </h2>
          <p className="font-display mt-2 text-2xl font-bold text-ink-900">
            {stats?.matches_played ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-900/50">
            {stats?.total_minutes ?? 0}′ · {stats?.total_goals ?? 0} goles · {stats?.total_assists ?? 0} asistencias
          </p>
        </Link>

        <Link href={`/panel/jugador/${playerId}/documentos`} className="rounded-xl border border-ink-900/10 p-4 hover:shadow-lg">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Documentos</h2>
          <p className="mt-2 text-sm font-semibold text-brand-500">Ver documentos →</p>
        </Link>

        <Link href={`/panel/jugador/${playerId}/media`} className="rounded-xl border border-ink-900/10 p-4 hover:shadow-lg">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Fotos y videos</h2>
          <p className="mt-2 text-sm font-semibold text-brand-500">Ver fotos y videos →</p>
        </Link>
      </div>

      <div className="rounded-xl border border-ink-900/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900/70">
            Evaluación
          </h2>
          {latestEvaluation && (
            <Link
              href={`/panel/jugador/${playerId}/evaluacion`}
              className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-600"
            >
              Ver reporte completo →
            </Link>
          )}
        </div>
        {latestEvaluation ? (
          <p className="mt-2 text-sm text-ink-900/60">
            Última evaluación: {new Date(latestEvaluation.created_at).toLocaleDateString("es-CL")}
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink-900/50">Aún no hay evaluaciones registradas.</p>
        )}
      </div>

      <BankTransferCard content={content} />

      {schedules && schedules.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold uppercase text-ink-900">
            Horario de entrenamiento
          </h2>
          <ul className="mt-3 flex flex-col gap-1 rounded-xl border border-ink-900/10 p-4 text-sm text-ink-900/70">
            {schedules.map((s, i) => (
              <li key={i}>
                {DAY_LABELS[s.day_of_week] ?? s.day_of_week} · {s.start_time.slice(0, 5)}–
                {s.end_time.slice(0, 5)} · {s.location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
