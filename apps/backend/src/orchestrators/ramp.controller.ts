import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { RampOrchestrator } from './ramp.orchestrator';
import { RampQuery, RampResponse } from './ramp.dto';

@ApiTags('activation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('activation')
export class RampController {
  constructor(private readonly ramp: RampOrchestrator) {}

  @Get('ramp')
  @ApiOkResponse({ type: RampResponse })
  @ApiBadRequestResponse({
    description:
      'goalId/stepId não são UUID ou energy/availableTime inválidos.',
  })
  @ApiNotFoundResponse({
    description: 'Objetivo ou etapa inexistente ou de outro usuário.',
  })
  async getRamp(
    @CurrentUser('id') userId: string,
    @Query() query: RampQuery,
  ): Promise<RampResponse> {
    return this.ramp.execute({
      userId,
      goalId: query.goalId,
      stepId: query.stepId,
      energy: query.energy,
      availableTime: query.availableTime ?? null,
    });
  }
}
