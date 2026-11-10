import { Controller, Get } from '@nestjs/common';

@Controller('activation')
export class ActivationController {
  @Get('/')
  getActivation() {
    return { message: 'Activation endpoint' };
  }
}
