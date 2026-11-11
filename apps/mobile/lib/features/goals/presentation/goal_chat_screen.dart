import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../../../core/widgets/bora_buttons.dart';
import '../../../core/widgets/bora_input.dart';
import '../../../core/widgets/bora_scaffold.dart';
import '../../../core/widgets/bora_widgets.dart';
import '../../../core/widgets/broto.dart';
import 'goal_chat_controller.dart';

/// Novo objetivo — chat com o Broto (M13 vazio, M14 analisando). A resposta
/// da IA abre a tela de etapas (M15) preenchida.
///
/// Anexo e áudio aparecem como no design, mas sem função: não há suporte no
/// contrato nem pacote aprovado.
class GoalChatScreen extends StatelessWidget {
  const GoalChatScreen({
    super.key,
    required this.state,
    required this.onBack,
    required this.onManual,
    required this.onText,
    required this.onSend,
  });

  final GoalChatController state;
  final VoidCallback onBack;
  final VoidCallback onManual;
  final ValueChanged<String> onText;
  final VoidCallback onSend;

  static const brotoAsk =
      'Me conta o que você precisa fazer e até quando. Pode escrever, mandar '
      'áudio ou anexar o enunciado.';
  static const brotoReading =
      'Lendo o que você mandou e separando o que precisa ser entregue…';
  static const hint = 'Ex.: trabalho de Algoritmos para dia 24/11';

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final sent = state.sentText;
    return Material(
      color: c.bg,
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            BoraTopBar(
              leading: BackNavButton(onPressed: onBack),
              trailing: TertiaryButton(
                label: 'Preencher à mão',
                icon: PhosphorIconsBold.pencilSimple,
                compact: true,
                fontSize: 16,
                onPressed: onManual,
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  const _BrotoSays(text: brotoAsk),
                  if (sent != null) ...[
                    const SizedBox(height: 16),
                    _UserBubble(text: sent),
                  ],
                  if (state.phase == GoalChatPhase.analyzing) ...[
                    const SizedBox(height: 16),
                    const _BrotoSays(text: brotoReading),
                    const SizedBox(height: 16),
                    const _AnalyzingCard(),
                  ],
                ],
              ),
            ),
            _Composer(
              text: state.text,
              canSend: state.canSend,
              onText: onText,
              onSend: onSend,
            ),
          ],
        ),
      ),
    );
  }
}

class _BrotoSays extends StatelessWidget {
  const _BrotoSays({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.end,
    children: [
      const Broto(size: 40),
      const SizedBox(width: 8),
      Flexible(child: BrotoBubble(child: Text(text))),
    ],
  );
}

/// Balão do usuário: verde, raio 20 20 6 20, até 280 de largura.
class _UserBubble extends StatelessWidget {
  const _UserBubble({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        // 280 de conteúdo + 14 de padding de cada lado (protótipo).
        constraints: const BoxConstraints(maxWidth: 308),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: c.pri,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(20),
            bottomRight: Radius.circular(6),
          ),
        ),
        child: Text(
          text,
          style: BoraText.nunito(
            15,
            22,
            weight: FontWeight.w600,
            color: c.priTx,
          ),
        ),
      ),
    );
  }
}

/// Cartão "IA analisando…" com as linhas de carregamento (M14).
class _AnalyzingCard extends StatelessWidget {
  const _AnalyzingCard();

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    Widget bar(double widthFactor) => FractionallySizedBox(
      alignment: Alignment.centerLeft,
      widthFactor: widthFactor,
      child: Container(
        height: 10,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          gradient: LinearGradient(colors: [c.s2, c.border, c.s2]),
        ),
      ),
    );
    Widget pill(double width) => Container(
      width: width,
      height: 24,
      decoration: BoxDecoration(
        color: c.s2,
        borderRadius: BorderRadius.circular(999),
      ),
    );
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: c.surface,
        border: Border.all(color: c.border),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              _Spinner(color: c.blue),
              const SizedBox(width: 8),
              Text(
                'IA analisando…',
                style: BoraText.nunito(
                  14,
                  20,
                  weight: FontWeight.w800,
                  color: c.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          bar(.8),
          const SizedBox(height: 10),
          bar(.56),
          const SizedBox(height: 10),
          Row(
            children: [
              pill(64),
              const SizedBox(width: 6),
              pill(88),
              const SizedBox(width: 6),
              pill(56),
            ],
          ),
        ],
      ),
    );
  }
}

class _Spinner extends StatefulWidget {
  const _Spinner({required this.color});

  final Color color;

  @override
  State<_Spinner> createState() => _SpinnerState();
}

class _SpinnerState extends State<_Spinner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _turns = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 1),
  )..repeat();

  @override
  void dispose() {
    _turns.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => RotationTransition(
    turns: _turns,
    child: Icon(PhosphorIconsBold.circleNotch, size: 16, color: widget.color),
  );
}

/// Barra de envio: anexo, campo e áudio (ou enviar, quando há texto).
class _Composer extends StatelessWidget {
  const _Composer({
    required this.text,
    required this.canSend,
    required this.onText,
    required this.onSend,
  });

  final String text;
  final bool canSend;
  final ValueChanged<String> onText;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Container(
      decoration: BoxDecoration(
        color: c.bg,
        border: Border(top: BorderSide(color: c.border)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 12),
      child: Row(
        children: [
          // Visual, sem função: anexo sem suporte no contrato.
          _IconAction(
            icon: PhosphorIconsBold.paperclip,
            label: 'Anexar',
            size: 22,
            onTap: null,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: BoraInput(
              value: text,
              onChanged: onText,
              hint: GoalChatScreen.hint,
              height: 48,
              style: BoraText.nunito(
                15,
                20,
                weight: FontWeight.w600,
                color: c.tx,
              ),
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => onSend(),
            ),
          ),
          const SizedBox(width: 6),
          if (canSend)
            Semantics(
              button: true,
              label: 'Enviar',
              child: GestureDetector(
                onTap: onSend,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: c.pri,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: c.lip, offset: const Offset(0, 3)),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    PhosphorIconsBold.arrowUp,
                    size: 20,
                    color: c.priTx,
                  ),
                ),
              ),
            )
          else
            // Visual, sem função: áudio sem suporte no contrato nem pacote.
            _IconAction(
              icon: PhosphorIconsBold.microphone,
              label: 'Gravar áudio',
              size: 24,
              onTap: null,
            ),
        ],
      ),
    );
  }
}

class _IconAction extends StatelessWidget {
  const _IconAction({
    required this.icon,
    required this.label,
    required this.size,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final double size;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: label,
    child: GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 44,
        height: 44,
        child: Icon(icon, size: size, color: context.bora.blue),
      ),
    ),
  );
}
