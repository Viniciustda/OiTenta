import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbModule } from '../../db/db.module';
import {
  AI_SETTINGS,
  AiSettings,
  createGoalAssistant,
  GOAL_ASSISTANT,
  readAiSettings,
} from './assistant/goal-assistant.factory';
import { RulesGoalAssistantProvider } from './assistant/rules-goal-assistant.provider';
import { PrismaGoalRepository } from './goal.prisma';

// As rotas de /goals moram nos orquestradores create-goal e goals-view (C4),
// porque juntam dados do scheduling (plano, folga e próximo bloco).
// O assistente do novo objetivo (IA1) é escolhido aqui pelo .env (AI_PROVIDER).
@Module({
  imports: [DbModule],
  providers: [
    PrismaGoalRepository,
    {
      provide: RulesGoalAssistantProvider,
      useValue: new RulesGoalAssistantProvider(),
    },
    {
      provide: AI_SETTINGS,
      useFactory: (config: ConfigService): AiSettings =>
        readAiSettings((key) => config.get<string>(key)),
      inject: [ConfigService],
    },
    {
      provide: GOAL_ASSISTANT,
      useFactory: createGoalAssistant,
      inject: [AI_SETTINGS, RulesGoalAssistantProvider],
    },
  ],
  exports: [
    PrismaGoalRepository,
    RulesGoalAssistantProvider,
    AI_SETTINGS,
    GOAL_ASSISTANT,
  ],
})
export class GoalsModule {}
