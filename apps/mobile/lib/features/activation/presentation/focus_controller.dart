import 'package:flutter/foundation.dart';

import '../../../core/format/bora_format.dart';
import '../domain/ramp.dart';
import 'ramp_session.dart';

/// Sessão de foco (M10).
class FocusController extends ChangeNotifier {
  FocusController(this.session) {
    total = session.focusMinutes * 60;
    remaining = total.toDouble();
  }

  final RampSession session;

  late int total;
  late double remaining;
  bool ended = false;

  String get goalTitle => session.target!.goalTitle;

  String get stepTitle => session.target!.stepTitle;

  int get colorIndex => session.target!.colorIndex;

  String get timeLabel => BoraFormat.timer(remaining.ceil());

  String get ofLabel => 'foco · de ${total ~/ 60} min';

  double get progress => total == 0 ? 1 : 1 - remaining / total;

  void tick(Duration d) {
    if (ended) return;
    remaining = (remaining - d.inMilliseconds / 1000).clamp(
      0,
      total.toDouble(),
    );
    if (remaining <= 0) {
      end();
    } else {
      notifyListeners();
    }
  }

  /// "Encerrar": guarda os minutos focados e vai para o registro.
  void end() {
    if (ended) return;
    ended = true;
    final minutes = ((total - remaining) / 60).round();
    session.focusedMinutes = minutes < 1 ? 1 : minutes;
    session.complete(RampStepKind.focus);
    notifyListeners();
  }
}
