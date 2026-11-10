import { UseCase } from "@oitenta/shared";
import { BusySource, WeeklyAvailabilityRepository } from "../../availability/provider";
import { GoalFeasibility, PlanGoalInput, PlanSummary, ScheduledBlock } from "../model";
import { ScheduledBlockRepository } from "../provider";
import { simulatePlan } from "./plan-simulation";

export interface GeneratePlanIn {
  userId: string;
  timezone: string;
  now: Date;
  goals: PlanGoalInput[];
}

export interface GeneratePlanOut {
  blocks: ScheduledBlock[];
  goals: GoalFeasibility[];
  summary: PlanSummary;
}

/** Calcula o plano e troca só os blocos futuros `planned`/não fixados/`auto` (D 4g). */
export class GeneratePlan implements UseCase<GeneratePlanIn, GeneratePlanOut> {
  constructor(
    private readonly availabilityRepository: WeeklyAvailabilityRepository,
    private readonly blockRepository: ScheduledBlockRepository,
    private readonly busySource: BusySource,
  ) {}

  async execute(input: GeneratePlanIn): Promise<GeneratePlanOut> {
    const result = await simulatePlan(
      {
        availabilityRepository: this.availabilityRepository,
        blockRepository: this.blockRepository,
        busySource: this.busySource,
      },
      input,
    );

    const blocks = result.blocks.map(
      (block) =>
        new ScheduledBlock({
          userId: input.userId,
          goalId: block.goalId,
          stepId: block.stepId,
          start: block.start,
          end: block.end,
          status: "planned",
          pinned: false,
          origin: "auto",
        }),
    );
    blocks.forEach((block) => block.validate());

    await this.blockRepository.replaceFutureAutoBlocks(input.userId, input.now, blocks);

    return { blocks, goals: result.goals, summary: result.summary };
  }
}
