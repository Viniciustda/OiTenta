import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'trail_controller.dart';

/// Trilha do objetivo (M18). "Editar" não tem destino nesta fase (sem endpoint).
class TrailScreen extends StatelessWidget {
  const TrailScreen({
    super.key,
    required this.state,
    required this.onBack,
    this.onEdit,
  });

  final TrailController state;
  final VoidCallback onBack;
  final VoidCallback? onEdit;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final color = c.objective(state.colorIndex);
    final rows = state.rows;
    return BoraPage(
      topBar: BoraTopBar(
        leading: BackNavButton(onPressed: onBack),
        trailing: TertiaryButton(
          label: 'Editar',
          icon: PhosphorIconsBold.pencilSimple,
          compact: true,
          onPressed: onEdit,
        ),
      ),
      children: [
        if (state.error != null)
          Text(state.error!, style: BoraText.small(c.danger)),
        if (state.detail != null) ...[
          BoraCard(
            child: Row(
              children: [
                ProgressRing(
                  size: 76,
                  progress: state.percent / 100,
                  color: color,
                  track: c.s2,
                  strokeRatio: 14 / 148,
                  child: Text(
                    '${state.percent}%',
                    style: BoraText.fredoka(18, 18, color: c.tx),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(state.title, style: BoraText.h2(c.tx)),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(
                            PhosphorIconsRegular.calendarBlank,
                            size: 16,
                            color: c.tx2,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            state.deadlineLabel,
                            style: BoraText.nunito(
                              13,
                              16,
                              weight: FontWeight.w700,
                              color: c.tx2,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(state.summary, style: BoraText.small(c.tx2)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SectionHeader(label: 'Trilha das etapas', trailing: state.countLabel),
          const SizedBox(height: 12),
          for (final r in rows) _Row(r: r),
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(color: c.s2, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Icon(PhosphorIconsFill.flag, size: 16, color: color),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      state.flagTitle,
                      style: BoraText.fredoka(16, 20, color: c.tx),
                    ),
                    Text(state.flagSubtitle, style: BoraText.caption(c.tx2)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.r});

  final TrailRowView r;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 28,
            child: Column(
              children: [
                const SizedBox(height: 14),
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: r.done ? c.pri : (r.isNext ? c.priSoft : c.surface),
                    border: Border.all(
                      color: r.done || r.isNext ? c.pri : c.border,
                      width: 2,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: r.done
                      ? Icon(PhosphorIconsBold.check, size: 14, color: c.priTx)
                      : Text(
                          '${r.number}',
                          style: BoraText.fredoka(
                            13,
                            13,
                            color: r.isNext ? c.pri : c.tx2,
                          ),
                        ),
                ),
                Expanded(
                  child: Container(
                    width: 2,
                    constraints: const BoxConstraints(minHeight: 12),
                    color: r.done ? c.fill : c.border,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: r.done ? c.s2 : c.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: r.isNext ? c.pri : c.border,
                    width: r.isNext ? 2 : 1,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            r.title,
                            style: BoraText.nunito(
                              15,
                              20,
                              weight: FontWeight.w700,
                              color: r.done ? c.tx2 : c.tx,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Text(
                                '${r.meta} ·',
                                style: BoraText.nunito(13, 16, color: c.tx2),
                              ),
                              const SizedBox(width: 6),
                              Icon(
                                PhosphorIconsRegular.clock,
                                size: 14,
                                color: c.tx2,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                r.duration,
                                style: BoraText.nunito(13, 16, color: c.tx2),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    if (r.isNext)
                      StatusPill(label: 'Próxima', bg: c.blueSoft, fg: c.blue),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
