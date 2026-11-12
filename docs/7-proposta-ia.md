# Proposta: como a IA entra no projeto

**Status:** **aprovada em 12/11/2026** (`docs/2-decisoes-mvp.md`, IA1–IA7), com dois ajustes: prompts em `.prompt.ts` (IA5) e o orçamento e a reserva no orquestrador, não num decorador (`docs/3` §2.6). Proposta original de 11/11/2026. Os pontos em aberto viraram [DECIDIR] no `afazeres.md`, seção "Backend", subseção "Proposta de IA (11/11/2026)".

**Leia antes:** `docs/2-decisoes-mvp.md` (4b, 4f, 4h, 5.8), `docs/3-modelagem-dominio.md` (§2 e §6), `docs/4-contrato-api.md`.

**Siglas:** as mesmas dos docs 2, 3 e 4 (D = decisões, F = fluxos, UC, W = tela web, M = tela mobile, P = decisão da Etapa A).

---

## 0. Resumo

1. **Só o backend chama a IA**, por uma porta neutra no domínio (`GoalAssistantProvider`, em `goals`), com os dois métodos da decisão 4f: `parseGoal` e `suggestSteps`.
2. **Um endpoint só para o rascunho:** `POST /goals/assistant/draft` recebe o texto e devolve título, prazo, requisitos, campos faltando e etapas com micro-passos. Não grava nada; quem grava continua sendo o `POST /goals`.
3. **Três implementações no backend:** `rules` (motor de regras, sem IA, determinístico), `openai-compatible` (`fetch`, sem SDK, sem dependência nova) e um decorador de **fallback**.
4. **A troca para a IA real é só `.env`** (`AI_PROVIDER`, `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`). Web e mobile não sabem qual motor respondeu, a não ser pelo campo informativo `engine`.
5. **A saída da IA passa por duas validações:** formato (no adaptador) e regras do domínio (numa classe pura em `goals`, que vale para qualquer motor: título até 120, estimativa múltipla de 15 etc.).
6. **Chat sem estado no backend.** No MVP, prazo faltando não gera pergunta: o rascunho volta com `missingFields: ['deadline']` e a tela de etapas mostra o campo vazio (prazo é opcional, P3).
7. **O `POST /goals` precisa aceitar `source` e `aiEstimatedMinutes`.** Hoje o `CreateGoal` grava sempre `source: 'manual'` e `aiEstimatedMinutes: null`, o que contraria a 4f.
8. **O mobile já tem a porta certa** (`GoalAssistantRepository`). Falta a versão HTTP e campos no `GoalSuggestion`. **O web não tem fluxo de IA nenhum**: as telas W27, W29 e a W30 preenchida precisam ser feitas uma vez.
9. Plano em 12 tarefas com TDD, mais a tarefa 0 de documentação (§g). Ao fim da tarefa 5, os fluxos podem ser testados de ponta a ponta com o motor de regras.
10. Para sexta, o time decide fornecedor, modelo, chave, custo, privacidade e política de falha (§8).

---

## 1. O que o código e os docs já dizem (constatações)

| # | Constatação | Onde | Consequência para a proposta |
|---|---|---|---|
| 1 | A 4f fixa duas chamadas (`parseGoal`, `suggestSteps`), confirmação sempre do usuário, formulário manual se a IA falhar, `aiEstimate` e `estimate` guardados separados e o motor do calendário **nunca** usa IA | D 4f | A proposta mantém tudo isso |
| 2 | A porta da IA mora em `goals` e "será definida na Fase 7" | docs/3 §6 | Esta proposta a define |
| 3 | `Goal.source` (`manual \| ai`) e `Step.aiEstimatedMinutes` já existem na entidade, mas o `CreateGoal` grava sempre `manual` e `null` | `modules/goals/src/goal/usecase/create-goal.usecase.ts` | O `CreateGoal` e o `POST /goals` precisam aceitar esses dados (tarefa 3) |
| 4 | `Step.microSteps` existe; vazio → texto genérico (P6) | docs/3 §2.1 | O `suggestSteps` preenche os micro-passos (UC18) |
| 5 | O mobile tem `GoalAssistantRepository.suggest(description)` → `GoalSuggestion { title, deadline, steps[{title, estimatedMinutes}] }`, com a implementação de exemplo (resposta fixa do protótipo) **nos dois modos**, inclusive `http` | `apps/mobile/lib/features/goals/data/`, `core/di/app_dependencies.dart` | Falta só a `HttpGoalAssistantRepository` e 5 campos no modelo; a tela não muda |
| 6 | O `GoalChatController` já tem a fase `failed`, que abre a M15 vazia (caminho manual da 4f) | `goal_chat_controller.dart`, `goals_pages.dart` | O 503 do backend cai nesse caminho sem código novo |
| 7 | O web só tem o objetivo manual (W30 vazia, P20). Não há aba "Escrever", "Colar link", "Analisar com IA", "IA analisando…" nem "A IA achou" | `apps/frontend/src/modules/goals/components/new-goal-modal.component.tsx`; design W27–W30 | **No web a IA exige trabalho de tela uma vez** (W27, W29, W30 preenchida). Depois disso, a troca de motor não toca nas telas |
| 8 | O design web não tem "Preencher à mão" (UC30); o mobile tem (M16) | `design/web/SCREENS.md` (notas) | Com a IA, como o usuário do web chega ao caminho manual? → [DECIDIR] |
| 9 | Os dois designs mostram **requisitos** encontrados ("A IA achou", W30; "Achei 4 requisitos…", M15; DATA `NOVO.reqs`) | design | O `parseGoal` devolve `requirements` |
| 10 | Nenhum design mostra a IA **perguntando** algo (ex.: o prazo) | design | Pergunta de esclarecimento é estado sem design → [DECIDIR] |
| 11 | Já existem as portas `CryptoProvider`, `TokenProvider` (auth), `RampOptionSource` e `BusySource`; a `FixedRampOptionSource` é uma implementação pura **dentro** do domínio | `modules/*/src/**/provider` | Precedente para os dois lados da discussão "onde fica o motor de regras" (§3.4) |
| 12 | O backend roda em Node 25 (tem `fetch` e `AbortSignal.timeout` nativos) e já tem `class-validator` (P19) | `apps/backend/package.json` | O adaptador não precisa de SDK nem de biblioteca de validação nova |
| 13 | Não há erro de domínio para "serviço indisponível" (503) no `shared`; o filtro já traduz qualquer `DomainError` pelo `statusCode` | `packages/shared/src/error`, `api-exception.filter.ts` | Criar `ServiceUnavailableError` (503), que serve também para Firecrawl e Resend depois |
| 14 | O `nest-cli.json` não copia arquivos que não são `.ts` para o `dist` | `apps/backend/nest-cli.json` | Prompts em `.md` exigem `assets` no `nest-cli.json` (§3.7) |
| 15 | Itens já abertos que tocam a IA: "Aviso quando a IA falha no chat", "Anexo e áudio só visuais", "Resposta da IA em tela própria × chat", "Ligar 'Novo objetivo' ao chat", "Destino do 'Preencher à mão'" (mobile); "Título 'Quebrei em etapas pra você'" (web) | `afazeres.md` | Esta proposta não os decide; cita-os onde se cruzam |
| 16 | No Backend já existem o [DECIDIR] "Provedor de LLM do assistente de novo objetivo" e o [EXECUTAR] "Endpoint do assistente de novo objetivo" (rota `POST /goals/assistant`, método `extractGoal`, saída sem micro-passos nem requisitos) | `afazeres.md` | Esta proposta detalha e ajusta esse [EXECUTAR]; os dois itens ganharam uma nota de atualização em vez de duplicatas |
| 17 | O [DECIDIR] "Tipo do prazo e nome curto do objetivo" pede "Prova", "Entrega", "Publicar" | `afazeres.md` | A `category` do rascunho poderia alimentar isso nos objetivos criados pela IA; fora desta proposta |

---

## a) Mapa de uso da IA

### a.1 Visão geral

| # | Uso | Caso de uso / tela | Quem chama | Fase | O que o motor de regras devolve |
|---|---|---|---|---|---|
| A1 | Extrair objetivo do texto (`parseGoal`) | UC02; W27→W29→W30; M13→M14→M15 | backend, dentro do `POST /goals/assistant/draft` | **MVP, fatia 1** | Título pelo texto, prazo por regras de data, categoria por palavras-chave, requisitos vazios |
| A2 | Sugerir etapas (`suggestSteps`) | UC04; W30, M15 | idem | **MVP, fatia 1** | Modelo de etapas da categoria, com o título no texto, estimativas múltiplas de 15 |
| A3 | Micro-passo da etapa | UC18; M09, W34 | idem (vem junto com cada etapa) | **MVP, fatia 1** | 1–2 micro-passos por etapa, do modelo da categoria |
| A4 | Perguntas de esclarecimento | chat M13–M15 | idem | **MVP: não há pergunta**, só `missingFields`. Pergunta = futuro (§b) | `missingFields` quando não achou título ou prazo |
| A5 | Objetivo a partir de link | UC03; W28 | backend: `PageReaderProvider` (Firecrawl) → `parseGoal` | MVP-meta, **fatia 3** (depende de [DECIDIR] Firecrawl) | Sem leitura: 503 ou "cole o texto" |
| A6 | Objetivo a partir de anexo (PDF, foto) | UC03; M13/M14 (clipe) | backend: extrator de texto ou LLM multimodal | **Futuro** (já há [DECIDIR] "Anexo e áudio só visuais") | — |
| A7 | Áudio (microfone) | UC02; M13 | transcrição (fornecedor a definir) | **Futuro** | — |
| A8 | Resumo de material da etapa | UC27 (desejável) | backend: `PageReaderProvider` → `summarizeForStep` | **Futuro** | — |
| A9 | Ajuda durante o foco | UC31 (desejável); M25 | — | **MVP sem IA**: o design M25 tem texto fixo e a rampa usa o catálogo (4a). Futuro: `suggestSmallerStep` | Texto fixo do design |
| A10 | Onboarding por texto livre | D 4b; T01 | backend: `RoutineParserProvider` → `SetWeeklyAvailability` / `CreateCommitment` | **Futuro** (P8: compromisso ainda sem tabela) | — |
| A11 | Replanejar etapas restantes | D 4h | backend: 3º método `replanRemaining` + caso de uso que marca `superseded` | **Futuro** (4h: fora do MVP salvo folga até 20/11) | Etapas restantes sem mudança |
| — | **Não usam IA** | motor do plano (4f), opções da rampa (4a), e-mail diário (UC23), plano inviável (UC11) | — | — | — |

### a.2 Tipos (porta do domínio, `modules/goals/src/goal/provider/goal-assistant.provider.ts`)

```ts
/** Tipo do objetivo para escolher o modelo de etapas. Não confundir com Goal.kind ('goal' | 'single'). */
export type GoalCategory = "assignment" | "exam" | "project" | "generic";

/** Campos que o motor não conseguiu extrair. Informativo: o prazo é opcional (P3). */
export type GoalDraftField = "title" | "deadline";

/** Quem respondeu. Só para log e transparência; nenhuma tela depende disso. */
export type AssistantEngine = "llm" | "rules";

export interface ParseGoalIn {
  text: string;        // texto do usuário, já sem espaços nas pontas, 1–2000 caracteres
  today: string;       // data local do usuário, YYYY-MM-DD (para "sexta", "semana que vem")
  timezone: string;    // IANA, do User (P1)
}

export interface ParsedGoal {
  title: string | null;
  deadline: string | null;        // YYYY-MM-DD
  category: GoalCategory;
  requirements: string[];          // "3 algoritmos", "relatório em PDF" (W30, M15)
  missingFields: GoalDraftField[];
  engine: AssistantEngine;
}

export interface SuggestStepsIn {
  title: string;
  deadline: string | null;
  category: GoalCategory;
  requirements: string[];
  text: string;                    // texto original, para contexto
  today: string;
}

export interface SuggestedStep {
  title: string;
  estimatedMinutes: number;
  microSteps: string[];
}

export interface SuggestedSteps {
  steps: SuggestedStep[];
  engine: AssistantEngine;
}

/** Falha (indisponível, lento, saída inválida) → lança ServiceUnavailableError (shared, 503). */
export interface GoalAssistantProvider {
  parseGoal(input: ParseGoalIn): Promise<ParsedGoal>;
  suggestSteps(input: SuggestStepsIn): Promise<SuggestedSteps>;
}
```

**Caso de uso `DraftGoal`** (`usecase/draft-goal.usecase.ts`), sem gravar nada:

```ts
export interface DraftGoalIn { userId: string; text: string; now: Date; timezone: string; }

export interface GoalDraft {
  title: string | null;
  deadline: string | null;
  category: GoalCategory;
  requirements: string[];
  missingFields: GoalDraftField[];
  steps: { title: string; estimatedMinutes: number; aiEstimatedMinutes: number; microSteps: string[] }[];
  totalMinutes: number;
  engine: AssistantEngine;   // "rules" se qualquer uma das duas chamadas veio do motor de regras
}
export interface DraftGoalOut { draft: GoalDraft; }
```

Fluxo: valida o texto → calcula `today` no fuso → `parseGoal` → `suggestSteps` → `GoalDraftNormalizer` (classe pura, §c.3) → devolve. O `userId` não vai para o fornecedor; serve para log e para o limite de uso.

### a.3 Exemplo (texto de referência de F §4)

Entrada: `"Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11"`, hoje 11/11/2026.

| Campo | Motor de regras (determinístico) | LLM (esperado) |
|---|---|---|
| `title` | "Trabalho de Algoritmos" (texto até o primeiro "—", ",", ":" ou ".", limitado a 120) | "Trabalho de Algoritmos" |
| `deadline` | `2026-11-24` | `2026-11-24` |
| `category` | `assignment` ("trabalho") | `assignment` |
| `requirements` | `[]` | ["3 algoritmos de ordenação", "comparação"] |
| `steps` | modelo `assignment` (abaixo) | as 7 etapas de F §4 ou parecidas |
| `missingFields` | `[]` | `[]` |

**Regras de data do motor de regras** (em ordem; a primeira que casar vale):

| Padrão | Exemplo | Resultado (hoje = qua 11/11/2026) |
|---|---|---|
| `dd/mm/aaaa`, `dd/mm`, `dd-mm` | "24/11", "24/11/2026" | 2026-11-24 (sem ano: o próximo 24/11 ≥ hoje) |
| `dia dd` | "para dia 20" | 2026-11-20 (mês atual; se já passou, o próximo mês) |
| `dd de <mês>` | "3 de dezembro" | 2026-12-03 |
| `hoje`, `amanhã`, `depois de amanhã` | "amanhã" | 2026-11-12 |
| dia da semana (`segunda` … `domingo`, com ou sem "-feira") | "sexta" | a próxima sexta **depois de hoje**: 2026-11-13 |
| `semana que vem` / `próxima semana` | — | domingo da semana seguinte: 2026-11-22 |
| `em N dias` / `daqui a N dias` | "em 10 dias" | 2026-11-21 |
| `fim do mês` | — | 2026-11-30 |
| nada | — | `null` + `missingFields: ['deadline']` |

Data no passado ou impossível (ex.: 31/02) → `null` + `missingFields: ['deadline']`.

**Categoria por palavras-chave:** `prova`, `teste`, `exame`, `P1`/`P2`, `simulado` → `exam`; `trabalho`, `relatório`, `lista`, `entrega`, `TP` → `assignment`; `projeto`, `app`, `site`, `portfólio`, `TCC` → `project`; senão `generic`.

**Modelos de etapas** (o `<tema>` é o título; totais múltiplos de 15):

| Categoria | Etapas (min) | Total |
|---|---|---|
| `assignment` | Ler o enunciado e listar requisitos (30) · Pesquisar e separar o material (60) · Fazer a primeira versão de `<tema>` (120) · Revisar e completar (60) · Formatar e enviar (30) | 5h |
| `exam` | Listar os assuntos de `<tema>` (30) · Revisar a teoria (90) · Resolver exercícios (90) · Fazer uma prova antiga ou simulado (60) · Revisar os erros (30) | 5h |
| `project` | Definir o escopo de `<tema>` (30) · Montar a estrutura inicial (60) · Fazer a parte principal (120) · Testar e ajustar (60) · Publicar ou apresentar (30) | 5h |
| `generic` | Entender o que precisa ser feito em `<tema>` (30) · Fazer a primeira parte (60) · Fazer o restante (60) · Revisar e finalizar (30) | 3h |

Cada etapa traz 1–2 micro-passos fixos do modelo (ex.: "Abra o enunciado e copie os itens pedidos numa lista"). Os textos exatos ficam numa tabela no código e podem ser trocados pelo time sem mexer em nada mais.

---

## b) A conversa do chat

### b.1 Opções

| | Como funciona | Prós | Contras |
|---|---|---|---|
| **1. Sem estado, um turno (recomendada para o MVP)** | O app manda o texto; o backend devolve o rascunho com `missingFields`. O que faltar é completado na tela de etapas (M15/W30), que já tem os campos | Nada novo no backend nem no design; funciona igual com regras e com LLM; nada para expirar ou proteger | Não há "conversa": o Broto não pergunta |
| **2. Sem estado, com pergunta** | Se faltar o prazo, a resposta é `{ type: 'question', field: 'deadline', question }`. O app mostra o balão e manda de volta `{ text, previous: { draft, field, answer } }` | Backend continua sem tabela; o motor de regras responde a pergunta de forma determinística (só aplica as regras de data à resposta); poucos tokens | Estado de tela sem design (balão de pergunta, resposta curta); mais um formato de resposta |
| **2b. Sem estado, com histórico** | O app manda `messages[]` (até 8, 4000 caracteres) a cada pedido | Mais flexível para o LLM | Mais tokens; o motor de regras não sabe usar histórico livre; o app guarda e reenvia texto que pode crescer |
| **3. Sessão no backend** | `POST /goals/assistant/sessions`, mensagens gravadas, `draftId` | Histórico auditável; o app fica leve | Tabela, migration, expiração, posse por usuário, mais endpoints e testes de posse; nenhum ganho real para a demo |

### b.2 Quando faltam dados

- **Prazo faltando:** não bloqueia (P3). O rascunho volta com `deadline: null` e `missingFields: ['deadline']`; as etapas são sugeridas mesmo assim. A M15/W30 mostra o campo de prazo vazio. Salvar sem prazo é válido: o objetivo entra no plano depois dos que têm prazo.
- **Título faltando** (ex.: "me ajuda a estudar"): o motor de regras usa o próprio texto cortado em 120; o LLM pode devolver `null`. Com `null`, a tela mostra o campo vazio e a validação de formulário que já existe exige o título antes de encaixar.
- **Texto que não é objetivo** ("oi"): o LLM tende a devolver etapas vazias. Etapas vazias contam como **saída inválida** e caem no fallback (§c.5); o motor de regras sempre devolve o modelo `generic`.

**Recomendação:** opção 1 no MVP. Se o time quiser o Broto perguntando, a opção 2 (não a 3) depois de haver design do balão. Registrado como [DECIDIR] "Perguntas de esclarecimento no chat".

---

## c) Arquitetura

### c.1 Desenho

```
 web (W27→W30)          mobile (M13→M15)
      │  POST /goals/assistant/draft  { text }
      ▼
 apps/backend
  GoalAssistantController ─► goal-draft.orchestrator  (lê o fuso do usuário: userTimezone)
                                 │
                                 ▼
                     DraftGoal (modules/goals, puro)
                       │ parseGoal / suggestSteps          GoalDraftNormalizer (puro)
                       ▼
                 GoalAssistantProvider  ◄── porta do domínio
                       ▲  (token GOAL_ASSISTANT, escolhido por AI_PROVIDER na inicialização)
     ┌─────────────────┼──────────────────────────────┐
 RulesGoalAssistant   OpenAiCompatibleGoalAssistant   FallbackGoalAssistant(primário, reserva)
 (regras, sem rede)   (fetch → /chat/completions)     (timeout total, saída inválida → reserva)
```

Depois, o usuário edita e chama o `POST /goals` de sempre, agora com `source: 'ai'` e `aiEstimatedMinutes` (tarefa 3).

### c.2 Onde fica cada coisa

| Arquivo | Papel |
|---|---|
| `packages/shared/src/error/service-unavailable.error.ts` | `ServiceUnavailableError extends DomainError` (503). Reutilizável por Firecrawl e Resend |
| `modules/goals/src/goal/provider/goal-assistant.provider.ts` | Porta e tipos (§a.2) |
| `modules/goals/src/goal/model/goal-draft.normalizer.ts` | Classe pura: aplica P2, P5 e os limites do §c.3 a qualquer saída |
| `modules/goals/src/goal/usecase/draft-goal.usecase.ts` | `DraftGoal` |
| `modules/goals/test/mock/fake-goal-assistant.provider.ts` | `FakeGoalAssistantProvider` **de teste** (respostas programadas, pode lançar erro). Não é o motor de regras |
| `apps/backend/src/modules/goals/assistant/rules-goal-assistant.provider.ts` (+ `pt-br-date.parser.ts`, `step-templates.ts`) | Motor de regras |
| `apps/backend/src/modules/goals/assistant/openai-compatible-goal-assistant.provider.ts` | Adaptador HTTP |
| `apps/backend/src/modules/goals/assistant/fallback-goal-assistant.provider.ts` | Decorador de fallback |
| `apps/backend/src/modules/goals/assistant/llm-output.dto.ts` | Formato esperado do JSON do LLM (`class-validator`, já aprovado na P19) |
| `apps/backend/src/modules/goals/assistant/goal-assistant.factory.ts` | Lê o `ConfigService`, valida as variáveis e monta a implementação |
| `apps/backend/src/modules/goals/assistant/prompts/*.md` | Prompts versionados (§c.7) |
| `apps/backend/src/orchestrators/goal-draft.orchestrator.ts` + `goal-assistant.controller.ts` + `goal-assistant.dto.ts` | Rota, fuso do usuário e DTOs do Swagger |

Nenhum import de framework, SDK ou `fetch` em `modules/` ou `packages/shared` (o grep da verificação continua valendo).

### c.3 Validação da saída (duas camadas)

1. **Formato, no adaptador LLM:** `JSON.parse` → `plainToInstance` + `validate` do `class-validator` contra `llm-output.dto.ts`. Falhou → `ServiceUnavailableError('assistant.invalid-output')`. Pedido ao fornecedor com `response_format: { type: 'json_object' }` (o suporte a `json_schema` varia entre fornecedores; **a confirmar** para o escolhido).
2. **Regras do domínio, no `GoalDraftNormalizer`** (vale para LLM e regras):
   - título: sem espaços extras, cortado em 120 na última palavra inteira (P2); vazio → `null` + `missingFields: ['title']`;
   - prazo: data válida `YYYY-MM-DD` e ≥ hoje; senão `null` + `'deadline'`;
   - requisitos: até 6, cada um até 60 caracteres, sem repetidos;
   - etapas: de 1 a 12 (o que passar é cortado); título 1–120; minutos arredondados ao múltiplo de 15 mais próximo, **mínimo 15 e máximo 240** (P5 não define máximo; 240 é proposta); micro-passos: até 3, cada um até 140 caracteres;
   - zero etapas depois da limpeza → `ServiceUnavailableError('assistant.empty-steps')` (vai para o fallback);
   - `aiEstimatedMinutes` = `estimatedMinutes` no rascunho; o usuário só edita o `estimatedMinutes`.

### c.4 Seleção por variável

Na inicialização, um provider do Nest com `useFactory` lê:

| Variável | Valores | Padrão |
|---|---|---|
| `AI_PROVIDER` | `rules` \| `openai-compatible` | `rules` |
| `AI_BASE_URL` | ex.: `https://api.groq.com/openai/v1` | — (obrigatório com `openai-compatible`) |
| `AI_MODEL` | nome do modelo no fornecedor | — (obrigatório com `openai-compatible`) |
| `AI_API_KEY` | segredo | vazio (o Ollama local não pede) |
| `AI_TIMEOUT_MS` | orçamento **total** do rascunho (as duas chamadas) | `15000` |
| `AI_FALLBACK` | `rules` \| `none` | `rules` (ver [DECIDIR] da política de falha) |
| `AI_LOG_CONTENT` | `true` \| `false` | `false` |

- Valor desconhecido ou variável obrigatória faltando → o backend **não sobe**, com a mensagem do que falta (sem imprimir a chave).
- Um fornecedor novo que não fala o formato OpenAI vira só mais um arquivo `<fornecedor>-goal-assistant.provider.ts` e mais um valor de `AI_PROVIDER`.
- Testes de integração e ponta a ponta rodam com `AI_PROVIDER=rules`: determinísticos e sem rede.

### c.5 Fallback, timeouts e erros

- O `FallbackGoalAssistantProvider` cria um `AbortSignal.timeout(AI_TIMEOUT_MS)` por rascunho e o repassa ao adaptador.
- Timeout, erro de rede, HTTP ≠ 2xx (inclusive 429), JSON inválido ou etapas vazias → se `AI_FALLBACK=rules`, refaz **o rascunho inteiro** com o motor de regras (instantâneo) e devolve `engine: 'rules'`; se `none`, lança `ServiceUnavailableError` → **503** → web e mobile abrem o formulário manual (4f).
- Refazer o rascunho inteiro (e não só a chamada que falhou) evita misturar título do LLM com etapas do modelo.
- Sem nova tentativa no MVP: com 15 s de orçamento, uma segunda chamada lenta só atrasa o fallback.
- No app, o cliente HTTP desta rota usa timeout de 25 s (maior que o orçamento do backend), e o "analisando…" cobre a espera.

### c.6 Logs e segredo

- Uma linha por chamada, no `Logger` do Nest: `assistant op=parseGoal provider=openai-compatible model=<m> prompt=parse-goal@v1 ms=1234 outcome=ok|timeout|http_429|invalid_json|invalid_output fallback=rules tokens_in=… tokens_out=…`.
- **Nunca** a chave nem o cabeçalho `Authorization`; mensagens de erro do fornecedor são cortadas em 200 caracteres antes de logar.
- O texto do usuário e a resposta só vão para o log com `AI_LOG_CONTENT=true` (desenvolvimento).
- Para o fornecedor vai **só o texto do objetivo** e a data de hoje: nunca nome, e-mail, id ou fuso do usuário.
- A chave fica só no `.env` do backend (e no segredo da hospedagem); `.env.example` documenta as variáveis com valores vazios.

### c.7 Prompts

- Arquivos `prompts/parse-goal.v1.md` e `prompts/suggest-steps.v1.md`, com marcadores `{{today}}` e `{{text}}`. A versão está no nome do arquivo e vai para o log.
- O texto do usuário vai na mensagem `user`, entre delimitadores; o prompt de sistema manda ignorar instruções dentro dele. O risco de injeção é baixo: a saída é validada, só volta para o próprio usuário e ele confirma antes de salvar.
- **Atenção ao build:** o Nest não copia `.md` para o `dist`. É preciso `"assets": [{ "include": "modules/goals/assistant/prompts/*.md", "watchAssets": true }]` no `nest-cli.json`, e um teste que carrega todos os prompts na inicialização. Alternativa sem esse ajuste: prompts em `parse-goal.prompt.ts` exportando uma string (continua fora da lógica e versionado, mas é "código").

### c.8 Limite de uso

Rota autenticada (só usuário logado gasta a cota). Para não estourar o plano gratuito numa demo pública: limite simples em memória por usuário (ex.: 20 rascunhos por hora → 429). Implementação própria (sem dependência) ou `@nestjs/throttler` (dependência nova): parte do [DECIDIR] de custo.

---

## d) Contrato

### d.1 `POST /goals/assistant/draft` (novo)

Gera um rascunho de objetivo com etapas a partir do texto. **Não grava nada.** Orquestrador: `goal-draft.orchestrator`.

Corpo:
```json
{ "text": "Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11" }
```

Resposta 200 (lista de etapas abreviada; o total é o das 7 etapas de F §4):
```json
{
  "draft": {
    "title": "Trabalho de Algoritmos",
    "deadline": "2026-11-24",
    "category": "assignment",
    "requirements": ["3 algoritmos de ordenação", "comparação"],
    "missingFields": [],
    "steps": [
      { "title": "Ler o enunciado e listar requisitos", "estimatedMinutes": 30, "aiEstimatedMinutes": 30,
        "microSteps": ["Abra o enunciado e copie os itens pedidos numa lista"] }
    ],
    "totalMinutes": 495
  },
  "engine": "llm"
}
```

| Status | Quando |
|---|---|
| 200 | Rascunho gerado (pelo LLM ou pelo motor de regras) |
| 400 | `text` ausente ou não string; campo não previsto (ex.: `userId`, P19) |
| 401 | Sem token |
| 422 | `text` vazio depois de remover espaços (`goal-draft.text.required`) ou com mais de 2000 caracteres (`goal-draft.text.max-length`) |
| 429 | Limite de uso atingido (se aprovado, §c.8) |
| 503 | IA indisponível, lenta ou com saída inválida **e** `AI_FALLBACK=none` (`assistant.unavailable`). O app abre o formulário manual (4f) |

- **Caso de uso:** `DraftGoal` (o orquestrador lê o fuso com `userTimezone`).
- **Telas:** web W27 → W29 → W30 preenchida; mobile M13 → M14 → M15 preenchida.

**Integração (supertest, com `AI_PROVIDER=rules`):**
1. Texto de referência → 200, `deadline` = próximo 24/11, 5 etapas do modelo `assignment`, todas múltiplas de 15, `engine: 'rules'`.
2. Texto sem data → 200, `deadline: null`, `missingFields: ['deadline']`.
3. Sem token → 401.
4. `text: ""` → 422; `text` com 2001 caracteres → 422.
5. Corpo com `userId` → 400.
6. Provedor que falha com `AI_FALLBACK=none` (provider sobrescrito no módulo de teste) → 503; com `AI_FALLBACK=rules` → 200 e `engine: 'rules'`.
7. Nenhum objetivo é gravado (o `GET /goals` continua igual).

Não há teste de posse: a rota não lê nem grava recurso de usuário.

### d.2 `POST /goals` (muda)

Campos opcionais novos, que fazem valer a 4f ("`aiEstimate` e `estimate` ficam salvos separadamente"):

```json
{
  "title": "Trabalho de Algoritmos", "deadline": "2026-11-24", "kind": "goal",
  "source": "ai",
  "steps": [{ "title": "…", "estimatedMinutes": 45, "aiEstimatedMinutes": 30, "microSteps": ["…"] }]
}
```

- `source`: `manual | ai`, padrão `manual` (quem não manda continua igual).
- `steps[].aiEstimatedMinutes`: inteiro ≥ 15, múltiplo de 15, ou `null`; padrão `null`.
- Erros: os mesmos de hoje; `aiEstimatedMinutes = 20` → 422; `source = "xyz"` → 400.
- Novos cenários do `CreateGoal`: (a) com `source: 'ai'` e estimativas da IA, grava os dois valores separados; (b) sem os campos, grava `manual` e `null` (comportamento atual).
- Integração: os dois cenários acima + 422 da estimativa da IA inválida.

### d.3 Futuros (fora desta proposta de implementação)

| Rota | Para quê | Quando |
|---|---|---|
| `POST /goals/assistant/draft` com `url?` | UC03 (W28, "Colar link"), via `PageReaderProvider` | fatia 3, se o Firecrawl for aprovado |
| `POST /goals/assistant/steps` | Sugerir etapas para um título já digitado (formulário manual) | sem design; futuro |
| `POST /goals/:goalId/replan` | Replanejar o restante (4h) | futuro |
| `POST /scheduling/routine/parse` | Onboarding por texto (4b) | futuro |

### d.4 O que muda nos apps

**Mobile** (as telas não mudam):
- `GoalSuggestion` ganha `category`, `requirements`, `missingFields`, `engine` e, em cada etapa, `microSteps` e `aiEstimatedMinutes`.
- `HttpGoalAssistantRepository(api)` em `features/goals/data/`, chamando `POST /goals/assistant/draft` com timeout de 25 s; 503, timeout e erro de rede → exceção → a fase `failed` que já existe → M15 vazia.
- `AppDependencies.http()` passa a montar a `HttpGoalAssistantRepository`; o modo `sample` continua com a `SampleGoalAssistantRepository` (com os campos novos).
- `NewGoalController`: quando veio da IA, envia `source: 'ai'`, `aiEstimatedMinutes` e `microSteps` no `POST /goals`.
- Mostrar os requisitos na M15 depende do [DECIDIR] já aberto "Resposta da IA em tela própria × dentro do chat".

**Web** (trabalho de tela uma vez, com design pronto):
- `GoalAssistantRepository` (exemplo + HTTP) em `modules/goals/data/` e na `composition.ts`.
- `NewGoalModal` ganha os estados do protótipo: W27 (Escrever / Colar link, "Analisar com IA"), W29 ("IA analisando…") e W30 preenchida ("A IA achou" + etapas editáveis). A aba "Colar link" fica só visual até a fatia 3.
- O caminho manual (hoje a W30 vazia) precisa de uma entrada que o design não tem → [DECIDIR].
- O título "Quebrei em etapas pra você" passa a ser verdadeiro quando a IA preenche (cruza com o [DECIDIR] já aberto no web).

**Troca para a IA real depois disso:** só o `.env` do backend. Web e mobile não mudam.

---

## e) Avaliação da sua proposta

### e.1 O que mantenho

| Ponto | Por quê |
|---|---|
| 1. Só o backend chama a IA, por porta no domínio | Esconde a chave, segue a regra de arquitetura e a 4f; o mobile já tinha a porta certa |
| 2. Um motor sem IA, determinístico | Desbloqueia os testes de ponta a ponta até sexta e a demo sem internet |
| 3. Adaptador "compatível com OpenAI" pelo `.env` | Groq, Gemini, Ollama, OpenRouter e GitHub Models aceitam esse formato (§f), então uma implementação cobre quase todos |
| 4. Escolha por `AI_PROVIDER`, com fallback | Troca só por configuração |
| 5. Prompts versionados fora da lógica | Revisão e comparação fáceis |

### e.2 O que mudo

| # | Na sua proposta | Mudança | Por quê |
|---|---|---|---|
| 1 | `AI_PROVIDER=fake` | `rules` (`RulesGoalAssistantProvider`) + um `FakeGoalAssistantProvider` separado só em `test/mock` | No projeto, "fake" é dublê de teste (`test/mock/fake-*.ts`). O motor de regras é funcionalidade de produto (demo offline, reserva). Misturar os dois faz os testes do caso de uso dependerem das heurísticas de data |
| 2 | "Saída estruturada validada" | Duas camadas: formato no adaptador e regras do domínio numa classe pura em `goals` | P2 e P5 precisam valer para qualquer motor, inclusive o de regras e um fornecedor futuro |
| 3 | `parseGoal` e `suggestSteps` (implícito: o app chama os dois?) | Um endpoint que faz os dois no backend; a porta mantém os dois métodos (4f) | Uma ida e volta a menos no celular; o app não orquestra IA |
| 4 | Fallback quando > 15 s | 15 s como orçamento **total** do rascunho, com refação inteira pelo motor de regras e `engine` na resposta | Com 15 s por chamada, o pior caso seria 30 s. Misturar partes do LLM e das regras gera rascunho incoerente. O `engine` evita que uma resposta de regras seja vendida como "IA" sem ninguém saber |
| 5 | Fallback para o motor de regras **ou** formulário manual | Configurável (`AI_FALLBACK`), e a escolha vai para o time | A 4f diz "falhou → formulário manual". Cair nas regras é uma mudança de decisão → [DECIDIR] |
| 6 | "Datas por regras simples" | O motor recebe `today` e `timezone` como entrada | "Sexta" depende do dia local do usuário (P1); sem isso, os testes ficam presos ao relógio |
| 7 | "Tipo de objetivo" | `category` (`assignment`, `exam`, `project`, `generic`) | `Goal.kind` já existe e quer dizer outra coisa (`goal` × `single`) |
| 8 | `camposFaltando` quando faltar o prazo | Informativo, não bloqueia | O prazo é opcional (P3) |
| 9 | "Sem mexer nas telas" | Vale para o mobile e para a troca de motor; **não** para o web hoje | O web não tem nenhuma tela do fluxo com IA; W27/W29/W30 preenchida precisam ser feitas uma vez |
| 10 | — (não estava) | `POST /goals` aceita `source` e `aiEstimatedMinutes`; `GoalSuggestion` do mobile ganha `microSteps` | Sem isso a 4f não é cumprida e o UC18 nunca recebe micro-passo da IA |
| 11 | Prompts em arquivos | `.md` com `assets` no `nest-cli.json`, ou `.prompt.ts` | O build do Nest não copia `.md` |
| 12 | — | Limite de uso por usuário e nada de dado pessoal no pedido | Plano gratuito estoura fácil numa demo pública; alguns planos gratuitos usam o conteúdo para treino (§f) |

### e.3 Alternativas que você não considerou

| Alternativa | Prós | Contras | Recomendação |
|---|---|---|---|
| **Uma só chamada ao LLM** (rascunho inteiro de uma vez), com a porta tendo um 3º método `draftGoal` e implementação padrão que chama os dois | Metade da latência e do custo; o modelo vê tudo junto | Foge um pouco da 4f (duas chamadas); prompt maior | Boa otimização **depois** de medir; a interface comporta sem quebrar nada |
| **SDK** (`openai`, Vercel AI SDK, LangChain) | Retries, streaming e saída estruturada prontos | Dependência nova (D 5.8 pede aprovação); acopla a um formato | Não agora: `fetch` + `class-validator` resolve em ~150 linhas |
| **Adaptador nativo** (ex.: API própria de um parceiro sem formato OpenAI) | Usa recursos exclusivos | Um arquivo a mais | A porta já prevê: é só outro valor de `AI_PROVIDER` |
| **Respostas gravadas** (`AI_PROVIDER=recorded`): respostas reais do LLM salvas em JSON e devolvidas por texto | Demo offline com a qualidade da IA real; testes de tela com dados reais | Só funciona para textos conhecidos | Útil para a apresentação; tarefa opcional |
| **IA chamada direto do app** | Menos backend | Chave exposta no app e no navegador | Descartada |
| **Streaming** (etapas aparecendo uma a uma) | Espera percebida menor | Validação de JSON parcial; SSE no web e no mobile | Futuro |
| **Fila + consulta periódica** | Aguenta respostas longas | Infra e estados novos | Desnecessário com < 15 s |
| **Cache por texto** (por usuário, alguns minutos) | Repetir o mesmo texto não gasta cota | Pouco ganho fora da demo | Opcional, junto do limite de uso |
| **Avaliação rápida** (`npm --workspace apps/backend run ai:eval`): roda 10 textos de referência no motor configurado e imprime tabela de título, prazo, nº de etapas, total e tempo | Dá números para a escolha de sexta, sem achismo | Meio dia de trabalho | **Recomendo** (tarefa 10) |

---

## f) Opções gratuitas para testar com IA real antes de sexta

Todas falam o formato OpenAI, então entram só pelo `.env`. **Os limites mudam com frequência e as fontes divergem; tudo marcado "a confirmar" deve ser conferido no painel do fornecedor antes de usar.** Nome de modelo também é "a confirmar" (os catálogos mudam).

| Opção | `AI_BASE_URL` | Limites do gratuito | Privacidade | Esforço |
|---|---|---|---|---|
| **Motor de regras** | — | sem limite | nada sai do backend | zero (é a tarefa 4) |
| **Ollama local** | `http://localhost:11434/v1` | sem limite; depende da máquina (modelo de 3–8B roda num Mac com Apple Silicon; velocidade **a confirmar** no Mac do time) | nada sai da máquina | instalar o Ollama e baixar um modelo; sem chave |
| **Groq** | `https://api.groq.com/openai/v1` | cerca de 30 pedidos/min e 14.400/dia em vários modelos, por organização; tokens/min divergem entre fontes (6.000 × 30.000) — **a confirmar** em console.groq.com | política de uso de dados **a confirmar** | criar conta e chave; muito rápido |
| **Google Gemini (API, endpoint compatível)** | `https://generativelanguage.googleapis.com/v1beta/openai/` | limites por modelo **a confirmar** em ai.google.dev | **no plano gratuito, o conteúdo enviado e as respostas podem ser usados para melhorar os produtos do Google, com revisão humana** (termos de "Unpaid Services"; conferir a versão atual). Não mandar dado real de usuário | chave no AI Studio |
| **GitHub Models** | `https://models.github.ai/inference` (o endereço antigo `models.inference.ai.azure.com` ainda aparece em guias; **a confirmar** qual vale) | gratuito com conta GitHub; limites por plano do Copilot (≈10–15 pedidos/min e teto de tokens por pedido, segundo terceiros) — **a confirmar** | **a confirmar** | token pessoal do GitHub |
| **OpenRouter (modelos `:free`)** | `https://openrouter.ai/api/v1` | 50 pedidos/dia sem créditos comprados; 1.000/dia com ≥ 10 créditos (documentação oficial); ≈20/min **a confirmar** | depende do provedor de cada modelo gratuito; alguns registram os pedidos — **a confirmar** por modelo | conta e chave |

**Para a demo e os testes antes de sexta:** motor de regras para o ponta a ponta; Ollama para testar sem mandar nada para fora; Groq para medir latência e qualidade de um modelo grande. Gemini gratuito só com textos inventados.

**Parceiros do hackathon:** a lista ainda está pendente (D 5.8). Se algum parceiro tiver API no formato OpenAI, entra pelo mesmo adaptador; senão, é um adaptador novo (§c.4).

Fontes consultadas em 11/11/2026: [limites do OpenRouter](https://openrouter.ai/docs/api/reference/limits), [comparação de APIs gratuitas (OpenRouter)](https://openrouter.ai/blog/tutorials/free-llm-apis-compared/), [compatibilidade OpenAI do Gemini](https://ai.google.dev/api/compatibility), [registro e compartilhamento de dados do Gemini](https://ai.google.dev/gemini-api/docs/logs-policy), [termos do Gemini comentados por Simon Willison](https://simonwillison.net/2024/Oct/17/gemini-terms-of-service), [GitHub Models para projetos open source](https://github.blog/ai-and-ml/llms/solving-the-inference-problem-for-open-source-ai-projects-with-github-models/), [GitHub Models além do gratuito](https://github.blog/changelog/2025-06-24-github-models-now-supports-moving-beyond-free-limits/), [limites do Groq (terceiros)](https://benchlm.ai/free-tier/groq).

---

## g) Plano de execução

Cada tarefa numa branch própria a partir da `developer`, com TDD (vermelho → verde), verificação completa e revisor, como manda o processo. "∥" = pode rodar em paralelo.

| # | Tarefa | Branch | Depende de | ∥ com | TDD (primeiro) | O que você testa ao fim |
|---|---|---|---|---|---|---|
| 0 | Aprovar esta proposta; atualizar `docs/3` (porta, `DraftGoal`, normalizador, cenários) e `docs/4` (§d) | `docs/ia-contrato` | — | — | — | Os docs |
| 1 | `ServiceUnavailableError` (503) no `shared` + teste do filtro | `feat/shared-service-unavailable` | 0 | 2, 3, 4 | erro com 503; filtro devolve 503 com a mensagem | `npm run test --workspace @oitenta/shared` |
| 2 | Domínio: porta, tipos, `GoalDraftNormalizer`, `DraftGoal`, `FakeGoalAssistantProvider` | `feat/goals-assistente-dominio` | 0 | 1, 3*, 4 | cenários do normalizador (corta título em 120, arredonda 20 → 15, 250 → 240, prazo passado → `null`, 13 etapas → 12, zero etapas → erro) e do `DraftGoal` (texto vazio → 422, fuso define `today`, erro do provider propaga) | Cobertura 100% em `goals` |
| 3 | Domínio: `CreateGoal` aceita `source` e `aiEstimatedMinutes` | `feat/goals-origem-ia` | 0 | 1, 2*, 4 | os 2 cenários do §d.2 | Testes do `goals` |
| 4 | Backend: `RulesGoalAssistantProvider` (datas pt-BR, categorias, modelos) | `feat/backend-ia-regras` | contrato da 2 | 1, 3, 9 | a tabela de datas do §a.3 com "hoje" fixo; categorias; modelos; sempre ≥ 1 etapa | Testes unitários do backend |
| 5 | Backend: `POST /goals/assistant/draft` (orquestrador, controller, DTOs, fábrica com `rules`, OpenAPI) | `feat/backend-ia-rascunho` | 1, 2, 4 | 6 | os 7 testes de integração do §d.1 | **Swagger/curl: texto → rascunho. A partir daqui, o fluxo inteiro dá para testar com o motor de regras** |
| 6 | Backend: `POST /goals` com `source`/`aiEstimatedMinutes` | `feat/backend-goals-origem-ia` | 3 | 5 | integração do §d.2 | Swagger |
| 7 | Mobile: `HttpGoalAssistantRepository`, campos novos, `NewGoalController` com `source: 'ai'` | `feat/mobile-ia-http` | 5, 6 (pode começar com o contrato e HTTP simulado) | 8 | repositório HTTP (200, 503, timeout); controlador envia `source` e estimativas | **Simulador: chat → M15 preenchida → encaixar → calendário, com o backend real** |
| 8 | Web: repositório do assistente e telas W27 → W29 → W30 preenchida | `feat/web-ia-novo-objetivo` | 5, 6 (idem) + [DECIDIR] da entrada manual | 7 | repositório (exemplo e HTTP); lógica do modal (estados, falha → W30 vazia) | **Navegador: escrever → analisar → editar → encaixar** |
| 9 | Backend: `OpenAiCompatibleGoalAssistantProvider` + prompts + `assets` no `nest-cli.json` | `feat/backend-ia-openai-compativel` | 2 | 4–8 | com `fetch` simulado (sem rede): ok, timeout, 429, JSON inválido, formato inválido, a chave nunca aparece no log | Unitários; depois, à mão, `.env` com Ollama ou Groq |
| 10 | Backend: `FallbackGoalAssistantProvider`, seleção por `AI_PROVIDER`, validação na inicialização, logs + script `ai:eval` | `feat/backend-ia-fallback` | 4, 9 | 7, 8 | fallback para regras; `AI_FALLBACK=none` → 503; variável faltando → não sobe | **`AI_BASE_URL` errada → resposta das regras; `ai:eval` imprime a tabela para a decisão de sexta** |
| 11 | Ponta a ponta: Playwright e `integration_test` passam pelo chat (com `rules`) | `feat/e2e-ia` | 5, 7, 8 | — | os testes de ponta a ponta primeiro | Verificação completa verde |
| 12 | (opcional) `AI_PROVIDER=recorded` para a apresentação | `feat/backend-ia-gravado` | 10 | — | resposta gravada por texto; texto desconhecido → regras | Demo offline com respostas reais |

\* As tarefas 2 e 3 mexem no mesmo workspace (`goals`, inclusive os `index.ts`): em paralelo só em worktrees separadas, aceitando um conflito simples de export; ou em sequência (3 é pequena).

**Caminho mínimo até sexta (13/11):** 0 → 1 ∥ 2 ∥ 4 → 5 → 7 (mobile já tem tela) e, em paralelo a partir da 2, 9 → 10 para levar números de qualidade e latência à reunião. O web (8) depende de um [DECIDIR] e é a tarefa mais longa de tela.

---

## h) O que o time decide na sexta (13/11)

Registrados como [DECIDIR] no `afazeres.md` (Backend → "Proposta de IA (11/11/2026)"):

1. **Fornecedor e modelo** do LLM do app (entre os parceiros, D 5.8), com a tabela do `ai:eval`.
2. **Chave, custo e limites:** de quem é a conta, onde fica a chave (hospedagem), teto de gasto, limite por usuário.
3. **Privacidade:** o que pode ir para o fornecedor; aviso ao usuário; plano gratuito que usa dados para treino.
4. **Política de falha:** motor de regras, formulário manual (4f) ou os dois; e se a tela avisa.
5. **Link e anexo (UC03):** Firecrawl entra no MVP? PDF e áudio ficam para depois?

Para você (sem esperar sexta): aprovar esta proposta (§e.2), perguntas de esclarecimento no chat (§b) e a entrada do caminho manual no web (§d.4). Esses três também estão no `afazeres.md`.
