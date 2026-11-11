import { toLocalParts } from "../../common";
import { ScheduledBlock } from "../model";

export interface DayPlan {
  date: string;
  blocks: ScheduledBlock[];
  usedMinutes: number;
  limitMinutes: number;
}

/**
 * Resumo de um dia local, usado por `GetDayPlan` e `GetWeekPlan`: os blocos que
 * começam no dia (P13), em ordem de início, a soma das durações e o limite diário.
 */
export function buildDayPlan(
  date: string,
  blocks: ScheduledBlock[],
  timezone: string,
  limitMinutes: number,
): DayPlan {
  const ofDay = blocks
    .filter((block) => toLocalParts(block.start, timezone).date === date)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return {
    date,
    blocks: ofDay,
    usedMinutes: ofDay.reduce((total, block) => total + block.durationMinutes, 0),
    limitMinutes,
  };
}
