import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import '../../gamification/presentation/gamified_bar.dart';
import 'today_controller.dart';

/// Hoje (M01).
class TodayScreen extends StatelessWidget {
  const TodayScreen({
    super.key,
    required this.state,
    required this.onStart,
    required this.onToggleLight,
    required this.onProfile,
  });

  final TodayController state;
  final VoidCallback onStart;
  final ValueChanged<String> onToggleLight;

  /// Perfil está fora da fatia: o botão fica sem destino.
  final VoidCallback? onProfile;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final items = state.items;
    return BoraPage(
      topBar: BoraTopBar(
        leading: const Broto(mood: BrotoMood.ok, size: 40),
        center: state.gamification == null ? null : GamifiedBar(data: state.gamification!),
        trailing: Semantics(
          button: true,
          label: 'Perfil',
          child: GestureDetector(
            onTap: onProfile,
            child: Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(shape: BoxShape.circle, color: c.surface, border: Border.all(color: c.border)),
              alignment: Alignment.center,
              child: Text(
                state.userName.isEmpty ? '' : state.userName[0],
                style: BoraText.fredoka(16, 16, weight: FontWeight.w700, color: c.pri),
              ),
            ),
          ),
        ),
      ),
      children: [
        Text('Bom dia, ${state.userName}', style: BoraText.h1(c.tx)),
        const SizedBox(height: 2),
        Text(state.subtitle, style: BoraText.small(c.tx2)),
        const SizedBox(height: 16),
        _Hero(onTap: state.nextBlock == null ? null : onStart),
        const SizedBox(height: 32),
        SectionHeader(label: 'Seu dia', trailing: state.summary),
        const SizedBox(height: 12),
        if (state.loading) const SizedBox(height: 40),
        if (state.error != null) Text(state.error!, style: BoraText.small(c.danger)),
        for (var i = 0; i < items.length; i++)
          _TimelineRow(item: items[i], first: i == 0, last: i == items.length - 1, onToggleLight: onToggleLight),
        if (state.slackLabel != null) ...[
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(color: c.s2, borderRadius: BorderRadius.circular(999)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(PhosphorIconsBold.checkCircle, size: 16, color: c.pri),
                const SizedBox(width: 6),
                Flexible(
                  child: Text.rich(
                    TextSpan(children: [
                      TextSpan(text: state.slackLabel!, style: BoraText.nunito(14, 20, weight: FontWeight.w800, color: c.tx)),
                      if (state.deadlineLabel != null)
                        TextSpan(text: '  ${state.deadlineLabel!}', style: BoraText.small(c.tx2)),
                    ]),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      label: 'Vamos começar?',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.fromLTRB(14, 14, 22, 14),
          decoration: BoxDecoration(
            color: c.pri,
            borderRadius: BorderRadius.circular(999),
            boxShadow: [BoxShadow(color: c.lip, offset: const Offset(0, 3))],
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(color: c.priTx.withValues(alpha: .18), shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Icon(PhosphorIconsFill.play, size: 22, color: c.priTx),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Vamos começar?', style: BoraText.nunito(20, 26, weight: FontWeight.w800, color: c.priTx)),
                    Text('Rampa de 25 min até o foco', style: BoraText.small(c.priTx.withValues(alpha: .9))),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Icon(PhosphorIconsBold.arrowRight, size: 22, color: c.priTx),
            ],
          ),
        ),
      ),
    );
  }
}

class _TimelineRow extends StatelessWidget {
  const _TimelineRow({required this.item, required this.first, required this.last, required this.onToggleLight});

  final TodayItem item;
  final bool first;
  final bool last;
  final ValueChanged<String> onToggleLight;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final b = item.block;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 40,
            child: Padding(
              padding: EdgeInsets.only(top: b != null ? 16 : 14),
              child: Column(
                children: [
                  Text(item.time,
                      style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: first ? c.tx : c.tx2)),
                  const SizedBox(height: 6),
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: b != null ? c.objective(b.colorIndex) : c.surface,
                      border: b != null ? null : Border.all(color: c.border, width: 2),
                    ),
                  ),
                  if (!last)
                    Expanded(
                      child: Container(width: 2, margin: const EdgeInsets.only(top: 4), color: c.border),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: last ? 0 : 12),
              child: b != null ? _BlockCard(b: b) : _LightCard(l: item.light!, onTap: () => onToggleLight(item.light!.id)),
            ),
          ),
        ],
      ),
    );
  }
}

class _BlockCard extends StatelessWidget {
  const _BlockCard({required this.b});

  final TodayBlockView b;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Dot(color: c.objective(b.colorIndex)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(b.goalTitle,
                    overflow: TextOverflow.ellipsis,
                    style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
              ),
              StatusPill(
                label: b.pill,
                bg: b.done ? c.priSoft : c.blueSoft,
                fg: b.done ? c.pri : c.blue,
                icon: b.done ? PhosphorIconsBold.check : null,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(b.title, style: BoraText.h3(b.done ? c.tx2 : c.tx)),
          if (b.progressPct > 0) ...[
            const SizedBox(height: 10),
            ProgressBar(value: b.progressPct / 100, color: c.fill),
            const SizedBox(height: 6),
            Text(b.progressLabel, style: BoraText.caption(c.tx2)),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(PhosphorIconsRegular.clock, size: 16, color: c.tx2),
              const SizedBox(width: 4),
              Text(b.durationLabel, style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
              const SizedBox(width: 14),
              Icon(PhosphorIconsFill.drop, size: 15, color: c.blueFill),
              const SizedBox(width: 4),
              Text('+20', style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
            ],
          ),
        ],
      ),
    );
  }
}

class _LightCard extends StatelessWidget {
  const _LightCard({required this.l, required this.onTap});

  final TodayLightView l;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      checked: l.checked,
      child: GestureDetector(
        onTap: onTap,
        child: BoraCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: l.checked ? c.pri : c.surface,
                  border: Border.all(color: l.checked ? c.pri : c.border, width: 2),
                ),
                alignment: Alignment.center,
                child: l.checked ? Icon(PhosphorIconsBold.check, size: 14, color: c.priTx) : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l.title,
                      style: BoraText.nunito(15, 20, weight: FontWeight.w700, color: l.checked ? c.tx2 : c.tx).copyWith(
                        decoration: l.checked ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    Text(l.subtitle, style: BoraText.caption(c.tx2)),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Icon(PhosphorIconsFill.drop, size: 14, color: c.blueFill),
              const SizedBox(width: 3),
              Text('+3', style: BoraText.fredoka(14, 14, color: c.tx)),
            ],
          ),
        ),
      ),
    );
  }
}
