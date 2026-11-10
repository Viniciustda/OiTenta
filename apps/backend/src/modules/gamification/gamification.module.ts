import { Module } from '@nestjs/common';
import { GamificationController } from './gamification.controller';

@Module({
  controllers: [GamificationController],
})
export class GamificationModule {}
