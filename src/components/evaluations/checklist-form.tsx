"use client";

export interface Criterion {
  id: string;
  label: string;
  description: string | null;
}

export interface ChecklistGroups {
  general: Criterion[];
  defensiva: Criterion[];
  ofensiva: Criterion[];
}

const PHASE_LABELS: Record<keyof ChecklistGroups, string> = {
  general: "General",
  defensiva: "Fase Defensiva",
  ofensiva: "Fase Ofensiva",
};

function CriterionRow({ criterion }: { criterion: Criterion }) {
  return (
    <div className="flex flex-col gap-2 border-b border-ink-900/5 py-3 last:border-none sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="text-sm text-ink-900">{criterion.label}</p>
        {criterion.description && (
          <p className="mt-0.5 text-xs text-ink-900/40">{criterion.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-md border border-ink-900/15 p-0.5">
        <label className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded text-sm font-semibold text-ink-900/50 has-[input:checked]:bg-green-600 has-[input:checked]:text-white sm:h-9 sm:w-14 sm:flex-none">
          <input type="radio" name={`meets_${criterion.id}`} value="si" className="sr-only" />
          Sí
        </label>
        <label className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded text-sm font-semibold text-ink-900/50 has-[input:checked]:bg-ink-900 has-[input:checked]:text-white sm:h-9 sm:w-14 sm:flex-none">
          <input type="radio" name={`meets_${criterion.id}`} value="no" className="sr-only" />
          No
        </label>
      </div>
    </div>
  );
}

export function ChecklistForm({
  groups,
  hasPhases,
  action,
}: {
  groups: ChecklistGroups;
  hasPhases: boolean;
  action: (formData: FormData) => void;
}) {
  const allCriterionIds = [...groups.general, ...groups.defensiva, ...groups.ofensiva].map(
    (c) => c.id
  );

  const groupsToRender: (keyof ChecklistGroups)[] = hasPhases
    ? ["general", "defensiva", "ofensiva"]
    : ["general"];

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="criterion_ids" value={JSON.stringify(allCriterionIds)} />

      {groupsToRender.map((phase) => {
        const criteria = phase === "general" && !hasPhases
          ? [...groups.general, ...groups.defensiva, ...groups.ofensiva]
          : groups[phase];

        if (criteria.length === 0) return null;

        return (
          <div key={phase} className="rounded-xl border border-ink-900/10 p-4">
            <h2 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">
              {PHASE_LABELS[phase]}
            </h2>
            {criteria.map((criterion) => (
              <CriterionRow key={criterion.id} criterion={criterion} />
            ))}
          </div>
        );
      })}

      <div className="rounded-xl border border-ink-900/10 p-4">
        <h2 className="font-display mb-3 text-sm font-bold uppercase tracking-wide text-brand-600">
          Ficha individual
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink-900">
              Aspectos positivos (fortalezas)
            </label>
            <textarea
              name="strengths"
              rows={2}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink-900">
              Aspectos a reforzar (debilidades)
            </label>
            <textarea
              name="weaknesses"
              rows={2}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink-900">Conclusión desempeño</label>
            <textarea
              name="conclusion"
              rows={2}
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ink-900">
              Contexto del partido (opcional)
            </label>
            <input
              name="match_context"
              placeholder="Ej: vs. Club X, Fecha 8"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="self-start rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
      >
        Guardar evaluación
      </button>
    </form>
  );
}
