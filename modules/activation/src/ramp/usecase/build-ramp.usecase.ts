import { InRule, RequiredRule, UseCase, Validator } from "@oitenta/shared";
import {
  AvailableTime,
  ENERGY_LEVELS,
  EnergyLevel,
  RAMP_STEP_KINDS,
  RampOption,
  RampStepKind,
  RampSuggestion,
} from "../model";
import { RampOptionSource } from "../provider";

export interface BuildRampIn {
  userId: string;
  energy: EnergyLevel;
  /** Só gravado na sessão nesta fase, sem efeito na rampa (P15). */
  availableTime?: AvailableTime | null;
  microSteps: string[];
}

export interface RampStep {
  kind: RampStepKind;
  options: RampOption[];
}

export interface BuildRampOut {
  steps: RampStep[];
  suggested: RampStepKind;
}

export class BuildRamp implements UseCase<BuildRampIn, BuildRampOut> {
  private readonly rampSuggestion = new RampSuggestion();

  constructor(private readonly rampOptionSource: RampOptionSource) {}

  async execute(input: BuildRampIn): Promise<BuildRampOut> {
    Validator.validate([
      {
        code: "ramp.energy",
        value: input.energy,
        rules: [new RequiredRule(), new InRule(ENERGY_LEVELS)],
      },
    ]);

    const steps: RampStep[] = [];
    for (const kind of RAMP_STEP_KINDS) {
      const options = await this.rampOptionSource.listOptions(
        input.userId,
        kind,
        input.microSteps,
      );
      steps.push({ kind, options });
    }

    return {
      steps,
      suggested: this.rampSuggestion.suggestedStep(input.energy),
    };
  }
}
