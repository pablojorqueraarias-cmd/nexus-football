export interface EvaluationLevel {
  value: number;
  label: string;
  description: string;
}

export const EVALUATION_LEVELS: EvaluationLevel[] = [
  {
    value: 1,
    label: "Iniciación",
    description: "Recién está incorporando el gesto o concepto; necesita guía e indicaciones constantes.",
  },
  {
    value: 2,
    label: "Formación",
    description: "Lo ejecuta con apoyo; está en proceso de consolidarlo como hábito.",
  },
  {
    value: 3,
    label: "Proyección",
    description: "Lo aplica de forma consistente en los entrenamientos.",
  },
  {
    value: 4,
    label: "Competitivo",
    description: "Lo resuelve con solvencia incluso bajo presión de partido.",
  },
  {
    value: 5,
    label: "Óptimo",
    description: "Nivel de referencia para su categoría; puede transmitirlo al resto del equipo.",
  },
];

export function levelLabel(value: number): string {
  return EVALUATION_LEVELS.find((l) => l.value === value)?.label ?? `Nivel ${value}`;
}
