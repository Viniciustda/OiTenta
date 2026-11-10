import 'package:flutter/material.dart';

/// Tokens de cor do protótipo mobile (`design/mobile/app/source/Bora App.dc.html`,
/// `[data-bora]`) e de `design/tokens.md`.
///
/// Os widgets leem as cores só por aqui (`context.bora`), nunca por hex.
@immutable
class BoraColors extends ThemeExtension<BoraColors> {
  const BoraColors({
    required this.bg,
    required this.bgSoft,
    required this.surface,
    required this.s2,
    required this.border,
    required this.tx,
    required this.tx2,
    required this.pri,
    required this.priTx,
    required this.lip,
    required this.fill,
    required this.priSoft,
    required this.blue,
    required this.blueFill,
    required this.blueSoft,
    required this.streak,
    required this.streakInk,
    required this.streakSoft,
    required this.danger,
    required this.toastIcon,
    required this.focusBg,
    required this.ringTrack,
    required this.obj1,
    required this.obj2,
    required this.obj3,
    required this.obj4,
    required this.scrim,
    required this.shadow,
    required this.floatShadow,
    required this.sheetShadow,
    required this.knob,
  });

  /// `--bg` do Bora App mobile (#FFFFFF).
  final Color bg;

  /// `--bg` do Bora Telas (#F6FAF8), usado no onboarding (divergência 1 de
  /// `design/tokens.md`).
  final Color bgSoft;
  final Color surface;
  final Color s2;
  final Color border;
  final Color tx;
  final Color tx2;
  final Color pri;
  final Color priTx;
  final Color lip;
  final Color fill;
  final Color priSoft;
  final Color blue;
  final Color blueFill;
  final Color blueSoft;
  final Color streak;
  final Color streakInk;
  final Color streakSoft;
  final Color danger;
  final Color toastIcon;
  final Color focusBg;
  final Color ringTrack;
  final Color obj1;
  final Color obj2;
  final Color obj3;
  final Color obj4;

  /// Scrim de sheet `rgba(14,31,26,.4)`.
  final Color scrim;

  /// `--shadow` (card): `0 1px 2px rgba(14,31,26,.04)`.
  final Color shadow;

  /// Sombra flutuante (toast): `0 8px 24px rgba(14,31,26,.18)`.
  final Color floatShadow;

  /// `--sheetShadow`: `0 -8px 32px rgba(14,31,26,.08)`.
  final Color sheetShadow;

  /// Bolinha dos sliders e interruptores (`#FFFFFF` nos dois temas).
  final Color knob;

  static const light = BoraColors(
    bg: Color(0xFFFFFFFF),
    bgSoft: Color(0xFFF6FAF8),
    surface: Color(0xFFFFFFFF),
    s2: Color(0xFFEAF5F0),
    border: Color(0xFFD5E6DF),
    tx: Color(0xFF0E1F1A),
    tx2: Color(0xFF4A5D57),
    pri: Color(0xFF047857),
    priTx: Color(0xFFFFFFFF),
    lip: Color(0xFF065F46),
    fill: Color(0xFF10B981),
    priSoft: Color(0xFFD1FAE5),
    blue: Color(0xFF0369A1),
    blueFill: Color(0xFF0EA5E9),
    blueSoft: Color(0xFFE0F2FE),
    streak: Color(0xFFF59E0B),
    streakInk: Color(0xFFB45309),
    streakSoft: Color(0xFFFEF3C7),
    danger: Color(0xFFDC2626),
    toastIcon: Color(0xFF38BDF8),
    focusBg: Color(0xFFE0F2FE),
    ringTrack: Color(0xFFFFFFFF),
    obj1: Color(0xFF10B981),
    obj2: Color(0xFF0EA5E9),
    obj3: Color(0xFF2DD4BF),
    obj4: Color(0xFF059669),
    scrim: Color(0x660E1F1A),
    shadow: Color(0x0A0E1F1A),
    floatShadow: Color(0x2E0E1F1A),
    sheetShadow: Color(0x140E1F1A),
    knob: Color(0xFFFFFFFF),
  );

  /// Cor do objetivo pelo `colorIndex` (P4). O índice 0 é a tarefa avulsa.
  Color objective(int colorIndex) {
    switch (colorIndex) {
      case 1:
        return obj1;
      case 2:
        return obj2;
      case 3:
        return obj3;
      case 4:
        return obj4;
      default:
        return tx2;
    }
  }

  /// Cor de texto que acompanha o objetivo (DATA `OBJ[].ink`).
  Color objectiveInk(int colorIndex) {
    switch (colorIndex) {
      case 1:
      case 4:
        return pri;
      case 2:
        return blue;
      default:
        return tx;
    }
  }

  @override
  BoraColors copyWith() => this;

  @override
  BoraColors lerp(ThemeExtension<BoraColors>? other, double t) => this;
}

extension BoraColorsContext on BuildContext {
  BoraColors get bora => Theme.of(this).extension<BoraColors>()!;
}
