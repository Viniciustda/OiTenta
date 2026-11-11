import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'goals_controller.dart';

/// Objetivos (M02).
class GoalsScreen extends StatelessWidget {
  const GoalsScreen({
    super.key,
    required this.state,
    required this.onOpen,
    required this.onNew,
  });

  final GoalsController state;
  final ValueChanged<String> onOpen;
  final VoidCallback onNew;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      children: [
        Text('Objetivos', style: BoraText.h1(c.tx)),
        const SizedBox(height: 2),
        Text(state.loading ? '' : state.subtitle, style: BoraText.small(c.tx2)),
        const SizedBox(height: 20),
        if (state.error != null)
          Text(state.error!, style: BoraText.small(c.danger)),
        for (final g in state.items) ...[
          Semantics(
            button: true,
            label: g.title,
            child: GestureDetector(
              onTap: () => onOpen(g.id),
              child: BoraCard(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Dot(color: c.objective(g.colorIndex)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            g.title,
                            style: BoraText.nunito(
                              14,
                              20,
                              weight: FontWeight.w800,
                              color: c.tx,
                            ),
                          ),
                        ),
                        Text(
                          g.percentLabel,
                          style: BoraText.fredoka(
                            18,
                            22,
                            color: c.objectiveInk(g.colorIndex),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ProgressBar(
                      value: g.progress,
                      color: c.objective(g.colorIndex),
                      height: 10,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          PhosphorIconsBold.checkCircle,
                          size: 14,
                          color: c.pri,
                        ),
                        const SizedBox(width: 6),
                        Text(g.meta, style: BoraText.caption(c.tx2)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
        const SizedBox(height: 12),
        PrimaryButton(
          label: 'Novo objetivo',
          icon: PhosphorIconsBold.plus,
          onPressed: onNew,
        ),
      ],
    );
  }
}
