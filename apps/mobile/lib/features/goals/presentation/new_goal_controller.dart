import 'package:flutter/foundation.dart';

import '../../../core/format/bora_format.dart';
import '../data/goals_repository.dart';
import '../domain/goal.dart';

/// Tempos das etapas (chips da trilha do protótipo, P5).
const stepDurations = <(String, int)>[
  ('15 min', 15),
  ('30 min', 30),
  ('45 min', 45),
  ('1h', 60),
  ('1h30', 90),
  ('2h', 120),
];

class DraftStep {
  const DraftStep(this.title, this.minutes);

  final String title;
  final int minutes;
}

/// Novo objetivo com etapas (M15 começando vazia, P20).
class NewGoalController extends ChangeNotifier {
  NewGoalController(this._repo);

  final GoalsRepository _repo;

  String title = '';
  DateTime? deadline;
  final List<DraftStep> steps = [];
  bool adding = false;
  String addTitle = '';
  int addMinutes = 60;
  bool busy = false;
  String? error;

  int get totalMinutes => steps.fold(0, (t, s) => t + s.minutes);

  String get totalLabel => '${BoraFormat.total(totalMinutes)} no total';

  bool get canSubmit => title.trim().isNotEmpty && steps.isNotEmpty && !busy;

  void setTitle(String v) {
    title = v;
    notifyListeners();
  }

  void setDeadline(DateTime? d) {
    deadline = d;
    notifyListeners();
  }

  void openAdd() {
    adding = true;
    addTitle = '';
    addMinutes = 60;
    notifyListeners();
  }

  void cancelAdd() {
    adding = false;
    notifyListeners();
  }

  void setAddTitle(String v) {
    addTitle = v;
    notifyListeners();
  }

  void setAddMinutes(int m) {
    addMinutes = m;
    notifyListeners();
  }

  void confirmAdd() {
    if (addTitle.trim().isEmpty) return;
    steps.add(DraftStep(addTitle.trim(), addMinutes));
    adding = false;
    addTitle = '';
    notifyListeners();
  }

  void removeStep(int i) {
    steps.removeAt(i);
    notifyListeners();
  }

  /// `POST /goals` com `kind 'goal'`.
  Future<CreateGoalResult?> submit() async {
    if (!canSubmit) return null;
    busy = true;
    error = null;
    notifyListeners();
    try {
      return await _repo.createGoal(
        NewGoal(
          title: title.trim(),
          deadline: deadline == null ? null : BoraFormat.dateKey(deadline!),
          kind: 'goal',
          steps: [
            for (final s in steps)
              NewStep(title: s.title, estimatedMinutes: s.minutes),
          ],
        ),
      );
    } catch (_) {
      error = 'Não deu pra criar o objetivo. Confere os dados?';
      return null;
    } finally {
      busy = false;
      notifyListeners();
    }
  }
}
