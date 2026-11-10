import 'package:flutter/material.dart';

import '../theme/bora_colors.dart';
import '../theme/bora_text.dart';

/// Botão primário com lábio 3D (`0 3px 0 var(--lip)`); desabilitado fica
/// `--s2` com lábio `--border` (função `btn` do protótipo).
class PrimaryButton extends StatefulWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.height = 52,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final double height;

  @override
  State<PrimaryButton> createState() => _PrimaryButtonState();
}

class _PrimaryButtonState extends State<PrimaryButton> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final on = widget.onPressed != null;
    final bg = on ? c.pri : c.s2;
    final fg = on ? c.priTx : c.tx2;
    final lip = on ? c.lip : c.border;
    return Semantics(
      button: true,
      enabled: on,
      child: GestureDetector(
        onTapDown: on ? (_) => setState(() => _down = true) : null,
        onTapCancel: () => setState(() => _down = false),
        onTapUp: on ? (_) => setState(() => _down = false) : null,
        onTap: widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 80),
          height: widget.height,
          transform: Matrix4.translationValues(0, _down ? 3 : 0, 0),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(999),
            boxShadow: _down ? const [] : [BoxShadow(color: lip, offset: const Offset(0, 3))],
          ),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.icon != null) ...[Icon(widget.icon, size: 16, color: fg), const SizedBox(width: 8)],
              Flexible(child: Text(widget.label, style: BoraText.button(fg), overflow: TextOverflow.ellipsis)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Botão secundário: fundo `--surface`, borda 2px e lábio `--border`, texto `--blue`.
class SecondaryButton extends StatelessWidget {
  const SecondaryButton({super.key, required this.label, required this.onPressed, this.icon, this.height = 52});

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      child: GestureDetector(
        onTap: onPressed,
        child: Container(
          height: height,
          decoration: BoxDecoration(
            color: c.surface,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: c.border, width: 2),
            boxShadow: [BoxShadow(color: c.border, offset: const Offset(0, 3))],
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[Icon(icon, size: 18, color: c.blue), const SizedBox(width: 8)],
              Flexible(child: Text(label, style: BoraText.button(c.blue), overflow: TextOverflow.ellipsis)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Botão terciário (texto `--blue`, sem fundo). [compact] = 36 de altura.
class TertiaryButton extends StatelessWidget {
  const TertiaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.compact = false,
    this.fontSize,
    this.color,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool compact;
  final double? fontSize;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    final fg = color ?? c.blue;
    final size = fontSize ?? (compact ? 14 : 16);
    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onPressed,
        child: Container(
          height: compact ? 36 : 44,
          padding: EdgeInsets.symmetric(horizontal: compact ? 10 : 14),
          alignment: Alignment.center,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[Icon(icon, size: compact ? 16 : 18, color: fg), const SizedBox(width: 6)],
              Flexible(
                child: Text(label,
                    overflow: TextOverflow.ellipsis,
                    style: BoraText.nunito(size, size, weight: FontWeight.w800, color: fg)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Botão redondo 44×44 do topo (voltar / fechar / perfil).
class CircleNavButton extends StatelessWidget {
  const CircleNavButton({super.key, required this.icon, required this.onPressed, required this.semanticLabel});

  final IconData icon;
  final VoidCallback? onPressed;
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      label: semanticLabel,
      child: GestureDetector(
        onTap: onPressed,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: c.surface,
            border: Border.all(color: c.border),
          ),
          alignment: Alignment.center,
          child: Icon(icon, size: 20, color: c.tx),
        ),
      ),
    );
  }
}
