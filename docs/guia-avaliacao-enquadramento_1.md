# Guia de Avaliação e Enquadramento — Arquitetura Limpa e Hexagonal em projetos existentes

> **Para que serve:** dado um projeto real já criado, (1) diagnosticar em que medida ele segue a arquitetura do curso (portas e adaptadores / arquitetura limpa) e (2) traçar o roteiro incremental para enquadrá-lo. Funciona para qualquer stack de backend; os exemplos usam o vocabulário do curso (TypeScript/Node).
> **Princípio-guia da auditoria:** a arquitetura não é a existência de pastas com certos nomes — é a **direção das dependências**. Um projeto pode ter pasta `core/` e estar todo acoplado; outro pode nem usar esses nomes e estar limpo. Audite imports, não rótulos.

---

## Parte 1 — Diagnóstico

### 1.1 O teste de 10 minutos (antes de qualquer checklist)

1. **Ache o candidato a núcleo** (regras de negócio): pastas tipo `core/`, `domain/`, `services/`, `usecases/` — ou, na ausência, onde vivem os `if` de negócio.
2. **Grep de imports no candidato a núcleo** procurando nomes de tecnologia: `express`, `fastify`, `knex`, `prisma`, `pg`, `mongoose`, `axios`, `bcrypt`, `jsonwebtoken`, `req`/`res`, SQL cru.
   - Zero ocorrências → forte sinal de conformidade. Siga para o checklist.
   - Ocorrências espalhadas → o núcleo não existe de fato; o projeto está em algum nível de acoplamento (ver 1.4).
3. **A pergunta de ouro:** *"Consigo testar a regra de negócio mais importante deste sistema sem subir banco, rede ou servidor HTTP?"*
   - Sim, e há testes assim → conformidade prática, mesmo que a nomenclatura seja outra.
   - Não → o enquadramento (Parte 2) tem trabalho a fazer, e a resposta indica exatamente onde dói.
4. **Os dois experimentos mentais do curso:**
   - *Trocar o banco* (Postgres → Mongo, ou → memória): quantos arquivos mudam? Resposta certa: só adaptadores + composition root.
   - *Trocar o framework HTTP*: idem — só controllers + composition root.

### 1.2 Checklist de auditoria por camada

Marque cada item: ✅ conforme · ⚠️ parcial · ❌ não conforme.

**A. Núcleo (core)**
- [ ] Existe uma região de código identificável só com regras de negócio (modelos, casos de uso, cálculo).
- [ ] Ela não importa framework, driver de banco, biblioteca de criptografia/token, nem arquivos de adaptadores/controllers.
- [ ] Casos de uso têm forma uniforme (ex.: `executar(dto)`) e uma responsabilidade cada.
- [ ] Regras de cálculo estão centralizadas em classes/funções puras (não duplicadas em N lugares).
- [ ] Modelos de domínio não carregam artefatos de caso de uso (token, campos de sessão) nem de transporte.
- [ ] Nenhum status HTTP / `req` / `res` dentro do núcleo.
- [ ] Identidade gerada pela aplicação (ou, se pelo banco, que seja decisão consciente e isolada no adaptador).

**B. Portas (interfaces)**
- [ ] Toda dependência externa do núcleo passa por interface declarada **no núcleo** (o núcleo é dono do contrato).
- [ ] As interfaces têm o formato da necessidade dos casos de uso, não a API completa da tecnologia (smell: porta com 30 métodos espelhando o ORM).
- [ ] São assíncronas onde a tecnologia real pode ser assíncrona.
- [ ] Consultas de recursos por usuário exigem o id do usuário na assinatura (autorização por construção).

**C. Adaptadores driven (banco, auth, integrações)**
- [ ] Cada tecnologia externa tem seu adaptador implementando uma porta.
- [ ] O adaptador converte representações nas duas direções (colunas ↔ atributos, tipos), sem vazar formato de banco para o domínio (smell: snake_case ou strings numéricas do driver aparecendo em respostas da API).
- [ ] Filtros de posse aplicados também em UPDATE/DELETE (`WHERE id AND usuario_id`), não só em SELECT.
- [ ] Esquema versionado por migrations reversíveis; constraints de negócio no banco (UNIQUE, FKs, NOT NULL) duplicando as verificações do caso de uso (defesa em profundidade).

**D. Adaptadores driver (controllers/handlers)**
- [ ] Controllers finos: traduzem entrada (body/params → DTO), invocam o caso de uso, traduzem saída (resultado/exceção → status + JSON). Zero regra de negócio.
- [ ] Erros de domínio tipados mapeados a status coerentes (401 não autenticado, 403 sem permissão, 404 não encontrado, 409 conflito); erro desconhecido → 500 sem vazar interno.
- [ ] Validação de formato na borda; regras de negócio não migram para cá.
- [ ] Dono de recurso extraído do token (`req.usuario`), nunca do corpo da requisição.
- [ ] Auth em middleware/camada própria, componível por rota, que valida token E existência atual do usuário.

**E. Composition root (fiação)**
- [ ] Existe um ponto único que instancia adaptadores, injeta nos casos de uso e registra rotas.
- [ ] É o único lugar (fora dos testes) que conhece adaptadores concretos e casos de uso ao mesmo tempo.
- [ ] Configuração via variáveis de ambiente; nenhum segredo no código/repositório.
- [ ] Casos de uso nunca instanciam suas dependências com `new` internamente (smell: `new Repositorio()` dentro do caso de uso).

**F. Testes**
- [ ] Unitários do núcleo rodam sem infraestrutura, usando fakes que implementam as portas reais.
- [ ] Integração cobre o fluxo completo pela borda, sucesso E falha, incluindo os negativos de segurança (sem token; usuário A × recurso de B).
- [ ] Testes afirmam um único resultado esperado (smell: try/catch aceitando 200 ou 400).
- [ ] Casos de borda cobertos (listas vazias, não encontrado).

### 1.3 Tabela de smells → diagnóstico

| Smell observado | O que revela | Onde atacar (Parte 2) |
|---|---|---|
| `import knex/prisma/mongoose` dentro de service/regra de negócio | Persistência acoplada ao núcleo | Fase 3 |
| SQL/query builder no meio de um `if` de negócio | Idem, grau máximo | Fase 3 |
| `res.status(...)` dentro da regra de negócio, ou regra dentro do handler | Fronteira driver furada | Fase 2 |
| Caso de uso instancia dependências com `new` internamente | Sem injeção → intestável isolado | Fase 3 |
| Interface declarada na pasta de infra, núcleo importando de lá | Inversão que não inverte (dono errado do contrato) | Fase 3 |
| Porta com dezenas de métodos espelhando o ORM | Contrato moldado pela tecnologia | Fase 3 (redesenhar pela demanda) |
| Modelo de domínio = espelho 1:1 da tabela, com nomes de coluna | Entidade modelada pelo banco | Fase 3/4 |
| Mesma regra de cálculo copiada em 2+ lugares | Falta classe de domínio pura | Fase 4 |
| Testes de regra de negócio exigem banco/servidor de pé | Núcleo intestável isolado — o sintoma-síntese | Fases 2–4 |
| `idUsuario`/dono vindo do body; UPDATE `WHERE id` sem escopo de usuário | IDOR (a brecha do próprio projeto do curso) | Fase 5 — **prioridade imediata, é bug de segurança independente de arquitetura** |
| Segredos hardcoded/commitados | — | Fase 1 — imediato |
| Chamada async de gravação sem `await` | Erros silenciosos (o `await` faltante do curso) | Fase 1 — lint resolve |
| Alterações de esquema feitas na mão, sem migration | Esquema não versionado | Fase 1 |
| Mensagens de login distinguindo "não existe" × "senha errada" | Enumeração de usuários | Fase 5 |

### 1.4 Régua de veredito

- **Nível 0 — Acoplamento total:** regras, SQL e HTTP entrelaçados nos mesmos arquivos (o "código do exemplo básico antes da refatoração").
- **Nível 1 — Camadas de rótulo:** existem pastas (controllers/services/repositories), mas o "núcleo" importa tecnologia e/ou as interfaces pertencem à infra. MVC típico.
- **Nível 2 — Núcleo parcial:** injeção de dependência existe; parte das dependências atrás de portas; fronteiras vazam em pontos localizados (status no service, query no caso de uso).
- **Nível 3 — Hexagonal funcional:** núcleo limpo, portas do lado de quem consome, adaptadores trocáveis, composition root único; faltam refinamentos (erros tipados, testes negativos, conversões no adaptador). *(O projeto do curso está aqui.)*
- **Nível 4 — Hexagonal maduro:** nível 3 + erros de domínio tipados e mapeados, segurança de posse testada, validação na borda, testes de integração autônomos (sobem a aplicação), lint de fronteira automatizado.

O objetivo do enquadramento é chegar ao nível 3; o 4 é o polimento de produção.

---

## Parte 2 — Roteiro de enquadramento incremental

> **Estratégia:** a mesma trilha que o curso usou para ensinar — *sentir o acoplamento → extrair responsabilidade → declarar a porta → mover para adaptador → injetar* — aplicada módulo a módulo, **sem big-bang e sem parar entregas**. Cada fase termina com o sistema funcionando e testes passando. Faça um domínio piloto de ponta a ponta (Fases 2–5) antes de replicar aos demais.

### Fase 0 — Rede de segurança (não pule)
- Garanta rodar o projeto e alguma verificação de comportamento atual. Sem teste nenhum? Escreva primeiro **testes de caracterização** pela borda (chamadas HTTP reais gravando o comportamento atual, mesmo o imperfeito) — são eles que provam que a refatoração não quebrou nada.
- Congele: refatoração estrutural e mudança de comportamento nunca no mesmo commit.

### Fase 1 — Higiene imediata (barata, alto retorno, sem tocar arquitetura)
- Segredos e config → variáveis de ambiente + `.env.example`; segredo commitado é segredo vazado: **rotacione**.
- Lint com `no-floating-promises` (caça os `await` faltantes) e corrija o que apontar.
- Esquema do banco → migrations versionadas (baseline do estado atual + evoluções dali em diante).
- Escolha e documente as convenções-alvo (nomenclatura, status codes) num ADR curto.

### Fase 2 — Espremer as bordas (sem criar portas ainda)
- **Controllers finos:** toda regra de negócio que vive em handlers desce para classes de caso de uso (`executar(dto)`); o handler vira tradução pura. Introduza a interface comum `CasoDeUso<IN, OUT>`.
- **HTTP sai do miolo:** nenhum `req/res/status` abaixo do controller. Onde o service retornava `{status: 400}`, passe a lançar erro de domínio e traduza na borda.
- Resultado: o negócio está reunido em casos de uso — ainda acoplados à infra por dentro, mas com fronteira de entrada limpa.

### Fase 3 — A Receita, dependência por dependência (o coração do enquadramento)
Para **cada** tecnologia que o caso de uso toca diretamente (banco primeiro, depois criptografia/token/e-mail/HTTP externo):
1. Liste o que os casos de uso **realmente usam** dela.
2. Declare a porta **no núcleo**, com só esses métodos, nomeada pelo domínio (`ColecaoPedido`, `ProvedorToken`), assíncrona, com consultas escopadas por usuário onde couber.
3. Mova o código concreto para um adaptador que implementa a porta (incluindo conversões tabela↔domínio, que talvez hoje vazem).
4. Troque o acesso direto por campo injetado via construtor.
5. Suba a instanciação para o composition root (crie-o se não existir: um `index.ts` que monta tudo).
6. Escreva o **fake em memória** da porta e converta/read os testes do caso de uso para rodar com ele — este é o critério de pronto: *o teste do caso de uso roda sem a tecnologia real*.

Armadilhas conhecidas (vindas do curso): a porta nasce do consumidor, não da tecnologia (não "envelopar o ORM"); paridade — quando a porta crescer, todos os adaptadores acompanham; violações conscientes (ex.: gerador de UUID no core) são permitidas se contidas e documentadas.

### Fase 4 — Destilar o domínio
- Cálculo duplicado ou embutido em casos de uso → classes de domínio puras (o `Saldo` do curso), testadas com dados em memória.
- Modelos: remova artefatos de caso de uso e de banco; opcionais refletindo o ciclo de vida real (id antes de existir); a conversão de representação mora no adaptador.
- Erros: adote as classes de domínio tipadas em todo o núcleo; mapeamento central na borda.

### Fase 5 — Segurança de posse e semântica (as correções que o próprio projeto do curso precisaria)
- Dono de recurso **sempre do token**, nunca do body.
- Atualização/exclusão: buscar o registro escopado pelo usuário logado antes de gravar + `WHERE` com escopo no adaptador (anti-IDOR).
- Login com mensagem única de credenciais inválidas; 401/403/404/409 conforme convenção.
- **Testes negativos** para cada um (sem token; A × recurso de B; duplicata) — são a prova de que a fase aconteceu.

### Fase 6 — Consolidação
- Testes de integração autônomos (sobem a própria aplicação — supertest ou equivalente), um resultado esperado por teste.
- Espelhe a estrutura-alvo de pastas (mover arquivos por último — é a parte cosmética; imports certos importam mais que pastas certas).
- Guarda de fronteira automatizada no CI (lint de imports proibidos em `core/`, ex.: dependency-cruiser ou eslint no-restricted-imports).
- Rode o checklist da Parte 1 de novo e registre o nível alcançado; replique o piloto aos demais módulos pela mesma sequência.

### Ordem de prioridade quando não der para fazer tudo
1. Fase 1 (higiene — sobretudo segredos) e o item IDOR da Fase 5: são risco real hoje, independem de arquitetura.
2. Fases 2–3 no módulo que mais muda (é onde o desacoplamento paga aluguel primeiro).
3. O resto módulo a módulo, guiado por: *"o que estou sempre precisando alterar e tenho medo de tocar?"*

### O que NÃO fazer
- Big-bang de reescrita ("parar tudo e migrar para hexagonal").
- Criar portas especulativas para tudo antes de qualquer caso de uso demandar (o curso ensina: sinta a dor primeiro; abstração antecipada é a mesma doença do acoplamento, invertida).
- Renomear pastas para `core/adapters/controllers` sem mudar imports — rótulo não é arquitetura (nível 1 disfarçado de 3).
- Refatorar sem rede de segurança (Fase 0).
- Perseguir pureza absoluta: violações conscientes, contidas e documentadas são parte do padrão maduro.
