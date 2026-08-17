export interface EvaluationItemDetail {
  label: string;
  level: number;
  comment: string | null;
  previousLevel?: number | null;
}

export const PHASE_LABELS: Record<string, string> = {
  general: "General",
  defensiva: "Fase Defensiva",
  ofensiva: "Fase Ofensiva",
};

export const PHASE_ORDER = ["general", "defensiva", "ofensiva"];

type RawEvaluationItem = {
  level: number | null;
  comment?: string | null;
  checklist_criteria: { label: string; phase: string } | null;
};

export function groupEvaluationByPhase(items: RawEvaluationItem[]) {
  const clean = items.filter((item) => item.level !== null && item.checklist_criteria);

  const byPhase = new Map<string, EvaluationItemDetail[]>();
  for (const item of clean) {
    const phase = item.checklist_criteria!.phase;
    if (!byPhase.has(phase)) byPhase.set(phase, []);
    byPhase.get(phase)!.push({
      label: item.checklist_criteria!.label,
      level: item.level!,
      comment: item.comment ?? null,
    });
  }

  const totalItems = clean.length;
  const averageLevel =
    totalItems > 0 ? clean.reduce((sum, i) => sum + (i.level ?? 0), 0) / totalItems : 0;

  return { byPhase, totalItems, averageLevel };
}

/**
 * Igual que groupEvaluationByPhase, pero además le agrega a cada ítem el
 * nivel que tenía en la evaluación anterior del mismo jugador/a (buscando
 * por etiqueta de criterio dentro de la misma fase), para poder comparar
 * avance/retroceso en el gráfico de araña y en el detalle.
 */
export function groupEvaluationByPhaseWithPrevious(
  items: RawEvaluationItem[],
  previousItems: RawEvaluationItem[] | null | undefined
) {
  const current = groupEvaluationByPhase(items);
  if (!previousItems || previousItems.length === 0) return current;

  const previous = groupEvaluationByPhase(previousItems);

  const byPhase = new Map<string, EvaluationItemDetail[]>();
  for (const [phase, phaseItems] of current.byPhase) {
    const prevMap = new Map((previous.byPhase.get(phase) ?? []).map((p) => [p.label, p.level]));
    byPhase.set(
      phase,
      phaseItems.map((item) => ({ ...item, previousLevel: prevMap.get(item.label) ?? null }))
    );
  }

  return { ...current, byPhase };
}
