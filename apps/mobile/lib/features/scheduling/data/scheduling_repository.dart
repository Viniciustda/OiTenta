import '../domain/availability.dart';
import '../domain/light_task.dart';
import '../domain/plan.dart';

/// Disponibilidade e plano (contrato §2 e §4).
abstract class SchedulingRepository {
  /// `GET /scheduling/availability`; `null` quando responde 404 (sem onboarding, P12).
  Future<WeeklyAvailability?> getAvailability();

  /// `PUT /scheduling/availability`.
  Future<SetAvailabilityResult> setAvailability(
    WeeklyAvailability availability,
  );

  /// `GET /scheduling/plan/day?date=YYYY-MM-DD`.
  Future<DayPlan> getDayPlan(String date);

  /// `GET /scheduling/plan/week?start=YYYY-MM-DD` (segunda-feira).
  Future<WeekPlan> getWeekPlan(String start);

  /// Tarefas leves do dia. **Só exemplo**: fora do contrato desta fase (UC13).
  Future<List<LightTask>> getLightTasks(String date);
}
