import 'package:http/http.dart' as http;

import '../../features/activation/data/activation_repository.dart';
import '../../features/activation/data/http_activation_repository.dart';
import '../../features/activation/data/sample_activation_repository.dart';
import '../../features/activation/presentation/ramp_session.dart';
import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/data/http_auth_repository.dart';
import '../../features/auth/data/sample_auth_repository.dart';
import '../../features/auth/data/session_store.dart';
import '../../features/gamification/data/gamification_repository.dart';
import '../../features/gamification/data/sample_gamification_repository.dart';
import '../../features/goals/data/goal_assistant_repository.dart';
import '../../features/goals/data/goals_repository.dart';
import '../../features/goals/data/http_goals_repository.dart';
import '../../features/goals/data/sample_goal_assistant_repository.dart';
import '../../features/goals/data/sample_goals_repository.dart';
import '../../features/scheduling/data/http_scheduling_repository.dart';
import '../../features/scheduling/data/sample_scheduling_repository.dart';
import '../../features/scheduling/data/scheduling_repository.dart';
import '../clock/clock.dart';
import '../config/app_config.dart';
import '../http/api_client.dart';
import '../sample/bora_sample_data.dart';

/// Raiz de composição: os repositórios e o estado compartilhado do app.
/// `DATA_SOURCE` (`http` | `sample`) escolhe a implementação.
class AppDependencies {
  AppDependencies({
    required this.auth,
    required this.scheduling,
    required this.goals,
    required this.activation,
    required this.gamification,
    required this.clock,
    GoalAssistantRepository? goalAssistant,
    SessionStore? session,
    RampSession? rampSession,
  }) : goalAssistant =
           goalAssistant ?? SampleGoalAssistantRepository(clock: clock),
       session = session ?? SessionStore(),
       rampSession = rampSession ?? RampSession();

  /// Lê `DATA_SOURCE` de `--dart-define-from-file=env/<ambiente>.json`.
  factory AppDependencies.fromConfig() =>
      AppDependencies.forDataSource(AppConfig.dataSource);

  factory AppDependencies.forDataSource(String source) => switch (source) {
    'http' => AppDependencies.http(),
    'sample' => AppDependencies.sample(),
    _ => throw ArgumentError.value(
      source,
      'DATA_SOURCE',
      'use "http" ou "sample"',
    ),
  };

  /// Dados de exemplo do protótipo, com o "hoje" em 6/11/2025.
  factory AppDependencies.sample() => AppDependencies(
    auth: SampleAuthRepository(),
    scheduling: SampleSchedulingRepository(),
    goals: SampleGoalsRepository(),
    activation: SampleActivationRepository(),
    gamification: SampleGamificationRepository(),
    clock: FixedClock(BoraSample.today),
    goalAssistant: SampleGoalAssistantRepository(
      clock: FixedClock(BoraSample.today),
    ),
  );

  /// Backend real em [baseUrl] (padrão `API_URL`). O token fica só em memória
  /// na [SessionStore]; um 401 de rota autenticada expira a sessão.
  /// A gamificação continua fixa (P18) e o assistente do novo objetivo é o
  /// de exemplo (sem endpoint).
  factory AppDependencies.http({String? baseUrl, http.Client? client}) {
    final session = SessionStore();
    final api = ApiClient(
      baseUrl: baseUrl ?? AppConfig.apiUrl,
      client: client ?? http.Client(),
      token: () => session.token,
      onUnauthorized: session.expire,
    );
    return AppDependencies(
      auth: HttpAuthRepository(api),
      scheduling: HttpSchedulingRepository(api),
      goals: HttpGoalsRepository(api),
      activation: HttpActivationRepository(api),
      gamification: SampleGamificationRepository(),
      clock: const SystemClock(),
      // EXAMPLE: ainda não há endpoint do assistente (provedor de LLM
      // pendente, decisões 4f e 5.8); o modo http também usa a fonte de
      // exemplo. Trocar por `HttpGoalAssistantRepository(api)` quando existir.
      goalAssistant: SampleGoalAssistantRepository(clock: const SystemClock()),
      session: session,
    );
  }

  final AuthRepository auth;
  final SchedulingRepository scheduling;
  final GoalsRepository goals;
  final ActivationRepository activation;
  final GamificationRepository gamification;
  final Clock clock;

  /// Assistente do novo objetivo (chat). Sem provedor de LLM nem endpoint no
  /// contrato, os dois modos (`sample` e `http`) usam a fonte de EXEMPLO
  /// [SampleGoalAssistantRepository]. Quando o backend tiver o endpoint, o
  /// modo `http` passa a montar a implementação HTTP aqui.
  final GoalAssistantRepository goalAssistant;
  final SessionStore session;
  final RampSession rampSession;
}
