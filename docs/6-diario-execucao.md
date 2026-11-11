# Diário de execução do MVP

Este diário permite que qualquer sessão continue o trabalho de onde a anterior parou. Ele é atualizado a cada tarefa integrada ou travada e vai para a `developer` junto com cada tarefa.

## Painel

- **Próxima ação:** integrar a C3 (subagente rodando em `wt-b3`) e a B4 (em revisão); depois a C4 (orquestradores e as rotas que dependem deles). A B5 segue com o subagente.
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
| B4, B5 | `feat/web-telas-fatia`, `feat/mobile-telas-fatia` | B4 em revisão; B5 com o subagente | — | — | — | — | Worktrees em `/Users/arthursetragni/Hackaton/wt-b1..b5`, sem rastrear a `developer`. Preparação (P28): `npm ci`, `.env` a partir do `.env.example`, `prisma:generate` e `npm run build`; `flutter pub get` na b5. Regras comuns entregues aos subagentes: `scratchpad/brief-comum-subagentes.md` (cópia das seções 2 e 3 do prompt). |
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
| B3 | `feat/activation-dominio` | integrada | `28a3e82` | **Vermelho → verde:** entidade e classes (17 falhando, `FocusSession/RampSuggestion/FixedRampOptionSource is not a constructor` → 29/29); casos de uso (10 falhando → 39/39); correção do revisor (3 falhando → 38/38). Saídas em `scratchpad/b3-red1.txt` e `b3-red2.txt` | verde (175 unidade + 6 integração; activation 100%) | 1º ciclo: **corrigir** `RampOptionSource.listOptions` com um 3º parâmetro fora da §4.4 → voltou a `(userId, stepKind)`, e o micro (incluindo a genérica da P6) passou a ser montado no `BuildRamp`; arquivos renomeados para `*.provider.ts`. 2º olhar: APROVADO | Ver "Pendências da B3" abaixo. |

| B1 | `feat/goals-dominio` | integrada | `9745f71` | **Vermelho → verde:** entidades e calculadora (49 falhando, `Step is not a constructor` → 49/49); casos de uso (22 falhando → 72/72); correção do revisor (2 falhando → 74/74) | verde (248 unidade + 6 integração; goals 100%) | 1º ciclo: **corrigir** prazo `""` aceito → agora `goal.deadline.required`; a cor P4 virou pergunta ao usuário. 2º olhar: APROVADO | Regras locais (`MultipleOfRule`) em `modules/goals`, candidatas ao shared; campos extras nas saídas (`kind`, `source`, `status`, `aiEstimatedMinutes`, `microSteps`), que a C4 documenta no OpenAPI. |
| C1 | `feat/backend-goals` | integrada | `e39052e` | **Vermelho → verde:** integração (`Cannot find module goal.prisma` + 3 casos da P19 com 500/201 → 16/16) | verde (16 integração) | APROVADO COM RESSALVAS; ajuste recomendado aplicado (os 404 conferem a mensagem do domínio, provado comentando a rota). 2 testes do adaptador escritos depois, com prova por mutação (exceção registrada) | Migration `goals` (tabelas `goals`, `goal_steps`, FK para `users`) feita pelo orquestrador. `ValidationPipe` global ligado (P19). |

| B2 | `feat/scheduling-dominio` | integrada | `179a028` | **Vermelho → verde:** entidades (39 falhando → 50/50); classes puras (4 suítes `is not a constructor` → 38/38); casos de uso (34/34 falhando → 124/124); correções (validar antes de unir: 2 falhando; `GetDayPlan` alinhado: 5 falhando → 128/128) | verde (375 unidade; scheduling 100%) | 1º ciclo: **corrigir** a validação das janelas (unia antes de validar) e alinhar o `GetDayPlan` ao contrato. 2º olhar: APROVADO | Perguntas 2–6 abaixo. Testes de borda escritos junto com o código (zoned-time, união de janelas, bordas do motor), fora dos cenários aprovados. |
| C2 | `feat/backend-scheduling` | integrada | `c200df5` | **Vermelho → verde:** integração (módulo inexistente; depois 27/27 vermelhos pelo motivo certo com cascas → 27/27) | verde (43 integração) | APROVADO COM RESSALVAS, sem correção obrigatória | Migration `scheduling` (`weekly_availabilities` com janelas em JSON, `scheduled_blocks`). `EmptyCommitmentRepository` (P8). Testes recomendados e não feitos: desempate pelo fim, `deletedAt` nas leituras, reescrita do `userId` no `replaceFutureAutoBlocks`. |
| C3 | `feat/backend-activation` (worktree `wt-b3`) | em andamento (subagente) | — | — | — | — | Migration `activation` (`focus_sessions`) feita pelo orquestrador. |

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
