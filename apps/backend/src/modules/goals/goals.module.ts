import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { PrismaGoalRepository } from './goal.prisma';

// As rotas de /goals moram nos orquestradores create-goal e goals-view (C4),
// porque juntam dados do scheduling (plano, folga e próximo bloco).
@Module({
  imports: [DbModule],
  providers: [PrismaGoalRepository],
  exports: [PrismaGoalRepository],
})
export class GoalsModule {}
