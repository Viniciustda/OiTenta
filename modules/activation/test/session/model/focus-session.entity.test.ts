import { ValidationException } from "@oitenta/shared";
import { FocusSession, FocusSessionState } from "../../../src";

const USER_ID = "2f9c1b6e-8a4d-4c3e-9b1a-1d2e3f4a5b6c";
const GOAL_ID = "3a8d2c7f-9b5e-4d4f-8c2b-2e3f4a5b6c7d";
const STEP_ID = "4b9e3d8a-ac6f-4e5a-9d3c-3f4a5b6c7d8e";
const BLOCK_ID = "5cafa4e9-bd7a-4f6b-ae4d-4a5b6c7d8e9f";

function makeState(
  overrides: Partial<FocusSessionState> = {},
): FocusSessionState {
  return {
    userId: USER_ID,
    goalId: GOAL_ID,
    stepId: STEP_ID,
    blockId: BLOCK_ID,
    energy: "high",
    availableTime: "30m",
    startedAt: new Date("2026-11-10T13:00:00.000Z"),
    endedAt: new Date("2026-11-10T13:25:00.000Z"),
    focusedMinutes: 25,
    outcome: "done",
    partialPct: null,
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

describe("FocusSession", () => {
  test("deve criar sessao valida e expor os getters", () => {
    const session = new FocusSession(makeState());

    expect(session.userId).toBe(USER_ID);
    expect(session.goalId).toBe(GOAL_ID);
    expect(session.stepId).toBe(STEP_ID);
    expect(session.blockId).toBe(BLOCK_ID);
    expect(session.energy).toBe("high");
    expect(session.availableTime).toBe("30m");
    expect(session.startedAt).toEqual(new Date("2026-11-10T13:00:00.000Z"));
    expect(session.endedAt).toEqual(new Date("2026-11-10T13:25:00.000Z"));
    expect(session.focusedMinutes).toBe(25);
    expect(session.outcome).toBe("done");
    expect(session.partialPct).toBeNull();
    expect(session.id).toEqual(expect.any(String));
    expect(session.createdAt).toBeInstanceOf(Date);
    expect(session.updatedAt).toBeInstanceOf(Date);
    expect(session.deletedAt).toBeNull();
  });

  // Cenario 5
  test("dado uma sessao valida, entao validate passa", () => {
    const session = new FocusSession(makeState());

    expect(() => session.validate()).not.toThrow();
  });

  test("deve aceitar blockId e availableTime nulos (web, sem bloco)", () => {
    const session = new FocusSession(
      makeState({ blockId: null, availableTime: null }),
    );

    expect(() => session.validate()).not.toThrow();
  });

  test("deve aceitar partial com partialPct nos limites 1 e 99", () => {
    const min = new FocusSession(makeState({ outcome: "partial", partialPct: 1 }));
    const max = new FocusSession(makeState({ outcome: "partial", partialPct: 99 }));

    expect(() => min.validate()).not.toThrow();
    expect(() => max.validate()).not.toThrow();
  });

  test("deve aceitar not_done sem partialPct e focusedMinutes zero", () => {
    const session = new FocusSession(
      makeState({ outcome: "not_done", focusedMinutes: 0 }),
    );

    expect(() => session.validate()).not.toThrow();
  });

  test("deve aceitar endedAt igual a startedAt", () => {
    const at = new Date("2026-11-10T13:00:00.000Z");
    const session = new FocusSession(makeState({ startedAt: at, endedAt: at }));

    expect(() => session.validate()).not.toThrow();
  });

  test("deve permitir existir invalida ate chamar validate (validacao lazy)", () => {
    const session = new FocusSession(makeState({ focusedMinutes: -1 }));

    expect(session.focusedMinutes).toBe(-1);
    expect(() => session.validate()).toThrow(ValidationException);
  });

  // Cenario 1
  test("dado outcome partial sem partialPct, entao ValidationException", () => {
    const session = new FocusSession(
      makeState({ outcome: "partial", partialPct: null }),
    );

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.partialPct.required",
    ]);
  });

  test("dado outcome partial com partialPct fora de 1..99, entao erro", () => {
    const zero = new FocusSession(makeState({ outcome: "partial", partialPct: 0 }));
    const cem = new FocusSession(makeState({ outcome: "partial", partialPct: 100 }));
    const fracao = new FocusSession(
      makeState({ outcome: "partial", partialPct: 70.5 }),
    );

    expect(getValidationMessages(() => zero.validate())).toEqual([
      "focusSession.partialPct.range.value",
    ]);
    expect(getValidationMessages(() => cem.validate())).toEqual([
      "focusSession.partialPct.range.value",
    ]);
    expect(getValidationMessages(() => fracao.validate())).toEqual([
      "focusSession.partialPct.integer",
    ]);
  });

  // Cenario 2
  test("dado outcome done com partialPct, entao erro", () => {
    const session = new FocusSession(
      makeState({ outcome: "done", partialPct: 70 }),
    );

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.partialPct.equals",
    ]);
  });

  // Cenario 3
  test("dado endedAt < startedAt, entao erro", () => {
    const session = new FocusSession(
      makeState({
        startedAt: new Date("2026-11-10T13:25:00.000Z"),
        endedAt: new Date("2026-11-10T13:00:00.000Z"),
      }),
    );

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.endedAt.min.date",
    ]);
  });

  // Cenario 4
  test("dado focusedMinutes negativo, entao erro", () => {
    const session = new FocusSession(makeState({ focusedMinutes: -5 }));

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.focusedMinutes.min.value",
    ]);
  });

  test("dado focusedMinutes fracionado, entao erro", () => {
    const session = new FocusSession(makeState({ focusedMinutes: 2.5 }));

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.focusedMinutes.integer",
    ]);
  });

  test("deve acusar ids invalidos, energia, tempo e outcome fora do catalogo", () => {
    const session = new FocusSession(
      makeState({
        userId: "x",
        goalId: "y",
        stepId: "z",
        blockId: "w",
        energy: "sleepy" as never,
        availableTime: "3h" as never,
        outcome: "maybe" as never,
      }),
    );

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.userId.uuid",
      "focusSession.goalId.uuid",
      "focusSession.stepId.uuid",
      "focusSession.blockId.uuid",
      "focusSession.energy.in",
      "focusSession.availableTime.in",
      "focusSession.outcome.in",
    ]);
  });

  test("deve acusar os campos obrigatorios vazios", () => {
    const session = new FocusSession(
      makeState({
        userId: "",
        goalId: "",
        stepId: "",
        energy: "" as never,
        startedAt: null as never,
        endedAt: null as never,
        focusedMinutes: null as never,
        outcome: "" as never,
      }),
    );

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.userId.required",
      "focusSession.goalId.required",
      "focusSession.stepId.required",
      "focusSession.energy.required",
      "focusSession.startedAt.required",
      "focusSession.endedAt.required",
      "focusSession.focusedMinutes.required",
      "focusSession.outcome.required",
    ]);
  });

  test("deve acusar datas invalidas", () => {
    const session = new FocusSession(
      makeState({
        startedAt: new Date("invalida"),
        endedAt: new Date("invalida"),
      }),
    );

    expect(getValidationMessages(() => session.validate())).toEqual([
      "focusSession.startedAt.invalid.date",
      "focusSession.endedAt.invalid.date",
      "focusSession.endedAt.min.date",
    ]);
  });

  test("deve clonar mantendo o id e alterando so o informado", () => {
    const session = new FocusSession(makeState());
    const clone = session.clone({ focusedMinutes: 10 });

    expect(clone.id).toBe(session.id);
    expect(clone.focusedMinutes).toBe(10);
    expect(clone.userId).toBe(USER_ID);
  });
});
