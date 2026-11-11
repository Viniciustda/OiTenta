import { EnergyLevel, RampStepKind } from "./ramp.types";

const SUGGESTED_STEP_BY_ENERGY: Record<EnergyLevel, RampStepKind> = {
  low: "warmup",
  medium: "challenge",
  high: "micro",
  electric: "focus",
};

export class RampSuggestion {
  suggestedStep(energy: EnergyLevel): RampStepKind {
    return SUGGESTED_STEP_BY_ENERGY[energy];
  }
}
