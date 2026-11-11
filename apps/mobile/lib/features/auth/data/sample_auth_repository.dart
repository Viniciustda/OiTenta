import '../../../core/sample/bora_sample_data.dart';
import '../domain/auth_user.dart';
import 'auth_repository.dart';

/// Repositório de exemplo (Etapa B): responde como o backend, sem rede.
class SampleAuthRepository implements AuthRepository {
  static const _defaultTimezone = 'America/Sao_Paulo';

  @override
  Future<AuthSession> loginDemo() async => AuthSession.fromJson({
    'token': 'sample-token-demo',
    'user': BoraSample.demoUser,
  });

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
  }) async => AuthSession.fromJson({
    'token': 'sample-token',
    'user': {...BoraSample.demoUser, 'email': email},
  });

  @override
  Future<AuthUser> register({
    required String name,
    required String email,
    required String password,
    String? timezone,
  }) async => AuthUser.fromJson({
    'id': 'user-new',
    'name': name,
    'email': email,
    'timezone': timezone ?? _defaultTimezone,
  });

  @override
  Future<AuthUser> me() async => AuthUser.fromJson(BoraSample.demoUser);
}
