import '../../../core/http/api_client.dart';
import '../domain/goal_suggestion.dart';
import 'goal_assistant_repository.dart';

/// Assistente do novo objetivo no backend real: `POST /goals/assistant/draft`
/// (`docs/4-contrato-api.md` §3, IA1). Não grava nada; quem grava é o
/// `POST /goals`.
///
/// 503 (IA indisponível), outro erro, tempo esgotado ou falta de rede lançam
/// exceção: o chat vai para a fase `failed` e abre a M15 vazia (4f).
class HttpGoalAssistantRepository implements GoalAssistantRepository {
  HttpGoalAssistantRepository(this._api);

  /// Maior que o orçamento de 15 s do backend (`docs/7-proposta-ia.md` §c.5);
  /// o "IA analisando…" cobre a espera.
  static const timeout = Duration(seconds: 25);

  final ApiClient _api;

  @override
  Future<GoalSuggestion> suggest(String description) async =>
      GoalSuggestion.fromJson(
        await _api.post(
              '/goals/assistant/draft',
              body: {'text': description},
              timeout: timeout,
            )
            as Map<String, dynamic>,
      );
}
