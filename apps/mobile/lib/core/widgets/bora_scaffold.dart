import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../theme/bora_colors.dart';
import '../theme/bora_text.dart';
import 'bora_buttons.dart';

/// Linha do topo (abaixo da barra de status): 40 de altura, margem 20,
/// como o `HEADER` do protótipo (`top: 55px`).
class BoraTopBar extends StatelessWidget {
  const BoraTopBar({super.key, this.leading, this.center, this.trailing});

  final Widget? leading;
  final Widget? center;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
      child: SizedBox(
        height: 40,
        child: Row(
          children: [
            ?leading,
            if (leading != null && center != null) const SizedBox(width: 10),
            ?center,
            const Spacer(),
            ?trailing,
          ],
        ),
      ),
    );
  }
}

/// Botão "Voltar" (seta) do topo.
class BackNavButton extends StatelessWidget {
  const BackNavButton({super.key, required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) =>
      CircleNavButton(icon: PhosphorIconsBold.arrowLeft, onPressed: onPressed, semanticLabel: 'Voltar');
}

/// Botão "Fechar" (x) do topo, usado na rampa.
class CloseNavButton extends StatelessWidget {
  const CloseNavButton({super.key, required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) =>
      CircleNavButton(icon: PhosphorIconsBold.x, onPressed: onPressed, semanticLabel: 'Fechar');
}

/// Tela com área segura no topo, a linha do topo e o conteúdo rolável com
/// margem 20 (o espaço da tab bar fica por conta do shell).
class BoraPage extends StatelessWidget {
  const BoraPage({
    super.key,
    required this.children,
    this.topBar,
    this.background,
    this.padding = const EdgeInsets.fromLTRB(20, 20, 20, 32),
    this.crossAxisAlignment = CrossAxisAlignment.stretch,
    this.header,
  });

  final Widget? topBar;
  final Widget? header;
  final List<Widget> children;
  final Color? background;
  final EdgeInsets padding;
  final CrossAxisAlignment crossAxisAlignment;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return ColoredBox(
      color: background ?? c.bg,
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            ?topBar,
            ?header,
            Expanded(
              child: SingleChildScrollView(
                padding: padding,
                child: Column(crossAxisAlignment: crossAxisAlignment, children: children),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Tela provisória para o que não tem design (regra 4i): nome da tela e um botão que avança.
class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({
    super.key,
    required this.title,
    required this.description,
    this.actionLabel,
    this.onAction,
    this.secondaryLabel,
    this.onSecondary,
    this.tertiaryLabel,
    this.onTertiary,
    this.topBar,
  });

  final String title;
  final String description;
  final String? actionLabel;
  final VoidCallback? onAction;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;
  final String? tertiaryLabel;
  final VoidCallback? onTertiary;
  final Widget? topBar;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return BoraPage(
      topBar: topBar,
      children: [
        const SizedBox(height: 40),
        Text(title, style: BoraText.h1(c.tx)),
        const SizedBox(height: 4),
        Text(description, style: BoraText.small(c.tx2)),
        const SizedBox(height: 8),
        Text('Tela provisória: ainda sem design.', style: BoraText.caption(c.tx2)),
        const SizedBox(height: 28),
        if (actionLabel != null) PrimaryButton(label: actionLabel!, onPressed: onAction),
        if (secondaryLabel != null) ...[
          const SizedBox(height: 12),
          SecondaryButton(label: secondaryLabel!, onPressed: onSecondary),
        ],
        if (tertiaryLabel != null) ...[
          const SizedBox(height: 8),
          Center(child: TertiaryButton(label: tertiaryLabel!, onPressed: onTertiary)),
        ],
      ],
    );
  }
}
