import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

// Integração do auth contra o banco local (docs/4-contrato-api.md §1). Exige o Postgres no ar.
interface UserBody {
  user: { timezone: string };
}
interface ErrorBody {
  details: string[];
}
interface LoginBody {
  token: string;
}

describe('auth (integração)', () => {
  let app: INestApplication<App>;
  const unique = () =>
    `teste.${Date.now()}.${Math.round(Math.random() * 1e6)}@bora.app`;

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

  it('C0: cadastro com fuso → 201 e devolve o fuso', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Ana Souza',
      email: unique(),
      password: 'Senha@123',
      timezone: 'America/Manaus',
    });

    expect(res.status).toBe(201);
    expect((res.body as UserBody).user.timezone).toBe('America/Manaus');
  });

  it('C0: cadastro sem fuso → 201 com America/Sao_Paulo', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Ana Souza', email: unique(), password: 'Senha@123' });

    expect(res.status).toBe(201);
    expect((res.body as UserBody).user.timezone).toBe('America/Sao_Paulo');
  });

  it('C0: cadastro com fuso inválido → 422', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Ana Souza',
      email: unique(),
      password: 'Senha@123',
      timezone: 'Lua/Base',
    });

    expect(res.status).toBe(422);
    expect((res.body as ErrorBody).details).toContain(
      'user.timezone.invalid.timezone',
    );
  });

  it('C0: /auth/me devolve o fuso do usuário do token', async () => {
    const email = unique();
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Ana Souza',
      email,
      password: 'Senha@123',
      timezone: 'America/Recife',
    });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Senha@123' });

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${(login.body as LoginBody).token}`);

    expect(me.status).toBe(200);
    expect((me.body as UserBody).user.timezone).toBe('America/Recife');
  });

  it('/auth/me sem token → 401', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me');

    expect(res.status).toBe(401);
  });
});
