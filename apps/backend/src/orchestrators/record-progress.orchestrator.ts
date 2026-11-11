import { Inject, Injectable } from '@nestjs/common';
import {
  AvailableTime,
  EnergyLevel,
  FocusSession,
  FocusSessionOutcome,
  RecordFocusSession,
} from '@oitenta/activation';
import { GetGoal, StepView, UpdateStepProgress } from '@oitenta/goals';
import {
  BlockOutcome,
  CommitmentBusySource,
  GetBlock,
  RecordBlockOutcome,
} from '@oitenta/scheduling';
import type { BusySource } from '@oitenta/scheduling';
import { NotFoundError } from '@oitenta/shared';
import { PrismaFocusSessionRepository } from '../modules/activation/focus-session.prisma';
import { PrismaUserRepository } from '../modules/auth/user.prisma';
import { PrismaGoalRepository } from '../modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../modules/scheduling/scheduled-block.prisma';
import { PrismaWeeklyAvailabilityRepository } from '../modules/scheduling/weekly-availability.prisma';
import { PlanView } from './plan-input';
import { regeneratePlan } from './plan-regeneration';
import { userTimezone } from './user-timezone';

export interface RecordProgressIn {
  userId: string;
  goalId: string;
  stepId: string;
  blockId?: string | null;
  energy: EnergyLevel;
  availableTime?: AvailableTime | null;
  startedAt: Date;
  endedAt: Date;
  focusedMinutes: number;
  outcome: FocusSessionOutcome;
  partialPct?: number | null;
}

export interface RecordProgressOut {
  session: FocusSession;
  step: StepView;
  goalProgressPct: number;
  plan: PlanView;
}

// docs/3 §5 (registrar da rampa), com a decisão C da C4: a posse do objetivo, da etapa e do
// bloco é conferida por leitura ANTES de qualquer escrita; depois RecordFocusSession →
// UpdateStepProgress → RecordBlockOutcome (se houver bloco) → GeneratePlan.
const STEP_PROGRESS: Record<
  FocusSessionOutcome,
  (input: RecordProgressIn) => number | null
> = {
  done: () => 100,
  partial: (input) => input.partialPct ?? null,
  not_done: () => null,
};

const BLOCK_OUTCOME: Record<FocusSessionOutcome, BlockOutcome> = {
  done: 'done',
  partial: 'partial',
  not_done: 'missed',
};

@Injectable()
export class RecordProgressOrchestrator {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly goalRepository: PrismaGoalRepository,
    private readonly availabilityRepository: PrismaWeeklyAvailabilityRepository,
    private readonly blockRepository: PrismaScheduledBlockRepository,
    private readonly focusSessionRepository: PrismaFocusSessionRepository,
    @Inject(CommitmentBusySource) private readonly busySource: BusySource,
  ) {}

  async execute(input: RecordProgressIn): Promise<RecordProgressOut> {
    const { userId, goalId, stepId } = input;
    const timezone = await userTimezone(this.userRepository, userId);
    const current = await new GetGoal(this.goalRepository).execute({
      userId,
      goalId,
    });
    const currentStep = current.steps.find((step) => step.id === stepId);
    if (!currentStep) {
      throw new NotFoundError('Etapa não encontrada.');
    }
    if (input.blockId) {
      const { block } = await new GetBlock(this.blockRepository).execute({
        userId,
        blockId: input.blockId,
      });
      // Bloco do próprio usuário, mas de outra etapa: mesmo 404 do bloco inexistente.
      if (block.goalId !== goalId || block.stepId !== stepId) {
        throw new NotFoundError('Bloco não encontrado.');
      }
    }

    const { session } = await new RecordFocusSession(
      this.focusSessionRepository,
    ).execute(input);

    let step = currentStep;
    let goalProgressPct = current.progressPct;
    const progressPct = STEP_PROGRESS[input.outcome](input);
    if (progressPct !== null) {
      const updated = await new UpdateStepProgress(this.goalRepository).execute(
        { userId, goalId, stepId, progressPct },
      );
      step = updated.step;
      goalProgressPct = updated.goalProgressPct;
    }

    if (input.blockId) {
      await new RecordBlockOutcome(this.blockRepository).execute({
        userId,
        blockId: input.blockId,
        outcome: BLOCK_OUTCOME[input.outcome],
      });
    }

    const plan = await regeneratePlan(
      {
        goalRepository: this.goalRepository,
        availabilityRepository: this.availabilityRepository,
        blockRepository: this.blockRepository,
        busySource: this.busySource,
      },
      userId,
      timezone,
    );
    return { session, step, goalProgressPct, plan };
  }
}
