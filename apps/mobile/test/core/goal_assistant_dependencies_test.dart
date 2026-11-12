import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/features/goals/data/http_goal_assistant_repository.dart';
import 'package:oitenta/features/goals/data/sample_goal_assistant_repository.dart';

/// O assistente do novo objetivo usa a fonte de exemplo no modo `sample` e
/// `POST /goals/assistant/draft` no modo `http` (IA1).
void main() {
  test('DATA_SOURCE=sample usa o assistente de exemplo', () {
    final d = AppDependencies.forDataSource('sample');
    expect(d.goalAssistant, isA<SampleGoalAssistantRepository>());
  });

  test('DATA_SOURCE=http usa o assistente HTTP (IA1)', () {
    final d = AppDependencies.forDataSource('http');
    expect(d.goalAssistant, isA<HttpGoalAssistantRepository>());
  });
}
