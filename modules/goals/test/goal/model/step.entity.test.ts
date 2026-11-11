import { ValidationException } from "@oitenta/shared";
import { Step, StepState } from "../../../src";

const GOAL_ID = "8f14e45f-ceea-467a-9b36-3b5a2b0e0c11";

function makeState(overrides: Partial<StepState> = {}): StepState {
  return {
    goalId: GOAL_ID,
    order: 1,
    title: "Ler o enunciado e listar requisitos",
    estimatedMinutes: 30,
    aiEstimatedMinutes: null,
    progressPct: 0,
    status: "pending",
    microSteps: [],
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

describe("Step", () => {
  test("deve criar etapa valida e expor os getters", () => {
    const step = new Step(makeState({ microSteps: ["Abrir o PDF"] }));

    expect(step.goalId).toBe(GOAL_ID);
    expect(step.order).toBe(1);
    expect(step.title).toBe("Ler o enunciado e listar requisitos");
    expect(step.estimatedMinutes).toBe(30);
    expect(step.aiEstimatedMinutes).toBeNull();
    expect(step.progressPct).toBe(0);
    expect(step.status).toBe("pending");
    expect(step.microSteps).toEqual(["Abrir o PDF"]);
    expect(step.id).toEqual(expect.any(String));
    expect(step.deletedAt).toBeNull();
  });

  test("deve passar no validate com dados validos (microSteps vazio e opcional, P6)", () => {
    expect(() => new Step(makeState()).validate()).not.toThrow();
  });

  test("cenario 7: deve existir invalida ate chamar validate", () => {
    const step = new Step(makeState({ title: "", estimatedMinutes: 20, progressPct: 101 }));

    expect(step.title).toBe("");
    expect(() => step.validate()).toThrow(ValidationException);
  });

  test("cenario 5: deve rejeitar estimativa que nao e multiplo de 15 (P5)", () => {
    const step = new Step(makeState({ estimatedMinutes: 20 }));

    expect(getValidationMessages(() => step.validate())).toEqual([
      "step.estimatedMinutes.multiple.of",
    ]);
  });

  test("deve rejeitar estimativa abaixo de 15 e aceitar exatamente 15", () => {
    expect(
      getValidationMessages(() => new Step(makeState({ estimatedMinutes: 0 })).validate()),
    ).toContain("step.estimatedMinutes.min.value");
    expect(() => new Step(makeState({ estimatedMinutes: 15 })).validate()).not.toThrow();
  });

  test("deve rejeitar estimativa nao inteira", () => {
    expect(
      getValidationMessages(() => new Step(makeState({ estimatedMinutes: 15.5 })).validate()),
    ).toContain("step.estimatedMinutes.integer");
  });

  test("cenario 6: deve rejeitar progressPct 101", () => {
    const step = new Step(makeState({ progressPct: 101 }));

    expect(getValidationMessages(() => step.validate())).toEqual([
      "step.progressPct.range.value",
    ]);
  });

  test("cenario 6: deve rejeitar progressPct -1", () => {
    const step = new Step(makeState({ progressPct: -1 }));

    expect(getValidationMessages(() => step.validate())).toEqual([
      "step.progressPct.range.value",
    ]);
  });

  test("deve rejeitar progressPct nao inteiro", () => {
    expect(
      getValidationMessages(() => new Step(makeState({ progressPct: 12.5 })).validate()),
    ).toEqual(["step.progressPct.integer"]);
  });

  test("deve acusar campos obrigatorios vazios", () => {
    const step = new Step(
      makeState({ goalId: "", title: "  ", status: "" as never }),
    );

    expect(getValidationMessages(() => step.validate())).toEqual([
      "step.goalId.required",
      "step.title.required",
      "step.status.required",
    ]);
  });

  test("deve rejeitar titulo acima de 120 e aceitar exatamente 120 (P2)", () => {
    expect(
      getValidationMessages(() => new Step(makeState({ title: "a".repeat(121) })).validate()),
    ).toEqual(["step.title.max.length"]);
    expect(() => new Step(makeState({ title: "a".repeat(120) })).validate()).not.toThrow();
  });

  test("deve rejeitar goalId que nao e UUID, ordem invalida e status desconhecido", () => {
    const step = new Step(
      makeState({ goalId: "x", order: 0, status: "lost" as never }),
    );

    expect(getValidationMessages(() => step.validate())).toEqual([
      "step.goalId.uuid",
      "step.order.min.value",
      "step.status.in",
    ]);
  });

  test("deve rejeitar aiEstimatedMinutes fora da regra quando informado", () => {
    expect(
      getValidationMessages(() => new Step(makeState({ aiEstimatedMinutes: 20 })).validate()),
    ).toEqual(["step.aiEstimatedMinutes.multiple.of"]);
    expect(() => new Step(makeState({ aiEstimatedMinutes: 45 })).validate()).not.toThrow();
  });

  test("deve rejeitar microSteps com texto vazio ou que nao seja lista", () => {
    expect(
      getValidationMessages(() => new Step(makeState({ microSteps: ["ok", " "] })).validate()),
    ).toEqual(["step.microSteps.invalid"]);
    expect(
      getValidationMessages(() =>
        new Step(makeState({ microSteps: "abrir" as never })).validate(),
      ),
    ).toEqual(["step.microSteps.invalid"]);
  });

  test("deve exigir done <=> progressPct 100", () => {
    expect(
      getValidationMessages(() =>
        new Step(makeState({ status: "done", progressPct: 50 })).validate(),
      ),
    ).toEqual(["step.status.inconsistent"]);
    expect(
      getValidationMessages(() =>
        new Step(makeState({ status: "pending", progressPct: 100 })).validate(),
      ),
    ).toEqual(["step.status.inconsistent"]);
    expect(() => new Step(makeState({ status: "done", progressPct: 100 })).validate()).not.toThrow();
    expect(() =>
      new Step(makeState({ status: "superseded", progressPct: 50 })).validate(),
    ).not.toThrow();
  });

  test("withProgress deve atualizar o % e marcar done em 100", () => {
    const step = new Step(makeState());

    const half = step.withProgress(50);
    const full = step.withProgress(100);

    expect(half.progressPct).toBe(50);
    expect(half.status).toBe("pending");
    expect(full.progressPct).toBe(100);
    expect(full.status).toBe("done");
    expect(full.id).toBe(step.id);
    expect(step.progressPct).toBe(0);
  });

  test("withProgress abaixo de 100 deve voltar uma etapa done para pending", () => {
    const step = new Step(makeState({ status: "done", progressPct: 100 }));

    expect(step.withProgress(80).status).toBe("pending");
  });

  test("withProgress em etapa superseded deve lancar ValidationException (D 4h)", () => {
    const step = new Step(makeState({ status: "superseded", progressPct: 50 }));

    expect(getValidationMessages(() => step.withProgress(60))).toEqual([
      "step.status.superseded",
    ]);
  });
});
