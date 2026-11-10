import 'package:flutter/foundation.dart';

import '../../../core/format/bora_format.dart';
import '../data/goals_repository.dart';
import '../domain/goal.dart';

class GoalItemView {
  const GoalItemView({
    required this.id,
    required this.title,
    required this.colorIndex,
    required this.progress,
    required this.percentLabel,
    required this.meta,
  });

  final String id;
  final String title;
  final int colorIndex;
  final double progress;
  final String percentLabel;
  final String meta;
}

/// Objetivos (M02).
class GoalsController extends ChangeNotifier {
  GoalsController(this._repo);

  final GoalsRepository _repo;

  bool loading = true;
  String? error;
  List<GoalSummary> _goals = const [];

  Future<void> load() async {
    loading = true;
    notifyListeners();
    try {
      _goals = (await _repo.listGoals()).where((g) => g.status == 'active').toList();
    } catch (_) {
      error = 'Não deu pra carregar seus objetivos.';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  String get subtitle {
    final n = _goals.length;
    final dates = _goals.where((g) => g.deadline != null).map((g) => g.deadline!).toList()..sort();
    final base = '$n ${n == 1 ? 'ativo' : 'ativos'}';
    if (dates.isEmpty) return base;
    return '$base · próxima entrega ${BoraFormat.dayMonth(BoraFormat.parseDateKey(dates.first))}';
  }

  List<GoalItemView> get items => [
        for (final g in _goals)
          GoalItemView(
            id: g.id,
            title: g.title,
            colorIndex: g.colorIndex,
            progress: g.progressPct / 100,
            percentLabel: '${g.progressPct}%',
            meta: _meta(g),
          ),
      ];

  static String _meta(GoalSummary g) {
    if (g.deadline == null) return 'Sem prazo';
    final d = 'Entrega ${BoraFormat.dayMonth(BoraFormat.parseDateKey(g.deadline!))}';
    return g.slackDays == null ? d : '$d · folga de ${BoraFormat.days(g.slackDays!)}';
  }
}
