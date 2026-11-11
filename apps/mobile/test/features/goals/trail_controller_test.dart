import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';
import 'package:oitenta/features/goals/presentation/trail_controller.dart';

void main() {
  late TrailController c;
  setUp(() async {
    c = TrailController(SampleGoalsRepository(), 'goal-eng');
    await c.load();
  });

  test('cabeçalho com %, entrega e resumo', () {
    expect(c.title, 'Eng. de Software');
    expect(c.percent, 62);
    expect(c.deadlineLabel, 'Entrega 20/11 · qui');
    expect(c.summary, '5 de 8 etapas concluídas · folga de 2 dias');
    expect(c.countLabel, '8 etapas');
    expect(c.flagTitle, 'Entrega final · Qui, 20/11');
  });

  test('etapas: feitas, a próxima destacada e as datas das pendentes', () {
    expect(c.rows, hasLength(8));
    expect(c.rows.first.done, isTrue);
    expect(c.rows.first.meta, 'Concluída');
    final next = c.rows[5];
    expect(next.isNext, isTrue);
    expect(next.meta, 'Qui, 6/11 · 10h');
    expect(next.duration, '1h30');
    expect(c.rows[6].isNext, isFalse);
  });

  test('objetivo sem prazo', () async {
    final p = TrailController(SampleGoalsRepository(), 'goal-port');
    await p.load();
    expect(p.deadlineLabel, 'Sem prazo');
    expect(p.flagTitle, 'Sem prazo final');
    expect(p.summary, '1 de 10 etapas concluídas');
  });

  test('id inexistente mostra erro', () async {
    final p = TrailController(SampleGoalsRepository(), 'x');
    await p.load();
    expect(p.error, isNotNull);
  });
}
