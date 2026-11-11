import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/activation/data/sample_activation_repository.dart';
import 'package:oitenta/features/activation/domain/ramp.dart';

void main() {
  test('RampOption lê e escreve stepKind e operation (ramp.types.ts)', () {
    final json = {
      'id': 'c1',
      'stepKind': 'challenge',
      'title': '5 contas misturadas',
      'durationLabel': '2 min',
      'durationSeconds': 120,
      'description': 'Soma, subtração e tabuada',
      'icon': 'calculator',
      'operation': 'mix',
      'problems': [
        {'a': 17, 'b': 26, 'op': '+'},
      ],
    };
    final o = RampOption.fromJson(json);
    expect(o.stepKind, RampStepKind.challenge);
    expect(o.operation, 'mix');
    final back = o.toJson();
    expect(back['stepKind'], 'challenge');
    expect(back['operation'], 'mix');
    expect(back['problems'], [
      {'a': 17, 'b': 26, 'op': '+'},
    ]);
  });

  test('operation é opcional e não vai no JSON quando ausente', () {
    final o = RampOption.fromJson({
      'id': 'w1',
      'stepKind': 'warmup',
      'title': 'Alongamento de 3 min',
      'durationLabel': '3 min',
      'description': 'Ombros',
      'icon': 'person-simple-walk',
    });
    expect(o.operation, isNull);
    expect(o.toJson().containsKey('operation'), isFalse);
    expect(o.toJson().containsKey('durationSeconds'), isFalse);
  });

  test(
    'a rampa de exemplo traz stepKind em cada opção e operation nos desafios',
    () async {
      final r = await SampleActivationRepository().getRamp(
        goalId: 'goal-eng',
        stepId: 'goal-eng-6',
        energy: EnergyLevel.low,
      );
      for (final s in r.steps) {
        expect(s.options.every((o) => o.stepKind == s.kind), isTrue);
      }
      expect(r.step(RampStepKind.challenge).options.map((o) => o.operation), [
        '+',
        '−',
        '×',
        'mix',
      ]);
    },
  );
}
