import type { GoalAssistantProvider } from '@oitenta/goals';
import { RulesGoalAssistantProvider } from './rules-goal-assistant.provider';

// Escolha do motor do assistente pelo .env (docs/7-proposta-ia.md §c.4, IA1, IA6).

export const GOAL_ASSISTANT = Symbol('GOAL_ASSISTANT');
export const AI_SETTINGS = Symbol('AI_SETTINGS');

export type AiProviderName = 'rules' | 'openai-compatible';
export type AiFallback = 'rules' | 'none';

export interface AiSettings {
  provider: AiProviderName;
  baseUrl: string;
  model: string;
  apiKey: string;
  /** Orçamento total do rascunho (as duas chamadas). */
  timeoutMs: number;
  fallback: AiFallback;
  logContent: boolean;
}

export const DEFAULT_AI_TIMEOUT_MS = 15_000;

/** Lê as variáveis AI_*. */
export function readAiSettings(
  get: (key: string) => string | undefined,
): AiSettings {
  return {
    provider: 'rules',
    baseUrl: '',
    model: '',
    apiKey: '',
    timeoutMs: Number(get('AI_TIMEOUT_MS') ?? DEFAULT_AI_TIMEOUT_MS),
    fallback: get('AI_FALLBACK') === 'none' ? 'none' : 'rules',
    logContent: false,
  };
}

/** Monta o motor configurado. */
export function createGoalAssistant(
  settings: AiSettings,
  rules: RulesGoalAssistantProvider,
): GoalAssistantProvider {
  void settings;
  return rules;
}
