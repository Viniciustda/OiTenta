import 'package:flutter/foundation.dart';

import '../../auth/data/session_store.dart';
import '../data/scheduling_repository.dart';
import '../domain/availability.dart';

/// Onboarding em 6 passos (T01–T03 + placeholders, P27).
///
/// Passos: 1 placeholder · 2 boas-vindas (T01) · 3 placeholder ·
/// 4 grade por período (T02) · 5 limite diário (T03) · 6 placeholder.
class OnboardingController extends ChangeNotifier {
  OnboardingController(this._repo, this._session);

  final SchedulingRepository _repo;
  final SessionStore _session;

  static const totalSteps = 6;

  /// Colunas da grade (SEG … DOM) → `weekday` do contrato (0 = domingo).
  static const columnWeekday = [1, 2, 3, 4, 5, 6, 0];

  int step = 1;
  String? stuckAnswer;
  final Set<(int, FreePeriod)> _selected = {};
  int limitHours = 4;
  bool saving = false;
  String? error;

  double get progress => step / totalSteps;

  String get userName => _session.user?.name ?? '';

  void goTo(int s) {
    step = s.clamp(1, totalSteps);
    notifyListeners();
  }

  void next() => goTo(step + 1);

  void back() => goTo(step - 1);

  /// Resposta do T01. Não vai para o backend (sem campo no contrato).
  void chooseStuck(String answer) {
    stuckAnswer = answer;
    next();
  }

  bool isSelected(int column, FreePeriod p) => _selected.contains((column, p));

  void togglePeriod(int column, FreePeriod p) {
    if (!_selected.remove((column, p))) _selected.add((column, p));
    notifyListeners();
  }

  int get periodCount => _selected.length;

  /// "cerca de Xh livres por semana": 2h por período, como no protótipo (T02/T03).
  int get approxHours => periodCount * 2;

  bool get canContinueGrid => periodCount > 0;

  void setLimit(int hours) {
    limitHours = hours.clamp(1, 8);
    notifyListeners();
  }

  List<AvailabilityWindow> get windows {
    final list = _selected.toList()
      ..sort(
        (a, b) => a.$1 != b.$1
            ? a.$1.compareTo(b.$1)
            : a.$2.index.compareTo(b.$2.index),
      );
    return [
      for (final (col, p) in list)
        AvailabilityWindow(
          weekday: columnWeekday[col],
          startMinute: p.startMinute,
          endMinute: p.endMinute,
        ),
    ];
  }

  /// `PUT /scheduling/availability`; avança para o passo 6.
  Future<bool> save() async {
    saving = true;
    error = null;
    notifyListeners();
    try {
      await _repo.setAvailability(
        WeeklyAvailability(
          windows: windows,
          dailyLimitMinutes: limitHours * 60,
        ),
      );
      step = 6;
      return true;
    } catch (_) {
      error = 'Não deu pra salvar seus horários. Tenta de novo?';
      return false;
    } finally {
      saving = false;
      notifyListeners();
    }
  }
}
