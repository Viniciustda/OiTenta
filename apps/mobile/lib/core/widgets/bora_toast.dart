import 'dart:async';

import 'package:flutter/material.dart';

import '../theme/bora_colors.dart';
import '../theme/bora_text.dart';

/// Toast do protótipo: pílula escura (`--tx`), ícone em `--toastIcon`,
/// título Fredoka 700 18/22 e subtítulo Nunito 600 12/16.
void showBoraToast(
  BuildContext context, {
  required IconData icon,
  required String title,
  required String subtitle,
  Duration duration = const Duration(milliseconds: 2400),
}) {
  final overlay = Overlay.maybeOf(context, rootOverlay: true);
  if (overlay == null) return;
  final c = context.bora;
  final top = MediaQuery.paddingOf(context).top + 56;
  late OverlayEntry entry;
  entry = OverlayEntry(
    builder: (_) => Positioned(
      top: top,
      left: 0,
      right: 0,
      child: IgnorePointer(
        child: Center(
          child: Material(
            type: MaterialType.transparency,
            child: Container(
              constraints: const BoxConstraints(maxWidth: 340),
              padding: const EdgeInsets.fromLTRB(10, 10, 20, 10),
              decoration: BoxDecoration(
                color: c.tx,
                borderRadius: BorderRadius.circular(999),
                boxShadow: [BoxShadow(color: c.floatShadow, offset: const Offset(0, 8), blurRadius: 24)],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(color: c.toastIcon.withValues(alpha: .16), shape: BoxShape.circle),
                    alignment: Alignment.center,
                    child: Icon(icon, size: 20, color: c.toastIcon),
                  ),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title, style: BoraText.fredoka(18, 22, weight: FontWeight.w700, color: c.bg)),
                        Text(subtitle, style: BoraText.caption(c.bg.withValues(alpha: .8))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
  overlay.insert(entry);
  Timer(duration, () {
    if (entry.mounted) entry.remove();
  });
}
