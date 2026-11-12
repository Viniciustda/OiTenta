import { Inject, Injectable, Logger } from '@nestjs/common';
import type { DraftGoalOut, GoalAssistantProvider } from '@oitenta/goals';
import { PrismaUserRepository } from '../modules/auth/user.prisma';
import {
  AI_SETTINGS,
  GOAL_ASSISTANT,
} from '../modules/goals/assistant/goal-assistant.factory';
import type { AiSettings } from '../modules/goals/assistant/goal-assistant.factory';
import { GoalDraftRunner } from '../modules/goals/assistant/goal-draft.runner';
import { RulesGoalAssistantProvider } from '../modules/goals/assistant/rules-goal-assistant.provider';
import { userTimezone } from './user-timezone';

// POST /goals/assistant/draft (docs/4 §3, IA1): lê o fuso do usuário (P1) e roda o
// DraftGoal pelo GoalDraftRunner, que cuida do orçamento total e da reserva (docs/3 §2.6).
@Injectable()
export class GoalDraftOrchestrator {
  private readonly runner: GoalDraftRunner;

  constructor(
    private readonly userRepository: PrismaUserRepository,
    @Inject(GOAL_ASSISTANT) assistant: GoalAssistantProvider,
    rules: RulesGoalAssistantProvider,
    @Inject(AI_SETTINGS) settings: AiSettings,
  ) {
    this.runner = new GoalDraftRunner(
      assistant,
      rules,
      settings,
      new Logger('GoalAssistant'),
    );
  }

  async execute(userId: string, text: string): Promise<DraftGoalOut> {
    const timezone = await userTimezone(this.userRepository, userId);
    const { draft, engine } = await this.runner.run({
      userId,
      text,
      now: new Date(),
      timezone,
    });
    return { draft, engine };
  }
}
