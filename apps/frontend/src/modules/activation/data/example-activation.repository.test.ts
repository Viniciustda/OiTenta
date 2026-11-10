import { describe, expect, it } from "vitest";
import { ExampleBackend } from "@/modules/core/data/example-backend";
import { ExampleGoalsRepository } from "@/modules/goals/data/example-goals.repository";
import { ExampleSchedulingRepository } from "@/modules/scheduling/data/example-scheduling.repository";
import { GENERIC_MICRO_STEP } from "./example-activation.repository";
import { ExampleActivationRepository } from "./example-activation.repository";

async function setup() {
  const backend = new ExampleBackend();
  const goals = new ExampleGoalsRepository(backend);
  const scheduling = new ExampleSchedulingRepository(backend);
  const activation = new ExampleActivationRepository(backend);
  const [block] = (await scheduling.getDayPlan("2026-11-16")).blocks;
  return { backend, goals, scheduling, activation, block };
}

describe("ExampleActivationRepository — GET /activation/ramp", () => {
  it.each([
    ["low", "warmup"],
    ["medium", "challenge"],
    ["high", "micro"],
    ["electric", "focus"],
  ] as const)("energia %s sugere o degrau %s (P14)", async (energy, suggested) => {
    const { activation, block } = await setup();
    const ramp = await activation.getRamp({ goalId: block.goalId, stepId: block.stepId, energy });
    expect(ramp.suggested).toBe(suggested);
  });

  it("devolve os 5 degraus em ordem; o Registrar não tem opções", async () => {
    const { activation, block } = await setup();
    const ramp = await activation.getRamp({ goalId: block.goalId, stepId: block.stepId, energy: "medium" });
    expect(ramp.steps.map((s) => s.kind)).toEqual(["warmup", "challenge", "micro", "focus", "log"]);
    expect(ramp.steps[4].options).toEqual([]);
    expect(ramp.steps[0].options[0]).toMatchObject({
      title: "Levanta, bebe uma água e abre o material de Eng. Software.",
      durationSeconds: 180,
      durationLabel: "3 min",
    });
    expect(ramp.steps[0].options[1].title).toBe("Arruma a mesa e deixa só o que vai usar.");
    expect(ramp.steps[3].options[0]).toMatchObject({ durationSeconds: 1500, durationLabel: "25 min" });
  });

  it("o micro-passo usa os micro-passos da etapa", async () => {
    const { activation, block } = await setup();
    const ramp = await activation.getRamp({ goalId: block.goalId, stepId: block.stepId, energy: "medium" });
    expect(ramp.steps[2].options[0].title).toBe("Abra o arquivo e escreva só o título: “Diagrama de casos de uso”.");
  });

  it("etapa sem micro-passos usa o texto genérico (P6)", async () => {
    const { activation, goals } = await setup();
    const { goal } = await goals.create({
      title: "Manual", deadline: null, kind: "goal",
      steps: [{ title: "Única", estimatedMinutes: 30, microSteps: [] }],
    });
    const ramp = await activation.getRamp({ goalId: goal.id, stepId: goal.steps[0].id, energy: "low" });
    expect(ramp.steps[2].options).toHaveLength(1);
    expect(ramp.steps[2].options[0].title).toBe(GENERIC_MICRO_STEP);
  });

  it("etapa inexistente responde 404", async () => {
    const { activation, block } = await setup();
    await expect(activation.getRamp({ goalId: block.goalId, stepId: "x", energy: "low" })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("ExampleActivationRepository — POST /activation/sessions", () => {
  const base = { energy: "medium" as const, availableTime: null, startedAt: "2026-11-16T22:40:00.000Z", endedAt: "2026-11-16T23:10:00.000Z", focusedMinutes: 25 };

  it("concluí leva a etapa a 100%, o objetivo a 81% e o bloco a done", async () => {
    const { activation, scheduling, block } = await setup();
    const res = await activation.recordSession({ ...base, goalId: block.goalId, stepId: block.stepId, blockId: block.id, outcome: "done", partialPct: null });
    expect(res.step).toEqual({ progressPct: 100, status: "done" });
    expect(res.goalProgressPct).toBe(81);
    expect(res.session).toMatchObject({ outcome: "done", focusedMinutes: 25 });
    expect((await scheduling.getDayPlan("2026-11-16")).blocks[0].status).toBe("done");
  });

  it("parcial 70 leva a etapa a 70% e o bloco a partial", async () => {
    const { activation, scheduling, block } = await setup();
    const res = await activation.recordSession({ ...base, goalId: block.goalId, stepId: block.stepId, blockId: block.id, outcome: "partial", partialPct: 70 });
    expect(res.step).toEqual({ progressPct: 70, status: "pending" });
    expect((await scheduling.getDayPlan("2026-11-16")).blocks[0].status).toBe("partial");
  });

  it("não rolou não muda o % e marca o bloco como missed", async () => {
    const { activation, scheduling, goals, block } = await setup();
    const res = await activation.recordSession({ ...base, goalId: block.goalId, stepId: block.stepId, blockId: block.id, outcome: "not_done", partialPct: null });
    expect(res.goalProgressPct).toBe(62);
    expect((await goals.get(block.goalId)).steps[4].progressPct).toBe(0);
    expect((await scheduling.getDayPlan("2026-11-16")).blocks[0].status).toBe("missed");
  });

  it("parcial sem % responde 422", async () => {
    const { activation, block } = await setup();
    await expect(
      activation.recordSession({ ...base, goalId: block.goalId, stepId: block.stepId, blockId: block.id, outcome: "partial", partialPct: null }),
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});
