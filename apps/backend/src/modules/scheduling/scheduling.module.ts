import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { PrismaScheduledBlockRepository } from './scheduled-block.prisma';
import { SchedulingController } from './scheduling.controller';
import { PrismaWeeklyAvailabilityRepository } from './weekly-availability.prisma';

@Module({
  imports: [DbModule],
  controllers: [SchedulingController],
  providers: [
    PrismaWeeklyAvailabilityRepository,
    PrismaScheduledBlockRepository,
  ],
  exports: [PrismaWeeklyAvailabilityRepository, PrismaScheduledBlockRepository],
})
export class SchedulingModule {}
