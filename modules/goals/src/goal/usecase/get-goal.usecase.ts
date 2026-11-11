import { NotFoundError, UseCase } from "@oitenta/shared";
import { GoalProgressCalculator } from "../model";
import { GoalRepository } from "../provider";
import { GoalHeaderView, StepView, toGoalHeaderView, toStepViews } from "./goal-view";

export interface GetGoalIn {
  userId: string;
  goalId: string;
}

export interface GetGoalOut {
  goal: GoalHeaderView;
  steps: StepView[];
  progressPct: number;
  done: number;
  total: number;
}

export class GetGoal implements UseCase<GetGoalIn, GetGoalOut> {
  constructor(private readonly goalRepository: GoalRepository) {}

  async execute(input: GetGoalIn): Promise<GetGoalOut> {
    const goal = await this.goalRepository.findById(input.userId, input.goalId);
    if (!goal) {
      throw new NotFoundError("Objetivo não encontrado.");
    }

    return {
      goal: toGoalHeaderView(goal),
      steps: toStepViews(goal.steps),
      progressPct: GoalProgressCalculator.goalProgressPct(goal.steps),
      ...GoalProgressCalculator.summary(goal.steps),
    };
  }
}
