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

### Concluídos (registro da sessão de 10/11/2026)

- [x] [EXECUTAR] Ligar o `ValidationPipe` (P19) e decorar os corpos do auth — (origem: diário, problema 3, C0, 10/11/2026) — fechado na C1 (`e39052e`).
- [x] [EXECUTAR] Configuração comum da aplicação em `apps/backend/src/app.setup.ts` (`configureApp`), usada pelo `main.ts` e pelos testes de integração — (origem: diário, problema 4, C0, 10/11/2026) — fechado na C0 (`189cd98`).
- [x] [EXECUTAR] Verificador completo inclui `test:e2e` do backend — (origem: diário, problema 5, C0, 10/11/2026) — registrado na regra do processo (§4).
- [x] [INVESTIGAR] Integração de docs com a verificação vermelha (`ac1ccd7`) — (origem: diário, problema 6, 10/11/2026) — causa: cliente do Prisma desatualizado no checkout principal; corrigido no processo (o verificador roda `prisma:generate` e grava selo verde por SHA; a integração exige o selo).
- [x] [EXECUTAR] Brief do revisor da C3 citava um `GetRampOptions` inexistente — (origem: diário, problema 7, C3, 10/11/2026) — sem ação: não é requisito; o `BuildRamp` (docs/3 §4.6) não usa histórico.
- [x] [INVESTIGAR] Teste ao vivo da D1 gravou uma grade no usuário demo do banco local — (origem: diário, problema 9, D1, 10/11/2026) — resolvido com o `db:reset-demo` (`eefc30b`); a validação do script segue no item "Script `db:reset-demo`".
- [x] [INVESTIGAR] Folga de 1 dia com prazo a 14 dias — (origem: diário, problema 13, E-web, 10/11/2026) — não é bug: é o `slackDays` da P9.
