import '../../../core/errors/app_errors.dart';
import '../../../core/sample/bora_sample_data.dart';
import '../domain/focus_session.dart';
import '../domain/ramp.dart';
import 'activation_repository.dart';

/// Repositório de exemplo com o catálogo fixo da rampa (DATA `ALTS`, `PROBS`;
/// modelagem 4.1) e a tabela de sugestão de P14.
class SampleActivationRepository implements ActivationRepository {
  static const _suggested = {
    EnergyLevel.low: 'warmup',
    EnergyLevel.medium: 'challenge',
    EnergyLevel.high: 'micro',
    EnergyLevel.electric: 'focus',
  };

  static const _trails = {'goal-eng': 1, 'goal-calc': 2, 'goal-port': 3};

  List<String> _microOf(String goalId, String stepId) {
    final trail = BoraSample.trails[_trails[goalId]];
    final order = int.tryParse(stepId.split('-').last);
    if (trail == null || order == null || order < 1 || order > trail.length) return const [];
    return BoraSample.microSteps[trail[order - 1][0]] ?? const [];
  }

  @override
  Future<Ramp> getRamp({
    required String goalId,
    required String stepId,
    required EnergyLevel energy,
    AvailableTime? availableTime,
  }) async {
    final micro = _microOf(goalId, stepId);
    final microTexts = micro.isEmpty ? const [BoraSample.genericMicroStep] : micro;
    var i = 0;
    return Ramp.fromJson({
      'suggested': _suggested[energy],
      'steps': [
        {
          'kind': 'warmup',
          'options': [
            for (final w in BoraSample.warmups)
              {
                'id': 'warmup-${++i}',
                'title': w['title'],
                'durationLabel': w['label'],
                'durationSeconds': w['seconds'],
                'description': w['desc'],
                'icon': w['icon'],
                'steps': w['steps'],
              },
          ],
        },
        {
          'kind': 'challenge',
          'options': [
            for (final c in BoraSample.challenges)
              {
                'id': 'challenge-${++i}',
                'title': c['title'],
                'durationLabel': '2 min',
                'durationSeconds': 120,
                'description': c['desc'],
                'icon': 'calculator',
                'problems': [
                  for (final p in c['problems'] as List) {'a': p[0], 'b': p[1], 'op': p[2]},
                ],
              },
          ],
        },
        {
          'kind': 'micro',
          'options': [
            for (final t in microTexts)
              {
                'id': 'micro-${++i}',
                'title': t,
                'durationLabel': '1 min',
                'durationSeconds': 60,
                'description': 'Só o primeiro movimento.',
                'icon': 'footprints',
              },
          ],
        },
        {
          'kind': 'focus',
          'options': [
            for (final f in BoraSample.focus)
              {
                'id': 'focus-${++i}',
                'title': f['title'],
                'durationLabel': '${f['min']} min',
                'durationSeconds': (f['min'] as int) * 60,
                'description': f['desc'],
                'icon': 'timer',
              },
          ],
        },
        {
          'kind': 'log',
          'options': [
            {
              'id': 'log-1',
              'title': 'Contar como foi',
              'durationLabel': '1 min',
              'durationSeconds': 60,
              'description': 'Concluí, parcial ou não rolou.',
              'icon': 'check-circle',
            },
          ],
        },
      ],
    });
  }

  @override
  Future<RecordSessionResult> recordSession(RecordSession session) async {
    final pct = session.partialPct;
    if (session.outcome == SessionOutcome.partial && (pct == null || pct < 1 || pct > 99)) {
      throw ValidationFailure('Diga quanto ficou pronto.');
    }
    if (session.outcome != SessionOutcome.partial && pct != null) {
      throw ValidationFailure('Só o parcial tem porcentagem.');
    }
    final progress = switch (session.outcome) {
      SessionOutcome.done => 100,
      SessionOutcome.partial => pct!,
      SessionOutcome.notDone => 0,
    };
    return RecordSessionResult.fromJson({
      'session': session.toJson(),
      'step': {'progressPct': progress, 'status': progress == 100 ? 'done' : 'pending'},
      'goalProgressPct': 62,
      'plan': {'totalMinutes': 0, 'days': 0, 'goals': []},
    });
  }
}
