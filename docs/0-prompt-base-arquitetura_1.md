# Prompt-base — Criar um sistema do zero com Arquitetura Limpa e Hexagonal

> **Como usar:** preencha os campos `[ENTRE COLCHETES]` da Seção 0, ajuste o que quiser nas convenções, e cole o prompt inteiro (da linha "---INÍCIO DO PROMPT---" em diante) numa IA de código (Claude Code, por exemplo) — ou use como checklist se for você quem vai codar. O prompt reproduz a arquitetura do curso (Leonardo Leitão / Cod3r) **já com as correções dos pontos de atenção** identificados na auditoria do projeto original (await, IDOR, 401/409, dono vindo do token, portas async).
> Blocos marcados como **[OPCIONAL]** podem ser removidos se o sistema não precisar deles.

---INÍCIO DO PROMPT---

Construa um sistema backend completo seguindo **arquitetura limpa com portas e adaptadores (hexagonal)**, conforme a especificação abaixo. Siga a ordem de implementação da Seção 6. Não avance uma etapa sem os testes da etapa anterior passando.

## 0. O sistema a construir

- **Domínio/propósito:** [DESCREVA O SISTEMA — ex.: "gestão de reservas de quadras esportivas"]
- **Entidades principais e atributos:** [ex.: "Usuario (id, nome, email, senha); Reserva (id, quadra, data, horário, idUsuario)"]
- **Casos de uso:** [LISTE — ex.: "RegistrarUsuario, LoginUsuario, CriarReserva, CancelarReserva, ListarReservasDoMes"]
- **Regras de negócio específicas:** [ex.: "não pode haver duas reservas na mesma quadra e horário; usuário só cancela a própria reserva"]
- **Stack:** [PADRÃO DO CURSO: TypeScript + Express + Knex/PostgreSQL + Jest + bcrypt + jsonwebtoken + uuid + dotenv — troque se quiser; a arquitetura não depende da stack]
- **Autenticação:** [SIM/NÃO — se SIM, mantenha as seções de auth; se NÃO, remova-as]
- **Idioma do domínio no código:** [português (padrão do curso) / inglês]

## 1. Regras arquiteturais invioláveis

1. O código se organiza em três regiões: **`core/`** (o hexágono: modelos, portas, casos de uso, lógica de domínio pura), **`adapters/`** (implementações driven: banco, criptografia, token, e-mail, etc.), **`controllers/`** (adaptadores driver: HTTP) — mais um **composition root** (`index.ts`) que é o único arquivo que conhece adaptadores E casos de uso ao mesmo tempo.
2. **`core/` não importa NADA de fora do próprio core**: nenhum framework, driver de banco, biblioteca de criptografia/token, nada de Express/Knex/bcrypt/jsonwebtoken, e nenhum arquivo de `adapters/` ou `controllers/`. As dependências apontam para dentro. (Exceção única e deliberada permitida: um gerador de ID — ver regra 8.)
3. Toda dependência externa do núcleo entra por **porta**: uma interface declarada em `core/`, **de propriedade do núcleo**, contendo **apenas os métodos que os casos de uso realmente consomem** — nunca a API completa da tecnologia. Adaptadores implementam as portas; o núcleo jamais conhece os adaptadores.
4. Casos de uso recebem **todas as suas portas via construtor** (injeção de dependência) e implementam a interface comum:
   ```ts
   export default interface CasoDeUso<IN, OUT> {
       executar(dto: IN): Promise<OUT>
   }
   ```
5. **Portas são assíncronas** (`Promise<...>`) — todas, incluindo criptografia e token — para que a troca de adaptador (sync→async) nunca quebre o contrato. Erros fluem por exceção.
6. Entrada e saída de caso de uso são **DTOs** (types/interfaces puros). Artefatos de caso de uso (ex.: token) vivem na **saída do caso de uso**, nunca como atributo do modelo de domínio.
7. Regras de negócio de **processo** (unicidade, autorização, validações de negócio) moram nos **casos de uso**; regras de **cálculo** moram em **classes de domínio puras** (sem portas, sem async, instanciáveis com dados em memória), centralizadas para nunca serem duplicadas.
8. Identidade é gerada **pela aplicação** (UUID), via classe única `core/shared/Id.ts` (`Id.gerar()`). Esta é a única violação de dependência tolerada no core — deliberada, contida e trocável; documente-a com um comentário.
9. O núcleo **não conhece HTTP**: nenhum status code, header, req/res dentro de `core/`. Controllers traduzem: DTO ← body/params/query; exceção de domínio → status code.
10. **Tudo que varia por ambiente vem de variáveis de ambiente** (dotenv): porta do servidor, string de conexão do banco, segredo de token. Nada de segredo/credencial no código ou no repositório; crie um `.env.example` documentando as chaves (`PORTA`, `DB_URL`, `JWT_SECRET`).

## 2. Estrutura de pastas

```
src/
  index.ts                      ← composition root
  controllers/
    <CasoDeUso>Controller.ts    ← um por caso de uso exposto
    UsuarioMiddleware.ts        ← [se houver auth] fábrica de middleware
  core/
    shared/
      CasoDeUso.ts
      Id.ts
      erros.ts                  ← classes de erro de domínio
    <dominio-1>/                ← ex.: usuario/
      <Modelo>.ts  <portas>.ts  <casos de uso>.ts
    <dominio-2>/                ← ex.: transacao/, com classes de cálculo puras se houver
  adapters/
    auth/                       ← [se houver auth] BcryptAdapter.ts, JwtAdapter.ts
    db/
      conexao.ts  knexfile.js  Colecao<X>DB.ts  migrations/
test/
  core/                         ← unitários: casos de uso com fakes + classes de cálculo
  api/                          ← integração: HTTP de ponta a ponta
  fake/                         ← adaptadores em memória implementando as portas reais
  data/                         ← massa de teste
  util/                         ← helpers (ex.: login → header Bearer)
```

Organize `core/` por **domínio** (nomes do negócio), não por tipo técnico. As portas ficam dentro da pasta do seu domínio, ao lado dos casos de uso — a fronteira é lógica (quem importa quem), não uma pasta chamada "portas".

## 3. Convenções

- **Nomenclatura híbrida** (padrão do curso, se domínio em português): conceitos do negócio no idioma do domínio (`RegistrarUsuario`, `ColecaoReserva`, `executar`, `inserir`); termos técnicos consagrados em inglês (`Controller`, `Adapter`, `Middleware`, sufixo `DB`). Seja consistente.
- **Persistência**: porta nomeada `Colecao<Entidade>` com métodos moldados pelos casos de uso. Toda consulta que retorna dados de um usuário **exige o id do usuário como parâmetro** (`buscarPorX(idUsuario, ...)`) — autorização por construção.
- **Banco**: tabelas em snake_case; adaptador converte representações nas duas direções (`_praTabela`/`_daTabela`): camelCase ↔ snake_case, tipos de data, e **numéricos que o driver devolve como string convertidos para number no adaptador** (nunca deixe a coerção vazar para o domínio).
- **Migrations** (Knex): esquema como código versionado; UUID como PK; `NOT NULL` no que é obrigatório; **UNIQUE** em campos de unicidade de negócio (defesa em profundidade com a verificação do caso de uso); **foreign keys formais** (`.references().inTable()`) nas relações; verificação defensiva de existência **com o nome correto da tabela**; `down` reversível. Scripts npm: `migrate:make`, `migrate:up`, `migrate:down`.
- **Erros**: classes de erro de domínio nomeadas (ex.: `UsuarioJaExiste`, `CredenciaisInvalidas`, `NaoAutorizado`, `NaoEncontrado`) em `core/shared/erros.ts`. Controllers mapeiam cada classe ao status certo; erro desconhecido → 500 sem vazar detalhes internos.
- **Status codes**: 201 criação; 200 leitura/atualização; **401** não autenticado (token ausente/inválido, login falho); **403** autenticado sem permissão; **404** recurso não encontrado (ou inexistente para aquele usuário); **409** conflito (duplicata); 400 entrada malformada.
- **Async correto**: `await` em TODA chamada de porta — ative `@typescript-eslint/no-floating-promises` para garantir.
- **Validação de formato na borda**: controllers validam presença/formato dos campos do body/params antes de montar o DTO (manualmente ou com zod). Regras de NEGÓCIO continuam no caso de uso.

## 4. Autenticação [remova esta seção se o sistema não tiver auth]

- Porta `ProvedorCriptografia { criptografar(senha): Promise<string>; comparar(senha, hash): Promise<boolean> }` — a comparação é responsabilidade do provedor (salt torna re-criptografar inútil). Adaptador: bcrypt (salt ≥ 10).
- Porta `ProvedorToken { gerar(payload): Promise<string>; validar(token): Promise<object> }`. Adaptador: jsonwebtoken com expiração explícita (ex.: `1d`) e **segredo recebido no construtor** (injetado do env no composition root).
- `LoginUsuario`: busca por e-mail, compara senha, e em falha lança **um único erro** `CredenciaisInvalidas` (mensagem idêntica para "não existe" e "senha errada" — sem enumeração de usuários). Saída: `{ usuario, token }` com **a senha removida** do usuário; o hash jamais atravessa a fronteira de saída de nenhum caso de uso.
- `RegistrarUsuario`: verifica duplicata **antes** de criptografar; lança `UsuarioJaExiste` (→ 409); `await` no inserir.
- Middleware (fábrica que recebe `ColecaoUsuario` + `ProvedorToken` e retorna handler): extrai `Bearer` do header `Authorization`; valida o token; **busca o usuário no banco** (usuário excluído após emitir token é barrado); anexa `req.usuario`; qualquer falha → **401**. Rotas protegidas = `rota → [middleware, controller]`.
- **O dono de qualquer recurso vem SEMPRE de `req.usuario` (do token) — NUNCA do corpo da requisição.** O controller não copia `idUsuario` do body.

## 5. Segurança de posse (obrigatório em todo recurso pertencente a usuário)

Em **toda** operação de leitura, atualização ou exclusão de um recurso que pertence a um usuário:
1. A porta exige `idUsuario` na assinatura e o adaptador filtra por ele (`WHERE id AND usuario_id` — inclusive no UPDATE/DELETE).
2. No caso de uso de atualização/exclusão, **buscar o registro existente escopado pelo usuário logado** (`buscarPorId(usuarioLogado.id, id)`) e rejeitar com `NaoEncontrado`/`NaoAutorizado` se nulo — **antes** de gravar. Nunca confie no dono declarado no payload.
3. Teste negativo obrigatório: usuário A tentando ler/alterar recurso de usuário B deve falhar.

(Este é o anti-IDOR — a brecha existente no projeto original do curso, aqui corrigida por especificação.)

## 6. Ordem de implementação (siga estritamente)

1. **Setup**: npm init, TypeScript, Jest+ts-jest configurados e rodando (um teste trivial passa), `tsconfig.json`, ts-node-dev (`dev`), estrutura de pastas, `.env.example`, `.gitignore` (com `.env` e `node_modules`).
2. **`core/shared`**: `CasoDeUso.ts`, `Id.ts`, `erros.ts`.
3. **Primeiro domínio, de dentro para fora**: modelo → porta(s) → caso(s) de uso → **testes unitários com fakes** (`test/fake/` implementando as portas) cobrindo caminho feliz, erros de negócio e casos de borda (vazios). Nada de banco ainda.
4. **[se houver auth]** Portas e casos de uso de registro/login com fakes de criptografia e token nos testes; depois adaptadores reais (bcrypt, JWT).
5. **Infraestrutura de banco**: knexfile (env), conexão, migrations do domínio, adaptador `Colecao<X>DB` implementando a mesma porta dos fakes.
6. **Lado driver**: Express no composition root (json/urlencoded, PORTA de env), controllers finos, [middleware de auth], mapeamento erro→status.
7. **Testes de integração** (`test/api/`): o teste **sobe a aplicação** (supertest ou equivalente — não exigir servidor de pé manualmente), cobre cada rota no sucesso E na falha (409 na duplicata, 401 sem token, 404/403 no recurso alheio), e afirma **um único resultado esperado por teste** (nunca try/catch aceitando os dois ramos).
8. **Demais domínios**: repita 3→7 pela mesma receita. Lógica de cálculo em classes puras testadas com arrays em memória.
9. **Fechamento**: `build` (tsc) + script `start` (`node dist/index.js`); lint com `no-floating-promises`; README curto com setup, env vars, migrações e como rodar testes.

## 7. Critérios de aceitação (autoverificação final)

- [ ] `grep` em `src/core/` não encontra import de express/knex/pg/bcrypt/jsonwebtoken nem de `adapters/`/`controllers/` (única exceção: uuid em `Id.ts`).
- [ ] Todo caso de uso implementa `CasoDeUso<IN, OUT>` e recebe portas só via construtor.
- [ ] Testes unitários do core rodam **sem banco e sem servidor** (só fakes).
- [ ] Trocar um adaptador (ex.: coleção em memória ↔ DB) não altera **nenhuma linha** do core.
- [ ] Nenhum status code, `req` ou `res` dentro de `core/`.
- [ ] Nenhum segredo hardcoded; `.env.example` completo; `.env` no `.gitignore`.
- [ ] Teste negativo de posse (usuário A × recurso de B) existe e passa para cada recurso.
- [ ] Todas as chamadas de porta têm `await`; lint sem floating promises.
- [ ] Rotas respondem os status da convenção (§3), incluindo 409/401/404.
- [ ] Migrations sobem do zero (`migrate:up` em banco vazio) e revertem (`migrate:down`).

---FIM DO PROMPT---

## Apêndice: variações rápidas

- **Sem autenticação**: remova §4, o middleware, e a exigência de `idUsuario` em §5 se não houver recursos por usuário.
- **Outra stack** (NestJS, Fastify, Prisma, MongoDB...): mantenha §§1, 5, 6, 7 intactos — são independentes de stack. Ajuste §§2–4: em NestJS, os módulos/providers fazem o papel do composition root (injeção pelo container); com Prisma/Mongo, o adaptador muda mas a porta `Colecao<X>` continua idêntica. A prova de que a arquitetura está certa é justamente essa seção sobreviver à troca.
- **Front/mobile consumindo**: são novos *drivers* — nada muda no core; cada um conversa com os mesmos endpoints.
