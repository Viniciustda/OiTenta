import '../domain/goal_suggestion.dart';

/// Assistente do novo objetivo (chat M13–M15, decisão 4f).
///
/// Ainda não há provedor de LLM nem endpoint no contrato
/// (`docs/4-contrato-api.md`); por isso só existe a implementação de exemplo
/// ([SampleGoalAssistantRepository]). Quando o backend tiver o endpoint, entra
/// uma `HttpGoalAssistantRepository` sem mudar as telas.
abstract class GoalAssistantRepository {
  /// Texto livre do usuário → título, prazo e etapas sugeridas.
  Future<GoalSuggestion> suggest(String description);
}
