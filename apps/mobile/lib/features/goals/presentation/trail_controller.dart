import 'package:flutter/foundation.dart';

import '../../../core/format/bora_format.dart';
import '../data/goals_repository.dart';
import '../domain/goal.dart';

class TrailRowView {
  const TrailRowView({
    required this.number,
    required this.title,
    required this.meta,
    required this.duration,
    required this.done,
    required this.isNext,
  });

  final int number;
  final String title;
  final String meta;
  final String duration;
  final bool done;
  final bool isNext;
}

/// Trilha do objetivo (M18).
class TrailController extends ChangeNotifier {
  TrailController(this._repo, this.goalId);

  final GoalsRepository _repo;
  final String goalId;

  bool loading = true;
  String? error;
  GoalDetail? detail;
  int? _slackDays;

  Future<void> load() async {
    loading = true;
    notifyListeners();
    try {
      detail = await _repo.getGoal(goalId);
      _slackDays = (await _repo.listGoals()).where((g) => g.id == goalId).firstOrNull?.slackDays;
    } catch (_) {
      error = 'Não achei esse objetivo.';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  DateTime? get _deadline => detail?.goal.deadline == null ? null : BoraFormat.parseDateKey(detail!.goal.deadline!);

  String get title => detail?.goal.title ?? '';

  int get colorIndex => detail?.goal.colorIndex ?? 1;

  int get percent => detail?.progressPct ?? 0;

  String get deadlineLabel {
    final d = _deadline;
    if (d == null) return 'Sem prazo';
    return 'Entrega ${BoraFormat.dayMonth(d)} · ${BoraFormat.weekdayShort(d).toLowerCase()}';
  }

  String get summary {
    final d = detail;
    if (d == null) return '';
    final base = '${d.done} de ${d.total} etapas concluídas';
    if (_deadline == null || _slackDays == null) return base;
    return '$base · folga de ${BoraFormat.days(_slackDays!)}';
  }

  String get countLabel => '${detail?.total ?? 0} etapas';

  String get flagTitle {
    final d = _deadline;
    return d == null ? 'Sem prazo final' : 'Entrega final · ${BoraFormat.shortDate(d)}';
  }

  String get flagSubtitle => _deadline == null ? 'Objetivo contínuo' : title;

  List<TrailRowView> get rows {
    final steps = detail?.steps ?? const <GoalStep>[];
    final next = steps.indexWhere((s) => !s.isDone);
    return [
      for (var i = 0; i < steps.length; i++)
        TrailRowView(
          number: steps[i].order,
          title: steps[i].title,
          meta: steps[i].isDone
              ? 'Concluída'
              : steps[i].nextBlock == null
                  ? 'Sem data · será encaixada'
                  : '${BoraFormat.shortDate(steps[i].nextBlock!.start.toLocal())} · ${BoraFormat.hour(steps[i].nextBlock!.start)}',
          duration: BoraFormat.duration(steps[i].estimatedMinutes),
          done: steps[i].isDone,
          isNext: i == next,
        ),
    ];
  }
}
