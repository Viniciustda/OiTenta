import { ValidationException } from "@oitenta/shared";
import { Goal, GoalState, Step, StepState } from "../../../src";

const USER_ID = "3b241101-e2bb-4255-8caf-4136c566a962";
const GOAL_ID = "8f14e45f-ceea-467a-9b36-3b5a2b0e0c11";

function makeStep(overrides: Partial<StepState> = {}): Step {
  return new Step({
    goalId: GOAL_ID,
    order: 1,
    title: "Etapa",
    estimatedMinutes: 60,
    aiEstimatedMinutes: null,
    progressPct: 0,
    status: "pending",
    microSteps: [],
    ...overrides,
  });
}

function makeState(overrides: Partial<GoalState> = {}): GoalState {
  return {
    id: GOAL_ID,
    userId: USER_ID,
    title: "Trabalho de Algoritmos",
    deadline: "2026-11-24",
    kind: "goal",
    colorIndex: 1,
    source: "manual",
    status: "active",
    steps: [makeStep({ order: 1 }), makeStep({ order: 2 })],
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

describe("Goal", () => {
  test("deve criar objetivo valido e expor os getters", () => {
    const state = makeState();
    const goal = new Goal(state);

    expect(goal.id).toBe(GOAL_ID);
    expect(goal.userId).toBe(USER_ID);
    expect(goal.title).toBe("Trabalho de Algoritmos");
    expect(goal.deadline).toBe("2026-11-24");
    expect(goal.kind).toBe("goal");
    expect(goal.colorIndex).toBe(1);
    expect(goal.source).toBe("manual");
    expect(goal.status).toBe("active");
    expect(goal.steps).toEqual(state.steps);
  });

  test("cenario 1: titulo, kind goal e 2 etapas validas passam no validate", () => {
    expect(() => new Goal(makeState()).validate()).not.toThrow();
  });

  test("deve aceitar prazo null (P3)", () => {
    expect(() => new Goal(makeState({ deadline: null })).validate()).not.toThrow();
  });

  test("cenario 2: titulo vazio lanca goal.title.required", () => {
    const goal = new Goal(makeState({ title: "   " }));

    expect(getValidationMessages(() => goal.validate())).toEqual(["goal.title.required"]);
  });

  test("deve rejeitar titulo acima de 120 e aceitar exatamente 120 (P2)", () => {
    expect(
      getValidationMessages(() => new Goal(makeState({ title: "a".repeat(121) })).validate()),
    ).toEqual(["goal.title.max.length"]);
    expect(() => new Goal(makeState({ title: "a".repeat(120) })).validate()).not.toThrow();
  });

  test("cenario 3: kind single com 2 etapas lanca ValidationException", () => {
    const goal = new Goal(makeState({ kind: "single" }));

    expect(getValidationMessages(() => goal.validate())).toEqual(["goal.steps.max.items"]);
  });

  test("kind single com 1 etapa passa", () => {
    const goal = new Goal(makeState({ kind: "single", steps: [makeStep()] }));

    expect(() => goal.validate()).not.toThrow();
  });

  test("cenario 4: zero etapas lanca ValidationException", () => {
    const goal = new Goal(makeState({ steps: [] }));

    expect(getValidationMessages(() => goal.validate())).toEqual(["goal.steps.required"]);
  });

  test("cenario 7: dados invalidos nao lancam na construcao", () => {
    const goal = new Goal(makeState({ title: "", steps: [], kind: "x" as never }));

    expect(goal.title).toBe("");
    expect(() => goal.validate()).toThrow(ValidationException);
  });

  test("deve rejeitar prazo fora do formato YYYY-MM-DD ou inexistente", () => {
    expect(
      getValidationMessages(() =>
        new Goal(makeState({ deadline: "2026-11-24T10:00:00Z" })).validate(),
      ),
    ).toEqual(["goal.deadline.regex"]);
    expect(
      getValidationMessages(() => new Goal(makeState({ deadline: "2026-02-30" })).validate()),
    ).toEqual(["goal.deadline.date.string"]);
  });

  test("deve rejeitar userId, kind, cor, origem e status invalidos", () => {
    const goal = new Goal(
      makeState({
        userId: "x",
        kind: "big" as never,
        colorIndex: 5 as never,
        source: "magic" as never,
        status: "lost" as never,
      }),
    );

    expect(getValidationMessages(() => goal.validate())).toEqual([
      "goal.userId.uuid",
      "goal.kind.in",
      "goal.colorIndex.in",
      "goal.source.in",
      "goal.status.in",
    ]);
  });

  test("deve acusar obrigatorios vazios", () => {
    const goal = new Goal(
      makeState({
        userId: "",
        kind: "" as never,
        colorIndex: null as never,
        source: "" as never,
        status: "" as never,
      }),
    );

    expect(getValidationMessages(() => goal.validate())).toEqual([
      "goal.userId.required",
      "goal.kind.required",
      "goal.colorIndex.required",
      "goal.source.required",
      "goal.status.required",
    ]);
  });

  test("deve exigir ordens 1..n sem repeticao", () => {
    const repeated = new Goal(
      makeState({ steps: [makeStep({ order: 1 }), makeStep({ order: 1 })] }),
    );
    const gap = new Goal(
      makeState({ steps: [makeStep({ order: 1 }), makeStep({ order: 3 })] }),
    );

    expect(getValidationMessages(() => repeated.validate())).toEqual([
      "goal.steps.order.invalid",
    ]);
    expect(getValidationMessages(() => gap.validate())).toEqual(["goal.steps.order.invalid"]);
  });

  test("deve aceitar etapas fora de ordem no array se as ordens forem 1..n", () => {
    const goal = new Goal(
      makeState({ steps: [makeStep({ order: 2 }), makeStep({ order: 1 })] }),
    );

    expect(() => goal.validate()).not.toThrow();
  });

  test("deve validar as etapas filhas", () => {
    const goal = new Goal(
      makeState({ steps: [makeStep({ order: 1, estimatedMinutes: 20 })] }),
    );

    expect(getValidationMessages(() => goal.validate())).toEqual([
      "step.estimatedMinutes.multiple.of",
    ]);
  });

  test("deve exigir que etapas pertencam ao objetivo", () => {
    const goal = new Goal(
      makeState({
        steps: [makeStep({ order: 1, goalId: "0b8f9e2a-3f4b-4c1d-9e8f-7a6b5c4d3e2f" })],
      }),
    );

    expect(getValidationMessages(() => goal.validate())).toEqual(["goal.steps.goal.mismatch"]);
  });

  test("deve exigir status done quando todas as etapas nao superseded estao em 100%", () => {
    const allDone = [
      makeStep({ order: 1, progressPct: 100, status: "done" }),
      makeStep({ order: 2, progressPct: 50, status: "superseded" }),
    ];

    expect(
      getValidationMessages(() => new Goal(makeState({ steps: allDone })).validate()),
    ).toEqual(["goal.status.inconsistent"]);
    expect(() =>
      new Goal(makeState({ steps: allDone, status: "done" })).validate(),
    ).not.toThrow();
    expect(
      getValidationMessages(() => new Goal(makeState({ status: "done" })).validate()),
    ).toEqual(["goal.status.inconsistent"]);
  });

  test("findStep deve achar a etapa pelo id ou devolver null", () => {
    const goal = new Goal(makeState());

    expect(goal.findStep(goal.steps[1].id)).toBe(goal.steps[1]);
    expect(goal.findStep("nao-existe")).toBeNull();
  });

  test("withStep deve trocar a etapa e recalcular o status do objetivo", () => {
    const single = new Goal(makeState({ kind: "single", steps: [makeStep()] }));
    const step = single.steps[0];

    const done = single.withStep(step.withProgress(100));
    const back = done.withStep(done.steps[0].withProgress(40));

    expect(done.status).toBe("done");
    expect(done.steps[0].progressPct).toBe(100);
    expect(done.id).toBe(single.id);
    expect(back.status).toBe("active");
    expect(single.status).toBe("active");
  });

  test("withStep deve preservar as demais etapas", () => {
    const goal = new Goal(makeState());
    const updated = goal.withStep(goal.steps[0].withProgress(50));

    expect(updated.steps[0].progressPct).toBe(50);
    expect(updated.steps[1]).toBe(goal.steps[1]);
    expect(updated.status).toBe("active");
  });
});
