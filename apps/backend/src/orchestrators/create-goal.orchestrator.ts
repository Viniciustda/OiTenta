import { Inject, Injectable } from '@nestjs/common';
import { CreateGoal, CreateGoalIn, GoalView } from '@oitenta/goals';
import {
  CommitmentBusySource,
  GetWeeklyAvailability,
} from '@oitenta/scheduling';
import type { BusySource } from '@oitenta/scheduling';
import { PrismaUserRepository } from '../modules/auth/user.prisma';
import { PrismaGoalRepository } from '../modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../modules/scheduling/scheduled-block.prisma';
import { PrismaWeeklyAvailabilityRepository } from '../modules/scheduling/weekly-availability.prisma';
import { PlanView } from './plan-input';
import { regeneratePlan } from './plan-regeneration';
import { userTimezone } from './user-timezone';

export interface CreateGoalOrchestratorOut {
  goal: GoalView;
  plan: PlanView;
}

// docs/3 §5: CreateGoal → (ListGoals + GetGoal) → GeneratePlan.
// A disponibilidade é lida antes de gravar: sem ela o plano daria 404 (P12) com o objetivo já criado.
@Injectable()
export class CreateGoalOrchestrator {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly goalRepository: PrismaGoalRepository,
    private readonly availabilityRepository: PrismaWeeklyAvailabilityRepository,
    private readonly blockRepository: PrismaScheduledBlockRepository,
    @Inject(CommitmentBusySource) private readonly busySource: BusySource,
  ) {}

  async execute(input: CreateGoalIn): Promise<CreateGoalOrchestratorOut> {
    const timezone = await userTimezone(this.userRepository, input.userId);
    await new GetWeeklyAvailability(this.availabilityRepository).execute({
      userId: input.userId,
    });
    const { goal } = await new CreateGoal(this.goalRepository).execute(input);
    const plan = await regeneratePlan(
      {
        goalRepository: this.goalRepository,
        availabilityRepository: this.availabilityRepository,
        blockRepository: this.blockRepository,
        busySource: this.busySource,
      },
      input.userId,
      timezone,
    );
    return { goal, plan };
  }
}
