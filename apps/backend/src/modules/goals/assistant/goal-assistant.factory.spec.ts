import {
  createGoalAssistant,
  DEFAULT_AI_TIMEOUT_MS,
  readAiSettings,
} from './goal-assistant.factory';
import { OpenAiCompatibleGoalAssistantProvider } from './openai-compatible-goal-assistant.provider';
import { RulesGoalAssistantProvider } from './rules-goal-assistant.provider';

const SECRET = 'chave-secreta-de-teste-123';
const env = (values: Record<string, string>) => (key: string) => values[key];

describe('readAiSettings', () => {
  test('sem variáveis → rules, fallback rules, 15 s, sem log de conteúdo', () => {
    expect(readAiSettings(env({}))).toEqual({
      provider: 'rules',
      baseUrl: '',
      model: '',
      apiKey: '',
      timeoutMs: DEFAULT_AI_TIMEOUT_MS,
      fallback: 'rules',
      logContent: false,
    });
  });

  test('openai-compatible lê URL, modelo, chave, tempo, fallback e log', () => {
    expect(
      readAiSettings(
        env({
          AI_PROVIDER: 'openai-compatible',
          AI_BASE_URL: 'http://localhost:11434/v1',
          AI_MODEL: 'modelo-x',
          AI_API_KEY: SECRET,
          AI_TIMEOUT_MS: '8000',
          AI_FALLBACK: 'none',
          AI_LOG_CONTENT: 'true',
        }),
      ),
    ).toEqual({
      provider: 'openai-compatible',
      baseUrl: 'http://localhost:11434/v1',
      model: 'modelo-x',
      apiKey: SECRET,
      timeoutMs: 8000,
      fallback: 'none',
      logContent: true,
    });
  });

  test('valores vazios contam como ausentes', () => {
    expect(
      readAiSettings(
        env({ AI_PROVIDER: '', AI_FALLBACK: '', AI_TIMEOUT_MS: '' }),
      ),
    ).toMatchObject({
      provider: 'rules',
      fallback: 'rules',
      timeoutMs: 15_000,
    });
  });

  test('AI_PROVIDER desconhecido → erro que diz os valores aceitos', () => {
    expect(() => readAiSettings(env({ AI_PROVIDER: 'fake' }))).toThrow(
      'AI_PROVIDER inválido ("fake"): use rules ou openai-compatible.',
    );
  });

  test('openai-compatible sem URL nem modelo → erro com as duas variáveis', () => {
    expect(() =>
      readAiSettings(env({ AI_PROVIDER: 'openai-compatible' })),
    ).toThrow('AI_PROVIDER=openai-compatible exige AI_BASE_URL e AI_MODEL.');
  });

  test('erro de configuração nunca mostra a chave', () => {
    let message = '';
    try {
      readAiSettings(
        env({ AI_PROVIDER: 'openai-compatible', AI_API_KEY: SECRET }),
      );
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message.includes(SECRET)).toBe(false);
  });

  test.each([['0'], ['-5'], ['abc'], ['1.5']])(
    'AI_TIMEOUT_MS %p → erro',
    (value) => {
      expect(() => readAiSettings(env({ AI_TIMEOUT_MS: value }))).toThrow(
        'AI_TIMEOUT_MS deve ser um inteiro positivo (milissegundos).',
      );
    },
  );

  test('AI_FALLBACK desconhecido → erro', () => {
    expect(() => readAiSettings(env({ AI_FALLBACK: 'manual' }))).toThrow(
      'AI_FALLBACK inválido ("manual"): use rules ou none.',
    );
  });

  test('AI_LOG_CONTENT diferente de true/false → erro', () => {
    expect(() => readAiSettings(env({ AI_LOG_CONTENT: 'sim' }))).toThrow(
      'AI_LOG_CONTENT deve ser true ou false.',
    );
  });
});

describe('createGoalAssistant', () => {
  const rules = new RulesGoalAssistantProvider();

  test('rules → o próprio motor de regras', () => {
    expect(createGoalAssistant(readAiSettings(env({})), rules)).toBe(rules);
  });

  test('openai-compatible → o adaptador HTTP', () => {
    const settings = readAiSettings(
      env({
        AI_PROVIDER: 'openai-compatible',
        AI_BASE_URL: 'http://localhost:11434/v1',
        AI_MODEL: 'modelo-x',
      }),
    );

    expect(createGoalAssistant(settings, rules)).toBeInstanceOf(
      OpenAiCompatibleGoalAssistantProvider,
    );
  });
});
