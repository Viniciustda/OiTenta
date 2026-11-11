import { Inject, Injectable } from '@nestjs/common';
import {
  GetGoal,
  GetGoalOut,
  GoalListItem,
  ListGoals,
  StepView,
} from '@oitenta/goals';
import {
  CommitmentBusySource,
  GetGoalsFeasibility,
  GetNextBlocks,
  NextBlockView,
} from '@oitenta/scheduling';
import type { BusySource } from '@oitenta/scheduling';
import { PrismaUserRepository } from '../modules/auth/user.prisma';
import { PrismaGoalRepository } from '../modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../modules/scheduling/scheduled-block.prisma';
import { PrismaWeeklyAvailabilityRepository } from '../modules/scheduling/weekly-availability.prisma';
import { toPlanGoals } from './plan-input';
import { userTimezone } from './user-timezone';

export interface GoalListItemView extends GoalListItem {
  slackDays: number | null;
}

export interface StepWithNextBlockView extends StepView {
  nextBlock?: NextBlockView;
}

export interface GoalDetailView extends Omit<GetGoalOut, 'steps'> {
  steps: StepWithNextBlockView[];
}

// docs/3 §5 (P17): ListGoals → GetGoalsFeasibility (folga de cada objetivo), e o detalhe
// GetGoal + GetNextBlocks (próximo bloco de cada etapa pendente). Só composição.
@Injectable()
export class GoalsViewOrchestrator {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly goalRepository: PrismaGoalRepository,
    private readonly availabilityRepository: PrismaWeeklyAvailabilityRepository,
    private readonly blockRepository: PrismaScheduledBlockRepository,
    @Inject(CommitmentBusySource) private readonly busySource: BusySource,
  ) {}

  async list(userId: string): Promise<{ goals: GoalListItemView[] }> {
    const { goals } = await new ListGoals(this.goalRepository).execute({
      userId,
    });
    const slackByGoal = await this.slackByGoal(userId, goals);
    return {
      goals: goals.map((goal) => ({
        ...goal,
        // Decisão D da C4: objetivo concluído (fora do plano) vem com slackDays null.
        slackDays: slackByGoal.get(goal.id) ?? null,
      })),
    };
  }

  async detail(userId: string, goalId: string): Promise<GoalDetailView> {
    const goal = await new GetGoal(this.goalRepository).execute({
      userId,
      goalId,
    });
    const { byStep } = await new GetNextBlocks(this.blockRepository).execute({
      userId,
      goalId,
      now: new Date(),
    });
    return {
      ...goal,
      steps: goal.steps.map((step) =>
        step.status === 'pending' && byStep[step.id]
          ? { ...step, nextBlock: byStep[step.id] }
          : step,
      ),
    };
  }

  // Sem objetivo ativo não há o que simular: a lista vem sem consultar o plano
  // (assim o usuário que ainda não fez o onboarding recebe a lista vazia, e não 404).
  private async slackByGoal(
    userId: string,
    goals: GoalListItem[],
  ): Promise<Map<string, number | null>> {
    const planGoals = await toPlanGoals(this.goalRepository, userId, goals);
    if (planGoals.length === 0) {
      return new Map();
    }
    const timezone = await userTimezone(this.userRepository, userId);
    const feasibility = await new GetGoalsFeasibility(
      this.availabilityRepository,
      this.blockRepository,
      this.busySource,
    ).execute({ userId, timezone, now: new Date(), goals: planGoals });
    return new Map(
      feasibility.goals.map((goal) => [goal.goalId, goal.slackDays]),
    );
  }
}
