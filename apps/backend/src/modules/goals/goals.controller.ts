import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetGoal } from '@oitenta/goals';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { PrismaGoalRepository } from './goal.prisma';
import { GetGoalResponse } from './goals.dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalRepository: PrismaGoalRepository) {}

  @Get(':goalId')
  @ApiOkResponse({ type: GetGoalResponse })
  @ApiBadRequestResponse({ description: 'goalId não é um UUID.' })
  @ApiNotFoundResponse({
    description: 'Objetivo inexistente ou de outro usuário.',
  })
  async getGoal(
    @CurrentUser('id') userId: string,
    @Param('goalId', ParseUUIDPipe) goalId: string,
  ) {
    const useCase = new GetGoal(this.goalRepository);
    return await useCase.execute({ userId, goalId });
  }
}
