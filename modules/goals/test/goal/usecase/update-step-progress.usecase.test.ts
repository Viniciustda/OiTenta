import { NotFoundError, ValidationException } from "@oitenta/shared";
import { Goal, UpdateStepProgress } from "../../../src";
import { buildGoal, FakeGoalRepository } from "../../mock";

const USER_A = "3b241101-e2bb-4255-8caf-4136c566a962";
const USER_B = "0b8f9e2a-3f4b-4c1d-9e8f-7a6b5c4d3e2f";

function makeSut(goals: Goal[]) {
  const goalRepository = new FakeGoalRepository(goals);
  const useCase = new UpdateStepProgress(goalRepository);
  return { goalRepository, useCase };
}

describe("UpdateStepProgress", () => {
  test("cenario 1: etapa a 0% vai a 50 e o objetivo recalcula o %", async () => {
    const goal = buildGoal({ userId: USER_A, steps: [{}, {}] });
    const { goalRepository, useCase } = makeSut([goal]);

    const output = await useCase.execute({
      userId: USER_A,
      goalId: goal.id,
      stepId: goal.steps[0].id,
      progressPct: 50,
    });

    const saved = (await goalRepository.findById(USER_A, goal.id))!;
    expect(saved.steps[0].progressPct).toBe(50);
    expect(saved.steps[0].status).toBe("pending");
    expect(saved.status).toBe("active");
    expect(output.goalProgressPct).toBe(25);
    expect(output.step).toMatchObject({
      id: goal.steps[0].id,
      progressPct: 50,
      status: "pending",
      remainingMinutes: 30,
    });
    expect(goalRepository.updateCalls).toBe(1);
  });

  test("cenario 2: ultima etapa pendente a 100 -> etapa done e objetivo done", async () => {
    const goal = buildGoal({ userId: USER_A, steps: [{ progressPct: 100 }, {}] });
    const { goalRepository, useCase } = makeSut([goal]);

    const output = await useCase.execute({
      userId: USER_A,
      goalId: goal.id,
      stepId: goal.steps[1].id,
      progressPct: 100,
    });

    const saved = (await goalRepository.findById(USER_A, goal.id))!;
    expect(saved.steps[1].status).toBe("done");
    expect(saved.status).toBe("done");
    expect(output.goalProgressPct).toBe(100);
    expect(output.step.status).toBe("done");
  });

  test("cenario 3: progressPct 120 -> ValidationException e nao grava", async () => {
    const goal = buildGoal({ userId: USER_A });
    const { goalRepository, useCase } = makeSut([goal]);

    await expect(
      useCase.execute({
        userId: USER_A,
        goalId: goal.id,
        stepId: goal.steps[0].id,
        progressPct: 120,
      }),
    ).rejects.toThrow(ValidationException);
    expect(goalRepository.updateCalls).toBe(0);
    expect(goalRepository.goals[0].steps[0].progressPct).toBe(0);
  });

  test("cenario 4 (posse): B tenta atualizar o objetivo de A -> NotFoundError e nao grava", async () => {
    const goal = buildGoal({ userId: USER_A });
    const { goalRepository, useCase } = makeSut([goal]);

    await expect(
      useCase.execute({
        userId: USER_B,
        goalId: goal.id,
        stepId: goal.steps[0].id,
        progressPct: 50,
      }),
    ).rejects.toThrow(NotFoundError);
    expect(goalRepository.updateCalls).toBe(0);
    expect(goalRepository.goals[0].steps[0].progressPct).toBe(0);
  });

  test("cenario 5: stepId que nao e do objetivo -> NotFoundError", async () => {
    const goal = buildGoal({ userId: USER_A });
    const other = buildGoal({ userId: USER_A });
    const { goalRepository, useCase } = makeSut([goal, other]);

    await expect(
      useCase.execute({
        userId: USER_A,
        goalId: goal.id,
        stepId: other.steps[0].id,
        progressPct: 50,
      }),
    ).rejects.toThrow(NotFoundError);
    expect(goalRepository.updateCalls).toBe(0);
  });

  test("cenario 6: etapa superseded -> ValidationException e nao grava", async () => {
    const goal = buildGoal({
      userId: USER_A,
      steps: [{ progressPct: 50, status: "superseded" }, {}],
    });
    const { goalRepository, useCase } = makeSut([goal]);

    await expect(
      useCase.execute({
        userId: USER_A,
        goalId: goal.id,
        stepId: goal.steps[0].id,
        progressPct: 80,
      }),
    ).rejects.toThrow(ValidationException);
    expect(goalRepository.updateCalls).toBe(0);
  });
});
