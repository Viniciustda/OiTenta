import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';
import 'package:oitenta/features/goals/presentation/new_goal_controller.dart';

void main() {
  late SampleGoalsRepository repo;
  late NewGoalController c;
  setUp(() {
    repo = SampleGoalsRepository();
    c = NewGoalController(repo);
  });

  test('começa vazia (P20)', () {
    expect(c.title, '');
    expect(c.steps, isEmpty);
    expect(c.deadline, isNull);
    expect(c.totalLabel, '0 min no total');
    expect(c.canSubmit, isFalse);
  });

  test('adicionar etapa pelo formulário (título + tempo, padrão 1h)', () {
    c.openAdd();
    expect(c.adding, isTrue);
    expect(c.addMinutes, 60);
    c.setAddTitle('Implementar os 3 algoritmos');
    c.setAddMinutes(180);
    c.confirmAdd();
    expect(c.adding, isFalse);
    expect(c.steps.single.title, 'Implementar os 3 algoritmos');
    expect(c.totalLabel, '3h no total');
  });

  test('não adiciona etapa sem título', () {
    c.openAdd();
    c.confirmAdd();
    expect(c.steps, isEmpty);
    expect(c.adding, isTrue);
  });

  test('remover etapa', () {
    c.openAdd();
    c.setAddTitle('a');
    c.confirmAdd();
    c.removeStep(0);
    expect(c.steps, isEmpty);
  });

  test('enviar cria o objetivo (kind goal) com prazo', () async {
    c.setTitle('Trabalho de Algoritmos');
    c.setDeadline(DateTime(2025, 11, 24));
    c.openAdd();
    c.setAddTitle('Revisar e enviar');
    c.setAddMinutes(45);
    c.confirmAdd();
    expect(c.canSubmit, isTrue);
    final r = await c.submit();
    expect(r, isNotNull);
    final list = await repo.listGoals();
    expect(list.last.title, 'Trabalho de Algoritmos');
    expect(list.last.deadline, '2025-11-24');
  });
}
