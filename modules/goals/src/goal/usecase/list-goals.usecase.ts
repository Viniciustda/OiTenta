import { UseCase } from "@oitenta/shared";
import { GoalColorIndex, GoalProgressCalculator, GoalStatus } from "../model";
import { GoalRepository } from "../provider";

export interface ListGoalsIn {
  userId: string;
}

export interface GoalListItem {
  id: string;
  title: string;
  deadline: string | null;
  colorIndex: GoalColorIndex;
  progressPct: number;
  done: number;
  total: number;
  status: GoalStatus;
  /** Desempate do plano entre objetivos com o mesmo prazo (PlanGoalInput.createdAt). */
  createdAt: Date;
}

export interface ListGoalsOut {
  goals: GoalListItem[];
}

export class ListGoals implements UseCase<ListGoalsIn, ListGoalsOut> {
  constructor(private readonly goalRepository: GoalRepository) {}

  async execute(input: ListGoalsIn): Promise<ListGoalsOut> {
    const goals = await this.goalRepository.findAllByUser(input.userId);

    return {
      goals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        deadline: goal.deadline,
        colorIndex: goal.colorIndex,
        progressPct: GoalProgressCalculator.goalProgressPct(goal.steps),
        ...GoalProgressCalculator.summary(goal.steps),
        status: goal.status,
        createdAt: goal.createdAt,
      })),
    };
  }
}
