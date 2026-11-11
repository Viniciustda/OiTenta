import '../domain/focus_session.dart';
import '../domain/ramp.dart';

/// Rampa e registro (contrato §5).
abstract class ActivationRepository {
  /// `GET /activation/ramp?goalId&stepId&energy&availableTime`.
  Future<Ramp> getRamp({
    required String goalId,
    required String stepId,
    required EnergyLevel energy,
    AvailableTime? availableTime,
  });

  /// `POST /activation/sessions`.
  Future<RecordSessionResult> recordSession(RecordSession session);
}
