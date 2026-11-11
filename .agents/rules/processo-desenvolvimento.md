# Regra: processo de desenvolvimento do MVP

Vale para toda mudança no repositório (código e documentação), para o agente principal e para todo subagente, até o fim do hackathon. Definido pelo usuário em 10/11/2026.

## 1. A main é intocável

- A `main` está publicada com a landing em produção. É proibido alterá-la de qualquer forma: commit, merge, push, rebase, reset, cherry-pick ou PR para a `main`.
- Isso só muda quando o usuário escrever explicitamente **"pode mandar para a main"**. Na dúvida, não mexa.

## 2. Fluxo de branches (toda mudança, inclusive docs)

1. Atualizar a `developer` local com a remota.
2. Criar uma branch a partir da `developer`: `feat/<area>-<assunto>`, `fix/...` ou `docs/...`.
3. Fazer TDD (seção 3) e implementar.
4. Antes de integrar, trazer a `developer` mais recente para a branch e rodar a verificação completa (seção 4).
5. Só com tudo verde (e o revisor ok, quando houver subagente): merge na `developer` e push da `developer`.
6. Se algo falhar em qualquer passo: **não** fazer merge. Parar e reportar. A `developer` precisa estar sempre funcionando.

## 3. TDD (obrigatório)

- Ordem: teste primeiro (vermelho) → implementação mínima até passar (verde) → refatorar com os testes verdes.
- Os testes nascem dos cenários de teste aprovados (`docs/3-modelagem-dominio.md`). Não inventar cenário; se faltar, é pergunta.
- Prova obrigatória no relatório: a saída do teste falhando antes da implementação e passando depois.
- Se uma skill gerar código e teste juntos: escrever ou ajustar os testes dos cenários aprovados **antes** de aceitar o código e confirmar que eles falhariam sem a implementação.
- Por camada:
  - **domínio** (`modules/*`): unidade dos casos de uso e das classes puras, com fakes, 100% de cobertura e teste negativo de posse;
  - **backend**: integração (supertest) de cada endpoint antes do controller (caminho feliz, 401, 404 de recurso de outro usuário, validação);
  - **web**: testes do comportamento dos repositórios e da lógica de tela antes das telas; o visual é validado pela comparação com o screenshot;
  - **mobile**: testes dos controladores (`ChangeNotifier`) e dos repositórios antes das telas, mais widget test do fluxo principal de cada tela; o visual é validado pela comparação com o screenshot.

## 4. Verificação completa (antes de qualquer merge na developer)

- `npm run build`;
- lint de todos os workspaces (`npx turbo run lint`);
- testes de todos os workspaces (`npm run test --workspaces --if-present`);
- testes de integração do backend (`npm --workspace apps/backend run test:e2e`, com o Postgres no ar);
- cobertura de 100% no domínio;
- `flutter analyze` e `flutter test` em `apps/mobile`;
- zero import de framework no domínio: `grep -rnE "@nestjs|@prisma/client|from ['\"]express|bcrypt|jsonwebtoken" modules/*/src packages/shared/src` (a regra `BcryptHashRule` do `shared` é falso positivo conhecido).

Tudo verde, ou não há merge.

## 5. Escopo e problemas

- Fazer só o que a etapa atual pede. Nada de funcionalidade, tela, campo, endpoint, dependência ou refatoração fora do plano aprovado (`docs/5-plano-execucao.md`).
- Problema, erro ou dúvida: **parar e reportar** (o que fazia, o erro exato, a causa provável, as opções). Não contornar nem inventar solução. Subagente que parar devolve o problema ao agente principal, que devolve ao usuário; ninguém decide pelo usuário. Todo problema reportado vai para o `afazeres.md` (seção 10).
- Se o design ou os docs não definirem algo, não inventar: registrar como [DECIDIR] no `afazeres.md`.
- Mobile: desenvolver e testar **só no simulador iOS**. O iPhone físico é testado à mão pelo usuário.

## 6. Fontes da verdade, nesta ordem

1. `docs/2-decisoes-mvp.md`;
2. a modelagem, os cenários e o contrato aprovados (`docs/3-modelagem-dominio.md`, `docs/4-contrato-api.md`, `docs/5-plano-execucao.md`);
3. `.agents/rules/*`;
4. `design/**/source` + `screens` + `SCREENS.md`;
5. `docs/0-casos-de-uso.md`;
6. `docs/0-fluxos.md`;
7. `docs/1-passo-a-passo.md`.

## 7. Etapas e portões

Ao fim de cada etapa: verificar, relatar e **esperar o "aprovado" do usuário** para começar a próxima. Dentro da etapa, as branches vão para a `developer` conforme a seção 2.

- **A:** modelagem, cenários de teste e contrato da API (sem código, sem subagentes).
- **B:** em paralelo, cada subagente na sua worktree e branch: domínio de goals, scheduling e activation; telas web e telas mobile com dados de exemplo atrás de repositórios.
- **C:** backend, sequencial, um módulo por vez (testes de integração → prisma-sync → prisma-repository → nest-controller → openapi.json), depois os orquestradores.
- **D:** web e mobile trocam os repositórios de exemplo por HTTP real, sem mudar as telas.
- **E:** teste de ponta a ponta automatizado (Playwright no web, `integration_test` no simulador iOS) do fluxo login demo → onboarding → objetivo → plano → Hoje → rampa → registrar → plano recalculado.

## 8. Orquestração de subagentes

- Cada subagente recebe: a tarefa exata (copiada do plano aprovado), a branch, as pastas que pode alterar, os cenários que deve implementar primeiro, os arquivos para ler antes, as skills, os critérios de pronto e esta regra inteira.
- **Arquivos compartilhados só o agente principal altera:** `package.json` e `package-lock.json` da raiz, `turbo.json`, `app.module.ts`, prisma (schema e migrations), `openapi.json`, `afazeres.md`, `docs/**` e `.agents/**`. Se um subagente precisar de algo neles, ele para e pede.
- Nenhum subagente roda `npm install`. Dependência nova só se estiver no plano aprovado, e quem instala é o agente principal.
- Nenhum subagente faz merge nem push. Quem integra na `developer` é o agente principal (seções 2 e 4).
- Relatório fixo de cada subagente: branch, arquivos alterados, teste falhando antes e passando depois, comandos de verificação com saída, pendências, problemas.
- Antes de qualquer merge, um subagente **revisor**, que não escreveu o código, confere a entrega contra: `.agents/rules/*`; o plano aprovado (algo fora do escopo?); os cenários aprovados (todos com teste? algum escrito depois do código?); o contrato; o grep de framework; `userId` em todo repositório; a cobertura; a fidelidade ao design. O revisor só aponta; quem corrige é o subagente original.
- Conflito de branches paralelas com a `developer`: não resolver por conta própria; reportar o conflito e as opções.

## 9. Relatório de cada portão

(a) o que foi entregue, por subagente e por branch; (b) a saída da verificação completa; (c) a prova do TDD (vermelho → verde) por tarefa; (d) o que o revisor apontou e como ficou; (e) diferenças em relação ao design; (f) perguntas e problemas em aberto; (g) o estado da `developer` e a confirmação de que a `main` não foi tocada; (h) a próxima etapa e o que ela vai fazer.

## 10. Afazeres (`afazeres.md` na raiz)

Definido pelo usuário em 11/11/2026. Vale para todo agente, em toda execução.

- **Todo erro, problema, pergunta ou pendência** encontrado por qualquer agente vai para o `afazeres.md` com a tag certa. Nada fica só no relatório ou no diário.
- **Só o orquestrador (agente principal) edita o `afazeres.md`.** Os subagentes reportam os itens para ele no relatório, já no formato abaixo.
- Estrutura: `# Afazeres`, com as seções `## Frontend (web)`, `## Mobile` e `## Backend (inclui domínio modules/*, banco e contrato)`. Item que envolve mais de um projeto fica no projeto onde a correção acontece, com referência cruzada nos outros.
- Formato de cada item: `- [ ] [TAG] Título curto — (origem: arquivo/tarefa/data)`. Concluído vira `- [x]`, com o commit ou a decisão que fechou o item. **Não apague itens concluídos.**
- Tags:
  - **[INVESTIGAR]**: algo deu errado e a causa ainda não é conhecida. Descreva o sintoma, como reproduzir, o erro exato e onde já se olhou. Ainda não há decisão a tomar.
  - **[DECIDIR]**: o problema é conhecido e há mais de um jeito de resolver; espera decisão do usuário. Obrigatório, escrito para quem não participou da conversa:
    - contexto (o que é, onde aparece, por que importa);
    - o problema;
    - alternativas numeradas, cada uma com o que implica no código, nas telas e no prazo, vantagens e desvantagens;
    - a recomendação do agente e o motivo.
  - **[EXECUTAR]**: a decisão já está tomada; falta só implementar. Descreva o que fazer e o critério de pronto.
- Quando um [DECIDIR] for decidido, ele vira [EXECUTAR] com a decisão escrita no item, e a decisão vai também para `docs/2-decisoes-mvp.md`.
- Nenhum agente decide um [DECIDIR] pelo usuário.
