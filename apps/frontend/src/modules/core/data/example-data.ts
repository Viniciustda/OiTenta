// Dados de exemplo do protótipo web (design/web/source/Bora App.dc.html, initState e plan()).
// O "hoje" do protótipo é segunda, 16/11/2026, 19:40 em São Paulo (UTC−3, sem horário de verão).
// Os blocos abaixo são a saída do plan() do protótipo para os 3 objetivos, a grade padrão e 3h por dia.

export const DEMO_USER = {
  id: "user-arthur",
  name: "Arthur",
  email: "arthur@faculdade.edu.br",
  password: "bora1234",
  timezone: "America/Sao_Paulo",
};

export const DEMO_TODAY = "2026-11-16";

/** Data local do dia d do protótipo (dia 0 = 16/11/2026). */
export const protoDate = (day: number) => new Date(Date.UTC(2026, 10, 16 + day)).toISOString().slice(0, 10);

/** Instante UTC de um horário local de São Paulo (UTC−3). */
export const saoPauloInstant = (date: string, minute: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minute + 180)).toISOString();
};

type ProtoStep = [id: string, title: string, minutes: number, done?: 1];

export interface ExampleGoalSeed {
  id: string;
  title: string;
  /** Nome curto do protótipo, usado nos textos da rampa de exemplo. */
  short: string;
  deadline: string;
  colorIndex: number;
  progressPct: number;
  slackDays: number;
  challenge: string;
  steps: ProtoStep[];
}

export const DEMO_GOALS: ExampleGoalSeed[] = [
  {
    id: "goal-eng",
    title: "Trabalho de Eng. Software",
    short: "Eng. Software",
    deadline: protoDate(4),
    colorIndex: 1,
    progressPct: 62,
    slackDays: 2,
    challenge: "Em uma frase: quem usa o sistema e pra quê?",
    steps: [
      ["e1", "Definir escopo", 45, 1],
      ["e2", "Levantar requisitos", 90, 1],
      ["e3", "Modelar classes", 90, 1],
      ["e4", "Protótipo das telas", 75, 1],
      ["e5", "Diagrama de casos de uso", 90],
      ["e6", "Revisar documento", 60],
      ["e7", "Montar PDF final", 30],
    ],
  },
  {
    id: "goal-calc",
    title: "Prova de Cálculo II",
    short: "Cálculo II",
    deadline: protoDate(11),
    colorIndex: 2,
    progressPct: 25,
    slackDays: 6,
    challenge: "Derive x·eˣ de cabeça. Vale chutar.",
    steps: [
      ["c1", "Revisar derivadas", 60, 1],
      ["c2", "Integrais imediatas", 60, 1],
      ["c3", "Substituição", 60, 1],
      ["c4", "Lista de integrais por partes", 45],
      ["c5", "Frações parciais", 90],
      ["c6", "Integrais trigonométricas", 90],
      ["c7", "Lista de áreas", 75],
      ["c8", "Simulado 1", 90],
      ["c9", "Revisar erros do simulado", 90],
      ["c10", "Simulado 2", 60],
    ],
  },
  {
    id: "goal-port",
    title: "Portfólio",
    short: "Portfólio",
    deadline: protoDate(19),
    colorIndex: 3,
    progressPct: 20,
    slackDays: 14,
    challenge: "Qual projeto te deixa mais orgulhoso? Por quê?",
    steps: [
      ["p1", "Escolher projetos", 60, 1],
      ["p2", "Escrever o case do app", 45],
      ["p3", "Fotos e prints", 60],
      ["p4", "Montar a página", 90],
      ["p5", "Revisão com um amigo", 30],
      ["p6", "Publicar", 15],
    ],
  },
];

/** [dia, minuto local de início, duração, id da etapa] — saída do plan() do protótipo. */
export const DEMO_BLOCKS: [number, number, number, string][] = [
  [0, 1200, 90, "e5"],
  [0, 1290, 45, "c4"],
  [0, 1335, 45, "p2"],
  [1, 1200, 60, "e6"],
  [1, 1260, 90, "c5"],
  [1, 1350, 30, "p3"],
  [2, 1200, 30, "e7"],
  [2, 1230, 90, "c6"],
  [2, 1320, 30, "p3"],
  [2, 1350, 30, "c7"],
  [3, 1200, 45, "c7"],
  [3, 1245, 90, "p4"],
  [3, 1335, 45, "c8"],
  [4, 1200, 45, "c8"],
  [4, 1245, 30, "p5"],
  [4, 1275, 90, "c9"],
  [5, 540, 60, "c10"],
  [5, 600, 15, "p6"],
];

/** Grade padrão do protótipo (AVDEF): seg–sex 20h–23h, sáb 9h–12h e 14h–18h, dom 14h–17h. */
export const DEMO_AVAILABILITY = {
  windows: [
    ...[0, 1, 2, 3, 4].map((weekday) => ({ weekday, startMinute: 1200, endMinute: 1380 })),
    { weekday: 5, startMinute: 540, endMinute: 720 },
    { weekday: 5, startMinute: 840, endMinute: 1080 },
    { weekday: 6, startMinute: 840, endMinute: 1020 },
  ],
  dailyLimitMinutes: 180,
};

// Textos da rampa do protótipo web (ModalRampa.dc.html), na ordem principal → alternativa ("Trocar").
export const RAMP_TEXTS = {
  warmup: (short: string) => [`Levanta, bebe uma água e abre o material de ${short}.`, "Arruma a mesa e deixa só o que vai usar."],
  challengeDefault: "Pra 10 itens, quem ganha: Bubble ou Merge? Chuta.",
  challengeAlt: "Explica o tema em voz alta, como se fosse pra um amigo.",
  micro: (stepTitle: string) => [`Abra o arquivo e escreva só o título: “${stepTitle}”.`, "Escreve três tópicos do que vai fazer. Só tópicos."],
};
