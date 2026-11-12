/// Resposta do assistente do novo objetivo (decisão 4f: `parseGoal` +
/// `suggestSteps`; contrato em `docs/4-contrato-api.md` §3,
/// `POST /goals/assistant/draft`): título, prazo (se o usuário informou) e
/// etapas com tempo. O usuário sempre confere e edita na tela de etapas antes
/// de salvar.
class GoalSuggestion {
  const GoalSuggestion({
    required this.title,
    required this.deadline,
    required this.steps,
    this.category = 'generic',
    this.requirements = const [],
    this.missingFields = const [],
    this.engine = 'rules',
  });

  /// Resposta 200 `{ draft: {...}, engine }`. Fora do formato → lança.
  factory GoalSuggestion.fromJson(Map<String, dynamic> json) {
    final draft = json['draft'] as Map<String, dynamic>;
    return GoalSuggestion(
      // `title` pode faltar (`missingFields: ['title']`): a M15 abre vazia.
      title: draft['title'] as String? ?? '',
      deadline: draft['deadline'] as String?,
      category: draft['category'] as String,
      requirements: _strings(draft['requirements']),
      missingFields: _strings(draft['missingFields']),
      steps: (draft['steps'] as List)
          .map((s) => SuggestedStep.fromJson(s as Map<String, dynamic>))
          .toList(),
      engine: json['engine'] as String,
    );
  }

  final String title;

  /// Data local `YYYY-MM-DD` ou `null` (sem prazo, P3).
  final String? deadline;
  final List<SuggestedStep> steps;

  /// `assignment | exam | project | generic`.
  final String category;

  /// Requisitos que a IA achou no texto (ex.: "3 algoritmos").
  final List<String> requirements;

  /// Campos que a IA não achou (`title`, `deadline`). Informativo (IA2): a
  /// tela de etapas mostra o campo vazio e o usuário completa se quiser.
  final List<String> missingFields;

  /// Quem respondeu: `llm | rules`. Nenhuma tela depende disso.
  final String engine;
}

/// Etapa sugerida: título, estimativa em minutos (P5), a estimativa original
/// da IA e os micro-passos.
class SuggestedStep {
  const SuggestedStep({
    required this.title,
    required this.estimatedMinutes,
    this.aiEstimatedMinutes,
    this.microSteps = const [],
  });

  factory SuggestedStep.fromJson(Map<String, dynamic> json) => SuggestedStep(
    title: json['title'] as String,
    estimatedMinutes: json['estimatedMinutes'] as int,
    aiEstimatedMinutes: json['aiEstimatedMinutes'] as int?,
    microSteps: _strings(json['microSteps']),
  );

  final String title;
  final int estimatedMinutes;

  /// Estimativa original da IA, que vai separada no `POST /goals` (4f). Sem
  /// ela, a original é a própria [estimatedMinutes] sugerida.
  final int? aiEstimatedMinutes;
  final List<String> microSteps;
}

List<String> _strings(Object? list) => [
  for (final e in list as List) e as String,
];
