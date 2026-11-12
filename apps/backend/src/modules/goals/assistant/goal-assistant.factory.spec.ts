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

  test('AI_TIMEOUT_MS no teto (120000) é aceito', () => {
    expect(readAiSettings(env({ AI_TIMEOUT_MS: '120000' })).timeoutMs).toBe(
      120_000,
    );
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

  test('erro de configuração com chave preenchida não mostra a chave', () => {
    expect(() =>
      readAiSettings(
        env({ AI_PROVIDER: 'openai-compatible', AI_API_KEY: SECRET }),
      ),
    ).toThrow(/^AI_PROVIDER=openai-compatible exige AI_BASE_URL e AI_MODEL\.$/);
  });

  test.each([
    [{ AI_BASE_URL: 'http://localhost:11434/v1' }],
    [{ AI_MODEL: 'modelo-x' }],
  ])('openai-compatible com só uma das duas (%p) → erro', (values) => {
    expect(() =>
      readAiSettings(env({ AI_PROVIDER: 'openai-compatible', ...values })),
    ).toThrow('AI_PROVIDER=openai-compatible exige AI_BASE_URL e AI_MODEL.');
  });

  test.each([['localhost:11434/v1'], ['ftp://x/v1'], ['não é url']])(
    'AI_BASE_URL %p → erro de URL inválida',
    (url) => {
      expect(() =>
        readAiSettings(
          env({
            AI_PROVIDER: 'openai-compatible',
            AI_BASE_URL: url,
            AI_MODEL: 'modelo-x',
          }),
        ),
      ).toThrow('AI_BASE_URL inválida: use http:// ou https://.');
    },
  );

  test.each([['0'], ['-5'], ['abc'], ['1.5'], ['120001'], ['3000000000']])(
    'AI_TIMEOUT_MS %p → erro',
    (value) => {
      expect(() => readAiSettings(env({ AI_TIMEOUT_MS: value }))).toThrow(
        'AI_TIMEOUT_MS deve ser um inteiro entre 1 e 120000 (milissegundos).',
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
