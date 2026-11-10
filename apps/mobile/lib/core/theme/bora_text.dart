import 'package:flutter/widgets.dart';
import 'package:google_fonts/google_fonts.dart';

/// Tipografia do protótipo mobile (`design/tokens.md`, "Tipografia"):
/// Fredoka 600/700 para títulos e números, Nunito 400–800 para o corpo.
///
/// A cor vem sempre de um token (`context.bora`).
class BoraText {
  const BoraText._();

  static TextStyle fredoka(double size, double lineHeight, {FontWeight weight = FontWeight.w600, Color? color}) =>
      GoogleFonts.fredoka(
        fontSize: size,
        height: lineHeight / size,
        fontWeight: weight,
        color: color,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle nunito(double size, double lineHeight, {FontWeight weight = FontWeight.w600, Color? color}) =>
      GoogleFonts.nunito(fontSize: size, height: lineHeight / size, fontWeight: weight, color: color);

  /// H1 · Fredoka 600 26/32.
  static TextStyle h1(Color color) => fredoka(26, 32, color: color);

  /// H2 · Fredoka 600 20/26.
  static TextStyle h2(Color color) => fredoka(20, 26, color: color);

  /// H3 / título de card · Fredoka 600 18/24.
  static TextStyle h3(Color color) => fredoka(18, 24, color: color);

  /// Small · Nunito 600 14/20.
  static TextStyle small(Color color) => nunito(14, 20, color: color);

  /// Caption · Nunito 600 12/16.
  static TextStyle caption(Color color) => nunito(12, 16, color: color);

  /// Rótulo · Nunito 800 12/16 caixa-alta, tracking .06em (o texto já vem em caixa-alta).
  static TextStyle label(Color color) =>
      nunito(12, 16, weight: FontWeight.w800, color: color).copyWith(letterSpacing: 0.72);

  /// Botão · Nunito 800 16.
  static TextStyle button(Color color) => nunito(16, 16, weight: FontWeight.w800, color: color);

  /// Balão de chat · Nunito 400 15/22.
  static TextStyle bubble(Color color) => nunito(15, 22, weight: FontWeight.w400, color: color);
}
