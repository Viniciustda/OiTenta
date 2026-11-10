import 'availability.dart';

/// `{ goalId, feasible, usedSlack, slackDays, unscheduledMinutes }`.
class GoalFeasibility {
  const GoalFeasibility({
    required this.goalId,
    required this.feasible,
    required this.usedSlack,
    required this.slackDays,
    required this.unscheduledMinutes,
  });

  final String goalId;
  final bool feasible;
  final bool usedSlack;
  final int slackDays;
  final int unscheduledMinutes;

  factory GoalFeasibility.fromJson(Map<String, dynamic> json) => GoalFeasibility(
        goalId: json['goalId'] as String,
        feasible: json['feasible'] as bool,
        usedSlack: json['usedSlack'] as bool,
        slackDays: json['slackDays'] as int,
        unscheduledMinutes: json['unscheduledMinutes'] as int,
      );
}

/// Resumo do plano recalculado: `{ totalMinutes, days, goals[] }`.
class PlanSummary {
  const PlanSummary({required this.totalMinutes, required this.days, required this.goals});

  final int totalMinutes;
  final int days;
  final List<GoalFeasibility> goals;

  factory PlanSummary.fromJson(Map<String, dynamic> json) => PlanSummary(
        totalMinutes: json['totalMinutes'] as int,
        days: json['days'] as int,
        goals: (json['goals'] as List).map((g) => GoalFeasibility.fromJson(g as Map<String, dynamic>)).toList(),
      );
}

/// Bloco do plano: `{id, start, end, status, goalId, goalTitle, colorIndex, stepId, stepTitle}`.
/// `start`/`end` são instantes UTC; a tela mostra no horário do aparelho.
class PlanBlock {
  const PlanBlock({
    required this.id,
    required this.start,
    required this.end,
    required this.status,
    required this.goalId,
    required this.goalTitle,
    required this.colorIndex,
    required this.stepId,
    required this.stepTitle,
  });

  final String id;
  final DateTime start;
  final DateTime end;

  /// `'planned' | 'done' | 'partial' | 'missed'`.
  final String status;
  final String goalId;
  final String goalTitle;
  final int colorIndex;
  final String stepId;
  final String stepTitle;

  int get minutes => end.difference(start).inMinutes;

  factory PlanBlock.fromJson(Map<String, dynamic> json) => PlanBlock(
        id: json['id'] as String,
        start: DateTime.parse(json['start'] as String),
        end: DateTime.parse(json['end'] as String),
        status: json['status'] as String,
        goalId: json['goalId'] as String,
        goalTitle: json['goalTitle'] as String,
        colorIndex: json['colorIndex'] as int,
        stepId: json['stepId'] as String,
        stepTitle: json['stepTitle'] as String,
      );
}

/// `{ date, blocks[], usedMinutes, limitMinutes }`.
class DayPlan {
  const DayPlan({required this.date, required this.blocks, required this.usedMinutes, required this.limitMinutes});

  final String date;
  final List<PlanBlock> blocks;
  final int usedMinutes;
  final int limitMinutes;

  factory DayPlan.fromJson(Map<String, dynamic> json) => DayPlan(
        date: json['date'] as String,
        blocks: (json['blocks'] as List).map((b) => PlanBlock.fromJson(b as Map<String, dynamic>)).toList(),
        usedMinutes: json['usedMinutes'] as int,
        limitMinutes: json['limitMinutes'] as int,
      );
}

/// `{ days[7] }`.
class WeekPlan {
  const WeekPlan({required this.days});

  final List<DayPlan> days;

  factory WeekPlan.fromJson(Map<String, dynamic> json) =>
      WeekPlan(days: (json['days'] as List).map((d) => DayPlan.fromJson(d as Map<String, dynamic>)).toList());
}

/// Resposta de `PUT /scheduling/availability`.
class SetAvailabilityResult {
  const SetAvailabilityResult({required this.availability, required this.plan});

  final WeeklyAvailability availability;
  final PlanSummary plan;

  factory SetAvailabilityResult.fromJson(Map<String, dynamic> json) => SetAvailabilityResult(
        availability: WeeklyAvailability.fromJson(json['availability'] as Map<String, dynamic>),
        plan: PlanSummary.fromJson(json['plan'] as Map<String, dynamic>),
      );
}

