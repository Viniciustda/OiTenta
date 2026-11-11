import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_app.dart';

const _handle = 'Arraste pra expandir ou recolher o calendário';

Future<void> _drag(WidgetTester tester, double dy) async {
  await tester.drag(find.bySemanticsLabel(_handle), Offset(0, dy));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('arrastar o traço para baixo abre o mês; para cima volta', (
    tester,
  ) async {
    await pumpApp(tester, location: '/semana');
    expect(find.text('3 a 9 de novembro'), findsOneWidget);
    expect(find.bySemanticsLabel('Qui 20'), findsNothing);

    await _drag(tester, 120);
    expect(find.text('Novembro'), findsOneWidget);
    expect(find.text('Arraste pra cima pra voltar à semana'), findsOneWidget);
    expect(find.bySemanticsLabel('Qui 20'), findsOneWidget);
    expect(find.bySemanticsLabel('Dom 30'), findsOneWidget);

    await _drag(tester, -120);
    expect(find.text('3 a 9 de novembro'), findsOneWidget);
    expect(find.text('Novembro'), findsNothing);
    expect(find.bySemanticsLabel('Qui 20'), findsNothing);
  });

  testWidgets('arrastar pouco (menos que o limite) não muda a visualização', (
    tester,
  ) async {
    await pumpApp(tester, location: '/semana');
    await _drag(tester, 24);
    expect(find.text('3 a 9 de novembro'), findsOneWidget);
    expect(find.text('Novembro'), findsNothing);
  });

  testWidgets('tocar no traço também alterna (acessibilidade)', (tester) async {
    await pumpApp(tester, location: '/semana');
    await tester.tap(find.bySemanticsLabel(_handle));
    await tester.pumpAndSettle();
    expect(find.text('Novembro'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel(_handle));
    await tester.pumpAndSettle();
    expect(find.text('3 a 9 de novembro'), findsOneWidget);
  });

  testWidgets('no mês, escolher um dia mostra as etapas dele', (tester) async {
    await pumpApp(tester, location: '/semana');
    await _drag(tester, 120);
    await tester.tap(find.bySemanticsLabel('Ter 11'));
    await tester.pumpAndSettle();
    expect(find.text('TERÇA, 11 DE NOVEMBRO'), findsOneWidget);
    expect(find.text('Lista 4: frações parciais'), findsOneWidget);
  });

  testWidgets('Execução/Prazos na semana', (tester) async {
    await pumpApp(tester, location: '/semana');
    expect(find.text('Diagrama de casos de uso'), findsOneWidget);

    await tester.tap(find.text('Prazos'));
    await tester.pumpAndSettle();
    expect(find.text('Diagrama de casos de uso'), findsNothing);
    expect(find.text('Nenhuma entrega neste dia.'), findsOneWidget);

    await tester.tap(find.text('Execução'));
    await tester.pumpAndSettle();
    expect(find.text('Diagrama de casos de uso'), findsOneWidget);
    expect(find.text('Nenhuma entrega neste dia.'), findsNothing);
  });

  testWidgets('Execução/Prazos no mês e de volta na semana do prazo', (
    tester,
  ) async {
    await pumpApp(tester, location: '/semana');
    await _drag(tester, 120);
    await tester.tap(find.text('Prazos'));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel('Qui 20'));
    await tester.pumpAndSettle();

    expect(find.text('QUINTA, 20 DE NOVEMBRO'), findsOneWidget);
    expect(find.text('Entrega final'), findsOneWidget);
    // Objetivo inteiro, uma vez só (as etapas ficam em Execução).
    expect(find.text('Eng. de Software'), findsNWidgets(2)); // card e legenda
    expect(find.textContaining('% concluído'), findsOneWidget);
    // Sem prazo: o Portfólio não aparece em Prazos.
    expect(find.text('Portfólio no GitHub'), findsNothing);

    await tester.tap(find.text('Execução'));
    await tester.pumpAndSettle();
    expect(find.text('Entrega final'), findsNothing);
    expect(find.text('Nada planejado pra esse dia.'), findsOneWidget);

    await tester.tap(find.text('Prazos'));
    await tester.pumpAndSettle();
    await _drag(tester, -120);
    expect(find.text('17 a 23 de novembro'), findsOneWidget);
    expect(find.text('Entrega final'), findsOneWidget);
  });
}
