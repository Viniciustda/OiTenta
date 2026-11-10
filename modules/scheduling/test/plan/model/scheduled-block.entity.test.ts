import { ValidationException } from "@oitenta/shared";
import { ScheduledBlock, ScheduledBlockState } from "../../../src";
import { GOAL_1, stepId, USER_A } from "../../mock";

function makeState(overrides: Partial<ScheduledBlockState> = {}): ScheduledBlockState {
  return {
    userId: USER_A,
    goalId: GOAL_1,
    stepId: stepId(1),
    start: new Date("2026-11-10T22:00:00.000Z"),
    end: new Date("2026-11-10T23:00:00.000Z"),
    status: "planned",
    pinned: false,
    origin: "auto",
    ...overrides,
  };
}

function getValidationMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("ScheduledBlock", () => {
  test("deve expor os getters e a duracao", () => {
    const block = new ScheduledBlock(makeState());

    expect(block.userId).toBe(USER_A);
    expect(block.goalId).toBe(GOAL_1);
    expect(block.stepId).toBe(stepId(1));
    expect(block.start.toISOString()).toBe("2026-11-10T22:00:00.000Z");
    expect(block.end.toISOString()).toBe("2026-11-10T23:00:00.000Z");
    expect(block.status).toBe("planned");
    expect(block.pinned).toBe(false);
    expect(block.origin).toBe("auto");
    expect(block.durationMinutes).toBe(60);
  });

  test("cenario 3: bloco valido passa no validate", () => {
    expect(() => new ScheduledBlock(makeState()).validate()).not.toThrow();
  });

  test("cenario 1: end <= start gera erro", () => {
    const same = new ScheduledBlock(
      makeState({ end: new Date("2026-11-10T22:00:00.000Z") }),
    );
    const before = new ScheduledBlock(
      makeState({ end: new Date("2026-11-10T21:00:00.000Z") }),
    );

    expect(getValidationMessages(() => same.validate())).toEqual([
      "scheduledBlock.end.invalid.range",
    ]);
    expect(getValidationMessages(() => before.validate())).toEqual([
      "scheduledBlock.end.invalid.range",
    ]);
  });

  test("cenario 2: duracao que nao e multipla de 15 gera erro", () => {
    const block = new ScheduledBlock(
      makeState({ end: new Date("2026-11-10T22:40:00.000Z") }),
    );

    expect(getValidationMessages(() => block.validate())).toEqual([
      "scheduledBlock.durationMinutes.multiple.of",
    ]);
  });

  test("deve permitir existir invalido ate chamar validate (lazy)", () => {
    const block = new ScheduledBlock(makeState({ goalId: "" }));

    expect(block.goalId).toBe("");
    expect(() => block.validate()).toThrow(ValidationException);
  });

  test("deve rejeitar ids invalidos, datas invalidas, status e origem fora da lista", () => {
    const block = new ScheduledBlock(
      makeState({
        userId: "x",
        goalId: "",
        stepId: "y",
        start: new Date("invalid"),
        status: "late" as unknown as "planned",
        origin: "ai" as unknown as "auto",
      }),
    );

    expect(getValidationMessages(() => block.validate())).toEqual([
      "scheduledBlock.userId.uuid",
      "scheduledBlock.goalId.required",
      "scheduledBlock.stepId.uuid",
      "scheduledBlock.start.invalid.date",
      "scheduledBlock.status.in",
      "scheduledBlock.origin.in",
    ]);
  });

  test("deve rejeitar pinned que nao e booleano", () => {
    const block = new ScheduledBlock(
      makeState({ pinned: "sim" as unknown as boolean }),
    );

    expect(getValidationMessages(() => block.validate())).toEqual([
      "scheduledBlock.pinned.in",
    ]);
  });

  test("clone troca o status e preserva o resto", () => {
    const block = new ScheduledBlock(makeState());
    const done = block.clone({ status: "done" });

    expect(done.id).toBe(block.id);
    expect(done.status).toBe("done");
    expect(done.start).toEqual(block.start);
    expect(block.status).toBe("planned");
  });
});
