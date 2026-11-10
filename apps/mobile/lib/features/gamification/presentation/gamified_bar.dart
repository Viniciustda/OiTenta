import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/theme/bora_colors.dart';
import '../../../core/theme/bora_text.dart';
import '../domain/gamification.dart';

/// Barra gamificada do topo do Hoje (sequência, gotas, nível), com os
/// valores fixos do protótipo (P18).
class GamifiedBar extends StatelessWidget {
  const GamifiedBar({super.key, required this.data});

  final GamificationSnapshot data;

  @override
  Widget build(BuildContext context) {
    final c = context.bora;
    Widget item(IconData icon, Color color, String value) => Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 4),
          Text(value, style: BoraText.fredoka(16, 16, color: c.tx)),
        ],
      ),
    );
    return FittedBox(
      fit: BoxFit.scaleDown,
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: c.surface,
          border: Border.all(color: c.border),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            item(PhosphorIconsFill.leaf, c.streak, '${data.streak}'),
            item(PhosphorIconsFill.drop, c.blueFill, '${data.drops}'),
            Container(
              padding: const EdgeInsets.fromLTRB(10, 6, 12, 6),
              decoration: BoxDecoration(
                color: c.s2,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Nv ${data.level}',
                    style: BoraText.fredoka(14, 14, color: c.pri),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 36,
                    height: 6,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: LinearProgressIndicator(
                        value: data.levelProgress,
                        backgroundColor: c.border,
                        valueColor: AlwaysStoppedAnimation(c.fill),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
