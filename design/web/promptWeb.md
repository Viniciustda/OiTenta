# Prompt — web (Next.js) a partir do design local

Não use o MCP do Claude Design: tudo o que é preciso está neste repositório.

**Fontes (nesta ordem de leitura):**
1. `design/web/SCREENS.md`: lista das 44 telas e estados, com a ação que leva a cada uma e o caso de uso.
2. `design/web/screens/NN-nome.png`: screenshot de referência de cada tela (1440×900).
3. `design/web/source/`: protótipo original.
   - `Bora Landing Web.dc.html` (landing) e `Bora App.dc.html` (web app, rotas `#login`, `#cadastro`, onboarding e app);
   - componentes `App*.dc.html`, `Modal*.dc.html`, `AvailGrid.dc.html`, `Broto.dc.html`, `PhoneRampa.dc.html`;
   - `support.js` (runtime do protótipo).
   - Para abrir, sirva a pasta por HTTP (ex.: `npx serve design/web/source`). Aberto direto do disco não funciona.
4. `design/tokens.md`: cores, tipografia, espaçamentos, raios e sombras, e as divergências com `docs/0-design-system.md`.

**Regras de implementação:**
- Implemente cada tela usando como **fonte da verdade o `.dc.html` + o screenshot de referência** dela.
- **Só tokens, nunca cor fixa:** toda cor, raio, sombra e fonte vem dos tokens de `design/tokens.md`, como variáveis CSS ou tema do Tailwind. Se o protótipo tiver um hex fora da tabela, mapeie para um token existente ou proponha um token novo.
- Fontes: Fredoka + Nunito; ícones Phosphor (`@phosphor-icons/web@2.1.1` ou o pacote React equivalente).
- Siga as regras de `.agents/rules/` e o escopo de `docs/2-decisoes-mvp.md`.
