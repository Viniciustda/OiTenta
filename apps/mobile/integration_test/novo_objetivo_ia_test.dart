// Tarefa 11 (mobile): novo objetivo pelo assistente (IA1, IA4) de ponta a
// ponta, no simulador iOS, contra o backend local real
// (`env/local-simulator.json`, DATA_SOURCE=http).
//
// Antes de cada execução: `npm --workspace apps/backend run db:reset-demo` e o
// backend no ar com o motor de regras (IA6), determinístico e sem rede:
// `cd apps/backend && AI_PROVIDER=rules AI_FALLBACK=rules node dist/main`.
//
// A entrega do texto é hoje + 14 dias no fuso do demo (America/Sao_Paulo),
// para o plano sempre caber; o parser lê "dd/mm" como a próxima ocorrência a
// partir de hoje, que com +14 dias é sempre a própria data.
//
// login demo → onboarding → Objetivos → Novo objetivo → chat → texto →
// M15 preenchida → "Distribuir no calendário" → toast e Semana → trilha com as
// 5 etapas encaixadas → o objetivo gravado com source 'ai' (GET /goals/:id).
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:oitenta/app.dart';
import 'package:oitenta/core/config/app_config.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/core/format/bora_format.dart';
import 'package:oitenta/features/goals/presentation/deadline_field.dart';
import 'package:oitenta/features/goals/presentation/new_goal_screen.dart';

String referenceText(DateTime deadline) =>
    'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de '
    'ordenação, entrega ${BoraFormat.dayMonth(deadline)}';
const goalTitle = 'Trabalho de Algoritmos';

/// Modelo "assignment" do motor de regras
/// (apps/backend/src/modules/goals/assistant/step-templates.ts).
const steps = <(String, String, int)>[
  ('Ler o enunciado e listar requisitos', '30 min', 30),
  ('Pesquisar e separar o material', '1h', 60),
  ('Fazer a primeira versão de $goalTitle', '2h', 120),
  ('Revisar e completar', '1h', 60),
  ('Formatar e enviar', '30 min', 30),
];

/// Hoje no fuso do demo (America/Sao_Paulo, UTC−3 fixo, sem horário de
/// verão), independente do fuso do simulador.
DateTime todayInSaoPaulo() {
  final sp = DateTime.now().toUtc().subtract(const Duration(hours: 3));
  return DateTime(sp.year, sp.month, sp.day);
}

/// GET autenticado no backend como o demo; devolve o JSON da resposta 200.
Future<Map<String, dynamic>> getAsDemo(String path) async {
  final login = await http.post(Uri.parse('${AppConfig.apiUrl}/auth/demo'));
  expect(login.statusCode, 200, reason: 'POST /auth/demo');
  final token = (jsonDecode(login.body) as Map<String, dynamic>)['token'];
  final res = await http.get(
    Uri.parse('${AppConfig.apiUrl}$path'),
    headers: {'Authorization': 'Bearer $token'},
  );
  expect(res.statusCode, 200, reason: 'GET $path');
  return jsonDecode(res.body) as Map<String, dynamic>;
}

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
Future<void> tapText(WidgetTester tester, String text) async {
  final f = find.text(text).first;
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

/// Os títulos das outras etapas (para [inCardOf] não pegar a linha errada).
List<Finder> otherSteps(String title) => [
  for (final (t, _, _) in steps)
    if (t != title) find.text(t),
];

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('novo objetivo com IA (motor de regras): chat → M15 preenchida '
      '→ Distribuir no calendário → Semana e trilha', (tester) async {
    final deps = AppDependencies.fromConfig();
    final today = todayInSaoPaulo();
    final deadline = DateTime(today.year, today.month, today.day + 14);

    await tester.pumpWidget(BoraApp(deps: deps));
    await tester.pump();

    // --- Login demo ---------------------------------------------------------
    await tapText(tester, 'Entrar direto como Arthur (demo)');

    // --- Onboarding (o demo zerado pelo db:reset-demo não tem horários) -----
    await pumpUntil(tester, find.text('1 de 6'), reason: 'onboarding');
    await tapText(tester, 'Continuar');
    await pumpUntil(tester, find.text('2 de 6'));
    await tapText(tester, 'Começar');
    await pumpUntil(tester, find.text('3 de 6'));
    await tapText(tester, 'Continuar');
    await pumpUntil(tester, find.text('4 de 6'));
    for (final d in ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']) {
      for (final p in ['Manhã', 'Tarde', 'Noite']) {
        await tapLabel(tester, '$d $p');
      }
    }
    await tapText(tester, 'Continuar');
    await pumpUntil(tester, find.text('5 de 6'));
    await tapText(tester, 'Continuar');
    await pumpUntil(
      tester,
      find.text('6 de 6'),
      reason: 'PUT /scheduling/availability',
    );
    await tapText(tester, 'Ir para o Hoje');

    // --- Objetivos → Novo objetivo → chat (M13) -----------------------------
    await pumpUntil(tester, find.text('Objetivos'));
    await tapText(tester, 'Objetivos');
    await tapLabel(tester, 'Novo objetivo');
    await pumpUntil(
      tester,
      find.textContaining('Me conta o que você precisa fazer'),
      reason: 'chat M13',
    );
    // Espera a transição Objetivos → chat terminar antes de digitar.
    await tester.pump(const Duration(seconds: 1));
    await tester.enterText(
      find.byType(EditableText).first,
      referenceText(deadline),
    );
    await tester.pump();
    await tapLabel(tester, 'Enviar');

    // --- M15 preenchida pela resposta do motor de regras ---------------------
    final m15 = find.byType(NewGoalScreen);
    await pumpUntil(
      tester,
      find.descendant(of: m15, matching: find.text('ETAPAS SUGERIDAS')),
      reason: 'POST /goals/assistant/draft',
    );
    // A transição chat → M15 no iOS passa dos 300 ms do tapText: espera ela
    // terminar antes de procurar os campos.
    await tester.pump(const Duration(seconds: 1));
    expect(find.byType(NewGoalScreen), findsOneWidget);
    expect(
      find.descendant(of: m15, matching: find.text(goalTitle)),
      findsOneWidget,
    );
    expect(
      find.descendant(
        of: find.byType(DeadlineField),
        matching: find.text(BoraFormat.fullDate(deadline)),
      ),
      findsOneWidget,
    );
    expect(
      find.descendant(of: m15, matching: find.text('5h no total')),
      findsOneWidget,
    );
    for (final (title, duration, _) in steps) {
      expect(
        inCardOf(
          find.descendant(of: m15, matching: find.text(title)),
          find.text(duration),
          exclude: otherSteps(title),
        ),
        findsOneWidget,
        reason: 'etapa "$title" com $duration',
      );
    }

    await tapText(tester, 'Distribuir no calendário');

    // --- Toast e Semana -----------------------------------------------------
    await pumpUntil(
      tester,
      find.text('${steps.length} etapas no calendário'),
      reason: 'POST /goals',
    );
    expect(
      find.text('$goalTitle até ${BoraFormat.dayMonth(deadline)}'),
      findsOneWidget,
    );
    await pumpUntil(tester, find.text('Execução'), reason: 'Semana');

    // --- Objetivos e trilha: as 5 etapas encaixadas -------------------------
    await tapText(tester, 'Objetivos');
    await pumpUntil(tester, find.text(goalTitle), reason: 'GET /goals');
    expect(inCardOf(find.text(goalTitle), find.text('0%')), findsOneWidget);
    await tapText(tester, goalTitle);
    await pumpUntil(
      tester,
      find.textContaining('0 de ${steps.length} etapas concluídas'),
      reason: 'trilha',
    );
    for (final (title, duration, _) in steps) {
      final row = find.text(title);
      expect(row, findsOneWidget, reason: 'etapa "$title" na trilha');
      // Meta da linha: "<data> · <hora> ·" (etapa com horário no plano).
      expect(
        inCardOf(
          row,
          find.textContaining(RegExp(r'\d.* ·$')),
          exclude: otherSteps(title),
        ),
        findsOneWidget,
        reason: 'etapa "$title" com data e hora',
      );
      expect(
        inCardOf(row, find.text(duration), exclude: otherSteps(title)),
        findsOneWidget,
        reason: 'etapa "$title" com $duration',
      );
    }
    expect(find.textContaining('Sem data'), findsNothing);

    // --- Gravado como objetivo da IA (IA1) ----------------------------------
    final list = await getAsDemo('/goals');
    final ids = [
      for (final g in (list['goals'] as List).cast<Map<String, dynamic>>())
        if (g['title'] == goalTitle) g['id'] as String,
    ];
    expect(ids, hasLength(1), reason: 'um objetivo "$goalTitle"');
    final detail = await getAsDemo('/goals/${ids.single}');
    final saved = (detail['steps'] as List).cast<Map<String, dynamic>>()
      ..sort((a, b) => (a['order'] as int).compareTo(b['order'] as int));
    expect(
      {
        'source': (detail['goal'] as Map<String, dynamic>)['source'],
        'deadline': (detail['goal'] as Map<String, dynamic>)['deadline'],
        'steps': [
          for (final s in saved)
            [s['title'], s['estimatedMinutes'], s['aiEstimatedMinutes']],
        ],
      },
      {
        'source': 'ai',
        'deadline': BoraFormat.dateKey(deadline),
        'steps': [
          for (final (title, _, minutes) in steps) [title, minutes, minutes],
        ],
      },
    );
  });
}
