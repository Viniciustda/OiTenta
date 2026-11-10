import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/gamification/data/sample_gamification_repository.dart';

void main() {
  final repo = SampleGamificationRepository();

  test('barra com os valores fixos do protótipo (P18)', () async {
    final s = await repo.getSnapshot();
    expect([s.streak, s.drops, s.level, s.xp, s.levelXp], [6, 340, 7, 410, 480]);
  });

  test('celebração: +20 gotas e 435/480 XP; parcial dá +10', () async {
    final c = await repo.getCelebration(partial: false);
    expect(c.drops, 20);
    expect(c.xpAfter, 435);
    expect(c.minutesToNextLevel, 45);
    expect((await repo.getCelebration(partial: true)).drops, 10);
  });
}
