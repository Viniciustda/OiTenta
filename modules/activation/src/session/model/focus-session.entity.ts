import {
  DateRule,
  EqualsRule,
  Entity,
  EntityState,
  InRule,
  IntegerRule,
  MinDateRule,
  MinValueRule,
  RangeValueRule,
  RequiredRule,
  UuidRule,
  ValidationField,
  Validator,
} from "@oitenta/shared";
import {
  AVAILABLE_TIMES,
  AvailableTime,
  ENERGY_LEVELS,
  EnergyLevel,
} from "../../ramp/model";

export const FOCUS_SESSION_OUTCOMES = ["done", "partial", "not_done"] as const;
export type FocusSessionOutcome = (typeof FOCUS_SESSION_OUTCOMES)[number];

export interface FocusSessionState extends EntityState {
  userId: string;
  goalId: string;
  stepId: string;
  blockId: string | null;
  energy: EnergyLevel;
  availableTime: AvailableTime | null;
  startedAt: Date;
  endedAt: Date;
  focusedMinutes: number;
  outcome: FocusSessionOutcome;
  partialPct: number | null;
}

export class FocusSession extends Entity<FocusSessionState> {
  constructor(props: FocusSessionState) {
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

  get blockId(): string | null {
    return this.props.blockId;
  }

  get energy(): EnergyLevel {
    return this.props.energy;
  }

  get availableTime(): AvailableTime | null {
    return this.props.availableTime;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get endedAt(): Date {
    return this.props.endedAt;
  }

  get focusedMinutes(): number {
    return this.props.focusedMinutes;
  }

  get outcome(): FocusSessionOutcome {
    return this.props.outcome;
  }

  get partialPct(): number | null {
    return this.props.partialPct;
  }

  public validate(): void {
    Validator.validate([
      {
        code: "focusSession.userId",
        value: this.userId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "focusSession.goalId",
        value: this.goalId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "focusSession.stepId",
        value: this.stepId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "focusSession.blockId",
        value: this.blockId,
        rules: [new UuidRule()],
      },
      {
        code: "focusSession.energy",
        value: this.energy,
        rules: [new RequiredRule(), new InRule(ENERGY_LEVELS)],
      },
      {
        code: "focusSession.availableTime",
        value: this.availableTime,
        rules: [new InRule(AVAILABLE_TIMES)],
      },
      {
        code: "focusSession.startedAt",
        value: this.startedAt,
        rules: [new RequiredRule(), new DateRule()],
      },
      {
        code: "focusSession.endedAt",
        value: this.endedAt,
        rules: [
          new RequiredRule(),
          new DateRule(),
          new MinDateRule(this.startedAt),
        ],
      },
      {
        code: "focusSession.focusedMinutes",
        value: this.focusedMinutes,
        rules: [new RequiredRule(), new IntegerRule(), new MinValueRule(0)],
      },
      {
        code: "focusSession.outcome",
        value: this.outcome,
        rules: [new RequiredRule(), new InRule(FOCUS_SESSION_OUTCOMES)],
      },
      this.partialPctField(),
    ]);
  }

  private partialPctField(): ValidationField {
    const rules =
      this.outcome === "partial"
        ? [new RequiredRule(), new IntegerRule(), new RangeValueRule(1, 99)]
        : [new EqualsRule(null)];

    return { code: "focusSession.partialPct", value: this.partialPct, rules };
  }
}
