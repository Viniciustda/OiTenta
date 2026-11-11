import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ScheduledBlock } from '@oitenta/scheduling';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaFocusSessionRepository } from '../src/modules/activation/focus-session.prisma';
import { PrismaGoalRepository } from '../src/modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../src/modules/scheduling/scheduled-block.prisma';

// Integração do orquestrador record-progress (docs/4-contrato-api.md §5). Exige o Postgres no ar.
// Cada cenário cria um usuário com disponibilidade e um objetivo pelo POST /goals (que gera os blocos).
interface LoginBody {
  token: string;
  user: { id: string };
}
interface Scenario {
  login: LoginBody;
  goalId: string;
  stepIds: string[];
  block: ScheduledBlock;
}
interface SessionResponse {
  session: { id: string; outcome: string; partialPct: number | null };
  step: { id: string; progressPct: number; status: string };
  goalProgressPct: number;
  plan: {
    totalMinutes: number;
    days: number;
    goals: { goalId: string; scheduledMinutes: number }[];
  };
}

const DAY_MS = 86_400_000;
const EVERY_DAY = {
  windows: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    startMinute: 360,
    endMinute: 1380,
  })),
  dailyLimitMinutes: 180,
};

describe('POST /activation/sessions (integração)', () => {
  let app: INestApplication<App>;

  const unique = () =>
    `sessions.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

  async function registerAndLogin(): Promise<LoginBody> {
    const email = unique();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Ana Souza', email, password: 'Senha@123' });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Senha@123' });
    return login.body as LoginBody;
  }

  const futureBlocks = (userId: string) =>
    app
      .get(PrismaScheduledBlockRepository)
      .findByUserInRange(
        userId,
        new Date(Date.now() - DAY_MS),
        new Date(Date.now() + 30 * DAY_MS),
      );

  async function scenario(): Promise<Scenario> {
    const login = await registerAndLogin();
    await request(app.getHttpServer())
      .put('/scheduling/availability')
      .set('Authorization', `Bearer ${login.token}`)
      .send(EVERY_DAY);
    const created = await request(app.getHttpServer())
      .post('/goals')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        title: 'TCC',
        deadline: new Date(Date.now() + 14 * DAY_MS).toISOString().slice(0, 10),
        kind: 'goal',
        steps: [
          { title: 'Ler', estimatedMinutes: 60 },
          { title: 'Escrever', estimatedMinutes: 60 },
        ],
      });
    const goal = (
      created.body as { goal: { id: string; steps: { id: string }[] } }
    ).goal;
    const stepIds = goal.steps.map((step) => step.id);
    const blocks = await futureBlocks(login.user.id);
    const block = blocks.find((item) => item.stepId === stepIds[0]);
    return {
      login,
      goalId: goal.id,
      stepIds,
      block: block as ScheduledBlock,
    };
  }

  const body = (s: Scenario, overrides: Record<string, unknown> = {}) => ({
    goalId: s.goalId,
    stepId: s.stepIds[0],
    blockId: s.block.id,
    energy: 'medium',
    availableTime: '30m',
    startedAt: '2026-11-10T22:00:00.000Z',
    endedAt: '2026-11-10T22:25:00.000Z',
    focusedMinutes: 25,
    outcome: 'done',
    ...overrides,
  });

  const post = (token: string, payload: unknown) =>
    request(app.getHttpServer())
      .post('/activation/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send(payload as object);

  const stepProgress = async (userId: string, goalId: string) =>
    (await app.get(PrismaGoalRepository).findById(userId, goalId))?.steps.map(
      (step) => step.progressPct,
    );

  const sessionsOf = (userId: string, stepId: string) =>
    app.get(PrismaFocusSessionRepository).findAllByUserAndStep(userId, stepId);

  const blockStatus = async (userId: string, blockId: string) =>
    (await app.get(PrismaScheduledBlockRepository).findById(userId, blockId))
      ?.status;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('done → 201, etapa a 100%, bloco done e plano só com a etapa restante', async () => {
    const s = await scenario();

    const res = await post(s.login.token, body(s));
    const out = res.body as SessionResponse;

    expect({
      status: res.status,
      outcome: out.session.outcome,
      step: [out.step.id, out.step.progressPct, out.step.status],
      goalProgressPct: out.goalProgressPct,
      planned: out.plan.goals.map((goal) => [
        goal.goalId,
        goal.scheduledMinutes,
      ]),
      block: await blockStatus(s.login.user.id, s.block.id),
    }).toEqual({
      status: 201,
      outcome: 'done',
      step: [s.stepIds[0], 100, 'done'],
      goalProgressPct: 50,
      planned: [[s.goalId, 60]],
      block: 'done',
    });
  });

  it('partial 70 → etapa a 70%, bloco partial e plano recalculado só com o restante', async () => {
    const s = await scenario();

    const res = await post(
      s.login.token,
      body(s, { outcome: 'partial', partialPct: 70 }),
    );
    const out = res.body as SessionResponse;

    // Restante: 60 × 30% = 18 → 30 (múltiplo de 15 para cima) da etapa 1 + 60 da etapa 2.
    expect({
      status: res.status,
      partialPct: out.session.partialPct,
      step: [out.step.progressPct, out.step.status],
      planned: out.plan.goals.map((goal) => goal.scheduledMinutes),
      block: await blockStatus(s.login.user.id, s.block.id),
    }).toEqual({
      status: 201,
      partialPct: 70,
      step: [70, 'pending'],
      planned: [90],
      block: 'partial',
    });
  });

  it('not_done → % não muda, bloco missed e plano recalculado', async () => {
    const s = await scenario();

    const res = await post(s.login.token, body(s, { outcome: 'not_done' }));
    const out = res.body as SessionResponse;

    expect({
      status: res.status,
      step: [out.step.progressPct, out.step.status],
      goalProgressPct: out.goalProgressPct,
      planned: out.plan.goals.map((goal) => goal.scheduledMinutes),
      block: await blockStatus(s.login.user.id, s.block.id),
      progress: await stepProgress(s.login.user.id, s.goalId),
    }).toEqual({
      status: 201,
      step: [0, 'pending'],
      goalProgressPct: 0,
      planned: [120],
      block: 'missed',
      progress: [0, 0],
    });
  });

  it('sem blockId → 201 e registra sessão e progresso', async () => {
    const s = await scenario();
    const { blockId, ...withoutBlock } = body(s);
    void blockId;

    const res = await post(s.login.token, withoutBlock);

    expect({
      status: res.status,
      sessions: (await sessionsOf(s.login.user.id, s.stepIds[0])).length,
      progress: await stepProgress(s.login.user.id, s.goalId),
    }).toEqual({
      status: 201,
      sessions: 1,
      progress: [100, 0],
    });
  });

  it('posse: A registra com o objetivo e a etapa de B → 404 e nada é gravado', async () => {
    const a = await scenario();
    const b = await scenario();

    const res = await post(
      a.login.token,
      body(a, { goalId: b.goalId, stepId: b.stepIds[0], blockId: a.block.id }),
    );

    expect({
      status: res.status,
      message: (res.body as { message: string }).message,
      sessionsOfA: (await sessionsOf(a.login.user.id, b.stepIds[0])).length,
      progressOfB: await stepProgress(b.login.user.id, b.goalId),
      blockOfA: await blockStatus(a.login.user.id, a.block.id),
    }).toEqual({
      status: 404,
      message: 'Objetivo não encontrado.',
      sessionsOfA: 0,
      progressOfB: [0, 0],
      blockOfA: 'planned',
    });
  });

  it('posse: A registra com o bloco de B → 404 "Bloco não encontrado." e nada é gravado', async () => {
    const a = await scenario();
    const b = await scenario();

    const res = await post(a.login.token, body(a, { blockId: b.block.id }));

    expect({
      status: res.status,
      message: (res.body as { message: string }).message,
      sessionsOfA: (await sessionsOf(a.login.user.id, a.stepIds[0])).length,
      progressOfA: await stepProgress(a.login.user.id, a.goalId),
      blockOfB: await blockStatus(b.login.user.id, b.block.id),
    }).toEqual({
      status: 404,
      message: 'Bloco não encontrado.',
      sessionsOfA: 0,
      progressOfA: [0, 0],
      blockOfB: 'planned',
    });
  });

  it('etapa que não é do objetivo → 404 "Etapa não encontrada." e nada é gravado', async () => {
    const s = await scenario();
    const stranger = randomUUID();

    const res = await post(s.login.token, body(s, { stepId: stranger }));

    expect({
      status: res.status,
      message: (res.body as { message: string }).message,
      sessions: (await sessionsOf(s.login.user.id, stranger)).length,
    }).toEqual({ status: 404, message: 'Etapa não encontrada.', sessions: 0 });
  });

  it('partial sem % → 422 e nada é gravado', async () => {
    const s = await scenario();

    const res = await post(s.login.token, body(s, { outcome: 'partial' }));

    expect({
      status: res.status,
      sessions: (await sessionsOf(s.login.user.id, s.stepIds[0])).length,
      block: await blockStatus(s.login.user.id, s.block.id),
    }).toEqual({ status: 422, sessions: 0, block: 'planned' });
  });

  it('corpo com userId → 400', async () => {
    const s = await scenario();

    const res = await post(s.login.token, body(s, { userId: randomUUID() }));

    expect(res.status).toBe(400);
  });

  it('outcome inválido → 400', async () => {
    const s = await scenario();

    const res = await post(s.login.token, body(s, { outcome: 'talvez' }));

    expect(res.status).toBe(400);
  });

  it('startedAt que não é data → 400', async () => {
    const s = await scenario();

    const res = await post(s.login.token, body(s, { startedAt: 'ontem' }));

    expect(res.status).toBe(400);
  });

  it('sem token → 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/activation/sessions')
      .send({});

    expect(res.status).toBe(401);
  });
});
