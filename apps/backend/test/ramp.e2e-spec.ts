import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GENERIC_MICRO_STEP } from '@oitenta/activation';
import { CreateGoal } from '@oitenta/goals';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaGoalRepository } from '../src/modules/goals/goal.prisma';

// Integração do orquestrador ramp (docs/4-contrato-api.md §5): GetGoal → BuildRamp. Exige o Postgres no ar.
interface LoginBody {
  token: string;
  user: { id: string };
}
interface RampBody {
  steps: { kind: string; options: { id: string; title: string }[] }[];
  suggested: string;
}

describe('GET /activation/ramp (integração)', () => {
  let app: INestApplication<App>;
  let owner: LoginBody;
  let other: LoginBody;
  let goalId: string;
  let stepWithMicro: string;
  let stepWithoutMicro: string;

  const unique = () =>
    `ramp.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

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

  const getRamp = (token: string, query: Record<string, string>) =>
    request(app.getHttpServer())
      .get('/activation/ramp')
      .query(query)
      .set('Authorization', `Bearer ${token}`);

  const query = (overrides: Record<string, string> = {}) => ({
    goalId,
    stepId: stepWithMicro,
    energy: 'high',
    availableTime: '30m',
    ...overrides,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    owner = await registerAndLogin();
    other = await registerAndLogin();

    const created = await new CreateGoal(app.get(PrismaGoalRepository)).execute(
      {
        userId: owner.user.id,
        title: 'TCC',
        deadline: '2030-12-15',
        kind: 'goal',
        steps: [
          {
            title: 'Ler os artigos',
            estimatedMinutes: 60,
            microSteps: ['Abrir o PDF', 'Ler o resumo', 'Anotar 1 ideia'],
          },
          { title: 'Escrever', estimatedMinutes: 60 },
        ],
      },
    );
    goalId = created.goal.id;
    stepWithMicro = created.goal.steps[0].id;
    stepWithoutMicro = created.goal.steps[1].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('energy=high → 200, 5 degraus em ordem e suggested micro', async () => {
    const res = await getRamp(owner.token, query());
    const body = res.body as RampBody;

    expect({
      status: res.status,
      kinds: body.steps.map((step) => step.kind),
      suggested: body.suggested,
    }).toEqual({
      status: 200,
      kinds: ['warmup', 'challenge', 'micro', 'focus', 'log'],
      suggested: 'micro',
    });
  });

  it('o micro-passo traz os textos da etapa', async () => {
    const res = await getRamp(owner.token, query());
    const body = res.body as RampBody;

    expect(body.steps[2].options.map((option) => option.title)).toEqual([
      'Abrir o PDF',
      'Ler o resumo',
      'Anotar 1 ideia',
    ]);
  });

  it('etapa sem micro-passos → texto genérico provisório (P6)', async () => {
    const res = await getRamp(owner.token, query({ stepId: stepWithoutMicro }));
    const body = res.body as RampBody;

    expect(body.steps[2].options.map((option) => option.title)).toEqual([
      GENERIC_MICRO_STEP,
    ]);
  });

  it('energy=electric → suggested focus (P14)', async () => {
    const res = await getRamp(owner.token, query({ energy: 'electric' }));

    expect((res.body as RampBody).suggested).toBe('focus');
  });

  it('sem availableTime (web) → 200', async () => {
    const { availableTime, ...withoutTime } = query();
    void availableTime;

    const res = await getRamp(owner.token, withoutTime);

    expect(res.status).toBe(200);
  });

  it('posse: objetivo de outro usuário → 404 com a mensagem do domínio', async () => {
    const res = await getRamp(other.token, query());

    expect([res.status, (res.body as { message: string }).message]).toEqual([
      404,
      'Objetivo não encontrado.',
    ]);
  });

  it('etapa que não é do objetivo → 404', async () => {
    const res = await getRamp(owner.token, query({ stepId: randomUUID() }));

    expect([res.status, (res.body as { message: string }).message]).toEqual([
      404,
      'Etapa não encontrada.',
    ]);
  });

  it('energy=xyz → 400', async () => {
    const res = await getRamp(owner.token, query({ energy: 'xyz' }));

    expect(res.status).toBe(400);
  });

  it('availableTime inválido → 400', async () => {
    const res = await getRamp(owner.token, query({ availableTime: '3h' }));

    expect(res.status).toBe(400);
  });

  it('goalId que não é UUID → 400', async () => {
    const res = await getRamp(owner.token, query({ goalId: 'abc' }));

    expect(res.status).toBe(400);
  });

  it('userId na query → 400', async () => {
    const res = await getRamp(owner.token, query({ userId: other.user.id }));

    expect(res.status).toBe(400);
  });

  it('sem token → 401', async () => {
    const res = await request(app.getHttpServer())
      .get('/activation/ramp')
      .query(query());

    expect(res.status).toBe(401);
  });
});
