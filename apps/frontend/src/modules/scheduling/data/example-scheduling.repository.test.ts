import { describe, expect, it } from "vitest";
import { ExampleBackend } from "@/modules/core/data/example-backend";
import { ExampleSchedulingRepository } from "./example-scheduling.repository";

const demo = () => new ExampleSchedulingRepository(new ExampleBackend());
const fresh = () => new ExampleSchedulingRepository(new ExampleBackend({ withDemoData: false }));

describe("ExampleSchedulingRepository — disponibilidade", () => {
  it("o usuário demo já tem a grade do protótipo e o limite de 3h", async () => {
    const { availability } = await demo().getAvailability();
    expect(availability.dailyLimitMinutes).toBe(180);
    expect(availability.windows).toContainEqual({ weekday: 0, startMinute: 1200, endMinute: 1380 });
    expect(availability.windows).toContainEqual({ weekday: 5, startMinute: 540, endMinute: 720 });
    expect(availability.windows).toContainEqual({ weekday: 6, startMinute: 840, endMinute: 1020 });
  });

  it("usuário novo (sem onboarding) responde 404 (P12)", async () => {
    const repo = fresh();
    await expect(repo.getAvailability()).rejects.toMatchObject({ statusCode: 404 });
  });

  it("salvar devolve a disponibilidade e um resumo de plano", async () => {
    const repo = fresh();
    const res = await repo.setAvailability({
      windows: [{ weekday: 0, startMinute: 1140, endMinute: 1380 }],
      dailyLimitMinutes: 120,
    });
    expect(res.availability.dailyLimitMinutes).toBe(120);
    expect(res.plan).toHaveProperty("totalMinutes");
    expect((await repo.getAvailability()).availability.windows).toHaveLength(1);
  });

  it("zero janelas responde 422", async () => {
    const repo = fresh();
    await expect(repo.setAvailability({ windows: [], dailyLimitMinutes: 180 })).rejects.toMatchObject({ statusCode: 422 });
  });

  it("limite fora de 60–480 ou não múltiplo de 30 responde 422 (P7)", async () => {
    const repo = fresh();
    const w = [{ weekday: 0, startMinute: 1140, endMinute: 1380 }];
    await expect(repo.setAvailability({ windows: w, dailyLimitMinutes: 25 })).rejects.toMatchObject({ statusCode: 422 });
    await expect(repo.setAvailability({ windows: w, dailyLimitMinutes: 45 })).rejects.toMatchObject({ statusCode: 422 });
  });
});

describe("ExampleSchedulingRepository — plano", () => {
  it("o dia 16/11 tem os 3 blocos do protótipo em ordem, 3h de 3h", async () => {
    const day = await demo().getDayPlan("2026-11-16");
    expect(day.date).toBe("2026-11-16");
    expect(day.blocks.map((b) => b.stepTitle)).toEqual([
      "Diagrama de casos de uso",
      "Lista de integrais por partes",
      "Escrever o case do app",
    ]);
    expect(day.blocks[0]).toMatchObject({
      start: "2026-11-16T23:00:00.000Z",
      end: "2026-11-17T00:30:00.000Z",
      status: "planned",
      goalTitle: "Trabalho de Eng. Software",
      colorIndex: 1,
    });
    expect(day.usedMinutes).toBe(180);
    expect(day.limitMinutes).toBe(180);
  });

  it("dia sem blocos devolve blocks vazio", async () => {
    const day = await demo().getDayPlan("2026-11-22");
    expect(day.blocks).toEqual([]);
    expect(day.usedMinutes).toBe(0);
  });

  it("data inválida responde 400", async () => {
    await expect(demo().getDayPlan("xyz")).rejects.toMatchObject({ statusCode: 400 });
  });

  it("a semana de 16/11 tem 7 dias com a carga do protótipo", async () => {
    const week = await demo().getWeekPlan("2026-11-16");
    expect(week.days.map((d) => d.date)).toEqual([
      "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22",
    ]);
    expect(week.days.map((d) => d.usedMinutes)).toEqual([180, 180, 180, 180, 165, 75, 0]);
  });

  it("semana que não começa na segunda responde 400", async () => {
    await expect(demo().getWeekPlan("2026-11-18")).rejects.toMatchObject({ statusCode: 400 });
  });

});
