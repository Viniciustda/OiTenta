import { ValidationException } from "@oitenta/shared";
import { Commitment, CommitmentState } from "../../../src";
import { USER_A } from "../../mock";

function makeState(overrides: Partial<CommitmentState> = {}): CommitmentState {
  return {
    userId: USER_A,
    title: "Aula",
    kind: "commitment",
    startDate: "2025-11-03",
    startMinute: 8 * 60,
    durationMinutes: 240,
    recurrence: { weekdays: [0, 1, 2, 3, 4] },
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

describe("Commitment", () => {
  test("deve expor os getters", () => {
    const commitment = new Commitment(makeState());

    expect(commitment.userId).toBe(USER_A);
    expect(commitment.title).toBe("Aula");
    expect(commitment.kind).toBe("commitment");
    expect(commitment.startDate).toBe("2025-11-03");
    expect(commitment.startMinute).toBe(480);
    expect(commitment.durationMinutes).toBe(240);
    expect(commitment.recurrence).toEqual({ weekdays: [0, 1, 2, 3, 4] });
  });

  test("compromisso recorrente valido passa no validate", () => {
    expect(() => new Commitment(makeState()).validate()).not.toThrow();
  });

  test("evento unico (sem recorrencia) valido passa no validate", () => {
    const commitment = new Commitment(makeState({ recurrence: null }));

    expect(() => commitment.validate()).not.toThrow();
  });

  test("recorrencia com endDate igual ou depois do inicio e valida", () => {
    const commitment = new Commitment(
      makeState({ recurrence: { weekdays: [0], endDate: "2025-11-03" } }),
    );

    expect(() => commitment.validate()).not.toThrow();
  });

  test("deve permitir existir invalido ate chamar validate (lazy)", () => {
    const commitment = new Commitment(makeState({ title: "" }));

    expect(commitment.title).toBe("");
    expect(() => commitment.validate()).toThrow(ValidationException);
  });

  test("deve acusar campos obrigatorios vazios", () => {
    const commitment = new Commitment(
      makeState({ userId: "", title: " ", startDate: "" }),
    );

    expect(getValidationMessages(() => commitment.validate())).toEqual([
      "commitment.userId.required",
      "commitment.title.required",
      "commitment.startDate.required",
    ]);
  });

  test("deve rejeitar kind diferente de commitment", () => {
    const commitment = new Commitment(
      makeState({ kind: "task" as unknown as "commitment" }),
    );

    expect(getValidationMessages(() => commitment.validate())).toEqual([
      "commitment.kind.in",
    ]);
  });

  test("deve rejeitar startDate que nao e data local YYYY-MM-DD", () => {
    const commitment = new Commitment(makeState({ startDate: "2025-11-03T08:00" }));

    expect(getValidationMessages(() => commitment.validate())).toEqual([
      "commitment.startDate.local.date",
    ]);
  });

  test("deve rejeitar data inexistente", () => {
    const commitment = new Commitment(makeState({ startDate: "2025-02-30" }));

    expect(getValidationMessages(() => commitment.validate())).toEqual([
      "commitment.startDate.local.date",
    ]);
  });

  test("deve rejeitar minutos e duracao fora de multiplos de 15", () => {
    const commitment = new Commitment(
      makeState({ startMinute: 485, durationMinutes: 50 }),
    );

    expect(getValidationMessages(() => commitment.validate())).toEqual([
      "commitment.startMinute.multiple.of",
      "commitment.durationMinutes.multiple.of",
    ]);
  });

  test("deve rejeitar duracao zero e inicio fora do dia", () => {
    const commitment = new Commitment(
      makeState({ startMinute: 1440, durationMinutes: 0 }),
    );

    expect(getValidationMessages(() => commitment.validate())).toEqual([
      "commitment.startMinute.range.value",
      "commitment.durationMinutes.positive",
    ]);
  });

  test("deve rejeitar recorrencia sem dias, com dia invalido ou repetido", () => {
    const empty = new Commitment(makeState({ recurrence: { weekdays: [] } }));
    const invalid = new Commitment(makeState({ recurrence: { weekdays: [0, 7] } }));
    const repeated = new Commitment(makeState({ recurrence: { weekdays: [1, 1] } }));

    expect(getValidationMessages(() => empty.validate())).toEqual([
      "commitment.recurrence.weekdays.required",
    ]);
    expect(getValidationMessages(() => invalid.validate())).toEqual([
      "commitment.recurrence.weekdays.range.value",
    ]);
    expect(getValidationMessages(() => repeated.validate())).toEqual([
      "commitment.recurrence.weekdays.unique.items",
    ]);
  });

  test("deve rejeitar endDate antes do inicio ou invalida", () => {
    const before = new Commitment(
      makeState({ recurrence: { weekdays: [0], endDate: "2025-11-02" } }),
    );
    const invalid = new Commitment(
      makeState({ recurrence: { weekdays: [0], endDate: "05/11/2025" } }),
    );

    expect(getValidationMessages(() => before.validate())).toEqual([
      "commitment.recurrence.endDate.before.start",
    ]);
    expect(getValidationMessages(() => invalid.validate())).toEqual([
      "commitment.recurrence.endDate.local.date",
    ]);
  });
});
