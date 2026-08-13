export interface EvaluationItemDetail {
  label: string;
  meets: boolean;
}

export const PHASE_LABELS: Record<string, string> = {
  general: "General",
  defensiva: "Fase Defensiva",
  ofensiva: "Fase Ofensiva",
};

export const PHASE_ORDER = ["general", "defensiva", "ofensiva"];

export function groupEvaluationByPhase(
  items: { meets: boolean | null; checklist_criteria: { label: string; phase: string } | null }[]
) {
  const clean = items.filter((item) => item.meets !== null && item.checklist_criteria);

  const byPhase = new Map<string, EvaluationItemDetail[]>();
  for (const item of clean) {
    const phase = item.checklist_criteria!.phase;
    if (!byPhase.has(phase)) byPhase.set(phase, []);
    byPhase.get(phase)!.push({ label: item.checklist_criteria!.label, meets: item.meets! });
  }

  const totalMet = clean.filter((i) => i.meets).length;

  return { byPhase, totalItems: clean.length, totalMet };
}
