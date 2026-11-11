import '../../../core/errors/app_errors.dart';
import '../../../core/http/api_client.dart';
import '../domain/availability.dart';
import '../domain/light_task.dart';
import '../domain/plan.dart';
import 'scheduling_repository.dart';

/// Disponibilidade e plano no backend real (contrato §2 e §4).
class HttpSchedulingRepository implements SchedulingRepository {
  HttpSchedulingRepository(this._api);

  final ApiClient _api;

  @override
  Future<WeeklyAvailability?> getAvailability() async {
    try {
      final json =
          await _api.get('/scheduling/availability') as Map<String, dynamic>;
      return WeeklyAvailability.fromJson(
        json['availability'] as Map<String, dynamic>,
      );
    } on NotFoundFailure {
      return null;
    }
  }

  @override
  Future<SetAvailabilityResult> setAvailability(
    WeeklyAvailability availability,
  ) async => SetAvailabilityResult.fromJson(
    await _api.put('/scheduling/availability', body: availability.toJson())
        as Map<String, dynamic>,
  );

  @override
  Future<DayPlan> getDayPlan(String date) async => DayPlan.fromJson(
    await _api.get('/scheduling/plan/day', query: {'date': date})
        as Map<String, dynamic>,
  );

  @override
  Future<WeekPlan> getWeekPlan(String start) async => WeekPlan.fromJson(
    await _api.get('/scheduling/plan/week', query: {'start': start})
        as Map<String, dynamic>,
  );

  /// Tarefas leves (UC13) estão fora do contrato desta fase: o modo real não
  /// mostra dados de exemplo, então a lista vem vazia.
  @override
  Future<List<LightTask>> getLightTasks(String date) async => const [];
}
