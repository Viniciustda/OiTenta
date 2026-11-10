# Diário de execução do MVP

Este diário permite que qualquer sessão continue o trabalho de onde a anterior parou. Ele é atualizado a cada tarefa integrada ou travada e vai para a `developer` junto com cada tarefa.

## Painel

- **Próxima ação:** aguardar os relatórios dos subagentes B1–B5 (rodando em `/Users/arthursetragni/Hackaton/wt-b1` … `wt-b5`), passar cada entrega pelo revisor e integrar. Em paralelo, a C1 só depois da B1 (depende do domínio de goals).
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
| B1–B5 | `feat/goals-dominio`, `feat/scheduling-dominio`, `feat/activation-dominio`, `feat/web-telas-fatia`, `feat/mobile-telas-fatia` | em andamento (subagentes) | — | — | — | — | Worktrees em `/Users/arthursetragni/Hackaton/wt-b1..b5`, sem rastrear a `developer`. Preparação (P28): `npm ci`, `.env` a partir do `.env.example`, `prisma:generate` e `npm run build`; `flutter pub get` na b5. Regras comuns entregues aos subagentes: `scratchpad/brief-comum-subagentes.md` (cópia das seções 2 e 3 do prompt). |
| C0 | `feat/auth-timezone` | integrada | (este commit) | **Vermelho → verde:** `TimezoneRule` (`TypeError: TimezoneRule is not a constructor` → 3/3); `auth` (9 falhando → 31/31); integração (`/auth/me` sem o fuso → 6/6) | verde (138 unidade + 6 integração; 100% no domínio; flutter ok; grep 0) | n/a (feita pelo orquestrador) | Ver "Problemas e achados" abaixo. |

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
