import type { PlanSummary } from "@/modules/core/data/plan-summary.types";

// Tipos de docs/4-contrato-api.md §3.
export type GoalKind = "goal" | "single";
export type GoalStatus = "active" | "done";
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

export interface GetGoalResponse {
  goal: Goal;
  steps: GoalStepDetail[];
  progressPct: number;
  done: number;
  total: number;
}

export interface CreateGoalStepInput {
  title: string;
  estimatedMinutes: number;
  microSteps: string[];
}

export interface CreateGoalInput {
  title: string;
  deadline: string | null;
  kind: GoalKind;
  steps: CreateGoalStepInput[];
}

export interface CreateGoalResponse {
  goal: Goal & { steps: GoalStep[] };
  plan: PlanSummary;
}
