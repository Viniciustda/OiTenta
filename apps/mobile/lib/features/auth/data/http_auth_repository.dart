import '../../../core/http/api_client.dart';
import '../domain/auth_user.dart';
import 'auth_repository.dart';

/// Auth no backend real (contrato §1).
class HttpAuthRepository implements AuthRepository {
  HttpAuthRepository(this._api);

  final ApiClient _api;

  @override
  Future<AuthSession> loginDemo() async => AuthSession.fromJson(
    await _api.post('/auth/demo', auth: false) as Map<String, dynamic>,
  );

  @override
  Future<AuthSession> login({
    required String email,
    required String password,
  }) async => AuthSession.fromJson(
    await _api.post(
          '/auth/login',
          body: {'email': email, 'password': password},
          auth: false,
        )
        as Map<String, dynamic>,
  );

  @override
  Future<AuthUser> register({
    required String name,
    required String email,
    required String password,
    String? timezone,
  }) async {
    final json =
        await _api.post(
              '/auth/register',
              body: withoutNulls({
                'name': name,
                'email': email,
                'password': password,
                'timezone': timezone,
              }),
              auth: false,
            )
            as Map<String, dynamic>;
    return AuthUser.fromJson(json['user'] as Map<String, dynamic>);
  }

  @override
  Future<AuthUser> me() async {
    final json = await _api.get('/auth/me') as Map<String, dynamic>;
    return AuthUser.fromJson(json['user'] as Map<String, dynamic>);
  }
}
