import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { RecordProgressOrchestrator } from './record-progress.orchestrator';
import {
  RecordSessionBody,
  RecordSessionResponse,
  toFocusSessionResponse,
} from './sessions.dto';

@ApiTags('activation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('activation')
export class SessionsController {
  constructor(private readonly recordProgress: RecordProgressOrchestrator) {}

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: RecordSessionResponse })
  @ApiBadRequestResponse({
    description: 'Corpo malformado ou campo não previsto.',
  })
  @ApiNotFoundResponse({
    description:
      'Objetivo, etapa ou bloco inexistente ou de outro usuário (nada é gravado).',
  })
  @ApiUnprocessableEntityResponse({
    description: 'partial sem %, entre outras regras da sessão.',
  })
  async record(
    @CurrentUser('id') userId: string,
    @Body() body: RecordSessionBody,
  ): Promise<RecordSessionResponse> {
    const { session, step, goalProgressPct, plan } =
      await this.recordProgress.execute({
        userId,
        goalId: body.goalId,
        stepId: body.stepId,
        blockId: body.blockId ?? null,
        energy: body.energy,
        availableTime: body.availableTime ?? null,
        startedAt: new Date(body.startedAt),
        endedAt: new Date(body.endedAt),
        focusedMinutes: body.focusedMinutes,
        outcome: body.outcome,
        partialPct: body.partialPct ?? null,
      });
    return {
      session: toFocusSessionResponse(session),
      step,
      goalProgressPct,
      plan,
    };
  }
}
