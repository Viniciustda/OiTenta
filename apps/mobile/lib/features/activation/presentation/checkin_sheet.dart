import 'package:flutter/material.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import '../domain/ramp.dart';
import 'checkin_controller.dart';

/// Check-in (M05): bottom sheet com energia em 4 níveis e o tempo disponível.
class CheckinSheet extends StatelessWidget {
  const CheckinSheet({
    super.key,
    required this.state,
    required this.onEnergy,
    required this.onTime,
    required this.onBuild,
    required this.onLightTasks,
  });

  final CheckinController state;
  final ValueChanged<EnergyLevel> onEnergy;
  final ValueChanged<AvailableTime> onTime;
  final VoidCallback onBuild;

  /// Tarefas leves estão fora da fatia: sem destino.
  final VoidCallback? onLightTasks;

  static const _energies = [
    (EnergyLevel.low, 'Baixa', 'Tô no modo economia', BrotoMood.sono),
    (EnergyLevel.medium, 'Média', 'Dá pra render um pouco', BrotoMood.ok),
    (EnergyLevel.high, 'Alta', 'Bora com tudo', BrotoMood.animado),
    (
      EnergyLevel.electric,
      'Elétrico',
      'Quero ir direto pro foco',
      BrotoMood.eletrico,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Container(
      decoration: BoxDecoration(
        color: c.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: c.border),
          left: BorderSide(color: c.border),
          right: BorderSide(color: c.border),
        ),
        boxShadow: [
          BoxShadow(
            color: c.sheetShadow,
            offset: const Offset(0, -8),
            blurRadius: 32,
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(20, 10, 20, bottom > 0 ? bottom : 34),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: c.border,
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text('Como está sua energia?', style: BoraText.h3(c.tx)),
          const SizedBox(height: 12),
          for (final (e, name, desc, mood) in _energies) ...[
            if (e != EnergyLevel.low) const SizedBox(height: 8),
            OptionCard(
              name: name,
              description: desc,
              selected: state.energy == e,
              dense: true,
              leading: Broto(mood: mood, size: 44),
              onTap: () => onEnergy(e),
            ),
          ],
          const SizedBox(height: 16),
          Text(
            'Quanto tempo você tem agora?',
            style: BoraText.nunito(
              13,
              16,
              weight: FontWeight.w800,
              color: c.tx,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final t in AvailableTime.values)
                BoraChip(
                  label: t.label,
                  selected: state.time == t,
                  onTap: () => onTime(t),
                ),
            ],
          ),
          const SizedBox(height: 20),
          PrimaryButton(
            label: 'Montar minha rampa',
            height: 48,
            onPressed: state.canBuild ? onBuild : null,
          ),
          if (state.error != null) ...[
            const SizedBox(height: 8),
            Text(state.error!, style: BoraText.small(c.danger)),
          ],
          if (state.showLightTasks) ...[
            const SizedBox(height: 12),
            Center(
              child: TertiaryButton(
                label: 'Prefiro começar por tarefas leves',
                onPressed: onLightTasks,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
