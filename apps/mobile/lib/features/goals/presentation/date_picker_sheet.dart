import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/format/bora_format.dart';
import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';

/// Resultado do seletor de data: `cleared` quando o usuário tocou "Sem prazo".
class DatePick {
  const DatePick(this.date);

  final DateTime? date;
}

/// Abre o seletor de data do protótipo (sheet `datepick`).
Future<DatePick?> showBoraDatePicker(BuildContext context, {required DateTime today, DateTime? initial, String title = 'Prazo'}) {
  final c = context.bora;
  return showModalBottomSheet<DatePick>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    backgroundColor: c.surface.withValues(alpha: 0),
    barrierColor: c.scrim,
    builder: (_) => DatePickerSheet(today: today, initial: initial, title: title),
  );
}

class DatePickerSheet extends StatefulWidget {
  const DatePickerSheet({super.key, required this.today, this.initial, required this.title});

  final DateTime today;
  final DateTime? initial;
  final String title;

  @override
  State<DatePickerSheet> createState() => _DatePickerSheetState();
}

class _DatePickerSheetState extends State<DatePickerSheet> {
  late DateTime _month = DateTime((widget.initial ?? widget.today).year, (widget.initial ?? widget.today).month);
  late DateTime? _sel = widget.initial;

  DateTime get _todayDay => DateTime(widget.today.year, widget.today.month, widget.today.day);

  bool get _canPrev => _month.isAfter(DateTime(widget.today.year, widget.today.month));

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final bottom = MediaQuery.paddingOf(context).bottom;
    final first = DateTime(_month.year, _month.month, 1);
    final offset = first.weekday - 1;
    final daysInMonth = DateTime(_month.year, _month.month + 1, 0).day;
    final rows = ((offset + daysInMonth) / 7).ceil();
    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(top: BorderSide(color: c.border)),
      ),
      padding: EdgeInsets.fromLTRB(20, 10, 20, bottom > 0 ? bottom : 34),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
                width: 40, height: 5, decoration: BoxDecoration(color: c.border, borderRadius: BorderRadius.circular(999))),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Expanded(child: Text(widget.title, style: BoraText.h3(c.tx))),
              Text(_sel == null ? 'Nenhuma data escolhida' : BoraFormat.fullDate(_sel!),
                  style: BoraText.nunito(13, 16, color: c.tx2)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _NavIcon(
                icon: PhosphorIconsBold.caretLeft,
                label: 'Mês anterior',
                enabled: _canPrev,
                onTap: () => setState(() => _month = DateTime(_month.year, _month.month - 1)),
              ),
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(color: c.s2, borderRadius: BorderRadius.circular(999)),
                alignment: Alignment.center,
                child: Text(BoraFormat.monthYear(_month.year, _month.month), style: BoraText.fredoka(16, 16, color: c.tx)),
              ),
              _NavIcon(
                icon: PhosphorIconsBold.caretRight,
                label: 'Próximo mês',
                enabled: true,
                onTap: () => setState(() => _month = DateTime(_month.year, _month.month + 1)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(children: [
            for (final w in ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'])
              Expanded(child: Text(w, textAlign: TextAlign.center, style: BoraText.nunito(12, 16, weight: FontWeight.w800, color: c.tx2))),
          ]),
          for (var r = 0; r < rows; r++)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Row(children: [
                for (var col = 0; col < 7; col++)
                  Expanded(
                    child: () {
                      final d = r * 7 + col - offset + 1;
                      if (d < 1 || d > daysInMonth) return const SizedBox(height: 44);
                      final date = DateTime(_month.year, _month.month, d);
                      final past = date.isBefore(_todayDay);
                      final today = date == _todayDay;
                      final sel = _sel != null && BoraFormat.sameDay(_sel!, date);
                      return Semantics(
                        button: true,
                        selected: sel,
                        label: BoraFormat.fullDate(date),
                        excludeSemantics: true,
                        child: GestureDetector(
                          onTap: past ? null : () => setState(() => _sel = date),
                          child: Opacity(
                            opacity: past ? .3 : 1,
                            child: SizedBox(
                              height: 44,
                              child: Center(
                                child: Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: sel ? c.pri : null,
                                    border: today && !sel ? Border.all(color: c.pri, width: 2) : null,
                                  ),
                                  alignment: Alignment.center,
                                  child: Text('$d',
                                      style: BoraText.fredoka(15, 15,
                                          weight: today || sel ? FontWeight.w700 : FontWeight.w600,
                                          color: sel ? c.priTx : (today ? c.pri : c.tx))),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }(),
                  ),
              ]),
            ),
          const SizedBox(height: 16),
          PrimaryButton(
            label: 'Confirmar',
            height: 48,
            onPressed: _sel == null ? null : () => Navigator.of(context).pop(DatePick(_sel)),
          ),
          const SizedBox(height: 12),
          Center(child: TertiaryButton(label: 'Sem prazo', onPressed: () => Navigator.of(context).pop(const DatePick(null)))),
        ],
      ),
    );
  }
}

class _NavIcon extends StatelessWidget {
  const _NavIcon({required this.icon, required this.label, required this.enabled, required this.onTap});

  final IconData icon;
  final String label;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      label: label,
      child: GestureDetector(
        onTap: enabled ? onTap : null,
        child: SizedBox(
          width: 44,
          height: 44,
          child: Opacity(opacity: enabled ? 1 : .3, child: Icon(icon, size: 20, color: c.tx)),
        ),
      ),
    );
  }
}
