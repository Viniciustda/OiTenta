import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateGoal } from '@oitenta/goals';
import { NotFoundError } from '@oitenta/shared';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaGoalRepository } from '../src/modules/goals/goal.prisma';

// Integração do goals contra o banco local (docs/4-contrato-api.md §3). Exige o Postgres no ar.
// O POST /goals é da C4: aqui o objetivo é gravado pelo CreateGoal com o repositório Prisma.
interface LoginBody {
  token: string;
  user: { id: string };
}
interface StepBody {
  id: string;
  order: number;
  title: string;
  estimatedMinutes: number;
  progressPct: number;
  status: string;
  microSteps: string[];
  remainingMinutes: number;
}
interface GetGoalBody {
  goal: { id: string; title: string; deadline: string | null; kind: string };
  steps: StepBody[];
  progressPct: number;
  done: number;
  total: number;
}

describe('goals (integração)', () => {
  let app: INestApplication<App>;
  let ownerToken: string;
  let otherToken: string;
  let goalId: string;
  let ownerId: string;
  let otherId: string;

  const unique = () =>
    `goals.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    const owner = await registerAndLogin();
    const other = await registerAndLogin();
    ownerToken = owner.token;
    otherToken = other.token;
    ownerId = owner.user.id;
    otherId = other.user.id;

    const created = await new CreateGoal(app.get(PrismaGoalRepository)).execute(
      {
        userId: owner.user.id,
        title: 'TCC',
        deadline: '2026-12-15',
        kind: 'goal',
        steps: [
          { title: 'Ler os artigos', estimatedMinutes: 60 },
          {
            title: 'Escrever a introdução',
            estimatedMinutes: 45,
            microSteps: ['Abrir o documento'],
          },
        ],
      },
    );
    goalId = created.goal.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /goals/:goalId do dono → 200 com objetivo, etapas e progresso', async () => {
    const res = await request(app.getHttpServer())
      .get(`/goals/${goalId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body as GetGoalBody).toEqual({
      goal: expect.objectContaining({
        id: goalId,
        title: 'TCC',
        deadline: '2026-12-15',
        kind: 'goal',
      }) as unknown,
      steps: [
        expect.objectContaining({
          order: 1,
          title: 'Ler os artigos',
          estimatedMinutes: 60,
          progressPct: 0,
          status: 'pending',
          microSteps: [],
          remainingMinutes: 60,
        }) as unknown,
        expect.objectContaining({
          order: 2,
          title: 'Escrever a introdução',
          estimatedMinutes: 45,
          microSteps: ['Abrir o documento'],
          remainingMinutes: 45,
        }) as unknown,
      ],
      progressPct: 0,
      done: 0,
      total: 2,
    });
  });

  it('GET /goals/:goalId de outro usuário → 404', async () => {
    const res = await request(app.getHttpServer())
      .get(`/goals/${goalId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  it('GET /goals/:goalId inexistente → 404', async () => {
    const res = await request(app.getHttpServer())
      .get(`/goals/${randomUUID()}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it('GET /goals/:goalId sem token → 401', async () => {
    const res = await request(app.getHttpServer()).get(`/goals/${goalId}`);

    expect(res.status).toBe(401);
  });

  it('PrismaGoalRepository.update de outro usuário → NotFoundError e nada muda', async () => {
    const repository = app.get(PrismaGoalRepository);
    const goal = (await repository.findById(ownerId, goalId))!;
    const stolen = goal.clone({ userId: otherId, title: 'Roubado' });

    await expect(repository.update(stolen)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect((await repository.findById(ownerId, goalId))?.title).toBe('TCC');
  });

  it('PrismaGoalRepository.update do dono regrava as etapas', async () => {
    const repository = app.get(PrismaGoalRepository);
    const created = await new CreateGoal(repository).execute({
      userId: ownerId,
      title: 'Relatório',
      kind: 'goal',
      steps: [{ title: 'Rascunho', estimatedMinutes: 30 }],
    });
    const goal = (await repository.findById(ownerId, created.goal.id))!;

    await repository.update(goal.withStep(goal.steps[0].withProgress(100)));

    const saved = await repository.findById(ownerId, created.goal.id);
    expect(saved?.steps.map((s) => [s.progressPct, s.status])).toEqual([
      [100, 'done'],
    ]);
  });

  it('GET /goals/:goalId com id malformado → 400', async () => {
    const res = await request(app.getHttpServer())
      .get('/goals/nao-e-uuid')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
  });
});
