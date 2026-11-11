import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/format/bora_format.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';
import 'package:oitenta/features/scheduling/domain/availability.dart';

void main() {
  late SampleSchedulingRepository repo;
  setUp(() => repo = SampleSchedulingRepository());

  test('o usuário demo já tem disponibilidade com limite de 4h', () async {
    final a = await repo.getAvailability();
    expect(a, isNotNull);
    expect(a!.dailyLimitMinutes, 240);
  });

  test('sem onboarding, getAvailability devolve null (404, P12)', () async {
    final r = SampleSchedulingRepository(hasAvailability: false);
    expect(await r.getAvailability(), isNull);
  });

  test('setAvailability grava a grade e devolve o plano', () async {
    final r = SampleSchedulingRepository(hasAvailability: false);
    const a = WeeklyAvailability(
      windows: [
        AvailabilityWindow(weekday: 1, startMinute: 1080, endMinute: 1380),
      ],
      dailyLimitMinutes: 180,
    );
    final res = await r.setAvailability(a);
    expect(res.availability.dailyLimitMinutes, 180);
    expect((await r.getAvailability())!.windows.single.startMinute, 1080);
    expect(res.plan.goals, isNotEmpty);
  });

  test('setAvailability sem janelas falha (422)', () async {
    expect(
      () => repo.setAvailability(
        const WeeklyAvailability(windows: [], dailyLimitMinutes: 180),
      ),
      throwsA(isA<ArgumentError>()),
    );
  });

  test(
    'o dia 6/11 tem as 3 etapas do protótipo, em ordem, no horário local',
    () async {
      final day = await repo.getDayPlan('2025-11-06');
      expect(day.date, '2025-11-06');
      expect(day.blocks.map((b) => b.stepTitle), [
        'Diagrama de casos de uso',
        'Lista 3: integrais por partes',
        'README do projeto de Compiladores',
      ]);
      expect(day.blocks.map((b) => BoraFormat.clock(b.start)), [
        '10:00',
        '14:00',
        '19:00',
      ]);
      expect(day.blocks.first.minutes, 90);
      expect(day.blocks.first.colorIndex, 1);
      expect(day.blocks.first.goalTitle, 'Eng. de Software');
      expect(day.limitMinutes, 240);
    },
  );

  test('um dia sem blocos devolve blocks vazio', () async {
    final day = await repo.getDayPlan('2025-11-01');
    expect(day.blocks, isEmpty);
  });

  test(
    'a semana de 3/11 tem 7 dias e a quinta-feira vazia não existe (qui = 6/11)',
    () async {
      final w = await repo.getWeekPlan('2025-11-03');
      expect(w.days.map((d) => d.date).first, '2025-11-03');
      expect(w.days, hasLength(7));
      expect(w.days[0].blocks.map((b) => b.status), ['done', 'done']);
      expect(w.days[3].blocks, hasLength(3));
      expect(w.days[6].blocks.single.stepTitle, 'Organizar o perfil do GitHub');
    },
  );

  test('a semana precisa começar numa segunda (400)', () async {
    expect(() => repo.getWeekPlan('2025-11-05'), throwsA(isA<ArgumentError>()));
  });

  test('tarefas leves de exemplo do Hoje', () async {
    final l = await repo.getLightTasks('2025-11-06');
    expect(l.map((t) => t.time), ['11:30', '16:00']);
  });
}
