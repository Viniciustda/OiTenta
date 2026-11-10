import { Goal, GoalColorIndex, GoalKind, GoalStatus, Step, StepStatus } from "../../src";

export interface StepSpec {
  estimatedMinutes?: number;
  progressPct?: number;
  status?: StepStatus;
  microSteps?: string[];
  title?: string;
}

export interface GoalSpec {
  userId: string;
  title?: string;
  deadline?: string | null;
  kind?: GoalKind;
  colorIndex?: GoalColorIndex;
  status?: GoalStatus;
  createdAt?: Date;
  steps?: StepSpec[];
}

export function buildGoal(spec: GoalSpec): Goal {
  const draft = new Goal({
    userId: spec.userId,
    title: spec.title ?? "Trabalho de Algoritmos",
    deadline: spec.deadline === undefined ? "2026-11-24" : spec.deadline,
    kind: spec.kind ?? "goal",
    colorIndex: spec.colorIndex ?? 1,
    source: "manual",
    status: spec.status ?? "active",
    createdAt: spec.createdAt,
    steps: [],
  });

  const steps = (spec.steps ?? [{}]).map((item, index) => {
    const progressPct = item.progressPct ?? 0;
    return new Step({
      goalId: draft.id,
      order: index + 1,
      title: item.title ?? `Etapa ${index + 1}`,
      estimatedMinutes: item.estimatedMinutes ?? 60,
      aiEstimatedMinutes: null,
      progressPct,
      status: item.status ?? (progressPct === 100 ? "done" : "pending"),
      microSteps: item.microSteps ?? [],
    });
  });

  return draft.clone({ steps, status: spec.status ?? Goal.statusFor(steps) });
}
