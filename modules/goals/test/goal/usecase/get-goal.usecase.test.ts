import { NotFoundError } from "@oitenta/shared";
import { GetGoal } from "../../../src";
import { buildGoal, FakeGoalRepository } from "../../mock";

const USER_A = "3b241101-e2bb-4255-8caf-4136c566a962";
const USER_B = "0b8f9e2a-3f4b-4c1d-9e8f-7a6b5c4d3e2f";

describe("GetGoal", () => {
  test("cenario 1: o dono recebe as etapas com remainingMinutes", async () => {
    const goal = buildGoal({
      userId: USER_A,
      steps: [
        { estimatedMinutes: 30, progressPct: 100 },
        { estimatedMinutes: 45, progressPct: 50, microSteps: ["Abrir o PDF"] },
        { estimatedMinutes: 45 },
      ],
    });
    const useCase = new GetGoal(new FakeGoalRepository([goal]));

    const output = await useCase.execute({ userId: USER_A, goalId: goal.id });

    expect(output.goal).toEqual({
      id: goal.id,
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      kind: "goal",
      colorIndex: 1,
      source: "manual",
      status: "active",
    });
    expect(output.steps.map((step) => step.remainingMinutes)).toEqual([0, 30, 45]);
    expect(output.steps[1]).toEqual({
      id: goal.steps[1].id,
      order: 2,
      title: "Etapa 2",
      estimatedMinutes: 45,
      aiEstimatedMinutes: null,
      progressPct: 50,
      status: "pending",
      microSteps: ["Abrir o PDF"],
      remainingMinutes: 30,
    });
    // (30*100 + 45*50) / 120 = 43,75
    expect(output.progressPct).toBe(44);
    expect(output.done).toBe(1);
    expect(output.total).toBe(3);
  });

  test("deve devolver as etapas ordenadas por order", async () => {
    const built = buildGoal({ userId: USER_A, steps: [{}, {}] });
    const goal = built.clone({ steps: [...built.steps].reverse() });
    const useCase = new GetGoal(new FakeGoalRepository([goal]));

    const output = await useCase.execute({ userId: USER_A, goalId: goal.id });

    expect(output.steps.map((step) => step.order)).toEqual([1, 2]);
  });

  test("cenario 2 (posse): B pede o objetivo de A -> NotFoundError", async () => {
    const goal = buildGoal({ userId: USER_A });
    const useCase = new GetGoal(new FakeGoalRepository([goal]));

    await expect(useCase.execute({ userId: USER_B, goalId: goal.id })).rejects.toThrow(
      NotFoundError,
    );
  });

  test("cenario 3: goalId inexistente -> NotFoundError", async () => {
    const useCase = new GetGoal(new FakeGoalRepository([buildGoal({ userId: USER_A })]));

    await expect(
      useCase.execute({ userId: USER_A, goalId: "9d2c1b4a-5e6f-4a7b-8c9d-0e1f2a3b4c5d" }),
    ).rejects.toThrow(NotFoundError);
  });
});
