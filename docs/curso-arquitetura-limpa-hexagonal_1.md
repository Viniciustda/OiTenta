# Curso 1 — Arquitetura Limpa e Hexagonal (Portas e Adaptadores)

> **Fonte:** transcrições das aulas + auditoria do código-fonte completo do projeto do curso (TypeScript/Node, autor do projeto de referência: Leonardo Moura Leitão, conforme `package.json`).
> **Papel deste arquivo:** resumo consolidado do Curso 1, insumo para o documento Master.
> Tudo que está marcado como *[verificado no código]* foi conferido diretamente no projeto final, não apenas nas transcrições.

---

## 1. Visão geral

O curso constrói, do zero, uma API de finanças pessoais (registro/login de usuários + transações com extrato mensal) para ensinar **arquitetura limpa** e **arquitetura hexagonal (portas e adaptadores)** na prática. Inspiração declarada: o livro *Clean Architecture* (Robert C. Martin). O curso **não** cobre design e modelagem de domínio em profundidade (aviso da própria aula 1) — essa lacuna fica para outro curso/fonte.

Trajeto pedagógico (que é, em si, uma lição):

1. **Fundamentos** — o que é arquitetura, como se distingue de design e código.
2. **Conceitos da arquitetura limpa** — entidades, casos de uso, camadas.
3. **Portas e adaptadores** — o mecanismo que materializa a separação.
4. **Exemplo básico** — código deliberadamente acoplado → refatorado com portas.
5. **Aplicação real** — Express + PostgreSQL + JWT + bcrypt, com dois domínios (usuário e transação).

Stack final *[verificado no código]*: TypeScript, Jest (+ts-jest), Express, Knex + pg (PostgreSQL), bcrypt, jsonwebtoken, uuid, dotenv, axios (somente nos testes de API), ts-node-dev em desenvolvimento.

---

## 2. Conceitos-chave

### 2.1 Arquitetura × Design × Código

| Nível | O que é | Custo de mudança |
|---|---|---|
| **Arquitetura** | Decisões de mais alto nível, que afetam a aplicação como um todo; estabelece limites e orientações | Mais caro / mais crítico |
| **Design** | Organização das soluções dentro desses limites | Intermediário |
| **Código** | Implementação | Mais flexível |

- Regra direcional: **decisões de arquitetura influenciam o código; escolhas de código não devem alterar a arquitetura global.**
- Critério prático para "isso é problema arquitetural ou de design?": escopo e custo do impacto.
- Boa arquitetura = a que **minimiza recursos para construir E manter** o sistema ao longo do ciclo de vida.
- Arquitetura serve aos **objetivos de negócio**, não à elegância técnica.
- Acoplamento alto degrada a **produtividade da equipe**; dependências cíclicas são sintoma de responsabilidades mal definidas.

### 2.2 Os habitantes do núcleo (core)

O núcleo tem **três espécies de cidadãos** *[verificado no código]*:

1. **Modelos / DTOs** — dados puros, sem comportamento. Ex.: `Usuario`, `Transacao` (interfaces TS), tipos `Entrada`/`Saida` de cada caso de uso.
2. **Casos de uso** — orquestração: recebem um DTO de entrada, coordenam portas e entidades, devolvem um DTO de saída. Ex.: `RegistrarUsuario`, `LoginUsuario`, `SalvarTransacao`, `ExtratoMensal`.
3. **Lógica de domínio pura** — computação sem portas, sem infraestrutura, sem HTTP. Ex.: `Saldo` (recebe `Transacao[]`, calcula total/receitas/despesas).

Onde moram as regras (fio condutor do curso inteiro):
- Regras de **processo** (unicidade de e-mail, autorização) → **casos de uso**.
- Regras de **cálculo** (saldo) → **classes de domínio puras**, centralizadas num único lugar para nunca serem replicadas entre casos de uso.
- Artefatos de caso de uso (ex.: token) → **saída do caso de uso**, nunca atributo do modelo (`Usuario` não tem campo `token`).

### 2.3 Portas e adaptadores (arquitetura hexagonal)

- **Porta** = interface **definida pela aplicação** (o núcleo é o dono do contrato; a infraestrutura se molda a ele — este é o ponto onde a inversão de dependência de fato acontece).
- **Adaptador** = implementação da porta que toca tecnologia.
- **Drivers (atores primários)** = quem dirige a aplicação: testes, usuário via UI, SPA, app mobile, console, API consumidora. Invocam casos de uso.
- **Driven (atores secundários)** = quem é dirigido por ela: banco, servidor de e-mail, fila, aplicação legada, Elasticsearch, impressora. São invocados pelos casos de uso **através de portas**.
- Nem todo lado exige porta formal: um controller pode chamar o caso de uso diretamente; as portas são mais críticas do lado *driven*.
- Injeção: o caso de uso **exige no construtor** as implementações das portas de que precisa.
- Metáfora do tsunami: o desacoplamento não zera o impacto de uma mudança externa catastrófica — reduz a uma "marolinha". **O negócio não depende de nada; o mundo exterior é que depende do negócio.**
- Criador do padrão: **Alistair Cockburn**. Documentação de referência: site de **Juan Manuel Garrido de Paz** (buscar o nome + "ports and adapters" / "hexagonal architecture").

### 2.4 Glossário de termos ambíguos (mesma palavra, três sentidos)

| Termo | Contexto | Significado |
|---|---|---|
| **Entidade** | Banco de dados | Tabela com registros |
| | DDD | Objeto com identidade única que persiste mesmo quando atributos mudam |
| | Arquitetura limpa | Objeto que incorpora as regras de negócio centrais, independentes de aplicação |
| **Interface** | UI | Tela / interface gráfica |
| | TypeScript | Construto `interface` (contrato de forma, sem runtime) |
| | Hexagonal | Porta na fronteira do núcleo |
| **Adaptador** | Hexagonal | Implementação de uma porta (driven) **ou** tradutor de entrada (driver, ex.: controller) |

Confundir os sentidos compromete a aplicação prática — ex.: modelar a "entidade" da arquitetura limpa como espelho da tabela do banco.

Outros termos: **DTO** (Data Transfer Object — portador de dados puro cruzando fronteira), **core/núcleo** (interior do hexágono), **composition root** (ponto único de fiação — no projeto, o `index.ts`), **upsert** (criar-ou-atualizar decidido pela presença do id), **migração** (esquema do banco como código versionado), **driver/driven** (ver 2.3).

---

## 3. Princípios e boas práticas

1. **A porta tem o formato da necessidade do consumidor, não da API da tecnologia.** A interface nasce com só o que os casos de uso demandam (`Colecao` nasceu só com `inserir`) e cresce quando um caso de uso novo precisa (`buscarPorEmail` chegou com a unicidade/login). É o Interface Segregation na prática — o curso aplica SOLID sem nomear (D e I, principalmente).
2. **A porta também é moldada pela natureza da tecnologia abstraída.** A criptografia com salt gera saídas diferentes para a mesma senha ⇒ a porta precisa de `comparar`, não apenas `criptografar` — comparar strings re-criptografadas não funciona.
3. **Portas de persistência assíncronas desde o início** (`Promise<void>`, `Promise<T | null>`): desenhadas para o adaptador mais restritivo (banco via rede), então até o fake em memória devolve Promise. Erros fluem por exceção.
4. **Quem gera identidade é a aplicação, não o banco** (`Id.gerar()` com UUID) — é o que torna `Promise<void>` viável no inserir.
5. **Violação arquitetural consciente**: a biblioteca `uuid` entra no core (classe `Id` em `core/shared`) — tecnicamente fere a regra de dependência, mas é **deliberada, com custo conhecido e contida num ponto único e trocável**. A diferença entre maturidade e descuido não é nunca violar; é saber que está violando, onde, e por quê. *[verificado no código: `Id` é classe concreta com `static gerar()`, não porta injetada]*
6. **Tudo que varia por ambiente sai do código**: credenciais do banco (`DB_URL`), porta do servidor (`PORTA ?? 3001`), segredo JWT (`JWT_SECRET`), URL da API de teste (`API_URL`) — todos via variáveis de ambiente/dotenv. Segredo JWT nunca no repositório: quem o tem forja tokens válidos.
7. **Teste configurado antes do primeiro código de negócio** (Jest montado na aula de setup). Se a promessa é "núcleo testável unitariamente", o teste existe desde o dia zero.
8. **Pirâmide de testes espelhada em pastas**: `test/core/` (unitários — regras sem infraestrutura) e `test/api/` (integração — fluxo completo pela borda, com axios como driver externo). Unitários provam as regras; integrados provam a fiação.
9. **Adaptadores fake são cidadãos de primeira classe**: `UsuarioEmMemoria` vive em `test/fake/` implementando a mesma porta do adaptador real. O mesmo caso de uso é testado com 3 provedores de criptografia diferentes (`InverterSenha`, `SenhaComEspaco`, `BcryptAdapter`) — a troca de adaptador *demonstrada* em teste. *[verificado no código]*
10. **Testar o caminho feliz E o de erro** (cadastro novo + duplicata rejeitada; rota protegida com e sem token) e **o caso vazio** (extrato de mês sem transações). O teste negativo é o que prova que a proteção existe.
11. **O controller traduz, o núcleo ignora transporte**: exceções de domínio → status HTTP no controller; strings de params → números no controller (`+req.params.ano`). O núcleo fala exceções e DTOs. *[verificado no código: casos de uso não contêm nenhum código HTTP — os 200/201/400/403 moram todos nos controllers]*
12. **Adaptadores são tradutores nas duas direções**: driver traduz HTTP ↔ domínio; driven traduz tabela ↔ domínio (`_praTabela`/`_daTabela`: `idUsuario` camelCase ↔ `usuario_id` snake_case, `Date` ↔ ISO string).
13. **Autorização por construção**: o contrato da porta exige o usuário (`buscarPorMes(idUsuario, ano, mes)`, `buscarPorId(idUsuario, id)`) — impossível escrever a consulta que vaza dados alheios. Segurança como forma da API, não como disciplina.
14. **Interface comum de casos de uso** — `CasoDeUso<IN, OUT> { executar(dto: IN): Promise<OUT> }` *[verificado no código, exatamente assim]* — uniformiza a borda do núcleo e habilita tratamento genérico (fiação, middleware, logging).
15. **Nomenclatura híbrida deliberada**: domínio em português (`RegistrarUsuario`, `ColecaoUsuario`, `executar`, `inserir`), termos técnicos consagrados em inglês (`Controller`, `Adapter`, `Middleware`, sufixo `DB`). Critério: comunicação eficaz da equipe + custo operacional. O que importa é ser **deliberada e consistente**.
16. **Organização de pastas grita o domínio** (Screaming Architecture): dentro do core, pastas por domínio (`usuario/`, `transacao/`), não por tipo técnico.
17. **Fazer funcionar fino, depois engrossar**: caso de uso nasce com stub (dados fictícios), fiação validada de ponta a ponta pela API, só então entra a persistência real. Mesmo espírito do "escreva acoplado → sinta a dor → extraia as portas" do exemplo básico: não criar abstração antes de entender o que varia.
18. **Defesa em profundidade na unicidade**: verificação no caso de uso (erro amigável) + constraint `UNIQUE` no e-mail no banco (garantia final contra corrida consultar-depois-inserir). *[verificado no código: ambas existem]*
19. **Integridade referencial formal**: `usuario_id` com `.references('id').inTable('usuarios').notNullable()` — o banco reforça que toda transação aponta para usuário existente. *[verificado no código]*
20. **Migração defensiva**: verificar existência da tabela antes de criar; `down` com `dropTableIfExists`.
21. **Middleware valida estado atual, não só assinatura**: além de verificar o JWT, busca o usuário no banco — um usuário excluído após emitir token é barrado. Trade-off consciente: uma consulta por requisição (stateless puro vs. verificação com estado — ponto de decisão para o Master).
22. **Senha nunca atravessa a fronteira de saída**: login devolve `{ ...usuario, senha: undefined }`. *[verificado no código]*

---

## 4. Passo a passo prático

### 4.1 A Receita (o movimento que o curso repete 3×: persistência, criptografia, token)

> **1.** Identifique a dependência externa no caso de uso.
> **2.** Declare uma **interface (porta) no core**, com **apenas** os métodos que o núcleo precisa, nomeada pelo domínio.
> **3.** Mova o código concreto para um **adaptador** que implementa a porta.
> **4.** Faça o caso de uso **exigir a porta no construtor** (injeção de dependência).
> **5.** A fiação (quem instancia o quê) sobe para o **composition root** — e para os testes, que compõem seus próprios adaptadores (fakes).
> **6.** Quando a porta crescer, **todos os adaptadores acompanham** (paridade).

Trilha da refatoração em três tempos (exemplo básico): **código acoplado → responsabilidade extraída em classe própria → porta + adaptadores + injeção**. Efeito colateral instrutivo: o teste quebra ao ganhar a injeção — e a correção (o teste monta e injeta as dependências) mostra que o teste é um *driver*.

### 4.2 Do zero ao projeto completo (ordem do curso, generalizável)

1. **Setup**: pasta do projeto, `npm init`, TypeScript + Jest + ts-jest, `tsconfig.json`, pastas de código e teste separadas, ts-node-dev em watch. Teste rodando antes de qualquer negócio.
2. **Primeiro caso de uso acoplado de propósito** (persistência em array, criptografia falsa) — para sentir o que precisa variar.
3. **Extração das portas** pela Receita (persistência → criptografia).
4. **Organização física**: core por domínio + adapters + controllers (estrutura real em 4.3).
5. **Modelo do domínio** como interface TS com opcionais bem pensados (`id` opcional na entrada — quem gera é a aplicação; `senha?` para poder omitir na saída).
6. **Porta específica do domínio** (`Colecao` genérica didática → `ColecaoUsuario` real) — o padrão Repository sem o nome.
7. **Infraestrutura real**: Knex + pg, `knexfile` com `DB_URL` de env, **migração** da tabela (UUID pk, `UNIQUE` no e-mail), adaptador DB implementando a porta.
8. **Regra de unicidade** no caso de uso (`buscarPorEmail` → exceção se existir) + constraint no banco.
9. **Lado driver**: Express (json + urlencoded, `PORTA` de env), controllers finos auto-registrando rotas no construtor `(app, casoDeUso, ...middleware)`, tradução exceção→status.
10. **Autenticação**: porta `ProvedorCriptografia` (`criptografar`/`comparar`) + `BcryptAdapter` (salt 10, hashSync/compareSync); porta `ProvedorToken` (`gerar`/`validar`) + `JwtAdapter` (jsonwebtoken, `expiresIn: '1d'`, segredo via construtor); caso de uso `LoginUsuario` (3 portas injetadas); **middleware** extrai `Bearer` do header `Authorization`, valida token, busca usuário no banco, injeta `req.usuario`, ou responde erro — cadeia de responsabilidade: `rota → [middleware, controller]`.
11. **Interface comum** `CasoDeUso<IN, OUT>` retrofit em todos os casos de uso.
12. **Segundo domínio pela mesma Receita** (transações): modelo com relação (`idUsuario`), migração com FK, porta com métodos escopados por usuário, upsert (`id` presente? atualizar : adicionar), autorização no caso de uso, classe pura `Saldo`, caso de uso de leitura `ExtratoMensal` compondo tudo.
13. **Testes nos dois níveis** o tempo todo: unitários com fakes; integração via axios contra a API de pé (com `.env` de teste no `setupFiles` do Jest).

### 4.3 Estrutura de pastas final *[verificada no código — é a que vale, refinando a proposta inicial `app/portas/adaptadores` das aulas]*

```
src/
  index.ts                  ← composition root: fiação de tudo, único lugar que conhece adaptadores E casos de uso
  controllers/              ← adaptadores DRIVER (conceitualmente adaptadores; pasta própria por clareza)
    RegistrarUsuarioController.ts
    LoginUsuarioController.ts
    SalvarTransacaoController.ts
    ExtratoMensalController.ts
    UsuarioMiddleware.ts    ← fábrica: (portas) => handler Express
  core/                     ← o hexágono; NÃO importa Express, Knex, bcrypt, jsonwebtoken
    shared/
      CasoDeUso.ts          ← interface comum <IN, OUT>
      Id.ts                 ← violação consciente (uuid) contida
    usuario/                ← por DOMÍNIO: modelo + portas + casos de uso juntos
      Usuario.ts  ColecaoUsuario.ts  ProvedorCriptografia.ts  ProvedorToken.ts
      RegistrarUsuario.ts  LoginUsuario.ts
    transacao/
      Transacao.ts  ColecaoTransacao.ts  SalvarTransacao.ts  ExtratoMensal.ts  Saldo.ts
  adapters/                 ← adaptadores DRIVEN
    auth/    InverterSenha.ts  SenhaComEspaco.ts  BcryptAdapter.ts  JwtAdaptar.ts
    db/      conexao.ts  knexfile.js  ColecaoUsuarioDB.ts  ColecaoTransacaoDB.ts  migrations/
test/
  core/     ← unitários (regras, sem infra)
  api/      ← integração (axios contra a API)
  fake/     ← adaptadores de teste (UsuarioEmMemoria)
  data/     ← massa de dados
  util/     ← helpers (ex.: login + header Bearer)
  .env.ts   ← API_URL para os testes (setupFiles do Jest)
```

Nota: as portas **não** ficam numa pasta `portas/` — vivem em `core/<domínio>/` ao lado dos casos de uso que as consomem. A fronteira é lógica (quem importa quem), não uma pasta com esse nome.

### 4.4 A API resultante *[verificada no código]*

| Rota | Auth | Sucesso | Erro |
|---|---|---|---|
| `POST /registrar` | aberta | 201 (sem corpo) | 400 + mensagem |
| `POST /login` | aberta | 200 + `{usuario (sem senha), token}` | 403 + mensagem |
| `POST /transacao` | Bearer | 200 | 400 |
| `POST /transacao/:id` (alterar) | Bearer | 200 | 400 |
| `GET /extrato/:ano/:mes` | Bearer | 200 + `{transacoes, saldo{total,receitas,despesas}}` | 400 |
| (middleware, token ausente/inválido) | — | — | 403 "Token inválido" |

Convenção de sinal: receita = valor positivo; despesa = negativo. Fluxo de auth completo: registrar → login → token (payload: id, nome, email; expira 1d) → `Authorization: Bearer <token>` → middleware valida + busca usuário → `req.usuario` → controller entrega ao caso de uso.

---

## 5. Padrões, ferramentas e exemplos citados

- **Padrões**: Portas e Adaptadores (hexagonal), inversão de dependência, injeção via construtor, Repository (praticado como "Coleção", sem o nome), DTO, cadeia de responsabilidade (middlewares Express), composition root, upsert, fake/test double, migração de esquema, Screaming Architecture (praticada).
- **SOLID**: aplicado sem ser nomeado — D (inversão de dependência, o coração do curso) e I (interfaces mínimas por consumidor) explícitos na prática; S na separação caso de uso / classe de cálculo / adaptador.
- **Ferramentas**: TypeScript, Jest + ts-jest, ts-node-dev, Express, Knex, pg/PostgreSQL, bcrypt, jsonwebtoken, uuid, dotenv, axios (testes).
- **Referências**: *Clean Architecture* (R. Martin); site de Juan Manuel Garrido de Paz sobre ports & adapters; Alistair Cockburn (criador do padrão).
- **Exemplos didáticos valiosos**: dois adaptadores falsos de criptografia (`InverterSenha`, `SenhaComEspaco`) convivendo com o real (`BcryptAdapter`) sob a mesma porta — a prova viva da troca de implementação; stub de dados fictícios antes da persistência real; `.env` para tudo que varia.

---

## 6. Armadilhas e anti-padrões (apontados pelo curso)

1. Deixar escolhas de código alterarem a arquitetura global (inversão da hierarquia).
2. Alto acoplamento e dependências cíclicas entre componentes.
3. Modelar entidades a partir do esquema do banco em vez das regras de negócio.
4. Replicar lógica em múltiplos casos de uso (a lógica compartilhada desce para classe de domínio, não se copia).
5. Interface nascendo do lado da infraestrutura com o núcleo se adaptando a ela (inversão que não inverte nada).
6. Porta espelhando a API completa da tecnologia em vez da necessidade do consumidor.
7. Amarrar a aplicação a uma tecnologia específica (banco, framework, biblioteca de criptografia) sem camada de troca.
8. Modelo de domínio contaminado por artefatos de caso de uso (campo `token` em `Usuario`).
9. Núcleo conhecendo semântica de transporte (status HTTP dentro de caso de uso).
10. Credenciais/segredos hardcoded ou commitados.
11. Abstração criada antes de entender o que varia (o curso ensina a sentir a dor primeiro).
12. Tratar código HTTP/validação de token dentro do núcleo, ou regra de negócio dentro do controller.

---

## 7. Pontos de atenção — auditoria do código real

> Achados da leitura do código-fonte completo. O projeto é didático e excelente no que se propõe; estes pontos são o que **ajustar ao levar o padrão para produção**. Ordenados por severidade.

### 🔴 A1. IDOR no ramo de atualização do upsert (segurança, ALTA)
`SalvarTransacao` verifica apenas `dto.transacao.idUsuario !== dto.usuario.id` — ou seja, que o **payload declara** o usuário logado como dono. No ramo de atualização, **não busca a transação existente para conferir o dono real**, e `ColecaoTransacaoDB.atualizar` filtra `WHERE id` **sem** `usuario_id`. Ataque: `POST /transacao/<id-alheio>` com corpo `{idUsuario: <meu-id>, ...}` passa na verificação, sobrescreve a transação de outro usuário e ainda troca o dono. A correção está a uma linha: no ramo de atualização, `await colecao.buscarPorId(usuario.id, id)` (a porta escopada já existe!) e rejeitar se nulo — e/ou `WHERE id AND usuario_id` no adaptador. Este é o exemplo perfeito de brecha que passa em todo teste de caminho feliz.
Relacionado: o `idUsuario` da transação vem do **corpo da requisição** (controller copia `req.body.idUsuario`); o desenho mais seguro é o controller **ignorar o corpo e usar `req.usuario.id`** — o dono vem do token, nunca do cliente.

### 🟡 A2. `await` faltando no inserir (correção, MÉDIA)
`RegistrarUsuario` linha do `this.colecao.inserir(usuario)` — **sem `await`**. Fire-and-forget: se o INSERT falhar (ex.: corrida no `UNIQUE`), o cliente já recebeu 201 e o erro vira unhandled rejection. Corrigir com `await`; a regra de lint `@typescript-eslint/no-floating-promises` pega isso automaticamente.

### 🟡 A3. Enumeração de usuários no login (segurança, MÉDIA)
Mensagens distintas — `'Usuário não existe.'` vs `'Senha incorreta.'` — permitem descobrir quais e-mails têm conta. Em produção: mensagem única "credenciais inválidas".

### 🟠 A4. Semântica de status HTTP (convenção)
- Login falho e token inválido usam **403**; o canônico para "não autenticado" é **401** (403 = autenticado porém sem permissão).
- Duplicata de e-mail responde **400**; o mais expressivo é **409 Conflict**.
- Controllers usam catch-all (`catch → 400/403`) porque os erros são `Error` genéricos; erros de domínio **tipados** permitiriam mapear cada um ao status certo (e distinguem bug de regra violada).
- Alterar via `POST /transacao/:id` funciona, mas REST canônico usaria `PUT`/`PATCH`; criar responderia 201.

### 🟠 A5. Qualidade dos testes de API (qualidade)
Os testes de `test/api/` exigem servidor + banco de pé (não sobem a aplicação por conta própria), alguns estão `test.skip`, um tem placeholder literal `<transacao-id-aqui>`, e o padrão `try/catch` com `expect` nos dois ramos faz o teste "passar" tanto no 200 quanto no 400. São **roteiros de verificação manual**, não CI. Evolução: subir o app no teste (ex.: supertest) e afirmar um único resultado esperado.

### 🔵 A6. Miudezas verificadas (baixa)
- Migração de usuários: `hasTable('usuario')` (singular) mas a tabela é `usuarios` — a verificação defensiva confere a tabela errada.
- `_daTabela` usa spread e mantém `usuario_id` junto de `idUsuario` no objeto devolvido — o JSON do extrato vaza a representação do banco.
- `decimal` do pg chega como **string**; a coerção `+transacao.valor` ficou dentro de `Saldo` — o lugar dela era o adaptador (`_daTabela` convertendo para number).
- `ProvedorCriptografia` é síncrono; trocar bcrypt por um provedor async (argon2) quebraria a porta. Portas async desde o início (como as Coleções) são mais à prova de futuro.
- `RegistrarUsuario` criptografa **antes** de checar duplicata (custo bcrypt desperdiçado) e retorna o objeto com o hash da senha (o controller descarta, mas a higiene é devolver sem).
- `knexfile.js` com `dotenv path '../../../.env'` relativo ao cwd (frágil) e scripts do `package.json` apontando `knexfile.ts` (extensão errada).
- Sem validação de formato de entrada nos controllers (`req.body` direto; em produção: zod/joi na borda).
- `console.log` como depuração (legítimo em dev; produção pede logging estruturado).
- Timestamps (`created_at`/`updated_at`) e soft delete (`deleted_at`): **discutidos em aula, mas deixados comentados na migração — não implementados** (a porta não tem `excluir`). Ver §8.

> **Uso destes achados**: o prompt-base (documento 2) já embute as correções; o guia de auditoria (documento 3) os usa como smells a procurar em projetos reais.

---

## 8. ⚠️ PENDÊNCIAS — temas que o curso NÃO cobriu (buscar em outras fontes)

> Registro combinado ao longo do curso. Nenhuma aula respondeu; confirmado também no código.

### 8.1 Deploy ❗
**Como publicar um projeto com essa arquitetura ficou sem resposta.** O `package.json` tem `build: tsc` mas nenhum script `start` de produção; não há Dockerfile, CI, nada de infraestrutura de publicação. Tranquilização de uma linha: essa arquitetura organiza o *código-fonte* — o projeto continua sendo uma aplicação TypeScript comum de buildar (`tsc` → `dist/`) e subir (`node dist/index.js` + Postgres + env vars). Estudar: build de produção, processo (PM2/systemd/containers), Docker + docker-compose (app + banco), migrações no deploy, plataformas (Railway/Render/Fly/AWS), CI/CD. *(Pode ser desenvolvido como apêndice do Master.)*

### 8.2 Fundamentos de banco de dados e migrations ❗
O curso **usa** migrations (Knex) na prática — criar tabela, evoluir esquema com dados existentes, rollback — mas não aprofunda o funcionamento. Estudar: como a tabela de controle (`knex_migrations`) funciona, up/down e reversibilidade, migrações em equipe/produção, seeds, transações DDL, e os fundamentos SQL correlatos (índices, constraints, planos). *(Idem — candidato a apêndice do Master.)*

---

## 9. Ganchos para o documento Master

1. **A Receita (§4.1)** é o coração exportável deste curso — candidata a espinha dorsal do capítulo de implementação do Master.
2. **SOLID nunca nomeado**: D e I aplicados na prática; se outro curso cobrir SOLID formalmente, costurar aqui (a aula 5 chegou a anunciar SOLID e o curso seguiu por inversão de dependência — lacuna parcial).
3. **Design/modelagem de domínio (DDD)** explicitamente fora do escopo (aviso da aula 1) — a definição de entidade do DDD entrou só como contraste; se houver curso de DDD/modelagem, encaixa na lacuna anunciada.
4. **Pendências §8** (deploy, banco/migrations) — resolver via outro curso ou apêndices próprios.
5. **Pontos de decisão** a consolidar no Master como "escolhas com trade-off" (não regras): validação de token stateless vs. com consulta ao banco; soft delete vs. exclusão física; onde converter representações (adaptador vs. domínio); nomenclatura pt/en; upsert único vs. criar/atualizar separados; erros genéricos vs. tipados.
6. **Temas de produção que o curso tangenciou** e o Master pode aprofundar: validação de entrada na borda, logging estruturado, concorrência (a corrida do consultar-depois-inserir), testes E2E automatizados, expiração/refresh de tokens.
7. **Vocabulário compartilhado**: o glossário (§2.4) deve crescer a cada curso — "serviço", "modelo", "repositório" são candidatos a colisão com os próximos cursos.
8. **Contraste esperado com outros cursos**: se algum curso usar camadas tradicionais (MVC, N-tier) ou outro framework, o ponto de costura é comparar com o hexágono — o que muda é a direção das dependências, não a existência de camadas.
