import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_app.dart';

void main() {
  testWidgets('Hoje mostra a barra, a timeline e a folga; as abas navegam', (tester) async {
    await pumpApp(tester, location: '/hoje');
    expect(find.text('340'), findsOneWidget);
    expect(find.text('Nv 7'), findsOneWidget);
    expect(find.text('Vamos começar?'), findsOneWidget);
    expect(find.text('Diagrama de casos de uso'), findsOneWidget);
    expect(find.text('Próxima'), findsOneWidget);
    expect(find.text('40% · continua de ontem'), findsOneWidget);
    final folga = find.textContaining('Folga até o prazo: 2 dias', findRichText: true);
    await tester.ensureVisible(folga);
    expect(find.textContaining('entrega 20/11', findRichText: true), findsOneWidget);

    await tester.tap(find.text('Responder o grupo do trabalho'));
    await tester.pump();

    await tester.tap(find.text('Semana'));
    await tester.pumpAndSettle();
    expect(find.text('3 a 9 de novembro'), findsOneWidget);
    expect(find.text('HOJE, QUINTA, 6 DE NOVEMBRO'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('Seg 3'));
    await tester.pumpAndSettle();
    expect(find.text('SEGUNDA, 3 DE NOVEMBRO'), findsOneWidget);
    expect(find.text('Levantar requisitos'), findsOneWidget);

    await tester.tap(find.text('Jardim'));
    await tester.pumpAndSettle();
    expect(find.textContaining('entram depois do MVP'), findsOneWidget);
  });
}
