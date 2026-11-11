import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { DayViewOrchestrator } from './day-view.orchestrator';
import {
  DayPlanQuery,
  DayPlanResponse,
  WeekPlanQuery,
  WeekPlanResponse,
} from './plan-views.dto';
import { WeekViewOrchestrator } from './week-view.orchestrator';

@ApiTags('scheduling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('scheduling/plan')
export class PlanViewsController {
  constructor(
    private readonly dayView: DayViewOrchestrator,
    private readonly weekView: WeekViewOrchestrator,
  ) {}

  @Get('day')
  @ApiOkResponse({ type: DayPlanResponse })
  @ApiBadRequestResponse({ description: 'date fora do formato YYYY-MM-DD.' })
  @ApiNotFoundResponse({ description: 'Sem disponibilidade cadastrada (P12).' })
  @ApiUnprocessableEntityResponse({ description: 'Data inexistente.' })
  async getDay(
    @CurrentUser('id') userId: string,
    @Query() query: DayPlanQuery,
  ): Promise<DayPlanResponse> {
    return this.dayView.execute({ userId, date: query.date });
  }

  @Get('week')
  @ApiOkResponse({ type: WeekPlanResponse })
  @ApiBadRequestResponse({ description: 'start fora do formato YYYY-MM-DD.' })
  @ApiNotFoundResponse({ description: 'Sem disponibilidade cadastrada (P12).' })
  @ApiUnprocessableEntityResponse({
    description: 'start não é segunda-feira ou é uma data inexistente.',
  })
  async getWeek(
    @CurrentUser('id') userId: string,
    @Query() query: WeekPlanQuery,
  ): Promise<WeekPlanResponse> {
    return this.weekView.execute({ userId, start: query.start });
  }
}
