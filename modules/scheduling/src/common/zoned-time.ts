/**
 * Conversão entre hora local (fuso IANA) e instantes UTC usando apenas
 * `Intl.DateTimeFormat`, nativo do JavaScript.
 *
 * - Data local: string `YYYY-MM-DD`.
 * - Minuto local: minutos desde 00:00 (0–1440).
 * - Dia da semana: 0 = segunda … 6 = domingo.
 */

export const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export interface LocalParts {
  date: string;
  minute: number;
  weekday: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallClock(instant: Date, timeZone: string): WallClock {
  const values: Record<string, number> = {};
  for (const part of formatterFor(timeZone).formatToParts(instant)) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }
  return {
    year: values.year as number,
    month: values.month as number,
    day: values.day as number,
    hour: values.hour as number,
    minute: values.minute as number,
    second: values.second as number,
  };
}

/** Diferença (ms) entre a hora local e o UTC naquele instante. */
function offsetAt(instantMs: number, timeZone: string): number {
  const wall = wallClock(new Date(instantMs), timeZone);
  const asUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  const truncated = Math.floor(instantMs / 1000) * 1000;
  return asUtc - truncated;
}

function parseDate(date: string): [number, number, number] {
  const [year, month, day] = date.split("-").map(Number);
  return [year as number, month as number, day as number];
}

function formatUtcDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Converte data + minuto locais no fuso informado para um instante UTC. */
export function localToUtc(date: string, minute: number, timeZone: string): Date {
  const [year, month, day] = parseDate(date);
  const naive = Date.UTC(year, month - 1, day, 0, minute);
  const firstGuess = naive - offsetAt(naive, timeZone);
  const offset = offsetAt(firstGuess, timeZone);
  return new Date(naive - offset);
}

/** Data, minuto e dia da semana locais de um instante. */
export function toLocalParts(instant: Date, timeZone: string): LocalParts {
  const wall = wallClock(instant, timeZone);
  const date = formatUtcDate(Date.UTC(wall.year, wall.month - 1, wall.day));
  return { date, minute: wall.hour * 60 + wall.minute, weekday: weekdayOf(date) };
}

/** Dia da semana de uma data local: 0 = segunda … 6 = domingo. */
export function weekdayOf(date: string): number {
  const [year, month, day] = parseDate(date);
  const sundayBased = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (sundayBased + 6) % 7;
}

/** Soma dias a uma data local. */
export function addDays(date: string, days: number): string {
  const [year, month, day] = parseDate(date);
  return formatUtcDate(Date.UTC(year, month - 1, day) + days * DAY_MS);
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MINUTE_MS);
}

export function ceilToGranularity(instant: Date, minutes: number): Date {
  const step = minutes * MINUTE_MS;
  return new Date(Math.ceil(instant.getTime() / step) * step);
}

export function floorToGranularity(instant: Date, minutes: number): Date {
  const step = minutes * MINUTE_MS;
  return new Date(Math.floor(instant.getTime() / step) * step);
}
