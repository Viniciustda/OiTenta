import '../domain/auth_user.dart';

/// Guarda a sessão do usuário logado (token e dados) em memória.
class SessionStore {
  AuthSession? _session;

  AuthSession? get session => _session;

  AuthUser? get user => _session?.user;

  void save(AuthSession session) => _session = session;

  void clear() => _session = null;
}
