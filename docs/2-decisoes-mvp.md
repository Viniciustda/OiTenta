# Decisões do MVP — 10/11/2026

Registro das decisões fechadas em 10/11/2026. **Quando algo aqui conflitar com `docs/1-passo-a-passo.md`, vale este documento.**

Prazo: MVP funcional até **30/11/2026**. Time de 4 pessoas, encontros às sextas (13, 20 e 27/11). O projeto continua depois do hackathon: **corte escopo, nunca estrutura** (domínio puro em `modules/`, contratos no domínio, implementações no backend, posse pelo token, testes no domínio).

---

## 4a. Fatia do MVP

- **Meta:** todo o MVP original de `docs/0-casos-de-uso.md` até 30/11.
- **Mínimo obrigatório** (nunca é cortado): o calendário (disponibilidade → objetivo → etapas → plano → Hoje → registrar → recalcular) + a rampa mínima.
- **Se atrasar:** corta-se o resto, na ordem de prioridade do cronograma, e nunca o mínimo.

**Rampa:** degraus em ordem crescente de dificuldade, que levam o usuário até conseguir se concentrar na tarefa. Cada degrau oferece **várias opções de atividade**, e o usuário escolhe uma.

- **MVP:** as opções vêm de um catálogo fixo.
- **Futuro:** as tarefas pequenas que o usuário cadastra (arrumar a cama, marcar corte de cabelo) aparecem como opções dos degraus. Isso **é o UC13 (tarefas leves)**, que o `0-casos-de-uso.md` já descreve como "usadas também como aquecimento".
- **Projetado agora:** as opções vêm de uma interface `RampOptionSource` declarada no módulo `activation`. No MVP há uma implementação com o catálogo fixo. Depois entra outra com as tarefas do usuário (ou uma que combine as duas), sem mudar a rampa.

## 4b. Cadastro × onboarding

- O **cadastro** (nome, e-mail, senha) é separado do onboarding.
- O **onboarding**, logo depois do cadastro, coleta **só** a grade de horários livres e o limite diário de foco.
- **Futuro:** o usuário manda um texto livre sobre a rotina e a IA o transforma em compromissos, recorrentes ou não.
- **Projetado agora:**
  - o onboarding chama os mesmos casos de uso que a IA vai chamar depois (`SetWeeklyAvailability`, `CreateCommitment`);
  - o parser de rotina será só mais um provider (ex.: `RoutineParserProvider`), sem caso de uso novo;
  - compromisso pode ser recorrente **ou** único (decisão abaixo).

**Decisão: `Commitment` com regra de recorrência opcional**, substituindo o `RecurringTask` proposto.

- `Commitment { userId, title, kind (commitment|task), start/end ou duração, recurrence? }`. Sem `recurrence`, é um evento único; com ela, é recorrente.
- **Por que juntar:** para a agenda os dois são a mesma coisa, um intervalo que ocupa tempo. Separar obrigaria toda fonte de ocupação, o futuro parser de rotina e a tela a tratar dois tipos. A diferença fica num único lugar: a expansão das ocorrências (`RecurrenceExpander`), que, sem regra, devolve uma ocorrência só.
- A conclusão ou o pulo de cada ocorrência continua em `OccurrenceRecord`.

## 4c. Modelo de tempo

A grade semanal guarda **horários locais** ("seg 19:30–23:00"), interpretados no fuso do usuário (`America/Sao_Paulo`). Todo bloco agendado é salvo como **instante em UTC**.

Exemplo de rotina com limite de 2h/dia:
- **grade:** seg–sex 19:30–23:00;
- **compromissos recorrentes seg–sex:** aula 06:30–12:20 e estágio 13:30–19:30. Ficam fora da grade e aparecem no calendário como ocupados.
- **o motor** usa só o intervalo livre (19:30–23:00), com no máximo 120 min de etapas por dia, em blocos de pelo menos 30 min, alinhados a cada 15 min.
- **gravação:** um bloco de ter 11/11 das 20:00 às 21:00 (local) é salvo como 23:00–00:00 UTC. Se o usuário mudar de fuso, a grade continua "à noite" no novo fuso.

## 4d. Entidades e desacoplamento

As entidades da resposta de 10/11 foram aceitas, com `Commitment` no lugar de `RecurringTask` (4b). Tudo pertence a um `userId`.

| Módulo | Entidades |
|---|---|
| `auth` | User (nome, e-mail, senha com hash, timezone) |
| `goals` | Goal (com Step dentro do agregado) |
| `scheduling` | WeeklyAvailability, Commitment, OccurrenceRecord, ScheduledBlock |
| `activation` | FocusSession |

- Tarefa à mão / avulsa = Goal com 1 etapa (tipo `single`).

**Requisito forte: desacoplamento**, porque o modelo vai mudar. Interfaces **só nas fronteiras**:
- repositórios;
- providers externos (IA, e futuramente e-mail e leitura de páginas);
- comunicação entre módulos;
- fontes de dados que vão variar:
  - opções dos degraus (`RampOptionSource`);
  - fontes de ocupação da agenda (`BusySource`: compromissos agora, Google Calendar depois).

**Sem interface** para entidade, value object ou classe pura de cálculo, só por criar. Referências entre módulos **só por id**.

## 4e. Recorrência

Aceito como proposto: estrutura própria `{ diasDaSemana[], horaInicio, duracaoMin, dataInicio, dataFim? }`, compatível com o subconjunto BYDAY da RRULE. Ocorrências calculadas para a janela pedida; só a conclusão ou a exceção de cada uma é persistida. Edição no MVP: só "todas".

## 4f. Papel da IA

- **Duas chamadas:**
  - `parseGoal`: texto livre → título, prazo, tipo, campos faltando;
  - `suggestSteps`: objetivo → etapas com estimativa e micro-passo.
- O usuário sempre confirma ou edita antes de salvar.
- **Se a IA falhar:** abre o formulário manual, que é sempre um caminho completo.
- **Estimativa:** a IA sugere e o usuário confirma; `aiEstimate` e `estimate` ficam salvos separadamente.
- **O motor do calendário nunca usa IA.**
- O fornecedor está em aberto (5.8). O `GoalAssistantProvider` é neutro.

## 4g. Motor do calendário

Aceito como proposto:
- guloso por prazo mais cedo, com etapas em ordem;
- folga de 1 dia antes do prazo, que cai se for o único jeito de caber;
- limite diário somando todos os objetivos;
- recalcula só o futuro não concluído e não fixado;
- quando não cabe, no MVP apenas avisa;
- determinístico, com modo de simulação (calcula sem salvar).

## 4h. Progresso

- **Por porcentagem**, tanto no objetivo quanto em cada etapa. O usuário pode informar quanto já fez de cada uma.
- **Objetivo = média ponderada das etapas pela estimativa:** Σ(estimativa × %) ÷ Σ estimativa. Concluir 1 de 5 etapas iguais mostra 20% e "faltam 4".
- **Etapas criadas no início:** geradas pela IA ou à mão na criação do objetivo, confirmadas e salvas.
- **Projetado agora:**
  - etapas substituídas não são apagadas: ganham o status `superseded`;
  - uma etapa `superseded` conta para o objetivo só com o que já foi feito (o peso dela passa a ser os minutos feitos), então o objetivo continua calculável quando o conjunto de etapas muda.
- **Futuro — replanejar o restante com IA:** juntar o que falta (ex.: 50% da etapa 1 + etapas 2–4) e propor novas etapas.
  - **Complexidade:** média. Precisa de uma terceira chamada no `GoalAssistantProvider`, um caso de uso que marca etapas como `superseded` e cria as novas, e uma tela de confirmação. Estimativa: 1,5–2 dias de uma pessoa.
  - **Fica fora do MVP**, a não ser que a fatia mínima e os dois apps estejam prontos até 20/11.

## 4i. Web × mobile (correção)

- **Web:** Next.js, segue o design **web**. App completo.
- **Mobile:** Flutter, segue os designs **mobile**, que são dois e ambos valem: `Bora App` (`design/mobile/promptMobile1.md`) e `Bora Telas` (`design/mobile/promptMobile2.md`). App completo.
- **Designs importados em 10/11** (exports do Claude Design em `design/`, sem MCP):
  - **Web: há web app completo além da landing.** São 44 telas e estados em `design/web/SCREENS.md`: login com "Entrar como demo", cadastro, onboarding em 4 passos, Hoje, Calendário (dia, semana e mês; Execução e Prazos), Objetivos e trilha, Tarefas leves, Jardim, Configurações, Novo objetivo e Rampa completa.
    - Faltam na web: preencher à mão (UC30), pedir ajuda (UC31) e as opções do plano inviável (UC11).
  - **Mobile `Bora App`**: protótipo navegável com as 4 abas, a rampa completa, novo objetivo (chat e preenchimento à mão), plano inviável, trilha, calendário, tarefas leves, pausa, pedir ajuda e perfil. Não tem login, cadastro nem onboarding.
  - **Mobile `Bora Telas`**: onboarding (boas-vindas, horários livres por período, limite diário), marcado como "bloco 1 de 3, aguardando aprovação"; os blocos 2 e 3 não vieram.
  - Tokens extraídos em `design/tokens.md`, com as divergências em relação a `docs/0-design-system.md` (o design system não foi alterado).
- **Visual (decidido em 10/11):** cada app segue **exatamente o próprio protótipo**, inclusive onde ele diverge do `0-design-system.md` (ex.: fundo branco no mobile, 4º objetivo roxo na web, check-in de 3 níveis na web).
- **Telas sem design (decidido em 10/11):** telas necessárias que não têm design (ex.: login, cadastro e onboarding no mobile) são feitas como **placeholder**: só o nome da tela e um botão que avança no fluxo, para o fluxo ficar visível.
  - Não adaptar o visual do web para elas; a sugestão de adaptar foi recusada.
  - O design dessas telas será feito primeiro no Claude Design, e só então elas serão implementadas de verdade.

## 4j. Repositório

100% público até a apresentação; depois vira privado. Assunto encerrado.

## Técnicas já resolvidas

- **5.10:** 100% de cobertura no domínio.
- **5.11:** branches `main` (no ar) ← `developer` (integração) ← `feat/<módulo>-<assunto>`. PR para `developer` com 1 revisão e CI verde, *squash merge*. `developer` → `main` nos marcos.
- **5.8 Parceiros do hackathon:** usar sempre que houver caso de uso real, porque o prêmio é em créditos deles; nunca inventar uso.
  - **Devin (Cognition)** é agente de código: ferramenta do time para desenvolver, não LLM dentro do app.
  - O fornecedor do `GoalAssistantProvider` será escolhido na lista de parceiros. Lista pendente.
- **5.13 (executado em 10/11):**
  - `@poupig` → `@oitenta` nos templates do `module-aggregate`;
  - `dist/**` nos `outputs` do turbo;
  - `no-floating-promises` como erro no backend e nos módulos;
  - `typescript` da raiz e de `packages/ui` trocado de 7.0.2 para `^5.9.2`, porque a v7 quebrava o ESLint.
- **Lint (corrigido em 10/11):** passa nos 9 workspaces (backend, frontend, `packages/ui` e os 6 módulos).
  - Backend: formatação do prettier corrigida e `bootstrap()` agora com `.catch` que registra o erro e encerra o processo. O script `lint` só verifica; o `--fix` passou para `lint:fix`.
  - Frontend: o ESLint não encontrava o `next` porque havia dois Reacts no monorepo (19.2.8 trazido pelo Prisma Studio e 19.3.0 do frontend). Agora há um só, via `overrides` no `package.json` da raiz.
  - `packages/ui`: `@repo/eslint-config` e `@repo/typescript-config` trocados por `@oitenta/*`.
- **5.3 Migrations e seed:** `prisma migrate deploy` na inicialização do backend + seed idempotente que cria só o usuário de demonstração (`DEMO_EMAIL`, `DEMO_PASSWORD`).
- **5.4 Auth:** login real com `spec-backend-auth-basic` + botão "Entrar como demo" pela rota `POST /auth/demo`, que devolve o token do usuário de demonstração. Nenhuma senha no app.
  - JWT com `sub` = id do usuário e `email`, validade de 1 dia (`JWT_EXPIRES_IN`), segredo em `JWT_SECRET`.
  - E-mail duplicado → 409; credenciais inválidas → 401 com mensagem única (não revela se o e-mail existe).
- **5.5 Contrato backend ↔ apps:** opção A.
  - Swagger em `/docs` (com Authorize por Bearer); `openapi.json` exportado para `packages/contracts/openapi.json` com `npm --workspace apps/backend run openapi:export` (não precisa de banco nem servidor).
  - Clientes escritos à mão no web e no mobile.
  - Os corpos e respostas viram **classes anotadas** (`<modulo>.dto.ts`, implementando as interfaces `In`/`Out` do caso de uso), porque o Swagger não enxerga interfaces.
  - **Evolução para a opção B** (clientes gerados): adotar quando qualquer uma destas acontecer:
    - mais de 25 endpoints;
    - 2 ou mais quebras entre backend e apps por mudança de contrato numa mesma semana;
    - uma terceira pessoa passando a consumir a API nos apps.
- **5.6 Mobile no aparelho:**
  - alvo principal: **iPhone físico** (conta paga de Apple Developer, então o app não expira) e **simulador iOS**, no Mac que já tem Xcode;
  - sem TestFlight nem distribuição agora;
  - **Android fica para depois**, para os colegas. Eles vão precisar de:
    - JDK 21 (o Gradle do projeto aceita 17–24) apontado com `flutter config --jdk-dir`;
    - `adb reverse tcp:4000 tcp:4000` para o celular por cabo enxergar o backend local;
    - configuração de rede de debug que libere `http` para a rede local;
  - o APK fica para o fim.
- **5.6 URL do backend no mobile:**
  - `--dart-define-from-file=env/<ambiente>.json`, com 4 ambientes:
    - `local-simulator` (`localhost`);
    - `local-iphone` (IP do Mac; arquivo fora do git, com modelo em `local-iphone.example.json`);
    - `developer` e `prod`, com URLs ainda de exemplo até a decisão de hospedagem;
  - uma opção de Run para cada ambiente no VS Code (`.vscode/launch.json`);
  - lida só em `lib/core/config/app_config.dart`.
- **5.6 HTTP na rede local (iOS):** `NSAllowsLocalNetworking` no `Info.plist`. Essa chave libera `http` **só para endereços da rede local**; a internet continua exigindo `https`.
  - Limitação: ela vale também no build de produção. Restringir ao build de desenvolvimento exige um passo de build no projeto do Xcode; fica como melhoria.
- **5.7 Estado e navegação no Flutter:** telas primeiro, com as 4 regras de `.agents/rules/mobile-flutter.md` desde o primeiro dia:
  1. telas só recebem dados e avisam ações;
  2. chamadas ao backend em `features/<x>/data/`;
  3. um controlador `ChangeNotifier` por tela;
  4. rotas centralizadas.
  - go_router desde o início. Riverpod fica para depois, se o time quiser.
- **5.9 Comunicação entre módulos:** orquestrador no backend.
  - Ele só encadeia casos de uso e nunca calcula nada.
  - Cada fluxo fica num arquivo próprio (ex.: `record-progress.orchestrator.ts`), para não virar um arquivo-deus.
- **Cobertura:** o `jest.config.ts` de cada módulo mede só `src/`. Os fakes em `test/mock/` são código de teste e não contam para a meta de 100%.
- **Designs:** a fonte da verdade visual são os exports do Claude Design salvos em `design/` (não o MCP). Cada tela é implementada a partir do `.dc.html` + screenshot de referência, usando só tokens.

---

## Pendências para sexta, 13/11

1. Hospedagem da landing e do web (provavelmente Vercel).
2. Hospedagem do backend e do banco, e como fazer o deploy do monorepo (5.1, 5.2).
3. CI (5.12).
4. Provedor de LLM entre os parceiros (5.8).
5. Escopo do web app: o export web traz o app completo (ver `design/web/SCREENS.md`); confirmar quais telas entram no MVP.
6. Divergências de tokens (`design/tokens.md`): decidir a cor de fundo do mobile (`#FFFFFF` × `#F6FAF8`), a cor do 4º objetivo (roxo na web × verde no mobile), os estágios do Broto e o check-in de 3 × 4 níveis na web.
7. Mobile: login, cadastro e os blocos 2 e 3 do onboarding não têm design; ficam como placeholder (4i) até o design ser feito no Claude Design.
8. Cronograma revisado e divisão de tarefas entre as 4 pessoas.
