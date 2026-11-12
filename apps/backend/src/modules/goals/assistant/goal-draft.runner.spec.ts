import type {
  DraftGoalIn,
  GoalAssistantProvider,
  ParsedGoal,
} from '@oitenta/goals';
import { ServiceUnavailableError, ValidationException } from '@oitenta/shared';
import type { AiSettings } from './goal-assistant.factory';
import { GoalDraftRunner } from './goal-draft.runner';
import { RulesGoalAssistantProvider } from './rules-goal-assistant.provider';

const INPUT: DraftGoalIn = {
  userId: 'u1',
  text: 'Trabalho de Algoritmos — entrega 24/11',
  now: new Date('2026-11-11T15:00:00Z'),
  timezone: 'America/Sao_Paulo',
};

const SETTINGS: AiSettings = {
  provider: 'openai-compatible',
  baseUrl: 'http://x',
  model: 'm',
  apiKey: '',
  timeoutMs: 1000,
  fallback: 'rules',
  logContent: false,
};

const llm: GoalAssistantProvider = {
  parseGoal: () =>
    Promise.resolve<ParsedGoal>({
      title: 'Do LLM',
      deadline: null,
      category: 'generic',
      requirements: [],
      missingFields: ['deadline'],
      engine: 'llm',
    }),
  suggestSteps: () =>
    Promise.resolve({
      steps: [{ title: 'Etapa do LLM', estimatedMinutes: 30, microSteps: [] }],
      engine: 'llm',
    }),
};

const failing = (error: Error): GoalAssistantProvider => ({
  parseGoal: () => Promise.reject(error),
  suggestSteps: () => Promise.reject(error),
});

const hanging: GoalAssistantProvider = {
  parseGoal: () => new Promise(() => undefined),
  suggestSteps: () => new Promise(() => undefined),
};

function makeRunner(
  assistant: GoalAssistantProvider,
  settings: Partial<AiSettings> = {},
) {
  const logger = { warn: jest.fn<void, [string]>() };
  const runner = new GoalDraftRunner(
    assistant,
    new RulesGoalAssistantProvider(),
    { ...SETTINGS, ...settings },
    logger,
  );
  return { runner, logger };
}

describe('GoalDraftRunner', () => {
  test('motor responde → rascunho dele, sem reserva', async () => {
    const { runner } = makeRunner(llm);

    const result = await runner.run(INPUT);

    expect([result.engine, result.draft.title, result.fallbackReason]).toEqual([
      'llm',
      'Do LLM',
      null,
    ]);
  });

  test('motor falha e AI_FALLBACK=rules → rascunho inteiro do motor de regras', async () => {
    const { runner } = makeRunner(
      failing(new ServiceUnavailableError('assistant.invalid-output')),
    );

    const result = await runner.run(INPUT);

    expect([result.engine, result.draft.title, result.fallbackReason]).toEqual([
      'rules',
      'Trabalho de Algoritmos',
      'assistant.invalid-output',
    ]);
  });

  test('falha só no suggestSteps → refaz o rascunho inteiro (sem o título do LLM)', async () => {
    const { runner } = makeRunner({
      parseGoal: (input) => llm.parseGoal(input),
      suggestSteps: () =>
        Promise.reject(new ServiceUnavailableError('assistant.timeout')),
    });

    const result = await runner.run(INPUT);

    expect([result.engine, result.draft.title, result.fallbackReason]).toEqual([
      'rules',
      'Trabalho de Algoritmos',
      'assistant.timeout',
    ]);
  });

  test('motor falha e AI_FALLBACK=none → 503 assistant.unavailable', async () => {
    const { runner } = makeRunner(
      failing(new ServiceUnavailableError('assistant.invalid-output')),
      { fallback: 'none' },
    );

    await expect(runner.run(INPUT)).rejects.toThrow(
      new ServiceUnavailableError('assistant.unavailable'),
    );
  });

  test('orçamento total estourado → reserva com o motivo assistant.timeout', async () => {
    const { runner } = makeRunner(hanging, { timeoutMs: 20 });

    const result = await runner.run(INPUT);

    expect([result.engine, result.fallbackReason]).toEqual([
      'rules',
      'assistant.timeout',
    ]);
  });

  test('erro de validação (422) não cai na reserva', async () => {
    const { runner } = makeRunner(llm);

    await expect(runner.run({ ...INPUT, text: '  ' })).rejects.toThrow(
      ValidationException,
    );
  });

  test('erro inesperado (não 503) não cai na reserva', async () => {
    const { runner } = makeRunner(failing(new Error('bug')));

    await expect(runner.run(INPUT)).rejects.toThrow('bug');
  });

  test('a reserva gera uma linha de log com motivo e política, sem o texto do usuário', async () => {
    const { runner, logger } = makeRunner(
      failing(new ServiceUnavailableError('assistant.unavailable')),
    );

    await runner.run(INPUT);

    expect(logger.warn.mock.calls[0][0]).toMatch(
      /^assistant op=draft provider=openai-compatible model=m ms=\d+ outcome=assistant\.unavailable fallback=rules$/,
    );
    expect(logger.warn.mock.calls.flat().join(' ')).not.toContain('Algoritmos');
  });
});
