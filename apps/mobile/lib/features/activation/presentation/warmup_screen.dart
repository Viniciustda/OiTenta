import 'package:flutter/material.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import 'ramp_widgets.dart';
import 'warmup_controller.dart';

/// Aquecimento (M07).
class WarmupScreen extends StatelessWidget {
  const WarmupScreen({
    super.key,
    required this.state,
    required this.onClose,
    required this.onSwap,
    required this.onSkip,
    required this.onDone,
  });

  final WarmupController state;
  final VoidCallback onClose;
  final VoidCallback onSwap;
  final VoidCallback onSkip;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      topBar: BoraTopBar(leading: CloseNavButton(onPressed: onClose)),
      header: RampHeader(
        index: 0,
        done: state.session.done,
        onSwap: onSwap,
        onSkip: onSkip,
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Text(state.title, style: BoraText.h1(c.tx)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: c.focusBg,
            border: Border.all(color: c.border),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SizedBox(
                width: 104,
                height: 104,
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: Broto(size: 104),
                ),
              ),
              ProgressRing(
                size: 148,
                progress: 1 - state.progress,
                color: c.fill,
                track: c.ringTrack,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      state.timeLabel,
                      style: BoraText.fredoka(36, 40, color: c.tx),
                    ),
                    Text(
                      state.ringLabel,
                      style: BoraText.nunito(
                        12,
                        16,
                        weight: FontWeight.w700,
                        color: c.tx2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        for (var i = 0; i < state.steps.length; i++) ...[
          if (i > 0) const SizedBox(height: 12),
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(color: c.s2, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Text(
                  '${i + 1}',
                  style: BoraText.fredoka(14, 14, color: c.pri),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  state.steps[i],
                  style: BoraText.nunito(15, 20, color: c.tx),
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 28),
        PrimaryButton(label: state.buttonLabel, onPressed: onDone),
      ],
    );
  }
}
