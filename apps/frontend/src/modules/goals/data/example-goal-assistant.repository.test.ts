import { describe, expect, it } from "vitest";
import { ExampleGoalAssistantRepository } from "./example-goal-assistant.repository";

const repo = () => new ExampleGoalAssistantRepository(0);

describe("ExampleGoalAssistantRepository — POST /goals/assistant/draft", () => {
  it("devolve o rascunho fixo do protótipo (W30): título, prazo 24/11, requisitos e as 7 etapas", async () => {
    const { draft, engine } = await repo().draft("Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11");
    expect(draft).toMatchObject({
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      category: "assignment",
      requirements: ["3 algoritmos de ordenação", "comparação de tempo", "código + relatório"],
      missingFields: [],
    });
    expect(draft.steps.map((s) => [s.title, s.estimatedMinutes])).toEqual([
      ["Ler o enunciado e escolher os 3 algoritmos", 30],
      ["Implementar o Bubble Sort", 45],
      ["Implementar o Merge Sort", 90],
      ["Implementar o Quick Sort", 90],
      ["Gerar as entradas de teste", 45],
      ["Medir os tempos e montar os gráficos", 90],
      ["Escrever o relatório comparativo", 105],
    ]);
    expect(draft.totalMinutes).toBe(495);
    expect(engine).toBe("rules");
  });

  it("cada etapa traz a estimativa da IA igual à estimativa e a lista de micro-passos", async () => {
    const { draft } = await repo().draft("qualquer texto");
    draft.steps.forEach((s) => {
      expect(s.aiEstimatedMinutes).toBe(s.estimatedMinutes);
      expect(Array.isArray(s.microSteps)).toBe(true);
    });
  });

  it("devolve uma cópia: alterar o rascunho não muda o próximo", async () => {
    const r = repo();
    const first = await r.draft("a");
    first.draft.steps[0].title = "mudei";
    expect((await r.draft("a")).draft.steps[0].title).toBe("Ler o enunciado e escolher os 3 algoritmos");
  });

  it("texto vazio depois de remover espaços responde 422 (goal-draft.text.required)", async () => {
    await expect(repo().draft("   ")).rejects.toMatchObject({ statusCode: 422, details: ["goal-draft.text.required"] });
  });

  it("texto com mais de 2000 caracteres responde 422 (goal-draft.text.max-length)", async () => {
    await expect(repo().draft("x".repeat(2001))).rejects.toMatchObject({ statusCode: 422, details: ["goal-draft.text.max-length"] });
  });

  it("espera o tempo do \"IA analisando…\" do protótipo antes de responder", async () => {
    const start = Date.now();
    await new ExampleGoalAssistantRepository(50).draft("a");
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });
});
