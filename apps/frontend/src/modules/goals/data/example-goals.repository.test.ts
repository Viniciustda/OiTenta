import { describe, expect, it } from "vitest";
import { ExampleBackend } from "@/modules/core/data/example-backend";
import { ExampleGoalsRepository } from "./example-goals.repository";

const demo = () => new ExampleGoalsRepository(new ExampleBackend());

describe("ExampleGoalsRepository — GET /goals", () => {
  it("lista os 3 objetivos do protótipo com %, folga e contagem de etapas", async () => {
    const { goals } = await demo().list();
    expect(goals.map((g) => [g.title, g.progressPct, g.slackDays, g.done, g.total, g.colorIndex, g.deadline])).toEqual([
      ["Trabalho de Eng. Software", 62, 2, 4, 7, 1, "2026-11-20"],
      ["Prova de Cálculo II", 25, 6, 3, 10, 2, "2026-11-27"],
      ["Portfólio", 20, 14, 1, 6, 3, "2026-12-05"],
    ]);
    expect(goals[0].status).toBe("active");
  });
});

describe("ExampleGoalsRepository — GET /goals/:goalId", () => {
  it("devolve a trilha com as etapas em ordem e o próximo bloco das pendentes", async () => {
    const repo = demo();
    const { goals } = await repo.list();
    const res = await repo.get(goals[0].id);
    expect(res.goal.title).toBe("Trabalho de Eng. Software");
    expect(res.progressPct).toBe(62);
    expect(res.done).toBe(4);
    expect(res.total).toBe(7);
    expect(res.steps.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(res.steps[0]).toMatchObject({ title: "Definir escopo", estimatedMinutes: 45, progressPct: 100, status: "done", remainingMinutes: 0 });
    expect(res.steps[0].nextBlock).toBeUndefined();
    expect(res.steps[4]).toMatchObject({ title: "Diagrama de casos de uso", status: "pending", remainingMinutes: 90 });
    expect(res.steps[4].nextBlock).toMatchObject({ start: "2026-11-16T23:00:00.000Z" });
  });

  it("objetivo inexistente responde 404", async () => {
    await expect(demo().get("nao-existe")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("ExampleGoalsRepository — POST /goals", () => {
  const steps = [
    { title: "Ler o enunciado", estimatedMinutes: 30, microSteps: [] },
    { title: "Implementar", estimatedMinutes: 90, microSteps: [] },
  ];

  it("cria o objetivo manual com a próxima cor (P4) e devolve o resumo do plano", async () => {
    const repo = demo();
    const res = await repo.create({ title: "Trabalho de Algoritmos", deadline: "2026-11-24", kind: "goal", steps });
    expect(res.goal).toMatchObject({ title: "Trabalho de Algoritmos", deadline: "2026-11-24", colorIndex: 4, progressPct: 0 });
    expect(res.goal.steps).toHaveLength(2);
    expect(res.plan.totalMinutes).toBe(120);
    expect((await repo.list()).goals).toHaveLength(4);
  });

  it("aceita objetivo sem prazo (P3)", async () => {
    const res = await demo().create({ title: "Sem prazo", deadline: null, kind: "goal", steps });
    expect(res.goal.deadline).toBeNull();
  });

  it("zero etapas responde 422", async () => {
    await expect(demo().create({ title: "X", deadline: null, kind: "goal", steps: [] })).rejects.toMatchObject({ statusCode: 422 });
  });

  it("título vazio responde 422", async () => {
    await expect(demo().create({ title: "  ", deadline: null, kind: "goal", steps })).rejects.toMatchObject({ statusCode: 422 });
  });

  it("estimativa que não é múltiplo de 15 responde 422 (P5)", async () => {
    await expect(
      demo().create({ title: "X", deadline: null, kind: "goal", steps: [{ title: "a", estimatedMinutes: 20, microSteps: [] }] }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("usuário sem disponibilidade responde 404 (P12)", async () => {
    const repo = new ExampleGoalsRepository(new ExampleBackend({ withDemoData: false }));
    await expect(repo.create({ title: "X", deadline: null, kind: "goal", steps })).rejects.toMatchObject({ statusCode: 404 });
  });
});
