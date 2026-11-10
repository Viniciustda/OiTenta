# OiTenta (Bora)

App de planejamento adaptativo com IA para quem trava ao começar tarefas (Hack Brasil 2026). O `README.md` chama o produto de **OiTenta** e os docs de **Bora**; o nome ainda está em aberto (`docs/passo-a-passo.md`).

**Antes de implementar qualquer caso de uso, leia `docs/casos-de-uso.md` e `docs/passo-a-passo.md`.** Fluxos em `docs/fluxos.md`, visual em `docs/design-system.md`, arquitetura em `docs/prompt-base-arquitetura_1.md`.

## Mapa

| Pasta | O que é |
|---|---|
| `apps/backend` | NestJS (porta 4000) + Prisma + PostgreSQL (Docker Compose) |
| `apps/frontend` | Next.js (porta 3000) |
| `apps/mobile` | Flutter. Fora dos workspaces npm e do Turborepo |
| `modules/<modulo>` | Domínio por módulo de negócio: `auth`, `goals`, `scheduling`, `activation`, `gamification`, `notifications` |
| `packages/shared` | Base do domínio: `Entity`, `UseCase`, erros, validações, contratos CRUD. Não é módulo de negócio |
| `packages/{ui,eslint-config,typescript-config}` | Gerados pelo Turborepo |
| `.agents/skills` | Skills do curso (cópia idêntica em `.claude/skills`) |
| `.agents/rules` | Regras do projeto |
| `docs/`, `design/` | Produto, fluxos, design system, curso, prompts de design |

Pacotes npm no escopo `@oitenta/*`.

## Comandos (na raiz)

```bash
npm install
npm run build                                    # turbo: todos os pacotes
npm --workspace apps/backend run db:start        # sobe o Postgres (docker compose)
npm --workspace apps/backend run prisma:generate
npx turbo run dev --filter=@oitenta/backend      # use o nome escopado, não --filter=backend
npx turbo run dev --filter=@oitenta/frontend
npm run test --workspace @oitenta/<modulo>       # testes + cobertura de um módulo
npm run test --workspaces --if-present           # todos os testes (não há "npm test" na raiz)
cd apps/mobile && flutter run                    # mobile
```

## Regras (leia quando relevante)

- `.agents/rules/nomenclatura-e-estrutura.md`: nomes, sufixos e onde cada arquivo mora.
- `.agents/rules/arquitetura-limpa.md`: domínio sem framework, posse pelo token, erros → HTTP.
- `.agents/rules/testes-e-cobertura.md`: 100% no domínio, sem banco, teste negativo de posse.

## Skills, na ordem de uso

1. Fundação: `config-project-fullstack` → `config-prisma` → `config-package-shared` → `config-new-module` (já executadas).
2. Auth de referência: `spec-backend-auth-basic`. Várias skills leem `modules/auth/src/user/...` como exemplo obrigatório.
3. Domínio, por módulo: `module-aggregate` → `module-entity` (+ `shared-validation-rule`) → `module-repository` → `module-use-case`.
4. Backend: `backend-prisma-sync-module` → `backend-prisma-repository` → `backend-provider-implementation` → `backend-nest-config` → `backend-nest-controller`.

Não há skills de mobile nem de web. O passo a passo explica como criá-las.

## Não faça

- Não altere `README.md`, `design/` nem os docs originais de `docs/` sem pedido.
- Não crie dependência direta entre módulos de negócio antes da decisão registrada no passo a passo.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
