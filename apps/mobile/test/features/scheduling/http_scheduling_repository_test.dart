import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/errors/app_errors.dart';
import 'package:oitenta/features/scheduling/data/http_scheduling_repository.dart';
import 'package:oitenta/features/scheduling/domain/availability.dart';

import '../../helpers/fake_api.dart';

const _availability = {
  'windows': [
    {'weekday': 0, 'startMinute': 1140, 'endMinute': 1380},
    {'weekday': 6, 'startMinute': 360, 'endMinute': 720},
  ],
  'dailyLimitMinutes': 180,
};

const _plan = {
  'totalMinutes': 495,
  'days': 6,
  'goals': [
    {
      'goalId': 'g1',
      'feasible': true,
      'usedSlack': true,
      'slackDays': 1,
      'unscheduledMinutes': 0,
    },
  ],
};

Map<String, dynamic> _day(String date) => {
  'date': date,
  'blocks': [
    {
      'id': 'b1',
      'start': '2026-11-10T22:00:00.000Z',
      'end': '2026-11-10T23:00:00.000Z',
      'status': 'planned',
      'goalId': 'g1',
      'goalTitle': 'Trabalho de Algoritmos',
      'colorIndex': 1,
      'stepId': 's1',
      'stepTitle': 'Ler o enunciado',
    },
  ],
  'usedMinutes': 60,
  'limitMinutes': 180,
};

void main() {
  late FakeApi api;
  late HttpSchedulingRepository repo;

  setUp(() {
    api = FakeApi();
    repo = HttpSchedulingRepository(api.client);
  });

  test('getAvailability: GET /scheduling/availability com Bearer', () async {
    api.respond({'availability': _availability});
    final a = await repo.getAvailability();
    expect(api.last.method, 'GET');
    expect(api.last.url.path, '/scheduling/availability');
    expect(api.last.headers['Authorization'], 'Bearer tok-123');
    expect(a!.dailyLimitMinutes, 180);
    // weekday: 0 = segunda … 6 = domingo, sem conversão.
    expect(
      a.windows.first,
      const AvailabilityWindow(weekday: 0, startMinute: 1140, endMinute: 1380),
    );
    expect(a.windows.last.weekday, 6);
  });

  test('getAvailability: 404 (sem onboarding, P12) → null', () async {
    api.fail(404, 'Disponibilidade não encontrada.');
    expect(await repo.getAvailability(), isNull);
  });

  test('getAvailability: 401 continua sendo erro', () async {
    api.fail(401, 'Token inválido.');
    await expectLater(
      repo.getAvailability(),
      throwsA(isA<UnauthorizedFailure>()),
    );
  });

  test(
    'setAvailability: PUT com {windows, dailyLimitMinutes} e lê {availability, plan}',
    () async {
      api.respond({'availability': _availability, 'plan': _plan});
      final r = await repo.setAvailability(
        const WeeklyAvailability(
          windows: [
            AvailabilityWindow(weekday: 0, startMinute: 1140, endMinute: 1380),
            AvailabilityWindow(weekday: 6, startMinute: 360, endMinute: 720),
          ],
          dailyLimitMinutes: 180,
        ),
      );
      expect(api.last.method, 'PUT');
      expect(api.last.url.path, '/scheduling/availability');
      expect(api.lastBody, _availability);
      expect(r.availability.windows, hasLength(2));
      expect(r.plan.totalMinutes, 495);
      expect(r.plan.goals.single.slackDays, 1);
    },
  );

  test('setAvailability: 422 → ValidationFailure', () async {
    api.fail(422, 'Dados inválidos.');
    await expectLater(
      repo.setAvailability(
        const WeeklyAvailability(windows: [], dailyLimitMinutes: 25),
      ),
      throwsA(isA<ValidationFailure>()),
    );
  });

  test('getDayPlan: GET /scheduling/plan/day?date=', () async {
    api.respond(_day('2026-11-10'));
    final d = await repo.getDayPlan('2026-11-10');
    expect(api.last.method, 'GET');
    expect(api.last.url.path, '/scheduling/plan/day');
    expect(api.last.url.queryParameters, {'date': '2026-11-10'});
    expect(d.blocks.single.goalTitle, 'Trabalho de Algoritmos');
    expect(d.blocks.single.start, DateTime.utc(2026, 11, 10, 22));
    expect(d.blocks.single.minutes, 60);
    expect(d.limitMinutes, 180);
  });

  test(
    'getDayPlan: 404 (sem disponibilidade) → NotFoundFailure; 400 → ValidationFailure',
    () async {
      api.fail(404, 'Sem disponibilidade.');
      await expectLater(
        repo.getDayPlan('2026-11-10'),
        throwsA(isA<NotFoundFailure>()),
      );
      api.fail(400, 'date inválida');
      await expectLater(
        repo.getDayPlan('xyz'),
        throwsA(isA<ValidationFailure>()),
      );
    },
  );

  test(
    'getWeekPlan: GET /scheduling/plan/week?start= e lê os 7 dias',
    () async {
      api.respond({
        'days': [
          for (var i = 9; i < 16; i++)
            _day('2026-11-${i.toString().padLeft(2, '0')}'),
        ],
      });
      final w = await repo.getWeekPlan('2026-11-09');
      expect(api.last.url.path, '/scheduling/plan/week');
      expect(api.last.url.queryParameters, {'start': '2026-11-09'});
      expect(w.days, hasLength(7));
      expect(w.days.first.date, '2026-11-09');
    },
  );

  test('getWeekPlan: 422 (não é segunda) → ValidationFailure', () async {
    api.fail(422, 'A semana começa na segunda-feira.');
    await expectLater(
      repo.getWeekPlan('2026-11-11'),
      throwsA(isA<ValidationFailure>()),
    );
  });

  test('getLightTasks continua só de exemplo (sem rede)', () async {
    final tasks = await repo.getLightTasks('2026-11-10');
    expect(tasks, isNotEmpty);
    expect(api.requests, isEmpty);
  });
}
