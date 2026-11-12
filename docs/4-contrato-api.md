# Contrato da API — mínimo obrigatório do MVP

**Status:** aprovado em 10/11/2026 (decisões P1–P28 em `docs/2-decisoes-mvp.md`). Os casos de uso e as perguntas (P#) estão em `docs/3-modelagem-dominio.md`.

## Regras gerais

- **Base local:** `http://localhost:4000`. O contrato publicado fica em `/docs` (Swagger) e em `packages/contracts/openapi.json` (D 5.5).
- **Autenticação:** todas as rotas exigem `Authorization: Bearer <token>`, exceto `POST /auth/register`, `/auth/login` e `/auth/demo`.
- **Dono do recurso:** o `userId` vem **sempre do token** (`@CurrentUser('id')`), nunca do corpo, da rota ou da query. (R `arquitetura-limpa.md`)
- **Datas:**
  - instantes em ISO 8601 UTC (`2026-11-10T22:00:00.000Z`);
  - datas locais como `YYYY-MM-DD`;
  - horários locais em minutos desde 00:00 (`startMinute`).
- **Corpo das requisições:** cada corpo é uma classe anotada para o Swagger, que implementa a interface `In` do caso de uso (D 5.5).
- **Formato do erro** (filtro global já existente): `{ statusCode, error, message, details?, path, timestamp }`.

| Status | Quando |
|---|---|
| 400 | Corpo, query ou parâmetro malformado: tipo errado, campo ausente, JSON inválido |
| 401 | Sem token, token inválido ou expirado |
| 403 | Autenticado sem permissão. Nenhum endpoint desta fase usa: recurso de outro usuário responde 404 |
| 404 | Recurso inexistente **para aquele usuário** (inclui recurso de outro usuário) |
| 409 | Conflito (e-mail já cadastrado) |
| 422 | Regra de domínio violada (`ValidationException`), com `details` listando os códigos |

**Validação de formato (P19):** `ValidationPipe` global com `class-validator` + `class-transformer` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
- Os corpos (classes do Swagger) recebem os decorators de validação.
- Formato ou tipo inválido, ou campo não previsto → **400**.
- Regra de domínio → **422**.
- Consequência: um `userId` enviado no corpo responde **400** (campo não previsto), e nunca é usado.

---

## 1. Auth (já existe; muda só o fuso, P1, tarefa C0)

| Método e rota | Corpo | Resposta | Erros | Caso de uso | Web | Mobile |
|---|---|---|---|---|---|---|
| `POST /auth/register` | `{ name, email, password, timezone? }` (`timezone` IANA, padrão `America/Sao_Paulo`, P1) | 201 `{ user{id,name,email,timezone} }` | 400, 409, 422 (senha fraca, fuso inválido) | `RegisterUser` | W04 | placeholder (sem design) |
| `POST /auth/login` | `{ email, password }` | 200 `{ token, user }` | 401 | `LoginUser` | W03 | placeholder |
| `POST /auth/demo` | — | 200 `{ token, user }` | 404 (seed não rodado) | `LoginDemoUser` | W03 "Entrar direto como Arthur (demo)" | placeholder com o botão de demo |
| `GET /auth/me` | — | 200 `{ user{id,name,email,timezone} }` | 401 | `GetAuthenticatedUser` | todas as telas logadas | todas as telas logadas |

---

## 2. Disponibilidade (onboarding)

### `PUT /scheduling/availability`

Grava a grade e o limite e recalcula o plano. Orquestrador: `set-availability.orchestrator`.

Corpo:
```json
{
  "windows": [{ "weekday": 0, "startMinute": 1140, "endMinute": 1380 }],
  "dailyLimitMinutes": 180
}
```

Resposta 200:
```json
{
  "availability": { "windows": [ ... ], "dailyLimitMinutes": 180 },
  "plan": { "totalMinutes": 0, "days": 0, "goals": [] }
}
```

- **Erros:** 400 (formato), 401, 422 (zero janelas; janela inválida; limite fora de 60–480 ou não múltiplo de 30, P7).
- **Caso de uso:** `SetWeeklyAvailability` → `GeneratePlan`.
- **Telas:**
  - web: W07–W10 (onboarding: grade, sugestão, limite, pronto);
  - mobile: T02–T03 (grade por período, limite).

**Integração (supertest):**
1. Com token, corpo válido → 200 e grava.
2. Sem token → 401.
3. Zero janelas → 422.
4. Limite 25 → 422.
5. O corpo traz `userId` → 400 (campo não previsto, P19); nada é gravado.

### `GET /scheduling/availability`

- **Resposta:** 200 `{ availability }`.
- **Erros:** 401; 404 (ainda não fez o onboarding).
- **Caso de uso:** `GetWeeklyAvailability`.
- **Uso:** web e mobile decidem, depois do login, se mandam o usuário para o onboarding ou para o Hoje (W11).

**Integração:**
1. Depois do PUT → 200 com os dados.
2. Usuário novo → 404.
3. Sem token → 401.
4. A salvou, B pede → 404.

---

## 3. Objetivos

### `POST /goals`

Cria o objetivo manual com etapas e encaixa no plano. Orquestrador: `create-goal.orchestrator`.

Corpo:
```json
{
  "title": "Trabalho de Algoritmos",
  "deadline": "2026-11-24",
  "kind": "goal",
  "steps": [
    { "title": "Ler o enunciado e listar requisitos", "estimatedMinutes": 30, "microSteps": [] }
  ]
}
```

Campos opcionais (IA1, 12/11/2026), para o objetivo que veio do rascunho da IA (4f: "`aiEstimate` e `estimate` ficam salvos separadamente"):

- `source`: `manual | ai`, padrão `manual`. Outro valor → 400.
- `steps[].aiEstimatedMinutes`: inteiro ≥ 15 e múltiplo de 15, ou `null`; padrão `null`. Inteiro fora da regra (ex.: 20) → 422; não inteiro → 400.

Resposta 201:
```json
{
  "goal": { "id": "…", "title": "…", "deadline": "2026-11-24", "colorIndex": 1, "progressPct": 0, "steps": [ ... ] },
  "plan": {
    "totalMinutes": 495,
    "days": 6,
    "goals": [{ "goalId": "…", "feasible": true, "usedSlack": true, "slackDays": 1, "unscheduledMinutes": 0 }]
  }
}
```

- **Erros:** 400, 401, 404 (sem disponibilidade, P12), 422 (título vazio, zero etapas, estimativa inválida).
- **Caso de uso:** `CreateGoal` → `GeneratePlan`.
- **Telas (P20):** as telas de etapas editáveis, começando **vazias**: **W30** no web e **M15** no mobile (título, prazo, etapas com tempo e total, "Adicionar etapa", encaixar no calendário), sem os elementos da IA. No mobile, a tarefa única usa também **M16** ("Preencher à mão", `kind 'single'`).

**Integração:**
1. Corpo válido → 201 e blocos criados.
2. Sem token → 401.
3. Zero etapas → 422.
4. O corpo traz `userId` → 400 (P19).
5. Usuário sem disponibilidade → 404 (P12).
6. Com `source: "ai"` e `aiEstimatedMinutes` → 201, e o `GET /goals/:goalId` devolve `source: "ai"` e as duas estimativas separadas (IA1).
7. `aiEstimatedMinutes: 20` → 422 (IA1).
8. `source: "xyz"` → 400 (IA1).

### `POST /goals/assistant/draft` (IA1, 12/11/2026)

Gera um rascunho de objetivo com etapas a partir do texto. **Não grava nada**; quem grava é o `POST /goals`. Orquestrador: `goal-draft.orchestrator` (lê o fuso do usuário). Detalhes em `docs/7-proposta-ia.md` §d.1.

Corpo:
```json
{ "text": "Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11" }
```

Resposta 200:
```json
{
  "draft": {
    "title": "Trabalho de Algoritmos",
    "deadline": "2026-11-24",
    "category": "assignment",
    "requirements": [],
    "missingFields": [],
    "steps": [
      { "title": "Ler o enunciado e listar requisitos", "estimatedMinutes": 30, "aiEstimatedMinutes": 30,
        "microSteps": ["Abra o enunciado e copie os itens pedidos numa lista"] }
    ],
    "totalMinutes": 300
  },
  "engine": "rules"
}
```

| Status | Quando |
|---|---|
| 200 | Rascunho gerado (pelo LLM ou pelo motor de regras) |
| 400 | `text` ausente ou não string; campo não previsto (ex.: `userId`, P19) |
| 401 | Sem token |
| 422 | `text` vazio depois de remover espaços (`goal-draft.text.required`) ou com mais de 2000 caracteres (`goal-draft.text.max-length`) |
| 503 | IA indisponível, lenta ou com saída inválida **e** `AI_FALLBACK=none` (`assistant.unavailable`). Web e mobile abrem o formulário manual (4f) |

- **Caso de uso:** `DraftGoal`.
- **Telas:** web W27 → W29 → W30 preenchida; mobile M13 → M14 → M15 preenchida.
- **Configuração (`apps/backend/.env`):** `AI_PROVIDER` (`rules` | `openai-compatible`, padrão `rules`), `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`, `AI_TIMEOUT_MS` (padrão 15000, orçamento total), `AI_FALLBACK` (`rules` | `none`, padrão provisório `rules`, IA6), `AI_LOG_CONTENT` (padrão `false`). Valor desconhecido ou variável obrigatória faltando → o backend não sobe.
- Sem limite de uso nesta fase (IA6).

**Integração (supertest, com `AI_PROVIDER=rules`):**
1. Texto de referência → 200, `deadline` = o próximo 24/11, 5 etapas do modelo `assignment`, todas múltiplas de 15, `engine: 'rules'`.
2. Texto sem data → 200, `deadline: null`, `missingFields: ['deadline']`.
3. Sem token → 401.
4. `text: "   "` → 422; `text` com 2001 caracteres → 422.
5. Corpo com `userId` → 400; sem `text` → 400.
6. Provider que falha (sobrescrito no módulo de teste): com `AI_FALLBACK=none` → 503; com `AI_FALLBACK=rules` → 200 e `engine: 'rules'`.
7. Nenhum objetivo é gravado (o `GET /goals` continua igual).

Não há teste de posse: a rota não lê nem grava recurso de usuário.

### `GET /goals`

- **Resposta:** 200 `{ goals[{id, title, deadline, colorIndex, progressPct, done, total, status, slackDays, createdAt}] }`. `slackDays` é `null` para objetivo `done`, que não entra no plano (C4). `createdAt` (ISO) desempata a ordem do plano.
- **Erros:** 401.
- **Caso de uso:** `ListGoals` + `GetGoalsFeasibility` (folga de cada objetivo no plano atual), montado pelo orquestrador `goals-view` (P17).
- **Telas:** web W12 (coluna "objetivos" do Hoje); mobile M02 (aba Objetivos).

**Integração:**
1. A com 2 objetivos e B com 1 → A recebe só os 2.
2. Sem token → 401.

### `GET /goals/:goalId`

- **Resposta:** 200 `{ goal{…}, steps[{id, order, title, estimatedMinutes, progressPct, status, remainingMinutes, nextBlock?}], progressPct, done, total }`. `nextBlock` é `{id, start, end}` (ISO): o bloco `planned` de menor início a partir de agora. Só aparece em etapa pendente que tem bloco.
- **Erros:** 401; 404 (inexistente ou de outro usuário).
- **Caso de uso:** `GetGoal` + `GetNextBlocks` (orquestrador `goals-view`).
- **Telas:** web W22 (trilha); mobile M18 (trilha).

**Integração:**
1. Dono → 200.
2. Outro usuário → 404.
3. Id inexistente → 404.
4. Sem token → 401.

---

## 4. Plano (Hoje e calendário)

### `GET /scheduling/plan/day?date=YYYY-MM-DD`

- **Resposta:** 200 `{ date, blocks[{id, start, end, status, goalId, goalTitle, colorIndex, stepId, stepTitle}], usedMinutes, limitMinutes }`.
- **Erros:** 400 (data malformada), 401, 404 (sem disponibilidade cadastrada, P12). Data no formato certo mas inexistente no calendário (ex.: `2026-02-30`) → 422.
- **Caso de uso:** `GetDayPlan` + `ListGoals` (orquestrador `day-view`).
- **Telas:** web W12 (timeline do Hoje); mobile M01 (timeline do Hoje).

**Integração:**
1. Dia com blocos → em ordem.
2. Dia vazio → `blocks: []`.
3. Blocos de B não aparecem para A.
4. `date=xyz` → 400.
5. Sem token → 401.

### `GET /scheduling/plan/week?start=YYYY-MM-DD` (segunda-feira)

- **Resposta:** 200 `{ days[7]{date, blocks[…], usedMinutes, limitMinutes} }`.
- **Erros:** 400 (data malformada), 401, 404 (sem disponibilidade cadastrada, P12), 422 (`start` que não é segunda-feira: regra do domínio).
- **Caso de uso:** `GetWeekPlan` + `ListGoals` (orquestrador `week-view`).
- **Telas:**
  - web W15 (semana, Execução, "3h de 3h") e W16 (detalhe do bloco: só leitura nesta fase);
  - mobile M03/M19 (semana compacta e lista do dia).

**Integração:**
1. Semana com blocos → 7 dias.
2. `start` numa quarta → 422.
3. Isolamento entre usuários.
4. Sem token → 401.

As visões Prazos, Mês e Dia (W17–W20, M20–M21) e as ações do detalhe do bloco (Mover, Marcar parcial, Não vou conseguir) ficam **fora do mínimo**.

---

## 5. Rampa e registro

### `GET /activation/ramp?goalId=…&stepId=…&energy=…&availableTime=…`

- **Resposta:** 200 `{ steps[5]{kind, options[{id, stepKind, title, durationLabel, durationSeconds?, description, icon, steps?, operation?, problems?[{a, b, op}]}]}, suggested }`.
- **Erros:** 400 (`energy` inválida), 401, 404 (objetivo ou etapa inexistente ou de outro usuário).
- **Caso de uso:** `GetGoal` → `BuildRamp` (orquestrador `ramp`).
- **Telas:**
  - mobile M05 (check-in), M06 (escada), M07 (aquecimento), M08 (desafio), M09 (micro-passo), M10 (foco);
  - web W12–W14 (check-in no Hoje), W32–W36 (modal da rampa).

**Integração:**
1. `energy=high` → `suggested: 'micro'`; `energy=electric` → `suggested: 'focus'` (P14).
2. Etapa de outro usuário → 404.
3. `energy=xyz` → 400.
4. Sem token → 401.

### `POST /activation/sessions`

Registra o resultado e recalcula. Orquestrador: `record-progress.orchestrator`.

Corpo:
```json
{
  "goalId": "…", "stepId": "…", "blockId": "…",
  "energy": "medium", "availableTime": "30m",
  "startedAt": "…", "endedAt": "…", "focusedMinutes": 25,
  "outcome": "partial", "partialPct": 70
}
```

Resposta 201:
```json
{
  "session": { … },
  "step": { "progressPct": 70, "status": "pending" },
  "goalProgressPct": 57,
  "plan": { "totalMinutes": …, "days": …, "goals": [ … ] }
}
```

- **Erros:** 400, 401, 404 (objetivo, etapa ou bloco inexistente ou de outro usuário), 422 (`partial` sem %).
- **`blockId` é opcional.** Sem ele, o `RecordBlockOutcome` é pulado.
- **Antes de qualquer escrita**, o orquestrador confere a posse com `GetGoal` (objetivo e etapa) e com `GetBlock` (quando há `blockId`). Por isso o 404 não deixa gravação parcial.
- **Caso de uso:** `GetGoal` + `GetBlock` → `RecordFocusSession` → `UpdateStepProgress` → `RecordBlockOutcome` → `GeneratePlan`.
- **Telas:**
  - mobile M11 (registro: Concluí / Parcial / Não rolou) e M12 (celebração; números de gamificação conforme P18);
  - web W38 (registrar), W39 (parcial), W40 (não rolou), W41 (celebração).

**Integração:**
1. `done` → a etapa vai a 100% e o bloco a `done`.
2. `partial` 70 → a etapa vai a 70%, o bloco a `partial`, e o plano recalculado tem só o restante.
3. `not_done` → o % não muda, o bloco vai a `missed` e o plano é recalculado.
4. A registra com a etapa de B → 404, e nada é gravado.
5. `partial` sem % → 422.
6. Sem token → 401.

---

## 6. Mapa endpoint → caso de uso → tela

| Endpoint | Caso(s) de uso | Web | Mobile |
|---|---|---|---|
| `POST /auth/register` | `RegisterUser` | W04 | placeholder |
| `POST /auth/login` | `LoginUser` | W03 | placeholder |
| `POST /auth/demo` | `LoginDemoUser` | W03 | placeholder |
| `GET /auth/me` | `GetAuthenticatedUser` | todas logadas | todas logadas |
| `PUT /scheduling/availability` | `SetWeeklyAvailability` → `GeneratePlan` | W07–W10 | T02–T03 (+ placeholders dos passos sem design) |
| `GET /scheduling/availability` | `GetWeeklyAvailability` | decisão W11 | decisão pós-login |
| `POST /goals` | `CreateGoal` → `GeneratePlan` | W30 vazia (P20) | M15 vazia, M16 (P20) |
| `POST /goals/assistant/draft` | `DraftGoal` (IA1) | W27 → W29 → W30 preenchida | M13 → M14 → M15 preenchida |
| `GET /goals` | `ListGoals` + `GetGoalsFeasibility` | W12 | M02 |
| `GET /goals/:goalId` | `GetGoal` | W22 | M18 |
| `GET /scheduling/plan/day` | `GetDayPlan` + `ListGoals` | W12–W14 | M01 |
| `GET /scheduling/plan/week` | `GetWeekPlan` + `ListGoals` | W15–W16 | M03, M19 |
| `GET /activation/ramp` | `GetGoal` → `BuildRamp` | W12–W14, W32–W36 | M05–M10 |
| `POST /activation/sessions` | `RecordFocusSession` → `UpdateStepProgress` → `RecordBlockOutcome` → `GeneratePlan` | W38–W41 | M11–M12 |

## 7. Decisões deste documento

| # | Assunto | Decisão |
|---|---|---|
| P19 | 400 × 422 | `class-validator` + `class-transformer`; formato → 400, domínio → 422 |
| P20 | Telas do objetivo manual | W30 / M15 começando vazias; M16 para a tarefa única |
| IA1 | Assistente do novo objetivo | `POST /goals/assistant/draft`; `POST /goals` com `source` e `aiEstimatedMinutes` |
