import { EvaluationRadarChart } from "@/components/evaluations/evaluation-radar-chart";
import {
  PHASE_LABELS,
  PHASE_ORDER,
  groupEvaluationByPhaseWithPrevious,
  type EvaluationItemDetail,
} from "@/lib/evaluation-report";
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
  actions?: React.ReactNode;
}

function levelTextColor(level: number) {
  if (level >= 4) return "text-green-700";
  if (level === 3) return "text-brand-700";
  return "text-amber-700";
}

function DeltaBadge({ item }: { item: EvaluationItemDetail }) {
  if (typeof item.previousLevel !== "number") return null;
  const diff = item.level - item.previousLevel;
  if (diff === 0) {
    return <span className="text-xs font-medium text-ink-900/40">= sin cambio</span>;
  }
  const up = diff > 0;
  return (
    <span className={`text-xs font-bold ${up ? "text-green-600" : "text-red-600"}`}>
      {up ? "▲" : "▼"} antes {item.previousLevel}/5
    </span>
  );
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
  actions,
}: EvaluationReportCardProps) {
  const { byPhase, totalItems, averageLevel } = groupEvaluationByPhaseWithPrevious(
    items,
    previousItems
  );
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
        <p className="mb-4 flex items-center gap-4 text-xs text-ink-900/50">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-ink-900/40 bg-zinc-100" />
            Evaluación anterior
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            Evaluación actual
          </span>
        </p>
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
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                        <span className="text-ink-900/70">
                          {idx + 1}. {item.label}
                        </span>
                        <span className="flex items-baseline gap-2">
                          <span className={`shrink-0 font-bold ${levelTextColor(item.level)}`}>
                            {item.level}/5 · {levelLabel(item.level)}
                          </span>
                          <DeltaBadge item={item} />
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
