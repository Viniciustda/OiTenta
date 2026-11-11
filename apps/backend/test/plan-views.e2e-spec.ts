import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateGoal } from '@oitenta/goals';
import { ScheduledBlock } from '@oitenta/scheduling';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaGoalRepository } from '../src/modules/goals/goal.prisma';
import { PrismaScheduledBlockRepository } from '../src/modules/scheduling/scheduled-block.prisma';

// Integração dos orquestradores day-view e week-view (docs/4-contrato-api.md §4). Exige o Postgres no ar.
// Os blocos são gravados direto pelo repositório numa semana futura (segunda 18/11/2030),
// para o teste não depender do motor do plano. Fuso padrão do cadastro: America/Sao_Paulo (UTC−3).
interface LoginBody {
  token: string;
  user: { id: string };
}
interface BlockBody {
  id: string;
  start: string;
  end: string;
  status: string;
  goalId: string;
  goalTitle: string;
  colorIndex: number;
  stepId: string;
  stepTitle: string;
}
interface DayBody {
  date: string;
  blocks: BlockBody[];
  usedMinutes: number;
  limitMinutes: number;
}
interface WeekBody {
  days: DayBody[];
}

const MONDAY = '2030-11-18';
const AVAILABILITY = {
  windows: [{ weekday: 0, startMinute: 1140, endMinute: 1380 }],
  dailyLimitMinutes: 180,
};

describe('plano do dia e da semana (integração)', () => {
  let app: INestApplication<App>;
  let owner: LoginBody;
  let other: LoginBody;
  let goalId: string;
  let stepIds: string[];

  const unique = () =>
    `plan.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

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

  const putAvailability = (token: string) =>
    request(app.getHttpServer())
      .put('/scheduling/availability')
      .set('Authorization', `Bearer ${token}`)
      .send(AVAILABILITY);

  const block = (
    userId: string,
    goal: string,
    step: string,
    start: string,
    end: string,
  ) =>
    new ScheduledBlock({
      userId,
      goalId: goal,
      stepId: step,
      start: new Date(start),
      end: new Date(end),
      status: 'planned',
      pinned: false,
      origin: 'auto',
    });

  const getDay = (token: string, query: string) =>
    request(app.getHttpServer())
      .get(`/scheduling/plan/day${query}`)
      .set('Authorization', `Bearer ${token}`);

  const getWeek = (token: string, query: string) =>
    request(app.getHttpServer())
      .get(`/scheduling/plan/week${query}`)
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    owner = await registerAndLogin();
    other = await registerAndLogin();
    await putAvailability(owner.token);
    await putAvailability(other.token);

    const goals = app.get(PrismaGoalRepository);
    const created = await new CreateGoal(goals).execute({
      userId: owner.user.id,
      title: 'TCC',
      deadline: '2030-12-15',
      kind: 'goal',
      steps: [
        { title: 'Ler os artigos', estimatedMinutes: 60 },
        { title: 'Escrever a introdução', estimatedMinutes: 60 },
      ],
    });
    goalId = created.goal.id;
    stepIds = created.goal.steps.map((step) => step.id);
    const otherGoal = await new CreateGoal(goals).execute({
      userId: other.user.id,
      title: 'Outro',
      deadline: '2030-12-15',
      kind: 'single',
      steps: [{ title: 'Etapa de B', estimatedMinutes: 60 }],
    });

    const blocks = app.get(PrismaScheduledBlockRepository);
    // Segunda 18/11 19:00–20:00 e 20:00–21:00 locais (UTC−3); quarta 20/11 19:00–20:00.
    // Gravados fora de ordem para o teste conferir a ordenação.
    await blocks.replaceFutureAutoBlocks(owner.user.id, new Date(MONDAY), [
      block(
        owner.user.id,
        goalId,
        stepIds[1],
        '2030-11-18T23:00:00.000Z',
        '2030-11-19T00:00:00.000Z',
      ),
      block(
        owner.user.id,
        goalId,
        stepIds[0],
        '2030-11-18T22:00:00.000Z',
        '2030-11-18T23:00:00.000Z',
      ),
      block(
        owner.user.id,
        goalId,
        stepIds[1],
        '2030-11-20T22:00:00.000Z',
        '2030-11-20T23:00:00.000Z',
      ),
    ]);
    await blocks.replaceFutureAutoBlocks(other.user.id, new Date(MONDAY), [
      block(
        other.user.id,
        otherGoal.goal.id,
        otherGoal.goal.steps[0].id,
        '2030-11-18T22:00:00.000Z',
        '2030-11-18T23:00:00.000Z',
      ),
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /scheduling/plan/day', () => {
    it('dia com blocos → 200 com os blocos em ordem e os títulos juntados', async () => {
      const res = await getDay(owner.token, `?date=${MONDAY}`);

      expect({ status: res.status, body: res.body as unknown }).toEqual({
        status: 200,
        body: {
          date: MONDAY,
          blocks: [
            {
              id: expect.any(String) as string,
              start: '2030-11-18T22:00:00.000Z',
              end: '2030-11-18T23:00:00.000Z',
              status: 'planned',
              goalId,
              goalTitle: 'TCC',
              colorIndex: 1,
              stepId: stepIds[0],
              stepTitle: 'Ler os artigos',
            },
            {
              id: expect.any(String) as string,
              start: '2030-11-18T23:00:00.000Z',
              end: '2030-11-19T00:00:00.000Z',
              status: 'planned',
              goalId,
              goalTitle: 'TCC',
              colorIndex: 1,
              stepId: stepIds[1],
              stepTitle: 'Escrever a introdução',
            },
          ],
          usedMinutes: 120,
          limitMinutes: 180,
        },
      });
    });

    it('dia vazio → blocks []', async () => {
      const res = await getDay(owner.token, '?date=2030-11-19');

      expect(res.body).toEqual({
        date: '2030-11-19',
        blocks: [],
        usedMinutes: 0,
        limitMinutes: 180,
      });
    });

    it('posse: os blocos de A não aparecem para B', async () => {
      const res = await getDay(other.token, `?date=${MONDAY}`);
      const body = res.body as DayBody;

      expect(body.blocks.map((item) => item.stepTitle)).toEqual(['Etapa de B']);
    });

    it('date=xyz → 400', async () => {
      const res = await getDay(owner.token, '?date=xyz');

      expect(res.status).toBe(400);
    });

    it('sem date → 400', async () => {
      const res = await getDay(owner.token, '');

      expect(res.status).toBe(400);
    });

    it('userId na query → 400', async () => {
      const res = await getDay(
        owner.token,
        `?date=${MONDAY}&userId=${other.user.id}`,
      );

      expect(res.status).toBe(400);
    });

    it('data inexistente (2026-02-30) → 422', async () => {
      const res = await getDay(owner.token, '?date=2026-02-30');

      expect(res.status).toBe(422);
    });

    it('token inválido → 401', async () => {
      const res = await getDay('abc', `?date=${MONDAY}`);

      expect(res.status).toBe(401);
    });

    it('sem disponibilidade → 404 com a mensagem do domínio', async () => {
      const fresh = await registerAndLogin();

      const res = await getDay(fresh.token, `?date=${MONDAY}`);

      expect([res.status, (res.body as { message: string }).message]).toEqual([
        404,
        'Disponibilidade não encontrada.',
      ]);
    });

    it('sem token → 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/scheduling/plan/day?date=${MONDAY}`,
      );

      expect(res.status).toBe(401);
    });
  });

  describe('GET /scheduling/plan/week', () => {
    it('semana com blocos → 7 dias de segunda a domingo', async () => {
      const res = await getWeek(owner.token, `?start=${MONDAY}`);
      const body = res.body as WeekBody;

      expect({
        status: res.status,
        days: body.days.map((day) => [
          day.date,
          day.blocks.length,
          day.usedMinutes,
          day.limitMinutes,
        ]),
      }).toEqual({
        status: 200,
        days: [
          ['2030-11-18', 2, 120, 180],
          ['2030-11-19', 0, 0, 180],
          ['2030-11-20', 1, 60, 180],
          ['2030-11-21', 0, 0, 180],
          ['2030-11-22', 0, 0, 180],
          ['2030-11-23', 0, 0, 180],
          ['2030-11-24', 0, 0, 180],
        ],
      });
    });

    it('os blocos da semana trazem os títulos juntados', async () => {
      const res = await getWeek(owner.token, `?start=${MONDAY}`);
      const body = res.body as WeekBody;

      expect(body.days[2].blocks).toEqual([
        {
          id: expect.any(String) as string,
          start: '2030-11-20T22:00:00.000Z',
          end: '2030-11-20T23:00:00.000Z',
          status: 'planned',
          goalId,
          goalTitle: 'TCC',
          colorIndex: 1,
          stepId: stepIds[1],
          stepTitle: 'Escrever a introdução',
        },
      ]);
    });

    it('start numa quarta → 422', async () => {
      const res = await getWeek(owner.token, '?start=2030-11-20');

      expect(res.status).toBe(422);
    });

    it('data inexistente (2026-02-30) → 422', async () => {
      const res = await getWeek(owner.token, '?start=2026-02-30');

      expect(res.status).toBe(422);
    });

    it('start=xyz → 400', async () => {
      const res = await getWeek(owner.token, '?start=xyz');

      expect(res.status).toBe(400);
    });

    it('isolamento: B só vê os blocos dele na semana', async () => {
      const res = await getWeek(other.token, `?start=${MONDAY}`);
      const body = res.body as WeekBody;

      expect(
        body.days.flatMap((day) => day.blocks.map((item) => item.stepTitle)),
      ).toEqual(['Etapa de B']);
    });

    it('sem disponibilidade → 404 com a mensagem do domínio', async () => {
      const fresh = await registerAndLogin();

      const res = await getWeek(fresh.token, `?start=${MONDAY}`);

      expect([res.status, (res.body as { message: string }).message]).toEqual([
        404,
        'Disponibilidade não encontrada.',
      ]);
    });

    it('sem token → 401', async () => {
      const res = await request(app.getHttpServer()).get(
        `/scheduling/plan/week?start=${MONDAY}`,
      );

      expect(res.status).toBe(401);
    });
  });
});
