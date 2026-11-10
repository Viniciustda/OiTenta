/**
 * Janela livre da grade semanal, em hora local (valor, sem identidade).
 * - weekday: 0 = segunda … 6 = domingo;
 * - startMinute/endMinute: minutos desde 00:00, múltiplos de 15, start < end.
 */
export interface AvailabilityWindow {
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export function compareWindows(a: AvailabilityWindow, b: AvailabilityWindow): number {
  return a.weekday - b.weekday || a.startMinute - b.startMinute || a.endMinute - b.endMinute;
}

/** Ordena por dia e início e une as janelas encostadas do mesmo dia (fim de uma = início da outra). */
export function mergeTouchingWindows(windows: AvailabilityWindow[]): AvailabilityWindow[] {
  const sorted = [...windows].sort(compareWindows);
  const merged: AvailabilityWindow[] = [];

  for (const window of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.weekday === window.weekday && last.endMinute === window.startMinute) {
      last.endMinute = window.endMinute;
    } else {
      merged.push({ ...window });
    }
  }

  return merged;
}
