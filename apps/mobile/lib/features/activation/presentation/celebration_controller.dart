import 'package:flutter/foundation.dart';

import '../../gamification/data/gamification_repository.dart';
import '../../gamification/domain/gamification.dart';
import '../domain/focus_session.dart';
import 'ramp_session.dart';

/// Celebração (M12), com os números fixos do protótipo (P18).
class CelebrationController extends ChangeNotifier {
  CelebrationController(this._repo, this.session);

  final GamificationRepository _repo;
  final RampSession session;

  CelebrationReward? reward;

  Future<void> load() async {
    reward = await _repo.getCelebration(partial: session.outcome == SessionOutcome.partial);
    notifyListeners();
  }

  String get dropsLabel => '+${reward?.drops ?? 0}';

  String get subtitle {
    final title = session.target!.stepTitle;
    return session.outcome == SessionOutcome.partial ? '${session.partialPct}% de $title' : 'Etapa concluída: $title';
  }

  String get levelLabel => 'Nível ${reward?.level ?? 0}';

  String get xpLabel => '${reward?.xpAfter ?? 0} / ${reward?.levelXp ?? 0} XP';

  double get xpProgress => reward == null ? 0 : reward!.xpAfter / reward!.levelXp;

  String get meta => reward == null
      ? ''
      : '+${reward!.focusXp} XP de foco · ${reward!.minutesToNextLevel} min até o Nível ${reward!.level + 1}';
}
