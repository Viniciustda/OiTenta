# Fluxos — Bora

Estado atual dos fluxos aprovados no design. Onde mobile e web diferem, está indicado.

## 1. Onboarding

Chat com o Broto → nome → horários livres (grade seg–dom; arrastar para pintar; aula e estágio aparecem como ocupados) → limite de horas por dia → Hoje.

A rotina pode ser redefinida depois em **Perfil > Configurações > Redefinir minha rotina**, com a mesma grade, já preenchida. Ao salvar, o plano é recalculado.

## 2. Home (Hoje)

- Topo: saudação + barra gamificada (🍃 sequência · 💧 gotas · nível) + botão de perfil.
- Botão principal "Vamos começar?".
- Timeline das etapas e tarefas leves do dia.
- Não há card de energia na Home: o check-in acontece só dentro da rampa.

## 3. Rampa de ativação

```
Vamos começar? → Check-in → Escada → [degrau escolhido] → … → Foco → Registrar → Celebração → Hoje
```

**Check-in** (bottom sheet): energia em 4 níveis + "Quanto tempo você tem agora?" (15 min / 30 min / 1h / 2h+).

| Energia | Degrau inicial sugerido |
|---|---|
| 1. Baixa | Aquecer |
| 2. Média | Desafio mental |
| 3. Alta | Micro-passo |
| 4. Elétrico | Foco |

**Escada:** 5 degraus (Aquecer, Desafio mental, Micro-passo, Foco, Registrar).
- O degrau sugerido aparece marcado com "Sugerido pra você".
- Qualquer degrau é clicável e o fluxo começa a partir dele; os anteriores ficam como "pulados".
- Cada degrau tem "Trocar" (3 alternativas) e "Pular pra tarefa" (vai ao micro-passo).

**Degraus:**
- **Aquecer:** atividade curta com timer (alongamento, caminhada, tarefa leve).
- **Desafio mental:** 5 contas de cabeça com feedback imediato.
- **Micro-passo:** instrução mínima da etapa real + botão "Feito!".
- **Foco:** timer (25 min por padrão), Broto de óculos, botões Pausar / Encerrar / **Pedir ajuda**, toggle de bloquear apps.

**Pedir ajuda:**
1. Pausa o timer e salva o tempo focado ("Você já focou 10 min, isso conta!").
2. Mostra a mensagem acolhedora do Broto.
3. Reabre o check-in.
4. Mostra a escada com o degrau sugerido.
5. Ao chegar no Foco, retoma a mesma etapa, somando o tempo anterior.

Há também a opção "Voltar ao foco".

**Registrar:** Concluí / Parcial (slider de %) / Não rolou. Em seguida vem a celebração com gotas, XP e o toast "Plano recalculado", e a barra da Home é atualizada.

## 4. Novo objetivo

**Chat com IA (padrão):**
- Barra de entrada: clipe (anexar arquivo, PDF, foto ou link), campo de texto, microfone/enviar.
- O Broto analisa (checklist: lendo, prazo encontrado, quebrando em etapas) e devolve o card de etapas editáveis com o tempo e o total.
- Botão "Encaixar no meu calendário".

**Preencher à mão** (botão no topo do chat):
- Título, tempo estimado e prazo (seletor de calendário mensal).
- "Quando fazer?": "Deixar a IA encaixar" (padrão) ou "Escolher dia e horário" (calendário + hora).
- Salvar leva ao calendário com a tarefa alocada.

**Exemplo de referência:** "Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11" vira 7 etapas, com total de 8h15:
1. Ler o enunciado e listar requisitos (30 min)
2. Revisar Bubble, Merge e Quick Sort (1h)
3. Implementar Bubble Sort (45 min)
4. Implementar Merge Sort (1h30)
5. Implementar Quick Sort (1h30)
6. Rodar testes e medir os tempos (1h)
7. Escrever o relatório com gráficos (2h)

## 5. Calendário

**Alocação:** as etapas vão para os horários livres, respeitando o limite diário e a soma de todos os objetivos, e deixando folga antes do prazo. A tela mostra o resumo "8h15 encaixadas em 6 dias · folga de 1 dia".

**Execução / Prazos** (controle no canto superior direito, mobile e web):
- **Execução:** mostra as etapas quebradas de cada objetivo.
- **Prazos:** mostra só a entrega final de cada objetivo (bandeira, cor do objetivo e %).

**Mobile:**
- Abre numa semana compacta: 7 dias com bolinhas coloridas por objetivo e, abaixo, a lista do dia selecionado.
- Arrastar para baixo expande para o mês; arrastar para cima recolhe.

**Web:**
- Toggle Dia / Semana / Mês.
- Horários ocupados hachurados e horários livres em verde-claro.
- Os blocos podem ser arrastados para outro horário livre; soltar num horário ocupado é bloqueado.
- Clicar num bloco abre o painel lateral.

**Detalhe de um bloco:** Começar agora (vai à rampa), Mover, Marcar parcial e "Não vou conseguir".

**Recálculo:**
- "Não vou conseguir" ou "Não rolou" reorganiza as etapas seguintes ("Reorganizei pra você", folga atualizada).
- Adiantar uma etapa mostra "Você ganhou 1 dia de folga 🎉".

**Plano inviável:** o Broto aparece preocupado, com "Faltam 2h até 24/11" e as opções "Aumentar limite diário", "Usar o sábado inteiro" e "Reduzir escopo", cada uma com a prévia no calendário.

## 6. Objetivo e trilha

**Lista de objetivos:** cada um com a % concluída. Tocar num objetivo abre a trilha.

**Trilha:**
- Cabeçalho com prazo, anel de % e "X de Y etapas · folga".
- Etapas em ordem até a bandeira da entrega, cada uma com data, horário e tempo estimado; as concluídas têm ✓.

**Editar trilha (mobile e web):**
- Marcar ou desmarcar como concluída (nos dois sentidos).
- Adicionar, editar, reordenar e excluir etapas (a exclusão pede confirmação na própria tela).
- Salvar atualiza a % e recalcula o plano. No web, Cancelar descarta as alterações.

## 7. Perfil e Jardim

**Jardim:** Broto no estágio atual, nível/XP, heatmap da sequência, conquistas e loja (cosméticos e Guarda-chuva por 50 gotas).

**Menu do perfil** (botão no topo da Hoje e do Jardim): dados do perfil + Configurações:
- Redefinir minha rotina
- Idioma (PT-BR / EN / ES)
- Enviar sugestão (campo de texto + print opcional + e-mail de contato visível)
- Tema claro/escuro

## 8. E-mail diário (Resend)

"Seu plano de hoje, [nome]": Broto, etapas com horário, 1 tarefa leve, sequência atual e o botão "Vamos começar?", que abre a rampa.

## 9. Web: estrutura

- Landing page: hero, como funciona, rampa, para quem trava, e-mail diário, FAQ, CTA final.
- Web app com sidebar de 240px: Hoje, Calendário, Objetivos, Tarefas leves, Jardim, Configurações.
- Estado compartilhado: concluir uma etapa atualiza a Hoje, o calendário, a % do objetivo e a barra gamificada.
