import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';
import 'package:oitenta/features/goals/domain/goal.dart';

void main() {
  late SampleGoalsRepository repo;
  setUp(() => repo = SampleGoalsRepository());

  test('listGoals devolve os 3 objetivos do protótipo com % e folga', () async {
    final g = await repo.listGoals();
    expect(g.map((x) => x.title), [
      'Eng. de Software',
      'Cálculo II',
      'Portfólio no GitHub',
    ]);
    expect(g.map((x) => x.progressPct), [62, 25, 10]);
    expect(g.first.deadline, '2025-11-20');
    expect(g.first.slackDays, 2);
    expect(g.last.deadline, isNull);
    expect(g.first.done, 5);
    expect(g.first.total, 8);
  });

  test(
    'getGoal devolve as etapas em ordem, com status e próximo bloco das pendentes',
    () async {
      final d = await repo.getGoal('goal-eng');
      expect(d.steps, hasLength(8));
      expect(d.steps.first.order, 1);
      expect(d.steps.first.status, 'done');
      final cur = d.steps[5];
      expect(cur.title, 'Diagrama de casos de uso');
      expect(cur.progressPct, 40);
      expect(cur.status, 'pending');
      expect(cur.nextBlock, isNotNull);
      expect(cur.estimatedMinutes, 90);
      expect(cur.remainingMinutes, 54);
    },
  );

  test('getGoal de id inexistente falha (404)', () async {
    expect(() => repo.getGoal('nao-existe'), throwsA(isA<StateError>()));
  });

  test(
    'createGoal grava o objetivo com a próxima cor e ele aparece na lista',
    () async {
      final r = await repo.createGoal(
        const NewGoal(
          title: 'Trabalho de Algoritmos',
          deadline: '2025-11-24',
          kind: 'goal',
          steps: [
            NewStep(
              title: 'Implementar os 3 algoritmos',
              estimatedMinutes: 180,
            ),
          ],
        ),
      );
      expect(r.goal.colorIndex, 4);
      expect(r.goal.progressPct, 0);
      final list = await repo.listGoals();
      expect(list.last.title, 'Trabalho de Algoritmos');
      final d = await repo.getGoal(r.goal.id);
      expect(d.steps.single.estimatedMinutes, 180);
    },
  );

  test('createGoal sem etapas falha (422)', () async {
    expect(
      () => repo.createGoal(
        const NewGoal(title: 'X', deadline: null, kind: 'goal', steps: []),
      ),
      throwsA(isA<ArgumentError>()),
    );
  });

  test('createGoal com título vazio falha (422)', () async {
    expect(
      () => repo.createGoal(
        const NewGoal(
          title: '  ',
          deadline: null,
          kind: 'single',
          steps: [NewStep(title: 'a', estimatedMinutes: 15)],
        ),
      ),
      throwsA(isA<ArgumentError>()),
    );
  });
}
