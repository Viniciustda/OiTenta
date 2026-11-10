# Plano de execução — Etapas B a E

**Status:** aprovado em 10/11/2026 (decisões P1–P28 em `docs/2-decisoes-mvp.md`). O processo está em `.agents/rules/processo-desenvolvimento.md`; a modelagem e os cenários em `docs/3-modelagem-dominio.md`; o contrato em `docs/4-contrato-api.md`.

## Como cada tarefa roda

- Cada subagente trabalha numa **worktree** própria, na branch indicada, criada a partir da `developer`.
- Ele implementa primeiro os testes dos cenários aprovados (vermelho → verde) e entrega o relatório fixo.
- O revisor confere a entrega; o agente principal integra na `developer` com a verificação completa.
- **Preparação de cada worktree (agente principal, antes de entregar ao subagente):**
  - `npm ci` na worktree: só instala o que já está no `package-lock.json`, não acrescenta dependência;
  - `flutter pub get` para o mobile.
  - Motivo: worktree nova não tem `node_modules` e o subagente não pode rodar `npm install`. Aprovado (P28).
- **Arquivos que só o agente principal altera:** `package.json`/`package-lock.json` da raiz, `turbo.json`, `apps/backend/src/app.module.ts`, `apps/backend/prisma/**`, `packages/contracts/openapi.json`, `docs/**`, `.agents/**`. Também `apps/frontend/package.json` e `apps/mobile/pubspec.yaml`, que mudam só com dependência aprovada.

## Dependências novas

| Dependência | Onde | Situação | Para quê |
|---|---|---|---|
| `go_router` | `apps/mobile` | **já decidida** (D 5.7) | rotas centralizadas |
| teste de unidade do web | `apps/frontend` | **aprovada (P21)** | `vitest` + `@testing-library/react` + `jsdom` |
| fontes no Flutter | `apps/mobile` | **aprovada (P22)** | `google_fonts` (Fredoka e Nunito); testes sem busca na rede |
| ícones no Flutter | `apps/mobile` | **aprovada (P23)** | `phosphor_flutter` |
| cliente HTTP do mobile | `apps/mobile` | **aprovada (P26)**, usada na Etapa D | `http` |
| validação de formato no backend | `apps/backend` | **aprovada (P19)**, usada na Etapa C | `class-validator` + `class-transformer` |
| teste de ponta a ponta do web | `apps/frontend` | **aprovada (P25)**, usada na Etapa E | `@playwright/test` |
| `integration_test` | `apps/mobile` | do próprio SDK do Flutter, sem pacote externo | Etapa E |

Quem instala cada dependência aprovada é o agente principal, numa branch `chore/...` integrada antes da tarefa que a usa.

---

## Etapa B — em paralelo (5 subagentes + revisor)

### B1 — domínio `goals`
- **Branch:** `feat/goals-dominio`.
- **Pode alterar:** só `modules/goals/**`.
- **Ler antes:** `docs/3-modelagem-dominio.md` §0 e §2; `.agents/rules/*`; `modules/auth` (exemplo real das skills).
- **Skills, nesta ordem:** `module-aggregate` (agregado `goal`, modo `example`) → `module-entity` (`Goal`, `Step`) → `module-repository` (`GoalRepository`, `custom`, com `userId`) → `module-use-case` (`CreateGoal`, `ListGoals`, `GetGoal`, `UpdateStepProgress`).
- **Classe pura:** `GoalProgressCalculator`, sem skill e com teste primeiro.
- **Cenários:** todos da §2.5.
- **Pronto quando:** 100% de cobertura em `modules/goals`, lint ok e zero import de framework.

### B2 — domínio `scheduling`
- **Branch:** `feat/scheduling-dominio`.
- **Pode alterar:** só `modules/scheduling/**`.
- **Ler antes:** modelagem §0 e §3.
- **Skills:**
  - `module-aggregate` (agregados `availability`, `commitment`, `plan`);
  - `module-entity` (`WeeklyAvailability`, `Commitment`, `ScheduledBlock`);
  - `module-repository` (`WeeklyAvailabilityRepository`, `CommitmentRepository`, `ScheduledBlockRepository`, todos `custom` com `userId`);
  - `module-use-case` (`SetWeeklyAvailability`, `GetWeeklyAvailability`, `GeneratePlan`, `GetGoalsFeasibility`, `GetDayPlan`, `GetWeekPlan`, `RecordBlockOutcome`).
- **Classes puras e fonte:** `RecurrenceExpander`, `AvailabilityCalculator`, `PlanCalculator`, sem skill e com teste primeiro; interface `BusySource` + `CommitmentBusySource`.
- **Cenários:** todos da §3.7, incluindo o exemplo das 7 etapas.
- **Pronto quando:** 100% de cobertura, lint ok e zero import de framework.

### B3 — domínio `activation`
- **Branch:** `feat/activation-dominio`.
- **Pode alterar:** só `modules/activation/**`.
- **Ler antes:** modelagem §0 e §4; `design/mobile/app/source/bora-data.js` (catálogo).
- **Skills:** `module-aggregate` (agregados `ramp`, `session`) → `module-entity` (`FocusSession`) → `module-repository` (`FocusSessionRepository`, `custom`, com `userId`) → `module-use-case` (`BuildRamp`, `RecordFocusSession`).
- **Classes e fonte:** `RampSuggestion`; interface `RampOptionSource` + `FixedRampOptionSource` com o catálogo literal do protótipo.
- **Cenários:** todos da §4.7.
- **Pronto quando:** 100% de cobertura, lint ok e zero import de framework.

### B4 — telas web da fatia, com dados de exemplo
- **Branch:** `feat/web-telas-fatia`.
- **Pode alterar:**
  - `apps/frontend/src/modules/**` (inclusive ligar "Entrar" e "Começar grátis" da landing às rotas de login e cadastro);
  - as rotas novas da fatia em `apps/frontend/src/app/**`;
  - **não** pode alterar `globals.css` nem `layout.tsx`: tokens novos são pedidos ao agente principal.
- **Rotas (P24):** `/entrar`, `/cadastro`, `/onboarding`, `/hoje`, `/calendario`, `/objetivos/[id]`; rampa e novo objetivo como modais sobre `/hoje`.
- **Telas** (fonte: `design/web/source` + `design/web/screens` + `SCREENS.md`):
  - W03 login, W04 cadastro;
  - W05–W11 onboarding;
  - W12–W14 Hoje, com o check-in de 3 níveis;
  - W15–W16 calendário semana e detalhe do bloco (só leitura);
  - W22 trilha;
  - W32–W41 rampa;
  - novo objetivo: **W30 começando vazia** (P20), registrada como adaptação intencional;
  - check-in do Hoje com **4 níveis** (P14: chip "Elétrico" acrescentado, diferença intencional em relação ao screenshot);
  - sidebar com os itens do protótipo; os destinos fora da fatia ficam sem ação e são listados.
- **Repositórios de exemplo:** classes em `apps/frontend/src/modules/<x>/data/` que seguem os tipos do `docs/4-contrato-api.md` e devolvem dados do protótipo. Trocados por HTTP na Etapa D.
- **TDD:** testes dos repositórios e da lógica de tela antes das telas (Vitest + Testing Library, P21).
- **Visual:** comparar cada tela com o screenshot de referência, no máximo 3 rodadas; listar as diferenças restantes.
- **Pronto quando:** testes verdes, lint ok, build ok, comparações registradas em `docs/frontend/comparacoes/`.

### B5 — telas mobile da fatia, com dados de exemplo
- **Branch:** `feat/mobile-telas-fatia`.
- **Pode alterar:** só `apps/mobile/lib/**` e `apps/mobile/test/**`.
- **Antes:** o agente principal acrescenta ao `pubspec.yaml` o `go_router` e as dependências aprovadas em P22/P23.
- **Regras:** `.agents/rules/mobile-flutter.md` (as 4 regras e o go_router).
- **Telas** (fonte: `design/mobile/app/source` + `design/mobile/telas/source` + screens + `SCREENS.md`):
  - login e cadastro: **placeholder**;
  - onboarding T02 (grade por período) e T03 (limite); os passos sem design (1, 3 e 6 de 6) como **placeholder** (P27);
  - M01 Hoje (barra gamificada com os valores fixos do protótipo, P18);
  - M02 Objetivos;
  - M03 Semana;
  - M05–M12 rampa (check-in, escada, aquecimento, desafio, micro-passo, foco, registro, celebração);
  - M18 trilha;
  - novo objetivo: **M15 começando vazia** e **M16** (tarefa única) (P20);
  - aba Jardim: **placeholder**.
  - Fora: pausa, pedir ajuda, bloquear apps, mês, prazos, perfil.
- **Dados de exemplo:** repositórios em `lib/features/<x>/data/` com os dados do `bora-data.js`, seguindo os tipos do contrato.
- **TDD:** testes dos controladores (`ChangeNotifier`) e dos repositórios antes das telas, mais um widget test do fluxo principal de cada tela.
- **Visual:** comparar com o screenshot no **simulador iOS**, no máximo 3 rodadas.
- **Pronto quando:** `flutter analyze` e `flutter test` verdes, comparações em `docs/mobile/comparacoes/`.

### Revisor da Etapa B

Um subagente por entrega, que não escreveu o código, confere a lista da regra (§8). Ele só aponta; quem corrige é o autor.

### Ordem de integração na developer

Ordem: B1, B2 e B3 (sem conflito entre si) → B4 → B5. Conflito com a `developer` → parar e reportar.

---

## Etapa C — backend (sequencial; só o agente principal ou um subagente por vez)

Para cada módulo: testes de integração (supertest) dos endpoints → `backend-prisma-sync-module` → `backend-prisma-repository` → `backend-nest-controller` (classes do Swagger, `userId` do token) → testes verdes → `openapi:export`.

| Ordem | Branch | Escopo |
|---|---|---|
| C0 | `feat/auth-timezone` | `User.timezone` (P1): entidade, `RegisterUser`, migration, `POST /auth/register`, `GET /auth/me`, seed |
| C1 | `feat/backend-goals` | migration `goals`, `PrismaGoalRepository`, `GET /goals/:goalId` |
| C2 | `feat/backend-scheduling` | migration `scheduling`, repositórios Prisma, `GET/PUT /scheduling/availability`, `GET /scheduling/plan/day` e `/week` |
| C3 | `feat/backend-activation` | migration `activation`, `PrismaFocusSessionRepository`, `FixedRampOptionSource` no Nest |
| C4 | `feat/backend-orquestradores` | os orquestradores de `docs/3-modelagem-dominio.md` §5, um arquivo por fluxo, com teste primeiro; `POST /goals`, `GET /goals`, `GET /activation/ramp`, `POST /activation/sessions` |

- **Pode alterar:** `apps/backend/src/modules/<modulo>/**`, `apps/backend/src/orchestrators/**` (C4), `apps/backend/test/**`.
- **Só o agente principal:** `apps/backend/prisma/**`, `app.module.ts`, `openapi.json`.

---

## Etapa D — integração (em paralelo)

| Tarefa | Branch | Pode alterar | O que faz |
|---|---|---|---|
| D1 | `feat/web-integracao-api` | `apps/frontend/src/modules/**/data/**` (+ um cliente HTTP em `apps/frontend/src/modules/core/`) | troca os repositórios de exemplo por `fetch` ao backend, com token e tratamento de 401 |
| D2 | `feat/mobile-integracao-api` | `apps/mobile/lib/**/data/**`, `apps/mobile/lib/core/**`, `apps/mobile/test/**` | troca os repositórios por HTTP (pacote `http`, P26), usando `AppConfig.apiUrl` |

- **Regra:** as telas não mudam, e os testes de comportamento existentes continuam passando.

---

## Etapa E — ponta a ponta

- **Branch:** `feat/e2e-fluxo-principal`.
- **Teste primeiro:**
  - Playwright (web, P25);
  - `integration_test` no simulador iOS (mobile).
- **Fluxo:** login demo → onboarding → objetivo → plano → Hoje → rampa → registrar → plano recalculado, contra o backend local.
- **Depois:** os ajustes até passar e a atualização dos `COMO-TESTAR.md` (agente principal).

---

## Decisões deste documento

P21 (Vitest), P22 (`google_fonts`), P23 (`phosphor_flutter`), P24 (rotas), P25 (Playwright), P26 (`http`), P27 (placeholder) e P28 (`npm ci` + `flutter pub get` nas worktrees): todas aprovadas como proposto em 10/11/2026. Detalhes em `docs/2-decisoes-mvp.md`.
