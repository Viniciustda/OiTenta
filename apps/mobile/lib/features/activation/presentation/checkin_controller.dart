import 'package:flutter/foundation.dart';

import '../../../core/clock/clock.dart';
import '../data/activation_repository.dart';
import '../domain/ramp.dart';
import 'ramp_session.dart';

/// Check-in de energia e tempo (M05, bottom sheet sobre o Hoje).
class CheckinController extends ChangeNotifier {
  CheckinController(this._repo, this._session, this._clock, this.target);

  final ActivationRepository _repo;
  final RampSession _session;
  final Clock _clock;
  final RampTarget target;

  EnergyLevel? energy;
  AvailableTime? time;
  bool busy = false;
  String? error;

  bool get canBuild => energy != null && time != null && !busy;

  /// "Prefiro começar por tarefas leves" aparece com energia baixa.
  bool get showLightTasks => energy == EnergyLevel.low;

  void chooseEnergy(EnergyLevel e) {
    energy = e;
    notifyListeners();
  }

  void chooseTime(AvailableTime t) {
    time = t;
    notifyListeners();
  }

  /// Busca a rampa e guarda na sessão. Devolve `true` se deu certo.
  Future<bool> build() async {
    if (energy == null || time == null) return false;
    busy = true;
    error = null;
    notifyListeners();
    try {
      final ramp = await _repo.getRamp(
        goalId: target.goalId,
        stepId: target.stepId,
        energy: energy!,
        availableTime: time,
      );
      _session.start(
        target: target,
        energy: energy!,
        availableTime: time,
        ramp: ramp,
        startedAt: _clock.now(),
      );
      return true;
    } catch (_) {
      error = 'Não deu pra montar a rampa. Tenta de novo?';
      return false;
    } finally {
      busy = false;
      notifyListeners();
    }
  }
}
