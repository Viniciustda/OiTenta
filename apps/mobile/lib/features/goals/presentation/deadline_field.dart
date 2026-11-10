import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/format/bora_format.dart';
import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';

/// Campo "Prazo (opcional)" do M16: abre o seletor de data; "x" limpa.
class DeadlineField extends StatelessWidget {
  const DeadlineField({super.key, required this.value, required this.onOpen, required this.onClear});

  final DateTime? value;
  final VoidCallback onOpen;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      label: 'Prazo',
      child: GestureDetector(
        onTap: onOpen,
        child: Container(
          height: 52,
          padding: const EdgeInsets.fromLTRB(14, 0, 6, 0),
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: c.border, width: 2),
          ),
          child: Row(children: [
            Icon(PhosphorIconsRegular.calendarBlank, size: 20, color: c.blue),
            const SizedBox(width: 10),
            Expanded(
              child: Text(value == null ? 'Sem prazo' : BoraFormat.fullDate(value!),
                  style: BoraText.nunito(15, 20, color: value == null ? c.tx2 : c.tx)),
            ),
            if (value != null)
              Semantics(
                button: true,
                label: 'Remover prazo',
                child: GestureDetector(
                  onTap: onClear,
                  child: SizedBox(width: 36, height: 36, child: Icon(PhosphorIconsBold.x, size: 14, color: c.tx2)),
                ),
              ),
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Icon(PhosphorIconsBold.caretDown, size: 16, color: c.tx2),
            ),
          ]),
        ),
      ),
    );
  }
}
