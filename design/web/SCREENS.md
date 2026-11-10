# Telas — web (Next.js)

Fonte: `design/web/source/` (zip "Design system Bora web"). Capturas em `design/web/screens/`, 1440×900, página inteira. Origem da navegação: `Bora Landing Web.dc.html` → **Entrar** → `Bora App.dc.html#login` (o web app; o `Bora App.dc.html` desta pasta **não** é o mesmo arquivo do mobile).

UC = `docs/0-casos-de-uso.md` · Fluxo = seção de `docs/0-fluxos.md`.

| # | Tela | O que mostra | Ação que leva a ela | UC | Fluxo |
|---|---|---|---|---|---|
| 01 | Landing | Hero "Pare de adiar", rampa interativa, check-in de energia, tarefas leves, e-mail diário, FAQ, CTA | Abrir `Bora Landing Web.dc.html` | — | §9 |
| 02 | Landing (mobile) | A mesma landing em layout de celular, dentro de um canvas | Link "Ver versão mobile →" | — | §9 |
| 03 | Login | E-mail e senha, "Criar conta", **"Entrar direto como Arthur (demo)"** | "Entrar" na landing | UC29 | — |
| 04 | Cadastro | Nome, e-mail, senha, "Pular e ver o onboarding (demo)" | "Criar conta" no login | UC29 | — |
| 05 | Onboarding 1 — boas-vindas | Chat com o Broto, passo 1 de 4 | Concluir o cadastro (ou "Pular…") | UC01 | §1 |
| 06 | Onboarding 1b — "Me conta mais" | Resposta alternativa do Broto | "Me conta mais" | UC01 | §1 |
| 07 | Onboarding 2 — horários livres | Grade seg–dom × 08h–22h; aula e estágio já marcados como ocupados; pintar arrastando | "Bora!" | UC01 | §1 |
| 08 | Onboarding 2b — sugestão do Broto | Grade preenchida com a sugestão | "Usar sugestão do Broto" | UC01 | §1 |
| 09 | Onboarding 3 — limite diário | Seletor de horas por dia | "Pronto, esses são meus horários" | UC01 | §1 |
| 10 | Onboarding 4 — pronto | "Bora pro seu dia?" | "Esse é meu limite" | UC01 | §1 |
| 11 | Primeiro Hoje (fim do onboarding) | Idêntica à 12 | "Ir pro meu dia" | UC06 | §1→§2 |
| 12 | Hoje | Saudação, "Vamos começar?", timeline do dia (aula/estágio/etapas), coluna direita com check-in de energia, objetivos e conquistas | "Entrar direto como Arthur (demo)" ou "Hoje" na sidebar | UC06 | §2 |
| 13 | Hoje — energia baixa | Broto sonolento, rampa leve, tarefas leves sugeridas | Chip "Baixa" | UC14, UC13 | §2/§3 |
| 14 | Hoje — energia alta | "Direto pro desafio" | Chip "Alta" | UC14 | §3 |
| 15 | Calendário — semana, Execução | Grade semanal com ocupado hachurado, livre em verde, blocos por objetivo, "3h de 3h" por dia | "Calendário" na sidebar | UC07 | §5 |
| 16 | Calendário — detalhe do bloco | Painel lateral: horário, gotas, objetivo, "Começar agora", "Mover", "Marcar parcial", "Não vou conseguir" | Clicar num bloco | UC07, UC08, UC09 | §5 |
| 17 | Calendário — semana, Prazos | Só as entregas | "Prazos" | UC07 | §5 |
| 18 | Calendário — mês, Prazos | Mês com entregas | "Mês" | UC07 | §5 |
| 19 | Calendário — mês, Execução | Mês com etapas | "Execução" | UC07 | §5 |
| 20 | Calendário — dia | Um dia | "Dia" | UC07 | §5 |
| 21 | Objetivos | Lista com prazo, % e folga | "Objetivos" na sidebar | UC12 | §6 |
| 22 | Trilha do objetivo | Anel de %, etapas até a entrega, "Começar próxima etapa", "Editar trilha" | Clicar num objetivo | UC10 | §6 |
| 23 | Editar trilha | Concluir/pendente, ±15 min, excluir, adicionar, Salvar/Cancelar | "Editar trilha" | UC10 | §6 |
| 24 | Tarefas leves | Campo de nova tarefa + lista com duração e +3 | "Tarefas leves" na sidebar | UC13 | — |
| 25 | Jardim | Broto, nível/XP, dias regados, conquistas, loja (guarda-chuva 50 gotas) | "Jardim" na sidebar | UC25 | §7 |
| 26 | Configurações | Tema, redefinir rotina (grade), e-mail diário, sair | "Configurações" na sidebar | UC32, UC01, UC23 | §7 |
| 27 | Novo objetivo — escrever | Modal com abas Escrever/Colar link e "Analisar com IA" | "Novo objetivo" na sidebar | UC02 | §4 |
| 28 | Novo objetivo — colar link | Campo de link | Aba "Colar link" | UC03 | §4 |
| 29 | Novo objetivo — analisando | "IA analisando…" com skeleton | "Analisar com IA" | UC02 | §4 |
| 30 | Novo objetivo — etapas sugeridas | Etapas editáveis com tempo e total, "Encaixar no meu calendário" | Espera da análise | UC04 | §4 |
| 31 | Objetivo encaixado | Calendário com o novo objetivo (cor roxa) e aviso "Encaixei 7 etapas… Folga de 1 dia" | "Encaixar no meu calendário" | UC05 | §4→§5 |
| 32 | Rampa 1 — aquecer | Modal com escada de 5 degraus, "Trocar", "Pular", "Concluí o degrau", velocidade de demo | "Vamos começar?" no Hoje | UC15, UC16 | §3 |
| 33 | Rampa 1b — trocar atividade | Alternativas do degrau | "Trocar" | UC19 | §3 |
| 34 | Rampa 2 — desafio mental | Contas de cabeça | "Concluí o degrau" | UC17 | §3 |
| 35 | Rampa 3 — micro-passo | Instrução mínima da etapa | "Concluí o degrau" | UC18 | §3 |
| 36 | Rampa 4 — foco | Timer, "Pausar", "Terminar foco" | "Concluí o degrau" | UC20 | §3 |
| 37 | Rampa 4b — foco pausado | Timer pausado | "Pausar" | UC22 | §3 |
| 38 | Rampa 5 — registrar | "Concluí / Parcial / Não rolou" | "Terminar foco" | UC21, UC08 | §3 |
| 39 | Registrar — parcial | Slider de % | "Parcial" | UC08 | §3 |
| 40 | Registrar — não rolou | Mensagem sem culpa + recálculo | "Não rolou" | UC08, UC09 | §3/§5 |
| 41 | Celebração | "+20 gotas", XP, objetivo em 81%; ao fundo o Hoje já recalculado | "Concluí" | UC21, UC09 | §3 |
| 42 | Componente Broto | Mascote isolado | Abrir `Broto.dc.html` | — | — |
| 43 | Componente grade de disponibilidade | Grade de horários com "Limpar" e "Usar sugestão" | Abrir `AvailGrid.dc.html` | UC01 | §1 |
| 44 | Componente celular da rampa | Mockup de celular usado na landing | Abrir `PhoneRampa.dc.html` | — | §9 |

## Observações

- **Existe web app completo além da landing:** login, cadastro, onboarding, Hoje, Calendário (dia/semana/mês × Execução/Prazos), Objetivos/trilha/edição, Tarefas leves, Jardim, Configurações e os modais Novo objetivo e Rampa. Os arquivos `App*.dc.html`, `Modal*.dc.html` e `AvailGrid.dc.html` são os componentes que o `Bora App.dc.html` monta.
- **Não há na web:** "Preencher à mão" no Novo objetivo (UC30), "Pedir ajuda" no foco (UC31), plano inviável com opções (UC11; só o aviso "Não cabe"), idioma e enviar sugestão (UC32 parcial).
- O check-in de energia da web tem **3 níveis** e fica no Hoje, diferente do `0-fluxos.md` (4 níveis, só dentro da rampa). Ver `design/tokens.md`.
- Nas telas com modal, a captura de página inteira mostra o fundo escurecido só na área visível (efeito do `position: fixed`).
- `Bora App-print.dc.html` e `Bora Landing Web-print.dc.html` são versões para impressão e não foram capturadas. `Bora Landing Web.html` (15 MB) é a landing exportada em arquivo único e é **idêntica** à cópia que já estava em `design/web/`.
