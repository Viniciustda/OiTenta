# Avaliação do assistente do novo objetivo (`ai:eval`)

**Data:** 12/11/2026 (quinta), para a reunião de sexta, 13/11 (decisão IA6).
**Como foi gerado:** `npm --workspace apps/backend run ai:eval` (tarefa 10 da `docs/7-proposta-ia.md` §g), com os 10 textos de referência do script `apps/backend/scripts/ai-eval.ts`, fuso `America/Sao_Paulo`, hoje = 12/11/2026, orçamento de 15 s (`AI_TIMEOUT_MS`) e reserva `rules` (`AI_FALLBACK`).

---

## Resumo para a reunião

| Motor | Qualidade (10 textos) | Latência por rascunho | Custo | Privacidade | Situação |
|---|---|---|---|---|---|
| **Motor de regras** (`AI_PROVIDER=rules`) | Prazo certo em 8 de 8 textos com data; categoria aceitável em 9 de 10; **títulos levam junto a expressão de data** (4 de 10) e **as etapas são genéricas**, o mesmo modelo para todo texto da categoria | 0–2 ms | zero | nada sai do backend | **medido** |
| **Ollama local** (`openai-compatible`, `http://localhost:11434/v1`) | **não medido**: o Ollama responde, mas não há modelo instalado (`ollama list` vazio); as 10 chamadas deram HTTP 404 e caíram no motor de regras | reserva em 1–71 ms (o 404 é imediato) | zero | nada sai da máquina | **bloqueado** (ver [DECIDIR] "Ollama local sem modelo instalado") |
| **Groq** (`https://api.groq.com/openai/v1`) | **não medido**: não há `AI_API_KEY` do Groq no `apps/backend/.env` | — | plano gratuito (limites "a confirmar", `docs/7` §f) | o texto sai para o fornecedor; política "a confirmar" | **não rodado** |
| Gemini, GitHub Models, OpenRouter | não medidos (`docs/7` §f) | — | — | Gemini gratuito pode usar o conteúdo para melhorar produtos | — |

**O que dá para afirmar hoje:**
1. O fluxo funciona de ponta a ponta com o motor de regras: rascunho instantâneo, prazo e categoria corretos na maioria dos casos, etapas coerentes mas genéricas.
2. A reserva funciona: com o LLM indisponível (modelo inexistente), o rascunho sai do motor de regras em menos de 0,1 s e a resposta diz `engine: 'rules'`.
3. **A qualidade de um LLM ainda não foi medida.** Para a reunião ter esse número, falta um modelo no Ollama ou uma chave do Groq (comandos em `docs/backend/COMO-TESTAR.md`, seção "Assistente do novo objetivo (IA)").

**Para decidir na sexta (IA6):** fornecedor e modelo, chave e custo, limite de uso, privacidade e política de falha (`AI_FALLBACK`). Os números do LLM entram nesta página quando o `ai:eval` for rodado com ele.

---

## (a) Motor de regras (`AI_PROVIDER=rules`)

| # | Texto | Título | Prazo | Categoria | Etapas | Total (min) | Tempo (ms) | Reserva | Qualidade |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11 | Trabalho de Algoritmos | 2026-11-24 | assignment | 5 | 300 | 2 | não | Boa: título e prazo certos; etapas de trabalho fazem sentido, mas não citam os 3 algoritmos nem a comparação |
| 2 | Prova de Cálculo 1 na sexta, cai derivadas e limites | Prova de Cálculo 1 na sexta | 2026-11-13 | exam | 5 | 300 | 1 | não | Média: prazo e categoria certos; o título leva "na sexta"; etapas de prova coerentes, sem citar derivadas e limites |
| 3 | TCC: entregar a primeira versão do capítulo 2 até 3 de dezembro | TCC | 2026-12-03 | project | 5 | 300 | 0 | não | Fraca: título curto demais ("TCC", cortado no ":"); o modelo de projeto ("Montar a estrutura", "Publicar") não serve para escrever um capítulo |
| 4 | Lista de exercícios de Física para amanhã | Lista de exercícios de Física para amanhã | 2026-11-13 | assignment | 5 | 300 | 0 | não | Fraca: o título leva "para amanhã"; 5 h de etapas de trabalho escrito ("Pesquisar material", "Formatar e enviar") para uma lista de exercícios |
| 5 | Montar meu portfólio no GitHub com 3 projetos | Montar meu portfólio no GitHub com 3 projetos | — | project | 5 | 300 | 0 | não | Média: sem data no texto, prazo vazio como esperado (IA2); etapas de projeto razoáveis |
| 6 | Apresentação do seminário de História em 10 dias | Apresentação do seminário de História em 10 dias | 2026-11-22 | generic | 4 | 180 | 1 | não | Média: prazo certo; o título leva "em 10 dias"; "seminário" não é palavra-chave, então caiu no modelo genérico |
| 7 | Estudar inglês para o simulado da semana que vem | Estudar inglês para o simulado da semana que vem | 2026-11-22 | exam | 5 | 300 | 0 | não | Média: prazo e categoria certos; o título leva "da semana que vem"; "Abra o plano de ensino" não se aplica bem a inglês |
| 8 | Relatório do estágio, entrega dia 30 | Relatório do estágio | 2026-11-30 | assignment | 5 | 300 | 0 | não | Boa: título, prazo e categoria certos; etapas de trabalho escrito servem |
| 9 | Fazer um app de lista de compras em Flutter até o fim do mês | Fazer um app de lista de compras em Flutter até o fim do mês | 2026-11-30 | project | 5 | 300 | 0 | não | Média: prazo certo; "app" venceu "lista" (aparece antes); o título leva "até o fim do mês" |
| 10 | Organizar minhas anotações da faculdade | Organizar minhas anotações da faculdade | — | generic | 4 | 180 | 0 | não | Aceitável: sem data, prazo vazio; etapas genéricas servem |

**Padrões observados:**
- **Prazo:** 8 de 8 textos com data deram a data certa ("24/11", "sexta", "3 de dezembro", "amanhã", "em 10 dias", "semana que vem", "dia 30", "fim do mês"); os 2 sem data deram prazo vazio.
- **Título:** quando não há "—", "," ou ":" antes da data, a expressão de data fica no título (textos 2, 4, 6, 7, 9). Quando o separador vem cedo demais, o título fica curto demais (texto 3).
- **Etapas:** sempre um dos 4 modelos, com o título colado no texto da etapa ("Fazer a primeira versão de Lista de exercícios de Física para amanhã"). Não aproveita nada do conteúdo do pedido (requisitos sempre vazios).
- O revisor da tarefa 4 achou outros casos de borda nas datas (intervalos como "3-5 páginas", "segunda unidade"): estão no [DECIDIR] "Regras de data e categoria do motor de regras" do `afazeres.md`.

Etapas geradas (iguais para todos os textos da mesma categoria, com o título no lugar de `<tema>`):

| Categoria | Etapas (min) e micro-passos |
|---|---|
| assignment | Ler o enunciado e listar requisitos (30) → "Abra o enunciado e copie os itens pedidos numa lista" / "Marque o que ainda não ficou claro" · Pesquisar e separar o material (60) · Fazer a primeira versão de `<tema>` (120) · Revisar e completar (60) · Formatar e enviar (30) |
| exam | Listar os assuntos de `<tema>` (30) · Revisar a teoria (90) · Resolver exercícios (90) · Fazer uma prova antiga ou simulado (60) · Revisar os erros (30) |
| project | Definir o escopo de `<tema>` (30) · Montar a estrutura inicial (60) · Fazer a parte principal (120) · Testar e ajustar (60) · Publicar ou apresentar (30) |
| generic | Entender o que precisa ser feito em `<tema>` (30) · Fazer a primeira parte (60) · Fazer o restante (60) · Revisar e finalizar (30) |

---

## (b) Ollama local (`AI_PROVIDER=openai-compatible`)

- **Conferência:** `curl http://localhost:11434/api/tags` → `{"models":[]}`; `ollama list` → vazio. Pela instrução da rodada, nenhum modelo foi baixado.
- **Configuração usada (só na linha de comando):** `AI_BASE_URL=http://localhost:11434/v1`, `AI_MODEL=llama3.2` (nome qualquer, já que não há modelo), `AI_API_KEY` vazio.
- **Resultado:** nos 10 textos, o `parseGoal` recebeu HTTP 404 (`model 'llama3.2' not found`) em 1–68 ms. O rascunho saiu do motor de regras, com o mesmo conteúdo da tabela (a), `engine: rules` e motivo da reserva `assistant.unavailable`. Tempo total por rascunho: 1–71 ms.
- **Log de cada chamada** (sem chave e sem o texto do usuário): `assistant op=parseGoal provider=openai-compatible model=llama3.2 prompt=parse-goal@v1 ms=68 outcome=http_404 tokens_in=- tokens_out=- error="{"error":{"message":"model 'llama3.2' not found",…}}"`, seguido de `assistant op=draft … outcome=assistant.unavailable fallback=rules`.

## (c) Groq

Não rodado: não há `AI_API_KEY` do Groq no `apps/backend/.env`.

---

## Teste manual do adaptador (`POST /goals/assistant/draft` com o Ollama)

- Backend da tarefa 10 na porta 4100, com `AI_PROVIDER=openai-compatible`, `AI_BASE_URL=http://localhost:11434/v1`, `AI_MODEL=llama3.2` e `AI_API_KEY` vazio.
- Login demo (`POST /auth/demo`) e `POST /goals/assistant/draft` com o texto de referência da `docs/7` §a.3.
- **Resposta:** 200, `engine: "rules"`, título "Trabalho de Algoritmos", prazo `2026-11-24`, 5 etapas, 300 min, em cerca de 0,16 s.
- **Log:** `outcome=http_404` no `parseGoal` (93 ms) e `assistant op=draft … ms=100 outcome=assistant.unavailable fallback=rules`.
- **Conclusão:** não foi possível conferir `engine: 'llm'` nem a validação de uma resposta real (não há modelo). Ficou confirmado que a falha do fornecedor é registrada sem segredo e que a reserva devolve um rascunho válido dentro do orçamento. O tempo limite não foi aumentado e a validação não foi afrouxada.

---

## Como repetir

Comandos completos em `docs/backend/COMO-TESTAR.md`, seção "Assistente do novo objetivo (IA)". Resumo:

```bash
# (a) motor de regras
npm --workspace apps/backend run ai:eval

# (b) Ollama (depois de ter um modelo: ollama list)
AI_PROVIDER=openai-compatible AI_BASE_URL=http://localhost:11434/v1 AI_MODEL=<modelo> AI_API_KEY= \
  npm --workspace apps/backend run ai:eval

# (c) Groq (a chave fica só no .env; nunca na linha de comando compartilhada)
AI_PROVIDER=openai-compatible AI_BASE_URL=https://api.groq.com/openai/v1 AI_MODEL=<modelo> \
  npm --workspace apps/backend run ai:eval
```

O script imprime a tabela em Markdown e as etapas de cada texto; a nota de qualidade é escrita à mão.
