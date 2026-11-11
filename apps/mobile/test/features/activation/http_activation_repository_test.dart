import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/errors/app_errors.dart';
import 'package:oitenta/features/activation/data/http_activation_repository.dart';
import 'package:oitenta/features/activation/domain/focus_session.dart';
import 'package:oitenta/features/activation/domain/ramp.dart';

import '../../helpers/fake_api.dart';

Map<String, dynamic> _option(String kind, {String? operation}) => {
  'id': '$kind-1',
  'stepKind': kind,
  'title': 'Opção $kind',
  'durationLabel': '2 min',
  'durationSeconds': 120,
  'description': 'desc',
  'icon': 'timer',
  'operation': ?operation,
  if (operation != null)
    'problems': [
      {'a': 2, 'b': 3, 'op': '+'},
    ],
};

final _ramp = {
  'steps': [
    for (final k in ['warmup', 'challenge', 'micro', 'focus', 'log'])
      {
        'kind': k,
        'options': [_option(k, operation: k == 'challenge' ? 'mix' : null)],
      },
  ],
  'suggested': 'micro',
};

const _sessionResult = {
  'session': {'id': 'fs1'},
  'step': {'progressPct': 70, 'status': 'pending'},
  'goalProgressPct': 57,
  'plan': {'totalMinutes': 100, 'days': 2, 'goals': []},
};

RecordSession _session({
  String? blockId,
  SessionOutcome outcome = SessionOutcome.partial,
  int? pct = 70,
}) => RecordSession(
  goalId: 'g1',
  stepId: 's1',
  blockId: blockId,
  energy: EnergyLevel.medium,
  availableTime: AvailableTime.m30,
  startedAt: DateTime.utc(2026, 11, 10, 22),
  endedAt: DateTime.utc(2026, 11, 10, 22, 25),
  focusedMinutes: 25,
  outcome: outcome,
  partialPct: pct,
);

void main() {
  late FakeApi api;
  late HttpActivationRepository repo;

  setUp(() {
    api = FakeApi();
    repo = HttpActivationRepository(api.client);
  });

  test(
    'getRamp: GET /activation/ramp com a query e lê stepKind e operation',
    () async {
      api.respond(_ramp);
      final r = await repo.getRamp(
        goalId: 'g1',
        stepId: 's1',
        energy: EnergyLevel.high,
        availableTime: AvailableTime.h2plus,
      );
      expect(api.last.method, 'GET');
      expect(api.last.url.path, '/activation/ramp');
      expect(api.last.url.queryParameters, {
        'goalId': 'g1',
        'stepId': 's1',
        'energy': 'high',
        'availableTime': '2h+',
      });
      expect(api.last.headers['Authorization'], 'Bearer tok-123');
      expect(r.suggested, RampStepKind.micro);
      expect(r.steps, hasLength(5));
      final challenge = r.step(RampStepKind.challenge).options.single;
      expect(challenge.stepKind, RampStepKind.challenge);
      expect(challenge.operation, 'mix');
      expect(challenge.problems.single.answer, 5);
      expect(r.step(RampStepKind.focus).options.single.operation, isNull);
    },
  );

  test('getRamp sem tempo disponível não manda availableTime', () async {
    api.respond(_ramp);
    await repo.getRamp(goalId: 'g1', stepId: 's1', energy: EnergyLevel.low);
    expect(api.last.url.queryParameters.containsKey('availableTime'), isFalse);
  });

  test('getRamp: 404 → NotFoundFailure; 400 → ValidationFailure', () async {
    api.fail(404, 'Etapa não encontrada.');
    await expectLater(
      repo.getRamp(goalId: 'g1', stepId: 'x', energy: EnergyLevel.low),
      throwsA(isA<NotFoundFailure>()),
    );
    api.fail(400, 'energy inválida');
    await expectLater(
      repo.getRamp(goalId: 'g1', stepId: 's1', energy: EnergyLevel.low),
      throwsA(isA<ValidationFailure>()),
    );
  });

  test(
    'recordSession: POST /activation/sessions com o corpo do contrato',
    () async {
      api.respond(_sessionResult, 201);
      final r = await repo.recordSession(_session(blockId: 'b1'));
      expect(api.last.method, 'POST');
      expect(api.last.url.path, '/activation/sessions');
      expect(api.lastBody, {
        'goalId': 'g1',
        'stepId': 's1',
        'blockId': 'b1',
        'energy': 'medium',
        'availableTime': '30m',
        'startedAt': '2026-11-10T22:00:00.000Z',
        'endedAt': '2026-11-10T22:25:00.000Z',
        'focusedMinutes': 25,
        'outcome': 'partial',
        'partialPct': 70,
      });
      expect(r.stepProgressPct, 70);
      expect(r.stepStatus, 'pending');
      expect(r.goalProgressPct, 57);
      expect(r.plan.days, 2);
    },
  );

  test('recordSession sem bloco não manda blockId (opcional)', () async {
    api.respond(_sessionResult, 201);
    await repo.recordSession(_session(outcome: SessionOutcome.done, pct: null));
    final body = api.lastBody as Map;
    expect(body.containsKey('blockId'), isFalse);
    expect(body.containsKey('partialPct'), isFalse);
    expect(body['outcome'], 'done');
  });

  test(
    'recordSession: 422 → ValidationFailure; 404 → NotFoundFailure',
    () async {
      api.fail(422, 'Dados inválidos.');
      await expectLater(
        repo.recordSession(_session(pct: null)),
        throwsA(isA<ValidationFailure>()),
      );
      api.fail(404, 'Bloco não encontrado.');
      await expectLater(
        repo.recordSession(_session(blockId: 'x')),
        throwsA(isA<NotFoundFailure>()),
      );
    },
  );

  test('recordSession: plano com slackDays null não quebra o parse', () async {
    api.respond({
      ..._sessionResult,
      'plan': {
        'totalMinutes': 100,
        'days': 2,
        'goals': [
          {
            'goalId': 'g1',
            'feasible': true,
            'usedSlack': false,
            'slackDays': null,
            'unscheduledMinutes': 0,
          },
        ],
      },
    }, 201);
    final r = await repo.recordSession(_session(blockId: 'b1'));
    expect(r.plan.goals.single.slackDays, isNull);
  });
}
