import '../../../core/errors/app_errors.dart';
import '../../../core/sample/bora_sample_data.dart';
import '../domain/goal.dart';
import 'goals_repository.dart';

/// Repositório de exemplo com os objetivos do protótipo (DATA `OBJ`,
/// `TRILHAS`, `ENTREGA`). Guarda em memória os objetivos criados.
class SampleGoalsRepository implements GoalsRepository {
  SampleGoalsRepository() {
    for (final g in BoraSample.goals) {
      final trail = BoraSample.trails[g['trail']]!;
      _goals.add(
        _StoredGoal(
          id: g['id'] as String,
          title: g['title'] as String,
          deadline: g['deadline'] as String?,
          colorIndex: g['colorIndex'] as int,
          slackDays: g['slackDays'] as int?,
          steps: [
            for (final s in trail)
              _StoredStep(
                title: s[0] as String,
                minutes: ((s[4] as double) * 60).round(),
                progressPct: (s[5] as bool)
                    ? 100
                    : (BoraSample.partialProgress[s[0]] ?? 0),
                start: DateTime(
                  2025,
                  s[1] as int,
                  s[2] as int,
                  (s[3] as double).floor(),
                  (((s[3] as double) - (s[3] as double).floor()) * 60).round(),
                ),
              ),
          ],
        ),
      );
    }
  }

  final List<_StoredGoal> _goals = [];
  int _created = 0;

  Map<String, dynamic> _goalJson(_StoredGoal g) => {
    'id': g.id,
    'title': g.title,
    'deadline': g.deadline,
    'colorIndex': g.colorIndex,
    'progressPct': g.progressPct,
  };

  @override
  Future<List<GoalSummary>> listGoals() async => [
    for (final g in _goals)
      GoalSummary.fromJson({
        ..._goalJson(g),
        'done': g.done,
        'total': g.steps.length,
        'status': 'active',
        'slackDays': g.slackDays,
      }),
  ];

  @override
  Future<GoalDetail> getGoal(String goalId) async {
    final g = _goals.where((x) => x.id == goalId).firstOrNull;
    if (g == null) throw NotFoundFailure('Objetivo não encontrado.');
    return GoalDetail.fromJson({
      'goal': _goalJson(g),
      'steps': [
        for (var i = 0; i < g.steps.length; i++)
          () {
            final s = g.steps[i];
            final done = s.progressPct == 100;
            return {
              'id': '${g.id}-${i + 1}',
              'order': i + 1,
              'title': s.title,
              'estimatedMinutes': s.minutes,
              'progressPct': s.progressPct,
              'status': done ? 'done' : 'pending',
              'remainingMinutes': (s.minutes * (100 - s.progressPct) / 100)
                  .round(),
              'nextBlock': done || s.start == null
                  ? null
                  : {
                      'start': s.start!.toUtc().toIso8601String(),
                      'end': s.start!
                          .add(Duration(minutes: s.minutes))
                          .toUtc()
                          .toIso8601String(),
                    },
            };
          }(),
      ],
      'progressPct': g.progressPct,
      'done': g.done,
      'total': g.steps.length,
    });
  }

  @override
  Future<CreateGoalResult> createGoal(NewGoal goal) async {
    if (goal.title.trim().isEmpty || goal.title.trim().length > 120) {
      throw ValidationFailure('O título precisa ter de 1 a 120 caracteres.');
    }
    if (goal.steps.isEmpty) {
      throw ValidationFailure('Adicione pelo menos uma etapa.');
    }
    if (goal.kind == 'single' && goal.steps.length != 1) {
      throw ValidationFailure('Tarefa única tem 1 etapa.');
    }
    for (final s in goal.steps) {
      if (s.estimatedMinutes < 15 || s.estimatedMinutes % 15 != 0) {
        throw ValidationFailure('Tempo da etapa inválido.');
      }
    }
    _created++;
    final stored = _StoredGoal(
      id: 'goal-new-$_created',
      title: goal.title.trim(),
      deadline: goal.deadline,
      colorIndex: _goals.length % 4 + 1,
      slackDays: null,
      steps: [
        for (final s in goal.steps)
          _StoredStep(
            title: s.title,
            minutes: s.estimatedMinutes,
            progressPct: 0,
          ),
      ],
    );
    _goals.add(stored);
    return CreateGoalResult.fromJson({
      'goal': _goalJson(stored),
      'plan': {
        'totalMinutes': stored.steps.fold<int>(0, (t, s) => t + s.minutes),
        'days': 0,
        'goals': [
          {
            'goalId': stored.id,
            'feasible': true,
            'usedSlack': false,
            'slackDays': 0,
            'unscheduledMinutes': 0,
          },
        ],
      },
    });
  }
}

class _StoredGoal {
  _StoredGoal({
    required this.id,
    required this.title,
    required this.deadline,
    required this.colorIndex,
    required this.slackDays,
    required this.steps,
  });

  final String id;
  final String title;
  final String? deadline;
  final int colorIndex;
  final int? slackDays;
  final List<_StoredStep> steps;

  int get done => steps.where((s) => s.progressPct == 100).length;

  /// Como o protótipo (`pctTr`): etapas feitas / total.
  int get progressPct =>
      steps.isEmpty ? 0 : (done * 100 / steps.length).floor();
}

class _StoredStep {
  _StoredStep({
    required this.title,
    required this.minutes,
    required this.progressPct,
    this.start,
  });

  final String title;
  final int minutes;
  final int progressPct;
  final DateTime? start;
}
