import '../../../core/clock/clock.dart';
import '../../../core/format/bora_format.dart';
import '../domain/goal_suggestion.dart';
import 'goal_assistant_repository.dart';

/// EXAMPLE: "IA" de exemplo do chat do novo objetivo, com a resposta fixa do
/// protótipo (`design/mobile/app/source/bora-data.js`, `NOVO`), qualquer que
/// seja o texto enviado. Não há provedor de LLM (pendência 4 de
/// `docs/2-decisoes-mvp.md`) nem endpoint no contrato.
///
/// O prazo fica 18 dias depois de hoje: no protótipo, 24/11 a partir de 6/11.
/// Assim, no modo `http` (relógio real) o prazo de exemplo nunca fica no passado.
class SampleGoalAssistantRepository implements GoalAssistantRepository {
  SampleGoalAssistantRepository({
    required this.clock,
    this.delay = analysisDelay,
  });

  /// Tempo do "IA analisando…" no protótipo (`sendChat`, 2600 ms).
  static const analysisDelay = Duration(milliseconds: 2600);

  static const _deadlineInDays = 18;

  /// DATA `NOVO.title` e `NOVO.etapas` (tempos em minutos).
  static const _title = 'Trabalho de Algoritmos';
  static const _steps = [
    SuggestedStep(title: 'Implementar os 3 algoritmos', estimatedMinutes: 180),
    SuggestedStep(
      title: 'Medir tempos com 3 tamanhos de entrada',
      estimatedMinutes: 90,
    ),
    SuggestedStep(title: 'Montar o gráfico comparativo', estimatedMinutes: 60),
    SuggestedStep(title: 'Escrever o relatório', estimatedMinutes: 120),
    SuggestedStep(title: 'Revisar e enviar', estimatedMinutes: 45),
  ];

  final Clock clock;
  final Duration delay;

  @override
  Future<GoalSuggestion> suggest(String description) async {
    if (delay > Duration.zero) await Future<void>.delayed(delay);
    final now = clock.now();
    final today = DateTime(now.year, now.month, now.day);
    return GoalSuggestion(
      title: _title,
      deadline: BoraFormat.dateKey(
        DateTime(today.year, today.month, today.day + _deadlineInDays),
      ),
      steps: _steps,
    );
  }
}
