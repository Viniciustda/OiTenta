# OiTenta

**Um planejamento que acompanha a vida real e ajuda a dar o próximo passo.**

> Nome provisório. Projeto em fase de concepção para o Hack Brasil 2026. As funcionalidades abaixo representam a proposta inicial e serão discutidas pela equipe antes da implementação.

## Por que estamos criando o OiTenta

Saber o que precisa ser feito nem sempre é suficiente para conseguir começar. Às vezes, as tarefas se acumulam, escolher por onde seguir fica difícil e o celular acaba virando uma fuga, mesmo quando a pessoa gostaria de estar fazendo outra coisa.

O OiTenta nasce para ajudar quem quer mudar essa rotina e encontra dificuldade para transformar intenção em ação. A proposta é diminuir o esforço de organizar o dia, construir planos possíveis de cumprir e oferecer apoio quando a pessoa se sentir travada.

A ideia combina um calendário adaptativo com IA, apoio para iniciar e retomar atividades e, na visão completa, recursos de gamificação e controle de distrações.

## Dois calendários, uma rotina

O planejamento parte da separação entre o prazo de uma tarefa e o tempo reservado para realizá-la.

| Calendário | O que representa |
| --- | --- |
| **Prazos** | Até quando cada tarefa precisa estar concluída. |
| **Execução** | Quando a pessoa pretende trabalhar em cada tarefa e quanto tempo reservar para cada sessão. |

Uma tarefa pode ocupar vários blocos de execução antes do prazo. A intenção é permitir que a pessoa consulte o plano do dia e encontre um próximo passo claro, sem precisar reorganizar mentalmente todas as suas obrigações.

## Como imaginamos o funcionamento

1. **Conversar com a IA:** informar uma tarefa por mensagem ou voz, incluindo o prazo e o contexto disponível.
2. **Transformar o pedido em planejamento:** identificar a atividade, estimar o esforço e esclarecer informações que estiverem faltando.
3. **Distribuir a execução:** reservar blocos no calendário considerando disponibilidade, compromissos, prioridades e complexidade.
4. **Acompanhar o que aconteceu:** registrar início, pausas, retomadas e conclusão, além de permitir informar atrasos ou dificuldades.
5. **Reorganizar quando necessário:** ajustar os blocos diante de imprevistos, novas tarefas ou atividades que levaram mais tempo.
6. **Aprender com a rotina:** melhorar as próximas estimativas a partir do histórico e do retorno da pessoa.

O usuário poderá revisar o planejamento e informar mudanças. O replanejamento deverá respeitar compromissos fixos e tornar claras as alterações sugeridas.

### Um planejamento realista

A IA deverá considerar:

- O tempo que a pessoa costuma gastar em atividades semelhantes.
- A diferença entre tempo de execução, pausas e interrupções.
- A complexidade das tarefas e o esforço acumulado ao longo do dia.
- Intervalos entre atividades e pausas durante sessões mais longas.
- A possibilidade de dividir uma tarefa em etapas menores.
- Margens para imprevistos, sem preencher automaticamente todo horário livre.
- Prazos que não cabem na disponibilidade, sinalizando a necessidade de priorizar ou rever o plano.

As primeiras estimativas poderão partir das informações fornecidas pela pessoa e ser ajustadas com o uso. O histórico deverá ajudar a adaptar o planejamento, sem transformar um dia difícil em uma regra permanente sobre seu desempenho.

## Quando a pessoa disser “travei”

O aplicativo deverá oferecer uma forma simples de pedir ajuda para começar ou retomar uma atividade.

Dependendo do contexto, a IA poderá sugerir um primeiro passo menor, antecipar uma tarefa mais leve ou propor uma breve atividade de transição, como uma caminhada curta, alguns minutos de leitura ou um exercício simples. Essas sugestões deverão ter duração delimitada e um próximo passo para retomar o planejamento.

Por exemplo: diante de uma tarefa A difícil, uma B intermediária e uma C simples, o aplicativo poderá sugerir começar por C para ganhar ritmo, desde que isso não comprometa uma prioridade ou um prazo próximo. Outra opção será reduzir A a uma primeira ação que pareça possível naquele momento.

O objetivo é apoiar a retomada da concentração e de um ritmo de trabalho. As estratégias serão hipóteses a testar com usuários, respeitando que pessoas e situações diferentes podem precisar de abordagens diferentes.

## Visão completa do aplicativo

Além do calendário, queremos explorar:

- **Gamificação:** progresso e moedas conquistadas ao concluir atividades.
- **Controle de distrações:** bloqueio de aplicativos escolhidos pela própria pessoa, mediante adesão e permissões necessárias.
- **Liberação por moedas:** uso das moedas para liberar acesso temporário aos aplicativos bloqueados.
- **Recompensas adaptativas:** valores das atividades e custos de liberação definidos e ajustados pelo sistema com IA, considerando esforço, duração e histórico. A pessoa não escolherá livremente esses valores; os critérios deverão ser claros.
- **Incentivos personalizados:** mensagens que ajudem a iniciar, continuar ou retomar uma atividade, com frequência e tom adequados à pessoa.
- **Aprendizado contínuo:** ajustes nas estimativas e nas sugestões conforme a rotina evolui.

A experiência deverá ser simples, bonita e confortável no celular, com acesso também pelo computador, possivelmente por uma versão web. Queremos reduzir a quantidade de decisões necessárias para começar uma tarefa e permitir retomadas sem culpa ou cobranças excessivas.

## Escopo inicial para o hackathon

A prioridade é entregar o **calendário com planejamento adaptativo por IA**.

O escopo inicial proposto inclui:

- Cadastro de tarefas e prazos por mensagem.
- Visualização dos prazos e dos blocos de execução.
- Distribuição das tarefas em um plano diário realista.
- Registro de conclusão, pausas e necessidade de mais tempo.
- Replanejamento diante de atrasos e novas tarefas.
- Ajuste inicial das estimativas com base no tempo informado ou registrado.
- Interface adequada ao uso no celular e no computador.

Entrada por voz, apoio mais elaborado ao “travei”, gamificação, moedas e bloqueio de aplicativos poderão ser incorporados conforme o tempo e a viabilidade. A escolha das tecnologias, das integrações e do uso de Firecrawl, Resend e Devin será discutida pela equipe.

## Referências e construção em equipe

As referências iniciais são o Unrot e a organização pessoal no Notion que separa calendário de prazos e calendário de execução. Essas referências servem como ponto de partida para uma experiência própria.

A equipe tem quatro integrantes e fará reuniões semanais para discutir propostas, definir prioridades e acompanhar a evolução do projeto. Neste momento, o foco é alinhar a visão do aplicativo antes de começar a implementar.
- [ ] Separar o essencial para o hackathon das ideias para versões futuras.
- [ ] Levar a proposta, referências e dúvidas para a discussão em equipe.
