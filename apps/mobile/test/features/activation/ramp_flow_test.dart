import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_app.dart';

Future<void> tapText(WidgetTester tester, String text) async {
  await tester.ensureVisible(find.text(text));
  await tester.pumpAndSettle();
  await tester.tap(find.text(text));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets(
    'rampa completa: check-in → escada → aquecer → desafio → micro → foco → registro → celebração',
    (tester) async {
      await pumpApp(tester, location: '/hoje');

      // M05
      await tester.tap(find.text('Vamos começar?'));
      await tester.pumpAndSettle();
      expect(find.text('Como está sua energia?'), findsOneWidget);
      expect(find.text('Elétrico'), findsOneWidget);
      await tester.tap(find.text('Baixa'));
      await tester.pump();
      expect(find.text('Prefiro começar por tarefas leves'), findsOneWidget);
      await tester.tap(find.text('30 min'));
      await tester.pump();
      await tester.tap(find.text('Montar minha rampa'));
      await tester.pumpAndSettle();

      // M06
      expect(find.text('Sua rampa tá pronta'), findsOneWidget);
      expect(find.text('Sugerido pra você'), findsOneWidget);
      expect(find.text('Degrau 1 de 5 · Aquecer'), findsOneWidget);
      await tester.tap(find.text('Trocar'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Água e 5 respirações'));
      await tester.pump();
      await tester.tap(find.text('Trocar degrau'));
      await tester.pumpAndSettle();
      expect(find.text('Água e 5 respirações'), findsOneWidget);
      await tapText(tester, 'Começar daqui');

      // M07
      expect(find.text('Degrau 1 de 5'), findsOneWidget);
      expect(find.text('02:00'), findsOneWidget);
      await tester.pump(const Duration(seconds: 1));
      expect(find.text('01:59'), findsOneWidget);
      await tapText(tester, 'Já terminei');

      // M08
      expect(find.text('Desafio mental'), findsOneWidget);
      for (var i = 0; i < 5; i++) {
        await tester.tap(find.bySemanticsLabel('Confirmar'));
        await tester.tap(find.bySemanticsLabel('1'));
        await tester.tap(find.bySemanticsLabel('Confirmar'));
        await tester.pump();
        await tester.tap(find.bySemanticsLabel('1'));
        await tester.tap(find.bySemanticsLabel('Confirmar'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 1600));
        await tester.pumpAndSettle();
      }

      // M09
      expect(
        find.text('Abra o arquivo do trabalho e escreva o título'),
        findsOneWidget,
      );
      await tapText(tester, 'Feito!');

      // M10
      expect(find.text('FOCO · DEGRAU 4 DE 5'), findsOneWidget);
      expect(find.text('25:00'), findsOneWidget);
      await tester.pump(const Duration(seconds: 2));
      await tapText(tester, 'Encerrar');

      // M11
      expect(
        find.text('Quanto você avançou em ‘Diagrama de casos de uso’?'),
        findsOneWidget,
      );
      await tester.tap(find.text('Parcial'));
      await tester.pumpAndSettle();
      expect(find.text('70%'), findsOneWidget);
      await tester.tap(find.text('Concluí'));
      await tester.pumpAndSettle();
      await tapText(tester, 'Registrar');

      // M12
      expect(find.text('+20'), findsOneWidget);
      expect(find.text('435 / 480 XP'), findsOneWidget);
      await tapText(tester, 'Voltar pra Hoje');
      expect(find.text('Bom dia, Arthur'), findsOneWidget);
    },
  );

  testWidgets('"Não rolou" volta para o Hoje com aviso', (tester) async {
    await pumpApp(tester, location: '/hoje');
    await tester.tap(find.text('Vamos começar?'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Elétrico'));
    await tester.pump();
    await tester.tap(find.text('1h').last);
    await tester.pump();
    await tester.tap(find.text('Montar minha rampa'));
    await tester.pumpAndSettle();
    expect(find.text('Degrau 4 de 5 · Foco'), findsOneWidget);
    await tapText(tester, 'Começar daqui');
    await tapText(tester, 'Encerrar');
    await tester.tap(find.text('Não rolou'));
    await tester.pumpAndSettle();
    await tapText(tester, 'Registrar');
    expect(find.text('Tudo bem, recalculei pra você.'), findsOneWidget);
    expect(find.text('Bom dia, Arthur'), findsOneWidget);
    await tester.pump(const Duration(seconds: 3));
  });

  testWidgets('rota da rampa sem check-in volta para o Hoje', (tester) async {
    await pumpApp(tester, location: '/rampa/foco');
    expect(find.text('Bom dia, Arthur'), findsOneWidget);
  });
}
