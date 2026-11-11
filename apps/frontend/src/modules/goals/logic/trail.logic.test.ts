import { describe, expect, it } from "vitest";
import type { GoalStepDetail } from "../data/goals.types";
import { slackShort, stepView } from "./trail.logic";

const TZ = "America/Sao_Paulo";
const TODAY = "2026-11-16";
const step = (p: Partial<GoalStepDetail>): GoalStepDetail => ({
  id: "s", order: 1, title: "Etapa", estimatedMinutes: 90, progressPct: 0, status: "pending", remainingMinutes: 90, ...p,
});

describe("trilha do objetivo (W22)", () => {
  it("etapa concluída", () => {
    expect(stepView(step({ status: "done", progressPct: 100, estimatedMinutes: 45 }), false, TODAY, TZ)).toMatchObject({
      state: "done", meta: "Concluída · 45 min", pill: null,
    });
  });

  it("próxima etapa com bloco hoje", () => {
    const v = stepView(step({ nextBlock: { id: "b", start: "2026-11-16T23:00:00.000Z", end: "2026-11-17T00:30:00.000Z" } }), true, TODAY, TZ);
    expect(v).toMatchObject({ state: "next", meta: "Hoje 20:00 · 1h30", pill: "Hoje 20:00" });
  });

  it("etapa futura amanhã e em outro dia", () => {
    expect(stepView(step({ estimatedMinutes: 60, nextBlock: { id: "b", start: "2026-11-17T23:00:00.000Z", end: "2026-11-18T00:00:00.000Z" } }), false, TODAY, TZ)).toMatchObject({
      state: "pending", meta: "Amanhã 20:00 · 1h", pill: "Amanhã",
    });
    expect(stepView(step({ estimatedMinutes: 30, nextBlock: { id: "b", start: "2026-11-18T23:00:00.000Z", end: "2026-11-18T23:30:00.000Z" } }), false, TODAY, TZ)).toMatchObject({
      meta: "Qua, 18/11 20:00 · 30 min", pill: "Qua, 18/11",
    });
  });

  it("etapa sem horário", () => {
    expect(stepView(step({}), false, TODAY, TZ)).toMatchObject({ meta: "Ainda sem horário · 1h30", pill: null });
  });

  it("etapa parcial mostra a barra", () => {
    expect(stepView(step({ progressPct: 70 }), false, TODAY, TZ)).toMatchObject({ state: "partial", partialPct: 70 });
  });

  it("folga curta", () => {
    expect(slackShort(2)).toBe("2 dias");
    expect(slackShort(1)).toBe("1 dia");
    expect(slackShort(0)).toBe("0 dia");
    expect(slackShort(-1)).toBe("Não cabe");
    expect(slackShort(null)).toBe("—");
  });
});
