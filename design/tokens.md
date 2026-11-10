# Tokens de design — Bora

Extraídos em 10/11/2026 dos exports do Claude Design: os `.dc.html` de `design/web/source/`, `design/mobile/app/source/` e `design/mobile/telas/source/`, e o `uploads/DESIGN-SYSTEM-BORA.md` que vem nos três zips (idêntico nos três, "Bora Design System v1").

**Fonte da verdade:** o export (este arquivo + `.dc.html`). O `docs/0-design-system.md` não foi alterado; as divergências estão no fim.

Os protótipos `Bora App` (web e mobile) usam variáveis CSS sob `[data-bora]` / `[data-theme="dark"]`. Os dois `Bora Telas.dc.html` usam **cores fixas** (os mesmos hex, sem variáveis): ao implementar a partir deles, troque cada hex pelo token desta tabela.

## Cores

### Modo claro

| Token (`[data-bora]`) | Hex | Uso |
|---|---|---|
| `--bg` | `#F6FAF8` (web, Bora Telas) · `#FFFFFF` (Bora App mobile) | Fundo da tela |
| `--surface` | `#FFFFFF` | Cards, sheets, inputs, tab bar |
| `--s2` | `#EAF5F0` | Trilhos, desabilitado, skeleton, pílula de nível |
| `--border` | `#D5E6DF` | Bordas 1px/2px, lábio do secundário |
| `--tx` | `#0E1F1A` | Texto principal |
| `--tx2` | `#4A5D57` | Texto de apoio, ícones inativos |
| `--pri` | `#047857` | Botão primário, seleção, aba ativa |
| `--priTx` | `#FFFFFF` | Texto sobre `--pri` |
| `--lip` | `#065F46` | Lábio 3D do primário |
| `--fill` | `#10B981` | Barras, Broto (nunca com texto) |
| `--priSoft` | `#D1FAE5` | Chip selecionado, degrau feito |
| `--blue` | `#0369A1` | Links, secundárias, terciárias |
| `--blueFill` | `#0EA5E9` | Gota, anel de foco (nunca com texto) |
| `--blueSoft` | `#E0F2FE` | Pílula de horário, hover terciário |
| `--streak` | `#F59E0B` | Ícone da sequência, confete (só decoração) |
| `--streakInk` | `#B45309` | Texto âmbar ("Rara · 8%") |
| `--streakSoft` | `#FEF3C7` | Fundo de badge rara |
| `--danger` | `#DC2626` | Erro, plano inviável |
| `--toastIcon` | `#38BDF8` | Gota dentro do toast |
| `--focusBg` | `#E0F2FE` | Fundo do foco |
| `--ringTrack` | `#FFFFFF` | Trilho do anel do timer |
| `--obj1` | `#10B981` | Objetivo 1 (verde) |
| `--obj2` | `#0EA5E9` | Objetivo 2 (azul) |
| `--obj3` | `#2DD4BF` | Objetivo 3 (verde-água) |
| `--obj4` | `#A78BFA` (web) · `#059669` (Bora App mobile) | Objetivo 4 — **diverge entre web e mobile** |

### Modo escuro

| Token | Hex |
|---|---|
| `--bg` | `#0B1512` |
| `--surface` | `#12201C` |
| `--s2` | `#1A2C27` |
| `--border` | `#24413A` |
| `--tx` | `#E6F2EE` |
| `--tx2` | `#9FB8B0` |
| `--pri` / `--fill` | `#34D399` |
| `--priTx` | `#052E22` |
| `--lip` | `#0F8A63` |
| `--priSoft` | `#123A2E` |
| `--blue` / `--blueFill` | `#38BDF8` |
| `--blueSoft` | `#0E2A3A` |
| `--streak` / `--streakInk` | `#FBBF24` |
| `--streakSoft` | `#3A2E10` |
| `--danger` | `#F87171` |
| `--toastIcon` | `#0369A1` |
| `--focusBg` | `#12201C` |
| `--ringTrack` | `#1A2C27` |
| `--obj1` · `--obj2` · `--obj3` · `--obj4` | `#34D399` · `#38BDF8` · `#2DD4BF` · `#A78BFA` (web) / `#10B981` (mobile) |

### Cores fixas do mascote (nos dois modos)

Corpo `#10B981` · sombra/copa `#059669` · folha `#34D399` · caule `#047857` · brilho `#BAE6FD` · traços `#0E1F1A` · acessórios `#0EA5E9` · miolo das flores `#E0F2FE` · confete `#F59E0B`. Humor "murcho": `#6DBE9B` / `#4FA27F` / `#9AD7BB`.

### Outras cores fixas encontradas

`#6EE7B7` (AppJardim, 1×), `#DCE6E2` (landings, 1×), `#E3ECE8` (Bora Telas do app, 1×). Scrim de sheet `rgba(14,31,26,.4)`. Não estão no design system: ao implementar, mapeie para um token ou crie um token novo.

## Tipografia

- **Fredoka** 600 e 700 (títulos, números, logo, "Broto"). Os protótipos também carregam o 500.
- **Nunito** 400 / 600 / 700 / 800 (corpo, botões em 800, rótulos em 800 caixa-alta com tracking 0.06em).
- Ícones: **Phosphor** `@phosphor-icons/web@2.1.1`. Regular por padrão; Bold em ícones pequenos dentro de botões; Fill só para estado ativo.

| Estilo | Mobile | Web |
|---|---|---|
| Display | Fredoka 700 32/38 | Fredoka 700 64/72 (-0.01em) |
| H1 | Fredoka 600 26/32 | Fredoka 600 40/48 |
| H2 | Fredoka 600 20/26 | Fredoka 600 28/36 |
| H3 / título de card | Fredoka 600 18/24 | Fredoka 600 20/26 |
| Body | Nunito 400 16/24 (balão de chat 15/22) | Nunito 400 18/28 |
| Body strong | Nunito 700–800 15/20 | — |
| Small | Nunito 600 14/20 | Nunito 400–600 14–16/20–24 |
| Caption | Nunito 600 12/16 · rótulo Nunito 800 12/16 caixa-alta | Nunito 800 12/16 caixa-alta |
| Botão | Nunito 800 16 | Nunito 800 16 |
| Botão-herói | Nunito 800 20/26 + 600 14/20 | idem |
| Timer | Fredoka 600 36/40 (card) · 64–72 (tela de foco) | idem |
| Número da barra | Fredoka 600 16 | idem |
| Recompensa | Fredoka 700 18/22 (toast) · 44/52 (celebração) | idem |

## Espaçamento e layout

- **Mobile:** 390×844, margem lateral 20px, gap entre cards 12px, entre seções 24–32px.
- **Web:** 1440px; sidebar 240px; coluna direita 360px; margem de seção 64px; seções da landing separadas por espaço, não por blocos de cor.
- Altura mínima de toque 44px. Botões 52px (48 em sheets); terciário 44 (36 compacto); chips 44 / 36 (tempo) / 24–28 (requisito).

## Raios

| Elemento | Raio |
|---|---|
| Input | 12 |
| Card | 16 |
| Sheet | 24 24 0 0 |
| Botões e chips | 999 (pílula) |
| Tile de ícone | 12 |
| Degrau da rampa | 16 16 8 8 |
| Balão do Broto | 20 20 20 6 |
| Outros usados | 8, 6, 4 (barras, mini-elementos), 50% (círculos) |

## Bordas e sombras

- **Bordas:** 1px `--border` em cards; 2px em chips, inputs e secundário; 2px `--blue` no input focado; 2px tracejada `--border` para bloqueado, não feito ou futuro.
- **Sombra de card:** `0 1px 2px rgba(14,31,26,.04)` (escuro: `none`) = `--shadow`.
- **Flutuante (toast):** `0 8px 24px rgba(14,31,26,.18)`.
- **Sheet:** `0 -8px 32px rgba(14,31,26,.08)` (escuro `rgba(0,0,0,.35)`) = `--sheetShadow`.
- **Lábio 3D:** primário `0 3px 0 var(--lip)`, secundário `0 3px 0 var(--border)`. Ao pressionar: `translateY(3px)` e sem sombra.

---

## Divergências com `docs/0-design-system.md`

Pela regra do próprio design system, o export vence. **Nada foi alterado no doc.**

| # | Assunto | `docs/0-design-system.md` | Export |
|---|---|---|---|
| 1 | Fundo (`bg`) claro | `#FFFFFF` no mobile, `#F6FAF8` na web | O DS v1 diz `#F6FAF8` para tudo. O Bora App mobile usa `#FFFFFF`; os Bora Telas usam `#F6FAF8` |
| 2 | Tokens que o doc não tem | — | `--streakInk #B45309`, `--streakSoft #FEF3C7`, `--toastIcon`, `--focusBg`, `--ringTrack`, `--obj1..4`, `--shadow`, `--sheetShadow` |
| 3 | Escuro: lábio, soft e fills | Não define `lip`, `primary-soft`, `blue-fill`, `blue-soft` no escuro | `--lip #0F8A63`, `--priSoft #123A2E`, `--blueFill #38BDF8`, `--blueSoft #0E2A3A` |
| 4 | Cor do 4º objetivo | Não define cores de objetivo | Web `#A78BFA` (**roxo**, aparece no "Algoritmos" do calendário) × mobile `#059669`. O roxo conflita com o espírito do "Não fazer: gradientes roxos" e não está no DS v1 (que lista só 3 cores de objetivo) |
| 5 | Pesos | Fredoka 600/700; Nunito 400/600/800 | Nunito **700** também é usado (metadados, nomes de tarefa); os protótipos carregam Fredoka 500 |
| 6 | Escala tipográfica | Display, H1, H2, Body, Small, Caption | Acrescenta H3 (18/24 mobile, 20/26 web), Body strong, Botão, Botão-herói, Timer, Número da barra e Recompensa |
| 7 | Ícone da sequência | "folha amarela 🍃" | O DS v1 diz `ph-fill fire` (chama). **Os protótipos usam `ph-fill ph-leaf`** (folha), alinhados com o doc |
| 8 | Estágios do Broto por nível | Semente 1–2, Broto 3–5, Muda 6–9, Arbusto 10–14, Árvore 15+ | **Semente 1–3, Broto 4–8, Muda 9–14, Arbusto 15–24, Árvore jovem 25+** |
| 9 | Níveis de energia no check-in | 4 (Baixa, Média, Alta, Elétrico) | Bora App mobile: 4 ✔. **Web: só 3** (Baixa, Média, Alta). O DS v1 (bottom sheet) descreve 3 |
| 10 | Card de energia na Home | `0-fluxos.md` §2: "Não há card de energia na Home" | Bora App mobile: sem card ✔. **Web: o Hoje tem o card "Como está sua energia?"** na coluna direita. O Bora Telas do app (Tela 1) também tem |
| 11 | Raios | 12 / 16 / 24 / pílula | Acrescenta tile 12, degrau `16 16 8 8`, balão `20 20 20 6` |
| 12 | Sombras | "quase nula" | Valores exatos acima (card, toast, sheet, lábio) |
| 13 | Espaçamento | grade 8pt, margem 20px no mobile | Acrescenta gaps 12 / 24–32, web com sidebar 240, coluna direita 360, margem 64 |
| 14 | XP / nível | "XP = minutos de foco" | Igual + exemplo "Nv 7 = 410/480 XP", e cada nível pede um pouco mais (a fórmula continua indefinida) |
