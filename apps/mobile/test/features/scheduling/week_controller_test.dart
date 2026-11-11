import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';
import 'package:oitenta/features/scheduling/presentation/week_controller.dart';

void main() {
  late WeekController c;
  setUp(() async {
    c = WeekController(
      SampleSchedulingRepository(),
      FixedClock(DateTime(2025, 11, 6, 9, 41)),
    );
    await c.load();
  });

  test('semana de 3 a 9 de novembro, com hoje selecionado', () {
    expect(c.rangeLabel, '3 a 9 de novembro');
    expect(c.days.map((d) => d.number), [3, 4, 5, 6, 7, 8, 9]);
    expect(c.days.map((d) => d.weekday), [
      'Seg',
      'Ter',
      'Qua',
      'Qui',
      'Sex',
      'Sáb',
      'Dom',
    ]);
    expect(c.days[3].isToday, isTrue);
    expect(c.selectedIndex, 3);
    expect(c.dayLabel, 'Hoje, quinta, 6 de novembro');
  });

  test('pontos por objetivo em cada dia (sem repetir)', () {
    expect(c.days[3].colorIndexes, [1, 2, 3]);
    expect(c.days[6].colorIndexes, [3]);
  });

  test('legenda com os objetivos da semana', () {
    expect(c.legend.map((l) => l.title), [
      'Eng. de Software',
      'Cálculo II',
      'Portfólio no GitHub',
    ]);
  });

  test('lista do dia e troca de dia', () {
    expect(c.dayBlocks.map((b) => b.title), [
      'Diagrama de casos de uso',
      'Lista 3: integrais por partes',
      'README do projeto de Compiladores',
    ]);
    expect(c.dayBlocks.first.time, '10:00');
    expect(c.dayBlocks.first.duration, '1h30');
    expect(c.dayBlocks.first.done, isFalse);
    c.selectDay(0);
    expect(c.dayLabel, 'Segunda, 3 de novembro');
    expect(c.dayBlocks.first.done, isTrue);
    expect(c.dayBlocks.first.pill, 'Concluída');
  });
}
