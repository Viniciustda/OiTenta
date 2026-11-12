import { UseCase, ValidationError, ValidationException } from "@oitenta/shared";
import { GOAL_DRAFT_LIMITS, GoalDraft, GoalDraftNormalizer } from "../model/goal-draft.normalizer";
import { AssistantEngine, GoalAssistantProvider } from "../provider";

// Rascunho de objetivo a partir do texto do usuário (UC02, UC04, UC18; D 4f; IA1).
// Não grava nada: quem grava é o CreateGoal, depois da confirmação do usuário.

export interface DraftGoalIn {
  /** Dono vindo do token; serve para log, não vai para o provider. */
  userId: string;
  text: string;
  now: Date;
  /** Fuso IANA do usuário (P1). */
  timezone: string;
}

export interface DraftGoalOut {
  draft: GoalDraft;
  engine: AssistantEngine;
}

function localDate(now: Date, timezone: string): string {
  // en-CA formata como YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export class DraftGoal implements UseCase<DraftGoalIn, DraftGoalOut> {
  constructor(
    private readonly assistant: GoalAssistantProvider,
    private readonly normalizer = new GoalDraftNormalizer(),
  ) {}

  async execute(input: DraftGoalIn): Promise<DraftGoalOut> {
    const text = input.text.trim();
    this.validate(text);

    const today = localDate(input.now, input.timezone);
    const parsed = await this.assistant.parseGoal({ text, today, timezone: input.timezone });
    const suggested = await this.assistant.suggestSteps({
      title: this.normalizer.title(parsed.title) ?? (this.normalizer.title(text) as string),
      deadline: this.normalizer.deadline(parsed.deadline, today),
      category: this.normalizer.category(parsed.category),
      requirements: this.normalizer.requirements(parsed.requirements),
      text,
      today,
    });

    return this.normalizer.normalize({ parsed, suggested, today });
  }

  private validate(text: string): void {
    if (text.length === 0) {
      throw new ValidationException([new ValidationError("goal-draft.text.required")]);
    }
    if (text.length > GOAL_DRAFT_LIMITS.textMaxLength) {
      throw new ValidationException([new ValidationError("goal-draft.text.max-length")]);
    }
  }
}
