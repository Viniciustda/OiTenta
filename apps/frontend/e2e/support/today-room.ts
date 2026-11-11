// Quanto do dia corrente o e2e pode usar, pela mesma regra do planejador: o plano começa em "agora"
// arredondado para cima em 15 min e o bloco mínimo é de 30 min. A grade vai de 08h a 23h
// (última célula 22h–23h). Sem 30 min livres até as 23h, hoje não terá bloco e o e2e segue pelo
// caminho alternativo (rampa aberta pela trilha do objetivo).
export const FIRST_GRID_HOUR = 8;
export const LAST_GRID_HOUR = 22;
const GRANULARITY = 15;
const MIN_BLOCK = 30;

export interface TodayRoom {
  /** Horas a pintar hoje na grade (8 = 08h–09h). */
  hours: number[];
  hasBlockToday: boolean;
}

export function todayRoom(hour: number, minute: number): TodayRoom {
  const windowStart = FIRST_GRID_HOUR * 60;
  const windowEnd = (LAST_GRID_HOUR + 1) * 60;
  const start = Math.max(windowStart, Math.ceil((hour * 60 + minute) / GRANULARITY) * GRANULARITY);
  if (windowEnd - start < MIN_BLOCK) return { hours: [], hasBlockToday: false };
  const first = Math.floor(start / 60);
  return { hours: Array.from({ length: LAST_GRID_HOUR - first + 1 }, (_, i) => first + i), hasBlockToday: true };
}
