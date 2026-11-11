import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/data/goal_assistant_repository.dart';
import 'package:oitenta/features/goals/domain/goal_suggestion.dart';
import 'package:oitenta/features/goals/presentation/goal_chat_controller.dart';

class _FakeAssistant implements GoalAssistantRepository {
  final requests = <String>[];
  Completer<GoalSuggestion> next = Completer();

  @override
  Future<GoalSuggestion> suggest(String description) {
    requests.add(description);
    return next.future;
  }
}

const _answer = GoalSuggestion(
  title: 'Trabalho de Algoritmos',
  deadline: '2025-11-24',
  steps: [
    SuggestedStep(title: 'Implementar os 3 algoritmos', estimatedMinutes: 180),
    SuggestedStep(title: 'Revisar e enviar', estimatedMinutes: 45),
  ],
);

void main() {
  late _FakeAssistant repo;
  late GoalChatController c;
  setUp(() {
    repo = _FakeAssistant();
    c = GoalChatController(repo);
  });

  test('começa vazio (M13): sem mensagem enviada e sem poder enviar', () {
    expect(c.phase, GoalChatPhase.idle);
    expect(c.sentText, isNull);
    expect(c.text, '');
    expect(c.canSend, isFalse);
  });

  test('só pode enviar com texto (espaços não contam)', () {
    c.setText('   ');
    expect(c.canSend, isFalse);
    c.setText('Trabalho de Algoritmos');
    expect(c.canSend, isTrue);
  });

  test(
    'enviar: mostra a mensagem, limpa o campo, analisa (M14) e devolve título, prazo e etapas',
    () async {
      c.setText('  Trabalho de Algoritmos, entrega 24/11  ');
      final pending = c.send();
      expect(c.phase, GoalChatPhase.analyzing);
      expect(c.sentText, 'Trabalho de Algoritmos, entrega 24/11');
      expect(c.text, '');
      expect(c.canSend, isFalse);
      expect(repo.requests, ['Trabalho de Algoritmos, entrega 24/11']);

      repo.next.complete(_answer);
      final r = await pending;
      expect(r, same(_answer));
      expect(c.suggestion, same(_answer));
      expect(c.phase, GoalChatPhase.answered);
    },
  );

  test('não envia sem texto', () async {
    expect(await c.send(), isNull);
    expect(repo.requests, isEmpty);
    expect(c.phase, GoalChatPhase.idle);
  });

  test('não envia de novo enquanto analisa', () async {
    c.setText('a');
    unawaited(c.send());
    c.setText('b');
    expect(c.canSend, isFalse);
    expect(await c.send(), isNull);
    expect(repo.requests, ['a']);
  });

  test(
    'se a IA falhar, devolve null e marca a falha (4f: abre o formulário manual)',
    () async {
      c.setText('a');
      final pending = c.send();
      repo.next.completeError(Exception('fora do ar'));
      expect(await pending, isNull);
      expect(c.phase, GoalChatPhase.failed);
      expect(c.suggestion, isNull);
    },
  );

  test('avisa a tela a cada mudança', () async {
    var n = 0;
    c.addListener(() => n++);
    c.setText('a');
    final pending = c.send();
    repo.next.complete(_answer);
    await pending;
    expect(n, 3);
  });
}
