import '../domain/auth_user.dart';

/// `POST /auth/login`, `/auth/register`, `/auth/demo` e `GET /auth/me` (contrato §1).
abstract class AuthRepository {
  Future<AuthSession> loginDemo();

  Future<AuthSession> login({required String email, required String password});

  Future<AuthUser> register({
    required String name,
    required String email,
    required String password,
    String? timezone,
  });

  /// `GET /auth/me`: o usuário do token atual.
  Future<AuthUser> me();
}
