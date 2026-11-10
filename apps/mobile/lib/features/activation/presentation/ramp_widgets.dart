import 'dart:async';

import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'ladder_controller.dart';

/// Cabeçalho dos degraus (aquecer, desafio, micro, registro): 5 segmentos,
/// "Degrau N de 5", "Trocar" e "Pular pra tarefa".
class RampHeader extends StatelessWidget {
  const RampHeader({
    super.key,
    required this.index,
    required this.done,
    required this.onSwap,
    required this.onSkip,
  });

  final int index;
  final List<bool> done;
  final VoidCallback? onSwap;
  final VoidCallback? onSkip;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Column(
        children: [
          Row(
            children: [
              for (var i = 0; i < 5; i++) ...[
                if (i > 0) const SizedBox(width: 4),
                Expanded(
                  child: Container(
                    height: 4,
                    decoration: BoxDecoration(
                      color: (done[i] || i <= index) ? c.fill : c.s2,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 36,
            child: Row(
              children: [
                Text('Degrau ${index + 1} de 5', style: BoraText.nunito(14, 20, weight: FontWeight.w700, color: c.tx)),
                const Spacer(),
                if (onSwap != null)
                  TertiaryButton(label: 'Trocar', icon: PhosphorIconsBold.arrowsClockwise, compact: true, onPressed: onSwap),
                if (onSkip != null)
                  TertiaryButton(
                      label: 'Pular pra tarefa', icon: PhosphorIconsBold.skipForward, compact: true, onPressed: onSkip),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Abre o sheet "Trocar" do degrau atual.
Future<void> showSwapSheet(BuildContext context, RampSwap swap) {
  final c = context.bora;
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    backgroundColor: c.surface.withValues(alpha: 0),
    barrierColor: c.scrim,
    builder: (_) => SwapSheet(
      title: swap.swapTitle,
      subtitle: swap.swapSubtitle,
      options: swap.swapOptions,
      onSwap: (i) {
        swap.swap(i);
        Navigator.of(context, rootNavigator: true).pop();
      },
    ),
  );
}

class SwapSheet extends StatefulWidget {
  const SwapSheet({super.key, required this.title, required this.subtitle, required this.options, required this.onSwap});

  final String title;
  final String subtitle;
  final List<SwapOptionView> options;
  final ValueChanged<int> onSwap;

  @override
  State<SwapSheet> createState() => _SwapSheetState();
}

class _SwapSheetState extends State<SwapSheet> {
  int? _selected;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(top: BorderSide(color: c.border)),
        boxShadow: [BoxShadow(color: c.sheetShadow, offset: const Offset(0, -8), blurRadius: 32)],
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
          Text(widget.title, style: BoraText.h3(c.tx)),
          const SizedBox(height: 2),
          Text(widget.subtitle, style: BoraText.small(c.tx2)),
          const SizedBox(height: 12),
          Flexible(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  for (final o in widget.options) ...[
                    OptionCard(
                      name: o.title,
                      description: o.description,
                      icon: boraIcon(o.icon),
                      dense: true,
                      selected: _selected == o.index,
                      onTap: () => setState(() => _selected = o.index),
                    ),
                    const SizedBox(height: 8),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          PrimaryButton(
            label: 'Trocar degrau',
            height: 48,
            onPressed: _selected == null ? null : () => widget.onSwap(_selected!),
          ),
        ],
      ),
    );
  }
}

/// Chama [onTick] a cada 250 ms enquanto está na tela (timers da rampa).
class PeriodicTicker extends StatefulWidget {
  const PeriodicTicker({super.key, required this.onTick, required this.child});

  final ValueChanged<Duration> onTick;
  final Widget child;

  @override
  State<PeriodicTicker> createState() => _PeriodicTickerState();
}

class _PeriodicTickerState extends State<PeriodicTicker> {
  static const _period = Duration(milliseconds: 250);
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(_period, (_) => widget.onTick(_period));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
