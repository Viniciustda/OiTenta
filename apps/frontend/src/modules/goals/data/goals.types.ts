import type { PlanSummary } from "@/modules/core/data/plan-summary.types";

// Tipos de docs/4-contrato-api.md §3.
export type GoalKind = "goal" | "single";
export type GoalStatus = "active" | "done";
export type GoalSource = "manual" | "ai";
export type StepStatus = "pending" | "done" | "superseded";

export interface GoalStep {
  id: string;
  order: number;
  title: string;
  estimatedMinutes: number;
  progressPct: number;
  status: StepStatus;
  microSteps: string[];
}

export interface Goal {
  id: string;
  title: string;
  deadline: string | null;
  kind: GoalKind;
  colorIndex: number;
  progressPct: number;
  status: GoalStatus;
}

export interface GoalListItem {
  id: string;
  title: string;
  deadline: string | null;
  colorIndex: number;
  progressPct: number;
  done: number;
  total: number;
  status: GoalStatus;
  /** null quando o objetivo está done. */
  slackDays: number | null;
  /** Instante ISO da criação. */
  createdAt: string;
}

export interface ListGoalsResponse {
  goals: GoalListItem[];
}

export interface StepNextBlock {
  id: string;
  start: string;
  end: string;
}

export interface GoalStepDetail {
  id: string;
  order: number;
  title: string;
  estimatedMinutes: number;
  progressPct: number;
  status: StepStatus;
  remainingMinutes: number;
  nextBlock?: StepNextBlock;
}

/** Cabeçalho do objetivo em GET /goals/:goalId (GoalHeaderResponse do backend): sem progressPct, que vem na raiz. */
export interface GoalHeader {
  id: string;
  title: string;
  deadline: string | null;
  kind: GoalKind;
  colorIndex: number;
  source: GoalSource;
  status: GoalStatus;
}

export interface GetGoalResponse {
  goal: GoalHeader;
  steps: GoalStepDetail[];
  progressPct: number;
  done: number;
  total: number;
}

export interface CreateGoalStepInput {
  title: string;
  estimatedMinutes: number;
  /** Estimativa original da IA (IA1); null na etapa acrescentada pelo usuário. Ausente no objetivo manual. */
  aiEstimatedMinutes?: number | null;
  microSteps: string[];
}

export interface CreateGoalInput {
  title: string;
  deadline: string | null;
  kind: GoalKind;
  /** "ai" quando veio do rascunho da IA (IA1); ausente = "manual" no backend. */
  source?: GoalSource;
  steps: CreateGoalStepInput[];
}

// POST /goals/assistant/draft (IA1, docs/4-contrato-api.md §3).
export type GoalCategory = "assignment" | "exam" | "project" | "generic";
export type GoalDraftField = "title" | "deadline";
export type AssistantEngine = "llm" | "rules";

export interface GoalDraftStep {
  title: string;
  estimatedMinutes: number;
  aiEstimatedMinutes: number;
  microSteps: string[];
}

export interface GoalDraft {
  title: string | null;
  /** YYYY-MM-DD ou null quando o texto não traz prazo (IA2). */
  deadline: string | null;
  category: GoalCategory;
  requirements: string[];
  /** Informativo (IA2): a W30 mostra o campo vazio. */
  missingFields: GoalDraftField[];
  steps: GoalDraftStep[];
  totalMinutes: number;
}

export interface DraftGoalResponse {
  draft: GoalDraft;
  engine: AssistantEngine;
}

export interface CreateGoalResponse {
  goal: Goal & { steps: GoalStep[] };
  plan: PlanSummary;
}
