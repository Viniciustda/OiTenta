# Prompt — mobile (Flutter), projeto "Bora App"

Não use o MCP do Claude Design: tudo o que é preciso está neste repositório.

**Fontes (nesta ordem de leitura):**
1. `design/mobile/app/SCREENS.md`: lista das telas e estados do app navegável, com a ação que leva a cada uma e o caso de uso.
2. `design/mobile/app/screens/NN-nome.png`: screenshot de referência de cada tela (390×844, @2x, conteúdo rolável expandido).
3. `design/mobile/app/source/`: protótipo original.
   - `Bora App.dc.html`: app navegável, com painel de estados;
   - `bora-data.js`: dados de exemplo;
   - `Bora Telas.dc.html`: prancheta "Tela 1 — Hoje", versão anterior;
   - `support.js`.
   - Para abrir, sirva a pasta por HTTP (ex.: `npx serve design/mobile/app/source`).
4. `design/tokens.md`: tokens e divergências.
5. O onboarding mobile está no outro projeto: `design/mobile/promptMobile2.md`.

**Regras de implementação:**
- Implemente cada tela usando como **fonte da verdade o `.dc.html` + o screenshot de referência** dela.
- **Só tokens, nunca cor fixa:** monte o `ThemeData`/`ThemeExtension` em `apps/mobile/lib/core/` a partir de `design/tokens.md` (claro e escuro), e as telas só leem do tema.
- Fontes: Fredoka + Nunito; ícones Phosphor (pacote Flutter equivalente).
- Siga `.agents/rules/mobile-flutter.md`, as demais regras de `.agents/rules/` e o escopo de `docs/2-decisoes-mvp.md`.
