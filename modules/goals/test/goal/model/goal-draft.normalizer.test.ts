import { ServiceUnavailableError } from "@oitenta/shared";
import {
  GoalDraftNormalizer,
  ParsedGoal,
  SuggestedStep,
  SuggestedSteps,
} from "../../../src";

const TODAY = "2026-11-11";

function parsed(overrides: Partial<ParsedGoal> = {}): ParsedGoal {
  return {
    title: "Trabalho de Algoritmos",
    deadline: "2026-11-24",
    category: "assignment",
    requirements: [],
    missingFields: [],
    engine: "llm",
    ...overrides,
  };
}

function step(overrides: Partial<SuggestedStep> = {}): SuggestedStep {
  return { title: "Ler o enunciado", estimatedMinutes: 30, microSteps: [], ...overrides };
}

function suggested(steps: SuggestedStep[] = [step()], engine: SuggestedSteps["engine"] = "llm"): SuggestedSteps {
  return { steps, engine };
}

function normalize(p: Partial<ParsedGoal> = {}, s: SuggestedSteps = suggested()) {
  return new GoalDraftNormalizer().normalize({ parsed: parsed(p), suggested: s, today: TODAY });
}

const words = (count: number) => Array.from({ length: count }, () => "palavra").join(" ");

describe("GoalDraftNormalizer", () => {
  test("cenario 1: tira espacos repetidos e das pontas do titulo", () => {
    expect(normalize({ title: "  Trabalho   de  Algoritmos " }).draft.title).toBe(
      "Trabalho de Algoritmos",
    );
  });

  test("cenario 2: titulo longo com espacos e cortado na ultima palavra inteira ate 120", () => {
    // 17 palavras = 135 caracteres; 15 palavras = 119, a maior sequência inteira até 120.
    expect(normalize({ title: words(17) }).draft.title).toBe(words(15));
  });

  test("cenario 2: titulo de 130 caracteres sem espaco fica com os 120 primeiros", () => {
    expect(normalize({ title: "a".repeat(130) }).draft.title).toBe("a".repeat(120));
  });

  test("cenario 2: corte exatamente antes de um espaco mantem a palavra inteira", () => {
    const title = `${"a".repeat(120)} fim`;

    expect(normalize({ title }).draft.title).toBe("a".repeat(120));
  });

  test.each([[""], ["   "], [null]])("cenario 3: titulo %p vira null e entra em missingFields", (title) => {
    const { draft } = normalize({ title });

    expect(draft.title).toBeNull();
    expect(draft.missingFields).toEqual(["title"]);
  });

  test.each([
    ["2026-11-24", "2026-11-24"],
    ["2026-11-11", "2026-11-11"],
    ["2026-11-10", null],
    ["2026-02-31", null],
    ["24/11", null],
    [null, null],
  ])("cenario 4: prazo %p vira %p", (deadline, expected) => {
    expect(normalize({ deadline }).draft.deadline).toBe(expected);
  });

  test("cenario 4: prazo invalido entra em missingFields depois do titulo", () => {
    expect(normalize({ title: null, deadline: "2026-11-10" }).draft.missingFields).toEqual([
      "title",
      "deadline",
    ]);
  });

  test("cenario 4: o que o motor disse em missingFields e ignorado", () => {
    expect(normalize({ missingFields: ["deadline", "title"] }).draft.missingFields).toEqual([]);
  });

  test("cenario 5: categoria fora das 4 vira generic", () => {
    expect(normalize({ category: "homework" as ParsedGoal["category"] }).draft.category).toBe(
      "generic",
    );
  });

  test("cenario 5: categoria conhecida e mantida", () => {
    expect(normalize({ category: "exam" }).draft.category).toBe("exam");
  });

  test("cenario 6: requisitos sem vazio, sem repetido, no maximo 6, cada um ate 60", () => {
    const { draft } = normalize({
      requirements: [
        " 3 algoritmos ",
        "",
        "3 Algoritmos",
        "relatorio",
        "graficos",
        "tabela",
        "codigo",
        "apresentacao",
        "extra",
      ],
    });

    expect(draft.requirements).toEqual([
      "3 algoritmos",
      "relatorio",
      "graficos",
      "tabela",
      "codigo",
      "apresentacao",
    ]);
  });

  test("cenario 6: requisito longo e cortado ate 60", () => {
    expect(normalize({ requirements: [words(10)] }).draft.requirements).toEqual([words(7)]);
  });

  test.each([
    [20, 15],
    [23, 30],
    [250, 240],
    [5, 15],
    [0, 15],
    [-30, 15],
    [Number.NaN, 15],
    [240, 240],
  ])("cenario 7: %p minutos viram %p", (minutes, expected) => {
    const { draft } = normalize({}, suggested([step({ estimatedMinutes: minutes })]));

    expect(draft.steps[0].estimatedMinutes).toBe(expected);
  });

  test("cenario 8: 13 etapas viram as 12 primeiras", () => {
    const steps = Array.from({ length: 13 }, (_, index) => step({ title: `Etapa ${index + 1}` }));

    const { draft } = normalize({}, suggested(steps));

    expect(draft.steps).toHaveLength(12);
    expect(draft.steps[11].title).toBe("Etapa 12");
  });

  test("cenario 9: etapa de titulo vazio e descartada e titulo longo e cortado", () => {
    const { draft } = normalize(
      {},
      suggested([step({ title: "  " }), step({ title: words(17) })]),
    );

    expect(draft.steps.map((item) => item.title)).toEqual([words(15)]);
  });

  test("cenario 10: micro-passos sem vazio, no maximo 3", () => {
    const { draft } = normalize({}, suggested([step({ microSteps: ["a", " ", "b", "c", "d"] })]));

    expect(draft.steps[0].microSteps).toEqual(["a", "b", "c"]);
  });

  test("cenario 10: micro-passo longo e cortado ate 140", () => {
    const { draft } = normalize({}, suggested([step({ microSteps: [words(25)] })]));

    expect(draft.steps[0].microSteps).toEqual([words(17)]);
  });

  test("cenario 11: zero etapas lanca ServiceUnavailableError assistant.empty-steps", () => {
    expect(() => normalize({}, suggested([]))).toThrow(
      new ServiceUnavailableError("assistant.empty-steps"),
    );
  });

  test("cenario 11: etapas so com titulo vazio tambem lancam", () => {
    expect(() => normalize({}, suggested([step({ title: " " })]))).toThrow(
      ServiceUnavailableError,
    );
  });

  test("cenario 12: aiEstimatedMinutes igual ao estimado e total e a soma", () => {
    const { draft } = normalize(
      {},
      suggested([step({ estimatedMinutes: 20 }), step({ estimatedMinutes: 60 })]),
    );

    expect(draft.steps.map((item) => item.aiEstimatedMinutes)).toEqual([15, 60]);
    expect(draft.totalMinutes).toBe(75);
  });

  test("cenario 13: llm + llm da engine llm", () => {
    expect(normalize({ engine: "llm" }, suggested([step()], "llm")).engine).toBe("llm");
  });

  test("cenario 13: llm + rules da engine rules", () => {
    expect(normalize({ engine: "llm" }, suggested([step()], "rules")).engine).toBe("rules");
  });

  test("cenario 13: rules + llm da engine rules", () => {
    expect(normalize({ engine: "rules" }, suggested([step()], "llm")).engine).toBe("rules");
  });
});
