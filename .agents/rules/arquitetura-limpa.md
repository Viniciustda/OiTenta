# Regra: arquitetura limpa

Vale sempre que mexer em `modules/`, `packages/shared` ou `apps/backend`. Adaptação de `docs/0-prompt-base-arquitetura_1.md` (Seções 1, 4 e 5) à estrutura de módulos do curso.

## Fronteira do domínio

- O código em `modules/*/src` e `packages/shared/src` **não importa** `@nestjs/*`, `@prisma/client`, `express`, `bcrypt`, `jsonwebtoken` nem SDK de terceiros (LLM, Firecrawl, Resend...). Única exceção já existente: `uuid` na entidade base do `shared`.
- O domínio só **declara contratos** (`*.repository.ts`, `*.provider.ts`), com apenas os métodos que os casos de uso usam. As implementações ficam em `apps/backend`.
- Portas são **assíncronas** (`Promise<...>`), incluindo criptografia, token, IA e e-mail.
- Casos de uso recebem as dependências **pelo construtor** e implementam `UseCase<In, Out>`.
- Regra de **processo** (posse, unicidade) mora no caso de uso; regra de **cálculo** (motor do plano, gotas, XP, sequência) mora em classe de domínio pura, sem portas e sem async.
- Um módulo de negócio não importa outro diretamente. Enquanto a decisão em `docs/1-passo-a-passo.md` (Decisões em aberto) não for tomada, não crie dependência entre módulos.

## Posse e autenticação

- O dono do recurso vem **sempre do token** (usuário autenticado), **nunca** do body.
- Toda busca, alteração ou exclusão de recurso de usuário recebe o id do usuário na assinatura e filtra por ele, inclusive no `UPDATE`/`DELETE` do adaptador. Os templates CRUD do curso (`findById(id)`) não fazem isso: para recursos de usuário, use repositório `custom` com `userId`.
- Antes de alterar ou excluir, busque o registro escopado pelo usuário logado; se não achar, lance `NotFoundError`.

## Erros

- Erro de negócio vira exceção de domínio (classes de `packages/shared/src/error`). O backend traduz para HTTP de forma centralizada: **401** não autenticado, **403** sem permissão, **404** inexistente para aquele usuário, **409** conflito, 400 entrada inválida, 500 sem detalhes internos.
- Nenhum `req`, `res` ou decorator HTTP dentro do domínio.

## Configuração

- Sem segredo no código. Tudo que varia por ambiente vai para `.env` e é documentado em `.env.example`.
