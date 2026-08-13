import { updateCriterionAction } from "@/lib/actions/criteria";

export interface CriterionRow {
  id: string;
  label: string;
  description: string | null;
  phase: "general" | "defensiva" | "ofensiva";
  display_order: number;
  is_active: boolean;
}

const PHASE_LABELS: Record<CriterionRow["phase"], string> = {
  general: "General",
  defensiva: "Defensiva",
  ofensiva: "Ofensiva",
};

export function CriteriaAdminTable({ criteria }: { criteria: CriterionRow[] }) {
  return (
    <div className="flex flex-col divide-y divide-ink-900/5">
      {criteria.map((criterion) => (
        <form
          key={criterion.id}
          action={updateCriterionAction.bind(null, criterion.id)}
          className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3"
        >
          <span className="w-20 shrink-0 text-xs font-semibold text-ink-900/40">
            {PHASE_LABELS[criterion.phase]}
          </span>
          <input
            name="label"
            defaultValue={criterion.label}
            className="flex-1 rounded-md border border-ink-900/15 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <input
            name="description"
            defaultValue={criterion.description ?? ""}
            placeholder="Descripción (opcional)"
            className="flex-1 rounded-md border border-ink-900/15 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <input
            name="display_order"
            type="number"
            defaultValue={criterion.display_order}
            className="w-16 rounded-md border border-ink-900/15 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <label className="flex items-center gap-1 text-xs text-ink-900/50">
            <input type="checkbox" name="is_active" defaultChecked={criterion.is_active} />
            Activo
          </label>
          <button
            type="submit"
            className="rounded-md border border-ink-900/15 px-3 py-1 text-xs font-semibold text-ink-900 hover:bg-zinc-100"
          >
            Guardar
          </button>
        </form>
      ))}
    </div>
  );
}
