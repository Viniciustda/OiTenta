import { Controller, Get } from '@nestjs/common';

@Controller('scheduling')
export class SchedulingController {
  @Get('/')
  getScheduling() {
    return { message: 'Scheduling endpoint' };
  }
}
