import '../../../core/errors/app_errors.dart';
import '../../../core/format/bora_format.dart';
import '../../../core/sample/bora_sample_data.dart';
import '../domain/availability.dart';
import '../domain/light_task.dart';
import '../domain/plan.dart';
import 'scheduling_repository.dart';

/// Repositório de exemplo: devolve a agenda do protótipo (DATA `WEEK`, `ETAPAS`)
/// no formato do contrato. Não recalcula o plano (isso é do backend).
class SampleSchedulingRepository implements SchedulingRepository {
  SampleSchedulingRepository({bool hasAvailability = true}) {
    if (hasAvailability) {
      _availability = WeeklyAvailability(
        // Todos os dias (0 = segunda … 6 = domingo), 18h–23h.
        windows: [
          for (var d = 0; d < 7; d++)
            AvailabilityWindow(weekday: d, startMinute: 1080, endMinute: 1380),
        ],
        dailyLimitMinutes: BoraSample.dailyLimitMinutes,
      );
    }
  }

  WeeklyAvailability? _availability;

  static const _goalIds = {1: 'goal-eng', 2: 'goal-calc', 3: 'goal-port'};

  @override
  Future<WeeklyAvailability?> getAvailability() async => _availability;

  @override
  Future<SetAvailabilityResult> setAvailability(
    WeeklyAvailability availability,
  ) async {
    if (availability.windows.isEmpty) {
      throw ValidationFailure('Marque pelo menos um horário livre.');
    }
    final l = availability.dailyLimitMinutes;
    if (l < 60 || l > 480 || l % 30 != 0) {
      throw ValidationFailure('Limite diário inválido.');
    }
    _availability = availability;
    return SetAvailabilityResult.fromJson({
      'availability': availability.toJson(),
      'plan': _planJson(),
    });
  }

  Map<String, dynamic> _planJson() => {
    'totalMinutes': 0,
    'days': 0,
    'goals': [
      for (final g in BoraSample.goals)
        {
          'goalId': g['id'],
          'feasible': true,
          'usedSlack': false,
          'slackDays': g['slackDays'] ?? 0,
          'unscheduledMinutes': 0,
        },
    ],
  };

  Map<String, dynamic> _blockJson(List<Object> w, int index) {
    final day = w[0] as int,
        hour = w[1] as double,
        dur = w[2] as double,
        trail = w[3] as int;
    final title = w[4] as String, done = w[5] as bool;
    final start = DateTime(
      2025,
      11,
      day,
      hour.floor(),
      ((hour - hour.floor()) * 60).round(),
    );
    final end = start.add(Duration(minutes: (dur * 60).round()));
    final steps = BoraSample.trails[trail]!;
    final order = steps.indexWhere((s) => s[0] == title) + 1;
    final goal = BoraSample.goals.firstWhere((g) => g['id'] == _goalIds[trail]);
    return {
      'id': 'block-$day-$index',
      'start': start.toUtc().toIso8601String(),
      'end': end.toUtc().toIso8601String(),
      'status': done ? 'done' : 'planned',
      'goalId': goal['id'],
      'goalTitle': goal['title'],
      'colorIndex': goal['colorIndex'],
      'stepId': '${goal['id']}-$order',
      'stepTitle': title,
    };
  }

  Map<String, dynamic> _dayJson(DateTime date) {
    final inWeek = date.year == 2025 && date.month == 11;
    final rows = inWeek
        ? BoraSample.week.where((w) => w[0] == date.day).toList()
        : <List<Object>>[];
    final blocks = [
      for (var i = 0; i < rows.length; i++) _blockJson(rows[i], i),
    ];
    final used = rows.fold<int>(
      0,
      (s, w) => s + ((w[2] as double) * 60).round(),
    );
    return {
      'date': BoraFormat.dateKey(date),
      'blocks': blocks,
      'usedMinutes': used,
      'limitMinutes':
          _availability?.dailyLimitMinutes ?? BoraSample.dailyLimitMinutes,
    };
  }

  @override
  Future<DayPlan> getDayPlan(String date) async =>
      DayPlan.fromJson(_dayJson(BoraFormat.parseDateKey(date)));

  @override
  Future<WeekPlan> getWeekPlan(String start) async {
    final monday = BoraFormat.parseDateKey(start);
    if (monday.weekday != DateTime.monday) {
      throw ValidationFailure('A semana começa na segunda-feira.');
    }
    return WeekPlan.fromJson({
      'days': [
        for (var i = 0; i < 7; i++)
          _dayJson(DateTime(monday.year, monday.month, monday.day + i)),
      ],
    });
  }

  @override
  Future<List<LightTask>> getLightTasks(String date) async => [
    for (final t in BoraSample.lightTasks)
      LightTask(
        id: t['id']!,
        title: t['title']!,
        subtitle: t['subtitle']!,
        time: t['time']!,
      ),
  ];
}
