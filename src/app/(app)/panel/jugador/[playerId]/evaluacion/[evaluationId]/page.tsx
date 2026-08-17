import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EvaluationReportCard } from "@/components/evaluations/evaluation-report-card";
import { PrintButton } from "@/components/print-button";
import { getPreviousEvaluation } from "@/lib/data/evaluations";

export default async function JugadorEvaluacionDetallePage({
  params,
}: {
  params: Promise<{ playerId: string; evaluationId: string }>;
}) {
  const { playerId, evaluationId } = await params;
  const supabase = await createClient();

  const [{ data: player }, { data: evaluation }] = await Promise.all([
    supabase.from("players").select("full_name").eq("id", playerId).single(),
    supabase
      .from("evaluations")
      .select("*, evaluator:profiles(full_name), evaluation_items(level, comment, checklist_criteria(label, phase))")
      .eq("id", evaluationId)
      .single(),
  ]);

  if (!player || !evaluation) notFound();

  const previous = await getPreviousEvaluation(playerId, evaluation.created_at);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link href={`/panel/jugador/${playerId}/evaluacion`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
            ← Evaluaciones de {player.full_name}
          </Link>
          <h1 className="font-display mt-1 text-2xl font-bold uppercase tracking-tight text-ink-900">
            Reporte de evaluación
          </h1>
        </div>
        <PrintButton />
      </div>

      <EvaluationReportCard
        createdAt={evaluation.created_at}
        evaluatorName={(evaluation.evaluator as { full_name: string } | null)?.full_name ?? null}
        strengths={evaluation.strengths}
        weaknesses={evaluation.weaknesses}
        conclusion={evaluation.conclusion}
        matchContext={evaluation.match_context}
        items={evaluation.evaluation_items}
        previousItems={previous?.evaluation_items}
        previousCreatedAt={previous?.created_at}
      />
    </div>
  );
}
