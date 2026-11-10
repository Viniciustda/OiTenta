import { ValidationException } from "@oitenta/shared";
import { FocusSession, RecordFocusSession, RecordFocusSessionIn } from "../../../src";
import { FakeFocusSessionRepository } from "../../mock";

const USER_A = "2f9c1b6e-8a4d-4c3e-9b1a-1d2e3f4a5b6c";
const USER_B = "6dbab5fa-ce8b-4a7c-bf5e-5b6c7d8e9fa0";
const GOAL_ID = "3a8d2c7f-9b5e-4d4f-8c2b-2e3f4a5b6c7d";
const STEP_ID = "4b9e3d8a-ac6f-4e5a-9d3c-3f4a5b6c7d8e";
const BLOCK_ID = "5cafa4e9-bd7a-4f6b-ae4d-4a5b6c7d8e9f";

function makeInput(
  overrides: Partial<RecordFocusSessionIn> = {},
): RecordFocusSessionIn {
  return {
    userId: USER_A,
    goalId: GOAL_ID,
    stepId: STEP_ID,
    blockId: BLOCK_ID,
    energy: "high",
    availableTime: "30m",
    startedAt: new Date("2026-11-10T13:00:00.000Z"),
    endedAt: new Date("2026-11-10T13:25:00.000Z"),
    focusedMinutes: 25,
    outcome: "done",
    ...overrides,
  };
}

function makeSut() {
  const repository = new FakeFocusSessionRepository();
  const useCase = new RecordFocusSession(repository);
  return { repository, useCase };
}

describe("RecordFocusSession", () => {
  // Cenario 1
  test("dado uma sessao done de 25 min, grava com o userId", async () => {
    const { repository, useCase } = makeSut();
    const validateSpy = jest.spyOn(FocusSession.prototype, "validate");

    const output = await useCase.execute(makeInput());

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(repository.sessions).toHaveLength(1);
    expect(repository.sessions[0]).toBe(output.session);
    expect(output.session.userId).toBe(USER_A);
    expect(output.session.goalId).toBe(GOAL_ID);
    expect(output.session.stepId).toBe(STEP_ID);
    expect(output.session.blockId).toBe(BLOCK_ID);
    expect(output.session.energy).toBe("high");
    expect(output.session.availableTime).toBe("30m");
    expect(output.session.focusedMinutes).toBe(25);
    expect(output.session.outcome).toBe("done");
    expect(output.session.partialPct).toBeNull();

    validateSpy.mockRestore();
  });

  // Cenario 2
  test("dado partial com 70, grava partialPct = 70", async () => {
    const { repository, useCase } = makeSut();

    const output = await useCase.execute(
      makeInput({ outcome: "partial", partialPct: 70 }),
    );

    expect(output.session.partialPct).toBe(70);
    expect(repository.sessions[0].partialPct).toBe(70);
  });

  test("sem blockId e availableTime (web), grava ambos como null", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute(
      makeInput({ blockId: undefined, availableTime: undefined }),
    );

    expect(output.session.blockId).toBeNull();
    expect(output.session.availableTime).toBeNull();
  });

  // Cenario 3
  test("dado partial sem %, lanca ValidationException e nao grava", async () => {
    const { repository, useCase } = makeSut();

    await expect(
      useCase.execute(makeInput({ outcome: "partial" })),
    ).rejects.toThrow(ValidationException);

    expect(repository.sessions).toEqual([]);
  });

  // Cenario 4 (posse)
  test("dado o userId A na entrada, a sessao gravada e de A e nao aparece para B", async () => {
    const { repository, useCase } = makeSut();

    await useCase.execute(makeInput({ userId: USER_A }));

    const deA = await repository.findAllByUserAndStep(USER_A, STEP_ID);
    const deB = await repository.findAllByUserAndStep(USER_B, STEP_ID);

    expect(deA.map((session) => session.userId)).toEqual([USER_A]);
    expect(deB).toEqual([]);
  });
});
