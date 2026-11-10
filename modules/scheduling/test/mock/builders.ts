import {
  AvailabilityWindow,
  ScheduledBlock,
  ScheduledBlockState,
  WeeklyAvailability,
} from "../../src";
import { GOAL_1, stepId, USER_A } from "./ids";

export const EVERY_EVENING: AvailabilityWindow[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  startMinute: 19 * 60,
  endMinute: 23 * 60,
}));

export function makeAvailability(
  userId = USER_A,
  dailyLimitMinutes = 120,
  windows: AvailabilityWindow[] = EVERY_EVENING,
): WeeklyAvailability {
  return new WeeklyAvailability({ userId, windows, dailyLimitMinutes });
}

export function makeBlock(overrides: Partial<ScheduledBlockState> = {}): ScheduledBlock {
  return new ScheduledBlock({
    userId: USER_A,
    goalId: GOAL_1,
    stepId: stepId(1),
    start: new Date("2026-11-10T22:00:00.000Z"),
    end: new Date("2026-11-10T23:00:00.000Z"),
    status: "planned",
    pinned: false,
    origin: "auto",
    ...overrides,
  });
}
