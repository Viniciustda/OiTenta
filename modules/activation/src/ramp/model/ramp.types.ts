export const ENERGY_LEVELS = ["low", "medium", "high", "electric"] as const;
export type EnergyLevel = (typeof ENERGY_LEVELS)[number];

export const AVAILABLE_TIMES = ["15m", "30m", "1h", "2h+"] as const;
export type AvailableTime = (typeof AVAILABLE_TIMES)[number];

export const RAMP_STEP_KINDS = [
  "warmup",
  "challenge",
  "micro",
  "focus",
  "log",
] as const;
export type RampStepKind = (typeof RAMP_STEP_KINDS)[number];

export type ChallengeSymbol = "+" | "−" | "×";
export type ChallengeOperation = ChallengeSymbol | "mix";

export interface ChallengeProblem {
  a: number;
  b: number;
  op: ChallengeSymbol;
}

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

/** Texto genérico do micro-passo quando a etapa não tem micro-passos (P6, provisório). */
export const GENERIC_MICRO_STEP =
  "Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase.";
