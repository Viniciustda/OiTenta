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

## Decisões da Etapa A (P1–P28) — 10/11/2026

**Origem:** a Etapa A produziu a modelagem (`docs/3-modelagem-dominio.md`), o contrato da API (`docs/4-contrato-api.md`) e o plano (`docs/5-plano-execucao.md`). Escrever esses documentos revelou 28 pontos que nem as decisões anteriores, nem os casos de uso, nem os protótipos definiam, ou em que os protótipos web e mobile se contradiziam. Eles foram numerados P1–P28 e respondidos pelo dono do produto em 10/11/2026.

Regra geral da resposta: adotar a proposta do agente em todas, com os destaques em P6, P14, P20, P21, P22/P23, P24 e P28.

**Siglas das telas:**

| Sigla | Fonte |
|---|---|
| **W##** | `design/web/SCREENS.md` |
| **M##** | `design/mobile/app/SCREENS.md` |
| **T##** | `design/mobile/telas/SCREENS.md` |
| **DATA** | `design/mobile/app/source/bora-data.js` |

---

### P1 — Onde fica o fuso horário do usuário

- **Contexto:** a decisão 4c diz que todo horário agendado é guardado em UTC e que a grade semanal é guardada em hora local, interpretada "no fuso do usuário". A 4d lista "timezone" como atributo do usuário. Mas a entidade `User` implementada na Fase 6 (auth) tem só `name`, `email` e `password`. Sem o fuso, o motor do plano não sabe converter "segunda 19h" para um instante.
- **Opções:**
  - (a) acrescentar `timezone` ao `User`, enviado pelo cliente no cadastro;
  - (b) fixar `America/Sao_Paulo` para todos no MVP, sem campo novo;
  - (c) guardar o fuso na disponibilidade (`WeeklyAvailability`).
- **Decisão:** (a). Campo `timezone: string` no `User`, com um identificador IANA (ex.: `America/Sao_Paulo`).
  - É obrigatório na entidade.
  - No cadastro é **opcional na requisição**: se o cliente não mandar, vale `America/Sao_Paulo`.
  - O web lê o fuso do navegador (`Intl.DateTimeFormat().resolvedOptions().timeZone`) e o mobile, do aparelho.
- **Motivo:** é o que as decisões 4c e 4d já previam. O fuso é do usuário, não da agenda, e serve depois para e-mails (notifications) e para outras agendas. Com o padrão, nada quebra para quem não mandar.
- **Consequências:**
  - tarefa **C0** (`feat/auth-timezone`): muda a entidade `User`, o `RegisterUser`, a tabela `users` (migration com padrão para quem já existe), o `POST /auth/register` e o seed do usuário demo;
  - o `GET /auth/me` passa a devolver o `timezone`;
  - os orquestradores leem o fuso do usuário e o passam ao `GeneratePlan`;
  - fica preparado para mudar de fuso depois (um caso de uso de perfil, fora do MVP).
- **Status:** definitiva.

### P2 — Tamanho máximo dos títulos (objetivo e etapa)

- **Contexto:** nenhum documento nem design define limite para o título de um objetivo ou de uma etapa. A validação da entidade precisa de um número.
- **Opções:** sem limite; 80 (como o nome do usuário); 120.
- **Decisão:** de 1 a 120 caracteres, para objetivo e para etapa, depois de remover espaços nas pontas.
- **Motivo:** cabe títulos longos como "Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação" (75 caracteres, F §4) com folga, e protege o banco e as telas.
- **Consequências:** as regras `RequiredRule` + `MaxLengthRule(120)` em `Goal` e `Step`; cenários de erro na modelagem; o contrato responde 422 acima do limite.
- **Status:** definitiva.

### P3 — Prazo opcional

- **Contexto:** o caso de uso UC02 fala em prazo. Mas a tela "Preencher à mão" do mobile (M16) mostra "prazo opcional", e o objetivo "Portfólio no GitHub" do protótipo (DATA `ENTREGA[3] = null`) não tem prazo.
- **Opções:**
  - (a) prazo obrigatório;
  - (b) prazo opcional, e objetivos sem prazo entram no plano depois dos que têm prazo.
- **Decisão:** (b). `Goal.deadline` é uma data local (`YYYY-MM-DD`) ou `null`. No `PlanCalculator`, os sem prazo são ordenados depois de todos os com prazo (desempate pela data de criação). Sem prazo, não há folga nem inviabilidade: o objetivo usa o espaço que sobrar.
- **Motivo:** é o que os dois designs mostram, e combina com o algoritmo "prazo mais cedo primeiro" (D 4g).
- **Consequências:** cenário 10 do `PlanCalculator`; o contrato aceita `deadline: null`; as telas mostram "sem prazo" onde o protótipo mostra a data.
- **Status:** definitiva.

### P4 — Cor do objetivo

- **Contexto:** os protótipos dão uma cor a cada objetivo (`--obj1` a `--obj4`; DATA `OBJ`), usada nos pontos do calendário, na timeline e na trilha. Nada diz como a cor é escolhida. No web, a 4ª cor é roxa (W31).
- **Opções:** escolha do usuário; derivada do id; sequencial.
- **Decisão:** sequencial. Ao criar um objetivo, `colorIndex` = próximo índice de 1 a 4 entre os objetivos **ativos** do usuário, voltando ao 1 depois do 4. A cor é guardada e não muda depois.
- **Motivo:** não há tela para escolher cor, e o resultado coincide com o protótipo (o 1º verde, o 2º azul, o 3º verde-água, o 4º roxo no web).
- **Consequências:** `CreateGoal` calcula o índice a partir de `findAllByUser`; cenário específico no `CreateGoal`; o web e o mobile mapeiam o índice para o token `--obj<n>` de cada um.
- **Status:** definitiva.

### P5 — Estimativa de cada etapa

- **Contexto:** a decisão 4c define granularidade de 15 min e bloco mínimo de 30 min. O mobile oferece chips de 15 min a 2h (M16) e o web soma ou subtrai 15 min ao editar a trilha (W23). Faltava o mínimo e o passo.
- **Decisão:** `estimatedMinutes` é inteiro, no mínimo 15 e múltiplo de 15.
- **Motivo:** bate com a granularidade da agenda e com os controles dos dois designs.
- **Consequências:** validação na entidade `Step`; cenário de erro com 20 min; o contrato responde 422.
- **Status:** definitiva.

### P6 — Texto do micro-passo no objetivo manual

- **Contexto:** o degrau Micro-passo da rampa mostra uma instrução mínima da etapa (F §3). No protótipo, cada etapa traz os seus micro-passos (DATA `ETAPAS[].micro`), que viriam da IA. Num objetivo criado à mão, não há de onde tirá-los.
- **Opções:** obrigar o usuário a escrever; campo opcional com um texto genérico quando vazio; esconder o degrau.
- **Decisão:** `Step.microSteps` é uma lista opcional. Quando vazia, a rampa usa o texto genérico:
  > **"Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase."**

  **Status: provisório, a validar com o time.**
- **Motivo:** mantém a rampa completa sem IA e no espírito do produto ("um passo tão pequeno que não dá pra travar", landing).
- **Consequências:**
  - o `BuildRamp` recebe os micro-passos da etapa e, se vierem vazios, devolve a opção genérica;
  - novo cenário em `BuildRamp`;
  - o texto fica numa constante do domínio (`activation`), fácil de trocar;
  - quando a IA entrar (Fase 7), ela preenche `microSteps`.
- **Status:** **provisória**.

### P7 — Faixa do limite diário

- **Contexto:** o onboarding web usa um slider de 60 a 300 min, de 30 em 30, começando em 180 (W09; `AppOnboarding.dc.html`). O onboarding mobile usa um slider de 1h a 8h (T03).
- **Decisão:** o domínio aceita de **60 a 480 min, em múltiplos de 30**. Cada cliente mostra a faixa e o passo do seu próprio design.
- **Motivo:** o domínio cobre os dois designs sem forçar nenhum a mudar.
- **Consequências:** validação em `WeeklyAvailability`; cenários de limite 25, 490 e 45 (inválidos) e 60, 480 (válidos).
- **Status:** definitiva.

### P8 — Compromissos (aula, estágio) sem tela

- **Contexto:** as decisões 4b e 4e preveem `Commitment` (compromisso único ou recorrente que ocupa tempo). Nenhum design tem tela para cadastrá-los. A grade do onboarding web (W07) mostra "Aula" e "Estágio" ocupando horários, mas isso está **fixo no código do protótipo** (`AvailGrid.dc.html`, função `busy`), não vem de dados do usuário.
- **Decisão:**
  - nesta fase, existem só o domínio: a entidade `Commitment`, o `RecurrenceExpander` e a fonte `CommitmentBusySource`, todos testados;
  - não há endpoint nem tela;
  - a grade do onboarding web mostra células de ocupado **só se** houver compromissos; no MVP, nenhuma.
- **Motivo:** não inventar tela, e deixar o motor pronto para quando a tela, o parser de rotina por IA (4b) ou o Google Calendar existirem.
- **Consequências:** B2 implementa o domínio; C2 não cria tabela de compromissos (**pendência registrada**: a migration de `commitments` entra quando houver tela); a grade web fica sem hachurado.
- **Status:** definitiva para o MVP.

### P9 — Último dia de trabalho com folga

- **Contexto:** a decisão 4g diz "folga de 1 dia antes do prazo", mas não diz se o prazo é o dia da entrega nem se dá para trabalhar nele.
- **Decisão:** o prazo é o **dia da entrega**, e não se agenda trabalho nele. O último dia de trabalho é **prazo − 1 − folga**. Com folga de 1 dia e prazo 24/11, o último dia é 22/11 (o 23/11 é a folga).
  - Se não couber, o motor tenta sem a folga (último dia 23/11).
  - Se ainda não couber, o objetivo é inviável.
- **Motivo:** é a leitura mais segura para o estudante: entregar não é dia de fazer, e a folga existe de verdade.
- **Consequências:** regra central do `PlanCalculator`; cenários 1, 4 e 5.
- **Status:** definitiva.

### P10 — Bloco mínimo × etapa curta

- **Contexto:** o bloco mínimo é de 30 min (4c), mas uma etapa pode ter 15 min (P5).
- **Decisão:** o mínimo de 30 min vale **ao dividir** uma etapa em vários blocos. Uma etapa (ou o resto dela) menor que 30 min vira um bloco do próprio tamanho.
- **Consequências:** regra do `PlanCalculator`; invariante verificada no cenário 1.
- **Status:** definitiva.

### P11 — O exemplo "8h15 em 6 dias · folga de 1 dia"

- **Contexto:** F §5 mostra o resumo "8h15 encaixadas em 6 dias · folga de 1 dia" para o exemplo das 7 etapas, mas não diz qual era a disponibilidade.
- **Decisão:** o teste do exemplo verifica **invariantes**:
  - os 495 min alocados;
  - a ordem das etapas;
  - o limite diário;
  - o bloco mínimo;
  - o último dia permitido.

  Não verifica o número "6 dias". A disponibilidade do teste é fixa e explícita: todos os dias das 19h às 23h e limite de 120 min.
- **Status:** definitiva.

### P12 — Gerar plano sem disponibilidade cadastrada

- **Decisão:** `GeneratePlan` (e todo fluxo que o chama) responde `NotFoundError` (404) se o usuário ainda não fez o onboarding. O web e o mobile mandam o usuário ao onboarding depois do login quando `GET /scheduling/availability` responde 404.
- **Status:** definitiva.

### P13 — Bloco que atravessa a meia-noite

- **Decisão:** o bloco pertence ao dia (local) em que começa. Nos designs as janelas vão até 23h, então é raro.
- **Status:** definitiva.

### P14 — Níveis de energia e degrau sugerido

- **Contexto:** os dois protótipos se contradizem:
  - **mobile** (M05; F §3): 4 níveis (Baixa, Média, Alta, Elétrico) e a tabela Baixa → Aquecer, Média → Desafio, Alta → Micro-passo, Elétrico → Foco;
  - **web** (W12–W14; landing): 3 níveis (Baixa, Média, Alta), com "Alta" levando "direto pro desafio".
- **Opções:** cada app segue o seu protótipo; os dois seguem o mobile; os dois seguem o web.
- **Decisão:** **web e mobile seguem os 4 níveis do mobile e a tabela de `docs/0-fluxos.md` §3.** O web deixa de seguir o protótipo **só neste ponto**: o check-in do Hoje web (W12–W14) ganha o 4º chip "Elétrico", com o mesmo estilo visual dos outros três, e o degrau sugerido segue a tabela. A landing não muda (é marketing e continua com o texto do protótipo).
- **Motivo:** uma regra só no domínio, um só comportamento para o usuário, e a tabela dos fluxos é a fonte mais antiga e explícita.
- **Consequências:**
  - `RampSuggestion` com a tabela de F §3;
  - B4 implementa o 4º chip no web e registra isso como **diferença intencional** em relação ao screenshot;
  - o contrato aceita `low | medium | high | electric`.
- **Status:** definitiva.

### P15 — Efeito do "tempo disponível agora"

- **Contexto:** o check-in mobile pergunta "Quanto tempo você tem agora?" (15 min, 30 min, 1h, 2h+; M05). Nenhum documento diz o que essa resposta muda.
- **Decisão:** nesta fase ela é **só gravada** na sessão de foco (`FocusSession.availableTime`), sem efeito na rampa nem no foco. O web não pergunta (`null`).
- **Motivo:** não inventar regra; guardar o dado para usar depois (ex.: encurtar o foco ou escolher etapa menor).
- **Status:** definitiva para o MVP.

### P16 — Texto da opção "Tarefa leve de 5 min" do aquecimento

- **Contexto:** o catálogo do aquecimento (DATA `ALTS.aquecer`) inclui "Tarefa leve de 5 min", cuja descrição cita um dado de exemplo ("Renomear os PDFs de Cálculo").
- **Decisão:** manter o texto **literal** do protótipo no catálogo fixo do MVP. Quando as tarefas leves do usuário entrarem (UC13, outra `RampOptionSource`), essa opção passa a vir delas.
- **Status:** provisória até o UC13.

### P17 — Orquestradores de leitura que juntam dados

- **Contexto:** a decisão 5.9 diz que o orquestrador "só encadeia casos de uso, nunca calcula". Para a tela Hoje, o calendário e a lista de objetivos, os blocos do plano (`scheduling`) precisam do título e da cor do objetivo (`goals`).
- **Decisão:** aceitar orquestradores de leitura (`day-view`, `week-view`, `goals-view`) que **juntam** o resultado de dois casos de uso por id. Juntar não é calcular: nenhuma regra de negócio mora neles.
- **Status:** definitiva.

### P18 — Barra gamificada e celebração

- **Contexto:** gamificação está fora do MVP (D 4a, "Fora do MVP"), mas os designs mostram a barra de sequência, gotas e nível (M01, W12), as gotas nos degraus e a celebração com "+20" e XP (M12, W41).
- **Decisão:** as telas mostram esses elementos **com os valores fixos do protótipo**, sem lógica e sem endpoint.
- **Motivo:** fidelidade ao design sem implementar regras fora do escopo.
- **Consequências:** os valores ficam nos dados de exemplo das telas; o módulo `gamification` continua vazio; quando ele existir, só a fonte desses números muda.
- **Status:** provisória até a gamificação.

### P19 — Erro de formato (400) × regra de domínio (422)

- **Contexto:** o contrato pede 400 para requisição malformada. Hoje o backend só tem a validação do domínio, que responde 422, e um tipo errado pode virar 500.
- **Opções:** `class-validator` + `class-transformer` (padrão do Nest); validação à mão no controller.
- **Decisão:** `class-validator` + `class-transformer`, com `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
  - Formato ou tipo inválido → **400**.
  - Regra de domínio → **422**.
  - Os corpos já são classes do Swagger (D 5.5), e os decorators de validação entram nelas.
- **Consequências:**
  - dependências novas no backend;
  - o filtro de erros já trata `HttpException` (400);
  - cada endpoint ganha um teste de integração de 400;
  - com `forbidNonWhitelisted`, um `userId` no corpo passa a dar 400, em vez de ser ignorado.
- **Status:** definitiva.

### P20 — Telas do objetivo manual com etapas

- **Contexto:** "objetivo manual com etapas" está no mínimo obrigatório (4a), mas não tem design em nenhum app:
  - no web só existe o fluxo com IA (W27–W31);
  - no mobile, "Preencher à mão" (M16) é uma tarefa única;
  - os dois têm uma lista de etapas editáveis que normalmente vem da IA (W30, M15).
- **Opções:**
  - (a) usar as telas de etapas editáveis (W30/M15) começando vazias;
  - (b) placeholder;
  - (c) só a tarefa única.
- **Decisão:** (a). O objetivo manual usa as telas **W30 (web)** e **M15 (mobile)** começando **vazias**: título, prazo, a lista de etapas com tempo e total, "Adicionar etapa" e o botão de encaixar no calendário. Os elementos que dependem da IA (requisitos encontrados, "analisando") não aparecem.
  - O mobile continua oferecendo também "Preencher à mão" (M16) para a tarefa única (`kind 'single'`).
- **Motivo:** aproveita o design existente mais próximo e mantém o mesmo fluxo quando a IA entrar (ela só vai preencher a mesma lista).
- **Consequências:** B4 e B5 implementam essas telas e registram como **adaptação intencional** o estado vazio e a entrada direta (sem passar pelo chat); `POST /goals` atende os dois casos.
- **Status:** definitiva.

### P21 — Testes no web

- **Decisão:** `vitest` + `@testing-library/react` + `jsdom` em `apps/frontend`, com script `test` no workspace (entra no `npm run test --workspaces`).
- **Motivo:** o processo exige TDD no web, e o frontend não tinha executor de teste. O Vitest é leve e se integra a TypeScript e React sem configuração pesada.
- **Status:** definitiva.

### P22 — Fontes no Flutter

- **Decisão:** usar o pacote **`google_fonts`** para Fredoka e Nunito, com os pesos dos protótipos.
- **Motivo:** dispensa baixar e versionar arquivos de fonte agora.
- **Atenção:** o pacote baixa as fontes na primeira execução. Para os testes não dependerem de rede, eles usam `GoogleFonts.config.allowRuntimeFetching = false` e caem na fonte padrão.
- **Status:** definitiva; trocar por `.ttf` locais é simples se a rede incomodar.

### P23 — Ícones no Flutter

- **Decisão:** pacote **`phosphor_flutter`**, a mesma família de ícones (Phosphor) dos protótipos.
- **Status:** definitiva.

### P24 — URLs do web

- **Contexto:** os protótipos navegam por âncoras (`#login`, `#cadastro`).
- **Decisão:** `/entrar`, `/cadastro`, `/onboarding`, `/hoje`, `/calendario`, `/objetivos/[id]`. A rampa e o novo objetivo são modais sobre `/hoje`, como no protótipo. "Entrar" e "Começar grátis" da landing passam a levar a `/entrar` e `/cadastro`.
- **Status:** definitiva.

### P25 — Ponta a ponta do web

- **Decisão:** `@playwright/test`, para o teste da Etapa E.
- **Status:** definitiva.

### P26 — Cliente HTTP do mobile

- **Decisão:** pacote **`http`** (oficial do Dart).
- **Motivo:** é o mais simples; não precisamos de interceptadores elaborados no MVP.
- **Status:** definitiva.

### P27 — Passos do onboarding mobile sem design

- **Contexto:** o "Bora Telas" traz 3 telas do onboarding (passos 2, 4 e 5 de 6: T01, T02, T03). Os blocos 2 e 3 do design não vieram.
- **Decisão:** os passos sem design são **placeholder** (nome da tela + um botão que avança), conforme a regra das telas sem design (4i). Login e cadastro mobile também são placeholder.
- **Status:** provisória até o design.

### P28 — Preparação das worktrees dos subagentes

- **Contexto:** cada subagente da Etapa B trabalha numa worktree nova, que não tem `node_modules`, e o subagente não pode instalar dependências.
- **Decisão:** antes de entregar a worktree, o orquestrador roda `npm ci` (instala exatamente o que está no `package-lock.json`, sem acrescentar nada) e `flutter pub get` (mobile).
- **Status:** definitiva.

### Dependências novas aprovadas (e nenhuma outra)

| Dependência | Onde | Decisão |
|---|---|---|
| `vitest`, `@testing-library/react`, `jsdom` | `apps/frontend` | P21 |
| `class-validator`, `class-transformer` | `apps/backend` | P19 |
| `@playwright/test` | `apps/frontend` | P25 |
| `go_router` | `apps/mobile` | 5.7 |
| `google_fonts`, `phosphor_flutter` | `apps/mobile` | P22, P23 |
| `http` | `apps/mobile` | P26 |

Dependências técnicas indispensáveis para as aprovadas funcionarem (ex.: `@vitejs/plugin-react` para o Vitest entender JSX, `@testing-library/dom` exigida pela Testing Library) são registradas no diário (`docs/6-diario-execucao.md`) quando instaladas.

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
