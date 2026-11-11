import { ListGoals } from '@oitenta/goals';
import { GeneratePlan, BusySource } from '@oitenta/scheduling';
import { PrismaGoalRepository } from '../modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../modules/scheduling/scheduled-block.prisma';
import { PrismaWeeklyAvailabilityRepository } from '../modules/scheduling/weekly-availability.prisma';
import { PlanView, toPlanGoals, toPlanView } from './plan-input';

export interface PlanRegenerationDeps {
  goalRepository: PrismaGoalRepository;
  availabilityRepository: PrismaWeeklyAvailabilityRepository;
  blockRepository: PrismaScheduledBlockRepository;
  busySource: BusySource;
}

// Passo final comum de set-availability, create-goal e record-progress:
// ListGoals + GetGoal (entrada) → GeneratePlan.
export async function regeneratePlan(
  deps: PlanRegenerationDeps,
  userId: string,
  timezone: string,
): Promise<PlanView> {
  const { goals } = await new ListGoals(deps.goalRepository).execute({
    userId,
  });
  const planGoals = await toPlanGoals(deps.goalRepository, userId, goals);
  const plan = await new GeneratePlan(
    deps.availabilityRepository,
    deps.blockRepository,
    deps.busySource,
  ).execute({ userId, timezone, now: new Date(), goals: planGoals });
  return toPlanView(plan);
}
