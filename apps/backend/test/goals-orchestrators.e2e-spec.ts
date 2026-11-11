import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateGoal, UpdateStepProgress } from '@oitenta/goals';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaGoalRepository } from '../src/modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../src/modules/scheduling/scheduled-block.prisma';

// Integração dos orquestradores create-goal e goals-view (docs/4-contrato-api.md §3). Exige o Postgres no ar.
interface LoginBody {
  token: string;
  user: { id: string };
}
interface StepBody {
  id: string;
  status: string;
  nextBlock?: { id: string; start: string; end: string };
}
interface CreateGoalBody {
  goal: { id: string; steps: StepBody[] };
  plan: { totalMinutes: number; days: number; goals: { goalId: string }[] };
}
interface GoalListBody {
  goals: {
    id: string;
    title: string;
    status: string;
    slackDays: number | null;
    createdAt: string;
  }[];
}

const DAY_MS = 86_400_000;
const dateIn = (days: number) =>
  new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);

// Todo dia das 06:00 às 23:00 locais: há tempo livre nos próximos dias qualquer que seja a hora do teste.
const EVERY_DAY = {
  windows: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    startMinute: 360,
    endMinute: 1380,
  })),
  dailyLimitMinutes: 180,
};

describe('goals: orquestradores (integração)', () => {
  let app: INestApplication<App>;

  const unique = () =>
    `goalsorq.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

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

  async function onboarded(): Promise<LoginBody> {
    const login = await registerAndLogin();
    await request(app.getHttpServer())
      .put('/scheduling/availability')
      .set('Authorization', `Bearer ${login.token}`)
      .send(EVERY_DAY);
    return login;
  }

  const goalBody = (overrides: Record<string, unknown> = {}) => ({
    title: 'Trabalho de Algoritmos',
    deadline: dateIn(14),
    kind: 'goal',
    steps: [
      {
        title: 'Ler o enunciado e listar requisitos',
        estimatedMinutes: 30,
        microSteps: [],
      },
      { title: 'Montar o esqueleto', estimatedMinutes: 60 },
    ],
    ...overrides,
  });

  const postGoal = (token: string, body: unknown) =>
    request(app.getHttpServer())
      .post('/goals')
      .set('Authorization', `Bearer ${token}`)
      .send(body as object);

  const goalsOf = (userId: string) =>
    app.get(PrismaGoalRepository).findAllByUser(userId);

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

  describe('POST /goals', () => {
    it('corpo válido → 201 com o objetivo e o plano', async () => {
      const { token } = await onboarded();

      const res = await postGoal(token, goalBody());
      const body = res.body as CreateGoalBody;

      expect({
        status: res.status,
        steps: body.goal.steps.length,
        plan: body.plan,
      }).toEqual({
        status: 201,
        steps: 2,
        plan: {
          totalMinutes: 90,
          days: expect.any(Number) as number,
          goals: [
            {
              goalId: body.goal.id,
              feasible: true,
              usedSlack: true,
              slackDays: 1,
              scheduledMinutes: 90,
              unscheduledMinutes: 0,
            },
          ],
        },
      });
    });

    it('corpo válido → os blocos do objetivo são gravados', async () => {
      const { token, user } = await onboarded();

      const res = await postGoal(token, goalBody());
      const blocks = await app
        .get(PrismaScheduledBlockRepository)
        .findByUserInRange(
          user.id,
          new Date(),
          new Date(Date.now() + 30 * DAY_MS),
        );

      expect([
        ...new Set(blocks.map((block) => block.goalId)),
        blocks.reduce((sum, block) => sum + block.durationMinutes, 0),
      ]).toEqual([(res.body as CreateGoalBody).goal.id, 90]);
    });

    it('sem token → 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/goals')
        .send(goalBody());

      expect(res.status).toBe(401);
    });

    it('zero etapas → 422', async () => {
      const { token } = await onboarded();

      const res = await postGoal(token, goalBody({ steps: [] }));

      expect(res.status).toBe(422);
    });

    it('título vazio → 422', async () => {
      const { token } = await onboarded();

      const res = await postGoal(token, goalBody({ title: '   ' }));

      expect(res.status).toBe(422);
    });

    it('estimativa que não é múltipla de 15 → 422', async () => {
      const { token } = await onboarded();

      const res = await postGoal(
        token,
        goalBody({ steps: [{ title: 'Ler', estimatedMinutes: 20 }] }),
      );

      expect(res.status).toBe(422);
    });

    it('corpo com userId → 400 e nada é gravado', async () => {
      const { token, user } = await onboarded();

      const res = await postGoal(token, goalBody({ userId: user.id }));

      expect([res.status, (await goalsOf(user.id)).length]).toEqual([400, 0]);
    });

    it('etapa com userId → 400', async () => {
      const { token } = await onboarded();

      const res = await postGoal(
        token,
        goalBody({
          steps: [{ title: 'Ler', estimatedMinutes: 30, userId: randomUUID() }],
        }),
      );

      expect(res.status).toBe(400);
    });

    it('kind inválido → 400', async () => {
      const { token } = await onboarded();

      const res = await postGoal(token, goalBody({ kind: 'projeto' }));

      expect(res.status).toBe(400);
    });

    it('prazo malformado → 400', async () => {
      const { token } = await onboarded();

      const res = await postGoal(token, goalBody({ deadline: '24/11/2026' }));

      expect(res.status).toBe(400);
    });

    it('sem prazo (null) → 201', async () => {
      const { token } = await onboarded();

      const res = await postGoal(token, goalBody({ deadline: null }));

      expect(res.status).toBe(201);
    });

    it('estimativa string → 400', async () => {
      const { token } = await onboarded();

      const res = await postGoal(
        token,
        goalBody({ steps: [{ title: 'Ler', estimatedMinutes: '30' }] }),
      );

      expect(res.status).toBe(400);
    });

    it('sem disponibilidade → 404 (P12) e nada é gravado', async () => {
      const { token, user } = await registerAndLogin();

      const res = await postGoal(token, goalBody());

      expect([
        res.status,
        (res.body as { message: string }).message,
        (await goalsOf(user.id)).length,
      ]).toEqual([404, 'Disponibilidade não encontrada.', 0]);
    });
  });

  describe('GET /goals', () => {
    it('A com 2 objetivos e B com 1 → A recebe só os 2, com a folga de cada um', async () => {
      const owner = await onboarded();
      const other = await onboarded();
      await postGoal(owner.token, goalBody({ title: 'A1' }));
      await postGoal(owner.token, goalBody({ title: 'A2' }));
      await postGoal(other.token, goalBody({ title: 'B1' }));

      const res = await request(app.getHttpServer())
        .get('/goals')
        .set('Authorization', `Bearer ${owner.token}`);
      const body = res.body as GoalListBody;

      expect({
        status: res.status,
        goals: body.goals.map((goal) => [goal.title, goal.slackDays]),
      }).toEqual({
        status: 200,
        goals: [
          ['A1', 1],
          ['A2', 1],
        ],
      });
    });

    it('cada item segue o contrato e traz o createdAt em ISO', async () => {
      const owner = await onboarded();
      await postGoal(owner.token, goalBody({ title: 'A1' }));

      const res = await request(app.getHttpServer())
        .get('/goals')
        .set('Authorization', `Bearer ${owner.token}`);

      expect((res.body as GoalListBody).goals).toEqual([
        {
          id: expect.any(String) as string,
          title: 'A1',
          deadline: dateIn(14),
          colorIndex: 1,
          progressPct: 0,
          done: 0,
          total: 2,
          status: 'active',
          slackDays: 1,
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          ) as string,
        },
      ]);
    });

    it('objetivo concluído (done) → slackDays null', async () => {
      const owner = await onboarded();
      const created = (
        await postGoal(
          owner.token,
          goalBody({
            kind: 'single',
            steps: [{ title: 'Tarefa', estimatedMinutes: 30 }],
          }),
        )
      ).body as CreateGoalBody;
      await new UpdateStepProgress(app.get(PrismaGoalRepository)).execute({
        userId: owner.user.id,
        goalId: created.goal.id,
        stepId: created.goal.steps[0].id,
        progressPct: 100,
      });

      const res = await request(app.getHttpServer())
        .get('/goals')
        .set('Authorization', `Bearer ${owner.token}`);

      expect(
        (res.body as GoalListBody).goals.map((goal) => [
          goal.status,
          goal.slackDays,
        ]),
      ).toEqual([['done', null]]);
    });

    it('usuário sem objetivos (nem disponibilidade) → 200 com lista vazia', async () => {
      const fresh = await registerAndLogin();

      const res = await request(app.getHttpServer())
        .get('/goals')
        .set('Authorization', `Bearer ${fresh.token}`);

      expect({ status: res.status, body: res.body as unknown }).toEqual({
        status: 200,
        body: { goals: [] },
      });
    });

    it('sem token → 401', async () => {
      const res = await request(app.getHttpServer()).get('/goals');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /goals/:goalId (nextBlock)', () => {
    it('etapa pendente traz o próximo bloco planejado; etapa concluída não traz', async () => {
      const owner = await onboarded();
      const created = (await postGoal(owner.token, goalBody()))
        .body as CreateGoalBody;
      const [first, second] = created.goal.steps;
      await new UpdateStepProgress(app.get(PrismaGoalRepository)).execute({
        userId: owner.user.id,
        goalId: created.goal.id,
        stepId: first.id,
        progressPct: 100,
      });
      const blocks = await app
        .get(PrismaScheduledBlockRepository)
        .findByUserInRange(
          owner.user.id,
          new Date(),
          new Date(Date.now() + 30 * DAY_MS),
        );
      const nextOfSecond = blocks.find((block) => block.stepId === second.id);

      const res = await request(app.getHttpServer())
        .get(`/goals/${created.goal.id}`)
        .set('Authorization', `Bearer ${owner.token}`);
      const steps = (res.body as { steps: StepBody[] }).steps;

      expect(steps.map((step) => [step.status, step.nextBlock])).toEqual([
        ['done', undefined],
        [
          'pending',
          {
            id: nextOfSecond?.id,
            start: nextOfSecond?.start.toISOString(),
            end: nextOfSecond?.end.toISOString(),
          },
        ],
      ]);
    });

    it('objetivo sem blocos → nenhuma etapa traz nextBlock', async () => {
      const owner = await registerAndLogin();
      const { goal } = await new CreateGoal(
        app.get(PrismaGoalRepository),
      ).execute({
        userId: owner.user.id,
        title: 'Sem plano',
        deadline: null,
        kind: 'single',
        steps: [{ title: 'Etapa', estimatedMinutes: 30 }],
      });

      const res = await request(app.getHttpServer())
        .get(`/goals/${goal.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(
        (res.body as { steps: StepBody[] }).steps.map((step) => step.nextBlock),
      ).toEqual([undefined]);
    });

    it('posse: objetivo de A pedido por B → 404 com a mensagem do domínio', async () => {
      const owner = await onboarded();
      const other = await onboarded();
      const created = (await postGoal(owner.token, goalBody()))
        .body as CreateGoalBody;

      const res = await request(app.getHttpServer())
        .get(`/goals/${created.goal.id}`)
        .set('Authorization', `Bearer ${other.token}`);

      expect(res.body).toMatchObject({
        statusCode: 404,
        message: 'Objetivo não encontrado.',
      });
    });
  });
});
