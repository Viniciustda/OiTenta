/// Nível de energia do check-in (P14): `low | medium | high | electric`.
enum EnergyLevel {
  low('low'),
  medium('medium'),
  high('high'),
  electric('electric');

  const EnergyLevel(this.api);

  final String api;
}

/// Tempo disponível agora (M05): `15m | 30m | 1h | 2h+`. Só é gravado (P15).
enum AvailableTime {
  m15('15m', '15 min'),
  m30('30m', '30 min'),
  h1('1h', '1h'),
  h2plus('2h+', '2h+');

  const AvailableTime(this.api, this.label);

  final String api;
  final String label;
}

/// Degraus da rampa, em ordem (modelagem 4.1).
enum RampStepKind {
  warmup('warmup'),
  challenge('challenge'),
  micro('micro'),
  focus('focus'),
  log('log');

  const RampStepKind(this.api);

  final String api;

  static RampStepKind fromApi(String v) =>
      RampStepKind.values.firstWhere((k) => k.api == v);
}

/// Conta do desafio mental: `{ a, b, op }` com `op` em `+ − ×`.
class ChallengeProblem {
  const ChallengeProblem({required this.a, required this.b, required this.op});

  final int a;
  final int b;
  final String op;

  int get answer => op == '+'
      ? a + b
      : op == '−'
      ? a - b
      : a * b;

  factory ChallengeProblem.fromJson(Map<String, dynamic> json) =>
      ChallengeProblem(
        a: json['a'] as int,
        b: json['b'] as int,
        op: json['op'] as String,
      );

  Map<String, dynamic> toJson() => {'a': a, 'b': b, 'op': op};
}

/// Opção de um degrau: `{id, title, durationLabel, durationSeconds, description, icon, steps?, problems?}`.
/// Opção de um degrau (`RampOption` de `ramp.types.ts`).
class RampOption {
  const RampOption({
    required this.id,
    required this.stepKind,
    required this.title,
    required this.durationLabel,
    required this.durationSeconds,
    required this.description,
    required this.icon,
    this.steps = const [],
    this.operation,
    this.problems = const [],
  });

  final String id;
  final RampStepKind stepKind;
  final String title;
  final String durationLabel;
  final int? durationSeconds;
  final String description;
  final String icon;
  final List<String> steps;

  /// Operação do desafio: `+ | − | × | mix` (só no degrau `challenge`).
  final String? operation;
  final List<ChallengeProblem> problems;

  factory RampOption.fromJson(Map<String, dynamic> json) => RampOption(
    id: json['id'] as String,
    stepKind: RampStepKind.fromApi(json['stepKind'] as String),
    operation: json['operation'] as String?,
    title: json['title'] as String,
    durationLabel: json['durationLabel'] as String,
    durationSeconds: json['durationSeconds'] as int?,
    description: json['description'] as String,
    icon: json['icon'] as String,
    steps: ((json['steps'] as List?) ?? const []).cast<String>(),
    problems: ((json['problems'] as List?) ?? const [])
        .map((p) => ChallengeProblem.fromJson(p as Map<String, dynamic>))
        .toList(),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'stepKind': stepKind.api,
    'title': title,
    'durationLabel': durationLabel,
    if (durationSeconds != null) 'durationSeconds': durationSeconds,
    'description': description,
    'icon': icon,
    if (steps.isNotEmpty) 'steps': steps,
    if (operation != null) 'operation': operation,
    if (problems.isNotEmpty)
      'problems': problems.map((p) => p.toJson()).toList(),
  };
}

/// Um degrau com as suas opções.
class RampStep {
  const RampStep({required this.kind, required this.options});

  final RampStepKind kind;
  final List<RampOption> options;

  factory RampStep.fromJson(Map<String, dynamic> json) => RampStep(
    kind: RampStepKind.fromApi(json['kind'] as String),
    options: (json['options'] as List)
        .map((o) => RampOption.fromJson(o as Map<String, dynamic>))
        .toList(),
  );
}

/// `GET /activation/ramp`: `{ steps[5], suggested }`.
class Ramp {
  const Ramp({required this.steps, required this.suggested});

  final List<RampStep> steps;
  final RampStepKind suggested;

  RampStep step(RampStepKind kind) => steps.firstWhere((s) => s.kind == kind);

  factory Ramp.fromJson(Map<String, dynamic> json) => Ramp(
    steps: (json['steps'] as List)
        .map((s) => RampStep.fromJson(s as Map<String, dynamic>))
        .toList(),
    suggested: RampStepKind.fromApi(json['suggested'] as String),
  );
}
