import { describe, expect, it } from "vitest";
import {
  BROTO_SUGGESTION,
  GRID_HOURS,
  emptyGrid,
  gridToWindows,
  limitFromFraction,
  limitPercent,
  toggleCell,
  totalHours,
  windowsToGrid,
} from "./availability-grid.logic";

describe("grade de horários do onboarding (W07–W08, AvailGrid)", () => {
  it("vai das 08h às 22h, 15 linhas", () => {
    expect(GRID_HOURS).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
  });

  it("começa vazia, com 0h por semana", () => {
    expect(totalHours(emptyGrid())).toBe(0);
  });

  it("a sugestão do Broto tem 25h por semana", () => {
    expect(totalHours(BROTO_SUGGESTION)).toBe(25);
  });

  it("pintar e despintar uma célula", () => {
    let g = toggleCell(emptyGrid(), 0, 20, true);
    expect(g[0]).toEqual([20]);
    g = toggleCell(g, 0, 20, false);
    expect(g[0]).toEqual([]);
  });

  it("horas encostadas viram uma janela só (minutos desde 00:00)", () => {
    expect(gridToWindows(BROTO_SUGGESTION)).toEqual([
      { weekday: 0, startMinute: 1200, endMinute: 1380 },
      { weekday: 1, startMinute: 1200, endMinute: 1380 },
      { weekday: 2, startMinute: 1200, endMinute: 1380 },
      { weekday: 3, startMinute: 1200, endMinute: 1380 },
      { weekday: 4, startMinute: 1200, endMinute: 1380 },
      { weekday: 5, startMinute: 540, endMinute: 720 },
      { weekday: 5, startMinute: 840, endMinute: 1080 },
      { weekday: 6, startMinute: 840, endMinute: 1020 },
    ]);
  });

  it("janelas voltam a ser células da grade", () => {
    expect(windowsToGrid(gridToWindows(BROTO_SUGGESTION))).toEqual(BROTO_SUGGESTION);
  });
});

describe("limite diário (W09: 1h a 5h, de 30 em 30)", () => {
  it("converte a posição do controle em minutos", () => {
    expect(limitFromFraction(0)).toBe(60);
    expect(limitFromFraction(0.5)).toBe(180);
    expect(limitFromFraction(1)).toBe(300);
    expect(limitFromFraction(0.27)).toBe(120);
    expect(limitFromFraction(-1)).toBe(60);
  });

  it("calcula a posição do controle", () => {
    expect(limitPercent(180)).toBe(50);
    expect(limitPercent(60)).toBe(0);
  });
});
