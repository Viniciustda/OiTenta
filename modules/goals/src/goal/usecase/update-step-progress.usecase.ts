import { NotFoundError, UseCase } from "@oitenta/shared";
import { GoalProgressCalculator } from "../model";
import { GoalRepository } from "../provider";
import { StepView, toStepView } from "./goal-view";

export interface UpdateStepProgressIn {
  userId: string;
  goalId: string;
  stepId: string;
  progressPct: number;
}

export interface UpdateStepProgressOut {
  goalProgressPct: number;
  step: StepView;
}

export class UpdateStepProgress
  implements UseCase<UpdateStepProgressIn, UpdateStepProgressOut>
{
  constructor(private readonly goalRepository: GoalRepository) {}

  async execute(input: UpdateStepProgressIn): Promise<UpdateStepProgressOut> {
    const goal = await this.goalRepository.findById(input.userId, input.goalId);
    if (!goal) {
      throw new NotFoundError("Objetivo não encontrado.");
    }

    const step = goal.findStep(input.stepId);
    if (!step) {
      throw new NotFoundError("Etapa não encontrada.");
    }

    const updatedStep = step.withProgress(input.progressPct);
    const updatedGoal = goal.withStep(updatedStep);
    updatedGoal.validate();

    await this.goalRepository.update(updatedGoal);

    return {
      goalProgressPct: GoalProgressCalculator.goalProgressPct(updatedGoal.steps),
      step: toStepView(updatedStep),
    };
  }
}
