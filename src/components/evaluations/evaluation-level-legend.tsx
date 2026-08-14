import { EVALUATION_LEVELS } from "@/lib/evaluation-levels";

export function EvaluationLevelLegend() {
  return (
    <div className="rounded-xl border border-ink-900/10 bg-zinc-50 p-4">
      <h2 className="font-display mb-3 text-sm font-bold uppercase tracking-wide text-ink-900/70">
        Escala de nivel (referencia para calificar cada criterio)
      </h2>
      <div className="grid gap-3 sm:grid-cols-5">
        {EVALUATION_LEVELS.map((level) => (
          <div key={level.value} className="rounded-lg border border-ink-900/10 bg-white p-3">
            <p className="font-display text-lg font-bold text-brand-600">
              {level.value} · {level.label}
            </p>
            <p className="mt-1 text-xs text-ink-900/60">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
