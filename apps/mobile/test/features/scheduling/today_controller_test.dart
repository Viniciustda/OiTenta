import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/features/auth/data/session_store.dart';
import 'package:oitenta/features/auth/domain/auth_user.dart';
import 'package:oitenta/features/gamification/data/sample_gamification_repository.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';
import 'package:oitenta/features/scheduling/presentation/today_controller.dart';

void main() {
  late TodayController c;
  setUp(() async {
    final s = SessionStore()
      ..save(
        const AuthSession(
          token: 't',
          user: AuthUser(
            id: '1',
            name: 'Arthur',
            email: 'a@a',
            timezone: 'America/Sao_Paulo',
          ),
        ),
      );
    c = TodayController(
      SampleSchedulingRepository(),
      SampleGoalsRepository(),
      SampleGamificationRepository(),
      s,
      FixedClock(DateTime(2025, 11, 6, 9, 41)),
    );
    await c.load();
  });

  test('cabeçalho: nome, data e quantidade de etapas', () {
    expect(c.userName, 'Arthur');
    expect(c.dateLabel, 'Quinta, 6 de novembro');
    expect(c.blockCount, 3);
    expect(c.lightTaskCount, 2);
  });

  test('a timeline intercala etapas e tarefas leves por horário', () {
    expect(c.items.map((i) => i.time), [
      '10:00',
      '11:30',
      '14:00',
      '16:00',
      '19:00',
    ]);
    expect(c.items.map((i) => i.isBlock), [true, false, true, false, true]);
  });

  test(
    'a primeira etapa pendente é a "Próxima" e mostra o progresso parcial',
    () {
      final first = c.items.first.block!;
      expect(first.isNext, isTrue);
      expect(first.progressPct, 40);
      expect(first.progressLabel, '40% · continua de ontem');
      expect(first.durationLabel, '1h30');
      expect(c.items[2].block!.isNext, isFalse);
      expect(c.items[2].block!.pill, 'Hoje 14:00');
    },
  );

  test('folga do objetivo da próxima etapa', () {
    expect(c.slackLabel, 'Folga até o prazo: 2 dias');
    expect(c.deadlineLabel, '· entrega 20/11');
  });

  test('barra gamificada com os valores fixos (P18)', () {
    expect(c.gamification!.streak, 6);
    expect(c.gamification!.drops, 340);
  });

  test('marcar uma tarefa leve só muda o visual', () {
    c.toggleLightTask('grupo');
    expect(c.items[1].light!.checked, isTrue);
    c.toggleLightTask('grupo');
    expect(c.items[1].light!.checked, isFalse);
  });

  test('a próxima etapa leva goalId, stepId e blockId para a rampa', () {
    final n = c.nextBlock!;
    expect(n.goalId, 'goal-eng');
    expect(n.stepId, 'goal-eng-6');
    expect(n.id, isNotEmpty);
  });
}
