import 'package:flutter/foundation.dart';

import '../../../core/format/bora_format.dart';
import '../data/goals_repository.dart';
import '../domain/goal.dart';
import '../domain/goal_suggestion.dart';

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
  const DraftStep(
    this.title,
    this.minutes, {
    this.aiMinutes,
    this.microSteps = const [],
  });

  final String title;
  final int minutes;

  /// Estimativa original da IA (IA1); `null` na etapa criada pelo usuário.
  final int? aiMinutes;
  final List<String> microSteps;
}

/// Novo objetivo com etapas (M15). Começa vazia no caminho manual (P20) ou
/// preenchida com a resposta da IA ([suggestion], chat M13–M14); nos dois
/// casos tudo é editável antes de distribuir.
class NewGoalController extends ChangeNotifier {
  NewGoalController(this._repo, {GoalSuggestion? suggestion})
    : suggested = suggestion != null {
    if (suggestion == null) return;
    title = suggestion.title;
    deadline = suggestion.deadline == null
        ? null
        : BoraFormat.parseDateKey(suggestion.deadline!);
    steps.addAll([
      for (final s in suggestion.steps)
        DraftStep(
          s.title,
          s.estimatedMinutes,
          aiMinutes: s.aiEstimatedMinutes ?? s.estimatedMinutes,
          microSteps: s.microSteps,
        ),
    ]);
  }

  /// As etapas vieram da IA ("Etapas sugeridas" na M15).
  final bool suggested;

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

  /// `POST /goals` com `kind 'goal'`. Quando veio da IA, manda também
  /// `source: 'ai'`, a estimativa original da IA e os micro-passos (IA1).
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
          source: suggested ? 'ai' : null,
          steps: [
            for (final s in steps)
              NewStep(
                title: s.title,
                estimatedMinutes: s.minutes,
                microSteps: s.microSteps,
                aiEstimatedMinutes: s.aiMinutes,
              ),
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
