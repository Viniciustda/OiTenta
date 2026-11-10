import 'package:flutter/foundation.dart';

import '../../../core/format/bora_format.dart';
import '../domain/ramp.dart';
import 'ladder_controller.dart';
import 'ramp_session.dart';

/// Aquecimento (M07): timer regressivo e passos.
class WarmupController extends ChangeNotifier with RampSwap {
  WarmupController(this.session) {
    _reset();
  }

  @override
  final RampSession session;

  late int totalSeconds;
  late double remaining;

  void _reset() {
    totalSeconds = session.option(RampStepKind.warmup).durationSeconds ?? 0;
    remaining = totalSeconds.toDouble();
  }

  RampOption get option => session.option(RampStepKind.warmup);

  String get title => option.title;

  List<String> get steps => option.steps;

  bool get finished => remaining <= 0;

  String get timeLabel => BoraFormat.timer(remaining.ceil());

  String get ringLabel => finished ? 'pronto' : 'aquecimento';

  String get buttonLabel => finished ? 'Próximo degrau' : 'Já terminei';

  double get progress => totalSeconds == 0 ? 1 : 1 - remaining / totalSeconds;

  void tick(Duration d) {
    if (finished) return;
    remaining = (remaining - d.inMilliseconds / 1000).clamp(0, totalSeconds.toDouble());
    notifyListeners();
  }

  @override
  void onSwapped() => _reset();

  void complete() {
    session.complete(RampStepKind.warmup);
    notifyListeners();
  }

  void skipToTask() => session.currentIndex = 2;
}
