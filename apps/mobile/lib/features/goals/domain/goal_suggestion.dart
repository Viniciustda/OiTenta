/// Resposta do assistente do novo objetivo (decisão 4f: `parseGoal` +
/// `suggestSteps`): título, prazo (se o usuário informou) e etapas com tempo.
/// O usuário sempre confere e edita na tela de etapas antes de salvar.
class GoalSuggestion {
  const GoalSuggestion({
    required this.title,
    required this.deadline,
    required this.steps,
  });

  final String title;

  /// Data local `YYYY-MM-DD` ou `null` (sem prazo, P3).
  final String? deadline;
  final List<SuggestedStep> steps;
}

/// Etapa sugerida: título e estimativa em minutos (P5).
class SuggestedStep {
  const SuggestedStep({required this.title, required this.estimatedMinutes});

  final String title;
  final int estimatedMinutes;
}
