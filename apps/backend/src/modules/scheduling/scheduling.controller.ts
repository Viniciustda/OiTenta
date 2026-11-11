import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetWeeklyAvailability } from '@oitenta/scheduling';
import { JwtAuthGuard } from '../../shared/auth/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import {
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
// O PUT /scheduling/availability mora no orquestrador set-availability (C4), porque devolve o plano.
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
}
