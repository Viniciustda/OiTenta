import { Module } from '@nestjs/common';
import { ActivationModule } from '../modules/activation/activation.module';
import { AuthModule } from '../modules/auth/auth.module';
import { GoalsModule } from '../modules/goals/goals.module';
import { SchedulingModule } from '../modules/scheduling/scheduling.module';
import { DayViewOrchestrator } from './day-view.orchestrator';
import { PlanViewsController } from './plan-views.controller';
import { RampController } from './ramp.controller';
import { RampOrchestrator } from './ramp.orchestrator';
import { WeekViewOrchestrator } from './week-view.orchestrator';

// Orquestradores (docs/3-modelagem-dominio.md §5): um arquivo por fluxo, só encadeiam casos de uso.
// As rotas que dependem de mais de um módulo moram aqui (tarefa C4).
@Module({
  imports: [AuthModule, GoalsModule, SchedulingModule, ActivationModule],
  controllers: [PlanViewsController, RampController],
  providers: [DayViewOrchestrator, WeekViewOrchestrator, RampOrchestrator],
})
export class OrchestratorsModule {}
