import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/di/app_dependencies.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/widgets/bora_toast.dart';
import '../../../core/widgets/controller_host.dart';
import '../domain/focus_session.dart';
import 'celebration_controller.dart';
import 'celebration_screen.dart';
import 'challenge_controller.dart';
import 'challenge_screen.dart';
import 'focus_controller.dart';
import 'focus_screen.dart';
import 'ladder_controller.dart';
import 'ladder_screen.dart';
import 'log_controller.dart';
import 'log_screen.dart';
import 'micro_controller.dart';
import 'micro_screen.dart';
import 'ramp_widgets.dart';
import 'warmup_controller.dart';
import 'warmup_screen.dart';

void _close(BuildContext context) => context.go(AppRoutes.today);

void _goStep(BuildContext context, int index) => context.go(AppRoutes.rampSteps[index]);

/// Sem rampa montada (ex.: abriu a rota direto), volta para o Hoje.
Widget _guard(AppDependencies deps, Widget Function() build) =>
    deps.rampSession.ramp == null ? const _BackToToday() : build();

class _BackToToday extends StatelessWidget {
  const _BackToToday();

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (context.mounted) context.go(AppRoutes.today);
    });
    return const SizedBox.shrink();
  }
}

class LadderPage extends StatelessWidget {
  const LadderPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => _guard(
        deps,
        () => ControllerHost<LadderController>(
          create: () => LadderController(deps.rampSession),
          builder: (context, c) => LadderScreen(
            state: c,
            onClose: () => _close(context),
            onSelect: c.select,
            onSwap: () => showSwapSheet(context, c),
            onSkip: c.skipToTask,
            onStart: () => _goStep(context, c.index),
          ),
        ),
      );
}

class WarmupPage extends StatelessWidget {
  const WarmupPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => _guard(
        deps,
        () => ControllerHost<WarmupController>(
          create: () => WarmupController(deps.rampSession),
          builder: (context, c) => PeriodicTicker(
            onTick: c.tick,
            child: WarmupScreen(
              state: c,
              onClose: () => _close(context),
              onSwap: () => showSwapSheet(context, c),
              onSkip: () {
                c.skipToTask();
                _goStep(context, 2);
              },
              onDone: () {
                c.complete();
                _goStep(context, deps.rampSession.currentIndex);
              },
            ),
          ),
        ),
      );
}

class ChallengePage extends StatelessWidget {
  const ChallengePage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => _guard(
        deps,
        () => ControllerHost<ChallengeController>(
          create: () => ChallengeController(deps.rampSession),
          builder: (context, c) => ChallengeScreen(
            state: c,
            onClose: () => _close(context),
            onSwap: () => showSwapSheet(context, c),
            onSkip: () {
              c.skipToTask();
              _goStep(context, 2);
            },
            onKey: (k) {
              c.press(k);
              if (!c.waitingNext) return;
              final wait = c.feedback == ChallengeFeedback.correct ? 650 : 1500;
              Future.delayed(Duration(milliseconds: wait), () {
                if (!context.mounted) return;
                c.next();
                if (c.finished) _goStep(context, deps.rampSession.currentIndex);
              });
            },
          ),
        ),
      );
}

class MicroPage extends StatelessWidget {
  const MicroPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => _guard(
        deps,
        () => ControllerHost<MicroController>(
          create: () => MicroController(deps.rampSession),
          builder: (context, c) => MicroScreen(
            state: c,
            onClose: () => _close(context),
            onSwap: () => showSwapSheet(context, c),
            onDone: () {
              c.done();
              _goStep(context, deps.rampSession.currentIndex);
            },
          ),
        ),
      );
}

class FocusPage extends StatelessWidget {
  const FocusPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => _guard(
        deps,
        () => ControllerHost<FocusController>(
          create: () => FocusController(deps.rampSession),
          builder: (context, c) {
            if (c.ended) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (context.mounted) context.go(AppRoutes.log);
              });
            }
            return PeriodicTicker(
              onTick: c.tick,
              child: FocusScreen(state: c, onClose: () => _close(context), onEnd: c.end),
            );
          },
        ),
      );
}

class LogPage extends StatelessWidget {
  const LogPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => _guard(
        deps,
        () => ControllerHost<LogController>(
          create: () => LogController(deps.activation, deps.rampSession, deps.clock),
          builder: (context, c) => LogScreen(
            state: c,
            onClose: () => _close(context),
            onChoose: c.choose,
            onPartial: c.setPartial,
            onSubmit: () async {
              if (!await c.submit() || !context.mounted) return;
              if (c.outcome == SessionOutcome.notDone) {
                showBoraToast(
                  context,
                  icon: PhosphorIconsBold.arrowsClockwise,
                  title: 'Tudo bem, recalculei pra você.',
                  subtitle: 'A etapa volta pro plano.',
                );
                context.go(AppRoutes.today);
              } else {
                context.go(AppRoutes.celebration);
              }
            },
          ),
        ),
      );
}

class CelebrationPage extends StatelessWidget {
  const CelebrationPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => _guard(
        deps,
        () => ControllerHost<CelebrationController>(
          create: () => CelebrationController(deps.gamification, deps.rampSession),
          init: (c) => c.load(),
          builder: (context, c) => CelebrationScreen(
            state: c,
            onClose: () => _close(context),
            onBack: () => _close(context),
          ),
        ),
      );
}
