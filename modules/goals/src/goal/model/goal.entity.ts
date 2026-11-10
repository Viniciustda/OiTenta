import {
  DateStringRule,
  Entity,
  EntityState,
  InRule,
  MaxItemsRule,
  MaxLengthRule,
  RegexRule,
  RequiredRule,
  UuidRule,
  ValidationRule,
  Validator,
} from "@oitenta/shared";
import { GoalProgressCalculator } from "./goal-progress.calculator";
import { Step } from "./step.entity";

export type GoalKind = "goal" | "single";
export type GoalColorIndex = 1 | 2 | 3 | 4;
export type GoalSource = "manual" | "ai";
export type GoalStatus = "active" | "done";

export const GOAL_KINDS: readonly GoalKind[] = ["goal", "single"];
export const GOAL_COLOR_INDEXES: readonly GoalColorIndex[] = [1, 2, 3, 4];
export const GOAL_SOURCES: readonly GoalSource[] = ["manual", "ai"];
export const GOAL_STATUSES: readonly GoalStatus[] = ["active", "done"];
export const GOAL_TITLE_MAX_LENGTH = 120;

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface GoalState extends EntityState {
  userId: string;
  title: string;
  deadline: string | null;
  kind: GoalKind;
  colorIndex: GoalColorIndex;
  source: GoalSource;
  status: GoalStatus;
  steps: Step[];
}

class SequentialOrderRule implements ValidationRule<Step[]> {
  validate(steps: Step[]): string | null {
    const orders = steps.map((step) => step.order).sort((a, b) => a - b);
    const sequential = orders.every((order, index) => order === index + 1);

    return sequential ? null : "order.invalid";
  }
}

class StepsBelongToGoalRule implements ValidationRule<Step[]> {
  constructor(private readonly goalId: string) {}

  validate(steps: Step[]): string | null {
    return steps.every((step) => step.goalId === this.goalId) ? null : "goal.mismatch";
  }
}

class GoalStatusConsistencyRule implements ValidationRule<Goal> {
  validate(goal: Goal): string | null {
    return goal.status === Goal.statusFor(goal.steps) ? null : "inconsistent";
  }
}

export class Goal extends Entity<GoalState> {
  constructor(props: GoalState) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get deadline(): string | null {
    return this.props.deadline;
  }

  get kind(): GoalKind {
    return this.props.kind;
  }

  get colorIndex(): GoalColorIndex {
    return this.props.colorIndex;
  }

  get source(): GoalSource {
    return this.props.source;
  }

  get status(): GoalStatus {
    return this.props.status;
  }

  get steps(): Step[] {
    return this.props.steps;
  }

  static statusFor(steps: readonly Step[]): GoalStatus {
    const { done, total } = GoalProgressCalculator.summary(steps);

    return total > 0 && done === total ? "done" : "active";
  }

  findStep(stepId: string): Step | null {
    return this.steps.find((step) => step.id === stepId) ?? null;
  }

  withStep(updated: Step): Goal {
    const steps = this.steps.map((step) => (step.id === updated.id ? updated : step));

    return this.clone({ steps, status: Goal.statusFor(steps) });
  }

  public validate(): void {
    Validator.validate([
      {
        code: "goal.userId",
        value: this.userId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "goal.title",
        value: this.title,
        rules: [new RequiredRule(), new MaxLengthRule(GOAL_TITLE_MAX_LENGTH)],
      },
      {
        code: "goal.deadline",
        value: this.deadline,
        rules: [
          ...(this.deadline === null ? [] : [new RequiredRule()]),
          new RegexRule(LOCAL_DATE_PATTERN),
          new DateStringRule(),
        ],
      },
      {
        code: "goal.kind",
        value: this.kind,
        rules: [new RequiredRule(), new InRule(GOAL_KINDS)],
      },
      {
        code: "goal.colorIndex",
        value: this.colorIndex,
        rules: [new RequiredRule(), new InRule(GOAL_COLOR_INDEXES)],
      },
      {
        code: "goal.source",
        value: this.source,
        rules: [new RequiredRule(), new InRule(GOAL_SOURCES)],
      },
      {
        code: "goal.status",
        value: this.status,
        rules: [new RequiredRule(), new InRule(GOAL_STATUSES)],
      },
      {
        code: "goal.steps",
        value: this.steps,
        rules: [new RequiredRule(), ...(this.kind === "single" ? [new MaxItemsRule(1)] : [])],
      },
    ]);

    Validator.validate([
      {
        code: "goal.steps",
        value: this.steps,
        rules: [new SequentialOrderRule(), new StepsBelongToGoalRule(this.id)],
      },
    ]);

    for (const step of this.steps) {
      step.validate();
    }

    Validator.validate([
      {
        code: "goal.status",
        value: this,
        rules: [new GoalStatusConsistencyRule()],
      },
    ]);
  }
}
