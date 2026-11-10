import '../../scheduling/domain/plan.dart';

/// Item de `GET /goals`: `{id, title, deadline, colorIndex, progressPct, done, total, status, slackDays}`.
class GoalSummary {
  const GoalSummary({
    required this.id,
    required this.title,
    required this.deadline,
    required this.colorIndex,
    required this.progressPct,
    required this.done,
    required this.total,
    required this.status,
    required this.slackDays,
  });

  final String id;
  final String title;

  /// Data local `YYYY-MM-DD` ou `null` (sem prazo, P3).
  final String? deadline;
  final int colorIndex;
  final int progressPct;
  final int done;
  final int total;

  /// `'active' | 'done'`.
  final String status;

  /// Folga no plano atual; `null` quando não há prazo.
  final int? slackDays;

  factory GoalSummary.fromJson(Map<String, dynamic> json) => GoalSummary(
        id: json['id'] as String,
        title: json['title'] as String,
        deadline: json['deadline'] as String?,
        colorIndex: json['colorIndex'] as int,
        progressPct: json['progressPct'] as int,
        done: json['done'] as int,
        total: json['total'] as int,
        status: json['status'] as String,
        slackDays: json['slackDays'] as int?,
      );
}

/// Próximo bloco agendado de uma etapa: `{ start, end }` (instantes UTC).
class NextBlock {
  const NextBlock({required this.start, required this.end});

  final DateTime start;
  final DateTime end;

  factory NextBlock.fromJson(Map<String, dynamic> json) =>
      NextBlock(start: DateTime.parse(json['start'] as String), end: DateTime.parse(json['end'] as String));
}

/// Etapa de `GET /goals/:goalId`:
/// `{id, order, title, estimatedMinutes, progressPct, status, remainingMinutes, nextBlock?}`.
class GoalStep {
  const GoalStep({
    required this.id,
    required this.order,
    required this.title,
    required this.estimatedMinutes,
    required this.progressPct,
    required this.status,
    required this.remainingMinutes,
    this.nextBlock,
  });

  final String id;
  final int order;
  final String title;
  final int estimatedMinutes;
  final int progressPct;

  /// `'pending' | 'done' | 'superseded'`.
  final String status;
  final int remainingMinutes;
  final NextBlock? nextBlock;

  bool get isDone => status == 'done';

  factory GoalStep.fromJson(Map<String, dynamic> json) => GoalStep(
        id: json['id'] as String,
        order: json['order'] as int,
        title: json['title'] as String,
        estimatedMinutes: json['estimatedMinutes'] as int,
        progressPct: json['progressPct'] as int,
        status: json['status'] as String,
        remainingMinutes: json['remainingMinutes'] as int,
        nextBlock: json['nextBlock'] == null ? null : NextBlock.fromJson(json['nextBlock'] as Map<String, dynamic>),
      );
}

/// O objetivo dentro de `GET /goals/:goalId` e de `POST /goals`.
class Goal {
  const Goal({
    required this.id,
    required this.title,
    required this.deadline,
    required this.colorIndex,
    required this.progressPct,
  });

  final String id;
  final String title;
  final String? deadline;
  final int colorIndex;
  final int progressPct;

  factory Goal.fromJson(Map<String, dynamic> json) => Goal(
        id: json['id'] as String,
        title: json['title'] as String,
        deadline: json['deadline'] as String?,
        colorIndex: json['colorIndex'] as int,
        progressPct: json['progressPct'] as int,
      );
}

/// `GET /goals/:goalId`: `{ goal, steps[], progressPct, done, total }`.
class GoalDetail {
  const GoalDetail({
    required this.goal,
    required this.steps,
    required this.progressPct,
    required this.done,
    required this.total,
  });

  final Goal goal;
  final List<GoalStep> steps;
  final int progressPct;
  final int done;
  final int total;

  factory GoalDetail.fromJson(Map<String, dynamic> json) => GoalDetail(
        goal: Goal.fromJson(json['goal'] as Map<String, dynamic>),
        steps: (json['steps'] as List).map((s) => GoalStep.fromJson(s as Map<String, dynamic>)).toList(),
        progressPct: json['progressPct'] as int,
        done: json['done'] as int,
        total: json['total'] as int,
      );
}

/// Etapa enviada em `POST /goals`.
class NewStep {
  const NewStep({required this.title, required this.estimatedMinutes, this.microSteps = const []});

  final String title;
  final int estimatedMinutes;
  final List<String> microSteps;

  Map<String, dynamic> toJson() => {'title': title, 'estimatedMinutes': estimatedMinutes, 'microSteps': microSteps};
}

/// Corpo de `POST /goals`: `{ title, deadline, kind, steps[] }`.
class NewGoal {
  const NewGoal({required this.title, required this.deadline, required this.kind, required this.steps});

  final String title;
  final String? deadline;

  /// `'goal' | 'single'`.
  final String kind;
  final List<NewStep> steps;

  Map<String, dynamic> toJson() => {
        'title': title,
        'deadline': deadline,
        'kind': kind,
        'steps': steps.map((s) => s.toJson()).toList(),
      };
}

/// Resposta 201 de `POST /goals`: `{ goal, plan }`.
class CreateGoalResult {
  const CreateGoalResult({required this.goal, required this.plan});

  final Goal goal;
  final PlanSummary plan;

  factory CreateGoalResult.fromJson(Map<String, dynamic> json) => CreateGoalResult(
        goal: Goal.fromJson(json['goal'] as Map<String, dynamic>),
        plan: PlanSummary.fromJson(json['plan'] as Map<String, dynamic>),
      );
}
