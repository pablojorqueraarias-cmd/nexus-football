import { createClient } from "@/lib/supabase/server";
import { createCriterionAction } from "@/lib/actions/criteria";
import { CriteriaAdminTable, type CriterionRow } from "@/components/admin/criteria-admin-table";

export default async function AdminCriteriosPage() {
  const supabase = await createClient();

  const { data: positions } = await supabase
    .from("positions")
    .select("id, name, has_phases")
    .order("display_order");

  const { data: criteria } = await supabase
    .from("checklist_criteria")
    .select("id, position_id, label, description, phase, display_order, is_active")
    .order("display_order");

  const generalCriteria: CriterionRow[] = criteria?.filter((c) => c.position_id === null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
          Checklist de evaluación
        </h1>
        <p className="mt-1 text-ink-900/60">
          Edita los criterios por posición. Los cambios se reflejan de inmediato en el
          checklist que se completa al evaluar a un jugador/a.
        </p>
      </div>

      <div className="rounded-xl border border-ink-900/10 p-4">
        <h2 className="font-display mb-3 text-sm font-bold uppercase tracking-wide text-ink-900/70">
          Nuevo criterio
        </h2>
        <form
          action={createCriterionAction}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Posición</label>
            <select
              name="position_id"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">General (todas)</option>
              {positions?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Fase</label>
            <select
              name="phase"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="general">General</option>
              <option value="defensiva">Defensiva</option>
              <option value="ofensiva">Ofensiva</option>
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Etiqueta</label>
            <input
              name="label"
              required
              placeholder="Ej: Juego aéreo"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Descripción</label>
            <input
              name="description"
              placeholder="Opcional"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-900/50">Orden</label>
            <input
              name="display_order"
              type="number"
              defaultValue={0}
              className="w-20 rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
          >
            Agregar
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-ink-900/10 p-4">
        <h2 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-ink-900/70">
          Criterios generales (todas las posiciones)
        </h2>
        <CriteriaAdminTable criteria={generalCriteria} />
      </div>

      {positions?.map((position) => {
        const positionCriteria: CriterionRow[] =
          criteria?.filter((c) => c.position_id === position.id) ?? [];

        if (positionCriteria.length === 0) return null;

        return (
          <div key={position.id} className="rounded-xl border border-ink-900/10 p-4">
            <h2 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-ink-900/70">
              {position.name}
            </h2>
            <CriteriaAdminTable criteria={positionCriteria} />
          </div>
        );
      })}
    </div>
  );
}
