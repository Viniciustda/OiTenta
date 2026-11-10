import { Controller, Get } from '@nestjs/common';

@Controller('gamification')
export class GamificationController {
  @Get('/')
  getGamification() {
    return { message: 'Gamification endpoint' };
  }
}
