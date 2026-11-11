import { UseCase } from "@oitenta/shared";
import { BusySource, WeeklyAvailabilityRepository } from "../../availability/provider";
import { PlanGoalInput } from "../model";
import { ScheduledBlockRepository } from "../provider";
import { simulatePlan } from "./plan-simulation";

export interface GetGoalsFeasibilityIn {
  userId: string;
  timezone: string;
  now: Date;
  goals: PlanGoalInput[];
}

export interface GoalFeasibilityView {
  goalId: string;
  feasible: boolean;
  slackDays: number | null;
  unscheduledMinutes: number;
}

export interface GetGoalsFeasibilityOut {
  goals: GoalFeasibilityView[];
}

/** Viabilidade e folga de cada objetivo, calculadas sem gravar (modo simulação, D 4g). */
export class GetGoalsFeasibility
  implements UseCase<GetGoalsFeasibilityIn, GetGoalsFeasibilityOut>
{
  constructor(
    private readonly availabilityRepository: WeeklyAvailabilityRepository,
    private readonly blockRepository: ScheduledBlockRepository,
    private readonly busySource: BusySource,
  ) {}

  async execute(input: GetGoalsFeasibilityIn): Promise<GetGoalsFeasibilityOut> {
    const result = await simulatePlan(
      {
        availabilityRepository: this.availabilityRepository,
        blockRepository: this.blockRepository,
        busySource: this.busySource,
      },
      input,
    );

    return {
      goals: result.goals.map((goal) => ({
        goalId: goal.goalId,
        feasible: goal.feasible,
        slackDays: goal.slackDays,
        unscheduledMinutes: goal.unscheduledMinutes,
      })),
    };
  }
}
