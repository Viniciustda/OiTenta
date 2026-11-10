import { InRule, RequiredRule, UseCase, Validator } from "@oitenta/shared";
import {
  AvailableTime,
  ENERGY_LEVELS,
  EnergyLevel,
  GENERIC_MICRO_STEP,
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

function microOptions(microSteps: string[]): RampOption[] {
  const texts = microSteps.length > 0 ? microSteps : [GENERIC_MICRO_STEP];

  return texts.map((text, index) => ({
    id: `micro-${index + 1}`,
    stepKind: "micro",
    title: text,
    durationLabel: "1 min",
    description: "Micro-passo",
    icon: "footprints",
  }));
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
      const options =
        kind === "micro"
          ? microOptions(input.microSteps)
          : await this.rampOptionSource.listOptions(input.userId, kind);
      steps.push({ kind, options });
    }

    return {
      steps,
      suggested: this.rampSuggestion.suggestedStep(input.energy),
    };
  }
}
