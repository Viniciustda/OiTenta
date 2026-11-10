import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import 'micro_controller.dart';
import 'ramp_widgets.dart';

/// Micro-passo (M09).
class MicroScreen extends StatelessWidget {
  const MicroScreen({super.key, required this.state, required this.onClose, required this.onSwap, required this.onDone});

  final MicroController state;
  final VoidCallback onClose;
  final VoidCallback onSwap;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      topBar: BoraTopBar(leading: CloseNavButton(onPressed: onClose)),
      header: RampHeader(index: 2, done: state.session.done, onSwap: onSwap, onSkip: null),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        const SizedBox(height: 12),
        const Center(child: Broto(mood: BrotoMood.animado, size: 72)),
        const SizedBox(height: 16),
        BoraCard(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Dot(color: c.objective(state.colorIndex)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(state.context, style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
                ),
              ]),
              const SizedBox(height: 16),
              Text(state.text, style: BoraText.h1(c.tx)),
              const SizedBox(height: 16),
              Row(children: [
                Icon(PhosphorIconsRegular.clock, size: 16, color: c.tx2),
                const SizedBox(width: 6),
                Text('Só isso. Leva 1 minuto.', style: BoraText.small(c.tx2)),
              ]),
            ],
          ),
        ),
        const SizedBox(height: 24),
        PrimaryButton(label: 'Feito!', icon: PhosphorIconsBold.check, onPressed: onDone),
      ],
    );
  }
}
