import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_scaffold.dart';
import 'challenge_controller.dart';
import 'ramp_widgets.dart';

/// Desafio mental (M08).
class ChallengeScreen extends StatelessWidget {
  const ChallengeScreen({
    super.key,
    required this.state,
    required this.onClose,
    required this.onSwap,
    required this.onSkip,
    required this.onKey,
  });

  final ChallengeController state;
  final VoidCallback onClose;
  final VoidCallback onSwap;
  final VoidCallback onSkip;
  final ValueChanged<String> onKey;

  static const _keys = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'del',
    '0',
    'ok',
  ];

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final fb = state.feedback;
    final boxBorder = switch (fb) {
      ChallengeFeedback.correct => c.pri,
      ChallengeFeedback.wrong => c.danger,
      ChallengeFeedback.reveal => c.blue,
      ChallengeFeedback.none => state.input.isEmpty ? c.border : c.blue,
    };
    final boxBg = switch (fb) {
      ChallengeFeedback.correct => c.priSoft,
      ChallengeFeedback.reveal => c.blueSoft,
      _ => c.surface,
    };
    final (fbText, fbColor, fbIcon) = switch (fb) {
      ChallengeFeedback.correct => (
        'Isso!',
        c.pri,
        PhosphorIconsBold.checkCircle,
      ),
      ChallengeFeedback.wrong => (
        'Quase. Tenta de novo.',
        c.danger,
        PhosphorIconsBold.arrowCounterClockwise,
      ),
      ChallengeFeedback.reveal => (
        'Era ${state.problem.answer}. Bora pra próxima.',
        c.blue,
        PhosphorIconsBold.arrowRight,
      ),
      ChallengeFeedback.none => ('Digite no teclado abaixo', c.tx2, null),
    };
    return BoraPage(
      topBar: BoraTopBar(leading: CloseNavButton(onPressed: onClose)),
      header: RampHeader(
        index: 1,
        done: state.session.done,
        onSwap: onSwap,
        onSkip: onSkip,
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Row(
          children: [
            Text('Desafio mental', style: BoraText.h2(c.tx)),
            const Spacer(),
            Text(
              'Conta ${state.number} de 5',
              style: BoraText.nunito(
                13,
                16,
                weight: FontWeight.w700,
                color: c.tx2,
              ),
            ),
            const SizedBox(width: 8),
            for (var i = 0; i < 5; i++) ...[
              if (i > 0) const SizedBox(width: 4),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: i < state.problemIndex
                      ? c.fill
                      : (i == state.problemIndex ? c.pri : c.s2),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              state.problemLabel,
              style: BoraText.fredoka(44, 52, color: c.tx),
            ),
            const SizedBox(width: 12),
            Container(
              constraints: const BoxConstraints(minWidth: 104),
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: boxBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: boxBorder, width: 2),
              ),
              alignment: Alignment.center,
              child: Text(
                state.input.isEmpty ? '?' : state.input,
                style: BoraText.fredoka(
                  36,
                  36,
                  color: state.input.isEmpty ? c.tx2 : c.tx,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 20,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (fbIcon != null) ...[
                Icon(fbIcon, size: 16, color: fbColor),
                const SizedBox(width: 6),
              ],
              Text(
                fbText,
                style: BoraText.nunito(
                  14,
                  20,
                  weight: FontWeight.w800,
                  color: fbColor,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        GridView.count(
          crossAxisCount: 3,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          childAspectRatio: 110 / 60,
          children: [for (final k in _keys) _Key(k: k, onTap: () => onKey(k))],
        ),
      ],
    );
  }
}

class _Key extends StatelessWidget {
  const _Key({required this.k, required this.onTap});

  final String k;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final ok = k == 'ok', del = k == 'del';
    return Semantics(
      button: true,
      label: ok ? 'Confirmar' : (del ? 'Apagar' : k),
      excludeSemantics: true,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.only(bottom: 3),
          decoration: BoxDecoration(
            color: ok ? c.pri : c.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: ok ? c.pri : c.border, width: 2),
            boxShadow: [
              BoxShadow(
                color: ok ? c.lip : c.border,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: ok
              ? Icon(PhosphorIconsBold.check, size: 26, color: c.priTx)
              : del
              ? Icon(PhosphorIconsBold.backspace, size: 26, color: c.tx2)
              : Text(k, style: BoraText.fredoka(28, 28, color: c.tx)),
        ),
      ),
    );
  }
}
