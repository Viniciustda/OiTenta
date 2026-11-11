import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_app.dart';

/// M06: a tag "Sugerido pra você" fica acima do degrau sugerido e por cima
/// dos degraus vizinhos (no protótipo, `z-index` do degrau sugerido). Na
/// energia Baixa o sugerido é o 1º degrau, cuja tag se estende sobre o 2º.
void main() {
  Future<void> openLadder(WidgetTester tester, String energy) async {
    await pumpApp(tester, location: '/hoje');
    await tester.tap(find.text('Vamos começar?'));
    await tester.pumpAndSettle();
    await tester.tap(find.text(energy));
    await tester.pump();
    await tester.tap(find.text('30 min'));
    await tester.pump();
    await tester.tap(find.text('Montar minha rampa'));
    await tester.pumpAndSettle();
    expect(find.text('Sua rampa tá pronta'), findsOneWidget);
  }

  /// O alvo do toque em [point] é a própria tag (nada desenhado por cima).
  void expectTagOnTop(WidgetTester tester, Finder tag, Offset point) {
    final hit = tester.hitTestOnBinding(point);
    final tagBox = tester.renderObject(tag);
    expect(
      hit.path.any((e) => identical(e.target, tagBox)),
      isTrue,
      reason: 'a tag está coberta em $point',
    );
    final firstBox = hit.path
        .map((e) => e.target)
        .whereType<RenderBox>()
        .first;
    expect(identical(firstBox, tagBox), isTrue, reason: 'algo cobre a tag');
  }

  for (final energy in ['Baixa', 'Média', 'Alta', 'Elétrico']) {
    testWidgets('a tag "Sugerido pra você" fica visível na escada ($energy)', (
      tester,
    ) async {
      await openLadder(tester, energy);
      final tag = find.text('Sugerido pra você');
      expect(tag, findsOneWidget);
      final r = tester.getRect(tag);
      final screen = Offset.zero & tester.view.physicalSize;
      expect(screen.contains(r.topLeft) && screen.contains(r.bottomRight), isTrue);
      for (final p in [
        r.center,
        r.centerLeft + const Offset(2, 0),
        r.centerRight - const Offset(2, 0),
      ]) {
        expectTagOnTop(tester, tag, p);
      }
    });
  }

  testWidgets('tocar na tag escolhe o degrau sugerido (a tag é parte dele)', (
    tester,
  ) async {
    await openLadder(tester, 'Baixa');
    await tester.tap(find.bySemanticsLabel(RegExp('^Micro-passo')));
    await tester.pump();
    expect(find.text('Degrau 3 de 5 · Micro-passo'), findsOneWidget);
    await tester.tap(find.text('Sugerido pra você'));
    await tester.pump();
    expect(find.text('Degrau 1 de 5 · Aquecer'), findsOneWidget);
  });
}
