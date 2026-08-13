import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EvaluationReportCard } from "@/components/evaluations/evaluation-report-card";
import { PrintButton } from "@/components/print-button";

export default async function AdminEvaluationReportPage({
  params,
}: {
  params: Promise<{ id: string; evaluationId: string }>;
}) {
  const { id, evaluationId } = await params;
  const supabase = await createClient();

  const [{ data: player }, { data: evaluation }] = await Promise.all([
    supabase.from("players").select("full_name").eq("id", id).single(),
    supabase
      .from("evaluations")
      .select("*, evaluator:profiles(full_name), evaluation_items(score, comment, checklist_criteria(label, phase))")
      .eq("id", evaluationId)
      .single(),
  ]);

  if (!player || !evaluation) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link href={`/admin/jugadores/${id}`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
            ← {player.full_name}
          </Link>
          <h1 className="font-display mt-1 text-2xl font-bold uppercase tracking-tight text-ink-900">
            Reporte de evaluación
          </h1>
        </div>
        <PrintButton />
      </div>

      <h1 className="font-display hidden text-2xl font-bold uppercase tracking-tight text-ink-900 print:block">
        {player.full_name} — Reporte de evaluación
      </h1>

      <EvaluationReportCard
        createdAt={evaluation.created_at}
        evaluatorName={(evaluation.evaluator as { full_name: string } | null)?.full_name ?? null}
        strengths={evaluation.strengths}
        weaknesses={evaluation.weaknesses}
        conclusion={evaluation.conclusion}
        matchContext={evaluation.match_context}
        items={evaluation.evaluation_items}
      />
    </div>
  );
}
