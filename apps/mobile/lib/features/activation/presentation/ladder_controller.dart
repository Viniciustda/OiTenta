import 'package:flutter/foundation.dart';

import '../domain/ramp.dart';
import 'ramp_session.dart';

/// Degrau da escada pronto para a tela.
class LadderStepView {
  const LadderStepView({
    required this.kind,
    required this.name,
    required this.duration,
    required this.icon,
    required this.current,
    required this.done,
    required this.skipped,
    required this.suggested,
  });

  final RampStepKind kind;
  final String name;
  final String duration;
  final String icon;
  final bool current;
  final bool done;
  final bool skipped;
  final bool suggested;
}

/// Opção para o sheet "Trocar".
class SwapOptionView {
  const SwapOptionView({
    required this.index,
    required this.title,
    required this.description,
    required this.icon,
  });

  final int index;
  final String title;
  final String description;
  final String icon;
}

const rampStepNames = [
  'Aquecer',
  'Desafio',
  'Micro-passo',
  'Foco',
  'Registrar',
];
const rampStepFullNames = [
  'Aquecer',
  'Desafio mental',
  'Micro-passo',
  'Foco',
  'Registrar',
];
const rampStepIcons = [
  'person-simple-walk',
  'calculator',
  'footprints',
  'timer',
  'check-circle',
];

/// Lógica comum do "Trocar" (escada e cabeçalho da rampa).
mixin RampSwap on ChangeNotifier {
  RampSession get session;

  int get swapIndex => session.currentIndex;

  RampStepKind get swapKind => session.kindAt(swapIndex);

  String get swapTitle =>
      'Trocar ${rampStepFullNames[swapIndex].toLowerCase()}';

  String get swapSubtitle =>
      'Agora: ${session.option(swapKind).title}. Escolha outro jeito:';

  List<SwapOptionView> get swapOptions {
    final cur = session.optionIndex(swapKind);
    final list = session.options(swapKind);
    return [
      for (var i = 0; i < list.length; i++)
        if (i != cur)
          SwapOptionView(
            index: i,
            title: list[i].title,
            description: '${list[i].durationLabel} · ${list[i].description}',
            icon: list[i].icon,
          ),
    ];
  }

  void swap(int index) {
    session.swap(swapKind, index);
    onSwapped();
    notifyListeners();
  }

  void onSwapped() {}
}

/// Duração do degrau Registrar na escada (design system, "5 Registrar 1 min").
/// O backend devolve o degrau `log` sem opções (modelagem 4.1, item 4).
const registerDurationLabel = '1 min';

/// Escada da rampa (M06).
class LadderController extends ChangeNotifier with RampSwap {
  LadderController(this.session);

  @override
  final RampSession session;

  int get index => session.currentIndex;

  String get subtitle =>
      '${session.rampMinutes} min de rampa e ${session.focusMinutes} min de foco em “${session.target!.stepTitle}”';

  List<LadderStepView> get steps => [
    for (var i = 0; i < 5; i++)
      LadderStepView(
        kind: session.kindAt(i),
        name: rampStepNames[i],
        duration: session.options(session.kindAt(i)).isEmpty
            ? registerDurationLabel
            : session.option(session.kindAt(i)).durationLabel,
        icon: rampStepIcons[i],
        current: i == index,
        done: session.done[i],
        skipped: i < index && !session.done[i],
        suggested: session.ramp!.suggested == session.kindAt(i),
      ),
  ];

  String get caption =>
      'Degrau ${index + 1} de 5 · ${rampStepFullNames[index]}';

  RampOption get currentOption => session.option(session.kindAt(index));

  bool get canSkip => index < 2;

  bool get canSwap => index < 4;

  void select(int i) {
    session.currentIndex = i;
    notifyListeners();
  }

  /// "Pular pra tarefa": vai direto ao micro-passo.
  void skipToTask() {
    session.currentIndex = 2;
    notifyListeners();
  }
}
