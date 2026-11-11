import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  FixedRampOptionSource,
  FocusSession,
  FocusSessionState,
} from '@oitenta/activation';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaFocusSessionRepository } from '../src/modules/activation/focus-session.prisma';

// Integração do activation contra o banco local (docs/3-modelagem-dominio.md §4). Exige o Postgres no ar.
// As rotas GET /activation/ramp e POST /activation/sessions estão em ramp.e2e-spec.ts e sessions.e2e-spec.ts (C4).
interface LoginBody {
  token: string;
  user: { id: string };
}

describe('activation (integração)', () => {
  let app: INestApplication<App>;

  const unique = () =>
    `activation.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /activation (exemplo do scaffold) foi removido → 404', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app.getHttpServer())
      .get('/activation')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  describe('FixedRampOptionSource', () => {
    it('resolve pelo Nest e devolve as 5 opções de warmup', async () => {
      const source = app.get(FixedRampOptionSource);

      const options = await source.listOptions(randomUUID(), 'warmup');

      expect(options.map((option) => option.id)).toEqual([
        'warmup-1',
        'warmup-2',
        'warmup-3',
        'warmup-4',
        'warmup-5',
      ]);
    });
  });

  describe('PrismaFocusSessionRepository', () => {
    let repository: PrismaFocusSessionRepository;
    let ownerId: string;
    let otherId: string;
    const stepId = randomUUID();

    const STARTED = new Date('2030-03-04T10:00:00.000Z');
    const ENDED = new Date('2030-03-04T10:25:00.000Z');

    function session(
      userId: string,
      overrides: Partial<FocusSessionState> = {},
    ): FocusSession {
      return new FocusSession({
        userId,
        goalId: randomUUID(),
        stepId,
        blockId: null,
        energy: 'low',
        availableTime: null,
        startedAt: STARTED,
        endedAt: ENDED,
        focusedMinutes: 25,
        outcome: 'done',
        partialPct: null,
        ...overrides,
      });
    }

    const snapshot = (s: FocusSession) => ({
      id: s.id,
      userId: s.userId,
      goalId: s.goalId,
      stepId: s.stepId,
      blockId: s.blockId,
      energy: s.energy,
      availableTime: s.availableTime,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      focusedMinutes: s.focusedMinutes,
      outcome: s.outcome,
      partialPct: s.partialPct,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      deletedAt: s.deletedAt ?? null,
    });

    beforeEach(async () => {
      repository = app.get(PrismaFocusSessionRepository);
      ownerId = (await registerAndLogin()).user.id;
      otherId = (await registerAndLogin()).user.id;
    });

    it('create grava e o dono a recebe com os campos nulos', async () => {
      const created = session(ownerId);

      await repository.create(created);

      const found = await repository.findAllByUserAndStep(ownerId, stepId);
      expect(found.map(snapshot)).toEqual([snapshot(created)]);
    });

    it('create grava blockId, availableTime e partialPct preenchidos', async () => {
      const created = session(ownerId, {
        blockId: randomUUID(),
        energy: 'electric',
        availableTime: '30m',
        focusedMinutes: 12,
        outcome: 'partial',
        partialPct: 40,
      });

      await repository.create(created);

      const found = await repository.findAllByUserAndStep(ownerId, stepId);
      expect(found.map(snapshot)).toEqual([snapshot(created)]);
    });

    it('findAllByUserAndStep de outro usuário → lista vazia', async () => {
      await repository.create(session(ownerId));

      expect(await repository.findAllByUserAndStep(otherId, stepId)).toEqual(
        [],
      );
    });

    it('findAllByUserAndStep devolve só as sessões da etapa pedida', async () => {
      const inStepA = session(ownerId);
      await repository.create(inStepA);
      await repository.create(session(ownerId, { stepId: randomUUID() }));

      const found = await repository.findAllByUserAndStep(ownerId, stepId);
      expect(found.map((s) => s.id)).toEqual([inStepA.id]);
    });

    it('findAllByUserAndStep ordena por startedAt crescente e desempata pelo createdAt', async () => {
      const at = (iso: string) => new Date(`2030-03-04T${iso}:00.000Z`);
      const late = session(ownerId, {
        startedAt: at('11:00'),
        endedAt: at('11:25'),
      });
      const tieSecond = session(ownerId, {
        startedAt: at('10:00'),
        endedAt: at('10:25'),
        createdAt: at('12:30'),
        updatedAt: at('12:30'),
      });
      const tieFirst = session(ownerId, {
        startedAt: at('10:00'),
        endedAt: at('10:25'),
        createdAt: at('12:00'),
        updatedAt: at('12:00'),
      });
      const early = session(ownerId, {
        startedAt: at('09:00'),
        endedAt: at('09:25'),
      });
      for (const s of [late, tieSecond, tieFirst, early]) {
        await repository.create(s);
      }

      const found = await repository.findAllByUserAndStep(ownerId, stepId);
      expect(found.map((s) => s.id)).toEqual([
        early.id,
        tieFirst.id,
        tieSecond.id,
        late.id,
      ]);
    });

    it('sessão com deletedAt não aparece', async () => {
      await repository.create(session(ownerId, { deletedAt: new Date() }));

      expect(await repository.findAllByUserAndStep(ownerId, stepId)).toEqual(
        [],
      );
    });
  });
});
