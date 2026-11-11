import { Injectable } from '@nestjs/common';
import { GetDayPlan } from '@oitenta/scheduling';
import { PrismaUserRepository } from '../modules/auth/user.prisma';
import { PrismaGoalRepository } from '../modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../modules/scheduling/scheduled-block.prisma';
import { PrismaWeeklyAvailabilityRepository } from '../modules/scheduling/weekly-availability.prisma';
import { DayPlanView, loadGoalsOf, toDayPlanView } from './plan-block-view';
import { userTimezone } from './user-timezone';

export interface DayViewIn {
  userId: string;
  date: string;
}

// docs/3 §5: GetDayPlan + títulos dos objetivos e etapas (tela Hoje). Só encadeia casos de uso.
@Injectable()
export class DayViewOrchestrator {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly goalRepository: PrismaGoalRepository,
    private readonly blockRepository: PrismaScheduledBlockRepository,
    private readonly availabilityRepository: PrismaWeeklyAvailabilityRepository,
  ) {}

  async execute(input: DayViewIn): Promise<DayPlanView> {
    const timezone = await userTimezone(this.userRepository, input.userId);
    const day = await new GetDayPlan(
      this.blockRepository,
      this.availabilityRepository,
    ).execute({ userId: input.userId, date: input.date, timezone });
    const goals = await loadGoalsOf(this.goalRepository, input.userId, [day]);
    return toDayPlanView(day, goals);
  }
}
