import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:oitenta/core/errors/app_errors.dart';
import 'package:oitenta/core/http/api_client.dart';
import 'package:oitenta/features/goals/data/goal_assistant_repository.dart';
import 'package:oitenta/features/goals/data/http_goal_assistant_repository.dart';
import 'package:oitenta/features/goals/presentation/goal_chat_controller.dart';

import '../../helpers/fake_api.dart';

/// Resposta 200 de `POST /goals/assistant/draft` (docs/4 §3, IA1).
const _draft200 = {
  'draft': {
    'title': 'Trabalho de Algoritmos',
    'deadline': '2026-11-24',
    'category': 'assignment',
    'requirements': ['3 algoritmos de ordenação', 'comparação'],
    'missingFields': [],
    'steps': [
      {
        'title': 'Ler o enunciado e listar requisitos',
        'estimatedMinutes': 30,
        'aiEstimatedMinutes': 30,
        'microSteps': ['Abra o enunciado e copie os itens pedidos numa lista'],
      },
      {
        'title': 'Fazer a primeira versão de Trabalho de Algoritmos',
        'estimatedMinutes': 120,
        'aiEstimatedMinutes': 120,
        'microSteps': [],
      },
    ],
    'totalMinutes': 150,
  },
  'engine': 'rules',
};

const _text =
    'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11';

void main() {
  late FakeApi api;
  late HttpGoalAssistantRepository repo;

  setUp(() {
    api = FakeApi();
    repo = HttpGoalAssistantRepository(api.client);
  });

  test('é uma implementação de GoalAssistantRepository', () {
    expect(repo, isA<GoalAssistantRepository>());
  });

  test(
    '200: POST /goals/assistant/draft com { text } e Bearer → GoalSuggestion com os campos do contrato',
    () async {
      api.respond(_draft200);
      final s = await repo.suggest(_text);

      expect(api.last.method, 'POST');
      expect(api.last.url.path, '/goals/assistant/draft');
      expect(api.last.headers['Authorization'], 'Bearer tok-123');
      expect(api.lastBody, {'text': _text});

      expect(s.title, 'Trabalho de Algoritmos');
      expect(s.deadline, '2026-11-24');
      expect(s.category, 'assignment');
      expect(s.requirements, ['3 algoritmos de ordenação', 'comparação']);
      expect(s.missingFields, isEmpty);
      expect(s.engine, 'rules');
      expect(s.steps.map((e) => e.title), [
        'Ler o enunciado e listar requisitos',
        'Fazer a primeira versão de Trabalho de Algoritmos',
      ]);
      expect(s.steps.map((e) => e.estimatedMinutes), [30, 120]);
      expect(s.steps.map((e) => e.aiEstimatedMinutes), [30, 120]);
      expect(s.steps.first.microSteps, [
        'Abra o enunciado e copie os itens pedidos numa lista',
      ]);
      expect(s.steps.last.microSteps, isEmpty);
    },
  );

  test(
    '200 sem prazo: deadline null e missingFields [deadline] (IA2, informativo)',
    () async {
      api.respond({
        'draft': {
          ...(_draft200['draft']! as Map<String, Object?>),
          'deadline': null,
          'missingFields': ['deadline'],
        },
        'engine': 'llm',
      });
      final s = await repo.suggest('Portfólio no GitHub');
      expect(s.deadline, isNull);
      expect(s.missingFields, ['deadline']);
      expect(s.engine, 'llm');
      expect(s.steps, hasLength(2));
    },
  );

  test('503 (IA indisponível) → exceção', () async {
    api.fail(503, 'Assistente indisponível.');
    await expectLater(
      repo.suggest(_text),
      throwsA(isA<ApiFailure>().having((e) => e.statusCode, 'status', 503)),
    );
  });

  test('outro status de erro (422) → exceção', () async {
    api.fail(422, 'Texto vazio.');
    await expectLater(repo.suggest('   '), throwsA(isA<ValidationFailure>()));
  });

  test('erro de rede → NetworkFailure', () async {
    final offline = HttpGoalAssistantRepository(
      ApiClient(
        baseUrl: 'http://api.test',
        client: MockClient((_) async => throw http.ClientException('sem rede')),
        token: () => 'tok-123',
      ),
    );
    await expectLater(offline.suggest(_text), throwsA(isA<NetworkFailure>()));
  });

  test('resposta 200 fora do formato (sem draft) → exceção', () async {
    api.respond({'engine': 'rules'});
    await expectLater(repo.suggest(_text), throwsA(anything));
  });

  test('o tempo limite desta rota é 25 s (docs/7 §c.5)', () {
    expect(HttpGoalAssistantRepository.timeout, const Duration(seconds: 25));
  });

  /// Repositório cujo backend responde depois de [delay].
  HttpGoalAssistantRepository slowRepo(Duration delay) =>
      HttpGoalAssistantRepository(
        ApiClient(
          baseUrl: 'http://api.test',
          client: MockClient((_) async {
            await Future<void>.delayed(delay);
            return FakeApi.json(_draft200, 200);
          }),
          token: () => 'tok-123',
        ),
      );

  // `testWidgets` roda em tempo simulado: `pump` avança o relógio sem esperar.
  testWidgets(
    'resposta em 20 s ainda chega (passa dos 15 s padrão do ApiClient)',
    (tester) async {
      final result = slowRepo(const Duration(seconds: 20)).suggest(_text);
      await tester.pump(const Duration(seconds: 21));
      expect((await result).title, 'Trabalho de Algoritmos');
    },
  );

  testWidgets('sem resposta em 25 s → NetworkFailure (timeout)', (
    tester,
  ) async {
    final check = expectLater(
      slowRepo(const Duration(seconds: 26)).suggest(_text),
      throwsA(isA<NetworkFailure>()),
    );
    await tester.pump(const Duration(seconds: 27));
    await check;
  });

  test(
    'com a falha do repositório HTTP, o chat vai para a fase failed (4f: M15 vazia)',
    () async {
      api.fail(503, 'Assistente indisponível.');
      final c = GoalChatController(repo)..setText(_text);
      expect(await c.send(), isNull);
      expect(c.phase, GoalChatPhase.failed);
      expect(c.suggestion, isNull);
    },
  );
}
