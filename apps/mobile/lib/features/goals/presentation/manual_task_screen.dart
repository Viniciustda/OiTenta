import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_input.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'deadline_field.dart';
import 'manual_task_controller.dart';

/// Preencher à mão (M16): tarefa única. "Escolher dia e horário" fica com o
/// visual e sem ação (o contrato não recebe dia e hora).
class ManualTaskScreen extends StatelessWidget {
  const ManualTaskScreen({
    super.key,
    required this.state,
    required this.onBack,
    required this.onTitle,
    required this.onDuration,
    required this.onCustom,
    required this.onPickDeadline,
    required this.onClearDeadline,
    required this.onSave,
    required this.onBackToChat,
  });

  final ManualTaskController state;
  final VoidCallback onBack;
  final ValueChanged<String> onTitle;
  final ValueChanged<String> onDuration;
  final ValueChanged<String> onCustom;
  final VoidCallback onPickDeadline;
  final VoidCallback onClearDeadline;
  final VoidCallback onSave;
  final VoidCallback onBackToChat;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    Widget label(String t) => Padding(
          padding: const EdgeInsets.only(top: 20, bottom: 8),
          child: Text(t.toUpperCase(), style: BoraText.label(c.tx2)),
        );
    return BoraPage(
      topBar: BoraTopBar(leading: BackNavButton(onPressed: onBack)),
      children: [
        Text('Preencher à mão', style: BoraText.h1(c.tx)),
        const SizedBox(height: 2),
        Text('Pra quando você já sabe o que fazer e quanto tempo leva.', style: BoraText.small(c.tx2)),
        label('Título da tarefa'),
        BoraInput(value: state.title, onChanged: onTitle, hint: 'Ex.: Revisar o relatório de Algoritmos'),
        label('Tempo estimado'),
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (final (l, _) in manualDurations)
            BoraChip(label: l, selected: state.durationChoice == l, onTap: () => onDuration(l)),
        ]),
        if (state.showCustom) ...[
          const SizedBox(height: 10),
          Row(children: [
            SizedBox(
              width: 96,
              child: BoraInput(
                value: state.custom,
                onChanged: onCustom,
                hint: '45',
                keyboardType: TextInputType.number,
                style: BoraText.fredoka(18, 18, color: c.tx),
              ),
            ),
            const SizedBox(width: 10),
            Text('minutos', style: BoraText.small(c.tx2)),
          ]),
        ],
        label('Prazo (opcional)'),
        DeadlineField(value: state.deadline, onOpen: onPickDeadline, onClear: onClearDeadline),
        label('Quando fazer?'),
        OptionCard(
          name: 'Deixar a IA encaixar no meu calendário',
          description: 'Eu acho o melhor horário livre',
          icon: PhosphorIconsRegular.sparkle,
          selected: state.letAiSchedule,
          onTap: null,
        ),
        const SizedBox(height: 10),
        OptionCard(
          name: 'Escolher dia e horário',
          description: 'Você define quando',
          icon: PhosphorIconsRegular.calendarBlank,
          selected: !state.letAiSchedule,
          onTap: null,
        ),
        if (state.error != null) ...[
          const SizedBox(height: 12),
          Text(state.error!, style: BoraText.small(c.danger)),
        ],
        const SizedBox(height: 28),
        PrimaryButton(label: 'Salvar tarefa', onPressed: state.canSave ? onSave : null),
        const SizedBox(height: 8),
        Center(child: TertiaryButton(label: 'Voltar para o chat', onPressed: onBackToChat)),
      ],
    );
  }
}
