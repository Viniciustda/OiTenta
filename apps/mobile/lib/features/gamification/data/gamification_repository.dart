import '../domain/gamification.dart';

/// Números da gamificação. No MVP são fixos (P18): não há endpoint.
abstract class GamificationRepository {
  Future<GamificationSnapshot> getSnapshot();

  /// Recompensa mostrada na celebração; [partial] quando o registro foi parcial.
  Future<CelebrationReward> getCelebration({required bool partial});
}
