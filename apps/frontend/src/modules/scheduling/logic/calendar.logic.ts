import { dayLabel, formatDdMm, formatDuration, formatHm, localDate, localMinute, minutesBetween, monthName, addDays, dayOfMonth } from "@/modules/core/format/time.format";
import type { AvailabilityWindow } from "../data/scheduling.types";

// Geometria e rótulos do calendário semanal (AppCalendario.dc.html): 08h–23h, 40 px por hora.
export const HOUR_HEIGHT = 40;
export const FIRST_MINUTE = 8 * 60;
export const GRID_HOURS_COUNT = 15;

const toTop = (minute: number) => ((minute - FIRST_MINUTE) / 60) * HOUR_HEIGHT;

export function weekRangeLabel(monday: string): string {
  const sunday = addDays(monday, 6);
  if (monday.slice(5, 7) === sunday.slice(5, 7)) return `${dayOfMonth(monday)}–${dayOfMonth(sunday)} de ${monthName(monday)}`;
  return `${dayOfMonth(monday)} ${monthName(monday).slice(0, 3)} – ${dayOfMonth(sunday)} ${monthName(sunday).slice(0, 3)}`;
}

export const dayLoadLabel = (used: number, limit: number) => (used ? `${formatDuration(used)} de ${formatDuration(limit)}` : "livre");

export function blockGeometry(start: string, end: string, tz: string) {
  const minutes = minutesBetween(start, end);
  return { top: toTop(localMinute(start, tz)) + 1, height: Math.max(20, (minutes / 60) * HOUR_HEIGHT - 3) };
}

export const freeRects = (windows: AvailabilityWindow[], weekday: number) =>
  windows
    .filter((w) => w.weekday === weekday)
    .map((w) => ({ top: toTop(Math.max(FIRST_MINUTE, w.startMinute)), height: ((w.endMinute - Math.max(FIRST_MINUTE, w.startMinute)) / 60) * HOUR_HEIGHT }));

export function blockDetail(b: { start: string; end: string }, today: string, tz: string) {
  const date = localDate(b.start, tz);
  const label = dayLabel(date, today);
  const day = label === "Hoje" || label === "Amanhã" ? `${label}, ${formatDdMm(date)}` : label;
  return { when: `${day} · ${formatHm(b.start, tz)}–${formatHm(b.end, tz)}`, duration: formatDuration(minutesBetween(b.start, b.end)) };
}
