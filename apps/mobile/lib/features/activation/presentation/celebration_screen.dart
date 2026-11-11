import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import 'celebration_controller.dart';

/// Celebração (M12), com os valores fixos do protótipo (P18).
class CelebrationScreen extends StatelessWidget {
  const CelebrationScreen({
    super.key,
    required this.state,
    required this.onClose,
    required this.onBack,
  });

  final CelebrationController state;
  final VoidCallback onClose;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      topBar: BoraTopBar(leading: CloseNavButton(onPressed: onClose)),
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 40),
        const Broto(mood: BrotoMood.comemora, size: 150),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(PhosphorIconsFill.drop, size: 36, color: c.blueFill),
            const SizedBox(width: 8),
            Text(
              state.dropsLabel,
              style: BoraText.fredoka(
                44,
                52,
                weight: FontWeight.w700,
                color: c.tx,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          state.subtitle,
          textAlign: TextAlign.center,
          style: BoraText.small(c.tx2),
        ),
        const SizedBox(height: 28),
        BoraCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      state.levelLabel,
                      style: BoraText.nunito(
                        14,
                        20,
                        weight: FontWeight.w800,
                        color: c.tx,
                      ),
                    ),
                  ),
                  Text(
                    state.xpLabel,
                    style: BoraText.fredoka(16, 20, color: c.pri),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ProgressBar(value: state.xpProgress, color: c.fill, height: 10),
              const SizedBox(height: 8),
              Text(state.meta, style: BoraText.caption(c.tx2)),
            ],
          ),
        ),
        const SizedBox(height: 28),
        PrimaryButton(label: 'Voltar pra Hoje', onPressed: onBack),
      ],
    );
  }
}
