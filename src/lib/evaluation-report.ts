export interface EvaluationItemDetail {
  label: string;
  score: number;
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
    score: number | null;
    comment?: string | null;
    checklist_criteria: { label: string; phase: string } | null;
  }[]
) {
  const clean = items.filter((item) => item.score !== null && item.checklist_criteria);

  const byPhase = new Map<string, EvaluationItemDetail[]>();
  for (const item of clean) {
    const phase = item.checklist_criteria!.phase;
    if (!byPhase.has(phase)) byPhase.set(phase, []);
    byPhase.get(phase)!.push({
      label: item.checklist_criteria!.label,
      score: item.score!,
      comment: item.comment ?? null,
    });
  }

  const totalItems = clean.length;
  const averageScore =
    totalItems > 0 ? clean.reduce((sum, i) => sum + (i.score ?? 0), 0) / totalItems : 0;

  return { byPhase, totalItems, averageScore };
}
