import { Inject, Injectable, Logger } from '@nestjs/common';
import { DraftGoal } from '@oitenta/goals';
import type {
  DraftGoalIn,
  DraftGoalOut,
  GoalAssistantProvider,
} from '@oitenta/goals';
import { ServiceUnavailableError } from '@oitenta/shared';
import { PrismaUserRepository } from '../modules/auth/user.prisma';
import {
  AI_SETTINGS,
  GOAL_ASSISTANT,
} from '../modules/goals/assistant/goal-assistant.factory';
import type { AiSettings } from '../modules/goals/assistant/goal-assistant.factory';
import { RulesGoalAssistantProvider } from '../modules/goals/assistant/rules-goal-assistant.provider';
import { userTimezone } from './user-timezone';

// docs/3 §2.6 (IA1): roda o DraftGoal com o motor configurado dentro do orçamento total
// (AI_TIMEOUT_MS, as duas chamadas). Falhou ou estourou: AI_FALLBACK=rules refaz o
// rascunho inteiro com o motor de regras; AI_FALLBACK=none responde 503 (4f).
@Injectable()
export class GoalDraftOrchestrator {
  private readonly logger = new Logger('GoalAssistant');

  constructor(
    private readonly userRepository: PrismaUserRepository,
    @Inject(GOAL_ASSISTANT) private readonly assistant: GoalAssistantProvider,
    private readonly rules: RulesGoalAssistantProvider,
    @Inject(AI_SETTINGS) private readonly settings: AiSettings,
  ) {}

  async execute(userId: string, text: string): Promise<DraftGoalOut> {
    const timezone = await userTimezone(this.userRepository, userId);
    const input: DraftGoalIn = { userId, text, now: new Date(), timezone };

    try {
      return await this.withinBudget(
        new DraftGoal(this.assistant).execute(input),
      );
    } catch (error) {
      if (!(error instanceof ServiceUnavailableError)) {
        throw error;
      }
      this.logger.warn(
        `assistant op=draft provider=${this.settings.provider} outcome=${error.message} fallback=${this.settings.fallback}`,
      );
      if (this.settings.fallback === 'none') {
        throw new ServiceUnavailableError('assistant.unavailable');
      }
      return new DraftGoal(this.rules).execute(input);
    }
  }

  private async withinBudget<T>(work: Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const budget = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new ServiceUnavailableError('assistant.timeout')),
        this.settings.timeoutMs,
      );
    });
    try {
      return await Promise.race([work, budget]);
    } finally {
      clearTimeout(timer);
    }
  }
}
