import { Inject, Injectable } from '@nestjs/common';
import {
  AvailableTime,
  BuildRamp,
  BuildRampOut,
  EnergyLevel,
  FixedRampOptionSource,
} from '@oitenta/activation';
import type { RampOptionSource } from '@oitenta/activation';
import { GetGoal } from '@oitenta/goals';
import { NotFoundError } from '@oitenta/shared';
import { PrismaGoalRepository } from '../modules/goals/goal.prisma';

export interface RampIn {
  userId: string;
  goalId: string;
  stepId: string;
  energy: EnergyLevel;
  availableTime?: AvailableTime | null;
}

// docs/3 §5: GetGoal (micro-passos da etapa) → BuildRamp. Só encadeia casos de uso.
@Injectable()
export class RampOrchestrator {
  constructor(
    private readonly goalRepository: PrismaGoalRepository,
    @Inject(FixedRampOptionSource)
    private readonly rampOptionSource: RampOptionSource,
  ) {}

  async execute(input: RampIn): Promise<BuildRampOut> {
    const { steps } = await new GetGoal(this.goalRepository).execute({
      userId: input.userId,
      goalId: input.goalId,
    });
    const step = steps.find((item) => item.id === input.stepId);
    if (!step) {
      // Mesma mensagem do UpdateStepProgress para a etapa que não é do objetivo.
      throw new NotFoundError('Etapa não encontrada.');
    }
    return new BuildRamp(this.rampOptionSource).execute({
      userId: input.userId,
      energy: input.energy,
      availableTime: input.availableTime ?? null,
      microSteps: step.microSteps,
    });
  }
}
