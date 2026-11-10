import 'package:flutter/foundation.dart';

import '../../scheduling/data/scheduling_repository.dart';
import '../data/auth_repository.dart';
import '../data/session_store.dart';

/// Para onde ir depois do login (P12).
enum AfterLogin { today, onboarding }

/// Entrar (placeholder, P27): botão de demo.
class LoginController extends ChangeNotifier {
  LoginController(this._auth, this._scheduling, this._session);

  final AuthRepository _auth;
  final SchedulingRepository _scheduling;
  final SessionStore _session;

  bool busy = false;
  String? error;

  /// `POST /auth/demo` e, se o usuário ainda não tem disponibilidade, onboarding.
  Future<AfterLogin?> enterDemo() async {
    busy = true;
    error = null;
    notifyListeners();
    try {
      _session.save(await _auth.loginDemo());
      final availability = await _scheduling.getAvailability();
      return availability == null ? AfterLogin.onboarding : AfterLogin.today;
    } catch (_) {
      error = 'Não deu pra entrar agora. Tenta de novo?';
      return null;
    } finally {
      busy = false;
      notifyListeners();
    }
  }
}
