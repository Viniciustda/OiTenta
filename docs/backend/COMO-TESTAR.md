# Como testar o backend

O backend (`apps/backend`, NestJS) tem a fatia do MVP:
- autenticação (cadastro, login, `/auth/me`, `/auth/demo`);
- disponibilidade semanal (onboarding);
- objetivos com etapas;
- plano do dia e da semana;
- rampa de ativação e registro de sessão, que recalcula o plano.

O Swagger documenta tudo. Todos os comandos abaixo são rodados **a partir da raiz do repositório** (a pasta `OiTenta`) e foram testados em 10/11/2026.

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

Abra **http://localhost:4000/docs**. Deve aparecer a página **Bora API** com as rotas de `auth`, `scheduling` (`/scheduling/availability`, `/scheduling/plan/day`, `/scheduling/plan/week`), `goals` (`/goals`, `/goals/{goalId}`) e `activation` (`/activation/ramp`, `/activation/sessions`). Nela dá para testar tudo pelo botão **Try it out**. Para as rotas protegidas, clique em **Authorize** (cadeado no topo) e cole o token do login.

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

### Fluxo completo como demo (onboarding → objetivo → plano → rampa → registro)

Antes, zere os dados do demo, para começar do onboarding. O comando apaga a grade, os objetivos, os blocos e as sessões do demo, e mantém o usuário:

```bash
npm --workspace apps/backend run db:reset-demo
```

Esperado: `[reset-demo] dados do usuário demo apagados (demo@bora.app).`

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/demo | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
```

**Disponibilidade:** de segunda a domingo, das 8h às 23h, com limite de 3h por dia (weekday 0 = segunda … 6 = domingo; minutos desde a meia-noite):

```bash
curl -s -X PUT http://localhost:4000/scheduling/availability -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"windows":[{"weekday":0,"startMinute":480,"endMinute":1380},{"weekday":1,"startMinute":480,"endMinute":1380},{"weekday":2,"startMinute":480,"endMinute":1380},{"weekday":3,"startMinute":480,"endMinute":1380},{"weekday":4,"startMinute":480,"endMinute":1380},{"weekday":5,"startMinute":480,"endMinute":1380},{"weekday":6,"startMinute":480,"endMinute":1380}],"dailyLimitMinutes":180}'
```

Esperado: `{"availability":{...},"plan":{"totalMinutes":0,"days":0,"goals":[]}}`.

**Objetivo com 2 etapas:** troque o prazo por uma data cerca de 2 semanas à frente.

```bash
curl -s -X POST http://localhost:4000/goals -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Trabalho de Algoritmos","deadline":"2026-11-24","kind":"goal","steps":[{"title":"Ler o enunciado","estimatedMinutes":30,"microSteps":[]},{"title":"Escrever o resumo","estimatedMinutes":60,"microSteps":[]}]}'
```

Esperado: status 201, com `goal.id`, `goal.steps[].id` e `plan.goals[0].feasible: true`. Guarde os ids:

```bash
GOAL=$(curl -s http://localhost:4000/goals -H "Authorization: Bearer $TOKEN" | node -pe 'JSON.parse(require("fs").readFileSync(0)).goals[0].id')
```

```bash
STEP=$(curl -s http://localhost:4000/goals/$GOAL -H "Authorization: Bearer $TOKEN" | node -pe 'JSON.parse(require("fs").readFileSync(0)).steps[0].id')
```

**Plano** (troque as datas por hoje e pela segunda-feira desta semana):

```bash
curl -s "http://localhost:4000/scheduling/plan/day?date=2026-11-10" -H "Authorization: Bearer $TOKEN"
```

```bash
curl -s "http://localhost:4000/scheduling/plan/week?start=2026-11-09" -H "Authorization: Bearer $TOKEN"
```

Esperado: `{date, blocks[], usedMinutes, limitMinutes}` no dia e `{days[7]}` na semana. Cada bloco traz `goalTitle` e `stepTitle`. Uma semana que não começa na segunda dá 422.

**Rampa:**

```bash
curl -s "http://localhost:4000/activation/ramp?goalId=$GOAL&stepId=$STEP&energy=high" -H "Authorization: Bearer $TOKEN"
```

Esperado: 5 degraus (`warmup`, `challenge`, `micro`, `focus`, `log`) e `"suggested":"micro"` (P14).

**Registrar a sessão:** sem `blockId`, que é opcional. Troque as datas por instantes recentes.

```bash
curl -s -X POST http://localhost:4000/activation/sessions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"goalId\":\"$GOAL\",\"stepId\":\"$STEP\",\"energy\":\"high\",\"startedAt\":\"2026-11-10T22:00:00.000Z\",\"endedAt\":\"2026-11-10T22:25:00.000Z\",\"focusedMinutes\":25,\"outcome\":\"done\"}"
```

Esperado: status 201, `step.progressPct: 100` e o `plan` recalculado. No `GET /goals/$GOAL`, a primeira etapa aparece como `done`, e a segunda continua com `nextBlock` quando tem bloco futuro.

Também dá para rodar tudo isso no VS Code com a extensão **REST Client**: abra `apps/backend/src/modules/auth/auth.integration.http` e clique em **Send Request** acima de cada requisição, de cima para baixo.

## 8b. Assistente do novo objetivo (IA)

O `POST /goals/assistant/draft` transforma um texto livre num rascunho de objetivo com etapas (decisões IA1–IA7, contrato em `docs/4-contrato-api.md` §3). **Não grava nada**; quem grava é o `POST /goals`. O motor é escolhido no `apps/backend/.env`:

| Variável | Valores | Padrão |
|---|---|---|
| `AI_PROVIDER` | `rules` (motor de regras, sem rede) ou `openai-compatible` (Ollama, Groq, OpenRouter...) | `rules` |
| `AI_BASE_URL`, `AI_MODEL` | endereço e modelo do fornecedor | obrigatórios com `openai-compatible` |
| `AI_API_KEY` | chave do fornecedor (segredo; só no `.env`) | vazio (o Ollama não pede) |
| `AI_TIMEOUT_MS` | orçamento total do rascunho, em ms | `15000` |
| `AI_FALLBACK` | `rules` (a IA falhou ou demorou → rascunho do motor de regras) ou `none` (503 → o app abre o formulário manual) | `rules` (provisório até 13/11, IA6) |
| `AI_LOG_CONTENT` | `true` põe o texto do usuário e a resposta no log (só desenvolvimento) | `false` |

Valor desconhecido (ex.: `AI_PROVIDER=fake`) ou `openai-compatible` sem `AI_BASE_URL`/`AI_MODEL` → o backend **não sobe** e diz o que falta (sem mostrar a chave).

**Se o seu `.env` é anterior a 12/11/2026**, ele não tem as variáveis `AI_*` (o `cp -n` do passo 2 não sobrescreve). Sem elas, vale o padrão `rules`. Para tê-las no arquivo, copie o bloco "Assistente do novo objetivo" do `apps/backend/.env.example` para o fim do `apps/backend/.env`.

**Trocar o motor:** edite o `apps/backend/.env` e **reinicie o backend** (`Ctrl + C` e o passo 6 de novo). O `.env` só é lido na subida.

### Testar no Swagger

1. Rode `curl -s -X POST http://localhost:4000/auth/demo` e copie o `token`.
2. Em http://localhost:4000/docs, clique em **Authorize** e cole o token.
3. Abra **POST /goals/assistant/draft** → **Try it out**. O corpo de exemplo já traz o texto de referência; clique em **Execute**.
4. Esperado com `AI_PROVIDER=rules`: 200, `draft.title` "Trabalho de Algoritmos", `draft.deadline` no próximo 24/11, `category` `assignment`, 5 etapas que somam 300 min (`totalMinutes`) e `engine` `rules`.
5. Troque o texto por `Estudar para a prova de Cálculo` (sem data): `deadline` vem `null` e `missingFields` vem `["deadline"]`. Com `"   "`: 422.

### Testar pelo terminal

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/demo | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
```

```bash
curl -s -X POST http://localhost:4000/goals/assistant/draft -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"text":"Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11"}'
```

Esperado: `{"draft":{"title":"Trabalho de Algoritmos","deadline":"2026-11-24",...},"engine":"rules"}`.

### Testar com o Ollama (IA local, nada sai da sua máquina)

1. **Confira que o Ollama está no ar:**

   ```bash
   curl -s http://localhost:11434/api/tags
   ```

   Esperado: um JSON com `"models":[...]`. Se der "Connection refused", abra o app do Ollama (ou rode `ollama serve` em outro terminal).

2. **Veja qual modelo usar:**

   ```bash
   ollama list
   ```

   Use o nome da coluna `NAME` (ex.: `llama3.2:3b`). Se houver mais de um, prefira o menor (coluna `SIZE`). **Se a lista estiver vazia**, não há modelo: baixar um é uma decisão em aberto no `afazeres.md` ("Ollama local sem modelo instalado"). Sem modelo, todo pedido cai no motor de regras.

3. **Configure o `apps/backend/.env`** (troque `<modelo>` pelo nome do passo 2):

   ```
   AI_PROVIDER="openai-compatible"
   AI_BASE_URL="http://localhost:11434/v1"
   AI_MODEL="<modelo>"
   AI_API_KEY=""
   ```

4. **Reinicie o backend** (passo 6) e repita o `curl` do rascunho acima.
   - Esperado com o modelo respondendo bem: `"engine":"llm"`. No terminal do backend aparece `assistant op=parseGoal provider=openai-compatible model=<modelo> prompt=parse-goal@v1 ms=... outcome=ok` e o mesmo para `suggestSteps`.
   - Se o modelo demorar mais de 15 s no total, devolver JSON inválido ou o modelo não existir, a resposta vem com `"engine":"rules"` e o log mostra `outcome=timeout`, `invalid_json`, `invalid_output` ou `http_404`, seguido de `assistant op=draft ... fallback=rules`. Isso é a reserva funcionando, não um erro.
   - Para ver o texto e a resposta no log, acrescente `AI_LOG_CONTENT="true"` (só na sua máquina).

5. **Comparar os motores** com os 10 textos de referência (não grava nada):

   ```bash
   npm --workspace apps/backend run ai:eval
   ```

   Ele usa o motor do `.env`. Para rodar outro motor sem editar o arquivo, ponha as variáveis na frente do comando (elas têm prioridade sobre o `.env`):

   ```bash
   AI_PROVIDER=openai-compatible AI_BASE_URL=http://localhost:11434/v1 AI_MODEL=<modelo> AI_API_KEY= npm --workspace apps/backend run ai:eval
   ```

   Resultado da rodada de 12/11/2026 em `docs/8-avaliacao-ia.md`.

### Voltar para o motor de regras

No `apps/backend/.env`, ponha `AI_PROVIDER="rules"` (ou apague as linhas `AI_*`) e reinicie o backend. Os testes automáticos (unitários, integração, Playwright e `integration_test`) usam sempre o motor de regras, sem rede.

## 9. Rodar os testes

```bash
npm run test --workspace @oitenta/auth
```

Esperado: nenhum teste falhando e a linha `All files` com 100 em todas as colunas. O mesmo vale para `@oitenta/goals`, `@oitenta/scheduling` e `@oitenta/activation`.

```bash
npm run test --workspaces --if-present
```

Roda os testes de todos os pacotes; nenhum deve falhar.

**Testes de integração do backend** (sobem a aplicação e usam o banco local; o Postgres precisa estar no ar, passo 3):

```bash
npm --workspace apps/backend run test:e2e
```

Esperado: `Test Suites: 9 passed` e `Tests: 120 passed` (número de 10/11), sem falhas. Os testes criam usuários próprios e não mexem no demo. O script liga a opção `--experimental-vm-modules` do Node, necessária para o Jest carregar o `@nestjs/config` (que é só ESM).

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
| `POST /goals` ou `GET /scheduling/plan/day` responde 404 "Disponibilidade não encontrada." | Usuário sem onboarding (P12) | Faça o `PUT /scheduling/availability` antes |
| Erro 500 logo depois de uma migration nova | Cliente do Prisma desatualizado | Rode `prisma:generate` e `npm run build` de novo |
| O backend não sobe e diz `AI_PROVIDER inválido` ou `exige AI_BASE_URL e AI_MODEL` | Variável `AI_*` errada ou faltando | Corrija o `apps/backend/.env` (seção 8b) |
| O rascunho sempre volta com `"engine":"rules"` com o Ollama | Modelo inexistente, Ollama fora do ar ou resposta lenta/inválida | Veja o `outcome=` no log do backend e confira `ollama list` (seção 8b) |
