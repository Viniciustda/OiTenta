# Design system — Bora

> Fonte de verdade visual. Se houver divergência com o export do Claude Design, **o export vence**: confira os valores lá e atualize este arquivo.

## Conceito

"Você rega, ele cresce." O usuário ganha **Gotas** (azul) ao cumprir degraus e etapas. As Gotas regam o **Broto** (verde), o mascote, que evolui com o progresso. Verde = progresso/ação; azul = foco/recurso; amarelo = sequência e celebração.

Tom de voz: amigo, direto, sem culpa. Exemplos: "Bora?", "Tudo bem, reorganizei pra você 💪", "Você já focou 10 min, isso conta!", "Deu vontade de pegar o celular? Normal. Bora reaquecer rapidinho?", "Você ganhou 1 dia de folga 🎉".

## Cores

### Modo claro

| Token | Hex | Uso |
|---|---|---|
| bg | #FFFFFF (mobile) / #F6FAF8 (web) | Fundo da tela |
| surface | #FFFFFF | Cards (no mobile, sempre com borda 1px) |
| surface-2 | #EAF5F0 | Chips, trilhas, áreas secundárias |
| border | #D5E6DF | Bordas de 1px |
| text-primary | #0E1F1A | Títulos e corpo |
| text-secondary | #4A5D57 | Legendas |
| primary | #047857 | Botão primário (texto branco) |
| primary-lip | #065F46 | "Lábio" 3D do botão primário |
| primary-fill | #10B981 | Barras de progresso, ilustração, mascote |
| primary-soft | #D1FAE5 | Fundo de estados de sucesso |
| blue | #0369A1 | Links, ações secundárias, contorno da Gota |
| blue-fill | #0EA5E9 | Gota, timer de foco |
| blue-soft | #E0F2FE | Fundo da sessão de foco |
| streak | #F59E0B | Folha da sequência, confete |
| danger | #DC2626 | Plano inviável, erros |

### Modo escuro

| Token | Hex |
|---|---|
| bg | #0B1512 |
| surface | #12201C |
| surface-2 | #1A2C27 |
| border | #24413A |
| text-primary | #E6F2EE |
| text-secondary | #9FB8B0 |
| primary | #34D399 (texto do botão #052E22) |
| blue | #38BDF8 |
| streak | #FBBF24 |
| danger | #F87171 |

Regras:
- Tons "fill" (#10B981, #0EA5E9) nunca carregam texto branco.
- Texto com contraste ≥ 4,5:1; ícones e bordas significativos ≥ 3:1 (WCAG 2.2 AA).
- Uma única ação primária (verde) por tela.
- Nunca usar preto puro (#000) no modo escuro.

## Tipografia (Google Fonts)

- **Fredoka** 600/700: títulos, números grandes (timer, gotas, nível), nome do mascote.
- **Nunito** 400/600/800: corpo, botões, labels.

| Estilo | Mobile | Web |
|---|---|---|
| Display | 32/38 | 64/72 |
| H1 | 26/32 | 40/48 |
| H2 | 20/26 | 28/36 |
| Body | 16/24 | 18/28 |
| Small | 14/20 | 14/20 |
| Caption | 12/16 | 12/16 |

## Forma e espaçamento

- Grade de 8pt; margem lateral de 20px no mobile.
- Raios: 12 (input), 16 (card), 24 (sheet), pílula (botões e chips).
- Cards com borda de 1px e sombra quase nula.
- Botão primário com "lábio": borda inferior de 3px em primary-lip, que some ao pressionar.
- Ícones lineares de 2px com cantos arredondados (estilo Phosphor).

## Componentes

- Botões primário, secundário e terciário (normal, pressionado, desabilitado)
- Card de etapa (título, objetivo, horário, tempo estimado, estado)
- Chip (energia, requisitos, filtros)
- Barra gamificada: 🍃 sequência (amarelo) · 💧 gotas · nível/XP + botão de perfil
- Barra de progresso e anel de % do objetivo
- Anel de timer circular
- Escada da rampa (5 degraus clicáveis, com o selo "Sugerido pra você")
- Bottom sheet (check-in, detalhe de bloco, seletor de data)
- Toast de recompensa ("+20 💧")
- Badge de conquista
- Balão de chat (Broto à esquerda, usuário à direita)
- Barra de entrada do chat: clipe à esquerda, campo de texto, microfone/enviar à direita
- Controle segmentado (Execução / Prazos; Dia / Semana / Mês)
- Seletor de data em calendário mensal
- Tab bar mobile: Hoje, Objetivos, Semana, Jardim
- Sidebar web de 240px

## Mascote: Broto

Semente arredondada verde (#10B981) com uma folha no topo e um brilho em forma de gota azul. Olhos ovais simples, quase sem boca. SVG chapado, 2–3 tons, sem gradiente.

- **Estágios por nível:** Semente (1–2) → Broto (3–5) → Muda (6–9) → Arbusto (10–14) → Árvore jovem com flores azuis (15+).
- **Humores:** sonolento (energia baixa), ok (média), animado (alta), empolgado (elétrico), focado (de óculos), pensando (IA analisando), preocupado (plano inviável), comemorando.
- **Regra:** nunca morre e nunca dá bronca. Quando o usuário falha, só murcha levemente.

## Gamificação

| Mecânica | Regra | Onde aparece |
|---|---|---|
| Gotas | +5 por degrau, +20 por etapa concluída, +10 por parcial, +3 por tarefa leve | Topo da Hoje e do Jardim; toast de recompensa |
| XP / nível | XP = minutos de foco; o nível define o estágio do Broto | Topo da Hoje e do Jardim |
| Sequência | Conta o dia com ≥ 1 degrau feito; ícone de folha amarela 🍃 | Topo da Hoje e do Jardim |
| Guarda-chuva | Protege 1 dia da sequência; custa 50 gotas | Jardim > loja |
| Conquistas | Primeiro passo, Rampa completa, 7 dias regados, Entregue com folga, Voltou da pausa | Jardim |

No mobile, a barra gamificada aparece **somente** nas abas Hoje e Jardim.

## Não fazer

- Inter, Roboto, Arial ou fonte de sistema
- Gradientes (principalmente roxos)
- Fundo creme com acentos terracota
- Emojis no lugar de ícones de navegação
- Cards todos iguais em grade, ilustrações 3D genéricas

## Tokens CSS

```css
:root {
  --bg: #FFFFFF; --surface: #FFFFFF; --surface-2: #EAF5F0; --border: #D5E6DF;
  --text-primary: #0E1F1A; --text-secondary: #4A5D57;
  --primary: #047857; --primary-lip: #065F46; --primary-fill: #10B981; --primary-soft: #D1FAE5;
  --blue: #0369A1; --blue-fill: #0EA5E9; --blue-soft: #E0F2FE;
  --streak: #F59E0B; --danger: #DC2626;
  --font-display: "Fredoka", "Nunito", sans-serif;
  --font-body: "Nunito", system-ui, sans-serif;
  --radius-input: 12px; --radius-card: 16px; --radius-sheet: 24px; --radius-pill: 999px;
}
[data-theme="dark"] {
  --bg: #0B1512; --surface: #12201C; --surface-2: #1A2C27; --border: #24413A;
  --text-primary: #E6F2EE; --text-secondary: #9FB8B0;
  --primary: #34D399; --on-primary: #052E22; --blue: #38BDF8;
  --streak: #FBBF24; --danger: #F87171;
}
```
