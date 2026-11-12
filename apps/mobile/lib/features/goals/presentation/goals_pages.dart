import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';

import '../../../core/di/app_dependencies.dart';
import '../../../core/format/bora_format.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/widgets/bora_toast.dart';
import '../../../core/widgets/controller_host.dart';
import '../domain/goal_suggestion.dart';
import 'date_picker_sheet.dart';
import 'goal_chat_controller.dart';
import 'goal_chat_screen.dart';
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
      // IA4: "Novo objetivo" abre o chat (M13); o caminho manual (M15 vazia)
      // é o "Preencher à mão" dele.
      onNew: () => context.push(AppRoutes.goalChat),
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
      onBack: () =>
          context.canPop() ? context.pop() : context.go(AppRoutes.goals),
      onEdit: null,
    ),
  );
}

/// Chat do novo objetivo (M13–M14).
class GoalChatPage extends StatelessWidget {
  const GoalChatPage({super.key, required this.deps});

  final AppDependencies deps;

  @override
  Widget build(BuildContext context) => ControllerHost<GoalChatController>(
    create: () => GoalChatController(deps.goalAssistant),
    builder: (context, c) => GoalChatScreen(
      state: c,
      onBack: () =>
          context.canPop() ? context.pop() : context.go(AppRoutes.goals),
      // Caminho manual (P20): a M15 vazia, que oferece a M16 (tarefa única).
      // Ver o [DECIDIR] "Destino do 'Preencher à mão' do chat".
      onManual: () => context.push(AppRoutes.newGoal),
      onText: c.setText,
      onSend: () async {
        // Campo vazio ou análise em andamento (ex.: "Enviar" do teclado de
        // novo): não faz nada, para não trocar a resposta pela M15 vazia.
        if (!c.canSend) return;
        final suggestion = await c.send();
        if (!context.mounted) return;
        // Com resposta: M15 preenchida. Se a IA falhar (4f): M15 vazia.
        context.pushReplacement(AppRoutes.newGoal, extra: suggestion);
      },
    ),
  );
}

class NewGoalPage extends StatelessWidget {
  const NewGoalPage({super.key, required this.deps, this.suggestion});

  final AppDependencies deps;

  /// Resposta da IA vinda do chat; `null` no caminho manual (P20).
  final GoalSuggestion? suggestion;

  @override
  Widget build(BuildContext context) => ControllerHost<NewGoalController>(
    create: () => NewGoalController(deps.goals, suggestion: suggestion),
    builder: (context, c) => NewGoalScreen(
      state: c,
      onBack: () =>
          context.canPop() ? context.pop() : context.go(AppRoutes.goals),
      onManual: () => context.push(AppRoutes.manualTask),
      onTitle: c.setTitle,
      onPickDeadline: () async {
        final r = await showBoraDatePicker(
          context,
          today: deps.clock.now(),
          initial: c.deadline,
        );
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
      onBack: () =>
          context.canPop() ? context.pop() : context.go(AppRoutes.newGoal),
      onTitle: c.setTitle,
      onDuration: c.chooseDuration,
      onCustom: c.setCustom,
      onPickDeadline: () async {
        final r = await showBoraDatePicker(
          context,
          today: deps.clock.now(),
          initial: c.deadline,
        );
        if (r != null) c.setDeadline(r.date);
      },
      onClearDeadline: () => c.setDeadline(null),
      onBackToChat: () =>
          context.canPop() ? context.pop() : context.go(AppRoutes.newGoal),
      onSave: () async {
        final r = await c.save();
        if (r == null || !context.mounted) return;
        showBoraToast(
          context,
          icon: PhosphorIconsBold.sparkle,
          title: 'Tarefa salva',
          subtitle: r.goal.title,
        );
        context.go(AppRoutes.week);
      },
    ),
  );
}
