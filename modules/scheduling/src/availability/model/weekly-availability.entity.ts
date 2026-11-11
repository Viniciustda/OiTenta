import {
  Entity,
  EntityState,
  IntegerRule,
  RangeValueRule,
  RequiredRule,
  UuidRule,
  ValidationField,
  ValidationRule,
  Validator,
} from "@oitenta/shared";
import { MultipleOfRule } from "../../common";
import { AvailabilityWindow, compareWindows } from "./availability-window";

export const GRID_MINUTES = 15;
export const DAILY_LIMIT_MIN = 60;
export const DAILY_LIMIT_MAX = 480;
export const DAILY_LIMIT_STEP = 30;
const MINUTES_IN_DAY = 1440;

export interface WeeklyAvailabilityState extends EntityState {
  userId: string;
  windows: AvailabilityWindow[];
  dailyLimitMinutes: number;
}

const windowRangeRule: ValidationRule = {
  validate: (value) => {
    const windows = value as AvailabilityWindow[];
    return windows.every((window) => window.startMinute < window.endMinute)
      ? null
      : "invalid.range";
  },
};

const noOverlapRule: ValidationRule = {
  validate: (value) => {
    const sorted = [...(value as AvailabilityWindow[])].sort(compareWindows);
    for (let index = 1; index < sorted.length; index++) {
      const previous = sorted[index - 1] as AvailabilityWindow;
      const current = sorted[index] as AvailabilityWindow;
      if (previous.weekday === current.weekday && current.startMinute < previous.endMinute) {
        return "overlap";
      }
    }
    return null;
  },
};

export class WeeklyAvailability extends Entity<WeeklyAvailabilityState> {
  constructor(props: WeeklyAvailabilityState) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get windows(): AvailabilityWindow[] {
    return this.props.windows.map((window) => ({ ...window }));
  }

  get dailyLimitMinutes(): number {
    return this.props.dailyLimitMinutes;
  }

  public validate(): void {
    Validator.validate([
      {
        code: "weeklyAvailability.userId",
        value: this.userId,
        rules: [new RequiredRule(), new UuidRule()],
      },
      {
        code: "weeklyAvailability.windows",
        value: this.props.windows,
        rules: [new RequiredRule()],
      },
      ...this.windowFields(),
      {
        code: "weeklyAvailability.dailyLimitMinutes",
        value: this.dailyLimitMinutes,
        rules: [
          new RequiredRule(),
          new IntegerRule(),
          new RangeValueRule(DAILY_LIMIT_MIN, DAILY_LIMIT_MAX),
          new MultipleOfRule(DAILY_LIMIT_STEP),
        ],
      },
    ]);
  }

  private windowFields(): ValidationField[] {
    const windows = this.props.windows;
    const minuteRules = () => [
      new IntegerRule(),
      new RangeValueRule(0, MINUTES_IN_DAY),
      new MultipleOfRule(GRID_MINUTES),
    ];
    const pick = (key: keyof AvailabilityWindow) => windows.map((window) => window[key]);

    return [
      {
        code: "weeklyAvailability.windows.weekday",
        value: pick("weekday"),
        rules: [new IntegerRule(), new RangeValueRule(0, 6)],
      },
      { code: "weeklyAvailability.windows.startMinute", value: pick("startMinute"), rules: minuteRules() },
      { code: "weeklyAvailability.windows.endMinute", value: pick("endMinute"), rules: minuteRules() },
      { code: "weeklyAvailability.windows", value: windows, rules: [windowRangeRule] },
      { code: "weeklyAvailability.windows", value: windows, rules: [noOverlapRule] },
    ];
  }
}
