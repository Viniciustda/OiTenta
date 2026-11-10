import {
  Entity,
  EntityState,
  InRule,
  IntegerRule,
  PositiveRule,
  RangeValueRule,
  RequiredRule,
  UniqueItemsRule,
  UuidRule,
  ValidationField,
  ValidationRule,
  Validator,
} from "@oitenta/shared";
import { LocalDateRule, localDateRules, MultipleOfRule } from "../../common";

export type CommitmentKind = "commitment";

/** Recorrência semanal (subconjunto BYDAY da RRULE, D 4e). */
export interface CommitmentRecurrence {
  weekdays: number[];
  endDate?: string;
}

export interface CommitmentState extends EntityState {
  userId: string;
  title: string;
  kind: CommitmentKind;
  startDate: string;
  startMinute: number;
  durationMinutes: number;
  recurrence: CommitmentRecurrence | null;
}

const GRID_MINUTES = 15;
const LAST_START_MINUTE = 1440 - GRID_MINUTES;

export class Commitment extends Entity<CommitmentState> {
  constructor(props: CommitmentState) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get kind(): CommitmentKind {
    return this.props.kind;
  }

  get startDate(): string {
    return this.props.startDate;
  }

  get startMinute(): number {
    return this.props.startMinute;
  }

  get durationMinutes(): number {
    return this.props.durationMinutes;
  }

  get recurrence(): CommitmentRecurrence | null {
    return this.props.recurrence;
  }

  public validate(): void {
    Validator.validate([
      {
        code: "commitment.userId",
        value: this.userId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "commitment.title",
        value: this.title,
        rules: [new RequiredRule()],
      },
      {
        code: "commitment.kind",
        value: this.kind,
        rules: [new RequiredRule(), new InRule(["commitment"])],
      },
      {
        code: "commitment.startDate",
        value: this.startDate,
        rules: localDateRules(),
      },
      {
        code: "commitment.startMinute",
        value: this.startMinute,
        rules: [
          new RequiredRule(),
          new IntegerRule(),
          new RangeValueRule(0, LAST_START_MINUTE),
          new MultipleOfRule(GRID_MINUTES),
        ],
      },
      {
        code: "commitment.durationMinutes",
        value: this.durationMinutes,
        rules: [
          new RequiredRule(),
          new IntegerRule(),
          new PositiveRule(),
          new MultipleOfRule(GRID_MINUTES),
        ],
      },
      ...this.recurrenceFields(),
    ]);
  }

  private recurrenceFields(): ValidationField[] {
    const recurrence = this.recurrence;
    if (recurrence === null) {
      return [];
    }

    const startDate = this.startDate;
    const localDateRule = new LocalDateRule();
    const notBeforeStartRule: ValidationRule = {
      validate: (value) =>
        localDateRule.validate(value) === null && (value as string) < startDate
          ? "before.start"
          : null,
    };

    return [
      {
        code: "commitment.recurrence.weekdays",
        value: recurrence.weekdays,
        rules: [
          new RequiredRule(),
          new IntegerRule(),
          new RangeValueRule(0, 6),
          new UniqueItemsRule(),
        ],
      },
      {
        code: "commitment.recurrence.endDate",
        value: recurrence.endDate,
        rules: [localDateRule, notBeforeStartRule],
      },
    ];
  }
}
