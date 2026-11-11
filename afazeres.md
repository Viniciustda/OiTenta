# Afazeres

Lista única de erros, problemas, perguntas e pendências do projeto. Regras completas em `.agents/rules/processo-desenvolvimento.md` (seção 10).

- Formato: `- [ ] [TAG] Título curto — (origem: arquivo/tarefa/data)`. Concluído vira `- [x]`, com o commit ou a decisão que fechou o item. Itens concluídos não são apagados.
- Tags:
  - **[INVESTIGAR]**: algo deu errado e a causa ainda não é conhecida (sintoma, como reproduzir, erro exato, onde já se olhou).
  - **[DECIDIR]**: o problema é conhecido e há mais de um jeito de resolver; espera decisão do usuário (contexto, problema, alternativas numeradas, recomendação).
  - **[EXECUTAR]**: a decisão já está tomada; falta implementar (o que fazer e critério de pronto).
- Quando um [DECIDIR] for decidido, ele vira [EXECUTAR] com a decisão escrita no item, e a decisão vai também para `docs/2-decisoes-mvp.md`.
- Item que envolve mais de um projeto fica no projeto onde a correção acontece, com referência cruzada nos outros.
- Só o orquestrador edita este arquivo; os subagentes reportam os itens para ele.

Siglas: W = tela do protótipo web (`design/web/SCREENS.md`); M = tela do mobile (`design/mobile/app/SCREENS.md`); P = decisão da Etapa A (`docs/2-decisoes-mvp.md`); "diário" = `docs/6-diario-execucao.md`; "pergunta N" e "problema N" = numeração do diário em 10/11/2026.

---

## Frontend (web)

- [ ] [DECIDIR] Modal "7 dias regados" (W40) com valores fixos — (origem: diário, pergunta 8, B4, 10/11/2026)
  - **Contexto:** ao registrar "Não rolou" na rampa do web, o protótipo mostra um modal com confete e "7 dias regados". Gamificação está fora do MVP; pela P18, os elementos de gamificação aparecem com os valores fixos do protótipo.
  - **Problema:** o modal mostra um número que não vem de nenhum dado real. Um usuário pode achar que é a sequência dele.
  - **Alternativas:**
    1. **Manter com valores fixos (como está).** Código: nada. Telas: iguais ao protótipo. Prazo: zero. Vantagem: fidelidade ao design e coerência com a P18. Desvantagem: número falso na tela.
    2. **Remover o modal até a gamificação existir.** Código: tirar o componente e ajustar os testes do fluxo "Não rolou" (cerca de 30 min). Telas: o "Não rolou" vai direto para a mensagem sem culpa. Prazo: curto. Vantagem: nenhum dado falso. Desvantagem: foge do protótipo; o modal volta depois.
  - **Recomendação:** 1. É exatamente o caso que a P18 decidiu, e quando a gamificação entrar só muda a fonte do número.

- [ ] [DECIDIR] Rampa do web sem check-in de energia — (origem: diário, pergunta 9, B4, 10/11/2026)
  - **Contexto:** no web, o check-in de energia (3 níveis) fica no Hoje (W12–W14), não dentro da rampa. Ao abrir a rampa, ela começa no Aquecer.
  - **Problema:** se o usuário não escolheu a energia, a sessão é gravada com `energy: "low"`, um valor que ele não informou. Ligado ao item "energia escolhida se perde" abaixo.
  - **Alternativas:**
    1. **Manter (`low` como padrão).** Código: nada. Telas: iguais. Prazo: zero. Vantagem: simples. Desvantagem: grava dado que o usuário não deu.
    2. **Obrigar o check-in antes de "Vamos começar?"** (botão desabilitado até escolher). Código: estado do Hoje e testes (1–2 h). Telas: um estado novo do botão, que o protótipo não define. Vantagem: dado sempre real. Desvantagem: um passo a mais para quem trava ao começar, contra a proposta do produto; comportamento sem design.
    3. **Usar a energia escolhida quando houver e `low` só quando não houver**, marcando no código que é padrão. Código: passar a energia do Hoje para a rampa (o mesmo trabalho do item "energia se perde"). Telas: iguais. Prazo: 1–2 h junto com aquele item. Vantagem: sem atrito e sem tela nova. Desvantagem: ainda grava `low` quando o usuário pula o check-in.
  - **Recomendação:** 3, resolvido junto com o item "energia escolhida se perde": não cria atrito nem tela sem design.

- [ ] [DECIDIR] Título "Quebrei em etapas pra você" no objetivo manual (W30 vazia) — (origem: diário, pergunta 10, B4, 10/11/2026)
  - **Contexto:** pela P20, o objetivo manual do web usa a tela W30 (etapas sugeridas pela IA) começando vazia. O título da tela é o texto da IA do protótipo.
  - **Problema:** o texto diz que a IA quebrou as etapas, mas no fluxo manual quem monta é o usuário.
  - **Alternativas:**
    1. **Manter o texto do protótipo.** Código: nada. Prazo: zero. Vantagem: fidelidade. Desvantagem: frase falsa no fluxo manual.
    2. **Trocar por "Monte as etapas" no fluxo manual**, mantendo o do protótipo quando a IA preencher a lista. Código: uma condição e um teste (cerca de 30 min). Telas: só o título muda. Vantagem: texto verdadeiro e já preparado para a IA. Desvantagem: texto que não está no design.
  - **Recomendação:** 2. É uma mudança mínima e evita uma frase falsa.

- [ ] [DECIDIR] A energia escolhida no Hoje se perde ao abrir a rampa pela trilha ou pelo calendário — (origem: diário, problema 11, E-web, 10/11/2026)
  - **Contexto:** o check-in de energia do web fica no Hoje. A rampa também abre pela trilha ("Começar próxima etapa") e pelo detalhe do bloco no calendário.
  - **Problema:** nessas entradas, a energia escolhida no Hoje não chega à rampa, que começa no Aquecer como se fosse energia baixa.
  - **Alternativas:**
    1. **Guardar a energia do dia num estado compartilhado do web** (contexto React ou `sessionStorage`) e passá-la à rampa em qualquer entrada. Código: um provedor de estado e testes (1–2 h). Telas: iguais. Vantagem: a escolha vale para o dia todo. Desvantagem: mais um estado global para manter.
    2. **A rampa aberta fora do Hoje pergunta a energia antes.** Código: um passo novo no modal. Telas: um check-in dentro da rampa, que o protótipo web não tem. Vantagem: dado sempre atual. Desvantagem: tela sem design.
    3. **Manter.** Vantagem: zero trabalho. Desvantagem: a rampa ignora o que o usuário disse.
  - **Recomendação:** 1. Usa só o que existe e resolve também a pergunta 9 (item "Rampa do web sem check-in").

- [ ] [DECIDIR] "Vamos começar?" não faz nada quando não há bloco no dia — (origem: diário, problema 10, E-web/E-mobile, 10/11/2026) — também afeta o Mobile (ver o item "Entrada para a rampa pela trilha")
  - **Contexto:** o botão "Vamos começar?" do Hoje abre a rampa do próximo bloco do dia. Sem bloco no dia, aparece "Nada agendado".
  - **Problema:** sem bloco, o botão não faz nada (web e mobile). No web dá para começar pela trilha; no mobile não há outra entrada.
  - **Alternativas:**
    1. **Esconder ou desabilitar o botão quando não há bloco.** Código: uma condição por app e testes (cerca de 1 h nos dois). Telas: estado novo, sem design. Vantagem: não promete o que não faz. Desvantagem: o usuário que quer adiantar trabalho fica sem caminho no mobile.
    2. **Sem bloco no dia, o botão abre a rampa da próxima etapa pendente** (a do `nextBlock` mais próximo, que o `GET /goals/:goalId` já devolve). Código: escolher a etapa no controlador do Hoje de cada app e testes (2–3 h nos dois). Telas: iguais. Vantagem: sempre há como começar, usando só o contrato atual; o ponta a ponta do mobile deixa de depender do relógio. Desvantagem: a tela precisa buscar os objetivos para achar a etapa.
    3. **Manter.** Desvantagem: botão morto.
  - **Recomendação:** 2. Mantém a proposta do produto (sempre dá para começar), sem tela nova e sem endpoint novo.

- [ ] [DECIDIR] Valor padrão do `NEXT_PUBLIC_DATA_SOURCE` no desenvolvimento — (origem: diário, pergunta 16, D1, 10/11/2026)
  - **Contexto:** o web escolhe a fonte de dados por variável: `http` (backend real, padrão) ou `example` (dados de exemplo).
  - **Problema:** `npm run dev` sem backend no ar mostra telas vazias e erros.
  - **Alternativas:**
    1. **Manter `http` como padrão.** Código: nada. Vantagem: o desenvolvimento acontece contra o produto real, e erros como os do problema 14 aparecem cedo. Desvantagem: precisa subir o backend para ver qualquer tela.
    2. **`example` como padrão de desenvolvimento**, com `http` explícito no ponta a ponta e na produção. Código: o padrão da variável e o `COMO-TESTAR` (cerca de 30 min). Vantagem: qualquer pessoa vê as telas sem backend. Desvantagem: risco de achar que algo funciona quando só funciona com os dados de exemplo.
  - **Recomendação:** 1. O `COMO-TESTAR` e a skill `teste-manual-local` já sobem o backend, e o `example` continua a uma variável de distância.

- [ ] [DECIDIR] Relógio do web no servidor (`SERVER_NOW`) — (origem: diário, pergunta 17, D1, 10/11/2026)
  - **Contexto:** o Next renderiza as telas no servidor; o relógio do servidor e o do navegador diferem e causavam erro de hidratação. O contorno atual (`SERVER_NOW`) funciona porque as telas não mostram a hora antes de carregar os dados.
  - **Problema:** o contorno é frágil: uma tela nova que mostre a hora antes dos dados volta a quebrar.
  - **Alternativas:**
    1. **Manter o contorno.** Código: nada. Vantagem: zero trabalho agora. Desvantagem: armadilha para quem criar telas novas.
    2. **Ler o relógio dentro de um efeito (`useEffect`) nas telas**, numa tarefa separada. Código: telas que usam o relógio e os testes delas (2–4 h). Telas: iguais. Vantagem: solução definitiva. Desvantagem: mexe em várias telas.
    3. **Desligar a renderização no servidor das telas privadas.** Código: pequeno. Vantagem: rápido. Desvantagem: perde o carregamento inicial no servidor e esconde o problema em vez de resolvê-lo.
  - **Recomendação:** 2, numa tarefa própria depois das telas do mínimo obrigatório.

- [ ] [DECIDIR] Guardar só a última rodada das comparações de tela, em JPEG — (origem: diário, pergunta 14 e "decisões que tomei sem você", B4/B5, 10/11/2026) — vale também para o Mobile
  - **Contexto:** cada tela foi comparada com o screenshot do design em até 3 rodadas. As comparações estão em `docs/frontend/comparacoes/` e `docs/mobile/comparacoes/`.
  - **Problema:** validar a decisão já implementada: só a última rodada foi guardada, em JPEG reduzido (cerca de 6 MB no total; os PNGs originais passavam de 40 MB).
  - **Alternativas:**
    1. **Manter (última rodada, JPEG).** Vantagem: repositório leve e o estado final documentado. Desvantagem: não dá para ver a evolução entre as rodadas.
    2. **Guardar todas as rodadas em PNG no git.** Vantagem: histórico completo. Desvantagem: repositório 40 MB maior, e cresce a cada rodada.
    3. **Guardar as rodadas intermediárias fora do git** (pasta compartilhada do time). Vantagem: histórico sem pesar o repositório. Desvantagem: mais um lugar para manter.
  - **Recomendação:** 1. O que importa para avaliar é o estado final e as diferenças justificadas no README de cada pasta.

- [x] [INVESTIGAR] Erro de hidratação no Hoje do web (`Hydration failed`) — (origem: diário, E-web, 10/11/2026) — corrigido na E-web (`131b401`); o Hoje não mostra a data antes de carregar os dados. Solução definitiva no item "Relógio do web no servidor".

- Ver também no Backend: "Textos da rampa vindos do catálogo do domínio" (pergunta 11), "Nome do usuário demo" (pergunta 20), "Script `db:reset-demo`" (pergunta 21).
- Ver também no Mobile: "Dados de exemplo diferentes do backend real" (problema 14).


### Rodada de ajustes visuais (11/11/2026)

- [x] [EXECUTAR] Menu lateral: Objetivos, Jardim e Configurações navegam para W21, W25 e W26 — (origem: pedido do usuário, tarefa W1, 11/11/2026) — fechado em `4f20b04` (branch `feat/web-navegacao-objetivos`).
- [x] [INVESTIGAR] Depois de cadastrar um objetivo, o botão "Novo objetivo" não abria o modal de novo — (origem: pedido do usuário, tarefa W1, 11/11/2026) — causa no web: o Hoje guardava a URL do modal fechado (`closedUrl = "novo=1"`) e nunca a esquecia; com o `cacheComponents` do Next, o Hoje fica montado entre navegações e `/hoje?novo=1` não reabria. O backend respondeu 201 em todos os `POST /goals`. Corrigido com teste de regressão em `c112d9f` (integrado em `4f20b04`).
- [x] [EXECUTAR] Calendário web: troca Dia/Semana/Mês e Execução/Prazos nas três visualizações — (origem: pedido do usuário, tarefa W2, 11/11/2026) — fechado em `d6024ea` (branch `feat/web-calendario`).
- [x] [INVESTIGAR] Ponta a ponta do web falhava de manhã: "strict mode violation" na trilha — (origem: verificação da Tarefa 0, 11/11/2026) — causa: logo depois da navegação Hoje → trilha, o card do Hoje (um `button` com o título da etapa 2, que cai hoje de manhã) ainda está no DOM, e o seletor `getByText(etapa2).locator("..")` achava 2 elementos. Falhou 2× seguidas às ~10h na developer (`157a920`), sem relação com a rodada. Corrigido em `62d7555`; ver o [DECIDIR] abaixo, porque mexeu num teste existente.

- [ ] [DECIDIR] Validar decisão já implementada: correção do seletor no ponta a ponta do web — (origem: verificação da Tarefa 0, `apps/frontend/e2e/fluxo-principal.spec.ts`, 11/11/2026)
  - **Contexto:** a regra da rodada diz "não altere teste para passar". O ponta a ponta do web estava vermelho na própria developer, por um defeito do teste (seletor ambíguo de manhã), e a regra do processo proíbe merge sem a verificação verde: nenhuma tarefa da rodada poderia ser integrada.
  - **Problema:** o orquestrador alterou um teste existente sem a sua autorização. A asserção é a mesma (a etapa 2 tem horário "hh:mm · 30 min" e não "Ainda sem horário"); só o seletor passou a mirar a linha da trilha (`xpath=parent::div`) em vez de qualquer pai do texto.
  - **Alternativas:**
    1. **Validar.** Código: nada. Vantagem: a verificação volta a ser confiável em qualquer horário. Desvantagem: nenhuma.
    2. **Reverter e corrigir de outro jeito** (ex.: esperar o Hoje sair do DOM antes de procurar a etapa). Código: o teste (30 min). Vantagem: nenhuma real; a asserção seria a mesma.
  - **Recomendação:** 1.

- [ ] [DECIDIR] Saudação fixa "Boa noite" no Hoje — (origem: `apps/frontend/src/modules/today/logic/today.logic.ts`, observado no ponta a ponta às 10h, 11/11/2026) — vale também para o Mobile ("Bom dia" fixo)
  - **Contexto:** o protótipo web traz "Boa noite, Arthur" (`AppHoje.dc.html`) e o mobile "Bom dia, Arthur"; as telas copiaram o texto fixo.
  - **Problema:** às 10h o web diz "Boa noite"; à noite o mobile diz "Bom dia".
  - **Alternativas:**
    1. **Manter o texto do protótipo.** Vantagem: fidelidade. Desvantagem: parece erro para o usuário.
    2. **Saudação pela hora local** (Bom dia até 12h, Boa tarde até 18h, Boa noite depois). Código: uma função pura e testes em cada app (1 h no total). Vantagem: correto. Desvantagem: texto variável que o design não mostra (só mostra um dos três).
  - **Recomendação:** 2.

- [ ] [DECIDIR] Tema escuro do web app não é aplicado — (origem: W1, `settings.page.tsx`, 11/11/2026)
  - **Contexto:** a W26 mostra Claro/Escuro. A escolha fica guardada (repositório de exemplo), mas o app não muda de cor: o `globals.css` só tem um `.theme-dark` parcial, usado na landing.
  - **Problema:** o botão "Escuro" não tem efeito visível.
  - **Alternativas:**
    1. **Implementar `[data-theme="dark"]`** com os tokens do `design/tokens.md`, aplicado no `<html>` pelo shell. Código: CSS e um efeito no shell (cerca de 2 h). Telas: todas, com risco de aparecerem cores fixas. Vantagem: fiel ao protótipo. Desvantagem: revisar todas as telas no escuro.
    2. **Manter até depois do MVP.** Vantagem: zero risco. Desvantagem: botão parece quebrado.
    3. **Esconder a seção Tema.** Código: 10 min. Desvantagem: foge do protótipo.
  - **Recomendação:** 2 agora, 1 depois do MVP (a fatia não depende de tema).

- [ ] [DECIDIR] Configurações: gravação da disponibilidade falha em silêncio — (origem: W1 e revisor, `settings.page.tsx`, 11/11/2026)
  - **Contexto:** a W26 grava a grade e o limite sozinha, 400 ms depois da última mudança, e diz "O plano se reorganiza na hora".
  - **Problema:** com a grade vazia ("Limpar") nada é gravado (o contrato dá 422 sem janela), e um erro do `PUT` é ignorado. Nos dois casos o usuário não é avisado e, ao voltar, vê a grade antiga. O design não define esses estados.
  - **Alternativas:**
    1. **Manter.** Vantagem: simples. Desvantagem: o usuário acha que salvou.
    2. **Aviso com o toast que já existe** no erro e na grade vazia. Código: 30 min com testes. Desvantagem: texto e visual sem design (precisa do seu texto).
  - **Recomendação:** 2, com o texto aprovado por você.

- [ ] [DECIDIR] "Tarefas leves" no menu e "Comprar" guarda-chuva no Jardim sem ação — (origem: W1, 11/11/2026)
  - **Contexto:** "Tarefas leves" (W24) não estava no pedido da rodada; o "50 · Comprar" do Jardim é gamificação (fora do MVP).
  - **Alternativas:**
    1. **Manter sem ação.** Vantagem: zero custo. Desvantagem: parecem botões quebrados.
    2. **Tela W24 com dados de exemplo e compra só visual.** Prazo: cerca de 2 h. Desvantagem: mais dado falso.
  - **Recomendação:** 1 no MVP.

- [ ] [EXECUTAR] "Ver jardim" no Hoje navegar para `/jardim` — (origem: W1, `today.page.tsx`, 11/11/2026)
  - **O que fazer:** o botão de "Conquistas recentes" no Hoje não tem ação; ligar com `router.push("/jardim")`, como no protótipo.
  - **Critério de pronto:** teste que clica e confere a navegação; verificação completa verde.

- [ ] [DECIDIR] "Voltar" do navegador depois de encaixar um objetivo reabre o modal Novo objetivo vazio — (origem: revisor da W1, `today.page.tsx` `onCreated`, 11/11/2026)
  - **Contexto:** ao encaixar, o web vai para `/calendario` com `router.push`, e `/hoje?novo=1` fica no histórico. Já era assim antes da rodada.
  - **Alternativas:**
    1. **Manter.** Desvantagem: o modal reabre vazio ao voltar.
    2. **Trocar a URL por `/hoje` (`router.replace`) antes de ir ao calendário.** Código: 1 linha e um teste (30 min). Vantagem: "Voltar" leva ao Hoje sem modal.
  - **Recomendação:** 2.

- [ ] [DECIDIR] "Sair" mantém telas em memória — (origem: revisor da W1, `settings.page.tsx` logout, 11/11/2026)
  - **Contexto:** o "Sair" descarta o token e faz `router.replace("/entrar")`; com o `cacheComponents`, telas como o Hoje e a sidebar (com o nome do usuário) continuam em memória.
  - **Problema:** se outra conta entrar em seguida, dados da anterior podem aparecer por um instante. Hoje só há o demo.
  - **Alternativas:** 1. **manter** (impacto baixo no MVP); 2. **recarregar a página no logout** (`window.location.assign("/entrar")`, 1 linha e teste, 15 min).
  - **Recomendação:** 2, pela segurança com custo mínimo.

- [ ] [DECIDIR] Cor fixa da sombra do interruptor do e-mail diário (W26) — (origem: W1, `settings.page.tsx:190`, 11/11/2026)
  - **Contexto:** o interruptor usa `0 1px 2px rgba(14,31,26,.2)`, do protótipo; não há token de sombra equivalente (`--shadow-card` e `--shadow-float` são outras).
  - **Alternativas:** 1. **manter** a cor do protótipo; 2. **criar o token** no `design/tokens.md` e no `globals.css` (15 min).
  - **Recomendação:** 2, para seguir a regra de não usar cor fixa.

- [ ] [DECIDIR] Mostrar objetivo concluído em Prazos — (origem: W2 `calendar.logic.ts` `SHOW_DONE_DEADLINES` e M2 `week_controller.dart` `showDoneGoalsInDeadlines`, 11/11/2026) — vale também para o Mobile
  - **Contexto:** o calendário Prazos mostra a entrega de cada objetivo com prazo, vindo do `GET /goals`, que devolve também os `done`. O protótipo não filtra; o detalhe web diz "Pronto antes do prazo".
  - **Alternativas:**
    1. **Mostrar com "100%/concluído" (como está nos dois apps).** Vantagem: o usuário vê que entregou. Desvantagem: o calendário acumula entregas resolvidas.
    2. **Esconder os concluídos.** Código: uma constante por app e 2–3 testes (15 min). Desvantagem: a entrega some de uma data passada.
  - **Recomendação:** 1.

- [ ] [DECIDIR] Limites de navegação do calendário web — (origem: W2 e revisor, `calendar.logic.ts` `HORIZON_DAYS`/`HORIZON_WEEKS`, 11/11/2026)
  - **Contexto:** seguindo o protótipo, a Semana vai da atual até +3, o Dia de hoje a hoje+27, e o Mês fica fixo no mês atual (setas desligadas), igual ao horizonte de 28 dias do plano.
  - **Problema:** não dá para ver semanas passadas; no Mês, prazos de meses seguintes não aparecem; perto do fim do mês, parte dos 28 dias do plano nunca aparece no Mês.
  - **Alternativas:**
    1. **Manter (fiel ao protótipo).** Desvantagem: prazos distantes ficam invisíveis no Mês.
    2. **Liberar as setas no Mês** (e, se quiser, no passado). Código: lógica e testes (cerca de 1 h; o carregamento por semana já existe). Desvantagem: foge do protótipo.
  - **Recomendação:** 2 só no Mês de Prazos, onde a limitação esconde dado real.

- [ ] [DECIDIR] Texto do detalhe de um prazo já vencido — (origem: W2, `deadline-detail-panel.component.tsx`, 11/11/2026)
  - **Contexto:** o painel "Prazo final" mostra "Entrega · Sexta, 20/11 · em 4 dias". O protótipo não define o prazo passado (mostraria "em -2 dias"); hoje o web mostra só a data.
  - **Alternativas:** 1. **só a data** (atual); 2. **"venceu há N dias"** (10 min com teste).
  - **Recomendação:** 2, mais claro.

- [ ] [DECIDIR] Ações do detalhe do bloco sem efeito (Mover, Marcar parcial, Não vou conseguir) — (origem: W2, `block-detail-panel.component.tsx`, 11/11/2026)
  - **Contexto:** o W16 mostra esses botões; o contrato (§4) deixa essas ações fora do mínimo. Eles continuam visíveis e sem ação, como antes da rodada.
  - **Alternativas:**
    1. **Manter visíveis sem ação.** Vantagem: fidelidade. Desvantagem: botões mortos.
    2. **Esconder até existirem.** Código: 15 min. Desvantagem: foge do design.
    3. **Implementar** (precisa de endpoints novos de bloco: mover, registrar parcial/falta). Prazo: 1–2 dias entre backend e web.
  - **Recomendação:** 1 no MVP; "Marcar parcial" e "Não vou conseguir" já existem como registro de sessão e podem ser ligados depois pelo `POST /activation/sessions`.

- [ ] [DECIDIR] Calendário (web e mobile) não avisa erro de carregamento — (origem: revisores da W2 e do M2, `calendar.page.tsx` e `week_screen.dart`, 11/11/2026) — vale também para o Mobile
  - **Contexto:** se `GET /scheduling/plan/week`, `/plan/day` ou `GET /goals` falharem (ex.: 404 sem disponibilidade), o web deixa a promessa rejeitada sem tratamento e o mobile guarda o erro sem mostrar. O usuário vê uma grade vazia ou "Nenhuma entrega neste dia.", o que engana.
  - **Problema:** o design não tem estado de erro no calendário.
  - **Alternativas:**
    1. **Manter.** Desvantagem: falha silenciosa e enganosa.
    2. **Aviso com o toast que já existe nos dois apps.** Código: 1 h por app com testes. Desvantagem: texto e estado sem design.
  - **Recomendação:** 2, com um texto único aprovado por você para todas as telas.

- Ver também no Backend: "Tipo do prazo e nome curto do objetivo" (calendário e lista de objetivos), "Preferências do usuário", "Endpoint de gamificação", "Próxima etapa no `GET /goals`", "Compromissos fixos no contrato".

### Proposta de IA (11/11/2026)

- [ ] [DECIDIR] Entrada do caminho manual no web quando o Novo objetivo tiver IA — (origem: `docs/7-proposta-ia.md` §d.4, 11/11/2026)
  - **Contexto:** hoje o "Novo objetivo" do web abre direto a W30 vazia (objetivo manual com etapas, P20). Com a IA, o modal passa a abrir na W27 (Escrever / Colar link, "Analisar com IA"), como no protótipo. O design web não tem "Preencher à mão" (`design/web/SCREENS.md`, notas); o mobile tem (M16).
  - **Problema:** sem uma entrada, o objetivo manual com etapas (mínimo obrigatório, 4a) só fica acessível quando a IA falha.
  - **Alternativas:**
    1. **Link "Montar sem IA" na W27**, que abre a W30 vazia. Código: 1 h com teste. Telas: um link sem design, no estilo do botão secundário. Vantagem: o caminho manual fica a um clique. Desvantagem: elemento fora do protótipo.
    2. **"Analisar com IA" com o texto vazio abre a W30 vazia.** Código: 30 min. Telas: nenhuma nova. Vantagem: nada fora do design. Desvantagem: comportamento escondido.
    3. **Manter a W30 vazia como entrada e a IA atrás de um botão "Usar IA" na W30.** Código: 2 h. Telas: inverte o protótipo. Vantagem: o manual continua o padrão. Desvantagem: foge do fluxo do design (F §4: o chat com IA é o padrão).
  - **Recomendação:** 1, igual ao "Preencher à mão" do mobile.

- Ver também no Backend: "Aprovar a proposta de IA", "O que fazer quando a IA falha", "Leitura de link e anexo (UC03)" (aba "Colar link" da W28) e "Perguntas de esclarecimento no chat". Ver também no Frontend (acima): "Título 'Quebrei em etapas pra você' no objetivo manual", que fica verdadeiro quando a IA preencher a W30.

## Mobile

- [ ] [DECIDIR] Para onde ir depois de criar um objetivo ou tarefa — (origem: diário, pergunta 12, B5, 10/11/2026)
  - **Contexto:** no mobile, ao encaixar um objetivo novo (M15) ou salvar uma tarefa (M16), o app volta para a Semana, como no protótipo.
  - **Problema:** o usuário pode querer ver a trilha do que acabou de criar.
  - **Alternativas:**
    1. **Voltar para a Semana (como está e como no protótipo).** Código: nada. Vantagem: fidelidade; mostra onde o objetivo foi encaixado. Desvantagem: a trilha fica a dois toques.
    2. **Abrir a trilha do objetivo criado (M18).** Código: trocar a rota de destino e o teste (cerca de 30 min). Vantagem: mostra as etapas e datas. Desvantagem: foge do protótipo; não vale para a tarefa única.
  - **Recomendação:** 1. É o que o design pede, e a Semana mostra o efeito do encaixe.

- [ ] [DECIDIR] Slider "Máximo de estudo por dia" na M15 — (origem: diário, pergunta 13, B5, 10/11/2026)
  - **Contexto:** a M15 do protótipo (resposta da IA) tem um slider "Máximo de estudo por dia". Na versão manual vazia (P20), ele saiu junto com os elementos da IA.
  - **Problema:** o `POST /goals` não tem campo para esse limite; o limite diário mora na disponibilidade (`PUT /scheduling/availability`).
  - **Alternativas:**
    1. **Manter fora.** Código: nada. Vantagem: a tela só mostra o que o contrato suporta. Desvantagem: diferença em relação ao design.
    2. **Voltar como visual, sem efeito** (dado de exemplo). Código: o widget (cerca de 1 h). Vantagem: fidelidade. Desvantagem: controle que não faz nada.
    3. **Voltar ligado ao limite diário da disponibilidade.** Código: a tela de objetivo passa a chamar também o `PUT /scheduling/availability` (2–3 h). Vantagem: funciona. Desvantagem: mistura duas responsabilidades numa tela, e o limite é do usuário, não do objetivo.
  - **Recomendação:** 1, até o design dizer se o limite é por objetivo (o que exigiria campo novo no backend).

- [ ] [DECIDIR] Token do mobile só em memória (fechar o app desloga) — (origem: diário, pergunta 18, D2, 10/11/2026)
  - **Contexto:** o token JWT do mobile fica só em memória.
  - **Problema:** fechar o app desloga o usuário. Persistir exige um pacote novo, e pacote novo só entra com aprovação.
  - **Alternativas:**
    1. **Aprovar `flutter_secure_storage`** (Keychain no iOS). Código: guardar e ler o token no cliente HTTP e um teste (1–2 h). Vantagem: sessão persistente e segura. Desvantagem: pacote nativo novo (pods).
    2. **Aprovar `shared_preferences`.** Código: igual. Vantagem: pacote simples. Desvantagem: o token fica sem criptografia no aparelho.
    3. **Manter em memória.** Vantagem: nada a fazer. Desvantagem: login a cada abertura (no demo é um toque).
  - **Recomendação:** 1. É o jeito seguro e o custo é pequeno.

- [ ] [DECIDIR] Entrada para a rampa pela trilha no mobile (M18) — (origem: diário, pergunta 19 e problema 10, E-mobile, 10/11/2026)
  - **Contexto:** no web, a trilha tem "Começar próxima etapa". A trilha do mobile (M18) não tem esse botão no design; a rampa só abre pelo "Vamos começar?" do Hoje, que depende de bloco no dia.
  - **Problema:** sem bloco no dia, o usuário do mobile não consegue começar; o ponta a ponta do mobile depende do horário.
  - **Alternativas:**
    1. **Criar "Começar próxima etapa" na trilha do mobile.** Código: botão, rota para a rampa e testes (2 h). Telas: elemento que não está no design. Vantagem: mesma entrada do web. Desvantagem: tela sem design.
    2. **Resolver pelo Hoje** (item do Frontend "'Vamos começar?' não faz nada…", alternativa 2). Código: só no controlador do Hoje. Vantagem: sem tela nova e com a mesma regra nos dois apps. Desvantagem: o usuário não escolhe qual etapa começar.
    3. **Manter.**
  - **Recomendação:** 2, decidida junto com o item do Frontend.

- [ ] [INVESTIGAR] Tempo da rampa inconsistente: "Rampa de 25 min até o foco" no Hoje × "6 min de rampa" na escada — (origem: diário, problema 15, E-mobile, 10/11/2026)
  - **Sintoma:** o card do Hoje diz "Rampa de 25 min até o foco"; a escada (M06) diz "6 min de rampa".
  - **Como reproduzir:** mobile no simulador com `DATA_SOURCE=http`, login demo com plano criado; ver o card do Hoje e tocar em "Vamos começar?" → "Montar minha rampa".
  - **Erro exato:** nenhum erro; os dois números não batem.
  - **Onde já se olhou:** nada; ficou fora do escopo da Etapa E. Suspeita (não confirmada): um dos textos vem fixo do protótipo e o outro é calculado a partir das opções da rampa.

- [ ] [DECIDIR] Ponta a ponta do mobile depende do relógio — (origem: diário, problema 16, E-mobile, 10/11/2026)
  - **Contexto:** o `integration_test` do mobile percorre Hoje → rampa e precisa de um bloco no dia atual.
  - **Problema:** falha depois de cerca de 22h45 e na noite de domingo ("sem bloco hoje"). O do web já tem um caminho alternativo pela trilha.
  - **Alternativas:**
    1. **Manter e rodar no horário certo.** Vantagem: zero trabalho. Desvantagem: verificação noturna falha sem bug.
    2. **Caminho alternativo, como no web**, depois que existir a entrada da rampa sem bloco (item "Entrada para a rampa pela trilha"). Código: o teste (1 h). Vantagem: roda a qualquer hora. Desvantagem: depende daquela decisão.
    3. **Relógio injetável por `--dart-define`** só no teste. Código: `AppConfig` e o relógio do app (2 h). Vantagem: teste determinístico. Desvantagem: configuração de teste dentro do app.
  - **Recomendação:** 2, depois da decisão da entrada da rampa.

- [ ] [DECIDIR] Dados de exemplo diferentes do backend real — (origem: diário, problema 14, E-mobile, 10/11/2026) — vale também para o Frontend
  - **Contexto:** os testes de tela usam os repositórios de exemplo. Dois bugs do mobile (`log` com opção; `progressPct` dentro de `goal`) só apareceram no ponta a ponta, porque os dados de exemplo tinham outro formato.
  - **Problema:** os testes de tela podem passar com um formato que o backend não devolve.
  - **Alternativas:**
    1. **Manter e confiar no ponta a ponta.** Vantagem: nada a fazer. Desvantagem: o erro aparece tarde.
    2. **Respostas reais gravadas** (JSON capturados do backend) usadas pelos testes dos repositórios HTTP e como base dos dados de exemplo. Código: arquivos de fixture e ajuste dos testes (meio dia por app). Vantagem: o formato fica preso ao real. Desvantagem: as fixtures precisam ser regravadas quando o contrato muda.
    3. **Teste que confere os `fromJson`/tipos contra o `openapi.json`.** Vantagem: automático. Desvantagem: mais complexo de montar.
  - **Recomendação:** 2. É simples e pega exatamente o tipo de erro que aconteceu.

- [ ] [DECIDIR] Validar decisão já implementada: tarefas leves vazias no modo real do mobile — (origem: diário, "decisões que tomei sem você", D2, 10/11/2026)
  - **Contexto:** tarefas leves (UC13) não têm endpoint no contrato do MVP. No modo `http`, o repositório devolve a lista vazia; no modo `example`, a lista do protótipo.
  - **Problema:** no app real, a seção de tarefas leves (Hoje e M22) aparece vazia.
  - **Alternativas:**
    1. **Manter vazia.** Vantagem: nenhum dado falso. Desvantagem: a seção parece quebrada.
    2. **Dados de exemplo fixos também no modo `http`**, marcados como "example" no código (como a P18 faz com a gamificação). Código: o repositório (cerca de 30 min). Vantagem: tela fiel ao design. Desvantagem: tarefas que não são do usuário.
    3. **Esconder a seção no modo `http`.** Vantagem: sem dado falso nem seção vazia. Desvantagem: foge do design.
  - **Recomendação:** 2. É a mesma regra usada para dados sem endpoint (P18 e regra 3 da rodada de ajustes visuais de 11/11).

- [ ] [DECIDIR] Validar pendências aceitas da B5 (telas mobile) — (origem: diário, tabela de tarefas, B5, 10/11/2026)
  - **Contexto:** o revisor da B5 aceitou estas adaptações:
    - "cerca de Xh" no onboarding conta 2 h por período (o design diz "10 períodos · cerca de 20h");
    - a resposta do T01 ("O que mais te trava?") fica só no controlador (não há campo no backend);
    - tarefas leves só de exemplo;
    - etapas concluídas aparecem como "Concluída";
    - títulos curtos;
    - plano inviável (M17) fora;
    - login e cadastro sem sessão, exceto o demo (são placeholder pela P27).
  - **Problema:** são escolhas feitas sem você.
  - **Alternativas:**
    1. **Aceitar todas como estão.** Vantagem: nada a fazer. Desvantagem: nenhuma imediata.
    2. **Reabrir as que quiser**, cada uma vira um [EXECUTAR] próprio. Vantagem: controle item a item. Desvantagem: trabalho extra.
  - **Recomendação:** 1, revendo o plano inviável (M17) quando o mínimo obrigatório estiver pronto.

- [ ] [DECIDIR] Validar mudanças fora do escopo aceitas na D2 — (origem: diário, tabela de tarefas, D2, 10/11/2026)
  - **Contexto:** a D2 (mobile ligado ao backend) também mudou: `main.dart` passou a usar `fromConfig()`; criou `env/*.json`; acrescentou `me()` à interface do repositório de auth.
  - **Problema:** escolhas aceitas pelo orquestrador sem você.
  - **Alternativas:** 1. aceitar (são necessárias para a escolha de ambiente da regra do mobile); 2. reverter alguma e refazer de outro jeito.
  - **Recomendação:** 1. São o mínimo para a configuração por ambiente que a regra do mobile exige.

- Ver também no Frontend: "'Vamos começar?' não faz nada quando não há bloco no dia" (problema 10) e "Guardar só a última rodada das comparações" (pergunta 14).
- Ver também no Backend: "Nome do usuário demo" (pergunta 20), "Textos da rampa vindos do catálogo do domínio" (pergunta 11).


### Rodada de ajustes visuais (11/11/2026)

- [x] [EXECUTAR] Calendário do mobile: arrastar o traço expande para o mês e recolhe para a semana; Execução/Prazos na semana e no mês — (origem: pedido do usuário, tarefa M2, 11/11/2026) — fechado em `8090025` (branch `feat/mobile-calendario`).
- [x] [EXECUTAR] Rampa: a tag "Sugerido pra você" ficava coberta pelos degraus — (origem: pedido do usuário, tarefa M1, 11/11/2026) — a tag passou para uma camada acima dos degraus, como o `z-index` do protótipo; fechado em `fe71502` (branch `feat/mobile-chat-objetivo`).
- [ ] [EXECUTAR] Chat do novo objetivo (M13–M15) com a "IA" de exemplo — (origem: pedido do usuário, tarefa M1, 11/11/2026) — **parcial**: o chat, o repositório de exemplo (`SampleGoalAssistantRepository`, atrás de `GoalAssistantRepository`) e a M15 preenchida estão integrados em `fe71502`, na rota `/objetivos/chat`, mas o botão "Novo objetivo" ainda abre a M15 direto. Falta o item abaixo.

- [ ] [DECIDIR] Ligar "Novo objetivo" (M02) ao chat: exige alterar 2 testes existentes — (origem: M1 e revisor, 11/11/2026)
  - **Contexto:** você pediu que o botão abra o chat antes das etapas. Trocar o destino (1 linha em `goals_pages.dart`) muda o fluxo que dois testes existentes verificam: `test/features/goals/goals_screens_test.dart` ("Novo objetivo (M15 vazia)…") e o ponta a ponta `integration_test/fluxo_principal_test.dart:139-140`, que tocam "Novo objetivo" e esperam a M15 vazia ("0 min no total").
  - **Problema:** a regra da rodada proíbe alterar teste para passar; por isso o subagente parou e a entrada não foi ligada.
  - **Alternativas:**
    1. **Autorizar a mudança dos testes.** Patch pronto e verificado pelo revisor (`flutter test` +189 verde) em `/private/tmp/claude-501/-Users-arthursetragni-Hackaton-OiTenta/38e788da-ae14-494a-b00a-834fc4ccb0f8/scratchpad/m1-tdd/entrada-chat-completo.patch`: `onNew` → chat; o teste antigo ganha o toque em "Preencher à mão" depois de "Novo objetivo"; um teste novo prova que "Novo objetivo" abre o chat. No ponta a ponta, acrescentar `await tapText(tester, 'Preencher à mão');` depois da linha 139. Prazo: minutos mais a verificação completa. Vantagem: entrega o que você pediu. Desvantagem: altera dois testes de fluxo (o que eles provam continua igual: o objetivo manual com etapas).
    2. **Manter a entrada direta.** Vantagem: nada muda. Desvantagem: o chat fica sem entrada para o usuário.
  - **Recomendação:** 1. Os testes mudam porque o fluxo pedido mudou, não para esconder um erro.

- [ ] [DECIDIR] Destino do "Preencher à mão" do chat e caminho para a M15 vazia (P20) — (origem: M1, `goals_pages.dart:74`, 11/11/2026)
  - **Contexto:** no protótipo, o "Preencher à mão" do chat leva à M16 (tarefa única). O objetivo manual com etapas (P20, mínimo obrigatório) usa a M15 vazia, e o design não mostra como chegar a ela pelo chat.
  - **Alternativas:**
    1. **(implementada)** Chat → "Preencher à mão" → M15 vazia → o "Preencher à mão" dela → M16. Código: nada. Vantagem: os dois caminhos manuais continuam acessíveis. Desvantagem: a M16 fica a 2 toques.
    2. **Chat → M16, como no design;** a M15 vazia só abre quando a IA falha. Código: 1 linha. Vantagem: fiel ao design. Desvantagem: some a entrada voluntária do objetivo com etapas (P20).
    3. **Chat → M16 e um link novo na M16** ("Objetivo com etapas") para a M15 vazia. Código: 1 h. Desvantagem: elemento sem design.
  - **Recomendação:** 1, até o design definir.

- [ ] [DECIDIR] Aviso quando a IA falha no chat — (origem: M1 e revisor, `goals_pages.dart`, 11/11/2026)
  - **Contexto:** pela 4f, a falha da IA abre o formulário manual. Hoje o app abre a M15 vazia sem dizer nada.
  - **Alternativas:** 1. **sem aviso** (atual); 2. **toast** com texto aprovado por você (30 min); 3. **balão do Broto no chat** com o botão "Preencher à mão" (1 h; estado sem design).
  - **Recomendação:** 2.

- [ ] [DECIDIR] Anexo e áudio do chat (M13/M14) só visuais — (origem: M1, `goal_chat_screen.dart`, 11/11/2026)
  - **Contexto:** o clipe e o microfone aparecem como no design, mas não fazem nada: não há contrato nem pacote aprovado.
  - **Alternativas:** 1. **manter só visuais**; 2. **esconder** (foge do design); 3. **implementar** (pacotes novos, upload no backend e um LLM que leia PDF e áudio; dias de trabalho, depende do provedor).
  - **Recomendação:** 1, até a decisão do provedor de LLM.

- [ ] [DECIDIR] Resposta da IA em tela própria × dentro do chat (M15) — (origem: M1, 11/11/2026)
  - **Contexto:** como pedido, a resposta abre a tela de etapas que já existia, preenchida. O design mostra a resposta dentro do chat, com "Achei N requisitos…", pílulas de requisitos, o slider "Máximo de estudo por dia" e "Cabe com 1 dia de folga"; título e prazo como texto, não campos.
  - **Alternativas:** 1. **manter a tela própria** (pronta); 2. **resposta no chat, editável ali** (1 dia; o endpoint precisaria devolver `requirements`).
  - **Recomendação:** 1 no MVP.

- [ ] [DECIDIR] Calendário do mobile sem navegação entre meses — (origem: revisor do M2, `week_controller.dart`, 11/11/2026)
  - **Contexto:** o mês mostrado é o do dia escolhido; o protótipo não tem setas nem arraste lateral.
  - **Problema:** um objetivo com prazo no mês seguinte nunca aparece em Prazos.
  - **Alternativas:** 1. **setas ou arraste lateral no cabeçalho**, como no web (o controlador já carrega por semana; 2–3 h com testes; elemento sem design); 2. **manter**.
  - **Recomendação:** 1, alinhado ao item do web "Limites de navegação do calendário".

- [ ] [EXECUTAR] Diferenças de design restantes no calendário do mobile — (origem: M2 e revisor, 11/11/2026)
  - **O que fazer:** (a) borda **tracejada** nos estados vazios "Nada planejado" e "Nenhuma entrega neste dia." (`week_screen.dart:132-153`), como no protótipo (`border: 1px dashed`); (b) legenda de Execução **fixa** com todos os objetivos, como `legendKeys` do protótipo (hoje segue o período visível, `week_controller.dart:260-288`).
  - **Critério de pronto:** widget tests da legenda e captura comparada com M19/M20; verificação completa verde.
  - Diferenças aceitas, sem ação: pontos do mês seguem as trilhas de exemplo (o protótipo inventa blocos em `execMonth()`); o arraste vale para o card inteiro, não só para o traço (comportamento do Google Agenda).

- [ ] [EXECUTAR] Largura do balão do usuário no chat conferida só por código — (origem: M1, `goal_chat_screen.dart:120`, 11/11/2026)
  - **O que fazer:** o `maxWidth` passou de 280 para 308 depois da última captura; refazer a captura da M14 e comparar.
  - **Critério de pronto:** quebra de linha igual à referência 14 (3 linhas).

- Ver também no Frontend: "Mostrar objetivo concluído em Prazos", "Calendário (web e mobile) não avisa erro de carregamento", "Saudação fixa".
- Ver também no Backend: "Provedor de LLM" e "Endpoint do assistente de novo objetivo", "Tipo do prazo e nome curto do objetivo".

### Proposta de IA (11/11/2026)

- Ver também no Backend, subseção "Proposta de IA (11/11/2026)": "Aprovar a proposta de IA" (traz a `HttpGoalAssistantRepository` e os campos novos do `GoalSuggestion`: `microSteps`, `aiEstimatedMinutes`, `requirements`, `missingFields`), "O que fazer quando a IA falha" (cruza com "Aviso quando a IA falha no chat", acima), "Leitura de link e anexo (UC03)" (cruza com "Anexo e áudio do chat (M13/M14) só visuais") e "Perguntas de esclarecimento no chat".

## Backend (inclui domínio modules/*, banco e contrato)

- [ ] [DECIDIR] Cor do objetivo (P4), leitura ambígua — (origem: diário, pergunta 1, B1, 10/11/2026)
  - **Contexto:** pela P4, cada objetivo recebe uma cor de 1 a 4, "o próximo índice entre os objetivos ativos, voltando ao 1 depois do 4". A B1 implementou `(nº de ativos % 4) + 1`.
  - **Problema:** a fórmula repete cor entre objetivos ativos. Com A=1, B=2 e C=3, se B for concluído, o próximo recebe 3, a mesma cor de C.
  - **Alternativas:**
    1. **Manter `(nº de ativos % 4) + 1`.** Código: nada. Vantagem: já testado. Desvantagem: dois ativos com a mesma cor no calendário.
    2. **Menor índice de 1 a 4 que nenhum ativo usa;** com os 4 ocupados, a cor menos usada, com desempate pelo menor índice. Código: uma função e um teste no `CreateGoal` (cerca de 1 h). Telas: nenhuma mudança. Vantagem: mantém os cenários atuais ({1,2} → 3; {1..4} → 1) e dá {1,3} → 2. Desvantagem: regra um pouco mais longa.
  - **Recomendação:** 2 (sugestão do revisor). Cores repetidas confundem justamente o calendário, que é o mínimo obrigatório.

- [ ] [DECIDIR] Horizonte do plano para objetivos sem prazo — (origem: diário, pergunta 2, B2, 10/11/2026)
  - **Contexto:** o motor do plano aloca até o maior prazo ou até hoje + 28 dias, o que for mais tarde.
  - **Problema:** o que passa disso fica como `unscheduledMinutes`, com `feasible` continuando `true`. Ninguém confirmou o limite de 28 dias.
  - **Alternativas:**
    1. **Manter 28 dias.** Vantagem: plano leve e já testado. Desvantagem: um objetivo grande sem prazo fica com parte sem agenda, sem aviso.
    2. **Horizonte maior** (ex.: 90 dias). Código: uma constante e testes (30 min). Vantagem: quase nada fica sem agenda. Desvantagem: recálculo mais pesado e plano longo demais para ser útil.
    3. **Manter 28 dias e avisar na tela quando há `unscheduledMinutes`.** Código: telas web e mobile (1–2 h). Desvantagem: aviso sem design.
  - **Recomendação:** 1 no MVP. O recálculo acontece a cada registro, então o que fica de fora entra nas semanas seguintes.

- [ ] [DECIDIR] Resto menor que 30 min ao dividir uma etapa — (origem: diário, pergunta 3, B2, 10/11/2026)
  - **Contexto:** o bloco mínimo é de 30 min (4c, P10). Ao dividir uma etapa, o motor evita deixar um resto menor que 30 min, o que a P10 não exige.
  - **Problema:** em casos raros isso torna inviável um plano que caberia (ex.: 90 min com 75 livres vira 60 + 30).
  - **Alternativas:**
    1. **Manter a heurística.** Vantagem: nunca há bloco de 15 min. Desvantagem: raros "não cabe" falsos.
    2. **Guloso puro.** Código: o motor e os testes de borda (1–2 h). Vantagem: aproveita todo o tempo livre. Desvantagem: pode criar sobra de 15 min, abaixo do bloco mínimo.
  - **Recomendação:** 1. Bloco de 15 min contradiz o bloco mínimo, e o caso inviável é raro.

- [ ] [DECIDIR] Bloco fixado ou em andamento no recálculo — (origem: diário, pergunta 4, B2, 10/11/2026)
  - **Contexto:** no recálculo, um bloco fixado no futuro (ou um `planned` em andamento) ocupa o horário.
  - **Problema:** ele não desconta os minutos da etapa, que é alocada de novo por inteiro. No MVP não há como fixar bloco, então o impacto hoje é baixo.
  - **Alternativas:**
    1. **Manter.** Vantagem: nada a fazer. Desvantagem: quando existir "fixar", a etapa fica com tempo a mais no plano.
    2. **Descontar os minutos do bloco fixado da etapa.** Código: o motor e testes (1–2 h). Vantagem: plano correto. Desvantagem: trabalho sem efeito visível no MVP.
  - **Recomendação:** 2, mas só quando a função "fixar bloco" entrar.

- [ ] [DECIDIR] Blocos `missed` contam no "3h de 3h"? — (origem: diário, pergunta 5, B2, 10/11/2026)
  - **Contexto:** o calendário mostra por dia o tempo usado sobre o limite ("3h de 3h").
  - **Problema:** hoje os blocos não feitos (`missed`) contam no `usedMinutes` do dia e da semana e no limite do recálculo do mesmo dia.
  - **Alternativas:**
    1. **Manter (contam).** Vantagem: depois de um "não rolou", o dia não é enchido de novo, o que respeita o limite do usuário. Desvantagem: o "3h de 3h" inclui tempo que não foi usado.
    2. **Não contar.** Código: o motor, o `GetDayPlan`/`GetWeekPlan` e os testes (1–2 h). Vantagem: número fiel ao que foi feito. Desvantagem: o recálculo pode reagendar no mesmo dia o que acabou de falhar.
  - **Recomendação:** 1. Evita encher de novo um dia que já deu errado, o que combina com o público que trava.

- [ ] [DECIDIR] Tamanho máximo do título do compromisso — (origem: diário, pergunta 6, B2, 10/11/2026)
  - **Contexto:** a P2 limita a 120 caracteres os títulos de objetivo e etapa.
  - **Problema:** o título do compromisso (aula, estágio) não tem limite.
  - **Alternativas:** 1. **120 caracteres, como a P2** (regra e teste, 30 min); 2. **sem limite** (nada a fazer; risco de texto gigante quebrar a tela).
  - **Recomendação:** 1, pela consistência com a P2.

- [ ] [DECIDIR] `replaceFutureAutoBlocks` com bloco de outro usuário — (origem: diário, pergunta 7, C2, 10/11/2026)
  - **Contexto:** o adaptador Prisma grava os blocos novos do plano com o `userId` do parâmetro.
  - **Problema:** se um bloco chegar com outro `userId` (bug do motor), ele é gravado em nome do usuário do parâmetro, sem aviso.
  - **Alternativas:**
    1. **Manter, com um teste que prove a reescrita.** Código: um teste (30 min). Vantagem: nunca grava em nome de outro usuário. Desvantagem: esconde um eventual bug do motor.
    2. **Lançar erro.** Código: a checagem e um teste (30 min). Vantagem: revela o bug. Desvantagem: um bug do motor derruba o recálculo do usuário.
  - **Recomendação:** 1 (sugestão do revisor), porque a posse continua garantida.

- [ ] [DECIDIR] Textos da rampa vindos do catálogo do domínio — (origem: diário, pergunta 11, B4/D1, 10/11/2026) — afeta as telas do Frontend
  - **Contexto:** desde a Etapa D, as opções da rampa vêm do catálogo fixo do domínio (`activation`): alongamento, contas etc.
  - **Problema:** os textos do catálogo são os do protótipo mobile, diferentes dos do protótipo web.
  - **Alternativas:**
    1. **Aceitar os textos do catálogo nos dois apps.** Vantagem: uma fonte só. Desvantagem: o web difere do protótipo web.
    2. **O catálogo ganha os textos do web.** Código: o catálogo e testes do domínio (1–2 h). Desvantagem: dois conjuntos de textos para o mesmo degrau, sem critério de qual usar.
  - **Recomendação:** 1. O catálogo é provisório (4a) e será trocado pelas tarefas do usuário.

- [ ] [DECIDIR] O progresso de uma etapa pode regredir — (origem: diário, pergunta 15, C4, 10/11/2026)
  - **Contexto:** pela 4h e pelo docs/3, um registro `partial` define o progresso da etapa como o `partialPct`.
  - **Problema:** uma sessão `partial` com 30% numa etapa em 80% (ou já `done`) baixa a etapa para 30% e devolve minutos ao plano.
  - **Alternativas:**
    1. **Manter (o usuário corrige a estimativa).** Vantagem: o usuário pode admitir que avaliou mal. Desvantagem: um toque errado desfaz progresso.
    2. **O progresso nunca recua** (`max(atual, novo)`), regra na entidade `Step`. Código: domínio, testes e um teste de integração (1–2 h). Vantagem: protege o progresso, o que importa para quem desanima fácil. Desvantagem: corrigir para baixo exige outra função.
  - **Recomendação:** 2. Perder progresso por engano é pior para o público do produto do que não conseguir corrigir para baixo.

- [ ] [DECIDIR] Nome do usuário demo — (origem: diário, pergunta 20 e problema 12, E-web, 10/11/2026) — afeta Frontend e Mobile
  - **Contexto:** o botão do login diz "Entrar direto como Arthur (demo)", como no protótipo; o seed cria a "Usuária Demo".
  - **Problema:** a saudação, a sidebar e o avatar mostram "Usuária Demo"/"U", contra o botão.
  - **Alternativas:**
    1. **Trocar o seed para "Arthur".** Código: o seed e o `db:reset-demo` (30 min). Vantagem: tudo igual ao protótipo. Desvantagem: o nome do demo é o de uma pessoa do time.
    2. **Trocar o texto do botão** (web e mobile) para "Entrar como demo". Código: dois textos e os testes (30 min). Vantagem: neutro. Desvantagem: foge do protótipo.
  - **Recomendação:** 1. Mantém a fidelidade ao design com a menor mudança.

- [ ] [DECIDIR] Validar decisão já implementada: script `db:reset-demo` e seu uso no ponta a ponta — (origem: diário, pergunta 21, problema 9 e "decisões que tomei sem você", E-dep, 10/11/2026) — afeta os ponta a ponta do Frontend e do Mobile
  - **Contexto:** o script apaga sessões, blocos, objetivos e disponibilidade do usuário demo, mantendo o usuário. O Playwright o roda a cada execução, e o ponta a ponta do mobile pede para rodá-lo antes.
  - **Problema:** testar no banco local apaga o que você fez à mão com o demo.
  - **Alternativas:**
    1. **Manter.** Vantagem: simples; o demo começa sempre do zero. Desvantagem: perde os dados manuais do demo.
    2. **Usuário só para os testes** (ex.: `e2e@…`), criado pelo próprio teste. Código: seed ou cadastro no teste, e o script passa a zerar esse usuário (1–2 h). Vantagem: o demo manual fica intacto. Desvantagem: o teste deixa de usar o botão "Entrar direto como … (demo)".
  - **Recomendação:** 2, se você usa o demo à mão no mesmo banco; senão, 1.

- [ ] [DECIDIR] `postinstall` no backend rodando `prisma generate` — (origem: diário, problema 1, C0, 10/11/2026)
  - **Contexto:** num `npm ci` limpo, `npm run build` falha no backend (`Module '"@prisma/client"' has no exported member 'PrismaClient'`) até alguém rodar `prisma:generate`. Hoje está documentado no `COMO-TESTAR` (passo 2b).
  - **Problema:** quem esquece o passo vê um erro confuso.
  - **Alternativas:**
    1. **Manter o passo manual.** Vantagem: nada a fazer. Desvantagem: armadilha para quem chega.
    2. **`postinstall` no backend.** Código: uma linha no `package.json` do backend. Vantagem: automático, também no CI e na hospedagem. Desvantagem: toda instalação roda o gerador (alguns segundos).
  - **Recomendação:** 2. Evita o erro no CI e no deploy, que ainda vão ser montados.

- [ ] [DECIDIR] Validar decisão já implementada: Jest × `@nestjs/config` (só ESM) — (origem: diário, problema 2, C0, 10/11/2026)
  - **Contexto:** os testes de integração não carregavam a aplicação (`Must use import to load ES Module: .../@nestjs/config/dist/index.js`).
  - **Problema:** a solução aplicada (o `test:e2e` roda com `NODE_OPTIONS=--experimental-vm-modules` e `--runInBand`) usa uma opção experimental do Node.
  - **Alternativas:**
    1. **Manter.** Vantagem: sem dependência nova; funciona. Desvantagem: depende de flag experimental.
    2. **Trocar o `@nestjs/config` pela v4** (CommonJS, compatível com Nest 11). Código: versão e testes (cerca de 1 h). Vantagem: sem flag. Desvantagem: versão mais antiga.
  - **Recomendação:** 1, revendo se a flag der problema no CI.

- [ ] [DECIDIR] Validar decisão já implementada (lacuna A da C4): `createdAt` no `ListGoals` — (origem: diário, problema 8A, C4, 10/11/2026)
  - **Contexto:** o `PlanCalculator` desempata a ordem dos objetivos pela data de criação.
  - **Problema:** nenhuma saída do goals expunha `createdAt`; o orquestrador acrescentou o campo ao `ListGoals` (e ao `GET /goals`).
  - **Alternativas:** 1. **manter** (campo a mais na saída, já no contrato); 2. **desempatar por outro critério** que já exista (ex.: id), removendo o campo (1 h; o desempate deixa de ter sentido para o usuário).
  - **Recomendação:** 1. Desempate por criação é o comportamento esperado.

- [ ] [DECIDIR] Validar decisão já implementada (lacuna B da C4): caso de uso `GetNextBlocks` — (origem: diário, problema 8B, C4, 10/11/2026)
  - **Contexto:** o `GET /goals/:goalId` mostra o próximo bloco de cada etapa (`nextBlock`), mas não havia caso de uso para isso.
  - **Problema:** o orquestrador criou o `GetNextBlocks` no scheduling: por etapa, o bloco `planned` de menor início a partir de agora, até 366 dias.
  - **Alternativas:** 1. **manter**; 2. **calcular o próximo bloco a partir do plano já gerado**, sem caso de uso novo (o orquestrador passaria a calcular, contra a 5.9).
  - **Recomendação:** 1. Respeita a regra de que orquestrador não calcula.

- [ ] [DECIDIR] Validar decisão já implementada (lacuna C da C4): conferir a posse antes de gravar, `GetBlock` novo e `blockId` opcional — (origem: diário, problema 8C, C4, 10/11/2026)
  - **Contexto:** o `POST /activation/sessions` gravava antes de conferir a posse do bloco. Agora confere tudo antes (`GetGoal` + `GetBlock`, caso de uso novo), e o `blockId` é opcional.
  - **Problema:** (a) são mudanças de domínio feitas sem você; (b) se o `GeneratePlan` falhar depois das escritas, elas ficam (hoje isso não acontece pela API).
  - **Alternativas:**
    1. **Manter como está.** Vantagem: o 404 nunca deixa gravação parcial. Desvantagem: o caso (b) fica em aberto.
    2. **Manter e envolver as escritas numa transação.** Código: uma porta de "unidade de trabalho" no domínio e a implementação com transação do Prisma (meio dia). Vantagem: atomicidade total. Desvantagem: estrutura nova para um caso que hoje não acontece.
  - **Recomendação:** 1 no MVP; 2 se aparecer falha real do `GeneratePlan`.

- [ ] [DECIDIR] Validar decisão já implementada (lacuna D da C4): objetivo `done` com `slackDays: null` — (origem: diário, problema 8D, C4, 10/11/2026)
  - **Contexto:** a folga (`slackDays`) vem do plano; um objetivo concluído não entra no plano.
  - **Problema:** o orquestrador decidiu devolver `slackDays: null` para objetivo `done`.
  - **Alternativas:** 1. **manter `null`** (as telas não mostram folga de objetivo concluído); 2. **devolver a folga do momento da conclusão** (exige guardar o valor: campo novo no banco).
  - **Recomendação:** 1. Não há tela que mostre folga de objetivo concluído.

- [ ] [DECIDIR] Validar decisão já implementada: bloco do próprio usuário mas de outra etapa → 404 — (origem: diário, "decisões que tomei sem você", C4, 10/11/2026)
  - **Contexto:** no `POST /activation/sessions`, o `blockId` informado pode ser de outra etapa do mesmo usuário. Antes da correção, o bloco errado era marcado como `done`.
  - **Problema:** escolher a resposta HTTP.
  - **Alternativas:** 1. **404 antes de gravar** (atual: "esse bloco não existe para essa etapa"); 2. **422** (regra de negócio violada); 3. **ignorar o `blockId` e registrar sem bloco** (o usuário não vê erro, mas o bloco certo fica sem resultado).
  - **Recomendação:** 1. Já implementado e testado, e trata o par etapa–bloco como o recurso procurado.

- [ ] [DECIDIR] Validar decisão já implementada: ordem da Etapa C — (origem: diário, "decisões que tomei sem você" e "Ajuste de sequência da Etapa C", 10/11/2026)
  - **Contexto:** as rotas que dependem de orquestrador (PUT com `plan`, plano do dia e da semana, `POST`/`GET /goals`, rampa, sessões) foram para a C4; C2 e C3 entregaram só persistência e rotas simples.
  - **Problema:** a ordem diferiu do plano aprovado (`docs/5-plano-execucao.md`).
  - **Alternativas:** 1. **validar** (já executado; nenhum efeito no código final); 2. **registrar que, nas próximas etapas, mudança de ordem espera aprovação**.
  - **Recomendação:** 1, e adotar 2 como prática daqui para frente (já coberto pela regra do processo, seção 5).

- [ ] [DECIDIR] Validar ajustes de consistência do orquestrador (contrato × modelagem) — (origem: diário, "Ajustes de consistência feitos pelo orquestrador", 10/11/2026)
  - **Contexto:** (a) o `GetDayPlan` seguiu o contrato (`{ date, blocks, usedMinutes, limitMinutes }`) e a modelagem foi corrigida; (b) semana que não começa na segunda responde 422 (o contrato dizia 400); dia e semana sem disponibilidade respondem 404 (P12), que o contrato não listava.
  - **Problema:** contrato e modelagem foram alterados sem você.
  - **Alternativas:** 1. **validar**; 2. **voltar algum dos códigos** (ex.: 400 para a semana fora da segunda; mexe no domínio e nos testes, 1 h).
  - **Recomendação:** 1. Segue a P19 (formato → 400, regra → 422).

- [ ] [DECIDIR] Validar decisões de detalhe da B3 (activation) — (origem: diário, "Pendências da B3", 10/11/2026)
  - **Contexto:** a B3 decidiu, sem documento que definisse: opções do micro-passo (`durationLabel '1 min'`, `description 'Micro-passo'`, `icon 'footprints'`, ids `micro-<n>`, do protótipo); desafio sem `durationSeconds` (contrato §5 corrigido para opcional); ids das opções `<kind>-<n>`; `partialPct` inteiro de 1 a 99 com `partial` e `null` fora dele; `goalId`, `stepId` e `blockId` validados como UUID; `endedAt < startedAt` gera `focusSession.endedAt.min.date`; o `BuildRamp` não valida `availableTime` (P15).
  - **Problema:** escolhas aceitas pelo revisor sem você.
  - **Alternativas:** 1. **aceitar todas**; 2. **reabrir as que quiser** como [EXECUTAR].
  - **Recomendação:** 1. Todas seguem o protótipo ou as decisões P14/P15.

- [ ] [EXECUTAR] Testes da B3 com mais de um resultado esperado e nomes de arquivos de teste — (origem: diário, "Pendências da B3", 10/11/2026)
  - **O que fazer:** dividir os testes do `modules/activation` que têm mais de um resultado esperado (a regra `testes-e-cobertura.md` pede um por teste) e renomear os dois arquivos de teste que não acompanharam o sufixo `.provider`.
  - **Critério de pronto:** um `expect` de resultado por teste no activation, nomes de teste espelhando `src/`, cobertura 100% e verificação completa verde.

- [ ] [DECIDIR] Regras de validação locais do goals candidatas ao shared (`MultipleOfRule`) — (origem: diário, tabela de tarefas, B1, 10/11/2026)
  - **Contexto:** a B1 criou regras de validação dentro de `modules/goals` (ex.: `MultipleOfRule`), que poderiam servir a outros módulos.
  - **Problema:** regra genérica fora do `shared` tende a ser duplicada.
  - **Alternativas:** 1. **mover para `packages/shared`** com a skill `shared-validation-rule` (1–2 h); 2. **deixar no goals** até outro módulo precisar.
  - **Recomendação:** 2. Mover só quando houver um segundo uso.

- [ ] [DECIDIR] Validar campos extras nas saídas do goals e do plano — (origem: diário, tabela de tarefas, B1 e C4, 10/11/2026)
  - **Contexto:** as saídas trazem campos além do contrato mínimo: `kind`, `source`, `status`, `aiEstimatedMinutes`, `microSteps` (B1); `scheduledMinutes` e o `StepView` completo (C4). Também: o `POST /goals` confere a disponibilidade antes de gravar, e o `GET /goals` sem objetivo ativo devolve `[]`. Tudo documentado no OpenAPI.
  - **Problema:** decisões dos autores aceitas pelo orquestrador.
  - **Alternativas:** 1. **aceitar**; 2. **enxugar as saídas ao contrato mínimo** (mexe em DTOs e testes, 1–2 h, sem ganho para as telas).
  - **Recomendação:** 1.

- [ ] [DECIDIR] Testes do backend recomendados pelo revisor da C2 e não feitos — (origem: diário, tabela de tarefas, C2, 10/11/2026)
  - **Contexto:** o revisor recomendou três testes de integração: desempate pelo fim; `deletedAt` nas leituras; reescrita do `userId` no `replaceFutureAutoBlocks` (ligado à pergunta 7).
  - **Problema:** comportamentos sem teste podem quebrar sem ninguém notar.
  - **Alternativas:** 1. **fazer agora** (cerca de 1 h); 2. **deixar para depois do MVP**.
  - **Recomendação:** 1. É barato e protege o motor, que é o mínimo obrigatório.

- [ ] [DECIDIR] Validar exceções à ordem do TDD registradas nas Etapas B e C — (origem: diário, tabela de tarefas, B2, B5 e C1, 10/11/2026)
  - **Contexto:** (a) B2: testes de borda (zoned-time, união de janelas, bordas do motor) escritos junto com o código, fora dos cenários aprovados; (b) B5: testes de widget escritos depois das telas, como a brief pedia; (c) C1: 2 testes do adaptador escritos depois, com prova por mutação.
  - **Problema:** desvios da ordem teste → código, aceitos pelos revisores.
  - **Alternativas:** 1. **aceitar e registrar os cenários de borda da B2 no `docs/3-modelagem-dominio.md`** (cerca de 1 h de documentação); 2. **aceitar sem mudar docs**; 3. **reescrever os testes em ordem TDD** (sem ganho prático: os testes já existem e foram validados por mutação).
  - **Recomendação:** 1. Os testes ficam, e a modelagem passa a ser a fonte dos cenários, como a regra pede.

### Rodada de ajustes visuais (11/11/2026)

- [ ] [DECIDIR] Provedor de LLM do assistente de novo objetivo — (origem: M1, `docs/2-decisoes-mvp.md` 4f e "Pendências para sexta" item 4, 11/11/2026) — afeta Mobile (chat M13–M15) e Frontend (W27–W31)
  - **Contexto:** o chat do novo objetivo precisa de uma IA que transforme o texto do usuário em título, prazo e etapas (`parseGoal` + `suggestSteps`, 4f). A 5.8 manda escolher entre os parceiros do hackathon (o prêmio é em créditos deles); a lista ainda está pendente. Hoje o mobile usa uma resposta de exemplo fixa ("Trabalho de Algoritmos", qualquer que seja o texto).
  - **Problema:** sem provedor não há endpoint, e o chat devolve sempre o mesmo objetivo.
  - **Alternativas:**
    1. **LLM de um parceiro do hackathon**, escolhido quando a lista sair. Código: `GoalAssistantProvider` no `goals` com fake, implementação no backend (skill `backend-provider-implementation`), chave no `.env` (1 dia). Telas: nenhuma mudança. Vantagem: segue a 5.8 e pode render créditos. Desvantagem: depende da lista; o parceiro pode não ter saída JSON estruturada nem leitura de PDF.
    2. **Provedor fora da lista** (ex.: Anthropic, OpenAI ou Gemini). Código e prazo iguais. Vantagem: saída estruturada madura; leitura de PDF (e áudio em alguns) serviria ao anexo/áudio da M13/M14. Desvantagem: custo próprio; não conta para a 5.8.
    3. **Manter a fonte de exemplo até depois da demo.** Vantagem: zero risco. Desvantagem: a demo mostra uma IA falsa.
  - **Recomendação:** 1 assim que a lista sair, escolhendo um parceiro com saída JSON estruturada; 2 se nenhum parceiro tiver LLM. Em qualquer caso, a falha da IA continua abrindo o formulário manual (4f).
  - **Atualização (proposta de IA, 11/11/2026):** decisão marcada para sexta (13/11). A `docs/7-proposta-ia.md` §f compara as opções gratuitas para testar antes (Ollama, Groq, Gemini, GitHub Models, OpenRouter, com os limites "a confirmar") e propõe o script `ai:eval` (tarefa 10) para levar números de qualidade e latência à reunião. Qualquer fornecedor no formato OpenAI entra só pelo `.env`; outro formato é um adaptador novo. Ver a subseção "Proposta de IA (11/11/2026)" abaixo.

- [ ] [EXECUTAR] Endpoint do assistente de novo objetivo — (origem: M1, `apps/mobile/lib/features/goals/data/goal_assistant_repository.dart`, 11/11/2026) — depende do [DECIDIR] "Provedor de LLM" para a implementação real; dá para começar com o provider fake
  - **O que fazer:**
    - Domínio: `GoalAssistantProvider` (`modules/goals/src/goal/provider/`) com `extractGoal(text)` e `suggestSteps(goal)`; um caso de uso que encadeia os dois **sem gravar** (o usuário confere e depois chama `POST /goals`); fake em `test/mock`.
    - Rota sugerida: `POST /goals/assistant`, com JWT; nome final no contrato (`docs/4-contrato-api.md`) e no `openapi.json`.
    - **Entrada:** `{ "text": string }` (não vazio depois de `trim`).
    - **Saída 200** (o que a interface do mobile, `GoalSuggestion`, espera): `{ "title": "Trabalho de Algoritmos", "deadline": "2026-11-24" | null, "steps": [ { "title": "…", "estimatedMinutes": 180 } ] }`. Títulos de 1 a 120 caracteres (P2); `estimatedMinutes` múltiplo de 15, mínimo 15 (P5): o backend arredonda o que a IA sugerir; `microSteps` opcional (P6/4f).
    - **Erros:** 400 formato; 401; 422 texto vazio; 503 quando o provedor falhar (o app abre a M15 vazia, 4f).
    - Mobile: `HttpGoalAssistantRepository` em `apps/mobile/lib/features/goals/data/` e a troca em `AppDependencies.http` (o comentário "EXAMPLE" marca o lugar).
  - **Critério de pronto:** testes de domínio com o fake (100%); integração (feliz, 400, 401, 422, 503 com provider que falha); contrato e OpenAPI atualizados; teste do repositório HTTP do mobile.
  - **Atualização (proposta de IA, 11/11/2026):** a `docs/7-proposta-ia.md` detalha e ajusta este item, **pendente do [DECIDIR] "Aprovar a proposta de IA"**: rota `POST /goals/assistant/draft`; métodos com os nomes da 4f (`parseGoal`, não `extractGoal`); a saída ganha `category`, `requirements`, `missingFields`, `engine` e, por etapa, `microSteps` e `aiEstimatedMinutes`; o `POST /goals` passa a aceitar `source` e `aiEstimatedMinutes`; motor de regras (`AI_PROVIDER=rules`) para testar o fluxo antes do fornecedor. O trabalho foi quebrado nas tarefas 1–11 do §g.

- [ ] [DECIDIR] Tipo do prazo e nome curto do objetivo — (origem: W1, W2, M2 e revisores, 11/11/2026) — afeta Frontend (W17–W19, W21, prévia do e-mail na W26) e Mobile (M21)
  - **Contexto:** os protótipos mostram o tipo da entrega ("Entrega", "Prova", "Publicar") e um nome curto do objetivo ("Eng. Software") além do completo ("Trabalho de Engenharia de Software"). O contrato (`GET /goals`) só tem `title`. Os apps usam "Entrega" fixo e o título inteiro (no web, títulos longos quebram por sílaba na coluna estreita ou cortam com "…").
  - **Alternativas:**
    1. **Manter.** Código: nada. Desvantagem: "Entrega" para uma prova; nomes longos cortados.
    2. **Campos `deadlineKind` e `shortTitle`** no domínio, contrato, banco e nas telas de criação (web e mobile). Prazo: meio dia a um dia. Vantagem: fidelidade. Desvantagem: dois campos novos no formulário.
    3. **Nome curto derivado no front** (truncagem). Código: pouco. Desvantagem: corta palavras; não resolve o tipo.
  - **Recomendação:** 1 no MVP; 2 depois, se o design confirmar os dois nomes.

- [ ] [DECIDIR] Próxima etapa no `GET /goals` — (origem: revisor da W1, `apps/frontend/src/modules/goals/pages/goal-list.page.tsx:30`, 11/11/2026)
  - **Contexto:** a lista de objetivos (W21) mostra a próxima etapa de cada objetivo; o `GET /goals` não a traz, então o web faz um `GET /goals/:id` por objetivo.
  - **Alternativas:** 1. **manter** (poucos objetivos no MVP); 2. **acrescentar `nextStep{title, nextBlock}` ao `GET /goals`** (orquestrador `goals-view`, contrato e testes; 2–3 h).
  - **Recomendação:** 1 no MVP.

- [ ] [DECIDIR] Endpoints de preferências do usuário (tema, e-mail diário) e envio do e-mail — (origem: W1, W26, 11/11/2026)
  - **Contexto:** a W26 usa um `ExampleSettingsRepository` em memória também no modo http (tema e e-mail diário não existem no contrato).
  - **Alternativas:** 1. **`GET`/`PATCH /me/preferences` no auth** (a tela só troca a implementação do repositório; meio dia, mais o envio do e-mail com provider); 2. **depois do MVP**.
  - **Recomendação:** 2. Não está no mínimo obrigatório.

- [ ] [DECIDIR] Endpoint de gamificação para o Jardim (W25) e a barra gamificada — (origem: W1, 11/11/2026)
  - **Contexto:** o Jardim mostra nível, XP, dias regados, histórico, conquistas e loja com valores fixos (P18).
  - **Alternativas:** 1. **manter fixo até o módulo `gamification`** (P18); 2. **criar o módulo agora** (dias de trabalho, fora do MVP).
  - **Recomendação:** 1.

- [ ] [DECIDIR] Compromissos fixos (Aula/Estágio) fora do contrato — (origem: revisor da W1, 11/11/2026)
  - **Contexto:** o domínio já tem `Commitment` (P8, implementação vazia `EmptyCommitmentRepository`), mas o contrato não expõe compromissos. A grade da W26 e o calendário ficam sem a hachura "Aula/Estágio" e sem a legenda "Aula e estágio" do protótipo.
  - **Alternativas:** 1. **manter (P8)**; 2. **expor e persistir compromissos** (CRUD, prisma, contrato e telas; 1–2 dias).
  - **Recomendação:** 1 no MVP, como decidido na P8.

- [ ] [DECIDIR] Usuário de teste deixado no Postgres local — (origem: W1, investigação do bug do novo objetivo, 11/11/2026)
  - **Contexto:** para provar que o bug não era do backend, o subagente cadastrou `w1.bug.1794402356@teste.local` no banco **local**, com disponibilidade e cerca de 6 objetivos. O demo e o `db:reset-demo` não foram tocados.
  - **Alternativas:** 1. **apagar o usuário** (um `DELETE` no banco local); 2. **manter** (não afeta nada).
  - **Recomendação:** 1, quando você quiser; não apaguei porque é o seu banco.

### Proposta de IA (11/11/2026)

Origem comum: `docs/7-proposta-ia.md` (rodada de análise, sem implementação). Os itens marcados "sexta" vão para a reunião do time de 13/11; os outros são seus. O fornecedor e o modelo estão no [DECIDIR] "Provedor de LLM do assistente de novo objetivo", acima.

- [ ] [DECIDIR] Aprovar a proposta de IA (arquitetura, contrato e plano) — (origem: `docs/7-proposta-ia.md` §c, §d, §e.2 e §g, 11/11/2026) — afeta Frontend e Mobile
  - **Contexto:** a 4f define a IA do novo objetivo (`parseGoal` + `suggestSteps`, confirmação do usuário, formulário manual se falhar), mas não a arquitetura, o contrato nem como testar sem fornecedor. Você pediu um substituto da IA até sexta e a troca para a IA real só por configuração.
  - **Problema:** sem aprovação, nenhuma das tarefas do §g pode começar (a regra do processo proíbe endpoint ou campo fora do plano aprovado). A proposta muda o contrato aprovado (`POST /goals` ganha `source` e `aiEstimatedMinutes`) e a modelagem (porta, `DraftGoal`, `GoalDraftNormalizer`).
  - **Alternativas:**
    1. **Aprovar como está.** Código: as tarefas 0–11 do §g (≈ 3–4 dias de uma pessoa; o caminho mínimo até o fluxo testável com o motor de regras é 0 → 1/2/4 → 5 → 7, ≈ 1,5 dia). Telas: mobile nenhuma; web W27/W29/W30 preenchida. Vantagem: fluxo de ponta a ponta testável antes de sexta e troca de fornecedor só pelo `.env`. Desvantagem: mexe num contrato aprovado.
    2. **Aprovar com ajustes** (ex.: `AI_PROVIDER=fake` em vez de `rules`; prompts em `.ts` em vez de `.md`; sem o máximo de 240 min por etapa; sem o campo `engine`). Código e prazo iguais. Vantagem: atende preferências do time. Desvantagem: cada ajuste precisa ser escrito no item.
    3. **Adiar até a escolha do fornecedor** e implementar direto para ele. Código: o mesmo, sem o motor de regras. Vantagem: menos código. Desvantagem: nada testável até sexta; a demo fica sem reserva offline; testes de ponta a ponta dependem de rede e de cota.
  - **Recomendação:** 1. Os pontos que mais mudam a sua proposta original estão no §e.2 (renomear "fake" para "rules", validação em duas camadas, um endpoint só, orçamento total de 15 s, `source`/`aiEstimatedMinutes` no `POST /goals`, web precisa de telas).

- [ ] [DECIDIR] Chave, custo e limites de uso da IA (sexta) — (origem: `docs/7-proposta-ia.md` §c.6, §c.8 e §h, 11/11/2026)
  - **Contexto:** a chave do fornecedor fica só no `.env` do backend e no segredo da hospedagem (que também é pendência de sexta). O repositório é público até a apresentação (4j), e a demo pode ser aberta por qualquer pessoa logada.
  - **Problema:** sem dono da conta, teto de gasto e limite por usuário, uma demo pública pode esgotar a cota gratuita (ou gerar custo) no meio da apresentação.
  - **Alternativas:**
    1. **Conta do time num plano gratuito + limite em memória por usuário** (ex.: 20 rascunhos por hora → 429), feito à mão, sem dependência. Código: 2–3 h com testes. Telas: o 429 cai no formulário manual (mesmo caminho do 503). Vantagem: custo zero e sem dependência. Desvantagem: o limite zera quando o backend reinicia.
    2. **Igual à 1, com `@nestjs/throttler`.** Código: 1–2 h. Vantagem: pronto e configurável. Desvantagem: dependência nova (precisa de aprovação).
    3. **Conta paga com teto de gasto no painel do fornecedor, sem limite no app.** Código: nada. Vantagem: simples. Desvantagem: depende de cartão e do teto do fornecedor funcionar.
  - **Recomendação:** 1, com a conta no nome de quem for apresentar e a chave guardada só no segredo da hospedagem. Definir também quem pode ver a chave.

- [ ] [DECIDIR] Privacidade dos textos enviados à IA (sexta) — (origem: `docs/7-proposta-ia.md` §c.6 e §f, 11/11/2026)
  - **Contexto:** a proposta manda ao fornecedor só o texto do objetivo e a data de hoje (nunca nome, e-mail, id ou fuso). Alguns planos gratuitos podem usar o conteúdo para treino ou revisão humana: os termos do Gemini gratuito dizem isso (conferir a versão atual); para Groq, GitHub Models e OpenRouter, "a confirmar".
  - **Problema:** um estudante pode colar o enunciado com o próprio nome, matrícula ou dados de terceiros. O app não avisa que o texto vai para um terceiro.
  - **Alternativas:**
    1. **Só fornecedor que não treina com os dados** (confirmado nos termos) e nada de aviso. Código: nada. Vantagem: sem atrito. Desvantagem: depende de ler e guardar os termos.
    2. **Igual à 1, mais uma linha de aviso** no chat ("O texto é analisado por uma IA externa"). Código: 30 min por app. Telas: texto que o design não tem. Vantagem: transparência. Desvantagem: texto sem design.
    3. **Ollama ou outro modelo próprio na hospedagem.** Código: só `.env`. Vantagem: nada sai do nosso servidor. Desvantagem: hospedagem com GPU ou CPU forte; mais lento.
  - **Recomendação:** 1 para a demo, usando só textos inventados enquanto o fornecedor não estiver confirmado; 2 quando houver usuários reais.

- [ ] [DECIDIR] O que fazer quando a IA falha: motor de regras, formulário manual ou os dois (sexta) — (origem: `docs/7-proposta-ia.md` §c.5, 11/11/2026) — cruza com o Mobile "Aviso quando a IA falha no chat"
  - **Contexto:** a 4f diz "se a IA falhar, abre o formulário manual". A proposta acrescenta a opção de cair no motor de regras (instantâneo, sem rede), controlada por `AI_FALLBACK=rules|none`. A resposta traz `engine: 'llm' | 'rules'`.
  - **Problema:** cair nas regras dá ao usuário um rascunho de qualidade menor sem ele saber; não cair deixa a demo à mercê da rede e da cota.
  - **Alternativas:**
    1. **Regras como reserva, sem aviso** (`AI_FALLBACK=rules`). Código: incluído na tarefa 10. Telas: nenhuma. Vantagem: o fluxo nunca quebra na demo. Desvantagem: muda a 4f; rascunho genérico apresentado como da IA.
    2. **Formulário manual, como na 4f** (`AI_FALLBACK=none` → 503 → M15/W30 vazia). Código: incluído. Vantagem: honesto e já previsto. Desvantagem: na falha, o usuário monta tudo à mão.
    3. **Regras como reserva, com aviso** quando `engine = 'rules'` (balão do Broto: "Montei um rascunho básico, confere?"). Código: 1 h por app. Telas: texto sem design. Vantagem: nunca quebra e é transparente. Desvantagem: texto e estado sem design.
  - **Recomendação:** 3 se o time aprovar o texto; senão 1 na apresentação e 2 depois dela. Em qualquer caso, a decisão vai para a `docs/2-decisoes-mvp.md` como ajuste da 4f.

- [ ] [DECIDIR] Leitura de link e anexo (UC03): Firecrawl no MVP? (sexta) — (origem: `docs/7-proposta-ia.md` §a.1 A5–A7, 11/11/2026) — cruza com o Mobile "Anexo e áudio do chat (M13/M14) só visuais" e com o Frontend (aba "Colar link", W28)
  - **Contexto:** o UC03 está no MVP dos casos de uso, mas fora do mínimo obrigatório (4a). O web tem a aba "Colar link" (W28); o mobile tem o clipe e o microfone (M13/M14), hoje só visuais. A leitura de páginas seria pelo Firecrawl (citado no UC03 e no README) atrás de um `PageReaderProvider`.
  - **Problema:** sem decisão, a aba e o clipe continuam sem efeito; com decisão, entra uma porta nova, um fornecedor novo e mais uma chave.
  - **Alternativas:**
    1. **Só link, com Firecrawl, na fatia 3** (depois do texto funcionar). Código: porta + adaptador + `url?` no `POST /goals/assistant/draft` (1 dia). Telas: a W28 passa a funcionar; o mobile segue só visual. Vantagem: usa um parceiro com caso real (5.8, se o Firecrawl for parceiro: a confirmar). Desvantagem: páginas com login (Moodle) não são lidas; o usuário teria de colar o texto.
    2. **Link e PDF** (PDF por extração de texto ou LLM que lê PDF). Código: 2–3 dias, com upload no backend e pacotes novos nos apps. Vantagem: o caso do enunciado em PDF (M14). Desvantagem: prazo; depende do fornecedor.
    3. **Nada no MVP;** só texto. Vantagem: foco no mínimo. Desvantagem: a W28 e o clipe ficam sem efeito na demo.
  - **Recomendação:** 3 até o texto estar no ar; depois 1, se o Firecrawl estiver entre os parceiros. Áudio fica para depois do hackathon.

- [ ] [DECIDIR] Perguntas de esclarecimento no chat (prazo faltando) — (origem: `docs/7-proposta-ia.md` §b, 11/11/2026) — afeta Mobile (M13–M15) e Frontend (W27–W30)
  - **Contexto:** você pediu a conversa do chat com perguntas de esclarecimento. Nenhum design mostra a IA perguntando. O prazo é opcional (P3), então a falta dele não impede salvar.
  - **Problema:** escolher entre um turno só (o que falta aparece vazio na tela de etapas) e uma conversa de verdade, e onde guardar o histórico.
  - **Alternativas:**
    1. **Um turno, sem estado** (`missingFields` na resposta; a M15/W30 mostra o prazo vazio). Código: incluído no plano. Telas: nenhuma nova. Vantagem: nada sem design; funciona igual com regras e LLM. Desvantagem: o Broto não pergunta.
    2. **Uma pergunta, sem estado** (`type: 'question'`; o app reenvia rascunho + resposta). Código: 1 dia (backend, os dois apps e testes). Telas: balão de pergunta e resposta curta, sem design. Vantagem: conversa de verdade sem tabela; o motor de regras responde de forma determinística. Desvantagem: estados sem design.
    3. **Sessão no backend** (tabela de conversas). Código: 2 dias (migration, posse, expiração, endpoints). Vantagem: histórico guardado. Desvantagem: o mais caro, sem ganho para a demo.
  - **Recomendação:** 1 no MVP; 2 depois que o design do balão existir. A 3 não compensa.

- Ver também: "Tipo do prazo e nome curto do objetivo" (acima): a `category` do rascunho (`exam`, `assignment`, `project`) poderia alimentar o tipo do prazo ("Prova", "Entrega", "Publicar") nos objetivos criados pela IA; não faz parte da proposta.

### Concluídos (registro da sessão de 10/11/2026)

- [x] [EXECUTAR] Ligar o `ValidationPipe` (P19) e decorar os corpos do auth — (origem: diário, problema 3, C0, 10/11/2026) — fechado na C1 (`e39052e`).
- [x] [EXECUTAR] Configuração comum da aplicação em `apps/backend/src/app.setup.ts` (`configureApp`), usada pelo `main.ts` e pelos testes de integração — (origem: diário, problema 4, C0, 10/11/2026) — fechado na C0 (`189cd98`).
- [x] [EXECUTAR] Verificador completo inclui `test:e2e` do backend — (origem: diário, problema 5, C0, 10/11/2026) — registrado na regra do processo (§4).
- [x] [INVESTIGAR] Integração de docs com a verificação vermelha (`ac1ccd7`) — (origem: diário, problema 6, 10/11/2026) — causa: cliente do Prisma desatualizado no checkout principal; corrigido no processo (o verificador roda `prisma:generate` e grava selo verde por SHA; a integração exige o selo).
- [x] [EXECUTAR] Brief do revisor da C3 citava um `GetRampOptions` inexistente — (origem: diário, problema 7, C3, 10/11/2026) — sem ação: não é requisito; o `BuildRamp` (docs/3 §4.6) não usa histórico.
- [x] [INVESTIGAR] Teste ao vivo da D1 gravou uma grade no usuário demo do banco local — (origem: diário, problema 9, D1, 10/11/2026) — resolvido com o `db:reset-demo` (`eefc30b`); a validação do script segue no item "Script `db:reset-demo`".
- [x] [INVESTIGAR] Folga de 1 dia com prazo a 14 dias — (origem: diário, problema 13, E-web, 10/11/2026) — não é bug: é o `slackDays` da P9.
