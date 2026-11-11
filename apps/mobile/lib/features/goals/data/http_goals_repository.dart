import '../../../core/http/api_client.dart';
import '../domain/goal.dart';
import 'goals_repository.dart';

/// Objetivos no backend real (contrato §3).
class HttpGoalsRepository implements GoalsRepository {
  HttpGoalsRepository(this._api);

  final ApiClient _api;

  @override
  Future<List<GoalSummary>> listGoals() async {
    final json = await _api.get('/goals') as Map<String, dynamic>;
    return (json['goals'] as List)
        .map((g) => GoalSummary.fromJson(g as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<GoalDetail> getGoal(String goalId) async => GoalDetail.fromJson(
    await _api.get('/goals/${Uri.encodeComponent(goalId)}')
        as Map<String, dynamic>,
  );

  @override
  Future<CreateGoalResult> createGoal(NewGoal goal) async =>
      CreateGoalResult.fromJson(
        await _api.post('/goals', body: withoutNulls(goal.toJson()))
            as Map<String, dynamic>,
      );
}
