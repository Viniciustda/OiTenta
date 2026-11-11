import 'package:flutter_test/flutter_test.dart';
import 'package:oitenta/core/di/app_dependencies.dart';
import 'package:oitenta/features/auth/data/sample_auth_repository.dart';
import 'package:oitenta/features/scheduling/data/sample_scheduling_repository.dart';

import '../../helpers/test_app.dart';
import 'package:oitenta/core/clock/clock.dart';
import 'package:oitenta/features/activation/data/sample_activation_repository.dart';
import 'package:oitenta/features/gamification/data/sample_gamification_repository.dart';
import 'package:oitenta/features/goals/data/sample_goals_repository.dart';

void main() {
  testWidgets('Entrar (placeholder): o demo leva ao Hoje', (tester) async {
    await pumpApp(tester);
    expect(find.text('Entrar'), findsOneWidget);
    await tester.tap(find.text('Entrar direto como Arthur (demo)'));
    await tester.pumpAndSettle();
    expect(find.text('Bom dia, Arthur'), findsOneWidget);
  });

  testWidgets('Entrar: demo sem disponibilidade vai para o onboarding', (
    tester,
  ) async {
    final deps = AppDependencies(
      auth: SampleAuthRepository(),
      scheduling: SampleSchedulingRepository(hasAvailability: false),
      goals: SampleGoalsRepository(),
      activation: SampleActivationRepository(),
      gamification: SampleGamificationRepository(),
      clock: FixedClock(DateTime(2025, 11, 6, 9, 41)),
    );
    await pumpApp(tester, deps: deps);
    await tester.tap(find.text('Entrar direto como Arthur (demo)'));
    await tester.pumpAndSettle();
    expect(find.text('1 de 6'), findsOneWidget);
  });

  testWidgets('Cadastro (placeholder) avança para o onboarding', (
    tester,
  ) async {
    await pumpApp(tester);
    await tester.tap(find.text('Criar conta'));
    await tester.pumpAndSettle();
    expect(find.text('Cadastro'), findsOneWidget);
    await tester.tap(find.text('Continuar'));
    await tester.pumpAndSettle();
    expect(find.text('1 de 6'), findsOneWidget);
  });
}
