import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import 'focus_controller.dart';

/// Sessão de foco (M10). Pausar, Pedir ajuda e Bloquear apps estão fora da
/// fatia: ficam com o visual e sem ação.
class FocusScreen extends StatelessWidget {
  const FocusScreen({super.key, required this.state, required this.onClose, required this.onEnd});

  final FocusController state;
  final VoidCallback onClose;
  final VoidCallback onEnd;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      background: c.focusBg,
      topBar: BoraTopBar(leading: CloseNavButton(onPressed: onClose)),
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text('FOCO · DEGRAU 4 DE 5', style: BoraText.label(c.tx2)),
        const SizedBox(height: 8),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Dot(color: c.objective(state.colorIndex)),
          const SizedBox(width: 6),
          Text(state.goalTitle, style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
        ]),
        const SizedBox(height: 4),
        Text(state.stepTitle, textAlign: TextAlign.center, style: BoraText.h2(c.tx)),
        const SizedBox(height: 16),
        const Broto(mood: BrotoMood.focado, size: 84),
        const SizedBox(height: 8),
        ProgressRing(
          size: 240,
          progress: state.progress,
          color: c.blueFill,
          track: c.ringTrack,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(state.timeLabel, style: BoraText.fredoka(64, 68, color: c.tx)),
            Text(state.ofLabel, style: BoraText.nunito(12, 16, weight: FontWeight.w700, color: c.tx2)),
          ]),
        ),
        const SizedBox(height: 20),
        Row(children: [
          const Expanded(child: SecondaryButton(label: 'Pausar', icon: PhosphorIconsBold.pause, onPressed: null)),
          const SizedBox(width: 12),
          Expanded(
            child: Center(
              child: TertiaryButton(label: 'Encerrar', icon: PhosphorIconsBold.flagCheckered, onPressed: onEnd),
            ),
          ),
        ]),
        const SizedBox(height: 12),
        const SecondaryButton(label: 'Pedir ajuda', icon: PhosphorIconsBold.lifebuoy, onPressed: null),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 14, 12),
          decoration: BoxDecoration(
            color: c.surface,
            border: Border.all(color: c.border),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(children: [
            Icon(PhosphorIconsRegular.lockSimple, size: 22, color: c.tx2),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Bloquear apps de distração', style: BoraText.nunito(15, 20, weight: FontWeight.w800, color: c.tx)),
                Text('Instagram, TikTok e YouTube até o fim do foco', style: BoraText.caption(c.tx2)),
              ]),
            ),
            const SizedBox(width: 12),
            const BoraSwitch(on: true),
          ]),
        ),
      ],
    );
  }
}
