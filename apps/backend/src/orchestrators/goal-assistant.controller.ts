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
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { DraftGoalResponse, GoalDraftBody } from './goal-assistant.dto';
import { GoalDraftOrchestrator } from './goal-draft.orchestrator';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('goals/assistant')
export class GoalAssistantController {
  constructor(private readonly goalDraft: GoalDraftOrchestrator) {}

  @Post('draft')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: DraftGoalResponse,
    description: 'Rascunho gerado. Não grava nada; quem grava é o POST /goals.',
  })
  @ApiBadRequestResponse({
    description: 'text ausente ou não string; campo não previsto.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'text vazio ou com mais de 2000 caracteres.',
  })
  @ApiServiceUnavailableResponse({
    description:
      'IA indisponível, lenta ou com saída inválida e AI_FALLBACK=none.',
  })
  async draft(
    @CurrentUser('id') userId: string,
    @Body() body: GoalDraftBody,
  ): Promise<DraftGoalResponse> {
    return this.goalDraft.execute(userId, body.text);
  }
}
