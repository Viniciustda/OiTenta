import { Controller, Get } from '@nestjs/common';

@Controller('goals')
export class GoalsController {
  @Get('/')
  getGoals() {
    return { message: 'Goals endpoint' };
  }
}
