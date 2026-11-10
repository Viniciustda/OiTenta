/// Números da barra gamificada (M01) — valores fixos do protótipo (P18).
class GamificationSnapshot {
  const GamificationSnapshot({
    required this.streak,
    required this.drops,
    required this.level,
    required this.xp,
    required this.levelXp,
  });

  final int streak;
  final int drops;
  final int level;
  final int xp;
  final int levelXp;

  double get levelProgress => levelXp == 0 ? 0 : xp / levelXp;
}

/// Números da celebração (M12) — valores fixos do protótipo (P18).
class CelebrationReward {
  const CelebrationReward({
    required this.drops,
    required this.level,
    required this.xpBefore,
    required this.xpAfter,
    required this.levelXp,
    required this.focusXp,
  });

  final int drops;
  final int level;
  final int xpBefore;
  final int xpAfter;
  final int levelXp;
  final int focusXp;

  int get minutesToNextLevel => levelXp - xpAfter;
}
