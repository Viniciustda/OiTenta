/** Intervalo de tempo em UTC, fechado no início e aberto no fim: [start, end). */
export interface Interval {
  start: Date;
  end: Date;
}

/** Remove de cada intervalo base os trechos ocupados. Devolve os pedaços livres em ordem. */
export function subtractIntervals(base: Interval[], busy: Interval[]): Interval[] {
  const sortedBusy = [...busy].sort((a, b) => a.start.getTime() - b.start.getTime());
  const result: Interval[] = [];

  for (const interval of base) {
    let cursor = interval.start.getTime();
    const end = interval.end.getTime();

    for (const occupied of sortedBusy) {
      const busyStart = occupied.start.getTime();
      const busyEnd = occupied.end.getTime();
      if (busyEnd <= cursor || busyStart >= end) {
        continue;
      }
      if (busyStart > cursor) {
        result.push({ start: new Date(cursor), end: new Date(busyStart) });
      }
      cursor = Math.max(cursor, busyEnd);
    }

    if (cursor < end) {
      result.push({ start: new Date(cursor), end: new Date(end) });
    }
  }

  return result.sort((a, b) => a.start.getTime() - b.start.getTime());
}
