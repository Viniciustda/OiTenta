import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/features/goals/data/sample_goal_assistant_repository.dart';

/// O assistente de exemplo (modo `sample`) devolve os campos novos do
/// rascunho da IA (docs/4 §3, IA1), como o motor de regras.
void main() {
  test(
    'preenche category, requirements, missingFields, engine, microSteps e aiEstimatedMinutes',
    () async {
      final s = await SampleGoalAssistantRepository(
        clock: FixedClock(DateTime(2025, 11, 6, 9, 41)),
        delay: Duration.zero,
      ).suggest('Trabalho de Algoritmos, entrega 24/11');
      expect(s.category, 'assignment');
      // DATA `NOVO.reqs` do protótipo (bora-data.js).
      expect(s.requirements, [
        '3 algoritmos',
        'código em C',
        'relatório em PDF',
        'gráfico comparativo',
      ]);
      expect(s.missingFields, isEmpty);
      expect(s.engine, 'rules');
      for (final step in s.steps) {
        expect(step.aiEstimatedMinutes, step.estimatedMinutes);
        expect(step.microSteps, isNotEmpty);
      }
    },
  );
}
