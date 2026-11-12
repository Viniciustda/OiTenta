# Como testar o frontend

O frontend (`apps/frontend`, Next.js) tem a landing page em `/` e as telas da fatia do MVP:

| Rota | O que é |
|---|---|
| `/entrar` | Login, com o botão "Entrar direto como Arthur (demo)" |
| `/cadastro` | Cadastro |
| `/onboarding` | Grade de horários livres e limite diário |
| `/hoje` | Plano do dia, check-in de energia e rampa (abre como modal) |
| `/calendario` | Semana |
| `/objetivos/[id]` | Trilha do objetivo |

Todos os comandos rodam **a partir da raiz do repositório** (a pasta `OiTenta`) e foram testados em 10/11/2026.

## Antes de começar

Você precisa de:
- **Node.js 24 ou mais novo** (`node -v`);
- **internet** no primeiro build, para baixar as fontes (Fredoka e Nunito) e os ícones (Phosphor);
- para as telas com dados reais: o **backend no ar**, conforme `docs/backend/COMO-TESTAR.md` (banco, migrations, seed e backend na porta 4000).

## 1. Instalar e compilar

```bash
npm ci
```

```bash
npm --workspace apps/backend run prisma:generate && npm run build
```

Termina com `Tasks: 9 successful, 9 total`.

## 2. De onde vêm os dados

A variável `NEXT_PUBLIC_DATA_SOURCE` escolhe a origem (modelo em `apps/frontend/.env.example`):

| Valor | O que acontece |
|---|---|
| `http` (padrão) | As telas chamam o backend em `NEXT_PUBLIC_API_URL` (padrão `http://localhost:4000`). O token fica no `localStorage` (`bora.token`). Um 401 leva para `/entrar` |
| `example` | Dados de exemplo do protótipo, sem backend, com o relógio fixo em 16/11 às 19:40 |

A gamificação (gotas, sequência, nível) mostra os valores fixos do protótipo nos dois modos (P18).

## 3. Rodar contra o backend real

Com o backend no ar (porta 4000):

```bash
npx turbo run dev --filter=@oitenta/frontend
```

Espere `✓ Ready` e abra **http://localhost:3000/entrar**. Para recomeçar do onboarding, zere os dados do demo antes:

```bash
npm --workspace apps/backend run db:reset-demo
```

### Roteiro manual

1. **Entrar:** clique em **Entrar direto como Arthur (demo)**. Sem grade cadastrada, você vai para o **onboarding**.
2. **Onboarding:** pinte horários livres na grade, ajuste o limite diário e conclua. Você chega ao **Hoje**.
3. **Novo objetivo:** no Hoje, abra o novo objetivo e clique em **Prefiro preencher à mão** (ou siga a seção "Novo objetivo com a IA" abaixo). A tela começa vazia (P20). Preencha título, prazo (cerca de 2 semanas à frente) e 2 etapas, e clique em **Encaixar no meu calendário**.
4. **Plano:** os blocos aparecem no Hoje (se houver horário livre ainda hoje) e no **Calendário**.
5. **Rampa:** no Hoje, faça o check-in de energia (Baixa, Média, Alta ou Elétrico) e clique em **Vamos começar?**. A rampa abre no degrau sugerido (P14).
   - Se o dia não tiver bloco, abra a rampa pela trilha do objetivo (**Começar próxima etapa**).
6. **Registrar:** termine o foco e escolha **Concluí**, **Parcial** ou **Não rolou**. Aparece a celebração com o novo percentual e depois o modal "7 dias regados" (valores fixos, P18).
7. **Plano recalculado:** no Hoje, o bloco aparece como **Concluída** e o percentual do objetivo sobe. Na trilha aparecem "1/2 concluídas" e o horário da próxima etapa.


### Novo objetivo com a IA (W27 → W29 → W30)

Desde 12/11/2026 o **Novo objetivo** abre na W27 (decisões IA1 e IA3):

1. Escreva o objetivo (ex.: `Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11`) e clique em **Analisar com IA**. Aparece "IA analisando…" (W29) e depois as etapas sugeridas (W30 preenchida), editáveis.
2. Clique em **Encaixar no meu calendário**. O objetivo é gravado com `source: "ai"` e a estimativa original de cada etapa.
3. Para o caminho manual, clique em **Prefiro preencher à mão**, abaixo do botão: abre a W30 vazia, como antes.
4. Se a IA falhar e o backend estiver com `AI_FALLBACK=none`, a W30 abre vazia (formulário manual, 4f).

Quem responde é o backend: com `AI_PROVIDER=rules` (padrão) as etapas vêm do motor de regras; com o Ollama, do modelo local. **Para trocar o motor, só o `apps/backend/.env` muda** (ver `docs/backend/COMO-TESTAR.md`, seção 8b) e o backend é reiniciado; o web não muda. No modo `example`, o rascunho é o fixo do protótipo.

Ponta a ponta do assistente (tarefa 11, usuário próprio, motor de regras; o Postgres precisa estar no ar):

```bash
npm --workspace @oitenta/frontend run test:e2e -- novo-objetivo-ia
```

O `npm --workspace @oitenta/frontend run test:e2e` sem filtro roda os dois specs (o fluxo principal e este). O Playwright sobe o backend com `AI_PROVIDER=rules AI_FALLBACK=rules`.

Para usar só os dados de exemplo, sem backend:

```bash
NEXT_PUBLIC_DATA_SOURCE=example npx turbo run dev --filter=@oitenta/frontend
```

## 4. Testes

**Unitários e de tela** (Vitest + Testing Library, com dados de exemplo):

```bash
npm run test --workspace @oitenta/frontend
```

Esperado: `Test Files 27 passed` e `Tests 208 passed` (números de 10/11), sem falhas.

**Ponta a ponta** (Playwright, contra o backend real). O teste:
- sobe o backend (`node dist/main`, porta 4000) e o frontend (`next dev`, porta 3000) sozinho;
- zera os dados do demo antes de rodar;
- percorre login demo → onboarding → objetivo → plano → Hoje → rampa → registrar → plano recalculado.

Precisa de: Postgres no ar com migrations e seed, `apps/backend/.env` presente, as portas 3000 e 4000 **livres**, e o build do passo 1.

```bash
npm --workspace @oitenta/frontend run test:e2e
```

Esperado: `1 passed` (cerca de 12 s depois do build).

O teste usa o relógio real:
- se não sobrarem 30 min livres até as 23h, ele abre a rampa pela trilha em vez do Hoje;
- para forçar esse caminho em qualquer horário, use `E2E_SEM_BLOCO_HOJE=1 npm --workspace @oitenta/frontend run test:e2e`;
- as capturas ficam em `apps/frontend/test-results/fluxo-principal` (ou na pasta de `E2E_SHOTS_DIR`).

Em caso de falha, abra o trace com `npx playwright show-trace <arquivo trace.zip>`, que fica dentro de `apps/frontend/test-results/`.

Se o navegador do Playwright não estiver instalado: `cd apps/frontend && npx playwright install chromium`.

## 5. Build de produção

```bash
npx turbo run build --filter=@oitenta/frontend && npm --workspace @oitenta/frontend run start
```

Abra **http://localhost:3000**. Para parar, use `Ctrl + C`.

## Comparações com o protótipo

As capturas lado a lado de cada tela e a lista de diferenças justificadas estão em `docs/frontend/comparacoes/`.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Telas vazias com "Algo deu errado" | Backend fora do ar no modo `http` | Suba o backend ou use `NEXT_PUBLIC_DATA_SOURCE=example` |
| Volta sempre para `/entrar` | Token expirado ou inválido (401) | Entre de novo pelo demo |
| Depois do demo, vai direto ao Hoje e não ao onboarding | O demo já tem grade gravada | `npm --workspace apps/backend run db:reset-demo` |
| `test:e2e` falha com porta em uso | Já há algo nas portas 3000 ou 4000 | `lsof -ti tcp:3000` / `lsof -ti tcp:4000` e encerre o processo |
| `Port 3000 is in use` no dev | Outro servidor na porta | Feche o outro terminal ou encerre o processo |
| Ícones viram quadrados vazios | Sem internet (CDN dos ícones) | Conecte-se e recarregue |
