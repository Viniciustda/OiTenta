import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CreateGoal } from '@oitenta/goals';
import { BlockOrigin, BlockStatus, ScheduledBlock } from '@oitenta/scheduling';
import { NotFoundError } from '@oitenta/shared';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaGoalRepository } from '../src/modules/goals/goal.prisma';
import { EmptyCommitmentRepository } from '../src/modules/scheduling/commitment.empty';
import { PrismaScheduledBlockRepository } from '../src/modules/scheduling/scheduled-block.prisma';
import { PrismaWeeklyAvailabilityRepository } from '../src/modules/scheduling/weekly-availability.prisma';

// Integração do scheduling contra o banco local (docs/4-contrato-api.md §2). Exige o Postgres no ar.
// O `plan` do PUT vem do orquestrador set-availability (C4); o dia e a semana estão em plan-views.e2e-spec.ts.
interface LoginBody {
  token: string;
  user: { id: string };
}

const VALID_BODY = {
  windows: [
    { weekday: 0, startMinute: 1140, endMinute: 1380 },
    { weekday: 2, startMinute: 480, endMinute: 600 },
  ],
  dailyLimitMinutes: 180,
};

// Todo dia das 06:00 às 23:00 locais: há tempo livre nos próximos dias qualquer que seja a hora do teste.
const EVERY_DAY_BODY = {
  windows: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    startMinute: 360,
    endMinute: 1380,
  })),
  dailyLimitMinutes: 180,
};

describe('scheduling (integração)', () => {
  let app: INestApplication<App>;

  const unique = () =>
    `scheduling.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

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

  const put = (token: string, body: unknown) =>
    request(app.getHttpServer())
      .put('/scheduling/availability')
      .set('Authorization', `Bearer ${token}`)
      .send(body as object);

  const get = (token: string) =>
    request(app.getHttpServer())
      .get('/scheduling/availability')
      .set('Authorization', `Bearer ${token}`);

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

  describe('PUT /scheduling/availability', () => {
    it('corpo válido → 200 com a disponibilidade e o plano recalculado (vazio sem objetivos)', async () => {
      const { token } = await registerAndLogin();

      const res = await put(token, VALID_BODY);

      expect({ status: res.status, body: res.body as unknown }).toEqual({
        status: 200,
        body: {
          availability: VALID_BODY,
          plan: { totalMinutes: 0, days: 0, goals: [] },
        },
      });
    });

    it('com um objetivo ativo → o plano devolvido encaixa o objetivo e grava os blocos', async () => {
      const { token, user } = await registerAndLogin();
      const deadline = new Date(Date.now() + 21 * 86_400_000)
        .toISOString()
        .slice(0, 10);
      const { goal } = await new CreateGoal(
        app.get(PrismaGoalRepository),
      ).execute({
        userId: user.id,
        title: 'TCC',
        deadline,
        kind: 'goal',
        steps: [
          { title: 'Ler', estimatedMinutes: 60 },
          { title: 'Escrever', estimatedMinutes: 90 },
        ],
      });

      const res = await put(token, EVERY_DAY_BODY);
      const blocks = await app
        .get(PrismaScheduledBlockRepository)
        .findByUserInRange(
          user.id,
          new Date(),
          new Date(Date.now() + 30 * 86_400_000),
        );

      expect({
        plan: (res.body as { plan: unknown }).plan,
        blockMinutes: blocks.reduce((sum, b) => sum + b.durationMinutes, 0),
      }).toEqual({
        plan: {
          totalMinutes: 150,
          days: expect.any(Number) as number,
          goals: [
            {
              goalId: goal.id,
              feasible: true,
              usedSlack: true,
              slackDays: 1,
              scheduledMinutes: 150,
              unscheduledMinutes: 0,
            },
          ],
        },
        blockMinutes: 150,
      });
    });

    it('corpo válido → grava no banco', async () => {
      const { token, user } = await registerAndLogin();

      await put(token, VALID_BODY);

      const saved = await app
        .get(PrismaWeeklyAvailabilityRepository)
        .findByUser(user.id);
      expect([saved?.windows, saved?.dailyLimitMinutes]).toEqual([
        VALID_BODY.windows,
        180,
      ]);
    });

    it('segundo PUT substitui a disponibilidade', async () => {
      const { token } = await registerAndLogin();
      await put(token, VALID_BODY);

      await put(token, {
        windows: [{ weekday: 5, startMinute: 600, endMinute: 720 }],
        dailyLimitMinutes: 60,
      });

      expect((await get(token)).body).toEqual({
        availability: {
          windows: [{ weekday: 5, startMinute: 600, endMinute: 720 }],
          dailyLimitMinutes: 60,
        },
      });
    });

    it('sem token → 401', async () => {
      const res = await request(app.getHttpServer())
        .put('/scheduling/availability')
        .send(VALID_BODY);

      expect(res.status).toBe(401);
    });

    it('zero janelas → 422', async () => {
      const { token } = await registerAndLogin();

      const res = await put(token, { windows: [], dailyLimitMinutes: 180 });

      expect(res.status).toBe(422);
    });

    it('limite 25 → 422', async () => {
      const { token } = await registerAndLogin();

      const res = await put(token, { ...VALID_BODY, dailyLimitMinutes: 25 });

      expect(res.status).toBe(422);
    });

    it('corpo com userId → 400', async () => {
      const { token } = await registerAndLogin();

      const res = await put(token, { ...VALID_BODY, userId: randomUUID() });

      expect(res.status).toBe(400);
    });

    it('corpo com userId → nada é gravado', async () => {
      const { token, user } = await registerAndLogin();

      await put(token, { ...VALID_BODY, userId: user.id });

      expect(
        await app.get(PrismaWeeklyAvailabilityRepository).findByUser(user.id),
      ).toBeNull();
    });

    it('windows que não é array → 400', async () => {
      const { token } = await registerAndLogin();

      const res = await put(token, {
        windows: 'segunda à noite',
        dailyLimitMinutes: 180,
      });

      expect(res.status).toBe(400);
    });

    it('weekday string → 400', async () => {
      const { token } = await registerAndLogin();

      const res = await put(token, {
        windows: [{ weekday: 'segunda', startMinute: 1140, endMinute: 1380 }],
        dailyLimitMinutes: 180,
      });

      expect(res.status).toBe(400);
    });

    it('dailyLimitMinutes ausente → 400', async () => {
      const { token } = await registerAndLogin();

      const res = await put(token, { windows: VALID_BODY.windows });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /scheduling/availability', () => {
    it('depois do PUT → 200 com os dados', async () => {
      const { token } = await registerAndLogin();
      await put(token, VALID_BODY);

      const res = await get(token);

      expect({ status: res.status, body: res.body as unknown }).toEqual({
        status: 200,
        body: { availability: VALID_BODY },
      });
    });

    it('usuário novo → 404 com a mensagem do domínio', async () => {
      const { token } = await registerAndLogin();

      const res = await get(token);

      expect(res.body).toMatchObject({
        statusCode: 404,
        message: 'Disponibilidade não encontrada.',
      });
    });

    it('sem token → 401', async () => {
      const res = await request(app.getHttpServer()).get(
        '/scheduling/availability',
      );

      expect(res.status).toBe(401);
    });

    it('A salvou e B pede → 404', async () => {
      const owner = await registerAndLogin();
      const other = await registerAndLogin();
      await put(owner.token, VALID_BODY);

      const res = await get(other.token);

      expect(res.body).toMatchObject({
        statusCode: 404,
        message: 'Disponibilidade não encontrada.',
      });
    });
  });

  it('GET /scheduling (exemplo do scaffold) foi removido → 404', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app.getHttpServer())
      .get('/scheduling')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  describe('EmptyCommitmentRepository', () => {
    it('devolve lista vazia (sem tabela de compromissos, P8)', async () => {
      const repository = new EmptyCommitmentRepository();

      expect(await repository.findAllByUser(randomUUID())).toEqual([]);
    });
  });

  describe('PrismaScheduledBlockRepository', () => {
    // Referência fixa do recálculo: blocos com start >= FROM são "futuros".
    const FROM = new Date('2030-03-04T12:00:00.000Z');
    const at = (iso: string) => new Date(`2030-03-${iso}:00.000Z`);

    let repository: PrismaScheduledBlockRepository;
    let ownerId: string;
    let otherId: string;

    function block(
      userId: string,
      start: string,
      overrides: {
        status?: BlockStatus;
        pinned?: boolean;
        origin?: BlockOrigin;
      } = {},
    ): ScheduledBlock {
      const startDate = at(start);
      return new ScheduledBlock({
        userId,
        goalId: randomUUID(),
        stepId: randomUUID(),
        start: startDate,
        end: new Date(startDate.getTime() + 30 * 60_000),
        status: overrides.status ?? 'planned',
        pinned: overrides.pinned ?? false,
        origin: overrides.origin ?? 'auto',
      });
    }

    const RANGE_FROM = new Date('2030-03-01T00:00:00.000Z');
    const RANGE_TO = new Date('2030-03-10T00:00:00.000Z');
    const idsInRange = async (userId: string) =>
      (await repository.findByUserInRange(userId, RANGE_FROM, RANGE_TO)).map(
        (b) => b.id,
      );

    // Grava blocos sem apagar nada: nenhum bloco começa depois de 2100.
    const seed = (userId: string, blocks: ScheduledBlock[]) =>
      repository.replaceFutureAutoBlocks(
        userId,
        new Date('2100-01-01T00:00:00.000Z'),
        blocks,
      );

    beforeEach(async () => {
      repository = app.get(PrismaScheduledBlockRepository);
      ownerId = (await registerAndLogin()).user.id;
      otherId = (await registerAndLogin()).user.id;
    });

    it('findByUserInRange devolve só os blocos do usuário, em ordem de início', async () => {
      const later = block(ownerId, '05T10:00');
      const earlier = block(ownerId, '04T08:00');
      const outside = block(ownerId, '20T08:00');
      await seed(ownerId, [later, earlier, outside]);
      await seed(otherId, [block(otherId, '04T09:00')]);

      expect(await idsInRange(ownerId)).toEqual([earlier.id, later.id]);
    });

    it('findById de bloco de outro usuário → null', async () => {
      const owned = block(ownerId, '04T08:00');
      await seed(ownerId, [owned]);

      expect(await repository.findById(otherId, owned.id)).toBeNull();
    });

    it('findById do dono → o bloco', async () => {
      const owned = block(ownerId, '04T08:00');
      await seed(ownerId, [owned]);

      const found = await repository.findById(ownerId, owned.id);
      expect([found?.id, found?.start, found?.status]).toEqual([
        owned.id,
        owned.start,
        'planned',
      ]);
    });

    it('update do dono grava o novo status', async () => {
      const owned = block(ownerId, '04T08:00');
      await seed(ownerId, [owned]);

      await repository.update(owned.clone({ status: 'done' }));

      expect((await repository.findById(ownerId, owned.id))?.status).toBe(
        'done',
      );
    });

    it('update de bloco de outro usuário → NotFoundError', async () => {
      const owned = block(ownerId, '04T08:00');
      await seed(ownerId, [owned]);

      await expect(
        repository.update(owned.clone({ userId: otherId, status: 'done' })),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('update de bloco de outro usuário não muda o bloco', async () => {
      const owned = block(ownerId, '04T08:00');
      await seed(ownerId, [owned]);

      await repository
        .update(owned.clone({ userId: otherId, status: 'done' }))
        .catch(() => undefined);

      expect((await repository.findById(ownerId, owned.id))?.status).toBe(
        'planned',
      );
    });

    it('update de bloco inexistente → NotFoundError', async () => {
      await expect(
        repository.update(block(ownerId, '04T08:00')),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('replaceFutureAutoBlocks apaga só os futuros planned, não pinned e auto do usuário, e grava os novos', async () => {
      const past = block(ownerId, '04T11:30');
      const futureAuto = block(ownerId, '04T12:00');
      const futureAuto2 = block(ownerId, '06T09:00');
      const done = block(ownerId, '05T09:00', { status: 'done' });
      const partial = block(ownerId, '05T10:00', { status: 'partial' });
      const pinned = block(ownerId, '05T11:00', { pinned: true });
      const manual = block(ownerId, '05T12:00', { origin: 'manual' });
      await seed(ownerId, [
        past,
        futureAuto,
        futureAuto2,
        done,
        partial,
        pinned,
        manual,
      ]);
      const fresh = block(ownerId, '07T09:00');

      await repository.replaceFutureAutoBlocks(ownerId, FROM, [fresh]);

      expect(await idsInRange(ownerId)).toEqual([
        past.id,
        done.id,
        partial.id,
        pinned.id,
        manual.id,
        fresh.id,
      ]);
    });

    it('replaceFutureAutoBlocks não toca os blocos de outro usuário', async () => {
      const othersFuture = block(otherId, '05T09:00');
      await seed(otherId, [othersFuture]);

      await repository.replaceFutureAutoBlocks(ownerId, FROM, [
        block(ownerId, '07T09:00'),
      ]);

      expect(await idsInRange(otherId)).toEqual([othersFuture.id]);
    });

    it('replaceFutureAutoBlocks com lista vazia só apaga', async () => {
      await seed(ownerId, [block(ownerId, '05T09:00')]);

      await repository.replaceFutureAutoBlocks(ownerId, FROM, []);

      expect(await idsInRange(ownerId)).toEqual([]);
    });
  });
});
