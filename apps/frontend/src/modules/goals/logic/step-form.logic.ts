import type { CreateGoalInput, GoalDraft, GoalSource } from "../data/goals.types";

// Formulário do novo objetivo: W30 (ModalNovoObjetivo.dc.html, passo "result"), começando vazia no
// objetivo manual (P20) ou preenchida pelo rascunho da IA (IA1).
export interface StepDraft {
  key: string;
  title: string;
  minutes: number;
  /** Estimativa original da IA; null na etapa acrescentada pelo usuário ou no objetivo manual. */
  aiMinutes: number | null;
  microSteps: string[];
}

export interface GoalForm {
  title: string;
  /** YYYY-MM-DD ou "" (sem prazo, P3). */
  deadline: string;
  /** "ai" quando a W30 veio preenchida pelo rascunho da IA. */
  source: GoalSource;
  /** "A IA achou" (W30): só no rascunho da IA. */
  requirements: string[];
  steps: StepDraft[];
}

export type GoalFormError = "title.required" | "title.max" | "steps.required" | "step.title.required" | "step.title.max";

const MIN = 15;
const MAX = 240;
let seq = 0;

export const emptyGoalForm = (): GoalForm => ({ title: "", deadline: "", source: "manual", requirements: [], steps: [] });

/** W30 preenchida pelo rascunho da IA; título ou prazo ausentes ficam vazios (IA2). */
export const formFromDraft = (d: GoalDraft): GoalForm => ({
  title: d.title ?? "",
  deadline: d.deadline ?? "",
  source: "ai",
  requirements: [...d.requirements],
  steps: d.steps.map((s) => ({
    key: `k${++seq}`, title: s.title, minutes: s.estimatedMinutes, aiMinutes: s.aiEstimatedMinutes, microSteps: [...s.microSteps],
  })),
});

export const totalMinutes = (steps: StepDraft[]) => steps.reduce((a, s) => a + s.minutes, 0);

export const addStep = (f: GoalForm): GoalForm => ({
  ...f,
  steps: [...f.steps, { key: `k${++seq}`, title: "Nova etapa", minutes: 30, aiMinutes: null, microSteps: [] }],
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

/** Corpo do POST /goals. O objetivo manual continua sem source e sem aiEstimatedMinutes (padrão manual/null). */
export function toCreateGoalInput(f: GoalForm): CreateGoalInput {
  const base = { title: f.title.trim(), deadline: f.deadline || null, kind: "goal" as const };
  if (f.source !== "ai") {
    return { ...base, steps: f.steps.map((s) => ({ title: s.title.trim(), estimatedMinutes: s.minutes, microSteps: [] })) };
  }
  return {
    ...base,
    source: "ai",
    steps: f.steps.map((s) => ({ title: s.title.trim(), estimatedMinutes: s.minutes, aiEstimatedMinutes: s.aiMinutes, microSteps: s.microSteps })),
  };
}
