// Porta do assistente do novo objetivo (D 4f, IA1; docs/3-modelagem-dominio.md §2.6).
// As implementações (motor de regras, adaptador compatível com OpenAI) moram no backend.

/** Tipo do objetivo para escolher o modelo de etapas. Não confundir com Goal.kind ('goal' | 'single'). */
export type GoalCategory = "assignment" | "exam" | "project" | "generic";

/** Campos que o motor não conseguiu extrair. Informativo: o prazo é opcional (P3, IA2). */
export type GoalDraftField = "title" | "deadline";

/** Quem respondeu. Só para log e transparência; nenhuma tela depende disso. */
export type AssistantEngine = "llm" | "rules";

export const GOAL_CATEGORIES: readonly GoalCategory[] = [
  "assignment",
  "exam",
  "project",
  "generic",
];

export interface ParseGoalIn {
  /** Texto do usuário, sem espaços nas pontas, 1–2000 caracteres. */
  text: string;
  /** Data local do usuário, YYYY-MM-DD (para "sexta", "semana que vem"). */
  today: string;
  /** Fuso IANA do usuário (P1). */
  timezone: string;
}

export interface ParsedGoal {
  title: string | null;
  /** YYYY-MM-DD */
  deadline: string | null;
  category: GoalCategory;
  requirements: string[];
  missingFields: GoalDraftField[];
  engine: AssistantEngine;
}

export interface SuggestStepsIn {
  title: string;
  deadline: string | null;
  category: GoalCategory;
  requirements: string[];
  /** Texto original, para contexto. */
  text: string;
  today: string;
}

export interface SuggestedStep {
  title: string;
  estimatedMinutes: number;
  microSteps: string[];
}

export interface SuggestedSteps {
  steps: SuggestedStep[];
  engine: AssistantEngine;
}

/** Falha (indisponível, lento, saída inválida) → lança ServiceUnavailableError (shared, 503). */
export interface GoalAssistantProvider {
  parseGoal(input: ParseGoalIn): Promise<ParsedGoal>;
  suggestSteps(input: SuggestStepsIn): Promise<SuggestedSteps>;
}
