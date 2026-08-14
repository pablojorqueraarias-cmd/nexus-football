export interface EvaluationItemDetail {
  label: string;
  level: number;
  comment: string | null;
}

export const PHASE_LABELS: Record<string, string> = {
  general: "General",
  defensiva: "Fase Defensiva",
  ofensiva: "Fase Ofensiva",
};

export const PHASE_ORDER = ["general", "defensiva", "ofensiva"];

export function groupEvaluationByPhase(
  items: {
    level: number | null;
    comment?: string | null;
    checklist_criteria: { label: string; phase: string } | null;
  }[]
) {
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
