import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/activation/data/sample_activation_repository.dart';
import 'package:oitenta/features/activation/domain/focus_session.dart';
import 'package:oitenta/features/activation/domain/ramp.dart';

void main() {
  final repo = SampleActivationRepository();

  Future<Ramp> ramp(EnergyLevel e, {String stepId = 'goal-eng-6'}) =>
      repo.getRamp(
        goalId: 'goal-eng',
        stepId: stepId,
        energy: e,
        availableTime: AvailableTime.m30,
      );

  test('a rampa tem os 5 degraus na ordem', () async {
    final r = await ramp(EnergyLevel.low);
    expect(r.steps.map((s) => s.kind), RampStepKind.values);
  });

  test(
    'degrau sugerido pela energia (P14): low→warmup, medium→challenge, high→micro, electric→focus',
    () async {
      expect((await ramp(EnergyLevel.low)).suggested, RampStepKind.warmup);
      expect(
        (await ramp(EnergyLevel.medium)).suggested,
        RampStepKind.challenge,
      );
      expect((await ramp(EnergyLevel.high)).suggested, RampStepKind.micro);
      expect((await ramp(EnergyLevel.electric)).suggested, RampStepKind.focus);
    },
  );

  test(
    'catálogo: 5 aquecimentos, 4 desafios com 5 contas, 4 focos (25 primeiro)',
    () async {
      final r = await ramp(EnergyLevel.low);
      expect(r.step(RampStepKind.warmup).options, hasLength(5));
      expect(
        r.step(RampStepKind.warmup).options.first.title,
        'Alongamento de 3 min',
      );
      expect(r.step(RampStepKind.warmup).options.first.durationSeconds, 180);
      expect(r.step(RampStepKind.challenge).options, hasLength(4));
      expect(
        r.step(RampStepKind.challenge).options.first.problems,
        hasLength(5),
      );
      expect(
        r.step(RampStepKind.challenge).options.first.problems.first.answer,
        43,
      );
      expect(r.step(RampStepKind.focus).options.map((o) => o.durationSeconds), [
        1500,
        900,
        600,
        2700,
      ]);
    },
  );

  test('micro-passos vêm da etapa', () async {
    final r = await ramp(EnergyLevel.low);
    expect(
      r.step(RampStepKind.micro).options.first.title,
      'Abra o arquivo do trabalho e escreva o título',
    );
  });

  test('etapa sem micro-passos usa o texto genérico (P6)', () async {
    final r = await ramp(EnergyLevel.low, stepId: 'goal-eng-7');
    expect(
      r.step(RampStepKind.micro).options.single.title,
      'Abra o material desta etapa e faça só a primeira linha: o título ou a primeira frase.',
    );
  });

  RecordSession session(SessionOutcome o, {int? pct}) => RecordSession(
    goalId: 'goal-eng',
    stepId: 'goal-eng-6',
    blockId: 'block-1',
    energy: EnergyLevel.medium,
    availableTime: AvailableTime.m30,
    startedAt: DateTime(2025, 11, 6, 10),
    endedAt: DateTime(2025, 11, 6, 10, 25),
    focusedMinutes: 25,
    outcome: o,
    partialPct: pct,
  );

  test('registrar done leva a etapa a 100%', () async {
    final r = await repo.recordSession(session(SessionOutcome.done));
    expect(r.stepProgressPct, 100);
    expect(r.stepStatus, 'done');
  });

  test('registrar partial 70 leva a etapa a 70%', () async {
    final r = await repo.recordSession(
      session(SessionOutcome.partial, pct: 70),
    );
    expect(r.stepProgressPct, 70);
    expect(r.stepStatus, 'pending');
  });

  test('partial sem % falha (422)', () async {
    expect(
      () => repo.recordSession(session(SessionOutcome.partial)),
      throwsA(isA<ArgumentError>()),
    );
  });

  test('o corpo segue o contrato', () {
    final j = session(SessionOutcome.notDone).toJson();
    expect(j['outcome'], 'not_done');
    expect(j['energy'], 'medium');
    expect(j['availableTime'], '30m');
    expect(j.containsKey('partialPct'), isFalse);
  });
}
