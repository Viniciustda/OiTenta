/// Dados de exemplo do protótipo (`design/mobile/app/source/bora-data.js`),
/// usados pelos repositórios de exemplo de cada feature (`features/*/data`).
///
/// O "hoje" do protótipo é quinta, 6/11/2025 (`TODAY`).
class BoraSample {
  const BoraSample._();

  static final today = DateTime(2025, 11, 6, 9, 41);

  static const demoUser = {
    'id': 'user-demo',
    'name': 'Arthur',
    'email': 'arthur@bora.app',
    'timezone': 'America/Sao_Paulo',
  };

  /// Objetivos ativos (DATA `OBJ`, `ENTREGA`, `TRILHAS` 1–3). Os títulos
  /// curtos são os do protótipo nas listas (M01, M02, M03).
  static const goals = [
    {
      'id': 'goal-eng',
      'title': 'Eng. de Software',
      'deadline': '2025-11-20',
      'colorIndex': 1,
      'slackDays': 2,
      'trail': 1,
    },
    {
      'id': 'goal-calc',
      'title': 'Cálculo II',
      'deadline': '2025-11-27',
      'colorIndex': 2,
      'slackDays': 3,
      'trail': 2,
    },
    {
      'id': 'goal-port',
      'title': 'Portfólio no GitHub',
      'deadline': null,
      'colorIndex': 3,
      'slackDays': null,
      'trail': 3,
    },
  ];

  /// DATA `TRILHAS`: [título, mês (1–12), dia, hora decimal, duração em horas, feita].
  static const trails = <int, List<List<Object>>>{
    1: [
      ['Ler o enunciado com o grupo', 10, 29, 10.0, 1.0, true],
      ['Dividir as tarefas', 10, 30, 10.0, .5, true],
      ['Glossário do sistema', 10, 31, 14.0, 1.0, true],
      ['Levantar requisitos', 11, 3, 10.0, 2.0, true],
      ['Casos de uso: atores', 11, 4, 9.0, 1.5, true],
      ['Diagrama de casos de uso', 11, 6, 10.0, 1.5, false],
      ['Diagrama de classes', 11, 7, 10.0, 2.0, false],
      ['Protótipo das telas', 11, 8, 15.0, 1.5, false],
    ],
    2: [
      ['Lista 2: substituição', 11, 3, 14.0, 1.5, true],
      ['Revisar integrais', 11, 5, 15.0, 1.0, true],
      ['Lista 3: integrais por partes', 11, 6, 14.0, 1.0, false],
      ['Lista 3: questões 6 a 10', 11, 7, 16.0, 1.5, false],
      ['Resumo de técnicas de integração', 11, 8, 10.0, 2.0, false],
      ['Lista 4: frações parciais', 11, 11, 14.0, 1.5, false],
      ['Simulado da P2', 11, 15, 14.0, 1.5, false],
      ['Resolver provas antigas', 11, 25, 14.0, 1.5, false],
    ],
    3: [
      ['Escolher os projetos', 11, 4, 19.0, 1.0, true],
      ['README do projeto de Compiladores', 11, 6, 19.0, .75, false],
      ['Organizar o perfil do GitHub', 11, 9, 17.0, 1.0, false],
      ['README do projeto de Grafos', 11, 16, 17.0, 1.0, false],
      ['Deploy do site pessoal', 11, 23, 17.0, 1.0, false],
      ['Atualizar o currículo no perfil', 11, 30, 17.0, 1.0, false],
      ['Gravar a demo do app de Compiladores', 12, 7, 17.0, 1.0, false],
      ['Escrever um post sobre o projeto', 12, 14, 17.0, 1.0, false],
      ['Fixar os 6 melhores repositórios', 12, 21, 17.0, .5, false],
      ['Revisão final do portfólio', 12, 28, 17.0, 1.0, false],
    ],
  };

  /// Progresso parcial das etapas de hoje (estado inicial `et` do protótipo:
  /// "40% · continua de ontem").
  static const partialProgress = {'Diagrama de casos de uso': 40};

  /// Micro-passos das etapas de hoje (DATA `ETAPAS[].micro`).
  static const microSteps = {
    'Diagrama de casos de uso': [
      'Abra o arquivo do trabalho e escreva o título',
      'Liste 3 atores do sistema',
      'Copie o enunciado pro topo do arquivo',
      'Desenhe só o retângulo do sistema',
    ],
    'Lista 3: integrais por partes': [
      'Abra a Lista 3 e leia a questão 1',
      'Escreva a fórmula da integração por partes',
      'Separe caderno, lápis e calculadora',
      'Copie o enunciado da questão 1',
    ],
    'README do projeto de Compiladores': [
      'Abra o repositório e crie o README.md',
      'Escreva o nome do projeto e uma frase',
      'Tire um print do projeto rodando',
      'Liste 3 tecnologias que você usou',
    ],
  };

  /// Semana de 3 a 9/11 (DATA `WEEK`, com a quinta trocada pelas `ETAPAS`):
  /// [dia, hora decimal, duração em horas, trilha, título, feito].
  static const week = <List<Object>>[
    [3, 10.0, 2.0, 1, 'Levantar requisitos', true],
    [3, 14.0, 1.5, 2, 'Lista 2: substituição', true],
    [4, 9.0, 1.5, 1, 'Casos de uso: atores', true],
    [4, 19.0, 1.0, 3, 'Escolher os projetos', true],
    [5, 10.0, 1.0, 1, 'Diagrama de casos de uso', true],
    [5, 15.0, 1.0, 2, 'Revisar integrais', true],
    [6, 10.0, 1.5, 1, 'Diagrama de casos de uso', false],
    [6, 14.0, 1.0, 2, 'Lista 3: integrais por partes', false],
    [6, 19.0, .75, 3, 'README do projeto de Compiladores', false],
    [7, 10.0, 2.0, 1, 'Diagrama de classes', false],
    [7, 16.0, 1.5, 2, 'Lista 3: questões 6 a 10', false],
    [8, 10.0, 2.0, 2, 'Resumo de técnicas de integração', false],
    [8, 15.0, 1.5, 1, 'Protótipo das telas', false],
    [9, 17.0, 1.0, 3, 'Organizar o perfil do GitHub', false],
  ];

  /// Tarefas leves da timeline do Hoje (DATA `LEVES` "grupo" e "material").
  static const lightTasks = [
    {
      'id': 'grupo',
      'title': 'Responder o grupo do trabalho',
      'subtitle': '10 min · ideal p/ energia baixa',
      'time': '11:30',
    },
    {
      'id': 'material',
      'title': 'Separar o material da prova',
      'subtitle': '15 min · bom entre etapas',
      'time': '16:00',
    },
  ];

  /// Limite diário do usuário demo (o "Máximo por dia" do protótipo, 4h).
  static const dailyLimitMinutes = 240;

  /// DATA `ALTS.aquecer`.
  static const warmups = [
    {
      'title': 'Alongamento de 3 min',
      'label': '3 min',
      'seconds': 180,
      'desc': 'Ombros, pescoço e braços. Sem sair da cadeira.',
      'icon': 'person-simple-walk',
      'steps': [
        'Gire os ombros pra trás, devagar',
        'Incline a cabeça pra cada lado',
        'Estique os braços pro alto e solte o ar',
      ],
    },
    {
      'title': 'Água e 5 respirações',
      'label': '2 min',
      'seconds': 120,
      'desc': 'Um copo d’água e respiração lenta.',
      'icon': 'drop',
      'steps': [
        'Pegue um copo d’água',
        'Beba sem pressa',
        'Faça 5 respirações contando até 4',
      ],
    },
    {
      'title': 'Arrumar a mesa',
      'label': '3 min',
      'seconds': 180,
      'desc': 'Deixa só o que você vai usar agora.',
      'icon': 'broom',
      'steps': [
        'Tire da mesa o que não é do trabalho',
        'Deixe o notebook e um caderno',
        'Vire o celular pra baixo',
      ],
    },
    {
      'title': 'Volta pela casa',
      'label': '2 min',
      'seconds': 120,
      'desc': 'Levanta, anda um pouco e volta.',
      'icon': 'person-simple-walk',
      'steps': [
        'Levante da cadeira',
        'Ande até a janela ou a cozinha',
        'Volte e sente com os pés no chão',
      ],
    },
    {
      'title': 'Tarefa leve de 5 min',
      'label': '5 min',
      'seconds': 300,
      'desc': 'Renomear os PDFs de Cálculo. Só isso.',
      'icon': 'broom',
      'steps': [
        'Abra a pasta de Cálculo',
        'Renomeie os PDFs com o número da lista',
        'Feche a pasta e respire fundo',
      ],
    },
  ];

  /// DATA `ALTS.desafio` + `PROBS`.
  static const challenges = [
    {
      'title': '5 contas de soma',
      'desc': 'Tipo 17 + 26',
      'problems': [
        [17, 26, '+'],
        [38, 15, '+'],
        [54, 29, '+'],
        [23, 48, '+'],
        [66, 17, '+'],
      ],
    },
    {
      'title': '5 contas de subtração',
      'desc': 'Tipo 52 − 17',
      'problems': [
        [52, 17, '−'],
        [81, 36, '−'],
        [64, 28, '−'],
        [93, 45, '−'],
        [70, 23, '−'],
      ],
    },
    {
      'title': '5 contas de tabuada',
      'desc': 'Tipo 7 × 8',
      'problems': [
        [7, 8, '×'],
        [6, 9, '×'],
        [8, 4, '×'],
        [9, 7, '×'],
        [12, 6, '×'],
      ],
    },
    {
      'title': '5 contas misturadas',
      'desc': 'Soma, subtração e tabuada',
      'problems': [
        [17, 26, '+'],
        [64, 28, '−'],
        [7, 8, '×'],
        [38, 15, '+'],
        [81, 36, '−'],
      ],
    },
  ];

  /// DATA `ALTS.foco`.
  static const focus = [
    {'title': 'Foco de 25 min', 'min': 25, 'desc': 'O padrão da rampa'},
    {
      'title': 'Foco de 15 min',
      'min': 15,
      'desc': 'Pra quando o tempo tá curto',
    },
    {'title': 'Foco de 10 min', 'min': 10, 'desc': 'Só pra destravar'},
    {'title': 'Foco de 45 min', 'min': 45, 'desc': 'Se a energia tá alta'},
  ];

  /// Micro-passo genérico quando a etapa não tem micro-passos (P6, provisório).
  static const genericMicroStep =
      'Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase.';

  /// Barra gamificada (estado inicial do protótipo; P18).
  static const gamification = {
    'streak': 6,
    'drops': 340,
    'level': 7,
    'xp': 410,
    'levelXp': 480,
  };

  /// Celebração (M12; `jump('celebra')` do protótipo; P18).
  static const celebrationDone = {
    'drops': 20,
    'level': 7,
    'xpBefore': 410,
    'xpAfter': 435,
    'levelXp': 480,
    'focusXp': 25,
  };
  static const celebrationPartial = {
    'drops': 10,
    'level': 7,
    'xpBefore': 410,
    'xpAfter': 435,
    'levelXp': 480,
    'focusXp': 25,
  };
}
