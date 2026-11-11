import { Injectable } from '@nestjs/common';
import {
  Goal,
  GoalColorIndex,
  GoalKind,
  GoalRepository,
  GoalSource,
  GoalStatus,
  Step,
  StepStatus,
} from '@oitenta/goals';
import { NotFoundError } from '@oitenta/shared';
import { Goal as GoalRecord, Prisma, Step as StepRecord } from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';

type GoalWithSteps = GoalRecord & { steps: StepRecord[] };

// Todo acesso é escopado pelo dono (userId), inclusive o update (R arquitetura-limpa).
@Injectable()
export class PrismaGoalRepository implements GoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly withSteps = {
    steps: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
  } satisfies Prisma.GoalInclude;

  async create(data: Goal): Promise<Goal> {
    const created = await this.prisma.goal.create({
      data: {
        ...this.toGoalPersistence(data),
        steps: { create: data.steps.map((step) => this.toStepData(step)) },
      },
      include: this.withSteps,
    });
    return this.toDomain(created);
  }

  // Regrava o agregado: cabeçalho do objetivo e todas as etapas.
  async update(data: Goal): Promise<Goal> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const { id, userId, ...header } = this.toGoalPersistence(data);
      const { count } = await tx.goal.updateMany({
        where: { id, userId },
        data: header,
      });
      if (count === 0) {
        throw new NotFoundError('Objetivo não encontrado.');
      }

      await tx.step.deleteMany({ where: { goalId: id } });
      await tx.step.createMany({
        data: data.steps.map((step) => ({
          ...this.toStepData(step),
          goalId: id,
        })),
      });

      return tx.goal.findFirstOrThrow({
        where: { id, userId },
        include: this.withSteps,
      });
    });
    return this.toDomain(updated);
  }

  async findById(userId: string, goalId: string): Promise<Goal | null> {
    const found = await this.prisma.goal.findFirst({
      where: { id: goalId, userId, deletedAt: null },
      include: this.withSteps,
    });
    return found ? this.toDomain(found) : null;
  }

  async findAllByUser(userId: string): Promise<Goal[]> {
    const found = await this.prisma.goal.findMany({
      where: { userId, deletedAt: null },
      include: this.withSteps,
      orderBy: { createdAt: 'asc' },
    });
    return found.map((goal) => this.toDomain(goal));
  }

  private toGoalPersistence(goal: Goal): GoalRecord {
    return {
      id: goal.id,
      userId: goal.userId,
      title: goal.title,
      deadline: goal.deadline,
      kind: goal.kind,
      colorIndex: goal.colorIndex,
      source: goal.source,
      status: goal.status,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      deletedAt: goal.deletedAt ?? null,
    };
  }

  private toStepData(step: Step): Omit<StepRecord, 'goalId'> {
    return {
      id: step.id,
      order: step.order,
      title: step.title,
      estimatedMinutes: step.estimatedMinutes,
      aiEstimatedMinutes: step.aiEstimatedMinutes,
      progressPct: step.progressPct,
      status: step.status,
      microSteps: [...step.microSteps],
      createdAt: step.createdAt,
      updatedAt: step.updatedAt,
      deletedAt: step.deletedAt ?? null,
    };
  }

  private toDomain(raw: GoalWithSteps): Goal {
    return new Goal({
      id: raw.id,
      userId: raw.userId,
      title: raw.title,
      deadline: raw.deadline,
      kind: raw.kind as GoalKind,
      colorIndex: raw.colorIndex as GoalColorIndex,
      source: raw.source as GoalSource,
      status: raw.status as GoalStatus,
      steps: raw.steps.map((step) => this.toStepDomain(step)),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  private toStepDomain(raw: StepRecord): Step {
    return new Step({
      id: raw.id,
      goalId: raw.goalId,
      order: raw.order,
      title: raw.title,
      estimatedMinutes: raw.estimatedMinutes,
      aiEstimatedMinutes: raw.aiEstimatedMinutes,
      progressPct: raw.progressPct,
      status: raw.status as StepStatus,
      microSteps: [...raw.microSteps],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }
}
