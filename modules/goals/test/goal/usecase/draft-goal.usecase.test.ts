import { ServiceUnavailableError, ValidationException } from "@oitenta/shared";
import { DraftGoal, DraftGoalIn } from "../../../src";
import { FakeGoalAssistantProvider } from "../../mock";

const USER_A = "3b241101-e2bb-4255-8caf-4136c566a962";
const REFERENCE_TEXT =
  "Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11";

function makeSut(provider = new FakeGoalAssistantProvider()) {
  return { provider, useCase: new DraftGoal(provider) };
}

function makeInput(overrides: Partial<DraftGoalIn> = {}): DraftGoalIn {
  return {
    userId: USER_A,
    text: REFERENCE_TEXT,
    now: new Date("2026-11-11T15:00:00Z"),
    timezone: "America/Sao_Paulo",
    ...overrides,
  };
}

async function validationCodes(promise: Promise<unknown>): Promise<string[]> {
  const error = await promise.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ValidationException);
  return (error as ValidationException).errors.map((item) => item.message);
}

describe("DraftGoal", () => {
  test("cenario 1: texto so com espacos lanca goal-draft.text.required e nao chama o provider", async () => {
    const { provider, useCase } = makeSut();

    const codes = await validationCodes(useCase.execute(makeInput({ text: "   " })));

    expect(codes).toEqual(["goal-draft.text.required"]);
    expect(provider.parseCalls).toHaveLength(0);
  });

  test("cenario 2: texto de 2001 caracteres lanca goal-draft.text.max-length", async () => {
    const { provider, useCase } = makeSut();

    const codes = await validationCodes(useCase.execute(makeInput({ text: "a".repeat(2001) })));

    expect(codes).toEqual(["goal-draft.text.max-length"]);
    expect(provider.parseCalls).toHaveLength(0);
  });

  test("cenario 2: texto de 2000 caracteres e aceito (limite exato)", async () => {
    const { provider, useCase } = makeSut();

    await useCase.execute(makeInput({ text: "a".repeat(2000) }));

    expect(provider.parseCalls).toHaveLength(1);
  });

  test("cenario 3: o fuso de Sao Paulo define today como o dia local", async () => {
    const { provider, useCase } = makeSut();

    await useCase.execute(
      makeInput({ now: new Date("2026-11-12T02:00:00Z"), timezone: "America/Sao_Paulo" }),
    );

    expect(provider.parseCalls[0].today).toBe("2026-11-11");
    expect(provider.parseCalls[0].timezone).toBe("America/Sao_Paulo");
  });

  test("cenario 3: o mesmo instante em Toquio ja e o dia seguinte", async () => {
    const { provider, useCase } = makeSut();

    await useCase.execute(makeInput({ now: new Date("2026-11-12T02:00:00Z"), timezone: "Asia/Tokyo" }));

    expect(provider.parseCalls[0].today).toBe("2026-11-12");
  });

  test("cenario 4: o provider recebe o texto sem espacos nas pontas", async () => {
    const { provider, useCase } = makeSut();

    await useCase.execute(makeInput({ text: `  ${REFERENCE_TEXT} \n` }));

    expect(provider.parseCalls[0].text).toBe(REFERENCE_TEXT);
    expect(provider.suggestCalls[0].text).toBe(REFERENCE_TEXT);
  });

  test("cenario 5: titulo null usa o texto cortado em 120 no suggestSteps e sai como missingField", async () => {
    const provider = new FakeGoalAssistantProvider();
    provider.parsed = { ...provider.parsed, title: null };
    const { useCase } = makeSut(provider);
    const text = `${"a".repeat(130)} fim`;

    const output = await useCase.execute(makeInput({ text }));

    expect(provider.suggestCalls[0].title).toBe("a".repeat(120));
    expect(output.draft.title).toBeNull();
    expect(output.draft.missingFields).toContain("title");
  });

  test("cenario 6: o suggestSteps recebe prazo e requisitos ja normalizados", async () => {
    const provider = new FakeGoalAssistantProvider();
    provider.parsed = {
      ...provider.parsed,
      title: "  Prova   de Calculo ",
      deadline: "2026-11-01",
      category: "exam",
      requirements: [" derivadas ", "Derivadas", ""],
    };
    const { useCase } = makeSut(provider);

    await useCase.execute(makeInput());

    expect(provider.suggestCalls[0]).toEqual({
      title: "Prova de Calculo",
      deadline: null,
      category: "exam",
      requirements: ["derivadas"],
      text: REFERENCE_TEXT,
      today: "2026-11-11",
    });
  });

  test("cenario 7: erro do provider se propaga", async () => {
    const provider = new FakeGoalAssistantProvider();
    provider.error = new ServiceUnavailableError("assistant.unavailable");
    const { useCase } = makeSut(provider);

    await expect(useCase.execute(makeInput())).rejects.toThrow(
      new ServiceUnavailableError("assistant.unavailable"),
    );
  });

  test("cenario 7: erro do provider no suggestSteps tambem se propaga", async () => {
    const provider = new FakeGoalAssistantProvider();
    provider.suggestError = new ServiceUnavailableError("assistant.invalid-output");
    const { useCase } = makeSut(provider);

    await expect(useCase.execute(makeInput())).rejects.toThrow(
      new ServiceUnavailableError("assistant.invalid-output"),
    );
  });

  test("cenario 8: caminho feliz devolve o rascunho normalizado e o engine", async () => {
    const provider = new FakeGoalAssistantProvider();
    provider.suggested = {
      steps: [
        { title: "Ler o enunciado", estimatedMinutes: 20, microSteps: ["Abra o enunciado"] },
        { title: "Implementar", estimatedMinutes: 120, microSteps: [] },
      ],
      engine: "llm",
    };
    const { useCase } = makeSut(provider);

    const output = await useCase.execute(makeInput());

    expect(output).toEqual({
      draft: {
        title: "Trabalho de Algoritmos",
        deadline: "2026-11-24",
        category: "assignment",
        requirements: ["3 algoritmos de ordenação"],
        missingFields: [],
        steps: [
          {
            title: "Ler o enunciado",
            estimatedMinutes: 15,
            aiEstimatedMinutes: 15,
            microSteps: ["Abra o enunciado"],
          },
          { title: "Implementar", estimatedMinutes: 120, aiEstimatedMinutes: 120, microSteps: [] },
        ],
        totalMinutes: 135,
      },
      engine: "llm",
    });
  });
});
