# Casos de uso — Bora

Prioridades: **MVP** (obrigatório para a demo), **Desejável**, **Futuro**.

## MVP (20)

| ID | Caso de uso | Descrição |
|---|---|---|
| UC01 | Informar disponibilidade | O usuário define os horários livres de cada dia e um limite de horas por dia. Pode ser redefinido depois em Perfil > Configurações > Redefinir minha rotina. |
| UC02 | Cadastrar objetivo pelo chat com IA | O usuário escreve (ou fala, ou anexa) algo como "trabalho de X para dia 20" e a IA extrai título, prazo e tipo. |
| UC03 | Criar objetivo a partir de anexo/link | O usuário anexa pelo clipe o enunciado, edital ou link. O Firecrawl lê a página e a IA extrai prazo e requisitos. |
| UC04 | Quebrar objetivo em etapas | A IA sugere etapas em ordem com estimativa de tempo; o usuário edita e confirma. |
| UC05 | Gerar plano no calendário | O motor distribui as etapas nos horários livres até o prazo, respeitando o limite diário e deixando folga antes da entrega. |
| UC06 | Ver "o que fazer hoje" | A Home mostra o botão "Vamos começar?" e as etapas do dia de todos os objetivos. |
| UC07 | Ver calendário | Visões Execução (etapas) e Prazos (só entregas). No mobile: semana compacta com bolinhas, expande para mês ao arrastar. |
| UC08 | Registrar progresso de etapa | Marcar como concluída, parcial ou não feita, ou adiantar uma etapa de outro dia. |
| UC09 | Recalcular plano automaticamente | O plano é refeito em adiantamento, atraso, mudança nas etapas ou na disponibilidade. |
| UC10 | Editar trilha do objetivo | Adicionar, editar, reordenar e excluir etapas; marcar/desmarcar como concluída. O plano é recalculado ao salvar. |
| UC13 | Cadastrar tarefas leves | Lista de coisas fáceis e úteis (arrumar o guarda-roupa, lavar a louça), usadas também como aquecimento. |
| UC14 | Fazer check-in de energia | 4 níveis (Baixa, Média, Alta, Elétrico) + tempo disponível agora. Define o degrau inicial da rampa. |
| UC15 | Iniciar rampa ("Vamos começar?") | Botão principal. Abre o check-in e depois a escada de degraus com o degrau sugerido. |
| UC16 | Executar degrau de aquecimento | Atividade curta com timer: caminhada, tarefa leve ou alongamento. |
| UC17 | Desafio mental no app | Contas de cabeça por poucos minutos. |
| UC18 | Fazer o primeiro micro-passo | Ação mínima da etapa real ("abra o arquivo e escreva o título"). |
| UC19 | Escolher, pular ou trocar degrau | O usuário toca em qualquer degrau para começar dele, troca a atividade ou pula direto para a tarefa. |
| UC20 | Iniciar sessão de foco | Timer associado a uma etapa do plano, com botão "Pedir ajuda". |
| UC21 | Encerrar sessão e registrar resultado | O app pergunta quanto avançou e alimenta UC08 e UC09. |
| UC23 | Receber o plano do dia por e-mail | O Resend envia o "o que fazer hoje" com botão que abre a rampa. |

## Desejável (8 + novos)

| ID | Caso de uso | Descrição |
|---|---|---|
| UC11 | Alertar plano inviável | Quando as etapas não cabem até o prazo, avisa e oferece opções com prévia no calendário. |
| UC12 | Gerenciar vários objetivos | Prioriza pelo prazo e respeita o limite diário somando todos os objetivos. |
| UC22 | Pausa com retorno guiado | Pausa com tempo definido e convite para voltar com um mini-degrau. |
| UC24 | Receber alertas e resumo por e-mail | Plano inviável, etapa atrasada e resumo semanal via Resend. |
| UC25 | Ver histórico e sequência | Dias seguidos (folha), tempo focado, etapas concluídas no prazo. |
| UC26 | Limitar apps de distração | Bloqueia ou dificulta redes sociais no horário planejado. |
| UC27 | Ler material de referência da etapa | O Firecrawl lê links colados e a IA resume o que serve para a etapa. |
| UC29 | Criar conta e entrar | Cadastro simples. Na demo, pode ser um usuário fixo. |
| UC30 | Criar tarefa à mão | Formulário com título, tempo, prazo (calendário) e "IA encaixa" ou "escolher dia e hora". |
| UC31 | Pedir ajuda durante o foco | Pausa o timer, salva o tempo focado, reabre check-in e escada, depois retoma a mesma etapa. |
| UC32 | Configurações do perfil | Redefinir rotina, idioma (PT-BR, EN, ES) e enviar sugestão aos desenvolvedores. |

## Futuro (1)

| ID | Caso de uso | Descrição |
|---|---|---|
| UC28 | Sincronizar com Google Calendar | Importa compromissos para calcular a disponibilidade. |
