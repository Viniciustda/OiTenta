import 'package:flutter/foundation.dart';

import '../../../core/clock/clock.dart';
import '../../../core/format/bora_format.dart';
import '../../auth/data/session_store.dart';
import '../../gamification/data/gamification_repository.dart';
import '../../gamification/domain/gamification.dart';
import '../../goals/data/goals_repository.dart';
import '../../goals/domain/goal.dart';
import '../data/scheduling_repository.dart';
import '../domain/plan.dart';

/// Etapa da timeline do Hoje, pronta para a tela.
class TodayBlockView {
  const TodayBlockView({
    required this.block,
    required this.time,
    required this.goalTitle,
    required this.title,
    required this.colorIndex,
    required this.durationLabel,
    required this.pill,
    required this.isNext,
    required this.done,
    required this.progressPct,
    required this.progressLabel,
  });

  final PlanBlock block;
  final String time;
  final String goalTitle;
  final String title;
  final int colorIndex;
  final String durationLabel;
  final String pill;
  final bool isNext;
  final bool done;
  final int progressPct;
  final String progressLabel;
}

class TodayLightView {
  const TodayLightView({required this.id, required this.title, required this.subtitle, required this.checked});

  final String id;
  final String title;
  final String subtitle;
  final bool checked;
}

class TodayItem {
  const TodayItem({required this.time, this.block, this.light});

  final String time;
  final TodayBlockView? block;
  final TodayLightView? light;

  bool get isBlock => block != null;
}

/// Hoje (M01).
class TodayController extends ChangeNotifier {
  TodayController(this._scheduling, this._goals, this._gamification, this._session, this._clock);

  final SchedulingRepository _scheduling;
  final GoalsRepository _goals;
  final GamificationRepository _gamification;
  final SessionStore _session;
  final Clock _clock;

  bool loading = true;
  String? error;
  GamificationSnapshot? gamification;
  DayPlan? _day;
  List<GoalSummary> _goalList = const [];
  final Map<String, GoalStep> _steps = {};
  List<({String id, String title, String subtitle, String time})> _lights = const [];
  final Set<String> _checked = {};

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final date = BoraFormat.dateKey(_clock.now());
      gamification = await _gamification.getSnapshot();
      _day = await _scheduling.getDayPlan(date);
      _goalList = await _goals.listGoals();
      _lights = [
        for (final t in await _scheduling.getLightTasks(date)) (id: t.id, title: t.title, subtitle: t.subtitle, time: t.time),
      ];
      _steps.clear();
      for (final goalId in _day!.blocks.map((b) => b.goalId).toSet()) {
        final detail = await _goals.getGoal(goalId);
        for (final s in detail.steps) {
          _steps[s.id] = s;
        }
      }
    } catch (_) {
      error = 'Não deu pra carregar o seu dia.';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  String get userName => _session.user?.name ?? '';

  String get dateLabel => BoraFormat.longDate(_clock.now());

  int get blockCount => _day?.blocks.length ?? 0;

  int get lightTaskCount => _lights.length;

  String get subtitle => '$dateLabel · ${_count(blockCount, 'etapa', 'etapas')} no plano';

  String get summary => '${_count(blockCount, 'etapa', 'etapas')} · ${_count(lightTaskCount, 'tarefa leve', 'tarefas leves')}';

  static String _count(int n, String one, String many) => '$n ${n == 1 ? one : many}';

  bool _stepDone(PlanBlock b) => b.status == 'done' || (_steps[b.stepId]?.isDone ?? false);

  /// A primeira etapa ainda não feita é a "Próxima" e é a da rampa.
  PlanBlock? get nextBlock {
    for (final b in _day?.blocks ?? const <PlanBlock>[]) {
      if (!_stepDone(b) && b.status != 'missed') return b;
    }
    return null;
  }

  List<TodayItem> get items {
    final next = nextBlock;
    final list = <TodayItem>[
      for (final b in _day?.blocks ?? const <PlanBlock>[])
        () {
          final time = BoraFormat.clock(b.start);
          final pct = _stepDone(b) ? 100 : (_steps[b.stepId]?.progressPct ?? 0);
          final done = _stepDone(b);
          return TodayItem(
            time: time,
            block: TodayBlockView(
              block: b,
              time: time,
              goalTitle: b.goalTitle,
              title: b.stepTitle,
              colorIndex: b.colorIndex,
              durationLabel: BoraFormat.duration(b.minutes),
              pill: done ? 'Concluída' : (identical(b, next) ? 'Próxima' : 'Hoje $time'),
              isNext: identical(b, next),
              done: done,
              progressPct: pct,
              progressLabel: done ? 'Feita hoje' : (pct > 0 ? '$pct% · continua de ontem' : ''),
            ),
          );
        }(),
      for (final l in _lights)
        TodayItem(
          time: l.time,
          light: TodayLightView(id: l.id, title: l.title, subtitle: l.subtitle, checked: _checked.contains(l.id)),
        ),
    ];
    int minutes(String t) {
      final p = t.split(':').map(int.parse).toList();
      return p[0] * 60 + p[1];
    }

    list.sort((a, b) => minutes(a.time).compareTo(minutes(b.time)));
    return list;
  }

  GoalSummary? get _nextGoal {
    final n = nextBlock;
    if (n == null) return null;
    return _goalList.where((g) => g.id == n.goalId).firstOrNull;
  }

  String? get slackLabel {
    final g = _nextGoal;
    if (g == null || g.slackDays == null) return null;
    return 'Folga até o prazo: ${BoraFormat.days(g.slackDays!)}';
  }

  String? get deadlineLabel {
    final g = _nextGoal;
    if (g == null || g.deadline == null) return null;
    return '· entrega ${BoraFormat.dayMonth(BoraFormat.parseDateKey(g.deadline!))}';
  }

  /// Marcar tarefa leve: só visual nesta fase (UC13 fora do contrato).
  void toggleLightTask(String id) {
    if (!_checked.remove(id)) _checked.add(id);
    notifyListeners();
  }
}
