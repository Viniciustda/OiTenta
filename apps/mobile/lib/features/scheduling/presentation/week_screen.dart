import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'week_controller.dart';

/// Semana (M03). "Prazos" e o puxador do mês estão fora da fatia: visual sem ação.
class WeekScreen extends StatelessWidget {
  const WeekScreen({super.key, required this.state, required this.onSelectDay});

  final WeekController state;
  final ValueChanged<int> onSelectDay;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    if (state.loading) return BoraPage(children: [Text('Semana', style: BoraText.h1(c.tx))]);
    final days = state.days;
    final blocks = state.dayBlocks;
    return BoraPage(
      children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Semana', style: BoraText.h1(c.tx)),
              const SizedBox(height: 2),
              Text(state.rangeLabel, style: BoraText.small(c.tx2)),
            ]),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(color: c.s2, borderRadius: BorderRadius.circular(999)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              _Segment(label: 'Execução', active: true),
              _Segment(label: 'Prazos', active: false),
            ]),
          ),
        ]),
        const SizedBox(height: 16),
        BoraCard(
          padding: const EdgeInsets.fromLTRB(6, 10, 6, 0),
          child: Column(children: [
            Row(children: [
              for (var i = 0; i < days.length; i++) ...[
                if (i > 0) const SizedBox(width: 2),
                Expanded(
                  child: Semantics(
                    button: true,
                    selected: state.selectedIndex == i,
                    label: '${days[i].weekday} ${days[i].number}',
                    excludeSemantics: true,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => onSelectDay(i),
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Column(children: [
                          Text(days[i].weekday,
                              style: BoraText.nunito(12, 16,
                                  weight: FontWeight.w800, color: state.selectedIndex == i ? c.tx : c.tx2)),
                          const SizedBox(height: 4),
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: days[i].isToday ? c.pri : (state.selectedIndex == i ? c.priSoft : null),
                            ),
                            alignment: Alignment.center,
                            child: Text('${days[i].number}',
                                style: BoraText.fredoka(15, 15, color: days[i].isToday ? c.priTx : c.tx)),
                          ),
                          const SizedBox(height: 4),
                          SizedBox(
                            height: 6,
                            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                              for (var k = 0; k < days[i].colorIndexes.length; k++) ...[
                                if (k > 0) const SizedBox(width: 3),
                                Dot(color: c.objective(days[i].colorIndexes[k]), size: 6),
                              ],
                            ]),
                          ),
                        ]),
                      ),
                    ),
                  ),
                ),
              ],
            ]),
            SizedBox(
              height: 24,
              child: Center(
                child: Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(999)),
                ),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 12),
        Wrap(spacing: 14, runSpacing: 6, children: [
          for (final l in state.legend)
            Row(mainAxisSize: MainAxisSize.min, children: [
              Dot(color: c.objective(l.colorIndex)),
              const SizedBox(width: 6),
              Text(l.title, style: BoraText.caption(c.tx2)),
            ]),
        ]),
        const SizedBox(height: 24),
        Text(state.dayLabel.toUpperCase(), style: BoraText.label(c.tx2)),
        const SizedBox(height: 12),
        if (blocks.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: c.border),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text('Nada planejado pra esse dia.', textAlign: TextAlign.center, style: BoraText.small(c.tx2)),
          ),
        for (final b in blocks) ...[
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            SizedBox(
              width: 40,
              child: Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text(b.time,
                    textAlign: TextAlign.center, style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: BoraCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Dot(color: c.objective(b.colorIndex)),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(b.goalTitle,
                          overflow: TextOverflow.ellipsis,
                          style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
                    ),
                    if (b.pill != null)
                      StatusPill(label: b.pill!, bg: b.done ? c.priSoft : c.s2, fg: b.done ? c.pri : c.tx2),
                  ]),
                  const SizedBox(height: 8),
                  Text(b.title, style: BoraText.h3(b.done ? c.tx2 : c.tx)),
                  const SizedBox(height: 8),
                  Row(children: [
                    Icon(PhosphorIconsRegular.clock, size: 16, color: c.tx2),
                    const SizedBox(width: 4),
                    Text(b.duration, style: BoraText.nunito(13, 16, weight: FontWeight.w700, color: c.tx2)),
                  ]),
                ]),
              ),
            ),
          ]),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _Segment extends StatelessWidget {
  const _Segment({required this.label, required this.active});

  final String label;
  final bool active;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: active ? c.surface : null,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: active ? c.border : c.s2),
      ),
      alignment: Alignment.center,
      child: Text(label, style: BoraText.nunito(13, 13, weight: FontWeight.w800, color: active ? c.tx : c.tx2)),
    );
  }
}
