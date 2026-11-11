import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/features/goals/data/goal_assistant_repository.dart';
import 'package:oitenta/features/goals/data/sample_goal_assistant_repository.dart';

void main() {
  SampleGoalAssistantRepository repo(DateTime today) =>
      SampleGoalAssistantRepository(
        clock: FixedClock(today),
        delay: Duration.zero,
      );

  test('é uma implementação de GoalAssistantRepository', () {
    expect(repo(DateTime(2025, 11, 6)), isA<GoalAssistantRepository>());
  });

  test(
    'devolve a resposta de exemplo do protótipo (bora-data.js, NOVO)',
    () async {
      final s = await repo(
        DateTime(2025, 11, 6, 9, 41),
      ).suggest('Trabalho de Algoritmos, entrega 24/11');
      expect(s.title, 'Trabalho de Algoritmos');
      expect(s.deadline, '2025-11-24');
      expect(s.steps.map((e) => e.title), [
        'Implementar os 3 algoritmos',
        'Medir tempos com 3 tamanhos de entrada',
        'Montar o gráfico comparativo',
        'Escrever o relatório',
        'Revisar e enviar',
      ]);
      expect(s.steps.map((e) => e.estimatedMinutes), [180, 90, 60, 120, 45]);
    },
  );

  test(
    'o prazo de exemplo fica 18 dias depois de hoje (24/11 a partir de 6/11)',
    () async {
      final s = await repo(DateTime(2026, 11, 11, 20)).suggest('qualquer');
      expect(s.deadline, '2026-11-29');
    },
  );

  test(
    'espera o atraso da análise antes de responder (2,6 s no protótipo)',
    () async {
      expect(
        SampleGoalAssistantRepository.analysisDelay,
        const Duration(milliseconds: 2600),
      );
      final r = SampleGoalAssistantRepository(
        clock: FixedClock(DateTime(2025, 11, 6)),
        delay: const Duration(milliseconds: 50),
      );
      final sw = Stopwatch()..start();
      await r.suggest('x');
      expect(sw.elapsedMilliseconds, greaterThanOrEqualTo(50));
    },
  );
}
