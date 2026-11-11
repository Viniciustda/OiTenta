import type { RampOption, RampResponse, RampStepKind, SessionOutcome } from "../data/activation.types";

// Máquina de estados do modal da rampa (ModalRampa.dc.html): degraus, Trocar, Pular, timer com
// velocidade de demo, pausa do foco, registro (Concluí / Parcial / Não rolou) e celebração.
export const RAMP_ORDER: RampStepKind[] = ["warmup", "challenge", "micro", "focus", "log"];
export const RAMP_NAMES = ["Aquecer", "Desafio", "Micro-passo", "Foco", "Registrar"];
export const RAMP_ICONS = ["person-simple-walk", "calculator", "footprints", "timer", "check-circle"];
const FOCUS = 3;
const LOG = 4;

export type RampPhase = "ramp" | "register" | "celebrate";

export interface RampState {
  stepIndex: number;
  phase: RampPhase;
  optionIndex: number;
  remainingSeconds: number;
  speed: number;
  paused: boolean;
  completedSteps: number;
  focusSeconds: number;
  partialOpen: boolean;
  partialPct: number;
  outcome: SessionOutcome | null;
  goalProgressPct: number | null;
}

export type RampAction =
  | { type: "complete" }
  | { type: "skip" }
  | { type: "swap" }
  | { type: "tick"; seconds: number }
  | { type: "setSpeed"; speed: number }
  | { type: "togglePause" }
  | { type: "togglePartial" }
  | { type: "setPartialPct"; pct: number }
  | { type: "registered"; outcome: SessionOutcome; goalProgressPct: number };

export const stepIndexOf = (kind: RampStepKind) => RAMP_ORDER.indexOf(kind);

const optionsOf = (ramp: RampResponse, i: number): RampOption[] =>
  ramp.steps.find((s) => s.kind === RAMP_ORDER[i])?.options ?? [];

/** Duração do degrau em segundos (a 1ª opção; o Registrar tem 1 min no protótipo). */
export const stepSeconds = (ramp: RampResponse, i: number, optionIndex = 0) =>
  optionsOf(ramp, i)[optionIndex]?.durationSeconds ?? 60;

export function createRampState(ramp: RampResponse): RampState {
  const stepIndex = Math.max(0, stepIndexOf(ramp.suggested));
  return {
    stepIndex,
    phase: stepIndex >= LOG ? "register" : "ramp",
    optionIndex: 0,
    remainingSeconds: stepSeconds(ramp, stepIndex),
    speed: 1,
    paused: false,
    completedSteps: 0,
    focusSeconds: 0,
    partialOpen: false,
    partialPct: 50,
    outcome: null,
    goalProgressPct: null,
  };
}

export const currentOption = (s: RampState, ramp: RampResponse) => optionsOf(ramp, s.stepIndex)[s.optionIndex];

function advance(s: RampState, ramp: RampResponse, earned: boolean): RampState {
  const next = s.stepIndex + 1;
  const completedSteps = s.completedSteps + (earned ? 1 : 0);
  if (next >= LOG) return { ...s, stepIndex: LOG, phase: "register", completedSteps, paused: false };
  return { ...s, stepIndex: next, optionIndex: 0, remainingSeconds: stepSeconds(ramp, next), completedSteps, paused: false };
}

export function rampReducer(s: RampState, a: RampAction, ramp: RampResponse): RampState {
  switch (a.type) {
    case "complete":
      return s.phase === "ramp" ? advance(s, ramp, true) : s;
    case "skip":
      return s.phase === "ramp" ? advance(s, ramp, false) : s;
    case "swap": {
      const n = optionsOf(ramp, s.stepIndex).length;
      if (s.phase !== "ramp" || n < 2) return s;
      const optionIndex = (s.optionIndex + 1) % n;
      return { ...s, optionIndex, remainingSeconds: stepSeconds(ramp, s.stepIndex, optionIndex) };
    }
    case "tick": {
      if (s.phase !== "ramp" || s.paused) return s;
      const dt = a.seconds * s.speed;
      const focusSeconds = s.stepIndex === FOCUS ? s.focusSeconds + Math.min(dt, s.remainingSeconds) : s.focusSeconds;
      const remainingSeconds = s.remainingSeconds - dt;
      if (remainingSeconds <= 0) return advance({ ...s, focusSeconds }, ramp, true);
      return { ...s, remainingSeconds, focusSeconds };
    }
    case "setSpeed":
      return { ...s, speed: a.speed };
    case "togglePause":
      return s.stepIndex === FOCUS ? { ...s, paused: !s.paused } : s;
    case "togglePartial":
      return { ...s, partialOpen: !s.partialOpen };
    case "setPartialPct":
      return { ...s, partialPct: Math.round(Math.max(5, Math.min(95, a.pct)) / 5) * 5 };
    case "registered":
      return { ...s, phase: "celebrate", outcome: a.outcome, goalProgressPct: a.goalProgressPct };
  }
}

/** "02:59" */
export const formatTimer = (seconds: number) => {
  const r = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
};
