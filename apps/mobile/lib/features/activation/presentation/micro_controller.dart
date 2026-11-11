import 'package:flutter/foundation.dart';

import '../domain/ramp.dart';
import 'ladder_controller.dart';
import 'ramp_session.dart';

/// Micro-passo (M09).
class MicroController extends ChangeNotifier with RampSwap {
  MicroController(this.session);

  @override
  final RampSession session;

  String get text => session.option(RampStepKind.micro).title;

  String get context =>
      '${session.target!.goalTitle} · ${session.target!.stepTitle}';

  int get colorIndex => session.target!.colorIndex;

  void done() {
    session.complete(RampStepKind.micro);
    notifyListeners();
  }
}
