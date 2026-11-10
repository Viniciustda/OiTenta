import 'dart:async';

import 'package:google_fonts/google_fonts.dart';

/// Os testes não baixam fontes (P22): caem na fonte padrão.
Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  GoogleFonts.config.allowRuntimeFetching = false;
  await testMain();
}
