import '../domain/auth_user.dart';

/// `POST /auth/login`, `/auth/register` e `/auth/demo` (contrato §1).
abstract class AuthRepository {
  Future<AuthSession> loginDemo();

  Future<AuthSession> login({required String email, required String password});

  Future<AuthUser> register({required String name, required String email, required String password, String? timezone});
}
