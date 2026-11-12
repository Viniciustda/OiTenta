import { describe, expect, it } from "vitest";
import type { GoalDraft } from "../data/goals.types";
import {
  addStep,
  changeMinutes,
  emptyGoalForm,
  formFromDraft,
  removeStep,
  renameStep,
  toCreateGoalInput,
  totalMinutes,
  validateGoalForm,
} from "./step-form.logic";

describe("formulário do novo objetivo — W30 começando vazia (P20)", () => {
  it("começa sem título, sem prazo e sem etapas", () => {
    const f = emptyGoalForm();
    expect(f).toMatchObject({ title: "", deadline: "", steps: [] });
    expect(totalMinutes(f.steps)).toBe(0);
  });

  it("Adicionar etapa cria \"Nova etapa\" de 30 min (protótipo)", () => {
    const f = addStep(emptyGoalForm());
    expect(f.steps).toHaveLength(1);
    expect(f.steps[0]).toMatchObject({ title: "Nova etapa", minutes: 30 });
  });

  it("soma o total das etapas", () => {
    let f = addStep(addStep(emptyGoalForm()));
    f = changeMinutes(f, f.steps[1].key, +15);
    expect(totalMinutes(f.steps)).toBe(75);
  });

  it("− e + mudam 15 min, entre 15 min e 4h", () => {
    let f = addStep(emptyGoalForm());
    const k = f.steps[0].key;
    f = changeMinutes(changeMinutes(f, k, -15), k, -15);
    expect(f.steps[0].minutes).toBe(15);
    for (let i = 0; i < 20; i++) f = changeMinutes(f, k, +15);
    expect(f.steps[0].minutes).toBe(240);
  });

  it("renomear e remover etapa", () => {
    let f = addStep(addStep(emptyGoalForm()));
    f = renameStep(f, f.steps[0].key, "Ler o enunciado");
    f = removeStep(f, f.steps[1].key);
    expect(f.steps.map((s) => s.title)).toEqual(["Ler o enunciado"]);
  });

  it("valida: título obrigatório, pelo menos 1 etapa e título de cada etapa", () => {
    expect(validateGoalForm(emptyGoalForm())).toEqual(["title.required", "steps.required"]);
    let f = { ...addStep(emptyGoalForm()), title: "Trabalho" };
    expect(validateGoalForm(f)).toEqual([]);
    f = renameStep(f, f.steps[0].key, "   ");
    expect(validateGoalForm(f)).toEqual(["step.title.required"]);
  });

  it("valida o limite de 120 caracteres (P2)", () => {
    const f = { ...addStep(emptyGoalForm()), title: "x".repeat(121) };
    expect(validateGoalForm(f)).toEqual(["title.max"]);
  });

  it("monta o corpo do POST /goals (kind goal, prazo opcional, micro-passos vazios)", () => {
    let f = { ...addStep(emptyGoalForm()), title: "  Trabalho de Algoritmos ", deadline: "2026-11-24" };
    f = renameStep(f, f.steps[0].key, " Ler o enunciado ");
    expect(toCreateGoalInput(f)).toEqual({
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      kind: "goal",
      steps: [{ title: "Ler o enunciado", estimatedMinutes: 30, microSteps: [] }],
    });
    expect(toCreateGoalInput({ ...f, deadline: "" }).deadline).toBeNull();
  });
});

const draft: GoalDraft = {
  title: "Trabalho de Algoritmos",
  deadline: "2026-11-24",
  category: "assignment",
  requirements: ["3 algoritmos de ordenação", "comparação de tempo"],
  missingFields: [],
  steps: [
    { title: "Ler o enunciado", estimatedMinutes: 30, aiEstimatedMinutes: 30, microSteps: ["Abra o enunciado"] },
    { title: "Implementar o Merge Sort", estimatedMinutes: 90, aiEstimatedMinutes: 90, microSteps: [] },
  ],
  totalMinutes: 120,
};

describe("W30 preenchida pelo rascunho da IA (IA1, docs/7 §d.2)", () => {
  it("o objetivo manual começa com origem manual e sem requisitos", () => {
    expect(emptyGoalForm()).toMatchObject({ source: "manual", requirements: [] });
  });

  it("preenche título, prazo, requisitos e etapas com o tempo e a estimativa original da IA", () => {
    const f = formFromDraft(draft);
    expect(f).toMatchObject({ title: "Trabalho de Algoritmos", deadline: "2026-11-24", source: "ai", requirements: ["3 algoritmos de ordenação", "comparação de tempo"] });
    expect(f.steps.map((s) => [s.title, s.minutes, s.aiMinutes, s.microSteps])).toEqual([
      ["Ler o enunciado", 30, 30, ["Abra o enunciado"]],
      ["Implementar o Merge Sort", 90, 90, []],
    ]);
    expect(new Set(f.steps.map((s) => s.key)).size).toBe(2);
    expect(totalMinutes(f.steps)).toBe(120);
  });

  it("rascunho sem prazo (deadline null) deixa o prazo vazio; sem título, o título vazio (IA2)", () => {
    const f = formFromDraft({ ...draft, title: null, deadline: null, missingFields: ["title", "deadline"] });
    expect(f.title).toBe("");
    expect(f.deadline).toBe("");
    expect(toCreateGoalInput({ ...f, title: "Trabalho" }).deadline).toBeNull();
  });

  it("monta o POST /goals com source ai, a estimativa original da IA (mesmo editada) e os micro-passos", () => {
    let f = formFromDraft(draft);
    f = changeMinutes(f, f.steps[0].key, +15);
    expect(toCreateGoalInput(f)).toEqual({
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      kind: "goal",
      source: "ai",
      steps: [
        { title: "Ler o enunciado", estimatedMinutes: 45, aiEstimatedMinutes: 30, microSteps: ["Abra o enunciado"] },
        { title: "Implementar o Merge Sort", estimatedMinutes: 90, aiEstimatedMinutes: 90, microSteps: [] },
      ],
    });
  });

  it("etapa acrescentada pelo usuário vai com aiEstimatedMinutes null e sem micro-passos", () => {
    const f = addStep(formFromDraft(draft));
    expect(toCreateGoalInput(f).steps[2]).toEqual({ title: "Nova etapa", estimatedMinutes: 30, aiEstimatedMinutes: null, microSteps: [] });
  });

  it("o objetivo manual não manda source nem aiEstimatedMinutes (continua como hoje)", () => {
    const body = toCreateGoalInput({ ...addStep(emptyGoalForm()), title: "Trabalho" });
    expect(body).not.toHaveProperty("source");
    expect(body.steps[0]).not.toHaveProperty("aiEstimatedMinutes");
  });
});
