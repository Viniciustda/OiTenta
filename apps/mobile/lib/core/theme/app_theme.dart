import 'package:flutter/material.dart';

import 'bora_colors.dart';
import 'bora_text.dart';

/// `ThemeData` do app com os tokens do protótipo mobile (modo claro).
class AppTheme {
  const AppTheme._();

  static ThemeData light() {
    const c = BoraColors.light;
    final base = ThemeData(useMaterial3: true, brightness: Brightness.light);
    return base.copyWith(
      scaffoldBackgroundColor: c.bg,
      colorScheme: ColorScheme.light(
        primary: c.pri,
        onPrimary: c.priTx,
        secondary: c.blue,
        surface: c.surface,
        onSurface: c.tx,
        error: c.danger,
      ),
      textTheme: base.textTheme.apply(bodyColor: c.tx, displayColor: c.tx).copyWith(
            bodyMedium: BoraText.nunito(16, 24, weight: FontWeight.w400, color: c.tx),
          ),
      splashFactory: NoSplash.splashFactory,
      highlightColor: Colors.transparent,
      textSelectionTheme: TextSelectionThemeData(cursorColor: c.blue),
      extensions: const [c],
    );
  }
}
