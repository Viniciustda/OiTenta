import { Inject, Injectable } from '@nestjs/common';
import {
  AvailabilityWindow,
  CommitmentBusySource,
  SetWeeklyAvailability,
  WeeklyAvailability,
} from '@oitenta/scheduling';
import type { BusySource } from '@oitenta/scheduling';
import { PrismaUserRepository } from '../modules/auth/user.prisma';
import { PrismaGoalRepository } from '../modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../modules/scheduling/scheduled-block.prisma';
import { PrismaWeeklyAvailabilityRepository } from '../modules/scheduling/weekly-availability.prisma';
import { PlanView } from './plan-input';
import { regeneratePlan } from './plan-regeneration';
import { userTimezone } from './user-timezone';

export interface SetAvailabilityIn {
  userId: string;
  windows: AvailabilityWindow[];
  dailyLimitMinutes: number;
}

export interface SetAvailabilityOut {
  availability: WeeklyAvailability;
  plan: PlanView;
}

// docs/3 §5: SetWeeklyAvailability → GeneratePlan (onboarding).
@Injectable()
export class SetAvailabilityOrchestrator {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly goalRepository: PrismaGoalRepository,
    private readonly availabilityRepository: PrismaWeeklyAvailabilityRepository,
    private readonly blockRepository: PrismaScheduledBlockRepository,
    @Inject(CommitmentBusySource) private readonly busySource: BusySource,
  ) {}

  async execute(input: SetAvailabilityIn): Promise<SetAvailabilityOut> {
    const timezone = await userTimezone(this.userRepository, input.userId);
    const { availability } = await new SetWeeklyAvailability(
      this.availabilityRepository,
    ).execute(input);
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
    return { availability, plan };
  }
}
