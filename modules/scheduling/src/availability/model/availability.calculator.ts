import {
  addDays,
  ceilToGranularity,
  floorToGranularity,
  Interval,
  localToUtc,
  subtractIntervals,
  toLocalParts,
  weekdayOf,
} from "../../common";
import { AvailabilityWindow } from "./availability-window";

export interface FreeIntervalsInput {
  windows: AvailabilityWindow[];
  timezone: string;
  from: Date;
  to: Date;
  busy: Interval[];
  now: Date;
  granularity?: number;
}

/** Converte a grade semanal local em intervalos livres UTC (D 4c). Puro e determinístico. */
export class AvailabilityCalculator {
  freeIntervals(input: FreeIntervalsInput): Interval[] {
    const granularity = input.granularity ?? 15;
    const lowerBound = Math.max(input.from.getTime(), input.now.getTime());
    const upperBound = input.to.getTime();
    const firstDate = toLocalParts(input.from, input.timezone).date;
    const lastDate = toLocalParts(input.to, input.timezone).date;
    const windowsInRange: Interval[] = [];

    for (let date = firstDate; date <= lastDate; date = addDays(date, 1)) {
      const weekday = weekdayOf(date);
      for (const window of input.windows.filter((item) => item.weekday === weekday)) {
        const start = Math.max(localToUtc(date, window.startMinute, input.timezone).getTime(), lowerBound);
        const end = Math.min(localToUtc(date, window.endMinute, input.timezone).getTime(), upperBound);
        if (start < end) {
          windowsInRange.push({ start: new Date(start), end: new Date(end) });
        }
      }
    }

    return subtractIntervals(windowsInRange, input.busy)
      .map((interval) => ({
        start: ceilToGranularity(interval.start, granularity),
        end: floorToGranularity(interval.end, granularity),
      }))
      .filter((interval) => interval.start < interval.end);
  }
}
