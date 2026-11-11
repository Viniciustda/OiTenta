import type { PlanSummary } from "@/modules/core/data/plan-summary.types";

// Tipos de docs/4-contrato-api.md §2 e §4.
export interface AvailabilityWindow {
  /** 0 = segunda … 6 = domingo */
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface WeeklyAvailability {
  windows: AvailabilityWindow[];
  dailyLimitMinutes: number;
}

export interface SetAvailabilityResponse {
  availability: WeeklyAvailability;
  plan: PlanSummary;
}

export interface GetAvailabilityResponse {
  availability: WeeklyAvailability;
}

export type BlockStatus = "planned" | "done" | "partial" | "missed";

export interface PlanBlock {
  id: string;
  start: string;
  end: string;
  status: BlockStatus;
  goalId: string;
  goalTitle: string;
  colorIndex: number;
  stepId: string;
  stepTitle: string;
}

export interface DayPlan {
  date: string;
  blocks: PlanBlock[];
  usedMinutes: number;
  limitMinutes: number;
}

export interface WeekPlanResponse {
  days: DayPlan[];
}
