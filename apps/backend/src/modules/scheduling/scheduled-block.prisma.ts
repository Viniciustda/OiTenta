import { Injectable } from '@nestjs/common';
import {
  BlockOrigin,
  BlockStatus,
  ScheduledBlock,
  ScheduledBlockRepository,
} from '@oitenta/scheduling';
import { NotFoundError } from '@oitenta/shared';
import { ScheduledBlock as ScheduledBlockRecord } from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';

// Todo acesso é escopado pelo dono (userId), inclusive o update e o recálculo (R arquitetura-limpa).
@Injectable()
export class PrismaScheduledBlockRepository implements ScheduledBlockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserInRange(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<ScheduledBlock[]> {
    const found = await this.prisma.scheduledBlock.findMany({
      where: { userId, deletedAt: null, start: { gte: from, lt: to } },
      orderBy: [{ start: 'asc' }, { end: 'asc' }],
    });
    return found.map((block) => this.toDomain(block));
  }

  async findById(
    userId: string,
    blockId: string,
  ): Promise<ScheduledBlock | null> {
    const found = await this.prisma.scheduledBlock.findFirst({
      where: { id: blockId, userId, deletedAt: null },
    });
    return found ? this.toDomain(found) : null;
  }

  async update(block: ScheduledBlock): Promise<ScheduledBlock> {
    const { count } = await this.prisma.scheduledBlock.updateMany({
      where: { id: block.id, userId: block.userId, deletedAt: null },
      data: {
        goalId: block.goalId,
        stepId: block.stepId,
        start: block.start,
        end: block.end,
        status: block.status,
        pinned: block.pinned,
        origin: block.origin,
        updatedAt: block.updatedAt,
      },
    });
    if (count === 0) {
      throw new NotFoundError('Bloco não encontrado.');
    }
    return block;
  }

  // D 4g: só os blocos futuros planejados, automáticos e não fixados do usuário são refeitos.
  // Os novos são gravados com o userId informado, nunca com o de outro usuário.
  async replaceFutureAutoBlocks(
    userId: string,
    from: Date,
    blocks: ScheduledBlock[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.scheduledBlock.deleteMany({
        where: {
          userId,
          start: { gte: from },
          status: 'planned',
          pinned: false,
          origin: 'auto',
        },
      }),
      this.prisma.scheduledBlock.createMany({
        data: blocks.map((block) => ({ ...this.toPersistence(block), userId })),
      }),
    ]);
  }

  private toPersistence(block: ScheduledBlock): ScheduledBlockRecord {
    return {
      id: block.id,
      userId: block.userId,
      goalId: block.goalId,
      stepId: block.stepId,
      start: block.start,
      end: block.end,
      status: block.status,
      pinned: block.pinned,
      origin: block.origin,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
      deletedAt: block.deletedAt ?? null,
    };
  }

  private toDomain(raw: ScheduledBlockRecord): ScheduledBlock {
    return new ScheduledBlock({
      id: raw.id,
      userId: raw.userId,
      goalId: raw.goalId,
      stepId: raw.stepId,
      start: raw.start,
      end: raw.end,
      status: raw.status as BlockStatus,
      pinned: raw.pinned,
      origin: raw.origin as BlockOrigin,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }
}
