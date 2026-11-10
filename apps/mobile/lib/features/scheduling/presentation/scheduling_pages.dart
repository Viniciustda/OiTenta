import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/app_dependencies.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/bora_colors.dart';
import '../../../core/widgets/controller_host.dart';
import '../../activation/presentation/checkin_controller.dart';
import '../../activation/presentation/checkin_sheet.dart';
import '../../activation/presentation/ramp_session.dart';
import 'onboarding_controller.dart';
import 'onboarding_screen.dart';
import 'today_controller.dart';
import 'today_screen.dart';
import 'week_controller.dart';
import 'week_screen.dart';

class OnboardingPage extends StatelessWidget {
  const OnboardingPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => ControllerHost<OnboardingController>(
        create: () => OnboardingController(deps.scheduling, deps.session),
        builder: (context, c) => OnboardingScreen(
          state: c,
          onBack: () => c.step == 1 ? context.go(AppRoutes.login) : c.back(),
          onNext: c.next,
          onStuck: c.chooseStuck,
          onTogglePeriod: c.togglePeriod,
          onLimit: c.setLimit,
          onSave: c.save,
          onFinish: () => context.go(AppRoutes.today),
        ),
      );
}

class TodayPage extends StatelessWidget {
  const TodayPage({super.key, required this.deps});

  final AppDependencies deps;

  Future<void> _openCheckin(BuildContext context, TodayController today) async {
    final b = today.nextBlock;
    if (b == null) return;
    final target = RampTarget(
      goalId: b.goalId,
      stepId: b.stepId,
      blockId: b.id,
      goalTitle: b.goalTitle,
      stepTitle: b.stepTitle,
      colorIndex: b.colorIndex,
    );
    final c = context.bora;
    final built = await showModalBottomSheet<bool>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      backgroundColor: c.surface.withValues(alpha: 0),
      barrierColor: c.scrim,
      builder: (sheetContext) => ControllerHost<CheckinController>(
        create: () => CheckinController(deps.activation, deps.rampSession, deps.clock, target),
        builder: (_, ci) => CheckinSheet(
          state: ci,
          onEnergy: ci.chooseEnergy,
          onTime: ci.chooseTime,
          onLightTasks: null,
          onBuild: () async {
            if (await ci.build() && sheetContext.mounted) Navigator.of(sheetContext).pop(true);
          },
        ),
      ),
    );
    if (built == true && context.mounted) context.go(AppRoutes.ramp);
  }

  @override
  Widget build(BuildContext context) => ControllerHost<TodayController>(
        create: () => TodayController(deps.scheduling, deps.goals, deps.gamification, deps.session, deps.clock),
        init: (c) => c.load(),
        builder: (context, c) => TodayScreen(
          state: c,
          onStart: () => _openCheckin(context, c),
          onToggleLight: c.toggleLightTask,
          onProfile: null,
        ),
      );
}

class WeekPage extends StatelessWidget {
  const WeekPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => ControllerHost<WeekController>(
        create: () => WeekController(deps.scheduling, deps.clock),
        init: (c) => c.load(),
        builder: (context, c) => WeekScreen(state: c, onSelectDay: c.selectDay),
      );
}
