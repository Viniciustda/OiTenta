import type { PlanSummary } from "@/modules/core/data/plan-summary.types";

// Tipos de docs/4-contrato-api.md §5.
export type EnergyLevel = "low" | "medium" | "high" | "electric";
export type AvailableTime = "15m" | "30m" | "1h" | "2h+";
export type RampStepKind = "warmup" | "challenge" | "micro" | "focus" | "log";
export type SessionOutcome = "done" | "partial" | "not_done";

export type ChallengeSymbol = "+" | "−" | "×";
export type ChallengeOperation = ChallengeSymbol | "mix";

export interface ChallengeProblem {
  a: number;
  b: number;
  op: ChallengeSymbol;
}

// Igual ao RampOption do domínio (modules/activation/src/ramp/model/ramp.types.ts).
export interface RampOption {
  id: string;
  stepKind: RampStepKind;
  title: string;
  durationLabel: string;
  durationSeconds?: number;
  description: string;
  icon: string;
  steps?: string[];
  operation?: ChallengeOperation;
  problems?: ChallengeProblem[];
}

export interface RampStep {
  kind: RampStepKind;
  options: RampOption[];
}

export interface RampResponse {
  steps: RampStep[];
  suggested: RampStepKind;
}

export interface GetRampInput {
  goalId: string;
  stepId: string;
  energy: EnergyLevel;
  availableTime?: AvailableTime | null;
}

export interface RecordSessionInput {
  goalId: string;
  stepId: string;
  /** Opcional no corpo: sem bloco (rampa aberta fora da timeline), o campo não é enviado. */
  blockId?: string | null;
  energy: EnergyLevel;
  availableTime: AvailableTime | null;
  startedAt: string;
  endedAt: string;
  focusedMinutes: number;
  outcome: SessionOutcome;
  partialPct: number | null;
}

export interface FocusSession extends RecordSessionInput {
  id: string;
}

export interface RecordSessionResponse {
  session: FocusSession;
  step: { progressPct: number; status: "pending" | "done" };
  goalProgressPct: number;
  plan: PlanSummary;
}
