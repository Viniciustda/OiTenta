import { Injectable } from '@nestjs/common';
import {
  AvailabilityWindow,
  WeeklyAvailability,
  WeeklyAvailabilityRepository,
} from '@oitenta/scheduling';
import {
  Prisma,
  WeeklyAvailability as WeeklyAvailabilityRecord,
} from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';

// Uma disponibilidade por usuário (userId único); todo acesso é escopado pelo dono.
@Injectable()
export class PrismaWeeklyAvailabilityRepository implements WeeklyAvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<WeeklyAvailability | null> {
    const found = await this.prisma.weeklyAvailability.findFirst({
      where: { userId, deletedAt: null },
    });
    return found ? this.toDomain(found) : null;
  }

  // Cria ou substitui a disponibilidade do availability.userId (upsert pela chave única).
  async save(availability: WeeklyAvailability): Promise<WeeklyAvailability> {
    const data = this.toPersistence(availability);
    const saved = await this.prisma.weeklyAvailability.upsert({
      where: { userId: data.userId },
      create: data,
      update: {
        windows: data.windows,
        dailyLimitMinutes: data.dailyLimitMinutes,
        updatedAt: data.updatedAt,
        deletedAt: null,
      },
    });
    return this.toDomain(saved);
  }

  private toPersistence(availability: WeeklyAvailability): Omit<
    WeeklyAvailabilityRecord,
    'windows'
  > & {
    windows: Prisma.InputJsonValue;
  } {
    return {
      id: availability.id,
      userId: availability.userId,
      windows: availability.windows.map((window) => ({ ...window })),
      dailyLimitMinutes: availability.dailyLimitMinutes,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
      deletedAt: availability.deletedAt ?? null,
    };
  }

  private toDomain(raw: WeeklyAvailabilityRecord): WeeklyAvailability {
    const windows = raw.windows as unknown as AvailabilityWindow[];
    return new WeeklyAvailability({
      id: raw.id,
      userId: raw.userId,
      windows: windows.map(({ weekday, startMinute, endMinute }) => ({
        weekday,
        startMinute,
        endMinute,
      })),
      dailyLimitMinutes: raw.dailyLimitMinutes,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }
}
