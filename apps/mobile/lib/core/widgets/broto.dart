import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../theme/broto_palette.dart';

/// Humores do Broto usados nas telas da fatia (DATA `Broto`).
enum BrotoMood { ok, sono, animado, eletrico, focado, comemora }

/// O mascote Broto, desenhado com a geometria exata do protótipo
/// (`bora-data.js`, função `Broto`, viewBox 120×120).
class Broto extends StatelessWidget {
  const Broto({super.key, this.mood = BrotoMood.ok, this.size = 40});

  final BrotoMood mood;
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _BrotoPainter(mood)),
    );
  }
}

class _BrotoPainter extends CustomPainter {
  _BrotoPainter(this.mood);

  final BrotoMood mood;

  Paint _fill(Color c) => Paint()..color = c;

  Paint _stroke(Color c, double w) => Paint()
    ..color = c
    ..style = PaintingStyle.stroke
    ..strokeWidth = w
    ..strokeCap = StrokeCap.round
    ..strokeJoin = StrokeJoin.round;

  void _eye(Canvas c, double cx, double cy, double rx, double ry) =>
      c.drawOval(Rect.fromCenter(center: Offset(cx, cy), width: rx * 2, height: ry * 2), _fill(BrotoPalette.ink));

  void _sparkle(Canvas c, double x, double y, double r, double w) {
    final p = Path()
      ..moveTo(x, y - r)
      ..lineTo(x, y + r)
      ..moveTo(x - r, y)
      ..lineTo(x + r, y);
    c.drawPath(p, _stroke(BrotoPalette.accessory, w));
  }

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 120, size.height / 120);

    // Sombra no chão.
    canvas.drawOval(Rect.fromCenter(center: const Offset(60, 112), width: 60, height: 8), _fill(BrotoPalette.groundShadow));

    final lift = mood == BrotoMood.animado || mood == BrotoMood.comemora || mood == BrotoMood.eletrico;
    canvas.save();
    if (lift) canvas.translate(0, -4);
    final droop = mood == BrotoMood.sono;

    // Caule.
    canvas.drawPath(Path()
      ..moveTo(60, 47)
      ..lineTo(60, 36), _stroke(BrotoPalette.stem, 3.5));

    // Folha (+ nervura).
    canvas.save();
    if (droop) {
      canvas.translate(60, 36);
      canvas.rotate(38 * math.pi / 180);
      canvas.translate(-60, -36);
    }
    canvas.drawPath(
      Path()
        ..moveTo(60, 36)
        ..cubicTo(60, 24, 70, 17, 83, 19)
        ..cubicTo(81, 32, 71, 38, 60, 36)
        ..close(),
      _fill(BrotoPalette.leaf),
    );
    canvas.drawPath(
      Path()
        ..moveTo(63, 33)
        ..cubicTo(67, 29, 73, 25, 79, 22),
      _stroke(BrotoPalette.stem.withValues(alpha: .5), 1.6),
    );
    canvas.restore();

    // Corpo, barriga e brilho.
    canvas.drawPath(
      Path()
        ..moveTo(60, 46)
        ..cubicTo(84, 46, 94, 68, 94, 82)
        ..cubicTo(94, 100, 79, 108, 60, 108)
        ..cubicTo(41, 108, 26, 100, 26, 82)
        ..cubicTo(26, 68, 36, 46, 60, 46)
        ..close(),
      _fill(BrotoPalette.body),
    );
    canvas.drawPath(
      Path()
        ..moveTo(27, 90)
        ..cubicTo(33, 103, 47, 108, 60, 108)
        ..cubicTo(78, 108, 91, 101, 93, 88)
        ..cubicTo(83, 100, 46, 104, 27, 90)
        ..close(),
      _fill(BrotoPalette.belly),
    );
    canvas.drawPath(
      Path()
        ..moveTo(44, 59)
        ..cubicTo(44, 59, 39, 65, 39, 68.5)
        ..arcToPoint(const Offset(49, 68.5), radius: const Radius.circular(5), clockwise: false)
        ..cubicTo(49, 65, 44, 59, 44, 59)
        ..close(),
      _fill(BrotoPalette.shine),
    );

    _face(canvas);
    canvas.restore();
    _extras(canvas);
    canvas.restore();
  }

  void _face(Canvas c) {
    final ink = BrotoPalette.ink;
    switch (mood) {
      case BrotoMood.ok:
        _eye(c, 50, 82, 4, 5.5);
        _eye(c, 70, 82, 4, 5.5);
        c.drawPath(Path()
          ..moveTo(57, 92.5)
          ..quadraticBezierTo(60, 95, 63, 92.5), _stroke(ink, 2.2));
      case BrotoMood.sono:
        c.drawPath(Path()
          ..moveTo(45.5, 83)
          ..quadraticBezierTo(50, 86.5, 54.5, 83), _stroke(ink, 2.6));
        c.drawPath(Path()
          ..moveTo(65.5, 83)
          ..quadraticBezierTo(70, 86.5, 74.5, 83), _stroke(ink, 2.6));
        c.drawCircle(const Offset(60, 94), 1.8, _fill(ink));
      case BrotoMood.animado:
      case BrotoMood.eletrico:
        _eye(c, 50, 82, 4.6, 6.2);
        _eye(c, 70, 82, 4.6, 6.2);
        c.drawCircle(const Offset(51.6, 79.4), 1.7, _fill(BrotoPalette.eyeHighlight));
        c.drawCircle(const Offset(71.6, 79.4), 1.7, _fill(BrotoPalette.eyeHighlight));
        final m = mood == BrotoMood.animado
            ? (Path()
              ..moveTo(55.5, 90.5)
              ..quadraticBezierTo(60, 97.5, 64.5, 90.5)
              ..close())
            : (Path()
              ..moveTo(55, 90)
              ..quadraticBezierTo(60, 98.5, 65, 90)
              ..close());
        c.drawPath(m, _fill(ink));
      case BrotoMood.focado:
        _eye(c, 50, 83, 3.2, 4.2);
        _eye(c, 70, 83, 3.2, 4.2);
        c.drawPath(Path()
          ..moveTo(57, 95)
          ..lineTo(63, 95), _stroke(ink, 2.6));
        c.drawCircle(const Offset(50, 82), 8.5, _fill(BrotoPalette.glassFill));
        c.drawCircle(const Offset(70, 82), 8.5, _fill(BrotoPalette.glassFill));
        c.drawCircle(const Offset(50, 82), 8.5, _stroke(ink, 2.4));
        c.drawCircle(const Offset(70, 82), 8.5, _stroke(ink, 2.4));
        c.drawPath(Path()
          ..moveTo(58.5, 81)
          ..quadraticBezierTo(60, 79.5, 61.5, 81), _stroke(ink, 2.4));
      case BrotoMood.comemora:
        c.drawPath(Path()
          ..moveTo(45.5, 84)
          ..quadraticBezierTo(50, 78, 54.5, 84), _stroke(ink, 2.8));
        c.drawPath(Path()
          ..moveTo(65.5, 84)
          ..quadraticBezierTo(70, 78, 74.5, 84), _stroke(ink, 2.8));
        c.drawPath(
            Path()
              ..moveTo(55, 90)
              ..quadraticBezierTo(60, 98.5, 65, 90)
              ..close(),
            _fill(ink));
    }
  }

  void _extras(Canvas c) {
    switch (mood) {
      case BrotoMood.sono:
        final tp1 = TextPainter(
          text: const TextSpan(text: 'z', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: BrotoPalette.zzz)),
          textDirection: TextDirection.ltr,
        )..layout();
        tp1.paint(c, Offset(88, 58 - tp1.height));
        final tp2 = TextPainter(
          text: const TextSpan(text: 'z', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: BrotoPalette.zzz)),
          textDirection: TextDirection.ltr,
        )..layout();
        tp2.paint(c, Offset(98, 46 - tp2.height));
      case BrotoMood.animado:
        _sparkle(c, 100, 50, 5, 2.6);
        _sparkle(c, 18, 63, 4, 2.6);
      case BrotoMood.eletrico:
        _sparkle(c, 100, 50, 5, 2.6);
        _sparkle(c, 18, 63, 4, 2.6);
        _sparkle(c, 104, 77, 3, 2.2);
        _sparkle(c, 26, 37, 3, 2.2);
      case BrotoMood.comemora:
        const confetti = [
          [22.0, 40.0, 0, -20.0],
          [98.0, 36.0, 1, 25.0],
          [12.0, 76.0, 2, 40.0],
          [106.0, 72.0, 0, -35.0],
          [36.0, 22.0, 2, 15.0],
          [86.0, 16.0, 1, -15.0],
        ];
        const colors = [BrotoPalette.confetti, BrotoPalette.accessory, BrotoPalette.leaf];
        for (final k in confetti) {
          c.save();
          c.translate(k[0].toDouble(), k[1].toDouble());
          c.rotate(k[3].toDouble() * math.pi / 180);
          c.drawRRect(
            RRect.fromRectAndRadius(const Rect.fromLTWH(-3.5, -2, 7, 4), const Radius.circular(1.5)),
            _fill(colors[k[2].toInt()]),
          );
          c.restore();
        }
      default:
        break;
    }
  }

  @override
  bool shouldRepaint(covariant _BrotoPainter old) => old.mood != mood;
}
