import { Module } from '@nestjs/common';
import { CommitmentBusySource } from '@oitenta/scheduling';
import { DbModule } from '../../db/db.module';
import { EmptyCommitmentRepository } from './commitment.empty';
import { PrismaScheduledBlockRepository } from './scheduled-block.prisma';
import { SchedulingController } from './scheduling.controller';
import { PrismaWeeklyAvailabilityRepository } from './weekly-availability.prisma';

// P8: a ocupação vem dos compromissos, que nesta fase são sempre uma lista vazia.
@Module({
  imports: [DbModule],
  controllers: [SchedulingController],
  providers: [
    PrismaWeeklyAvailabilityRepository,
    PrismaScheduledBlockRepository,
    {
      provide: CommitmentBusySource,
      useFactory: () =>
        new CommitmentBusySource(new EmptyCommitmentRepository()),
    },
  ],
  exports: [
    PrismaWeeklyAvailabilityRepository,
    PrismaScheduledBlockRepository,
    CommitmentBusySource,
  ],
})
export class SchedulingModule {}
