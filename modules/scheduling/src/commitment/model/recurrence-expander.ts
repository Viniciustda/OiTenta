import { addDays, Interval, localToUtc, MINUTE_MS, weekdayOf } from "../../common";
import { Commitment } from "./commitment.entity";

/**
 * Expande um compromisso (único ou recorrente) nas ocorrências que caem entre
 * duas datas locais, inclusive. Devolve instantes UTC (D 4e).
 */
export class RecurrenceExpander {
  expand(commitment: Commitment, fromDate: string, toDate: string, timezone: string): Interval[] {
    const recurrence = commitment.recurrence;
    const firstDate = fromDate > commitment.startDate ? fromDate : commitment.startDate;
    const endDate = recurrence?.endDate;
    const lastDate = endDate !== undefined && endDate < toDate ? endDate : toDate;
    const occurrences: Interval[] = [];

    for (let date = firstDate; date <= lastDate; date = addDays(date, 1)) {
      const occurs =
        recurrence === null
          ? date === commitment.startDate
          : recurrence.weekdays.includes(weekdayOf(date));
      if (!occurs) {
        continue;
      }
      const start = localToUtc(date, commitment.startMinute, timezone);
      const end = new Date(start.getTime() + commitment.durationMinutes * MINUTE_MS);
      occurrences.push({ start, end });
    }

    return occurrences;
  }
}
