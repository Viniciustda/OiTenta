import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { PrismaGoalRepository } from './goal.prisma';
import { GoalsController } from './goals.controller';

@Module({
  imports: [DbModule],
  controllers: [GoalsController],
  providers: [PrismaGoalRepository],
  exports: [PrismaGoalRepository],
})
export class GoalsModule {}
