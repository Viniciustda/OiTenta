import 'package:flutter/foundation.dart';

import '../domain/ramp.dart';
import 'ladder_controller.dart';
import 'ramp_session.dart';

enum ChallengeFeedback { none, correct, wrong, reveal }

/// Desafio mental (M08): 5 contas com teclado numérico.
class ChallengeController extends ChangeNotifier with RampSwap {
  ChallengeController(this.session);

  @override
  final RampSession session;

  int _i = 0;
  int _tries = 0;
  String input = '';
  ChallengeFeedback feedback = ChallengeFeedback.none;
  bool finished = false;

  List<ChallengeProblem> get _problems =>
      session.option(RampStepKind.challenge).problems;

  ChallengeProblem get problem => _problems[_i];

  int get number => _i + 1;

  /// Índice da conta atual (0–4), para os pontos de progresso.
  int get problemIndex => _i;

  String get problemLabel => '${problem.a} ${problem.op} ${problem.b} =';

  /// Aguardando a próxima conta (a tela chama [next] depois de uma pausa).
  bool get waitingNext =>
      feedback == ChallengeFeedback.correct ||
      feedback == ChallengeFeedback.reveal;

  void press(String key) {
    if (waitingNext || finished) return;
    if (key == 'del') {
      if (input.isNotEmpty) input = input.substring(0, input.length - 1);
    } else if (key == 'ok') {
      _check();
    } else if (input.length < 3) {
      input += key;
      feedback = ChallengeFeedback.none;
    }
    notifyListeners();
  }

  void _check() {
    if (input.isEmpty) return;
    if (int.parse(input) == problem.answer) {
      feedback = ChallengeFeedback.correct;
    } else if (_tries == 0) {
      feedback = ChallengeFeedback.wrong;
      _tries = 1;
      input = '';
    } else {
      feedback = ChallengeFeedback.reveal;
      input = '${problem.answer}';
    }
  }

  /// Vai para a próxima conta; depois da 5ª, conclui o degrau.
  void next() {
    if (!waitingNext) return;
    if (_i >= 4) {
      finished = true;
      session.complete(RampStepKind.challenge);
    } else {
      _i++;
      _tries = 0;
      input = '';
      feedback = ChallengeFeedback.none;
    }
    notifyListeners();
  }

  @override
  void onSwapped() {
    _i = 0;
    _tries = 0;
    input = '';
    feedback = ChallengeFeedback.none;
  }

  void skipToTask() => session.currentIndex = 2;
}
