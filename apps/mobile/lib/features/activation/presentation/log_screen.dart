import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../domain/focus_session.dart';
import 'log_controller.dart';
import 'ramp_widgets.dart';

/// Registro de progresso (M11).
class LogScreen extends StatelessWidget {
  const LogScreen({
    super.key,
    required this.state,
    required this.onClose,
    required this.onChoose,
    required this.onPartial,
    required this.onSubmit,
  });

  final LogController state;
  final VoidCallback onClose;
  final ValueChanged<SessionOutcome> onChoose;
  final ValueChanged<int> onPartial;
  final VoidCallback onSubmit;

  static const _options = [
    (SessionOutcome.done, 'Concluí', 'Pode riscar do plano', PhosphorIconsBold.checkCircle),
    (SessionOutcome.partial, 'Parcial', 'Avancei uma parte', PhosphorIconsBold.circleHalf),
    (SessionOutcome.notDone, 'Não rolou', 'Sem problema, eu recalculo', PhosphorIconsBold.calendarBlank),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      topBar: BoraTopBar(leading: CloseNavButton(onPressed: onClose)),
      header: RampHeader(index: 4, done: state.session.done, onSwap: null, onSkip: null),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Text(state.title, style: BoraText.h1(c.tx)),
        const SizedBox(height: 4),
        Text(state.subtitle, style: BoraText.small(c.tx2)),
        const SizedBox(height: 20),
        for (final (o, name, desc, icon) in _options) ...[
          if (o != SessionOutcome.done) const SizedBox(height: 10),
          OptionCard(name: name, description: desc, icon: icon, selected: state.outcome == o, onTap: () => onChoose(o)),
        ],
        if (state.outcome == SessionOutcome.partial) ...[
          const SizedBox(height: 12),
          BoraCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(children: [
                  Expanded(
                    child: Text('Quanto ficou pronto?',
                        style: BoraText.nunito(13, 16, weight: FontWeight.w800, color: c.tx)),
                  ),
                  Text('${state.partialPct}%', style: BoraText.fredoka(18, 22, color: c.pri)),
                ]),
                const SizedBox(height: 10),
                BoraSlider(
                  value: state.partialPct.toDouble(),
                  min: 0,
                  max: 100,
                  step: 5,
                  semanticLabel: 'Quanto ficou pronto',
                  onChanged: (v) => onPartial(v.round()),
                ),
              ],
            ),
          ),
        ],
        if (state.error != null) ...[
          const SizedBox(height: 12),
          Text(state.error!, style: BoraText.small(c.danger)),
        ],
        const SizedBox(height: 24),
        PrimaryButton(label: 'Registrar', onPressed: state.canSubmit ? onSubmit : null),
      ],
    );
  }
}
