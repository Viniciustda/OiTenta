import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/features/goals/data/sample_goal_assistant_repository.dart';

/// Sem provedor de LLM nem endpoint (decisões 4f e 5.8), o assistente do
/// novo objetivo usa a fonte de exemplo nos dois modos.
void main() {
  test('DATA_SOURCE=sample usa o assistente de exemplo', () {
    final d = AppDependencies.forDataSource('sample');
    expect(d.goalAssistant, isA<SampleGoalAssistantRepository>());
  });

  test('DATA_SOURCE=http também usa o de exemplo (ainda não há endpoint)', () {
    final d = AppDependencies.forDataSource('http');
    expect(d.goalAssistant, isA<SampleGoalAssistantRepository>());
  });
}
