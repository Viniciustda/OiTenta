import '../../../core/sample/bora_sample_data.dart';
import '../domain/gamification.dart';
import 'gamification_repository.dart';

/// Valores fixos do protótipo (P18): sem lógica e sem endpoint.
class SampleGamificationRepository implements GamificationRepository {
  @override
  Future<GamificationSnapshot> getSnapshot() async {
    final g = BoraSample.gamification;
    return GamificationSnapshot(
      streak: g['streak']!,
      drops: g['drops']!,
      level: g['level']!,
      xp: g['xp']!,
      levelXp: g['levelXp']!,
    );
  }

  @override
  Future<CelebrationReward> getCelebration({required bool partial}) async {
    final c = partial ? BoraSample.celebrationPartial : BoraSample.celebrationDone;
    return CelebrationReward(
      drops: c['drops']!,
      level: c['level']!,
      xpBefore: c['xpBefore']!,
      xpAfter: c['xpAfter']!,
      levelXp: c['levelXp']!,
      focusXp: c['focusXp']!,
    );
  }
}
