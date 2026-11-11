import 'package:flutter/foundation.dart';

import '../../../core/clock/clock.dart';
import '../data/activation_repository.dart';
import '../domain/focus_session.dart';
import 'ramp_session.dart';

/// Registro de progresso (M11): Concluí / Parcial / Não rolou.
class LogController extends ChangeNotifier {
  LogController(this._repo, this.session, this._clock);

  final ActivationRepository _repo;
  final RampSession session;
  final Clock _clock;

  SessionOutcome? outcome;
  int partialPct = 70;
  bool busy = false;
  String? error;

  String get title => 'Quanto você avançou em ‘${session.target!.stepTitle}’?';

  String get subtitle =>
      'Você focou ${session.focusedMinutes} min. Qualquer avanço conta.';

  bool get canSubmit => outcome != null && !busy;

  void choose(SessionOutcome o) {
    outcome = o;
    notifyListeners();
  }

  /// Slider de 5 em 5; o parcial fica entre 5 e 95 (modelagem: 1–99).
  void setPartial(int pct) {
    final v = (pct / 5).round() * 5;
    partialPct = v.clamp(5, 95);
    notifyListeners();
  }

  Future<bool> submit() async {
    if (outcome == null) return false;
    final t = session.target!;
    busy = true;
    error = null;
    notifyListeners();
    try {
      await _repo.recordSession(
        RecordSession(
          goalId: t.goalId,
          stepId: t.stepId,
          blockId: t.blockId,
          energy: session.energy!,
          availableTime: session.availableTime,
          startedAt: session.startedAt!,
          endedAt: _clock.now(),
          focusedMinutes: session.focusedMinutes,
          outcome: outcome!,
          partialPct: outcome == SessionOutcome.partial ? partialPct : null,
        ),
      );
      session.outcome = outcome;
      session.partialPct = outcome == SessionOutcome.partial
          ? partialPct
          : null;
      session.done[4] = true;
      return true;
    } catch (_) {
      error = 'Não deu pra registrar. Tenta de novo?';
      return false;
    } finally {
      busy = false;
      notifyListeners();
    }
  }
}
