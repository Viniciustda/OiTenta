# Diário de execução do MVP

Este diário permite que qualquer sessão continue o trabalho de onde a anterior parou. Ele é atualizado a cada tarefa integrada ou travada e vai para a `developer` junto com cada tarefa.

## Painel

- **Próxima ação:** nenhuma tarefa pendente da rodada de ajustes visuais (11/11). Aguardando as decisões do `afazeres.md` (raiz), que agora concentra todas as perguntas, problemas e pendências, e o "pode mandar para a main".
- **Estado da developer:** verde; último commit integrado: o desta atualização do diário (`docs/afazeres-rodada-visual`).
- **Main intocada:** sim (`7b8a85e`, landing em produção).

## RELATÓRIO FINAL (10/11/2026, ~22h30)

**O que foi entregue na `developer`** (toda tarefa com TDD, verificação completa verde e revisor antes do merge):
- **Domínio** (`modules/goals`, `scheduling`, `activation`, mais o fuso em `auth`): 100% de cobertura e zero import de framework.
- **Backend:** persistência Prisma (migrations `goals`, `scheduling`, `activation`, `auth_add_user_timezone`), `ValidationPipe` (P19), os 7 orquestradores e todas as rotas do contrato (docs/4). São 120 testes de integração; OpenAPI exportado.
- **Web:** as telas da fatia, fiéis ao protótipo (comparações em `docs/frontend/comparacoes/`), ligadas ao backend real por HTTP. São 208 testes de tela/unidade e o ponta a ponta Playwright verde.
- **Mobile:** as telas da fatia (comparações em `docs/mobile/comparacoes/`), ligadas ao backend real por HTTP. São 161 testes e o `integration_test` verde no simulador iOS (nunca no iPhone físico).
- **Fluxo principal** (login demo → onboarding → objetivo → plano → Hoje → rampa → registrar → plano recalculado) passando de ponta a ponta no web e no mobile, contra o backend local.
- **COMO-TESTAR** do backend, do frontend e do mobile atualizados. O fluxo de `curl` do backend foi executado e confere.

**Main:** intocada em `7b8a85e`. Nada foi feito nela.

**Decisões que eu (orquestrador) tomei sem você e que valem revisar:**
- A ordem da Etapa C (as rotas que dependem de orquestrador foram para a C4).
- As lacunas A a D da C4: `createdAt` no `ListGoals`; os casos de uso novos `GetNextBlocks` e `GetBlock`; `blockId` opcional; `slackDays: null` em `done`. Problema 8.
- Bloco de outra etapa → 404.
- Tarefas leves vazias no modo real do mobile.
- Comparações guardadas só na última rodada, em JPEG.
- O script `db:reset-demo`.

**Pendências que dependem de você:** as perguntas 1 a 21 no fim deste arquivo. As de maior impacto:
- 15 (o progresso pode regredir);
- 18 (persistir o token do mobile, que exige pacote novo);
- 19 (rampa pela trilha no mobile);
- 20 (nome do demo);
- 1 (cor P4).

**Problemas registrados:** 1 a 16 em "Problemas e achados". Nenhum bloqueia. O problema 6 (uma integração só de docs com a verificação vermelha por ambiente local) já foi corrigido no processo.

**Worktrees:** `/Users/arthursetragni/Hackaton/wt-b1..wt-b5` continuam no disco, com branches já integradas. Podem ser apagadas quando quiser (`git worktree remove`).

## Sessão 1 — 10/11/2026

### Leitura obrigatória (seção 1 do prompt de orquestração)

Lidos ou já conhecidos por terem sido escritos nesta sessão:
- `CLAUDE.md` / `AGENTS.md`;
- `.agents/rules/*` (`processo-desenvolvimento`, `arquitetura-limpa`, `mobile-flutter`, `nomenclatura-e-estrutura`, `testes-e-cobertura`);
- `docs/2-decisoes-mvp.md`, `docs/3-modelagem-dominio.md`, `docs/4-contrato-api.md`, `docs/5-plano-execucao.md`;
- os três `design/**/SCREENS.md` e `design/tokens.md`;
- os três `docs/*/COMO-TESTAR.md`.

Não havia diário anterior.

### Estado no início

- Branches remotas: `main` (`7b8a85e`, landing publicada), `developer` (`c81d2ed`) e `feat/frontend-landing`.
- Feito e integrado:
  - fundação do monorepo;
  - auth (cadastro, login, `/auth/me`, `/auth/demo`, Swagger, `openapi.json`);
  - `shared` com `ConflictError`/`ForbiddenError`;
  - lint em todos os workspaces;
  - landing web;
  - `COMO-TESTAR.md`;
  - regra do processo;
  - Etapa A (modelagem, contrato e plano, como proposta).
- As 28 perguntas da Etapa A foram respondidas em 10/11/2026.
- Verificação completa: script em `/private/tmp/claude-501/-Users-arthursetragni-Hackaton/d6b8bf75-f53b-48d0-9b3c-0361f6d7f3cf/scratchpad/verificacao-completa.sh`. Ele é temporário; se não existir numa sessão nova, recriar a partir de `.agents/rules/processo-desenvolvimento.md` §4.

## Tarefas

| Id | Branch | Status | Commit na developer | TDD | Verificação | Revisor | Pendências e problemas |
|---|---|---|---|---|---|---|---|
| A-dec | `docs/decisoes-etapa-a` | integrada | `bbde72c` | n/a (docs) | verde | n/a (sem subagente) | — |
| 5.1 | `chore/dependencias-etapa-b` | integrada | `fe59234` | n/a (configuração). O Vitest foi validado com um teste temporário (jsdom + React + alias `@`), que passou e foi removido | verde; `flutter build ios --simulator` ok | n/a | Instalado: frontend `vitest@4.1.12`, `@testing-library/react@16.3.3`, `jsdom@29.1.1`, `@playwright/test@1.65.0` (o `@testing-library/dom` veio como peer dependency automática); backend `class-validator@0.15.1`, `class-transformer@0.5.1` (o `ValidationPipe` entra na Etapa C); mobile `go_router@17.5.0`, `google_fonts@8.2.1`, `phosphor_flutter@2.1.0`, `http@1.6.0`. O `flutter pub add` gerou `Podfile`/`Podfile.lock` e ajustes no projeto do Xcode (CocoaPods, porque há plugins nativos). Script `test` do frontend = `vitest run --passWithNoTests`; `test:e2e` = `playwright test`. Os navegadores do Playwright serão instalados na Etapa E. |
| B4 | `feat/web-telas-fatia` | integrada | `76cd6e6` | **Vermelho → verde:** 1ª entrega com 12 e 7 suítes falhando por módulo inexistente; correções do 1º ciclo com 21 testes falhando por asserção → 145/145 (`scratchpad/b4/red-3.txt`, `green-3.txt`) | verde | 1º ciclo APROVADO COM RESSALVAS, com 7 correções: `RampOption` igual à do domínio, login sem importar a semente, `usedMinutes` e P6 iguais ao domínio, modal W40, frase falsa do W07, testes isolados, dias locais. 2º olhar: APROVADO | Comparações em `docs/frontend/comparacoes/` (última rodada de cada tela, com as diferenças justificadas no README). Rotas no grupo `app/(app)/`; o antigo `(private)` continua intacto. Perguntas 8 a 11. |
| B5 | `feat/mobile-telas-fatia` | integrada | `90ef543` | **Vermelho → verde:** repositórios (arquivo inexistente → 31/31); controladores (`Method not found` → 77/77); weekday (asserção → verde); `RampOption` (getter inexistente → verde); total 91/91. Testes de widget escritos depois das telas, como pede a brief | verde; fluxo da fatia percorrido no simulador iOS (iPhone 16e) | 1º ciclo APROVADO COM RESSALVAS: **corrigir** o weekday (estava com 0 = domingo; o domínio usa 0 = segunda), mais `stepKind`/`operation` na `RampOption`. Correção conferida pelo orquestrador | Comparações em `docs/mobile/comparacoes/`. Pendências aceitas: "cerca de Xh" com 2h por período; resposta do T01 só no controlador; tarefas leves só de exemplo; concluídas como "Concluída"; títulos curtos; plano inviável fora; login e cadastro sem sessão, exceto o demo. Perguntas 12 e 13. |
| C0 | `feat/auth-timezone` | integrada | `189cd98` | **Vermelho → verde:** `TimezoneRule` (`TypeError: TimezoneRule is not a constructor` → 3/3); `auth` (9 falhando → 31/31); integração (`/auth/me` sem o fuso → 6/6) | verde (138 unidade + 6 integração; 100% no domínio; flutter ok; grep 0) | n/a (feita pelo orquestrador) | Ver "Problemas e achados" abaixo. |

## Problemas e achados

1. **Instalação nova: build falha antes do `prisma:generate`.** Num `npm ci` limpo, `npm run build` falha no backend (`Module '"@prisma/client"' has no exported member 'PrismaClient'`), porque o cliente do Prisma não é gerado na instalação.
   - Corrigido no `docs/backend/COMO-TESTAR.md` (passo 2b: `prisma:generate` antes do `build`).
   - Opção futura, que exige a sua decisão: um `postinstall` no backend rodando `prisma generate`.
2. **Jest × `@nestjs/config` v12 (só ESM).** Os testes de integração do backend não carregavam a aplicação (`Must use import to load ES Module: .../@nestjs/config/dist/index.js`).
   - Solução aplicada, sem dependência nova: o script `test:e2e` roda com `NODE_OPTIONS=--experimental-vm-modules` (o Jest 30 só usa o carregamento nativo de ESM do Node 24.9+ com essa opção) e `--runInBand`.
   - Alternativa, se preferir: trocar o `@nestjs/config` pela v4 (CommonJS, também compatível com Nest 11).
3. **O `ValidationPipe` (P19) ainda não está ligado.** Ao ligá-lo (C1), os corpos do auth (`RegisterUserBody`, `LoginUserBody`) precisam receber os decorators do `class-validator`; senão o `forbidNonWhitelisted` rejeitaria todos os campos.
4. Configuração comum da aplicação extraída para `apps/backend/src/app.setup.ts` (`configureApp`), usada pelo `main.ts` e pelos testes de integração, para os testes rodarem com o mesmo filtro de erros.
5. O verificador completo agora inclui `npm --workspace apps/backend run test:e2e` (precisa do Postgres no ar), também registrado na regra do processo (§4).
6. **Integração com verificação vermelha (10/11, `ac1ccd7`, só docs).** O encadeamento `verificação | grep RESULTADO && integrar` não exigia o verde, e a branch de docs do diário entrou na developer com "RESULTADO: FALHOU". Causa: o checkout principal tinha o cliente do Prisma desatualizado (o build e os testes de integração do scheduling falhavam só ali). Depois do `prisma:generate`, a mesma developer deu **TUDO VERDE**; o código nunca esteve vermelho. Correções: o verificador roda `prisma:generate` antes de tudo e, no verde, grava um selo com o SHA; o script de integração recusa a branch sem selo verde no SHA exato.
7. **Erro meu na brief do revisor da C3:** citei um `GetRampOptions` que usaria o histórico de sessões; ele não existe nos docs. Não é requisito novo; o `BuildRamp` (docs/3 §4.6) não usa histórico.
8. **Lacunas de domínio na C4 (decididas pelo orquestrador, revisar):**
   - A) o `PlanCalculator` exige `createdAt` do objetivo, que nenhuma saída do goals expunha. Acrescentado ao `ListGoals`.
   - B) `nextBlock` não tinha caso de uso. Criado o `GetNextBlocks`: por etapa, o bloco `planned` de menor início ≥ agora, até 366 dias.
   - C) o `record-progress` gravava antes de conferir a posse do bloco. Agora confere tudo antes (`GetGoal` + `GetBlock` novo), e o `blockId` é opcional. Se o `GeneratePlan` falhar depois das escritas, elas ficam; hoje isso não acontece pela API.
   - D) objetivo `done` vem com `slackDays: null`.
9. **Efeito colateral da D1:** o teste ao vivo gravou uma grade no usuário demo do banco local. Resolvido com o `db:reset-demo`.
10. **Sem bloco no dia, o Hoje não abre a rampa** (web e mobile): "Vamos começar?" não faz nada e aparece "Nada agendado". No web dá para abrir a rampa pela trilha ("Começar próxima etapa"). No mobile não há essa entrada (ver a pergunta 19).
11. **A energia escolhida no Hoje se perde** quando a rampa do web é aberta pela trilha ou pelo calendário: a rampa começa no Aquecer.
12. **Nome do demo:** o botão diz "Entrar direto como Arthur (demo)", mas o seed cria a "Usuária Demo" (aparece na saudação, na sidebar e no avatar "U" do mobile). Ver a pergunta 20.
13. **Folga de 1 dia com prazo a 14 dias:** é o `slackDays` da P9, não bug.
14. **Dados de exemplo × backend real:** os testes de tela usam os dados de exemplo, e por isso duas divergências do mobile só apareceram no ponta a ponta. O revisor comparou todos os `fromJson` do mobile com os DTOs reais e não achou outras.
15. **Rampa do mobile:** o Hoje diz "Rampa de 25 min até o foco" e a escada diz "6 min de rampa". O número é inconsistente; ficou fora do escopo da E.
16. **Ponta a ponta dependente do relógio:** o do web se adapta (caminho alternativo pela trilha). O do mobile precisa de bloco no dia atual: rode antes de ~22h45 e fora da noite de domingo.
| B3 | `feat/activation-dominio` | integrada | `28a3e82` | **Vermelho → verde:** entidade e classes (17 falhando, `FocusSession/RampSuggestion/FixedRampOptionSource is not a constructor` → 29/29); casos de uso (10 falhando → 39/39); correção do revisor (3 falhando → 38/38). Saídas em `scratchpad/b3-red1.txt` e `b3-red2.txt` | verde (175 unidade + 6 integração; activation 100%) | 1º ciclo: **corrigir** `RampOptionSource.listOptions` com um 3º parâmetro fora da §4.4 → voltou a `(userId, stepKind)`, e o micro (incluindo a genérica da P6) passou a ser montado no `BuildRamp`; arquivos renomeados para `*.provider.ts`. 2º olhar: APROVADO | Ver "Pendências da B3" abaixo. |

| B1 | `feat/goals-dominio` | integrada | `9745f71` | **Vermelho → verde:** entidades e calculadora (49 falhando, `Step is not a constructor` → 49/49); casos de uso (22 falhando → 72/72); correção do revisor (2 falhando → 74/74) | verde (248 unidade + 6 integração; goals 100%) | 1º ciclo: **corrigir** prazo `""` aceito → agora `goal.deadline.required`; a cor P4 virou pergunta ao usuário. 2º olhar: APROVADO | Regras locais (`MultipleOfRule`) em `modules/goals`, candidatas ao shared; campos extras nas saídas (`kind`, `source`, `status`, `aiEstimatedMinutes`, `microSteps`), que a C4 documenta no OpenAPI. |
| C1 | `feat/backend-goals` | integrada | `e39052e` | **Vermelho → verde:** integração (`Cannot find module goal.prisma` + 3 casos da P19 com 500/201 → 16/16) | verde (16 integração) | APROVADO COM RESSALVAS; ajuste recomendado aplicado (os 404 conferem a mensagem do domínio, provado comentando a rota). 2 testes do adaptador escritos depois, com prova por mutação (exceção registrada) | Migration `goals` (tabelas `goals`, `goal_steps`, FK para `users`) feita pelo orquestrador. `ValidationPipe` global ligado (P19). |

| B2 | `feat/scheduling-dominio` | integrada | `179a028` | **Vermelho → verde:** entidades (39 falhando → 50/50); classes puras (4 suítes `is not a constructor` → 38/38); casos de uso (34/34 falhando → 124/124); correções (validar antes de unir: 2 falhando; `GetDayPlan` alinhado: 5 falhando → 128/128) | verde (375 unidade; scheduling 100%) | 1º ciclo: **corrigir** a validação das janelas (unia antes de validar) e alinhar o `GetDayPlan` ao contrato. 2º olhar: APROVADO | Perguntas 2–6 abaixo. Testes de borda escritos junto com o código (zoned-time, união de janelas, bordas do motor), fora dos cenários aprovados. |
| C2 | `feat/backend-scheduling` | integrada | `c200df5` | **Vermelho → verde:** integração (módulo inexistente; depois 27/27 vermelhos pelo motivo certo com cascas → 27/27) | verde (43 integração) | APROVADO COM RESSALVAS, sem correção obrigatória | Migration `scheduling` (`weekly_availabilities` com janelas em JSON, `scheduled_blocks`). `EmptyCommitmentRepository` (P8). Testes recomendados e não feitos: desempate pelo fim, `deletedAt` nas leituras, reescrita do `userId` no `replaceFutureAutoBlocks`. |
| C3 | `feat/backend-activation` | integrada | `45f7cb9` | **Vermelho → verde:** módulo inexistente; depois 6/6 vermelhos com cascas → 6/6; 2º ciclo: filtro por etapa e ordenação (2 vermelhos provocados removendo o filtro e o `orderBy`; 1 removendo o desempate) → 8/8 | verde (51 integração) | 1º ciclo: **corrigir** testes faltando (filtro por `stepId` com o mesmo dono; ordenação). 2º ciclo: feitos | Migration `activation` (`focus_sessions`) do orquestrador. Controller de exemplo `GET /activation` removido; OpenAPI exportado de novo. `findAllByUserAndStep` ordena por `startedAt` e depois `createdAt` (crescente); nenhum caso de uso o consome no MVP. |
| C4 | `feat/backend-orquestradores` | integrada | `80c3de0` | **Vermelho → verde:** visões e rampa (27 falhando, rota inexistente → 27/27); A `createdAt` (2 falhando → goals 75/75); B/C domínio (`GetBlock/GetNextBlocks is not a constructor` → scheduling 140/140); escritas (34 falhando → 112/112); prova por mutação da atomicidade (mover o `GetBlock` para depois da gravação faz o teste de posse falhar); correção do revisor (1 falhando → 120/120) | verde (388 unidade + 120 integração; 100% no domínio) | 1ª entrega parcial: o autor parou em 4 lacunas de domínio (A a D, abaixo), que eu decidi e autorizei. 1º ciclo APROVADO COM RESSALVAS: **corrigir** bloco do próprio usuário de outra etapa (marcava o bloco errado como `done`) → 404 antes de gravar; `implements` no DTO; testes de 422/401 que faltavam. Correção conferida pelo orquestrador | OpenAPI exportado de novo. Mudanças no domínio, autorizadas pelo orquestrador: `createdAt` no `GoalListItem`; casos de uso novos `GetNextBlocks` e `GetBlock` no scheduling. Docs 3 e 4 atualizados (`1efec3a`). Decisões do autor aceitas: o `POST /goals` confere a disponibilidade antes de gravar; o `GET /goals` sem objetivo ativo devolve `[]`; campos a mais (`scheduledMinutes`, `StepView` completo). Pergunta 15. |
| D1 | `feat/web-integracao-api` | integrada | `3a8a2c1` | **Vermelho → verde:** 7 arquivos falhando (módulos inexistentes, `createdAt` inválido) → 199/199; relógio (2 falhando → 7/7); `GoalHeader` (asserção → 38/38); total 201 | verde; ao vivo: demo, `/auth/me`, 401, 404 e 422 com `details` contra o backend real | APROVADO COM RESSALVAS, sem correção obrigatória; 3 ajustes menores feitos (tipo `GoalHeader`, nome do helper de teste, relógio do exemplo) | Cliente `fetch` em `core/data/http-client.ts`: token no `localStorage` (`bora.token`), 401 → `/entrar`. A implementação é escolhida por `NEXT_PUBLIC_DATA_SOURCE` (`http` por padrão; nos testes de tela, `example`). `SystemClock` truncado no minuto, com `SERVER_NOW` no servidor (contorno para o build do Next, pergunta 17). Perguntas 16 e 17. |
| D2 | `feat/mobile-integracao-api` | integrada | `50cb19e` | **Vermelho → verde:** cliente e repositórios (arquivo e membros inexistentes → 152/152); revisão: `slackDays` nulo (`type 'Null' is not a subtype of type 'int'`), `details`, tarefas leves, `NextBlock.id`, timeout e redirect (vermelho provocado desligando o redirect) → 158/158 | verde; ao vivo no simulador iOS: demo real → 404 da disponibilidade → onboarding | 1º ciclo APROVADO COM RESSALVAS: **corrigir** `slackDays` nulo no plano (derrubava o parse com objetivo sem prazo), mais 5 ajustes. Correção feita | `DATA_SOURCE` no `--dart-define-from-file` (`http` por padrão). Token só em memória (pergunta 18). No modo `http`, as tarefas leves vêm vazias. Mudanças fora do escopo aceitas: `main.dart` passa a usar `fromConfig()`; `env/*.json`; `me()` na interface. |
| E-dep | `chore/dependencias-etapa-e` | integrada | `eefc30b` | n/a (configuração) | verde | n/a | `integration_test` (SDK do Flutter) no `pubspec`; Chromium do Playwright instalado; script `db:reset-demo` (apaga sessões, blocos, objetivos e disponibilidade do usuário demo, mantendo o usuário) para o ponta a ponta começar do zero. |
| E-web | `feat/e2e-fluxo-principal` | integrada | `131b401` | **Vermelho → verde:** sem servidor (`ERR_CONNECTION_REFUSED`); depois o bug de hidratação no Hoje (`Hydration failed`); teste unitário do bug (asserção) → verde; revisão: regra do horário em função pura (2 falhando em 22:31 e 22:59 → 6/6) | verde; Playwright rodado pelo orquestrador 2× no caminho normal e 1× no alternativo (`E2E_SEM_BLOCO_HOJE=1`), todos `1 passed` | 1º ciclo APROVADO COM RESSALVAS: **corrigir** a checagem de percentual (passava em ~28% das execuções com 0%) e o caminho alternativo, que não seguia a regra do planejador (quebrava entre 22:31 e 22:59). Corrigido e conferido pelo orquestrador | Bug corrigido: o Hoje mostrava a data antes de carregar os dados, e o `SERVER_NOW` causava erro de hidratação. O teste reprova erro de console e resposta ≥ 400. `globalSetup` roda `db:reset-demo`. Achados 10 a 13. |
| E-mobile | `feat/e2e-mobile` | integrada | `0fe60f2` | **Vermelho → verde:** escada com `log` vazio (`RangeError`); `goal{…}` sem `progressPct` (`Null is not int`); revisão: tocar no Registrar (`Expected 3, Actual 4`), `log` vazio no exemplo, parse sem `?? 0` → 161/161 | verde; `integration_test` no simulador iPhone 17, 2× seguidas em cada ciclo (`All tests passed!`, 45 s) | 1º ciclo APROVADO COM RESSALVAS: **corrigir** o toque no degrau Registrar, que ainda quebrava com a resposta real. Corrigido (o degrau sem opção não é selecionável) | Os 2 bugs vinham de dados de exemplo diferentes do backend real (`log` com opção; `progressPct` dentro de `goal`). Pod do `integration_test` commitado em `ios/` pelo orquestrador. Achados 14 e 15. |
| E-docs | `docs/como-testar-e` | integrada | ver o commit desta linha | n/a | fluxo de `curl` do COMO-TESTAR do backend executado pelo orquestrador contra a developer final: demo → PUT (200, com `plan`) → POST /goals (201) → plano do dia e da semana (200) → rampa (5 degraus, `suggested=micro`) → sessão (201, plano recalculado) → etapa 1 `done`, etapa 2 com `nextBlock` | n/a | COMO-TESTAR do backend, do frontend e do mobile reescritos para a fatia. |

## Ajuste de sequência da Etapa C (orquestrador, 10/11/2026)

O `PUT /scheduling/availability` devolve o plano recalculado, e o dia e a semana do plano juntam os títulos dos objetivos. As duas coisas são trabalho dos orquestradores, que o plano coloca na C4. Por isso:
- a C2 entregou a persistência, o `GET` e o `PUT /scheduling/availability` (sem o `plan`);
- a C3 entrega a persistência e os providers de activation, sem rotas;
- a C4 acrescenta o `plan` ao PUT e cria `GET /scheduling/plan/day`, `/week`, `POST /goals`, `GET /goals`, `GET /activation/ramp` e `POST /activation/sessions`, cada um com o seu orquestrador.

## Ajustes de consistência feitos pelo orquestrador (10/11/2026, revisar)

- **`GetDayPlan` alinhado ao contrato:** a modelagem (§3.6) dizia `{ blocks }`, o contrato aprovado (docs/4 §4) pede `{ date, blocks, usedMinutes, limitMinutes }`, e o orquestrador `day-view` não pode calcular (5.9). Prevaleceu o contrato; a modelagem foi corrigida.
- **Códigos de erro do plano:** a semana que não começa na segunda é regra do domínio e responde **422** (o contrato dizia 400). O dia e a semana sem disponibilidade respondem **404** (P12), que o contrato não listava. Contrato corrigido.

## Pendências da B3 (aceitas pelo revisor, registradas para a Etapa C ou para o usuário)

- Opções do micro-passo: `durationLabel '1 min'`, `description 'Micro-passo'`, `icon 'footprints'`, ids `micro-<n>`, vindos do protótipo (`Bora App.dc.html`, lista "trocar").
- O desafio não tem `durationSeconds` (o protótipo não tem). O contrato §5 foi corrigido para `durationSeconds?` (opcional), como na modelagem §4.4.
- Ids das opções no formato `<kind>-<n>`, determinísticos (nenhum documento define formato).
- `partialPct`: inteiro de 1 a 99 com `partial`; `null` fora dele (código `focusSession.partialPct.equals`).
- `goalId`, `stepId` e `blockId` validados como UUID; `endedAt < startedAt` gera o código `focusSession.endedAt.min.date`.
- O `BuildRamp` não valida `availableTime` (P15: sem efeito); quem valida é a `FocusSession` e, no backend, o `ValidationPipe`.
- Menores, não bloqueantes: alguns testes têm mais de um resultado esperado (a regra pede um por teste); os nomes de dois arquivos de teste não acompanharam o sufixo `.provider`.

## Perguntas para o usuário

(As perguntas 2 a 6 vêm da revisão da B2. Até a decisão, o comportamento atual se mantém.)

1. **Cor do objetivo (P4), leitura ambígua.** A decisão diz "próximo índice de 1 a 4 entre os objetivos ativos, voltando ao 1 depois do 4". A B1 implementou `(nº de ativos % 4) + 1`, que repete cor entre ativos. Exemplo: com A=1, B=2 e C=3, se B for concluído, o próximo recebe 3, a mesma cor de C.
   - Sugestão do revisor: usar o menor índice de 1 a 4 que nenhum ativo usa; se os 4 estiverem ocupados, a cor menos usada, com desempate pelo menor índice. Isso mantém os cenários atuais ({1,2} → 3; {1..4} → 1) e dá {1,3} → 2.
   - Até a decisão, fica a implementação atual (leitura literal). A mudança é pequena: um teste novo e uma função.
2. **Horizonte do plano para objetivos sem prazo.** Hoje vai até o maior prazo ou até hoje + 28 dias (o que for mais tarde). O que passa disso fica como `unscheduledMinutes`, com `feasible` continuando `true`. Ok?
3. **Resto menor que 30 ao dividir uma etapa.** O motor evita deixar um resto menor que 30 min, o que a P10 não exige. Em casos raros isso torna inviável um plano que caberia (ex.: 90 min com 75 livres vira 60 + 30). Manter a heurística ou seguir o guloso puro?
4. **Bloco fixado ou em andamento no recálculo.** Hoje um bloco fixado no futuro (ou um `planned` em andamento) ocupa o horário, mas não desconta os minutos da etapa, que é alocada de novo por inteiro. Deve descontar? (No MVP não há como fixar bloco, então o impacto hoje é baixo.)
5. **Blocos `missed` no "3h de 3h".** Hoje os blocos não feitos contam no `usedMinutes` do dia e da semana e no limite do recálculo do mesmo dia. Devem contar?
6. **Tamanho do título do compromisso.** Sem limite hoje; usar os mesmos 120 caracteres da P2?
7. **`replaceFutureAutoBlocks` com bloco de outro usuário** (revisão da C2, não bloqueia). Hoje o adaptador grava os blocos novos com o `userId` do parâmetro, mesmo se um bloco chegar com outro `userId`. Manter assim (nunca grava em nome de outro) ou lançar erro (pode revelar bug do motor)? Recomendação do revisor: manter, com teste.
8. **W40 (web):** o modal "7 dias regados" com confete foi incluído com valores fixos, seguindo o P18. Quer que fique?
9. **Rampa sem check-in (web):** a tela começa no Aquecer e grava a sessão com `energy: "low"`, sem o usuário ter escolhido. Manter ou obrigar o check-in antes de "Vamos começar?"?
10. **W30 vazia (web):** o título "Quebrei em etapas pra você" é texto da IA num fluxo manual. Manter o do protótipo ou trocar por algo como "Monte as etapas"?
11. **Conteúdo da rampa depois da Etapa D:** os textos passam a vir do catálogo do domínio (alongamento, contas), diferentes dos do protótipo web. Aceita, ou o catálogo precisa ganhar os textos do web?
12. **Mobile, depois de criar objetivo ou tarefa:** volta para a Semana, como no protótipo, ou abre a trilha do objetivo criado?
13. **M15 vazia (mobile):** o slider "Máximo de estudo por dia" saiu junto com os elementos da IA. Deve voltar?
14. **Comparações de tela:** copiadas para `docs/frontend/comparacoes/` e `docs/mobile/comparacoes/` só com a última rodada, em JPEG reduzido (cerca de 6 MB no total; os PNGs originais tinham mais de 40 MB). Quer guardar também as rodadas intermediárias?
15. **Progresso da etapa pode regredir (C4).** Uma sessão `partial` com 30% numa etapa em 80%, ou já `done`, baixa a etapa para 30% e devolve minutos ao plano. O domínio permite, e o docs/3 diz "`partial` = `partialPct`". É intencional (o usuário corrige a estimativa) ou o progresso nunca deve recuar? Se nunca deve recuar, a regra vai para o domínio (`Step`).
16. **Web sem backend:** com o padrão `NEXT_PUBLIC_DATA_SOURCE=http`, um `npm run dev` sem backend mostra telas vazias e erros. Prefere `example` como padrão de desenvolvimento?
17. **Relógio do web no servidor:** o contorno `SERVER_NOW` funciona porque as telas não mostram a hora antes de carregar os dados. A solução definitiva é ler o relógio dentro de um efeito, o que mexe nas telas. Faço numa tarefa separada?
18. **Token do mobile só em memória:** fechar o app desloga. Para persistir a sessão é preciso aprovar um pacote, por exemplo `flutter_secure_storage`. Aprova?
19. **Entrada para a rampa pela trilha no mobile (M18):** criar? Ela deixaria o fluxo independente do horário, como no web. É uma função nova.
20. **Nome do usuário demo:** trocar o seed para "Arthur" (como o botão e o protótipo) ou trocar o texto do botão?
21. **`db:reset-demo` no ponta a ponta:** o Playwright apaga os dados do demo do banco local a cada execução. Tudo bem, ou prefere um usuário só para os testes?

## Sessão 2 — 11/11/2026: rodada de ajustes visuais

A partir desta sessão, perguntas, problemas e pendências ficam no `afazeres.md` (raiz), conforme a seção 10 da regra do processo. As perguntas 1 a 21 e os problemas 1 a 16 acima foram convertidos para lá.

Verificação completa (antes de cada merge): build, lint, testes de todos os workspaces, integração do backend, cobertura 100% do domínio, `flutter analyze` e `flutter test`, grep de framework, **Playwright** e **`integration_test` no simulador iOS** (iPhone 17). Script em `/private/tmp/claude-501/-Users-arthursetragni-Hackaton-OiTenta/38e788da-ae14-494a-b00a-834fc4ccb0f8/scratchpad/verificacao-completa.sh` (temporário; recriar a partir da regra §4, acrescentando os dois ponta a ponta).

| Id | Branch | Status | Commit na developer | TDD | Verificação | Revisor |
|---|---|---|---|---|---|---|
| T0 | `docs/afazeres` | integrada | `4986aed` | n/a (docs) | verde | n/a (orquestrador) |
| fix-e2e | `fix/e2e-web-seletor-trilha` | integrada | `62d7555` | vermelho 2× seguidas na developer às ~10h (`strict mode violation`: o seletor achava 2 elementos) → `1 passed` | verde | n/a (orquestrador); vira [DECIDIR] no afazeres, porque mexeu num teste existente |
| M2 | `feat/mobile-calendario` | integrada | `8090025` | controlador (não compilava: `No named parameter 'goals'`, `CalendarMode` inexistente) → +17; widget (-6 → +6); revisão: `selectDate` sem o ano (`Expected 2025-11-06, Actual 2024-11-20`) → +21 | verde (mobile 190) | APROVADO COM RESSALVAS; ajustes feitos (bordas do mês e ano) |
| W1 | `feat/web-navegacao-objetivos` | integrada | `4f20b04` | bug: 2 falhando (`Unable to find role="dialog" "Novo objetivo"`) → 3/3; menu: 4 falhando → 4/4; telas: imports inexistentes → verde; revisão: 2 falhando (edição desfeita pela recarga) → 9/9 | verde (frontend 243) | APROVADO COM RESSALVAS; ajuste feito; o revisor confirmou que o teste do bug falha sem a correção |
| W2 | `feat/web-calendario` | integrada | `d6024ea` | 33 falhando (`mondayOf is not a function`, `aria-pressed` ausente, sem Prazos) → 35/35; revisão: 4 falhando (navegação voltando com o relógio, partes da etapa, teclado no mês, horizonte no cabeçalho) → verde | verde (frontend 282) | 1º ciclo REPROVADO (navegação voltava sozinha a cada minuto com o relógio real); 2º olhar APROVADO |
| M1 | `feat/mobile-chat-objetivo` | integrada (parcial) | `fe71502` | tag: -5 (`a tag está coberta`) → +5; chat: não compilava → -17 → +22; revisão: "Enviar" do teclado na análise abria a M15 vazia (`Found 0 widgets with text "ETAPAS SUGERIDAS"`) → +7 | verde (mobile 219) | APROVADO COM RESSALVAS; correção do bloqueio feita. O botão "Novo objetivo" **não** foi ligado ao chat: exige alterar 2 testes existentes ([DECIDIR] no afazeres, com patch pronto) |

Achados da sessão (todos no `afazeres.md`):
- O ponta a ponta do web estava vermelho de manhã na developer, por um seletor ambíguo do próprio teste. Corrigido antes das tarefas, sem mudar a asserção.
- Bug do "Novo objetivo" no web: era do web (estado do modal fechado nunca esquecido com o `cacheComponents`), não do backend.
- O script de verificação desta sessão gravava o selo verde antes dos ponta a ponta. Corrigido antes da primeira integração; o selo antecipado foi apagado e nenhuma integração usou ele.
- Um usuário de teste (`w1.bug.…@teste.local`) ficou no Postgres local, criado na investigação do bug.
- Comparações da rodada em `docs/frontend/comparacoes/` e `docs/mobile/comparacoes/` (só a última rodada, JPEG), com as diferenças no README de cada pasta.

Worktrees `/Users/arthursetragni/Hackaton/wt-w1`, `wt-w2`, `wt-m1`, `wt-m2`: branches já integradas; podem ser removidas (`git worktree remove`).
