import '../../../core/http/api_client.dart';
import '../domain/focus_session.dart';
import '../domain/ramp.dart';
import 'activation_repository.dart';

/// Rampa e registro no backend real (contrato §5).
class HttpActivationRepository implements ActivationRepository {
  HttpActivationRepository(this._api);

  final ApiClient _api;

  @override
  Future<Ramp> getRamp({
    required String goalId,
    required String stepId,
    required EnergyLevel energy,
    AvailableTime? availableTime,
  }) async => Ramp.fromJson(
    await _api.get(
          '/activation/ramp',
          query: {
            'goalId': goalId,
            'stepId': stepId,
            'energy': energy.api,
            if (availableTime != null) 'availableTime': availableTime.api,
          },
        )
        as Map<String, dynamic>,
  );

  /// `blockId` e `availableTime` são opcionais: nulos não vão no corpo.
  @override
  Future<RecordSessionResult> recordSession(RecordSession session) async =>
      RecordSessionResult.fromJson(
        await _api.post(
              '/activation/sessions',
              body: withoutNulls(session.toJson()),
            )
            as Map<String, dynamic>,
      );
}
