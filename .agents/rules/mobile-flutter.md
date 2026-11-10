# Regra: mobile (Flutter)

Vale sempre que criar ou alterar código em `apps/mobile`. Decisão 5.7 de `docs/2-decisoes-mvp.md`: telas primeiro, gerência de estado simples, migração para Riverpod possível depois sem reescrever telas.

## As 4 regras (desde o primeiro dia)

1. **Telas só recebem dados e avisam ações.** O widget de tela recebe o estado pronto e expõe callbacks (`onSave`, `onStart`). Ele não chama o backend nem contém regra de negócio.
2. **Chamadas ao backend ficam em `features/<x>/data/`**, em classes de repositório. Nenhum widget importa o cliente HTTP.
3. **Um controlador `ChangeNotifier` por tela**, em `features/<x>/presentation/`. Ele guarda o estado da tela e chama o repositório; a tela só escuta o controlador.
4. **Rotas centralizadas com go_router** em `core/routes/`. As telas navegam por nome de rota; nada de `Navigator.push(MaterialPageRoute(...))` espalhado.

## Configuração por ambiente

- A URL do backend vem de `--dart-define-from-file=env/<ambiente>.json` e é lida só em `core/config/` (`AppConfig`). Nunca escreva URL fixa no código.
- Ambientes: `local-simulator`, `local-iphone` (IP do Mac; arquivo local, fora do git), `developer` e `prod` (hospedados).
- Cada ambiente tem uma opção de Run no VS Code (`.vscode/launch.json`).

## Visual

- Implementar cada tela usando como fonte da verdade o `.dc.html` + o screenshot de referência em `design/mobile/`.
- Usar só os tokens do tema (cores, tipografia, raios); nunca cor fixa no widget.
