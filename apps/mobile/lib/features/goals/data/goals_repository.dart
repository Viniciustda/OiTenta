import '../domain/goal.dart';

/// Objetivos (contrato §3).
abstract class GoalsRepository {
  /// `GET /goals`.
  Future<List<GoalSummary>> listGoals();

  /// `GET /goals/:goalId`.
  Future<GoalDetail> getGoal(String goalId);

  /// `POST /goals`.
  Future<CreateGoalResult> createGoal(NewGoal goal);
}
