export type StepStatus = "pending" | "done" | "superseded";

export interface ProgressStep {
  estimatedMinutes: number;
  progressPct: number;
  status: StepStatus;
}

export interface ProgressSummary {
  done: number;
  total: number;
}

const SLOT_MINUTES = 15;

export class GoalProgressCalculator {
  static goalProgressPct(steps: readonly ProgressStep[]): number {
    let weightSum = 0;
    let weightedPct = 0;

    for (const step of steps) {
      if (step.status === "superseded") {
        const doneMinutes = (step.estimatedMinutes * step.progressPct) / 100;
        weightSum += doneMinutes;
        weightedPct += doneMinutes * 100;
      } else {
        weightSum += step.estimatedMinutes;
        weightedPct += step.estimatedMinutes * step.progressPct;
      }
    }

    return weightSum === 0 ? 0 : Math.round(weightedPct / weightSum);
  }

  static remainingMinutes(step: ProgressStep): number {
    if (step.status !== "pending") {
      return 0;
    }

    const remaining = step.estimatedMinutes * (1 - step.progressPct / 100);

    return Math.ceil(remaining / SLOT_MINUTES) * SLOT_MINUTES;
  }

  static summary(steps: readonly ProgressStep[]): ProgressSummary {
    const active = steps.filter((step) => step.status !== "superseded");

    return {
      done: active.filter((step) => step.status === "done").length,
      total: active.length,
    };
  }
}
