import '../../scheduling/domain/plan.dart';
import 'ramp.dart';

/// Resultado do registro (M11): Concluí / Parcial / Não rolou.
enum SessionOutcome {
  done('done'),
  partial('partial'),
  notDone('not_done');

  const SessionOutcome(this.api);

  final String api;
}

/// Corpo de `POST /activation/sessions`.
class RecordSession {
  const RecordSession({
    required this.goalId,
    required this.stepId,
    required this.blockId,
    required this.energy,
    required this.availableTime,
    required this.startedAt,
    required this.endedAt,
    required this.focusedMinutes,
    required this.outcome,
    this.partialPct,
  });

  final String goalId;
  final String stepId;
  final String? blockId;
  final EnergyLevel energy;
  final AvailableTime? availableTime;
  final DateTime startedAt;
  final DateTime endedAt;
  final int focusedMinutes;
  final SessionOutcome outcome;
  final int? partialPct;

  Map<String, dynamic> toJson() => {
        'goalId': goalId,
        'stepId': stepId,
        'blockId': blockId,
        'energy': energy.api,
        'availableTime': availableTime?.api,
        'startedAt': startedAt.toUtc().toIso8601String(),
        'endedAt': endedAt.toUtc().toIso8601String(),
        'focusedMinutes': focusedMinutes,
        'outcome': outcome.api,
        if (partialPct != null) 'partialPct': partialPct,
      };
}

/// Resposta 201: `{ session, step{progressPct,status}, goalProgressPct, plan }`.
class RecordSessionResult {
  const RecordSessionResult({
    required this.stepProgressPct,
    required this.stepStatus,
    required this.goalProgressPct,
    required this.plan,
  });

  final int stepProgressPct;
  final String stepStatus;
  final int goalProgressPct;
  final PlanSummary plan;

  factory RecordSessionResult.fromJson(Map<String, dynamic> json) {
    final step = json['step'] as Map<String, dynamic>;
    return RecordSessionResult(
      stepProgressPct: step['progressPct'] as int,
      stepStatus: step['status'] as String,
      goalProgressPct: json['goalProgressPct'] as int,
      plan: PlanSummary.fromJson(json['plan'] as Map<String, dynamic>),
    );
  }
}
