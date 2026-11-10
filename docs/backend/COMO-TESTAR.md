# Como testar o backend

Hoje o backend (`apps/backend`, NestJS) tem só a **autenticação**: cadastro, login, `/auth/me` e `/auth/demo`, com documentação no Swagger. Todos os comandos abaixo são rodados **a partir da raiz do repositório** (a pasta `OiTenta`) e foram testados em 10/11/2026.

## Antes de começar

Você precisa de:
- **Node.js 24 ou mais novo** (`node -v`);
- **Docker Desktop aberto** (o banco PostgreSQL roda num container). Confira com `docker info`: se der erro, abra o Docker Desktop e espere ele iniciar.

## 1. Instalar

```bash
npm install
```

## 2. Criar o arquivo de configuração `.env`

```bash
cp -n apps/backend/.env.example apps/backend/.env
```

O `-n` não sobrescreve um `.env` que já exista. O arquivo copiado já funciona localmente. Se quiser, troque em `apps/backend/.env` os valores de `JWT_SECRET` e `DEMO_PASSWORD`; nunca coloque esse arquivo no git.

## 2b. Gerar o cliente do Prisma e compilar

O cliente do Prisma não vem pronto numa instalação nova; sem ele, o build do backend falha (`Module '"@prisma/client"' has no exported member 'PrismaClient'`).

```bash
npm --workspace apps/backend run prisma:generate
```

```bash
npm run build
```

O build termina com `Tasks: 9 successful, 9 total`. Ele é necessário porque o backend usa os módulos de domínio já compilados (`modules/*/dist`).

## 3. Subir o banco

```bash
npm --workspace apps/backend run db:start
```

Resultado esperado: `Container oitenta-oitenta-postgres Started` (ou `Running`, se já estava no ar). O banco fica na porta **6435**.

## 4. Aplicar as migrations

```bash
npm --workspace apps/backend run prisma:migrate:deploy
```

Na primeira vez aparece a migration `..._auth` aplicada. Depois disso: `No pending migrations to apply.`

```bash
npm --workspace apps/backend run prisma:generate
```

Resultado esperado: `✔ Generated Prisma Client`. Rode de novo sempre que uma migration nova chegar (o Prisma 7 não regenera o cliente sozinho).

## 5. Criar o usuário de demonstração (seed)

```bash
npm --workspace apps/backend run prisma:seed
```

Na primeira vez: `[seed] usuário demo criado (demo@bora.app).`
Nas próximas: `[seed] usuário demo já existe (demo@bora.app), nada a fazer.` (pode rodar quantas vezes quiser).

## 6. Subir o backend

```bash
npx turbo run dev --filter=@oitenta/backend
```

Espere aparecer `Found 0 errors. Watching for file changes.` O backend fica em **http://localhost:4000**. O terminal fica ocupado; para parar, `Ctrl + C`. Abra **outro terminal** para os passos seguintes.

## 7. Abrir o Swagger

Abra **http://localhost:4000/docs**. Deve aparecer a página **Bora API** com o grupo **auth** e as rotas `POST /auth/register`, `POST /auth/login`, `GET /auth/me` e `POST /auth/demo`. Nela dá para testar tudo pelo botão **Try it out**. Para a rota `/auth/me`, clique em **Authorize** (cadeado no topo) e cole o token do login.

O contrato em JSON fica em http://localhost:4000/docs/openapi.json.

## 8. Testar pelo terminal

**Cadastro** (troque o e-mail se já tiver usado):

```bash
curl -s -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d '{"name":"Ana Souza","email":"ana.teste@bora.app","password":"Senha@123"}'
```

Esperado: `{"user":{"id":"...","name":"Ana Souza","email":"ana.teste@bora.app","timezone":"America/Sao_Paulo"}}` (status 201). Para outro fuso, inclua `"timezone":"America/Manaus"` no corpo (sem ele, vale `America/Sao_Paulo`). Se rodar de novo com o mesmo e-mail: `"statusCode":409,"error":"ConflictError","message":"E-mail já cadastrado."`.
O nome precisa ter nome e sobrenome, e a senha precisa ter maiúscula, minúscula, número e símbolo; senão a resposta é 422.

**Login:**

```bash
curl -s -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"ana.teste@bora.app","password":"Senha@123"}'
```

Esperado: `{"token":"eyJ...","user":{...}}`. Com senha errada ou e-mail inexistente: `"statusCode":401` e `"message":"Credenciais inválidas."`.

**Quem sou eu (`/auth/me`)**: o primeiro comando guarda o token numa variável, o segundo usa:

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"ana.teste@bora.app","password":"Senha@123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
```

```bash
curl -s http://localhost:4000/auth/me -H "Authorization: Bearer $TOKEN"
```

Esperado: `{"user":{"id":"...","name":"Ana Souza","email":"ana.teste@bora.app"}}`.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4000/auth/me
```

Esperado (sem token): `401`.

**Entrar como demo:**

```bash
curl -s -X POST http://localhost:4000/auth/demo
```

Esperado: `{"token":"eyJ...","user":{"name":"Usuária Demo","email":"demo@bora.app",...}}`. Se aparecer 404, rode o seed (passo 5).

Também dá para rodar tudo isso no VS Code com a extensão **REST Client**: abra `apps/backend/src/modules/auth/auth.integration.http` e clique em **Send Request** acima de cada requisição, de cima para baixo.

## 9. Rodar os testes

```bash
npm run test --workspace @oitenta/auth
```

Esperado: `Tests: 25 passed, 25 total` e a linha `All files` com 100 em todas as colunas.

```bash
npm run test --workspaces --if-present
```

Roda os testes de todos os pacotes; nenhum deve falhar.

**Testes de integração do backend** (sobem a aplicação e usam o banco local; o Postgres precisa estar no ar, passo 3):

```bash
npm --workspace apps/backend run test:e2e
```

Esperado: `Test Suites: 2 passed` e nenhum teste falhando. O script liga a opção `--experimental-vm-modules` do Node, necessária para o Jest carregar o `@nestjs/config` (que é só ESM).

## 10. Desligar

`Ctrl + C` no terminal do backend e:

```bash
npm --workspace apps/backend run db:stop
```

Os dados do banco continuam guardados para a próxima vez.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `failed to connect to the docker API` | Docker Desktop fechado | Abra o Docker Desktop e espere iniciar |
| `JWT_SECRET não definido no .env.` ao subir | Falta o `.env` | Rode o passo 2 |
| `Cannot find module '@oitenta/auth'` | Módulos não compilados | Rode `npm run build` |
| `has no exported member 'PrismaClient'` no build | Cliente do Prisma não gerado | Rode `npm --workspace apps/backend run prisma:generate` |
| `Port 4000 is in use` | Outro backend já está rodando | Feche o outro terminal ou encerre o processo com `kill $(lsof -ti tcp:4000)` |
| `/auth/demo` responde 404 | Seed não rodado | Rode o passo 5 |
