import { Injectable } from '@nestjs/common';
import {
  AvailableTime,
  EnergyLevel,
  FocusSession,
  FocusSessionOutcome,
  FocusSessionRepository,
} from '@oitenta/activation';
import { FocusSession as FocusSessionRecord } from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';

// Toda leitura é escopada pelo dono (userId) e ignora sessões excluídas (R arquitetura-limpa).
@Injectable()
export class PrismaFocusSessionRepository implements FocusSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: FocusSession): Promise<FocusSession> {
    const created = await this.prisma.focusSession.create({
      data: this.toPersistence(session),
    });
    return this.toDomain(created);
  }

  async findAllByUserAndStep(
    userId: string,
    stepId: string,
  ): Promise<FocusSession[]> {
    const found = await this.prisma.focusSession.findMany({
      where: { userId, stepId, deletedAt: null },
      orderBy: [{ startedAt: 'asc' }, { createdAt: 'asc' }],
    });
    return found.map((session) => this.toDomain(session));
  }

  private toPersistence(session: FocusSession): FocusSessionRecord {
    return {
      id: session.id,
      userId: session.userId,
      goalId: session.goalId,
      stepId: session.stepId,
      blockId: session.blockId,
      energy: session.energy,
      availableTime: session.availableTime,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      focusedMinutes: session.focusedMinutes,
      outcome: session.outcome,
      partialPct: session.partialPct,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      deletedAt: session.deletedAt ?? null,
    };
  }

  private toDomain(raw: FocusSessionRecord): FocusSession {
    return new FocusSession({
      id: raw.id,
      userId: raw.userId,
      goalId: raw.goalId,
      stepId: raw.stepId,
      blockId: raw.blockId,
      energy: raw.energy as EnergyLevel,
      availableTime: raw.availableTime as AvailableTime | null,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      focusedMinutes: raw.focusedMinutes,
      outcome: raw.outcome as FocusSessionOutcome,
      partialPct: raw.partialPct,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }
}
