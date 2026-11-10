/// Caminhos das rotas do app (go_router). As telas navegam só por estes nomes.
class AppRoutes {
  const AppRoutes._();

  static const login = '/entrar';
  static const register = '/cadastro';
  static const onboarding = '/onboarding';
  static const today = '/hoje';
  static const goals = '/objetivos';
  static const newGoal = '/objetivos/novo';
  static const manualTask = '/objetivos/manual';
  static const trail = '/objetivos/trilha';
  static const week = '/semana';
  static const garden = '/jardim';
  static const ramp = '/rampa';
  static const warmup = '/rampa/aquecer';
  static const challenge = '/rampa/desafio';
  static const micro = '/rampa/micro';
  static const focus = '/rampa/foco';
  static const log = '/rampa/registro';
  static const celebration = '/rampa/celebracao';

  /// Trilha de um objetivo: `/objetivos/trilha/<goalId>`.
  static String trailOf(String goalId) => '$trail/$goalId';

  /// Tela de cada degrau da rampa, na ordem (aquecer, desafio, micro, foco, registrar).
  static const rampSteps = [warmup, challenge, micro, focus, log];
}
