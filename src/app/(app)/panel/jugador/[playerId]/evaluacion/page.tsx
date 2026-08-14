import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EvaluationReportCard } from "@/components/evaluations/evaluation-report-card";
import { PrintButton } from "@/components/print-button";
import { groupEvaluationByPhase } from "@/lib/evaluation-report";

export default async function JugadorEvaluacionPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase.from("players").select("id, full_name").eq("id", playerId).single();
  if (!player) notFound();

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("*, evaluator:profiles(full_name), evaluation_items(level, comment, checklist_criteria(label, phase))")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  const latest = evaluations?.[0];
  const history = evaluations?.slice(1) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link href={`/panel/jugador/${playerId}`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
            ← {player.full_name}
          </Link>
          <h1 className="font-display mt-1 text-2xl font-bold uppercase tracking-tight text-ink-900">
            Evaluación
          </h1>
        </div>
        {latest && <PrintButton />}
      </div>

      {!latest ? (
        <div className="rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
          Aún no hay evaluaciones registradas.
        </div>
      ) : (
        <EvaluationReportCard
          createdAt={latest.created_at}
          evaluatorName={(latest.evaluator as { full_name: string } | null)?.full_name ?? null}
          strengths={latest.strengths}
          weaknesses={latest.weaknesses}
          conclusion={latest.conclusion}
          matchContext={latest.match_context}
          items={latest.evaluation_items}
        />
      )}

      {history.length > 0 && (
        <div className="print:hidden">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900/70">
            Evaluaciones anteriores
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {history.map((ev) => {
              const { totalItems, averageLevel } = groupEvaluationByPhase(ev.evaluation_items);
              return (
                <li key={ev.id} className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/10 px-4 py-2 text-sm">
                  <span className="text-ink-900/70">
                    {new Date(ev.created_at).toLocaleDateString("es-CL")} ·{" "}
                    <span className="font-semibold text-ink-900">
                      {totalItems > 0 ? `${averageLevel.toFixed(1)}/5` : "—"}
                    </span>
                  </span>
                  <Link
                    href={`/panel/jugador/${playerId}/evaluacion/${ev.id}`}
                    className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-600"
                  >
                    Ver
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
