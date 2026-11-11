import {
  DateRule,
  Entity,
  EntityState,
  InRule,
  RequiredRule,
  UuidRule,
  ValidationRule,
  Validator,
} from "@oitenta/shared";
import { minutesBetween, MultipleOfRule } from "../../common";

export const BLOCK_STATUSES = ["planned", "done", "partial", "missed"] as const;
export type BlockStatus = (typeof BLOCK_STATUSES)[number];

export const BLOCK_ORIGINS = ["auto", "manual"] as const;
export type BlockOrigin = (typeof BLOCK_ORIGINS)[number];

export interface ScheduledBlockState extends EntityState {
  userId: string;
  goalId: string;
  stepId: string;
  start: Date;
  end: Date;
  status: BlockStatus;
  pinned: boolean;
  origin: BlockOrigin;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export class ScheduledBlock extends Entity<ScheduledBlockState> {
  constructor(props: ScheduledBlockState) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get goalId(): string {
    return this.props.goalId;
  }

  get stepId(): string {
    return this.props.stepId;
  }

  get start(): Date {
    return this.props.start;
  }

  get end(): Date {
    return this.props.end;
  }

  get status(): BlockStatus {
    return this.props.status;
  }

  get pinned(): boolean {
    return this.props.pinned;
  }

  get origin(): BlockOrigin {
    return this.props.origin;
  }

  get durationMinutes(): number {
    return minutesBetween(this.start, this.end);
  }

  public validate(): void {
    const hasValidRange = isValidDate(this.start) && isValidDate(this.end);
    const endAfterStartRule: ValidationRule = {
      validate: () => (hasValidRange && this.end <= this.start ? "invalid.range" : null),
    };

    Validator.validate([
      { code: "scheduledBlock.userId", value: this.userId, rules: [new RequiredRule(), new UuidRule()] },
      { code: "scheduledBlock.goalId", value: this.goalId, rules: [new RequiredRule(), new UuidRule()] },
      { code: "scheduledBlock.stepId", value: this.stepId, rules: [new RequiredRule(), new UuidRule()] },
      { code: "scheduledBlock.start", value: this.start, rules: [new RequiredRule(), new DateRule()] },
      {
        code: "scheduledBlock.end",
        value: this.end,
        rules: [new RequiredRule(), new DateRule(), endAfterStartRule],
      },
      {
        code: "scheduledBlock.durationMinutes",
        value: hasValidRange ? this.durationMinutes : null,
        rules: [new MultipleOfRule(15)],
      },
      {
        code: "scheduledBlock.status",
        value: this.status,
        rules: [new RequiredRule(), new InRule([...BLOCK_STATUSES])],
      },
      {
        code: "scheduledBlock.pinned",
        value: this.pinned,
        rules: [new RequiredRule(), new InRule([true, false])],
      },
      {
        code: "scheduledBlock.origin",
        value: this.origin,
        rules: [new RequiredRule(), new InRule([...BLOCK_ORIGINS])],
      },
    ]);
  }
}
