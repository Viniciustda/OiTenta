import type { CreateGoalInput } from "../data/goals.types";

// Formulário do novo objetivo manual: W30 (ModalNovoObjetivo.dc.html, passo "result") começando vazia (P20).
export interface StepDraft {
  key: string;
  title: string;
  minutes: number;
}

export interface GoalForm {
  title: string;
  /** YYYY-MM-DD ou "" (sem prazo, P3). */
  deadline: string;
  steps: StepDraft[];
}

export type GoalFormError = "title.required" | "title.max" | "steps.required" | "step.title.required" | "step.title.max";

const MIN = 15;
const MAX = 240;
let seq = 0;

export const emptyGoalForm = (): GoalForm => ({ title: "", deadline: "", steps: [] });

export const totalMinutes = (steps: StepDraft[]) => steps.reduce((a, s) => a + s.minutes, 0);

export const addStep = (f: GoalForm): GoalForm => ({
  ...f,
  steps: [...f.steps, { key: `k${++seq}`, title: "Nova etapa", minutes: 30 }],
});

export const removeStep = (f: GoalForm, key: string): GoalForm => ({ ...f, steps: f.steps.filter((s) => s.key !== key) });

export const renameStep = (f: GoalForm, key: string, title: string): GoalForm => ({
  ...f,
  steps: f.steps.map((s) => (s.key === key ? { ...s, title } : s)),
});

export const changeMinutes = (f: GoalForm, key: string, delta: number): GoalForm => ({
  ...f,
  steps: f.steps.map((s) => (s.key === key ? { ...s, minutes: Math.max(MIN, Math.min(MAX, s.minutes + delta)) } : s)),
});

export function validateGoalForm(f: GoalForm): GoalFormError[] {
  const errors: GoalFormError[] = [];
  const title = f.title.trim();
  if (!title) errors.push("title.required");
  else if (title.length > 120) errors.push("title.max");
  if (!f.steps.length) errors.push("steps.required");
  if (f.steps.some((s) => !s.title.trim())) errors.push("step.title.required");
  if (f.steps.some((s) => s.title.trim().length > 120)) errors.push("step.title.max");
  return errors;
}

export const ERROR_MESSAGES: Record<GoalFormError, string> = {
  "title.required": "Dá um nome pro objetivo.",
  "title.max": "O nome do objetivo pode ter até 120 caracteres.",
  "steps.required": "Adiciona pelo menos uma etapa.",
  "step.title.required": "Toda etapa precisa de um nome.",
  "step.title.max": "O nome da etapa pode ter até 120 caracteres.",
};

export const toCreateGoalInput = (f: GoalForm): CreateGoalInput => ({
  title: f.title.trim(),
  deadline: f.deadline || null,
  kind: "goal",
  steps: f.steps.map((s) => ({ title: s.title.trim(), estimatedMinutes: s.minutes, microSteps: [] })),
});
