import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/domain/goal.dart';

/// `NewGoal.toJson()` sozinho (sem o `withoutNulls` do repositório): o
/// objetivo manual não leva `source` (IA1).
void main() {
  const step = NewStep(title: 'Resolver a lista', estimatedMinutes: 90);

  test('manual (source null): o JSON não tem a chave source', () {
    const g = NewGoal(
      title: 'Lista de Cálculo',
      deadline: null,
      kind: 'goal',
      steps: [step],
    );
    expect(g.toJson().containsKey('source'), isFalse);
  });

  test('da IA: o JSON leva source "ai"', () {
    const g = NewGoal(
      title: 'Lista de Cálculo',
      deadline: null,
      kind: 'goal',
      steps: [step],
      source: 'ai',
    );
    expect(g.toJson()['source'], 'ai');
  });
}
