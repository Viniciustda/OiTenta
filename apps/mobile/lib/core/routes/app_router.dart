import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/activation/presentation/activation_pages.dart';
import '../../features/auth/presentation/auth_pages.dart';
import '../../features/gamification/presentation/garden_screen.dart';
import '../../features/goals/presentation/goals_pages.dart';
import '../../features/scheduling/presentation/scheduling_pages.dart';
import '../di/app_dependencies.dart';
import '../widgets/app_shell.dart';
import 'app_routes.dart';

/// Aba ativa pelo caminho (rampa conta como Hoje, como no protótipo).
AppTab tabFor(String location) {
  if (location.startsWith(AppRoutes.goals)) return AppTab.goals;
  if (location.startsWith(AppRoutes.week)) return AppTab.week;
  if (location.startsWith(AppRoutes.garden)) return AppTab.garden;
  return AppTab.today;
}

const _tabRoutes = {
  AppTab.today: AppRoutes.today,
  AppTab.goals: AppRoutes.goals,
  AppTab.week: AppRoutes.week,
  AppTab.garden: AppRoutes.garden,
};

/// Rotas do app, todas aqui (regra 4 de `mobile-flutter.md`).
GoRouter createRouter(AppDependencies deps, {String initialLocation = AppRoutes.login}) {
  NoTransitionPage<void> page(GoRouterState s, Widget child) => NoTransitionPage(key: s.pageKey, child: child);

  return GoRouter(
    initialLocation: initialLocation,
    routes: [
      GoRoute(path: AppRoutes.login, builder: (_, _) => LoginPage(deps: deps)),
      GoRoute(path: AppRoutes.register, builder: (_, _) => const RegisterPage()),
      GoRoute(path: AppRoutes.onboarding, builder: (_, _) => OnboardingPage(deps: deps)),
      ShellRoute(
        builder: (context, state, child) => AppShell(
          current: tabFor(state.uri.path),
          onTab: (t) => context.go(_tabRoutes[t]!),
          child: child,
        ),
        routes: [
          GoRoute(path: AppRoutes.today, pageBuilder: (_, s) => page(s, TodayPage(deps: deps))),
          GoRoute(path: AppRoutes.goals, pageBuilder: (_, s) => page(s, GoalsPage(deps: deps))),
          GoRoute(path: AppRoutes.newGoal, builder: (_, _) => NewGoalPage(deps: deps)),
          GoRoute(path: AppRoutes.manualTask, builder: (_, _) => ManualTaskPage(deps: deps)),
          GoRoute(
            path: '${AppRoutes.trail}/:goalId',
            builder: (_, s) => TrailPage(deps: deps, goalId: s.pathParameters['goalId']!),
          ),
          GoRoute(path: AppRoutes.week, pageBuilder: (_, s) => page(s, WeekPage(deps: deps))),
          GoRoute(path: AppRoutes.garden, pageBuilder: (_, s) => page(s, const GardenScreen())),
          GoRoute(path: AppRoutes.ramp, pageBuilder: (_, s) => page(s, LadderPage(deps: deps))),
          GoRoute(path: AppRoutes.warmup, pageBuilder: (_, s) => page(s, WarmupPage(deps: deps))),
          GoRoute(path: AppRoutes.challenge, pageBuilder: (_, s) => page(s, ChallengePage(deps: deps))),
          GoRoute(path: AppRoutes.micro, pageBuilder: (_, s) => page(s, MicroPage(deps: deps))),
          GoRoute(path: AppRoutes.focus, pageBuilder: (_, s) => page(s, FocusPage(deps: deps))),
          GoRoute(path: AppRoutes.log, pageBuilder: (_, s) => page(s, LogPage(deps: deps))),
          GoRoute(path: AppRoutes.celebration, pageBuilder: (_, s) => page(s, CelebrationPage(deps: deps))),
        ],
      ),
    ],
  );
}
