import { ServiceUnavailableError } from "@oitenta/shared";
import {
  AssistantEngine,
  GOAL_CATEGORIES,
  GoalCategory,
  GoalDraftField,
  ParsedGoal,
  SuggestedSteps,
} from "../provider/goal-assistant.provider";

// Regras do domínio aplicadas a qualquer saída do assistente, LLM ou motor de regras
// (IA1; docs/3-modelagem-dominio.md §2.6). Classe pura: sem portas e sem async.

export const GOAL_DRAFT_LIMITS = {
  textMaxLength: 2000,
  titleMaxLength: 120,
  requirementsMax: 6,
  requirementMaxLength: 60,
  stepsMax: 12,
  stepMinutesGranularity: 15,
  stepMinutesMin: 15,
  stepMinutesMax: 240,
  microStepsMax: 3,
  microStepMaxLength: 140,
} as const;

export interface GoalDraftStep {
  title: string;
  estimatedMinutes: number;
  aiEstimatedMinutes: number;
  microSteps: string[];
}

export interface GoalDraft {
  title: string | null;
  deadline: string | null;
  category: GoalCategory;
  requirements: string[];
  missingFields: GoalDraftField[];
  steps: GoalDraftStep[];
  totalMinutes: number;
}

export interface GoalDraftNormalizeIn {
  parsed: ParsedGoal;
  suggested: SuggestedSteps;
  today: string;
}

export interface NormalizedGoalDraft {
  draft: GoalDraft;
  engine: AssistantEngine;
}

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function cutAtWord(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  const slice = text.slice(0, max);
  if (text[max] === " ") {
    return slice.trimEnd();
  }
  const lastSpace = slice.lastIndexOf(" ");
  return lastSpace > 0 ? slice.slice(0, lastSpace).trimEnd() : slice;
}

function cleanList(values: string[], maxLength: number): string[] {
  return values.map((value) => cutAtWord(clean(value), maxLength)).filter((value) => value.length > 0);
}

export class GoalDraftNormalizer {
  title(value: string | null | undefined): string | null {
    const title = cutAtWord(clean(value), GOAL_DRAFT_LIMITS.titleMaxLength);
    return title.length > 0 ? title : null;
  }

  deadline(value: string | null | undefined, today: string): string | null {
    const match = LOCAL_DATE_PATTERN.exec(value ?? "");
    if (!match) {
      return null;
    }
    const [, year, month, day] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const exists = date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    return exists && (value as string) >= today ? (value as string) : null;
  }

  category(value: string): GoalCategory {
    return GOAL_CATEGORIES.includes(value as GoalCategory) ? (value as GoalCategory) : "generic";
  }

  requirements(values: string[]): string[] {
    const seen = new Set<string>();
    return cleanList(values, GOAL_DRAFT_LIMITS.requirementMaxLength)
      .filter((value) => {
        const key = value.toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .slice(0, GOAL_DRAFT_LIMITS.requirementsMax);
  }

  minutes(value: number): number {
    if (!Number.isFinite(value)) {
      return GOAL_DRAFT_LIMITS.stepMinutesMin;
    }
    const granularity = GOAL_DRAFT_LIMITS.stepMinutesGranularity;
    const rounded = Math.round(value / granularity) * granularity;
    return Math.min(
      GOAL_DRAFT_LIMITS.stepMinutesMax,
      Math.max(GOAL_DRAFT_LIMITS.stepMinutesMin, rounded),
    );
  }

  normalize({ parsed, suggested, today }: GoalDraftNormalizeIn): NormalizedGoalDraft {
    const title = this.title(parsed.title);
    const deadline = this.deadline(parsed.deadline, today);
    const steps = suggested.steps
      .map((step) => ({ ...step, title: this.title(step.title) }))
      .filter((step): step is typeof step & { title: string } => step.title !== null)
      .slice(0, GOAL_DRAFT_LIMITS.stepsMax)
      .map((step) => {
        const estimatedMinutes = this.minutes(step.estimatedMinutes);
        return {
          title: step.title,
          estimatedMinutes,
          aiEstimatedMinutes: estimatedMinutes,
          microSteps: cleanList(step.microSteps, GOAL_DRAFT_LIMITS.microStepMaxLength).slice(
            0,
            GOAL_DRAFT_LIMITS.microStepsMax,
          ),
        };
      });

    if (steps.length === 0) {
      throw new ServiceUnavailableError("assistant.empty-steps");
    }

    const missingFields: GoalDraftField[] = [];
    if (title === null) {
      missingFields.push("title");
    }
    if (deadline === null) {
      missingFields.push("deadline");
    }

    return {
      draft: {
        title,
        deadline,
        category: this.category(parsed.category),
        requirements: this.requirements(parsed.requirements),
        missingFields,
        steps,
        totalMinutes: steps.reduce((sum, step) => sum + step.estimatedMinutes, 0),
      },
      engine: parsed.engine === "llm" && suggested.engine === "llm" ? "llm" : "rules",
    };
  }
}
