import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';
import 'package:oitenta/features/goals/presentation/goals_controller.dart';

void main() {
  test('lista os objetivos com %, meta e o subtítulo', () async {
    final c = GoalsController(SampleGoalsRepository());
    await c.load();
    expect(c.subtitle, '3 ativos · próxima entrega 20/11');
    expect(c.items.map((i) => i.percentLabel), ['62%', '25%', '10%']);
    expect(c.items.first.meta, 'Entrega 20/11 · folga de 2 dias');
    expect(c.items[1].meta, 'Entrega 27/11 · folga de 3 dias');
    expect(c.items[2].meta, 'Sem prazo');
    expect(c.items.first.id, 'goal-eng');
  });
}
