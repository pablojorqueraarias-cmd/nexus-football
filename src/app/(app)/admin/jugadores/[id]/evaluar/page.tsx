import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChecklistForm, type ChecklistGroups } from "@/components/evaluations/checklist-form";
import { createEvaluationAction } from "@/lib/actions/evaluations";
import type { CriterionPhase } from "@/types/database.types";

export default async function EvaluarJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("id, full_name, position_id, positions(name, has_phases)")
    .eq("id", id)
    .single();

  if (!player) notFound();

  const positionInfo = player.positions as { name: string; has_phases: boolean } | null;
  const hasPhases = positionInfo?.has_phases ?? false;

  let criteriaQuery = supabase
    .from("checklist_criteria")
    .select("id, phase, label, description")
    .eq("is_active", true)
    .order("phase")
    .order("display_order");

  criteriaQuery = player.position_id
    ? criteriaQuery.or(`position_id.eq.${player.position_id},position_id.is.null`)
    : criteriaQuery.is("position_id", null);

  const { data: criteria } = await criteriaQuery;

  const groups: ChecklistGroups = { general: [], defensiva: [], ofensiva: [] };
  for (const c of criteria ?? []) {
    groups[c.phase as CriterionPhase].push({
      id: c.id,
      label: c.label,
      description: c.description,
    });
  }

  const action = createEvaluationAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
          Evaluar a {player.full_name}
        </h1>
        <p className="mt-1 text-ink-900/60">
          {positionInfo?.name ?? "Sin posición asignada"} · Checklist según perfil de posición
        </p>
      </div>

      <ChecklistForm groups={groups} hasPhases={hasPhases} action={action} />
    </div>
  );
}
