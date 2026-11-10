import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../theme/bora_colors.dart';
import '../theme/bora_text.dart';

/// Card padrão: `--surface`, borda 1px `--border`, raio 16, sombra `--shadow`.
class BoraCard extends StatelessWidget {
  const BoraCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.border,
    this.color,
    this.radius = 16,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final BoxBorder? border;
  final Color? color;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? c.surface,
        borderRadius: BorderRadius.circular(radius),
        border: border ?? Border.all(color: c.border),
        boxShadow: [BoxShadow(color: c.shadow, offset: const Offset(0, 1), blurRadius: 2)],
      ),
      child: child,
    );
  }
}

/// Rótulo de seção em caixa-alta com texto auxiliar à direita.
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.label, this.trailing});

  final String label;
  final String? trailing;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(child: Text(label.toUpperCase(), style: BoraText.label(c.tx2))),
        if (trailing != null) Text(trailing!, style: BoraText.caption(c.tx2)),
      ],
    );
  }
}

/// Opção selecionável (tile 44 + nome + descrição + check), usada no registro,
/// no "Quando fazer?" e no "Trocar".
class OptionCard extends StatelessWidget {
  const OptionCard({
    super.key,
    required this.name,
    required this.description,
    required this.selected,
    required this.onTap,
    this.icon,
    this.leading,
    this.dense = false,
  });

  final String name;
  final String description;
  final bool selected;
  final VoidCallback? onTap;
  final IconData? icon;
  final Widget? leading;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      selected: selected,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: dense ? const EdgeInsets.fromLTRB(6, 6, 12, 6) : const EdgeInsets.fromLTRB(10, 10, 14, 10),
          decoration: BoxDecoration(
            color: selected ? c.priSoft : c.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: selected ? c.pri : c.border, width: 2),
          ),
          child: Row(
            children: [
              leading ??
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(color: c.s2, borderRadius: BorderRadius.circular(12)),
                    alignment: Alignment.center,
                    child: Icon(icon, size: 22, color: c.pri),
                  ),
              SizedBox(width: dense ? 10 : 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: BoraText.nunito(15, 20, weight: FontWeight.w800, color: c.tx)),
                    Text(description, style: BoraText.caption(c.tx2)),
                  ],
                ),
              ),
              if (selected) Icon(PhosphorIconsFill.checkCircle, size: 22, color: c.pri),
            ],
          ),
        ),
      ),
    );
  }
}

/// Chip de escolha (36 de altura, borda 2px; selecionado em `--priSoft`).
class BoraChip extends StatelessWidget {
  const BoraChip({super.key, required this.label, required this.selected, required this.onTap, this.height = 36});

  final String label;
  final bool selected;
  final VoidCallback? onTap;
  final double height;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Semantics(
      button: true,
      selected: selected,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: height,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: selected ? c.priSoft : c.surface,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: selected ? c.pri : c.border, width: 2),
          ),
          alignment: Alignment.center,
          child: Text(label, style: BoraText.nunito(13, 13, weight: FontWeight.w800, color: c.tx)),
        ),
      ),
    );
  }
}

/// Pílula pequena de estado ("Próxima", "Hoje 14:00", "Concluída").
class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, required this.bg, required this.fg, this.icon});

  final String label;
  final Color bg;
  final Color fg;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 12, color: fg), const SizedBox(width: 4)],
          Text(label, style: BoraText.nunito(12, 16, weight: FontWeight.w800, color: fg)),
        ],
      ),
    );
  }
}

/// Ponto colorido de 8px (objetivo).
class Dot extends StatelessWidget {
  const Dot({super.key, required this.color, this.size = 8});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) =>
      Container(width: size, height: size, decoration: BoxDecoration(color: color, shape: BoxShape.circle));
}

/// Barra de progresso arredondada.
class ProgressBar extends StatelessWidget {
  const ProgressBar({super.key, required this.value, required this.color, this.height = 6, this.track});

  final double value;
  final Color color;
  final double height;
  final Color? track;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: Container(
        height: height,
        color: track ?? c.s2,
        alignment: Alignment.centerLeft,
        child: FractionallySizedBox(
          widthFactor: value.clamp(0, 1).toDouble(),
          child: Container(decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(999))),
        ),
      ),
    );
  }
}

/// Anel de progresso (timer e porcentagem). [progress] de 0 a 1, a partir do topo.
class ProgressRing extends StatelessWidget {
  const ProgressRing({
    super.key,
    required this.size,
    required this.progress,
    required this.color,
    required this.track,
    required this.child,
    this.strokeRatio = 10 / 148,
  });

  final double size;
  final double progress;
  final Color color;
  final Color track;
  final Widget child;
  final double strokeRatio;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _RingPainter(progress.clamp(0, 1).toDouble(), color, track, strokeRatio),
        child: Center(child: child),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter(this.progress, this.color, this.track, this.strokeRatio);

  final double progress;
  final Color color;
  final Color track;
  final double strokeRatio;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 148;
    final stroke = strokeRatio * size.width;
    final rect = Rect.fromCircle(center: size.center(Offset.zero), radius: 64 * s);
    canvas.drawArc(rect, 0, math.pi * 2, false, Paint()
      ..color = track
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke);
    if (progress > 0) {
      canvas.drawArc(rect, -math.pi / 2, math.pi * 2 * progress, false, Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeWidth = stroke);
    }
  }

  @override
  bool shouldRepaint(covariant _RingPainter old) => old.progress != progress || old.color != color;
}

/// Slider do protótipo (trilho 8px, bolinha 28 com borda `--pri` e lábio).
class BoraSlider extends StatelessWidget {
  const BoraSlider({
    super.key,
    required this.value,
    required this.min,
    required this.max,
    required this.step,
    required this.onChanged,
    this.semanticLabel,
  });

  final double value;
  final double min;
  final double max;
  final double step;
  final ValueChanged<double> onChanged;
  final String? semanticLabel;

  void _set(double dx, double width) {
    var p = (dx - 14) / (width - 28);
    p = p.clamp(0, 1).toDouble();
    final v = min + ((p * (max - min)) / step).round() * step;
    if (v != value) onChanged(v);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return LayoutBuilder(builder: (context, box) {
      final w = box.maxWidth;
      final p = (value - min) / (max - min);
      final x = 14 + (w - 28) * p;
      return Semantics(
        slider: true,
        label: semanticLabel,
        value: value.toString(),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: (d) => _set(d.localPosition.dx, w),
          onHorizontalDragUpdate: (d) => _set(d.localPosition.dx, w),
          child: SizedBox(
            height: 28,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Positioned(
                  left: 0,
                  right: 0,
                  top: 10,
                  child: Container(height: 8, decoration: BoxDecoration(color: c.s2, borderRadius: BorderRadius.circular(999))),
                ),
                Positioned(
                  left: 0,
                  top: 10,
                  width: x,
                  child: Container(height: 8, decoration: BoxDecoration(color: c.fill, borderRadius: BorderRadius.circular(999))),
                ),
                Positioned(
                  left: x - 14,
                  top: 0,
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: c.knob,
                      shape: BoxShape.circle,
                      border: Border.all(color: c.pri, width: 2),
                      boxShadow: [BoxShadow(color: c.lip, offset: const Offset(0, 2))],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}

/// Interruptor do protótipo (52×32).
class BoraSwitch extends StatelessWidget {
  const BoraSwitch({super.key, required this.on});

  final bool on;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Container(
      width: 52,
      height: 32,
      decoration: BoxDecoration(
        color: on ? c.pri : c.s2,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: on ? c.pri : c.border, width: 2),
      ),
      child: AnimatedAlign(
        duration: const Duration(milliseconds: 150),
        alignment: on ? Alignment.centerRight : Alignment.centerLeft,
        child: Padding(
          padding: const EdgeInsets.all(2),
          child: Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: c.knob,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: c.floatShadow, offset: const Offset(0, 1), blurRadius: 2)],
            ),
          ),
        ),
      ),
    );
  }
}

/// Balão de fala do Broto (raio 20 20 20 6).
class BrotoBubble extends StatelessWidget {
  const BrotoBubble({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: c.surface,
        border: Border.all(color: c.border),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
          bottomRight: Radius.circular(20),
          bottomLeft: Radius.circular(6),
        ),
      ),
      child: DefaultTextStyle(style: BoraText.bubble(c.tx), child: child),
    );
  }
}

/// Mapeia o nome do ícone vindo dos dados (`icon` das opções da rampa) para Phosphor.
IconData boraIcon(String name, {bool fill = false}) {
  switch (name) {
    case 'person-simple-walk':
      return fill ? PhosphorIconsFill.personSimpleWalk : PhosphorIconsRegular.personSimpleWalk;
    case 'drop':
      return fill ? PhosphorIconsFill.drop : PhosphorIconsRegular.drop;
    case 'broom':
      return fill ? PhosphorIconsFill.broom : PhosphorIconsRegular.broom;
    case 'calculator':
      return fill ? PhosphorIconsFill.calculator : PhosphorIconsRegular.calculator;
    case 'footprints':
      return fill ? PhosphorIconsFill.footprints : PhosphorIconsRegular.footprints;
    case 'timer':
      return fill ? PhosphorIconsFill.timer : PhosphorIconsRegular.timer;
    case 'check-circle':
      return fill ? PhosphorIconsFill.checkCircle : PhosphorIconsRegular.checkCircle;
    default:
      return fill ? PhosphorIconsFill.circle : PhosphorIconsRegular.circle;
  }
}
