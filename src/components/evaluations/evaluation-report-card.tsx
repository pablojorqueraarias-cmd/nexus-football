import { EvaluationRadarChart } from "@/components/evaluations/evaluation-radar-chart";
import { PHASE_LABELS, PHASE_ORDER, groupEvaluationByPhase } from "@/lib/evaluation-report";
import { levelLabel } from "@/lib/evaluation-levels";

interface EvaluationItemInput {
  level: number | null;
  comment?: string | null;
  checklist_criteria: { label: string; phase: string } | null;
}

interface EvaluationReportCardProps {
  createdAt: string;
  evaluatorName: string | null;
  strengths: string | null;
  weaknesses: string | null;
  conclusion: string | null;
  matchContext: string | null;
  items: EvaluationItemInput[];
  previousItems?: EvaluationItemInput[] | null;
  previousCreatedAt?: string | null;
  actions?: React.ReactNode;
}

function levelTextColor(level: number) {
  if (level >= 4) return "text-green-700";
  if (level === 3) return "text-brand-700";
  return "text-amber-700";
}

export function EvaluationReportCard({
  createdAt,
  evaluatorName,
  strengths,
  weaknesses,
  conclusion,
  matchContext,
  items,
  previousItems,
  previousCreatedAt,
  actions,
}: EvaluationReportCardProps) {
  const { byPhase, totalItems, averageLevel } = groupEvaluationByPhase(items, previousItems);
  const hasComparison = Boolean(previousItems && previousItems.length > 0);

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
            {totalItems > 0 ? `${averageLevel.toFixed(1)}/5 promedio` : "Sin ítems"}
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

      {hasComparison && (
        <div className="mb-2 flex items-center gap-4 text-xs text-ink-900/50">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-500" /> Evaluación actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-dashed border-ink-900/40 bg-zinc-300" /> Evaluación
            anterior{previousCreatedAt ? ` (${new Date(previousCreatedAt).toLocaleDateString("es-CL")})` : ""}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {PHASE_ORDER.filter((phase) => byPhase.has(phase)).map((phase) => {
          const phaseItems = byPhase.get(phase)!;
          const phaseAvg = phaseItems.reduce((sum, i) => sum + i.level, 0) / phaseItems.length;
          return (
            <div key={phase} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-sm font-semibold text-ink-900">
                  {PHASE_LABELS[phase] ?? phase}{" "}
                  <span className="text-brand-600">{phaseAvg.toFixed(1)}/5</span>
                </h3>
                <ul className="flex flex-col gap-2">
                  {phaseItems.map((item, idx) => (
                    <li key={idx} className="flex flex-col gap-0.5 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-ink-900/70">
                          {idx + 1}. {item.label}
                        </span>
                        <span className={`shrink-0 font-bold ${levelTextColor(item.level)}`}>
                          {item.level}/5 · {levelLabel(item.level)}
                          {item.previousLevel != null && item.previousLevel !== item.level && (
                            <span className="ml-1 text-xs font-semibold text-ink-900/40">
                              (antes {item.previousLevel})
                            </span>
                          )}
                        </span>
                      </div>
                      {item.comment && (
                        <p className="text-xs text-ink-900/40">{item.comment}</p>
                      )}
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
