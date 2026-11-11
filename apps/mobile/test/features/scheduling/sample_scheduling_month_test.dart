import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';

void main() {
  final repo = SampleSchedulingRepository();

  test(
    'fora da semana de 3/11, os blocos seguem as trilhas do protótipo',
    () async {
      final d11 = await repo.getDayPlan('2025-11-11');
      expect(d11.blocks.map((b) => b.stepTitle), ['Lista 4: frações parciais']);
      expect(d11.blocks.single.colorIndex, 2);
      expect(d11.blocks.single.status, 'planned');

      final w = await repo.getWeekPlan('2025-11-24');
      expect(w.days[1].blocks.single.stepTitle, 'Resolver provas antigas');
      expect(
        w.days[6].blocks.single.stepTitle,
        'Atualizar o currículo no perfil',
      );

      final oct = await repo.getDayPlan('2025-10-29');
      expect(oct.blocks.single.stepTitle, 'Ler o enunciado com o grupo');
      expect(oct.blocks.single.status, 'done');
    },
  );

  test('a semana de 3/11 continua com os blocos da DATA WEEK', () async {
    final d5 = await repo.getDayPlan('2025-11-05');
    expect(d5.blocks.map((b) => b.stepTitle), [
      'Diagrama de casos de uso',
      'Revisar integrais',
    ]);
  });
}
