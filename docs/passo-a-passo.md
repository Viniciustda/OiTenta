# Passo a passo — do esqueleto ao app funcional

**Objetivo:** levar o monorepo do OiTenta/Bora do esqueleto atual até a demo do hackathon, de dentro para fora (negócio primeiro, infraestrutura depois), como no curso.

**Como usar:** siga as fases em ordem e marque as caixas. Cada passo traz o **objetivo**, a **skill** (nome exato de `.agents/skills`), um **prompt** para colar no Claude Code, **como verificar** e o **critério de pronto**. Não pule a verificação: o resultado de uma skill varia de uma execução para outra.

**Legenda de origem:**
- `[curso]`: vem do curso (aulas, skills ou `docs/curso-arquitetura-limpa-hexagonal_1.md` / `docs/prompt-base-arquitetura_1.md`).
- `[complemento]`: sugestão que não veio do curso. Discuta antes de adotar.

> ⚠️ **Ordem real de execução:** 0 → 1 → 2 → 3 → **6** → 4 → 5 → 7 → 8 e 9 (em paralelo) → 10.
> A Fase 6 (auth) vem antes da 4 porque `module-entity`, `module-use-case`, `module-repository`, `backend-nest-config` e `backend-nest-controller` têm como **leitura obrigatória** arquivos de `modules/auth/src/user/...`, que só passam a existir depois do `spec-backend-auth-basic`. `[complemento, verificado lendo os SKILL.md]`

---

## 1. Estado atual (rodada 01-estrutura-inicial, 10/11/2026)

Branch `01-estrutura-inicial`, nada commitado.

### Criado e verificado

| Item | Resultado |
|---|---|
| Monorepo npm workspaces + Turborepo, escopo `@oitenta` | `npm install` ok; `npm run build` ok (frontend, backend, shared e 6 módulos) |
| `apps/backend` NestJS **11** (CommonJS + Jest), porta 4000 | `GET /` → "Hello World!"; `GET /<modulo>` responde nos 6 módulos |
| `apps/frontend` Next.js, porta 3000 | `GET /`, `/goals`, `/scheduling` → 200 |
| Prisma 7 + Postgres 16 (Docker Compose em `apps/backend/docker-compose.yml`, porta **6435**) | container saudável; `prisma:generate` ok; backend conectou no boot |
| `packages/shared` | 96 testes, 100% de cobertura |
| `modules/{auth,goals,scheduling,activation,gamification,notifications}` | build ok; 1 teste de placeholder cada, 100% |
| `apps/mobile` Flutter (`com.oitenta`, projeto `oitenta`) com `lib/core` e `lib/features/{auth,goals,scheduling,activation,gamification}/{domain,data,presentation}` | `flutter analyze` sem problemas; `flutter test` ok |
| `.agents/skills` (15 skills, cópia de `.claude/skills`), `.agents/rules` (3 regras), `CLAUDE.md` = `AGENTS.md` | — |

### O que aconteceu no caminho (leia antes de rodar as skills de novo)

- **Nest CLI 12 × curso.** O script do `config-project-fullstack` instala o `@nestjs/cli` mais recente (v12), que gera backend **ESM + vitest**. As skills do curso assumem **Nest 11 (CommonJS + Jest)** e imports sem `.js`, então o build quebrava. O backend foi refeito com `@nestjs/cli@11.0.24` **instalado globalmente**. Mantenha essa versão.
- **Bug do `config-project-fullstack` (1):** `commandExists("nest")` roda dentro do repositório. Se houver um `node_modules` com o CLI v12, ele "não acha" o Nest e reinstala o v12 por cima.
- **Bug do `config-project-fullstack` (2):** o renomeio de namespace percorre a raiz inteira e **reescreveu `package.json` de templates dentro de `.agents/skills` e `.claude/skills`**. Os nomes originais foram restaurados (`@temp/shared` e `__PACKAGE_NAME__`). Se rodar essa skill de novo, confira com `diff -r .claude/skills .agents/skills` e com `grep '"name"' .agents/skills/*/assets/*/package.json`.
- O `README.md` original foi tirado da raiz durante o scaffold (conflito com o README do turbo) e restaurado. Está idêntico ao original.
- O turbo gerou um `AGENTS.md`. Ele foi substituído pelo `AGENTS.md` do projeto, que **mantém o bloco gerenciado do turbo** (o turbo o reinsere se ele sumir).
- As skills foram **copiadas** para `.agents/skills`, e `.claude/skills` continua existindo. Se editar uma skill, edite as duas cópias, ou troque `.claude/skills` por um link para `../.agents/skills` (decisão sua).

### Pendências conhecidas

- `module-aggregate`: os templates importam **`@poupig/shared`** (scope fixo do curso) e o script não substitui esse nome. Veja o passo 3.4.
- Os módulos de negócio **não dependem de `@oitenta/shared`** ainda. Veja o passo 3.1.
- O `shared` não tem erro de **409 (conflito)** nem de **403 (sem permissão)**. Veja o passo 3.2.
- Não há `npm test` na raiz nem tarefa `test` no `turbo.json`. Use `npm run test --workspaces --if-present`.
- O `turbo.json` não declara `dist/**` em `outputs`, por isso aparece um aviso no build do backend e dos pacotes. `[complemento]`: acrescentar.
- Node 25 gera avisos `EBADENGINE` em pacotes do Nest. Não impediu nada. Node 24 LTS evitaria os avisos.
- **Android:** o Java instalado é o 25, e o Gradle 8.14 do Flutter aceita Java 17 a 24. Para buildar para Android, configure um JDK 17–24 (`flutter config --jdk-dir ...`). iOS e web não são afetados.
- `npm audit` aponta 14 vulnerabilidades em dependências dos scaffolds (nenhuma corrigida).

---

## 2. Decisões em aberto

| # | Decisão | Opções | Sugestão | Quem decide |
|---|---|---|---|---|
| D1 | Nome do produto | OiTenta (README) × Bora (docs e design) | Decidir antes das telas (Fase 8), porque aparece na UI, no e-mail e no pacote do app. O código usa `oitenta`/`@oitenta` e pode continuar assim | Time |
| D2 | Divisão em módulos e mapeamento dos casos de uso | A proposta da Seção 4 | Confirmar na Fase 1. Ponto sensível: o UC08 (registrar progresso) está em `activation`, mas a etapa pertence a `goals` e o plano a `scheduling` | Time |
| D3 | **Como os módulos conversam** | ver abaixo | — | Time, antes da Fase 4 |
| D4 | Estado e navegação no Flutter | Riverpod, Bloc, Provider; go_router ou Navigator 2 | `[complemento]` a opção que o time já domina; sem experiência prévia, Riverpod + go_router | Quem fizer o mobile |
| D5 | Como o mobile consome o contrato do backend | Cliente escrito à mão × gerado | `[complemento]` Swagger/OpenAPI no Nest (`@nestjs/swagger`) e cliente Dart gerado ou escrito a partir do `openapi.json` | Time |
| D6 | Provedor de IA (LLM) | Anthropic (Claude), OpenAI, Gemini... | Qualquer um, **sempre atrás de um provider do domínio** (Fase 7). O domínio nunca importa o SDK | Time |
| D7 | Firecrawl, Resend (e Devin) | usar / não usar | O README deixa para a equipe. Se usar, cada um entra como provider com fake de teste | Time |
| D8 | Autenticação real × usuário fixo na demo | O UC29 permite usuário fixo | Rodar o `spec-backend-auth-basic` de qualquer forma (as skills dependem dele como referência) e decidir só se a demo faz login ou usa um usuário semeado | Time |
| D9 | Divisão do trabalho entre as 4 pessoas | por módulo | `[complemento]` P1: `auth` + `notifications` + infraestrutura Nest; P2: `goals` + IA; P3: `scheduling` (motor do plano); P4: `activation` + `gamification`. Mobile e web divididos depois da Fase 5 | Time |
| D10 | Data da demo e marcos por sexta-feira | — | Preencher: **[data da demo]**. Sugestão: um marco por sexta (Fases 0–2 → 3–4 → 5–6 → 7–8–9 → 10) | Time |
| D11 | Templates do `module-aggregate` com `@poupig/shared` | corrigir após cada uso × corrigir a skill uma vez | Ver passo 3.4 | Você |
| D12 | Regras que os docs não definem | — | Ver a Fase 2: fórmula XP → nível, tamanho da folga, uso do "tempo disponível agora" do check-in | Time |

### D3 — Como os módulos conversam

Exemplo: registrar o progresso de uma etapa (`activation`) precisa atualizar a etapa e a % (`goals`), recalcular o plano (`scheduling`) e dar gotas e XP (`gamification`). `[curso]` Os módulos não se chamam diretamente, mas o curso **não mostra a solução**. As opções são:

| Opção | Como é | Prós | Contras |
|---|---|---|---|
| A. Caso de uso orquestrador no backend | Um serviço em `apps/backend` chama, em sequência, os casos de uso de cada módulo | Simples, explícito, síncrono, fácil de seguir e de testar via `.http` | A sequência fica fora do domínio, com risco de regra de negócio no Nest; consistência entre módulos é responsabilidade do orquestrador |
| B. Eventos de domínio | O módulo publica `StepProgressRecorded` por uma porta (ex.: `EventPublisher` no `shared`); os outros módulos assinam; a implementação fica no backend (ex.: `@nestjs/event-emitter`) | Módulos desacoplados; um módulo novo só assina o evento | Mais infraestrutura, consistência eventual, depuração mais difícil, nada pronto no curso nem nas skills |
| C. Porta declarada pelo módulo consumidor | `activation` declara `GoalProgressGateway` (provider); o backend implementa chamando o caso de uso de `goals` | Fiel ao hexágono: o domínio declara a necessidade e é testável com fake | Mais arquivos; cadeias de portas quando são 3 módulos |
| D. Juntar módulos | Ex.: `activation` dentro de `scheduling` | Menos fronteiras no hackathon | Módulo grande; desfaz parte da divisão |

Sugestão `[complemento]`: **A** para o hackathon (menor custo e explícita), com a regra de que o orquestrador **só sequencia** casos de uso e nunca calcula nada.

---

## 3. As fases

### Fase 0 — Preparação

- [ ] **0.1 Ambiente.** Sem skill.
  - Verificar: `node -v` (≥ 24), `npm -v`, `docker --version`, `flutter --version`, e `nest --version` **fora** do repositório, que deve mostrar `11.x`. Se mostrar 12: `npm i -g @nestjs/cli@11.0.24`.
  - Pronto quando: os quatro comandos respondem e o Nest CLI é 11.
- [ ] **0.2 Skills e regras no lugar.** Sem skill.
  - Verificar: `ls .agents/skills | wc -l` → 15; `diff -r -x .DS_Store .claude/skills .agents/skills` sem saída; `ls .agents/rules` → 3 arquivos.
- [ ] **0.3 `.env`.** Sem skill.
  - Os arquivos `apps/backend/.env` e `apps/frontend/.env` já existem e não vão para o git. Cada pessoa do time copia de `.env.example`.
  - Pronto quando: `DATABASE_URL` aponta para `localhost:6435`.
- [ ] **0.4 Subir o banco.** Skill `config-prisma` (comandos dela).
  - `npm --workspace apps/backend run db:start` e depois `npm --workspace apps/backend run prisma:generate`.
  - Verificar: `docker inspect -f '{{.State.Health.Status}}' oitenta-oitenta-postgres` → `healthy`.
- [ ] **0.5 Rodar o frontend e o backend.** Sem skill.
  - `npx turbo run dev --filter=@oitenta/backend` e `npx turbo run dev --filter=@oitenta/frontend`.
  - `[curso]` O comando `npm run dev --filter=backend` do guia do curso **falha** quando o pacote é escopado: use `--filter=@oitenta/backend`.
  - Verificar: `curl localhost:4000/goals` → `{"message":"Goals endpoint"}`; abrir `localhost:3000/goals`.
- [ ] **0.6 Primeiro teste de ponta a ponta.** Sem skill.
  - `npm run build && npm run test --workspaces --if-present`.
  - Pronto quando: build verde e todos os testes passando (estado de hoje: 8 workspaces, 103 testes).

### Fase 1 — Definir escopo e casos de uso

- [ ] **1.1 Escolher a fatia vertical do MVP.** Sem skill.
  - Sugestão `[complemento]`: **UC29 → UC01 → UC02/UC04 → UC05 → UC06/UC07 → UC14/UC15/UC20/UC21 → UC08/UC09**. É o caminho "entrar → dizer a rotina → pedir um objetivo → ver o plano → começar → focar → registrar → replanejar".
  - Prompt:
    ```
    Leia docs/casos-de-uso.md, docs/fluxos.md e docs/passo-a-passo.md (Seções 2 e 4).
    Proponha a fatia vertical do MVP para a demo do hackathon, considerando [data da demo]
    e que o time se encontra às sextas. Liste o que entra, o que fica de fora e por quê.
    Não escreva código. Responda em uma tabela.
    ```
  - Pronto quando: o time aprovou a lista numa sexta e marcou na Seção 4 o que foi cortado.
- [ ] **1.2 Cortar o resto.** Marque na Seção 4 como "fora do hackathon" tudo o que não está na fatia. Os UCs desejáveis só entram se a fatia ficar pronta antes.
- [ ] **1.3 Mapear UC → módulo → agregado.** Sem skill.
  - Prompt:
    ```
    Para cada caso de uso da fatia aprovada, indique módulo (Seção 4 de docs/passo-a-passo.md),
    agregado e nome do caso de uso em inglês no padrão da skill module-use-case
    (ex.: CreateGoal, GeneratePlan). Aponte casos de uso que tocam mais de um módulo
    (decisão D3). Não escreva código.
    ```
  - Pronto quando: as decisões D2 e D3 estão tomadas e registradas aqui.

### Fase 2 — Modelar o domínio (os models)

Sem código. O resultado é uma tabela por módulo: agregados, entidades, atributos (com tipo), regras e invariantes. `[curso]` Modele pelas regras de negócio, não pelo banco.

- [ ] **2.1 Modelar por módulo.** Sem skill.
  - Prompt (um por módulo):
    ```
    Modele o domínio do módulo <modulo> do OiTenta, só para os casos de uso <lista>.
    Leia docs/casos-de-uso.md, docs/fluxos.md e docs/design-system.md (seção Gamificação).
    Para cada agregado: entidades, atributos com tipos, regras de validação, invariantes
    e quais regras são de cálculo (classe pura) ou de processo (caso de uso).
    Cite a seção do doc de onde veio cada regra. Marque como PERGUNTA o que os docs não definem.
    Não escreva código.
    ```
  - Regras que **já estão definidas** nos docs (aponte para elas, não copie):
    - Limite de horas por dia e horários livres: UC01; `docs/fluxos.md` §1.
    - Folga antes do prazo e soma de todos os objetivos no limite diário: UC05, UC12; `docs/fluxos.md` §5.
    - Tabela energia → degrau inicial e os 5 degraus: `docs/fluxos.md` §3.
    - Gotas (+5, +20, +10, +3), XP = minutos de foco, sequência (≥ 1 degrau no dia), guarda-chuva (50 gotas): `docs/design-system.md` → Gamificação.
    - Estágios do Broto por nível (1–2, 3–5, 6–9, 10–14, 15+): `docs/design-system.md` → Mascote.
    - Exemplo de referência para testar o motor (7 etapas, 8h15, entrega 24/11): `docs/fluxos.md` §4.
  - **Não definido nos docs** (decisão D12): a fórmula de XP → nível; o tamanho da folga (o exemplo mostra 1 dia); o que o "tempo disponível agora" do check-in altera; o que acontece com a sequência quando a meta é parcial.
  - Pronto quando: há uma tabela por módulo da fatia, revisada por quem vai implementar.

### Fase 3 — `shared` e fundação do domínio

`[curso]` O `packages/shared` **não é módulo de negócio**: é a base que todos os módulos usam (`Entity`, `UseCase`, erros, validações, contratos CRUD). Ele já foi gerado pela `config-package-shared`.

> ⚠️ Não rode `config-package-shared` de novo depois de customizar o `shared`: o script **apaga e recria** `packages/shared`. `[complemento, verificado no script]`

- [ ] **3.1 Módulos dependem do `shared`.** Sem skill `[complemento]`.
  - Prompt:
    ```
    Adicione "@oitenta/shared": "*" em dependencies de modules/*/package.json
    (auth, goals, scheduling, activation, gamification, notifications), rode npm install
    e npm run build na raiz. Não altere mais nada.
    ```
  - Pronto quando: o build passa.
- [ ] **3.2 Erros que faltam.** Sem skill.
  - O `shared` tem `DomainError`, `ValidationError`, `NotFoundError` (404) e `UnauthorizedError` (401). Faltam o de conflito (409) e o de sem permissão (403).
  - Prompt:
    ```
    Em packages/shared/src/error, crie ConflictError (409) e ForbiddenError (403) seguindo
    exatamente o padrão de not-found.error.ts, exporte no index.ts e crie os testes em
    packages/shared/test no mesmo estilo. Cobertura do shared deve continuar 100%.
    ```
  - Observação: no curso, o `DomainError` carrega `statusCode`. É uma concessão do próprio curso; o domínio continua sem importar nada de HTTP.
- [ ] **3.3 Regras de validação que faltarem.** Skill `shared-validation-rule`.
  - Antes, confira `packages/shared/src/validation/rules/` (já existem cerca de 60, como `range-value`, `in`, `time-string`, `date-range`). Crie uma regra nova só se nenhuma servir.
  - Prompt:
    ```
    Use a skill shared-validation-rule para criar a regra <Nome>: <objetivo>, valor do tipo
    <tipo>, código de erro "<codigo>". Exemplos válidos: <...>. Inválidos: <...>.
    ```
  - Pronto quando: a regra tem 100% de cobertura e está exportada.
- [ ] **3.4 Decidir sobre `@poupig/shared` nos templates do `module-aggregate`** (D11).
  - Opção 1: depois de cada `module-aggregate`, trocar `@poupig/shared` por `@oitenta/shared` nos arquivos gerados.
  - Opção 2 `[complemento]`: trocar uma vez nos `assets/**/*.tpl` da skill, nas duas cópias.
  - Os few-shots de outras skills também usam `@poupig/*`. Peça ao agente para usar sempre o escopo `@oitenta`.

### Fase 6 — Autenticação (execute ANTES da Fase 4)

- [ ] **6.1 Base de auth.** Skill `spec-backend-auth-basic` (ela orquestra as outras skills).
  - Prompt:
    ```
    Use a skill spec-backend-auth-basic no módulo auth já existente (modules/auth e
    apps/backend/src/modules/auth). Agregado: user. Entidade: User com name, email, password.
    Login por e-mail. Fluxo: cadastro e login. JWT com claim sub = id do usuário, expiração 1d.
    Segredo do JWT em JWT_SECRET no .env/.env.example. Use o escopo @oitenta (nunca @poupig).
    Siga as regras de .agents/rules. Pare e me pergunte se faltar algo.
    ```
  - Verificar: o `.integration.http` do auth passa (registrar → 201; duplicado → 409; login → token; login inválido → 401, com mensagem única); `npm run test --workspace @oitenta/auth` com 100%.
- [ ] **6.2 Validar o usuário logado via JWT.** Sem skill.
  - `[curso]` Na aula final, o professor **não resolveu** o acesso aos dados do usuário logado via JWT no teste de integração. **Valide isso explicitamente** antes de seguir.
  - Prompt:
    ```
    Crie uma rota GET /auth/me autenticada que devolve o usuário do token usando o decorator
    de usuário atual criado pela backend-nest-config. Adicione ao auth.integration.http:
    login → guarda o token → GET /auth/me com Bearer → 200 com o próprio usuário (sem senha);
    sem token → 401; token inválido → 401.
    ```
  - Pronto quando: os três casos respondem como esperado, e o id usado vem do token.
- [ ] **6.3 Decidir D8** (login real × usuário semeado na demo). Se for semeado, crie a tarefa de seed do usuário em `apps/backend/prisma/seed/`.

### Fase 4 — Domínio por módulo, de dentro para fora

`[curso]` Ordem dentro de cada agregado: `module-aggregate` → `module-entity` → `module-repository` (contrato + fake em memória) → `module-use-case`. Sempre com testes e 100% de cobertura de domínio.

**Ordem sugerida dos módulos** `[complemento]`: `goals` → `scheduling` → `activation` → `gamification` → `notifications`. `scheduling` depende do modelo de etapas de `goals`, e `activation` depende dos dois.

**Paralelismo** (`[curso]` na aula de agentes, 3 skills rodam em paralelo):
- ✅ Pode rodar em paralelo: módulos diferentes (cada um mexe só em `modules/<modulo>`), por exemplo `goals`, `gamification` e `notifications` ao mesmo tempo, cada um com seu agente; ou agregados diferentes do mesmo módulo, se não tocarem o mesmo `index.ts` ao mesmo tempo.
- ❌ Não pode: os passos do **mesmo** agregado (a entidade vem antes do repositório, que vem antes do caso de uso); `shared-validation-rule` em paralelo com qualquer coisa que use o `shared`; `npm install` concorrente; e, na Fase 5, `backend-prisma-sync-module` (migrations precisam de ordem) e qualquer skill que edite `app.module.ts`.

Para cada agregado da Fase 2:

- [ ] **4.1 Agregado.** Skill `module-aggregate`.
  ```
  Use a skill module-aggregate no módulo <modulo>, agregado <agregado>, modo example.
  Depois troque @poupig/shared por @oitenta/shared nos arquivos gerados (se não fez o passo 3.4).
  ```
  - `[complemento]` Prefira `example` a `crud`: os templates CRUD geram `findById(id)` sem filtro por usuário, o que fere `.agents/rules/arquitetura-limpa.md`.
  - Verificar: `modules/<modulo>/src/<agregado>/{model,provider,usecase}` e o build.
- [ ] **4.2 Entidade.** Skill `module-entity`.
  ```
  Use a skill module-entity no módulo <modulo>, agregado <agregado>, entidade <Entidade>
  com os atributos: <atributo: tipo, ...> (da tabela da Fase 2). Regras explícitas: <...>.
  ```
  - `[curso]` Validar no construtor impede ter a entidade "em edição" (rascunho de objetivo, trilha sendo editada). A skill usa validação explícita (`validate()`); mantenha assim.
  - Pronto quando: 100% de cobertura na entidade.
- [ ] **4.3 Classes de cálculo puras** (motor do plano, gotas/XP/nível, sequência). Sem skill `[complemento, do curso 1]`.
  ```
  Crie em modules/scheduling/src/plan/ a classe pura PlanCalculator (sem portas, sem async)
  que distribui etapas nos horários livres até o prazo, respeitando o limite diário somado
  de todos os objetivos e deixando folga. Teste com o exemplo de docs/fluxos.md §4
  (7 etapas, 8h15, entrega 24/11) e com o caso inviável. 100% de cobertura.
  ```
  - O mesmo vale para `gamification` (ex.: `RewardCalculator`, `StreakCalculator`).
- [ ] **4.4 Repositório.** Skill `module-repository`.
  ```
  Use a skill module-repository no módulo <modulo>, agregado <agregado>, tipo custom,
  entidade <Entidade>. Métodos: <lista>. Todo método de recurso do usuário recebe userId
  e filtra por ele (ex.: findById(userId, id)). Gere também o fake em memória.
  ```
- [ ] **4.5 Casos de uso.** Skill `module-use-case`, um por vez.
  ```
  Use a skill module-use-case no módulo <modulo>, agregado <agregado>, caso de uso
  <NomeEmIngles>, cenário custom, <retorna X | não retorna saída>. Dependências: <...>.
  Entrada: <campos, incluindo userId vindo do token>. Regras: <...>.
  Inclua o teste negativo de posse (usuário A não acessa recurso de B).
  ```
  - Pronto quando: `npm run test --workspace @oitenta/<modulo>` dá 100% e o `grep` da Fase 10 continua zerado.

### Fase 5 — Persistência e HTTP (backend)

`[curso]` Ordem por módulo: `backend-prisma-sync-module` → `backend-prisma-repository` → `backend-provider-implementation` → `backend-nest-config` (uma vez só, já feita na Fase 6) → `backend-nest-controller`. Os testes de integração ficam em `apps/backend/src/modules/<modulo>/<modulo>.integration.http` (Rest Client do VS Code).

- [ ] **5.1 Schema e migration.** Skill `backend-prisma-sync-module`.
  ```
  Use a skill backend-prisma-sync-module para o módulo <modulo>.
  ```
  - Verificar: `apps/backend/prisma/models/<modulo>.model.prisma` e a migration aplicada. Depois do primeiro módulo real, remova `prisma/models/bootstrap.model.prisma` e gere uma nova migration (instrução da `config-prisma`).
  - Um módulo por vez (as migrations precisam de ordem).
- [ ] **5.2 Repositório Prisma.** Skill `backend-prisma-repository`.
  ```
  Use a skill backend-prisma-repository para modules/<modulo>/src/<agregado>/provider/<agregado>.repository.ts.
  Garanta o filtro por userId também no update e no delete.
  ```
- [ ] **5.3 Providers técnicos** (se o módulo tiver). Skill `backend-provider-implementation`.
  ```
  Use a skill backend-provider-implementation para modules/<modulo>/src/<agregado>/provider/<nome>.provider.ts.
  ```
- [ ] **5.4 Controllers.** Skill `backend-nest-controller`, um caso de uso por vez.
  ```
  Use a skill backend-nest-controller no módulo <modulo>, agregado <agregado>, caso de uso
  <Nome>, método <post|get|...>, rota <path>, autenticada. O userId vem do usuário do token,
  nunca do body. No .integration.http inclua sucesso, 401 sem token e 404 para recurso de outro usuário.
  ```
- [ ] **5.5 Orquestração entre módulos**, conforme a decisão D3.
  - Pronto quando: o fluxo da fatia funciona via `.http` de ponta a ponta (login → disponibilidade → objetivo → plano → hoje → registrar → plano recalculado).

### Fase 7 — Integrações externas

Cada integração é um **provider**: contrato no módulo (`*.provider.ts`, assíncrono, só com os métodos que o caso de uso usa), implementação no backend (`backend-provider-implementation`), **fake** em `modules/<modulo>/test/mock/` e chave no `.env.example`.

- [ ] **7.1 LLM** (D6), no módulo `goals`: extrair título/prazo/tipo (UC02) e quebrar em etapas (UC04).
  ```
  Crie o contrato GoalAssistantProvider em modules/goals/src/goal/provider/ com
  extractGoal(text) e suggestSteps(goal), ambos async e com tipos de saída do domínio.
  Crie o fake em test/mock e use-o nos testes dos casos de uso. Depois use a skill
  backend-provider-implementation para implementar com <provedor escolhido>, lendo a chave do .env.
  ```
  - Verificar: os testes de domínio passam com o fake e sem rede; o `.http` com a chave real devolve etapas.
- [ ] **7.2 Firecrawl** (D7), no módulo `goals` (UC03, UC27): `WebPageReaderProvider.read(url)`.
- [ ] **7.3 Resend** (D7), no módulo `notifications` (UC23, UC24): `EmailProvider.send(...)`. O agendamento do e-mail diário também é decisão do time (cron no Nest ou serviço externo).
- Pronto quando: cada provider tem fake, implementação real e teste de domínio sem rede.

### Fase 8 — Mobile (Flutter)

O curso **não** tem skills de mobile (os prefixos `mobile-*` ficaram para o futuro). Decida D1, D4 e D5 antes.

- [ ] **8.1 Tema.** Sem skill.
  ```
  Em apps/mobile/lib/core/theme, crie o tema claro e escuro a partir de docs/design-system.md:
  cores (tokens), Fredoka para títulos e números e Nunito para o corpo (Google Fonts),
  raios 12/16/24/pílula, grade de 8pt, botão primário com "lábio" de 3px. Respeite a seção
  "Não fazer". Mostre uma tela de amostra com os componentes básicos.
  ```
- [ ] **8.2 Cliente HTTP e erros** em `lib/core/` (URL do backend por configuração; 401 → volta ao login; mensagens em português).
- [ ] **8.3 Telas na ordem dos fluxos** (`docs/fluxos.md`): onboarding (§1) → Hoje (§2) → rampa (§3) → novo objetivo (§4) → calendário (§5). Uma tela por vez, em `lib/features/<funcionalidade>/presentation`, consumindo `data/`. Use os prompts de `design/mobile/` como referência visual.
- [ ] **8.4 Criar skills `mobile-*`** `[complemento]`. Quando o primeiro fluxo (ex.: onboarding) estiver bom, extraia as skills por **engenharia reversa**, com o método das aulas 14 e 36 do curso: peça ao agente para ler o código pronto e escrever um `SKILL.md` com entradas obrigatórias, leituras obrigatórias, convenções e verificação. Candidatas: `mobile-feature`, `mobile-screen`, `mobile-api-client`.
- Pronto quando: o fluxo da fatia roda no simulador contra o backend local.

### Fase 9 — Web (Next.js)

- [ ] **9.1 Tokens CSS** do `docs/design-system.md` (bloco "Tokens CSS") no CSS global de `apps/frontend`, com Fredoka e Nunito.
- [ ] **9.2 Landing page** a partir de `design/web/promptWeb.md` (estrutura em `docs/fluxos.md` §9).
- [ ] **9.3 App com sidebar de 240px** (Hoje, Calendário, Objetivos, Tarefas leves, Jardim, Configurações), usando as rotas `app/(private)/<modulo>` já criadas.
- Como em 8.4, quando uma tela ficar boa, extraia skills `web-*` por engenharia reversa `[complemento]`.

### Fase 10 — Fechamento

- [ ] **10.1 Checklist de verificação:**
  - `npm install && npm run build` na raiz;
  - `npm run test --workspaces --if-present` e `cd apps/mobile && flutter analyze && flutter test`;
  - `grep -rnE "@nestjs|@prisma/client|from ['\"]express|bcrypt|jsonwebtoken" modules/*/src packages/shared/src` → zero;
  - teste negativo de posse presente em cada recurso de usuário (domínio e `.http`);
  - nenhum segredo commitado (`git grep -n "JWT_SECRET=\|API_KEY="`);
  - critérios de `docs/prompt-base-arquitetura_1.md` §7.
- [ ] **10.2 Cobertura** 100% no domínio (`modules/*` e `packages/shared`).
- [ ] **10.3 README do projeto:** setup, `.env`, banco, como rodar e testar.
- [ ] **10.4 Roteiro da demo** (até 5 minutos), seguindo a fatia: onboarding → objetivo pelo chat → plano no calendário → "Vamos começar?" → foco → registrar → "Plano recalculado".
- [ ] **10.5 Extrair skills** do que funcionou (mobile, web, orquestração entre módulos) e registrar as lições aqui.

---

## 4. Mapa casos de uso → módulo → fase

"Fatia" é a ordem sugerida na Fase 1 (a confirmar). Fases: domínio = 4, backend = 5, integrações = 7, mobile = 8, web = 9.

| UC | Caso de uso | Prioridade | Módulo | Fatia | Fases |
|---|---|---|---|---|---|
| UC01 | Informar disponibilidade | MVP | scheduling | 2 | 4, 5, 8, 9 |
| UC02 | Cadastrar objetivo pelo chat com IA | MVP | goals | 3 | 4, 5, 7, 8, 9 |
| UC03 | Criar objetivo a partir de anexo/link | MVP | goals | — | 4, 5, 7 (Firecrawl), 8, 9 |
| UC04 | Quebrar objetivo em etapas | MVP | goals | 3 | 4, 5, 7, 8, 9 |
| UC05 | Gerar plano no calendário | MVP | scheduling | 4 | 4 (classe pura), 5, 8, 9 |
| UC06 | Ver "o que fazer hoje" | MVP | scheduling | 5 | 4, 5, 8, 9 |
| UC07 | Ver calendário | MVP | scheduling | 5 | 4, 5, 8, 9 |
| UC08 | Registrar progresso de etapa | MVP | activation (D2) | 7 | 4, 5 (D3), 8, 9 |
| UC09 | Recalcular plano automaticamente | MVP | scheduling | 7 | 4, 5 (D3) |
| UC10 | Editar trilha do objetivo | MVP | goals | — | 4, 5, 8, 9 |
| UC11 | Alertar plano inviável | Desejável | scheduling | — | 4, 5, 8, 9 |
| UC12 | Gerenciar vários objetivos | Desejável | scheduling | — | 4 (classe pura) |
| UC13 | Cadastrar tarefas leves | MVP | goals | — | 4, 5, 8, 9 |
| UC14 | Fazer check-in de energia | MVP | activation | 6 | 4, 5, 8 |
| UC15 | Iniciar rampa ("Vamos começar?") | MVP | activation | 6 | 4, 5, 8 |
| UC16 | Executar degrau de aquecimento | MVP | activation | — | 4, 8 |
| UC17 | Desafio mental no app | MVP | activation | — | 8 (só cliente?) |
| UC18 | Fazer o primeiro micro-passo | MVP | activation | — | 4, 5, 7 (IA?), 8 |
| UC19 | Escolher, pular ou trocar degrau | MVP | activation | — | 4, 8 |
| UC20 | Iniciar sessão de foco | MVP | activation | 6 | 4, 5, 8 |
| UC21 | Encerrar sessão e registrar resultado | MVP | activation | 6 | 4, 5, 8 |
| UC22 | Pausa com retorno guiado | Desejável | activation | — | 4, 8 |
| UC23 | Receber o plano do dia por e-mail | MVP | notifications | — | 4, 5, 7 (Resend) |
| UC24 | Receber alertas e resumo por e-mail | Desejável | notifications | — | 4, 5, 7 (Resend) |
| UC25 | Ver histórico e sequência | Desejável | gamification | — | 4 (classe pura), 5, 8, 9 |
| UC26 | Limitar apps de distração | Desejável | mobile (nativo) | — | 8 |
| UC27 | Ler material de referência da etapa | Desejável | goals | — | 4, 5, 7 (Firecrawl + IA) |
| UC28 | Sincronizar com Google Calendar | Futuro | scheduling | — | fora do hackathon |
| UC29 | Criar conta e entrar | Desejável | auth | 1 | 6, 8, 9 (D8) |
| UC30 | Criar tarefa à mão | Desejável | goals | — | 4, 5, 8, 9 |
| UC31 | Pedir ajuda durante o foco | Desejável | activation | — | 4, 8 |
| UC32 | Configurações do perfil | Desejável | auth | — | 4, 5, 8, 9 |

Gamificação (gotas, XP, nível, conquistas) não tem UC próprio além do UC25, mas aparece na celebração depois do UC21. Se entrar na demo, é o módulo `gamification` (Fases 4 e 5).

---

## 5. Pontos de atenção do curso `[curso]`

- O resultado de uma skill **varia de pessoa para pessoa** (e de execução para execução). Sempre verifique o que ela gerou; se veio ruim, peça de novo **à própria skill**, dizendo o que corrigir.
- É preciso **entender as tecnologias** (NestJS, React/Next, Prisma) para corrigir o que o agente gera. Quem não conhece uma delas deve parear com quem conhece nas Fases 5 e 9.
- **Validar a entidade no construtor** impede usá-la "em edição". Mantenha a validação explícita das skills.
- O curso mostra **um único stack**. O método geral (specs, subagentes, verificação) virá em cursos seguintes; aqui, o que vale é a ordem de dentro para fora e a verificação a cada passo.
- O guia usa `npm run dev --filter=backend`, que falha com pacote escopado: use `--filter=@oitenta/backend`.
- Na aula final, o acesso ao usuário logado via JWT no teste de integração ficou sem solução: veja o passo 6.2.

---

## 6. Glossário curto

- **Módulo** tem três sentidos:
  1. **módulo de negócio**: `modules/<modulo>` (domínio puro, pacote `@oitenta/<modulo>`);
  2. **módulo do NestJS**: `apps/backend/src/modules/<modulo>` (`<Modulo>Module`, controller, implementações);
  3. **módulo do frontend**: `apps/frontend/src/modules/<modulo>` (páginas e componentes).
- **`shared`** (`packages/shared`): base comum do domínio. **Não é módulo de negócio.**
- **Agregado**: grupo de entidades tratado como uma unidade dentro de um módulo (pasta `modules/<modulo>/src/<agregado>`).
- **Provider / porta**: contrato declarado no domínio (`*.provider.ts`, `*.repository.ts`) e implementado no backend.
- **Fake**: implementação em memória de um contrato, usada nos testes (`test/mock/`).
- **Fatia vertical**: um caminho completo, do mobile até o banco, que funciona de ponta a ponta.
