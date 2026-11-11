import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';
import 'package:oitenta/features/goals/domain/goal_suggestion.dart';
import 'package:oitenta/features/goals/presentation/new_goal_controller.dart';

const _answer = GoalSuggestion(
  title: 'Trabalho de Algoritmos',
  deadline: '2025-11-24',
  steps: [
    SuggestedStep(title: 'Implementar os 3 algoritmos', estimatedMinutes: 180),
    SuggestedStep(title: 'Revisar e enviar', estimatedMinutes: 45),
  ],
);

void main() {
  test('sem sugestão continua vazia e não é "sugerida" (P20)', () {
    final c = NewGoalController(SampleGoalsRepository());
    expect(c.steps, isEmpty);
    expect(c.suggested, isFalse);
  });

  test('com a resposta da IA começa preenchida e editável', () {
    final c = NewGoalController(SampleGoalsRepository(), suggestion: _answer);
    expect(c.suggested, isTrue);
    expect(c.title, 'Trabalho de Algoritmos');
    expect(c.deadline, DateTime(2025, 11, 24));
    expect(c.steps.map((s) => s.title), [
      'Implementar os 3 algoritmos',
      'Revisar e enviar',
    ]);
    expect(c.totalLabel, '3h45 no total');
    expect(c.canSubmit, isTrue);
    c.removeStep(1);
    expect(c.totalLabel, '3h no total');
  });

  test('resposta sem prazo deixa o prazo vazio (P3)', () {
    final c = NewGoalController(
      SampleGoalsRepository(),
      suggestion: const GoalSuggestion(
        title: 'Portfólio',
        deadline: null,
        steps: [SuggestedStep(title: 'README', estimatedMinutes: 30)],
      ),
    );
    expect(c.deadline, isNull);
  });

  test('distribuir cria o objetivo com as etapas sugeridas', () async {
    final repo = SampleGoalsRepository();
    final c = NewGoalController(repo, suggestion: _answer);
    expect(await c.submit(), isNotNull);
    final g = (await repo.listGoals()).last;
    expect(g.title, 'Trabalho de Algoritmos');
    expect(g.deadline, '2025-11-24');
    expect(g.total, 2);
  });
}
