# Regra: nomenclatura e estrutura

Vale sempre que criar, mover ou renomear arquivos de código. Extraída do código gerado pelas skills de `.agents/skills` (não inventar variações).

## Idioma

- Código, pastas, nomes de arquivo, classes e rotas em **inglês**.
- Documentação (`docs/`) e mensagens mostradas ao usuário em **português**.

## Nomes

- Arquivos e pastas em **kebab-case**, com sufixo que indica o papel: `<nome>.<papel>.ts`.
- Classes, interfaces e tipos em **PascalCase**; variáveis e métodos em camelCase.
- Pacotes npm sempre no escopo `@oitenta/<nome>`.

| Papel | Arquivo | Classe / tipo |
|---|---|---|
| Entidade | `user.entity.ts` | `User extends Entity<UserState>` |
| Contrato de repositório | `user.repository.ts` | `UserRepository` |
| Contrato de provider | `crypto.provider.ts` | `CryptoProvider` |
| Caso de uso | `register-user.usecase.ts` | `RegisterUser implements UseCase<RegisterUserIn, RegisterUserOut>` |
| Regra de validação | `email.rule.ts` | `EmailRule` |
| Erro de domínio | `not-found.error.ts` | `NotFoundError extends DomainError` |
| Teste | mesmo nome + `.test.ts` | — |
| Fake de teste | `fake-user.repository.ts` | `FakeUserRepository` |
| Repositório Prisma | `user.prisma.ts` | `PrismaUserRepository` |
| Provider concreto | `bcrypt-crypto.provider.ts` | `BcryptCryptoProvider` |
| Módulo / controller Nest | `goals.module.ts`, `goals.controller.ts` | `GoalsModule`, `GoalsController` |
| Teste HTTP | `<modulo>.integration.http` | — |
| Schema Prisma | `prisma/models/<modulo>.model.prisma` | — |
| Página / componente web | `goals.page.tsx`, `goals.component.tsx` | `GoalsPage`, `GoalsComponent` |

## Onde cada coisa mora

- `modules/<modulo>/src/<agregado>/model/`: entidades.
- `modules/<modulo>/src/<agregado>/provider/`: contratos (repositórios e providers).
- `modules/<modulo>/src/<agregado>/usecase/`: casos de uso.
- `modules/<modulo>/test/`: espelha `src/`; fakes em `test/mock/`.
- `packages/shared/src/`: `model/` (entidade base), `usecase/`, `db/` (contratos CRUD), `error/`, `validation/rules/`.
- `apps/backend/src/modules/<modulo>/`: módulo Nest, controller, `*.prisma.ts`, providers concretos.
- `apps/backend/src/db/`: `DbModule` e `PrismaService`. `apps/backend/src/shared/`: erros HTTP, auth, decorators.
- `apps/frontend/src/app/(private)/<modulo>/page.tsx`: rota. `apps/frontend/src/modules/<modulo>/{pages,components}/`: telas.
- `apps/mobile/lib/features/<funcionalidade>/{domain,data,presentation}/`; `apps/mobile/lib/core/` para tema, rotas, cliente HTTP e erros.
- Cada `index.ts` reexporta a pasta; ao criar um arquivo, exporte-o no `index.ts` do nível dele sem remover exports existentes.
