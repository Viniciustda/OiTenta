import { Module } from '@nestjs/common';
import { ActivationModule } from '../modules/activation/activation.module';
import { AuthModule } from '../modules/auth/auth.module';
import { GoalsModule } from '../modules/goals/goals.module';
import { SchedulingModule } from '../modules/scheduling/scheduling.module';
import { AvailabilityController } from './availability.controller';
import { CreateGoalOrchestrator } from './create-goal.orchestrator';
import { DayViewOrchestrator } from './day-view.orchestrator';
import { GoalsViewController } from './goals-view.controller';
import { GoalsViewOrchestrator } from './goals-view.orchestrator';
import { PlanViewsController } from './plan-views.controller';
import { RampController } from './ramp.controller';
import { RampOrchestrator } from './ramp.orchestrator';
import { RecordProgressOrchestrator } from './record-progress.orchestrator';
import { SessionsController } from './sessions.controller';
import { SetAvailabilityOrchestrator } from './set-availability.orchestrator';
import { WeekViewOrchestrator } from './week-view.orchestrator';

// Orquestradores (docs/3-modelagem-dominio.md §5): um arquivo por fluxo, só encadeiam casos de uso.
// As rotas que dependem de mais de um módulo moram aqui (tarefa C4).
@Module({
  imports: [AuthModule, GoalsModule, SchedulingModule, ActivationModule],
  controllers: [
    AvailabilityController,
    GoalsViewController,
    PlanViewsController,
    RampController,
    SessionsController,
  ],
  providers: [
    SetAvailabilityOrchestrator,
    CreateGoalOrchestrator,
    GoalsViewOrchestrator,
    DayViewOrchestrator,
    WeekViewOrchestrator,
    RampOrchestrator,
    RecordProgressOrchestrator,
  ],
})
export class OrchestratorsModule {}
