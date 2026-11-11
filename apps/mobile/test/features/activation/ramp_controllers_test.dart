import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/features/activation/data/sample_activation_repository.dart';
import 'package:oitenta/features/activation/domain/focus_session.dart';
import 'package:oitenta/features/activation/domain/ramp.dart';
import 'package:oitenta/features/activation/presentation/celebration_controller.dart';
import 'package:oitenta/features/activation/presentation/challenge_controller.dart';
import 'package:oitenta/features/activation/presentation/checkin_controller.dart';
import 'package:oitenta/features/activation/presentation/focus_controller.dart';
import 'package:oitenta/features/activation/presentation/ladder_controller.dart';
import 'package:oitenta/features/activation/presentation/log_controller.dart';
import 'package:oitenta/features/activation/presentation/micro_controller.dart';
import 'package:oitenta/features/activation/presentation/ramp_session.dart';
import 'package:oitenta/features/activation/presentation/warmup_controller.dart';
import 'package:oitenta/features/gamification/data/sample_gamification_repository.dart';

const target = RampTarget(
  goalId: 'goal-eng',
  stepId: 'goal-eng-6',
  blockId: 'block-6-0',
  goalTitle: 'Eng. de Software',
  stepTitle: 'Diagrama de casos de uso',
  colorIndex: 1,
);

void main() {
  final clock = FixedClock(DateTime(2025, 11, 6, 10));
  late RampSession session;

  Future<void> checkin(EnergyLevel e) async {
    session = RampSession();
    final c = CheckinController(
      SampleActivationRepository(),
      session,
      clock,
      target,
    );
    c.chooseEnergy(e);
    c.chooseTime(AvailableTime.m30);
    expect(c.canBuild, isTrue);
    expect(await c.build(), isTrue);
  }

  group('check-in (M05)', () {
    test('só monta a rampa com energia e tempo', () async {
      final c = CheckinController(
        SampleActivationRepository(),
        RampSession(),
        clock,
        target,
      );
      expect(c.canBuild, isFalse);
      c.chooseEnergy(EnergyLevel.low);
      expect(c.canBuild, isFalse);
      expect(c.showLightTasks, isTrue);
      c.chooseTime(AvailableTime.h1);
      expect(c.canBuild, isTrue);
    });

    test('monta a rampa e começa no degrau sugerido', () async {
      await checkin(EnergyLevel.medium);
      expect(session.ramp!.suggested, RampStepKind.challenge);
      expect(session.currentIndex, 1);
      expect(session.energy, EnergyLevel.medium);
    });
  });

  group('escada (M06)', () {
    test(
      'degrau Registrar sem opções (como o backend devolve) não quebra a escada',
      () async {
        await checkin(EnergyLevel.electric);
        final r = session.ramp!;
        session.start(
          target: target,
          energy: EnergyLevel.electric,
          availableTime: AvailableTime.h1,
          ramp: Ramp(
            suggested: r.suggested,
            steps: [
              for (final s in r.steps)
                s.kind == RampStepKind.log
                    ? const RampStep(kind: RampStepKind.log, options: [])
                    : s,
            ],
          ),
          startedAt: clock.now(),
        );
        final c = LadderController(session);
        expect(c.steps.last.duration, '1 min');
        expect(c.caption, 'Degrau 4 de 5 · Foco');
        // Tocar no 5º degrau (Registrar, sem opção) não seleciona nada.
        c.select(4);
        expect(c.index, 3);
        expect(c.caption, 'Degrau 4 de 5 · Foco');
        expect(c.currentOption.stepKind, RampStepKind.focus);
      },
    );

    test('subtítulo, degraus e seleção', () async {
      await checkin(EnergyLevel.low);
      final c = LadderController(session);
      expect(
        c.subtitle,
        '6 min de rampa e 25 min de foco em “Diagrama de casos de uso”',
      );
      expect(c.steps.map((s) => s.name), [
        'Aquecer',
        'Desafio',
        'Micro-passo',
        'Foco',
        'Registrar',
      ]);
      expect(c.steps.map((s) => s.duration), [
        '3 min',
        '2 min',
        '1 min',
        '25 min',
        '1 min',
      ]);
      expect(c.steps.first.suggested, isTrue);
      expect(c.caption, 'Degrau 1 de 5 · Aquecer');
      expect(c.currentOption.title, 'Alongamento de 3 min');
      c.select(3);
      expect(c.caption, 'Degrau 4 de 5 · Foco');
      expect(c.canSkip, isFalse);
      expect(c.canSwap, isTrue);
      // Registrar (sem opção, como no backend) não é selecionável.
      c.select(4);
      expect(c.caption, 'Degrau 4 de 5 · Foco');
    });

    test('trocar a opção do degrau atual', () async {
      await checkin(EnergyLevel.low);
      final c = LadderController(session);
      expect(c.swapOptions.map((o) => o.index), [1, 2, 3, 4]);
      c.swap(1);
      expect(c.currentOption.title, 'Água e 5 respirações');
      expect(c.subtitle, startsWith('5 min de rampa'));
    });

    test('pular pra tarefa vai para o micro-passo', () async {
      await checkin(EnergyLevel.low);
      final c = LadderController(session);
      c.skipToTask();
      expect(session.currentIndex, 2);
    });
  });

  group('aquecimento (M07)', () {
    test('o timer desce e o botão muda no fim', () async {
      await checkin(EnergyLevel.low);
      final c = WarmupController(session);
      expect(c.title, 'Alongamento de 3 min');
      expect(c.timeLabel, '03:00');
      expect(c.buttonLabel, 'Já terminei');
      c.tick(const Duration(seconds: 30));
      expect(c.timeLabel, '02:30');
      expect(c.progress, closeTo(30 / 180, .001));
      c.tick(const Duration(minutes: 5));
      expect(c.finished, isTrue);
      expect(c.buttonLabel, 'Próximo degrau');
      c.complete();
      expect(session.currentIndex, 1);
      expect(session.done[0], isTrue);
    });
  });

  group('desafio (M08)', () {
    test('acerto, erro e resposta mostrada', () async {
      await checkin(EnergyLevel.medium);
      final c = ChallengeController(session);
      expect(c.number, 1);
      expect(c.problemLabel, '17 + 26 =');
      c.press('4');
      c.press('3');
      c.press('ok');
      expect(c.feedback, ChallengeFeedback.correct);
      c.next();
      expect(c.number, 2);
      c.press('1');
      c.press('ok');
      expect(c.feedback, ChallengeFeedback.wrong);
      expect(c.input, '');
      c.press('2');
      c.press('ok');
      expect(c.feedback, ChallengeFeedback.reveal);
      expect(c.input, '53');
      c.press('del');
      expect(c.input, '53');
    });

    test('depois da 5ª conta vai para o micro-passo', () async {
      await checkin(EnergyLevel.medium);
      final c = ChallengeController(session);
      for (var i = 0; i < 5; i++) {
        c.press('0');
        c.press('ok');
        c.press('0');
        c.press('ok');
        c.next();
      }
      expect(c.finished, isTrue);
      expect(session.currentIndex, 2);
      expect(session.done[1], isTrue);
    });
  });

  group('micro-passo (M09)', () {
    test('texto da etapa e "Feito!" vai para o foco', () async {
      await checkin(EnergyLevel.high);
      final c = MicroController(session);
      expect(c.text, 'Abra o arquivo do trabalho e escreva o título');
      expect(c.context, 'Eng. de Software · Diagrama de casos de uso');
      c.done();
      expect(session.currentIndex, 3);
    });
  });

  group('foco (M10)', () {
    test('timer de 25 min e encerrar guarda os minutos focados', () async {
      await checkin(EnergyLevel.electric);
      final c = FocusController(session);
      expect(c.timeLabel, '25:00');
      expect(c.ofLabel, 'foco · de 25 min');
      c.tick(const Duration(minutes: 10));
      expect(c.timeLabel, '15:00');
      c.end();
      expect(session.focusedMinutes, 10);
      expect(session.currentIndex, 4);
    });

    test('o timer chegando a zero encerra sozinho', () async {
      await checkin(EnergyLevel.electric);
      final c = FocusController(session);
      c.tick(const Duration(minutes: 30));
      expect(c.ended, isTrue);
      expect(session.focusedMinutes, 25);
    });
  });

  group('registro (M11) e celebração (M12)', () {
    test(
      'título, só registra com uma opção, parcial com 70% por padrão',
      () async {
        await checkin(EnergyLevel.medium);
        session.focusedMinutes = 25;
        final c = LogController(SampleActivationRepository(), session, clock);
        expect(c.title, 'Quanto você avançou em ‘Diagrama de casos de uso’?');
        expect(c.subtitle, 'Você focou 25 min. Qualquer avanço conta.');
        expect(c.canSubmit, isFalse);
        c.choose(SessionOutcome.partial);
        expect(c.partialPct, 70);
        c.setPartial(100);
        expect(c.partialPct, 95);
        c.setPartial(0);
        expect(c.partialPct, 5);
        expect(await c.submit(), isTrue);
        expect(session.outcome, SessionOutcome.partial);
        expect(session.partialPct, 5);
      },
    );

    test('celebração de etapa concluída com os valores fixos (P18)', () async {
      await checkin(EnergyLevel.medium);
      session.outcome = SessionOutcome.done;
      final c = CelebrationController(SampleGamificationRepository(), session);
      await c.load();
      expect(c.dropsLabel, '+20');
      expect(c.subtitle, 'Etapa concluída: Diagrama de casos de uso');
      expect(c.levelLabel, 'Nível 7');
      expect(c.xpLabel, '435 / 480 XP');
      expect(c.meta, '+25 XP de foco · 45 min até o Nível 8');
    });

    test('celebração de parcial', () async {
      await checkin(EnergyLevel.medium);
      session.outcome = SessionOutcome.partial;
      session.partialPct = 70;
      final c = CelebrationController(SampleGamificationRepository(), session);
      await c.load();
      expect(c.dropsLabel, '+10');
      expect(c.subtitle, '70% de Diagrama de casos de uso');
    });
  });
}
