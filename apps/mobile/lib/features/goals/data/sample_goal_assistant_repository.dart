import '../../../core/clock/clock.dart';
import '../../../core/format/bora_format.dart';
import '../domain/goal_suggestion.dart';
import 'goal_assistant_repository.dart';

/// EXAMPLE: "IA" de exemplo do chat do novo objetivo, com a resposta fixa do
/// protótipo (`design/mobile/app/source/bora-data.js`, `NOVO`), qualquer que
/// seja o texto enviado, no formato do rascunho de
/// `POST /goals/assistant/draft` (IA1). A versão real é a
/// `HttpGoalAssistantRepository`.
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

  /// DATA `NOVO.title`, `NOVO.reqs` e `NOVO.etapas` (tempos em minutos).
  /// O protótipo não tem micro-passos nem categoria: os micro-passos abaixo
  /// são EXAMPLE (um por etapa, como os modelos do motor de regras) e a
  /// categoria é a que o motor de regras daria ("trabalho" → `assignment`).
  static const _title = 'Trabalho de Algoritmos';
  static const _requirements = [
    '3 algoritmos',
    'código em C',
    'relatório em PDF',
    'gráfico comparativo',
  ];
  static const _steps = [
    SuggestedStep(
      title: 'Implementar os 3 algoritmos',
      estimatedMinutes: 180,
      aiEstimatedMinutes: 180,
      microSteps: ['Crie o arquivo e escreva o nome das 3 funções'],
    ),
    SuggestedStep(
      title: 'Medir tempos com 3 tamanhos de entrada',
      estimatedMinutes: 90,
      aiEstimatedMinutes: 90,
      microSteps: ['Escolha os 3 tamanhos e anote numa tabela'],
    ),
    SuggestedStep(
      title: 'Montar o gráfico comparativo',
      estimatedMinutes: 60,
      aiEstimatedMinutes: 60,
      microSteps: ['Cole os tempos medidos numa planilha'],
    ),
    SuggestedStep(
      title: 'Escrever o relatório',
      estimatedMinutes: 120,
      aiEstimatedMinutes: 120,
      microSteps: ['Escreva os títulos das seções do relatório'],
    ),
    SuggestedStep(
      title: 'Revisar e enviar',
      estimatedMinutes: 45,
      aiEstimatedMinutes: 45,
      microSteps: ['Releia o enunciado e marque o que já foi feito'],
    ),
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
      category: 'assignment',
      requirements: _requirements,
      engine: 'rules',
    );
  }
}
