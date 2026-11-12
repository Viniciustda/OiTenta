# Modelagem do domínio — mínimo obrigatório do MVP

**Status:** aprovada em 10/11/2026. As perguntas P1–P28 foram respondidas; cada decisão, com contexto e motivo, está em `docs/2-decisoes-mvp.md` (seção "Decisões da Etapa A"). Neste documento, a marca **(P#)** indica a decisão que define a regra.

**Escopo:** o mínimo obrigatório de `docs/2-decisoes-mvp.md` (4a):
- onboarding (grade de horários livres + limite diário);
- objetivo manual com etapas;
- gerar o plano;
- Hoje;
- calendário (semana);
- rampa mínima;
- progresso com %;
- recálculo do plano.

Fora desta fase: IA (exceto o assistente do novo objetivo, §2.6, acrescentado em 12/11/2026), gamificação, notificações e tudo o que está fora em `docs/2-decisoes-mvp.md`.

**Siglas de origem** (onde cada regra foi definida):

| Sigla | Fonte |
|---|---|
| **D** | `docs/2-decisoes-mvp.md` (seção) |
| **F** | `docs/0-fluxos.md` (seção) |
| **UC** | `docs/0-casos-de-uso.md` |
| **W** | `design/web/SCREENS.md` (tela) |
| **M** | `design/mobile/app/SCREENS.md` (tela) |
| **T** | `design/mobile/telas/SCREENS.md` (tela) |
| **DATA** | `design/mobile/app/source/bora-data.js` |
| **R** | `.agents/rules/*` |

---

## 0. Regras que valem para todos os módulos

- Toda entidade estende `Entity<State>` de `@oitenta/shared` (`id` UUID, `createdAt`, `updatedAt`, `deletedAt`). (R `nomenclatura-e-estrutura.md`)
- Validação explícita em `validate()`, nunca no construtor. (skill `module-entity`)
- **Todo recurso pertence a um `userId`** (UUID obrigatório). Todo método de repositório de recurso de usuário recebe `userId` e filtra por ele. Recurso de outro usuário → `NotFoundError` (404). (D 4d; R `arquitetura-limpa.md`)
- **Referências entre módulos só por id** (`goalId`, `stepId` em `scheduling` e `activation`). Um módulo nunca importa outro. A comunicação é feita pelos orquestradores do backend (D 5.9).
- **Interfaces só nas fronteiras:** repositórios, providers externos, `RampOptionSource` e `BusySource` (D 4d). Classes puras de cálculo não têm interface.
- **Tempo** (D 4c):
  - instantes em UTC (`Date`);
  - grade semanal em hora local (`weekday` + minutos desde 00:00), interpretada no fuso IANA do usuário;
  - granularidade de 15 min;
  - bloco mínimo de 30 min.
- **Dia da semana:** `0 = segunda … 6 = domingo`, como nas grades do design (W07, T02: "Seg … Dom").
- Conversão de fuso nas classes puras com `Intl.DateTimeFormat`, que é nativo do JavaScript e não é dependência nem framework.

---

## 1. Módulo `auth` (já existe)

Entidade `User` (`name`, `email`, `password` em hash) e casos de uso `RegisterUser`, `LoginUser`, `GetAuthenticatedUser`, `LoginDemoUser`, com cenários e testes já existentes (`modules/auth/test`).

**Mudança decidida (P1):** a entidade `User` ganha `timezone: string` (identificador IANA, obrigatório na entidade). No cadastro ele é opcional na requisição, com padrão `America/Sao_Paulo`. Tarefa C0.

**Cenários novos (C0):**
1. `User` com `timezone = 'America/Sao_Paulo'` → `validate()` ok.
2. `User` com `timezone = 'Lua/Base'` (inexistente) → `ValidationException` com `user.timezone.invalid.timezone` (padrão de código das regras do shared, como `user.email.invalid.email`).
3. `RegisterUser` com `timezone = 'America/Manaus'` → o usuário gravado tem esse fuso.
4. `RegisterUser` sem `timezone` → o usuário gravado tem `America/Sao_Paulo`.
5. `GetAuthenticatedUser` → a saída inclui o `timezone`.

---

## 2. Módulo `goals`

### 2.1 Agregado `goal`

**Entidade `Goal`** (raiz do agregado), `modules/goals/src/goal/model/goal.entity.ts`:

| Atributo | Tipo | Regra | Origem |
|---|---|---|---|
| `userId` | `string` (UUID) | obrigatório | D 4d |
| `title` | `string` | obrigatório, 1–120 caracteres sem os espaços das pontas (P2) | UC02, UC30 |
| `deadline` | `string` (data local `YYYY-MM-DD`) ou `null` | opcional (P3); sem prazo = entra no plano depois dos com prazo | M16 "prazo opcional"; DATA (Portfólio sem prazo) |
| `kind` | `'goal' \| 'single'` | `single` = tarefa à mão com 1 etapa | D 4d |
| `colorIndex` | `1 \| 2 \| 3 \| 4` | sequencial entre os objetivos **ativos** do usuário (1→4, depois volta ao 1), definido na criação e fixo (P4) | DATA `OBJ`; W31 (4º objetivo roxo) |
| `source` | `'manual' \| 'ai'` | `manual` nesta fase | D 4f |
| `status` | `'active' \| 'done'` | `done` quando o progresso chega a 100% | F §6 |
| `steps` | `Step[]` | pelo menos 1; `single` tem exatamente 1 | D 4h |

**Entidade `Step`** (filha do agregado), `modules/goals/src/goal/model/step.entity.ts`:

| Atributo | Tipo | Regra | Origem |
|---|---|---|---|
| `goalId` | `string` | obrigatório | — |
| `order` | `number` (inteiro ≥ 1) | único dentro do objetivo | F §6 "etapas em ordem" |
| `title` | `string` | obrigatório, 1–120 (P2) | F §4 |
| `estimatedMinutes` | `number` | inteiro ≥ 15 e múltiplo de 15 (P5) | D 4c; M16 chips 15 min…2h |
| `aiEstimatedMinutes` | `number \| null` | `null` nesta fase | D 4f |
| `progressPct` | `number` | inteiro 0–100 | D 4h |
| `status` | `'pending' \| 'done' \| 'superseded'` | `done` ⇔ `progressPct = 100` | D 4h |
| `microSteps` | `string[]` | textos do degrau Micro-passo; opcional (vazio → texto genérico provisório, P6) | DATA `ETAPAS[].micro`; F §3 |

**Invariantes:**
- `kind = 'single'` ⇒ exatamente 1 etapa;
- as ordens das etapas são 1..n, sem repetição;
- um objetivo com todas as etapas não `superseded` em 100% tem `status = 'done'`;
- uma etapa `superseded` nunca volta a `pending` (D 4h).

### 2.2 Classe pura `GoalProgressCalculator`

Arquivo: `modules/goals/src/goal/model/goal-progress.calculator.ts`.

- **`goalProgressPct(steps)`:** Σ(peso × %) ÷ Σ peso.
  - O peso é `estimatedMinutes`.
  - Para uma etapa `superseded`, o peso é só o que foi feito (`estimatedMinutes × progressPct / 100`) e o % dela conta como 100.
  - Resultado arredondado para inteiro. (D 4h)
- **`remainingMinutes(step)`:** `estimatedMinutes × (1 − progressPct/100)`, arredondado **para cima** ao múltiplo de 15 (D 4c, granularidade). Uma etapa `superseded` ou `done` → 0.
- **`summary(steps)`:** `{ done, total }` contando só as etapas não `superseded` (F §6 "X de Y etapas"; D 4h "concluir 1 de 5 deixa claro que faltam 4").

### 2.3 Repositório

`GoalRepository` (`provider/goal.repository.ts`), tipo `custom`:

| Método | Descrição |
|---|---|
| `create(goal)` | grava o objetivo com as etapas |
| `update(goal)` | grava as alterações (atualização escopada por `goal.userId`) |
| `findById(userId, goalId)` | devolve o objetivo ou `null`, sempre filtrando pelo usuário |
| `findAllByUser(userId)` | todos os objetivos do usuário |

### 2.4 Casos de uso

| Caso de uso | Entrada | Saída | Origem |
|---|---|---|---|
| `CreateGoal` | `userId`, `title`, `deadline?`, `kind`, `source?` (IA1), `steps[{title, estimatedMinutes, aiEstimatedMinutes?, microSteps?}]` | `{ goal }` | UC30, UC04, D 4d, 4f |
| `DraftGoal` (IA1) | `userId`, `text`, `now`, `timezone` | `{ draft, engine }` (não grava) | UC02, UC04, UC18, D 4f |
| `ListGoals` | `userId` | `{ goals[{id, title, deadline, colorIndex, progressPct, done, total, status, createdAt}] }` (`createdAt` acrescentado na C4: o `PlanCalculator` desempata por ele) | UC12, M02, W21 |
| `GetGoal` | `userId`, `goalId` | `{ goal, steps[{…, remainingMinutes}], progressPct }` | UC10, M18, W22 |
| `UpdateStepProgress` | `userId`, `goalId`, `stepId`, `progressPct` | `{ goalProgressPct, step }` | UC08, D 4h |

### 2.5 Cenários de teste — `goals`

**`Goal` / `Step` (entidade)**
1. Dado título, `kind='goal'` e 2 etapas válidas, quando `validate()`, então não lança erro.
2. Dado título vazio, quando `validate()`, então lança `ValidationException` com `goal.title.required`.
3. Dado `kind='single'` com 2 etapas, quando `validate()`, então lança `ValidationException`.
4. Dado zero etapas, quando `validate()`, então lança `ValidationException`.
5. Dado uma etapa com `estimatedMinutes = 20`, quando `validate()`, então lança erro de múltiplo de 15 (P5).
6. Dado `progressPct = 101` ou `-1`, quando `validate()`, então lança erro de faixa.
7. Dado dados inválidos, quando o objeto é construído, então não lança erro (validação só no `validate()`).

**`GoalProgressCalculator`**
1. Dado 5 etapas de 60 min e uma com 100%, quando `goalProgressPct`, então 20, e `summary` = `{done: 1, total: 5}`.
2. Dado etapas de 30 min (100%) e 90 min (0%), quando `goalProgressPct`, então 25 (média ponderada, não simples).
3. Dado uma etapa de 60 min com 50%, quando `remainingMinutes`, então 30.
4. Dado uma etapa de 45 min com 50%, quando `remainingMinutes`, então 30 (22,5 arredondado para cima ao múltiplo de 15).
5. Dado uma etapa `superseded` de 60 min com 50% e uma nova de 30 min com 0%, quando `goalProgressPct`, então 50, porque o peso da `superseded` passa a ser 30 min feitos.
6. Dado todas as etapas em 0%, então 0; dado todas em 100%, então 100.
7. Dado uma etapa `superseded`, quando `remainingMinutes`, então 0.

**`CreateGoal`**
0. **Cor (P4):** dado um usuário com 2 objetivos ativos (cores 1 e 2), quando criar outro, então `colorIndex = 3`; com 4 ativos (1–4), o próximo recebe 1.
1. Dado um usuário e 7 etapas (o exemplo de F §4, total 8h15 = 495 min), quando executar, então grava 1 objetivo com 7 etapas na ordem 1..7, `progressPct` 0 e `status 'active'`.
2. Dado `kind='single'` com 1 etapa, quando executar, então grava.
3. Dado título vazio, quando executar, então lança `ValidationException` e não grava nada.
4. Dado `userId` X, quando executar, então o objetivo gravado tem `userId` X (o dono vem da entrada montada a partir do token).

**`ListGoals`**
1. Dado o usuário A com 2 objetivos e o B com 1, quando A lista, então recebe só os 2 dele.
2. Dado um usuário sem objetivos, quando listar, então recebe uma lista vazia.
3. Dado um objetivo com 1 de 4 etapas iguais concluída, quando listar, então `progressPct` 25, `done` 1, `total` 4.

**`GetGoal`**
1. Dado um objetivo de A, quando A pede, então recebe as etapas com `remainingMinutes`.
2. **Posse:** dado um objetivo de A, quando B pede o mesmo `goalId`, então lança `NotFoundError`.
3. Dado um `goalId` inexistente, então lança `NotFoundError`.

**`UpdateStepProgress`**
1. Dado uma etapa a 0%, quando atualizar para 50, então a etapa fica com 50% e o objetivo recalcula o %.
2. Dado a última etapa pendente atualizada para 100, então a etapa fica `done` e o objetivo `done`.
3. Dado `progressPct = 120`, então lança `ValidationException` e não grava.
4. **Posse:** dado um objetivo de A, quando B tenta atualizar, então lança `NotFoundError` e não grava.
5. Dado um `stepId` que não é do objetivo, então lança `NotFoundError`.
6. Dado uma etapa `superseded`, quando atualizar, então lança `ValidationException`.

### 2.6 Assistente do novo objetivo (IA1, 12/11/2026)

Detalhes e motivos em `docs/7-proposta-ia.md` (§a, §c) e `docs/2-decisoes-mvp.md` (IA1–IA7). O domínio só declara a porta e as regras; as implementações (motor de regras, adaptador compatível com OpenAI) moram em `apps/backend/src/modules/goals/assistant/`.

**Porta** (`goal/provider/goal-assistant.provider.ts`):

```ts
export type GoalCategory = "assignment" | "exam" | "project" | "generic"; // não confundir com Goal.kind
export type GoalDraftField = "title" | "deadline";                       // informativo (IA2, P3)
export type AssistantEngine = "llm" | "rules";

export interface ParseGoalIn { text: string; today: string; timezone: string; } // today = YYYY-MM-DD local
export interface ParsedGoal {
  title: string | null; deadline: string | null; category: GoalCategory;
  requirements: string[]; missingFields: GoalDraftField[]; engine: AssistantEngine;
}
export interface SuggestStepsIn {
  title: string; deadline: string | null; category: GoalCategory;
  requirements: string[]; text: string; today: string;
}
export interface SuggestedStep { title: string; estimatedMinutes: number; microSteps: string[]; }
export interface SuggestedSteps { steps: SuggestedStep[]; engine: AssistantEngine; }

/** Falha (indisponível, lento, saída inválida) → ServiceUnavailableError (shared, 503). */
export interface GoalAssistantProvider {
  parseGoal(input: ParseGoalIn): Promise<ParsedGoal>;
  suggestSteps(input: SuggestStepsIn): Promise<SuggestedSteps>;
}
```

O id, o nome, o e-mail e o fuso do usuário **não** vão para o provider além do `timezone` do `ParseGoalIn` (que o adaptador LLM não repassa ao fornecedor).

**Erro novo no `shared`:** `ServiceUnavailableError extends DomainError` (503). Códigos usados: `assistant.unavailable`, `assistant.invalid-output`, `assistant.empty-steps`.

**Classe pura `GoalDraftNormalizer`** (`goal/model/goal-draft.normalizer.ts`): aplica as regras do domínio a qualquer saída (LLM ou regras). Limites exportados em `GOAL_DRAFT_LIMITS`.

| Campo | Regra |
|---|---|
| título | espaços repetidos viram um; sem espaços nas pontas; mais de 120 caracteres → cortado na última palavra inteira até 120 (P2); vazio ou `null` → `null` |
| prazo | `YYYY-MM-DD` de uma data que existe e ≥ `today`; senão `null` |
| categoria | fora das 4 → `generic` |
| requisitos | sem espaços nas pontas, sem vazios, sem repetidos (ignorando maiúsculas), cada um até 60 caracteres (corte na palavra), no máximo 6 |
| etapas | sem as de título vazio; título até 120 (corte na palavra); no máximo 12 (as primeiras) |
| minutos da etapa | arredondados ao múltiplo de 15 mais próximo; mínimo 15, **máximo 240** (IA1); valor que não é número finito → 15 |
| micro-passos | sem vazios, cada um até 140 caracteres (corte na palavra), no máximo 3 |
| zero etapas depois da limpeza | lança `ServiceUnavailableError('assistant.empty-steps')` |
| `missingFields` | calculado dos valores finais, na ordem `title`, `deadline` (o que o motor disse é ignorado) |
| `aiEstimatedMinutes` | igual ao `estimatedMinutes` normalizado (o usuário só edita o `estimatedMinutes`) |
| `totalMinutes` | soma dos `estimatedMinutes` |
| `engine` | `rules` se qualquer uma das duas respostas veio do motor de regras; senão `llm` |

**Caso de uso `DraftGoal`** (`goal/usecase/draft-goal.usecase.ts`). Não grava nada e não tem recurso de usuário (sem teste de posse).

```ts
export interface DraftGoalIn { userId: string; text: string; now: Date; timezone: string; }
export interface GoalDraftStep { title: string; estimatedMinutes: number; aiEstimatedMinutes: number; microSteps: string[]; }
export interface GoalDraft {
  title: string | null; deadline: string | null; category: GoalCategory; requirements: string[];
  missingFields: GoalDraftField[]; steps: GoalDraftStep[]; totalMinutes: number;
}
export interface DraftGoalOut { draft: GoalDraft; engine: AssistantEngine; }
```

Fluxo: texto sem espaços nas pontas → valida (1–2000) → `today` = data local de `now` no `timezone` → `parseGoal` → `suggestSteps` (título = título normalizado do `parseGoal` ou, se `null`, o texto cortado em 120; prazo e requisitos já normalizados) → `GoalDraftNormalizer` → saída.

**Mudança no `CreateGoal` (IA1):** a entrada ganha `source?: GoalSource` (padrão `manual`) e `steps[].aiEstimatedMinutes?: number | null` (padrão `null`). A entidade já valida os dois (`source` em `manual | ai`; `aiEstimatedMinutes` mínimo 15 e múltiplo de 15 → 422).

**Orçamento e reserva (backend, não domínio):** o `GoalDraftRunner` (`apps/backend/src/modules/goals/assistant/goal-draft.runner.ts`), usado pelo orquestrador `goal-draft.orchestrator` e pelo script `ai:eval`, roda o `DraftGoal` com o provider configurado dentro do orçamento `AI_TIMEOUT_MS` (15 s, as duas chamadas). Se o provider lança `ServiceUnavailableError` ou o orçamento estoura: com `AI_FALLBACK=rules`, roda o `DraftGoal` de novo, **inteiro**, com o motor de regras (`engine: 'rules'`); com `AI_FALLBACK=none`, responde 503 `assistant.unavailable`. Isso substitui o "decorador de fallback" da `docs/7` §c.2: com duas chamadas separadas, só quem chama as duas consegue refazer o rascunho inteiro e controlar o orçamento total.

### 2.7 Cenários de teste — assistente (IA1)

**`ServiceUnavailableError` (shared)**
1. Dado a mensagem `assistant.unavailable`, quando criar o erro, então `statusCode` 503, `name` `ServiceUnavailableError` e é `DomainError`.

**`GoalDraftNormalizer`** (hoje = `2026-11-11`)
1. Título `"  Trabalho   de  Algoritmos "` → `"Trabalho de Algoritmos"`.
2. Título de 130 caracteres com espaços → até 120, terminando numa palavra inteira; título de 130 caracteres sem espaço → os 120 primeiros.
3. Título vazio, só espaços ou `null` → `null` e `missingFields` contém `title`.
4. Prazo `2026-11-24` → mantido; `2026-11-11` (hoje) → mantido; `2026-11-10` → `null` e `deadline` em `missingFields`; `2026-02-31` → `null`; `24/11` → `null`.
5. Categoria `"homework"` → `generic`.
6. Requisitos `[" 3 algoritmos ", "", "3 Algoritmos", …8 itens]` → sem vazio, sem repetido, no máximo 6, cada um até 60.
7. Minutos 20 → 15; 23 → 30; 250 → 240; 5 → 15; 0, −30 e `NaN` → 15; 240 → 240.
8. 13 etapas → as 12 primeiras.
9. Etapa de título vazio é descartada; título de 130 → até 120.
10. Micro-passos `["a", " ", "b", "c", "d"]` → `["a", "b", "c"]`; um de 200 caracteres → até 140.
11. Zero etapas (ou todas de título vazio) → `ServiceUnavailableError('assistant.empty-steps')`.
12. `aiEstimatedMinutes` = `estimatedMinutes`; `totalMinutes` = soma.
13. `engine`: `llm` + `llm` → `llm`; `llm` + `rules` → `rules`.

**`DraftGoal`** (com o `FakeGoalAssistantProvider` de `test/mock`)
1. Texto só com espaços → `ValidationException` `goal-draft.text.required`, e o provider não é chamado.
2. Texto de 2001 caracteres → `goal-draft.text.max-length`; de 2000 → aceito (limite exato).
3. `now = 2026-11-12T02:00:00Z`: com `America/Sao_Paulo` o provider recebe `today = 2026-11-11`; com `Asia/Tokyo`, `2026-11-12`.
4. O provider recebe o texto sem espaços nas pontas.
5. `parseGoal` devolve título `null` → o `suggestSteps` recebe o texto cortado em 120 como título, e o rascunho sai com `title: null` e `missingFields` com `title`.
6. O `suggestSteps` recebe o prazo e os requisitos já normalizados.
7. O provider lança `ServiceUnavailableError` → o erro se propaga.
8. Caminho feliz (texto de referência de F §4) → rascunho normalizado com etapas, `totalMinutes` e o `engine` das respostas.

**`CreateGoal`** (acréscimos)
5. Com `source: 'ai'` e uma etapa `estimatedMinutes 45`, `aiEstimatedMinutes 30` → grava `source 'ai'` e os dois valores separados.
6. Sem os campos → grava `source 'manual'` e `aiEstimatedMinutes null` (comportamento anterior).
7. `aiEstimatedMinutes = 20` → `ValidationException` e não grava.

**Motor de regras e adaptador (backend, testes unitários `*.spec.ts`)**: a tabela de datas e as categorias da `docs/7` §a.3 com "hoje" fixo em 11/11/2026; o adaptador com `fetch` simulado (ok, tempo esgotado, 429, JSON inválido, formato inválido, a chave nunca aparece no log).

---

## 3. Módulo `scheduling`

### 3.1 Agregado `availability`

**Entidade `WeeklyAvailability`** (uma por usuário), `modules/scheduling/src/availability/model/weekly-availability.entity.ts`:

| Atributo | Tipo | Regra | Origem |
|---|---|---|---|
| `userId` | `string` | obrigatório, único | D 4c |
| `windows` | `AvailabilityWindow[]` | pelo menos 1 janela (W09 bloqueia "continuar" sem horário) | D 4c; W07 |
| `dailyLimitMinutes` | `number` | 60–480, múltiplo de 30 (P7) | W09 (60–300, passo 30, padrão 180); T03 (1h–8h) |

**Tipo `AvailabilityWindow`** (valor, sem identidade): `{ weekday: 0–6, startMinute, endMinute }`.
- Minutos desde 00:00 locais, múltiplos de 15, com `start < end`.
- Janelas do mesmo dia não se sobrepõem; janelas encostadas são unidas.
- O web marca por hora (W07, 08h–22h) e o mobile por período (T02: manhã 6–12, tarde 12–18, noite 18–23). Os dois viram janelas. (T Observações)

### 3.2 Agregado `commitment` (só domínio nesta fase)

**Entidade `Commitment`**: compromisso único ou recorrente que ocupa tempo (aula, estágio). (D 4b, 4e)

| Atributo | Tipo | Regra |
|---|---|---|
| `userId` | `string` | obrigatório |
| `title` | `string` | obrigatório |
| `kind` | `'commitment'` | só esse tipo no MVP (D 4e) |
| `startDate` | data local | obrigatório |
| `startMinute`, `durationMinutes` | `number` | múltiplos de 15, duração > 0 |
| `recurrence` | `{ weekdays: (0–6)[], endDate?: data }` ou `null` | sem recorrência = evento único |

- **Decidido (P8):** nenhum design permite cadastrar compromissos (a "Aula" e o "Estágio" da grade W07 são fixos no código do protótipo). Nesta fase existem só a entidade, o `RecurrenceExpander` e o `CommitmentBusySource`, testados, sem endpoint, sem tabela e sem tela. A grade do onboarding web mostra ocupados só se houver compromissos (no MVP, nenhum).

### 3.3 Agregado `plan`

**Entidade `ScheduledBlock`**, `modules/scheduling/src/plan/model/scheduled-block.entity.ts`:

| Atributo | Tipo | Regra | Origem |
|---|---|---|---|
| `userId` | `string` | obrigatório | D 4d |
| `goalId`, `stepId` | `string` | referência por id | D 4d |
| `start`, `end` | `Date` (UTC) | `end > start`; duração múltiplo de 15 | D 4c |
| `status` | `'planned' \| 'done' \| 'partial' \| 'missed'` | — | D 4h |
| `pinned` | `boolean` | fixado pelo usuário; o recálculo não mexe | D 4g |
| `origin` | `'auto' \| 'manual'` | `auto` nesta fase | D 4d |

### 3.4 Classes puras

**`RecurrenceExpander`** (`commitment/model/recurrence-expander.ts`) — D 4e:
- `expand(commitment, fromDate, toDate, timezone)` devolve as ocorrências `{start, end}` (UTC) dentro da janela.
- Sem recorrência, devolve no máximo 1 ocorrência.
- Respeita `startDate` e `recurrence.endDate`.

**`AvailabilityCalculator`** (`availability/model/availability.calculator.ts`) — D 4c:
- `freeIntervals({ windows, timezone, from, to, busy[], now })` faz:
  - janelas locais → UTC dia a dia;
  - menos os intervalos ocupados (`busy`);
  - menos o que já passou (`now`);
  - alinhado à grade de 15 min;
  - devolve intervalos livres ordenados.

**`PlanCalculator`** (`plan/model/plan.calculator.ts`) — D 4g. É determinístico e nunca usa IA.

Entrada:
- `now`, `timezone`;
- `freeIntervals` (vindos do `AvailabilityCalculator`);
- `dailyLimitMinutes`;
- `fixedBlocks`: blocos do passado, concluídos e fixados, que contam para o limite do dia e não mudam;
- `goals[{goalId, deadline|null, createdAt, steps[{stepId, order, remainingMinutes}]}]`;
- `slackDays = 1`, `minBlockMinutes = 30`, `granularity = 15`.

Algoritmo, guloso por prazo mais cedo (D 4g):
1. Ordenar os objetivos por `deadline` (os sem prazo por último, P3), depois por `createdAt`.
2. Para cada objetivo, distribuir as etapas **em ordem**: a etapa n só começa depois de a n−1 estar toda alocada.
3. Preencher os intervalos livres do mais cedo para o mais tarde, até o **último dia permitido = prazo − 1 − folga** (o prazo é o dia da entrega e não recebe trabalho; P9), respeitando o limite diário **somado entre todos os objetivos**, incluindo `fixedBlocks`.
4. Uma etapa pode ser dividida em vários blocos, cada um com pelo menos `minBlockMinutes`, exceto quando a etapa (ou o resto dela) é menor que isso: aí vira um bloco do próprio tamanho (P10).
5. Se não couber com folga: tentar de novo **sem a folga**. Se ainda não couber: alocar o que der e marcar o objetivo como **inviável**, com os minutos que faltaram.

Saída:
- `blocks[]`;
- `goals[{goalId, scheduledMinutes, unscheduledMinutes, feasible, usedSlack, slackDays}]`;
- `summary {totalMinutes, days}` (F §5 "8h15 encaixadas em 6 dias · folga de 1 dia").

### 3.5 Interfaces de fronteira

- **`BusySource`**: `listBusy(userId, from, to, timezone): Promise<Interval[]>`. (D 4d "fontes de ocupação")
  - MVP: `CommitmentBusySource`, uma classe do domínio que usa o `CommitmentRepository` + `RecurrenceExpander`.
  - Depois: Google Calendar (UC28).
- **Repositórios** (todos com `userId`):
  - `WeeklyAvailabilityRepository`: `findByUser(userId)`, `save(availability)`;
  - `CommitmentRepository`: `findAllByUser(userId)`;
  - `ScheduledBlockRepository`: `findByUserInRange(userId, from, to)`, `findById(userId, blockId)`, `update(block)`, `replaceFutureAutoBlocks(userId, from, blocks)`. Este último apaga só os blocos com `start ≥ from` que são `planned`, não `pinned` e `auto`, e grava os novos (D 4g "recalcular mexe só no futuro não concluído").

### 3.6 Casos de uso

| Caso de uso | Entrada | Saída | Origem |
|---|---|---|---|
| `SetWeeklyAvailability` | `userId`, `windows[]`, `dailyLimitMinutes` | `{ availability }` | UC01, W07–W10, T02–T03 |
| `GetWeeklyAvailability` | `userId` | `{ availability }` ou `NotFoundError` | M27 |
| `GeneratePlan` | `userId`, `timezone`, `now`, `goals[…]` (montado pelo orquestrador) | `{ blocks, goals[feasibility], summary }` | UC05, UC09, D 4g |
| `GetDayPlan` | `userId`, `date` (local), `timezone` | `{ date, blocks[], usedMinutes, limitMinutes }` (mesmo cálculo do `GetWeekPlan` para um dia; `NotFoundError` sem disponibilidade; alinhado ao contrato em 10/11/2026) | UC06, W12, M01 |
| `GetWeekPlan` | `userId`, `weekStart` (segunda, local), `timezone` | `{ days[7]{date, blocks[], usedMinutes, limitMinutes} }` | UC07, W15 ("3h de 3h"), M03 |
| `RecordBlockOutcome` | `userId`, `blockId`, `outcome: 'done'\|'partial'\|'missed'` | `{ block }` | UC08, D 4h |
| `GetGoalsFeasibility` | `userId`, `timezone`, `now`, `goals[…]` (montado pelo orquestrador) | `{ goals[{goalId, feasible, slackDays, unscheduledMinutes}] }`, calculado pelo `PlanCalculator` sem gravar (modo simulação, D 4g) | M02 "folga", W21 |
| `GetNextBlocks` (C4) | `userId`, `goalId`, `now` | `{ byStep: Record<stepId, {id, start, end}> }`: por etapa, o bloco `planned` de menor início ≥ `now`, até 366 dias | `nextBlock` da trilha (W22, M18) |
| `GetBlock` (C4) | `userId`, `blockId` | `{ block }` ou `NotFoundError('Bloco não encontrado.')` (de outro usuário também) | posse antes de gravar no `record-progress` |

### 3.7 Cenários de teste — `scheduling`

**`WeeklyAvailability`**
1. Dado 3 janelas válidas e limite 180, quando `validate()`, então ok.
2. Dado zero janelas, então `ValidationException`.
3. Dado uma janela com `start ≥ end`, então erro.
4. Dado minutos que não são múltiplos de 15, então erro.
5. Dado limite 25 ou 490 (fora de 60–480), então erro; dado 45 (não múltiplo de 30), então erro; dado 60 e 480, então ok (P7).
6. Dado janelas sobrepostas no mesmo dia, então erro (ou união; ver a implementação de `SetWeeklyAvailability`, cenário 3).

**`ScheduledBlock`**
1. Dado `end ≤ start`, então erro.
2. Dado uma duração que não é múltipla de 15, então erro.
3. Dado um bloco válido, então ok.

**`RecurrenceExpander`**
1. Dado aula seg–sex 08:00 por 240 min (início 03/11), quando expandir de 03/11 a 09/11, então 5 ocorrências, nenhuma no sábado ou no domingo.
2. Dado `endDate` 05/11, quando expandir a mesma semana, então 3 ocorrências.
3. Dado um compromisso único em 06/11, quando expandir uma semana que o contém, então 1 ocorrência; numa semana que não contém, então 0.
4. Dado o fuso `America/Sao_Paulo`, então uma ocorrência às 08:00 locais começa às 11:00 UTC.

**`AvailabilityCalculator`**
1. Dado a janela seg 19:00–23:00 e nenhum ocupado, quando calcular a segunda 03/11, então 1 intervalo de 240 min.
2. Dado a mesma janela e um ocupado de 20:00–21:00, então 2 intervalos (60 + 120 min).
3. Dado `now` = segunda 20:10, então o intervalo começa em 20:15 (próxima marca de 15 min) e o passado é descartado.
4. Dado janelas só nos dias de semana, quando calcular o sábado, então nenhum intervalo.
5. Dado o fuso `America/Sao_Paulo`, então uma janela local 19:00–23:00 vira 22:00–02:00 UTC (atravessando o dia em UTC).

**`PlanCalculator`**
1. **Exemplo de F §4 e §5:** dado as 7 etapas do trabalho de Algoritmos (30, 60, 45, 90, 90, 60, 120 = 495 min), prazo 24/11, `now` na manhã de 10/11, livre seg–dom 19:00–23:00 e limite de 120 min, quando calcular, então:
   - aloca os 495 min, nenhum depois de 22/11 (prazo 24/11 − 1 − folga de 1 dia; P9);
   - etapas em ordem (nenhum bloco da etapa n antes do fim da n−1);
   - nenhum dia passa de 120 min;
   - nenhum bloco tem menos de 30 min, exceto etapa ou resto menor que 30 (P10);
   - `feasible = true`, `usedSlack = true`.

   O resumo "6 dias · folga de 1 dia" do design depende da disponibilidade usada no protótipo, que não está definida (P11). O teste verifica as invariantes acima.
2. **Limite somado:** dado dois objetivos que caberiam sozinhos no mesmo dia, quando calcular, então a soma do dia não passa do limite e o de prazo mais cedo é alocado primeiro.
3. **Prioridade por prazo:** dado o objetivo A com prazo 20/11 e o B com prazo 15/11, então os blocos de B vêm primeiro.
4. **Sem a folga:** dado um objetivo que só cabe usando o dia da folga, então `feasible = true` e `usedSlack = false`.
5. **Inviável:** dado um objetivo de 600 min com prazo em 2 dias e limite de 120/dia, então aloca o que der, `feasible = false` e `unscheduledMinutes` = o restante.
6. **Preserva o passado:** dado `fixedBlocks` com um bloco concluído hoje de 60 min e limite de 120, então o plano usa no máximo mais 60 min hoje e não altera o bloco fixo.
7. **Fixado:** dado um bloco `pinned` no futuro, então o intervalo dele não é usado por outra etapa e ele conta para o limite.
8. **Determinismo:** dada a mesma entrada duas vezes, então a mesma saída.
9. **Etapa parcial:** dado `remainingMinutes = 30` numa etapa de 60 min a 50%, então aloca só 30 min dela.
10. **Sem prazo** (P3): dado um objetivo sem prazo e outro com prazo, então o sem prazo vai depois.
11. **Nada a fazer:** dado nenhum objetivo, então `blocks = []`.

**`SetWeeklyAvailability`**
1. Dado um usuário sem disponibilidade, quando salvar 3 janelas e limite 180, então grava e devolve.
2. Dado um usuário com disponibilidade, quando salvar de novo, então substitui (uma por usuário).
3. Dado janelas inválidas, então `ValidationException` e não grava.
4. **Posse:** dado a disponibilidade de A, quando B salva a dele, então a de A não muda.

**`GetWeeklyAvailability`**
1. Dado que A salvou, quando A pede, então recebe a dele.
2. Dado que A não salvou, quando pede, então `NotFoundError`.
3. **Posse:** dado que só A salvou, quando B pede, então `NotFoundError`.

**`GeneratePlan`**
1. Dado a disponibilidade e 1 objetivo, quando gerar, então grava os blocos novos e devolve o resumo.
2. **Recálculo preserva o passado:** dado blocos de ontem (`missed`), de hoje (`done`) e um futuro `pinned`, quando gerar de novo, então esses 3 continuam iguais e só os futuros `planned`/`auto` são trocados.
3. Dado um usuário sem disponibilidade, então `NotFoundError` (P12).
4. **Posse:** dado os blocos de B, quando A gera o plano, então os blocos de B não são tocados.

**`GetDayPlan` / `GetWeekPlan`**
1. Dado blocos em 06/11 e 07/11, quando pedir o dia 06/11, então só os de 06/11, em ordem de início.
2. Dado o fuso de São Paulo e um bloco 23:30–00:30 locais, quando pedir o dia, então o bloco aparece no dia em que começa (P13).
3. Dado uma semana, então 7 dias de segunda a domingo, com os minutos usados e o limite de cada dia.
4. **Posse:** dado blocos de A e de B no mesmo dia, quando A pede, então só os de A.

**`GetGoalsFeasibility`**
1. Dado 2 objetivos que cabem, então ambos `feasible` com a folga de cada um.
2. Dado um objetivo que não cabe, então `feasible = false` com os minutos que faltam.
3. Em qualquer caso, nenhum bloco é gravado (o repositório não recebe chamada de escrita).
4. **Posse:** só os blocos fixos do próprio usuário entram no cálculo.

**`RecordBlockOutcome`**
1. Dado um bloco `planned`, quando registrar `done`, então `status = done`.
2. Dado `missed`, então `status = missed`.
3. **Posse:** dado um bloco de A, quando B registra, então `NotFoundError`.
4. Dado um `blockId` inexistente, então `NotFoundError`.

---

## 4. Módulo `activation`

### 4.1 Valores e catálogo

**Energia** (`EnergyLevel`): `'low' | 'medium' | 'high' | 'electric'`.
- O mobile usa os 4 níveis (M05; F §3).
- O web também usa os 4 níveis (P14): o check-in do Hoje web ganha o chip "Elétrico", diferença intencional em relação ao protótipo web (3 níveis).

**Tempo disponível agora** (`AvailableTime`): `'15m' | '30m' | '1h' | '2h+'` (M05; F §3).
- Nesta fase ele é só gravado na sessão, sem efeito (P15). O web não pergunta (`null`).

**Degraus** (`RampStepKind`), em ordem: `warmup` (Aquecer), `challenge` (Desafio mental), `micro` (Micro-passo), `focus` (Foco), `log` (Registrar). (F §3; DATA `STEPS`)

**Catálogo fixo de opções** (D 4a; DATA `ALTS`, `PROBS`):

| Degrau | Opções | Origem |
|---|---|---|
| `warmup` | 5: Alongamento de 3 min; Água e 5 respirações (2 min); Arrumar a mesa (3 min); Volta pela casa (2 min); Tarefa leve de 5 min | DATA `ALTS.aquecer` |
| `challenge` | 4: soma, subtração, tabuada, misturadas, com as 5 contas de `PROBS` | DATA `ALTS.desafio`, `PROBS` |
| `focus` | 4: 25, 15, 10 e 45 min (25 é o padrão) | DATA `ALTS.foco` |
| `micro` | textos da etapa atual (`Step.microSteps`); se vazio, 1 opção genérica: "Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase." (**provisório, a validar com o time**, P6) | D P6 |

A "Tarefa leve de 5 min" do aquecimento mantém o texto literal do protótipo (P16), até as tarefas leves do usuário (UC13) entrarem como outra `RampOptionSource`.

### 4.2 Entidade `FocusSession`

Arquivo: `modules/activation/src/session/model/focus-session.entity.ts`.

| Atributo | Tipo | Regra | Origem |
|---|---|---|---|
| `userId` | `string` | obrigatório | D 4d |
| `goalId`, `stepId` | `string` | referência por id | D 4d |
| `blockId` | `string \| null` | bloco do plano, se começou por ele | F §5 "Começar agora" |
| `energy` | `EnergyLevel` | obrigatório | D 4a |
| `availableTime` | `AvailableTime \| null` | `null` no web, que não pergunta | M05 |
| `startedAt`, `endedAt` | `Date` | `endedAt ≥ startedAt` | — |
| `focusedMinutes` | `number` | inteiro ≥ 0 | F §3 "tempo focado" |
| `outcome` | `'done' \| 'partial' \| 'not_done'` | obrigatório | F §3 "Concluí / Parcial / Não rolou" |
| `partialPct` | `number \| null` | obrigatório (1–99) só se `partial` | M11; protótipo: slider 0–100, passo 5, padrão 70 |

### 4.3 Classe pura `RampSuggestion`

`suggestedStep(energy)` (F §3, tabela "Energia → degrau inicial"; mobile `sugOf`):
- `low` → `warmup`;
- `medium` → `challenge`;
- `high` → `micro`;
- `electric` → `focus`.

**Decidido (P14):** web e mobile usam esta tabela (F §3). A regra do protótipo web ("Alta → direto pro desafio") não é seguida.

### 4.4 Interface `RampOptionSource` (D 4a)

`listOptions(userId, stepKind): Promise<RampOption[]>`, com `RampOption = { id, stepKind, title, durationLabel, durationSeconds?, description, icon, steps?: string[], operation?, problems? }`.
- **MVP:** `FixedRampOptionSource`, classe do domínio com o catálogo da 4.1.
- **Depois:** uma fonte com as tarefas leves do usuário (UC13), sem mudar a rampa.

### 4.5 Repositório

`FocusSessionRepository`: `create(session)` e `findAllByUserAndStep(userId, stepId)`.

### 4.6 Casos de uso

| Caso de uso | Entrada | Saída | Origem |
|---|---|---|---|
| `BuildRamp` | `userId`, `energy`, `availableTime?`, `microSteps[]` (da etapa, vindos do orquestrador) | `{ steps[5]{kind, options[]}, suggested }` | UC14, UC15, UC19, M05–M06, W32 |
| `RecordFocusSession` | `userId`, `goalId`, `stepId`, `blockId?`, `energy`, `availableTime?`, `startedAt`, `endedAt`, `focusedMinutes`, `outcome`, `partialPct?` | `{ session }` | UC20, UC21, M11, W38–W40 |

### 4.7 Cenários de teste — `activation`

**`FocusSession`**
1. Dado `outcome = 'partial'` sem `partialPct`, então `ValidationException`.
2. Dado `outcome = 'done'` com `partialPct`, então erro.
3. Dado `endedAt < startedAt`, então erro.
4. Dado `focusedMinutes` negativo, então erro.
5. Dado uma sessão válida, então ok.

**`RampSuggestion`**
1. `low` → `warmup`; 2. `medium` → `challenge`; 3. `high` → `micro`; 4. `electric` → `focus` (F §3; P14).

**`FixedRampOptionSource`**
1. `warmup` → as 5 opções do catálogo, na ordem do protótipo.
2. `challenge` → 4 opções, cada uma com 5 contas.
3. `focus` → 4 opções, com 25 min primeiro.
4. `log` → lista vazia (o degrau Registrar não tem opções).

**`BuildRamp`**
1. Dado `energy = 'high'` e 3 micro-passos, quando montar, então 5 degraus em ordem, `suggested = 'micro'`, e as opções do micro-passo são os 3 textos.
2. Dado `microSteps` vazio, então o micro-passo tem 1 opção com o texto genérico provisório (P6).
3. Dado uma energia inválida, então `ValidationException`.

**`RecordFocusSession`**
1. Dado uma sessão `done` de 25 min, quando gravar, então ela é gravada com o `userId`.
2. Dado `partial` com 70, então grava `partialPct = 70`.
3. Dado `partial` sem %, então `ValidationException` e não grava.
4. **Posse:** dado o `userId` A na entrada, então a sessão gravada é de A (o backend sempre monta o `userId` a partir do token; teste de posse completo no orquestrador da Etapa C).

---

## 5. Orquestradores do backend (Etapa C, D 5.9)

Um arquivo por fluxo; eles só encadeiam casos de uso e nunca calculam.

| Orquestrador | Encadeia | Usado por |
|---|---|---|
| `set-availability.orchestrator.ts` | `SetWeeklyAvailability` → `GeneratePlan` | onboarding |
| `create-goal.orchestrator.ts` | `CreateGoal` → (`ListGoals` + `GetGoal` para montar a entrada) → `GeneratePlan` | novo objetivo |
| `record-progress.orchestrator.ts` | posse primeiro, sem gravar nada: `GetGoal` (objetivo e etapa) + `GetBlock` (se houver `blockId`, que é opcional) → `RecordFocusSession` → `UpdateStepProgress` (`done` = 100; `partial` = `partialPct`; `not_done` = não muda) → `RecordBlockOutcome` (`done`/`partial`/`missed`) → `GeneratePlan` | registrar da rampa |
| `day-view.orchestrator.ts` | `GetAuthenticatedUser` (fuso) → `GetDayPlan` + `GetGoal` de cada objetivo presente nos blocos (título, cor e título da etapa; o `ListGoals` não traz etapas, decisão da C4) | Hoje |
| `week-view.orchestrator.ts` | `GetAuthenticatedUser` (fuso) → `GetWeekPlan` + `GetGoal` de cada objetivo presente | calendário |
| `ramp.orchestrator.ts` | `GetGoal` (micro-passos da etapa) → `BuildRamp` | rampa |
| `goals-view.orchestrator.ts` | `ListGoals` → `GetGoalsFeasibility` (folga de cada objetivo; `done` → `slackDays: null`); trilha: `GetGoal` + `GetNextBlocks` | lista de objetivos, coluna do Hoje, trilha |

O `GeneratePlan` sempre recebe do orquestrador:
- o `timezone` do usuário (P1);
- os objetivos ativos com as etapas e os `remainingMinutes` calculados em `goals`.

**Ponto de atenção:** `day-view`, `week-view` e `goals-view` juntam os títulos dos objetivos aos blocos. É composição de dados, não cálculo, mas é o limite do que a regra 5.9 permite. Aceito como composição, não cálculo (P17).

---

## 6. Espaços reservados (fora desta fase)

- **`gamification`:** gotas, XP, nível, sequência, conquistas e estágios do Broto (D "Fora do MVP"). Os designs mostram a barra gamificada (M01, W12) e a celebração (M12, W41) com números. Decidido (P18): as telas mostram os valores fixos do protótipo, sem lógica e sem endpoint.
- **`notifications`:** e-mails (UC23, UC24). Nada nesta fase.
- **IA (`GoalAssistantProvider` em `goals`):** contrato definido em 12/11/2026 (§2.6, IA1). O fornecedor e o modelo saem na reunião de sexta (IA6).

---

## 7. Decisões que fecharam as perguntas

Todas as perguntas P1–P18 deste documento foram respondidas em 10/11/2026 com a proposta abaixo (detalhes, motivos e consequências em `docs/2-decisoes-mvp.md`). A coluna "Proposta" passou a ser a decisão.

| # | Assunto | Decisão |
|---|---|---|
| P1 | Onde fica o fuso do usuário? | `User.timezone` (IANA), enviado no cadastro; padrão `America/Sao_Paulo` |
| P2 | Limite de tamanho do título do objetivo e da etapa | 1–120 caracteres |
| P3 | Prazo opcional? (M16 "prazo opcional"; o Portfólio do protótipo não tem prazo) | Opcional; sem prazo = alocado depois de todos os com prazo |
| P4 | Como a cor (1–4) do objetivo é escolhida? | Sequencial entre os objetivos ativos, voltando ao 1 depois do 4 |
| P5 | Estimativa da etapa: mínimo e múltiplo | Mínimo 15, múltiplo de 15 |
| P6 | Texto do micro-passo no objetivo manual | Campo opcional; vazio → "Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase." (**provisório, a validar com o time**) |
| P7 | Faixa do limite diário: web 1h–5h (passo 30) × mobile 1h–8h | Domínio aceita 60–480, múltiplo de 30; cada cliente mostra a faixa do seu design |
| P8 | Compromissos sem tela | Só domínio nesta fase (sem endpoint, tabela ou tela); grade sem ocupados |
| P9 | "Folga de 1 dia antes do prazo": qual é o último dia de trabalho? | Prazo = dia da entrega (não se trabalha nele); último dia = prazo − 1 − folga |
| P10 | Bloco mínimo de 30 min × etapa de 15 min | O mínimo vale para dividir uma etapa; uma etapa (ou resto) menor que 30 vira um bloco do seu tamanho |
| P11 | Disponibilidade do exemplo "8h15 em 6 dias · folga de 1 dia" | O teste verifica invariantes; se quiser o número exato, informe a disponibilidade |
| P12 | Gerar plano sem disponibilidade cadastrada | `NotFoundError` (o onboarding é obrigatório antes) |
| P13 | Bloco que atravessa a meia-noite | Pertence ao dia em que começa (as janelas vão até 23:00 nos designs, então é raro) |
| P14 | Níveis de energia | Web **e** mobile com os 4 níveis do mobile e a tabela de F §3; o web só diverge do protótipo nesse ponto (chip "Elétrico" no check-in do Hoje) |
| P15 | Efeito do "tempo disponível agora" no check-in mobile | Só é gravado na sessão nesta fase, sem efeito |
| P16 | Texto da "Tarefa leve de 5 min" do aquecimento (cita um PDF de exemplo) | Manter o texto literal do protótipo |
| P17 | Orquestradores de leitura juntam títulos aos blocos | Aceitar como composição, não cálculo |
| P18 | Barra gamificada e celebração (gotas/XP) fora do MVP, mas presentes nos designs | Mostrar os valores fixos do protótipo, sem lógica |
