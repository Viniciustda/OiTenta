import '../../features/activation/data/activation_repository.dart';
import '../../features/activation/data/sample_activation_repository.dart';
import '../../features/activation/presentation/ramp_session.dart';
import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/data/sample_auth_repository.dart';
import '../../features/auth/data/session_store.dart';
import '../../features/gamification/data/gamification_repository.dart';
import '../../features/gamification/data/sample_gamification_repository.dart';
import '../../features/goals/data/goals_repository.dart';
import '../../features/goals/data/sample_goals_repository.dart';
import '../../features/scheduling/data/sample_scheduling_repository.dart';
import '../../features/scheduling/data/scheduling_repository.dart';
import '../clock/clock.dart';
import '../sample/bora_sample_data.dart';

/// Raiz de composição: os repositórios e o estado compartilhado do app.
/// Na Etapa D os repositórios de exemplo são trocados pelos de HTTP aqui.
class AppDependencies {
  AppDependencies({
    required this.auth,
    required this.scheduling,
    required this.goals,
    required this.activation,
    required this.gamification,
    required this.clock,
    SessionStore? session,
    RampSession? rampSession,
  }) : session = session ?? SessionStore(),
       rampSession = rampSession ?? RampSession();

  /// Dados de exemplo do protótipo, com o "hoje" em 6/11/2025.
  factory AppDependencies.sample() => AppDependencies(
    auth: SampleAuthRepository(),
    scheduling: SampleSchedulingRepository(),
    goals: SampleGoalsRepository(),
    activation: SampleActivationRepository(),
    gamification: SampleGamificationRepository(),
    clock: FixedClock(BoraSample.today),
  );

  final AuthRepository auth;
  final SchedulingRepository scheduling;
  final GoalsRepository goals;
  final ActivationRepository activation;
  final GamificationRepository gamification;
  final Clock clock;
  final SessionStore session;
  final RampSession rampSession;
}
