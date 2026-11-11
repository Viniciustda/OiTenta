import 'package:flutter/foundation.dart';

import '../domain/auth_user.dart';

/// Guarda a sessão do usuário logado (token e dados) **só em memória**:
/// não há pacote de armazenamento persistente aprovado (pendência da D2).
///
/// [expire] é chamado pelo cliente HTTP no 401 de rota autenticada; o router
/// escuta este objeto e leva para o login.
class SessionStore extends ChangeNotifier {
  AuthSession? _session;
  bool _expired = false;

  AuthSession? get session => _session;

  AuthUser? get user => _session?.user;

  String? get token => _session?.token;

  /// A sessão caiu por 401 e o app ainda não voltou ao login.
  bool get expired => _expired;

  void save(AuthSession session) {
    _session = session;
    _expired = false;
  }

  void clear() => _session = null;

  /// Limpa a sessão porque o backend recusou o token (401).
  void expire() {
    _session = null;
    _expired = true;
    notifyListeners();
  }

  /// Devolve `true` uma única vez depois de [expire] (usado pelo redirect).
  bool consumeExpired() {
    final was = _expired;
    _expired = false;
    return was;
  }
}
