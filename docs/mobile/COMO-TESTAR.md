# Como testar o mobile

O app (`apps/mobile`, Flutter) tem as telas da fatia do MVP:
- login (com "Entrar direto como Arthur (demo)") e cadastro, os dois como placeholder;
- onboarding: grade por período (T02) e limite (T03);
- Hoje (M01), Objetivos (M02), Semana (M03);
- rampa: check-in, escada, aquecimento, desafio, micro-passo, foco, registro e celebração (M05 a M12);
- trilha (M18);
- novo objetivo, que começa vazio (M15, P20), e tarefa única (M16);
- Jardim, como placeholder.

**Só o simulador iOS foi testado.** O iPhone físico ficou fora desta fase.

Os comandos rodam **a partir da raiz do repositório**, exceto onde está escrito `cd apps/mobile`. Testados em 10/11/2026.

## Antes de começar

Você precisa de:
- um **Mac com Xcode** instalado;
- o **Flutter** instalado (`flutter --version`);
- para dados reais: o **backend no ar** na porta 4000, conforme `docs/backend/COMO-TESTAR.md`.

```bash
cd apps/mobile && flutter pub get
```

## Arquivos de ambiente

Em `apps/mobile/env/`, cada arquivo traz `API_URL` (o endereço do backend) e `DATA_SOURCE` (de onde vêm os dados):

| Arquivo | Para que serve | `API_URL` |
|---|---|---|
| `local-simulator.json` | Simulador iOS no seu Mac | `http://localhost:4000` |
| `local-iphone.json` | iPhone físico (arquivo seu, fora do git; modelo em `local-iphone.example.json`) | `http://<IP do seu Mac>:4000` |
| `developer.json`, `prod.json` | Backends hospedados | ainda exemplo |

O `DATA_SOURCE` aceita dois valores:
- `http` (padrão): usa o backend real;
- `sample`: usa os dados de exemplo do protótipo, sem backend. Para usá-lo, acrescente `--dart-define=DATA_SOURCE=sample` ao comando.

Duas observações sobre os dados:
- A gamificação mostra valores fixos nos dois modos (P18). No modo `http`, as tarefas leves do Hoje vêm vazias, porque estão fora do contrato.
- O token fica **só em memória**: fechar o app desloga.

## 1. Rodar no simulador iOS contra o backend real

Com o backend no ar, abra o simulador e ligue um iPhone. A lista dos que você tem sai de `xcrun simctl list devices available`.

```bash
open -a Simulator
```

```bash
xcrun simctl boot "iPhone 17"
```

```bash
cd apps/mobile && flutter run -d "iPhone 17" --dart-define-from-file=env/local-simulator.json
```

A primeira vez leva cerca de 1 minuto (`Xcode build done`). Para recomeçar do onboarding, zere antes os dados do demo:

```bash
npm --workspace apps/backend run db:reset-demo
```

### Roteiro manual

1. **Entrar direto como Arthur (demo).** Sem grade cadastrada, o app vai para o onboarding.
2. **Onboarding:** marque os períodos livres (T02), escolha o limite (T03) e conclua. O app chega ao **Hoje**.
3. **Novo objetivo:** em Objetivos, toque em **Novo objetivo** e, no chat, em **Preencher à mão** (ou siga a seção "Novo objetivo com a IA" abaixo). A tela começa vazia (M15). Preencha título, prazo (cerca de 2 semanas à frente) e 2 etapas, e salve. Aparece o toast "2 etapas no calendário" e o app vai para a **Semana**.
4. **Hoje:** a etapa aparece como **Próxima** se houver horário livre ainda hoje. Toque em **Vamos começar?**, escolha a energia e o tempo e siga a escada até o **Foco**.
5. **Registrar:** encerre o foco, escolha **Concluí** e toque em **Registrar** e depois em **Voltar pra Hoje**.
6. **Plano recalculado:**
   - no Hoje, a etapa aparece como **Concluída**;
   - em Objetivos, o objetivo mostra 50%;
   - a trilha mostra "1 de 2 etapas concluídas".

**Limite conhecido:** no mobile, a rampa só abre pelo Hoje. Se o dia não tiver mais bloco (depois de cerca de 22h45, por exemplo), não dá para iniciar a rampa naquele dia.


### Novo objetivo com a IA (M13 → M15)

Desde 12/11/2026, **Novo objetivo** (em Objetivos) abre o **chat** (decisão IA4):

1. Escreva o objetivo (ex.: `Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11`) e envie. Depois do "analisando", abre a M15 preenchida com as etapas.
2. Salve. O objetivo é gravado com `source: "ai"` e a estimativa original de cada etapa.
3. Para o caminho manual, toque em **Preencher à mão** no chat: abre a M15 vazia, como antes.
4. Se a IA falhar e o backend estiver com `AI_FALLBACK=none`, a M15 abre vazia (formulário manual, 4f).

No modo `http`, quem responde é o backend (`POST /goals/assistant/draft`): com `AI_PROVIDER=rules` (padrão), o motor de regras; com o Ollama, o modelo local. **Para trocar o motor, só o `apps/backend/.env` muda** (ver `docs/backend/COMO-TESTAR.md`, seção 8b) e o backend é reiniciado; o app não muda. No modo `sample`, o rascunho é o fixo do protótipo.

Ponta a ponta do assistente (tarefa 11): com o backend no ar com `AI_PROVIDER=rules AI_FALLBACK=rules` (seção 2, passo 1) e o simulador ligado, zere o demo e rode:

```bash
npm --workspace apps/backend run db:reset-demo
```

```bash
cd apps/mobile && flutter test integration_test/novo_objetivo_ia_test.dart -d <UDID> --dart-define-from-file=env/local-simulator.json
```

Esperado: `All tests passed!` em cerca de 30 s. O `db:reset-demo` é obrigatório antes de cada execução (o teste faz o onboarding do demo).

Para sair, aperte `q` no terminal.

## 2. Testes

**Unitários e de widget** (dados de exemplo):

```bash
cd apps/mobile && flutter analyze && flutter test
```

Esperado: `No issues found!` e `All tests passed!` (160 testes em 10/11).

**Ponta a ponta no simulador** (`integration_test`, contra o backend real). Percorre login demo → onboarding → objetivo → Semana → Hoje → rampa → foco → registrar → plano recalculado.

1. Compile e suba o backend num terminal separado:

   ```bash
   npm --workspace apps/backend run prisma:generate && npm run build
   ```

   ```bash
   cd apps/backend && AI_PROVIDER=rules AI_FALLBACK=rules node dist/main
   ```

   As variáveis na frente garantem o motor de regras (determinístico, sem rede, IA6), mesmo que o seu `.env` aponte para o Ollama.

2. Antes de **cada** execução, zere os dados do demo:

   ```bash
   npm --workspace apps/backend run db:reset-demo
   ```

3. Ligue o simulador e pegue o UDID dele:

   ```bash
   xcrun simctl boot "iPhone 17" && open -a Simulator
   ```

   ```bash
   xcrun simctl list devices booted
   ```

4. Rode, trocando `<UDID>` pelo identificador da lista:

   ```bash
   cd apps/mobile && flutter test integration_test/fluxo_principal_test.dart -d <UDID> --dart-define-from-file=env/local-simulator.json
   ```

Esperado: `All tests passed!`, em cerca de 45 s mais o build do Xcode na primeira vez.

**O teste depende do relógio real.** Ele precisa de um bloco no dia atual, então rode antes de cerca de 22h45 e fora da noite de domingo. Fora disso, ele falha com a mensagem "sem bloco hoje".

## 3. Rodar pelo VS Code

O `.vscode/launch.json` tem uma opção de Run por ambiente:
- **Bora mobile · local (simulador)**
- **Bora mobile · local (iPhone físico)**
- **Bora mobile · developer (hospedado)**
- **Bora mobile · prod (hospedado)**

Escolha o aparelho no canto inferior direito antes de rodar. Essas opções não foram testadas dentro do VS Code; os comandos de terminal equivalentes foram.

## Comparações com o protótipo

As capturas lado a lado (referência × simulador) e as diferenças justificadas estão em `docs/mobile/comparacoes/`.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Depois do demo, vai direto ao Hoje e não ao onboarding | O demo já tem grade gravada | `npm --workspace apps/backend run db:reset-demo` |
| Tela de erro ao carregar o Hoje | Backend fora do ar | Suba o backend ou use `--dart-define=DATA_SOURCE=sample` |
| Volta para a tela de login | Sessão expirou (401) ou o app foi fechado (token só em memória) | Entre de novo pelo demo |
| `No devices found` | Simulador desligado | `xcrun simctl boot "iPhone 17"` |
| O `integration_test` falha com "sem bloco hoje" | Horário tarde demais para caber um bloco no dia | Rode mais cedo |
| O app no iPhone físico não alcança o backend | IP errado ou redes diferentes | Confira o IP com `ipconfig getifaddr en0`. Esta fase só testou o simulador |
