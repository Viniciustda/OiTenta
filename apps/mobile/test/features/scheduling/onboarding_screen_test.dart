import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_app.dart';

void main() {
  testWidgets('onboarding: 6 passos, T01 → grade → limite → salvar → Hoje', (tester) async {
    final deps = await pumpApp(tester, location: '/onboarding');

    expect(find.text('1 de 6'), findsOneWidget);
    await tester.tap(find.text('Continuar'));
    await tester.pumpAndSettle();

    // T01
    expect(find.text('2 de 6'), findsOneWidget);
    expect(find.textContaining('Fechado, Arthur'), findsOneWidget);
    await tester.tap(find.text('Saber por onde ir'));
    await tester.pumpAndSettle();

    // passo 3 (placeholder)
    expect(find.text('3 de 6'), findsOneWidget);
    await tester.tap(find.text('Continuar'));
    await tester.pumpAndSettle();

    // T02: sem período, "Continuar" não avança
    expect(find.text('4 de 6'), findsOneWidget);
    await tester.tap(find.text('Continuar'));
    await tester.pumpAndSettle();
    expect(find.text('4 de 6'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('SEG Noite'));
    await tester.tap(find.bySemanticsLabel('SÁB Manhã'));
    await tester.pumpAndSettle();
    expect(find.text('2 períodos · cerca de 4h livres por semana'), findsOneWidget);
    await tester.tap(find.text('Continuar'));
    await tester.pumpAndSettle();

    // T03
    expect(find.text('5 de 6'), findsOneWidget);
    expect(find.text('2 períodos livres'), findsOneWidget);
    expect(find.text('4h'), findsWidgets);
    await tester.tap(find.text('Continuar'));
    await tester.pumpAndSettle();

    // passo 6 e Hoje
    expect(find.text('6 de 6'), findsOneWidget);
    final saved = await deps.scheduling.getAvailability();
    expect(saved!.windows, hasLength(2));
    expect(saved.dailyLimitMinutes, 240);
    await tester.tap(find.text('Ir para o Hoje'));
    await tester.pumpAndSettle();
    expect(find.text('Bom dia, Arthur'), findsOneWidget);
    expect(find.byType(Text), findsWidgets);
  });
}
