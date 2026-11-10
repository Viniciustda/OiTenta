# Como testar o frontend (landing page)

Hoje o frontend (`apps/frontend`, Next.js) tem só a **landing page** na rota `/`. Todos os comandos abaixo são rodados **a partir da raiz do repositório** (a pasta `OiTenta`) e foram testados em 10/11/2026.

## Antes de começar

Você precisa de:
- **Node.js 24 ou mais novo** (`node -v` mostra a versão);
- **internet**: o build baixa as fontes do Google (Fredoka e Nunito) e a página carrega os ícones (Phosphor) de um CDN.

## 1. Instalar as dependências

```bash
npm install
```

Termina com uma linha parecida com `added ... packages` ou `up to date`. Avisos (`npm warn`) são normais.

## 2. Subir a landing em modo de desenvolvimento

```bash
npx turbo run dev --filter=@oitenta/frontend
```

Espere aparecer `✓ Ready` e `Local: http://localhost:3000`. O terminal fica ocupado enquanto o servidor roda; para parar, aperte `Ctrl + C`.

## 3. Abrir no navegador

Abra **http://localhost:3000**.

### Como saber que está funcionando

- No topo: o mascote verde, a palavra **bora** e os links **Como funciona**, **Para estudantes**, **Entrar** e o botão **Começar grátis**.
- O título grande **"Pare de adiar. Comece pelo degrau mais fácil."** e, à direita, um celular mostrando a rampa com o selo **+5 gotas**.
- Descendo a página: **Como funciona**, **Suba a rampa**, **Feito para quem trava pra começar**, **Seu dia já chega planejado**, **Perguntas frequentes** e, no fim, a faixa escura **"Um degrau hoje. Uma árvore no fim do semestre."** com o rodapé **© 2026 Bora**.
- Ícones aparecem dentro dos botões e cards (se aparecerem quadrados vazios, veja "Problemas comuns").

### O que dá para clicar (igual ao protótipo)

| Onde | O que fazer | O que acontece |
|---|---|---|
| Menu | **Como funciona** / **Para estudantes** | A página rola até a seção |
| Suba a rampa | Clicar num degrau | O degrau fica verde escuro, o mascote vai para cima dele e o texto "Degrau N de 5" muda |
| Suba a rampa | **Trocar** | O texto do degrau atual troca por uma alternativa; clicar de novo volta |
| Suba a rampa | **Pular** | Vai para o próximo degrau (depois do 5º volta ao 1º) |
| Respeita a sua energia | Baixa / Média / Alta | O nível clicado fica com borda verde |
| Dia difícil também conta | Clicar numa tarefa | Marca ou desmarca (fica riscada) |
| Perguntas frequentes | Clicar numa pergunta | Abre a resposta e fecha a anterior |

Os botões **Entrar** e **Começar grátis** e o link **Escreve pra gente.** ainda não levam a lugar nenhum (as telas de destino não existem).

A página tem **largura fixa de 1440 px**, como no protótipo. Em telas mais estreitas aparece rolagem lateral; em telas mais largas ela fica centralizada.

## 4. Gerar o build de produção e rodar localmente

Pare o servidor de desenvolvimento (`Ctrl + C`) antes, porque os dois usam a porta 3000.

```bash
npx turbo run build --filter=@oitenta/frontend
```

Termina com `Tasks: 8 successful, 8 total` e uma lista de rotas começando por `○ /`. É o mesmo comando que a hospedagem vai usar.

```bash
npm --workspace @oitenta/frontend run start
```

Abra **http://localhost:3000**: deve aparecer a mesma landing. Para parar, `Ctrl + C`.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `Port 3000 is in use` ou a página não abre | Outro servidor já está na porta 3000 | Feche o outro terminal com `Ctrl + C`, ou descubra o processo com `lsof -ti tcp:3000` e encerre-o |
| Ícones viram quadrados vazios | Sem internet: os ícones vêm de um CDN | Conecte-se e recarregue a página |
| O build falha ao baixar fontes | Sem internet no primeiro build | Conecte-se e rode o build de novo |
| `Cannot find module '@oitenta/...'` | Dependências não instaladas | Rode `npm install` na raiz |
