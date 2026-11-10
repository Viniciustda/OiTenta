import '../domain/focus_session.dart';
import '../domain/ramp.dart';

/// Etapa do plano para a qual a rampa é montada (vem do Hoje).
class RampTarget {
  const RampTarget({
    required this.goalId,
    required this.stepId,
    required this.blockId,
    required this.goalTitle,
    required this.stepTitle,
    required this.colorIndex,
  });

  final String goalId;
  final String stepId;
  final String? blockId;
  final String goalTitle;
  final String stepTitle;
  final int colorIndex;
}

/// Estado compartilhado entre as telas da rampa (M05–M12): a etapa, o
/// check-in, a rampa recebida, o degrau atual e o resultado. Não é um
/// controlador: cada tela tem o seu `ChangeNotifier`, que lê e escreve aqui.
class RampSession {
  RampTarget? target;
  EnergyLevel? energy;
  AvailableTime? availableTime;
  Ramp? ramp;
  DateTime? startedAt;
  int currentIndex = 0;
  List<bool> done = List.filled(5, false);
  final Map<RampStepKind, int> _option = {};
  int focusedMinutes = 0;
  SessionOutcome? outcome;
  int? partialPct;

  void start({
    required RampTarget target,
    required EnergyLevel energy,
    required AvailableTime? availableTime,
    required Ramp ramp,
    required DateTime startedAt,
  }) {
    this.target = target;
    this.energy = energy;
    this.availableTime = availableTime;
    this.ramp = ramp;
    this.startedAt = startedAt;
    currentIndex = RampStepKind.values.indexOf(ramp.suggested);
    done = List.filled(5, false);
    _option.clear();
    focusedMinutes = 0;
    outcome = null;
    partialPct = null;
  }

  RampStepKind kindAt(int index) => RampStepKind.values[index];

  int optionIndex(RampStepKind kind) => _option[kind] ?? 0;

  RampOption option(RampStepKind kind) => ramp!.step(kind).options[optionIndex(kind)];

  List<RampOption> options(RampStepKind kind) => ramp!.step(kind).options;

  void swap(RampStepKind kind, int index) => _option[kind] = index;

  /// Marca o degrau como feito e vai para o próximo.
  void complete(RampStepKind kind) {
    final i = RampStepKind.values.indexOf(kind);
    done[i] = true;
    currentIndex = i + 1 > 4 ? 4 : i + 1;
  }

  int get warmupMinutes => (option(RampStepKind.warmup).durationSeconds ?? 0) ~/ 60;

  int get focusMinutes => (option(RampStepKind.focus).durationSeconds ?? 0) ~/ 60;

  /// Minutos de rampa antes do foco (protótipo: aquecimento + 3).
  int get rampMinutes => warmupMinutes + 3;
}
