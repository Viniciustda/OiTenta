import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  GetWeeklyAvailability,
  SetWeeklyAvailability,
} from '@oitenta/scheduling';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import {
  SetWeeklyAvailabilityBody,
  toAvailabilityResponse,
  WeeklyAvailabilityResponse,
} from './scheduling.dto';
import { PrismaWeeklyAvailabilityRepository } from './weekly-availability.prisma';

@ApiTags('scheduling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('scheduling')
export class SchedulingController {
  constructor(
    private readonly availabilityRepository: PrismaWeeklyAvailabilityRepository,
  ) {}

  @Get('availability')
  @ApiOkResponse({ type: WeeklyAvailabilityResponse })
  @ApiNotFoundResponse({ description: 'O usuário ainda não fez o onboarding.' })
  async getAvailability(
    @CurrentUser('id') userId: string,
  ): Promise<WeeklyAvailabilityResponse> {
    const useCase = new GetWeeklyAvailability(this.availabilityRepository);
    const { availability } = await useCase.execute({ userId });
    return toAvailabilityResponse(availability);
  }

  // O campo `plan` da resposta (docs/4 §2) entra na C4, com o orquestrador set-availability.
  @Put('availability')
  @ApiOkResponse({ type: WeeklyAvailabilityResponse })
  @ApiBadRequestResponse({
    description: 'Corpo malformado ou campo não previsto.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Zero janelas, janela inválida ou limite fora de 60–480 / não múltiplo de 30.',
  })
  async setAvailability(
    @CurrentUser('id') userId: string,
    @Body() body: SetWeeklyAvailabilityBody,
  ): Promise<WeeklyAvailabilityResponse> {
    const useCase = new SetWeeklyAvailability(this.availabilityRepository);
    const { availability } = await useCase.execute({
      userId,
      windows: body.windows.map(({ weekday, startMinute, endMinute }) => ({
        weekday,
        startMinute,
        endMinute,
      })),
      dailyLimitMinutes: body.dailyLimitMinutes,
    });
    return toAvailabilityResponse(availability);
  }
}
