import { EvaluationRadarChart } from "@/components/evaluations/evaluation-radar-chart";
import { PHASE_LABELS, PHASE_ORDER, groupEvaluationByPhase } from "@/lib/evaluation-report";

interface EvaluationReportCardProps {
  createdAt: string;
  evaluatorName: string | null;
  strengths: string | null;
  weaknesses: string | null;
  conclusion: string | null;
  matchContext: string | null;
  items: { meets: boolean | null; checklist_criteria: { label: string; phase: string } | null }[];
  actions?: React.ReactNode;
}

export function EvaluationReportCard({
  createdAt,
  evaluatorName,
  strengths,
  weaknesses,
  conclusion,
  matchContext,
  items,
  actions,
}: EvaluationReportCardProps) {
  const { byPhase, totalItems, totalMet } = groupEvaluationByPhase(items);

  return (
    <div className="rounded-xl border border-ink-900/10 p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900/70">
          Evaluación · {new Date(createdAt).toLocaleDateString("es-CL")}
          {" · "}
          {evaluatorName ?? "Admin"}
          {matchContext ? ` · ${matchContext}` : ""}
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            {totalMet}/{totalItems} en total
          </span>
          {actions}
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-ink-900/10 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            Fortalezas
          </h3>
          <p className="text-sm text-ink-900/70">{strengths || "—"}</p>
        </div>
        <div className="rounded-md border border-ink-900/10 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            Debilidades
          </h3>
          <p className="text-sm text-ink-900/70">{weaknesses || "—"}</p>
        </div>
        <div className="rounded-md border border-ink-900/10 p-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            Conclusión
          </h3>
          <p className="text-sm text-ink-900/70">{conclusion || "—"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {PHASE_ORDER.filter((phase) => byPhase.has(phase)).map((phase) => {
          const phaseItems = byPhase.get(phase)!;
          const met = phaseItems.filter((i) => i.meets).length;
          return (
            <div key={phase} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-sm font-semibold text-ink-900">
                  {PHASE_LABELS[phase] ?? phase}{" "}
                  <span className="text-brand-600">
                    {met}/{phaseItems.length}
                  </span>
                </h3>
                <ul className="flex flex-col gap-1">
                  {phaseItems.map((item, idx) => (
                    <li key={idx} className="flex justify-between gap-4 text-sm">
                      <span className="text-ink-900/70">
                        {idx + 1}. {item.label}
                      </span>
                      <span
                        className={`shrink-0 font-medium ${
                          item.meets ? "text-green-700" : "text-ink-900/30"
                        }`}
                      >
                        {item.meets ? "Sí" : "No"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <EvaluationRadarChart items={phaseItems} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
