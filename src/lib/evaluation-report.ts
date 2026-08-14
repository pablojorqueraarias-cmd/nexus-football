export interface EvaluationItemDetail {
  label: string;
  highlight: boolean;
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
    highlight: boolean | null;
    comment?: string | null;
    checklist_criteria: { label: string; phase: string } | null;
  }[]
) {
  const clean = items.filter((item) => item.highlight !== null && item.checklist_criteria);

  const byPhase = new Map<string, EvaluationItemDetail[]>();
  for (const item of clean) {
    const phase = item.checklist_criteria!.phase;
    if (!byPhase.has(phase)) byPhase.set(phase, []);
    byPhase.get(phase)!.push({
      label: item.checklist_criteria!.label,
      highlight: item.highlight!,
      comment: item.comment ?? null,
    });
  }

  const totalItems = clean.length;
  const totalHighlighted = clean.filter((i) => i.highlight).length;

  return { byPhase, totalItems, totalHighlighted };
}
