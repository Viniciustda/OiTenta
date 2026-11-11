import type { AvailabilityWindow } from "../data/scheduling.types";

// Grade de horários do onboarding (AvailGrid.dc.html) e limite diário (AppOnboarding.dc.html).
// A grade guarda, por dia (0 = segunda), as horas livres (8 = 08h–09h).
export type HourGrid = number[][];

export const GRID_HOURS = Array.from({ length: 15 }, (_, i) => 8 + i);
export const GRID_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export const emptyGrid = (): HourGrid => [[], [], [], [], [], [], []];

/** "Usar sugestão do Broto" (protótipo). */
export const BROTO_SUGGESTION: HourGrid = [
  [20, 21, 22], [20, 21, 22], [20, 21, 22], [20, 21, 22], [20, 21, 22], [9, 10, 11, 14, 15, 16, 17], [14, 15, 16],
];

export const totalHours = (g: HourGrid) => g.reduce((a, d) => a + d.length, 0);

export function toggleCell(g: HourGrid, day: number, hour: number, on: boolean): HourGrid {
  return g.map((hours, d) => {
    if (d !== day) return hours;
    const has = hours.includes(hour);
    if (on && !has) return [...hours, hour];
    if (!on && has) return hours.filter((h) => h !== hour);
    return hours;
  });
}

export function gridToWindows(g: HourGrid): AvailabilityWindow[] {
  const out: AvailabilityWindow[] = [];
  g.forEach((hours, weekday) => {
    [...hours].sort((a, b) => a - b).forEach((h) => {
      const last = out[out.length - 1];
      if (last && last.weekday === weekday && last.endMinute === h * 60) last.endMinute += 60;
      else out.push({ weekday, startMinute: h * 60, endMinute: h * 60 + 60 });
    });
  });
  return out;
}

export function windowsToGrid(windows: AvailabilityWindow[]): HourGrid {
  const g = emptyGrid();
  windows.forEach((w) => {
    for (let m = w.startMinute; m < w.endMinute; m += 60) g[w.weekday].push(Math.floor(m / 60));
  });
  return g;
}

// Limite diário: de 1h a 5h, de 30 em 30 min (W09; P7 aceita 60–480).
export const LIMIT_MIN = 60;
export const LIMIT_MAX = 300;
export const LIMIT_DEFAULT = 180;

export const limitFromFraction = (f: number) =>
  Math.round((LIMIT_MIN + Math.max(0, Math.min(1, f)) * (LIMIT_MAX - LIMIT_MIN)) / 30) * 30;

export const limitPercent = (minutes: number) => Math.round(((minutes - LIMIT_MIN) / (LIMIT_MAX - LIMIT_MIN)) * 100);
