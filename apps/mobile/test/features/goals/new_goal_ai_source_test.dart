import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/goals/data/http_goals_repository.dart';
import 'package:oitenta/features/goals/domain/goal_suggestion.dart';
import 'package:oitenta/features/goals/presentation/new_goal_controller.dart';

import '../../helpers/fake_api.dart';

/// Resposta 201 de `POST /goals` (o conteúdo não importa aqui).
const _created = {
  'goal': {
    'id': 'g1',
    'title': 'Trabalho de Algoritmos',
    'deadline': '2026-11-24',
    'colorIndex': 1,
    'progressPct': 0,
  },
  'plan': {'totalMinutes': 0, 'days': 1, 'goals': []},
};

/// Rascunho da IA (`POST /goals/assistant/draft`, docs/4 §3).
const _draft = GoalSuggestion(
  title: 'Trabalho de Algoritmos',
  deadline: '2026-11-24',
  category: 'assignment',
  requirements: ['3 algoritmos de ordenação'],
  missingFields: [],
  engine: 'llm',
  steps: [
    SuggestedStep(
      title: 'Ler o enunciado e listar requisitos',
      estimatedMinutes: 30,
      aiEstimatedMinutes: 30,
      microSteps: ['Abra o enunciado e copie os itens pedidos numa lista'],
    ),
    SuggestedStep(
      title: 'Fazer a primeira versão',
      estimatedMinutes: 120,
      aiEstimatedMinutes: 90,
      microSteps: ['Escreva a função principal', 'Rode com uma entrada'],
    ),
  ],
);

void main() {
  late FakeApi api;
  setUp(() {
    api = FakeApi()..respond(_created, 201);
  });

  NewGoalController controller({GoalSuggestion? suggestion}) =>
      NewGoalController(
        HttpGoalsRepository(api.client),
        suggestion: suggestion,
      );

  test(
    'objetivo da IA: POST /goals com source "ai", aiEstimatedMinutes (original da IA) e microSteps; etapa acrescentada vai com aiEstimatedMinutes null',
    () async {
      final c = controller(suggestion: _draft)
        ..openAdd()
        ..setAddTitle('Pedir ajuda ao monitor')
        ..setAddMinutes(60)
        ..confirmAdd();
      expect(await c.submit(), isNotNull);
      expect(api.last.url.path, '/goals');
      expect(api.lastBody, {
        'title': 'Trabalho de Algoritmos',
        'deadline': '2026-11-24',
        'kind': 'goal',
        'source': 'ai',
        'steps': [
          {
            'title': 'Ler o enunciado e listar requisitos',
            'estimatedMinutes': 30,
            'aiEstimatedMinutes': 30,
            'microSteps': [
              'Abra o enunciado e copie os itens pedidos numa lista',
            ],
          },
          {
            'title': 'Fazer a primeira versão',
            'estimatedMinutes': 120,
            'aiEstimatedMinutes': 90,
            'microSteps': [
              'Escreva a função principal',
              'Rode com uma entrada',
            ],
          },
          {
            'title': 'Pedir ajuda ao monitor',
            'estimatedMinutes': 60,
            'aiEstimatedMinutes': null,
            'microSteps': [],
          },
        ],
      });
    },
  );

  test(
    'etapa da IA sem aiEstimatedMinutes usa a estimativa sugerida como a original',
    () async {
      final c = controller(
        suggestion: const GoalSuggestion(
          title: 'Trabalho de Algoritmos',
          deadline: '2026-11-24',
          steps: [
            SuggestedStep(title: 'Revisar e enviar', estimatedMinutes: 45),
          ],
        ),
      );
      await c.submit();
      final body = api.lastBody as Map;
      expect(body['source'], 'ai');
      expect(body['steps'], [
        {
          'title': 'Revisar e enviar',
          'estimatedMinutes': 45,
          'aiEstimatedMinutes': 45,
          'microSteps': [],
        },
      ]);
    },
  );

  test(
    'rascunho sem prazo (IA2): abre com o prazo vazio e salva sem deadline',
    () async {
      final c = controller(
        suggestion: const GoalSuggestion(
          title: 'Portfólio',
          deadline: null,
          missingFields: ['deadline'],
          steps: [
            SuggestedStep(
              title: 'README',
              estimatedMinutes: 30,
              aiEstimatedMinutes: 30,
            ),
          ],
        ),
      );
      expect(c.deadline, isNull);
      expect(c.canSubmit, isTrue);
      expect(await c.submit(), isNotNull);
      final body = api.lastBody as Map;
      expect(body.containsKey('deadline'), isFalse);
      expect(body['source'], 'ai');
    },
  );

  test(
    'objetivo manual (P20): sem source e sem aiEstimatedMinutes (comportamento atual)',
    () async {
      final c = controller()
        ..setTitle('Lista de Cálculo')
        ..openAdd()
        ..setAddTitle('Resolver a lista')
        ..setAddMinutes(90)
        ..confirmAdd();
      await c.submit();
      expect(api.lastBody, {
        'title': 'Lista de Cálculo',
        'kind': 'goal',
        'steps': [
          {
            'title': 'Resolver a lista',
            'estimatedMinutes': 90,
            'microSteps': [],
          },
        ],
      });
    },
  );
}
