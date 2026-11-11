import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/features/auth/data/sample_auth_repository.dart';
import 'package:oitenta/features/auth/data/session_store.dart';
import 'package:oitenta/features/auth/presentation/login_controller.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';

void main() {
  test('demo com disponibilidade salva a sessão e vai para o Hoje', () async {
    final session = SessionStore();
    final c = LoginController(
      SampleAuthRepository(),
      SampleSchedulingRepository(),
      session,
    );
    final next = await c.enterDemo();
    expect(next, AfterLogin.today);
    expect(session.user!.name, 'Arthur');
    expect(c.busy, isFalse);
  });

  test('demo sem disponibilidade vai para o onboarding (P12)', () async {
    final c = LoginController(
      SampleAuthRepository(),
      SampleSchedulingRepository(hasAvailability: false),
      SessionStore(),
    );
    expect(await c.enterDemo(), AfterLogin.onboarding);
  });
}
