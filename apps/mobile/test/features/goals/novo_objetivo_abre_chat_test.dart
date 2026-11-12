import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_app.dart';

/// IA4 (docs/2-decisoes-mvp.md): o botão "Novo objetivo" (M02) abre o chat
/// do novo objetivo (M13), e não mais a M15 vazia.
void main() {
  testWidgets('"Novo objetivo" na lista abre o chat (M13)', (tester) async {
    await pumpApp(tester, location: '/objetivos');
    await tester.tap(find.text('Novo objetivo'));
    await tester.pumpAndSettle();
    expect(
      find.text(
        'Me conta o que você precisa fazer e até quando. Pode escrever, mandar '
        'áudio ou anexar o enunciado.',
      ),
      findsOneWidget,
    );
    expect(find.text('Preencher à mão'), findsOneWidget);
    expect(find.text('0 min no total'), findsNothing);
  });
}
