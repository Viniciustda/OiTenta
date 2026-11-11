import {
  Entity,
  EntityState,
  InRule,
  IntegerRule,
  MaxLengthRule,
  MinValueRule,
  RangeValueRule,
  RequiredRule,
  UuidRule,
  ValidationError,
  ValidationException,
  ValidationRule,
  Validator,
} from "@oitenta/shared";
import { StepStatus } from "./goal-progress.calculator";

export const STEP_STATUSES: readonly StepStatus[] = ["pending", "done", "superseded"];
export const STEP_TITLE_MAX_LENGTH = 120;
export const STEP_MINUTES_GRANULARITY = 15;

export interface StepState extends EntityState {
  goalId: string;
  order: number;
  title: string;
  estimatedMinutes: number;
  aiEstimatedMinutes: number | null;
  progressPct: number;
  status: StepStatus;
  microSteps: string[];
}

class MultipleOfRule implements ValidationRule {
  constructor(private readonly factor: number) {}

  validate(value: unknown): string | null {
    if (typeof value !== "number") {
      return null;
    }

    return value % this.factor === 0 ? null : "multiple.of";
  }
}

class TextListRule implements ValidationRule {
  validate(value: unknown): string | null {
    const valid =
      Array.isArray(value) &&
      value.every((item) => typeof item === "string" && item.trim().length > 0);

    return valid ? null : "invalid";
  }
}

class StepStatusConsistencyRule implements ValidationRule<Step> {
  validate(step: Step): string | null {
    if (step.status === "done" && step.progressPct !== 100) {
      return "inconsistent";
    }

    if (step.status === "pending" && step.progressPct === 100) {
      return "inconsistent";
    }

    return null;
  }
}

export class Step extends Entity<StepState> {
  constructor(props: StepState) {
    super(props);
  }

  get goalId(): string {
    return this.props.goalId;
  }

  get order(): number {
    return this.props.order;
  }

  get title(): string {
    return this.props.title;
  }

  get estimatedMinutes(): number {
    return this.props.estimatedMinutes;
  }

  get aiEstimatedMinutes(): number | null {
    return this.props.aiEstimatedMinutes;
  }

  get progressPct(): number {
    return this.props.progressPct;
  }

  get status(): StepStatus {
    return this.props.status;
  }

  get microSteps(): string[] {
    return this.props.microSteps;
  }

  withProgress(progressPct: number): Step {
    if (this.status === "superseded") {
      throw new ValidationException([new ValidationError("step.status.superseded")]);
    }

    return this.clone({
      progressPct,
      status: progressPct === 100 ? "done" : "pending",
    });
  }

  public validate(): void {
    const minutesRules = [
      new IntegerRule(),
      new MinValueRule(STEP_MINUTES_GRANULARITY),
      new MultipleOfRule(STEP_MINUTES_GRANULARITY),
    ];

    Validator.validate([
      {
        code: "step.goalId",
        value: this.goalId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "step.order",
        value: this.order,
        rules: [new RequiredRule(), new IntegerRule(), new MinValueRule(1)],
      },
      {
        code: "step.title",
        value: this.title,
        rules: [new RequiredRule(), new MaxLengthRule(STEP_TITLE_MAX_LENGTH)],
      },
      {
        code: "step.estimatedMinutes",
        value: this.estimatedMinutes,
        rules: [new RequiredRule(), ...minutesRules],
      },
      {
        code: "step.aiEstimatedMinutes",
        value: this.aiEstimatedMinutes,
        rules: minutesRules,
      },
      {
        code: "step.progressPct",
        value: this.progressPct,
        rules: [new RequiredRule(), new IntegerRule(), new RangeValueRule(0, 100)],
      },
      {
        code: "step.status",
        value: this.status,
        rules: [new RequiredRule(), new InRule(STEP_STATUSES)],
      },
      {
        code: "step.status",
        value: this,
        rules: [new StepStatusConsistencyRule()],
      },
      {
        code: "step.microSteps",
        value: this.microSteps,
        rules: [new TextListRule()],
      },
    ]);
  }
}
