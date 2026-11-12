import type { GoalAssistantProvider } from '@oitenta/goals';
import { OpenAiCompatibleGoalAssistantProvider } from './openai-compatible-goal-assistant.provider';
import { RulesGoalAssistantProvider } from './rules-goal-assistant.provider';

// Escolha do motor do assistente pelo .env (docs/7-proposta-ia.md §c.4, IA1, IA6).
// Valor desconhecido ou variável obrigatória faltando → o backend não sobe.
// As mensagens de erro nunca mostram a chave.

export const GOAL_ASSISTANT = Symbol('GOAL_ASSISTANT');
export const AI_SETTINGS = Symbol('AI_SETTINGS');

export type AiProviderName = 'rules' | 'openai-compatible';
export type AiFallback = 'rules' | 'none';

export interface AiSettings {
  provider: AiProviderName;
  baseUrl: string;
  model: string;
  apiKey: string;
  /** Orçamento total do rascunho (as duas chamadas); também é o teto de cada chamada. */
  timeoutMs: number;
  fallback: AiFallback;
  logContent: boolean;
}

export const DEFAULT_AI_TIMEOUT_MS = 15_000;
/** Teto: acima de ~24 dias o setTimeout do Node dispara na hora; 2 min já é demais para o usuário esperar. */
export const MAX_AI_TIMEOUT_MS = 120_000;

const PROVIDERS: readonly AiProviderName[] = ['rules', 'openai-compatible'];
const FALLBACKS: readonly AiFallback[] = ['rules', 'none'];

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** Lê e valida as variáveis AI_* (vazio conta como ausente). */
export function readAiSettings(
  get: (key: string) => string | undefined,
): AiSettings {
  const read = (key: string) => get(key)?.trim() || undefined;

  const provider = read('AI_PROVIDER') ?? 'rules';
  if (!PROVIDERS.includes(provider as AiProviderName)) {
    throw new Error(
      `AI_PROVIDER inválido ("${provider}"): use rules ou openai-compatible.`,
    );
  }

  const baseUrl = read('AI_BASE_URL') ?? '';
  const model = read('AI_MODEL') ?? '';
  if (provider === 'openai-compatible' && (!baseUrl || !model)) {
    throw new Error(
      'AI_PROVIDER=openai-compatible exige AI_BASE_URL e AI_MODEL.',
    );
  }
  if (provider === 'openai-compatible' && !isHttpUrl(baseUrl)) {
    throw new Error('AI_BASE_URL inválida: use http:// ou https://.');
  }

  const rawTimeout = read('AI_TIMEOUT_MS');
  const timeoutMs =
    rawTimeout === undefined ? DEFAULT_AI_TIMEOUT_MS : Number(rawTimeout);
  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > MAX_AI_TIMEOUT_MS
  ) {
    throw new Error(
      `AI_TIMEOUT_MS deve ser um inteiro entre 1 e ${MAX_AI_TIMEOUT_MS} (milissegundos).`,
    );
  }

  const fallback = read('AI_FALLBACK') ?? 'rules';
  if (!FALLBACKS.includes(fallback as AiFallback)) {
    throw new Error(`AI_FALLBACK inválido ("${fallback}"): use rules ou none.`);
  }

  const logContent = read('AI_LOG_CONTENT') ?? 'false';
  if (logContent !== 'true' && logContent !== 'false') {
    throw new Error('AI_LOG_CONTENT deve ser true ou false.');
  }

  return {
    provider: provider as AiProviderName,
    baseUrl,
    model,
    apiKey: read('AI_API_KEY') ?? '',
    timeoutMs,
    fallback: fallback as AiFallback,
    logContent: logContent === 'true',
  };
}

/** Monta o motor configurado. */
export function createGoalAssistant(
  settings: AiSettings,
  rules: RulesGoalAssistantProvider,
): GoalAssistantProvider {
  if (settings.provider === 'openai-compatible') {
    return new OpenAiCompatibleGoalAssistantProvider({
      baseUrl: settings.baseUrl,
      model: settings.model,
      apiKey: settings.apiKey,
      timeoutMs: settings.timeoutMs,
      logContent: settings.logContent,
    });
  }
  return rules;
}
