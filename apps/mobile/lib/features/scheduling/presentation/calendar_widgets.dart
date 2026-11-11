import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'week_controller.dart';

/// Distância do arraste que troca semana ↔ mês (protótipo: 28px).
const calendarDragThreshold = 28.0;

/// Card do calendário (M03/M19 semana, M20/M21 mês) com o traço embaixo.
/// Como no Google Agenda: arrastar para baixo abre o mês; para cima volta à
/// semana. Tocar no traço também alterna.
class CalendarCard extends StatefulWidget {
  const CalendarCard({
    super.key,
    required this.expanded,
    required this.week,
    required this.month,
    required this.onExpand,
    required this.onCollapse,
    required this.onToggle,
  });

  final bool expanded;
  final Widget week;
  final Widget month;
  final VoidCallback onExpand;
  final VoidCallback onCollapse;
  final VoidCallback onToggle;

  @override
  State<CalendarCard> createState() => _CalendarCardState();
}

class _CalendarCardState extends State<CalendarCard> {
  double _dy = 0;
  bool _fired = false;

  void _update(DragUpdateDetails d) {
    if (_fired) return;
    _dy += d.delta.dy;
    if (_dy > calendarDragThreshold && !widget.expanded) {
      _fired = true;
      widget.onExpand();
    } else if (_dy < -calendarDragThreshold && widget.expanded) {
      _fired = true;
      widget.onCollapse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      dragStartBehavior: DragStartBehavior.down,
      onVerticalDragStart: (_) {
        _dy = 0;
        _fired = false;
      },
      onVerticalDragUpdate: _update,
      child: BoraCard(
        padding: const EdgeInsets.fromLTRB(6, 10, 6, 0),
        child: Column(
          children: [
            AnimatedSize(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
              alignment: Alignment.topCenter,
              child: widget.expanded ? widget.month : widget.week,
            ),
            Semantics(
              button: true,
              label: 'Arraste pra expandir ou recolher o calendário',
              excludeSemantics: true,
              onTap: widget.onToggle,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: widget.onToggle,
                child: SizedBox(
                  height: 24,
                  width: double.infinity,
                  child: Center(
                    child: Container(
                      width: 40,
                      height: 5,
                      decoration: BoxDecoration(
                        color: c.border,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Pontos por objetivo embaixo do número do dia.
class _Dots extends StatelessWidget {
  const _Dots(this.colorIndexes);

  final List<int> colorIndexes;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return SizedBox(
      height: 6,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (var k = 0; k < colorIndexes.length; k++) ...[
            if (k > 0) const SizedBox(width: 3),
            Dot(color: c.objective(colorIndexes[k]), size: 6),
          ],
        ],
      ),
    );
  }
}

/// Semana compacta (M03/M19), igual à já validada.
class WeekStrip extends StatelessWidget {
  const WeekStrip({
    super.key,
    required this.days,
    required this.selectedIndex,
    required this.onSelectDay,
  });

  final List<WeekDayView> days;
  final int selectedIndex;
  final ValueChanged<int> onSelectDay;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Row(
      children: [
        for (var i = 0; i < days.length; i++) ...[
          if (i > 0) const SizedBox(width: 2),
          Expanded(
            child: Semantics(
              button: true,
              selected: selectedIndex == i,
              label: '${days[i].weekday} ${days[i].number}',
              excludeSemantics: true,
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onSelectDay(i),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Column(
                    children: [
                      Text(
                        days[i].weekday,
                        style: BoraText.nunito(
                          12,
                          16,
                          weight: FontWeight.w800,
                          color: selectedIndex == i ? c.tx : c.tx2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: days[i].isToday
                              ? c.pri
                              : (selectedIndex == i ? c.priSoft : null),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${days[i].number}',
                          style: BoraText.fredoka(
                            15,
                            15,
                            color: days[i].isToday ? c.priTx : c.tx,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      _Dots(days[i].colorIndexes),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// Mês expandido (M20/M21): cabeçalho dos dias e a grade das semanas.
class MonthGrid extends StatelessWidget {
  const MonthGrid({super.key, required this.weeks, required this.onSelectDate});

  final List<List<MonthDayView>> weeks;
  final ValueChanged<DateTime> onSelectDate;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final header = weeks.isEmpty ? const <MonthDayView>[] : weeks.first;
    return Column(
      children: [
        Row(
          children: [
            for (var i = 0; i < header.length; i++) ...[
              if (i > 0) const SizedBox(width: 2),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text(
                    header[i].weekday,
                    textAlign: TextAlign.center,
                    style: BoraText.nunito(
                      12,
                      16,
                      weight: FontWeight.w800,
                      color: c.tx2,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
        for (var r = 0; r < weeks.length; r++) ...[
          if (r > 0) const SizedBox(height: 2),
          Row(
            children: [
              for (var i = 0; i < weeks[r].length; i++) ...[
                if (i > 0) const SizedBox(width: 2),
                Expanded(child: _MonthCell(weeks[r][i], onSelectDate)),
              ],
            ],
          ),
        ],
      ],
    );
  }
}

class _MonthCell extends StatelessWidget {
  const _MonthCell(this.day, this.onSelectDate);

  final MonthDayView day;
  final ValueChanged<DateTime> onSelectDate;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final cell = ConstrainedBox(
      constraints: const BoxConstraints(minHeight: 44),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(0, 2, 0, 4),
        child: Column(
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: day.isToday
                    ? c.pri
                    : (day.isSelected ? c.priSoft : null),
              ),
              alignment: Alignment.center,
              child: Opacity(
                opacity: day.inMonth ? 1 : .4,
                child: Text(
                  '${day.number}',
                  style: BoraText.fredoka(
                    14,
                    14,
                    color: day.isToday ? c.priTx : c.tx,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 3),
            _Dots(day.colorIndexes),
          ],
        ),
      ),
    );
    if (!day.inMonth) return ExcludeSemantics(child: cell);
    return Semantics(
      button: true,
      selected: day.isSelected,
      label: '${day.weekday} ${day.number}',
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onSelectDate(day.date),
        child: cell,
      ),
    );
  }
}

/// Entrega final de um objetivo (Prazos, M21).
class DeadlineCard extends StatelessWidget {
  const DeadlineCard({super.key, required this.deadline});

  final DeadlineView deadline;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final color = c.objective(deadline.colorIndex);
    return BoraCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: c.s2,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Icon(PhosphorIconsFill.flag, size: 22, color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Dot(color: color),
                        const SizedBox(width: 6),
                        Text(
                          'Entrega final',
                          style: BoraText.nunito(
                            13,
                            16,
                            weight: FontWeight.w700,
                            color: c.tx2,
                          ),
                        ),
                      ],
                    ),
                    Text(deadline.title, style: BoraText.h3(c.tx)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ProgressBar(value: deadline.progress, color: color),
          const SizedBox(height: 10),
          Text(
            deadline.progressLabel,
            style: BoraText.nunito(
              13,
              16,
              weight: FontWeight.w800,
              color: c.objectiveInk(deadline.colorIndex),
            ),
          ),
        ],
      ),
    );
  }
}
