// Etapa E (mobile): fluxo principal de ponta a ponta, no simulador iOS,
// contra o backend local real (`env/local-simulator.json`, DATA_SOURCE=http).
//
// Antes de cada execução: backend no ar (porta 4000) e
// `npm --workspace apps/backend run db:reset-demo`.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:oitenta/app.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/core/format/bora_format.dart';
import 'package:oitenta/features/goals/presentation/deadline_field.dart';

/// Repete `pump` até [finder] aparecer (as chamadas HTTP são assíncronas de
/// verdade; `pumpAndSettle` pode voltar antes da resposta chegar).
Future<void> pumpUntil(
  WidgetTester tester,
  Finder finder, {
  Duration timeout = const Duration(seconds: 20),
  String? reason,
}) async {
  final end = DateTime.now().add(timeout);
  while (DateTime.now().isBefore(end)) {
    await tester.pump(const Duration(milliseconds: 100));
    if (finder.evaluate().isNotEmpty) return;
  }
  fail('Não apareceu a tempo: $finder${reason == null ? '' : ' ($reason)'}');
}

/// Toca no texto (rolando até ele, se preciso) e dá alguns quadros.
Future<void> tapText(
  WidgetTester tester,
  String text, {
  bool last = false,
}) async {
  final f = last ? find.text(text).last : find.text(text).first;
  await pumpUntil(tester, f);
  await tester.ensureVisible(f);
  await tester.pump(const Duration(milliseconds: 300));
  await tester.tap(f);
  await tester.pump(const Duration(milliseconds: 300));
}

Future<void> tapLabel(WidgetTester tester, Pattern label) async {
  final f = find.bySemanticsLabel(label).first;
  await pumpUntil(tester, f);
  await tester.ensureVisible(f);
  await tester.pump(const Duration(milliseconds: 300));
  await tester.tap(f);
  await tester.pump(const Duration(milliseconds: 300));
}

/// O menor ancestral de [anchor] (um cartão/linha) que também contém [target];
/// devolve só os [target] dentro dele. Se esse ancestral também contém algum
/// [exclude], o [target] não é daquele cartão: devolve um finder vazio.
Finder inCardOf(
  Finder anchor,
  Finder target, {
  List<Finder> exclude = const [],
}) {
  Element? card;
  anchor.evaluate().first.visitAncestorElements((a) {
    final inA = find.descendant(
      of: find.byElementPredicate((e) => identical(e, a)),
      matching: target,
    );
    if (inA.evaluate().isNotEmpty) {
      card = a;
      return false;
    }
    return true;
  });
  final scope = find.byElementPredicate((e) => identical(e, card));
  if (card == null ||
      exclude.any(
        (x) => find.descendant(of: scope, matching: x).evaluate().isNotEmpty,
      )) {
    return find.byKey(const ValueKey('nenhum-cartão'));
  }
  return find.descendant(of: scope, matching: target);
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('fluxo principal: login demo → onboarding → objetivo → plano → Hoje → '
      'rampa → registrar → plano recalculado', (tester) async {
    final deps = AppDependencies.fromConfig();
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final deadline = today.add(const Duration(days: 14));
    final stamp = now.millisecondsSinceEpoch % 100000;
    final goalTitle = 'E2E mobile $stamp';
    const step1 = 'Ler o enunciado';
    const step2 = 'Escrever o resumo';

    await tester.pumpWidget(BoraApp(deps: deps));
    await tester.pump();

    // --- Login demo ---------------------------------------------------------
    await tapText(tester, 'Entrar direto como Arthur (demo)');

    // --- Onboarding (usuário sem disponibilidade, depois do db:reset-demo) ---
    await pumpUntil(tester, find.text('1 de 6'), reason: 'onboarding');
    await tapText(tester, 'Continuar');
    await pumpUntil(tester, find.text('2 de 6'));
    await tapText(tester, 'Começar');
    await pumpUntil(tester, find.text('3 de 6'));
    await tapText(tester, 'Continuar');

    // T02: a grade. Marca as 3 faixas dos 7 dias para o plano caber hoje
    // sempre que ainda houver janela livre no dia.
    await pumpUntil(tester, find.text('4 de 6'));
    for (final d in ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']) {
      for (final p in ['Manhã', 'Tarde', 'Noite']) {
        await tapLabel(tester, '$d $p');
      }
    }
    expect(
      find.text('21 períodos · cerca de 42h livres por semana'),
      findsOneWidget,
    );
    await tapText(tester, 'Continuar');

    // T03: o limite (padrão 4h por dia).
    await pumpUntil(tester, find.text('5 de 6'));
    expect(find.text('MÁXIMO POR DIA'), findsOneWidget);
    await tapText(tester, 'Continuar');
    await pumpUntil(
      tester,
      find.text('6 de 6'),
      reason: 'PUT /scheduling/availability',
    );
    await tapText(tester, 'Ir para o Hoje');

    // --- Objetivo pela M15 vazia --------------------------------------------
    await pumpUntil(tester, find.text('Objetivos'));
    await tapText(tester, 'Objetivos');
    await tapLabel(tester, 'Novo objetivo');
    await tapText(tester, 'Preencher à mão');
    await pumpUntil(tester, find.text('0 min no total'));
    // Espera a transição chat → M15 terminar: antes disso, o campo do chat
    // ainda é o primeiro EditableText da tela e receberia o título.
    await tester.pump(const Duration(seconds: 1));
    await tester.enterText(find.byType(EditableText).first, goalTitle);
    await tester.pump();

    for (final s in [step1, step2]) {
      await tapText(tester, 'Adicionar etapa');
      await tester.enterText(find.byType(EditableText).last, s);
      await tester.pump();
      await tapText(tester, '15 min', last: true);
      await tapText(tester, 'Adicionar', last: true);
    }
    await pumpUntil(tester, find.text('30 min no total'));

    await tapLabel(tester, RegExp(r'^Prazo'));
    await pumpUntil(tester, find.text('Confirmar'));
    if (deadline.month != today.month) await tapLabel(tester, 'Próximo mês');
    await tapLabel(tester, BoraFormat.fullDate(deadline));
    await tapText(tester, 'Confirmar');
    // A data confirmada no campo Prazo (não o cabeçalho do seletor).
    await pumpUntil(
      tester,
      find.descendant(
        of: find.byType(DeadlineField),
        matching: find.text(BoraFormat.fullDate(deadline)),
      ),
      reason: 'prazo confirmado',
    );
    expect(find.text('Nenhuma data escolhida'), findsNothing);

    await tapText(tester, 'Distribuir no calendário');

    // --- O plano aparece na Semana ------------------------------------------
    await pumpUntil(
      tester,
      find.text('2 etapas no calendário'),
      reason: 'POST /goals',
    );
    await pumpUntil(tester, find.text('Execução'));
    await pumpUntil(tester, find.text(step1), reason: 'etapa na Semana');

    // --- Hoje: a etapa "Próxima" abre a rampa --------------------------------
    await tapText(tester, 'Hoje');
    await pumpUntil(
      tester,
      find.text(step1),
      reason: 'sem bloco hoje: o mobile só abre a rampa pelo Hoje',
    );
    expect(
      inCardOf(
        find.text(step1),
        find.text('Próxima'),
        exclude: [find.text(step2)],
      ),
      findsOneWidget,
    );
    await tapText(tester, 'Vamos começar?');

    // Check-in de energia (M05): Elétrico → Foco.
    await pumpUntil(tester, find.text('Como está sua energia?'));
    await tapText(tester, 'Elétrico');
    await tapText(tester, '1h', last: true);
    await tapText(tester, 'Montar minha rampa');

    // Escada (M06): o degrau sugerido é o Foco.
    await pumpUntil(
      tester,
      find.text('Sua rampa tá pronta'),
      reason: 'GET /activation/ramp',
    );
    expect(find.text('Degrau 4 de 5 · Foco'), findsOneWidget);
    await tapText(tester, 'Começar daqui');

    // Foco (M10).
    await pumpUntil(tester, find.text('FOCO · DEGRAU 4 DE 5'));
    await tester.pump(const Duration(seconds: 2));
    await tapText(tester, 'Encerrar');

    // Registro (M11): Concluí.
    await pumpUntil(tester, find.text('Quanto você avançou em ‘$step1’?'));
    await tapText(tester, 'Concluí');
    await tapText(tester, 'Registrar');

    // Celebração (M12) e volta ao Hoje.
    await pumpUntil(
      tester,
      find.text('Voltar pra Hoje'),
      reason: 'POST /activation/sessions',
    );
    await tapText(tester, 'Voltar pra Hoje');

    // --- Plano recalculado ---------------------------------------------------
    await pumpUntil(tester, find.text('Concluída'), reason: 'Hoje');
    expect(find.text('Não deu pra carregar o seu dia.'), findsNothing);
    expect(
      inCardOf(
        find.text(step1),
        find.text('Concluída'),
        exclude: [find.text(step2)],
      ),
      findsOneWidget,
    );
    await tapText(tester, 'Objetivos');
    await pumpUntil(tester, find.text(goalTitle));
    expect(inCardOf(find.text(goalTitle), find.text('50%')), findsOneWidget);
    await tapText(tester, goalTitle);
    await pumpUntil(
      tester,
      find.textContaining('1 de 2 etapas concluídas'),
      reason: 'trilha',
    );
    expect(find.text('Não achei esse objetivo.'), findsNothing);
    expect(
      inCardOf(
        find.text(step1),
        find.text('Concluída ·'),
        exclude: [find.text(step2)],
      ),
      findsOneWidget,
    );
    // A etapa 2 continua no plano: é a próxima e tem data e hora na trilha.
    final step2Row = find.text(step2);
    expect(
      inCardOf(step2Row, find.text('Próxima'), exclude: [find.text(step1)]),
      findsOneWidget,
    );
    expect(
      inCardOf(
        step2Row,
        // Meta da linha: "<data> · <hora> ·".
        find.textContaining(RegExp(r'\d.* ·$')),
        exclude: [find.text(step1)],
      ),
      findsOneWidget,
    );
    expect(find.text('Sem data · será encaixada ·'), findsNothing);
  });
}
