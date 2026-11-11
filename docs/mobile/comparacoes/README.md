# Comparações das telas mobile com o protótipo (B5)

Cada imagem traz a referência do protótipo (`design/`) à esquerda e o app rodando no simulador iOS (iPhone 16e, 390×844) à direita. As imagens foram reduzidas para JPEG.

## Diferenças em todas as telas
- A barra de status é a real do iOS, não o "9:41" desenhado.
- Não há moldura nem indicador de home desenhado.
- Nas referências mostradas expandidas, o conteúdo do app aparece rolado.

## Diferenças em telas específicas, cada uma justificada
- **M06**: o chip "Sugerido pra você" aparece quando há energia escolhida (P14).
- **M07 e M10**: os timers correm em tempo real (o protótipo acelera) e o aquecimento não tem a animação do Broto.
- **M15 (P20)**: a tela começa vazia, sem chat da IA, requisitos, áudio, anexo e o slider "Máximo de estudo por dia".
- **M18**: as etapas concluídas mostram "Concluída", porque o contrato não traz a data.
- **M02**: aparece "Entrega dd/mm" no lugar de "Prova", e os objetivos sem prazo mostram "Sem prazo".
- Algumas quebras de linha mudam, porque o Flutter não tem `text-wrap: pretty`.

## Rodada de ajustes visuais (11/11/2026, M1 e M2)

Capturas só da implementação (dados de exemplo), rodada 1. Referências em `design/mobile/app/screens/`:
- `m-calendario-week-r1` ↔ 03/19; `m-calendario-month-r1` ↔ 20; `m-calendario-deadlines-r1` e `m-calendario-month-deadlines-r1` ↔ 21 (Prazos na semana não tem referência).
- `m-chat-chat-r1` ↔ 13; `m-chat-analyzing-r1` ↔ 14; `m-chat-newgoal-r1` ↔ 15; `m-chat-ladder-r1` ↔ 06.

Diferenças que ficaram:
- **M20:** menos dias com ponto. O protótipo inventa blocos em `execMonth()`; o app usa as etapas das trilhas de exemplo, coerentes com a M18.
- **M21:** o card mostra "Entrega final" e o título do objetivo; o protótipo mostra "Entrega final · {nome curto}" e o título completo (o contrato não tem nome curto).
- Os estados vazios têm borda contínua (o protótipo usa tracejada) e a legenda de Execução segue o período visível (no protótipo é fixa). Ambos estão no `afazeres.md`.
- **M15:** a resposta da IA abre a tela de etapas já existente (como pedido), não dentro do chat: sem o balão "Achei N requisitos", as pílulas, o slider e "Cabe com 1 dia de folga"; título e prazo são campos editáveis.
- **M14:** a barra de "IA analisando…" não tem o brilho animado; o balão do usuário foi alargado para 308 depois da captura (falta conferir).
- **M06:** a referência foi capturada sem energia escolhida e por isso não mostra a tag; no app ela aparece acima dos degraus, na posição do código do protótipo.
