import { ValidationException } from "@oitenta/shared";
import {
  AvailabilityWindow,
  mergeTouchingWindows,
  WeeklyAvailability,
  WeeklyAvailabilityState,
} from "../../../src";
import { USER_A } from "../../mock";

function makeState(
  overrides: Partial<WeeklyAvailabilityState> = {},
): WeeklyAvailabilityState {
  return {
    userId: USER_A,
    windows: [
      { weekday: 0, startMinute: 19 * 60, endMinute: 23 * 60 },
      { weekday: 2, startMinute: 19 * 60, endMinute: 23 * 60 },
      { weekday: 4, startMinute: 8 * 60, endMinute: 12 * 60 },
    ],
    dailyLimitMinutes: 180,
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

function withWindows(windows: AvailabilityWindow[]): WeeklyAvailability {
  return new WeeklyAvailability(makeState({ windows }));
}

describe("WeeklyAvailability", () => {
  test("deve expor os getters", () => {
    const availability = new WeeklyAvailability(makeState());

    expect(availability.userId).toBe(USER_A);
    expect(availability.windows).toHaveLength(3);
    expect(availability.dailyLimitMinutes).toBe(180);
    expect(availability.id).toEqual(expect.any(String));
    expect(availability.deletedAt).toBeNull();
  });

  test("cenario 1: 3 janelas validas e limite 180 passam no validate", () => {
    expect(() => new WeeklyAvailability(makeState()).validate()).not.toThrow();
  });

  test("deve permitir existir invalida ate chamar validate (lazy)", () => {
    const availability = withWindows([]);

    expect(availability.windows).toEqual([]);
    expect(() => availability.validate()).toThrow(ValidationException);
  });

  test("cenario 2: zero janelas gera erro", () => {
    expect(getValidationMessages(() => withWindows([]).validate())).toEqual([
      "weeklyAvailability.windows.required",
    ]);
  });

  test("cenario 3: janela com start >= end gera erro", () => {
    const equal = withWindows([{ weekday: 0, startMinute: 600, endMinute: 600 }]);
    const inverted = withWindows([{ weekday: 0, startMinute: 660, endMinute: 600 }]);

    expect(getValidationMessages(() => equal.validate())).toEqual([
      "weeklyAvailability.windows.invalid.range",
    ]);
    expect(getValidationMessages(() => inverted.validate())).toEqual([
      "weeklyAvailability.windows.invalid.range",
    ]);
  });

  test("cenario 4: minutos fora de multiplos de 15 geram erro", () => {
    const availability = withWindows([{ weekday: 0, startMinute: 610, endMinute: 700 }]);

    expect(getValidationMessages(() => availability.validate())).toEqual([
      "weeklyAvailability.windows.startMinute.multiple.of",
      "weeklyAvailability.windows.endMinute.multiple.of",
    ]);
  });

  test("deve rejeitar weekday fora de 0-6 e minutos fora do dia", () => {
    const availability = withWindows([
      { weekday: 7, startMinute: -15, endMinute: 1455 },
    ]);

    expect(getValidationMessages(() => availability.validate())).toEqual([
      "weeklyAvailability.windows.weekday.range.value",
      "weeklyAvailability.windows.startMinute.range.value",
      "weeklyAvailability.windows.endMinute.range.value",
    ]);
  });

  test("deve aceitar janela ate 24:00 (minuto 1440)", () => {
    const availability = withWindows([{ weekday: 6, startMinute: 1380, endMinute: 1440 }]);

    expect(() => availability.validate()).not.toThrow();
  });

  test("cenario 5: limite 25 e 490 (fora de 60-480) geram erro", () => {
    const low = new WeeklyAvailability(makeState({ dailyLimitMinutes: 25 }));
    const high = new WeeklyAvailability(makeState({ dailyLimitMinutes: 490 }));

    expect(getValidationMessages(() => low.validate())).toContain(
      "weeklyAvailability.dailyLimitMinutes.range.value",
    );
    expect(getValidationMessages(() => high.validate())).toContain(
      "weeklyAvailability.dailyLimitMinutes.range.value",
    );
  });

  test("cenario 5: limite 45 (nao multiplo de 30) gera erro", () => {
    const availability = new WeeklyAvailability(makeState({ dailyLimitMinutes: 45 }));

    expect(getValidationMessages(() => availability.validate())).toContain(
      "weeklyAvailability.dailyLimitMinutes.multiple.of",
    );
  });

  test("limite 75 (dentro da faixa, nao multiplo de 30) acusa so o multiplo", () => {
    const availability = new WeeklyAvailability(makeState({ dailyLimitMinutes: 75 }));

    expect(getValidationMessages(() => availability.validate())).toEqual([
      "weeklyAvailability.dailyLimitMinutes.multiple.of",
    ]);
  });

  test("cenario 5: limites 60 e 480 sao validos", () => {
    expect(() =>
      new WeeklyAvailability(makeState({ dailyLimitMinutes: 60 })).validate(),
    ).not.toThrow();
    expect(() =>
      new WeeklyAvailability(makeState({ dailyLimitMinutes: 480 })).validate(),
    ).not.toThrow();
  });

  test("cenario 6: janelas sobrepostas no mesmo dia geram erro", () => {
    const availability = withWindows([
      { weekday: 1, startMinute: 600, endMinute: 720 },
      { weekday: 1, startMinute: 690, endMinute: 780 },
    ]);

    expect(getValidationMessages(() => availability.validate())).toEqual([
      "weeklyAvailability.windows.overlap",
    ]);
  });

  test("janelas iguais em dias diferentes nao se sobrepoem", () => {
    const availability = withWindows([
      { weekday: 1, startMinute: 600, endMinute: 720 },
      { weekday: 2, startMinute: 600, endMinute: 720 },
    ]);

    expect(() => availability.validate()).not.toThrow();
  });

  test("deve rejeitar userId que nao e uuid", () => {
    const availability = new WeeklyAvailability(makeState({ userId: "abc" }));

    expect(getValidationMessages(() => availability.validate())).toEqual([
      "weeklyAvailability.userId.uuid",
    ]);
  });

  test("clone preserva id e troca as janelas", () => {
    const availability = new WeeklyAvailability(makeState());
    const cloned = availability.clone({ dailyLimitMinutes: 120 });

    expect(cloned.id).toBe(availability.id);
    expect(cloned.dailyLimitMinutes).toBe(120);
    expect(availability.dailyLimitMinutes).toBe(180);
  });
});

describe("mergeTouchingWindows", () => {
  test("une janelas encostadas do mesmo dia e ordena por dia e inicio", () => {
    const merged = mergeTouchingWindows([
      { weekday: 2, startMinute: 600, endMinute: 660 },
      { weekday: 0, startMinute: 1200, endMinute: 1260 },
      { weekday: 0, startMinute: 1140, endMinute: 1200 },
      { weekday: 0, startMinute: 1260, endMinute: 1320 },
    ]);

    expect(merged).toEqual([
      { weekday: 0, startMinute: 1140, endMinute: 1320 },
      { weekday: 2, startMinute: 600, endMinute: 660 },
    ]);
  });

  test("nao une janelas separadas nem sobrepostas", () => {
    const merged = mergeTouchingWindows([
      { weekday: 0, startMinute: 600, endMinute: 660 },
      { weekday: 0, startMinute: 690, endMinute: 720 },
      { weekday: 0, startMinute: 700, endMinute: 760 },
    ]);

    expect(merged).toEqual([
      { weekday: 0, startMinute: 600, endMinute: 660 },
      { weekday: 0, startMinute: 690, endMinute: 720 },
      { weekday: 0, startMinute: 700, endMinute: 760 },
    ]);
  });

  test("janelas com o mesmo inicio ficam ordenadas pelo fim", () => {
    const merged = mergeTouchingWindows([
      { weekday: 3, startMinute: 600, endMinute: 720 },
      { weekday: 3, startMinute: 600, endMinute: 660 },
    ]);

    expect(merged.map((window) => window.endMinute)).toEqual([660, 720]);
  });

  test("lista vazia devolve lista vazia", () => {
    expect(mergeTouchingWindows([])).toEqual([]);
  });
});
