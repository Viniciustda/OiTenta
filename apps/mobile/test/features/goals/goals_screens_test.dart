import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_app.dart';

void main() {
  testWidgets('Objetivos → trilha', (tester) async {
    await pumpApp(tester, location: '/objetivos');
    expect(find.text('3 ativos · próxima entrega 20/11'), findsOneWidget);
    expect(find.text('62%'), findsOneWidget);
    await tester.tap(find.text('Eng. de Software'));
    await tester.pumpAndSettle();
    expect(find.text('5 de 8 etapas concluídas · folga de 2 dias'), findsOneWidget);
    expect(find.text('Próxima'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('Voltar'));
    await tester.pumpAndSettle();
    expect(find.text('Objetivos'), findsWidgets);
  });

  testWidgets('Novo objetivo (M15 vazia): adiciona etapa, escolhe prazo e distribui', (tester) async {
    final deps = await pumpApp(tester, location: '/objetivos');
    await tester.tap(find.text('Novo objetivo'));
    await tester.pumpAndSettle();
    expect(find.text('0 min no total'), findsOneWidget);

    await tester.enterText(find.byType(EditableText).first, 'Trabalho de Algoritmos');
    await tester.tap(find.text('Adicionar etapa'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(EditableText).last, 'Implementar os 3 algoritmos');
    await tester.tap(find.text('2h'));
    await tester.tap(find.text('Adicionar'));
    await tester.pumpAndSettle();
    expect(find.text('2h no total'), findsOneWidget);

    await tester.tap(find.bySemanticsLabel(RegExp(r'^Prazo')));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel('Seg, 24/11/2025'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar'));
    await tester.pumpAndSettle();
    expect(find.text('Seg, 24/11/2025'), findsOneWidget);

    await tester.tap(find.text('Distribuir no calendário'));
    await tester.pumpAndSettle();
    expect(find.text('Semana'), findsWidgets);
    expect((await deps.goals.listGoals()).last.title, 'Trabalho de Algoritmos');
    await tester.pump(const Duration(seconds: 3));
  });

  testWidgets('Preencher à mão (M16): salva uma tarefa única', (tester) async {
    final deps = await pumpApp(tester, location: '/objetivos/novo');
    await tester.tap(find.text('Preencher à mão'));
    await tester.pumpAndSettle();
    expect(find.text('Salvar tarefa'), findsOneWidget);
    await tester.enterText(find.byType(EditableText).first, 'Revisar o relatório');
    await tester.tap(find.text('1h30'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Salvar tarefa'));
    await tester.tap(find.text('Salvar tarefa'));
    await tester.pumpAndSettle();
    final last = (await deps.goals.listGoals()).last;
    expect(last.title, 'Revisar o relatório');
    expect(last.total, 1);
    await tester.pump(const Duration(seconds: 3));
  });
}
