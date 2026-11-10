# Como testar o mobile

Hoje o app (`apps/mobile`, Flutter) **ainda é a tela de exemplo do Flutter** (um contador). Nenhuma tela do Bora foi implementada. O que já existe é a configuração para rodar no simulador iOS e no iPhone físico, apontando para o backend de cada ambiente. Comandos testados em 10/11/2026.

## Antes de começar

Você precisa de:
- um **Mac com Xcode** instalado;
- o **Flutter** instalado (`flutter --version`);
- para o iPhone físico: conta de desenvolvedor da Apple configurada no Xcode e o **Modo de Desenvolvedor** ligado no iPhone (Ajustes > Privacidade e Segurança > Modo de Desenvolvedor).

Os comandos abaixo são rodados **a partir da raiz do repositório**, exceto onde está escrito `cd apps/mobile`.

## Arquivos de ambiente

A URL do backend vem de um arquivo em `apps/mobile/env/`:

| Arquivo | Para que serve | URL |
|---|---|---|
| `local-simulator.json` | Simulador iOS no seu Mac | `http://localhost:4000` |
| `local-iphone.json` | iPhone físico, backend no seu Mac | `http://<IP do seu Mac>:4000` (arquivo seu, fora do git) |
| `developer.json` | Backend hospedado de desenvolvimento | ainda é exemplo, definido depois da hospedagem |
| `prod.json` | Backend de produção | ainda é exemplo, definido depois da hospedagem |

**Importante:** como o app ainda é a tela de exemplo, **trocar de ambiente não muda nada na tela**. A URL é lida em `lib/core/config/app_config.dart`, mas nenhuma tela usa o backend ainda.

## 1. Rodar no simulador iOS

Abra o simulador e ligue um iPhone (o exemplo usa o iPhone 17; a lista dos seus está em `xcrun simctl list devices available`):

```bash
open -a Simulator
```

```bash
xcrun simctl boot "iPhone 17"
```

Rode o app:

```bash
cd apps/mobile && flutter run -d "iPhone 17" --dart-define-from-file=env/local-simulator.json
```

Resultado esperado: `Xcode build done` (a primeira vez leva cerca de 1 minuto), depois `Flutter run key commands.` e o app abre no simulador com a tela **"Flutter Demo Home Page"**, o texto "You have pushed the button this many times:" e um botão **+** que soma 1 ao contador.

Para sair: aperte `q` no terminal.

## 2. Rodar no iPhone físico

> ⚠️ **No teste de 10/11 este passo falhou** (ver "Problemas comuns"). Os comandos estão aqui porque é o caminho previsto.

Crie o seu arquivo de ambiente a partir do modelo:

```bash
cp -n apps/mobile/env/local-iphone.example.json apps/mobile/env/local-iphone.json
```

Descubra o IP do seu Mac na rede:

```bash
ipconfig getifaddr en0
```

Abra `apps/mobile/env/local-iphone.json` e troque `IP-DO-SEU-MAC` pelo número que apareceu (ex.: `http://192.168.1.5:4000`). O iPhone e o Mac precisam estar **na mesma rede Wi-Fi**.

Veja o identificador do seu iPhone (ligado por cabo ou na mesma rede):

```bash
flutter devices
```

Rode, trocando `<ID-DO-IPHONE>` pelo identificador da lista:

```bash
cd apps/mobile && flutter run -d <ID-DO-IPHONE> --dart-define-from-file=env/local-iphone.json
```

Resultado esperado: o mesmo app de exemplo abre no iPhone. Na primeira vez, o iPhone pode pedir para confiar no desenvolvedor (Ajustes > Geral > VPN e Gerenciamento de Dispositivos).

## 3. Rodar pelo VS Code

O arquivo `.vscode/launch.json` tem uma opção de Run para cada ambiente. No VS Code, com a extensão **Flutter** instalada, abra a pasta raiz do repositório, vá em **Run and Debug** e escolha:

- **Bora mobile · local (simulador)**
- **Bora mobile · local (iPhone físico)**
- **Bora mobile · developer (hospedado)**
- **Bora mobile · prod (hospedado)**

Antes, escolha o aparelho no canto inferior direito do VS Code. Cada opção roda o mesmo comando dos passos 1 e 2, com o arquivo de ambiente correspondente. (Estas opções não foram testadas dentro do VS Code em 10/11; os comandos de terminal equivalentes foram.)

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `The developer disk image could not be mounted on this device` (aconteceu no teste com o iPhone conectado **sem fio**) | O Xcode não conseguiu preparar o iPhone para depuração. Causas comuns: primeira conexão sem cabo, iPhone bloqueado, Modo de Desenvolvedor desligado ou Xcode sem suporte à versão do iOS | Ainda em análise; não foi resolvido nesta rodada |
| `No devices found` | Simulador desligado ou iPhone não reconhecido | Rode `xcrun simctl boot "iPhone 17"` ou reconecte o iPhone |
| O app no iPhone não alcança o backend | IP errado, redes diferentes ou backend parado | Confira o IP com `ipconfig getifaddr en0` e se o backend está no ar (`docs/backend/COMO-TESTAR.md`) |
