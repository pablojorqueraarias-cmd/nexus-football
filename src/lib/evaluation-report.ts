export interface EvaluationItemDetail {
  label: string;
  level: number;
  comment: string | null;
  previousLevel: number | null;
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

function buildLevelMap(items?: RawEvaluationItem[] | null): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items ?? []) {
    if (item.level !== null && item.checklist_criteria) {
      map.set(item.checklist_criteria.label, item.level);
    }
  }
  return map;
}

export function groupEvaluationByPhase(
  items: RawEvaluationItem[],
  previousItems?: RawEvaluationItem[] | null
) {
  const clean = items.filter((item) => item.level !== null && item.checklist_criteria);
  const previousMap = buildLevelMap(previousItems);

  const byPhase = new Map<string, EvaluationItemDetail[]>();
  for (const item of clean) {
    const phase = item.checklist_criteria!.phase;
    if (!byPhase.has(phase)) byPhase.set(phase, []);
    byPhase.get(phase)!.push({
      label: item.checklist_criteria!.label,
      level: item.level!,
      comment: item.comment ?? null,
      previousLevel: previousMap.get(item.checklist_criteria!.label) ?? null,
    });
  }

  const totalItems = clean.length;
  const averageLevel =
    totalItems > 0 ? clean.reduce((sum, i) => sum + (i.level ?? 0), 0) / totalItems : 0;

  return { byPhase, totalItems, averageLevel };
}
