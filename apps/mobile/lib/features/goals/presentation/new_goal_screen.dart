import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/format/bora_format.dart';
import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_input.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import 'deadline_field.dart';
import 'new_goal_controller.dart';

/// Novo objetivo (M15 começando vazia, P20): título, prazo, etapas com
/// tempo e total, "Adicionar etapa" e "Distribuir no calendário". Sem os
/// elementos da IA (chat, requisitos, limite).
class NewGoalScreen extends StatelessWidget {
  const NewGoalScreen({
    super.key,
    required this.state,
    required this.onBack,
    required this.onManual,
    required this.onTitle,
    required this.onPickDeadline,
    required this.onClearDeadline,
    required this.onOpenAdd,
    required this.onAddTitle,
    required this.onAddMinutes,
    required this.onCancelAdd,
    required this.onConfirmAdd,
    required this.onRemove,
    required this.onSubmit,
  });

  final NewGoalController state;
  final VoidCallback onBack;
  final VoidCallback onManual;
  final ValueChanged<String> onTitle;
  final VoidCallback onPickDeadline;
  final VoidCallback onClearDeadline;
  final VoidCallback onOpenAdd;
  final ValueChanged<String> onAddTitle;
  final ValueChanged<int> onAddMinutes;
  final VoidCallback onCancelAdd;
  final VoidCallback onConfirmAdd;
  final ValueChanged<int> onRemove;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      topBar: BoraTopBar(
        leading: BackNavButton(onPressed: onBack),
        trailing: TertiaryButton(
          label: 'Preencher à mão',
          icon: PhosphorIconsBold.pencilSimple,
          compact: true,
          onPressed: onManual,
        ),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        BoraCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Dot(color: c.obj4),
                  const SizedBox(width: 6),
                  Text(
                    'Novo objetivo',
                    style: BoraText.nunito(
                      13,
                      16,
                      weight: FontWeight.w700,
                      color: c.tx2,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              BoraInput(
                value: state.title,
                onChanged: onTitle,
                hint: 'Ex.: Trabalho de Algoritmos',
                style: BoraText.fredoka(20, 26, color: c.tx),
              ),
              const SizedBox(height: 10),
              DeadlineField(
                value: state.deadline,
                onOpen: onPickDeadline,
                onClear: onClearDeadline,
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        SectionHeader(label: 'Etapas', trailing: state.totalLabel),
        const SizedBox(height: 12),
        if (state.steps.isNotEmpty)
          Container(
            decoration: BoxDecoration(
              color: c.surface,
              border: Border.all(color: c.border),
              borderRadius: BorderRadius.circular(16),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                for (var i = 0; i < state.steps.length; i++)
                  Container(
                    constraints: const BoxConstraints(minHeight: 48),
                    padding: const EdgeInsets.only(left: 16, right: 4),
                    decoration: BoxDecoration(
                      border: i == state.steps.length - 1
                          ? null
                          : Border(bottom: BorderSide(color: c.border)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: c.s2,
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '${i + 1}',
                            style: BoraText.fredoka(13, 13, color: c.pri),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            state.steps[i].title,
                            style: BoraText.nunito(
                              15,
                              20,
                              weight: FontWeight.w700,
                              color: c.tx,
                            ),
                          ),
                        ),
                        Text(
                          BoraFormat.duration(state.steps[i].minutes),
                          style: BoraText.nunito(13, 16, color: c.tx2),
                        ),
                        Semantics(
                          button: true,
                          label: 'Excluir etapa',
                          child: GestureDetector(
                            onTap: () => onRemove(i),
                            child: SizedBox(
                              width: 40,
                              height: 40,
                              child: Icon(
                                PhosphorIconsRegular.trash,
                                size: 20,
                                color: c.tx2,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        if (state.adding)
          Container(
            margin: const EdgeInsets.only(top: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: c.surface,
              border: Border.all(color: c.blue, width: 2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                BoraInput(
                  value: state.addTitle,
                  onChanged: onAddTitle,
                  hint: 'Título da etapa',
                  height: 44,
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    for (final (label, minutes) in stepDurations)
                      BoraChip(
                        label: label,
                        selected: state.addMinutes == minutes,
                        onTap: () => onAddMinutes(minutes),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TertiaryButton(
                      label: 'Cancelar',
                      compact: true,
                      onPressed: onCancelAdd,
                    ),
                    const SizedBox(width: 4),
                    SizedBox(
                      width: 104,
                      child: SecondaryButton(
                        label: 'Adicionar',
                        height: 36,
                        fontSize: 14,
                        onPressed: onConfirmAdd,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          )
        else
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: TertiaryButton(
                label: 'Adicionar etapa',
                icon: PhosphorIconsBold.plus,
                compact: true,
                fontSize: 13,
                onPressed: onOpenAdd,
              ),
            ),
          ),
        if (state.error != null) ...[
          const SizedBox(height: 12),
          Text(state.error!, style: BoraText.small(c.danger)),
        ],
        const SizedBox(height: 24),
        PrimaryButton(
          label: 'Distribuir no calendário',
          onPressed: state.canSubmit ? onSubmit : null,
        ),
      ],
    );
  }
}
