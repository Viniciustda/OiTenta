import {
  Goal,
  GoalColorIndex,
  GoalKind,
  GoalProgressCalculator,
  GoalSource,
  GoalStatus,
  Step,
  StepStatus,
} from "../model";

export interface StepView {
  id: string;
  order: number;
  title: string;
  estimatedMinutes: number;
  aiEstimatedMinutes: number | null;
  progressPct: number;
  status: StepStatus;
  microSteps: string[];
  remainingMinutes: number;
}

export interface GoalHeaderView {
  id: string;
  title: string;
  deadline: string | null;
  kind: GoalKind;
  colorIndex: GoalColorIndex;
  source: GoalSource;
  status: GoalStatus;
}

export interface GoalView extends GoalHeaderView {
  progressPct: number;
  steps: StepView[];
}

export function toStepView(step: Step): StepView {
  return {
    id: step.id,
    order: step.order,
    title: step.title,
    estimatedMinutes: step.estimatedMinutes,
    aiEstimatedMinutes: step.aiEstimatedMinutes,
    progressPct: step.progressPct,
    status: step.status,
    microSteps: [...step.microSteps],
    remainingMinutes: GoalProgressCalculator.remainingMinutes(step),
  };
}

export function toStepViews(steps: readonly Step[]): StepView[] {
  return [...steps].sort((a, b) => a.order - b.order).map(toStepView);
}

export function toGoalHeaderView(goal: Goal): GoalHeaderView {
  return {
    id: goal.id,
    title: goal.title,
    deadline: goal.deadline,
    kind: goal.kind,
    colorIndex: goal.colorIndex,
    source: goal.source,
    status: goal.status,
  };
}

export function toGoalView(goal: Goal): GoalView {
  return {
    ...toGoalHeaderView(goal),
    progressPct: GoalProgressCalculator.goalProgressPct(goal.steps),
    steps: toStepViews(goal.steps),
  };
}
