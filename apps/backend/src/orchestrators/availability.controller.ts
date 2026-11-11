import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  SetWeeklyAvailabilityBody,
  toAvailabilityResponse,
  WeeklyAvailabilityView,
} from '../modules/scheduling/scheduling.dto';
import { JwtAuthGuard } from '../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { PlanResponse } from './plan.dto';
import { SetAvailabilityOrchestrator } from './set-availability.orchestrator';

export class SetAvailabilityResponse {
  @ApiProperty({ type: WeeklyAvailabilityView })
  availability!: WeeklyAvailabilityView;

  @ApiProperty({ type: PlanResponse })
  plan!: PlanResponse;
}

@ApiTags('scheduling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('scheduling')
export class AvailabilityController {
  constructor(private readonly setAvailability: SetAvailabilityOrchestrator) {}

  @Put('availability')
  @ApiOkResponse({ type: SetAvailabilityResponse })
  @ApiBadRequestResponse({
    description: 'Corpo malformado ou campo não previsto.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Zero janelas, janela inválida ou limite fora de 60–480 / não múltiplo de 30.',
  })
  async put(
    @CurrentUser('id') userId: string,
    @Body() body: SetWeeklyAvailabilityBody,
  ): Promise<SetAvailabilityResponse> {
    const { availability, plan } = await this.setAvailability.execute({
      userId,
      windows: body.windows.map(({ weekday, startMinute, endMinute }) => ({
        weekday,
        startMinute,
        endMinute,
      })),
      dailyLimitMinutes: body.dailyLimitMinutes,
    });
    return { ...toAvailabilityResponse(availability), plan };
  }
}
