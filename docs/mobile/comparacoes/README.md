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
