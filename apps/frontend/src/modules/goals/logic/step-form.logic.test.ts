import { describe, expect, it } from "vitest";
import {
  addStep,
  changeMinutes,
  emptyGoalForm,
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
