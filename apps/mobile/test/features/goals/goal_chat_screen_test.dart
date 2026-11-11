import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/core/sample/bora_sample_data.dart';
import 'package:oitenta/features/activation/data/sample_activation_repository.dart';
import 'package:oitenta/features/auth/data/sample_auth_repository.dart';
import 'package:oitenta/features/gamification/data/sample_gamification_repository.dart';
import 'package:oitenta/features/goals/data/goal_assistant_repository.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';
import 'package:oitenta/features/goals/domain/goal_suggestion.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';

import '../../helpers/test_app.dart';

class _FailingAssistant implements GoalAssistantRepository {
  @override
  Future<GoalSuggestion> suggest(String description) async =>
      throw Exception('fora do ar');
}

const _brotoAsk =
    'Me conta o que você precisa fazer e até quando. Pode escrever, mandar '
    'áudio ou anexar o enunciado.';

void main() {
  testWidgets('M13: chat vazio com o pedido do Broto, campo, anexo e áudio', (
    tester,
  ) async {
    await pumpApp(tester, location: '/objetivos/chat');
    expect(find.text(_brotoAsk), findsOneWidget);
    expect(find.text('Preencher à mão'), findsOneWidget);
    expect(
      find.text('Ex.: trabalho de Algoritmos para dia 24/11'),
      findsOneWidget,
    );
    expect(find.bySemanticsLabel('Anexar'), findsOneWidget);
    expect(find.bySemanticsLabel('Gravar áudio'), findsOneWidget);
    expect(find.bySemanticsLabel('Enviar'), findsNothing);
  });

  testWidgets(
    'descrever o objetivo → IA analisando (M14) → etapas editáveis preenchidas → distribuir',
    (tester) async {
      final deps = await pumpApp(tester, location: '/objetivos/chat');
      await tester.enterText(
        find.byType(EditableText),
        'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11',
      );
      await tester.pump();
      expect(find.bySemanticsLabel('Gravar áudio'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Enviar'));
      await tester.pump();

      // M14
      expect(
        find.text(
          'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11',
        ),
        findsOneWidget,
      );
      expect(
        find.text(
          'Lendo o que você mandou e separando o que precisa ser entregue…',
        ),
        findsOneWidget,
      );
      expect(find.text('IA analisando…'), findsOneWidget);

      // Resposta → tela de etapas (M15) preenchida
      await tester.pump(const Duration(seconds: 3));
      await tester.pumpAndSettle();
      expect(find.text('ETAPAS SUGERIDAS'), findsOneWidget);
      expect(find.text('8h15 no total'), findsOneWidget);
      expect(find.text('Trabalho de Algoritmos'), findsOneWidget);
      expect(find.text('Seg, 24/11/2025'), findsOneWidget);
      expect(
        find.text('Medir tempos com 3 tamanhos de entrada'),
        findsOneWidget,
      );
      expect(find.text('Revisar e enviar'), findsOneWidget);

      // editável: remove a última etapa
      await tester.tap(find.bySemanticsLabel('Excluir etapa').last);
      await tester.pump();
      expect(find.text('7h30 no total'), findsOneWidget);

      await tester.ensureVisible(find.text('Distribuir no calendário'));
      await tester.tap(find.text('Distribuir no calendário'));
      await tester.pumpAndSettle();
      expect(find.text('Semana'), findsWidgets);
      final g = (await deps.goals.listGoals()).last;
      expect(g.title, 'Trabalho de Algoritmos');
      expect(g.deadline, '2025-11-24');
      expect(g.total, 4);
      await tester.pump(const Duration(seconds: 3));
    },
  );

  testWidgets(
    '"Preencher à mão" do chat abre a M15 vazia (P20), que leva à M16',
    (tester) async {
      await pumpApp(tester, location: '/objetivos/chat');
      await tester.tap(find.text('Preencher à mão'));
      await tester.pumpAndSettle();
      expect(find.text('0 min no total'), findsOneWidget);
      expect(find.text('ETAPAS'), findsOneWidget);
      await tester.tap(find.text('Preencher à mão'));
      await tester.pumpAndSettle();
      expect(find.text('Salvar tarefa'), findsOneWidget);
    },
  );

  testWidgets('se a IA falhar, abre o formulário manual vazio (4f)', (
    tester,
  ) async {
    final deps = AppDependencies(
      auth: SampleAuthRepository(),
      scheduling: SampleSchedulingRepository(),
      goals: SampleGoalsRepository(),
      activation: SampleActivationRepository(),
      gamification: SampleGamificationRepository(),
      clock: FixedClock(BoraSample.today),
      goalAssistant: _FailingAssistant(),
    );
    await pumpApp(tester, location: '/objetivos/chat', deps: deps);
    await tester.enterText(find.byType(EditableText), 'Prova de Cálculo');
    await tester.pump();
    await tester.tap(find.bySemanticsLabel('Enviar'));
    await tester.pumpAndSettle();
    expect(find.text('0 min no total'), findsOneWidget);
  });

  testWidgets('voltar do chat volta para Objetivos', (tester) async {
    await pumpApp(tester, location: '/objetivos/chat');
    await tester.tap(find.bySemanticsLabel('Voltar'));
    await tester.pumpAndSettle();
    expect(find.text('3 ativos · próxima entrega 20/11'), findsOneWidget);
  });

  testWidgets(
    'o "Enviar" do teclado durante a análise não abre a M15 vazia (regressão)',
    (tester) async {
      await pumpApp(tester, location: '/objetivos/chat');
      await tester.enterText(
        find.byType(EditableText),
        'Trabalho de Algoritmos',
      );
      await tester.pump();
      await tester.tap(find.bySemanticsLabel('Enviar'));
      await tester.pump();
      expect(find.text('IA analisando…'), findsOneWidget);

      await tester.showKeyboard(find.byType(EditableText));
      await tester.testTextInput.receiveAction(TextInputAction.send);
      await tester.pump();
      expect(find.text('0 min no total'), findsNothing);
      expect(find.text('IA analisando…'), findsOneWidget);

      await tester.pump(const Duration(seconds: 3));
      await tester.pumpAndSettle();
      expect(find.text('ETAPAS SUGERIDAS'), findsOneWidget);
      expect(find.text('8h15 no total'), findsOneWidget);
    },
  );

  testWidgets('o "Enviar" do teclado com o campo vazio não sai do chat', (
    tester,
  ) async {
    await pumpApp(tester, location: '/objetivos/chat');
    await tester.showKeyboard(find.byType(EditableText));
    await tester.testTextInput.receiveAction(TextInputAction.send);
    await tester.pumpAndSettle();
    expect(find.text(_brotoAsk), findsOneWidget);
    expect(find.text('0 min no total'), findsNothing);
  });
}
