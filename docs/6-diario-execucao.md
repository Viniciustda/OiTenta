# Diário de execução do MVP

Este diário permite que qualquer sessão continue o trabalho de onde a anterior parou. Ele é atualizado a cada tarefa integrada ou travada e vai para a `developer` junto com cada tarefa.

## Painel

- **Próxima ação:** Etapa E. Primeiro o ponta a ponta do web (Playwright), depois o do mobile (`integration_test` no simulador iOS), e por fim os COMO-TESTAR.
- **Estado da developer:** verde; último commit integrado: ver a linha da tarefa mais recente abaixo.
- **Main intocada:** sim (`7b8a85e`, landing em produção).

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
| E | `feat/e2e-fluxo-principal` | em andamento: web primeiro (subagente em `wt-b4`), depois o mobile (os dois usam o mesmo usuário demo) | — | — | — | — | — |

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
