import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/di/app_dependencies.dart';
import '../../../core/format/bora_format.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/widgets/bora_toast.dart';
import '../../../core/widgets/controller_host.dart';
import 'date_picker_sheet.dart';
import 'goals_controller.dart';
import 'goals_screen.dart';
import 'manual_task_controller.dart';
import 'manual_task_screen.dart';
import 'new_goal_controller.dart';
import 'new_goal_screen.dart';
import 'trail_controller.dart';
import 'trail_screen.dart';

class GoalsPage extends StatelessWidget {
  const GoalsPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => ControllerHost<GoalsController>(
        create: () => GoalsController(deps.goals),
        init: (c) => c.load(),
        builder: (context, c) => GoalsScreen(
          state: c,
          onOpen: (id) => context.push(AppRoutes.trailOf(id)),
          onNew: () => context.push(AppRoutes.newGoal),
        ),
      );
}

class TrailPage extends StatelessWidget {
  const TrailPage({super.key, required this.deps, required this.goalId});

  final AppDependencies deps;
  final String goalId;

  @override
  Widget build(BuildContext context) => ControllerHost<TrailController>(
        create: () => TrailController(deps.goals, goalId),
        init: (c) => c.load(),
        builder: (context, c) => TrailScreen(
          state: c,
          onBack: () => context.canPop() ? context.pop() : context.go(AppRoutes.goals),
          onEdit: null,
        ),
      );
}

class NewGoalPage extends StatelessWidget {
  const NewGoalPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => ControllerHost<NewGoalController>(
        create: () => NewGoalController(deps.goals),
        builder: (context, c) => NewGoalScreen(
          state: c,
          onBack: () => context.canPop() ? context.pop() : context.go(AppRoutes.goals),
          onManual: () => context.push(AppRoutes.manualTask),
          onTitle: c.setTitle,
          onPickDeadline: () async {
            final r = await showBoraDatePicker(context, today: deps.clock.now(), initial: c.deadline);
            if (r != null) c.setDeadline(r.date);
          },
          onClearDeadline: () => c.setDeadline(null),
          onOpenAdd: c.openAdd,
          onAddTitle: c.setAddTitle,
          onAddMinutes: c.setAddMinutes,
          onCancelAdd: c.cancelAdd,
          onConfirmAdd: c.confirmAdd,
          onRemove: c.removeStep,
          onSubmit: () async {
            final r = await c.submit();
            if (r == null || !context.mounted) return;
            final n = c.steps.length;
            showBoraToast(
              context,
              icon: PhosphorIconsBold.sparkle,
              title: '$n ${n == 1 ? 'etapa' : 'etapas'} no calendário',
              subtitle: r.goal.deadline == null
                  ? r.goal.title
                  : '${r.goal.title} até ${BoraFormat.dayMonth(BoraFormat.parseDateKey(r.goal.deadline!))}',
            );
            context.go(AppRoutes.week);
          },
        ),
      );
}

class ManualTaskPage extends StatelessWidget {
  const ManualTaskPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => ControllerHost<ManualTaskController>(
        create: () => ManualTaskController(deps.goals),
        builder: (context, c) => ManualTaskScreen(
          state: c,
          onBack: () => context.canPop() ? context.pop() : context.go(AppRoutes.newGoal),
          onTitle: c.setTitle,
          onDuration: c.chooseDuration,
          onCustom: c.setCustom,
          onPickDeadline: () async {
            final r = await showBoraDatePicker(context, today: deps.clock.now(), initial: c.deadline);
            if (r != null) c.setDeadline(r.date);
          },
          onClearDeadline: () => c.setDeadline(null),
          onBackToChat: () => context.canPop() ? context.pop() : context.go(AppRoutes.newGoal),
          onSave: () async {
            final r = await c.save();
            if (r == null || !context.mounted) return;
            showBoraToast(context, icon: PhosphorIconsBold.sparkle, title: 'Tarefa salva', subtitle: r.goal.title);
            context.go(AppRoutes.week);
          },
        ),
      );
}
