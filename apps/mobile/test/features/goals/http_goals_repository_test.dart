import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/errors/app_errors.dart';
import 'package:oitenta/features/goals/data/http_goals_repository.dart';
import 'package:oitenta/features/goals/domain/goal.dart';

import '../../helpers/fake_api.dart';

const _goal = {
  'id': 'g1',
  'title': 'Trabalho de Algoritmos',
  'deadline': '2026-11-24',
  'colorIndex': 1,
  'progressPct': 0,
};

void main() {
  late FakeApi api;
  late HttpGoalsRepository repo;

  setUp(() {
    api = FakeApi();
    repo = HttpGoalsRepository(api.client);
  });

  test(
    'listGoals: GET /goals com Bearer; aceita createdAt e slackDays null do done',
    () async {
      api.respond({
        'goals': [
          {
            ..._goal,
            'done': 1,
            'total': 3,
            'status': 'active',
            'slackDays': 2,
            'createdAt': '2026-11-01T12:00:00.000Z',
          },
          {
            'id': 'g2',
            'title': 'Ler capítulo',
            'deadline': null,
            'colorIndex': 2,
            'progressPct': 100,
            'done': 2,
            'total': 2,
            'status': 'done',
            'slackDays': null,
            'createdAt': '2026-10-20T12:00:00.000Z',
          },
        ],
      });
      final goals = await repo.listGoals();
      expect(api.last.method, 'GET');
      expect(api.last.url.path, '/goals');
      expect(api.last.headers['Authorization'], 'Bearer tok-123');
      expect(goals, hasLength(2));
      expect(goals.first.slackDays, 2);
      expect(goals.first.done, 1);
      expect(goals.last.status, 'done');
      expect(goals.last.slackDays, isNull);
      expect(goals.last.deadline, isNull);
    },
  );

  test('listGoals: 401 → UnauthorizedFailure e avisa a sessão', () async {
    api.fail(401, 'Token inválido.');
    await expectLater(repo.listGoals(), throwsA(isA<UnauthorizedFailure>()));
    expect(api.unauthorizedCalls, 1);
  });

  test(
    'getGoal: GET /goals/:goalId; etapa pendente traz nextBlock {id, start, end}',
    () async {
      api.respond({
        'goal': {..._goal, 'progressPct': 50},
        'steps': [
          {
            'id': 's1',
            'order': 1,
            'title': 'Ler o enunciado',
            'estimatedMinutes': 30,
            'progressPct': 100,
            'status': 'done',
            'remainingMinutes': 0,
          },
          {
            'id': 's2',
            'order': 2,
            'title': 'Escrever o código',
            'estimatedMinutes': 120,
            'progressPct': 0,
            'status': 'pending',
            'remainingMinutes': 120,
            'nextBlock': {
              'id': 'b9',
              'start': '2026-11-11T22:00:00.000Z',
              'end': '2026-11-11T23:00:00.000Z',
            },
          },
        ],
        'progressPct': 50,
        'done': 1,
        'total': 2,
      });
      final d = await repo.getGoal('g1');
      expect(api.last.method, 'GET');
      expect(api.last.url.path, '/goals/g1');
      expect(d.goal.title, 'Trabalho de Algoritmos');
      expect(d.steps.first.isDone, isTrue);
      expect(d.steps.first.nextBlock, isNull);
      expect(d.steps.last.nextBlock!.start, DateTime.utc(2026, 11, 11, 22));
      expect(d.steps.last.nextBlock!.end, DateTime.utc(2026, 11, 11, 23));
      expect(d.done, 1);
      expect(d.total, 2);
    },
  );

  test('getGoal: codifica o id na URL', () async {
    api.respond({
      'goal': _goal,
      'steps': [],
      'progressPct': 0,
      'done': 0,
      'total': 0,
    });
    await repo.getGoal('a/b c');
    expect(api.last.url.pathSegments, ['goals', 'a/b c']);
  });

  test(
    'getGoal: 404 (inexistente ou de outro usuário) → NotFoundFailure',
    () async {
      api.fail(404, 'Objetivo não encontrado.');
      await expectLater(repo.getGoal('x'), throwsA(isA<NotFoundFailure>()));
    },
  );

  test(
    'createGoal: POST /goals com {title, deadline, kind, steps} e lê {goal, plan}',
    () async {
      api.respond({
        'goal': _goal,
        'plan': {
          'totalMinutes': 30,
          'days': 1,
          'goals': [
            {
              'goalId': 'g1',
              'feasible': true,
              'usedSlack': false,
              'slackDays': 3,
              'unscheduledMinutes': 0,
            },
          ],
        },
      }, 201);
      final r = await repo.createGoal(
        const NewGoal(
          title: 'Trabalho de Algoritmos',
          deadline: '2026-11-24',
          kind: 'goal',
          steps: [NewStep(title: 'Ler o enunciado', estimatedMinutes: 30)],
        ),
      );
      expect(api.last.method, 'POST');
      expect(api.last.url.path, '/goals');
      expect(api.lastBody, {
        'title': 'Trabalho de Algoritmos',
        'deadline': '2026-11-24',
        'kind': 'goal',
        'steps': [
          {
            'title': 'Ler o enunciado',
            'estimatedMinutes': 30,
            'microSteps': [],
          },
        ],
      });
      expect(r.goal.id, 'g1');
      expect(r.plan.goals.single.slackDays, 3);
    },
  );

  test('createGoal sem prazo não manda deadline (P3)', () async {
    api.respond({
      'goal': {..._goal, 'deadline': null},
      'plan': {'totalMinutes': 15, 'days': 1, 'goals': []},
    }, 201);
    await repo.createGoal(
      const NewGoal(
        title: 'Lavar a louça',
        deadline: null,
        kind: 'single',
        steps: [NewStep(title: 'Lavar a louça', estimatedMinutes: 15)],
      ),
    );
    expect((api.lastBody as Map).containsKey('deadline'), isFalse);
  });

  test(
    'createGoal: 422 → ValidationFailure; 404 (sem disponibilidade) → NotFoundFailure',
    () async {
      const g = NewGoal(title: '', deadline: null, kind: 'goal', steps: []);
      api.fail(422, 'Dados inválidos.');
      await expectLater(repo.createGoal(g), throwsA(isA<ValidationFailure>()));
      api.fail(404, 'Sem disponibilidade.');
      await expectLater(repo.createGoal(g), throwsA(isA<NotFoundFailure>()));
    },
  );
}
