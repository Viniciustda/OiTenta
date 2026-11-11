import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { CreateGoalOrchestrator } from './create-goal.orchestrator';
import {
  CreateGoalBody,
  CreateGoalResponse,
  GoalDetailResponse,
  GoalListResponse,
} from './goals-view.dto';
import { GoalsViewOrchestrator } from './goals-view.orchestrator';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('goals')
export class GoalsViewController {
  constructor(
    private readonly createGoal: CreateGoalOrchestrator,
    private readonly goalsView: GoalsViewOrchestrator,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: CreateGoalResponse })
  @ApiBadRequestResponse({
    description: 'Corpo malformado ou campo não previsto.',
  })
  @ApiNotFoundResponse({ description: 'Sem disponibilidade cadastrada (P12).' })
  @ApiUnprocessableEntityResponse({
    description: 'Título vazio, zero etapas ou estimativa inválida.',
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateGoalBody,
  ): Promise<CreateGoalResponse> {
    return this.createGoal.execute({
      userId,
      title: body.title,
      deadline: body.deadline ?? null,
      kind: body.kind,
      steps: body.steps.map((step) => ({
        title: step.title,
        estimatedMinutes: step.estimatedMinutes,
        microSteps: step.microSteps,
      })),
    });
  }

  @Get()
  @ApiOkResponse({ type: GoalListResponse })
  async list(@CurrentUser('id') userId: string): Promise<GoalListResponse> {
    return this.goalsView.list(userId);
  }

  @Get(':goalId')
  @ApiOkResponse({ type: GoalDetailResponse })
  @ApiBadRequestResponse({ description: 'goalId não é um UUID.' })
  @ApiNotFoundResponse({
    description: 'Objetivo inexistente ou de outro usuário.',
  })
  async detail(
    @CurrentUser('id') userId: string,
    @Param('goalId', ParseUUIDPipe) goalId: string,
  ): Promise<GoalDetailResponse> {
    return this.goalsView.detail(userId, goalId);
  }
}
