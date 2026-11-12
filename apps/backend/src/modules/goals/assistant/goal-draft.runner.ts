import { DraftGoal } from '@oitenta/goals';
import type {
  DraftGoalIn,
  DraftGoalOut,
  GoalAssistantProvider,
} from '@oitenta/goals';
import { ServiceUnavailableError } from '@oitenta/shared';
import type { AiSettings } from './goal-assistant.factory';
import { RulesGoalAssistantProvider } from './rules-goal-assistant.provider';

// Orçamento e reserva do rascunho (docs/3-modelagem-dominio.md §2.6, IA1):
// roda o DraftGoal com o motor configurado dentro de AI_TIMEOUT_MS (as duas chamadas).
// Falhou ou estourou: AI_FALLBACK=rules refaz o rascunho INTEIRO com o motor de regras;
// AI_FALLBACK=none → 503 (4f: o app abre o formulário manual).
// Usado pelo orquestrador da rota e pelo script ai:eval.

export interface GoalDraftRunResult extends DraftGoalOut {
  /** Motivo da reserva (ex.: assistant.timeout) ou null se o motor configurado respondeu. */
  fallbackReason: string | null;
}

export interface DraftRunnerLogger {
  warn(message: string): void;
}

export class GoalDraftRunner {
  constructor(
    private readonly assistant: GoalAssistantProvider,
    private readonly rules: RulesGoalAssistantProvider,
    private readonly settings: AiSettings,
    private readonly logger: DraftRunnerLogger,
  ) {}

  async run(input: DraftGoalIn): Promise<GoalDraftRunResult> {
    const started = Date.now();
    try {
      const out = await this.withinBudget(
        new DraftGoal(this.assistant).execute(input),
      );
      return { ...out, fallbackReason: null };
    } catch (error) {
      if (!(error instanceof ServiceUnavailableError)) {
        throw error;
      }
      const model = this.settings.model ? ` model=${this.settings.model}` : '';
      this.logger.warn(
        `assistant op=draft provider=${this.settings.provider}${model} ms=${Date.now() - started} outcome=${error.message} fallback=${this.settings.fallback}`,
      );
      if (this.settings.fallback === 'none') {
        throw new ServiceUnavailableError('assistant.unavailable');
      }
      const out = await new DraftGoal(this.rules).execute(input);
      return { ...out, fallbackReason: error.message };
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
