# Prompt — mobile (Flutter), projeto "Bora Telas"

Não use o MCP do Claude Design: tudo o que é preciso está neste repositório.

**Fontes (nesta ordem de leitura):**
1. `design/mobile/telas/SCREENS.md`: as pranchetas do "Bloco 1 de 3 — Onboarding em chat" (boas-vindas, horários livres por período, limite diário).
2. `design/mobile/telas/screens/NN-nome.png`: screenshot de referência de cada prancheta (390×844, @2x) e do canvas completo.
3. `design/mobile/telas/source/`: protótipo original.
   - `Bora Telas.dc.html`: canvas de pranchetas;
   - `Broto.dc.html`: mascote;
   - `support.js`.
   - Para abrir, sirva a pasta por HTTP (ex.: `npx serve design/mobile/telas/source`).
4. `design/tokens.md`: tokens e divergências. Este protótipo usa hex fixos, não variáveis: mapeie cada um para um token.
5. As demais telas do app estão em `design/mobile/promptMobile1.md`.

**Regras de implementação:**
- Implemente cada tela usando como **fonte da verdade o `.dc.html` + o screenshot de referência** dela.
- **Só tokens, nunca cor fixa:** as telas leem cores, tipografia, raios e sombras do tema em `apps/mobile/lib/core/`.
- Siga `.agents/rules/mobile-flutter.md`, as demais regras de `.agents/rules/` e o escopo de `docs/2-decisoes-mvp.md`.
