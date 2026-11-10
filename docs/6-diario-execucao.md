# Diário de execução do MVP

Este diário permite que qualquer sessão continue o trabalho de onde a anterior parou. Ele é atualizado a cada tarefa integrada ou travada e vai para a `developer` junto com cada tarefa.

## Painel

- **Próxima ação:** Etapa B — preparar as 5 worktrees (`npm ci` + `flutter pub get`) e lançar os subagentes B1–B5.
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
| 5.1 | `chore/dependencias-etapa-b` | integrada | (este commit) | n/a (configuração). O Vitest foi validado com um teste temporário (jsdom + React + alias `@`), que passou e foi removido | verde; `flutter build ios --simulator` ok | n/a | Instalado: frontend `vitest@4.1.12`, `@testing-library/react@16.3.3`, `jsdom@29.1.1`, `@playwright/test@1.65.0` (o `@testing-library/dom` veio como peer dependency automática); backend `class-validator@0.15.1`, `class-transformer@0.5.1` (o `ValidationPipe` entra na Etapa C); mobile `go_router@17.5.0`, `google_fonts@8.2.1`, `phosphor_flutter@2.1.0`, `http@1.6.0`. O `flutter pub add` gerou `Podfile`/`Podfile.lock` e ajustes no projeto do Xcode (CocoaPods, porque há plugins nativos). Script `test` do frontend = `vitest run --passWithNoTests`; `test:e2e` = `playwright test`. Os navegadores do Playwright serão instalados na Etapa E. |
