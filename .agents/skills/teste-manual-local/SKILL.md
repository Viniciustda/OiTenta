---
name: teste-manual-local
description: "Deixa o ambiente local pronto para o usuário testar à mão: banco no Docker, backend local, web aberto no navegador e app mobile rodando no simulador iOS apontando para o backend local. Segue, a cada execução, os tutoriais `docs/backend/COMO-TESTAR.md`, `docs/frontend/COMO-TESTAR.md` e `docs/mobile/COMO-TESTAR.md`, sem copiar comandos deles. Usar quando o pedido for subir tudo localmente para teste manual."
---

# Teste manual local

Deixa o ambiente pronto para o usuário testar à mão:
- o banco no Docker;
- o backend local;
- o web aberto no navegador padrão;
- o app mobile rodando no simulador iOS, com o ambiente do simulador local.

A skill **não** altera código, **não** instala nada além do que os tutoriais mandam, **não** faz commit nem push e **não** mexe na `main`.

## Regra central: referenciar, não copiar

Os comandos de banco, backend, web e mobile **não** estão nesta skill. A cada execução, leia por inteiro e siga:

| Serviço | Tutorial |
|---|---|
| Banco e backend | `docs/backend/COMO-TESTAR.md` |
| Web | `docs/frontend/COMO-TESTAR.md` |
| Mobile (simulador iOS, ambiente do simulador local) | `docs/mobile/COMO-TESTAR.md` |

- Use os comandos, portas, URLs, nomes de arquivo e mensagens esperadas **exatamente como estão no tutorial lido agora**. Se o tutorial mudou, siga o novo.
- Se um passo estiver ambíguo, faltar ou não funcionar: **pare e reporte** (passo, comando, erro exato). Não invente comando alternativo nem conserte o tutorial.
- Use só os passos necessários para subir os serviços. Pule roteiros manuais, testes, Swagger "Try it out", build de produção, VS Code, iPhone físico e o reset dos dados do demo.

O que é desta skill (e não dos tutoriais) é só a mecânica: rodar em segundo plano, gravar log, conferir porta e montar o relatório.

## Mecânica comum

- **Pasta de logs:** `/tmp/oitenta-teste-manual/` (crie se não existir). Um arquivo por etapa: `preparacao.log`, `backend.log`, `frontend.log`, `mobile.log`.
- **Comando em segundo plano** (cada um no seu grupo de processos, para poder encerrar como um Ctrl+C):

  ```bash
  bash -c 'set -m; cd "<pasta onde o tutorial manda rodar>" && nohup <COMANDO DO TUTORIAL> > /tmp/oitenta-teste-manual/<servico>.log 2>&1 < /dev/null & echo $! > /tmp/oitenta-teste-manual/<servico>.pgid'
  ```

  Encerrar o que a skill subiu equivale ao Ctrl+C do tutorial: `kill -INT -- -$(cat /tmp/oitenta-teste-manual/<servico>.pgid)`.
- **Porta ocupada?** `lsof -nP -iTCP:<porta> -sTCP:LISTEN`. Se ocupada, **reaproveite**: não suba outro e informe o PID que está nela.
- **Esperar:** consulte o log e a porta a cada poucos segundos (sem `sleep` longo). Considere pronto quando o log mostrar a mensagem que o tutorial diz para esperar **e** a URL responder. Limites: banco 2 min, backend 3 min, web 3 min, mobile 8 min (o primeiro build do Xcode é lento). Estourou o limite ou o log mostrou erro: pare e reporte com as últimas linhas do log.
- Rode tudo a partir da raiz do repositório, salvo quando o tutorial manda outra pasta.

## Passo a passo

### 1. Escolher a branch

- Se o usuário já disse a branch ao chamar a skill, use-a. Senão, pergunte (AskUserQuestion) em qual branch subir. Padrão: `developer`.
- É **uma branch só**: o repositório é um monorepo.
- Se a escolha for `main`: pare e avise. Esta skill não mexe na `main`.

### 2. Conferir alterações locais

- `git status --porcelain`. Se houver **qualquer** saída (inclusive arquivo não rastreado): **pare e avise o usuário** listando os arquivos.
- Não use `stash`, `commit`, `checkout -- .`, `reset` nem `clean`.

### 3. Trocar de branch e atualizar

- `git fetch origin`, `git switch <branch>` e `git pull --ff-only origin <branch>`.
- Se o pull não for fast-forward ou der conflito: pare e reporte.
- Guarde o commit em uso (`git log --oneline -1`) para o relatório.

### 4. Verificar o que já está no ar

Leia nos tutoriais as portas do banco, do backend e do web e confira cada uma (mecânica comum). No mobile, confira `xcrun simctl list devices booted` e se há um `flutter run` vivo (`pgrep -fl "flutter_tools.snapshot run"`). Anote o que será reaproveitado.

Se o backend ou o web estiver no ar e o passo 3 trouxe commits novos, avise no relatório que o serviço reaproveitado pode estar com o código anterior. Não reinicie por conta própria.

### 5. Preparação (instalar e compilar)

Antes de subir qualquer servidor, siga as seções de instalação, configuração e compilação dos três tutoriais, nesta ordem: backend ("Antes de começar" e os passos de instalar, criar o `.env`, gerar o cliente do Prisma e compilar), web ("Antes de começar" e "Instalar e compilar") e mobile ("Antes de começar"). Grave a saída em `preparacao.log`.

- Se o backend **ou** o web já estiver no ar (passo 4), **pule** a instalação e a compilação de Node: reinstalar apaga o `node_modules` debaixo dos servidores em uso. Informe isso no relatório.
- Ao terminar, rode `git status --porcelain` de novo. Se algum passo alterou arquivo do repositório: pare e reporte o arquivo. Não desfaça.

### 6. Banco

- Faça a verificação do Docker descrita em "Antes de começar" do tutorial do backend. Se o Docker não estiver aberto: **pare e avise** ("abra o Docker Desktop").
- Suba o banco com o comando do tutorial (ele já reaproveita um container no ar).
- Espere ficar saudável: `docker inspect -f '{{.State.Health.Status}}' <container>` até `healthy`, com o nome do container que o comando mostrou.

### 7. Backend

- Siga os passos do tutorial do backend que aplicam as migrations (com a geração do cliente que vem junto) e o seed, conferindo as mensagens esperadas.
- Se a porta do backend estiver ocupada: reaproveite. Senão, suba o servidor com o comando do tutorial, **em segundo plano**, log em `backend.log`.
- Espere a mensagem que o tutorial indica e a URL do Swagger do tutorial responder 200.

### 8. Web

- Se a porta do web estiver ocupada: reaproveite. Senão, suba com o comando do tutorial para rodar contra o backend real, **em segundo plano**, log em `frontend.log`.
- Espere a mensagem que o tutorial indica e a URL de entrada do tutorial responder 200.
- Abra essa URL no navegador padrão: `open <url>` (também quando reaproveitar).

### 9. Mobile

- Siga a seção do tutorial do mobile para rodar **no simulador iOS contra o backend real**, com o arquivo de ambiente do **simulador local**.
- Abra o app do simulador e ligue o aparelho que o tutorial indica. Se ele já estiver ligado (passo 4), reaproveite.
- Se já houver `flutter run` vivo: reaproveite. Senão, rode o comando do tutorial **em segundo plano**, log em `mobile.log`.
- Espere no log a linha que o Flutter mostra quando o app está rodando (`Flutter run key commands.`) ou um erro. Confirme com uma captura: `xcrun simctl io booted screenshot /tmp/oitenta-teste-manual/mobile.png`, e olhe a imagem.

## Relatório final (curto)

Se tudo subiu:

```text
Branch: <branch> (<commit>)

| Serviço | Estado | URL / porta | Log |
|---|---|---|---|
| Banco | ✅ healthy (subiu agora | reaproveitado) | porta <porta> | — |
| Backend | ✅ ... | <url do Swagger> | /tmp/oitenta-teste-manual/backend.log |
| Web | ✅ ... (aberto no navegador) | <url de entrada> | /tmp/oitenta-teste-manual/frontend.log |
| Mobile | ✅ ... | <aparelho do simulador> | /tmp/oitenta-teste-manual/mobile.log |

Login de teste: o botão de entrar como demo, com o texto que o tutorial do web e do mobile mostra.

Para encerrar tudo:
- mobile, web e backend (o Ctrl+C dos tutoriais, para o que a skill subiu): kill -INT -- -<PGID> de cada um
- se algo continuar na porta: o comando de encerrar processo da tabela de problemas do tutorial correspondente
- banco: o comando de desligar do tutorial do backend
```

Liste os PGIDs reais. Para serviço reaproveitado, informe o PID na porta e não sugira encerrar o que a skill não subiu sem avisar que foi o usuário quem o subiu.

Se algo falhou: em que passo, o comando, o **erro exato tirado do log** e o que já estava no ar (com o mesmo quadro acima, marcando ❌ o que falhou e o que não chegou a subir).
