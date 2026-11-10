# DESIGN-SYSTEM-BORA.md
**Bora — Design System v1 (Fase 1 aprovada).** Fonte única de verdade para todas as telas (mobile, web, e-mail). Arquivo de referência visual: `Bora Design System.dc.html` · mascote: `Broto.dc.html`.

---

## 1. Conceito, personalidade e tom de voz

**Conceito: "Você rega, ele cresce."** O usuário ganha **Gotas** (moeda, azul) ao cumprir degraus e etapas; as Gotas regam o **Broto** (mascote, verde), que evolui com o progresso.
**Personalidade:** um amigo calmo e prático que te ajuda a *começar*. Minimalista e funcional, claramente gamificado, mas a gamificação fica concentrada numa barra compacta e em celebrações curtas após a ação. Muito espaço em branco, **uma ação primária por tela**.
**Público:** universitários brasileiros 18–25, muitos com traços de TDAH, que travam para começar.

**Tom de voz (pt-BR):** amigo, direto, sem culpa, frases curtas, segunda pessoa ("você"), coloquial leve ("pra", "rolou", "bora"). Nunca culpabiliza; sempre oferece o próximo passo menor. Sem exclamações em excesso (no máximo uma por tela).

Exemplos de microtexto:
1. Botão-herói: **"Vamos começar?"** · subtítulo **"Rampa de 25 min até o foco"**
2. Atraso: **"Tudo bem, recalculei pra você. Sobrou 1 dia de folga."**
3. Onboarding: **"Oi! Eu sou o Broto. Vamos montar seu plano sem drama?"**
4. Registro: **"Quanto você avançou em 'Diagrama de casos de uso'?"** → Concluí / Parcial / Não rolou
5. Pausa: **"Pausado há 12 min. Voltar com um mini-degrau de 2 min?"**

Outros aprovados: "Bora!", "Me conta mais", "Montar minha rampa", "Distribuir no calendário", "IA analisando…", "Folga até o prazo: 2 dias", "Não cabe tudo até 20/11: faltam 3h".

---

## 2. Cores (valores EXATOS)

### 2.1 Modo claro
| Token | CSS var | Hex | Uso |
|---|---|---|---|
| bg | `--bg` | `#F6FAF8` | Fundo da tela/página |
| surface | `--surface` | `#FFFFFF` | Cards, sheets, inputs, tab bar |
| surface-2 | `--s2` | `#EAF5F0` | Trilhos de barra, botão desabilitado, skeleton, pílula de nível |
| border | `--border` | `#D5E6DF` | Bordas 1px, contorno de chip/secundário, lábio do secundário, alça do sheet |
| text-primary | `--tx` | `#0E1F1A` | Texto principal, números da barra gamificada |
| text-secondary | `--tx2` | `#4A5D57` | Texto de apoio, labels, ícones inativos |
| primary | `--pri` | `#047857` | Botão primário (texto branco), seleção, % de progresso, aba ativa |
| primary-lip | `--lip` | `#065F46` | "Lábio" inferior do botão primário |
| primary-text | `--priTx` | `#FFFFFF` | Texto/ícone sobre primary |
| primary-fill | `--fill` | `#10B981` | Barras de progresso, ilustração, corpo do Broto. **Nunca com texto** |
| primary-soft | `--priSoft` | `#D1FAE5` | Fundo de chip selecionado, degrau feito, badge desbloqueada, pílula da aba ativa |
| blue | `--blue` | `#0369A1` | Links, ações secundárias/terciárias, texto de foco |
| blue-fill | `--blueFill` | `#0EA5E9` | Ícone de gota, anel do timer de foco, barra de objetivo Cálculo. **Nunca com texto** |
| blue-soft | `--blueSoft` | `#E0F2FE` | Fundo da sessão de foco, pílula de horário, hover do terciário |
| streak | `--streak` | `#F59E0B` | Chama da sequência, confete, borda de conquista rara. **Só ícone/decoração** |
| streak-ink | `--streakInk` | `#B45309` | Texto âmbar (ex.: "Rara · 8%") e ícone âmbar standalone |
| streak-soft | `--streakSoft` | `#FEF3C7` | Fundo de badge rara |
| danger | `--danger` | `#DC2626` | Erros, alerta de plano inviável |
| toast-icon | `--toastIcon` | `#38BDF8` | Ícone de gota dentro do toast (fundo escuro) |
| focus-bg | `--focusBg` | `#E0F2FE` | Fundo da tela/card de foco |
| ring-track | `--ringTrack` | `#FFFFFF` | Trilho do anel de timer |

### 2.2 Modo escuro
| Token | CSS var | Hex | Uso |
|---|---|---|---|
| bg | `--bg` | `#0B1512` | Fundo (nunca #000) |
| surface | `--surface` | `#12201C` | Cards, sheets, inputs, tab bar; fundo da sessão de foco |
| surface-2 | `--s2` | `#1A2C27` | Trilhos, desabilitado, skeleton, trilho do anel |
| border | `--border` | `#24413A` | Bordas |
| text-primary | `--tx` | `#E6F2EE` | Texto principal |
| text-secondary | `--tx2` | `#9FB8B0` | Texto de apoio |
| primary | `--pri` | `#34D399` | Botão primário, seleção, progresso |
| primary-text (ink) | `--priTx` | `#052E22` | Texto sobre primary |
| primary-lip | `--lip` | `#0F8A63` | Lábio do botão primário |
| primary-fill | `--fill` | `#34D399` | Barras de progresso |
| primary-soft | `--priSoft` | `#123A2E` | Seleção, degrau feito, aba ativa |
| blue | `--blue` | `#38BDF8` | Links, secundárias |
| blue-fill | `--blueFill` | `#38BDF8` | Gota, anel de foco |
| blue-soft | `--blueSoft` | `#0E2A3A` | Hover terciário, pílula de horário |
| streak | `--streak` | `#FBBF24` | Chama, confete |
| streak-ink | `--streakInk` | `#FBBF24` | Texto âmbar |
| streak-soft | `--streakSoft` | `#3A2E10` | Fundo de badge rara |
| danger | `--danger` | `#F87171` | Erro |
| toast-icon | `--toastIcon` | `#0369A1` | Gota no toast (toast fica claro no escuro) |
| focus-bg | `--focusBg` | `#12201C` | Foco no escuro = surface + anel azul |
| ring-track | `--ringTrack` | `#1A2C27` | Trilho do anel |

### 2.3 Cores de objetivo (calendário, barras, pontos)
| Objetivo | Hex (claro) | Escuro |
|---|---|---|
| Obj. 1 — Eng. Software (verde) | `#10B981` | `#34D399` |
| Obj. 2 — Cálculo II (azul) | `#0EA5E9` | `#38BDF8` |
| Obj. 3 — Portfólio (verde-água) | `#2DD4BF` | `#2DD4BF` |
Usadas como ponto 8px, barra ou bloco de calendário. Texto sobre blocos de objetivo: sempre `--tx` (#0E1F1A) no claro, nunca branco.

### 2.4 Mascote (fixas nos dois modos)
`#10B981` corpo · `#059669` sombra/copa · `#34D399` folha · `#047857` caule/tronco · `#BAE6FD` brilho-gota · `#0E1F1A` olhos/traços · `#0EA5E9` acessórios azuis (suor, flores, faíscas) · `#E0F2FE` miolo das flores · `#F59E0B` confete.

### 2.5 Regras de uso
- **Semântica:** verde = progresso e ação · azul = foco e recurso (gotas, timer, links) · âmbar = **só** sequência e celebração · vermelho = erro/inviável.
- **Uma única cor de ação por tela:** o botão primário verde. Secundário/terciário são azuis.
- **Pode carregar texto:** `--bg`, `--surface`, `--s2`, `--priSoft`, `--blueSoft`, `--streakSoft` (com `--tx`, `--tx2`, `--pri`, `--blue` ou `--streakInk`); `--pri` (com `--priTx`).
- **NUNCA carrega texto:** `--fill` (#10B981), `--blueFill` (#0EA5E9), `--streak` (#F59E0B), cores de objetivo. Branco em #10B981 ≈ 2,5:1 → proibido.
- Âmbar #F59E0B e azul #0EA5E9 ficam < 3:1 sobre branco → só como **ícone ao lado de um número em `--tx`** (ex.: chama + "6"). Texto âmbar no claro = `#B45309`.
- WCAG 2.2 AA: texto ≥ 4,5:1; ícones/bordas significativos ≥ 3:1; títulos ≥ 24px podem usar 3:1.
- Contrastes de referência (aprox.): branco/#047857 ≈ 5,5:1 · #4A5D57/#F6FAF8 ≈ 6,5:1 · #0369A1/#FFF ≈ 5,9:1 · #052E22/#34D399 ≈ 8:1 · #9FB8B0/#12201C ≈ 8:1 · #0E1F1A/#F6FAF8 ≈ 16:1.

---

## 3. Tipografia

**Famílias (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
```
- **Fredoka** 600 (SemiBold) e 700 (Bold): títulos, números grandes (timer, gotas, XP, %, nível), nome "Broto", logo "bora".
- **Nunito** 400 / 600 / 700 / 800: corpo, botões (800), labels, captions (800 caixa-alta).
- Fallback: `sans-serif`. Números de timer: `font-variant-numeric: tabular-nums`.
- Títulos: `letter-spacing: -0.01em` em Display. Parágrafos: `text-wrap: pretty`.

### Escala mobile
| Estilo | Tamanho/linha | Família · peso | Exemplo |
|---|---|---|---|
| Display | 32/38 | Fredoka 700 | "Vamos começar?" |
| H1 | 26/32 | Fredoka 600 | "Bom dia, Arthur" |
| H2 | 20/26 | Fredoka 600 | "Diagrama de casos de uso" |
| H3 (card) | 18/24 | Fredoka 600 | título do card de etapa / sheet |
| Body | 16/24 | Nunito 400 | parágrafos, balão de chat (15/22) |
| Body strong | 15/20 | Nunito 700–800 | nome de tarefa, opções |
| Small | 14/20 | Nunito 600 | subtítulos, metadados |
| Caption | 12/16 | Nunito 600 (meta) / 800 caixa-alta, tracking 0.06em (rótulos de seção) | "HOJE · 14:00" |
| Botão | 16/1 | Nunito 800 | "Bora!" |
| Botão-herói | 20/26 + 14/20 | Nunito 800 + 600 | "Vamos começar?" |
| Número timer | 36/40 (card) · 64–72 (tela foco) | Fredoka 600 tabular | "25:00" |
| Número barra | 16/1 | Fredoka 600 | "340" |
| Recompensa | 18/22 (toast) · 44/52 (celebração) | Fredoka 700 | "+20 gotas" |

### Escala web
| Estilo | Tamanho/linha | Família · peso |
|---|---|---|
| Display | 64/72 | Fredoka 700, -0.01em |
| H1 | 40/48 | Fredoka 600 |
| H2 | 28/36 | Fredoka 600 |
| H3 | 20/26 | Fredoka 600 |
| Body | 18/28 | Nunito 400 |
| Small | 14–16/20–24 | Nunito 400–600 |
| Caption | 12/16 | Nunito 800 caixa-alta 0.06em |

---

## 4. Espaço, grid, forma, sombras, ícones

- **Grade 8pt.** Escala: 4, 8, 12, 16, 24, 32, 40, 48 (4 e 12 permitidos como meio-passos).
- **Mobile:** 390×844, margem lateral **20px**, gap entre cards 12px, entre seções 24–32px.
- **Web:** 1440px; sidebar 240px; coluna direita 360px; margens de seção 64px; landing com seções separadas por espaço (não por blocos de cor).
- **Raios:** input **12** · card **16** · sheet **24** (só topo) · botões e chips **pílula (999px)** · ícone-tile 12 · degrau da rampa `16 16 8 8`.
- **Bordas:** 1px `--border` em cards/surfaces; 2px em chips, inputs e botão secundário; 2px `--blue` no input focado; 2px tracejada `--border` para bloqueado/não feito/futuro.
- **Sombras:** card `0 1px 2px rgba(14,31,26,.04)` (escuro: none) · flutuante (toast) `0 8px 24px rgba(14,31,26,.18)` · sheet `0 -8px 32px rgba(14,31,26,.08)` (escuro `rgba(0,0,0,.35)`) · lábio: ver botões.
- **Ícones:** **Phosphor** (`@phosphor-icons/web@2.1.1`), peso **Regular** (traço arredondado ~2px) por padrão; **Bold** em ícones pequenos dentro de botões/checks (12–16px); **Fill** só para estado ativo (aba selecionada, gota, chama, play). Tamanhos 16 / 20 / 24 (padrão) / 26–34 (badges).
  - Ícones do produto: `sun` (Hoje) · `flag-banner` (Objetivos) · `calendar-blank` (Semana) · `plant` (Jardim) · `fire` (sequência) · `drop` (gota) · `timer` · `person-simple-walk` (aquecer) · `calculator` (desafio) · `footprints` (micro-passo) · `check-circle` (registrar) · `pause` · `link` · `sparkle` (IA) · `umbrella` · `lock-simple` · `arrows-clockwise` (trocar) · `skip-forward` (pular) · `clock` · `battery-low/medium/full` (energia) · `flag-checkered` · `arrow-counter-clockwise` · `broom` (tarefa leve) · `stairs` · `bell-simple`.
  - **Nunca emoji na navegação.** Emoji só em conteúdo de texto (ex.: "🎉" num aviso), com parcimônia.

---

## 5. Componentes

Rótulo de seção padrão: Nunito 800 12/16, caixa-alta, tracking 0.06em, `--tx2`.

### 5.1 Botões
Todos: pílula (999px), Nunito 800 16px, `cursor:pointer`, transição `transform .08s, box-shadow .08s`.

**Lábio 3D** (aprovado: **3px**): `box-shadow: 0 3px 0 <cor-do-lábio>`. **Pressionado:** `transform: translateY(3px); box-shadow: none` (o botão "afunda" e o lábio some). Só primário e secundário têm lábio.

| Tipo | Altura | Normal | Pressionado | Desabilitado |
|---|---|---|---|---|
| **Primário** | 52 (48 em sheets) | bg `--pri`, texto `--priTx`, sombra `0 3px 0 --lip` | translateY(3px), sem sombra, `filter: brightness(.94)` | bg `--s2`, texto `--tx2`, sombra `0 3px 0 --border`, `cursor:not-allowed` |
| **Secundário** | 52 | bg `--surface`, borda 2px `--border`, texto `--blue`, sombra `0 3px 0 --border` | translateY(3px), bg `--s2`, sem sombra | texto `--tx2`, opacity .6 |
| **Terciário** | 44 (36 compacto) | transparente, texto `--blue`, padding 0 14px | bg `--blueSoft` (também no hover) | texto `--tx2`, opacity .6 |

**Botão-herói "Vamos começar?"** (só na tela Hoje, uma vez): largura total, padding `14px 22px 14px 14px`, bg `--pri`, lábio 3px. Anatomia: círculo 48px `rgba(255,255,255,.18)` com ícone `ph-fill ph-play` 22px · bloco de texto (título Nunito 800 20/26 + subtítulo Nunito 600 14/20 opacity .9) · `ph-bold ph-arrow-right` 22px à direita. Gap 14px. Cor de texto `--priTx`.

Largura mínima de toque: 44px.

### 5.2 Chip de energia / chip de opção
- Altura 44, padding `0 18px 0 14px`, gap 8, pílula, borda 2px, Nunito 800 15px, ícone Bold 20px (`battery-low` Baixa · `battery-medium` Média · `battery-full` Alta).
- **Não selecionado:** bg `--surface`, borda `--border`, texto `--tx`.
- **Selecionado:** bg `--priSoft`, borda `--pri`, texto `--tx`.
- Chips de tempo ("15 min / 30 min / 1h / 2h+"): mesmo padrão, altura 36, padding 0 12, 13px.
- Chips de requisito (resultado da IA, ex.: "PDF", "diagrama UML", "10 páginas"): altura 24–28, bg `--s2`, texto `--tx` 13px 700.

### 5.3 Card de etapa
- bg `--surface`, borda 1px `--border`, raio 16, padding 16, gap 10, sombra de card.
- **Linha 1 (space-between):** objetivo = ponto 8px na cor do objetivo + nome (Nunito 700 13 `--tx2`) · **pílula de estado** (Nunito 800 12/16, padding 3px 9px, pílula).
- **Linha 2:** título Fredoka 600 18/24 `--tx`.
- **Linha 3:** metadados Nunito 700 13 `--tx2`, gap 14: `ph clock` 16 + "1h30" · `ph-fill drop` 15 (`--blueFill`) + "+20".
- **Estados:**
  - Agendada: pílula bg `--blueSoft` / texto `--blue` ("Hoje 14:00").
  - Em andamento: pílula bg `--pri` / texto `--priTx` ("Agora") + borda 2px `--pri`.
  - Parcial: barra 6px (trilho `--s2`, fill `--fill` na %) + "40% · continua amanhã".
  - Concluída: pílula bg `--priSoft` / `--pri` com `ph-bold check` 12 ("Concluída"); título em `--tx2`; barra 100%.
  - Não feita: borda 1px **tracejada** `--border`, título `--tx2`, pílula `--s2`/`--tx2` ("Reagendada").

### 5.4 Item de tarefa leve
- Linha, bg `--surface`, borda 1px `--border`, raio 16, padding `12px 14px`, gap 12, inteiro clicável.
- Checkbox círculo 26px, borda 2px `--border` → marcado: bg + borda `--pri`, `ph-bold check` 14 em `--priTx`.
- Texto: nome Nunito 700 15/20 (marcado: `line-through` e `--tx2`) + duração Nunito 600 12/16 `--tx2` ("10 min · ideal p/ energia baixa").
- Direita: `ph-fill drop` 14 `--blueFill` + "+3" Fredoka 600 14.

### 5.5 Barra de status gamificada
- Container pílula: bg `--surface`, borda 1px `--border`, padding 4, gap 4, `width: fit-content`.
- 3 segmentos (padding 6px 10px, gap 4):
  1. **Sequência:** `ph-fill fire` 18 `--streak` + número Fredoka 600 16 `--tx` ("6").
  2. **Gotas:** `ph-fill drop` 18 `--blueFill` + Fredoka 600 16 `--tx` ("340").
  3. **Nível:** segmento com bg `--s2`, padding `6px 12px 6px 10px`, gap 8: "Nv 7" Fredoka 600 14 `--pri` + mini-barra XP 36×6 (trilho `--border`, fill `--fill` 70%).
- Sempre no topo das telas principais, ao lado do Broto pequeno (40px).

### 5.6 Barra de progresso de objetivo
- Card surface, raio 16, padding 14, gap 8.
- Linha 1: nome Nunito 800 14/20 + % Fredoka 600 18 na cor de texto do objetivo (`--pri` para verde, `--blue` para azul).
- Barra 10px, pílula, trilho `--s2`, fill na cor-fill do objetivo.
- Meta: `ph-bold check-circle` 14 `--pri` + "Entrega 20/11 · folga de 2 dias" Nunito 600 12 `--tx2`.

### 5.7 Anel de timer
- SVG 148×148, círculo r=64, `stroke-width:10`, `stroke-linecap:round`, rotacionado -90°. Circunferência ≈ 402 → `stroke-dasharray:402; stroke-dashoffset: 402 × (1 − progresso)`.
- Trilho: `--ringTrack`. Progresso: **foco** `--blueFill`; **aquecimento** `--fill` (verde).
- Centro: tempo Fredoka 600 36/40 tabular `--tx` + rótulo Nunito 700 12 `--tx2` ("foco").
- Card: bg `--focusBg`, raio 24, padding 20. Tela de foco cheia: anel ~260px, número 64–72px.

### 5.8 Stepper da rampa (escada de 5 degraus)
- Linha flex `align-items:flex-end`, gap 6, altura 184. Cada degrau `flex:1`, raio `16 16 8 8`, padding 10, `box-sizing:border-box`, clicável.
- **Alturas:** 108, 127, 146, 165, 184 px (108 + i×19) → leitura de escada subindo.
- Conteúdo (coluna, gap 2, nada encolhe): ícone 22 (+4 margem) · nome Nunito 800 13/16 · duração Nunito 600 12/16 opacity .85 · "+5" Fredoka 600 12 com `ph-fill drop` 12.
- Degraus: 1 Aquecer 3 min (`person-simple-walk`) · 2 Desafio 2 min (`calculator`) · 3 Micro-passo 1 min (`footprints`) · 4 Foco 25 min (`timer`) · 5 Registrar 1 min (`check-circle`).
- **Estados:** feito = bg `--priSoft`, texto `--pri`, ícone vira `ph-bold check` · atual = bg `--pri`, texto `--priTx`, ícone Fill, lábio `0 3px 0 --lip` · futuro = bg `--surface`, borda 1px `--border`, texto `--tx`.
- Abaixo: "Degrau 3 de 5 · Micro-passo" Nunito 700 14 + botões terciários compactos (36px) **"Trocar"** (`arrows-clockwise`) e **"Pular"** (`skip-forward`).

### 5.9 Bottom sheet
- bg `--surface`, raio **24 24 0 0**, borda 1px `--border` sem borda inferior, sombra de sheet, padding `10px 16px 18px` (mobile real: 20px laterais), gap 12. Scrim atrás: `rgba(14,31,26,.4)`.
- Alça 40×5, pílula, `--border`, centralizada.
- Título Fredoka 600 18/24 ("Como está sua energia?").
- Opções grandes (uma por linha): raio 16, borda 2px, padding `6px 12px 6px 6px`, gap 10 → Broto 44px no humor correspondente (Baixa = sonolento, Média = ok, Alta = animado) + nome Nunito 800 15 + descrição Nunito 600 12 `--tx2`. Seleção como chip (5.2).
- Pergunta secundária Nunito 800 13 + chips de tempo.
- Botão primário 48px no rodapé ("Montar minha rampa").

### 5.10 Toast de recompensa
- Pílula invertida: bg `--tx`, texto `--bg`, padding `10px 20px 10px 10px`, gap 12, sombra flutuante.
- Círculo 36px bg `rgba(56,189,248,.16)` com `ph-fill drop` 20 `--toastIcon`.
- Texto: "+20 gotas" Fredoka 700 18/22 + "Etapa concluída" Nunito 600 12 opacity .8.
- Animação: entra com escala 0.85→1 (`cubic-bezier(.3,1.6,.5,1)` 350ms), fica, sai; **total ≤ 1,5s**. Posição: topo, abaixo da barra gamificada.

### 5.11 Badge de conquista
- Medalha circular 56px (lista) / 80px (Jardim), borda 2px, ícone Fill 26 / 34.
- **Desbloqueada:** bg `--priSoft`, borda `--fill`, ícone `--pri`.
- **Rara:** bg `--streakSoft`, borda `--streak`, ícone `--streakInk`; subtítulo em `--streakInk` ("Rara · 8% dos usuários").
- **Bloqueada:** bg `--s2`, borda 2px **tracejada** `--border`, `ph lock-simple` `--tx2`; nome em `--tx2`; progresso "6 de 7".
- Texto: nome Fredoka 600 16/20 + sub Nunito 600 12/16 `--tx2`.

### 5.12 Balão de chat do Broto (onboarding)
- Linha `align-items:flex-end`, gap 8: Broto 40px (humor animado/ok) + balão.
- Balão: bg `--surface`, borda 1px `--border`, raio **20 20 20 6** (canto inferior esquerdo apontando ao Broto), padding `12px 14px`, Nunito 400 15/22. "Broto" em Fredoka 600.
- Respostas do usuário: chips à direita (`justify-content:flex-end`, gap 6): resposta escolhida = bg `--pri`, texto `--priTx`, padding 9px 14px; alternativas = borda 2px `--border`, bg `--surface`, texto `--blue`.
- Topo da tela: barra de progresso fina 4px (trilho `--s2`, fill `--fill`), máx. 6 passos.

### 5.13 Inputs
- **Texto / link:** altura 52, raio **12**, padding 0 14, gap 10, bg `--surface`, borda 2px `--border` → **foco: 2px `--blue`**. Ícone à esquerda 20px (`ph link` em `--blue` para link). Texto Nunito 600 15, truncado com ellipsis. Placeholder `--tx2`.
- Campo grande "O que você precisa entregar?": textarea min 120px, raio 12, Nunito 400 18/26, exemplo em placeholder ("trabalho de Engenharia de Software para dia 20").
- Abas "Escrever / Colar link": segmented em pílula, bg `--s2`, aba ativa bg `--surface` com borda 1px.
- **Estado "IA analisando…":** card surface raio 16 padding 14 gap 10 → linha `ph-bold circle-notch` 16 girando (1s linear infinite) + "IA analisando…" Nunito 800 14 `--blue`; 2 linhas skeleton 10px (80% e 56%) com shimmer `linear-gradient(90deg, --s2 25%, --border 50%, --s2 75%)` `background-size:200% 100%` 1,4s infinito; fileira de 3 chips skeleton 24px (`--s2`).
- Slider ("máx. 4h por dia", "Parcial %"): trilho 8px `--s2`, preenchido `--fill`, polegar 28px branco com borda 2px `--pri` e lábio `0 2px 0 --lip`; valor em Fredoka 600.

### 5.14 Tab bar (4 abas)
- bg `--surface`, borda superior 1px `--border` (no device: full-width + safe area), padding `8px 8px 10px`.
- Abas `flex:1`, coluna, gap 4: pílula 56×32 com ícone 24 + rótulo 12/16.
- **Ativa:** pílula `--priSoft`, ícone **Fill** `--pri`, rótulo Nunito 800 `--tx`.
- **Inativa:** pílula transparente, ícone Regular `--tx2`, rótulo Nunito 600 `--tx2`.
- Abas: **Hoje** (`sun`) · **Objetivos** (`flag-banner`) · **Semana** (`calendar-blank`) · **Jardim** (`plant`).

---

## 6. Mascote "Broto"

Original — **não é cérebro, não é coruja.** Uma semente arredondada verde com folha no topo e um brilho em forma de gota azul. SVG chapado, **sem gradiente**, 3 verdes + 1 azul + tinta escura. Quase sem boca. Ele **nunca morre**; quando o usuário falha, só murcha levemente.

### 6.1 Geometria (viewBox `0 0 120 120`, `overflow: visible`)
Ordem de desenho (de trás para frente):
1. **Sombra no chão:** `ellipse cx=60 cy=112 rx=30 ry=4 fill=rgba(14,31,26,.10)` (rx 24 na Semente).
2. **Copa/tronco** (só estágios 4–5, atrás do corpo — ver 6.3).
3. **Caule e folhas** (estágios 1–3).
4. **Corpo** (semente, um pouco mais estreita no topo, base larga): `M60 46 C84 46 94 68 94 82 C94 100 79 108 60 108 C41 108 26 100 26 82 C26 68 36 46 60 46 Z` · fill `#10B981`. Largura 68 (x 26–94), altura 62 (y 46–108) → proporção ≈ 1,1 : 1 (largura : altura), ponto mais largo a ~58% da altura.
5. **Sombra da barriga** (meia-lua inferior): `M27 90 C33 103 47 108 60 108 C78 108 91 101 93 88 C83 100 46 104 27 90 Z` · fill `#059669`.
6. **Brilho em gota** (alto, à esquerda, ponta para cima): `M44 59 C44 59 39 65 39 68.5 A5 5 0 0 0 49 68.5 C49 65 44 59 44 59 Z` · fill `#BAE6FD`.
7. **Rosto** (olhos em y=82, centros x=50 e x=70 — espaçamento 20).

**Olhos padrão:** elipses verticais `rx=4 ry=5.5`, fill `#0E1F1A`. **Boca padrão:** traço curto `M57 92.5 Q60 95 63 92.5`, stroke `#0E1F1A` 2.2, round. Traços em geral: stroke `#0E1F1A` 2.6, `linecap:round`, sem fill.

**Caule:** `M60 47 L60 <topo>` stroke `#047857` 3.5 round.
**Folha direita:** `M60 36 C60 24 70 17 83 19 C81 32 71 38 60 36 Z` fill `#34D399` + nervura `M63 33 C67 29 73 25 79 22` stroke `#047857` 1.6, opacity .5.
**Folha esquerda:** `M60 38 C58 28 49 23 39 25 C41 36 50 40 60 38 Z` fill `#34D399`.
**Folha caída** (sonolento/murcho): folha direita `rotate(38 60 36)`, esquerda `rotate(-38 60 38)`.

### 6.2 Estágios de evolução (o nível muda o estágio)
| # | Nome | Níveis | Desenho |
|---|---|---|---|
| 1 | **Semente** | Nv 1–3 | Sem caule; só um broto minúsculo `M60 48 C60 41 64 38 70 39 C69 45 65 48 60 48 Z` (#34D399). Planta inteira em escala .82 ancorada na base (`translate(60 108) scale(.82) translate(-60 -108)`). |
| 2 | **Broto** | Nv 4–8 | Caule até y=36 + 1 folha direita. **(Estágio padrão / Arthur, Nv 7)** |
| 3 | **Muda** | Nv 9–14 | Caule até y=28 + folha direita deslocada `translate(0 -8)` + folha esquerda. |
| 4 | **Arbusto** | Nv 15–24 | Sem caule; copa atrás do corpo: círculos `#059669` (40,46,r16) (80,46,r16) (60,32,r19) + realces `#34D399` (48,37,r11) (72,39,r10) (60,24,r8). |
| 5 | **Árvore jovem** | Nv 25+ | Tronco `rect x=56 y=26 w=8 h=26 rx=3 #047857`; copa `#059669` (36,34,r17) (84,34,r17) (60,20,r21) + `#34D399` (48,26,r12) (73,28,r11) (60,40,r9); **flores azuis** r=3.8 `#0EA5E9` com miolo r=1.4 `#E0F2FE` em (34,30) (56,8) (84,26) (72,42) (44,44) (24,40). |
O rosto e o corpo-semente permanecem iguais em todos os estágios.

### 6.3 Estados de humor
| Estado | Quando | Olhos | Boca | Extras |
|---|---|---|---|---|
| **Ok** | padrão | elipses 4×5.5 | traço curvo curto | — |
| **Sonolento** | energia baixa | fechados: arcos para baixo `M45.5 83 Q50 86.5 54.5 83` / `M65.5 83 Q70 86.5 74.5 83` | "o" pequeno: círculo r1.8 em (60,94) | folha caída; dois "z" Fredoka 700 #4A5D57 (14px em 88,58 · 10px em 98,46) |
| **Animado** | energia alta | elipses 4.6×6.2 com brilho branco r1.7 em (51.6,79.4)/(71.6,79.4) | sorriso aberto preenchido `M55.5 90.5 Q60 97.5 64.5 90.5 Z` | sobe 4px (`translate(0 -4)`); 2 faíscas "+" azuis #0EA5E9 (em 100,50 e 18,63) |
| **Focado** | sessão de foco | menores 3.2×4.2 (y=83) | linha reta `M57 95 L63 95` | **óculos**: círculos r8.5 em (50,82)/(70,82), stroke #0E1F1A 2.4, fill rgba(255,255,255,.3) + ponte `M58.5 81 Q60 79.5 61.5 81` |
| **Preocupado** | plano inviável | 3.8×5.2 (y=83) | ondulada `M55 95 Q57.5 93 60 95 Q62.5 97 65 95` | sobrancelhas inclinadas (internas mais altas): `M44 74 L54 71` / `M66 71 L76 74`; gota de suor azul à direita `M93 62 C93 62 88.5 68 88.5 70.5 A4.5 4.5 0 0 0 97.5 70.5 C97.5 68 93 62 93 62 Z` |
| **Comemorando** | após ação / marcos | felizes "^": `M45.5 84 Q50 78 54.5 84` / `M65.5 84 Q70 78 74.5 84` (stroke 2.8) | aberta preenchida `M55 90 Q60 98.5 65 90 Z` | sobe 4px; 6 confetes retângulos 7×4 rx1.5 girados (âmbar #F59E0B, azul #0EA5E9, verde #34D399) ao redor |
| **Murcho** | dia sem rega / falha | redondos baixos 3.6×3.4 (y=84) | curva para baixo `M56.5 95 Q60 92.5 63.5 95` | folha caída; cores dessaturadas: corpo `#6DBE9B`, sombra `#4FA27F`, folha `#9AD7BB`. **Nunca morre.** |

### 6.4 Uso
- Tamanhos: 40 (barra/topo, chat), 44 (opções de sheet), 56 (logo/e-mail), 72–100 (cards, telas de estado), 120–130+ (Jardim, landing).
- Funciona em fundo claro e escuro sem alteração de cor.
- Estado do Broto no Hoje = humor do check-in de energia.
- Animações (≤1,5s): leve "bounce" ao ganhar gotas, gota azul caindo sobre a folha, espreguiçar no aquecimento.

---

## 7. Gamificação

| Ação | Gotas | Onde aparece |
|---|---|---|
| Degrau da rampa cumprido | **+5** | toast após cada degrau; "+5" em cada degrau do stepper |
| Etapa concluída | **+20** | celebração no registro de progresso; meta do card de etapa |
| Etapa parcial (qualquer %) | **+10** | registro de progresso |
| Tarefa leve | **+3** | item de tarefa leve; toast |
| Guarda-chuva (protege 1 dia de sequência) | **−50** | Jardim/loja; dia protegido no calendário de sequência (ícone `umbrella` sobre `--blueSoft`) |

- **XP = minutos de foco** (1 XP por minuto). Cada nível pede um pouco mais (ex.: Nv 7 = 410/480 XP). Exibido na pílula "Nv 7" da barra gamificada e no Jardim ("70 min de foco até o Nível 8").
- **Níveis → estágio do Broto:** Semente Nv 1–3 · Broto 4–8 · Muda 9–14 · Arbusto 15–24 · Árvore jovem 25+. A troca de estágio é um **marco**.
- **Sequência "dias regados":** o dia conta com ≥1 degrau cumprido. Visual: tiles 1:1 raio 12 — regado = `--priSoft` + `ph-fill drop` `--pri`; protegido = `--blueSoft` + `ph-fill umbrella` `--blue`; hoje pendente = borda 2px tracejada `--border` + `ph drop` `--tx2`. Heatmap no Jardim em tons de verde. Quebrar a sequência só murcha o Broto; tom sem culpa.
- **Conquistas raras (5):** Primeiro passo (`footprints`) · Rampa completa (`flag-checkered`, rara/âmbar) · Voltou da pausa (`arrow-counter-clockwise`) · 7 dias regados (`drop`) · Entregue com folga (`paper-plane-tilt`). Exemplo de estado: 3 desbloqueadas, 2 bloqueadas.
- **Celebrações:**
  - **Micro (≤1,5s):** toast + gota caindo no Broto + Broto "comemorando" breve. Depois de degrau, etapa ou tarefa leve.
  - **Marco (≤3s):** confete âmbar + Broto comemorando grande + número 44px. Só para novo estágio, 7 dias regados e "Entregue com folga".
- **Onde a gamificação vive:** barra compacta no topo (mobile) ou rodapé da sidebar (web), toasts e celebrações pós-ação, tela Jardim. **Não** espalhar números/moedas pelo resto da interface.

---

## 8. NÃO FAZER

- ❌ Fontes **Inter, Roboto, Arial, Helvetica** ou fonte do sistema. ❌ Serifas display. Só Fredoka + Nunito.
- ❌ **Gradientes roxos** — e gradientes em geral (única exceção: shimmer do skeleton).
- ❌ Fundo creme com acentos terracota.
- ❌ Preto puro `#000` no modo escuro (use `#0B1512`).
- ❌ Texto branco sobre tons **fill** (#10B981, #0EA5E9, #F59E0B, cores de objetivo).
- ❌ Âmbar fora de sequência/celebração; mais de uma cor de ação primária por tela; mais de um botão primário por tela.
- ❌ Cards todos iguais em grade; gamificação espalhada (moedas em todo lugar).
- ❌ Ilustrações 3D genéricas; sombras pesadas; glassmorphism.
- ❌ Emojis no lugar de ícones na navegação/tab bar.
- ❌ Mascote cérebro ou coruja; Broto com gradiente, boca grande, braços/pernas; Broto morrendo ou chorando.
- ❌ Copy culpabilizante ("Você falhou", "De novo?"); celebrações longas (> 1,5s) fora de marcos.
- ❌ Bordas com acento colorido à esquerda em cards; texto abaixo de 12px; alvos de toque < 44px.

---

## 9. CSS dos tokens

```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
/* Ícones: https://unpkg.com/@phosphor-icons/web@2.1.1/src/{regular,bold,fill}/style.css */

:root {
  /* Base */
  --bg: #F6FAF8;
  --surface: #FFFFFF;
  --s2: #EAF5F0;            /* surface-2 */
  --border: #D5E6DF;
  --tx: #0E1F1A;            /* text-primary */
  --tx2: #4A5D57;           /* text-secondary */
  /* Ação / progresso */
  --pri: #047857;           /* primary */
  --priTx: #FFFFFF;         /* texto sobre primary */
  --lip: #065F46;           /* lábio do botão primário */
  --fill: #10B981;          /* primary-fill — nunca com texto */
  --priSoft: #D1FAE5;
  /* Foco / recurso */
  --blue: #0369A1;
  --blueFill: #0EA5E9;      /* nunca com texto */
  --blueSoft: #E0F2FE;
  /* Acentos */
  --streak: #F59E0B;        /* só ícone/confete */
  --streakInk: #B45309;     /* texto âmbar */
  --streakSoft: #FEF3C7;
  --danger: #DC2626;
  /* Objetivos */
  --obj1: #10B981; --obj2: #0EA5E9; --obj3: #2DD4BF;
  /* Contextuais */
  --toastIcon: #38BDF8;
  --focusBg: #E0F2FE;
  --ringTrack: #FFFFFF;
  /* Forma */
  --lipY: 3px;
  --r-input: 12px; --r-card: 16px; --r-sheet: 24px; --r-pill: 999px;
  --shadow: 0 1px 2px rgba(14,31,26,.04);
  --shadowFloat: 0 8px 24px rgba(14,31,26,.18);
  --sheetShadow: 0 -8px 32px rgba(14,31,26,.08);
  /* Espaço (8pt) */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px; --sp-6: 32px; --sp-7: 40px; --sp-8: 48px;
  --margin-mobile: 20px;
  /* Tipografia */
  --font-display: 'Fredoka', sans-serif;
  --font-body: 'Nunito', sans-serif;
}

[data-theme="dark"] {
  --bg: #0B1512;
  --surface: #12201C;
  --s2: #1A2C27;
  --border: #24413A;
  --tx: #E6F2EE;
  --tx2: #9FB8B0;
  --pri: #34D399;
  --priTx: #052E22;
  --lip: #0F8A63;
  --fill: #34D399;
  --priSoft: #123A2E;
  --blue: #38BDF8;
  --blueFill: #38BDF8;
  --blueSoft: #0E2A3A;
  --streak: #FBBF24;
  --streakInk: #FBBF24;
  --streakSoft: #3A2E10;
  --danger: #F87171;
  --obj1: #34D399; --obj2: #38BDF8; --obj3: #2DD4BF;
  --toastIcon: #0369A1;
  --focusBg: #12201C;
  --ringTrack: #1A2C27;
  --shadow: none;
  --sheetShadow: 0 -8px 32px rgba(0,0,0,.35);
}

/* Botão primário de referência */
.btn-primary {
  height: 52px; padding: 0 24px; border: 0; border-radius: var(--r-pill);
  background: var(--pri); color: var(--priTx);
  font: 800 16px/1 var(--font-body);
  box-shadow: 0 var(--lipY) 0 var(--lip);
  transition: transform .08s, box-shadow .08s;
}
.btn-primary:active { transform: translateY(var(--lipY)); box-shadow: none; }
.btn-primary:disabled { background: var(--s2); color: var(--tx2); box-shadow: 0 var(--lipY) 0 var(--border); }

@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
@keyframes spin { to { transform: rotate(360deg) } }
```

### Escala tipográfica (referência CSS)
```css
/* Mobile */
.display { font: 700 32px/38px var(--font-display); letter-spacing: -.01em; }
.h1      { font: 600 26px/32px var(--font-display); }
.h2      { font: 600 20px/26px var(--font-display); }
.body    { font: 400 16px/24px var(--font-body); }
.small   { font: 600 14px/20px var(--font-body); }
.caption { font: 800 12px/16px var(--font-body); letter-spacing: .06em; text-transform: uppercase; }
/* Web */
.w-display { font: 700 64px/72px var(--font-display); letter-spacing: -.01em; }
.w-h1      { font: 600 40px/48px var(--font-display); }
.w-h2      { font: 600 28px/36px var(--font-display); }
.w-body    { font: 400 18px/28px var(--font-body); }
```

---
*Bora Design System v1 — aprovado na Fase 1. Usuário de exemplo: Arthur, 21, Ciência da Computação · Nv 7 · 340 gotas · 6 dias regados.*
