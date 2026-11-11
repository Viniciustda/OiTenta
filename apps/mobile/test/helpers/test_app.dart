import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/app.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/core/theme/app_theme.dart';

/// Tela alta e larga: a fonte de teste (Ahem) é bem mais larga que a Nunito,
/// então os testes de comportamento usam 800×1600 para não estourar linhas.
Future<void> usePhoneSize(WidgetTester tester) async {
  tester.view.physicalSize = const Size(800, 1600);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

/// Sobe o app inteiro com os dados de exemplo, a partir de [location].
Future<AppDependencies> pumpApp(
  WidgetTester tester, {
  String location = '/entrar',
  AppDependencies? deps,
}) async {
  await usePhoneSize(tester);
  final d = deps ?? AppDependencies.sample();
  if (location != '/entrar' && d.session.session == null) {
    d.session.save(await d.auth.loginDemo());
  }
  await tester.pumpWidget(BoraApp(deps: d, initialLocation: location));
  await tester.pumpAndSettle();
  return d;
}

/// Envolve uma tela isolada no tema do app.
Widget themed(Widget child) => MaterialApp(
  theme: AppTheme.light(),
  home: Scaffold(body: child),
);
