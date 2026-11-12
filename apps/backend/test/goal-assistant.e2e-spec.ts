import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { GoalAssistantProvider } from '@oitenta/goals';
import { ServiceUnavailableError } from '@oitenta/shared';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import {
  AI_SETTINGS,
  AiSettings,
  GOAL_ASSISTANT,
} from '../src/modules/goals/assistant/goal-assistant.factory';

// Integração do POST /goals/assistant/draft (docs/4-contrato-api.md §3, IA1). Exige o Postgres no ar.
// Roda sempre com o motor de regras (IA6): determinístico e sem rede.
interface DraftBody {
  draft: {
    title: string | null;
    deadline: string | null;
    category: string;
    requirements: string[];
    missingFields: string[];
    steps: {
      title: string;
      estimatedMinutes: number;
      aiEstimatedMinutes: number;
      microSteps: string[];
    }[];
    totalMinutes: number;
  };
  engine: string;
}

const REFERENCE_TEXT =
  'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11';

// Próximo 24/11 a partir de hoje em São Paulo (fuso padrão do cadastro, P1).
function next24Nov(): string {
  const today = new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
  const year = Number(today.slice(0, 4));
  const candidate = `${year}-11-24`;
  return candidate >= today ? candidate : `${year + 1}-11-24`;
}

// Código diferente do que a rota devolve: prova que o 503 é traduzido para assistant.unavailable.
const failingAssistant: GoalAssistantProvider = {
  parseGoal: () =>
    Promise.reject(new ServiceUnavailableError('assistant.invalid-output')),
  suggestSteps: () =>
    Promise.reject(new ServiceUnavailableError('assistant.invalid-output')),
};

async function createApp(
  override?: Partial<AiSettings> & { assistant?: GoalAssistantProvider },
): Promise<INestApplication<App>> {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (override) {
    const { assistant, ...settings } = override;
    builder = builder
      .overrideProvider(GOAL_ASSISTANT)
      .useValue(assistant)
      .overrideProvider(AI_SETTINGS)
      .useValue({ provider: 'rules', timeoutMs: 15_000, ...settings });
  }
  const app = (await builder.compile()).createNestApplication<
    INestApplication<App>
  >();
  configureApp(app);
  await app.init();
  return app;
}

async function loginOn(app: INestApplication<App>): Promise<string> {
  const email = `assist.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ name: 'Ana Souza', email, password: 'Senha@123' });
  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: 'Senha@123' });
  return (login.body as { token: string }).token;
}

const draft = (app: INestApplication<App>, token: string, body: unknown) =>
  request(app.getHttpServer())
    .post('/goals/assistant/draft')
    .set('Authorization', `Bearer ${token}`)
    .send(body as object);

describe('goals: assistente do novo objetivo (integração)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    app = await createApp();
    token = await loginOn(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('a integração roda com o motor de regras, mesmo com outro AI_PROVIDER no .env (IA6)', () => {
    expect(app.get<AiSettings>(AI_SETTINGS).provider).toBe('rules');
  });

  it('texto de referência → 200 com o rascunho do modelo assignment (rules)', async () => {
    const res = await draft(app, token, { text: REFERENCE_TEXT });
    const body = res.body as DraftBody;

    expect({
      status: res.status,
      title: body.draft.title,
      deadline: body.draft.deadline,
      category: body.draft.category,
      missingFields: body.draft.missingFields,
      steps: body.draft.steps.length,
      multiplesOf15: body.draft.steps.every(
        (step) =>
          step.estimatedMinutes % 15 === 0 &&
          step.aiEstimatedMinutes === step.estimatedMinutes,
      ),
      totalMinutes: body.draft.totalMinutes,
      engine: body.engine,
    }).toEqual({
      status: 200,
      title: 'Trabalho de Algoritmos',
      deadline: next24Nov(),
      category: 'assignment',
      missingFields: [],
      steps: 5,
      multiplesOf15: true,
      totalMinutes: 300,
      engine: 'rules',
    });
  });

  it('texto sem data → 200 com deadline null e missingFields deadline', async () => {
    const res = await draft(app, token, {
      text: 'Estudar para a prova de Cálculo',
    });
    const body = res.body as DraftBody;

    expect([res.status, body.draft.deadline, body.draft.missingFields]).toEqual(
      [200, null, ['deadline']],
    );
  });

  it('sem token → 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/goals/assistant/draft')
      .send({ text: REFERENCE_TEXT });

    expect(res.status).toBe(401);
  });

  it('texto só com espaços → 422 goal-draft.text.required', async () => {
    const res = await draft(app, token, { text: '   ' });

    expect([res.status, (res.body as { details: string[] }).details]).toEqual([
      422,
      ['goal-draft.text.required'],
    ]);
  });

  it('texto com 2001 caracteres → 422 goal-draft.text.max-length', async () => {
    const res = await draft(app, token, { text: 'a'.repeat(2001) });

    expect([res.status, (res.body as { details: string[] }).details]).toEqual([
      422,
      ['goal-draft.text.max-length'],
    ]);
  });

  it('corpo com userId → 400', async () => {
    const res = await draft(app, token, { text: REFERENCE_TEXT, userId: 'x' });

    expect(res.status).toBe(400);
  });

  it('sem text → 400', async () => {
    const res = await draft(app, token, {});

    expect(res.status).toBe(400);
  });

  it('nenhum objetivo é gravado', async () => {
    await draft(app, token, { text: REFERENCE_TEXT });
    const goals = await request(app.getHttpServer())
      .get('/goals')
      .set('Authorization', `Bearer ${token}`);

    expect([goals.status, goals.body]).toEqual([200, { goals: [] }]);
  });

  describe('provider que falha', () => {
    it('com AI_FALLBACK=none → 503 assistant.unavailable', async () => {
      const failing = await createApp({
        assistant: failingAssistant,
        fallback: 'none',
      });
      const res = await draft(failing, await loginOn(failing), {
        text: REFERENCE_TEXT,
      });
      await failing.close();

      expect([res.status, (res.body as { message: string }).message]).toEqual([
        503,
        'assistant.unavailable',
      ]);
    });

    it('com AI_FALLBACK=rules → 200 com engine rules', async () => {
      const failing = await createApp({
        assistant: failingAssistant,
        fallback: 'rules',
      });
      const res = await draft(failing, await loginOn(failing), {
        text: REFERENCE_TEXT,
      });
      await failing.close();

      expect([res.status, (res.body as DraftBody).engine]).toEqual([
        200,
        'rules',
      ]);
    });

    it('provider lento além do orçamento com AI_FALLBACK=rules → 200 com engine rules', async () => {
      const slow: GoalAssistantProvider = {
        parseGoal: () => new Promise(() => undefined),
        suggestSteps: () => new Promise(() => undefined),
      };
      const failing = await createApp({
        assistant: slow,
        fallback: 'rules',
        timeoutMs: 200,
      });
      const res = await draft(failing, await loginOn(failing), {
        text: REFERENCE_TEXT,
      });
      await failing.close();

      expect([res.status, (res.body as DraftBody).engine]).toEqual([
        200,
        'rules',
      ]);
    });
  });
});
