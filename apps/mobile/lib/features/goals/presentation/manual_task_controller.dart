import 'package:flutter/foundation.dart';

import '../../../core/format/bora_format.dart';
import '../data/goals_repository.dart';
import '../domain/goal.dart';

/// Chips de "Tempo estimado" do M16.
const manualDurations = <(String, int?)>[
  ('15 min', 15),
  ('30 min', 30),
  ('1h', 60),
  ('1h30', 90),
  ('2h', 120),
  ('Personalizado', null),
];

/// "Preencher à mão" (M16): tarefa única (`kind 'single'`, P20).
class ManualTaskController extends ChangeNotifier {
  ManualTaskController(this._repo);

  final GoalsRepository _repo;

  String title = '';
  String durationChoice = '1h';
  String custom = '';
  DateTime? deadline;
  bool busy = false;
  String? error;

  /// Só "Deixar a IA encaixar" nesta fase (o contrato não recebe dia e hora).
  bool get letAiSchedule => true;

  bool get showCustom => durationChoice == 'Personalizado';

  int? get minutes {
    if (showCustom) return int.tryParse(custom);
    return manualDurations.firstWhere((d) => d.$1 == durationChoice).$2;
  }

  bool get _validMinutes {
    final m = minutes;
    return m != null && m >= 15 && m % 15 == 0;
  }

  bool get canSave => title.trim().isNotEmpty && _validMinutes && !busy;

  void setTitle(String v) {
    title = v;
    notifyListeners();
  }

  void chooseDuration(String label) {
    durationChoice = label;
    notifyListeners();
  }

  void setCustom(String v) {
    custom = v.replaceAll(RegExp(r'\D'), '');
    if (custom.length > 3) custom = custom.substring(0, 3);
    notifyListeners();
  }

  void setDeadline(DateTime? d) {
    deadline = d;
    notifyListeners();
  }

  Future<CreateGoalResult?> save() async {
    if (!canSave) return null;
    busy = true;
    error = null;
    notifyListeners();
    try {
      return await _repo.createGoal(NewGoal(
        title: title.trim(),
        deadline: deadline == null ? null : BoraFormat.dateKey(deadline!),
        kind: 'single',
        steps: [NewStep(title: title.trim(), estimatedMinutes: minutes!)],
      ));
    } catch (_) {
      error = 'Não deu pra salvar a tarefa.';
      return null;
    } finally {
      busy = false;
      notifyListeners();
    }
  }
}
